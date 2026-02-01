
import { Post } from '@/types/post'
import http from './http'

export const getFeed = (page = 1): Promise<Post> =>
  http.get(`/posts?page=${page}`)

export const createPost = (data: FormData) =>
  http.post('/posts', data)
