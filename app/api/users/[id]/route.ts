import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { withAuth, withAdminAuth } from '@/lib/auth-middleware'

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params
      const db = getAdminDb()

      // Users can only access their own profile unless they're admin
      if (user.uid !== id) {
        const { isAdmin } = await import('@/lib/auth-middleware')
        const userIsAdmin = await isAdmin(user)
        if (!userIsAdmin) {
          return NextResponse.json(
            { error: 'Forbidden: You can only access your own profile' },
            { status: 403 }
          )
        }
      }

      const docRef = db.collection('users').doc(id)
      const docSnap = await docRef.get()

      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const userData = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }

      return NextResponse.json({ user: userData })
    } catch (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      )
    }
  })
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params
      const db = getAdminDb()
      const body = await req.json()

      // Users can only update their own profile unless they're admin
      if (user.uid !== id) {
        const { isAdmin } = await import('@/lib/auth-middleware')
        const userIsAdmin = await isAdmin(user)
        if (!userIsAdmin) {
          return NextResponse.json(
            { error: 'Forbidden: You can only update your own profile' },
            { status: 403 }
          )
        }
      }

      // Filter out sensitive fields that shouldn't be updated via API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, isActive, totalSpent, orders, ...updateData } = body

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      )

      const docRef = db.collection('users').doc(id)

      // Check if user exists
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      await docRef.update({
        ...cleanData,
        updatedAt: new Date()
      })

      return NextResponse.json({ message: 'User profile updated successfully' })
    } catch (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      const db = getAdminDb()
      const { getAdminAuth } = await import('@/lib/firebase-admin')
      const adminAuth = getAdminAuth()

      // Check if user exists in Firestore
      const docRef = db.collection('users').doc(id)
      const docSnap = await docRef.get()

      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Delete from Firebase Auth
      try {
        await adminAuth.deleteUser(id)
      } catch (authError: unknown) {
        console.warn('User not found in Auth, continuing with Firestore deletion', authError)
      }

      // Delete from Firestore
      await docRef.delete()

      return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }
  })
}
