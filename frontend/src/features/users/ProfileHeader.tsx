import { Avatar, Button } from '../../components/ui'
import { useAuth } from '../../data/auth/useAuth'
import type { UserView } from '../../data/types'
import { pluralWord } from '../../lib/text'
import { UserBadge } from './UserBadge'

type Props = {
  user: UserView
  onToggleFollow: () => void
}

/** Cabeçalho do perfil: avatar ao lado do texto no desktop; empilhado e centralizado abaixo de 1024px. */
export function ProfileHeader({ user, onToggleFollow }: Props) {
  const { viewer } = useAuth()
  // Seguir exige login e não faz sentido no próprio perfil.
  const canFollow = viewer !== null && viewer.handle !== user.handle
  const stats = [
    { count: user.projectsCount, singular: 'Projeto', plural: 'Projetos' },
    { count: user.connectionsDisplayed, singular: 'Conexão', plural: 'Conexões' },
  ]

  return (
    <section aria-label={`Perfil de ${user.name}`} className="flex flex-col gap-6 lg:gap-0">
      <div className="flex flex-col items-center gap-6 py-4 text-center lg:flex-row lg:p-4 lg:text-left">
        <Avatar initials={user.initials} src={user.avatarUrl} size="profile" />
        <div className="flex min-w-0 flex-col items-center gap-6 lg:flex-1 lg:items-start lg:gap-8">
          <div className="flex flex-wrap items-center justify-center gap-6 lg:justify-start lg:gap-8">
            <UserBadge handle={user.handle} initials={user.initials} size="lg" linked={false} />
            {canFollow && (
              <Button variant="tertiary" pressed={user.followedByViewer} onClick={onToggleFollow}>
                {user.followedByViewer ? 'Seguindo' : 'Seguir'}
              </Button>
            )}
          </div>
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <h1 className="text-subtitle font-semibold break-words text-accent">{user.name}</h1>
            {user.bio && <p className="text-paragraph text-text-secondary">{user.bio}</p>}
            <ul aria-label="Estatísticas do perfil" className="flex gap-6 text-paragraph text-text-secondary">
              {stats.map(({ count, singular, plural }) => (
                <li key={singular}>
                  <strong className="font-semibold">{count}</strong> {pluralWord(count, singular, plural)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <hr className="m-0 h-px border-0 bg-divider lg:m-4" />
    </section>
  )
}
