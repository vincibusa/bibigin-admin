import { getOrders } from './orders'
import { getCustomers } from './customers'
import { getProducts } from './products'
import { Order } from './types'

// Analytics interfaces
export interface AnalyticsDateRange {
  from: Date
  to: Date
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
}

export interface CustomerMetrics {
  newCustomers: number
  returningCustomers: number
  averageOrderValue: number
  customerLifetimeValue: number
}

export interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  growthRate: number
}

export interface AnalyticsDashboard {
  salesMetrics: SalesMetrics
  customerMetrics: CustomerMetrics
  revenueChart: RevenueData[]
  topProducts: TopProduct[]
  recentOrders: Order[]
  performanceComparison: {
    currentPeriod: SalesMetrics
    previousPeriod: SalesMetrics
  }
}

// Helper function to format date for grouping
function formatDateForGrouping(date: Date, groupBy: 'day' | 'week' | 'month'): string {
  switch (groupBy) {
    case 'day':
      return date.toISOString().split('T')[0] // YYYY-MM-DD
    case 'week':
      const week = getWeekNumber(date)
      return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`
    case 'month':
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    default:
      return date.toISOString().split('T')[0]
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// Get sales metrics for a date range
export async function getSalesMetrics(dateRange: AnalyticsDateRange): Promise<SalesMetrics> {
  try {
    const orders = await getOrders()
    
    // Filter orders by date range
    const ordersInRange = orders.filter(order => 
      order.createdAt >= dateRange.from && 
      order.createdAt <= dateRange.to &&
      order.paymentStatus === 'paid'
    )
    
    const totalRevenue = ordersInRange.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = ordersInRange.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Calculate conversion rate (simplified - orders vs website visits)
    // In a real scenario, you'd track website visitors
    const conversionRate = 2.5 // Mock conversion rate percentage
    
    // Calculate growth rate compared to previous period
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime()
    const previousPeriodStart = new Date(dateRange.from.getTime() - periodLength)
    const previousPeriodEnd = dateRange.from
    
    const previousOrders = orders.filter(order => 
      order.createdAt >= previousPeriodStart && 
      order.createdAt < previousPeriodEnd &&
      order.paymentStatus === 'paid'
    )
    
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)
    const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      growthRate
    }
  } catch (error) {
    console.error('Error calculating sales metrics:', error)
    throw new Error('Failed to calculate sales metrics')
  }
}

// Get customer metrics for a date range
export async function getCustomerMetrics(dateRange: AnalyticsDateRange): Promise<CustomerMetrics> {
  try {
    const customers = await getCustomers()
    const orders = await getOrders()
    
    // Filter customers by date range
    const customersInRange = customers.filter(customer => 
      customer.createdAt >= dateRange.from && 
      customer.createdAt <= dateRange.to
    )
    
    // Calculate new vs returning customers
    const newCustomers = customersInRange.length
    const orderCustomerIds = new Set(
      orders
        .filter(order => order.createdAt >= dateRange.from && order.createdAt <= dateRange.to)
        .map(order => order.customerId)
    )
    
    const returningCustomers = Array.from(orderCustomerIds).filter(customerId => {
      const customer = customers.find(c => c.id === customerId)
      return customer && customer.createdAt < dateRange.from
    }).length
    
    // Calculate average order value for the period
    const ordersInRange = orders.filter(order => 
      order.createdAt >= dateRange.from && 
      order.createdAt <= dateRange.to &&
      order.paymentStatus === 'paid'
    )
    
    const totalRevenue = ordersInRange.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = ordersInRange.length > 0 ? totalRevenue / ordersInRange.length : 0
    
    // Calculate customer lifetime value (simplified)
    const totalCustomerSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
    const customerLifetimeValue = customers.length > 0 ? totalCustomerSpent / customers.length : 0
    
    return {
      newCustomers,
      returningCustomers,
      averageOrderValue,
      customerLifetimeValue
    }
  } catch (error) {
    console.error('Error calculating customer metrics:', error)
    throw new Error('Failed to calculate customer metrics')
  }
}

// Get revenue chart data
export async function getRevenueChartData(
  dateRange: AnalyticsDateRange, 
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<RevenueData[]> {
  try {
    const orders = await getOrders()
    
    // Filter and group orders by date
    const ordersInRange = orders.filter(order => 
      order.createdAt >= dateRange.from && 
      order.createdAt <= dateRange.to &&
      order.paymentStatus === 'paid'
    )
    
    // Group orders by date
    const groupedData = new Map<string, { revenue: number; orders: number }>()
    
    ordersInRange.forEach(order => {
      const dateKey = formatDateForGrouping(order.createdAt, groupBy)
      const existing = groupedData.get(dateKey) || { revenue: 0, orders: 0 }
      groupedData.set(dateKey, {
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1
      })
    })
    
    // Convert to array and sort
    const chartData: RevenueData[] = Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    return chartData
  } catch (error) {
    console.error('Error generating revenue chart data:', error)
    throw new Error('Failed to generate revenue chart data')
  }
}

// Get top products by sales
export async function getTopProducts(
  dateRange: AnalyticsDateRange, 
  limit: number = 10
): Promise<TopProduct[]> {
  try {
    const orders = await getOrders()
    await getProducts() // Keep for potential future use
    
    // Filter orders by date range
    const ordersInRange = orders.filter(order => 
      order.createdAt >= dateRange.from && 
      order.createdAt <= dateRange.to &&
      order.paymentStatus === 'paid'
    )
    
    // Aggregate product sales
    const productSales = new Map<string, { quantitySold: number; revenue: number; name: string }>()
    
    ordersInRange.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { 
          quantitySold: 0, 
          revenue: 0, 
          name: item.productName 
        }
        productSales.set(item.productId, {
          quantitySold: existing.quantitySold + item.quantity,
          revenue: existing.revenue + item.total,
          name: existing.name
        })
      })
    })
    
    // Convert to array, sort by revenue, and limit results
    const topProducts: TopProduct[] = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantitySold: data.quantitySold,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
    
    return topProducts
  } catch (error) {
    console.error('Error calculating top products:', error)
    throw new Error('Failed to calculate top products')
  }
}

// Get complete analytics dashboard data
export async function getAnalyticsDashboard(dateRange: AnalyticsDateRange): Promise<AnalyticsDashboard> {
  try {
    const [salesMetrics, customerMetrics, revenueChart, topProducts] = await Promise.all([
      getSalesMetrics(dateRange),
      getCustomerMetrics(dateRange),
      getRevenueChartData(dateRange),
      getTopProducts(dateRange, 5)
    ])
    
    // Get recent orders (last 10)
    const orders = await getOrders()
    const recentOrders = orders
      .filter(order => order.createdAt >= dateRange.from && order.createdAt <= dateRange.to)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
    
    // Calculate previous period metrics for comparison
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime()
    const previousPeriodRange: AnalyticsDateRange = {
      from: new Date(dateRange.from.getTime() - periodLength),
      to: dateRange.from
    }
    
    const previousPeriodMetrics = await getSalesMetrics(previousPeriodRange)
    
    return {
      salesMetrics,
      customerMetrics,
      revenueChart,
      topProducts,
      recentOrders,
      performanceComparison: {
        currentPeriod: salesMetrics,
        previousPeriod: previousPeriodMetrics
      }
    }
  } catch (error) {
    console.error('Error generating analytics dashboard:', error)
    throw new Error('Failed to generate analytics dashboard')
  }
}

// Helper function to get common date ranges
export function getDateRanges() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return {
    today: {
      from: today,
      to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
    },
    last7Days: {
      from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: now
    },
    last30Days: {
      from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: now
    },
    thisMonth: {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now
    },
    lastMonth: {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    },
    thisYear: {
      from: new Date(now.getFullYear(), 0, 1),
      to: now
    }
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount)
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1
  }).format(value / 100)
}