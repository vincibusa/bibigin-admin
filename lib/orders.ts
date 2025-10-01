import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  runTransaction
} from 'firebase/firestore'
import { db } from './firebase'
import { Order } from './types'
import { OrderFormData, OrderFilter, QuickOrderData } from './validation-orders'

const ORDERS_COLLECTION = 'orders'
const USERS_COLLECTION = 'users'
const PRODUCTS_COLLECTION = 'products'

// Helper function to convert Firestore data to Order
function convertFirestoreOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
  } as Order
}

// CREATE - Add new order
export async function createOrder(orderData: OrderFormData): Promise<string> {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(orderData).filter(([, value]) => value !== undefined)
    )
    
    // Use transaction to ensure atomicity
    const orderId = await runTransaction(db, async (transaction) => {
      // FIRST: Do all reads
      const productSnaps = new Map()
      
      // Read all products
      for (const item of orderData.items) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId)
        const productSnap = await transaction.get(productRef)
        productSnaps.set(item.productId, productSnap)
        
        if (!productSnap.exists()) {
          throw new Error(`Prodotto non trovato: ${item.productName}`)
        }
        
        const productData = productSnap.data()
        const currentStock = productData.stock || 0
        
        if (currentStock < item.quantity) {
          throw new Error(`Stock insufficiente per ${item.productName}. Disponibili: ${currentStock}`)
        }
      }
      
      // Read user data
      const userRef = doc(db, USERS_COLLECTION, orderData.customerId)
      const userSnap = await transaction.get(userRef)
      let userData = null
      let currentOrders: string[] = []
      let currentTotalSpent = 0
      
      if (userSnap.exists()) {
        userData = userSnap.data()
        currentOrders = userData.orders || []
        currentTotalSpent = userData.totalSpent || 0
      }
      
      // SECOND: Do all writes
      // Create order
      const orderRef = doc(collection(db, ORDERS_COLLECTION))
      transaction.set(orderRef, {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Update stock for each product
      for (const item of orderData.items) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId)
        const productSnap = productSnaps.get(item.productId)
        const productData = productSnap.data()
        const newStock = (productData?.stock || 0) - item.quantity
        
        transaction.update(productRef, {
          stock: newStock,
          updatedAt: serverTimestamp()
        })
      }
      
      // Update user order history
      if (userSnap.exists()) {
        transaction.update(userRef, {
          orders: [...currentOrders, orderRef.id],
          totalSpent: currentTotalSpent + orderData.total,
          updatedAt: serverTimestamp()
        })
      }
      
      return orderRef.id
    })
    
    return orderId
  } catch (error) {
    console.error('Error creating order:', error)
    throw new Error('Failed to create order')
  }
}

// CREATE - Quick order creation for admin
export async function createQuickOrder(quickOrderData: QuickOrderData): Promise<string> {
  try {
    // First, create or get user
    const customerId = await getOrCreateUser(quickOrderData.customerEmail, quickOrderData.customerName)
    
    // Fetch product details for each product
    const items = await Promise.all(
      quickOrderData.products.map(async (product) => {
        const productRef = doc(db, PRODUCTS_COLLECTION, product.productId)
        const productSnap = await getDoc(productRef)
        
        if (!productSnap.exists()) {
          throw new Error(`Prodotto non trovato: ${product.productId}`)
        }
        
        const productData = productSnap.data()
        const price = productData.price || 0
        const total = price * product.quantity
        
        return {
          productId: product.productId,
          productName: productData.name || `Product ${product.productId}`,
          quantity: product.quantity,
          price,
          total
        }
      })
    )
    
    const orderTotal = items.reduce((sum, item) => sum + item.total, 0)
    
    const orderData: OrderFormData = {
      customerId,
      customerEmail: quickOrderData.customerEmail,
      items,
      total: orderTotal,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: quickOrderData.shippingAddress,
      billingAddress: quickOrderData.shippingAddress // Use same address for both
    }
    
    return await createOrder(orderData)
  } catch (error) {
    console.error('Error creating quick order:', error)
    throw new Error('Failed to create quick order')
  }
}

// READ - Get all orders
export async function getOrders(filters?: OrderFilter): Promise<Order[]> {
  try {
    let q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'))
    
    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status))
    }
    
    if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
      q = query(q, where('paymentStatus', '==', filters.paymentStatus))
    }
    
    if (filters?.customerId) {
      q = query(q, where('customerId', '==', filters.customerId))
    }
    
    // Add date filters if provided
    if (filters?.dateFrom) {
      q = query(q, where('createdAt', '>=', filters.dateFrom))
    }
    
    if (filters?.dateTo) {
      q = query(q, where('createdAt', '<=', filters.dateTo))
    }

    const querySnapshot = await getDocs(q)
    const orders: Order[] = []
    
    querySnapshot.forEach((doc) => {
      orders.push(convertFirestoreOrder(doc.id, doc.data()))
    })
    
    // Apply client-side filters
    let filteredOrders = orders
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredOrders = filteredOrders.filter(order => 
        order.customerEmail.toLowerCase().includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchTerm))
      )
    }
    
    if (filters?.minTotal !== undefined) {
      filteredOrders = filteredOrders.filter(order => order.total >= filters.minTotal!)
    }
    
    if (filters?.maxTotal !== undefined) {
      filteredOrders = filteredOrders.filter(order => order.total <= filters.maxTotal!)
    }
    
    return filteredOrders
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw new Error('Failed to fetch orders')
  }
}

