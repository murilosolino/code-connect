import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routes } from '../app/router'
import { renderWithProviders } from '../test/renderWithProviders'

const open = () => renderWithProviders(null, { routes, route: '/login' })

describe('LoginPage', () => {
  it('mostra o título, a saudação e os campos, sem o menu de navegação', () => {
    open()
    expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(document.title).toBe('Login · CodeConnect')
  })

  it('tem "Lembrar-me" e o link "Esqueci a senha"', async () => {
    const { user } = open()
    const remember = screen.getByRole('checkbox', { name: 'Lembrar-me' })
    expect(remember).not.toBeChecked()
    await user.click(remember)
    expect(remember).toBeChecked()
    expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toBeInTheDocument()
  })

  it('enviar vazio mostra as duas mensagens, foca o primeiro campo e não navega', async () => {
    const { user, router } = open()
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByText('Informe seu email ou usuário.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email ou usuário')).toHaveFocus()
    expect(screen.getByLabelText('Email ou usuário')).toHaveAttribute('aria-invalid', 'true')
    expect(router.state.location.pathname).toBe('/login')
  })

  it('corrigir um campo remove só o erro dele', async () => {
    const { user } = open()
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await user.type(screen.getByLabelText('Email ou usuário'), 'u')

    expect(screen.queryByText('Informe seu email ou usuário.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
  })

  it('preenchido, "Login" leva ao feed', async () => {
    const { user, router } = open()
    await user.type(screen.getByLabelText('Email ou usuário'), 'usuario123')
    await user.type(screen.getByLabelText('Senha'), 'segredo')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('"GitHub" e "Google" levam ao feed sem validar os campos', async () => {
    const first = open()
    await first.user.click(screen.getByRole('link', { name: 'GitHub' }))
    expect(first.router.state.location.pathname).toBe('/')
    first.unmount()

    const second = open()
    await second.user.click(screen.getByRole('link', { name: 'Google' }))
    expect(second.router.state.location.pathname).toBe('/')
  })

  it('"Crie seu cadastro!" leva ao cadastro', async () => {
    const { user, router } = open()
    await user.click(screen.getByRole('link', { name: 'Crie seu cadastro!' }))
    expect(router.state.location.pathname).toBe('/cadastro')
  })
})
