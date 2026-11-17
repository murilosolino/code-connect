import { TagList, TextLink } from '../../components/ui'

type Props = {
  tags: string[]
  onRemove: (tag: string) => void
  onClear: () => void
  onRestore: () => void
}

/** Filtros de tag do feed: lista removível com "Limpar tudo" ou, sem filtros, "Restaurar filtros". */
export function FeedFilters({ tags, onRemove, onClear, onRestore }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {tags.length > 0 ? (
        <>
          <TagList
            label="Filtros aplicados"
            tags={tags}
            onRemove={onRemove}
            removeLabelPrefix="Remover filtro"
          />
          <TextLink onClick={onClear}>Limpar tudo</TextLink>
        </>
      ) : (
        <>
          <p className="text-paragraph text-text-secondary">Nenhum filtro aplicado.</p>
          <TextLink onClick={onRestore}>Restaurar filtros</TextLink>
        </>
      )}
    </div>
  )
}
