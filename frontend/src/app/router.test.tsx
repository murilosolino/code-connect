import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { routes } from './router'

/** Endereços existentes: cada user story acrescenta o seu (SC-006: nenhuma chamada à API). */
const KNOWN_PATHS = ['/', '/projeto/vendas', '/publicar', '/perfil/julio', '/sobre', '/login', '/cadastro', '/qualquer-coisa']

describe('rotas do app', () => {
  it('mostra "Página não encontrada" em um endereço desconhecido, com o caminho de volta', () => {
    renderWithProviders(null, { routes, route: '/qualquer-coisa' })
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByText('O endereço que você abriu não existe.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao feed' })).toHaveAttribute('href', '/')
  })

  it('muda o título do documento por página', () => {
    renderWithProviders(null, { routes, route: '/qualquer-coisa' })
    expect(document.title).toBe('Página não encontrada · CodeConnect')
  })

  it.each(KNOWN_PATHS)('não chama fetch ao renderizar %s', (path) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    renderWithProviders(null, { routes, route: path })
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
