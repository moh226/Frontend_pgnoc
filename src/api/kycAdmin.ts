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

export async function listerEtapesKycAdmin(): Promise<EtapeKycAdmin[]> {
  return toutesLesPages<EtapeKycAdmin>('/admin/kyc/etapes/')
}

export interface ParametresEtape {
  nom: string
  ordre: number
  actif?: boolean
}

export async function creerEtape(parametres: ParametresEtape): Promise<EtapeKycAdmin> {
  const { data } = await api.post<EtapeKycAdmin>('/admin/kyc/etapes/', parametres)
  return data
}

export async function modifierEtape(
  id: string,
  parametres: Partial<ParametresEtape>,
): Promise<EtapeKycAdmin> {
  const { data } = await api.patch<EtapeKycAdmin>(`/admin/kyc/etapes/${id}/`, parametres)
  return data
}

export async function listerChampsKycAdmin(etapeId: string): Promise<ChampKycAdmin[]> {
  return toutesLesPages<ChampKycAdmin>('/admin/kyc/champs/', { etape: etapeId })
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
  const { data } = await api.post<ChampKycAdmin>('/admin/kyc/champs/', parametres)
  return data
}

export async function modifierChamp(
  id: string,
  parametres: Partial<ParametresChamp>,
): Promise<ChampKycAdmin> {
  const { data } = await api.patch<ChampKycAdmin>(`/admin/kyc/champs/${id}/`, parametres)
  return data
}

export async function supprimerEtape(id: string): Promise<void> {
  await api.delete(`/admin/kyc/etapes/${id}/`)
}

export async function supprimerChamp(id: string): Promise<void> {
  await api.delete(`/admin/kyc/champs/${id}/`)
}