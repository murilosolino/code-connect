import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('mostra o título como heading de nível 2 por padrão, com a descrição', () => {
    renderWithProviders(
      <EmptyState
        icon="search"
        title="Nenhum projeto encontrado"
        description="Tente outra busca ou remova alguns filtros."
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nenhum projeto encontrado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Tente outra busca ou remova alguns filtros.')).toBeInTheDocument()
  })

  it('aceita outro nível de heading', () => {
    renderWithProviders(<EmptyState icon="info" title="Página não encontrada" headingLevel={1} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('esconde o ícone dos leitores de tela', () => {
    const { container } = renderWithProviders(<EmptyState icon="info" title="Perfil não encontrado" />)
    expect(container.querySelector('.material-symbols-outlined')).toHaveAttribute('aria-hidden', 'true')
  })

  it('com `action` mostra um link para o destino', () => {
    renderWithProviders(
      <EmptyState
        icon="info"
        title="Projeto não encontrado"
        action={{ label: 'Voltar ao feed', to: '/' }}
      />,
    )
    expect(screen.getByRole('link', { name: 'Voltar ao feed' })).toHaveAttribute('href', '/')
  })

  it('sem `action` não mostra link', () => {
    renderWithProviders(<EmptyState icon="code" title="Nenhum projeto publicado ainda." />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
