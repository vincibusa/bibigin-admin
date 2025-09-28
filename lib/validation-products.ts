import { z } from 'zod'

const productDimensionsSchema = z.object({
  length: z.number().min(0.1, "La lunghezza deve essere maggiore di 0"),
  width: z.number().min(0.1, "La larghezza deve essere maggiore di 0"),
  height: z.number().min(0.1, "L'altezza deve essere maggiore di 0"),
  unit: z.enum(['cm', 'in'], { 
    message: "Seleziona un'unità di misura" 
  })
}).optional()

export const productSchema = z.object({
  name: z.string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome non può superare i 100 caratteri"),
  
  description: z.string()
    .min(10, "La descrizione deve avere almeno 10 caratteri")
    .max(1000, "La descrizione non può superare i 1000 caratteri"),
  
  sku: z.string()
    .min(3, "Lo SKU deve avere almeno 3 caratteri")
    .max(50, "Lo SKU non può superare i 50 caratteri")
    .refine((val) => /^[A-Z0-9-_]+$/i.test(val), "Lo SKU può contenere solo lettere, numeri, trattini e underscore"),
  
  price: z.number()
    .min(0.01, "Il prezzo deve essere maggiore di 0")
    .max(9999.99, "Il prezzo non può superare €9999.99"),
  
  category: z.string()
    .min(1, "Seleziona una categoria"),
  
  imageUrl: z.string()
    .refine((val) => val === "" || /^https?:\/\/.+/.test(val) || val.startsWith("blob:"), "Inserisci un URL valido")
    .optional()
    .or(z.literal("")),
  
  images: z.array(z.string().refine((val) => /^https?:\/\/.+/.test(val) || val.startsWith("blob:"), "URL immagine non valido"))
    .optional(),
  
  stock: z.number()
    .int("La giacenza deve essere un numero intero")
    .min(0, "La giacenza non può essere negativa")
    .max(99999, "La giacenza non può superare 99999"),
  
  featured: z.boolean(),
  
  status: z.enum(['active', 'inactive', 'out_of_stock'], { 
    message: "Seleziona uno stato" 
  }),
  
  weight: z.number()
    .min(0.01, "Il peso deve essere maggiore di 0")
    .max(50, "Il peso non può superare 50kg")
    .optional(),
  
  dimensions: productDimensionsSchema,
  
  alcoholContent: z.number()
    .min(0, "La gradazione alcolica non può essere negativa")
    .max(100, "La gradazione alcolica non può superare 100%")
    .optional(),
  
  bottleSize: z.number()
    .min(0.1, "La dimensione della bottiglia deve essere maggiore di 0")
    .max(5, "La dimensione della bottiglia non può superare 5L")
    .optional()
})

export const productFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive', 'out_of_stock']).default('all'),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional()
})

export type ProductFormData = z.infer<typeof productSchema>
export type ProductFilter = z.infer<typeof productFilterSchema>

// Categories for BibiGin products
export const productCategories = [
  { value: 'gin-premium', label: 'Gin Premium' },
  { value: 'gin-limited', label: 'Edizione Limitata' },
  { value: 'gin-seasonal', label: 'Stagionale' },
  { value: 'gin-classic', label: 'Classico' },
  { value: 'accessories', label: 'Accessori' }
] as const

export const productStatuses = [
  { value: 'active', label: 'Attivo', color: 'success' },
  { value: 'inactive', label: 'Inattivo', color: 'secondary' },
  { value: 'out_of_stock', label: 'Esaurito', color: 'destructive' }
] as const