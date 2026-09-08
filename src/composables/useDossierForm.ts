import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import {
  detailDossier,
  enregistrerValeur,
  etapesKyc,
  televerserFichier,
  accepterConvention
} from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { ficheSgi } from '@/api/sgi'
import type { ChampKyc, EtapeKyc, FicheSgi, ValeurChamp, DossierDetail } from '@/types'

export function useDossierForm(dossierId: string) {
  const detail = ref<DossierDetail | null>(null)
  const etapes = ref<EtapeKyc[]>([])
  const fiche = ref<FicheSgi | null>(null)

  const valeurs = ref<Record<string, ValeurChamp>>({})
  const fichiers = ref<Record<string, File | null>>({})
  const etatsSauvegarde = ref<Record<string, 'attente' | 'en_cours' | 'ok' | 'erreur'>>({})
  const sauvegardesEnCours = new Set<Promise<void>>()

  const chargement = ref(false)
  const erreur = ref('')
  const envoiEnCours = ref(false)
  
  // Navigation
  const etapeGlobaleActive = ref(0)

  const conventionPubliee = computed(() => Boolean(fiche.value?.convention.titre))
  // La convention doit être (re)lue et acceptée si la SGI en a publié
  // une nouvelle version depuis la dernière acceptation.
  const conventionAJour = computed(
    () =>
      !conventionPubliee.value ||
      (detail.value?.convention_acceptee &&
        detail.value.convention_version === fiche.value?.convention.version),
  )
  const progression = computed(() => detail.value?.progression_pct ?? 0)
  const estModifiable = computed(() => detail.value?.statut === 'BROUILLON' || detail.value?.statut === 'REJETE')
  const tousChamps = computed(() => etapes.value.flatMap((e) => e.champs))

  function champEstRenseigne(champ: ChampKyc): boolean {
    const valeur = valeurs.value[champ.id]
    if (champ.type === 'FICHIER' || champ.type === 'SELFIE') return Boolean(valeur?.fichier)
    return Boolean(valeur?.valeur?.trim())
  }

  const statistiquesEtapes = computed(() =>
    etapes.value.map((etape) => {
      const visibles = etape.champs.filter((champ) => {
        if (!champ.champ_parent) return true
        return valeurs.value[champ.champ_parent]?.valeur === champ.valeur_declencheur
      })
      const obligatoires = visibles.filter((champ) => champ.obligatoire)
      const restants = obligatoires.filter((champ) => !champEstRenseigne(champ))
      return {
        total: visibles.length,
        completes: visibles.filter(champEstRenseigne).length,
        restants: restants.length,
        etapeComplete: restants.length === 0,
      }
    }),
  )

  const etapeCouranteIncomplete = computed(() => {
    const index = etapeCourante.value?.kycIndex
    return index !== undefined && (statistiquesEtapes.value[index]?.restants ?? 0) > 0
  })

  function continuerEtape() {
    if (etapeCouranteIncomplete.value) {
      erreur.value = `Veuillez renseigner les ${statistiquesEtapes.value[etapeCourante.value!.kycIndex!].restants} champ(s) obligatoire(s) avant de continuer.`
      return
    }
    erreur.value = ''
    etapeGlobaleActive.value = Math.min(etapeGlobaleActive.value + 1, etapesGlobales.value.length - 1)
  }

  interface GlobalStep {
    id: string
    titre: string
    sousTitre?: string
    type: 'convention' | 'kyc' | 'validation'
    kycIndex?: number
  }

  const etapesGlobales = computed<GlobalStep[]>(() => {
    const list: GlobalStep[] = []
    if (conventionPubliee.value) {
      list.push({
        id: 'convention',
        titre: 'Convention Tarifaire',
        sousTitre: 'Conditions Générales',
        type: 'convention'
      })
    }
    for (let i = 0; i < etapes.value.length; i++) {
      const kycStep = etapes.value[i]
      list.push({
        id: kycStep.id,
        titre: kycStep.nom,
        sousTitre: `Étape ${kycStep.ordre}`,
        type: 'kyc',
        kycIndex: i
      })
    }
    list.push({
      id: 'validation',
      titre: 'Validation Finale',
      sousTitre: 'Signature & Soumission',
      type: 'validation'
    })
    return list
  })

  const etapeCourante = computed(() => etapesGlobales.value[etapeGlobaleActive.value] || null)

  // --- Chargement Initial ---
  async function chargerDossier() {
    chargement.value = true
    erreur.value = ''
    try {
      const detailCharge = await detailDossier(dossierId)
      detail.value = detailCharge
      
      const [reponseEtapes, reponseFiche] = await Promise.all([
        etapesKyc(detailCharge.sgi),
        ficheSgi(detailCharge.sgi),
      ])
      
      fiche.value = reponseFiche
      etapes.value = reponseEtapes.results
      
      for (const valeur of detailCharge.valeurs_champs) {
        valeurs.value[valeur.champ] = valeur
      }

      // Initialisation de l'étape globale
      const etapesGlobalesLength = etapes.value.length + (conventionPubliee.value ? 1 : 0) + 1 // +1 for validation
      let currentGlobalIndex = 0
      
      if (conventionPubliee.value && !conventionAJour.value) {
        currentGlobalIndex = 0
      } else {
        let kycIndex = 0
        if (detailCharge.etape_courante) {
          kycIndex = etapes.value.findIndex((e) => e.id === detailCharge.etape_courante)
          if (kycIndex === -1) kycIndex = 0
        }
        
        const convOffset = conventionPubliee.value ? 1 : 0
        currentGlobalIndex = convOffset + kycIndex
        
        if (detailCharge.progression_pct >= 100) {
          currentGlobalIndex = etapesGlobalesLength - 1
        }
      }
      etapeGlobaleActive.value = currentGlobalIndex

    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      chargement.value = false
    }
  }

  // --- Helpers ---
  function champVerrouille(champ: ChampKyc): boolean {
    if (detail.value?.statut !== 'REJETE') return false
    const valeur = valeurs.value[champ.id]
    // Champs signalés par l'agent : corrigeables.
    if (valeur?.commentaire_agent) return false
    // Champ obligatoire sans valeur (ex. ajouté par la SGI après le
    // rejet) : saisie autorisée — sinon le dossier ne pourrait jamais
    // atteindre 100 % de progression (même règle que le backend).
    if (!valeur && champ.obligatoire) return false
    return true
  }

  async function rafraichirProgression() {
    try {
      detail.value = await detailDossier(dossierId)
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    }
  }

  // --- Sauvegarde Automatique avec VueUse ---
  // On utilise un map de fonctions debouncées (une par champ) pour éviter qu'un champ n'annule la sauvegarde de l'autre
  const debounceFns = new Map<string, ReturnType<typeof useDebounceFn>>()

  function getDebounceFn(champId: string) {
    if (!debounceFns.has(champId)) {
      const fn = useDebounceFn(async () => {
        await executerSauvegardeValeur(champId)
      }, 500)
      debounceFns.set(champId, fn)
    }
    return debounceFns.get(champId)!
  }

  function inscrireSauvegarde(champId: string) {
    const champ = tousChamps.value.find((c) => c.id === champId)
    if (champ && champVerrouille(champ)) return

    // Pas de retour à 'attente' pendant une sauvegarde en vol : la
    // garde `en_cours` de executerSauvegardeValeur resterait contournée
    // (deux POST concurrents pour le même champ). Le re-trigger post-
    // sauvegarde relancera si la valeur a rechangé entre-temps.
    if (etatsSauvegarde.value[champId] !== 'en_cours') {
      etatsSauvegarde.value[champId] = 'attente'
    }
    const debouncedSave = getDebounceFn(champId)
    debouncedSave()
  }

  async function executerSauvegardeValeur(champId: string) {
    const champ = tousChamps.value.find((c) => c.id === champId)
    if (!champ) return
    const valeur = valeurs.value[champ.id]
    if (!valeur) return
    if (etatsSauvegarde.value[champId] === 'en_cours') return

    const saisie = valeur.valeur ?? ''
    etatsSauvegarde.value[champId] = 'en_cours'
    
    const tache = (async () => {
      try {
        await enregistrerValeur(dossierId, champId, saisie)
        await rafraichirProgression()
        etatsSauvegarde.value[champId] = (valeurs.value[champ.id]?.valeur ?? '') === saisie ? 'ok' : 'attente'
        
        if (etatsSauvegarde.value[champId] === 'attente') {
          await executerSauvegardeValeur(champId) // Re-trigger si ça a rechangé entre temps
        }
      } catch (cause) {
        etatsSauvegarde.value[champId] = 'erreur'
        erreur.value = extraireMessageErreur(cause)
      }
    })()
    
    sauvegardesEnCours.add(tache)
    void tache.finally(() => sauvegardesEnCours.delete(tache))
    return tache
  }

  async function viderSauvegardes(): Promise<boolean> {
    // Annule les debounces en attente : leurs POST différés ne doivent
    // pas tirer APRÈS la soumission (erreur zombie sur dossier SOUMIS).
    for (const annuler of debounceFns.values()) annuler.cancel()

    // Force l'exécution immédiate des sauvegardes en attente.
    for (const champId of debounceFns.keys()) {
      if (etatsSauvegarde.value[champId] === 'attente') {
        await executerSauvegardeValeur(champId)
      }
    }

    // Attend que tout finisse.
    for (let essai = 0; essai < 30 && sauvegardesEnCours.size > 0; essai++) {
      await Promise.allSettled([...sauvegardesEnCours])
    }

    // Une sauvegarde en échec bloque la soumission : le dossier ne doit
    // pas partir avec des données partielles.
    return Object.values(etatsSauvegarde.value).every((etat) => etat !== 'erreur')
  }

  // --- Upload Fichier ---
  async function surFichierSelectionne(champ: ChampKyc, fichier: File | null) {
    if (champVerrouille(champ)) return
    
    fichiers.value[champ.id] = fichier
    if (!fichier) return
    
    etatsSauvegarde.value[champ.id] = 'en_cours'
    erreur.value = ''
    
    const tache = (async () => {
      try {
        const reponse = await televerserFichier(dossierId, champ.id, fichier)
        valeurs.value[champ.id] = {
          id: reponse.id,
          champ: champ.id,
          valeur: null,
          fichier: reponse.url_signee,
          empreinte_sha256: reponse.empreinte_sha256 ?? null,
          signature_serveur: null,
          date_capture: reponse.date_capture ?? null,
          commentaire_agent: null,
          est_corrige: false,
          date_maj: new Date().toISOString(),
        }
        etatsSauvegarde.value[champ.id] = 'ok'
        await rafraichirProgression()
      } catch (cause) {
        etatsSauvegarde.value[champ.id] = 'erreur'
        fichiers.value[champ.id] = null
        erreur.value = extraireMessageErreur(cause)
      }
    })()
    
    sauvegardesEnCours.add(tache)
    void tache.finally(() => sauvegardesEnCours.delete(tache))
  }

  // --- Convention ---
  async function accepterConventionDossier() {
    envoiEnCours.value = true
    erreur.value = ''
    try {
      await accepterConvention(dossierId)
      await rafraichirProgression()
      etapeGlobaleActive.value++
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  return {
    detail,
    etapes,
    fiche,
    valeurs,
    fichiers,
    etatsSauvegarde,
    chargement,
    erreur,
    envoiEnCours,
    etapeGlobaleActive,
    conventionPubliee,
    conventionAJour,
    progression,
    estModifiable,
    tousChamps,
    etapesGlobales,
    etapeCourante,
    statistiquesEtapes,
    etapeCouranteIncomplete,
    
    chargerDossier,
    rafraichirProgression,
    inscrireSauvegarde,
    viderSauvegardes,
    surFichierSelectionne,
    accepterConventionDossier,
    champVerrouille,
    continuerEtape,
  }
}
