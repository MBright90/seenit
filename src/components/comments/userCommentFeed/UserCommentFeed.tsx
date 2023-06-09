import Loading from '@components/loading'
import PostPreview from '@components/posting/postPreview'
import { useComments, usePosts, useUsers } from '@hooks/index'
import React, { ReactNode, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CommentType } from 'src/customTypes/types'
import Comment from '../comment'
import FurtherComments from './furtherComments'
import style from './UserCommentFeed.module.scss'

interface PostIDsWithComments {
  postID: string
  commentArr: CommentType[]
}

const checkPostID = (arr: PostIDsWithComments[], id: string): boolean => {
  const found = arr?.some((post) => post.postID === id)
  return found
}

const UserCommentFeed: React.FC = () => {
  const { userID } = useParams()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userDisplayName, setUserDisplayName] = useState<string>('')
  const [feedData, setFeedData] = useState<ReactNode[]>([])

  const { getUsersDisplayName } = useUsers()
  const { loadUsersComments } = useComments()
  const { loadCurrentPost } = usePosts()

  useEffect(() => {
    const getUsersName = async (): Promise<void> => {
      const displayName = await getUsersDisplayName(userID!)
      setUserDisplayName(displayName)
    }

    getUsersName()
  }, [])

  useEffect(() => {
    const retrieveComments = async (): Promise<void> => {
      const retrievedComments: CommentType[] = await loadUsersComments(userID!)
      const postArr: PostIDsWithComments[] = []

      retrievedComments.forEach((currentComment) => {
        const postID = currentComment.postID
        if (checkPostID(postArr, postID)) {
          const arrIndex = postArr.findIndex((post) => post.postID === currentComment.postID)
          postArr[arrIndex].commentArr.push(currentComment)
        } else {
          postArr[postArr.length] = { postID, commentArr: [currentComment] }
        }
      })

      // Sort comments by date for each post:
      postArr.forEach((post) => {
        post.commentArr.sort((a, b) => (a.timeStamp.toDate() < b.timeStamp.toDate() ? -1 : 1))
      })

      const feedArr = await Promise.all(
        postArr.map(async (postWithCommentsObj) => {
          const { postID, commentArr } = postWithCommentsObj
          const currentPost = await loadCurrentPost(postID)
          return (
            <div className={style.postWithComments} key={postID}>
              <PostPreview currentPost={currentPost} />
              <Comment comment={commentArr[0]} />
              {commentArr.length > 1 ? <FurtherComments commentArr={commentArr.slice(1)} /> : null}
            </div>
          )
        })
      )
      setFeedData(feedArr)
      setIsLoading(false)
    }

    retrieveComments()
  }, [])

  if (isLoading) return <Loading />

  return (
    <div className={style.userCommentFeed}>
      <p className={style.feedTitle}>{`${userDisplayName}'s Comments`}</p>
      <div className={style.feedContainer}>{feedData}</div>
    </div>
  )
}

export default UserCommentFeed
