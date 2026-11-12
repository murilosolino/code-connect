import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TagInput } from './TagInput'

function Harness({ initial = [], onSubmit = () => {} }: { initial?: string[]; onSubmit?: () => void }) {
  const [tags, setTags] = useState(initial)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <TagInput tags={tags} onChange={setTags} />
    </form>
  )
}

const field = () => screen.getByLabelText('Tags')
const tagNames = () =>
  screen.queryAllByRole('button').map((button) => button.getAttribute('aria-label'))

describe('TagInput', () => {
  it('tem o campo "Tags" com a instrução do protótipo', () => {
    render(<Harness />)
    expect(field()).toHaveAttribute('placeholder', 'Digite uma tecnologia e pressione Enter')
  })

  it('Enter adiciona a tag (sem espaços nas pontas) e limpa o campo', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(field(), '  React {Enter}')
    expect(tagNames()).toEqual(['Remover tag React'])
    expect(field()).toHaveValue('')
  })

  it('Enter com o campo vazio não adiciona nada', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(field(), '   {Enter}')
    expect(tagNames()).toEqual([])
    expect(field()).toHaveValue('')
  })

  it('não repete uma tag, sem diferenciar caixa nem acentos, e ainda limpa o campo', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['Acessibilidade']} />)
    await user.type(field(), 'acessibilidade{Enter}')
    expect(tagNames()).toEqual(['Remover tag Acessibilidade'])
    expect(field()).toHaveValue('')
  })

  it('o botão "Remover tag" remove a tag', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['React', 'Vite']} />)
    await user.click(screen.getByRole('button', { name: 'Remover tag React' }))
    expect(tagNames()).toEqual(['Remover tag Vite'])
  })

  it('Enter não envia o formulário em volta', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)
    await user.type(field(), 'React{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
