import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { withAdminAuth } from '@/lib/auth-middleware'

// Interface for users from Firestore with optional fields
interface FirestoreUser {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown // For other dynamic fields
}

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req) => {
    try {
      const db = getAdminDb()
      const searchParams = req.nextUrl.searchParams

      // Parse query params
      const role = searchParams.get('role')
      const isActive = searchParams.get('isActive')
      const search = searchParams.get('search')

      let query = db.collection('users').orderBy('createdAt', 'desc')

      // Apply Firestore filters
      if (role !== null) {
        query = query.where('role', '==', Number(role))
      }

      if (isActive !== null) {
        query = query.where('isActive', '==', isActive === 'true')
      }

      const snapshot = await query.get()
      let users: FirestoreUser[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }))

      // Apply client-side search filter
      if (search) {
        const searchTerm = search.toLowerCase()
        users = users.filter(u =>
          u.email?.toLowerCase().includes(searchTerm) ||
          u.firstName?.toLowerCase().includes(searchTerm) ||
          u.lastName?.toLowerCase().includes(searchTerm)
        )
      }

      return NextResponse.json({ users })
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  })
}
