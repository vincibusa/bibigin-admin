import { z } from 'zod'

// Validazione per l'età maggiorenne
const isAdult = (date: Date) => {
  const today = new Date()
  const birthDate = new Date(date)
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18
  }
  return age >= 18
}

export const registerSchema = z.object({
  firstName: z.string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(50, "Il nome non può superare i 50 caratteri")
    .refine((val) => /^[a-zA-ZÀ-ÿ\s']+$/.test(val), "Il nome può contenere solo lettere, spazi e apostrofi"),
  
  lastName: z.string()
    .min(2, "Il cognome deve avere almeno 2 caratteri")
    .max(50, "Il cognome non può superare i 50 caratteri")
    .refine((val) => /^[a-zA-ZÀ-ÿ\s']+$/.test(val), "Il cognome può contenere solo lettere, spazi e apostrofi"),
  
  email: z.string()
    .email("Inserisci un'email valida")
    .min(1, "L'email è obbligatoria"),
  
  phone: z.string()
    .min(10, "Il numero di telefono deve avere almeno 10 cifre")
    .max(15, "Il numero di telefono non può superare i 15 caratteri")
    .refine((val) => /^[\+]?[\d\s\-\(\)]+$/.test(val), "Formato numero di telefono non valido"),
  
  dateOfBirth: z.string()
    .min(1, "La data di nascita è obbligatoria")
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, "Data di nascita non valida")
    .refine((val) => {
      const date = new Date(val)
      return isAdult(date)
    }, "Devi essere maggiorenne per registrarti"),
  
  address: z.string()
    .min(5, "L'indirizzo deve avere almeno 5 caratteri")
    .max(100, "L'indirizzo non può superare i 100 caratteri"),
  
  city: z.string()
    .min(2, "La città deve avere almeno 2 caratteri")
    .max(50, "La città non può superare i 50 caratteri")
    .refine((val) => /^[a-zA-ZÀ-ÿ\s']+$/.test(val), "La città può contenere solo lettere, spazi e apostrofi"),
  
  province: z.string()
    .min(2, "La provincia deve avere almeno 2 caratteri")
    .max(50, "La provincia non può superare i 50 caratteri")
    .refine((val) => /^[a-zA-ZÀ-ÿ\s']+$/.test(val), "La provincia può contenere solo lettere, spazi e apostrofi"),
  
  postalCode: z.string()
    .min(5, "Il CAP deve avere 5 cifre")
    .max(5, "Il CAP deve avere 5 cifre")
    .refine((val) => /^\d{5}$/.test(val), "Il CAP deve contenere solo 5 cifre"),
  
  password: z.string()
    .min(8, "La password deve avere almeno 8 caratteri")
    .max(100, "La password non può superare i 100 caratteri")
    .refine((val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(val), 
      "La password deve contenere almeno: 1 minuscola, 1 maiuscola, 1 numero, 1 carattere speciale"),
  
  confirmPassword: z.string()
    .min(1, "Conferma la password"),
  
  acceptedTerms: z.boolean()
    .refine((val) => val === true, "Devi accettare i termini e condizioni")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"]
})

export const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "La password è obbligatoria"),
})

export type RegisterForm = z.infer<typeof registerSchema>
export type LoginForm = z.infer<typeof loginSchema>