import { describe, expect, it } from 'vitest'
import { createSeedState } from '../../data/seed'
import { selectPostViews } from '../../data/store/selectors'
import { filterPosts } from './filterPosts'

const posts = selectPostViews(createSeedState())
const ids = (list: { id: string }[]) => list.map((post) => post.id)

describe('filterPosts', () => {
  it('sem critérios devolve todos os projetos, na ordem recebida', () => {
    expect(ids(filterPosts(posts, {}))).toEqual(ids(posts))
  })

  describe('query', () => {
    it('compara título e descrição sem diferenciar caixa nem acentos', () => {
      // "API de autenticação em Node" (título) e "Lista de tarefas…" (descrição)
      expect(ids(filterPosts(posts, { query: 'autenticacao' }))).toEqual(['auth', 'tarefas'])
      expect(ids(filterPosts(posts, { query: 'JOGO DA MEMORIA' }))).toEqual(['memoria'])
    })

    it('ignora espaços nas pontas e trata busca vazia como "sem busca"', () => {
      expect(ids(filterPosts(posts, { query: '  jogo da memoria ' }))).toEqual(['memoria'])
      expect(ids(filterPosts(posts, { query: '   ' }))).toEqual(ids(posts))
    })

    it('devolve lista vazia quando nada casa', () => {
      expect(filterPosts(posts, { query: 'zzzz' })).toEqual([])
    })
  })

  describe('tags', () => {
    it('mantém os projetos com ao menos uma das tags', () => {
      expect(ids(filterPosts(posts, { tags: ['React', 'Acessibilidade', 'Front-end'] }))).toEqual([
        'vendas',
        'landing',
        'calendario',
      ])
    })

    it('compara sem diferenciar caixa nem acentos', () => {
      expect(ids(filterPosts(posts, { tags: ['ACESSIBILIDADE'] }))).toEqual(['landing', 'calendario'])
      expect(ids(filterPosts(posts, { tags: ['next.js'] }))).toEqual(['tarefas'])
    })

    it('lista vazia mantém todos', () => {
      expect(ids(filterPosts(posts, { tags: [] }))).toEqual(ids(posts))
    })
  })

  describe('sort', () => {
    it('"recentes" mantém a ordem recebida', () => {
      expect(ids(filterPosts(posts, { sort: 'recentes' }))).toEqual(ids(posts))
    })

    it('"populares" ordena por aprovações, da maior para a menor', () => {
      expect(ids(filterPosts(posts, { sort: 'populares' }))).toEqual([
        'vendas',
        'tarefas',
        'auth',
        'landing',
        'memoria',
        'calendario',
        'portfolio',
        'clima',
      ])
    })

    it('"populares" mantém a ordem original nos empates', () => {
      const tied = [
        { id: 'a', title: 'A', summary: '', tags: [], approvals: 5 },
        { id: 'b', title: 'B', summary: '', tags: [], approvals: 9 },
        { id: 'c', title: 'C', summary: '', tags: [], approvals: 5 },
      ]
      expect(ids(filterPosts(tied, { sort: 'populares' }))).toEqual(['b', 'a', 'c'])
    })

    it('não altera a lista recebida', () => {
      const before = ids(posts)
      filterPosts(posts, { sort: 'populares' })
      expect(ids(posts)).toEqual(before)
    })
  })

  it('combina busca, tags e ordenação', () => {
    // "react" aparece no título de vendas e de calendario; ambos têm a tag React.
    expect(
      ids(filterPosts(posts, { query: 'react', tags: ['React'], sort: 'populares' })),
    ).toEqual(['vendas', 'calendario'])
    expect(
      ids(filterPosts(posts, { query: 'calendario', tags: ['React'], sort: 'populares' })),
    ).toEqual(['calendario'])
  })
})
