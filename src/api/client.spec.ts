import { describe, it, expect } from 'vitest'
import { extraireMessageErreur } from './client'

describe('client.ts - extraireMessageErreur', () => {
  it('doit extraire une string simple', () => {
    const err = { response: { data: 'Erreur simple' } }
    expect(extraireMessageErreur(err)).toBe('Erreur simple')
  })

  it('doit extraire un array plat', () => {
    const err = { response: { data: { email: ['Email invalide'] } } }
    expect(extraireMessageErreur(err)).toBe('Email invalide')
  })

  it('doit extraire un objet imbriqué', () => {
    const err = { response: { data: { user: { email: ['Email invalide'] } } } }
    expect(extraireMessageErreur(err)).toBe('Email invalide')
  })

  it('doit retourner le fallback si rien ne match', () => {
    const err = {}
    expect(extraireMessageErreur(err, 'Fallback')).toBe('Fallback')
  })
})
