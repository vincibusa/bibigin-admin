import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp,
  FieldValue
} from 'firebase/firestore'
import { db } from './firebase'

// Constants
const SETTINGS_COLLECTION = 'settings'
const STORE_CONFIG_DOC = 'store_config'

// Types
export interface StoreSettings {
  name: string
  description: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  currency: string
  timezone: string
}

export interface NotificationSettings {
  emailOrderReceived: boolean
  emailLowStock: boolean
  emailNewCustomer: boolean
  emailWeeklyReport: boolean
  pushNotifications: boolean
}

export interface SettingsDocument {
  storeSettings: StoreSettings
  notificationSettings: NotificationSettings
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

// Default settings
const defaultStoreSettings: StoreSettings = {
  name: 'BibiGin Premium Store',
  description: 'Negozio premium di gin artigianali e bevande spiritose di alta qualità',
  email: 'info@bibigin.com',
  phone: '+39 02 1234 5678',
  address: 'Via Roma 123',
  city: 'Milano',
  country: 'Italia',
  currency: 'EUR',
  timezone: 'Europe/Rome'
}

const defaultNotificationSettings: NotificationSettings = {
  emailOrderReceived: true,
  emailLowStock: true,
  emailNewCustomer: false,
  emailWeeklyReport: true,
  pushNotifications: true
}

// Get settings document reference
const getSettingsDocRef = () => {
  return doc(db, SETTINGS_COLLECTION, STORE_CONFIG_DOC)
}

/**
 * Get current settings from Firestore
 * Creates document with defaults if it doesn't exist
 */
export async function getSettings(): Promise<SettingsDocument> {
  try {
    const docRef = getSettingsDocRef()
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as SettingsDocument
    } else {
      // Create document with defaults if it doesn't exist
      const defaultSettings: SettingsDocument = {
        storeSettings: defaultStoreSettings,
        notificationSettings: defaultNotificationSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(docRef, defaultSettings)
      return defaultSettings
    }
  } catch (error) {
    console.error('Error getting settings:', error)
    throw new Error('Errore nel caricamento delle impostazioni')
  }
}

/**
 * Update store settings in Firestore
 */
export async function updateStoreSettings(storeSettings: StoreSettings): Promise<void> {
  try {
    const docRef = getSettingsDocRef()
    
    // Check if document exists, create if not
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        storeSettings,
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new document with store settings and default notifications
      const newSettings: SettingsDocument = {
        storeSettings,
        notificationSettings: defaultNotificationSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(docRef, newSettings)
    }
  } catch (error) {
    console.error('Error updating store settings:', error)
    throw new Error('Errore nel salvataggio delle impostazioni del negozio')
  }
}

/**
 * Update notification settings in Firestore
 */
export async function updateNotificationSettings(notificationSettings: NotificationSettings): Promise<void> {
  try {
    const docRef = getSettingsDocRef()
    
    // Check if document exists, create if not
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        notificationSettings,
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new document with notification settings and default store settings
      const newSettings: SettingsDocument = {
        storeSettings: defaultStoreSettings,
        notificationSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(docRef, newSettings)
    }
  } catch (error) {
    console.error('Error updating notification settings:', error)
    throw new Error('Errore nel salvataggio delle impostazioni di notifica')
  }
}

/**
 * Update both store and notification settings atomically
 */
export async function updateAllSettings(
  storeSettings: StoreSettings, 
  notificationSettings: NotificationSettings
): Promise<void> {
  try {
    const docRef = getSettingsDocRef()
    
    // Check if document exists to decide between update or create
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        storeSettings,
        notificationSettings,
        updatedAt: serverTimestamp()
      })
    } else {
      const settings: SettingsDocument = {
        storeSettings,
        notificationSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(docRef, settings)
    }
  } catch (error) {
    console.error('Error updating all settings:', error)
    throw new Error('Errore nel salvataggio delle impostazioni')
  }
}

/**
 * Subscribe to real-time settings updates
 */
export function subscribeToSettings(
  callback: (settings: SettingsDocument | null) => void
): Unsubscribe {
  const docRef = getSettingsDocRef()
  
  return onSnapshot(
    docRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data() as SettingsDocument)
      } else {
        // Document doesn't exist, create it with defaults
        getSettings().then(defaultSettings => {
          callback(defaultSettings)
        }).catch(error => {
          console.error('Error creating default settings:', error)
          callback(null)
        })
      }
    },
    (error) => {
      console.error('Error subscribing to settings:', error)
      callback(null)
    }
  )
}

/**
 * Reset settings to defaults
 */
export async function resetSettingsToDefaults(): Promise<void> {
  try {
    const docRef = getSettingsDocRef()
    
    const defaultSettings: SettingsDocument = {
      storeSettings: defaultStoreSettings,
      notificationSettings: defaultNotificationSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(docRef, defaultSettings)
  } catch (error) {
    console.error('Error resetting settings:', error)
    throw new Error('Errore nel ripristino delle impostazioni predefinite')
  }
}