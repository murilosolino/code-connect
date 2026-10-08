import { useLocation } from 'react-router'
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
 * foco branco, página atual verde (`aria-current="page"`).
 */
export function NavItem({ entry, layout }: Props) {
  const { pathname } = useLocation()
  const active = isActive(entry, pathname)

  return (
    <Action
      to={entry.to}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'flex flex-col items-center gap-2 whitespace-nowrap no-underline focus-visible:text-branco',
        active ? 'text-accent' : 'text-text-secondary hover:text-accent-hover',
        layout === 'sidebar'
          ? 'px-4 py-2 text-paragraph-large'
          : 'p-2 text-paragraph sm:text-paragraph-large',
      )}
    >
      <Icon name={entry.icon} size="lg" />
      {entry.label}
    </Action>
  )
}
