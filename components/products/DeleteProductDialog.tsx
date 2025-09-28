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
import { Product } from '@/lib/types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  product: Product | null
  isDeleting?: boolean
}

export function DeleteProductDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  product,
  isDeleting = false 
}: DeleteProductDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!product) return null

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
                Elimina Prodotto
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Sei sicuro di voler eliminare il prodotto{' '}
            <span className="font-semibold text-foreground">&quot;{product.name}&quot;</span>?
            <br />
            <br />
            Questa azione è <span className="font-semibold text-destructive">irreversibile</span> e comporterà:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">SKU:</span>
              <span className="font-mono">{product.sku}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prezzo:</span>
              <span>€{product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giacenza:</span>
              <span>{product.stock} pz</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stato:</span>
              <span className={`capitalize ${
                product.status === 'active' ? 'text-green-600' : 
                product.status === 'inactive' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {product.status === 'active' ? 'Attivo' : 
                 product.status === 'inactive' ? 'Inattivo' : 'Esaurito'}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
            <h4 className="font-medium text-destructive mb-2">Conseguenze dell&apos;eliminazione:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Il prodotto sarà rimosso definitivamente dal catalogo</li>
              <li>• Non sarà più disponibile per l&apos;acquisto</li>
              <li>• I link diretti al prodotto non funzioneranno più</li>
              <li>• Gli ordini passati rimarranno invariati</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing || isDeleting}>
            Annulla
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isProcessing || isDeleting}
          >
            {(isProcessing || isDeleting) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Elimina Definitivamente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Bulk delete dialog for multiple products
interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  productCount: number
  isDeleting?: boolean
}

export function BulkDeleteDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  productCount,
  isDeleting = false 
}: BulkDeleteDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting products:', error)
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
                Elimina Prodotti Selezionati
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Sei sicuro di voler eliminare{' '}
            <span className="font-semibold text-foreground">{productCount} prodotti</span> selezionati?
            <br />
            <br />
            Questa azione è <span className="font-semibold text-destructive">irreversibile</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
          <h4 className="font-medium text-destructive mb-2">Conseguenze dell&apos;eliminazione:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Tutti i prodotti selezionati saranno rimossi definitivamente</li>
            <li>• Non saranno più disponibili per l&apos;acquisto</li>
            <li>• I link diretti ai prodotti non funzioneranno più</li>
            <li>• Gli ordini passati rimarranno invariati</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing || isDeleting}>
            Annulla
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isProcessing || isDeleting}
          >
            {(isProcessing || isDeleting) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Elimina {productCount} Prodotti
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}