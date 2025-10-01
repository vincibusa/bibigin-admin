import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { withAdminAuth } from '@/lib/auth-middleware'

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
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
        query = query.where('role', '==', Number(role)) as any
      }

      if (isActive !== null) {
        query = query.where('isActive', '==', isActive === 'true') as any
      }

      const snapshot = await query.get()
      let users = snapshot.docs.map(doc => ({
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
