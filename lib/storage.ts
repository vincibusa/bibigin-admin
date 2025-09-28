import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

const PRODUCTS_FOLDER = 'products'

// Upload image to Firebase Storage
export async function uploadProductImage(file: File, productId?: string): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = productId 
      ? `${productId}_${timestamp}.${extension}`
      : `temp_${timestamp}.${extension}`
    
    // Create storage reference
    const storageRef = ref(storage, `${PRODUCTS_FOLDER}/${filename}`)
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}

// Upload multiple images
export async function uploadProductImages(files: File[], productId?: string): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadProductImage(file, productId))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Error uploading images:', error)
    throw new Error('Failed to upload images')
  }
}

// Delete image from Firebase Storage
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extract path from URL
    const pathMatch = imageUrl.match(/\/o\/(.+?)\?/)
    if (!pathMatch) {
      throw new Error('Invalid image URL')
    }
    
    const path = decodeURIComponent(pathMatch[1])
    const storageRef = ref(storage, path)
    
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
    throw new Error('Failed to delete image')
  }
}

// Delete multiple images
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  try {
    const deletePromises = imageUrls.map(url => deleteProductImage(url))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting images:', error)
    throw new Error('Failed to delete images')
  }
}

// Validate file type and size
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Il file deve essere un\'immagine' }
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'L\'immagine non può superare i 5MB' }
  }
  
  // Check file extension
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato supportato: JPG, PNG, WebP' }
  }
  
  return { valid: true }
}