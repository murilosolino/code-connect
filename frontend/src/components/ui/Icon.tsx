import { cx } from '../../lib/cx'

/** Ícones Material Symbols usados no produto (HANDOFF: "Fontes e ícones"). */
export type IconName =
  | 'search'
  | 'close'
  | 'feed'
  | 'account_circle'
  | 'info'
  | 'logout'
  | 'login'
  | 'arrow_forward'
  | 'arrow_back'
  | 'upload'
  | 'delete'
  | 'code'
  | 'share'
  | 'chat'
  | 'error'
  | 'check'

export type IconSize = 'sm' | 'md' | 'lg'

const sizes = {
  sm: 'text-icon-sm',
  md: 'text-icon-md',
  lg: 'text-icon-lg',
} satisfies Record<IconSize, string>

type Props = {
  name: IconName
  /** 15px, 24px ou 32px. */
  size?: IconSize
  className?: string
}

/** Ícone decorativo: sempre escondido dos leitores de tela (o nome vem do controle que o contém). */
export function Icon({ name, size = 'md', className }: Props) {
  return (
    <span aria-hidden="true" className={cx('material-symbols-outlined', sizes[size], className)}>
      {name}
    </span>
  )
}
