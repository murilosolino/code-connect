import { describe, expect, it, vi } from 'vitest'
import { stubFetch } from '../test/fetchStub'
import { ApiError, apiRequest } from './api'

describe('apiRequest', () => {
  it('chama a URL relativa /api com o método e devolve o JSON', async () => {
    const { calls, fetchMock } = stubFetch({ 'GET /api/auth/me': () => ({ json: { handle: 'maria' } }) })

    await expect(apiRequest('/auth/me')).resolves.toEqual({ handle: 'maria' })

    expect(calls).toEqual([{ method: 'GET', path: '/api/auth/me', body: undefined }])
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'same-origin' })
  })

  it('envia o corpo como JSON', async () => {
    const { calls, fetchMock } = stubFetch({ 'POST /api/auth/login': () => ({ json: {} }) })

    await apiRequest('/auth/login', { method: 'POST', body: { identifier: 'maria', password: 'x' } })

    expect(calls[0].body).toEqual({ identifier: 'maria', password: 'x' })
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Content-Type')).toBe('application/json')
  })

  it('devolve undefined em 204', async () => {
    stubFetch({ 'POST /api/auth/logout': () => ({ status: 204 }) })
    await expect(apiRequest('/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('transforma o corpo de erro da API em ApiError', async () => {
    stubFetch({
      'POST /api/auth/signup': () => ({
        status: 409,
        json: { error: { code: 'conflict', message: 'Conflito.', fields: { email: 'Este email já está em uso.' } } },
      }),
    })

    const error = await apiRequest('/auth/signup', { method: 'POST', body: {} }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 409,
      code: 'conflict',
      message: 'Conflito.',
      fields: { email: 'Este email já está em uso.' },
    })
  })

  it('usa uma mensagem genérica quando o erro não vem no formato da API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>502</html>', { status: 502 })))

    const error = (await apiRequest('/health').catch((e: unknown) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(502)
    expect(error.code).toBe('unknown')
    expect(error.fields).toEqual({})
    expect(error.message).toBe('Não foi possível concluir agora. Tente novamente.')
  })

  it('falha de rede vira ApiError com status 0', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))))

    const error = (await apiRequest('/health').catch((e: unknown) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0, code: 'network' })
  })
})
