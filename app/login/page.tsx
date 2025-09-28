'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginSchema, LoginForm } from "@/lib/validation"
import { signInWithEmail, signInWithGoogle, getCurrentUserData, signOutUser } from "@/lib/auth"
import Link from "next/link"
import { FirebaseError } from 'firebase/app'

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginForm) {
    setIsLoading(true)
    try {
      const user = await signInWithEmail(values.email, values.password)
      
      // Get user data to check role
      const userData = await getCurrentUserData(user.uid)
      
      if (!userData) {
        form.setError('email', { message: 'Errore nel recupero dei dati utente' })
        return
      }
      
      if (userData.role !== 1) {
        // User is not admin, sign out and show error
        await signOutUser()
        form.setError('email', { 
          message: 'Accesso limitato agli amministratori. Questo gestionale è riservato agli admin.' 
        })
        return
      }
      
      // User is admin, proceed to dashboard
      router.push('/')
    } catch (error) {
      console.error('Errore durante il login:', error)
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            form.setError('email', { message: 'Email o password non corretti' })
            break
          case 'auth/too-many-requests':
            form.setError('email', { message: 'Troppi tentativi. Riprova più tardi' })
            break
          default:
            form.setError('email', { message: 'Errore durante l\'accesso' })
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
        // New users will have role 2 by default, not allowed in admin
        await signOutUser()
        form.setError('email', { 
          message: 'Nuovo account creato. Accesso limitato agli amministratori esistenti.' 
        })
        return
      }
      
      // Get user data to check role
      const userData = await getCurrentUserData(result.user.uid)
      
      if (!userData) {
        form.setError('email', { message: 'Errore nel recupero dei dati utente' })
        return
      }
      
      if (userData.role !== 1) {
        // User is not admin, sign out and show error
        await signOutUser()
        form.setError('email', { 
          message: 'Accesso limitato agli amministratori. Questo gestionale è riservato agli admin.' 
        })
        return
      }
      
      // User is admin, proceed to dashboard
      router.push('/')
    } catch (error) {
      console.error('Errore durante l\'accesso con Google:', error)
      form.setError('email', { message: 'Errore durante l\'accesso con Google' })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-cosmic-gradient opacity-5" />
      
      <Card className="w-full max-w-md relative z-10 border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-navy flex items-center justify-center">
            <span className="text-cream font-playfair font-bold text-2xl">B</span>
          </div>
          <div>
            <CardTitle className="font-playfair text-2xl font-bold text-card-foreground">
              BibiGin
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Accedi al tuo account
            </CardDescription>
          </div>
          {message && (
            <div className="p-3 text-sm bg-accent/10 text-accent rounded-md">
              {message}
            </div>
          )}
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">Email</FormLabel>
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-card-foreground">Password</FormLabel>
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
              
              <Button 
                type="submit" 
                className="w-full bg-navy hover:bg-navy/90 text-cream" 
                disabled={isLoading}
              >
                {isLoading ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Non hai un account?{' '}
              <Link href="/register" className="text-accent hover:underline">
                Registrati qui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}