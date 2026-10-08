import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AppDataProvider } from '../data/store/AppDataProvider'
import type { AppState } from '../data/types'

type Options = {
  /** Endereço inicial. */
  route?: string
  /** Padrão da rota do elemento (ex.: `/projeto/:id`, para `useParams`). */
  path?: string
  /** Árvore de rotas completa (ex.: as `routes` do app); neste caso `ui` é ignorado. */
  routes?: RouteObject[]
  initialState?: AppState
}

/**
 * Renderiza dentro do store de dados e de um roteador em memória.
 * Devolve também `user` (user-event) e `router` (para checar `router.state.location`).
 */
export function renderWithProviders(
  ui: ReactElement | null = null,
  { route = '/', path = '*', routes, initialState }: Options = {},
) {
  const router = createMemoryRouter(routes ?? [{ path, element: ui }], {
    initialEntries: [route],
  })
  const user = userEvent.setup()
  const utils = render(
    <AppDataProvider initialState={initialState}>
      <RouterProvider router={router} />
    </AppDataProvider>,
  )
  return { user, router, ...utils }
}
