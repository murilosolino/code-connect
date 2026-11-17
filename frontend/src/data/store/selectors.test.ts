import { describe, expect, it } from 'vitest'
import { createSeedState } from '../seed'
import { appReducer } from './reducer'
import {
  selectPostView,
  selectPostViews,
  selectUserPosts,
  selectUserView,
} from './selectors'

const state = createSeedState()

describe('selectPostView', () => {
  it('calcula o autor, os comentários de primeiro nível e a aprovação da pessoa logada', () => {
    const vendas = selectPostView(state, 'vendas')!
    expect(vendas.author.handle).toBe('julio')
    // 3 comentários com 4 respostas no total: só os de primeiro nível contam.
    expect(vendas.commentCount).toBe(3)
    expect(vendas.approvedByViewer).toBe(false)
    expect(selectPostView(state, 'auth')!.approvedByViewer).toBe(true)
  })

  it('devolve undefined para um id inexistente', () => {
    expect(selectPostView(state, 'x')).toBeUndefined()
  })

  it('reflete um novo comentário no contador', () => {
    const next = appReducer(state, { type: 'addComment', postId: 'vendas', text: 'Oi' })
    expect(selectPostView(next, 'vendas')!.commentCount).toBe(4)
  })
})

describe('selectPostViews', () => {
  it('mantém a ordem dos projetos', () => {
    expect(selectPostViews(state).map((p) => p.id)[0]).toBe('vendas')
    expect(selectPostViews(state)).toHaveLength(8)
  })
})

describe('selectUserView', () => {
  it('conta os projetos e as conexões', () => {
    const julio = selectUserView(state, 'julio')!
    expect(julio.projectsCount).toBe(3)
    expect(julio.connectionsDisplayed).toBe(25)
    expect(julio.followedByViewer).toBe(false)
  })

  it('soma 1 às conexões quando a pessoa logada segue', () => {
    const next = appReducer(state, { type: 'toggleFollow', handle: 'julio' })
    const julio = selectUserView(next, 'julio')!
    expect(julio.connectionsDisplayed).toBe(26)
    expect(julio.followedByViewer).toBe(true)
  })

  it('devolve undefined para um perfil inexistente', () => {
    expect(selectUserView(state, 'ninguem')).toBeUndefined()
  })
})

describe('selectUserPosts', () => {
  it('separa os projetos de julio dos que ele aprovou de outras pessoas', () => {
    const { projects, approved } = selectUserPosts(state, 'julio')
    expect(projects.map((p) => p.id)).toEqual(['vendas', 'calendario', 'portfolio'])
    expect(approved.map((p) => p.id)).toEqual(['auth', 'tarefas'])
  })

  it('não lista como aprovado um projeto da própria pessoa', () => {
    const next = appReducer(state, { type: 'toggleApproval', postId: 'vendas' })
    expect(selectUserPosts(next, 'julio').approved.map((p) => p.id)).toEqual(['auth', 'tarefas'])
  })

  it('devolve aprovados vazios para outra pessoa', () => {
    const { projects, approved } = selectUserPosts(state, 'ana.souza')
    expect(projects.map((p) => p.id)).toEqual(['auth'])
    expect(approved).toEqual([])
  })
})
