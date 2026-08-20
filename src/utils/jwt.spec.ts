import { describe, it, expect } from 'vitest'
import { roleDepuisJwt, jwtEstExpire } from './jwt'

describe('jwt.ts', () => {
  const enc = (obj: Record<string, unknown>) => btoa(JSON.stringify(obj))

  it('doit extraire le rôle', () => {
    const token = `header.${enc({ role: 'SGI' })}.signature`
    expect(roleDepuisJwt(token)).toBe('SGI')
  })

  it('doit retourner null si pas de rôle', () => {
    const token = `header.${enc({})}.signature`
    expect(roleDepuisJwt(token)).toBeNull()
  })

  it('doit gérer un token invalide', () => {
    expect(roleDepuisJwt('invalide')).toBeNull()
  })

  it('doit détecter un token expiré', () => {
    // exp in seconds
    const expPast = Math.floor(Date.now() / 1000) - 1000
    const token = `header.${enc({ exp: expPast })}.signature`
    expect(jwtEstExpire(token)).toBe(true)
  })

  it('doit détecter un token valide', () => {
    const expFuture = Math.floor(Date.now() / 1000) + 1000
    const token = `header.${enc({ exp: expFuture })}.signature`
    expect(jwtEstExpire(token)).toBe(false)
  })
})
