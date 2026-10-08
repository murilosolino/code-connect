import type { IconName } from '../ui'
import { VIEWER_HANDLE } from '../../data/viewer'

export type NavEntry = {
  label: string
  to: string
  icon: IconName
  /** Quando omitido, o item fica ativo só no próprio endereço. */
  match?: (pathname: string) => boolean
}

/** Fonte única dos itens do menu (lateral e barra horizontal). */
export const NAV_ITEMS: NavEntry[] = [
  {
    label: 'Feed',
    to: '/',
    icon: 'feed',
    // O detalhe do projeto também marca "Feed" como página atual.
    match: (pathname) => pathname === '/' || pathname.startsWith('/projeto/'),
  },
  { label: 'Perfil', to: `/perfil/${VIEWER_HANDLE}`, icon: 'account_circle' },
  { label: 'Sobre nós', to: '/sobre', icon: 'info' },
  { label: 'Sair', to: '/login', icon: 'logout', match: () => false },
]

export function isActive(entry: NavEntry, pathname: string): boolean {
  return entry.match ? entry.match(pathname) : pathname === entry.to
}
