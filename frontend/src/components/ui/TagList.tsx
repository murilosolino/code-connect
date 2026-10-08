import { Tag } from './Tag'

type Props = {
  tags: string[]
  /** Nome da lista para leitores de tela (ex.: "Filtros aplicados"). */
  label: string
  /** Torna as tags removíveis; recebe a tag removida. */
  onRemove?: (tag: string) => void
}

export function TagList({ tags, label, onRemove }: Props) {
  if (tags.length === 0) return null

  return (
    <ul aria-label={label} className="flex flex-wrap gap-2.5">
      {tags.map((tag) => (
        <li key={tag}>
          <Tag label={tag} onRemove={onRemove ? () => onRemove(tag) : undefined} />
        </li>
      ))}
    </ul>
  )
}
