import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createSeedState } from '../../data/seed'
import { selectUserView } from '../../data/store/selectors'
import type { UserView } from '../../data/types'
import { JULIO, renderWithProviders } from '../../test/renderWithProviders'
import { ProfileHeader } from './ProfileHeader'

const julio = selectUserView(createSeedState(), 'julio')!
/** Quem está logado nos testes de "Seguir": outra pessoa que não o dono do perfil. */
const ANA = { handle: 'ana.souza', name: 'Ana Souza', initials: 'AS', avatarUrl: null }
const stats = () =>
  within(screen.getByRole('list', { name: 'Estatísticas do perfil' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent)

describe('ProfileHeader', () => {
  it('mostra @handle, nome, bio e as estatísticas', () => {
    renderWithProviders(<ProfileHeader user={julio} onToggleFollow={() => {}} />)
    expect(screen.getByRole('region', { name: 'Perfil de Júlio Oliveira' })).toBeInTheDocument()
    expect(screen.getByText('@julio')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Júlio Oliveira' })).toBeInTheDocument()
    expect(screen.getByText(/Desenvolvedor front-end em São Paulo/)).toBeInTheDocument()
    expect(stats()).toEqual(['3 Projetos', '25 Conexões'])
  })

  it('o @handle do próprio perfil não é um link', () => {
    renderWithProviders(<ProfileHeader user={julio} onToggleFollow={() => {}} />)
    expect(screen.queryByRole('link', { name: '@julio' })).not.toBeInTheDocument()
  })

  it('"Seguir" tem aria-pressed falso e chama onToggleFollow', async () => {
    const onToggleFollow = vi.fn()
    const { user } = renderWithProviders(<ProfileHeader user={julio} onToggleFollow={onToggleFollow} />, {
      viewer: ANA,
    })
    const follow = screen.getByRole('button', { name: 'Seguir' })
    expect(follow).toHaveAttribute('aria-pressed', 'false')
    await user.click(follow)
    expect(onToggleFollow).toHaveBeenCalledTimes(1)
  })

  it('quando já segue mostra "Seguindo", aria-pressed verdadeiro e uma conexão a mais', () => {
    const following: UserView = { ...julio, followedByViewer: true, connectionsDisplayed: 26 }
    renderWithProviders(<ProfileHeader user={following} onToggleFollow={() => {}} />, { viewer: ANA })
    expect(screen.getByRole('button', { name: 'Seguindo' })).toHaveAttribute('aria-pressed', 'true')
    expect(stats()).toEqual(['3 Projetos', '26 Conexões'])
  })

  it('no próprio perfil não oferece "Seguir"', () => {
    renderWithProviders(<ProfileHeader user={julio} onToggleFollow={() => {}} />, { viewer: JULIO })
    expect(screen.queryByRole('button', { name: /Segu/ })).not.toBeInTheDocument()
  })

  it('deslogado não oferece "Seguir"', () => {
    renderWithProviders(<ProfileHeader user={julio} onToggleFollow={() => {}} />, { viewer: null })
    expect(screen.queryByRole('button', { name: /Segu/ })).not.toBeInTheDocument()
  })

  it('sem bio não renderiza parágrafo vazio', () => {
    const noBio: UserView = { ...julio, bio: undefined }
    const { container } = renderWithProviders(<ProfileHeader user={noBio} onToggleFollow={() => {}} />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('usa o singular com um projeto', () => {
    const one: UserView = { ...julio, projectsCount: 1 }
    renderWithProviders(<ProfileHeader user={one} onToggleFollow={() => {}} />)
    expect(stats()[0]).toBe('1 Projeto')
  })
})
