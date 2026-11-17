import { useCallback, useSyncExternalStore } from 'react'

const hasMatchMedia = () => typeof window.matchMedia === 'function'

/**
 * Resultado de uma media query, atualizado quando a largura muda. Serve para renderizar
 * uma única versão de um bloco (ex.: um só `<nav>` por breakpoint). Sem `matchMedia`
 * (testes no jsdom) devolve `false`, ou seja, o layout mobile.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!hasMatchMedia()) return () => {}
      const media = window.matchMedia(query)
      media.addEventListener('change', notify)
      return () => media.removeEventListener('change', notify)
    },
    [query],
  )
  const getSnapshot = () => hasMatchMedia() && window.matchMedia(query).matches

  return useSyncExternalStore(subscribe, getSnapshot)
}
