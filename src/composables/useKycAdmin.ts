import { ref } from 'vue'
import {
  creerChamp,
  creerEtape,
  listeChampsKycAdmin,
  listetEtapesKycAdmin,
  modifierChamp,
  modifierEtape,
} from '@/api/kycAdmin'
import { extraireMessageErreur } from '@/api/client'
import type { ChampKycAdmin, EtapeKycAdmin, TypeChampKyc } from '@/types'

export const LIBELLES_TYPE: Record<TypeChampKyc, string> = {
  TEXTE_COURT: 'Texte court',
  TEXTE_LONG: 'Texte long',
  NOMBRE: 'Nombre',
  DATE: 'Date',
  BOOLEEN: 'Case à cocher',
  CHOIX_UNIQUE: 'Choix unique',
  CHOIX_MULTIPLE: 'Choix multiple',
  FICHIER: 'Fichier joint',
  SELFIE: 'Selfie de vérification',
}

export function useKycAdmin() {
  const etapes = ref<EtapeKycAdmin[]>([])
  const champsParEtape = ref(new Map<string, ChampKycAdmin[]>())
  const chargement = ref(false)
  const erreur = ref('')
  
  const dialogEtape = ref(false)
  const dialogChamp = ref(false)
  const envoiEnCours = ref(false)

  const formulaireEtape = ref({ nom: '', ordre: 1 })
  const formulaireChamp = ref({
    etape: '',
    nom: '',
    code: '',
    type: 'TEXTE_COURT' as TypeChampKyc,
    obligatoire: true,
    ordre: 1,
    justification: '',
    options_choix: '',
    formats_acceptes: '',
    taille_max_mo: null as number | null,
  })

  async function charger() {
    chargement.value = true
    erreur.value = ''
    try {
      const etapesChargees = await listetEtapesKycAdmin()
      etapes.value = [...etapesChargees].sort((a, b) => a.ordre - b.ordre)
      champsParEtape.value.clear()
      await Promise.all(
        etapes.value.map(async (e) => {
          champsParEtape.value.set(e.id, await listeChampsKycAdmin(e.id))
        }),
      )
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      chargement.value = false
    }
  }

  async function creerNouvelleEtape() {
    if (!formulaireEtape.value.nom.trim()) return
    envoiEnCours.value = true
    erreur.value = ''
    try {
      const etape = await creerEtape({
        nom: formulaireEtape.value.nom.trim(),
        ordre: formulaireEtape.value.ordre,
      })
      champsParEtape.value.set(etape.id, [])
      etapes.value.push(etape)
      etapes.value.sort((a, b) => a.ordre - b.ordre)
      dialogEtape.value = false
      formulaireEtape.value = { nom: '', ordre: etapes.value.length + 1 }
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  function ouvrirChamp(etapeId: string) {
    formulaireChamp.value = {
      etape: etapeId,
      nom: '',
      code: '',
      type: 'TEXTE_COURT',
      obligatoire: true,
      ordre: 1,
      justification: '',
      options_choix: '',
      formats_acceptes: '',
      taille_max_mo: null,
    }
    dialogChamp.value = true
  }

  function codeDuNom(nom: string): string {
    return nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  async function creerNouveauChamp() {
    if (!formulaireChamp.value.nom.trim()) return
    envoiEnCours.value = true
    erreur.value = ''
    try {
      const champ = await creerChamp({
        etape: formulaireChamp.value.etape,
        code: formulaireChamp.value.code.trim() || codeDuNom(formulaireChamp.value.nom),
        nom: formulaireChamp.value.nom.trim(),
        type: formulaireChamp.value.type,
        obligatoire: formulaireChamp.value.obligatoire,
        ordre: formulaireChamp.value.ordre,
        justification: formulaireChamp.value.justification.trim() || undefined,
        options_choix:
          formulaireChamp.value.type === 'CHOIX_UNIQUE' ||
          formulaireChamp.value.type === 'CHOIX_MULTIPLE'
            ? formulaireChamp.value.options_choix
                .split(',')
                .map((o) => o.trim())
                .filter(Boolean)
            : null,
        formats_acceptes:
          formulaireChamp.value.type === 'FICHIER' ||
          formulaireChamp.value.type === 'SELFIE'
            ? formulaireChamp.value.formats_acceptes.trim() || undefined
            : undefined,
        taille_max_mo:
          formulaireChamp.value.type === 'FICHIER' ||
          formulaireChamp.value.type === 'SELFIE'
            ? formulaireChamp.value.taille_max_mo
            : null,
      })
      const actuels = champsParEtape.value.get(champ.etape) ?? []
      champsParEtape.value.set(champ.etape, [...actuels, champ])
      dialogChamp.value = false
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  async function basculerEtape(etape: EtapeKycAdmin) {
    erreur.value = ''
    try {
      const maj = await modifierEtape(etape.id, { actif: !etape.actif })
      etape.actif = maj.actif
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    }
  }

  async function basculerChamp(champ: ChampKycAdmin) {
    erreur.value = ''
    try {
      const maj = await modifierChamp(champ.id, { actif: !champ.actif })
      champ.actif = maj.actif
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    }
  }

  return {
    etapes,
    champsParEtape,
    chargement,
    erreur,
    dialogEtape,
    dialogChamp,
    envoiEnCours,
    formulaireEtape,
    formulaireChamp,
    charger,
    creerNouvelleEtape,
    ouvrirChamp,
    creerNouveauChamp,
    basculerEtape,
    basculerChamp,
  }
}
