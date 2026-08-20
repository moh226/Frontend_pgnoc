import { api } from './client'
import type {
  DonneesProfilMoi,
  PayloadChangementMotDePasse,
  ProfilMoi,
} from '@/types'

export async function recupererMonProfil(): Promise<ProfilMoi> {
  const { data } = await api.get<ProfilMoi>('/comptes/moi/profil/')
  return data
}

export async function mettreAJourMonProfil(payload: DonneesProfilMoi): Promise<ProfilMoi> {
  const { data } = await api.patch<ProfilMoi>('/comptes/moi/profil/', payload)
  return data
}

export async function changerMonMotDePasse(payload: PayloadChangementMotDePasse): Promise<void> {
  await api.post('/comptes/moi/mot-de-passe/', payload)
}
