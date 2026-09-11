import { ref } from 'vue'

import { detailDepotAgent, verifierDepot } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import type { DepotMinimumDetail } from '@/types'

/**
 * Vérification (approbation/rejet) d'une preuve de dépôt par un agent SGI.
 *
 * La page liste reste simple (appels directs) ; ce composable gère le
 * détail : chargement, approbation, rejet (motif obligatoire) et les
 * conventions de pilote de modale de décision.
 */
export function useDepotAgent(depotId: string) {
  const depot = ref<DepotMinimumDetail | null>(null)
  const chargement = ref(false)
  const erreur = ref('')

  const envoiEnCours = ref(false)
  const dialogRejet = ref(false)
  const motifRejet = ref('')

  async function charger() {
    chargement.value = true
    erreur.value = ''
    try {
      depot.value = await detailDepotAgent(depotId)
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      chargement.value = false
    }
  }

  async function approuver(): Promise<void> {
    envoiEnCours.value = true
    erreur.value = ''
    try {
      depot.value = await verifierDepot(depotId, { approuver: true })
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  async function rejeter(): Promise<void> {
    if (!motifRejet.value.trim()) return
    envoiEnCours.value = true
    erreur.value = ''
    try {
      depot.value = await verifierDepot(depotId, {
        approuver: false,
        commentaire_agent: motifRejet.value.trim(),
      })
      dialogRejet.value = false
      motifRejet.value = ''
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  return {
    depot,
    chargement,
    erreur,
    envoiEnCours,
    dialogRejet,
    motifRejet,
    charger,
    approuver,
    rejeter,
  }
}