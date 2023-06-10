/* eslint-disable no-console */
import { UserType } from 'src/customTypes/types'

import { User } from 'firebase/auth'
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDoc,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  CollectionReference
} from 'firebase/firestore'

function useUsers() {
  const firestoreDB: Firestore = getFirestore()

  async function updateUserProfile(currentUser: User) {
    try {
      const userDB: CollectionReference = collection(firestoreDB, 'users')
      const userRef: DocumentReference = doc(userDB, currentUser.uid)
      const userDoc: DocumentSnapshot = await getDoc(userRef)
      if (userDoc.exists()) {
        await setDoc(
          userRef,
          {
            displayName: currentUser?.displayName,
            photoURL: currentUser?.photoURL
          },
          { merge: true }
        )
      } else {
        await setDoc(userRef, {
          uid: currentUser?.uid,
          displayName: currentUser?.displayName,
          photoURL: currentUser?.photoURL,
          favorites: []
        })
      }
    } catch (error) {
      console.error('Error updating user information:', error)
      throw error
    }
  }

  async function loadUserProfile(uid: string): Promise<UserType> {
    try {
      const userDB: CollectionReference = collection(firestoreDB, 'users')
      const userRef: DocumentReference = doc(userDB, uid)
      const userDoc: DocumentSnapshot = await getDoc(userRef)
      return userDoc.data() as UserType
    } catch (error) {
      console.error('Error loading userProfile:', error)
      throw error
    }
  }

  async function getUsersDisplayName(uid: string): Promise<string> {
    try {
      const userDB: CollectionReference = collection(firestoreDB, 'users')
      const userRef: DocumentReference = doc(userDB, uid)
      const userDoc: DocumentSnapshot = await getDoc(userRef)
      const userData = userDoc.data() as UserType
      return userData.displayName
    } catch (error) {
      console.error('Error loading users display name:', error)
      throw error
    }
  }

  return {
    updateUserProfile,

    loadUserProfile,
    getUsersDisplayName
  }
}

export default useUsers
