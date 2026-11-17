import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePosts } from '../data/store/hooks'
import { renderWithProviders } from '../test/renderWithProviders'
import { PublishPage } from './PublishPage'

/** Mostra o primeiro projeto do store, para conferir o que foi publicado. */
function FirstPost() {
  const [first] = usePosts()
  return (
    <output aria-label="Primeiro projeto">
      {[first.id, first.title, first.description, first.tags.join('+'), first.authorHandle, first.imageUrl ?? '-'].join('|')}
    </output>
  )
}

const setup = () =>
  renderWithProviders(
    <>
      <PublishPage />
      <FirstPost />
    </>,
  )

const firstPost = () => screen.getByLabelText('Primeiro projeto').textContent

beforeEach(() => {
  URL.createObjectURL = vi.fn((blob: Blob) => `blob:${(blob as File).name}`)
  URL.revokeObjectURL = vi.fn()
})

async function fillForm(user: ReturnType<typeof setup>['user']) {
  await user.type(screen.getByLabelText('Nome do projeto'), 'Meu projeto')
  await user.type(screen.getByLabelText('Descrição'), 'Uma descrição')
}

describe('PublishPage', () => {
  it('mostra o formulário de novo projeto', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: 'Novo projeto' })).toBeInTheDocument()
    expect(document.title).toBe('Novo projeto · CodeConnect')
    expect(screen.getByLabelText('Nome do projeto')).toHaveAttribute(
      'placeholder',
      'Dashboard de vendas com React',
    )
    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Remover tag/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Carregar imagem' })).toBeInTheDocument()
  })

  it('publicar vazio mostra os erros, foca o primeiro campo e não navega nem cria projeto', async () => {
    const { user, router } = setup()
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(screen.getByText('Informe o nome do projeto.')).toBeInTheDocument()
    expect(screen.getByText('Informe a descrição do projeto.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome do projeto')).toHaveFocus()
    expect(screen.getByLabelText('Nome do projeto')).toHaveAttribute('aria-invalid', 'true')
    expect(router.state.location.pathname).toBe('/')
    expect(firstPost()).toMatch(/^vendas\|/)
  })

  it('só a descrição vazia mostra só o erro dela e foca nela', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('Nome do projeto'), 'Meu projeto')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(screen.queryByText('Informe o nome do projeto.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe a descrição do projeto.')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toHaveFocus()
  })

  it('o erro de um campo some quando ele é corrigido', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    await user.type(screen.getByLabelText('Nome do projeto'), 'M')
    expect(screen.queryByText('Informe o nome do projeto.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe a descrição do projeto.')).toBeInTheDocument()
  })

  it('publicar com os dados cria o projeto como @julio e abre o detalhe', async () => {
    const { user, router } = setup()
    await fillForm(user)
    await user.type(screen.getByLabelText('Tags'), 'React{Enter}Vite{Enter}')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(router.state.location.pathname).toBe('/projeto/novo-1')
    expect(firstPost()).toBe('novo-1|Meu projeto|Uma descrição|React+Vite|julio|-')
  })

  it('publica com a imagem carregada', async () => {
    const { user, router } = setup()
    await fillForm(user)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, new File(['x'], 'codigo.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(router.state.location.pathname).toBe('/projeto/novo-1')
    expect(firstPost()).toMatch(/\|blob:codigo\.png$/)
  })

  it('"Descartar" volta ao feed sem criar projeto', async () => {
    const { user, router } = setup()
    await fillForm(user)
    await user.click(screen.getByRole('link', { name: 'Descartar' }))

    expect(router.state.location.pathname).toBe('/')
    expect(firstPost()).toMatch(/^vendas\|/)
  })

  it('"Publicar" vem antes de "Descartar" no HTML (ordem do Tab e do leitor de tela)', () => {
    setup()
    const publish = screen.getByRole('button', { name: 'Publicar' })
    const discard = screen.getByRole('link', { name: 'Descartar' })
    expect(publish.compareDocumentPosition(discard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
