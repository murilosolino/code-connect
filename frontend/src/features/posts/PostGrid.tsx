import type { ReactNode } from 'react'
import type { PostView } from '../../data/types'
import { PostCard } from './PostCard'

type Props = {
  posts: PostView[]
  /** Nome da lista para leitores de tela. */
  label: string
  /** Mostrado no lugar da grade quando não há projetos. */
  empty: ReactNode
}

/** Grade de cards: colunas de no mínimo 400px (Feed e abas do Perfil). */
export function PostGrid({ posts, label, empty }: Props) {
  if (posts.length === 0) return <>{empty}</>

  return (
    <ul aria-label={label} className="grid-cards">
      {posts.map((post) => (
        <li key={post.id} className="flex">
          <PostCard post={post} size="feed" />
        </li>
      ))}
    </ul>
  )
}
