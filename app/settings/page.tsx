'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from "@/components/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/hooks/use-settings"
import { StoreSettings, NotificationSettings } from "@/lib/settings"
import { 
  Settings as SettingsIcon, 
  Store, 
  Bell, 
  Users, 
  Database, 
  Shield,
  Save,
  Download,
  Upload,
  Mail,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  
  // Use settings hook for real Firebase persistence
  const {
    storeSettings: loadedStoreSettings,
    notificationSettings: loadedNotificationSettings,
    loading,
    saving,
    error,
    validationErrors,
    lastUpdated,
    saveStoreSettings,
    saveNotificationSettings,
    clearError,
    clearValidationErrors
  } = useSettings()

  // Local form state
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Sync loaded settings with local form state
  useEffect(() => {
    if (loadedStoreSettings && !storeSettings) {
      setStoreSettings(loadedStoreSettings)
    }
    if (loadedNotificationSettings && !notificationSettings) {
      setNotificationSettings(loadedNotificationSettings)
    }
  }, [loadedStoreSettings, loadedNotificationSettings, storeSettings, notificationSettings])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Errore",
        description: error,
        variant: "destructive"
      })
      clearError()
    }
  }, [error, toast, clearError])

  // Handle store settings change
  const handleStoreSettingChange = (field: keyof StoreSettings, value: string) => {
    if (storeSettings) {
      setStoreSettings(prev => prev ? { ...prev, [field]: value } : null)
      // Clear validation errors when user types
      clearValidationErrors()
    }
  }

  // Handle notification settings change
  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    if (notificationSettings) {
      setNotificationSettings(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  // Save store settings with real Firebase persistence
  const handleSaveStoreSettings = async () => {
    if (!storeSettings) return
    
    const success = await saveStoreSettings(storeSettings)
    
    if (success) {
      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni del negozio sono state aggiornate con successo."
      })
    }
    // Error handling is done by the hook and useEffect above
  }

  // Save notification settings with real Firebase persistence
  const handleSaveNotificationSettings = async () => {
    if (!notificationSettings) return
    
    const success = await saveNotificationSettings(notificationSettings)
    
    if (success) {
      toast({
        title: "Notifiche aggiornate",
        description: "Le impostazioni delle notifiche sono state salvate."
      })
    }
    // Error handling is done by the hook and useEffect above
  }

  // Export data
  const handleExportData = async () => {
    try {
      setIsExporting(true)
      // In a real app, this would generate and download data export
      await new Promise(resolve => setTimeout(resolve, 2000)) // Mock delay
      
      toast({
        title: "Export completato",
        description: "I dati sono stati esportati con successo."
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'export.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-foreground">
              Impostazioni
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                Gestisci le configurazioni del tuo negozio BibiGin
              </p>
              {loading && (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Ultimo aggiornamento: {lastUpdated.toLocaleString('it-IT')}
              </p>
            )}
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {loading ? (
              <Badge variant="secondary" className="gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Caricamento...
              </Badge>
            ) : error ? (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Errore
              </Badge>
            ) : (
              <Badge variant="default" className="bg-green-100 text-green-800 gap-1">
                <CheckCircle className="w-3 h-3" />
                Sincronizzato
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Settings */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Impostazioni Negozio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome Negozio</Label>
                    <Input
                      id="storeName"
                      value={storeSettings?.name || ''}
                      onChange={(e) => handleStoreSettingChange('name', e.target.value)}
                      placeholder="Nome del tuo negozio"
                      disabled={loading}
                    />
                    {validationErrors.store?.name && (
                      <p className="text-sm text-destructive">{validationErrors.store.name[0]}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={storeSettings?.email || ''}
                      onChange={(e) => handleStoreSettingChange('email', e.target.value)}
                      placeholder="email@esempio.com"
                      disabled={loading}
                    />
                    {validationErrors.store?.email && (
                      <p className="text-sm text-destructive">{validationErrors.store.email[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Descrizione</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeSettings?.description || ''}
                    onChange={(e) => handleStoreSettingChange('description', e.target.value)}
                    placeholder="Descrizione del tuo negozio"
                    rows={3}
                    disabled={loading}
                  />
                  {validationErrors.store?.description && (
                    <p className="text-sm text-destructive">{validationErrors.store.description[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Telefono</Label>
                    <Input
                      id="storePhone"
                      value={storeSettings?.phone || ''}
                      onChange={(e) => handleStoreSettingChange('phone', e.target.value)}
                      placeholder="+39 123 456 7890"
                      disabled={loading}
                    />
                    {validationErrors.store?.phone && (
                      <p className="text-sm text-destructive">{validationErrors.store.phone[0]}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeCity">Città</Label>
                    <Input
                      id="storeCity"
                      value={storeSettings?.city || ''}
                      onChange={(e) => handleStoreSettingChange('city', e.target.value)}
                      placeholder="Milano"
                      disabled={loading}
                    />
                    {validationErrors.store?.city && (
                      <p className="text-sm text-destructive">{validationErrors.store.city[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Indirizzo</Label>
                  <Input
                    id="storeAddress"
                    value={storeSettings?.address || ''}
                    onChange={(e) => handleStoreSettingChange('address', e.target.value)}
                    placeholder="Via Roma 123"
                    disabled={loading}
                  />
                  {validationErrors.store?.address && (
                    <p className="text-sm text-destructive">{validationErrors.store.address[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeCountry">Paese</Label>
                    <Input
                      id="storeCountry"
                      value={storeSettings?.country || ''}
                      onChange={(e) => handleStoreSettingChange('country', e.target.value)}
                      placeholder="Italia"
                      disabled={loading}
                    />
                    {validationErrors.store?.country && (
                      <p className="text-sm text-destructive">{validationErrors.store.country[0]}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeCurrency">Valuta</Label>
                    <Input
                      id="storeCurrency"
                      value={storeSettings?.currency || ''}
                      onChange={(e) => handleStoreSettingChange('currency', e.target.value)}
                      placeholder="EUR"
                      disabled={loading}
                    />
                    {validationErrors.store?.currency && (
                      <p className="text-sm text-destructive">{validationErrors.store.currency[0]}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeTimezone">Fuso Orario</Label>
                    <Input
                      id="storeTimezone"
                      value={storeSettings?.timezone || ''}
                      onChange={(e) => handleStoreSettingChange('timezone', e.target.value)}
                      placeholder="Europe/Rome"
                      disabled={loading}
                    />
                    {validationErrors.store?.timezone && (
                      <p className="text-sm text-destructive">{validationErrors.store.timezone[0]}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveStoreSettings}
                    disabled={saving || loading || !storeSettings}
                    className="bg-navy hover:bg-navy/90 text-cream"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salva Impostazioni
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifiche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Nuovo Ordine</div>
                      <div className="text-sm text-muted-foreground">
                        Ricevi email quando arriva un nuovo ordine
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings?.emailOrderReceived || false}
                      onCheckedChange={(checked) => handleNotificationChange('emailOrderReceived', checked)}
                      disabled={loading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Scorte Basse</div>
                      <div className="text-sm text-muted-foreground">
                        Avviso quando le scorte di un prodotto sono basse
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings?.emailLowStock || false}
                      onCheckedChange={(checked) => handleNotificationChange('emailLowStock', checked)}
                      disabled={loading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Nuovo Cliente</div>
                      <div className="text-sm text-muted-foreground">
                        Notifica quando si registra un nuovo cliente
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings?.emailNewCustomer || false}
                      onCheckedChange={(checked) => handleNotificationChange('emailNewCustomer', checked)}
                      disabled={loading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Report Settimanale</div>
                      <div className="text-sm text-muted-foreground">
                        Ricevi un riassunto settimanale delle vendite
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings?.emailWeeklyReport || false}
                      onCheckedChange={(checked) => handleNotificationChange('emailWeeklyReport', checked)}
                      disabled={loading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Notifiche Push</div>
                      <div className="text-sm text-muted-foreground">
                        Abilita notifiche push nel browser
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings?.pushNotifications || false}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveNotificationSettings}
                    disabled={saving || loading || !notificationSettings}
                    className="bg-navy hover:bg-navy/90 text-cream"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salva Notifiche
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Stato Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Firebase Auth</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Attivo
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connesso
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup</span>
                  <Badge variant="secondary">
                    24h fa
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Azioni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Esportazione...' : 'Esporta Dati'}
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Importa Dati
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Backup Manuale
                </Button>
              </CardContent>
            </Card>

            {/* Admin Users */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Utenti Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>catanzaroepartners@gmail.com</span>
                  <Badge variant="default">Owner</Badge>
                </div>
                
                <div className="text-center">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Gestisci Utenti
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Sicurezza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Ultimo login:</span>
                    <span className="text-muted-foreground">Oggi, 14:30</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>2FA:</span>
                    <Badge variant="outline">Non attivo</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>SSL:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Attivo
                    </Badge>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Configura 2FA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Impostazioni Avanzate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Configurazione API</h4>
                <div className="space-y-2">
                  <Label>Firebase Project ID</Label>
                  <Input value="bibiginlacorte" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Input value="production" disabled />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Integrazioni</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stripe</span>
                    <Badge variant="outline">Non configurato</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google Analytics</span>
                    <Badge variant="outline">Non configurato</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mailchimp</span>
                    <Badge variant="outline">Non configurato</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}