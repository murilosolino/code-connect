import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePageTitle } from './usePageTitle'

describe('usePageTitle', () => {
  it('define o título do documento com o sufixo do produto', () => {
    renderHook(() => usePageTitle('Feed'))
    expect(document.title).toBe('Feed · CodeConnect')
  })

  it('atualiza o título quando o argumento muda', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'Feed' },
    })
    rerender({ title: 'Sobre nós' })
    expect(document.title).toBe('Sobre nós · CodeConnect')
  })
})
