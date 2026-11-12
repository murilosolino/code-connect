import { useMemo, useReducer, type ReactNode } from 'react'
import { createSeedState } from '../seed'
import type { AppState } from '../types'
import { AppDataContext } from './AppDataContext'
import { appReducer } from './reducer'

type Props = {
  children: ReactNode
  /** Estado inicial; os testes usam para montar cenários sem tocar no seed. */
  initialState?: AppState
}

/**
 * Estado compartilhado entre as telas, em memória. Recarregar a página recria
 * o estado a partir do seed.
 */
export function AppDataProvider({ children, initialState }: Props) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => initial ?? createSeedState())
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <AppDataContext value={value}>{children}</AppDataContext>
}
