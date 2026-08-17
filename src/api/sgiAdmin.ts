import { api } from './client'
import type { ConventionSgi, PresentationSgi, PresentationStructuree } from '@/types'

export async function conventionSgi(): Promise<ConventionSgi> {
  const { data } = await api.get<ConventionSgi>('/sgi/admin/convention/')
  return data
}

export async function publierConvention(parametres: {
  titre?: string
  fichier_pdf?: File
}): Promise<ConventionSgi> {
  const formulaire = new FormData()
  if (parametres.titre !== undefined) formulaire.append('titre', parametres.titre)
  if (parametres.fichier_pdf) formulaire.append('fichier_pdf', parametres.fichier_pdf)
  const { data } = await api.put<ConventionSgi>('/sgi/admin/convention/', formulaire)
  return data
}

export async function presentationSgi(): Promise<PresentationSgi> {
  const { data } = await api.get<PresentationSgi>('/sgi/admin/presentation/')
  return data
}

export async function publierPresentation(presentation: PresentationStructuree): Promise<PresentationSgi> {
  const { data } = await api.put<PresentationSgi>('/sgi/admin/presentation/', presentation)
  return data
}