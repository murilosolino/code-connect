import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { RedirectIfAuthenticated, RequireAuth } from '../components/layout/RouteGuards'
import { AboutPage } from '../pages/AboutPage'
import { FeedPage } from '../pages/FeedPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ProjectPage } from '../pages/ProjectPage'
import { PublishPage } from '../pages/PublishPage'
import { SignupPage } from '../pages/SignupPage'

/**
 * Árvore de rotas.
 * Telas internas ficam sob o AppLayout; Login e Cadastro ficam fora dele.
 */
export const routes: RouteObject[] = [
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <SignupPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: 'projeto/:id', element: <ProjectPage /> },
      { path: 'perfil/:handle', element: <ProfilePage /> },
      { path: 'sobre', element: <AboutPage /> },
      { element: <RequireAuth />, children: [{ path: 'publicar', element: <PublishPage /> }] },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
