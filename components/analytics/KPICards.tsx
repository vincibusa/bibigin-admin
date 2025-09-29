'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SalesMetrics, CustomerMetrics, formatCurrency, formatPercentage } from '@/lib/analytics'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface KPICardsProps {
  salesMetrics: SalesMetrics
  customerMetrics: CustomerMetrics
  loading?: boolean
  comparison?: {
    current: SalesMetrics
    previous: SalesMetrics
  }
}

export function KPICards({ salesMetrics, customerMetrics, loading = false, comparison }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="w-24 h-4 bg-muted rounded animate-pulse"></div>
              </CardTitle>
              <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="w-20 h-8 bg-muted rounded animate-pulse mb-2"></div>
              <div className="w-32 h-3 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate growth indicators
  const revenueGrowth = comparison 
    ? ((salesMetrics.totalRevenue - comparison.previous.totalRevenue) / comparison.previous.totalRevenue) * 100
    : salesMetrics.growthRate

  const ordersGrowth = comparison
    ? ((salesMetrics.totalOrders - comparison.previous.totalOrders) / comparison.previous.totalOrders) * 100
    : 0

  const GrowthIndicator = ({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) => {
    const isPositive = value >= 0
    const IconComponent = isPositive ? ArrowUpRight : ArrowDownRight
    const colorClass = isPositive ? "text-green-600" : "text-red-600"
    const bgClass = isPositive ? "bg-green-100" : "bg-red-100"
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bgClass} ${size === "lg" ? "text-sm" : "text-xs"}`}>
        <IconComponent className={`w-3 h-3 ${colorClass}`} />
        <span className={`font-medium ${colorClass}`}>
          {Math.abs(value).toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Fatturato Totale
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            {formatCurrency(salesMetrics.totalRevenue)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              vs periodo precedente
            </p>
            <GrowthIndicator value={revenueGrowth} />
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Ordini Totali
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            {salesMetrics.totalOrders}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              ordini completati
            </p>
            {ordersGrowth !== 0 && (
              <GrowthIndicator value={ordersGrowth} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Valore Medio Ordine
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            {formatCurrency(salesMetrics.averageOrderValue)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              per ordine
            </p>
            <Badge variant="secondary" className="text-xs">
              Target: €50
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Customer Metrics */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Nuovi Clienti
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            {customerMetrics.newCustomers}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {customerMetrics.returningCustomers} ricorrenti
            </p>
            <Badge variant="outline" className="text-xs">
              {formatPercentage(salesMetrics.conversionRate)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Detailed metrics cards for expanded view
interface DetailedKPICardsProps {
  salesMetrics: SalesMetrics
  customerMetrics: CustomerMetrics
  loading?: boolean
}

export function DetailedKPICards({ salesMetrics, customerMetrics, loading = false }: DetailedKPICardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="w-32 h-6 bg-muted rounded"></div>
                <div className="w-24 h-8 bg-muted rounded"></div>
                <div className="w-full h-4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Revenue Breakdown */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Performance Vendite</h3>
              <p className="text-sm text-muted-foreground">Metriche di fatturato</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fatturato:</span>
              <span className="font-medium">{formatCurrency(salesMetrics.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Crescita:</span>
              <span className={`font-medium ${salesMetrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesMetrics.growthRate >= 0 ? '+' : ''}{salesMetrics.growthRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Conversione:</span>
              <span className="font-medium">{formatPercentage(salesMetrics.conversionRate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Insights */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Insights Clienti</h3>
              <p className="text-sm text-muted-foreground">Comportamento acquisti</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nuovi:</span>
              <span className="font-medium">{customerMetrics.newCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ricorrenti:</span>
              <span className="font-medium">{customerMetrics.returningCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valore vita:</span>
              <span className="font-medium">{formatCurrency(customerMetrics.customerLifetimeValue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Analytics */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Analisi Ordini</h3>
              <p className="text-sm text-muted-foreground">Metriche transazioni</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Totale ordini:</span>
              <span className="font-medium">{salesMetrics.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valore medio:</span>
              <span className="font-medium">{formatCurrency(salesMetrics.averageOrderValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">AOV clienti:</span>
              <span className="font-medium">{formatCurrency(customerMetrics.averageOrderValue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}