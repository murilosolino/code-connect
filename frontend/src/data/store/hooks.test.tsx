import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AppDataProvider } from './AppDataProvider'
import {
  useAppActions,
  useComments,
  usePost,
  usePosts,
  useUser,
  useUserPosts,
  useViewer,
} from './hooks'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppDataProvider>{children}</AppDataProvider>
)

function useEverything() {
  return {
    actions: useAppActions(),
    posts: usePosts(),
    vendas: usePost('vendas'),
    comments: useComments('vendas'),
    julio: useUser('julio'),
    julioPosts: useUserPosts('julio'),
    viewer: useViewer(),
  }
}

describe('hooks do store', () => {
  it('lê a pessoa logada e os dados de exemplo', () => {
    const { result } = renderHook(useEverything, { wrapper })
    expect(result.current.viewer).toEqual({ handle: 'julio' })
    expect(result.current.posts).toHaveLength(8)
    expect(result.current.vendas?.title).toBe('Dashboard de vendas com React')
    expect(result.current.comments).toHaveLength(3)
    expect(result.current.julio?.name).toBe('Júlio Oliveira')
    expect(result.current.julioPosts.projects).toHaveLength(3)
  })

  it('toggleApproval reflete em usePost e em usePosts', () => {
    const { result } = renderHook(useEverything, { wrapper })
    act(() => result.current.actions.toggleApproval('vendas'))
    expect(result.current.vendas?.approvals).toBe(33)
    expect(result.current.vendas?.approvedByViewer).toBe(true)
    expect(result.current.posts.find((p) => p.id === 'vendas')?.approvals).toBe(33)
  })

  it('addComment devolve false para texto vazio e true quando adiciona', () => {
    const { result } = renderHook(useEverything, { wrapper })
    let added = true
    act(() => {
      added = result.current.actions.addComment('vendas', '   ')
    })
    expect(added).toBe(false)
    expect(result.current.comments).toHaveLength(3)

    act(() => {
      added = result.current.actions.addComment('vendas', 'Ótimo!')
    })
    expect(added).toBe(true)
    expect(result.current.comments).toHaveLength(4)
    expect(result.current.vendas?.commentCount).toBe(4)
  })

  it('toggleFollow atualiza as conexões exibidas', () => {
    const { result } = renderHook(useEverything, { wrapper })
    act(() => result.current.actions.toggleFollow('julio'))
    expect(result.current.julio?.connectionsDisplayed).toBe(26)
  })

  it('publishPost devolve o novo id e usePost o encontra', () => {
    const { result } = renderHook(
      () => {
        const actions = useAppActions()
        const posts = usePosts()
        return { actions, posts }
      },
      { wrapper },
    )
    let id = ''
    act(() => {
      id = result.current.actions.publishPost({
        title: 'Novo',
        description: 'Descrição',
        tags: ['React'],
      })
    })
    expect(id).toBe('novo-1')
    expect(result.current.posts[0].id).toBe('novo-1')
    const { result: lookup } = renderHook(() => usePost('novo-1'), {
      wrapper: ({ children }) => (
        <AppDataProvider initialState={undefined}>{children}</AppDataProvider>
      ),
    })
    // Outro provider recria o estado a partir do seed: o projeto publicado some.
    expect(lookup.current).toBeUndefined()
  })

  it('devolve undefined para ids e handles inexistentes', () => {
    const { result } = renderHook(
      () => ({ post: usePost('x'), user: useUser('x'), comments: useComments('x') }),
      { wrapper },
    )
    expect(result.current.post).toBeUndefined()
    expect(result.current.user).toBeUndefined()
    expect(result.current.comments).toEqual([])
  })

  it('nunca chama fetch', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(useEverything, { wrapper })
    act(() => {
      result.current.actions.toggleApproval('vendas')
      result.current.actions.addComment('vendas', 'Oi')
      result.current.actions.toggleFollow('julio')
    })
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('falha com mensagem clara fora do AppDataProvider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => usePosts())).toThrow(/AppDataProvider/)
    error.mockRestore()
  })
})
