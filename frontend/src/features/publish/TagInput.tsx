import { useState, type KeyboardEvent } from 'react'
import { TagList, TextField } from '../../components/ui'
import { normalizeText } from '../../lib/text'

type Props = {
  tags: string[]
  onChange: (tags: string[]) => void
}

/** Campo de tags: Enter adiciona (sem repetir), o × de cada tag remove. Enter não envia o formulário. */
export function TagInput({ tags, onChange }: Props) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const tag = draft.trim()
    const repeated = tags.some((existing) => normalizeText(existing) === normalizeText(tag))
    if (tag && !repeated) onChange([...tags, tag])
    setDraft('')
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    add()
  }

  return (
    <div className="flex flex-col gap-2">
      <TextField
        label="Tags"
        placeholder="Digite uma tecnologia e pressione Enter"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="pt-2">
        <TagList
          label="Tags do projeto"
          tags={tags}
          onRemove={(tag) => onChange(tags.filter((item) => item !== tag))}
          removeLabelPrefix="Remover tag"
        />
      </div>
    </div>
  )
}
