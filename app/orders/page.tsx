'use client'

import { useState } from 'react'
import { AdminLayout } from "@/components/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useOrders } from "@/hooks/use-orders"
import { useProducts } from "@/hooks/use-products"
import { QuickOrderForm } from "@/components/orders/QuickOrderForm"
import { 
  DeleteOrderDialog, 
  BulkDeleteOrdersDialog, 
  UpdateStatusDialog 
} from "@/components/orders/OrderActionDialogs"
import { OrderViewDialog } from "@/components/orders/OrderViewDialog"
import { QuickOrderData } from "@/lib/validation-orders"
import { Order } from "@/lib/types"
import { 
  Search, 
  Plus, 
  Trash2, 
  MoreHorizontal, 
  Loader2, 
  Package,
  Eye,
  RefreshCw
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function OrdersPage() {
  const { toast } = useToast()
  const {
    orders,
    loading,
    error,
    stats,
    filters,
    selectedOrders,
    setFilters,
    selectOrder,
    selectAllOrders,
    clearSelection,
    createQuickNewOrder,
    updateOrderStatusById,
    deleteExistingOrder,
    bulkUpdateStatus,
    bulkDelete
  } = useOrders()

  const { products } = useProducts()

  // Form states
  const [showQuickOrderForm, setShowQuickOrderForm] = useState(false)

  // Action states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [updateStatusType, setUpdateStatusType] = useState<'single' | 'bulk'>('single')
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Handle create quick order
  const handleCreateQuickOrder = () => {
    setShowQuickOrderForm(true)
  }

  // Handle delete order
  const handleDeleteOrder = (order: Order) => {
    setDeletingOrder(order)
    setShowDeleteDialog(true)
  }

  // Handle update status
  const handleUpdateStatus = (order: Order) => {
    setDeletingOrder(order)
    setUpdateStatusType('single')
    setShowUpdateStatusDialog(true)
  }

  // Handle bulk update status
  const handleBulkUpdateStatus = () => {
    setUpdateStatusType('bulk')
    setShowUpdateStatusDialog(true)
  }

  // Handle view order
  const handleViewOrder = (order: Order) => {
    setViewingOrder(order)
    setShowViewDialog(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: QuickOrderData) => {
    try {
      await createQuickNewOrder(data)
      toast({
        title: "Ordine creato",
        description: "Il nuovo ordine è stato aggiunto con successo."
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Si è verificato un errore",
        variant: "destructive"
      })
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingOrder) return
    
    try {
      await deleteExistingOrder(deletingOrder.id)
      toast({
        title: "Ordine eliminato",
        description: "L'ordine è stato rimosso dal sistema."
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Si è verificato un errore",
        variant: "destructive"
      })
    }
  }

  // Handle bulk delete
  const handleBulkDeleteConfirm = async () => {
    try {
      await bulkDelete(selectedOrders)
      toast({
        title: "Ordini eliminati",
        description: `${selectedOrders.length} ordini sono stati rimossi dal sistema.`
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Si è verificato un errore",
        variant: "destructive"
      })
    }
  }

  // Handle status update
  const handleStatusUpdateConfirm = async (
    status: Order['status'], 
    paymentStatus?: Order['paymentStatus']
  ) => {
    try {
      if (updateStatusType === 'single' && deletingOrder) {
        await updateOrderStatusById(deletingOrder.id, status, paymentStatus)
        toast({
          title: "Stato aggiornato",
          description: "Lo stato dell'ordine è stato aggiornato con successo."
        })
      } else if (updateStatusType === 'bulk') {
        await bulkUpdateStatus(selectedOrders, status, paymentStatus)
        toast({
          title: "Stati aggiornati",
          description: `${selectedOrders.length} ordini sono stati aggiornati.`
        })
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Si è verificato un errore",
        variant: "destructive"
      })
    }
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters({ ...filters, search: value })
  }

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status as Order['status'] | 'all' })
  }

  // Handle payment status filter
  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setFilters({ ...filters, paymentStatus: paymentStatus as Order['paymentStatus'] | 'all' })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      clearSelection()
    } else {
      selectAllOrders()
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'default'
      case 'shipped': return 'default'
      case 'processing': return 'secondary'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  // Get payment status badge variant
  const getPaymentStatusBadgeVariant = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid': return 'default'
      case 'pending': return 'secondary'
      case 'failed': return 'destructive'
      case 'refunded': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground">
              Gestione Ordini
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Gestisci gli ordini del negozio BibiGin
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedOrders.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBulkUpdateStatus}
                  className="h-10 sm:h-9 text-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>Aggiorna ({selectedOrders.length})</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  className="h-10 sm:h-9 text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Elimina ({selectedOrders.length})</span>
                </Button>
              </>
            )}
            <Button 
              className="bg-navy hover:bg-navy/90 text-cream h-10 sm:h-9 text-sm"
              onClick={handleCreateQuickOrder}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Nuovo Ordine</span>
            </Button>
          </div>
        </div>

        {/* Filtri */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-card-foreground text-base sm:text-lg">Filtri</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 sm:max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cerca ordini..."
                    className="pl-10 bg-background border-border h-10 sm:h-9 text-base"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filters.status} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-44 h-10 sm:h-9 text-base">
                  <SelectValue placeholder="Stato Ordine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="pending">In Attesa</SelectItem>
                  <SelectItem value="processing">In Elaborazione</SelectItem>
                  <SelectItem value="shipped">Spedito</SelectItem>
                  <SelectItem value="delivered">Consegnato</SelectItem>
                  <SelectItem value="cancelled">Annullato</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.paymentStatus} onValueChange={handlePaymentStatusFilter}>
                <SelectTrigger className="w-full sm:w-44 h-10 sm:h-9 text-base">
                  <SelectValue placeholder="Stato Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i pagamenti</SelectItem>
                  <SelectItem value="pending">In Attesa</SelectItem>
                  <SelectItem value="paid">Pagato</SelectItem>
                  <SelectItem value="failed">Fallito</SelectItem>
                  <SelectItem value="refunded">Rimborsato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
            <span className="ml-2 text-muted-foreground">Caricamento ordini...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <div className="text-destructive text-center">
                <h3 className="font-semibold mb-2">Errore nel caricamento</h3>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabella Ordini - Responsive */}
        {!loading && !error && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground text-base sm:text-xl">
                  Ordini ({orders.length})
                </CardTitle>
                {orders.length > 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {selectedOrders.length > 0 && (
                      <span>{selectedOrders.length} sel.</span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {orders.length === 0 ? (
                <div className="text-center py-12 sm:py-8">
                  <div className="text-muted-foreground">
                    <h3 className="font-semibold mb-2 text-base sm:text-lg">Nessun ordine trovato</h3>
                    <p className="text-sm sm:text-base">Crea il primo ordine per il negozio BibiGin</p>
                  </div>
                  <Button 
                    className="mt-6 sm:mt-4 bg-navy hover:bg-navy/90 text-cream h-11 sm:h-10"
                    onClick={handleCreateQuickOrder}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Crea Primo Ordine</span>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedOrders.length === orders.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="text-card-foreground">Ordine</TableHead>
                          <TableHead className="text-card-foreground">Cliente</TableHead>
                          <TableHead className="text-card-foreground">Prodotti</TableHead>
                          <TableHead className="text-card-foreground">Totale</TableHead>
                          <TableHead className="text-card-foreground">Stato</TableHead>
                          <TableHead className="text-card-foreground">Pagamento</TableHead>
                          <TableHead className="text-card-foreground">Data</TableHead>
                          <TableHead className="text-card-foreground w-20">Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-border">
                            <TableCell>
                              <Checkbox
                                checked={selectedOrders.includes(order.id)}
                                onCheckedChange={() => selectOrder(order.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-card-foreground">
                                #{order.id.slice(-8)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-card-foreground">
                                {order.customerEmail}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-card-foreground">
                                {order.items.length} articoli
                              </div>
                            </TableCell>
                            <TableCell className="text-card-foreground font-medium">
                              €{order.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(order.status)}>
                                {order.status === 'pending' ? 'In Attesa' :
                                 order.status === 'processing' ? 'In Elaborazione' :
                                 order.status === 'shipped' ? 'Spedito' :
                                 order.status === 'delivered' ? 'Consegnato' : 'Annullato'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                                {order.paymentStatus === 'pending' ? 'In Attesa' :
                                 order.paymentStatus === 'paid' ? 'Pagato' :
                                 order.paymentStatus === 'failed' ? 'Fallito' : 'Rimborsato'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-card-foreground">
                              {order.createdAt.toLocaleDateString('it-IT')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-accent/10"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizza
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Aggiorna Stato
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteOrder(order)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Elimina
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3 flex-1">
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => selectOrder(order.id)}
                              className="mt-1.5 h-5 w-5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-card-foreground text-base mb-1">
                                Ordine #{order.id.slice(-8)}
                              </div>
                              <div className="text-sm text-muted-foreground mb-2 truncate">
                                {order.customerEmail}
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs h-5">
                                  {order.status === 'pending' ? 'In Attesa' :
                                   order.status === 'processing' ? 'In Elaborazione' :
                                   order.status === 'shipped' ? 'Spedito' :
                                   order.status === 'delivered' ? 'Consegnato' : 'Annullato'}
                                </Badge>
                                <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} className="text-xs h-5">
                                  {order.paymentStatus === 'pending' ? 'In Attesa' :
                                   order.paymentStatus === 'paid' ? 'Pagato' :
                                   order.paymentStatus === 'failed' ? 'Fallito' : 'Rimborsato'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-accent/10 -mt-1"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizza
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Aggiorna Stato
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOrder(order)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Articoli</div>
                            <div className="font-semibold text-sm text-card-foreground">
                              {order.items.length} prodotti
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Totale</div>
                            <div className="font-bold text-sm text-card-foreground">
                              €{order.total.toFixed(2)}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-muted-foreground mb-1">Data ordine</div>
                            <div className="text-sm text-card-foreground">
                              {order.createdAt.toLocaleDateString('it-IT', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && !loading && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-accent/10 rounded-lg w-fit">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Ordini Totali</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-green-100 rounded-lg w-fit">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Consegnati</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.delivered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-blue-100 rounded-lg w-fit">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">In Elaborazione</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.processing + stats.shipped}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-green-100 rounded-lg w-fit">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Fatturato</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      €{stats.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Order Form Dialog */}
        <QuickOrderForm
          open={showQuickOrderForm}
          onOpenChange={setShowQuickOrderForm}
          onSubmit={handleFormSubmit}
          products={products}
        />

        {/* Delete Order Dialog */}
        <DeleteOrderDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          order={deletingOrder}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteOrdersDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
          onConfirm={handleBulkDeleteConfirm}
          orderCount={selectedOrders.length}
        />

        {/* Update Status Dialog */}
        <UpdateStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          onConfirm={handleStatusUpdateConfirm}
          order={deletingOrder}
          type={updateStatusType}
          orderCount={selectedOrders.length}
        />

        {/* View Order Dialog */}
        <OrderViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          order={viewingOrder}
        />
      </div>
    </AdminLayout>
  )
}