import { ref } from 'vue'
import { AxiosError } from 'axios'

import { depotMinimumDossier, deposerPreuve } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import type { DepotMinimumDetail } from '@/types'

const TAILLE_MAX_MO = 10

/**
 * Parcours « dépôt minimum post-validation » côté investisseur.
 *
 * `pasExige` = la SGI n'exige aucun dépôt pour ce dossier (GET 404) :
 * la vue affiche alors une simple information, jamais un formulaire.
 */
export function useDepotMinimum(dossierId: string) {
  const depot = ref<DepotMinimumDetail | null>(null)
  const chargement = ref(false)
  const erreur = ref('')
  const pasExige = ref(false)

  const montantDepose = ref('')
  const methodePaiement = ref('')
  const referenceTransaction = ref('')
  const preuve = ref<File | null>(null)
  const envoiEnCours = ref(false)
  const succes = ref('')

  async function charger() {
    chargement.value = true
    erreur.value = ''
    pasExige.value = false
    try {
      depot.value = await depotMinimumDossier(dossierId)
      montantDepose.value = String(depot.value.montant_requis)
      methodePaiement.value = depot.value.methodes_acceptees[0]?.code ?? ''
    } catch (cause) {
      if (cause instanceof AxiosError && cause.response?.status === 404) {
        pasExige.value = true
        return
      }
      erreur.value = extraireMessageErreur(cause)
    } finally {
      chargement.value = false
    }
  }

  function validerFormulaire(): string {
    const montant = Number(montantDepose.value)
    if (!montantDepose.value || !Number.isFinite(montant) || montant < 1) {
      return 'Indiquez le montant effectivement déposé.'
    }
    if (!methodePaiement.value) {
      return 'Sélectionnez la méthode de paiement utilisée.'
    }
    if (!referenceTransaction.value.trim()) {
      return 'Indiquez la référence de la transaction (reçu).'
    }
    if (!preuve.value) {
      return 'Joignez la preuve du dépôt (image PNG/JPG ou PDF).'
    }
    const tailleMo = preuve.value.size / (1024 * 1024)
    if (tailleMo > TAILLE_MAX_MO) {
      return `Le fichier dépasse la limite de ${TAILLE_MAX_MO} Mo.`
    }
    return ''
  }

  async function deposer(): Promise<boolean> {
    const defaut = validerFormulaire()
    if (defaut) {
      erreur.value = defaut
      return false
    }
    envoiEnCours.value = true
    erreur.value = ''
    succes.value = ''
    try {
      depot.value = await deposerPreuve(dossierId, {
        montant_depose: String(Number(montantDepose.value)),
        methode_paiement: methodePaiement.value,
        reference_transaction: referenceTransaction.value.trim(),
        preuve: preuve.value as File,
      })
      preuve.value = null
      succes.value = 'Preuve de dépôt envoyée. Un agent de la SGI va la vérifier.'
      return true
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
      return false
    } finally {
      envoiEnCours.value = false
    }
  }

  return {
    depot,
    chargement,
    erreur,
    pasExige,
    montantDepose,
    methodePaiement,
    referenceTransaction,
    preuve,
    envoiEnCours,
    succes,
    charger,
    deposer,
  }
}