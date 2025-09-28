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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Order } from '@/lib/types'
import { orderStatuses, paymentStatuses } from '@/lib/validation-orders'
import { Loader2, AlertTriangle, Package } from 'lucide-react'

// Delete Order Dialog
interface DeleteOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  order: Order | null
}

export function DeleteOrderDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  order
}: DeleteOrderDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting order:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!order) return null

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
                Elimina Ordine
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Sei sicuro di voler eliminare l&apos;ordine{' '}
            <span className="font-semibold text-foreground">#{order.id.slice(-8)}</span>?
            <br />
            <br />
            Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span>{order.customerEmail}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Totale:</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stato:</span>
              <span className="capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prodotti:</span>
              <span>{order.items.length} articoli</span>
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
interface BulkDeleteOrdersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  orderCount: number
}

export function BulkDeleteOrdersDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  orderCount
}: BulkDeleteOrdersDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting orders:', error)
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
                Elimina Ordini Selezionati
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Sei sicuro di voler eliminare{' '}
            <span className="font-semibold text-foreground">{orderCount} ordini</span> selezionati?
            <br />
            <br />
            Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
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
            Elimina {orderCount} Ordini
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Update Status Dialog
interface UpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (status: Order['status'], paymentStatus?: Order['paymentStatus']) => Promise<void>
  order: Order | null
  type: 'single' | 'bulk'
  orderCount?: number
}

export function UpdateStatusDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  order,
  type,
  orderCount = 1
}: UpdateStatusDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [newStatus, setNewStatus] = useState<Order['status']>('pending')
  const [newPaymentStatus, setNewPaymentStatus] = useState<Order['paymentStatus']>('pending')

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm(newStatus, newPaymentStatus)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Aggiorna Stato {type === 'bulk' ? 'Ordini' : 'Ordine'}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            {type === 'single' ? (
              <>Aggiorna lo stato dell&apos;ordine <span className="font-semibold">#{order?.id.slice(-8)}</span></>
            ) : (
              <>Aggiorna lo stato di <span className="font-semibold">{orderCount} ordini</span> selezionati</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Stato Ordine</Label>
            <Select value={newStatus} onValueChange={(value: Order['status']) => setNewStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stato Pagamento</Label>
            <Select value={newPaymentStatus} onValueChange={(value: Order['paymentStatus']) => setNewPaymentStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Annulla
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-navy hover:bg-navy/90 text-cream"
          >
            {isProcessing && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Aggiorna Stato
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}