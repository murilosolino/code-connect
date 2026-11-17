import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { routes } from '../app/router'
import { stubFetch } from '../test/fetchStub'
import { renderWithProviders } from '../test/renderWithProviders'

const maria = { handle: 'maria', name: 'Maria Lima', initials: 'ML', avatarUrl: null }
const open = () => renderWithProviders(null, { routes, route: '/cadastro', viewer: null })

async function fill(user: ReturnType<typeof open>['user'], password = 'senha-segura') {
  await user.type(screen.getByLabelText('Nome'), 'Maria Lima')
  await user.type(screen.getByLabelText('Email'), 'maria@ex.com')
  await user.type(screen.getByLabelText('Senha'), password)
}

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

  it('não oferece GitHub nem Google enquanto o login social não existe', () => {
    open()
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Google' })).not.toBeInTheDocument()
  })

  it('enviar vazio mostra as três mensagens, foca o primeiro campo e não chama a API', async () => {
    const { calls } = stubFetch({})
    const { user, router } = open()
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe seu email.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(router.state.location.pathname).toBe('/cadastro')
    expect(calls).toHaveLength(0)
  })

  it('um email em formato inválido mostra a mensagem própria e foca o campo', async () => {
    const { user } = open()
    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@')
    await user.type(screen.getByLabelText('Senha'), 'senha-segura')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getByText('Digite um email válido.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('uma senha com menos de 8 caracteres mostra a mensagem e não chama a API', async () => {
    const { calls } = stubFetch({})
    const { user } = open()
    await fill(user, '1234567')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getByText('Use ao menos 8 caracteres.')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveFocus()
    expect(calls).toHaveLength(0)
  })

  it('preenchido, cria a conta na API e leva ao feed', async () => {
    const { calls } = stubFetch({ 'POST /api/auth/signup': () => ({ status: 201, json: maria }) })
    const { user, router } = open()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(calls).toEqual([
      {
        method: 'POST',
        path: '/api/auth/signup',
        body: { name: 'Maria Lima', email: 'maria@ex.com', password: 'senha-segura', remember: false },
      },
    ])
  })

  it('"Lembrar-me" marcado é enviado à API', async () => {
    const { calls } = stubFetch({ 'POST /api/auth/signup': () => ({ status: 201, json: maria }) })
    const { user, router } = open()

    await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(calls[0].body).toMatchObject({ remember: true })
  })

  it('email já cadastrado aparece no campo de email, com foco, e mantém a tela', async () => {
    stubFetch({
      'POST /api/auth/signup': () => ({
        status: 409,
        json: {
          error: {
            code: 'conflict',
            message: 'Este email já está em uso.',
            fields: { email: 'Este email já está em uso.' },
          },
        },
      }),
    })
    const { user, router } = open()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Este email já está em uso.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(router.state.location.pathname).toBe('/cadastro')
  })

  it('erros por campo da API (validação do servidor) aparecem nos campos', async () => {
    stubFetch({
      'POST /api/auth/signup': () => ({
        status: 422,
        json: {
          error: {
            code: 'validation_failed',
            message: 'Confira os campos destacados.',
            fields: { name: 'Use um nome de até 120 caracteres.' },
          },
        },
      }),
    })
    const { user } = open()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Use um nome de até 120 caracteres.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveFocus()
  })

  it('falha sem campo (rede ou servidor) mostra a mensagem geral', async () => {
    stubFetch({ 'POST /api/auth/signup': () => ({ status: 500 }) })
    const { user, router } = open()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Não foi possível concluir agora. Tente novamente.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cadastro')
  })

  it('o botão fica desabilitado enquanto a API responde', async () => {
    stubFetch({ 'POST /api/auth/signup': () => new Promise(() => {}) })
    const { user } = open()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeDisabled()
  })

  it('quem já está logado é levado ao feed', () => {
    const { router } = renderWithProviders(null, { routes, route: '/cadastro' })
    expect(router.state.location.pathname).toBe('/')
  })

  it('"Faça seu login!" leva ao login', async () => {
    const { user, router } = open()
    await user.click(screen.getByRole('link', { name: 'Faça seu login!' }))
    expect(router.state.location.pathname).toBe('/login')
  })
})
