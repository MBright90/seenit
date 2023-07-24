import React, { useEffect, useState } from 'react'
import Post from '@components/posting/post'

import style from './PostPage.module.scss'
import NewCommentForm from '@components/comments/newCommentForm'
import CommentFeed from '@components/comments/commentFeed'
import { PostType } from 'src/customTypes/types'
import { useParams } from 'react-router-dom'
import { usePosts } from '@hooks/index'
import Loading from '@components/loading'

const PostPage: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<PostType | null>()
  const [loading, setLoading] = useState<boolean>(true)

  const { loadCurrentPost } = usePosts()
  const { postID } = useParams()

  useEffect(() => {
    const loadPost = async (): Promise<void> => {
      try {
        const retrievedPost: PostType = await loadCurrentPost(postID!)
        setCurrentPost(retrievedPost)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }

    loadPost()
  }, [postID])

  if (loading) return <Loading />

  if (currentPost)
    return (
      <div className={style.postPage}>
        <Post currentPost={currentPost} />
        <NewCommentForm />
        <CommentFeed commentIDs={currentPost.comments} />
      </div>
    )
  else return <Loading />
}

export default PostPage
