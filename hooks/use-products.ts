'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/lib/types'
import { ProductFilter, ProductFormData } from '@/lib/validation-products'
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  subscribeToProducts,
  getProductStats,
  bulkUpdateProducts,
  bulkDeleteProducts
} from '@/lib/products'

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  stats: ProductStats | null
  filters: ProductFilter
  selectedProducts: string[]
  // Actions
  refetch: () => Promise<void>
  setFilters: (filters: ProductFilter) => void
  selectProduct: (id: string) => void
  selectAllProducts: () => void
  clearSelection: () => void
  // CRUD operations
  createNewProduct: (data: ProductFormData) => Promise<string>
  updateExistingProduct: (id: string, data: Partial<ProductFormData>) => Promise<void>
  deleteExistingProduct: (id: string) => Promise<void>
  bulkUpdate: (ids: string[], updates: Partial<ProductFormData>) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>
}

interface ProductStats {
  total: number
  active: number
  inactive: number
  outOfStock: number
  totalValue: number
  lowStock: number
  featured: number
}

export function useProducts(initialFilters?: ProductFilter): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [filters, setFilters] = useState<ProductFilter>(initialFilters || { status: 'all' })
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts(filters)
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getProductStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [fetchProducts, fetchStats])

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data)
      fetchStats() // Update stats when products change
    }, filters)

    return unsubscribe
  }, [filters, fetchStats])

  // Selection management
  const selectProduct = useCallback((id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }, [])

  const selectAllProducts = useCallback(() => {
    setSelectedProducts(products.map(p => p.id))
  }, [products])

  const clearSelection = useCallback(() => {
    setSelectedProducts([])
  }, [])

  // CRUD operations
  const createNewProduct = useCallback(async (data: ProductFormData): Promise<string> => {
    try {
      setError(null)
      const id = await createProduct(data)
      // Products will update automatically via subscription
      return id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const updateExistingProduct = useCallback(async (id: string, data: Partial<ProductFormData>): Promise<void> => {
    try {
      setError(null)
      await updateProduct(id, data)
      // Products will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const deleteExistingProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await deleteProduct(id)
      // Remove from selection if selected
      setSelectedProducts(prev => prev.filter(selectedId => selectedId !== id))
      // Products will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const bulkUpdate = useCallback(async (ids: string[], updates: Partial<ProductFormData>): Promise<void> => {
    try {
      setError(null)
      await bulkUpdateProducts(ids, updates)
      // Products will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update products'
      setError(message)
      throw new Error(message)
    }
  }, [])

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    try {
      setError(null)
      await bulkDeleteProducts(ids)
      // Remove from selection
      setSelectedProducts(prev => prev.filter(id => !ids.includes(id)))
      // Products will update automatically via subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete products'
      setError(message)
      throw new Error(message)
    }
  }, [])

  return {
    products,
    loading,
    error,
    stats,
    filters,
    selectedProducts,
    refetch: fetchProducts,
    setFilters,
    selectProduct,
    selectAllProducts,
    clearSelection,
    createNewProduct,
    updateExistingProduct,
    deleteExistingProduct,
    bulkUpdate,
    bulkDelete
  }
}

// Hook for single product
export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setProduct(null)
      return
    }

    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)
        const data = await getProduct(id!)
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}