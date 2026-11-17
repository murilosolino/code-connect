const GENERIC_MESSAGE = 'Não foi possível concluir agora. Tente novamente.'

/** Erro devolvido pela API (`{ error: { code, message, fields } }`) ou falha de rede (`status` 0). */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** Mensagens por campo de formulário, quando a API as informa. */
  readonly fields: Record<string, string>

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

/**
 * Erros por campo que o formulário sabe mostrar, ou `null` quando o erro não é da API ou não
 * traz nenhum campo conhecido (então a tela mostra a mensagem geral).
 */
export function fieldErrorsFrom<K extends string>(
  error: unknown,
  names: readonly K[],
): Partial<Record<K, string>> | null {
  if (!(error instanceof ApiError)) return null
  const known = names.filter((name) => error.fields[name])
  if (known.length === 0) return null
  return Object.fromEntries(known.map((name) => [name, error.fields[name]])) as Partial<Record<K, string>>
}

/** Mensagem geral para falhas que não são de um campo. */
export const GENERAL_ERROR_MESSAGE = GENERIC_MESSAGE

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

type ErrorBody = { error?: { code?: string; message?: string; fields?: Record<string, string> } }

async function readError(response: Response): Promise<ApiError> {
  let detail: ErrorBody['error']
  try {
    detail = ((await response.json()) as ErrorBody).error
  } catch {
    detail = undefined
  }
  return new ApiError(
    response.status,
    detail?.code ?? 'unknown',
    detail?.message ?? GENERIC_MESSAGE,
    detail?.fields ?? {},
  )
}

/** Chama `/api{path}` (URL relativa, proxy do Vite/nginx) com o cookie de sessão. */
export async function apiRequest<T = unknown>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'network', GENERIC_MESSAGE)
  }

  if (!response.ok) throw await readError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
