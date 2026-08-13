import { api } from './client'
import type { Identifiants, Jetons, PayloadInscription, UtilisateurPublic } from '@/types'

export async function connexion(identifiants: Identifiants): Promise<Jetons> {
  const { data } = await api.post<Jetons>('/comptes/login/', identifiants)
  return data
}

export async function inscription(payload: PayloadInscription): Promise<UtilisateurPublic> {
  const { data } = await api.post<UtilisateurPublic>('/comptes/register/', payload)
  return data
}
