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
const maria = { handle: 'maria', name: 'Maria Lima', initials: 'ML', avatarUrl: null }
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

  it('acrescenta ao fim, como a pessoa logada, com o texto sem espaços nas pontas', () => {
    const state = freshState()
    const next = appReducer(state, { type: 'addComment', postId: 'vendas', text: ' Oi ' })
    const comments = next.comments.vendas
    expect(comments).toHaveLength(4)
    expect(comments[3]).toEqual({
      id: 'vendas-c4',
      postId: 'vendas',
      authorHandle: 'julio',
      authorInitials: 'JO',
      text: 'Oi',
      replies: [],
    })
    expect(next.nextId).toBe(state.nextId)
  })

  it('usa as iniciais da pessoa que entrou depois de setViewer', () => {
    const entered = appReducer(freshState(), { type: 'setViewer', viewer: maria })
    const next = appReducer(entered, { type: 'addComment', postId: 'vendas', text: 'Oi' })
    expect(next.comments.vendas[3]).toMatchObject({ authorHandle: 'maria', authorInitials: 'ML' })
  })

  it('ignora o comentário sem pessoa logada', () => {
    const anonymous = appReducer(freshState(), { type: 'clearViewer' })
    expect(appReducer(anonymous, { type: 'addComment', postId: 'vendas', text: 'Oi' })).toBe(anonymous)
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

describe('setViewer', () => {
  it('registra a pessoa nova em users, sem aprovações nem seguidos, e a torna a logada', () => {
    const state = freshState()
    const next = appReducer(state, { type: 'setViewer', viewer: maria })

    expect(next.viewer).toEqual({ handle: 'maria', approvedPostIds: [], followingHandles: [] })
    expect(next.users.maria).toEqual({
      handle: 'maria',
      name: 'Maria Lima',
      initials: 'ML',
      connections: 0,
    })
    expect(next.users.julio).toBe(state.users.julio)
  })

  it('guarda a foto quando existe', () => {
    const next = appReducer(freshState(), {
      type: 'setViewer',
      viewer: { ...maria, avatarUrl: '/api/images/m.png' },
    })
    expect(next.users.maria.avatarUrl).toBe('/api/images/m.png')
  })

  it('para quem já está no store, mantém o perfil e as escolhas (sem trocar de estado)', () => {
    const state = freshState()
    const same = appReducer(state, {
      type: 'setViewer',
      viewer: { handle: 'julio', name: 'Outro nome', initials: 'X', avatarUrl: null },
    })
    expect(same).toBe(state)
  })

  it('ao trocar de pessoa, zera aprovações e seguidos da anterior', () => {
    const state = freshState()
    const next = appReducer(state, {
      type: 'setViewer',
      viewer: { handle: 'ana.souza', name: 'Ana Souza', initials: 'AS', avatarUrl: null },
    })
    expect(next.viewer).toEqual({ handle: 'ana.souza', approvedPostIds: [], followingHandles: [] })
    expect(next.users['ana.souza']).toBe(state.users['ana.souza'])
  })

  it('publicar depois de entrar usa o autor correto', () => {
    const entered = appReducer(freshState(), { type: 'setViewer', viewer: maria })
    const next = appReducer(entered, {
      type: 'publishPost',
      input: { title: 'T', description: 'D', tags: [] },
    })
    expect(next.posts[0].authorHandle).toBe('maria')
  })
})

describe('clearViewer', () => {
  it('deixa a pessoa logada vazia e as escolhas zeradas', () => {
    const next = appReducer(freshState(), { type: 'clearViewer' })
    expect(next.viewer).toEqual({ handle: '', approvedPostIds: [], followingHandles: [] })
  })

  it('não altera o estado quando já não há ninguém logado', () => {
    const cleared = appReducer(freshState(), { type: 'clearViewer' })
    expect(appReducer(cleared, { type: 'clearViewer' })).toBe(cleared)
  })

  it('ignora aprovar e seguir sem pessoa logada', () => {
    const cleared = appReducer(freshState(), { type: 'clearViewer' })
    expect(appReducer(cleared, { type: 'toggleApproval', postId: 'vendas' })).toBe(cleared)
    expect(appReducer(cleared, { type: 'toggleFollow', handle: 'julio' })).toBe(cleared)
  })
})
