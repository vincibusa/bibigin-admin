export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'in'
}

export interface Product {
  id: string
  name: string
  description: string
  sku: string
  price: number
  category: string
  imageUrl?: string
  images?: string[]
  stock: number
  featured: boolean
  status: 'active' | 'inactive' | 'out_of_stock'
  weight?: number
  dimensions?: ProductDimensions
  alcoholContent?: number
  bottleSize?: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  customerId: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  shipping_cost?: number // For backward compatibility
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: string
  shippingAddress: Address
  billingAddress: Address
  notes?: string
  shipping?: {
    firstName?: string
    lastName?: string
    street?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  name?: string
  quantity: number
  price: number
  total: number
  image?: string
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
  country: string
  role: 1 | 2 // 1 = admin, 2 = normal user
  isActive: boolean
  acceptedTerms: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  authProvider: 'email' | 'google'
  // E-commerce fields
  orders: string[] // Order IDs
  totalSpent: number
}

export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date
  address?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  isActive: boolean
  acceptedTerms: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  totalSpent: number
  orders: string[]
  segment?: 'new' | 'regular' | 'premium' | 'vip'
  defaultAddress?: Address
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