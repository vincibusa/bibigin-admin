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
import { useProducts } from "@/hooks/use-products"
import { ProductForm } from "@/components/products/ProductForm"
import { DeleteProductDialog, BulkDeleteDialog } from "@/components/products/DeleteProductDialog"
import { ProductFormData } from "@/lib/validation-products"
import { Product } from "@/lib/types"
import { Search, Plus, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function ProductsPage() {
  const { toast } = useToast()
  const {
    products,
    loading,
    error,
    stats,
    filters,
    selectedProducts,
    setFilters,
    selectProduct,
    selectAllProducts,
    clearSelection,
    createNewProduct,
    updateExistingProduct,
    deleteExistingProduct,
    bulkDelete
  } = useProducts()

  // Form states
  const [showProductForm, setShowProductForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Delete states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Handle create product
  const handleCreateProduct = () => {
    setFormMode('create')
    setEditingProduct(null)
    setShowProductForm(true)
  }

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setFormMode('edit')
    setEditingProduct(product)
    setShowProductForm(true)
  }

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product)
    setShowDeleteDialog(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      if (formMode === 'create') {
        await createNewProduct(data)
        toast({
          title: "Prodotto creato",
          description: "Il prodotto è stato aggiunto al catalogo con successo."
        })
      } else if (editingProduct) {
        await updateExistingProduct(editingProduct.id, data)
        toast({
          title: "Prodotto aggiornato",
          description: "Le modifiche sono state salvate con successo."
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

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    
    try {
      await deleteExistingProduct(deletingProduct.id)
      toast({
        title: "Prodotto eliminato",
        description: "Il prodotto è stato rimosso dal catalogo."
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
      await bulkDelete(selectedProducts)
      toast({
        title: "Prodotti eliminati",
        description: `${selectedProducts.length} prodotti sono stati rimossi dal catalogo.`
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

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status as 'all' | 'active' | 'inactive' | 'out_of_stock' })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      clearSelection()
    } else {
      selectAllProducts()
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground">
              Gestione Prodotti
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Gestisci il catalogo prodotti BibiGin
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedProducts.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="h-10 sm:h-9 text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Elimina ({selectedProducts.length})</span>
              </Button>
            )}
            <Button 
              className="bg-navy hover:bg-navy/90 text-cream h-10 sm:h-9 text-sm"
              onClick={handleCreateProduct}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Nuovo Prodotto</span>
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
                    placeholder="Cerca prodotti..."
                    className="pl-10 bg-background border-border h-10 sm:h-9 text-base"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filters.status} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 h-10 sm:h-9 text-base">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="active">Attivi</SelectItem>
                  <SelectItem value="inactive">Inattivi</SelectItem>
                  <SelectItem value="out_of_stock">Esauriti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-navy" />
            <span className="ml-2 text-muted-foreground">Caricamento prodotti...</span>
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

        {/* Tabella Prodotti - Responsive */}
        {!loading && !error && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground text-base sm:text-xl">
                  Catalogo Prodotti ({products.length})
                </CardTitle>
                {products.length > 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {selectedProducts.length > 0 && (
                      <span>{selectedProducts.length} sel.</span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {products.length === 0 ? (
                <div className="text-center py-12 sm:py-8">
                  <div className="text-muted-foreground">
                    <h3 className="font-semibold mb-2 text-base sm:text-lg">Nessun prodotto trovato</h3>
                    <p className="text-sm sm:text-base">Aggiungi il primo prodotto al catalogo BibiGin</p>
                  </div>
                  <Button 
                    className="mt-6 sm:mt-4 bg-navy hover:bg-navy/90 text-cream h-11 sm:h-10"
                    onClick={handleCreateProduct}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Crea Primo Prodotto</span>
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
                              checked={selectedProducts.length === products.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="text-card-foreground">Prodotto</TableHead>
                          <TableHead className="text-card-foreground">SKU</TableHead>
                          <TableHead className="text-card-foreground">Prezzo</TableHead>
                          <TableHead className="text-card-foreground">Giacenza</TableHead>
                          <TableHead className="text-card-foreground">Stato</TableHead>
                          <TableHead className="text-card-foreground w-20">Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} className="border-border">
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() => selectProduct(product.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center overflow-hidden">
                                  {product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      src={product.imageUrl} 
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-accent text-xs font-bold">🍾</span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-card-foreground">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {product.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Gin Premium'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-card-foreground font-mono text-sm">
                              {product.sku}
                            </TableCell>
                            <TableCell className="text-card-foreground font-medium">
                              €{product.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${product.stock === 0 ? 'text-destructive' : 'text-card-foreground'}`}>
                                {product.stock} pz
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  product.status === 'active' ? 'default' : 
                                  product.status === 'inactive' ? 'secondary' : 'destructive'
                                }
                                className={
                                  product.status === 'active' 
                                    ? 'bg-accent/20 text-accent-foreground border-accent/30' 
                                    : ''
                                }
                              >
                                {product.status === 'active' ? 'Attivo' : 
                                 product.status === 'inactive' ? 'Inattivo' : 'Esaurito'}
                              </Badge>
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
                                  <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifica
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteProduct(product)}
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
                    {products.map((product) => (
                      <div key={product.id} className="p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3 flex-1">
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => selectProduct(product.id)}
                              className="mt-1.5 h-5 w-5"
                            />
                            <div className="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">🍾</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-card-foreground text-base mb-1 line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {product.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Gin Premium'}
                              </div>
                              <Badge 
                                variant={
                                  product.status === 'active' ? 'default' : 
                                  product.status === 'inactive' ? 'secondary' : 'destructive'
                                }
                                className={
                                  product.status === 'active' 
                                    ? 'bg-accent/20 text-accent-foreground border-accent/30 text-xs h-5' 
                                    : 'text-xs h-5'
                                }
                              >
                                {product.status === 'active' ? 'Attivo' : 
                                 product.status === 'inactive' ? 'Inattivo' : 'Esaurito'}
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
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifica
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProduct(product)}
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
                            <div className="text-xs text-muted-foreground mb-1">SKU</div>
                            <div className="font-mono text-sm text-card-foreground">{product.sku}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Prezzo</div>
                            <div className="font-semibold text-sm text-card-foreground">€{product.price.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Giacenza</div>
                            <div className={`font-semibold text-sm ${product.stock === 0 ? 'text-destructive' : 'text-card-foreground'}`}>
                              {product.stock} pz
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

        {/* Stats Card */}
        {stats && !loading && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-accent/10 rounded-lg w-fit">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Prodotti Totali</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-accent/10 rounded-lg w-fit">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Attivi</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-destructive/10 rounded-lg w-fit">
                    <span className="text-2xl">❌</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Esauriti</p>
                    <p className="text-2xl font-bold text-card-foreground">{stats.outOfStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="p-2 bg-accent/10 rounded-lg w-fit">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="sm:ml-4">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Valore Totale</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      €{stats.totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Product Form Dialog */}
        <ProductForm
          open={showProductForm}
          onOpenChange={setShowProductForm}
          onSubmit={handleFormSubmit}
          product={editingProduct}
          mode={formMode}
        />

        {/* Delete Product Dialog */}
        <DeleteProductDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          product={deletingProduct}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
          onConfirm={handleBulkDeleteConfirm}
          productCount={selectedProducts.length}
        />
      </div>
    </AdminLayout>
  )
}