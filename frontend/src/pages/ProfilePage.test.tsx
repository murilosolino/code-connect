import { act, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routes } from '../app/router'
import { createSeedState } from '../data/seed'
import { renderWithProviders } from '../test/renderWithProviders'

const open = (handle: string, initialState?: ReturnType<typeof createSeedState>) =>
  renderWithProviders(null, { routes, route: `/perfil/${handle}`, initialState })

const titles = () =>
  screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)

const stats = () =>
  within(screen.getByRole('list', { name: 'Estatísticas do perfil' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent)

describe('ProfilePage', () => {
  it('mostra o perfil de Júlio, com o título do documento', () => {
    open('julio')
    expect(screen.getByRole('heading', { level: 1, name: 'Júlio Oliveira' })).toBeInTheDocument()
    expect(stats()).toEqual(['3 Projetos', '25 Conexões'])
    expect(document.title).toBe('Júlio Oliveira · CodeConnect')
  })

  it('"Seguir" vira "Seguindo" e as conexões vão de 25 para 26, e voltam', async () => {
    const { user } = open('julio')

    await user.click(screen.getByRole('button', { name: 'Seguir' }))
    expect(screen.getByRole('button', { name: 'Seguindo' })).toHaveAttribute('aria-pressed', 'true')
    expect(stats()[1]).toBe('26 Conexões')

    await user.click(screen.getByRole('button', { name: 'Seguindo' }))
    expect(screen.getByRole('button', { name: 'Seguir' })).toBeInTheDocument()
    expect(stats()[1]).toBe('25 Conexões')
  })

  it('a aba "Projetos" lista os projetos da pessoa', () => {
    open('julio')
    expect(screen.getByRole('tab', { name: 'Projetos' })).toHaveAttribute('aria-selected', 'true')
    expect(titles()).toEqual([
      'Dashboard de vendas com React',
      'Calendário acessível em React',
      'Portfólio estático com Astro',
    ])
  })

  it('a aba "Aprovados" lista projetos de outras pessoas que ela aprovou', async () => {
    const { user } = open('julio')
    await user.click(screen.getByRole('tab', { name: 'Aprovados' }))
    expect(titles()).toEqual([
      'API de autenticação em Node',
      'Lista de tarefas com Next.js e Prisma',
    ])
  })

  it('liga as abas ao painel', () => {
    open('julio')
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Projetos')
  })

  it('a busca filtra a aba ativa por título e descrição', async () => {
    const { user } = open('julio')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar projetos' }), 'calendario')
    expect(titles()).toEqual(['Calendário acessível em React'])
  })

  it('busca sem resultado mostra o estado vazio de busca', async () => {
    const { user } = open('julio')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar projetos' }), 'zzzz')
    expect(screen.getByRole('heading', { level: 2, name: 'Nenhum projeto encontrado' })).toBeInTheDocument()
  })

  it('no perfil da pessoa logada o item "Perfil" do menu é a página atual', () => {
    open('julio')
    const menu = screen.getByRole('navigation', { name: 'Navegação principal' })
    expect(within(menu).getByRole('link', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page')
  })

  it('mostra o perfil de outra pessoa, com seus projetos, e "Aprovados" vazio', async () => {
    const { user } = open('ana.souza')
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Souza' })).toBeInTheDocument()
    expect(titles()).toEqual(['API de autenticação em Node'])

    const menu = screen.getByRole('navigation', { name: 'Navegação principal' })
    expect(within(menu).getByRole('link', { name: 'Perfil' })).not.toHaveAttribute('aria-current')

    await user.click(screen.getByRole('tab', { name: 'Aprovados' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Nenhum projeto aprovado ainda.' })).toBeInTheDocument()
  })

  it('sem projetos publicados mostra o estado vazio da aba', () => {
    const state = createSeedState()
    state.posts = state.posts.filter((post) => post.authorHandle !== 'julio')
    open('julio', state)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nenhum projeto publicado ainda.' }),
    ).toBeInTheDocument()
    expect(stats()[0]).toBe('0 Projetos')
  })

  it('perfil inexistente mostra o estado "não encontrado" com o caminho de volta', () => {
    open('ninguem')
    expect(screen.getByRole('heading', { level: 1, name: 'Perfil não encontrado' })).toBeInTheDocument()
    expect(
      screen.getByText('Confira o endereço ou volte ao feed para conhecer outras pessoas.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao feed' })).toHaveAttribute('href', '/')
  })

  it('ao trocar de perfil o estado da tela (aba e busca) recomeça', async () => {
    const { user, router } = open('julio')
    await user.click(screen.getByRole('tab', { name: 'Aprovados' }))
    await act(() => router.navigate('/perfil/ana.souza'))
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Souza' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Projetos' })).toHaveAttribute('aria-selected', 'true')
  })
})
