import { render, screen, waitFor } from '@testing-library/react'
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

function AsyncForm({ onValid }: { onValid: (values: Record<'nome' | 'email', string>) => Promise<void> }) {
  const form = useFormValidation(schema)
  const { error: nomeError, ...nome } = form.register('nome')
  const { error: emailError, ...email } = form.register('email')
  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await onValid(values)
        } catch {
          form.setFieldErrors({ email: 'Este email já está em uso.' })
        }
      })}
      noValidate
    >
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
      <button type="submit" disabled={form.submitting}>
        Enviar
      </button>
    </form>
  )
}

describe('useFormValidation (envio assíncrono)', () => {
  it('desabilita o envio enquanto aguarda e reabilita no fim', async () => {
    const user = userEvent.setup()
    let finish: () => void = () => {}
    const onValid = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(<AsyncForm onValid={onValid} />)

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@x.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    finish()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar' })).toBeEnabled())
  })

  it('não envia duas vezes com o envio em andamento', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn(() => new Promise<void>(() => {}))
    render(<AsyncForm onValid={onValid} />)

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@x.com')
    await user.keyboard('{Enter}')
    await user.keyboard('{Enter}')

    expect(onValid).toHaveBeenCalledTimes(1)
  })

  it('mostra o erro vindo do servidor no campo e foca nele', async () => {
    const user = userEvent.setup()
    render(<AsyncForm onValid={() => Promise.reject(new Error('conflito'))} />)

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@x.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Este email já está em uso.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('corrigir o campo remove o erro do servidor', async () => {
    const user = userEvent.setup()
    render(<AsyncForm onValid={() => Promise.reject(new Error('conflito'))} />)
    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@x.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    await screen.findByText('Este email já está em uso.')

    await user.type(screen.getByLabelText('Email'), 'm')

    expect(screen.queryByText('Este email já está em uso.')).not.toBeInTheDocument()
  })
})
