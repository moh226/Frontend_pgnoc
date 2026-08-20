import { computed, onMounted, reactive, ref } from 'vue'
import { presentationSgi, publierPresentation } from '@/api/sgiAdmin'
import { extraireMessageErreur } from '@/api/client'
import type {
  PresentationActivite,
  PresentationMembre,
  PresentationReference,
  PresentationSgi,
  PresentationStructuree,
} from '@/types'

export interface LigneActivite {
  titre: string
  description: string
}
export interface LigneMembre {
  nom: string
  fonction: string
}
export interface LigneReference {
  titre: string
  annee: string
  description: string
}

export function usePresentationForm() {
  const presentation = ref<PresentationSgi | null>(null)
  const chargement = ref(false)
  const erreur = ref('')
  const succes = ref('')
  const envoiEnCours = ref(false)
  const apercuOuvert = ref(false)

  const formulaire = reactive({
    forme_sociale: '',
    date_creation_societe: '',
    capital_social: '',
    numero_agrement: '',
    date_agrement: '',
    autorite_agrement: 'AMF-UEMOA (ex-CREPMF)',
    mission: '',
    vision: '',
    ancrage_regional: '',
    adresse: '',
    telephone: '',
    email_contact: '',
    site_web: '',
    activites: [] as LigneActivite[],
    membres: [] as LigneMembre[],
    references: [] as LigneReference[],
  })

  const apercu = computed<PresentationStructuree>(() => ({
    forme_sociale: formulaire.forme_sociale,
    date_creation_societe: formulaire.date_creation_societe || null,
    capital_social: formulaire.capital_social,
    numero_agrement: formulaire.numero_agrement,
    date_agrement: formulaire.date_agrement || null,
    autorite_agrement: formulaire.autorite_agrement,
    est_regule: Boolean(formulaire.numero_agrement),
    mission: formulaire.mission,
    vision: formulaire.vision,
    ancrage_regional: formulaire.ancrage_regional,
    adresse: formulaire.adresse,
    telephone: formulaire.telephone,
    email_contact: formulaire.email_contact,
    site_web: formulaire.site_web,
    activites: formulaire.activites.map((a, i): PresentationActivite => ({ ...a, ordre: i })),
    membres: formulaire.membres.map((m, i): PresentationMembre => ({ ...m, ordre: i })),
    references: formulaire.references.map((r, i): PresentationReference => ({ ...r, ordre: i })),
  }))

  const rienRenseigne = computed(() => {
    const f = formulaire
    return !(
      f.forme_sociale ||
      f.date_creation_societe ||
      f.capital_social ||
      f.numero_agrement ||
      f.date_agrement ||
      f.mission ||
      f.vision ||
      f.ancrage_regional ||
      f.adresse ||
      f.telephone ||
      f.email_contact ||
      f.site_web ||
      f.activites.length ||
      f.membres.length ||
      f.references.length
    )
  })

  async function charger() {
    chargement.value = true
    erreur.value = ''
    try {
      presentation.value = await presentationSgi()
      const p = presentation.value
      formulaire.forme_sociale = p.forme_sociale
      formulaire.date_creation_societe = p.date_creation_societe ?? ''
      formulaire.capital_social = p.capital_social
      formulaire.numero_agrement = p.numero_agrement
      formulaire.date_agrement = p.date_agrement ?? ''
      formulaire.autorite_agrement = p.autorite_agrement || 'AMF-UEMOA (ex-CREPMF)'
      formulaire.mission = p.mission
      formulaire.vision = p.vision
      formulaire.ancrage_regional = p.ancrage_regional
      formulaire.adresse = p.adresse
      formulaire.telephone = p.telephone
      formulaire.email_contact = p.email_contact
      formulaire.site_web = p.site_web
      formulaire.activites = p.activites.map(({ titre, description }) => ({ titre, description }))
      formulaire.membres = p.membres.map(({ nom, fonction }) => ({ nom, fonction }))
      formulaire.references = p.references.map(({ titre, annee, description }) => ({
        titre,
        annee,
        description,
      }))
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      chargement.value = false
    }
  }

  function ajouterActivite() {
    formulaire.activites.push({ titre: '', description: '' })
  }

  function supprimerActivite(index: number) {
    formulaire.activites.splice(index, 1)
  }

  function ajouterMembre() {
    formulaire.membres.push({ nom: '', fonction: '' })
  }

  function supprimerMembre(index: number) {
    formulaire.membres.splice(index, 1)
  }

  function ajouterReference() {
    formulaire.references.push({ titre: '', annee: '', description: '' })
  }

  function supprimerReference(index: number) {
    formulaire.references.splice(index, 1)
  }

  async function publier() {
    envoiEnCours.value = true
    erreur.value = ''
    succes.value = ''
    try {
      presentation.value = await publierPresentation(apercu.value)
      succes.value = 'Présentation publiée avec succès.'
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  onMounted(() => {
    charger()
  })

  return {
    presentation,
    chargement,
    erreur,
    succes,
    envoiEnCours,
    apercuOuvert,
    formulaire,
    apercu,
    rienRenseigne,
    charger,
    publier,
    ajouterActivite,
    supprimerActivite,
    ajouterMembre,
    supprimerMembre,
    ajouterReference,
    supprimerReference,
  }
}
