import { useState, type FormEvent } from 'react'
import { Button, TextField } from '../../components/ui'

type Props = {
  /** Devolve `true` quando o comentário foi aceito (e então o campo é limpo). */
  onSubmit: (text: string) => boolean
  placeholder?: string
}

/** Campo + botão "Comentar"; Enter também envia. Texto vazio ou só com espaços não é enviado. */
export function CommentForm({ onSubmit, placeholder }: Props) {
  const [text, setText] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (text.trim() === '') return
    if (onSubmit(text)) setText('')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-end gap-4">
      <div className="flex-1 basis-80">
        <TextField
          label="Seu comentário"
          placeholder={placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <Button variant="primary" type="submit" icon="arrow_forward">
        Comentar
      </Button>
    </form>
  )
}
