import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_IMAGE_BYTES } from '../../lib/files'
import { ImageUpload } from './ImageUpload'

const create = vi.fn((blob: Blob) => `blob:${(blob as File).name}`)

beforeEach(() => {
  create.mockClear()
  URL.createObjectURL = create
  URL.revokeObjectURL = vi.fn()
})

// `applyAccept: false` deixa o teste mandar um arquivo que o seletor de arquivos recusaria.
const setup = () => {
  const onChange = vi.fn()
  const { container } = render(<ImageUpload onChange={onChange} />)
  return {
    user: userEvent.setup({ applyAccept: false }),
    onChange,
    input: container.querySelector('input[type="file"]') as HTMLInputElement,
  }
}

const file = (name: string, type: string, bytes = 10) =>
  new File([new ArrayBuffer(bytes)], name, { type })

describe('ImageUpload', () => {
  it('começa com o espaço reservado e a instrução do protótipo', () => {
    setup()
    expect(screen.getByText('Carregue uma imagem do seu código')).toBeInTheDocument()
    expect(screen.getByText('PNG ou JPG, até 5 MB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Carregar imagem' })).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('só aceita PNG e JPG no seletor de arquivos', () => {
    const { input } = setup()
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg')
  })

  it('o botão abre o seletor de arquivos', async () => {
    const { user, input } = setup()
    const click = vi.spyOn(input, 'click')
    await user.click(screen.getByRole('button', { name: 'Carregar imagem' }))
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('uma imagem válida mostra a prévia, vira "Trocar imagem" e avisa quem usa', async () => {
    const { user, onChange, input } = setup()
    await user.upload(input, file('codigo.png', 'image/png'))

    expect(screen.getByRole('img', { name: 'Prévia da imagem do projeto' })).toHaveAttribute(
      'src',
      'blob:codigo.png',
    )
    expect(screen.getByRole('button', { name: 'Trocar imagem' })).toBeInTheDocument()
    expect(screen.queryByText('Carregue uma imagem do seu código')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith('blob:codigo.png')
  })

  it('outro formato mostra o erro e não carrega a imagem', async () => {
    const { user, onChange, input } = setup()
    await user.upload(input, file('doc.pdf', 'application/pdf'))

    expect(screen.getByText('Escolha uma imagem PNG ou JPG.')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('arquivo acima de 5 MB mostra o erro e não carrega a imagem', async () => {
    const { user, onChange, input } = setup()
    await user.upload(input, file('grande.png', 'image/png', MAX_IMAGE_BYTES + 1))

    expect(screen.getByText('Escolha uma imagem de até 5 MB.')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('um arquivo inválido não troca a prévia já carregada', async () => {
    const { user, input } = setup()
    await user.upload(input, file('codigo.png', 'image/png'))
    await user.upload(input, file('doc.pdf', 'application/pdf'))

    expect(screen.getByRole('img', { name: 'Prévia da imagem do projeto' })).toHaveAttribute(
      'src',
      'blob:codigo.png',
    )
    expect(screen.getByText('Escolha uma imagem PNG ou JPG.')).toBeInTheDocument()
  })

  it('o erro some quando se escolhe um arquivo válido', async () => {
    const { user, input } = setup()
    await user.upload(input, file('doc.pdf', 'application/pdf'))
    await user.upload(input, file('codigo.png', 'image/png'))
    expect(screen.queryByText('Escolha uma imagem PNG ou JPG.')).not.toBeInTheDocument()
  })
})
