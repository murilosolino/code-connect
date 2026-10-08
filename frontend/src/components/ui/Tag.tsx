import { cx } from '../../lib/cx'
import { Icon } from './Icon'

type Props = {
  label: string
  /** Com `onRemove` a tag é removível (botão ×); sem ele é só uma prévia. */
  onRemove?: () => void
  /** Nome acessível do botão de remover; padrão: "Remover <rótulo>". */
  removeLabel?: string
}

export function Tag({ label, onRemove, removeLabel = `Remover ${label}` }: Props) {
  const base = 'inline-flex items-center rounded-sm px-2 py-1 text-paragraph-small text-on-field sm:text-paragraph'

  if (!onRemove) {
    return <span className={cx(base, 'bg-cinza-claro')}>{label}</span>
  }

  return (
    <span className={cx(base, 'gap-2 bg-field-bg')}>
      {label}
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="-m-1 inline-flex cursor-pointer items-center p-1"
      >
        <Icon name="close" size="sm" />
      </button>
    </span>
  )
}
