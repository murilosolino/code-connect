import { cx } from '../../lib/cx'

type Size = 'sm' | 'profile'

const base = 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full'

const sizes = {
  sm: 'size-avatar-sm text-paragraph-small font-semibold text-cinza-escuro',
  /** 160px abaixo de `sm`, 208px até `lg` e 254px a partir de `lg` (DESIGN.md §5). */
  profile:
    'size-avatar-profile-sm sm:size-avatar-profile-md lg:size-avatar-profile-lg bg-cinza text-heading-small font-medium text-cinza-claro lg:text-heading',
} satisfies Record<Size, string>

type Props = {
  /** 1–2 letras. O avatar pequeno mostra só a primeira, como nos protótipos. */
  initials: string
  /** Foto; sem ela, mostra as iniciais. */
  src?: string
  size?: Size
  /** `onLight`: fundo mais escuro, para usar sobre superfícies claras (comentários). Só no avatar pequeno. */
  tone?: 'default' | 'onLight'
}

/** Decorativo: a pessoa sempre aparece nomeada ao lado (@handle ou nome). */
export function Avatar({ initials, src, size = 'sm', tone = 'default' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        base,
        sizes[size],
        size === 'sm' && (tone === 'onLight' ? 'bg-cinza-medio' : 'bg-cinza-claro'),
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : size === 'sm' ? (
        initials.charAt(0)
      ) : (
        initials
      )}
    </span>
  )
}
