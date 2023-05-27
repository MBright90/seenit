import React, { useEffect, useState } from 'react'

import { useAuth, useFirestore } from '@hooks/index'
import style from './PostPreview.module.scss'
import { UserType, PostType } from 'src/customTypes/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as hollowStar, faMessage } from '@fortawesome/free-regular-svg-icons'
import { PostLink } from '@routes/posts'

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const generateAddressID = (title: string, ID: string) => {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/gi, '')
  const formulatedID = `${normalizedTitle.replaceAll(' ', '_')}_${ID}`
  return formulatedID
}

interface PostProps {
  currentPost: PostType
}

const Post: React.FC<PostProps> = ({ currentPost }) => {
  const [userHasFavorite, setUserHasFavorite] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState<number>(currentPost.favorites!)
  const [author, setAuthor] = useState<UserType>({ uid: '', displayName: ' ', photoURL: '' })

  const { user } = useAuth()
  const {
    checkFavoriteStatus,
    loadUserProfile,
    setFavoriteStatus,
    incrementFavoriteCount,
    decrementFavoriteCount
  } = useFirestore()

  useEffect(() => {
    const loadAuthorProfile = async () => {
      const firestoreAuthor = await loadUserProfile(currentPost.authorID)
      setAuthor(firestoreAuthor)
    }

    loadAuthorProfile()
  }, [])

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (user) {
        const favoriteStatus = await checkFavoriteStatus(user.uid, currentPost.ID)
        setUserHasFavorite(favoriteStatus)
      }
    }

    loadFavoriteStatus()
  }, [user])

  function toggleFavorite(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setFavoriteStatus(user!.uid, currentPost.ID)
    if (!userHasFavorite) {
      incrementFavoriteCount(currentPost.ID)
      setFavoriteCount((prevCount) => prevCount + 1)
    } else {
      decrementFavoriteCount(currentPost.ID)
      setFavoriteCount((prevCount) => prevCount - 1)
    }
    setUserHasFavorite(!userHasFavorite)
  }

  const timePosted = currentPost.timeStamp!.toDate()
  const postAddressID = generateAddressID(currentPost.title, currentPost.ID)

  const postComponent = (
    <div className={`${style.post} ${style.postPreview}`} data-post-id={currentPost.ID}>
      <p className={style.headline}>
        <button className={style.favoriteButton} onClick={toggleFavorite}>
          <FontAwesomeIcon
            className={style.starIcon}
            icon={userHasFavorite ? solidStar : hollowStar}
          />
        </button>
        <span className={style.postTitle}>{currentPost.title}</span>
      </p>
      <p className={style.postBody}>{currentPost.body}</p>
      <div className={style.postInfo}>
        <p className={style.postTimestamp}>
          {[
            `${timePosted.getHours()}:${timePosted.getMinutes()} `,
            `${months[timePosted.getMonth()]} ${timePosted.getFullYear()}`
          ]}
        </p>
        <p className={style.postCommentCount}>
          {currentPost.comments?.length || 0} <FontAwesomeIcon icon={faMessage} />
        </p>
        <p className={style.postFavoriteCount}>
          {favoriteCount}
          <FontAwesomeIcon className={style.starIcon} icon={solidStar} />
        </p>
        <div className={style.authorContainer}>
          <img className={style.postAuthorImg} src={author.photoURL} alt="User's image" />
          <p className={style.postAuthor}>{author.displayName}</p>
        </div>
      </div>
    </div>
  )

  return <PostLink postID={postAddressID}>{postComponent}</PostLink>
}

export default Post