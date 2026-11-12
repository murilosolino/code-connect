import { createContext } from 'react'
import type { AuthViewer } from '../types'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type LoginInput = { identifier: string; password: string; remember: boolean }
export type SignupInput = { name: string; email: string; password: string; remember: boolean }

export type AuthContextValue = {
  status: AuthStatus
  viewer: AuthViewer | null
  /** Rejeitam com `ApiError` (credenciais inválidas, email em uso, falha de rede...). */
  login: (input: LoginInput) => Promise<void>
  signup: (input: SignupInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
