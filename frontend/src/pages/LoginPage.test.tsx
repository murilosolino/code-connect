import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routes } from '../app/router'
import { stubFetch } from '../test/fetchStub'
import { renderWithProviders } from '../test/renderWithProviders'

const maria = { handle: 'maria', name: 'Maria Lima', initials: 'ML', avatarUrl: null }
const open = (route = '/login') => renderWithProviders(null, { routes, route, viewer: null })

async function fillAndSubmit(user: ReturnType<typeof open>['user']) {
  await user.type(screen.getByLabelText('Email ou usuário'), 'maria')
  await user.type(screen.getByLabelText('Senha'), 'senha-segura')
  await user.click(screen.getByRole('button', { name: 'Login' }))
}

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

  it('não oferece GitHub nem Google enquanto o login social não existe', () => {
    open()
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Google' })).not.toBeInTheDocument()
    expect(screen.queryByText('ou entre com outras contas')).not.toBeInTheDocument()
  })

  it('tem "Lembrar-me" e o link "Esqueci a senha"', async () => {
    const { user } = open()
    const remember = screen.getByRole('checkbox', { name: 'Lembrar-me' })
    expect(remember).not.toBeChecked()
    await user.click(remember)
    expect(remember).toBeChecked()
    expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toBeInTheDocument()
  })

  it('enviar vazio mostra as duas mensagens, foca o primeiro campo e não chama a API', async () => {
    const { calls } = stubFetch({})
    const { user, router } = open()
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByText('Informe seu email ou usuário.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email ou usuário')).toHaveFocus()
    expect(screen.getByLabelText('Email ou usuário')).toHaveAttribute('aria-invalid', 'true')
    expect(router.state.location.pathname).toBe('/login')
    expect(calls).toHaveLength(0)
  })

  it('corrigir um campo remove só o erro dele', async () => {
    const { user } = open()
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await user.type(screen.getByLabelText('Email ou usuário'), 'u')

    expect(screen.queryByText('Informe seu email ou usuário.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
  })

  it('preenchido, envia as credenciais à API e leva ao feed', async () => {
    const { calls } = stubFetch({ 'POST /api/auth/login': () => ({ json: maria }) })
    const { user, router } = open()

    await fillAndSubmit(user)

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/api/auth/login',
        body: { identifier: 'maria', password: 'senha-segura', remember: false },
      },
    ])
  })

  it('"Lembrar-me" marcado é enviado à API', async () => {
    const { calls } = stubFetch({ 'POST /api/auth/login': () => ({ json: maria }) })
    const { user, router } = open()

    await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await fillAndSubmit(user)

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(calls[0].body).toMatchObject({ remember: true })
  })

  it('credenciais incorretas mostram a mensagem no campo de senha e mantêm a tela', async () => {
    stubFetch({
      'POST /api/auth/login': () => ({
        status: 401,
        json: {
          error: {
            code: 'invalid_credentials',
            message: 'Não foi possível entrar.',
            fields: { password: 'Email, usuário ou senha incorretos.' },
          },
        },
      }),
    })
    const { user, router } = open()

    await fillAndSubmit(user)

    expect(await screen.findByText('Email, usuário ou senha incorretos.')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveFocus()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'true')
    expect(router.state.location.pathname).toBe('/login')
  })

  it('falha sem campo (rede ou servidor) mostra a mensagem geral e mantém a tela', async () => {
    stubFetch({ 'POST /api/auth/login': () => ({ status: 503 }) })
    const { user, router } = open()

    await fillAndSubmit(user)

    expect(await screen.findByText('Não foi possível concluir agora. Tente novamente.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled()
  })

  it('o botão fica desabilitado enquanto a API responde', async () => {
    stubFetch({ 'POST /api/auth/login': () => new Promise(() => {}) })
    const { user } = open()

    await fillAndSubmit(user)

    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled()
  })

  it('depois de entrar, volta à tela que exigiu o login', async () => {
    stubFetch({ 'POST /api/auth/login': () => ({ json: maria }) })
    const { user, router } = open('/publicar')
    expect(router.state.location.pathname).toBe('/login')

    await fillAndSubmit(user)

    await waitFor(() => expect(router.state.location.pathname).toBe('/publicar'))
  })

  it('quem já está logado é levado ao feed', () => {
    const { router } = renderWithProviders(null, { routes, route: '/login' })
    expect(router.state.location.pathname).toBe('/')
  })

  it('"Crie seu cadastro!" leva ao cadastro', async () => {
    const { user, router } = open()
    await user.click(screen.getByRole('link', { name: 'Crie seu cadastro!' }))
    expect(router.state.location.pathname).toBe('/cadastro')
  })
})
