<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Hand, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  Camera, 
  AlertCircle,
  FileText,
  User,
  Calendar,
  ShieldBan
} from '@lucide/vue'

import { etapesKyc, ouvrirFichierValeur, verifierAuthenticiteSelfie, type VerificationPreuveVie } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useAuthStore } from '@/stores/auth'
import { useDossiersStore } from '@/stores/dossiers'
import type { ChampKyc } from '@/types'
import { formaterDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const dossiers = useDossiersStore()
const auth = useAuthStore()

const id = computed(() => String(route.params.id))

const dialogCommentaire = ref(false)
const valeurCommentee = ref<string | null>(null)
const texteCommentaire = ref('')
const envoiEnCours = ref(false)

const dialogRejet = ref(false)
const motifRejet = ref('')

const dialogValidation = ref(false)

const estPriseEnChargeParMoi = computed(
  () => dossiers.detail?.agent_email === auth.utilisateur?.email,
)

function ouvrirCommentaire(valeurId: string) {
  valeurCommentee.value = valeurId
  texteCommentaire.value = ''
  dialogCommentaire.value = true
}

async function envoyerCommentaire() {
  if (!valeurCommentee.value || !texteCommentaire.value.trim()) return
  envoiEnCours.value = true
  try {
    await dossiers.commenterValeur(id.value, valeurCommentee.value, texteCommentaire.value)
    dialogCommentaire.value = false
  } finally {
    envoiEnCours.value = false
  }
}

async function prendreEnCharge() {
  await dossiers.prendreEnCharge(id.value)
}

async function rejeter() {
  if (!motifRejet.value.trim()) return
  envoiEnCours.value = true
  try {
    await dossiers.deciderDossier(id.value, 'rejeter', motifRejet.value)
    dialogRejet.value = false
    motifRejet.value = ''
  } finally {
    envoiEnCours.value = false
  }
}

async function valider() {
  envoiEnCours.value = true
  try {
    await dossiers.deciderDossier(id.value, 'valider')
    dialogValidation.value = false
  } finally {
    envoiEnCours.value = false
  }
}

const champsParId = ref(new Map<string, ChampKyc>())

function nomDuChamp(idChamp: string): string {
  return champsParId.value.get(idChamp)?.nom ?? idChamp.slice(0, 8)
}

function typeDuChamp(idChamp: string): string | undefined {
  return champsParId.value.get(idChamp)?.type
}

// --- Vérification d'authenticité d'un selfie (preuve de vie) ---
const dialogAuthenticite = ref(false)
const verificationPreuve = ref<VerificationPreuveVie | null>(null)
const verificationEnCours = ref(false)
const erreurVerification = ref('')

async function verifierPreuve(valeurId: string) {
  verificationEnCours.value = true
  erreurVerification.value = ''
  verificationPreuve.value = null
  dialogAuthenticite.value = true
  try {
    verificationPreuve.value = await verifierAuthenticiteSelfie(id.value, valeurId)
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

onMounted(async () => {
  await dossiers.chargerDetail(id.value)
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
})
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <v-btn variant="text" color="primary" class="mb-6 font-weight-bold px-0 hover-lift-left" @click="router.back()">
      <ArrowLeft :size="20" class="mr-2" /> Retour à la liste
    </v-btn>

    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ dossiers.erreur }}
    </v-alert>

    <template v-if="dossiers.detail">
      <!-- En-tête du dossier -->
      <v-card class="rounded-xl elevation-2 mb-6 border overflow-hidden">
        <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center flex-wrap gap-4">
          <div class="d-flex align-center">
            <div class="icon-box bg-white text-primary rounded-circle pa-2 mr-4 elevation-1">
              <FileText :size="24" />
            </div>
            <span class="font-display text-h5 font-weight-bold">{{ dossiers.detail.reference }}</span>
          </div>
          
          <v-chip
            :color="COULEURS_STATUT[dossiers.detail.statut]"
            variant="flat"
            class="font-weight-bold shadow-sm"
          >
            {{ LIBELLES_STATUT[dossiers.detail.statut] }}
          </v-chip>
          
          <v-chip variant="tonal" color="primary-darken-1" size="small" class="font-weight-bold text-uppercase">
            V {{ dossiers.detail.version }}
          </v-chip>
          
          <v-spacer />

          <div class="d-flex gap-3 flex-wrap">
            <template v-if="dossiers.detail.statut === 'SOUMIS'">
              <v-btn color="primary" variant="flat" size="large" class="font-weight-bold shadow-sm" @click="prendreEnCharge">
                <Hand :size="18" class="mr-2" /> Prendre en charge
              </v-btn>
            </template>
            
            <template v-else-if="dossiers.detail.statut === 'EN_INSTRUCTION'">
              <v-chip
                v-if="estPriseEnChargeParMoi"
                color="info"
                variant="tonal"
                class="font-weight-bold px-4 align-self-center mr-2"
              >
                Instruit par vous
              </v-chip>
              
              <v-btn color="error" variant="tonal" size="large" class="font-weight-bold" @click="dialogRejet = true">
                <XCircle :size="18" class="mr-2" /> Rejeter
              </v-btn>
              
              <v-btn color="success" variant="flat" size="large" class="font-weight-bold shadow-sm" @click="dialogValidation = true">
                <CheckCircle2 :size="18" class="mr-2" /> Valider le dossier
              </v-btn>
            </template>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-alert
            v-if="dossiers.detail.statut === 'REJETE' && dossiers.detail.motif_rejet"
            type="error"
            variant="tonal"
            class="mb-6 rounded-lg border-l-4"
          >
            <template #prepend>
              <AlertCircle :size="24" class="mr-3" />
            </template>
            <div class="font-weight-bold mb-1">Motif du rejet :</div>
            <div>{{ dossiers.detail.motif_rejet }}</div>
          </v-alert>

          <v-row>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <User :size="14" class="mr-2" /> Investisseur
              </div>
              <div class="text-body-1 font-weight-medium">{{ dossiers.detail.investisseur_email }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <Calendar :size="14" class="mr-2" /> Soumission
              </div>
              <div class="text-body-1 font-weight-medium">{{ formaterDate(dossiers.detail.date_soumission) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <Hand :size="14" class="mr-2" /> Traité par
              </div>
              <div class="text-body-1 font-weight-medium">{{ dossiers.detail.agent_email || '—' }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <FileText :size="14" class="mr-2" /> Convention
              </div>
              <div>
                <v-chip
                  size="small"
                  :color="dossiers.detail.convention_acceptee ? 'success' : 'warning'"
                  variant="flat"
                  class="font-weight-bold px-3"
                >
                  <CheckCircle2 v-if="dossiers.detail.convention_acceptee" :size="14" class="mr-1" />
                  <AlertCircle v-else :size="14" class="mr-1" />
                  {{ dossiers.detail.convention_acceptee ? 'Acceptée' : 'Manquante' }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Données KYC -->
      <v-card class="rounded-xl elevation-2 border overflow-hidden">
        <v-card-title class="pa-6 border-b bg-surface-variant font-weight-bold d-flex align-center">
          <FileText :size="20" class="text-primary mr-3" />
          Données soumises par l'investisseur
        </v-card-title>
        <v-card-text class="pa-0">
          <div v-if="!dossiers.detail.valeurs_champs.length" class="pa-8 text-center bg-surface-variant">
            <FileText :size="48" class="text-grey-lighten-1 mb-4" />
            <div class="text-body-1 text-medium-emphasis">Aucune donnée n'a été saisie dans ce dossier pour le moment.</div>
          </div>
          
          <v-table v-else class="premium-table">
            <thead class="bg-surface-variant">
              <tr>
                <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Champ Requis</th>
                <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Valeur Fournie</th>
                <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Retour Agent</th>
                <th v-if="dossiers.detail.statut === 'EN_INSTRUCTION'" class="text-end text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="valeur in dossiers.detail.valeurs_champs" :key="valeur.id" class="table-row">
                <td class="px-6 py-4">
                  <div class="d-flex align-center">
                    <span class="font-weight-medium text-body-1">{{ nomDuChamp(valeur.champ) }}</span>
                    <v-tooltip v-if="valeur.est_corrige" text="Corrigé par l'investisseur suite à votre demande" location="top">
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          icon="mdi-alert-circle-check"
                          color="success"
                          size="18"
                          class="ml-2"
                        />
                      </template>
                    </v-tooltip>
                  </div>
                </td>
                
                <td class="px-6 py-4">
                  <template v-if="valeur.fichier && typeDuChamp(valeur.champ) === 'SELFIE'">
                    <div class="d-flex flex-column align-start py-2">
                      <div class="position-relative cursor-pointer hover-lift d-inline-block" @click="ouvrirFichierValeur(dossiers.detail!.id, valeur.id)">
                        <img
                          :src="valeur.fichier"
                          :alt="nomDuChamp(valeur.champ)"
                          class="selfie-agent rounded-lg elevation-2 mb-3"
                        />
                        <div class="overlay-icon bg-surface rounded-circle elevation-2 pa-2 position-absolute">
                          <Camera :size="16" class="text-primary" />
                        </div>
                      </div>
                      
                      <div class="d-flex flex-wrap gap-2 mb-3">
                        <v-chip size="small" variant="tonal" class="font-weight-medium">
                          {{ formaterDate(valeur.date_capture) }}
                        </v-chip>
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="valeur.empreinte_sha256 ? 'success' : 'warning'"
                          class="font-weight-bold"
                        >
                          <ShieldCheck v-if="valeur.empreinte_sha256" :size="14" class="mr-1" />
                          <ShieldAlert v-else :size="14" class="mr-1" />
                          {{ valeur.empreinte_sha256 ? 'Signé cryptographiquement' : 'Non signé' }}
                        </v-chip>
                      </div>
                      
                      <v-btn
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="font-weight-bold"
                        @click="verifierPreuve(valeur.id)"
                      >
                        <ShieldCheck :size="16" class="mr-2" /> Contrôle d'authenticité
                      </v-btn>
                    </div>
                  </template>
                  
                  <template v-else-if="valeur.fichier">
                    <v-btn
                      variant="tonal"
                      color="primary"
                      class="font-weight-bold"
                      @click.prevent="ouvrirFichierValeur(dossiers.detail!.id, valeur.id)"
                    >
                      <Download :size="18" class="mr-2" /> Voir le document
                    </v-btn>
                  </template>
                  
                  <template v-else>
                    <div class="text-body-1">{{ valeur.valeur || '—' }}</div>
                  </template>
                </td>
                
                <td class="px-6 py-4">
                  <div v-if="valeur.commentaire_agent" class="bg-warning-lighten-5 text-warning-darken-2 pa-3 rounded-lg border border-warning-lighten-3 text-body-2">
                    <div class="font-weight-bold d-flex align-center mb-1">
                      <MessageSquare :size="14" class="mr-2" /> Note de correction :
                    </div>
                    {{ valeur.commentaire_agent }}
                  </div>
                  <span v-else class="text-medium-emphasis">—</span>
                </td>
                
                <td v-if="dossiers.detail.statut === 'EN_INSTRUCTION'" class="px-6 py-4 text-end">
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="primary"
                    class="font-weight-bold"
                    @click="ouvrirCommentaire(valeur.id)"
                  >
                    <MessageSquare :size="16" class="mr-2" />
                    {{ valeur.commentaire_agent ? 'Modifier' : 'Demander correction' }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </template>

    <div v-else-if="dossiers.detailChargement" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" width="4" />
    </div>

    <!-- Modale Vérification Authenticité -->
    <v-dialog v-model="dialogAuthenticite" max-width="600">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4">
          <ShieldCheck v-if="conforme()" :size="28" class="text-success mr-3" />
          <ShieldBan v-else :size="28" class="text-error mr-3" />
          Contrôle Cryptographique
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div v-if="verificationEnCours" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48" width="4" class="mb-4" />
            <div class="text-body-1 text-medium-emphasis">Vérification de la signature en cours...</div>
          </div>
          
          <v-alert v-else-if="erreurVerification" type="error" variant="tonal" class="mb-0 border-l-4">
            {{ erreurVerification }}
          </v-alert>
          
          <template v-else-if="verificationPreuve">
            <v-alert
              :type="conforme() ? 'success' : 'error'"
              variant="flat"
              class="mb-6 shadow-sm font-weight-medium"
            >
              {{ verificationPreuve.detail }}
            </v-alert>
            
            <div class="bg-surface-variant rounded-lg pa-4 border mb-6">
              <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">
                Empreinte Numérique (SHA-256)
              </div>
              <code class="d-block text-body-2 bg-surface pa-3 rounded border text-primary" style="word-break: break-all;">
                {{ verificationPreuve.empreinte_sha256 || 'Non disponible' }}
              </code>
            </div>
            
            <v-row>
              <v-col cols="12" sm="4">
                <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">Horodatage</div>
                <div class="text-body-1 font-weight-medium">{{ formaterDate(verificationPreuve.date_capture) }}</div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">Intégrité</div>
                <v-chip size="small" variant="flat" :color="verificationPreuve.concordante ? 'success' : 'error'" class="font-weight-bold px-3">
                  <CheckCircle2 v-if="verificationPreuve.concordante" :size="14" class="mr-1" />
                  <XCircle v-else :size="14" class="mr-1" />
                  {{ verificationPreuve.concordante ? 'Fichier Intact' : 'Altération Détectée' }}
                </v-chip>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">Signature Serveur</div>
                <v-chip size="small" variant="flat" :color="verificationPreuve.signature_valide ? 'success' : 'error'" class="font-weight-bold px-3">
                  <CheckCircle2 v-if="verificationPreuve.signature_valide" :size="14" class="mr-1" />
                  <XCircle v-else :size="14" class="mr-1" />
                  {{ verificationPreuve.signature_valide ? 'Certifiée' : 'Invalide' }}
                </v-chip>
              </v-col>
            </v-row>
          </template>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn color="primary" variant="tonal" class="font-weight-bold px-6" @click="dialogAuthenticite = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modale Commentaire -->
    <v-dialog v-model="dialogCommentaire" max-width="500">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4">
          <MessageSquare :size="24" class="text-warning mr-3" />
          Demander une correction
        </v-card-title>
        <v-card-text class="px-6 py-6">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Ce message sera envoyé à l'investisseur. Le dossier ne pourra pas être validé tant que cette valeur ne sera pas corrigée.
          </p>
          <v-textarea
            v-model="texteCommentaire"
            label="Explication de la correction requise"
            variant="outlined"
            rows="4"
            counter
            class="premium-input"
            hide-details="auto"
            placeholder="Veuillez fournir un document plus lisible..."
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 border-t mt-2">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogCommentaire = false">Annuler</v-btn>
          <v-btn
            color="warning"
            variant="flat"
            class="px-6 font-weight-bold shadow-sm"
            :disabled="!texteCommentaire.trim() || envoiEnCours"
            :loading="envoiEnCours"
            @click="envoyerCommentaire"
          >
            Envoyer la demande
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modale Rejet -->
    <v-dialog v-model="dialogRejet" max-width="500">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4 text-error">
          <XCircle :size="24" class="mr-3" />
          Rejeter le dossier
        </v-card-title>
        <v-card-text class="px-6 py-6">
          <v-alert type="error" variant="tonal" class="mb-4 border-l-4">
            <template #prepend>
              <AlertCircle :size="20" class="mr-2" />
            </template>
            <span class="text-body-2 font-weight-medium">Le dossier entier sera renvoyé à l'investisseur.</span>
          </v-alert>
          <v-textarea
            v-model="motifRejet"
            label="Motif global du rejet (obligatoire)"
            variant="outlined"
            rows="4"
            counter
            class="premium-input"
            hide-details="auto"
            placeholder="Ex: Pièce d'identité non conforme et selfie flou."
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 border-t mt-2">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogRejet = false">Annuler</v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="px-6 font-weight-bold shadow-sm"
            :disabled="!motifRejet.trim() || envoiEnCours"
            :loading="envoiEnCours"
            @click="rejeter"
          >
            Rejeter définitivement
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modale Validation -->
    <v-dialog v-model="dialogValidation" max-width="500">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4 text-success">
          <CheckCircle2 :size="24" class="mr-3" />
          Validation Définitive
        </v-card-title>
        <v-card-text class="px-6 py-6">
          <v-alert type="warning" variant="tonal" class="mb-0 border-l-4">
            <template #prepend>
              <ShieldAlert :size="20" class="mr-2" />
            </template>
            <div class="font-weight-bold mb-1">Action Irréversible</div>
            <div class="text-body-2">
              Assurez-vous que toutes les pièces ont été vérifiées. Le système bloquera automatiquement la validation si la convention n'est pas signée électroniquement (OTP) par le client.
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 border-t mt-2">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogValidation = false">Annuler</v-btn>
          <v-btn
            color="success"
            variant="flat"
            size="large"
            class="px-8 font-weight-bold shadow-sm"
            :loading="envoiEnCours"
            @click="valider"
          >
            <CheckCircle2 :size="18" class="mr-2" /> Valider le dossier
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.border-t {
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.selfie-agent {
  width: 180px;
  height: 140px;
  object-fit: cover;
  border: 2px solid rgb(var(--v-theme-surface-variant));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.overlay-icon {
  bottom: 20px;
  right: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.2s ease;
}

.position-relative:hover .selfie-agent {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

.position-relative:hover .overlay-icon {
  opacity: 1;
  transform: translateY(0);
}

.premium-input :deep(.v-field) {
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.premium-table {
  background: transparent !important;
}

.premium-table th {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.015);
}

.table-row td {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.hover-lift-left {
  transition: transform 0.2s ease;
}
.hover-lift-left:hover {
  transform: translateX(-4px);
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}
</style>