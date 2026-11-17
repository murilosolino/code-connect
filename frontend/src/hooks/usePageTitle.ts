import { useEffect } from 'react'

/** Define o `<title>` do documento como "<título> · CodeConnect". */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · CodeConnect`
  }, [title])
}
