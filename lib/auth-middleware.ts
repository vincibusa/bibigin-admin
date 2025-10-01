import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from './firebase-admin'
import { DecodedIdToken } from 'firebase-admin/auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedIdToken
}

/**
 * Verify Firebase ID token from Authorization header
 */
export async function verifyAuthToken(request: NextRequest): Promise<DecodedIdToken> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }

  const token = authHeader.split('Bearer ')[1]

  if (!token) {
    throw new Error('Missing token')
  }

  try {
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying token:', error)
    throw new Error('Invalid or expired token')
  }
}

/**
 * Check if user is admin (role === 0 or 1)
 */
export async function isAdmin(decodedToken: DecodedIdToken): Promise<boolean> {
  // Check custom claims first
  if (decodedToken.role !== undefined) {
    return decodedToken.role === 0 || decodedToken.role === 1
  }

  // If no custom claims, check Firestore
  const { getAdminDb } = await import('./firebase-admin')
  const db = getAdminDb()

  try {
    const userDoc = await db.collection('users').doc(decodedToken.uid).get()
    if (userDoc.exists) {
      const userData = userDoc.data()
      return userData?.role === 0 || userData?.role === 1
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
  }

  return false
}

/**
 * Middleware wrapper for authenticated routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: DecodedIdToken) => Promise<Response>
): Promise<Response> {
  try {
    const user = await verifyAuthToken(request)
    return await handler(request, user)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

/**
 * Middleware wrapper for admin-only routes
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: DecodedIdToken) => Promise<Response>
): Promise<Response> {
  try {
    const user = await verifyAuthToken(request)

    const userIsAdmin = await isAdmin(user)
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    return await handler(request, user)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

/**
 * Utility function to get user from request
 * Use this in API routes after withAuth middleware
 */
export async function getUserFromRequest(request: NextRequest): Promise<DecodedIdToken> {
  return await verifyAuthToken(request)
}
