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
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { productSchema, ProductFormData, productCategories, productStatuses } from '@/lib/validation-products'
import { Product } from '@/lib/types'
import { uploadProductImage, validateImageFile } from '@/lib/storage'
import { Loader2, Plus, X } from 'lucide-react'

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProductFormData) => Promise<void>
  product?: Product | null
  mode: 'create' | 'edit'
}

export function ProductForm({ open, onOpenChange, onSubmit, product, mode }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingAdditional, setUploadingAdditional] = useState<number[]>([])

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      price: 0,
      category: '',
      imageUrl: '',
      images: [],
      stock: 0,
      featured: false,
      status: 'active',
      weight: 0,
      dimensions: undefined,
      alcoholContent: 0,
      bottleSize: 0
    }
  })

  // Update form when product changes
  useEffect(() => {
    if (product && mode === 'edit') {
      form.reset({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        price: product.price || 0,
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        images: product.images || [],
        stock: product.stock || 0,
        featured: product.featured || false,
        status: product.status || 'active',
        weight: product.weight || 0,
        dimensions: product.dimensions || undefined,
        alcoholContent: product.alcoholContent || 0,
        bottleSize: product.bottleSize || 0
      })
      setAdditionalImages(product.images || [])
    } else if (mode === 'create') {
      form.reset({
        name: '',
        description: '',
        sku: '',
        price: 0,
        category: '',
        imageUrl: '',
        images: [],
        stock: 0,
        featured: false,
        status: 'active',
        weight: 0,
        dimensions: undefined,
        alcoholContent: 0,
        bottleSize: 0
      })
      setAdditionalImages([])
    }
  }, [product, mode, form])

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit({ ...data, images: additionalImages })
      form.reset()
      setAdditionalImages([])
      onOpenChange(false)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addImageUrl = () => {
    setAdditionalImages(prev => [...prev, ''])
  }

  const updateImageUrl = (index: number, url: string) => {
    setAdditionalImages(prev => prev.map((img, i) => i === index ? url : img))
  }

  const removeImageUrl = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  // Handle main image upload
  const handleMainImageUpload = async (file: File) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      // You could use a toast here
      console.error(validation.error)
      return
    }

    try {
      setUploadingMain(true)
      const downloadURL = await uploadProductImage(file, product?.id)
      form.setValue('imageUrl', downloadURL)
    } catch (error) {
      console.error('Error uploading main image:', error)
    } finally {
      setUploadingMain(false)
    }
  }

  // Handle additional image upload
  const handleAdditionalImageUpload = async (file: File, index: number) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      console.error(validation.error)
      return
    }

    try {
      setUploadingAdditional(prev => [...prev, index])
      const downloadURL = await uploadProductImage(file, product?.id)
      updateImageUrl(index, downloadURL)
    } catch (error) {
      console.error('Error uploading additional image:', error)
    } finally {
      setUploadingAdditional(prev => prev.filter(i => i !== index))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-playfair text-lg sm:text-xl">
            {mode === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {mode === 'create' 
              ? 'Aggiungi un nuovo prodotto al catalogo BibiGin'
              : 'Modifica le informazioni del prodotto'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                <TabsTrigger value="basic" className="text-xs sm:text-sm">Base</TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm">Media</TabsTrigger>
                <TabsTrigger value="details" className="text-xs sm:text-sm">Dettagli</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informazioni Base</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Prodotto *</FormLabel>
                            <FormControl>
                              <Input placeholder="BibiGin Luna Nuova" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU *</FormLabel>
                            <FormControl>
                              <Input placeholder="BG-LN-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrizione dettagliata del prodotto..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prezzo (€) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="45.00"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giacenza *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="100"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productCategories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stato *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona stato" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productStatuses.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Prodotto in evidenza</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Mostra questo prodotto in homepage
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media */}
              <TabsContent value="media" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Immagini Prodotto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Immagine Principale</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                type="file"
                                accept="image/*"
                                disabled={uploadingMain}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleMainImageUpload(file)
                                  }
                                }}
                              />
                              {uploadingMain && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Caricamento in corso...
                                </div>
                              )}
                            </div>
                          </FormControl>
                          {field.value && !uploadingMain && (
                            <div className="mt-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={field.value} 
                                alt="Preview" 
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Immagini Aggiuntive</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addImageUrl}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Aggiungi Immagine
                        </Button>
                      </div>
                      
                      {additionalImages.map((url, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              disabled={uploadingAdditional.includes(index)}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleAdditionalImageUpload(file, index)
                                }
                              }}
                            />
                            {uploadingAdditional.includes(index) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Caricamento in corso...
                              </div>
                            )}
                            {url && !uploadingAdditional.includes(index) && (
                              <div className="mt-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={url} 
                                  alt={`Preview ${index + 1}`} 
                                  className="w-24 h-24 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingAdditional.includes(index)}
                            onClick={() => removeImageUrl(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details */}
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dettagli Tecnici</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.75"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alcoholContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gradazione Alcolica (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                placeholder="40.0"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bottleSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dimensione Bottiglia (L)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                placeholder="0.7"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-10 sm:h-9"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-navy hover:bg-navy/90 text-cream h-10 sm:h-9"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <span className="text-sm sm:text-base">
                  {mode === 'create' ? 'Crea Prodotto' : 'Salva Modifiche'}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}