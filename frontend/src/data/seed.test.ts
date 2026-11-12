import { describe, expect, it } from 'vitest'
import { createSeedState } from './seed'

describe('createSeedState', () => {
  const state = createSeedState()

  it('reúne os 8 projetos dos protótipos na ordem esperada', () => {
    expect(state.posts.map((post) => post.id)).toEqual([
      'vendas',
      'auth',
      'landing',
      'memoria',
      'clima',
      'tarefas',
      'calendario',
      'portfolio',
    ])
  })

  it('tem um perfil para cada autor, com handle minúsculo e sem @', () => {
    for (const post of state.posts) {
      expect(state.users[post.authorHandle]).toBeDefined()
    }
    for (const [key, user] of Object.entries(state.users)) {
      expect(user.handle).toBe(key)
      expect(user.handle).toBe(user.handle.toLowerCase())
      expect(user.handle).not.toContain('@')
    }
  })

  it('não tem tags vazias nem repetidas em um mesmo projeto', () => {
    for (const post of state.posts) {
      expect(post.tags.every((tag) => tag.trim() !== '')).toBe(true)
      expect(new Set(post.tags.map((tag) => tag.toLowerCase())).size).toBe(post.tags.length)
    }
  })

  it('tem comentários de primeiro nível iguais aos contadores dos protótipos', () => {
    const counts = Object.fromEntries(
      state.posts.map((post) => [post.id, state.comments[post.id].length]),
    )
    expect(counts).toEqual({
      vendas: 3,
      auth: 7,
      landing: 2,
      memoria: 5,
      clima: 2,
      tarefas: 6,
      calendario: 4,
      portfolio: 1,
    })
  })

  it('liga cada comentário e resposta ao seu projeto e a um autor', () => {
    for (const post of state.posts) {
      for (const comment of state.comments[post.id]) {
        expect(comment.postId).toBe(post.id)
        expect(comment.text.trim()).not.toBe('')
        expect(comment.authorInitials).not.toBe('')
      }
    }
  })

  it('começa com a pessoa logada julio, dois projetos aprovados e ninguém seguido', () => {
    expect(state.viewer).toEqual({
      handle: 'julio',
      approvedPostIds: ['auth', 'tarefas'],
      followingHandles: [],
    })
    expect(state.nextId).toBe(1)
  })

  it('devolve um estado novo a cada chamada (sem compartilhar referências)', () => {
    expect(createSeedState()).not.toBe(state)
    expect(createSeedState().posts).not.toBe(state.posts)
  })
})
