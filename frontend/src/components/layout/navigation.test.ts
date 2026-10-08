import { describe, expect, it } from 'vitest'
import { isActive, NAV_ITEMS } from './navigation'

const entry = (label: string) => NAV_ITEMS.find((item) => item.label === label)!

describe('NAV_ITEMS', () => {
  it('tem Feed, Perfil, Sobre nós e Sair, nessa ordem, com destino e ícone', () => {
    expect(NAV_ITEMS.map(({ label, to, icon }) => ({ label, to, icon }))).toEqual([
      { label: 'Feed', to: '/', icon: 'feed' },
      { label: 'Perfil', to: '/perfil/julio', icon: 'account_circle' },
      { label: 'Sobre nós', to: '/sobre', icon: 'info' },
      { label: 'Sair', to: '/login', icon: 'logout' },
    ])
  })
})

describe('isActive', () => {
  it('marca o Feed no feed e também no detalhe do projeto', () => {
    expect(isActive(entry('Feed'), '/')).toBe(true)
    expect(isActive(entry('Feed'), '/projeto/vendas')).toBe(true)
    expect(isActive(entry('Feed'), '/sobre')).toBe(false)
  })

  it('marca o Perfil só no perfil da pessoa logada', () => {
    expect(isActive(entry('Perfil'), '/perfil/julio')).toBe(true)
    expect(isActive(entry('Perfil'), '/perfil/ana.souza')).toBe(false)
  })

  it('marca Sobre nós em /sobre', () => {
    expect(isActive(entry('Sobre nós'), '/sobre')).toBe(true)
    expect(isActive(entry('Sobre nós'), '/')).toBe(false)
  })

  it('nunca marca Sair', () => {
    expect(isActive(entry('Sair'), '/login')).toBe(false)
  })
})
