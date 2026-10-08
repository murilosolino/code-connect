import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { Surface, TagList } from '../../components/ui'
import { useAppActions } from '../../data/store/hooks'
import type { PostView } from '../../data/types'
import { UserBadge } from '../users/UserBadge'
import { PostActions } from './PostActions'
import { PostMedia } from './PostMedia'

type Props = {
  post: PostView
  /** `feed`: card compacto com links para o detalhe; `page`: versão do detalhe do projeto. */
  size: 'feed' | 'page'
  /** Nível do título: 2 nas listas (sob o h1 da tela) e 1 no detalhe. */
  headingLevel?: 1 | 2 | 3
}

/** Card de publicação: mídia no topo; título, descrição, tags, ações e autor embaixo. */
export function PostCard({ post, size, headingLevel = 2 }: Props) {
  const { toggleApproval } = useAppActions()
  const isFeed = size === 'feed'
  const detailPath = `/projeto/${post.id}`
  const Heading = `h${headingLevel}` as const

  return (
    <article className={cx('w-full', isFeed ? 'max-w-card-feed' : 'max-w-card-page')}>
      <PostMedia post={post} size={size} linkTo={isFeed ? detailPath : undefined} />
      <Surface rounded="bottom" className="flex flex-col gap-4">
        <Heading
          className={cx(
            'font-semibold break-words text-text-emphasis',
            isFeed ? 'text-paragraph' : 'text-paragraph-large',
          )}
        >
          {isFeed ? (
            <Link to={detailPath} className="text-inherit no-underline hover:text-accent-hover">
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </Heading>
        <p className="text-paragraph-small break-words text-text-emphasis">
          {isFeed ? post.summary : post.description}
        </p>
        <TagList tags={post.tags} label="Tags do projeto" />
        <div className="flex items-center justify-between gap-4">
          <PostActions
            approvals={post.approvals}
            shares={post.shares}
            comments={post.commentCount}
            approved={post.approvedByViewer}
            onApprove={() => toggleApproval(post.id)}
            commentsTo={isFeed ? detailPath : undefined}
          />
          <UserBadge handle={post.author.handle} initials={post.author.initials} />
        </div>
      </Surface>
    </article>
  )
}
