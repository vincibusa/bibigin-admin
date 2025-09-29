import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Order number formatting
export function formatOrderNumber(orderId: string): string {
  return `#${orderId.substring(0, 8).toUpperCase()}`
}

// Status color helpers
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    case 'processing':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 'shipped':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
    case 'delivered':
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-100'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
    case 'paid':
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'failed':
      return 'bg-red-100 text-red-800 hover:bg-red-100'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}
