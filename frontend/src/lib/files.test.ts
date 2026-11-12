import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_BYTES, validateImageFile } from './files'

const file = (type: string, bytes = 10) => new File([new ArrayBuffer(bytes)], 'arquivo', { type })

describe('validateImageFile', () => {
  it('aceita PNG e JPEG', () => {
    expect(validateImageFile(file('image/png'))).toBeNull()
    expect(validateImageFile(file('image/jpeg'))).toBeNull()
  })

  it('aceita um arquivo de exatamente 5 MB', () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024)
    expect(validateImageFile(file('image/png', MAX_IMAGE_BYTES))).toBeNull()
  })

  it('recusa outros formatos', () => {
    expect(validateImageFile(file('application/pdf'))).toBe('Escolha uma imagem PNG ou JPG.')
    expect(validateImageFile(file('image/gif'))).toBe('Escolha uma imagem PNG ou JPG.')
  })

  it('recusa arquivos acima de 5 MB', () => {
    expect(validateImageFile(file('image/png', MAX_IMAGE_BYTES + 1))).toBe(
      'Escolha uma imagem de até 5 MB.',
    )
  })

  it('verifica o formato antes do tamanho', () => {
    expect(validateImageFile(file('application/pdf', MAX_IMAGE_BYTES + 1))).toBe(
      'Escolha uma imagem PNG ou JPG.',
    )
  })
})
