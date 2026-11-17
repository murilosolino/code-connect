import { vi } from 'vitest'

export type StubbedReply = { status?: number; json?: unknown }
export type StubbedHandler = (body: unknown, init: RequestInit) => StubbedReply | Promise<StubbedReply>

/**
 * Troca o `fetch` global por um simulado, indexado por "MÉTODO /caminho". Cada chamada fica
 * em `calls`. O `afterEach` de `test/setup.ts` desfaz o stub.
 */
export function stubFetch(handlers: Record<string, StubbedHandler>) {
  const calls: { method: string; path: string; body: unknown }[] = []

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const method = (init.method ?? 'GET').toUpperCase()
    const path = String(input)
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined
    calls.push({ method, path, body })

    const handler = handlers[`${method} ${path}`]
    if (!handler) throw new Error(`fetch sem simulação: ${method} ${path}`)
    const { status = 200, json } = await handler(body, init)
    return new Response(status === 204 || json === undefined ? null : JSON.stringify(json), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  })

  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, calls }
}
