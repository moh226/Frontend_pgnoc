import { api } from './client'
import type { DossierDetail, DossierListeItem, EtapeKyc, ResultatPagines } from '@/types'

export interface ParametresListeDossiers {
  statut?: string[]
  recherche?: string
  date_debut?: string
  date_fin?: string
  tri?: string
  page?: number
  page_size?: number
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
  if (parametres.page_size) p.append('page_size', String(parametres.page_size))
  const { data } = await api.get<ResultatPagines<DossierListeItem>>('/dossiers/dossiers/', {
    params: p,
  })
  return data
}

export async function detailDossier(id: string): Promise<DossierDetail> {
  const { data } = await api.get<DossierDetail>(`/dossiers/dossiers/${id}/`)
  return data
}

export async function creerDossier(sgi: string): Promise<DossierDetail> {
  const { data } = await api.post<DossierDetail>('/dossiers/dossiers/', { sgi })
  return data
}

export interface CodeOtp {
  code: string
  expiration: string
}

export async function genererOtp(dossierId: string): Promise<CodeOtp> {
  const { data } = await api.post<CodeOtp>(`/dossiers/dossiers/${dossierId}/generer-otp/`)
  return data
}

export async function signerDossier(
  dossierId: string,
  otpCode: string,
): Promise<{ type_signature: string; donnee_signature: string }> {
  const { data } = await api.post(`/dossiers/dossiers/${dossierId}/signer/`, {
    otp_code: otpCode,
  })
  return data
}

export interface ReponseValeur {
  id: string
  champ: string
  valeur: string
}

export async function enregistrerValeur(
  dossierId: string,
  champ: string,
  valeur: string,
): Promise<ReponseValeur> {
  const { data } = await api.post<ReponseValeur>(`/dossiers/dossiers/${dossierId}/valeurs/`, {
    champ,
    valeur,
  })
  return data
}

export interface ReponseFichier {
  id: string
  champ: string
  url_signee: string
}

export async function televerserFichier(
  dossierId: string,
  champ: string,
  fichier: File,
): Promise<ReponseFichier> {
  const formulaire = new FormData()
  formulaire.append('champ', champ)
  formulaire.append('fichier', fichier)
  const { data } = await api.post<ReponseFichier>(
    `/dossiers/dossiers/${dossierId}/valeurs/fichier/`,
    formulaire,
  )
  return data
}

export async function accepterConvention(
  dossierId: string,
): Promise<{ detail: string; convention_acceptee: boolean }> {
  const { data } = await api.post(`/dossiers/dossiers/${dossierId}/accepter-convention/`)
  return data
}

export async function soumettreDossier(dossierId: string): Promise<DossierDetail> {
  const { data } = await api.post<DossierDetail>(`/dossiers/dossiers/${dossierId}/soumettre/`)
  return data
}

export async function etapesKyc(sgi: string): Promise<ResultatPagines<EtapeKyc>> {
  const { data } = await api.get<ResultatPagines<EtapeKyc>>('/dossiers/etapes-kyc/', {
    params: { sgi },
  })
  return data
}

export async function prendreEnCharge(id: string): Promise<DossierDetail> {
  const { data } = await api.post<DossierDetail>(`/dossiers/dossiers/${id}/prendre-en-charge/`)
  return data
}

export interface CommentaireValeur {
  id: string
  commentaire_agent: string
}

export async function commenterValeur(
  dossierId: string,
  valeurId: string,
  commentaire: string,
): Promise<CommentaireValeur> {
  const { data } = await api.post<CommentaireValeur>(
    `/dossiers/dossiers/${dossierId}/commenter/`,
    { valeur: valeurId, commentaire },
  )
  return data
}

export async function validerDossier(id: string): Promise<DossierDetail> {
  const { data } = await api.post<DossierDetail>(`/dossiers/dossiers/${id}/valider/`)
  return data
}

export async function rejeterDossier(id: string, motif: string): Promise<DossierDetail> {
  const { data } = await api.post<DossierDetail>(`/dossiers/dossiers/${id}/rejeter/`, {
    motif_rejet: motif,
  })
  return data
}

export function urlFichierValeur(dossierId: string, valeurId: string): string {
  return `${api.defaults.baseURL}/dossiers/dossiers/${dossierId}/valeurs/${valeurId}/url/`
}