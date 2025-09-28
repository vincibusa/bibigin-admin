'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Customer } from '@/lib/types'
import { Loader2, AlertTriangle, Users } from 'lucide-react'

// Delete Customer Dialog
interface DeleteCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  customer: Customer | null
}

export function DeleteCustomerDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  customer
}: DeleteCustomerDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting customer:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!customer) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Elimina Cliente
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Sei sicuro di voler eliminare il cliente{' '}
            <span className="font-semibold text-foreground">
              {customer.firstName} {customer.lastName}
            </span>?
            <br />
            <br />
            Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
            {customer.orders.length > 0 && (
              <>
                <br />
                <br />
                <span className="text-amber-600">
                  ⚠️ Attenzione: Questo cliente ha {customer.orders.length} ordini associati.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span>{customer.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Telefono:</span>
              <span>{customer.phone || 'Non specificato'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Totale speso:</span>
              <span>€{customer.totalSpent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ordini:</span>
              <span>{customer.orders.length}</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Annulla
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Elimina Definitivamente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Bulk Delete Dialog
interface BulkDeleteCustomersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  customerCount: number
}

export function BulkDeleteCustomersDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  customerCount
}: BulkDeleteCustomersDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting customers:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Elimina Clienti Selezionati
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Sei sicuro di voler eliminare{' '}
            <span className="font-semibold text-foreground">{customerCount} clienti</span> selezionati?
            <br />
            <br />
            Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
            <br />
            <br />
            <span className="text-amber-600">
              ⚠️ Attenzione: Gli ordini associati a questi clienti potrebbero essere influenzati.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Annulla
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Elimina {customerCount} Clienti
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Customer Details Dialog (View Only)
interface CustomerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

export function CustomerDetailsDialog({ 
  open, 
  onOpenChange, 
  customer
}: CustomerDetailsDialogProps) {
  if (!customer) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Dettagli Cliente
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Informazioni Personali</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span>{customer.firstName} {customer.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefono:</span>
                  <span>{customer.phone || 'Non specificato'}</span>
                </div>
              </div>
            </div>

            {customer.defaultAddress && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Indirizzo Predefinito</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{customer.defaultAddress.street}</p>
                  <p>{customer.defaultAddress.city}, {customer.defaultAddress.state}</p>
                  <p>{customer.defaultAddress.postalCode}, {customer.defaultAddress.country}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-foreground mb-2">Statistiche</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Totale speso:</span>
                  <span className="font-medium">€{customer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numero ordini:</span>
                  <span>{customer.orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente dal:</span>
                  <span>{customer.createdAt.toLocaleDateString('it-IT')}</span>
                </div>
                {customer.lastOrderAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ultimo ordine:</span>
                    <span>{customer.lastOrderAt.toLocaleDateString('it-IT')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-navy hover:bg-navy/90 text-cream">
            Chiudi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}