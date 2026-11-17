import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommentForm } from './CommentForm'

function setup(onSubmit = vi.fn(() => true)) {
  render(<CommentForm onSubmit={onSubmit} placeholder="Escreva algo para @julio" />)
  return { user: userEvent.setup(), onSubmit, field: screen.getByLabelText('Seu comentário') }
}

describe('CommentForm', () => {
  it('tem o campo "Seu comentário" com o placeholder recebido', () => {
    const { field } = setup()
    expect(field).toHaveAttribute('placeholder', 'Escreva algo para @julio')
  })

  it('o botão "Comentar" envia o texto digitado', async () => {
    const { user, onSubmit, field } = setup()
    await user.type(field, 'Muito bom!')
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
  })

  it('Enter também envia', async () => {
    const { user, onSubmit, field } = setup()
    await user.type(field, 'Muito bom!{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
  })

  it('limpa o campo quando o envio é aceito', async () => {
    const { user, field } = setup(vi.fn(() => true))
    await user.type(field, 'Oi{Enter}')
    expect(field).toHaveValue('')
  })

  it('mantém o texto quando o envio é recusado', async () => {
    const { user, field } = setup(vi.fn(() => false))
    await user.type(field, 'Oi{Enter}')
    expect(field).toHaveValue('Oi')
  })

  it('campo vazio ou só com espaços não envia', async () => {
    const { user, onSubmit, field } = setup()
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    await user.type(field, '   {Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
