'use client'

import { useState, useEffect, useCallback } from 'react'
import { Customer } from '@/lib/types'
import { CustomerFilter, CustomerFormData, QuickCustomerData } from '@/lib/validation-customers'
import { 
  getCustomers, 
  getCustomer, 
  createCustomer,
  createQuickCustomer,
  updateCustomer, 
  deleteCustomer, 
  subscribeToCustomers,
  getCustomerStats,
  bulkDeleteCustomers
} from '@/lib/customers'

interface UseCustomersReturn {
  customers: Customer[]
  loading: boolean
  error: string | null
  stats: CustomerStats | null
  filters: CustomerFilter
  selectedCustomers: string[]
  // Actions
  refetch: () => Promise<void>
  setFilters: (filters: CustomerFilter) => void
  selectCustomer: (id: string) => void
  selectAllCustomers: () => void
  clearSelection: () => void
  // CRUD operations
  createNewCustomer: (data: CustomerFormData) => Promise<string>
  createQuickNewCustomer: (data: QuickCustomerData) => Promise<string>
  updateExistingCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<void>
  deleteExistingCustomer: (id: string) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>
}

interface CustomerStats {
  total: number
  newThisMonth: number
  withOrders: number
  withoutOrders: number
  totalRevenue: number
  averageOrderValue: number
  topCustomers: Array<{
    id: string
    name: string
    email: string
    totalSpent: number
    ordersCount: number
  }>
}

export function useCustomers(initialFilters?: CustomerFilter): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [filters, setFilters] = useState<CustomerFilter>(initialFilters || { hasOrders: 'all' })
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomers(filters)
      setCustomers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getCustomerStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [fetchCustomers, fetchStats])

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToCustomers((data) => {
      setCustomers(data)
      fetchStats() // Update stats when customers change
    }, filters)

    return unsubscribe
  }, [filters, fetchStats])

  // Selection management
  const selectCustomer = useCallback((id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }, [])

  const selectAllCustomers = useCallback(() => {
    setSelectedCustomers(customers.map(c => c.id))
  }, [customers])

  const clearSelection = useCallback(() => {
    setSelectedCustomers([])
  }, [])

  // CRUD operations
  const createNewCustomer = useCallback(async (data: CustomerFormData): Promise<string> => {
    try {
      setError(null)
      const id = await createCustomer(data)
      // Customers will update automatically via subscription
      return id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const createQuickNewCustomer = useCallback(async (data: QuickCustomerData): Promise<string> => {
    try {
      setError(null)
      const id = await createQuickCustomer(data)
      // Customers will update automatically via subscription
      return id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create quick customer'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const updateExistingCustomer = useCallback(async (id: string, data: Partial<CustomerFormData>): Promise<void> => {
    try {
      setError(null)
      await updateCustomer(id, data)
      // Customers will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update customer'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const deleteExistingCustomer = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await deleteCustomer(id)
      // Remove from selection if selected
      setSelectedCustomers(prev => prev.filter(selectedId => selectedId !== id))
      // Customers will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete customer'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    try {
      setError(null)
      await bulkDeleteCustomers(ids)
      // Remove from selection
      setSelectedCustomers(prev => prev.filter(id => !ids.includes(id)))
      // Customers will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete customers'
      setError(message)
      throw new Error(message)
    }
  }, [])

  return {
    customers,
    loading,
    error,
    stats,
    filters,
    selectedCustomers,
    refetch: fetchCustomers,
    setFilters,
    selectCustomer,
    selectAllCustomers,
    clearSelection,
    createNewCustomer,
    createQuickNewCustomer,
    updateExistingCustomer,
    deleteExistingCustomer,
    bulkDelete
  }
}

// Hook for single customer
export function useCustomer(id: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setCustomer(null)
      return
    }

    async function fetchCustomer() {
      try {
        setLoading(true)
        setError(null)
        const data = await getCustomer(id!)
        setCustomer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [id])

  return { customer, loading, error }
}