import { AdminLayout } from "@/components/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2 } from "lucide-react"

// Mock data prodotti
const products = [
  {
    id: 1,
    name: "BibiGin Luna Nuova",
    sku: "BG-LN-001", 
    price: 45.00,
    stock: 125,
    status: "active",
    image: "/bibigin-luna-nuova.jpg"
  },
  {
    id: 2,
    name: "BibiGin Luna Piena", 
    sku: "BG-LP-002",
    price: 48.00,
    stock: 87,
    status: "active",
    image: "/bibigin-luna-piena.jpg"
  },
  {
    id: 3,
    name: "BibiGin Primo Quarto",
    sku: "BG-PQ-003", 
    price: 46.50,
    stock: 0,
    status: "out_of_stock",
    image: "/bibigin-primo-quarto.jpg"
  }
]

export default function ProductsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-foreground">
              Gestione Prodotti
            </h1>
            <p className="text-muted-foreground">
              Gestisci il catalogo prodotti BibiGin
            </p>
          </div>
          <Button className="bg-navy hover:bg-navy/90 text-cream">
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Prodotto
          </Button>
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
                    placeholder="Cerca prodotti..."
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent/10">
                Tutti
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent/10">
                Attivi
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent/10">
                Esauriti
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabella Prodotti */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Catalogo Prodotti</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-card-foreground">Prodotto</TableHead>
                  <TableHead className="text-card-foreground">SKU</TableHead>
                  <TableHead className="text-card-foreground">Prezzo</TableHead>
                  <TableHead className="text-card-foreground">Giacenza</TableHead>
                  <TableHead className="text-card-foreground">Stato</TableHead>
                  <TableHead className="text-card-foreground">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                          <span className="text-accent text-xs font-bold">🍾</span>
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">{product.name}</div>
                          <div className="text-sm text-muted-foreground">Gin Premium</div>
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
                        variant={product.status === 'active' ? 'default' : 'destructive'}
                        className={
                          product.status === 'active' 
                            ? 'bg-accent/20 text-accent-foreground border-accent/30' 
                            : ''
                        }
                      >
                        {product.status === 'active' ? 'Attivo' : 'Esaurito'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-accent/10"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Prodotti Totali</p>
                  <p className="text-2xl font-bold text-card-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Attivi</p>
                  <p className="text-2xl font-bold text-card-foreground">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Esauriti</p>
                  <p className="text-2xl font-bold text-card-foreground">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Valore Totale</p>
                  <p className="text-2xl font-bold text-card-foreground">€9.853</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}