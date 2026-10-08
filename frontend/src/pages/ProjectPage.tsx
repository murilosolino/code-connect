import { useParams } from 'react-router'
import { EmptyState, TextLink } from '../components/ui'
import { useAppActions, useComments, usePost } from '../data/store/hooks'
import { CommentForm } from '../features/comments/CommentForm'
import { CommentThread } from '../features/comments/CommentThread'
import { PostCard } from '../features/posts/PostCard'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatHandle } from '../lib/text'

/** Detalhe do projeto: card em versão de página, aprovação e comentários. */
export function ProjectPage() {
  const { id = '' } = useParams()
  const post = usePost(id)
  const comments = useComments(id)
  const { addComment } = useAppActions()
  usePageTitle(post?.title ?? 'Projeto não encontrado')

  if (!post) {
    return (
      <EmptyState
        icon="info"
        title="Projeto não encontrado"
        description="Confira o endereço ou volte ao feed para ver outros projetos."
        action={{ label: 'Voltar ao feed', to: '/' }}
        headingLevel={1}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TextLink to="/" icon="arrow_back" className="self-start">
        Voltar ao feed
      </TextLink>
      <PostCard post={post} size="page" headingLevel={1} />
      <section id="comentarios" className="flex flex-col gap-4 pt-4">
        <h2 className="text-subtitle text-text-primary">Comentários</h2>
        <CommentForm
          onSubmit={(text) => addComment(post.id, text)}
          placeholder={`Escreva algo para ${formatHandle(post.author.handle)}`}
        />
        <CommentThread comments={comments} />
      </section>
    </div>
  )
}
