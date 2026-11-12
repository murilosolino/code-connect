/**
 * A única porta entre as telas e os dados.
 * Na integração com a API, só a implementação destes hooks muda.
 */
import { useContext, useMemo } from 'react'
import type { Comment, PostView, UserView } from '../types'
import { AppDataContext } from './AppDataContext'
import { nextPostId, type PublishInput } from './reducer'
import { selectPostView, selectPostViews, selectUserPosts, selectUserView } from './selectors'

function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('Os hooks de dados precisam estar dentro de <AppDataProvider>.')
  }
  return context
}

const NO_COMMENTS: Comment[] = []

export function usePosts(): PostView[] {
  const { state } = useAppData()
  return useMemo(() => selectPostViews(state), [state])
}

export function usePost(id: string): PostView | undefined {
  const { state } = useAppData()
  return useMemo(() => selectPostView(state, id), [state, id])
}

export function useComments(postId: string): Comment[] {
  const { state } = useAppData()
  return state.comments[postId] ?? NO_COMMENTS
}

export function useUser(handle: string): UserView | undefined {
  const { state } = useAppData()
  return useMemo(() => selectUserView(state, handle), [state, handle])
}

export function useUserPosts(handle: string): { projects: PostView[]; approved: PostView[] } {
  const { state } = useAppData()
  return useMemo(() => selectUserPosts(state, handle), [state, handle])
}

export function useViewer(): { handle: string } {
  const { state } = useAppData()
  return useMemo(() => ({ handle: state.viewer.handle }), [state.viewer.handle])
}

export function useAppActions() {
  const { state, dispatch } = useAppData()
  return useMemo(
    () => ({
      toggleApproval: (postId: string): void => dispatch({ type: 'toggleApproval', postId }),

      /** Devolve false, sem alterar nada, se o texto estiver vazio ou o projeto não existir. */
      addComment: (postId: string, text: string): boolean => {
        if (text.trim() === '' || !state.comments[postId]) return false
        dispatch({ type: 'addComment', postId, text })
        return true
      },

      toggleFollow: (handle: string): void => dispatch({ type: 'toggleFollow', handle }),

      /** Devolve o id do projeto criado. Pressupõe entrada já validada pela tela. */
      publishPost: (input: PublishInput): string => {
        const id = nextPostId(state)
        dispatch({ type: 'publishPost', input })
        return id
      },
    }),
    [state, dispatch],
  )
}
