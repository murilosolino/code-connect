import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { formatHandle } from '../../lib/text'
import { Avatar } from '../../components/ui'

type Props = {
  handle: string
  initials: string
  /** `sm`: avatar de 32px + @handle de 15px; `lg`: só o @handle de 22px (cabeçalho do perfil). */
  size?: 'sm' | 'lg'
  /** Leva ao perfil da pessoa. */
  linked?: boolean
  /** `onLight`: texto escuro, para fundos claros (comentários). */
  tone?: 'default' | 'onLight'
}

export function UserBadge({ handle, initials, size = 'sm', linked = true, tone = 'default' }: Props) {
  const classes = cx(
    'inline-flex max-w-full items-center gap-2 font-semibold wrap-anywhere no-underline',
    size === 'sm' ? 'text-paragraph-small' : 'text-paragraph-large',
    tone === 'onLight' ? 'text-cinza-escuro hover:underline' : 'text-text-secondary',
    linked && tone === 'default' && 'hover:text-accent-hover',
  )
  const content = (
    <>
      {size === 'sm' && <Avatar initials={initials} />}
      {formatHandle(handle)}
    </>
  )

  return linked ? (
    <Link to={`/perfil/${handle}`} className={classes}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  )
}