// READ - Get single order by ID
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertFirestoreOrder(docSnap.id, docSnap.data())
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    throw new Error('Failed to fetch order')
  }
}

// UPDATE - Update existing order
export async function updateOrder(id: string, orderData: Partial<OrderFormData>): Promise<void> {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(orderData).filter(([, value]) => value !== undefined)
    )
    
    const docRef = doc(db, ORDERS_COLLECTION, id)
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating order:', error)
    throw new Error('Failed to update order')
  }
}

// UPDATE - Update order status
export async function updateOrderStatus(
  id: string, 
  status: Order['status'], 
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id)
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp()
    }
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating order status:', error)
    throw new Error('Failed to update order status')
  }
}

// DELETE - Delete order
export async function deleteOrder(id: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting order:', error)
    throw new Error('Failed to delete order')
  }
}

// REAL-TIME - Subscribe to orders changes
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  filters?: OrderFilter
) {
  let q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'))
  
  // Apply Firestore filters
  if (filters?.status && filters.status !== 'all') {
    q = query(q, where('status', '==', filters.status))
  }
  
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    q = query(q, where('paymentStatus', '==', filters.paymentStatus))
  }
  
  if (filters?.customerId) {
    q = query(q, where('customerId', '==', filters.customerId))
  }

  return onSnapshot(q, (querySnapshot) => {
    const orders: Order[] = []
    
    querySnapshot.forEach((doc) => {
      orders.push(convertFirestoreOrder(doc.id, doc.data()))
    })
    
    // Apply client-side filters
    let filteredOrders = orders
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredOrders = filteredOrders.filter(order => 
        order.customerEmail.toLowerCase().includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchTerm))
      )
    }
    
    callback(filteredOrders)
  }, (error) => {
    console.error('Error in orders subscription:', error)
  })
}

// BULK OPERATIONS
export async function bulkUpdateOrderStatus(
  ids: string[], 
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  try {
    const promises = ids.map(id => updateOrderStatus(id, status, paymentStatus))
    await Promise.all(promises)
  } catch (error) {
    console.error('Error in bulk update:', error)
    throw new Error('Failed to update orders')
  }
}

export async function bulkDeleteOrders(ids: string[]): Promise<void> {
  try {
    const promises = ids.map(id => deleteOrder(id))
    await Promise.all(promises)
  } catch (error) {
    console.error('Error in bulk delete:', error)
    throw new Error('Failed to delete orders')
  }
}

// STATISTICS
export async function getOrderStats() {
  try {
    const orders = await getOrders()
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length 
        : 0,
      paidOrders: orders.filter(o => o.paymentStatus === 'paid').length,
      pendingPayments: orders.filter(o => o.paymentStatus === 'pending').length
    }
    
    return stats
  } catch (error) {
    console.error('Error calculating order stats:', error)
    throw new Error('Failed to calculate order statistics')
  }
}

// HELPER FUNCTIONS
async function updateUserOrderHistory(userId: string, orderId: string, orderTotal: number): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      const currentOrders = userData.orders || []
      const currentTotalSpent = userData.totalSpent || 0
      
      await updateDoc(userRef, {
        orders: [...currentOrders, orderId],
        totalSpent: currentTotalSpent + orderTotal,
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error updating user order history:', error)
    // Don't throw error here as order creation should still succeed
  }
}

async function getOrCreateUser(email: string, name: string): Promise<string> {
  try {
    // Try to find existing user by email
    const usersQuery = query(
      collection(db, USERS_COLLECTION), 
      where('email', '==', email)
    )
    const querySnapshot = await getDocs(usersQuery)
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id
    }
    
    // Create new user (this should rarely happen as users should exist from auth)
    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ')
    
    const userData = {
      email,
      firstName,
      lastName,
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Italia',
      dateOfBirth: new Date('1990-01-01'), // Default date
      role: 2, // Normal user
      isActive: true,
      acceptedTerms: false,
      authProvider: 'email',
      orders: [],
      totalSpent: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userData)
    return docRef.id
  } catch (error) {
    console.error('Error getting or creating user:', error)
    throw new Error('Failed to process user')
  }
}

async function updateProductStock(productId: string, quantityToReduce: number): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    const productSnap = await getDoc(productRef)
    
    if (productSnap.exists()) {
      const productData = productSnap.data()
      const currentStock = productData.stock || 0
      
      if (currentStock < quantityToReduce) {
        throw new Error(`Stock insufficiente. Disponibili: ${currentStock}`)
      }
      
      await updateDoc(productRef, {
        stock: currentStock - quantityToReduce,
        updatedAt: serverTimestamp()
      })
    } else {
      throw new Error('Prodotto non trovato')
    }
  } catch (error) {
    console.error('Error updating product stock:', error)
    throw error
  }
}

export async function restoreProductStock(productId: string, quantityToRestore: number): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    const productSnap = await getDoc(productRef)
    
    if (productSnap.exists()) {
      const productData = productSnap.data()
      const currentStock = productData.stock || 0
      
      await updateDoc(productRef, {
        stock: currentStock + quantityToRestore,
        updatedAt: serverTimestamp()
      })
    } else {
      throw new Error('Prodotto non trovato')
    }
  } catch (error) {
    console.error('Error restoring product stock:', error)
    throw error
  }
}