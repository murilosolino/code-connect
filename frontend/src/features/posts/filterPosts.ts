import { normalizeText } from '../../lib/text'

export type SortMode = 'recentes' | 'populares'

export type FilterablePost = {
  title: string
  summary: string
  tags: string[]
  approvals: number
}

export type PostFilters = {
  /** Busca no título e na descrição do card, sem diferenciar caixa nem acentos. */
  query?: string
  /** Mantém projetos com ao menos uma destas tags; vazio = todos. */
  tags?: string[]
  /** `recentes` mantém a ordem recebida; `populares` ordena por aprovações (empate estável). */
  sort?: SortMode
}

/** Regra única de busca, filtro e ordenação (Feed e Perfil). Nunca altera a lista recebida. */
export function filterPosts<T extends FilterablePost>(
  posts: T[],
  { query = '', tags = [], sort = 'recentes' }: PostFilters = {},
): T[] {
  const needle = normalizeText(query)
  const wanted = tags.map(normalizeText)

  const filtered = posts.filter((post) => {
    const matchesQuery =
      needle === '' ||
      normalizeText(post.title).includes(needle) ||
      normalizeText(post.summary).includes(needle)
    const matchesTags =
      wanted.length === 0 || post.tags.some((tag) => wanted.includes(normalizeText(tag)))
    return matchesQuery && matchesTags
  })

  return sort === 'populares' ? [...filtered].sort((a, b) => b.approvals - a.approvals) : filtered
}
