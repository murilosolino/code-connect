import { Tag } from './Tag'

type Props = {
  tags: string[]
  /** Nome da lista para leitores de tela (ex.: "Filtros aplicados"). */
  label: string
  /** Torna as tags removíveis; recebe a tag removida. */
  onRemove?: (tag: string) => void
  /** Prefixo do nome do botão de remover (ex.: "Remover filtro" → "Remover filtro React"). */
  removeLabelPrefix?: string
}

export function TagList({ tags, label, onRemove, removeLabelPrefix = 'Remover' }: Props) {
  if (tags.length === 0) return null

  return (
    <ul aria-label={label} className="flex flex-wrap gap-2.5">
      {tags.map((tag) => (
        <li key={tag}>
          <Tag
            label={tag}
            onRemove={onRemove ? () => onRemove(tag) : undefined}
            removeLabel={`${removeLabelPrefix} ${tag}`}
          />
        </li>
      ))}
    </ul>
  )
}
