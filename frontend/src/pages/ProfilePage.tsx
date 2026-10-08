import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { EmptyState, SearchBox, Tabs, tabId } from '../components/ui'
import { useAppActions, useUser, useUserPosts } from '../data/store/hooks'
import { filterPosts } from '../features/posts/filterPosts'
import { PostGrid } from '../features/posts/PostGrid'
import { ProfileHeader } from '../features/users/ProfileHeader'
import { usePageTitle } from '../hooks/usePageTitle'

type Tab = 'projetos' | 'aprovados'

const TABS: { id: Tab; label: string }[] = [
  { id: 'projetos', label: 'Projetos' },
  { id: 'aprovados', label: 'Aprovados' },
]

const PANEL_ID = 'perfil-projetos'

const EMPTY_TAB_TITLE: Record<Tab, string> = {
  projetos: 'Nenhum projeto publicado ainda.',
  aprovados: 'Nenhum projeto aprovado ainda.',
}

function ProfileContent({ handle }: { handle: string }) {
  const user = useUser(handle)
  const { projects, approved } = useUserPosts(handle)
  const { toggleFollow } = useAppActions()
  const [tab, setTab] = useState<Tab>('projetos')
  const [query, setQuery] = useState('')
  usePageTitle(user?.name ?? 'Perfil não encontrado')

  const tabPosts = tab === 'projetos' ? projects : approved
  const visible = useMemo(() => filterPosts(tabPosts, { query }), [tabPosts, query])

  if (!user) {
    return (
      <EmptyState
        icon="info"
        title="Perfil não encontrado"
        description="Confira o endereço ou volte ao feed para conhecer outras pessoas."
        action={{ label: 'Voltar ao feed', to: '/' }}
        headingLevel={1}
      />
    )
  }

  const emptyState =
    query.trim() !== '' && tabPosts.length > 0 ? (
      <EmptyState
        icon="search"
        title="Nenhum projeto encontrado"
        description="Tente outra busca ou remova alguns filtros."
      />
    ) : (
      <EmptyState icon="code" title={EMPTY_TAB_TITLE[tab]} />
    )

  return (
    <div className="flex flex-col gap-6">
      {/* A busca só existe no protótipo desktop (DESIGN.md, Pendência 12). */}
      <div className="hidden lg:block">
        <SearchBox label="Buscar projetos" value={query} onChange={setQuery} />
      </div>
      <ProfileHeader user={user} onToggleFollow={() => toggleFollow(user.handle)} />
      <Tabs label="Projetos do perfil" panelId={PANEL_ID} items={TABS} value={tab} onChange={setTab} />
      <div role="tabpanel" id={PANEL_ID} aria-labelledby={tabId(PANEL_ID, tab)}>
        <PostGrid posts={visible} label="Projetos" empty={emptyState} />
      </div>
    </div>
  )
}

/** Perfil de uma pessoa: cabeçalho, seguir e abas "Projetos" e "Aprovados". */
export function ProfilePage() {
  const { handle = '' } = useParams()
  // `key` recomeça aba e busca ao trocar de perfil.
  return <ProfileContent key={handle} handle={handle} />
}
