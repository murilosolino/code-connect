import { cx } from '../../lib/cx'

type Size = 'sm' | 'profile'

const sizes = {
  sm: 'size-avatar-sm text-paragraph-small',
  /** 160px abaixo de `sm`, 208px até `lg` e 254px a partir de `lg` (DESIGN.md §5). */
  profile: 'size-avatar-profile-sm sm:size-avatar-profile-md lg:size-avatar-profile-lg text-subtitle',
} satisfies Record<Size, string>

type Props = {
  /** 1–2 letras. O avatar pequeno mostra só a primeira, como nos protótipos. */
  initials: string
  /** Foto; sem ela, mostra as iniciais. */
  src?: string
  size?: Size
}

/** Decorativo: a pessoa sempre aparece nomeada ao lado (@handle ou nome). */
export function Avatar({ initials, src, size = 'sm' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cinza-claro font-semibold text-cinza-escuro',
        sizes[size],
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
