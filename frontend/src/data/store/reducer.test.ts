import { describe, expect, it } from 'vitest'
import { createSeedState } from '../seed'
import type { AppState } from '../types'
import { appReducer } from './reducer'

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

const freshState = (): AppState => deepFreeze(createSeedState())
const post = (state: AppState, id: string) => state.posts.find((p) => p.id === id)!

describe('toggleApproval', () => {
  it('aprova: soma 1 ao contador e registra o id na pessoa logada', () => {
    const state = freshState()
    const next = appReducer(state, { type: 'toggleApproval', postId: 'vendas' })
    expect(post(next, 'vendas').approvals).toBe(33)
    expect(next.viewer.approvedPostIds).toContain('vendas')
  })

  it('desaprova: volta ao valor e ao estado anteriores', () => {
    const approved = appReducer(freshState(), { type: 'toggleApproval', postId: 'vendas' })
    const next = appReducer(approved, { type: 'toggleApproval', postId: 'vendas' })
    expect(post(next, 'vendas').approvals).toBe(32)
    expect(next.viewer.approvedPostIds).not.toContain('vendas')
  })

  it('tira 1 de um projeto já aprovado no seed', () => {
    const next = appReducer(freshState(), { type: 'toggleApproval', postId: 'auth' })
    expect(post(next, 'auth').approvals).toBe(20)
    expect(next.viewer.approvedPostIds).toEqual(['tarefas'])
  })

  it('ignora um id inexistente', () => {
    const state = freshState()
    expect(appReducer(state, { type: 'toggleApproval', postId: 'nao-existe' })).toBe(state)
  })
})

describe('addComment', () => {
  it('ignora texto vazio ou só com espaços', () => {
    const state = freshState()
    expect(appReducer(state, { type: 'addComment', postId: 'vendas', text: '  ' })).toBe(state)
  })

  it('acrescenta ao fim, como @voce, com o texto sem espaços nas pontas', () => {
    const state = freshState()
    const next = appReducer(state, { type: 'addComment', postId: 'vendas', text: ' Oi ' })
    const comments = next.comments.vendas
    expect(comments).toHaveLength(4)
    expect(comments[3]).toEqual({
      id: 'vendas-c4',
      postId: 'vendas',
      authorHandle: 'voce',
      authorInitials: 'V',
      text: 'Oi',
      replies: [],
    })
    expect(next.nextId).toBe(state.nextId)
  })

  it('ignora um projeto inexistente', () => {
    const state = freshState()
    expect(appReducer(state, { type: 'addComment', postId: 'x', text: 'Oi' })).toBe(state)
  })
})

describe('toggleFollow', () => {
  it('segue e deixa de seguir', () => {
    const followed = appReducer(freshState(), { type: 'toggleFollow', handle: 'julio' })
    expect(followed.viewer.followingHandles).toEqual(['julio'])
    const unfollowed = appReducer(followed, { type: 'toggleFollow', handle: 'julio' })
    expect(unfollowed.viewer.followingHandles).toEqual([])
  })
})

describe('publishPost', () => {
  const input = {
    title: ' Meu projeto ',
    description: ' Uma descrição ',
    tags: ['React', 'Vite'],
    imageUrl: 'blob:abc',
  }

  it('insere o novo projeto no início, como @julio e com contadores zerados', () => {
    const state = freshState()
    const next = appReducer(state, { type: 'publishPost', input })
    expect(next.posts).toHaveLength(state.posts.length + 1)
    expect(next.posts[0]).toEqual({
      id: 'novo-1',
      title: 'Meu projeto',
      summary: 'Uma descrição',
      description: 'Uma descrição',
      tags: ['React', 'Vite'],
      imageUrl: 'blob:abc',
      authorHandle: 'julio',
      approvals: 0,
      shares: 0,
    })
    expect(next.comments['novo-1']).toEqual([])
    expect(next.nextId).toBe(2)
  })

  it('gera ids sequenciais', () => {
    const first = appReducer(freshState(), { type: 'publishPost', input })
    const second = appReducer(first, { type: 'publishPost', input })
    expect(second.posts[0].id).toBe('novo-2')
  })
})

describe('imutabilidade', () => {
  it('nunca altera o estado anterior', () => {
    const state = freshState()
    // O estado está congelado: qualquer mutação lançaria TypeError.
    expect(() => {
      appReducer(state, { type: 'toggleApproval', postId: 'vendas' })
      appReducer(state, { type: 'addComment', postId: 'vendas', text: 'Oi' })
      appReducer(state, { type: 'toggleFollow', handle: 'ana.souza' })
      appReducer(state, {
        type: 'publishPost',
        input: { title: 'T', description: 'D', tags: [] },
      })
    }).not.toThrow()
  })
})
