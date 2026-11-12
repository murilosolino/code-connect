import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../data/auth/useAuth'
import { cx } from '../../lib/cx'
import { Action } from '../ui/Action'
import { Icon } from '../ui'
import { isActive, type NavEntry } from './navigation'

type Props = {
  entry: NavEntry
  /** `sidebar`: menu lateral; `bar`: barra horizontal (mobile e tablet). */
  layout: 'sidebar' | 'bar'
}

/**
 * Item de menu: ícone de 32px acima do rótulo. Normal cinza, hover verde pastel,
 * foco branco, página atual verde (`aria-current="page"`). "Sair" é um botão (ação), não link.
 */
export function NavItem({ entry, layout }: Props) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const active = isActive(entry, pathname)

  const className = cx(
    'flex flex-col items-center gap-2 whitespace-nowrap no-underline focus-visible:text-branco',
    active ? 'text-accent' : 'text-text-secondary hover:text-accent-hover',
    layout === 'sidebar'
      ? 'px-4 py-2 text-paragraph-large'
      : 'p-2 text-paragraph sm:text-paragraph-large',
  )
  const content = (
    <>
      <Icon name={entry.icon} size="lg" />
      {entry.label}
    </>
  )

  if (entry.action === 'logout') {
    // Se a API falhar, a pessoa continua logada e na mesma tela: sem navegar nem fingir que saiu.
    const handleLogout = () => {
      logout()
        .then(() => navigate('/login'))
        .catch(() => undefined)
    }
    return (
      <Action onClick={handleLogout} className={cx('cursor-pointer', className)}>
        {content}
      </Action>
    )
  }

  return (
    <Action to={entry.to!} aria-current={active ? 'page' : undefined} className={className}>
      {content}
    </Action>
  )
}
