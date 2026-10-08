import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { FeedPage } from '../pages/FeedPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProjectPage } from '../pages/ProjectPage'

/**
 * Árvore de rotas (specs/001-frontend-telas-prototipo/contracts/routes.md).
 * Telas internas ficam sob o AppLayout; Login e Cadastro ficam fora dele.
 */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: 'projeto/:id', element: <ProjectPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
