import { useEffect, useState } from 'react'
import useFirestore from '@hooks/useFirestore/useFirestore'
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser
} from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const { updateUserProfile } = useFirestore()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (userChange) => {
      setUser(userChange)
    })

    return () => unsubscribe()
  }, [])

  async function signIn(): Promise<void> {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(getAuth(), provider)
  }

  async function signOutUser(): Promise<void> {
    await signOut(getAuth())
  }

  function getUserName(): string | null {
    return user?.displayName || null
  }

  function getUserImage(): string | null {
    return user?.photoURL || null
  }

  function isUserSignedIn(): boolean {
    return !!user
  }

  return {
    user,
    signIn,
    signOutUser,

    getUserName,
    getUserImage,
    isUserSignedIn
  }
}