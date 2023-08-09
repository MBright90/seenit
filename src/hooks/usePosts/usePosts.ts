/* eslint-disable no-console */
import { UserType, PostType, ImageUploadData, ApiReturn, PostEdit } from 'src/customTypes/types'
import resizeImage from '@utils/resizeImage'
import {
  collection,
  addDoc,
  query,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
  getDocs,
  updateDoc,
  where,
  increment,
  Firestore,
  DocumentReference,
  DocumentSnapshot,
  CollectionReference,
  QuerySnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import {
  ref,
  StorageReference,
  uploadBytesResumable,
  getDownloadURL,
  UploadMetadata,
  deleteObject
} from 'firebase/storage'
import deletedPost from '@utils/placeholders/deletedPost'
import { firestore, storage } from '@src/firebase'

function generateID(): string {
  return Date.now().toString()
}

function usePosts() {
  const firestoreDB: Firestore = firestore
  const postDB: CollectionReference = collection(firestoreDB, 'posts')
  //*******************//
  //****** Posts ******//
  //*******************//

  async function writeImage(
    image: File,
    postID: string,
    authorID: string
  ): Promise<ImageUploadData> {
    try {
      const filePath = `${authorID}/${postID}`
      const newImageRef: StorageReference = ref(storage, filePath)
      const metaData: UploadMetadata = {
        contentType: 'image/jpeg'
      }
      const resizedImage = await resizeImage(image, 1080)
      await uploadBytesResumable(newImageRef, resizedImage, metaData)

      const imageURL: string = await getDownloadURL(newImageRef)
      return { publicUrl: imageURL, imageRef: newImageRef }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  async function writePost(post: PostType): Promise<ApiReturn> {
    let imageData: ImageUploadData | null = null
    const postID = generateID()

    try {
      if (post.image) {
        imageData = await writeImage(post.image, postID, post.authorID)
      }
      const result: DocumentReference = await addDoc(postDB, {
        ID: postID,
        timeStamp: serverTimestamp(),
        authorID: post.authorID,
        title: post.title,
        body: post.body,
        comments: 0,
        imageUrl: imageData?.publicUrl || null,
        favorites: 0
      })
      if (result) return { success: true, reference: result, id: postID }
    } catch (error) {
      console.error(error)
      // If image has been uploaded, but post fails to upload, remove the
      // uploaded image
      if (imageData) {
        deleteObject(imageData.imageRef)
      }
    }
    return { success: false, reference: null, error: 'Error publishing post' }
  }

  async function editPost(editedPost: PostEdit): Promise<ApiReturn> {
    try {
      const querySnapshot: QuerySnapshot = await getDocs(
        query(postDB, where('ID', '==', editedPost.ID))
      )
      const postDoc: QueryDocumentSnapshot = querySnapshot.docs[0]
      console.log(postDoc)
      if (postDoc.exists()) {
        await setDoc(
          postDoc.ref,
          {
            title: editedPost.title,
            body: editedPost.body,
            edited: true
          },
          { merge: true }
        )
        return { success: true, reference: postDoc.ref, id: editedPost.ID }
      }
    } catch (error) {
      console.log('Error editing post:', error)
    }
    return { success: false, reference: null, error: 'Error editing post' }
  }

  async function loadCurrentPost(postID: string): Promise<PostType> {
    try {
      const querySnapshot: QuerySnapshot = await getDocs(query(postDB, where('ID', '==', postID)))

      const postDoc: QueryDocumentSnapshot = querySnapshot.docs[0]
      return postDoc.data() as PostType
    } catch (error) {
      console.error('Error loading post:', error)
    }
    return deletedPost
  }

  async function setFavoriteStatus(userID: string, postID: string): Promise<void> {
    try {
      const userRef: DocumentReference = doc(collection(firestoreDB, 'users'), userID)
      const userDoc: DocumentSnapshot = await getDoc(userRef)
      const userFavoritesArr: string[] = userDoc.data()?.favorites

      if (userFavoritesArr.includes(postID)) {
        const IDIndex: number = userFavoritesArr.indexOf(postID)
        userFavoritesArr.splice(IDIndex, 1)
      } else {
        userFavoritesArr.push(postID)
      }

      await setDoc(
        userRef,
        {
          favorites: userFavoritesArr
        },
        { merge: true }
      )
    } catch (error) {
      console.error('Error changing favorite status:', error)
    }
  }

  async function checkFavoriteStatus(userID: string, postID: string): Promise<boolean> {
    try {
      const userRef: DocumentReference = doc(collection(firestoreDB, 'users'), userID)
      const userDoc: DocumentSnapshot = await getDoc(userRef)
      const userData = userDoc?.data() as UserType
      if (userData?.favorites?.includes(postID)) return true
    } catch (error) {
      console.error('Error checking favorites:', error)
    }
    return false
  }

  async function incrementFavoriteCount(postID: string, incrementAmount: number): Promise<void> {
    try {
      const querySnapshot: QuerySnapshot = await getDocs(query(postDB, where('ID', '==', postID)))

      const postRef: DocumentReference = querySnapshot.docs[0].ref

      await updateDoc(postRef, {
        favorites: increment(incrementAmount)
      })
    } catch (error) {
      console.error('Error incrementing favorite count:', error)
    }
  }

  return {
    writePost,
    editPost,
    loadCurrentPost,

    setFavoriteStatus,
    checkFavoriteStatus,
    incrementFavoriteCount
  }
}

export default usePosts
