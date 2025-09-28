'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { onAuthStateChange, getCurrentUserData, signOutUser } from './auth'
import { User as AppUser } from './types'

interface AuthContextType {
  user: FirebaseUser | null
  userData: AppUser | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {}
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const appUserData = await getCurrentUserData(firebaseUser.uid)
          setUserData(appUserData)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUserData(null)
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setUser(null)
      setUserData(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Check if user is admin (role === 1)
  const isAdmin = userData?.role === 1

  const value: AuthContextType = {
    user,
    userData,
    loading,
    isAdmin,
    signOut: handleSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}