import { api, clientPublic } from './client'
import type { Identifiants, Jetons, PayloadInscription, UtilisateurPublic } from '@/types'

export async function connexion(identifiants: Identifiants): Promise<Jetons> {
  const { data } = await api.post<Jetons>('/comptes/login/', identifiants)
  return data
}

export async function inscription(payload: PayloadInscription): Promise<UtilisateurPublic> {
  const { data } = await api.post<UtilisateurPublic>('/comptes/register/', payload)
  return data
}

/** Révoque le refresh token côté serveur (blacklist JWT).
 *
 * Passé par `clientPublic`, sans intercepteur JWT : les tokens sont
 * fournis explicitement car la session a déjà été purgée localement au
 * moment de l'appel (aucun accès aux stocks globaux). */
export async function deconnecterCompte(access: string, refresh: string): Promise<void> {
  await clientPublic.post(
    '/comptes/logout/',
    { refresh },
    { headers: { Authorization: `Bearer ${access}` } },
  )
}
