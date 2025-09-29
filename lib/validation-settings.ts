import { z } from 'zod'

// Store Settings Schema
export const storeSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Nome del negozio obbligatorio")
    .max(100, "Nome troppo lungo"),
  
  description: z
    .string()
    .min(10, "Descrizione deve essere di almeno 10 caratteri")
    .max(500, "Descrizione troppo lunga"),
  
  email: z
    .string()
    .email("Email non valida")
    .max(100, "Email troppo lunga"),
  
  phone: z
    .string()
    .min(1, "Telefono obbligatorio")
    .regex(
      /^[\+]?[\d\s\-\(\)]{8,20}$/,
      "Formato telefono non valido (es. +39 02 1234 5678)"
    ),
  
  address: z
    .string()
    .min(5, "Indirizzo deve essere di almeno 5 caratteri")
    .max(200, "Indirizzo troppo lungo"),
  
  city: z
    .string()
    .min(1, "Città obbligatoria")
    .max(100, "Nome città troppo lungo"),
  
  country: z
    .string()
    .min(1, "Paese obbligatorio")
    .max(100, "Nome paese troppo lungo"),
  
  currency: z
    .string()
    .length(3, "Codice valuta deve essere di 3 caratteri (es. EUR, USD)")
    .regex(/^[A-Z]{3}$/, "Codice valuta deve essere in maiuscolo (es. EUR)"),
  
  timezone: z
    .string()
    .min(1, "Fuso orario obbligatorio")
    .regex(
      /^[A-Z][a-z]+\/[A-Z][a-z_]+$/,
      "Formato fuso orario non valido (es. Europe/Rome)"
    )
})

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  emailOrderReceived: z.boolean(),
  emailLowStock: z.boolean(),
  emailNewCustomer: z.boolean(),
  emailWeeklyReport: z.boolean(),
  pushNotifications: z.boolean()
})

// Complete Settings Schema
export const settingsSchema = z.object({
  storeSettings: storeSettingsSchema,
  notificationSettings: notificationSettingsSchema
})

// Form Data Types (inferred from schemas)
export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>

// Validation functions
export function validateStoreSettings(data: unknown): StoreSettingsFormData {
  return storeSettingsSchema.parse(data)
}

export function validateNotificationSettings(data: unknown): NotificationSettingsFormData {
  return notificationSettingsSchema.parse(data)
}

export function validateAllSettings(data: unknown): SettingsFormData {
  return settingsSchema.parse(data)
}

// Safe validation functions (returns success/error instead of throwing)
export function safeValidateStoreSettings(data: unknown) {
  return storeSettingsSchema.safeParse(data)
}

export function safeValidateNotificationSettings(data: unknown) {
  return notificationSettingsSchema.safeParse(data)
}

export function safeValidateAllSettings(data: unknown) {
  return settingsSchema.safeParse(data)
}

// Helper functions for form validation
export function getStoreSettingsErrors(data: unknown) {
  const result = safeValidateStoreSettings(data)
  if (!result.success) {
    return result.error.flatten().fieldErrors
  }
  return null
}

export function getNotificationSettingsErrors(data: unknown) {
  const result = safeValidateNotificationSettings(data)
  if (!result.success) {
    return result.error.flatten().fieldErrors
  }
  return null
}

// Predefined values for validation
export const SUPPORTED_CURRENCIES = [
  'EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY'
] as const

export const SUPPORTED_TIMEZONES = [
  'Europe/Rome',
  'Europe/London', 
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Australia/Sydney'
] as const

export const SUPPORTED_COUNTRIES = [
  'Italia',
  'Francia', 
  'Germania',
  'Regno Unito',
  'Spagna',
  'Stati Uniti',
  'Canada',
  'Australia'
] as const

// Enhanced schemas with predefined values
export const enhancedStoreSettingsSchema = storeSettingsSchema.extend({
  currency: z.enum(SUPPORTED_CURRENCIES, {
    message: `Valuta deve essere una tra: ${SUPPORTED_CURRENCIES.join(', ')}`
  }),
  timezone: z.enum(SUPPORTED_TIMEZONES, {
    message: `Fuso orario deve essere uno tra: ${SUPPORTED_TIMEZONES.join(', ')}`
  }),
  country: z.enum(SUPPORTED_COUNTRIES, {
    message: `Paese deve essere uno tra: ${SUPPORTED_COUNTRIES.join(', ')}`
  })
})

export type EnhancedStoreSettingsFormData = z.infer<typeof enhancedStoreSettingsSchema>