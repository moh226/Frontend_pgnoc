import { api } from './client'
import type { DossierDetail, DossierListeItem, EtapeKyc, ResultatPagines } from '@/types'

export interface ParametresListeDossiers {
  statut?: string[]
  recherche?: string
  date_debut?: string
  date_fin?: string
  tri?: string
  page?: number
}

export async function listeDossiers(
  parametres: ParametresListeDossiers = {},
): Promise<ResultatPagines<DossierListeItem>> {
  const p = new URLSearchParams()
  if (parametres.statut?.length) parametres.statut.forEach((s) => p.append('statut', s))
  if (parametres.recherche) p.append('recherche', parametres.recherche)
  if (parametres.date_debut) p.append('date_debut', parametres.date_debut)
  if (parametres.date_fin) p.append('date_fin', parametres.date_fin)
  if (parametres.tri) p.append('tri', parametres.tri)
  if (parametres.page) p.append('page', String(parametres.page))
  const { data } = await api.get<ResultatPagines<DossierListeItem>>('/dossiers/dossiers/', {
    params: p,
  })
  return data
}

export async function detailDossier(id: string): Promise<DossierDetail> {
  const { data } = await api.get<DossierDetail>(`/dossiers/dossiers/${id}/`)
  return data
}

export async function etapesKyc(sgi: string): Promise<ResultatPagines<EtapeKyc>> {
  const { data } = await api.get<ResultatPagines<EtapeKyc>>('/dossiers/etapes-kyc/', {
    params: { sgi },
  })
  return data
}

export function urlFichierValeur(dossierId: string, valeurId: string): string {
  return `${api.defaults.baseURL}/dossiers/dossiers/${dossierId}/valeurs/${valeurId}/url/`
}