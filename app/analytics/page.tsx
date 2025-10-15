'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from "@/components/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { KPICards, DetailedKPICards } from "@/components/analytics/KPICards"
import { RevenueChart, OrdersChart } from "@/components/analytics/RevenueChart"
import { TopProductsCard } from "@/components/analytics/TopProductsCard"
import { 
  getAnalyticsDashboard, 
  getDateRanges, 
  AnalyticsDashboard,
  AnalyticsDateRange 
} from "@/lib/analytics"
import { formatCurrency } from "@/lib/analytics"
import { Order } from "@/lib/types"
import { 
  CalendarIcon, 
  TrendingUp, 
  ShoppingCart,
  RefreshCw,
  Download
} from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

type DateRangePreset = 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'custom'

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<DateRangePreset>('last30Days')
  const [customDateRange, setCustomDateRange] = useState<AnalyticsDateRange | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get current date range based on selection
  const getCurrentDateRange = useCallback((): AnalyticsDateRange => {
    if (selectedRange === 'custom' && customDateRange) {
      return customDateRange
    }
    // Get date ranges only when needed
    const dateRanges = getDateRanges()
    const validRanges = {
      last7Days: dateRanges.last7Days,
      last30Days: dateRanges.last30Days,
      thisMonth: dateRanges.thisMonth,
      lastMonth: dateRanges.lastMonth
    }
    return validRanges[selectedRange as keyof typeof validRanges] || dateRanges.last30Days
  }, [selectedRange, customDateRange])

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const dateRange = getCurrentDateRange()
      const data = await getAnalyticsDashboard(dateRange)
      setAnalyticsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati analytics')
    } finally {
      setLoading(false)
    }
  }, [getCurrentDateRange])

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadAnalytics()
    setIsRefreshing(false)
  }

  // Handle date range change
  const handleDateRangeChange = (newRange: DateRangePreset) => {
    setSelectedRange(newRange)
    if (newRange !== 'custom') {
      setCustomDateRange(null)
    }
  }

  // Handle custom date selection
  const handleCustomDateChange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      setCustomDateRange({ from, to })
      setSelectedRange('custom')
    }
  }

  // Load data on mount and when date range changes
  useEffect(() => {
    loadAnalytics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange, customDateRange])

  // Get range label for display
  const getRangeLabel = () => {
    switch (selectedRange) {
      case 'last7Days': return 'Ultimi 7 giorni'
      case 'last30Days': return 'Ultimi 30 giorni'
      case 'thisMonth': return 'Questo mese'
      case 'lastMonth': return 'Mese scorso'
      case 'custom': 
        if (customDateRange) {
          return `${format(customDateRange.from, 'dd MMM', { locale: it })} - ${format(customDateRange.to, 'dd MMM yyyy', { locale: it })}`
        }
        return 'Periodo personalizzato'
      default: return 'Ultimi 30 giorni'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground">
              Analytics BibiGin
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Dashboard analytics e insights del negozio
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 sm:h-9 text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Aggiorna</span>
            </Button>
            <Button variant="outline" className="h-10 sm:h-9 text-sm">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Esporta</span>
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-card-foreground text-base sm:text-lg">Periodo di Analisi</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 sm:items-center">
              <Select value={selectedRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-full sm:w-56 h-10 sm:h-9 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7Days">Ultimi 7 giorni</SelectItem>
                  <SelectItem value="last30Days">Ultimi 30 giorni</SelectItem>
                  <SelectItem value="thisMonth">Questo mese</SelectItem>
                  <SelectItem value="lastMonth">Mese scorso</SelectItem>
                  <SelectItem value="custom">Periodo personalizzato</SelectItem>
                </SelectContent>
              </Select>

              {selectedRange === 'custom' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal h-10 sm:h-9 text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange ? (
                        `${format(customDateRange.from, 'dd MMM yyyy')} - ${format(customDateRange.to, 'dd MMM yyyy')}`
                      ) : (
                        'Seleziona periodo'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      numberOfMonths={1}
                      selected={{
                        from: customDateRange?.from,
                        to: customDateRange?.to
                      }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          handleCustomDateChange(range.from, range.to)
                        }
                      }}
                      className="sm:hidden"
                    />
                    <Calendar
                      mode="range"
                      numberOfMonths={2}
                      selected={{
                        from: customDateRange?.from,
                        to: customDateRange?.to
                      }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          handleCustomDateChange(range.from, range.to)
                        }
                      }}
                      className="hidden sm:block"
                    />
                  </PopoverContent>
                </Popover>
              )}

              <div className="text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">Periodo selezionato: </span>
                <span className="font-medium">{getRangeLabel()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <div className="text-destructive text-center">
                <h3 className="font-semibold mb-2">Errore nel caricamento</h3>
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  onClick={loadAnalytics}
                  className="mt-4"
                >
                  Riprova
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        {analyticsData && (
          <KPICards
            salesMetrics={analyticsData.salesMetrics}
            customerMetrics={analyticsData.customerMetrics}
            loading={loading}
            comparison={analyticsData.performanceComparison ? {
              current: analyticsData.performanceComparison.currentPeriod,
              previous: analyticsData.performanceComparison.previousPeriod
            } : undefined}
          />
        )}

        {/* Charts Section */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <RevenueChart 
            data={analyticsData?.revenueChart || []} 
            loading={loading}
            chartType="line"
          />
          <OrdersChart 
            data={analyticsData?.revenueChart || []} 
            loading={loading}
          />
        </div>

        {/* Top Products and Recent Orders */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <TopProductsCard 
            products={analyticsData?.topProducts || []} 
            loading={loading}
          />
          
          {/* Recent Orders Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-card-foreground flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                Ordini Recenti
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div>
                          <div className="w-20 h-4 bg-muted rounded"></div>
                          <div className="w-16 h-3 bg-muted rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="w-16 h-4 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : analyticsData?.recentOrders && analyticsData.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.recentOrders.map((order: Order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold text-xs">
                          #{order.id.slice(-4)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-card-foreground truncate">
                            {order.customerEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(order.createdAt, 'dd MMM HH:mm', { locale: it })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-card-foreground">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">Nessun ordine nel periodo selezionato</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        {analyticsData && (
          <DetailedKPICards
            salesMetrics={analyticsData.salesMetrics}
            customerMetrics={analyticsData.customerMetrics}
            loading={loading}
          />
        )}

        {/* Performance Summary */}
        {analyticsData && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-card-foreground flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Riepilogo Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                    {formatCurrency(analyticsData.salesMetrics.totalRevenue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fatturato Totale
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getRangeLabel()}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                    {analyticsData.salesMetrics.totalOrders}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ordini Completati
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Media: {(analyticsData.salesMetrics.totalOrders / 30).toFixed(1)}/giorno
                  </div>
                </div>
                
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                    {analyticsData.customerMetrics.newCustomers + analyticsData.customerMetrics.returningCustomers}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Clienti Attivi
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {analyticsData.customerMetrics.newCustomers} nuovi
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}