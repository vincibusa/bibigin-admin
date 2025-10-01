import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { withAuth, withAdminAuth } from '@/lib/auth-middleware'
import { ProductFormData } from '@/lib/validation-products'

// GET /api/products/[id] - Get single product
// Public endpoint - no auth required for viewing products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getAdminDb()

    const docRef = db.collection('products').doc(id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: docSnap.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Update product (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (req, user) => {
    try {
      const { id } = await params
      const db = getAdminDb()
      const body = await req.json()

      const productData: Partial<ProductFormData> = body

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(productData).filter(([, value]) => value !== undefined)
      )

      const docRef = db.collection('products').doc(id)

      // Check if product exists
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      await docRef.update({
        ...cleanData,
        updatedAt: new Date()
      })

      return NextResponse.json({ message: 'Product updated successfully' })
    } catch (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (req, user) => {
    try {
      const { id } = await params
      const db = getAdminDb()

      const docRef = db.collection('products').doc(id)

      // Check if product exists
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      await docRef.delete()

      return NextResponse.json({ message: 'Product deleted successfully' })
    } catch (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }
  })
}
