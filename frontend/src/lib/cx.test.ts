import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('junta apenas as classes verdadeiras, separadas por espaço', () => {
    expect(cx('a', false, undefined, 'b', null, '')).toBe('a b')
  })

  it('devolve string vazia quando nada sobra', () => {
    expect(cx(false, undefined, null)).toBe('')
  })
})
