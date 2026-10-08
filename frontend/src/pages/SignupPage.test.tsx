import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routes } from '../app/router'
import { renderWithProviders } from '../test/renderWithProviders'

const open = () => renderWithProviders(null, { routes, route: '/cadastro' })

describe('SignupPage', () => {
  it('mostra o título, a saudação e os campos, sem o menu de navegação', () => {
    open()
    expect(screen.getByRole('heading', { level: 1, name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByText('Olá! Preencha seus dados.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(document.title).toBe('Cadastro · CodeConnect')
  })

  it('enviar vazio mostra as três mensagens, foca o primeiro campo e não navega', async () => {
    const { user, router } = open()
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe seu email.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(router.state.location.pathname).toBe('/cadastro')
  })

  it('um email em formato inválido mostra a mensagem própria e foca o campo', async () => {
    const { user } = open()
    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@')
    await user.type(screen.getByLabelText('Senha'), 'segredo')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getByText('Digite um email válido.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('preenchido, "Cadastrar" leva ao feed', async () => {
    const { user, router } = open()
    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@ex.com')
    await user.type(screen.getByLabelText('Senha'), 'segredo')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
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

  it('"Faça seu login!" leva ao login', async () => {
    const { user, router } = open()
    await user.click(screen.getByRole('link', { name: 'Faça seu login!' }))
    expect(router.state.location.pathname).toBe('/login')
  })
})
