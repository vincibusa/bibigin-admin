'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { quickOrderSchema, QuickOrderData } from '@/lib/validation-orders'
import { Product } from '@/lib/types'
import { Loader2, Plus, X } from 'lucide-react'

interface QuickOrderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: QuickOrderData) => Promise<void>
  products: Product[]
}

interface ProductSelection {
  productId: string
  quantity: number
}

export function QuickOrderForm({ open, onOpenChange, onSubmit, products }: QuickOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([{ productId: '', quantity: 1 }])

  const form = useForm<QuickOrderData>({
    resolver: zodResolver(quickOrderSchema),
    defaultValues: {
      customerEmail: '',
      customerName: '',
      products: [{ productId: '', quantity: 1 }],
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Italia'
      },
      notes: ''
    }
  })

  // Update form when selectedProducts changes
  useEffect(() => {
    form.setValue('products', selectedProducts)
  }, [selectedProducts, form])

  const handleSubmit = async (data: QuickOrderData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      form.reset()
      setSelectedProducts([{ productId: '', quantity: 1 }])
      onOpenChange(false)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addProduct = () => {
    setSelectedProducts(prev => [...prev, { productId: '', quantity: 1 }])
  }

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, field: keyof ProductSelection, value: string | number) => {
    setSelectedProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl">
            Crea Ordine Rapido
          </DialogTitle>
          <DialogDescription>
            Crea un nuovo ordine inserendo i dati del cliente e i prodotti
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Cliente *</FormLabel>
                        <FormControl>
                          <Input placeholder="Mario Rossi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Cliente *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="mario.rossi@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prodotti</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProduct}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Prodotto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProducts.map((product, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Prodotto</Label>
                      <Select 
                        value={product.productId} 
                        onValueChange={(value) => updateProduct(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona prodotto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} - €{p.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-24">
                      <Label>Quantità</Label>
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    {selectedProducts.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Indirizzo di Spedizione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="shippingAddress.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Via Roma 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città *</FormLabel>
                        <FormControl>
                          <Input placeholder="Milano" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia *</FormLabel>
                        <FormControl>
                          <Input placeholder="MI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CAP *</FormLabel>
                        <FormControl>
                          <Input placeholder="20100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (opzionale)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Note aggiuntive per l'ordine..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-navy hover:bg-navy/90 text-cream"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Crea Ordine
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}