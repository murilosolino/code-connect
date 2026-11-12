import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { stubFetch } from '../../test/fetchStub'
import { mockMatchMedia } from '../../test/matchMedia'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AppLayout } from './AppLayout'

const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <p>Conteúdo do feed</p> },
      { path: 'projeto/:id', element: <p>Conteúdo do projeto</p> },
      { path: 'sobre', element: <p>Conteúdo do sobre</p> },
    ],
  },
  { path: '/login', element: <p>Tela de login</p> },
]

const navigation = () => screen.getByRole('navigation', { name: 'Navegação principal' })

describe('AppLayout', () => {
  it('o primeiro Tab foca o link "Pular para o conteúdo", que aponta para o conteúdo', async () => {
    const { user } = renderWithProviders(null, { routes })
    await user.tab()
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('href', '#conteudo')
  })

  it('renderiza o conteúdo da rota num <main id="conteudo">', () => {
    renderWithProviders(null, { routes })
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'conteudo')
    expect(within(main).getByText('Conteúdo do feed')).toBeInTheDocument()
  })

  it('tem uma única navegação principal: três links e o botão Sair', () => {
    renderWithProviders(null, { routes })
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    const links = within(navigation()).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'feedFeed',
      'account_circlePerfil',
      'infoSobre nós',
    ])
    expect(within(navigation()).getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('deslogado, mostra Feed, Sobre nós e Login, sem Perfil nem Sair', () => {
    renderWithProviders(null, { routes, viewer: null })
    const links = within(navigation()).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(['feedFeed', 'infoSobre nós', 'loginLogin'])
    expect(within(navigation()).getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(within(navigation()).queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
    expect(within(navigation()).queryByRole('link', { name: 'Perfil' })).not.toBeInTheDocument()
  })

  it('o Perfil leva ao perfil de quem está logado', () => {
    renderWithProviders(null, {
      routes,
      viewer: { handle: 'maria', name: 'Maria Lima', initials: 'ML', avatarUrl: null },
    })
    expect(within(navigation()).getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil/maria')
  })

  it('Sair encerra a sessão na API e leva ao login', async () => {
    const { calls } = stubFetch({ 'POST /api/auth/logout': () => ({ status: 204 }) })
    const { user, router } = renderWithProviders(null, { routes })

    await user.click(within(navigation()).getByRole('button', { name: 'Sair' }))

    expect(calls).toEqual([{ method: 'POST', path: '/api/auth/logout', body: undefined }])
    expect(router.state.location.pathname).toBe('/login')
  })

  it('se a API falhar ao sair, a pessoa continua na tela e logada', async () => {
    stubFetch({
      'POST /api/auth/logout': () => ({ status: 500, json: { error: { code: 'internal_error', message: 'x' } } }),
    })
    const { user, router } = renderWithProviders(null, { routes })

    await user.click(within(navigation()).getByRole('button', { name: 'Sair' }))

    expect(router.state.location.pathname).toBe('/')
    expect(within(navigation()).getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('marca o Feed como página atual no detalhe do projeto e só ele', () => {
    renderWithProviders(null, { routes, route: '/projeto/vendas' })
    expect(within(navigation()).getByRole('link', { name: 'Feed' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(navigation()).getByRole('link', { name: 'Sobre nós' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('marca Sobre nós em /sobre', () => {
    renderWithProviders(null, { routes, route: '/sobre' })
    expect(within(navigation()).getByRole('link', { name: 'Sobre nós' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(navigation()).getByRole('link', { name: 'Feed' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('no mobile, o logo e o botão Publicar ficam no topo, fora da navegação', () => {
    renderWithProviders(null, { routes })
    expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/publicar')
    expect(within(navigation()).queryByRole('link', { name: 'Publicar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'CodeConnect' })).toHaveAttribute('href', '/')
  })

  it('no desktop, o menu lateral inclui o botão Publicar', () => {
    mockMatchMedia(true)
    renderWithProviders(null, { routes })
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(within(navigation()).getByRole('link', { name: 'Publicar' })).toHaveAttribute(
      'href',
      '/publicar',
    )
    expect(screen.getAllByRole('link', { name: 'Publicar' })).toHaveLength(1)
  })
})
