import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../../lib/api'
import { stubFetch } from '../../test/fetchStub'
import { AppDataProvider } from '../store/AppDataProvider'
import { useUser, useViewer } from '../store/hooks'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

const maria = { handle: 'maria', name: 'Maria Lima', initials: 'ML', avatarUrl: null }
const unauthenticated = { status: 401, json: { error: { code: 'unauthenticated', message: 'Faça login.' } } }

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AppDataProvider>
      <AuthProvider>{children}</AuthProvider>
    </AppDataProvider>
  )
}

const mount = () =>
  renderHook(() => ({ auth: useAuth(), viewer: useViewer(), maria: useUser('maria') }), { wrapper })

describe('AuthProvider', () => {
  it('começa em "loading", consulta /auth/me e vira "authenticated"', async () => {
    const { calls } = stubFetch({ 'GET /api/auth/me': () => ({ json: maria }) })

    const { result } = mount()
    expect(result.current.auth.status).toBe('loading')

    await waitFor(() => expect(result.current.auth.status).toBe('authenticated'))
    expect(result.current.auth.viewer).toEqual(maria)
    expect(calls).toHaveLength(1)
  })

  it('leva a pessoa para o store: handle do viewer e perfil com iniciais', async () => {
    stubFetch({ 'GET /api/auth/me': () => ({ json: maria }) })

    const { result } = mount()

    await waitFor(() => expect(result.current.viewer).toEqual({ handle: 'maria' }))
    expect(result.current.maria).toMatchObject({ name: 'Maria Lima', initials: 'ML', connectionsDisplayed: 0 })
  })

  it('sem sessão (401) vira "anonymous" e limpa o viewer do store', async () => {
    stubFetch({ 'GET /api/auth/me': () => unauthenticated })

    const { result } = mount()

    await waitFor(() => expect(result.current.auth.status).toBe('anonymous'))
    expect(result.current.auth.viewer).toBeNull()
    expect(result.current.viewer).toEqual({ handle: '' })
  })

  it('falha do servidor ao consultar a sessão também vira "anonymous"', async () => {
    stubFetch({ 'GET /api/auth/me': () => ({ status: 503 }) })
    const { result } = mount()
    await waitFor(() => expect(result.current.auth.status).toBe('anonymous'))
  })

  it('login envia as credenciais e autentica', async () => {
    const { calls } = stubFetch({
      'GET /api/auth/me': () => unauthenticated,
      'POST /api/auth/login': () => ({ json: maria }),
    })
    const { result } = mount()
    await waitFor(() => expect(result.current.auth.status).toBe('anonymous'))

    await act(() => result.current.auth.login({ identifier: 'maria', password: 'senha-segura', remember: true }))

    expect(calls.at(-1)).toEqual({
      method: 'POST',
      path: '/api/auth/login',
      body: { identifier: 'maria', password: 'senha-segura', remember: true },
    })
    expect(result.current.auth.status).toBe('authenticated')
    expect(result.current.viewer).toEqual({ handle: 'maria' })
  })

  it('login com erro repassa o ApiError e continua anônimo', async () => {
    stubFetch({
      'GET /api/auth/me': () => unauthenticated,
      'POST /api/auth/login': () => ({
        status: 401,
        json: {
          error: {
            code: 'invalid_credentials',
            message: 'x',
            fields: { password: 'Email, usuário ou senha incorretos.' },
          },
        },
      }),
    })
    const { result } = mount()
    await waitFor(() => expect(result.current.auth.status).toBe('anonymous'))

    const error = await act(() =>
      result.current.auth.login({ identifier: 'a', password: 'b', remember: false }).catch((e: unknown) => e),
    )

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).fields.password).toBe('Email, usuário ou senha incorretos.')
    expect(result.current.auth.status).toBe('anonymous')
  })

  it('signup cria a conta e autentica', async () => {
    const { calls } = stubFetch({
      'GET /api/auth/me': () => unauthenticated,
      'POST /api/auth/signup': () => ({ status: 201, json: maria }),
    })
    const { result } = mount()
    await waitFor(() => expect(result.current.auth.status).toBe('anonymous'))

    await act(() =>
      result.current.auth.signup({ name: 'Maria Lima', email: 'maria@x.com', password: 'senha-segura', remember: false }),
    )

    expect(calls.at(-1)?.path).toBe('/api/auth/signup')
    expect(result.current.auth.viewer).toEqual(maria)
  })

  it('logout encerra a sessão e limpa o viewer', async () => {
    const { calls } = stubFetch({
      'GET /api/auth/me': () => ({ json: maria }),
      'POST /api/auth/logout': () => ({ status: 204 }),
    })
    const { result } = mount()
    await waitFor(() => expect(result.current.auth.status).toBe('authenticated'))

    await act(() => result.current.auth.logout())

    expect(calls.at(-1)?.path).toBe('/api/auth/logout')
    expect(result.current.auth.status).toBe('anonymous')
    expect(result.current.viewer).toEqual({ handle: '' })
  })

  it('logout com 401 (sessão já expirada) também conclui', async () => {
    stubFetch({
      'GET /api/auth/me': () => ({ json: maria }),
      'POST /api/auth/logout': () => unauthenticated,
    })
    const { result } = mount()
    await waitFor(() => expect(result.current.auth.status).toBe('authenticated'))

    await act(() => result.current.auth.logout())

    expect(result.current.auth.status).toBe('anonymous')
  })

  it('logout com falha do servidor repassa o erro e mantém a sessão', async () => {
    stubFetch({
      'GET /api/auth/me': () => ({ json: maria }),
      'POST /api/auth/logout': () => ({ status: 500, json: { error: { code: 'internal_error', message: 'x' } } }),
    })
    const { result } = mount()
    await waitFor(() => expect(result.current.auth.status).toBe('authenticated'))

    const error = await act(() => result.current.auth.logout().catch((e: unknown) => e))

    expect(error).toBeInstanceOf(ApiError)
    expect(result.current.auth.status).toBe('authenticated')
  })

  it('com `initial`, não consulta a API', () => {
    const { calls } = stubFetch({})
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AppDataProvider>
          <AuthProvider initial={{ viewer: maria }}>{children}</AuthProvider>
        </AppDataProvider>
      ),
    })

    expect(result.current.status).toBe('authenticated')
    expect(calls).toHaveLength(0)
  })
})
