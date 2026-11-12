import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TextField } from './TextField'

describe('TextField', () => {
  it('associa o rótulo ao campo', () => {
    render(<TextField label="Email ou usuário" />)
    expect(screen.getByLabelText('Email ou usuário')).toBeInstanceOf(HTMLInputElement)
  })

  it('aceita os tipos email e password', () => {
    render(
      <>
        <TextField label="Email" type="email" />
        <TextField label="Senha" type="password" />
      </>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('renderiza um <textarea> com type="textarea"', () => {
    render(<TextField label="Descrição" type="textarea" />)
    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA')
  })

  it('chama onChange ao digitar', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextField label="Nome" onChange={onChange} />)
    await user.type(screen.getByLabelText('Nome'), 'Ana')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('entrega a ref ao campo', () => {
    const ref = createRef<HTMLInputElement>()
    render(<TextField label="Nome" ref={ref} />)
    expect(ref.current).toBe(screen.getByLabelText('Nome'))
  })

  it('sem erro não marca o campo como inválido nem tem descrição', () => {
    render(<TextField label="Nome" />)
    const field = screen.getByLabelText('Nome')
    expect(field).not.toHaveAttribute('aria-invalid', 'true')
    expect(field).not.toHaveAccessibleDescription()
  })

  it('com erro marca o campo como inválido e liga a mensagem a ele', () => {
    render(<TextField label="Nome" error="Informe seu nome." />)
    const field = screen.getByLabelText('Nome')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Informe seu nome.')
  })

  it('mostra a mensagem de erro numa região aria-live polite', () => {
    render(<TextField label="Nome" error="Informe seu nome." />)
    const region = screen.getByText('Informe seu nome.').closest('[aria-live]')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('mantém a região de aviso no DOM sem erro, para anunciar quando o erro aparecer', () => {
    const { container } = render(<TextField label="Nome" />)
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })

  it('com hideLabel mantém o rótulo acessível', () => {
    render(<TextField label="Seu comentário" hideLabel />)
    expect(screen.getByLabelText('Seu comentário')).toBeInTheDocument()
  })
})
