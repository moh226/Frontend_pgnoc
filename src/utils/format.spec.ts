import { describe, it, expect } from 'vitest'
import { formaterDate, formaterJour, formaterHeure } from './format'

describe('format.ts', () => {
  const date = '2025-01-01T15:30:00Z'

  it('doit formater une date complète', () => {
    const format = formaterDate(date)
    // Depending on timezone, could be different, so let's just check it doesn't return '—'
    expect(format).not.toBe('—')
    expect(format).toContain('2025')
  })

  it('doit formater un jour', () => {
    const format = formaterJour(date)
    expect(format).not.toBe('—')
    expect(format).toContain('2025')
  })

  it('doit formater une heure', () => {
    const format = formaterHeure(date)
    expect(format).not.toBe('—')
  })

  it('doit retourner — pour les valeurs nulles', () => {
    expect(formaterDate(null)).toBe('—')
    expect(formaterJour(undefined)).toBe('—')
    expect(formaterHeure('')).toBe('—')
  })
})
