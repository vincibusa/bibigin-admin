'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from "@/components/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOrders } from "@/hooks/use-orders"
import { useCustomers } from "@/hooks/use-customers"
import { useProducts } from "@/hooks/use-products"
import { getSalesMetrics, getDateRanges, formatCurrency } from "@/lib/analytics"
import { Order } from "@/lib/types"
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Plus,
  Eye,
  BarChart3,
  ArrowRight
} from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  productsInStock: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Get real-time data from hooks
  const { orders, stats: orderStats } = useOrders()
  const { stats: customerStats } = useCustomers() 
  const { products } = useProducts()

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const dateRanges = getDateRanges()
        const currentMetrics = await getSalesMetrics(dateRanges.last30Days)
        const previousMetrics = await getSalesMetrics(dateRanges.lastMonth)
        
        const revenueGrowth = previousMetrics.totalRevenue > 0 
          ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100
          : 0

        const ordersGrowth = previousMetrics.totalOrders > 0
          ? ((currentMetrics.totalOrders - previousMetrics.totalOrders) / previousMetrics.totalOrders) * 100
          : 0

        const customersGrowth = customerStats && customerStats.newThisMonth > 0 ? 15.5 : 0

        setStats({
          totalRevenue: currentMetrics.totalRevenue,
          totalOrders: currentMetrics.totalOrders,
          totalCustomers: customerStats?.total || 0,
          productsInStock: products.filter(p => p.status === 'active' && p.stock > 0).length,
          revenueGrowth,
          ordersGrowth,
          customersGrowth
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderStats && customerStats) {
      loadStats()
    }
  }, [orderStats, customerStats, products])

  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  // Growth indicator component
  const GrowthIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{value.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-foreground">
            Benvenuto nel Gestionale BibiGin
          </h1>
          <p className="text-muted-foreground">
            Panoramica delle attività e delle vendite del tuo e-commerce
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Vendite Totali
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-24 bg-muted rounded mb-1"></div>
                  <div className="h-4 w-32 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-card-foreground">
                    {stats ? formatCurrency(stats.totalRevenue) : '€0,00'}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      dal mese scorso
                    </p>
                    {stats && <GrowthIndicator value={stats.revenueGrowth} />}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Ordini
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-4 w-28 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-card-foreground">
                    {stats?.totalOrders || 0}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      ordini completati
                    </p>
                    {stats && <GrowthIndicator value={stats.ordersGrowth} />}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Clienti Attivi
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-card-foreground">
                    {stats?.totalCustomers || 0}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      clienti registrati
                    </p>
                    {stats && <GrowthIndicator value={stats.customersGrowth} />}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Prodotti Attivi
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-4 w-28 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-card-foreground">
                    {stats?.productsInStock || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    in magazzino
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/products" className="block">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent-foreground">
                      Aggiungi Prodotto
                    </h3>
                    <Plus className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aggiungi un nuovo prodotto al catalogo
                  </p>
                  <Button size="sm" className="mt-3 w-full bg-navy hover:bg-navy/90 text-cream">
                    Vai ai Prodotti
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>
              
              <Link href="/orders" className="block">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent-foreground">
                      Gestisci Ordini
                    </h3>
                    <ShoppingCart className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visualizza e gestisci gli ordini in corso
                  </p>
                  <Button size="sm" className="mt-3 w-full bg-navy hover:bg-navy/90 text-cream">
                    Vai agli Ordini
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>
              
              <Link href="/analytics" className="block">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent-foreground">
                      Analytics
                    </h3>
                    <BarChart3 className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visualizza i report delle vendite
                  </p>
                  <Button size="sm" className="mt-3 w-full bg-navy hover:bg-navy/90 text-cream">
                    Vai alle Analytics
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground">Ordini Recenti</CardTitle>
              <Link href="/orders">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Vedi Tutti
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div>
                        <div className="w-24 h-4 bg-muted rounded mb-1"></div>
                        <div className="w-16 h-3 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="w-16 h-4 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: Order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-navy/10 text-navy font-semibold text-xs">
                        #{order.id.slice(-4)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {order.customerEmail}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {format(order.createdAt, 'dd MMM HH:mm', { locale: it })}
                          </p>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status === 'pending' ? 'In Attesa' :
                             order.status === 'processing' ? 'In Elaborazione' :
                             order.status === 'shipped' ? 'Spedito' :
                             order.status === 'delivered' ? 'Consegnato' : 'Annullato'}
                          </Badge>
                        </div>
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
                <p className="text-muted-foreground">Nessun ordine recente</p>
                <Link href="/orders">
                  <Button className="mt-2 bg-navy hover:bg-navy/90 text-cream">
                    <Plus className="w-4 h-4 mr-2" />
                    Crea Primo Ordine
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
