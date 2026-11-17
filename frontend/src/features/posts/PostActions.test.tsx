import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { PostActions } from './PostActions'

const base = { approvals: 32, shares: 6, comments: 3, approved: false }

describe('PostActions', () => {
  it('aprovar é um botão com rótulo e contador, e aria-pressed do estado aprovado', () => {
    renderWithProviders(<PostActions {...base} onApprove={() => {}} />)
    const approve = screen.getByRole('button', { name: 'Aprovar 32' })
    expect(approve).toHaveAttribute('aria-pressed', 'false')
  })

  it('reflete o projeto aprovado em aria-pressed', () => {
    renderWithProviders(<PostActions {...base} approved onApprove={() => {}} />)
    expect(screen.getByRole('button', { name: 'Aprovar 32' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('chama onApprove ao clicar', async () => {
    const onApprove = vi.fn()
    const { user } = renderWithProviders(<PostActions {...base} onApprove={onApprove} />)
    await user.click(screen.getByRole('button', { name: 'Aprovar 32' }))
    expect(onApprove).toHaveBeenCalledTimes(1)
  })

  it('com commentsTo, comentários é um link para esse endereço', () => {
    renderWithProviders(<PostActions {...base} commentsTo="/projeto/vendas" />)
    expect(screen.getByRole('link', { name: 'Comentários 3' })).toHaveAttribute('href', '/projeto/vendas')
  })

  it('sem commentsTo nem onApprove os itens são estáticos, mas os contadores aparecem', () => {
    renderWithProviders(<PostActions {...base} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('compartilhar mostra só o contador, sem controle', () => {
    renderWithProviders(<PostActions {...base} onApprove={() => {}} commentsTo="/projeto/vendas" />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByText('Compartilhamentos')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })
})
