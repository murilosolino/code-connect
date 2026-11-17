import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createSeedState } from '../../data/seed'
import { CommentThread } from './CommentThread'

const comments = createSeedState().comments.vendas
const FIRST_REPLY = 'Pensei sim! Vou testar scroll infinito na próxima versão.'
const SECOND_REPLY = 'Recharts, com um tema próprio usando as cores do projeto.'

describe('CommentThread', () => {
  it('mostra o autor e o texto de cada comentário', () => {
    render(<CommentThread comments={comments} />)
    expect(
      screen.getByText('Ficou muito limpo o uso do useMemo nos filtros. Você pensou em paginar os pedidos?'),
    ).toBeInTheDocument()
    expect(screen.getByText('@ana.souza')).toBeInTheDocument()
    expect(screen.getByText('@rafa.dev')).toBeInTheDocument()
    expect(screen.getByText('@bia')).toBeInTheDocument()
  })

  it('o primeiro comentário com respostas começa aberto', () => {
    render(<CommentThread comments={comments} />)
    const toggle = screen.getAllByRole('button', { name: /respostas/ })[0]
    expect(toggle).toHaveTextContent('Ocultar respostas')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(FIRST_REPLY)).toBeVisible()
  })

  it('os demais começam recolhidos e abrem ao clicar', async () => {
    const user = userEvent.setup()
    render(<CommentThread comments={comments} />)

    const toggle = screen.getByRole('button', { name: 'Ver respostas' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(SECOND_REPLY)).not.toBeVisible()

    await user.click(toggle)
    expect(screen.getByText(SECOND_REPLY)).toBeVisible()
    expect(screen.getAllByRole('button', { name: 'Ocultar respostas' })).toHaveLength(2)
  })

  it('ocultar recolhe as respostas', async () => {
    const user = userEvent.setup()
    render(<CommentThread comments={comments} />)
    await user.click(screen.getByRole('button', { name: 'Ocultar respostas' }))
    expect(screen.getByText(FIRST_REPLY)).not.toBeVisible()
    expect(screen.getAllByRole('button', { name: 'Ver respostas' })).toHaveLength(2)
  })

  it('comentário sem respostas não tem botão de ver ou ocultar', () => {
    const [withoutReplies] = comments.filter((comment) => comment.replies.length === 0)
    render(<CommentThread comments={[withoutReplies]} />)
    expect(screen.queryByRole('button', { name: /respostas/ })).not.toBeInTheDocument()
  })

  it('mostra "Responder" em cada comentário e resposta visíveis', () => {
    render(<CommentThread comments={comments} />)
    const block = screen.getByText('@bia').closest('div')!.parentElement!
    expect(within(block).getByRole('button', { name: 'Responder' })).toBeInTheDocument()
    // 3 comentários + 1 resposta visível (a do primeiro comentário, aberto)
    expect(screen.getAllByRole('button', { name: 'Responder' })).toHaveLength(4)
  })

  it('não mostra nada sem comentários', () => {
    const { container } = render(<CommentThread comments={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
