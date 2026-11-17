import { useMemo, useState } from 'react'
import { EmptyState, SearchBox, Tabs, tabId } from '../components/ui'
import { usePosts } from '../data/store/hooks'
import { FeedFilters } from '../features/feed/FeedFilters'
import { filterPosts, type SortMode } from '../features/posts/filterPosts'
import { PostGrid } from '../features/posts/PostGrid'
import { usePageTitle } from '../hooks/usePageTitle'

/** Filtros com que o feed abre (HANDOFF: Feed). */
const INITIAL_FILTERS = ['Front-end', 'React', 'Acessibilidade']

const TABS: { id: SortMode; label: string }[] = [
  { id: 'recentes', label: 'Recentes' },
  { id: 'populares', label: 'Populares' },
]

const PANEL_ID = 'feed-projetos'

export function FeedPage() {
  usePageTitle('Feed')
  const posts = usePosts()
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState(INITIAL_FILTERS)
  const [sort, setSort] = useState<SortMode>('recentes')

  const visible = useMemo(
    () => filterPosts(posts, { query, tags, sort }),
    [posts, query, tags, sort],
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Feed</h1>
      <SearchBox label="Buscar projetos" value={query} onChange={setQuery} />
      <FeedFilters
        tags={tags}
        onRemove={(tag) => setTags((current) => current.filter((item) => item !== tag))}
        onClear={() => setTags([])}
        onRestore={() => setTags(INITIAL_FILTERS)}
      />
      <Tabs
        label="Ordenar projetos"
        panelId={PANEL_ID}
        items={TABS}
        value={sort}
        onChange={setSort}
      />
      <div role="tabpanel" id={PANEL_ID} aria-labelledby={tabId(PANEL_ID, sort)}>
        <PostGrid
          posts={visible}
          label="Projetos"
          empty={
            <EmptyState
              icon="search"
              title="Nenhum projeto encontrado"
              description="Tente outra busca ou remova alguns filtros."
            />
          }
        />
      </div>
    </div>
  )
}
