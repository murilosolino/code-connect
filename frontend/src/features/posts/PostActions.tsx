import { cx } from '../../lib/cx'
import { Icon, type IconName } from '../../components/ui'
import { Action } from '../../components/ui/Action'

type Props = {
  approvals: number
  shares: number
  comments: number
  approved: boolean
  /** Sem ele, "aprovar" é só um contador. */
  onApprove?: () => void
  /** Sem ele, "comentários" é só um contador (já se está no detalhe). */
  commentsTo?: string
}

const item = 'flex min-h-11 min-w-11 flex-col items-center justify-center text-paragraph-small'
const interactive = 'cursor-pointer no-underline hover:text-accent-hover'

function Content({ icon, label, count }: { icon: IconName; label: string; count: number }) {
  return (
    <>
      <Icon name={icon} />
      <span className="sr-only">{label}</span> <span>{count}</span>
    </>
  )
}

/** Aprovar (`code`), compartilhar (`share`) e comentar (`chat`), com os contadores. */
export function PostActions({ approvals, shares, comments, approved, onApprove, commentsTo }: Props) {
  const tone = approved ? 'text-accent' : 'text-text-secondary'

  return (
    <div className="flex items-center gap-4">
      {onApprove ? (
        <button
          type="button"
          aria-pressed={approved}
          onClick={onApprove}
          className={cx(item, interactive, tone)}
        >
          <Content icon="code" label="Aprovar" count={approvals} />
        </button>
      ) : (
        <span className={cx(item, tone)}>
          <Content icon="code" label="Aprovações" count={approvals} />
        </span>
      )}

      {/* Sem ação definida nos protótipos: só o contador, sem controle que não faz nada. */}
      <span className={cx(item, 'text-text-secondary')}>
        <Content icon="share" label="Compartilhamentos" count={shares} />
      </span>

      {commentsTo ? (
        <Action to={commentsTo} className={cx(item, interactive, 'text-text-secondary')}>
          <Content icon="chat" label="Comentários" count={comments} />
        </Action>
      ) : (
        <span className={cx(item, 'text-text-secondary')}>
          <Content icon="chat" label="Comentários" count={comments} />
        </span>
      )}
    </div>
  )
}
