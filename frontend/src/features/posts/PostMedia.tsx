import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { CodeEditor, MediaPanel, MediaPlaceholder } from '../../components/ui'
import type { PostView } from '../../data/types'

type Props = {
  post: PostView
  size: 'feed' | 'page'
  /** Torna a mídia um link (card do feed). */
  linkTo?: string
}

/**
 * Topo do card: a imagem enviada, o trecho de código de exemplo ou, sem nenhum dos dois,
 * o espaço reservado.
 */
export function PostMedia({ post, size, linkTo }: Props) {
  const isPage = size === 'page'

  const media = post.imageUrl ? (
    <img
      src={post.imageUrl}
      alt={`Imagem do projeto ${post.title}`}
      className={cx('w-full rounded-md object-cover', isPage ? 'h-80' : 'h-full')}
    />
  ) : post.code ? (
    <CodeEditor
      code={post.code}
      size={isPage ? 'page' : 'card'}
      label={`Trecho de código do projeto ${post.title}`}
    />
  ) : (
    <MediaPlaceholder />
  )

  return (
    <MediaPanel rounded="top" padding={isPage ? 'wide' : 'lg'} className={isPage ? undefined : 'h-60'}>
      {linkTo ? (
        <Link
          to={linkTo}
          aria-label={`Abrir projeto ${post.title}`}
          className="block h-full rounded-md"
        >
          {media}
        </Link>
      ) : (
        media
      )}
    </MediaPanel>
  )
}
