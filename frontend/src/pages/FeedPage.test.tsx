import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { FeedPage } from './FeedPage'

type User = ReturnType<typeof renderWithProviders>['user']

const titles = () =>
  screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)

const filters = () =>
  within(screen.getByRole('list', { name: 'Filtros aplicados' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent)

const clearFilters = (user: User) => user.click(screen.getByRole('button', { name: 'Limpar tudo' }))
const search = () => screen.getByRole('searchbox', { name: 'Buscar projetos' })

describe('FeedPage', () => {
  it('abre em "Recentes", com os filtros iniciais e só os projetos que os têm', () => {
    renderWithProviders(<FeedPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Feed' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Recentes' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'false')
    // O texto dos itens inclui o nome do ícone de fechar, escondido dos leitores de tela.
    expect(filters()).toEqual(['Front-endclose', 'Reactclose', 'Acessibilidadeclose'])
    expect(titles()).toEqual([
      'Dashboard de vendas com React',
      'Landing page responsiva sem framework',
      'Calendário acessível em React',
    ])
  })

  it('muda o título do documento', () => {
    renderWithProviders(<FeedPage />)
    expect(document.title).toBe('Feed · CodeConnect')
  })

  it('liga as abas ao painel com a lista', () => {
    renderWithProviders(<FeedPage />)
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAccessibleName('Recentes')
    expect(within(panel).getByRole('list', { name: 'Projetos' })).toBeInTheDocument()
  })

  it('remover um filtro recalcula a lista', async () => {
    const { user } = renderWithProviders(<FeedPage />)
    await user.click(screen.getByRole('button', { name: 'Remover filtro Acessibilidade' }))
    expect(filters()).toEqual(['Front-endclose', 'Reactclose'])
    expect(titles()).toEqual(['Dashboard de vendas com React', 'Calendário acessível em React'])
  })

  it('"Limpar tudo" mostra todos os projetos e a opção de restaurar os filtros', async () => {
    const { user } = renderWithProviders(<FeedPage />)
    await clearFilters(user)

    expect(screen.getByText('Nenhum filtro aplicado.')).toBeInTheDocument()
    expect(titles()).toHaveLength(8)

    await user.click(screen.getByRole('button', { name: 'Restaurar filtros' }))
    expect(filters()).toEqual(['Front-endclose', 'Reactclose', 'Acessibilidadeclose'])
    expect(titles()).toHaveLength(3)
  })

  it('"Populares" ordena por aprovações, da maior para a menor', async () => {
    const { user } = renderWithProviders(<FeedPage />)
    await clearFilters(user)
    await user.click(screen.getByRole('tab', { name: 'Populares' }))

    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'true')
    expect(titles().slice(0, 3)).toEqual([
      'Dashboard de vendas com React',
      'Lista de tarefas com Next.js e Prisma',
      'API de autenticação em Node',
    ])
  })

  it('a busca filtra por título e descrição, sem diferenciar acentos', async () => {
    const { user } = renderWithProviders(<FeedPage />)
    await clearFilters(user)
    await user.type(search(), 'autenticacao')

    expect(titles()).toEqual([
      'API de autenticação em Node',
      'Lista de tarefas com Next.js e Prisma',
    ])
  })

  it('a busca se combina com os filtros de tag ativos', async () => {
    const { user } = renderWithProviders(<FeedPage />)
    await user.type(search(), 'calendario')
    expect(titles()).toEqual(['Calendário acessível em React'])
  })

  it('sem resultados mostra o estado vazio, sem botão', async () => {
    const { user } = renderWithProviders(<FeedPage />)
    await user.type(search(), 'zzzz')

    expect(
      screen.getByRole('heading', { level: 2, name: 'Nenhum projeto encontrado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Tente outra busca ou remova alguns filtros.')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Projetos' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Voltar ao feed' })).not.toBeInTheDocument()
  })

  it('o título de um card leva ao detalhe do projeto', async () => {
    const { user, router } = renderWithProviders(<FeedPage />)
    await user.click(screen.getByRole('link', { name: 'Dashboard de vendas com React' }))
    expect(router.state.location.pathname).toBe('/projeto/vendas')
  })

  it('o autor de um card leva ao perfil', async () => {
    const { user, router } = renderWithProviders(<FeedPage />)
    const [first] = screen.getAllByRole('article')
    await user.click(within(first).getByRole('link', { name: '@julio' }))
    expect(router.state.location.pathname).toBe('/perfil/julio')
  })
})
