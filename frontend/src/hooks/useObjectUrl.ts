import { useEffect, useRef, useState } from 'react'

/**
 * URL de objeto para pré-visualizar um arquivo local. Revoga a URL anterior quando o arquivo
 * muda. Com `keepOnUnmount`, a URL sobrevive à saída da tela (ex.: o projeto publicado ainda a usa).
 */
export function useObjectUrl(
  file: File | null,
  { keepOnUnmount = false }: { keepOnUnmount?: boolean } = {},
): string | undefined {
  const [url, setUrl] = useState<string>()
  const current = useRef<string | undefined>(undefined)

  // Troca de arquivo: revoga a URL anterior e cria a nova.
  useEffect(() => {
    if (current.current) URL.revokeObjectURL(current.current)
    current.current = file ? URL.createObjectURL(file) : undefined
    setUrl(current.current)
  }, [file])

  // Saída da tela: revoga a URL, a menos que ela siga em uso.
  useEffect(
    () => () => {
      if (!keepOnUnmount && current.current) URL.revokeObjectURL(current.current)
    },
    [keepOnUnmount],
  )

  return url
}
