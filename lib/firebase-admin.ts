import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

let app: App | undefined
let adminAuth: Auth | undefined
let adminDb: Firestore | undefined
let adminStorage: Storage | undefined

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0]
    adminAuth = getAuth(app)
    adminDb = getFirestore(app)
    adminStorage = getStorage(app)
    return { app, adminAuth, adminDb, adminStorage }
  }

  try {
    // Initialize with service account credentials
    // You can either use environment variables or a service account JSON file
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: 'bibiginlacorte',
      storageBucket: 'bibiginlacorte.firebasestorage.app'
    })

    adminAuth = getAuth(app)
    adminDb = getFirestore(app)
    adminStorage = getStorage(app)

    console.log('✅ Firebase Admin SDK initialized successfully')

    return { app, adminAuth, adminDb, adminStorage }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error)
    throw error
  }
}

// Initialize on module load
if (typeof window === 'undefined') {
  // Only initialize on server-side
  initializeFirebaseAdmin()
}

// Export instances
export { adminAuth, adminDb, adminStorage }

// Helper function to ensure initialization
export function getAdminAuth(): Auth {
  if (!adminAuth) {
    const initialized = initializeFirebaseAdmin()
    return initialized.adminAuth!
  }
  return adminAuth
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    const initialized = initializeFirebaseAdmin()
    return initialized.adminDb!
  }
  return adminDb
}

export function getAdminStorage(): Storage {
  if (!adminStorage) {
    const initialized = initializeFirebaseAdmin()
    return initialized.adminStorage!
  }
  return adminStorage
}
