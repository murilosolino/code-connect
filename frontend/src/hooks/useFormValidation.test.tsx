import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { required } from '../lib/validation'
import { useFormValidation } from './useFormValidation'

const schema = {
  nome: [required('Informe o nome.')],
  email: [required('Informe o email.')],
}

function TestForm({ onValid }: { onValid: (values: Record<'nome' | 'email', string>) => void }) {
  const form = useFormValidation(schema)
  const { error: nomeError, ...nome } = form.register('nome')
  const { error: emailError, ...email } = form.register('email')
  return (
    <form onSubmit={form.handleSubmit(onValid)} noValidate>
      <label>
        Nome
        <input {...nome} />
      </label>
      {nomeError && <p>{nomeError}</p>}
      <label>
        Email
        <input {...email} />
      </label>
      {emailError && <p>{emailError}</p>}
      <button type="submit">Enviar</button>
    </form>
  )
}

describe('useFormValidation', () => {
  it('não chama onValid com campos vazios, mostra os erros e foca o primeiro inválido', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<TestForm onValid={onValid} />)

    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onValid).not.toHaveBeenCalled()
    expect(screen.getByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe o email.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveFocus()
  })

  it('foca o primeiro campo inválido, mesmo quando o anterior está válido', async () => {
    const user = userEvent.setup()
    render(<TestForm onValid={vi.fn()} />)

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.queryByText('Informe o nome.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('remove só o erro do campo corrigido', async () => {
    const user = userEvent.setup()
    render(<TestForm onValid={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    await user.type(screen.getByLabelText('Nome'), 'A')

    expect(screen.queryByText('Informe o nome.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe o email.')).toBeInTheDocument()
  })

  it('chama onValid com os valores digitados quando tudo está válido', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<TestForm onValid={onValid} />)

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@ex.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onValid).toHaveBeenCalledWith({ nome: 'Ana', email: 'ana@ex.com' })
  })

  it('trata campo só com espaços como vazio', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<TestForm onValid={onValid} />)

    await user.type(screen.getByLabelText('Nome'), '   ')
    await user.type(screen.getByLabelText('Email'), 'ana@ex.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onValid).not.toHaveBeenCalled()
    expect(screen.getByText('Informe o nome.')).toBeInTheDocument()
  })
})
