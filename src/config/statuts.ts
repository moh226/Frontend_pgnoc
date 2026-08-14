import type { StatutDossier } from '@/types'

export const LIBELLES_STATUT: Record<StatutDossier, string> = {
  BROUILLON: 'Brouillon',
  SOUMIS: 'Soumis',
  EN_INSTRUCTION: 'En instruction',
  VALIDE: 'Validé',
  REJETE: 'Rejeté',
}

export const COULEURS_STATUT: Record<StatutDossier, string> = {
  BROUILLON: 'secondary',
  SOUMIS: 'info',
  EN_INSTRUCTION: 'warning',
  VALIDE: 'success',
  REJETE: 'error',
}

export const STATUTS_DOSSIER: StatutDossier[] = [
  'BROUILLON',
  'SOUMIS',
  'EN_INSTRUCTION',
  'VALIDE',
  'REJETE',
]