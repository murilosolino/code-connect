import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { Button, FieldError, MediaPanel, MediaPlaceholder } from '../../components/ui'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { validateImageFile } from '../../lib/files'

type Props = {
  /** Recebe a URL da prévia quando uma imagem válida é escolhida. */
  onChange: (imageUrl: string | undefined) => void
}

/**
 * Área de upload da imagem do código: valida o arquivo (PNG ou JPG, até 5 MB), mostra a prévia
 * local e o erro. Não há upload real nesta etapa.
 */
export function ImageUpload({ onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>()
  // A URL fica viva ao sair da tela: o projeto publicado ainda a usa.
  const previewUrl = useObjectUrl(file, { keepOnUnmount: true })

  const reported = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (previewUrl === reported.current) return
    reported.current = previewUrl
    onChange(previewUrl)
  }, [previewUrl, onChange])

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0]
    if (!chosen) return
    const message = validateImageFile(chosen)
    setError(message ?? undefined)
    if (!message) setFile(chosen)
  }

  return (
    <div className="flex flex-col gap-4">
      <MediaPanel padding="md" className="h-55 lg:h-92 lg:p-6">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Prévia da imagem do projeto"
            className="size-full rounded-md object-cover"
          />
        ) : (
          <MediaPlaceholder>
            <p className="text-paragraph font-semibold">Carregue uma imagem do seu código</p>
            <p className="text-paragraph-small">PNG ou JPG, até 5 MB</p>
          </MediaPlaceholder>
        )}
      </MediaPanel>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFile}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <div>
        <Button
          variant="tertiary"
          icon="upload"
          fullWidth
          onClick={() => inputRef.current?.click()}
          aria-describedby={error ? errorId : undefined}
        >
          {previewUrl ? 'Trocar imagem' : 'Carregar imagem'}
        </Button>
        <FieldError id={errorId} message={error} />
      </div>
    </div>
  )
}
