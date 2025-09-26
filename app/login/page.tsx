'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginForm) {
    setIsLoading(true)
    // Simulazione login
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(values)
    setIsLoading(false)
    // Redirect to dashboard
    window.location.href = "/"
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
              BibiGin Admin
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Accedi al gestionale amministrativo
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
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
                        placeholder="admin@bibigin.com" 
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
                      <Input 
                        placeholder="••••••••" 
                        type="password"
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
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Gestionale Amministrativo BibiGin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}