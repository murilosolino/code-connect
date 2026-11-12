export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg']

/** Devolve a mensagem de erro de uma imagem de projeto (PNG ou JPG, até 5 MB), ou null se for válida. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Escolha uma imagem PNG ou JPG.'
  if (file.size > MAX_IMAGE_BYTES) return 'Escolha uma imagem de até 5 MB.'
  return null
}
