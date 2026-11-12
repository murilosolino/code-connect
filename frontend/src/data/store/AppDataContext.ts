import { createContext, type Dispatch } from 'react'
import type { AppState } from '../types'
import type { AppAction } from './reducer'

export type AppDataContextValue = {
  state: AppState
  dispatch: Dispatch<AppAction>
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
