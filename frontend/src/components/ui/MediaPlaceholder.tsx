import type { ReactNode } from 'react'
import { Icon } from './Icon'

type Props = {
  /** Texto de instrução abaixo do ícone; sem ele, mostra só o ícone. */
  children?: ReactNode
}

/** Espaço reservado de mídia (protótipo do Publicar): upload vazio e card sem imagem. */
export function MediaPlaceholder({ children }: Props) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-md p-6 text-center text-cinza-escuro shadow-outline-dark">
      <Icon name="code" size="lg" />
      {children}
    </div>
  )
}
