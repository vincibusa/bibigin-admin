// Shipping cost calculation based on bottle quantity

export interface ShippingCost {
  bottles: number
  cost: number
}

/**
 * Calculate shipping cost based on number of bottles
 * Rules:
 * - Up to 2 bottles: €6
 * - 3 to 6 bottles: €9
 * - 7 to 9 bottles: €12
 * - 10+ bottles: €15 (or custom pricing)
 */
export function calculateShippingCost(bottleQuantity: number): number {
  if (bottleQuantity <= 0) {
    return 0
  }

  if (bottleQuantity <= 2) {
    return 6
  }

  if (bottleQuantity <= 6) {
    return 9
  }

  if (bottleQuantity <= 9) {
    return 12
  }

  // For 10+ bottles, you might want to add custom logic
  return 15
}

/**
 * Get shipping cost breakdown for display
 */
export function getShippingBreakdown(bottleQuantity: number): ShippingCost {
  return {
    bottles: bottleQuantity,
    cost: calculateShippingCost(bottleQuantity)
  }
}

/**
 * Shipping tiers for reference/display
 */
export const SHIPPING_TIERS = [
  { minBottles: 1, maxBottles: 2, cost: 6 },
  { minBottles: 3, maxBottles: 6, cost: 9 },
  { minBottles: 7, maxBottles: 9, cost: 12 },
  { minBottles: 10, maxBottles: Infinity, cost: 15 }
] as const
