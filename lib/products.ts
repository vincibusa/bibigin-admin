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
import { Product } from './types'
import { ProductFormData, ProductFilter } from './validation-products'

const PRODUCTS_COLLECTION = 'products'

// Helper function to convert Firestore data to Product
function convertFirestoreProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
  } as Product
}


// CREATE - Add new product
export async function createProduct(productData: ProductFormData): Promise<string> {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(productData).filter(([, value]) => value !== undefined)
    )
    
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating product:', error)
    throw new Error('Failed to create product')
  }
}

// READ - Get all products
export async function getProducts(filters?: ProductFilter): Promise<Product[]> {
  try {
    let q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'))
    
    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status))
    }
    
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category))
    }
    
    if (filters?.featured !== undefined) {
      q = query(q, where('featured', '==', filters.featured))
    }
    
    if (filters?.inStock !== undefined) {
      if (filters.inStock) {
        q = query(q, where('stock', '>', 0))
      } else {
        q = query(q, where('stock', '==', 0))
      }
    }

    const querySnapshot = await getDocs(q)
    const products: Product[] = []
    
    querySnapshot.forEach((doc) => {
      products.push(convertFirestoreProduct(doc.id, doc.data()))
    })
    
    // Apply client-side filters (search, price range)
    let filteredProducts = products
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters?.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice!)
    }
    
    if (filters?.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice!)
    }
    
    return filteredProducts
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }
}

// READ - Get single product by ID
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertFirestoreProduct(docSnap.id, docSnap.data())
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    throw new Error('Failed to fetch product')
  }
}

// UPDATE - Update existing product
export async function updateProduct(id: string, productData: Partial<ProductFormData>): Promise<void> {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(productData).filter(([, value]) => value !== undefined)
    )
    
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating product:', error)
    throw new Error('Failed to update product')
  }
}

// DELETE - Delete product
export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting product:', error)
    throw new Error('Failed to delete product')
  }
}

// REAL-TIME - Subscribe to products changes
export function subscribeToProducts(
  callback: (products: Product[]) => void,
  filters?: ProductFilter
) {
  let q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'))
  
  // Apply Firestore filters
  if (filters?.status && filters.status !== 'all') {
    q = query(q, where('status', '==', filters.status))
  }
  
  if (filters?.category) {
    q = query(q, where('category', '==', filters.category))
  }
  
  if (filters?.featured !== undefined) {
    q = query(q, where('featured', '==', filters.featured))
  }
  
  if (filters?.inStock !== undefined) {
    if (filters.inStock) {
      q = query(q, where('stock', '>', 0))
    } else {
      q = query(q, where('stock', '==', 0))
    }
  }

  return onSnapshot(q, (querySnapshot) => {
    const products: Product[] = []
    
    querySnapshot.forEach((doc) => {
      products.push(convertFirestoreProduct(doc.id, doc.data()))
    })
    
    // Apply client-side filters
    let filteredProducts = products
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters?.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice!)
    }
    
    if (filters?.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice!)
    }
    
    callback(filteredProducts)
  }, (error) => {
    console.error('Error in products subscription:', error)
  })
}

// BULK OPERATIONS
export async function bulkUpdateProducts(ids: string[], updates: Partial<ProductFormData>): Promise<void> {
  try {
    const promises = ids.map(id => updateProduct(id, updates))
    await Promise.all(promises)
  } catch (error) {
    console.error('Error in bulk update:', error)
    throw new Error('Failed to update products')
  }
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  try {
    const promises = ids.map(id => deleteProduct(id))
    await Promise.all(promises)
  } catch (error) {
    console.error('Error in bulk delete:', error)
    throw new Error('Failed to delete products')
  }
}

// STATISTICS
export async function getProductStats() {
  try {
    const products = await getProducts()
    
    const stats = {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      inactive: products.filter(p => p.status === 'inactive').length,
      outOfStock: products.filter(p => p.status === 'out_of_stock' || p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
      featured: products.filter(p => p.featured).length
    }
    
    return stats
  } catch (error) {
    console.error('Error calculating product stats:', error)
    throw new Error('Failed to calculate product statistics')
  }
}