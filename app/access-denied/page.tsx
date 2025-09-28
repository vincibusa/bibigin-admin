'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ShieldX, LogOut, Home } from "lucide-react"

export default function AccessDeniedPage() {
  const { user, userData, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleGoHome = () => {
    // Redirect to a public site or customer portal if available
    window.location.href = 'https://bibigin.com' // Replace with actual public site
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-cosmic-gradient opacity-5" />
      
      <Card className="w-full max-w-md relative z-10 border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="font-playfair text-2xl font-bold text-card-foreground">
              Accesso Non Autorizzato
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Non hai i permessi necessari per accedere al gestionale amministrativo
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Account attuale:</strong> {user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Ruolo:</strong> {userData?.role === 2 ? 'Utente Standard' : 'Non definito'}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-card-foreground">
              Il gestionale BibiGin Admin è riservato esclusivamente agli amministratori. 
              Se ritieni di dover avere accesso, contatta il team amministrativo.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleSignOut}
              className="w-full bg-navy hover:bg-navy/90 text-cream"
              size="lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnetti e Accedi con Account Admin
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Vai al Sito BibiGin
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Per assistenza: 
              <a 
                href="mailto:admin@bibigin.com" 
                className="text-accent hover:underline ml-1"
              >
                admin@bibigin.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}