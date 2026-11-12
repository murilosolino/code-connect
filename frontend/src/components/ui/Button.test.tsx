import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Button } from './Button'

describe('Button', () => {
  it('com `to` é um link para o endereço', () => {
    renderWithProviders(
      <Button variant="primary" to="/publicar">
        Publicar
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/publicar')
  })

  it('sem `to` é um <button type="button"> que chama onClick', async () => {
    const onClick = vi.fn()
    const { user } = renderWithProviders(
      <Button variant="tertiary" onClick={onClick}>
        Descartar
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Descartar' })
    expect(button).toHaveAttribute('type', 'button')
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respeita type="submit"', () => {
    renderWithProviders(
      <Button variant="primary" type="submit">
        Login
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Login' })).toHaveAttribute('type', 'submit')
  })

  it('expõe `pressed={false}` como aria-pressed="false"', () => {
    renderWithProviders(
      <Button variant="tertiary" pressed={false}>
        Seguir
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Seguir' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('expõe `pressed` como aria-pressed="true"', () => {
    renderWithProviders(
      <Button variant="tertiary" pressed>
        Seguindo
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Seguindo' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('não define aria-pressed quando `pressed` não é usado', () => {
    renderWithProviders(<Button variant="primary">Login</Button>)
    expect(screen.getByRole('button', { name: 'Login' })).not.toHaveAttribute('aria-pressed')
  })

  it('esconde o ícone dos leitores de tela e o coloca depois do texto por padrão', () => {
    renderWithProviders(
      <Button variant="primary" icon="arrow_forward">
        Login
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Login' })
    expect(button.textContent).toBe('Loginarrow_forward')
    expect(button.querySelector('[aria-hidden="true"]')).toHaveTextContent('arrow_forward')
  })

  it('coloca o ícone antes do texto com iconPosition="start"', () => {
    renderWithProviders(
      <Button variant="tertiary" icon="delete" iconPosition="start">
        Descartar
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Descartar' }).textContent).toBe('deleteDescartar')
  })
})
