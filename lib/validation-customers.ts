import { z } from 'zod'

// Address schema (riutilizziamo quello degli ordini)
const addressSchema = z.object({
  street: z.string().min(1, "Indirizzo obbligatorio"),
  city: z.string().min(1, "Città obbligatoria"),
  state: z.string().min(1, "Provincia obbligatoria"),
  postalCode: z.string().min(5, "CAP deve essere di almeno 5 caratteri"),
  country: z.string().min(1, "Paese obbligatorio")
})

// Main customer schema
export const customerSchema = z.object({
  email: z.string().email("Email non valida"),
  firstName: z.string().min(1, "Nome obbligatorio"),
  lastName: z.string().min(1, "Cognome obbligatorio"),
  phone: z.string().optional(),
  defaultAddress: addressSchema.optional(),
  notes: z.string().optional()
})

// Filter schema for customers
export const customerFilterSchema = z.object({
  search: z.string().optional(),
  hasOrders: z.enum(['all', 'yes', 'no']).default('all'),
  registrationDateFrom: z.date().optional(),
  registrationDateTo: z.date().optional(),
  minSpent: z.number().min(0).optional(),
  maxSpent: z.number().min(0).optional(),
  lastOrderFrom: z.date().optional(),
  lastOrderTo: z.date().optional()
})

// Quick create customer schema (simplified for admin)
export const quickCustomerSchema = z.object({
  email: z.string().email("Email non valida"),
  firstName: z.string().min(1, "Nome obbligatorio"),
  lastName: z.string().min(1, "Cognome obbligatorio"),
  phone: z.string().optional(),
  address: addressSchema.optional(),
  notes: z.string().optional()
})

export type CustomerFormData = z.infer<typeof customerSchema>
export type CustomerFilter = z.infer<typeof customerFilterSchema>
export type QuickCustomerData = z.infer<typeof quickCustomerSchema>
export type AddressData = z.infer<typeof addressSchema>

// Customer statuses for UI
export const customerSegments = [
  { value: 'new', label: 'Nuovo Cliente', color: 'blue' },
  { value: 'regular', label: 'Cliente Abituale', color: 'green' },
  { value: 'vip', label: 'Cliente VIP', color: 'gold' },
  { value: 'inactive', label: 'Inattivo', color: 'gray' }
] as const

// Helper functions for calculations
export function calculateCustomerSegment(totalSpent: number, ordersCount: number): string {
  if (ordersCount === 0) return 'new'
  if (totalSpent >= 500 || ordersCount >= 10) return 'vip'
  if (ordersCount >= 3) return 'regular'
  return 'new'
}

export function formatCustomerName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

export function calculateCustomerLifetimeValue(totalSpent: number, ordersCount: number): number {
  if (ordersCount === 0) return 0
  return totalSpent / ordersCount // Average order value
}