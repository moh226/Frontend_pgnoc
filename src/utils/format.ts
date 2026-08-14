const FORMATTEUR = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
const FORMATTEUR_JOUR = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
const FORMATTEUR_HEURE = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' })

export function formaterDate(iso: string | null | undefined): string {
  return iso ? FORMATTEUR.format(new Date(iso)) : '—'
}

export function formaterJour(iso: string | null | undefined): string {
  return iso ? FORMATTEUR_JOUR.format(new Date(iso)) : '—'
}

export function formaterHeure(iso: string | null | undefined): string {
  return iso ? FORMATTEUR_HEURE.format(new Date(iso)) : '—'
}