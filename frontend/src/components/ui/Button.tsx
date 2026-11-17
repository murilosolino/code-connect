import { cx } from '../../lib/cx'
import { Action, type ActionProps } from './Action'
import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'tertiary'
type Size = 'md' | 'lg'

const variants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary:
    'text-accent shadow-outline-accent hover:text-accent-hover hover:shadow-outline-hover',
  tertiary:
    'text-text-secondary shadow-outline hover:text-accent-hover hover:shadow-outline-hover',
} satisfies Record<Variant, string>

const sizes = {
  md: 'text-paragraph font-semibold',
  /** "Publicar" do menu. */
  lg: 'text-paragraph-large font-normal',
} satisfies Record<Size, string>

type OwnProps = {
  variant: Variant
  size?: Size
  icon?: IconName
  iconPosition?: 'start' | 'end'
  fullWidth?: boolean
  /** Botão de alternância: expõe `aria-pressed`. */
  pressed?: boolean
}

export type ButtonProps = OwnProps & ActionProps

export function Button({
  variant,
  size = 'md',
  icon,
  iconPosition = 'end',
  fullWidth = false,
  pressed,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <Action
      {...(rest as ActionProps)}
      aria-pressed={pressed}
      className={cx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-3 no-underline',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {icon && iconPosition === 'start' && <Icon name={icon} />}
      {children}
      {icon && iconPosition === 'end' && <Icon name={icon} />}
    </Action>
  )
}
