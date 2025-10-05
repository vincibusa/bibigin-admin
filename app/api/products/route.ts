import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { withAdminAuth } from '@/lib/auth-middleware'
import { ProductFormData, ProductFilter } from '@/lib/validation-products'

// Interface for products from Firestore with optional fields
interface FirestoreProduct {
  id: string
  name?: string
  description?: string
  sku?: string
  price?: number
  createdAt: string
  updatedAt: string
  [key: string]: unknown // For other dynamic fields
}

// GET /api/products - Get all products with optional filters
// Public endpoint - no auth required for viewing products
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb()
    const searchParams = request.nextUrl.searchParams

    // Parse filters from query params
    const filters: ProductFilter = {
      status: (searchParams.get('status') as ProductFilter['status']) || undefined,
        category: searchParams.get('category') || undefined,
        featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined,
        inStock: searchParams.get('inStock') === 'true' ? true : searchParams.get('inStock') === 'false' ? false : undefined,
        search: searchParams.get('search') || undefined,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
      }

      let query = db.collection('products').orderBy('createdAt', 'desc')

      // Apply Firestore filters
      if (filters.status && filters.status !== 'all') {
        query = query.where('status', '==', filters.status)
      }

      if (filters.category) {
        query = query.where('category', '==', filters.category)
      }

      if (filters.featured !== undefined) {
        query = query.where('featured', '==', filters.featured)
      }

      if (filters.inStock !== undefined) {
        if (filters.inStock) {
          query = query.where('stock', '>', 0)
        } else {
          query = query.where('stock', '==', 0)
        }
      }

      const snapshot = await query.get()
      let products: FirestoreProduct[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }))

      // Apply client-side filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        products = products.filter(product =>
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.sku?.toLowerCase().includes(searchTerm)
        )
      }

      if (filters.minPrice !== undefined) {
        products = products.filter(product => (product.price || 0) >= filters.minPrice!)
      }

      if (filters.maxPrice !== undefined) {
        products = products.filter(product => (product.price || 0) <= filters.maxPrice!)
      }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req) => {
    try {
      const db = getAdminDb()
      const body = await req.json()

      // Validate product data (you can add Zod validation here)
      const productData: ProductFormData = body

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(productData).filter(([, value]) => value !== undefined)
      )

      const docRef = await db.collection('products').add({
        ...cleanData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return NextResponse.json(
        { id: docRef.id, message: 'Product created successfully' },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }
  })
}
