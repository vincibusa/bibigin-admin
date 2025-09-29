'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Order } from '@/lib/types'
import { formatCurrency, formatOrderNumber, getStatusColor, getPaymentStatusColor } from '@/lib/utils'
import { Package, User, MapPin, CreditCard, FileText, Calendar } from 'lucide-react'

interface OrderViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
}

export function OrderViewDialog({ open, onOpenChange, order }: OrderViewDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ordine {formatOrderNumber(order.id)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Info */}
          <div className="space-y-6">
            {/* Status */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="w-fit">
                  Stato Ordine
                </Badge>
              </h3>
              <div className="flex gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  Pagamento: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {order.customerEmail}</p>
                <p><strong>ID Cliente:</strong> {order.customerId}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>Creato:</strong> {order.createdAt.toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>Aggiornato:</strong> {order.updatedAt.toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Note
                </h3>
                <p className="text-sm bg-muted p-3 rounded-md">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Shipping & Billing */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Indirizzo di Spedizione
              </h3>
              <div className="text-sm bg-muted p-3 rounded-md">
                <p className="font-medium">
                  {order.shipping?.firstName} {order.shipping?.lastName}
                </p>
                <p>{order.shippingAddress?.street || order.shipping?.street}</p>
                <p>
                  {order.shippingAddress?.postalCode || order.shipping?.postalCode}{' '}
                  {order.shippingAddress?.city || order.shipping?.city}
                </p>
                <p>{order.shippingAddress?.country || order.shipping?.country}</p>
                {order.shipping?.phone && (
                  <p className="mt-1"><strong>Tel:</strong> {order.shipping.phone}</p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pagamento
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>Metodo:</strong> {order.paymentMethod === 'manual' ? 'Bonifico Bancario' : order.paymentMethod}</p>
                <p><strong>Stato:</strong> {order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-semibold">Prodotti Ordinati</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || item.productName}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.png'
                      }}
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.name || item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantità: {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <div className="font-semibold">
                  {formatCurrency(item.total || (item.price * item.quantity))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Total */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotale:</span>
            <span>{formatCurrency(order.subtotal || order.total)}</span>
          </div>
          {order.shipping_cost && (
            <div className="flex justify-between text-sm">
              <span>Spedizione:</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Totale:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}