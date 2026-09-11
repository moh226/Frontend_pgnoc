import type { StatutDepot } from '@/types'

export const LIBELLES_DEPOT: Record<StatutDepot, string> = {
  EN_ATTENTE: 'En attente de dépôt',
  PREUVE_DEPOSEE: 'Preuve déposée',
  APPROUVE: 'Approuvé',
  REJETE: 'Rejeté',
}

export const COULEURS_DEPOT: Record<StatutDepot, string> = {
  EN_ATTENTE: 'warning',
  PREUVE_DEPOSEE: 'info',
  APPROUVE: 'success',
  REJETE: 'error',
}

export const STATUTS_DEPOT: StatutDepot[] = [
  'EN_ATTENTE',
  'PREUVE_DEPOSEE',
  'APPROUVE',
  'REJETE',
]