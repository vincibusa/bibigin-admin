export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  customerId: string
  customerEmail: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: Address
  billingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: Date
  address: string
  city: string
  province: string
  postalCode: string
  role: 1 | 2 // 1 = admin, 2 = normal user
  isActive: boolean
  acceptedTerms: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  authProvider: 'email' | 'google'
}

export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  defaultAddress?: Address
  orders: string[] // Order IDs
  totalSpent: number
  createdAt: Date
  lastOrderAt?: Date
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: 'admin' | 'manager' | 'viewer'
  createdAt: Date
  lastLoginAt?: Date
}

export interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  topProducts: Array<{
    productId: string
    productName: string
    totalSold: number
    revenue: number
  }>
  recentOrders: Order[]
}