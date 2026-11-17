import { useState } from 'react'
import type { Comment } from '../../data/types'
import { CommentLine } from './CommentLine'

/** "Responder" aparece como nos protótipos, mas o fluxo de resposta ainda não existe. */
function ReplyButton() {
  return (
    <button
      type="button"
      className="cursor-pointer text-paragraph-small font-semibold hover:underline"
    >
      Responder
    </button>
  )
}

type Props = { comments: Comment[] }

/** Lista de comentários sobre fundo claro, com respostas recolhíveis (a primeira com respostas abre aberta). */
export function CommentThread({ comments }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const first = comments.find((comment) => comment.replies.length > 0)
    return first ? { [first.id]: true } : {}
  })

  if (comments.length === 0) return null

  return (
    <div className="flex flex-col gap-6 rounded-md bg-offwhite p-4 text-cinza-escuro sm:p-6">
      {comments.map((comment) => {
        const hasReplies = comment.replies.length > 0
        const isOpen = Boolean(open[comment.id])
        const repliesId = `${comment.id}-respostas`

        return (
          <div key={comment.id} className="flex flex-col gap-2">
            <CommentLine
              authorHandle={comment.authorHandle}
              authorInitials={comment.authorInitials}
              text={comment.text}
              actions={
                <>
                  <ReplyButton />
                  {hasReplies && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={repliesId}
                      onClick={() => setOpen((current) => ({ ...current, [comment.id]: !isOpen }))}
                      className="flex cursor-pointer items-center gap-2 text-label hover:underline"
                    >
                      <span aria-hidden="true" className="h-px w-8 bg-cinza-escuro" />
                      {isOpen ? 'Ocultar respostas' : 'Ver respostas'}
                    </button>
                  )}
                </>
              }
            />
            {hasReplies && (
              <div id={repliesId} hidden={!isOpen} className="flex flex-col gap-4 pt-2 pl-10">
                {comment.replies.map((reply) => (
                  <CommentLine
                    key={reply.id}
                    authorHandle={reply.authorHandle}
                    authorInitials={reply.authorInitials}
                    text={reply.text}
                    actions={<ReplyButton />}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
