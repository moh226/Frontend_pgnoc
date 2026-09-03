<script setup lang="ts">
import { computed, onMounted } from 'vue'
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
  ArrowRightLeft,
} from '@lucide/vue'

import { ouvrirFichierValeur } from '@/api/dossiers'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { formaterDate } from '@/utils/format'
import { useDossierAgent } from '@/composables/useDossierAgent'
import AgentDecisionDialogs from '@/components/agent/AgentDecisionDialogs.vue'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))

const {
  dossiers,
  dialogCommentaire,
  texteCommentaire,
  envoiEnCours,
  dialogRejet,
  motifRejet,
  dialogValidation,
  dialogAuthenticite,
  dialogTransfert,
  agentCible,
  verificationPreuve,
  verificationEnCours,
  erreurVerification,
  estPriseEnChargeParMoi,
  peutTransférer,
  ouvrirCommentaire,
  envoyerCommentaire,
  prendreEnCharge,
  rejeter,
  valider,
  ouvrirTransfert,
  confirmerTransférer,
  nomDuChamp,
  typeDuChamp,
  verifierPreuve,
  conforme,
  chargerDossierEtChamps
} = useDossierAgent(id.value)

onMounted(async () => {
  await chargerDossierEtChamps()
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
              
              <v-btn
                v-if="peutTransférer"
                color="warning"
                variant="tonal"
                size="large"
                class="font-weight-bold"
                @click="ouvrirTransfert"
              >
                <ArrowRightLeft :size="18" class="mr-2" /> Transférer
              </v-btn>
              
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

    <!-- Modales -->
    <AgentDecisionDialogs
      v-model:dialog-commentaire="dialogCommentaire"
      v-model:texte-commentaire="texteCommentaire"
      v-model:dialog-rejet="dialogRejet"
      v-model:motif-rejet="motifRejet"
      v-model:dialog-validation="dialogValidation"
      v-model:dialog-authenticite="dialogAuthenticite"
      v-model:dialog-transfert="dialogTransfert"
      v-model:agent-cible="agentCible"
      :envoi-en-cours="envoiEnCours"
      :verification-en-cours="verificationEnCours"
      :erreur-verification="erreurVerification"
      :verification-preuve="verificationPreuve"
      :conforme="conforme()"
      :agent-email="dossiers.detail?.agent_email"
      @envoyer-commentaire="envoyerCommentaire"
      @rejeter="rejeter"
      @valider="valider"
      @confirmer-transfert="confirmerTransférer"
    />
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