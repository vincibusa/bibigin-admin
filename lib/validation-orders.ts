import { z } from 'zod'

// Address schema for shipping and billing
const addressSchema = z.object({
  street: z.string().min(1, "Indirizzo obbligatorio"),
  city: z.string().min(1, "Città obbligatoria"),
  state: z.string().min(1, "Provincia obbligatoria"),
  postalCode: z.string().min(5, "CAP deve essere di almeno 5 caratteri"),
  country: z.string().min(1, "Paese obbligatorio")
})

// Order item schema
const orderItemSchema = z.object({
  productId: z.string().min(1, "ID prodotto obbligatorio"),
  productName: z.string().min(1, "Nome prodotto obbligatorio"),
  quantity: z.number().int().min(1, "Quantità minima 1"),
  price: z.number().min(0, "Prezzo non può essere negativo"),
  total: z.number().min(0, "Totale non può essere negativo")
})

// Main order schema
export const orderSchema = z.object({
  customerId: z.string().min(1, "ID cliente obbligatorio"),
  customerEmail: z.string().email("Email non valida"),
  items: z.array(orderItemSchema).min(1, "Almeno un prodotto richiesto"),
  subtotal: z.number().min(0, "Subtotale non può essere negativo").optional(),
  shippingCost: z.number().min(0, "Costo spedizione non può essere negativo").optional(),
  shipping_cost: z.number().min(0, "Costo spedizione non può essere negativo").optional(), // For backwards compatibility
  total: z.number().min(0, "Totale non può essere negativo"),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: "Stato ordine non valido"
  }),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded'], {
    message: "Stato pagamento non valido"
  }),
  shippingAddress: addressSchema,
  billingAddress: addressSchema
})

// Filter schema for orders
export const orderFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('all'),
  paymentStatus: z.enum(['all', 'pending', 'paid', 'failed', 'refunded']).default('all'),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minTotal: z.number().min(0).optional(),
  maxTotal: z.number().min(0).optional()
})

// Quick create order schema (simplified for admin)
export const quickOrderSchema = z.object({
  customerEmail: z.string().email("Email non valida"),
  customerName: z.string().min(1, "Nome cliente obbligatorio"),
  products: z.array(z.object({
    productId: z.string().min(1, "Seleziona un prodotto"),
    quantity: z.number().int().min(1, "Quantità minima 1")
  })).min(1, "Almeno un prodotto richiesto"),
  shippingAddress: addressSchema,
  notes: z.string().optional()
})

export type OrderFormData = z.infer<typeof orderSchema>
export type OrderFilter = z.infer<typeof orderFilterSchema>
export type QuickOrderData = z.infer<typeof quickOrderSchema>
export type AddressData = z.infer<typeof addressSchema>
export type OrderItemData = z.infer<typeof orderItemSchema>

// Order statuses for UI
export const orderStatuses = [
  { value: 'pending', label: 'In Attesa', color: 'secondary' },
  { value: 'processing', label: 'In Elaborazione', color: 'default' },
  { value: 'shipped', label: 'Spedito', color: 'default' },
  { value: 'delivered', label: 'Consegnato', color: 'success' },
  { value: 'cancelled', label: 'Annullato', color: 'destructive' }
] as const

export const paymentStatuses = [
  { value: 'pending', label: 'In Attesa', color: 'secondary' },
  { value: 'paid', label: 'Pagato', color: 'success' },
  { value: 'failed', label: 'Fallito', color: 'destructive' },
  { value: 'refunded', label: 'Rimborsato', color: 'secondary' }
] as const

// Helper functions for calculations
export function calculateOrderTotal(items: OrderItemData[]): number {
  return items.reduce((total, item) => total + item.total, 0)
}

export function calculateItemTotal(price: number, quantity: number): number {
  return price * quantity
}