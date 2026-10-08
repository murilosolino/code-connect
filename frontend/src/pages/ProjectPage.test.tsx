import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routes } from '../app/router'
import { renderWithProviders } from '../test/renderWithProviders'

const open = (route: string) => renderWithProviders(null, { routes, route })
const card = () => screen.getByRole('article')

describe('ProjectPage', () => {
  it('mostra o projeto em versão de página, com a descrição completa', () => {
    open('/projeto/vendas')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard de vendas com React' }),
    ).toBeInTheDocument()
    expect(within(card()).getByText(/exportado como imagem/)).toBeInTheDocument()
    expect(document.title).toBe('Dashboard de vendas com React · CodeConnect')
  })

  it('aprovar soma 1 ao contador e marca o botão; aprovar de novo desfaz', async () => {
    const { user } = open('/projeto/vendas')

    await user.click(within(card()).getByRole('button', { name: 'Aprovar 32' }))
    expect(within(card()).getByRole('button', { name: 'Aprovar 33' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(within(card()).getByRole('button', { name: 'Aprovar 33' }))
    expect(within(card()).getByRole('button', { name: 'Aprovar 32' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('lista os comentários de exemplo, com respostas', () => {
    open('/projeto/vendas')
    expect(screen.getByRole('heading', { level: 2, name: 'Comentários' })).toBeInTheDocument()
    expect(screen.getByText('@ana.souza')).toBeInTheDocument()
    expect(screen.getByText('Salvei para estudar depois. Parabéns pelo projeto!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ocultar respostas' })).toBeInTheDocument()
  })

  it('comentar adiciona @voce ao fim, limpa o campo e atualiza o contador', async () => {
    const { user } = open('/projeto/vendas')
    expect(within(card()).getByText('3')).toBeInTheDocument()

    const field = screen.getByLabelText('Seu comentário')
    expect(field).toHaveAttribute('placeholder', 'Escreva algo para @julio')
    await user.type(field, 'Excelente trabalho!{Enter}')

    const handles = screen.getAllByText(/^@(ana\.souza|rafa\.dev|bia|voce|julio|carol)$/)
    expect(handles.some((el) => el.textContent === '@voce')).toBe(true)
    expect(screen.getByText('Excelente trabalho!')).toBeInTheDocument()
    expect(field).toHaveValue('')
    expect(within(card()).getByText('4')).toBeInTheDocument()
  })

  it('comentário vazio ou só com espaços não é adicionado', async () => {
    const { user } = open('/projeto/vendas')
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    await user.type(screen.getByLabelText('Seu comentário'), '   {Enter}')
    expect(within(card()).getByText('3')).toBeInTheDocument()
    expect(screen.queryByText('@voce')).not.toBeInTheDocument()
  })

  it('"Voltar ao feed" navega para o feed, que mantém comentário e aprovação feitos', async () => {
    const { user, router } = open('/projeto/vendas')
    await user.click(within(card()).getByRole('button', { name: 'Aprovar 32' }))
    await user.type(screen.getByLabelText('Seu comentário'), 'Show!{Enter}')

    await user.click(screen.getByRole('link', { name: 'Voltar ao feed' }))
    expect(router.state.location.pathname).toBe('/')

    const vendas = screen
      .getAllByRole('article')
      .find((article) => within(article).queryByText('Dashboard de vendas com React'))!
    expect(within(vendas).getByRole('button', { name: 'Aprovar 33' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(vendas).getByRole('link', { name: 'Comentários 4' })).toBeInTheDocument()
  })

  it('no detalhe, o item "Feed" do menu é a página atual', () => {
    open('/projeto/vendas')
    const menu = screen.getByRole('navigation', { name: 'Navegação principal' })
    expect(within(menu).getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
  })

  it('projeto inexistente mostra o estado "não encontrado" com o caminho de volta', () => {
    open('/projeto/inexistente')
    expect(screen.getByRole('heading', { level: 1, name: 'Projeto não encontrado' })).toBeInTheDocument()
    expect(
      screen.getByText('Confira o endereço ou volte ao feed para ver outros projetos.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao feed' })).toHaveAttribute('href', '/')
  })
})
