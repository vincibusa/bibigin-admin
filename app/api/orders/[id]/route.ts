import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { withAuth, withAdminAuth } from '@/lib/auth-middleware'
import { OrderFormData } from '@/lib/validation-orders'

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params
      const db = getAdminDb()

      const docRef = db.collection('orders').doc(id)
      const docSnap = await docRef.get()

      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      const orderData = docSnap.data()
      const order = {
        id: docSnap.id,
        ...orderData,
        createdAt: orderData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: orderData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        // Ensure both shipping and shippingAddress are available for compatibility
        shipping: orderData?.shipping || {
          street: orderData?.shippingAddress?.street,
          city: orderData?.shippingAddress?.city,
          postalCode: orderData?.shippingAddress?.postalCode,
          country: orderData?.shippingAddress?.country
        }
      }

      return NextResponse.json({ order })
    } catch (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      )
    }
  })
}

// PATCH /api/orders/[id] - Update order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params
      const db = getAdminDb()
      const body = await req.json()

      const orderData: Partial<OrderFormData> = body

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(orderData).filter(([, value]) => value !== undefined)
      )

      const docRef = db.collection('orders').doc(id)

      // Check if order exists
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      await docRef.update({
        ...cleanData,
        updatedAt: new Date()
      })

      return NextResponse.json({ message: 'Order updated successfully' })
    } catch (error) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/orders/[id] - Delete order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (req, user) => {
    try {
      const { id } = await params
      const db = getAdminDb()

      const docRef = db.collection('orders').doc(id)

      // Check if order exists
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      await docRef.delete()

      return NextResponse.json({ message: 'Order deleted successfully' })
    } catch (error) {
      console.error('Error deleting order:', error)
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      )
    }
  })
}
