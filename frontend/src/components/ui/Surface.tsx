import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '../../lib/cx'

type Padding = 'md' | 'lg' | 'menu' | 'page'

const paddings = {
  md: 'p-4',
  lg: 'p-6',
  /** Menu lateral: 40px × 16px. */
  menu: 'px-4 py-10',
  /** Cartão de página (Sobre nós): 24px × 16px no mobile, 40px a partir de 1024px. */
  page: 'px-4 py-6 lg:p-10',
} satisfies Record<Padding, string>

type Props = ComponentPropsWithoutRef<'div'> & {
  as?: 'div' | 'section' | 'article' | 'aside'
  padding?: Padding
  /** `bottom` arredonda só a base (corpo do card, sob a mídia). */
  rounded?: 'all' | 'bottom'
}

/** Superfície do design system: fundo `cinza-escuro` com raio de 8px (cards, menus, formulários). */
export function Surface({
  as: Component = 'div',
  padding = 'md',
  rounded = 'all',
  className,
  ...rest
}: Props) {
  return (
    <Component
      {...rest}
      className={cx(
        'bg-bg-surface',
        rounded === 'all' ? 'rounded-md' : 'rounded-b-md',
        paddings[padding],
        className,
      )}
    />
  )
}
