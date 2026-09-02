import { api } from './client'
import type { ChampKycAdmin, EtapeKycAdmin, ResultatPagines } from '@/types'

async function toutesLesPages<T>(chemin: string, params?: Record<string, string>): Promise<T[]> {
  const elements: T[] = []
  let page = 1
  for (;;) {
    const { data } = await api.get<ResultatPagines<T>>(chemin, {
      params: page === 1 ? params : { ...params, page: String(page) },
    })
    elements.push(...data.results)
    if (!data.next || page >= 50) break
    page += 1
  }
  return elements
}

export async function listetEtapesKycAdmin(): Promise<EtapeKycAdmin[]> {
  return toutesLesPages<EtapeKycAdmin>('/dossiers/admin/etapes-kyc/')
}

export interface ParametresEtape {
  nom: string
  ordre: number
  actif?: boolean
}

export async function creerEtape(parametres: ParametresEtape): Promise<EtapeKycAdmin> {
  const { data } = await api.post<EtapeKycAdmin>('/dossiers/admin/etapes-kyc/', parametres)
  return data
}

export async function modifierEtape(
  id: string,
  parametres: Partial<ParametresEtape>,
): Promise<EtapeKycAdmin> {
  const { data } = await api.patch<EtapeKycAdmin>(`/dossiers/admin/etapes-kyc/${id}/`, parametres)
  return data
}

export async function listeChampsKycAdmin(etapeId: string): Promise<ChampKycAdmin[]> {
  return toutesLesPages<ChampKycAdmin>('/dossiers/admin/champs-kyc/', { etape: etapeId })
}

export interface ParametresChamp {
  etape: string
  code?: string
  nom: string
  type: ChampKycAdmin['type']
  obligatoire: boolean
  ordre: number
  justification?: string
  options_choix?: string[] | null
  formats_acceptes?: string
  taille_max_mo?: number | null
  actif?: boolean
}

export async function creerChamp(parametres: ParametresChamp): Promise<ChampKycAdmin> {
  const { data } = await api.post<ChampKycAdmin>('/dossiers/admin/champs-kyc/', parametres)
  return data
}

export async function modifierChamp(
  id: string,
  parametres: Partial<ParametresChamp>,
): Promise<ChampKycAdmin> {
  const { data } = await api.patch<ChampKycAdmin>(`/dossiers/admin/champs-kyc/${id}/`, parametres)
  return data
}