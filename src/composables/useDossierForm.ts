import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import {
  detailDossier,
  enregistrerValeur,
  etapesKyc,
  televerserFichier,
  accepterConvention
} from '@/api/dossiers'
import { extraireErreurApi, extraireMessageErreur } from '@/api/client'
import type { ErreurChampManquant } from '@/api/client'
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

  // Champs manquants renvoyés par le serveur lors d'un échec de
  // soumission (code DOSSIER_INCOMPLET) : alimentent le bouton « Aller
  // au champ manquant » qui guide l'investisseur au lieu de le laisser
  // chercher. Vidés dès qu'on navigue ou qu'une nouvelle soumission part.
  const champsManquantsSoumission = ref<ErreurChampManquant[]>([])
  
  // Navigation
  const etapeGlobaleActive = ref(0)

  const conventionPubliee = computed(() => Boolean(fiche.value?.convention.titre))
  // La convention doit être (re)lue et acceptée si la SGI en a publié
  // une nouvelle version depuis la dernière acceptation.
  const conventionAJour = computed<boolean>(() => {
    if (!conventionPubliee.value) return true
    const detailCourant = detail.value
    return Boolean(
      detailCourant?.convention_acceptee &&
        detailCourant.convention_version === fiche.value?.convention.version,
    )
  })
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

