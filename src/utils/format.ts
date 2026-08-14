const FORMATTEUR = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
const FORMATTEUR_JOUR = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export function formaterDate(iso: string | null | undefined): string {
  return iso ? FORMATTEUR.format(new Date(iso)) : '—'
}

export function formaterJour(iso: string | null | undefined): string {
  return iso ? FORMATTEUR_JOUR.format(new Date(iso)) : '—'
}