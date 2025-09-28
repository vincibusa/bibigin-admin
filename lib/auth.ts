import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import { User as AppUser } from './types'
import { RegisterForm } from './validation'

export async function registerWithEmail(formData: RegisterForm): Promise<User> {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, 
      formData.password
    )
    
    const user = userCredential.user
    
    // Update display name
    await updateProfile(user, {
      displayName: `${formData.firstName} ${formData.lastName}`
    })
    
    // Create user document in Firestore
    const userData: Omit<AppUser, 'id'> = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      dateOfBirth: new Date(formData.dateOfBirth),
      address: formData.address,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
      role: 2, // Default: normal user
      isActive: true,
      acceptedTerms: formData.acceptedTerms,
      authProvider: 'email',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return user
  } catch (error) {
    throw error
  }
}

export async function signInWithGoogle(): Promise<{ user: User; isNewUser: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const isNewUser = !userDoc.exists()
    
    if (isNewUser) {
      // Create basic user document for Google sign-in
      // Additional data will need to be collected separately
      const userData: Partial<AppUser> = {
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        role: 2, // Default: normal user
        isActive: true,
        authProvider: 'google',
        acceptedTerms: false, // Will need to be collected
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } else {
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    
    return { user, isNewUser }
  } catch (error) {
    throw error
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update last login
    await updateDoc(doc(db, 'users', user.uid), {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return user
  } catch (error) {
    throw error
  }
}

export async function signOutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getCurrentUserData(uid: string): Promise<AppUser | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as AppUser
    }
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

export async function updateUserData(uid: string, data: Partial<AppUser>): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    throw error
  }
}