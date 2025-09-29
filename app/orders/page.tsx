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
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-foreground">
              Gestione Ordini
            </h1>
            <p className="text-muted-foreground">
              Gestisci gli ordini del negozio BibiGin
            </p>
          </div>
          <div className="flex gap-2">
            {selectedOrders.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBulkUpdateStatus}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Aggiorna Stato ({selectedOrders.length})
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Elimina Selezionati ({selectedOrders.length})
                </Button>
              </>
            )}
            <Button 
              className="bg-navy hover:bg-navy/90 text-cream"
              onClick={handleCreateQuickOrder}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Ordine
            </Button>
          </div>
        </div>

        {/* Filtri */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cerca ordini..."
                    className="pl-10 bg-background border-border"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filters.status} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
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

        {/* Tabella Ordini */}
        {!loading && !error && (
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">
                  Ordini ({orders.length})
                </CardTitle>
                {orders.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {selectedOrders.length > 0 && (
                      <span>{selectedOrders.length} selezionati</span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    <h3 className="font-semibold mb-2">Nessun ordine trovato</h3>
                    <p>Crea il primo ordine per il negozio BibiGin</p>
                  </div>
                  <Button 
                    className="mt-4 bg-navy hover:bg-navy/90 text-cream"
                    onClick={handleCreateQuickOrder}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crea Primo Ordine
                  </Button>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && !loading && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Package className="w-6 h-6 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Ordini Totali</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Consegnati</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.delivered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">In Elaborazione</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.processing + stats.shipped}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Fatturato</p>
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