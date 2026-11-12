import { describe, expect, it } from 'vitest'
import { getNavItems, isActive } from './navigation'

const signedIn = getNavItems({ handle: 'julio' })
const entry = (label: string) => signedIn.find((item) => item.label === label)!

describe('getNavItems', () => {
  it('logado: Feed, Perfil, Sobre nós e Sair, nessa ordem', () => {
    expect(signedIn.map(({ label, to, icon, action }) => ({ label, to, icon, action }))).toEqual([
      { label: 'Feed', to: '/', icon: 'feed', action: undefined },
      { label: 'Perfil', to: '/perfil/julio', icon: 'account_circle', action: undefined },
      { label: 'Sobre nós', to: '/sobre', icon: 'info', action: undefined },
      { label: 'Sair', to: undefined, icon: 'logout', action: 'logout' },
    ])
  })

  it('o Perfil leva ao perfil da pessoa logada', () => {
    expect(getNavItems({ handle: 'maria' })[1].to).toBe('/perfil/maria')
  })

  it('deslogado: Feed, Sobre nós e Login, sem Perfil nem Sair', () => {
    expect(getNavItems(null).map(({ label, to, icon }) => ({ label, to, icon }))).toEqual([
      { label: 'Feed', to: '/', icon: 'feed' },
      { label: 'Sobre nós', to: '/sobre', icon: 'info' },
      { label: 'Login', to: '/login', icon: 'login' },
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
    expect(isActive(entry('Sair'), '/')).toBe(false)
  })

  it('marca Login em /login', () => {
    const login = getNavItems(null).find((item) => item.label === 'Login')!
    expect(isActive(login, '/login')).toBe(true)
  })
})
