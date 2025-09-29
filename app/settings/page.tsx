'use client'

import { useState } from 'react'
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
  Globe
} from "lucide-react"

interface StoreSettings {
  name: string
  description: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  currency: string
  timezone: string
}

interface NotificationSettings {
  emailOrderReceived: boolean
  emailLowStock: boolean
  emailNewCustomer: boolean
  emailWeeklyReport: boolean
  pushNotifications: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  
  // Store settings state
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'BibiGin Premium Store',
    description: 'Negozio premium di gin artigianali e bevande spiritose di alta qualità',
    email: 'info@bibigin.com',
    phone: '+39 02 1234 5678',
    address: 'Via Roma 123',
    city: 'Milano',
    country: 'Italia',
    currency: 'EUR',
    timezone: 'Europe/Rome'
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailOrderReceived: true,
    emailLowStock: true,
    emailNewCustomer: false,
    emailWeeklyReport: true,
    pushNotifications: true
  })

  // Loading states
  const [isSavingStore, setIsSavingStore] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Handle store settings change
  const handleStoreSettingChange = (field: keyof StoreSettings, value: string) => {
    setStoreSettings(prev => ({ ...prev, [field]: value }))
  }

  // Handle notification settings change
  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  // Save store settings
  const handleSaveStoreSettings = async () => {
    try {
      setIsSavingStore(true)
      // In a real app, this would save to Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      
      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni del negozio sono state aggiornate con successo."
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio.",
        variant: "destructive"
      })
    } finally {
      setIsSavingStore(false)
    }
  }

  // Save notification settings
  const handleSaveNotificationSettings = async () => {
    try {
      setIsSavingNotifications(true)
      // In a real app, this would save to Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      
      toast({
        title: "Notifiche aggiornate",
        description: "Le impostazioni delle notifiche sono state salvate."
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio.",
        variant: "destructive"
      })
    } finally {
      setIsSavingNotifications(false)
    }
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
        <div>
          <h1 className="font-playfair text-3xl font-bold text-foreground">
            Impostazioni
          </h1>
          <p className="text-muted-foreground">
            Gestisci le configurazioni del tuo negozio BibiGin
          </p>
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
                      value={storeSettings.name}
                      onChange={(e) => handleStoreSettingChange('name', e.target.value)}
                      placeholder="Nome del tuo negozio"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) => handleStoreSettingChange('email', e.target.value)}
                      placeholder="email@esempio.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Descrizione</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeSettings.description}
                    onChange={(e) => handleStoreSettingChange('description', e.target.value)}
                    placeholder="Descrizione del tuo negozio"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Telefono</Label>
                    <Input
                      id="storePhone"
                      value={storeSettings.phone}
                      onChange={(e) => handleStoreSettingChange('phone', e.target.value)}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeCity">Città</Label>
                    <Input
                      id="storeCity"
                      value={storeSettings.city}
                      onChange={(e) => handleStoreSettingChange('city', e.target.value)}
                      placeholder="Milano"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Indirizzo</Label>
                  <Input
                    id="storeAddress"
                    value={storeSettings.address}
                    onChange={(e) => handleStoreSettingChange('address', e.target.value)}
                    placeholder="Via Roma 123"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeCountry">Paese</Label>
                    <Input
                      id="storeCountry"
                      value={storeSettings.country}
                      onChange={(e) => handleStoreSettingChange('country', e.target.value)}
                      placeholder="Italia"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeCurrency">Valuta</Label>
                    <Input
                      id="storeCurrency"
                      value={storeSettings.currency}
                      onChange={(e) => handleStoreSettingChange('currency', e.target.value)}
                      placeholder="EUR"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeTimezone">Fuso Orario</Label>
                    <Input
                      id="storeTimezone"
                      value={storeSettings.timezone}
                      onChange={(e) => handleStoreSettingChange('timezone', e.target.value)}
                      placeholder="Europe/Rome"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveStoreSettings}
                    disabled={isSavingStore}
                    className="bg-navy hover:bg-navy/90 text-cream"
                  >
                    {isSavingStore ? (
                      <>Salvataggio...</>
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
                      checked={notificationSettings.emailOrderReceived}
                      onCheckedChange={(checked) => handleNotificationChange('emailOrderReceived', checked)}
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
                      checked={notificationSettings.emailLowStock}
                      onCheckedChange={(checked) => handleNotificationChange('emailLowStock', checked)}
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
                      checked={notificationSettings.emailNewCustomer}
                      onCheckedChange={(checked) => handleNotificationChange('emailNewCustomer', checked)}
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
                      checked={notificationSettings.emailWeeklyReport}
                      onCheckedChange={(checked) => handleNotificationChange('emailWeeklyReport', checked)}
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
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveNotificationSettings}
                    disabled={isSavingNotifications}
                    className="bg-navy hover:bg-navy/90 text-cream"
                  >
                    {isSavingNotifications ? (
                      <>Salvataggio...</>
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