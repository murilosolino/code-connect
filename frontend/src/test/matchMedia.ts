import { vi } from 'vitest'

type Listener = () => void

/**
 * O jsdom não tem `matchMedia` (as telas então caem no layout mobile). Este stub deixa um
 * teste simular o desktop e disparar a mudança de largura. É desfeito após cada teste.
 */
export function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches
  const listeners = new Set<Listener>()

  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return matches
    },
    media: query,
    addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
  }))

  return {
    /** Muda o resultado da consulta e avisa quem está ouvindo. */
    set(next: boolean) {
      matches = next
      listeners.forEach((listener) => listener())
    },
  }
}
