import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '../../lib/cx'

type Padding = 'md' | 'lg' | 'menu'

const paddings = {
  md: 'p-4',
  lg: 'p-6',
  /** Menu lateral: 40px × 16px. */
  menu: 'px-4 py-10',
} satisfies Record<Padding, string>

type Props = ComponentPropsWithoutRef<'div'> & {
  as?: 'div' | 'section' | 'article' | 'aside'
  padding?: Padding
}

/** Superfície do design system: fundo `cinza-escuro` com raio de 8px (cards, menus, formulários). */
export function Surface({ as: Component = 'div', padding = 'md', className, ...rest }: Props) {
  return <Component {...rest} className={cx('rounded-md bg-bg-surface', paddings[padding], className)} />
}