// Champ(s) signalé(s) par l'agent sur un dossier rejeté : ce sont les
  // seuls à corriger. Le flux "Suivant" de la correction les parcourt
  // un à un, étape après étape, avant de ramener l'investisseur à la
  // résoumission.
  const champsCommentes = computed<ChampKyc[]>(() => {
    if (detail.value?.statut !== 'REJETE') return []
    return tousChamps.value.filter((champ) => Boolean(valeurs.value[champ.id]?.commentaire_agent))
  })

  // En REJETE, l'investisseur doit corriger les champs commentés MAIS AUSSI
  // renseigner tout champ obligatoire vide (progression < 100 sinon les
  // vérifications serveur refusent la résoumission) : on bloque donc
  // l'avancée tant qu'il reste des obligatoires vides, comme en brouillon.
  const etapeCouranteIncomplete = computed(() => {
    const index = etapeCourante.value?.kycIndex
    if (index === undefined) return false
    return (statistiquesEtapes.value[index]?.restants ?? 0) > 0
  })

  // Un champ "demande attention" : corrigé (commenté par l'agent) ou
  // obligatoire encore vide. Le guidage REJETE parcourt les étapes qui
  // en contiennent — ni plus ni moins.
  function champDemandeCorrectionOuSaisie(champ: ChampKyc): boolean {
    if (champsCommentes.value.some((c) => c.id === champ.id)) return true
    if (!champ.obligatoire) return false
    return !champEstRenseigne(champ)
  }

  function prochaineEtapeKycACompleter(apres: number): number {
    for (let i = apres + 1; i < etapesGlobales.value.length - 2; i++) {
      const kycIndex = etapesGlobales.value[i].kycIndex
      if (kycIndex === undefined) continue
      const etape = etapes.value[kycIndex]
      if (etape.champs.some(champDemandeCorrectionOuSaisie)) return i
    }
    // Plus rien à compléter : on aboutit au RÉCAPITULATIF (relecture
    // avant transmission), pas directement à la validation.
    return etapesGlobales.value.length - 2
  }

  // Navigation guidée : amène l'investisseur à l'étape contenant le
  // champ désigné (par son code technique, fourni par le serveur dans
  // `champs_manquants` / `champs_a_corriger`). Retourne true si le
  // champ a été trouvé et l'étape activée.
  function allerAuChamp(codeChamp: string): boolean {
    champsManquantsSoumission.value = []
    const indexEtape = etapes.value.findIndex((etape) =>
      etape.champs.some((champ) => champ.code === codeChamp),
    )
    if (indexEtape === -1) return false
    const convOffset = conventionPubliee.value ? 1 : 0
    etapeGlobaleActive.value = convOffset + indexEtape
    erreur.value = ''
    return true
  }

  function continuerEtape() {
    if (etapeCouranteIncomplete.value) {
      erreur.value = `Veuillez renseigner les ${statistiquesEtapes.value[etapeCourante.value!.kycIndex!].restants} champ(s) obligatoire(s) avant de continuer.`
      return
    }
    erreur.value = ''
    champsManquantsSoumission.value = []
    // En mode rejet : on saute à l'étape KYC suivante qui contient un
    // champ commenté ou un obligatoire vide ; sinon on passe à l'étape
    // suivante (validation).
    if (detail.value?.statut === 'REJETE') {
      etapeGlobaleActive.value = prochaineEtapeKycACompleter(etapeGlobaleActive.value)
      return
    }
    etapeGlobaleActive.value = Math.min(etapeGlobaleActive.value + 1, etapesGlobales.value.length - 1)
  }

  interface GlobalStep {
    id: string
    titre: string
    sousTitre?: string
    type: 'convention' | 'kyc' | 'recapitulatif' | 'validation'
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
    // Étape dédiée : relecture structurée de TOUTES les réponses avant
    // la transmission — l'investisseur vérifie, retourne corriger un
    // champ signalé en un clic, confirme, puis signe/resoumet.
    list.push({
      id: 'recapitulatif',
      titre: 'Récapitulatif',
      sousTitre: 'Vérification des informations',
      type: 'recapitulatif'
    })
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

      // Initialisation de l'étape globale. Dernière étape = validation,
      // avant-dernière = récapitulatif (relecture avant transmission).
      const indexRecapitulatif = etapesGlobales.value.length - 2
      let currentGlobalIndex = 0

      if (conventionPubliee.value && !conventionAJour.value) {
        // Convention (re)publiée : on exige un (re)accord avant toute correction.
        currentGlobalIndex = 0
      } else {
        const convOffset = conventionPubliee.value ? 1 : 0

        if (detailCharge.statut === 'REJETE') {
          // Correction : on démarre à la première étape contenant un champ
          // signalé par l'agent ou un obligatoire encore vide. Plus rien
          // à compléter → relecture du récapitulatif avant resoumission.
          const premiereEtape = etapes.value.findIndex((etape) =>
            etape.champs.some(champDemandeCorrectionOuSaisie),
          )
          currentGlobalIndex =
            premiereEtape === -1
              ? indexRecapitulatif
              : convOffset + premiereEtape
        } else {
          let kycIndex = 0
          if (detailCharge.etape_courante) {
            kycIndex = etapes.value.findIndex((e) => e.id === detailCharge.etape_courante)
            if (kycIndex === -1) kycIndex = 0
          }
          currentGlobalIndex = convOffset + kycIndex

          if (detailCharge.progression_pct >= 100) {
            // Dossier complet : relecture finale plutôt que d'atterrir
            // directement sur la signature.
            currentGlobalIndex = indexRecapitulatif
          }
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
  // Une valeur est modifiable si elle n'a JAMAIS été relue par l'agent
  // (saisie en cours, valeur créée après le rejet) OU si l'agent a
  // laissé un commentaire (demande de correction). Le nom "jamaisRelue"
  // est gardé pour compatibilité mais la logique inclut le cas
  // "commentaire_agent" = modifiable.
  function valeurModifiable(champ: ChampKyc): boolean {
    const valeur = valeurs.value[champ.id]
    // Champ signalé par l'agent : corrigeable (l'investisseur DOIT pouvoir corriger)
    if (valeur?.commentaire_agent) return true
    if (!champ.obligatoire) return false
    // Saisie en cours (valeur locale sans date_creation) ou champ
    // encore vide : jamais relu → modifiable.
    if (!valeur?.date_creation) return true
    const decision = detail.value?.date_decision
    if (!decision) return true
    const creeeLe = Date.parse(valeur.date_creation)
    const rejeteLe = Date.parse(decision)
    return !Number.isNaN(creeeLe) && !Number.isNaN(rejeteLe) && creeeLe > rejeteLe
  }

  function champVerrouille(champ: ChampKyc): boolean {
    // BROUILLON : tout est modifiable. REJETE : les champs signalés par
    // l'agent et les valeurs jamais relues sont modifiables. Tout autre
    // statut (SOUMIS, EN_INSTRUCTION, VALIDE, ACTIF…) est FIGÉ.
    const statut = detail.value?.statut
    if (statut === 'BROUILLON') return false
    if (statut !== 'REJETE') return true
    return !valeurModifiable(champ)
  }

  // Pourquoi ce champ est-il verrouillé ? Un champ figé AVEC une raison
  // claire est accepté par l'utilisateur ; un champ figé sans
  // explication est vécu comme un bug. Le motif dépend du statut du
  // dossier et de la nature du champ (le composant de rendu, lui,
  // n'a pas accès au statut).
  function motifVerrouillage(champ: ChampKyc): string | null {
    if (!champVerrouille(champ)) return null
    const statut = detail.value?.statut
    if (statut === 'REJETE') {
      const valeur = valeurs.value[champ.id]
      if (valeur) {
        return (
          'Valeur jugée conforme lors de la relecture : elle est conservée ' +
          'et ne peut plus être modifiée.'
        )
      }
      return 'Champ facultatif non renseigné avant le rejet : il reste figé.'
    }
    if (statut === 'SOUMIS') return 'Dossier transmis à la SGI : lecture seule.'
    if (statut === 'EN_INSTRUCTION')
      return 'Dossier en cours d’instruction par la SGI : lecture seule.'
    if (statut === 'VALIDE') return 'Dossier validé : lecture seule.'
    return 'Consultation en lecture seule.'
  }

  // Cas d'ouverture contrôlé après rejet : un champ OBLIGATOIRE dont la
  // valeur n'a jamais été relue (vide ou saisie depuis le rejet) reste
  // saisissable, sinon le dossier serait définitivement bloqué sous les
  // 100 % exigés pour la resoumission. On l'explique, sinon cette
  // ouverture inattendue sur un dossier rejeté surprend l'investisseur.
  function noteEdition(champ: ChampKyc): string | null {
    if (detail.value?.statut !== 'REJETE') return null
    if (champVerrouille(champ)) return null
    if (champ.obligatoire) {
      return 'Champ exigé après la relecture (ajouté ou resté vide) : merci de le renseigner.'
    }
    return null
  }

  async function rafraichirProgression() {
    try {
      await rafraichirDetail()
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    }
  }

  // Recharge le détail complet (progression, statut, commentaires de
  // l'agent…) : centralisé car plusieurs chemins en ont besoin après
  // une décision serveur (succès OU refus).
  async function rafraichirDetail() {
    detail.value = await detailDossier(dossierId)
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
        // Le serveur vient de refuser ce champ (ex. CHAMP_VERROUILLE) :
        // on recharge le détail pour figer le champ côté UI (sinon il
        // resterait éditable et échouerait à chaque frappe).
        const apiErreur = extraireErreurApi(cause)
        if (apiErreur?.code === 'CHAMP_VERROUILLE') {
          try {
            await rafraichirDetail()
          } catch {
            // Le rechargement a lui-même échoué : l'erreur de sauvegarde
            // (plus importante) reste affichée.
          }
        }
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
        const existante = valeurs.value[champ.id]
        valeurs.value[champ.id] = {
          ...existante,
          id: reponse.id,
          champ: champ.id,
          valeur: null,
          fichier: reponse.url_signee,
          empreinte_sha256: reponse.empreinte_sha256 ?? null,
          signature_serveur: null,
          date_capture: reponse.date_capture ?? null,
          // Commentaire de l'agent PRÉSERVÉ : le backend ne le purge pas
          // à l'upload (update_or_create ne touche que fichier/empreinte/
          // dates/est_corrige), et sa perte ferait disparaître le champ
          // de la liste des corrections guidées.
          commentaire_agent: existante?.commentaire_agent ?? null,
          // Ressaisie d'un champ commenté = correction (même règle backend).
          est_corrige: Boolean(existante?.commentaire_agent),
          // Date de création conservée si la valeur existait (elle est
          // immuable côté serveur) : la décision de verrouillage « valeur
          // jamais relue » reste stable après remplacement du fichier.
          date_creation: existante?.date_creation ?? new Date().toISOString(),
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
    champsManquantsSoumission,
    etapeGlobaleActive,
    conventionPubliee,
    conventionAJour,
    progression,
    estModifiable,
    tousChamps,
    champsCommentes,
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
    motifVerrouillage,
    noteEdition,
    continuerEtape,
    allerAuChamp,
  }
}
