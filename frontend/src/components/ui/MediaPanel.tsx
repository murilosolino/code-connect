import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '../../lib/cx'

type Padding = 'none' | 'md' | 'lg' | 'wide'

const paddings = {
  none: '',
  md: 'p-4',
  lg: 'p-6',
  /** 16px na vertical e 24px na horizontal (topo do card na página de detalhe). */
  wide: 'px-6 py-4',
} satisfies Record<Padding, string>

type Props = ComponentPropsWithoutRef<'div'> & {
  /** `top` arredonda só o topo (parte de cima do card). */
  rounded?: 'all' | 'top'
  padding?: Padding
}

/** Área de mídia do design system (`bg-card-media`): topo do card, banners e área de upload. */
export function MediaPanel({ rounded = 'all', padding = 'lg', className, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cx(
        'bg-bg-card-media',
        rounded === 'all' ? 'rounded-md' : 'rounded-t-md',
        paddings[padding],
        className,
      )}
    />
  )
}
