import { api } from './client'
import type {
  BlocAccueilAdmin,
  BlocAccueilPublic,
  ContenuBlocAccueil,
  PayloadOrdreBlocAccueil,
  TypeBlocAccueil,
} from '@/types'

export async function accueilPublique(): Promise<BlocAccueilPublic[]> {
  const { data } = await api.get<BlocAccueilPublic[]>('/accueil/')
  return data
}

export async function listeBlocsAccueilAdmin(): Promise<BlocAccueilAdmin[]> {
  const { data } = await api.get<BlocAccueilAdmin[]>('/admin-general/accueil/')
  return data
}

export async function modifierBlocAccueil(
  type: TypeBlocAccueil,
  donnees: {
    titre?: string
    contenu?: ContenuBlocAccueil
    actif?: boolean
    ordre?: number
    image?: File | null
  },
): Promise<BlocAccueilAdmin> {
  const avecFichier = donnees.image instanceof File
  const corps: FormData | Record<string, unknown> = avecFichier ? new FormData() : {}

  if (avecFichier) {
    const formulaire = corps as FormData
    if (donnees.titre !== undefined) formulaire.append('titre', donnees.titre)
    if (donnees.actif !== undefined) formulaire.append('actif', String(donnees.actif))
    if (donnees.ordre !== undefined) formulaire.append('ordre', String(donnees.ordre))
    if (donnees.contenu) formulaire.append('contenu', JSON.stringify(donnees.contenu))
    if (donnees.image) formulaire.append('image', donnees.image)
  } else {
    const objet = corps as Record<string, unknown>
    if (donnees.titre !== undefined) objet.titre = donnees.titre
    if (donnees.actif !== undefined) objet.actif = donnees.actif
    if (donnees.ordre !== undefined) objet.ordre = donnees.ordre
    if (donnees.contenu) objet.contenu = donnees.contenu
  }

  const { data } = await api.patch<BlocAccueilAdmin>(`/admin-general/accueil/${type}/`, corps)
  return data
}

export async function ordonnerBlocsAccueil(
  payload: PayloadOrdreBlocAccueil,
): Promise<void> {
  await api.post('/admin-general/accueil/ordre/', payload)
}