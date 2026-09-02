import { api } from './client'
import type {
  DashboardAdmin,
  EntreeJournalAudit,
  ResultatPagines,
  SgiAdmin,
  UtilisateurAdmin,
} from '@/types'

export async function tableauDeBordAdmin(): Promise<DashboardAdmin> {
  const { data } = await api.get<DashboardAdmin>('/admin-general/dashboard/')
  return data
}

export async function listeSgiAdmin(): Promise<SgiAdmin[]> {
  return toutesLesPages<SgiAdmin>('/admin-general/sgi/')
}

export interface ParametresSgi {
  nom: string
  code_sgi: string
}

export async function creerSgiAdmin(parametres: ParametresSgi): Promise<SgiAdmin> {
  const { data } = await api.post<SgiAdmin>('/admin-general/sgi/', parametres)
  return data
}

export async function modifierSgiAdmin(
  id: string,
  parametres: Partial<Pick<SgiAdmin, 'nom' | 'code_sgi' | 'est_active'>>,
): Promise<SgiAdmin> {
  const { data } = await api.patch<SgiAdmin>(`/admin-general/sgi/${id}/`, parametres)
  return data
}

export interface ParametresFiltresUtilisateurs {
  role?: string
  email?: string
  actif?: boolean
  sgi?: string
}

export async function listeUtilisateursAdmin(
  filtres: ParametresFiltresUtilisateurs = {},
): Promise<UtilisateurAdmin[]> {
  return toutesLesPages<UtilisateurAdmin>('/admin-general/utilisateurs/', filtres)
}

export interface ParametresUtilisateur {
  email: string
  prenom?: string
  nom?: string
  role: string
  sgi?: string | null
  mot_de_passe?: string
}

export async function creerUtilisateurAdmin(
  parametres: ParametresUtilisateur,
): Promise<UtilisateurAdmin> {
  const { data } = await api.post<UtilisateurAdmin>('/admin-general/utilisateurs/', parametres)
  return data
}

export async function modifierUtilisateurAdmin(
  id: string,
  parametres: Partial<Pick<UtilisateurAdmin, 'prenom' | 'nom' | 'role' | 'is_active'>> & {
    sgi?: string | null
  },
): Promise<UtilisateurAdmin> {
  const { data } = await api.patch<UtilisateurAdmin>(`/admin-general/utilisateurs/${id}/`, parametres)
  return data
}

export interface ParametresJournal {
  action?: string
  email?: string
  entite_concernee?: string
  entite_id?: string
  date_debut?: string
  date_fin?: string
  page?: number
  page_size?: number
}

export async function journalAudit(
  parametres: ParametresJournal,
): Promise<ResultatPagines<EntreeJournalAudit>> {
  const { data } = await api.get<ResultatPagines<EntreeJournalAudit>>('/audit/journal/', {
    params: parametres,
  })
  return data
}

export async function exporterJournal(parametres: Omit<ParametresJournal, 'page'>): Promise<void> {
  const reponse = await api.get('/audit/journal/export/', { params: parametres })
  const blob = new Blob([reponse.data], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = `journal-audit-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  URL.revokeObjectURL(url)
}

async function toutesLesPages<T>(
  chemin: string,
  params?: object,
): Promise<T[]> {
  const elements: T[] = []
  let page = 1
  for (;;) {
    const { data } = await api.get<ResultatPagines<T>>(chemin, {
      params: page === 1 ? params : { ...params, page },
    })
    elements.push(...data.results)
    if (!data.next || page >= 50) break
    page += 1
  }
  return elements
}