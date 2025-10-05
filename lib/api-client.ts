import { auth } from './firebase'

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null

  try {
    const token = await user.getIdToken()
    return token
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Make authenticated API request to internal API routes
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `API request failed: ${response.status}`)
  }

  return response.json()
}

// ============= PRODUCTS API =============

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'out_of_stock'
  category?: string
  sku: string
  imageUrl?: string
  images?: string[]
  featured?: boolean
  bottleSize?: number
  alcoholContent?: number
  createdAt: string
  updatedAt: string
}

export interface ProductFilter {
  status?: 'active' | 'inactive' | 'out_of_stock' | 'all'
  category?: string
  featured?: boolean
  inStock?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'out_of_stock'
  category?: string
  sku: string
  imageUrl?: string
  images?: string[]
  featured?: boolean
  bottleSize?: number
  alcoholContent?: number
}

/**
 * Get all products with optional filters
 */
export async function getProducts(filters?: ProductFilter): Promise<Product[]> {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const data = await apiRequest<{ products: Product[] }>(
    `/api/products?${params.toString()}`
  )
  return data.products
}

/**
 * Get product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const data = await apiRequest<{ product: Product }>(`/api/products/${productId}`)
    return data.product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Create new product
 */
export async function createProduct(productData: ProductFormData): Promise<string> {
  const response = await apiRequest<{ id: string }>('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  })
  return response.id
}

/**
 * Update product
 */
export async function updateProduct(
  productId: string,
  productData: Partial<ProductFormData>
): Promise<void> {
  await apiRequest(`/api/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(productData)
  })
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<void> {
  await apiRequest(`/api/products/${productId}`, {
    method: 'DELETE'
  })
}

// ============= ORDERS API =============

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Order {
  id: string
  customerId: string
  customerEmail: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderFilter {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'all'
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'all'
  customerId?: string
  search?: string
  minTotal?: number
  maxTotal?: number
  dateFrom?: Date
  dateTo?: Date
}

export interface OrderFormData {
  customerId: string
  customerEmail: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
}

/**
 * Get all orders with optional filters
 */
export async function getOrders(filters?: OrderFilter): Promise<Order[]> {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          params.append(key, value.toISOString())
        } else {
          params.append(key, String(value))
        }
      }
    })
  }

  const data = await apiRequest<{ orders: Order[] }>(
    `/api/orders?${params.toString()}`
  )
  return data.orders
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const data = await apiRequest<{ order: Order }>(`/api/orders/${orderId}`)
    return data.order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

/**
 * Create new order
 */
export async function createOrder(orderData: OrderFormData): Promise<string> {
  const response = await apiRequest<{ id: string }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  })
  return response.id
}

/**
 * Update order
 */
export async function updateOrder(
  orderId: string,
  orderData: Partial<OrderFormData>
): Promise<void> {
  await apiRequest(`/api/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(orderData)
  })
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  const updateData: Partial<OrderFormData> = { status }
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus
  }
  await updateOrder(orderId, updateData)
}

/**
 * Delete order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  await apiRequest(`/api/orders/${orderId}`, {
    method: 'DELETE'
  })
}

// ============= USERS API =============

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  dateOfBirth?: Date
  role: number
  isActive: boolean
  orders: string[]
  totalSpent: number
  createdAt: string
  updatedAt: string
}

/**
 * Get all users
 */
export async function getUsers(filters?: {
  role?: number
  isActive?: boolean
  search?: string
}): Promise<User[]> {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const data = await apiRequest<{ users: User[] }>(
    `/api/users?${params.toString()}`
  )
  return data.users
}

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const data = await apiRequest<{ user: User }>(`/api/users/${userId}`)
    return data.user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  await apiRequest(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(userData)
  })
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  await apiRequest(`/api/users/${userId}`, {
    method: 'DELETE'
  })
}
