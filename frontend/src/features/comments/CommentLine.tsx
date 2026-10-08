import type { ReactNode } from 'react'
import { Avatar } from '../../components/ui'
import { formatHandle } from '../../lib/text'

type Props = {
  authorHandle: string
  authorInitials: string
  text: string
  /** Ações abaixo do texto (ex.: "Responder"), recuadas sob o texto. */
  actions?: ReactNode
}

/** Linha de comentário ou resposta (o mesmo componente): avatar, @handle em destaque e texto. */
export function CommentLine({ authorHandle, authorInitials, text, actions }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2 text-paragraph-small">
        <Avatar initials={authorInitials} tone="onLight" />
        <p className="pt-1 break-words">
          <strong className="font-semibold">{formatHandle(authorHandle)}</strong> {text}
        </p>
      </div>
      {actions && <div className="flex flex-col items-start gap-2 pl-10">{actions}</div>}
    </div>
  )
}
