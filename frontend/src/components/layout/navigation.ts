import type { IconName } from '../ui'

export type NavEntry = {
  label: string
  /** Destino da navegação; item sem `to` é uma ação (ver `action`). */
  to?: string
  icon: IconName
  /** Quando omitido, o item fica ativo só no próprio endereço. */
  match?: (pathname: string) => boolean
  /** `logout`: encerra a sessão em vez de navegar. */
  action?: 'logout'
}

/** Fonte única dos itens do menu (lateral e barra horizontal), conforme haja alguém logado. */
export function getNavItems(viewer: { handle: string } | null): NavEntry[] {
  const feed: NavEntry = {
    label: 'Feed',
    to: '/',
    icon: 'feed',
    // O detalhe do projeto também marca "Feed" como página atual.
    match: (pathname) => pathname === '/' || pathname.startsWith('/projeto/'),
  }
  const about: NavEntry = { label: 'Sobre nós', to: '/sobre', icon: 'info' }

  if (!viewer) return [feed, about, { label: 'Login', to: '/login', icon: 'login' }]

  return [
    feed,
    { label: 'Perfil', to: `/perfil/${viewer.handle}`, icon: 'account_circle' },
    about,
    { label: 'Sair', icon: 'logout', action: 'logout' },
  ]
}

export function isActive(entry: NavEntry, pathname: string): boolean {
  if (entry.action) return false
  return entry.match ? entry.match(pathname) : pathname === entry.to
}
