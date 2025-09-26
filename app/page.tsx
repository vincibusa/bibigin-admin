import { AdminLayout } from "@/components/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
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
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">€12.345</div>
              <p className="text-xs text-muted-foreground">
                +20.1% dal mese scorso
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Ordini
              </CardTitle>
              <span className="text-2xl">📦</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% dal mese scorso
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Clienti Attivi
              </CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% dal mese scorso
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Prodotti Venduti
              </CardTitle>
              <span className="text-2xl">🍾</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">573</div>
              <p className="text-xs text-muted-foreground">
                +201 questo mese
              </p>
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
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h3 className="font-semibold text-accent-foreground mb-2">
                  Aggiungi Prodotto
                </h3>
                <p className="text-sm text-muted-foreground">
                  Aggiungi un nuovo prodotto al catalogo
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h3 className="font-semibold text-accent-foreground mb-2">
                  Gestisci Ordini
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualizza e gestisci gli ordini in corso
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h3 className="font-semibold text-accent-foreground mb-2">
                  Analytics
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualizza i report delle vendite
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
