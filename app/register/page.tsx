'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { registerSchema, RegisterForm } from "@/lib/validation"
import { registerWithEmail, signInWithGoogle } from "@/lib/auth"
import Link from "next/link"
import { FirebaseError } from 'firebase/app'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  })

  async function onSubmit(values: RegisterForm) {
    setIsLoading(true)
    try {
      await registerWithEmail(values)
      router.push('/login?message=Registrazione completata con successo')
    } catch (error) {
      console.error('Errore durante la registrazione:', error)
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            form.setError('email', { message: 'Questa email è già registrata' })
            break
          case 'auth/weak-password':
            form.setError('password', { message: 'La password è troppo debole' })
            break
          default:
            form.setError('email', { message: 'Errore durante la registrazione' })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result.isNewUser) {
        // Redirect to complete profile if new user
        router.push('/complete-profile')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Errore durante l\'accesso con Google:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-cosmic-gradient opacity-5" />
      
      <Card className="w-full max-w-2xl relative z-10 border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-navy flex items-center justify-center">
            <span className="text-cream font-playfair font-bold text-2xl">B</span>
          </div>
          <div>
            <CardTitle className="font-playfair text-2xl font-bold text-card-foreground">
              Registrati a BibiGin
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Crea il tuo account per accedere al premium gin
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? "Accesso in corso..." : "Continua con Google"}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">oppure</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Nome e Cognome */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Mario" 
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Rossi" 
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email e Telefono */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="mario.rossi@email.com" 
                          type="email"
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+39 123 456 7890" 
                          type="tel"
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Data di nascita */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data di nascita *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1990-01-01" 
                        type="date"
                        className="bg-background border-border focus:border-accent focus:ring-accent/30"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Indirizzo */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Via Roma, 123" 
                        className="bg-background border-border focus:border-accent focus:ring-accent/30"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Città, Provincia, CAP */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Città *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Milano" 
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MI" 
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAP *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="20100" 
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          placeholder="••••••••" 
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conferma Password *</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          placeholder="••••••••" 
                          className="bg-background border-border focus:border-accent focus:ring-accent/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Termini e condizioni */}
              <FormField
                control={form.control}
                name="acceptedTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Accetto i{' '}
                        <Link href="/terms" className="text-accent hover:underline">
                          termini e condizioni
                        </Link>{' '}
                        e la{' '}
                        <Link href="/privacy" className="text-accent hover:underline">
                          privacy policy
                        </Link>
                        *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-navy hover:bg-navy/90 text-cream" 
                disabled={isLoading}
              >
                {isLoading ? "Registrazione in corso..." : "Registrati"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Hai già un account?{' '}
              <Link href="/login" className="text-accent hover:underline">
                Accedi qui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}