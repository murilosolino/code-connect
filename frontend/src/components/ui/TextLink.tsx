import { cx } from '../../lib/cx'
import { Action, type ActionProps } from './Action'
import { Icon, type IconName } from './Icon'

type Variant = 'default' | 'form'

const variants = {
  /** "Limpar tudo", "Voltar ao feed": cinza, verde e sublinhado no hover. */
  default: 'text-paragraph max-sm:text-paragraph-small text-text-secondary no-underline hover:text-accent hover:underline',
  /** Links dentro de formulários ("Esqueci a senha"): sempre sublinhados. */
  form: 'text-paragraph-small text-text-primary underline',
} satisfies Record<Variant, string>

export type TextLinkProps = { variant?: Variant; icon?: IconName } & ActionProps

export function TextLink({
  variant = 'default',
  icon,
  className,
  children,
  ...rest
}: TextLinkProps) {
  return (
    <Action
      {...(rest as ActionProps)}
      className={cx('inline-flex cursor-pointer items-center gap-2', variants[variant], className)}
    >
      {icon && <Icon name={icon} />}
      {children}
    </Action>
  )
}
