'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'

interface AdminGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, userData, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login')
        return
      }
      
      if (userData && !isAdmin) {
        // Authenticated but not admin, redirect to access denied
        router.push('/access-denied')
        return
      }
    }
  }, [user, userData, loading, isAdmin, router])

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto mb-4"></div>
              <p className="text-muted-foreground">Caricamento...</p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!user) {
    return null
  }

  // If not admin, don't render children (redirect will happen)
  if (userData && !isAdmin) {
    return null
  }

  // If userData is still loading (authenticated but user data not yet fetched)
  if (!userData) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifica dei permessi...</p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  // User is authenticated and is admin, render children
  return <>{children}</>
}

// Higher-order component for page-level protection
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminGuard>
        <Component {...props} />
      </AdminGuard>
    )
  }
}