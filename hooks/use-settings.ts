import { useState, useEffect, useCallback } from 'react'
import { 
  getSettings, 
  updateStoreSettings, 
  updateNotificationSettings,
  updateAllSettings,
  subscribeToSettings,
  resetSettingsToDefaults,
  StoreSettings,
  NotificationSettings,
  SettingsDocument
} from '@/lib/settings'
import { 
  validateStoreSettings, 
  validateNotificationSettings,
  safeValidateStoreSettings,
  safeValidateNotificationSettings
} from '@/lib/validation-settings'

interface UseSettingsState {
  // Data
  storeSettings: StoreSettings | null
  notificationSettings: NotificationSettings | null
  
  // Loading states
  loading: boolean
  saving: boolean
  
  // Error states
  error: string | null
  validationErrors: {
    store?: Record<string, string[]>
    notifications?: Record<string, string[]>
  }
  
  // Last update timestamp
  lastUpdated: Date | null
}

interface UseSettingsActions {
  // Load data
  loadSettings: () => Promise<void>
  
  // Save individual sections
  saveStoreSettings: (settings: StoreSettings) => Promise<boolean>
  saveNotificationSettings: (settings: NotificationSettings) => Promise<boolean>
  
  // Save all settings at once
  saveAllSettings: (store: StoreSettings, notifications: NotificationSettings) => Promise<boolean>
  
  // Reset to defaults
  resetToDefaults: () => Promise<boolean>
  
  // Clear errors
  clearError: () => void
  clearValidationErrors: () => void
  
  // Validate without saving
  validateStore: (settings: StoreSettings) => boolean
  validateNotifications: (settings: NotificationSettings) => boolean
}

type UseSettingsReturn = UseSettingsState & UseSettingsActions

export function useSettings(): UseSettingsReturn {
  const [state, setState] = useState<UseSettingsState>({
    storeSettings: null,
    notificationSettings: null,
    loading: true,
    saving: false,
    error: null,
    validationErrors: {},
    lastUpdated: null
  })

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Clear validation errors function
  const clearValidationErrors = useCallback(() => {
    setState(prev => ({ ...prev, validationErrors: {} }))
  }, [])

  // Update state helper
  const updateState = useCallback((updates: Partial<UseSettingsState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Load settings from Firebase
  const loadSettings = useCallback(async () => {
    try {
      updateState({ loading: true, error: null })
      
      const settings = await getSettings()
      
      updateState({
        storeSettings: settings.storeSettings,
        notificationSettings: settings.notificationSettings,
        lastUpdated: settings.updatedAt && 'seconds' in settings.updatedAt 
          ? new Date(settings.updatedAt.seconds * 1000) 
          : new Date(),
        loading: false
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento delle impostazioni'
      updateState({ 
        error: errorMessage, 
        loading: false 
      })
    }
  }, [updateState])

  // Validate store settings
  const validateStore = useCallback((settings: StoreSettings): boolean => {
    const result = safeValidateStoreSettings(settings)
    
    if (!result.success) {
      updateState({
        validationErrors: {
          ...state.validationErrors,
          store: result.error.flatten().fieldErrors
        }
      })
      return false
    }
    
    // Clear store validation errors if valid
    updateState({
      validationErrors: {
        ...state.validationErrors,
        store: undefined
      }
    })
    return true
  }, [state.validationErrors, updateState])

  // Validate notification settings  
  const validateNotifications = useCallback((settings: NotificationSettings): boolean => {
    const result = safeValidateNotificationSettings(settings)
    
    if (!result.success) {
      updateState({
        validationErrors: {
          ...state.validationErrors,
          notifications: result.error.flatten().fieldErrors
        }
      })
      return false
    }
    
    // Clear notifications validation errors if valid
    updateState({
      validationErrors: {
        ...state.validationErrors,
        notifications: undefined
      }
    })
    return true
  }, [state.validationErrors, updateState])

  // Save store settings
  const saveStoreSettings = useCallback(async (settings: StoreSettings): Promise<boolean> => {
    try {
      // Validate first
      if (!validateStore(settings)) {
        return false
      }

      updateState({ saving: true, error: null })
      
      const validatedSettings = validateStoreSettings(settings)
      await updateStoreSettings(validatedSettings)
      
      updateState({ 
        storeSettings: validatedSettings,
        saving: false,
        lastUpdated: new Date()
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel salvataggio delle impostazioni del negozio'
      updateState({ 
        error: errorMessage, 
        saving: false 
      })
      return false
    }
  }, [validateStore, updateState])

  // Save notification settings
  const saveNotificationSettings = useCallback(async (settings: NotificationSettings): Promise<boolean> => {
    try {
      // Validate first
      if (!validateNotifications(settings)) {
        return false
      }

      updateState({ saving: true, error: null })
      
      const validatedSettings = validateNotificationSettings(settings)
      await updateNotificationSettings(validatedSettings)
      
      updateState({ 
        notificationSettings: validatedSettings,
        saving: false,
        lastUpdated: new Date()
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel salvataggio delle impostazioni di notifica'
      updateState({ 
        error: errorMessage, 
        saving: false 
      })
      return false
    }
  }, [validateNotifications, updateState])

  // Save all settings
  const saveAllSettings = useCallback(async (
    storeSettings: StoreSettings, 
    notificationSettings: NotificationSettings
  ): Promise<boolean> => {
    try {
      // Validate both
      const storeValid = validateStore(storeSettings)
      const notificationsValid = validateNotifications(notificationSettings)
      
      if (!storeValid || !notificationsValid) {
        return false
      }

      updateState({ saving: true, error: null })
      
      const validatedStore = validateStoreSettings(storeSettings)
      const validatedNotifications = validateNotificationSettings(notificationSettings)
      
      await updateAllSettings(validatedStore, validatedNotifications)
      
      updateState({ 
        storeSettings: validatedStore,
        notificationSettings: validatedNotifications,
        saving: false,
        lastUpdated: new Date()
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel salvataggio delle impostazioni'
      updateState({ 
        error: errorMessage, 
        saving: false 
      })
      return false
    }
  }, [validateStore, validateNotifications, updateState])

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    try {
      updateState({ saving: true, error: null })
      
      await resetSettingsToDefaults()
      
      // Reload settings after reset
      await loadSettings()
      
      updateState({ saving: false })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel ripristino delle impostazioni'
      updateState({ 
        error: errorMessage, 
        saving: false 
      })
      return false
    }
  }, [loadSettings, updateState])

  // Setup real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToSettings((settings: SettingsDocument | null) => {
      if (settings) {
        updateState({
          storeSettings: settings.storeSettings,
          notificationSettings: settings.notificationSettings,
          lastUpdated: settings.updatedAt && 'seconds' in settings.updatedAt 
            ? new Date(settings.updatedAt.seconds * 1000) 
            : new Date(),
          loading: false,
          error: null
        })
      } else {
        updateState({
          error: 'Errore nella connessione alle impostazioni',
          loading: false
        })
      }
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [updateState])

  return {
    // State
    ...state,
    
    // Actions
    loadSettings,
    saveStoreSettings,
    saveNotificationSettings,
    saveAllSettings,
    resetToDefaults,
    clearError,
    clearValidationErrors,
    validateStore,
    validateNotifications
  }
}