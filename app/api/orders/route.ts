import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { withAuth, withAdminAuth } from '@/lib/auth-middleware'
import { OrderFormData, OrderFilter } from '@/lib/validation-orders'

// GET /api/orders - Get all orders with optional filters
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const db = getAdminDb()
      const searchParams = req.nextUrl.searchParams

      // Parse filters from query params
      const filters: OrderFilter = {
        status: searchParams.get('status') as any || undefined,
        paymentStatus: searchParams.get('paymentStatus') as any || undefined,
        customerId: searchParams.get('customerId') || undefined,
        search: searchParams.get('search') || undefined,
        minTotal: searchParams.get('minTotal') ? Number(searchParams.get('minTotal')) : undefined,
        maxTotal: searchParams.get('maxTotal') ? Number(searchParams.get('maxTotal')) : undefined,
        dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
        dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
      }

      let query = db.collection('orders').orderBy('createdAt', 'desc')

      // Apply Firestore filters
      if (filters.status && filters.status !== 'all') {
        query = query.where('status', '==', filters.status) as any
      }

      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        query = query.where('paymentStatus', '==', filters.paymentStatus) as any
      }

      if (filters.customerId) {
        query = query.where('customerId', '==', filters.customerId) as any
      }

      if (filters.dateFrom) {
        query = query.where('createdAt', '>=', filters.dateFrom) as any
      }

      if (filters.dateTo) {
        query = query.where('createdAt', '<=', filters.dateTo) as any
      }

      const snapshot = await query.get()
      let orders = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          // Ensure both shipping and shippingAddress are available for compatibility
          shipping: data.shipping || {
            street: data.shippingAddress?.street,
            city: data.shippingAddress?.city,
            postalCode: data.shippingAddress?.postalCode,
            country: data.shippingAddress?.country
          }
        }
      })

      // Apply client-side filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        orders = orders.filter(order =>
          order.customerEmail?.toLowerCase().includes(searchTerm) ||
          order.id.toLowerCase().includes(searchTerm) ||
          order.items?.some((item: any) => item.productName?.toLowerCase().includes(searchTerm))
        )
      }

      if (filters.minTotal !== undefined) {
        orders = orders.filter(order => order.total >= filters.minTotal!)
      }

      if (filters.maxTotal !== undefined) {
        orders = orders.filter(order => order.total <= filters.maxTotal!)
      }

      return NextResponse.json({ orders })
    } catch (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }
  })
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const db = getAdminDb()
      const body = await req.json()
      const orderData: OrderFormData = body

      // Filter out undefined values and normalize shipping cost field
      const cleanData = Object.fromEntries(
        Object.entries(orderData).filter(([, value]) => value !== undefined)
      )

      // Normalize shipping cost field (support both shippingCost and shipping_cost)
      const shippingCost = orderData.shippingCost || orderData.shipping_cost || 0
      cleanData.shippingCost = shippingCost
      cleanData.shipping_cost = shippingCost // For backwards compatibility

      // Use transaction to ensure atomicity
      const orderId = await db.runTransaction(async (transaction) => {
        // FIRST: Do all reads
        const productSnaps = new Map()

        // Read all products
        for (const item of orderData.items) {
          const productRef = db.collection('products').doc(item.productId)
          const productSnap = await transaction.get(productRef)
          productSnaps.set(item.productId, productSnap)

          if (!productSnap.exists) {
            throw new Error(`Prodotto non trovato: ${item.productName}`)
          }

          const productData = productSnap.data()
          const currentStock = productData?.stock || 0

          if (currentStock < item.quantity) {
            throw new Error(`Stock insufficiente per ${item.productName}. Disponibili: ${currentStock}`)
          }
        }

        // Read user data
        const userRef = db.collection('users').doc(orderData.customerId)
        const userSnap = await transaction.get(userRef)
        let currentOrders: string[] = []
        let currentTotalSpent = 0

        if (userSnap.exists) {
          const userData = userSnap.data()
          currentOrders = userData?.orders || []
          currentTotalSpent = userData?.totalSpent || 0
        }

        // SECOND: Do all writes
        // Create order
        const orderRef = db.collection('orders').doc()
        transaction.set(orderRef, {
          ...cleanData,
          createdAt: new Date(),
          updatedAt: new Date()
        })

        // Update stock for each product
        for (const item of orderData.items) {
          const productRef = db.collection('products').doc(item.productId)
          const productSnap = productSnaps.get(item.productId)
          const productData = productSnap.data()
          const newStock = (productData?.stock || 0) - item.quantity

          transaction.update(productRef, {
            stock: newStock,
            updatedAt: new Date()
          })
        }

        // Update user order history
        if (userSnap.exists) {
          transaction.update(userRef, {
            orders: [...currentOrders, orderRef.id],
            totalSpent: currentTotalSpent + orderData.total,
            updatedAt: new Date()
          })
        }

        return orderRef.id
      })

      return NextResponse.json(
        { id: orderId, message: 'Order created successfully' },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating order:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create order' },
        { status: 500 }
      )
    }
  })
}
