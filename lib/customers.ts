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
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { Customer } from './types'
import { CustomerFormData, CustomerFilter, QuickCustomerData } from './validation-customers'

const CUSTOMERS_COLLECTION = 'customers'

// Helper function to convert Firestore data to Customer
function convertFirestoreCustomer(id: string, data: Record<string, unknown>): Customer {
  return {
    id,
    ...data,
    totalSpent: (data.totalSpent as number) ?? 0,
    orders: (data.orders as string[]) ?? [],
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    lastOrderAt: (data.lastOrderAt as Timestamp)?.toDate() || undefined
  } as Customer
}

// CREATE - Add new customer
export async function createCustomer(customerData: CustomerFormData): Promise<string> {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(customerData).filter(([, value]) => value !== undefined)
    )
    
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...cleanData,
      orders: [],
      totalSpent: 0,
      createdAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }
}

// CREATE - Quick customer creation for admin
export async function createQuickCustomer(quickCustomerData: QuickCustomerData): Promise<string> {
  try {
    const customerData: CustomerFormData = {
      email: quickCustomerData.email,
      firstName: quickCustomerData.firstName,
      lastName: quickCustomerData.lastName,
      phone: quickCustomerData.phone,
      defaultAddress: quickCustomerData.address,
      notes: quickCustomerData.notes
    }
    
    return await createCustomer(customerData)
  } catch (error) {
    console.error('Error creating quick customer:', error)
    throw new Error('Failed to create quick customer')
  }
}

// READ - Get all customers
export async function getCustomers(filters?: CustomerFilter): Promise<Customer[]> {
  try {
    let q = query(collection(db, CUSTOMERS_COLLECTION), orderBy('createdAt', 'desc'))
    
    // Apply date filters if provided
    if (filters?.registrationDateFrom) {
      q = query(q, where('createdAt', '>=', filters.registrationDateFrom))
    }
    
    if (filters?.registrationDateTo) {
      q = query(q, where('createdAt', '<=', filters.registrationDateTo))
    }

    const querySnapshot = await getDocs(q)
    const customers: Customer[] = []
    
    querySnapshot.forEach((doc) => {
      customers.push(convertFirestoreCustomer(doc.id, doc.data()))
    })
    
    // Apply client-side filters
    let filteredCustomers = customers
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters?.hasOrders && filters.hasOrders !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer => {
        const hasOrders = customer.orders.length > 0
        return filters.hasOrders === 'yes' ? hasOrders : !hasOrders
      })
    }
    
    if (filters?.minSpent !== undefined) {
      filteredCustomers = filteredCustomers.filter(customer => customer.totalSpent >= filters.minSpent!)
    }
    
    if (filters?.maxSpent !== undefined) {
      filteredCustomers = filteredCustomers.filter(customer => customer.totalSpent <= filters.maxSpent!)
    }
    
    if (filters?.lastOrderFrom && filters?.lastOrderTo) {
      filteredCustomers = filteredCustomers.filter(customer => {
        if (!customer.lastOrderAt) return false
        return customer.lastOrderAt >= filters.lastOrderFrom! && 
               customer.lastOrderAt <= filters.lastOrderTo!
      })
    }
    
    return filteredCustomers
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw new Error('Failed to fetch customers')
  }
}

// READ - Get single customer by ID
export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertFirestoreCustomer(docSnap.id, docSnap.data())
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
    throw new Error('Failed to fetch customer')
  }
}

// UPDATE - Update existing customer
export async function updateCustomer(id: string, customerData: Partial<CustomerFormData>): Promise<void> {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(customerData).filter(([, value]) => value !== undefined)
    )
    
    const docRef = doc(db, CUSTOMERS_COLLECTION, id)
    await updateDoc(docRef, cleanData)
  } catch (error) {
    console.error('Error updating customer:', error)
    throw new Error('Failed to update customer')
  }
}

// DELETE - Delete customer
export async function deleteCustomer(id: string): Promise<void> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw new Error('Failed to delete customer')
  }
}

// REAL-TIME - Subscribe to customers changes
export function subscribeToCustomers(
  callback: (customers: Customer[]) => void,
  filters?: CustomerFilter
) {
  let q = query(collection(db, CUSTOMERS_COLLECTION), orderBy('createdAt', 'desc'))
  
  // Apply Firestore filters
  if (filters?.registrationDateFrom) {
    q = query(q, where('createdAt', '>=', filters.registrationDateFrom))
  }
  
  if (filters?.registrationDateTo) {
    q = query(q, where('createdAt', '<=', filters.registrationDateTo))
  }

  return onSnapshot(q, (querySnapshot) => {
    const customers: Customer[] = []
    
    querySnapshot.forEach((doc) => {
      customers.push(convertFirestoreCustomer(doc.id, doc.data()))
    })
    
    // Apply client-side filters
    let filteredCustomers = customers
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm)
      )
    }
    
    callback(filteredCustomers)
  }, (error) => {
    console.error('Error in customers subscription:', error)
  })
}

// BULK OPERATIONS
export async function bulkDeleteCustomers(ids: string[]): Promise<void> {
  try {
    const promises = ids.map(id => deleteCustomer(id))
    await Promise.all(promises)
  } catch (error) {
    console.error('Error in bulk delete:', error)
    throw new Error('Failed to delete customers')
  }
}

// STATISTICS
export async function getCustomerStats() {
  try {
    const customers = await getCustomers()
    
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const stats = {
      total: customers.length,
      newThisMonth: customers.filter(c => c.createdAt >= thirtyDaysAgo).length,
      withOrders: customers.filter(c => c.orders.length > 0).length,
      withoutOrders: customers.filter(c => c.orders.length === 0).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageOrderValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.filter(c => c.orders.length > 0).length || 0
        : 0,
      topCustomers: customers
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10)
        .map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          totalSpent: c.totalSpent,
          ordersCount: c.orders.length
        }))
    }
    
    return stats
  } catch (error) {
    console.error('Error calculating customer stats:', error)
    throw new Error('Failed to calculate customer statistics')
  }
}

// HELPER FUNCTIONS
export async function getCustomerOrderHistory(customerId: string) {
  try {
    const customer = await getCustomer(customerId)
    if (!customer) return []
    
    // This would typically fetch orders from the orders collection
    // For now, we return the order IDs from the customer document
    return customer.orders
  } catch (error) {
    console.error('Error fetching customer order history:', error)
    return []
  }
}

export async function updateCustomerStats(customerId: string, orderTotal: number, orderId: string): Promise<void> {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId)
    const customerSnap = await getDoc(customerRef)
    
    if (customerSnap.exists()) {
      const customerData = customerSnap.data()
      const currentOrders = customerData.orders || []
      const currentTotalSpent = customerData.totalSpent || 0
      
      await updateDoc(customerRef, {
        orders: [...currentOrders, orderId],
        totalSpent: currentTotalSpent + orderTotal,
        lastOrderAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error updating customer stats:', error)
  }
}