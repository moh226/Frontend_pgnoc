import { ref, computed } from 'vue'
import { 
  etapesKyc, 
  verifierAuthenticiteSelfie, 
  type VerificationPreuveVie 
} from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useDossiersStore } from '@/stores/dossiers'
import type { ChampKyc } from '@/types'

export function useDossierAgent(id: string) {
  const dossiers = useDossiersStore()
  const auth = useAuthStore()

  // State
  const dialogCommentaire = ref(false)
  const valeurCommentee = ref<string | null>(null)
  const texteCommentaire = ref('')
  const envoiEnCours = ref(false)

  const dialogRejet = ref(false)
  const motifRejet = ref('')

  const dialogValidation = ref(false)

  const dialogAuthenticite = ref(false)
  const verificationPreuve = ref<VerificationPreuveVie | null>(null)
  const verificationEnCours = ref(false)
  const erreurVerification = ref('')

  const champsParId = ref(new Map<string, ChampKyc>())

  // Computed
  const estPriseEnChargeParMoi = computed(
    () => dossiers.detail?.agent_email === auth.utilisateur?.email,
  )

  // Actions
  function ouvrirCommentaire(valeurId: string) {
    valeurCommentee.value = valeurId
    texteCommentaire.value = ''
    dialogCommentaire.value = true
  }

  async function envoyerCommentaire() {
    if (!valeurCommentee.value || !texteCommentaire.value.trim()) return
    envoiEnCours.value = true
    try {
      await dossiers.commenterValeur(id, valeurCommentee.value, texteCommentaire.value)
      dialogCommentaire.value = false
    } finally {
      envoiEnCours.value = false
    }
  }

  async function prendreEnCharge() {
    envoiEnCours.value = true
    try {
      await dossiers.prendreEnCharge(id)
    } catch (cause) {
      dossiers.erreur = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  async function rejeter() {
    if (!motifRejet.value.trim()) return
    envoiEnCours.value = true
    try {
      await dossiers.deciderDossier(id, 'rejeter', motifRejet.value)
      dialogRejet.value = false
      motifRejet.value = ''
    } catch (cause) {
      dossiers.erreur = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  async function valider() {
    envoiEnCours.value = true
    try {
      await dossiers.deciderDossier(id, 'valider')
      dialogValidation.value = false
    } catch (cause) {
      dossiers.erreur = extraireMessageErreur(cause)
    } finally {
      envoiEnCours.value = false
    }
  }

  function nomDuChamp(idChamp: string): string {
    return champsParId.value.get(idChamp)?.nom ?? idChamp.slice(0, 8)
  }

  function typeDuChamp(idChamp: string): string | undefined {
    return champsParId.value.get(idChamp)?.type
  }

  async function verifierPreuve(valeurId: string) {
    verificationEnCours.value = true
    erreurVerification.value = ''
    verificationPreuve.value = null
    dialogAuthenticite.value = true
    try {
      verificationPreuve.value = await verifierAuthenticiteSelfie(id, valeurId)
    } catch (cause) {
      erreurVerification.value = extraireMessageErreur(cause)
    } finally {
      verificationEnCours.value = false
    }
  }

  function conforme(): boolean {
    return Boolean(
      verificationPreuve.value?.concordante && verificationPreuve.value?.signature_valide,
    )
  }

  async function chargerDossierEtChamps() {
    await dossiers.chargerDetail(id)
    const detailActuel = dossiers.detail
    if (!detailActuel) return
    try {
      const reponse = await etapesKyc(detailActuel.sgi)
      const index = new Map<string, ChampKyc>()
      for (const etape of reponse.results) {
        for (const champ of etape.champs) index.set(champ.id, champ)
      }
      champsParId.value = index
    } catch {
      // Champs introuvables (désactivés/supprimés) : l'id tronqué sert de repli.
    }
  }

  return {
    dossiers,
    auth,
    dialogCommentaire,
    valeurCommentee,
    texteCommentaire,
    envoiEnCours,
    dialogRejet,
    motifRejet,
    dialogValidation,
    dialogAuthenticite,
    verificationPreuve,
    verificationEnCours,
    erreurVerification,
    estPriseEnChargeParMoi,
    ouvrirCommentaire,
    envoyerCommentaire,
    prendreEnCharge,
    rejeter,
    valider,
    nomDuChamp,
    typeDuChamp,
    verifierPreuve,
    conforme,
    chargerDossierEtChamps
  }
}
