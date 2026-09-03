import { ref } from 'vue'
import {
  creerChamp,
  creerEtape,
  listeChampsKycAdmin,
  listetEtapesKycAdmin,
  modifierChamp,
  modifierEtape,
  supprimerEtape as apiSupprimerEtape,
  supprimerChamp as apiSupprimerChamp,
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
  const dialogSupprimerEtape = ref(false)
  const dialogSupprimerChamp = ref(false)
  const envoiEnCours = ref(false)

  const etapeEnEdition = ref<EtapeKycAdmin | null>(null)
  const champEnEdition = ref<ChampKycAdmin | null>(null)
  const etapeASupprimer = ref<EtapeKycAdmin | null>(null)
  const champASupprimer = ref<ChampKycAdmin | null>(null)

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

  function ouvrirEditionEtape(etape: EtapeKycAdmin) {
    etapeEnEdition.value = etape
    formulaireEtape.value = { nom: etape.nom, ordre: etape.ordre }
    dialogEtape.value = true
  }

  function reinitialiserDialogEtape() {
    etapeEnEdition.value = null
    formulaireEtape.value = { nom: '', ordre: etapes.value.length + 1 }
  }

  async function sauvegarderEtape() {
    if (!etapeEnEdition.value || !formulaireEtape.value.nom.trim()) return
    envoiEnCours.value = true
    erreur.value = ''
    try {
      const maj = await modifierEtape(etapeEnEdition.value.id, {
        nom: formulaireEtape.value.nom.trim(),
        ordre: formulaireEtape.value.ordre,
      })
      const idx = etapes.value.findIndex((e) => e.id === etapeEnEdition.value!.id)
      if (idx !== -1) {
        etapes.value[idx] = maj
        etapes.value.sort((a, b) => a.ordre - b.ordre)
      }
      dialogEtape.value = false
      etapeEnEdition.value = null
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  function ouvrirSuppressionEtape(etape: EtapeKycAdmin) {
    etapeASupprimer.value = etape
    dialogSupprimerEtape.value = true
  }

  async function confirmerSuppressionEtape() {
    if (!etapeASupprimer.value) return
    envoiEnCours.value = true
    erreur.value = ''
    try {
      await apiSupprimerEtape(etapeASupprimer.value.id)
      etapes.value = etapes.value.filter((e) => e.id !== etapeASupprimer.value!.id)
      champsParEtape.value.delete(etapeASupprimer.value.id)
      dialogSupprimerEtape.value = false
      etapeASupprimer.value = null
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  function ouvrirEditionChamp(champ: ChampKycAdmin) {
    champEnEdition.value = champ
    formulaireChamp.value = {
      etape: champ.etape,
      nom: champ.nom,
      code: champ.code,
      type: champ.type,
      obligatoire: champ.obligatoire,
      ordre: champ.ordre,
      justification: champ.justification ?? '',
      options_choix: champ.options_choix?.join(', ') ?? '',
      formats_acceptes: champ.formats_acceptes ?? '',
      taille_max_mo: champ.taille_max_mo ?? null,
    }
    dialogChamp.value = true
  }

  function reinitialiserDialogChamp() {
    champEnEdition.value = null
    formulaireChamp.value = {
      etape: '',
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
  }

  async function sauvegarderChamp() {
    if (!champEnEdition.value || !formulaireChamp.value.nom.trim()) return
    envoiEnCours.value = true
    erreur.value = ''
    try {
      const maj = await modifierChamp(champEnEdition.value.id, {
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
      const actuels = champsParEtape.value.get(maj.etape) ?? []
      const idx = actuels.findIndex((c) => c.id === champEnEdition.value!.id)
      if (idx !== -1) {
        actuels[idx] = maj
      }
      dialogChamp.value = false
      champEnEdition.value = null
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  function ouvrirSuppressionChamp(champ: ChampKycAdmin) {
    champASupprimer.value = champ
    dialogSupprimerChamp.value = true
  }

  async function confirmerSuppressionChamp() {
    if (!champASupprimer.value) return
    envoiEnCours.value = true
    erreur.value = ''
    try {
      await apiSupprimerChamp(champASupprimer.value.id)
      const actuels = champsParEtape.value.get(champASupprimer.value.etape) ?? []
      champsParEtape.value.set(
        champASupprimer.value.etape,
        actuels.filter((c) => c.id !== champASupprimer.value!.id),
      )
      dialogSupprimerChamp.value = false
      champASupprimer.value = null
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  return {
    etapes,
    champsParEtape,
    chargement,
    erreur,
    dialogEtape,
    dialogChamp,
    dialogSupprimerEtape,
    dialogSupprimerChamp,
    envoiEnCours,
    etapeEnEdition,
    champEnEdition,
    etapeASupprimer,
    champASupprimer,
    formulaireEtape,
    formulaireChamp,
    charger,
    creerNouvelleEtape,
    ouvrirChamp,
    creerNouveauChamp,
    basculerEtape,
    basculerChamp,
    ouvrirEditionEtape,
    sauvegarderEtape,
    ouvrirSuppressionEtape,
    confirmerSuppressionEtape,
    ouvrirEditionChamp,
    sauvegarderChamp,
    ouvrirSuppressionChamp,
    confirmerSuppressionChamp,
    reinitialiserDialogEtape,
    reinitialiserDialogChamp,
  }
}
