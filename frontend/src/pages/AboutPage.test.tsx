import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routes } from '../app/router'
import { renderWithProviders } from '../test/renderWithProviders'

const open = () => renderWithProviders(null, { routes, route: '/sobre' })

describe('AboutPage', () => {
  it('mostra o banner com a frase de destaque e o subtítulo', () => {
    open()
    expect(screen.getByText('Código em primeiro plano')).toBeInTheDocument()
    expect(
      screen.getByText('Uma rede para compartilhar projetos e conversar sobre código.'),
    ).toBeInTheDocument()
  })

  it('o banner é só ilustração: o editor de código fica escondido dos leitores de tela', () => {
    open()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('tem um único h1 "Sobre nós" e as seções do protótipo como h2', () => {
    open()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Sobre nós' })).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(['Nossa missão', 'Como funciona', 'Para quem é'])
    expect(document.title).toBe('Sobre nós · CodeConnect')
  })

  it('traz os textos de apresentação, missão e público', () => {
    open()
    expect(screen.getByText(/O CodeConnect é uma rede social para quem programa/)).toBeInTheDocument()
    expect(screen.getByText(/Tornar o aprendizado em programação mais colaborativo/)).toBeInTheDocument()
    expect(screen.getByText(/Para quem está começando e quer feedback/)).toBeInTheDocument()
  })

  it('"Como funciona" tem 3 passos', () => {
    open()
    const section = screen.getByRole('region', { name: 'Como funciona' })
    const items = within(section).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Publique um projeto com a imagem do código')
    expect(items[1]).toHaveTextContent('Aprove e compartilhe os projetos que te ensinarem algo.')
    expect(items[2]).toHaveTextContent('Comente, responda e siga os perfis que você quer acompanhar.')
  })

  it('"Publicar um projeto" leva a /publicar', async () => {
    const { user, router } = open()
    const link = screen.getByRole('link', { name: 'Publicar um projeto' })
    expect(link).toHaveAttribute('href', '/publicar')
    await user.click(link)
    expect(router.state.location.pathname).toBe('/publicar')
  })

  it('o item "Sobre nós" do menu é a página atual', () => {
    open()
    const menu = screen.getByRole('navigation', { name: 'Navegação principal' })
    expect(within(menu).getByRole('link', { name: 'Sobre nós' })).toHaveAttribute('aria-current', 'page')
    expect(within(menu).getByRole('link', { name: 'Feed' })).not.toHaveAttribute('aria-current')
  })
})
