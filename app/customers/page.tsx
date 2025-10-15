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
import { useCustomers } from "@/hooks/use-customers"
import { QuickCustomerForm } from "@/components/customers/QuickCustomerForm"
import { 
  DeleteCustomerDialog, 
  BulkDeleteCustomersDialog, 
  CustomerDetailsDialog 
} from "@/components/customers/CustomerActionDialogs"
import { QuickCustomerData } from "@/lib/validation-customers"
import { Customer } from "@/lib/types"
import { calculateCustomerSegment } from "@/lib/validation-customers"
import { 
  Search, 
  Plus, 
  Trash2, 
  MoreHorizontal, 
  Loader2, 
  Users,
  Eye,
  Mail,
  Phone
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function CustomersPage() {
  const { toast } = useToast()
  const {
    customers,
    loading,
    error,
    stats,
    filters,
    selectedCustomers,
    setFilters,
    selectCustomer,
    selectAllCustomers,
    clearSelection,
    createQuickNewCustomer,
    deleteExistingCustomer,
    bulkDelete
  } = useCustomers()

  // Form states
  const [showQuickCustomerForm, setShowQuickCustomerForm] = useState(false)

  // Action states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Handle create quick customer
  const handleCreateQuickCustomer = () => {
    setShowQuickCustomerForm(true)
  }

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer)
    setShowDeleteDialog(true)
  }

  // Handle view customer details
  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer)
    setShowDetailsDialog(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: QuickCustomerData) => {
    try {
      await createQuickNewCustomer(data)
      toast({
        title: "Cliente creato",
        description: "Il nuovo cliente è stato aggiunto con successo."
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
    if (!deletingCustomer) return
    
    try {
      await deleteExistingCustomer(deletingCustomer.id)
      toast({
        title: "Cliente eliminato",
        description: "Il cliente è stato rimosso dal sistema."
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
      await bulkDelete(selectedCustomers)
      toast({
        title: "Clienti eliminati",
        description: `${selectedCustomers.length} clienti sono stati rimossi dal sistema.`
      })
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

  // Handle orders filter
  const handleOrdersFilter = (hasOrders: string) => {
    setFilters({ ...filters, hasOrders: hasOrders as 'all' | 'yes' | 'no' })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      clearSelection()
    } else {
      selectAllCustomers()
    }
  }

  // Get segment badge variant
  const getSegmentBadgeVariant = (customer: Customer) => {
    const segment = calculateCustomerSegment(customer.totalSpent ?? 0, customer.orders?.length ?? 0)
    switch (segment) {
      case 'vip': return 'default'
      case 'regular': return 'secondary'
      case 'new': return 'outline'
      default: return 'secondary'
    }
  }

  // Get segment label
  const getSegmentLabel = (customer: Customer) => {
    const segment = calculateCustomerSegment(customer.totalSpent ?? 0, customer.orders?.length ?? 0)
    switch (segment) {
      case 'vip': return 'VIP'
      case 'regular': return 'Abituale'
      case 'new': return 'Nuovo'
      default: return 'Standard'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground">
              Gestione Clienti
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Gestisci i clienti del negozio BibiGin
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedCustomers.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="h-10 sm:h-9 text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Elimina ({selectedCustomers.length})</span>
              </Button>
            )}
            <Button 
              className="bg-navy hover:bg-navy/90 text-cream h-10 sm:h-9 text-sm"
              onClick={handleCreateQuickCustomer}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Nuovo Cliente</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && !loading && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-accent/10 rounded-lg w-fit">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Clienti Totali</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-green-100 rounded-lg w-fit">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Nuovi Mese</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.newThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-blue-100 rounded-lg w-fit">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Con Ordini</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.withOrders}</p>
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
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Valore Medio</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      €{stats.averageOrderValue.toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    placeholder="Cerca clienti..."
                    className="pl-10 bg-background border-border h-10 sm:h-9 text-base"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filters.hasOrders} onValueChange={handleOrdersFilter}>
                <SelectTrigger className="w-full sm:w-44 h-10 sm:h-9 text-base">
                  <SelectValue placeholder="Ordini" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="yes">Con Ordini</SelectItem>
                  <SelectItem value="no">Senza Ordini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
            <span className="ml-2 text-muted-foreground">Caricamento clienti...</span>
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

        {/* Tabella Clienti */}
        {!loading && !error && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground text-base sm:text-xl">
                  Clienti ({customers.length})
                </CardTitle>
                {customers.length > 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {selectedCustomers.length > 0 && (
                      <span>{selectedCustomers.length} sel.</span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {customers.length === 0 ? (
                <div className="text-center py-12 sm:py-8">
                  <div className="text-muted-foreground">
                    <h3 className="font-semibold mb-2 text-base sm:text-lg">Nessun cliente trovato</h3>
                    <p className="text-sm sm:text-base">Crea il primo cliente per il negozio BibiGin</p>
                  </div>
                  <Button 
                    className="mt-6 sm:mt-4 bg-navy hover:bg-navy/90 text-cream h-11 sm:h-10"
                    onClick={handleCreateQuickCustomer}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Crea Primo Cliente</span>
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
                          checked={selectedCustomers.length === customers.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-card-foreground">Cliente</TableHead>
                      <TableHead className="text-card-foreground">Contatti</TableHead>
                      <TableHead className="text-card-foreground">Ordini</TableHead>
                      <TableHead className="text-card-foreground">Totale Speso</TableHead>
                      <TableHead className="text-card-foreground">Segmento</TableHead>
                      <TableHead className="text-card-foreground">Registrato</TableHead>
                      <TableHead className="text-card-foreground w-20">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id} className="border-border">
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() => selectCustomer(customer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-card-foreground">
                            <div className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-card-foreground">
                              <Mail className="w-3 h-3 mr-1" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="w-3 h-3 mr-1" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {customer.orders?.length ?? 0}
                        </TableCell>
                        <TableCell className="text-card-foreground font-medium">
                          €{(customer.totalSpent ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSegmentBadgeVariant(customer)}>
                            {getSegmentLabel(customer)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {customer.createdAt.toLocaleDateString('it-IT')}
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
                              <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizza
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCustomer(customer)}
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
                    {customers.map((customer) => (
                      <div key={customer.id} className="p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3 flex-1">
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() => selectCustomer(customer.id)}
                              className="mt-1.5 h-5 w-5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-card-foreground text-base mb-1">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground mb-2 truncate">
                                <Mail className="w-3 h-3 inline mr-1" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="text-xs text-muted-foreground mb-2">
                                  <Phone className="w-3 h-3 inline mr-1" />
                                  {customer.phone}
                                </div>
                              )}
                              <Badge variant={getSegmentBadgeVariant(customer)} className="text-xs h-5">
                                {getSegmentLabel(customer)}
                              </Badge>
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
                              <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizza
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCustomer(customer)}
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
                            <div className="text-xs text-muted-foreground mb-1">Ordini</div>
                            <div className="font-semibold text-sm text-card-foreground">
                              {customer.orders?.length ?? 0} ordini
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Totale Speso</div>
                            <div className="font-bold text-sm text-card-foreground">
                              €{(customer.totalSpent ?? 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-muted-foreground mb-1">Cliente dal</div>
                            <div className="text-sm text-card-foreground">
                              {customer.createdAt.toLocaleDateString('it-IT', { 
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

        {/* Quick Customer Form Dialog */}
        <QuickCustomerForm
          open={showQuickCustomerForm}
          onOpenChange={setShowQuickCustomerForm}
          onSubmit={handleFormSubmit}
        />

        {/* Delete Customer Dialog */}
        <DeleteCustomerDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          customer={deletingCustomer}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteCustomersDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
          onConfirm={handleBulkDeleteConfirm}
          customerCount={selectedCustomers.length}
        />

        {/* Customer Details Dialog */}
        <CustomerDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          customer={viewingCustomer}
        />
      </div>
    </AdminLayout>
  )
}