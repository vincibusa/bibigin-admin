import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCl4MqY6JJl7deD10EPMZNoBra-W3ZJnpI",
  authDomain: "bibiginlacorte.firebaseapp.com",
  projectId: "bibiginlacorte",
  storageBucket: "bibiginlacorte.firebasestorage.app",
  messagingSenderId: "855780980251",
  appId: "1:855780980251:web:93f9f41f1878285af66abe",
  measurementId: "G-9Y8C9NBE5R"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app