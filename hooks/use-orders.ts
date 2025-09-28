'use client'

import { useState, useEffect, useCallback } from 'react'
import { Order } from '@/lib/types'
import { OrderFilter, OrderFormData, QuickOrderData } from '@/lib/validation-orders'
import { 
  getOrders, 
  getOrder, 
  createOrder,
  createQuickOrder,
  updateOrder, 
  updateOrderStatus,
  deleteOrder, 
  subscribeToOrders,
  getOrderStats,
  bulkUpdateOrderStatus,
  bulkDeleteOrders
} from '@/lib/orders'

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  stats: OrderStats | null
  filters: OrderFilter
  selectedOrders: string[]
  // Actions
  refetch: () => Promise<void>
  setFilters: (filters: OrderFilter) => void
  selectOrder: (id: string) => void
  selectAllOrders: () => void
  clearSelection: () => void
  // CRUD operations
  createNewOrder: (data: OrderFormData) => Promise<string>
  createQuickNewOrder: (data: QuickOrderData) => Promise<string>
  updateExistingOrder: (id: string, data: Partial<OrderFormData>) => Promise<void>
  updateOrderStatusById: (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => Promise<void>
  deleteExistingOrder: (id: string) => Promise<void>
  bulkUpdateStatus: (ids: string[], status: Order['status'], paymentStatus?: Order['paymentStatus']) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>
}

interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  totalRevenue: number
  averageOrderValue: number
  paidOrders: number
  pendingPayments: number
}

export function useOrders(initialFilters?: OrderFilter): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [filters, setFilters] = useState<OrderFilter>(initialFilters || { status: 'all', paymentStatus: 'all' })
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOrders(filters)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getOrderStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [fetchOrders, fetchStats])

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data)
      fetchStats() // Update stats when orders change
    }, filters)

    return unsubscribe
  }, [filters, fetchStats])

  // Selection management
  const selectOrder = useCallback((id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }, [])

  const selectAllOrders = useCallback(() => {
    setSelectedOrders(orders.map(o => o.id))
  }, [orders])

  const clearSelection = useCallback(() => {
    setSelectedOrders([])
  }, [])

  // CRUD operations
  const createNewOrder = useCallback(async (data: OrderFormData): Promise<string> => {
    try {
      setError(null)
      const id = await createOrder(data)
      // Orders will update automatically via subscription
      return id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const createQuickNewOrder = useCallback(async (data: QuickOrderData): Promise<string> => {
    try {
      setError(null)
      const id = await createQuickOrder(data)
      // Orders will update automatically via subscription
      return id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create quick order'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const updateExistingOrder = useCallback(async (id: string, data: Partial<OrderFormData>): Promise<void> => {
    try {
      setError(null)
      await updateOrder(id, data)
      // Orders will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const updateOrderStatusById = useCallback(async (
    id: string, 
    status: Order['status'], 
    paymentStatus?: Order['paymentStatus']
  ): Promise<void> => {
    try {
      setError(null)
      await updateOrderStatus(id, status, paymentStatus)
      // Orders will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const deleteExistingOrder = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await deleteOrder(id)
      // Remove from selection if selected
      setSelectedOrders(prev => prev.filter(selectedId => selectedId !== id))
      // Orders will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete order'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const bulkUpdateStatus = useCallback(async (
    ids: string[], 
    status: Order['status'], 
    paymentStatus?: Order['paymentStatus']
  ): Promise<void> => {
    try {
      setError(null)
      await bulkUpdateOrderStatus(ids, status, paymentStatus)
      // Orders will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update orders'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    try {
      setError(null)
      await bulkDeleteOrders(ids)
      // Remove from selection
      setSelectedOrders(prev => prev.filter(id => !ids.includes(id)))
      // Orders will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete orders'
      setError(message)
      throw new Error(message)
    }
  }, [])

  return {
    orders,
    loading,
    error,
    stats,
    filters,
    selectedOrders,
    refetch: fetchOrders,
    setFilters,
    selectOrder,
    selectAllOrders,
    clearSelection,
    createNewOrder,
    createQuickNewOrder,
    updateExistingOrder,
    updateOrderStatusById,
    deleteExistingOrder,
    bulkUpdateStatus,
    bulkDelete
  }
}

// Hook for single order
export function useOrder(id: string | null) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setOrder(null)
      return
    }

    async function fetchOrder() {
      try {
        setLoading(true)
        setError(null)
        const data = await getOrder(id!)
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  return { order, loading, error }
}