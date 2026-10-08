import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useObjectUrl } from './useObjectUrl'

const create = vi.fn((blob: Blob) => `blob:${(blob as File).name}`)
const revoke = vi.fn()
const png = (name: string) => new File(['x'], name, { type: 'image/png' })

beforeEach(() => {
  create.mockClear()
  revoke.mockClear()
  // O jsdom não implementa estes métodos.
  URL.createObjectURL = create
  URL.revokeObjectURL = revoke
})

describe('useObjectUrl', () => {
  it('sem arquivo devolve undefined', () => {
    const { result } = renderHook(() => useObjectUrl(null))
    expect(result.current).toBeUndefined()
    expect(create).not.toHaveBeenCalled()
  })

  it('devolve a URL de objeto do arquivo', () => {
    const file = png('a.png')
    const { result } = renderHook(() => useObjectUrl(file))
    expect(result.current).toBe('blob:a.png')
  })

  it('revoga a URL anterior quando o arquivo muda', () => {
    const { result, rerender } = renderHook(({ file }) => useObjectUrl(file), {
      initialProps: { file: png('a.png') as File | null },
    })
    rerender({ file: png('b.png') })
    expect(revoke).toHaveBeenCalledWith('blob:a.png')
    expect(result.current).toBe('blob:b.png')
  })

  it('revoga a URL quando o arquivo é removido', () => {
    const { result, rerender } = renderHook(({ file }) => useObjectUrl(file), {
      initialProps: { file: png('a.png') as File | null },
    })
    rerender({ file: null })
    expect(revoke).toHaveBeenCalledWith('blob:a.png')
    expect(result.current).toBeUndefined()
  })

  it('revoga a URL ao desmontar', () => {
    const file = png('a.png')
    const { unmount } = renderHook(() => useObjectUrl(file))
    unmount()
    expect(revoke).toHaveBeenCalledWith('blob:a.png')
  })

  it('não revoga ao desmontar com keepOnUnmount (a URL segue em uso no projeto publicado)', () => {
    const file = png('a.png')
    const { unmount } = renderHook(() => useObjectUrl(file, { keepOnUnmount: true }))
    unmount()
    expect(revoke).not.toHaveBeenCalled()
  })

  it('com keepOnUnmount ainda revoga a URL antiga ao trocar de arquivo', () => {
    const { rerender } = renderHook(({ file }) => useObjectUrl(file, { keepOnUnmount: true }), {
      initialProps: { file: png('a.png') as File | null },
    })
    rerender({ file: png('b.png') })
    expect(revoke).toHaveBeenCalledWith('blob:a.png')
  })
})
