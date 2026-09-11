<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Download, FileText, Upload } from '@lucide/vue'

import { useDepotMinimum } from '@/composables/useDepotMinimum'
import { COULEURS_DEPOT, LIBELLES_DEPOT } from '@/config/depots'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))

const {
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
} = useDepotMinimum(id.value)

const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const formulaireVisible = computed(() => {
  const statut = depot.value?.statut
  return statut === 'EN_ATTENTE' || statut === 'REJETE'
})

const enAttenteVerification = computed(() => depot.value?.statut === 'PREUVE_DEPOSEE')
const approuve = computed(() => depot.value?.statut === 'APPROUVE')
const rejete = computed(() => depot.value?.statut === 'REJETE')

onMounted(() => void charger())

function onFileSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  if (f) preuve.value = f
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) preuve.value = f
}

function ouvrirPreuve() {
  if (depot.value?.preuve_url) window.open(depot.value.preuve_url, '_blank', 'noopener')
}
</script>

<template>
  <v-container fluid class="page-container pa-6">
    <v-btn variant="text" color="primary" class="mb-4 font-weight-bold px-0" @click="router.back()">
      <ArrowLeft :size="20" class="mr-2" /> Retour
    </v-btn>

    <v-alert v-if="erreur" type="error" variant="tonal" border="start" class="mb-6">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="succes" type="success" variant="tonal" border="start" class="mb-6">
      {{ succes }}
    </v-alert>

    <v-alert v-if="pasExige" type="info" variant="tonal" border="start" class="mb-6">
      La SGI n'exige pas de dépôt minimum pour ouvrir ce compte : le dossier a été activé directement.
    </v-alert>

    <div v-if="chargement" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" width="4" />
    </div>

    <template v-else-if="depot">
      <v-card class="glass-panel mb-6 overflow-hidden">
        <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center flex-wrap gap-4">
          <div class="d-flex align-center">
            <div class="icon-box bg-surface text-primary rounded-circle pa-2 mr-4 elevation-1">
              <FileText :size="24" />
            </div>
            <div>
              <div class="font-display text-h5 font-weight-bold">Dépôt minimum requis</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ depot.dossier_reference }} — {{ depot.sgi_nom }}
              </div>
            </div>
          </div>
          <v-spacer />
          <v-chip :color="COULEURS_DEPOT[depot.statut]" variant="flat" class="font-weight-bold shadow-sm" size="large">
            {{ LIBELLES_DEPOT[depot.statut] }}
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Montant à déposer</div>
              <div class="text-h5 font-weight-bold text-primary">
                {{ Number(depot.montant_requis).toLocaleString('fr-FR') }} {{ depot.devise }}
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Méthodes acceptées</div>
              <div class="d-flex flex-wrap gap-2 mt-1">
                <v-chip
                  v-for="methode in depot.methodes_acceptees"
                  :key="methode.code"
                  size="small"
                  variant="tonal"
                  color="primary"
                  class="font-weight-bold"
                >
                  {{ methode.libelle }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Instructions</div>
              <div class="text-body-2">
                {{ depot.instructions || 'Aucune instruction particulière.' }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Preuve approuvée : compte ouvert -->
      <v-card v-if="approuve" class="glass-panel mb-6">
        <v-card-text class="pa-6">
          <div class="d-flex align-center">
            <CheckCircle2 :size="32" class="text-success mr-4" />
            <div>
              <div class="font-weight-bold text-body-1">Dépôt approuvé — compte ouvert</div>
              <div class="text-body-2 text-medium-emphasis">
                Votre dossier est désormais actif. Merci de votre confiance.
              </div>
              <div class="text-body-2 text-medium-emphasis mt-2">
                Référence vérifiée : {{ depot.reference_transaction }}
                <template v-if="depot.commentaire_agent"> — Note de l'agent : {{ depot.commentaire_agent }}</template>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Preuve déposée, en attente de vérification -->
      <v-card v-if="enAttenteVerification" class="glass-panel mb-6">
        <v-card-text class="pa-6">
          <div class="d-flex flex-wrap align-center">
            <Clock :size="32" class="text-info mr-4" />
            <div class="mr-6">
              <div class="font-weight-bold text-body-1">Preuve déposée — vérification en cours</div>
              <div class="text-body-2 text-medium-emphasis">
                Un agent de la SGI contrôle votre preuve. Vous serez notifié de la décision.
              </div>
            </div>
            <v-btn variant="tonal" color="primary" class="font-weight-bold" @click="ouvrirPreuve">
              <Download :size="18" class="mr-2" /> Revoir la preuve déposée
            </v-btn>
          </div>
          <v-divider class="my-4" />
          <v-row>
            <v-col cols="12" sm="4">
              <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Montant déposé</div>
              <div class="font-weight-bold">{{ Number(depot.montant_depose).toLocaleString('fr-FR') }} FCFA</div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Méthode</div>
              <div class="font-weight-bold">{{ depot.methode_paiement || '—' }}</div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Référence / Dépôt</div>
              <div class="font-weight-bold">{{ depot.reference_transaction || '—' }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Rejet : motif + formulaire de re-dépôt -->
      <v-alert v-if="rejete && depot.commentaire_agent" type="error" variant="tonal" border="start" class="mb-6">
        <div class="font-weight-bold mb-1">Preuve rejetée par l'agent :</div>
        <div>{{ depot.commentaire_agent }}</div>
        <div class="text-body-2 mt-2">
          Corrigez la preuve et redéposez-la ci-dessous.
        </div>
      </v-alert>

      <!-- Formulaire de dépôt (initial ou après rejet) -->
      <v-card v-if="formulaireVisible" class="glass-panel overflow-hidden">
        <v-card-title class="pa-6 border-b bg-surface-variant font-weight-bold d-flex align-center">
          <Upload :size="20" class="text-primary mr-3" />
          {{ rejete ? 'Redéposer la preuve' : 'Déposer la preuve du virement' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="montantDepose"
                label="Montant effectivement déposé (FCFA)"
                type="number"
                min="1"
                variant="outlined"
                class="premium-input"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="methodePaiement"
                label="Méthode de paiement utilisée"
                :items="depot.methodes_acceptees.map((m) => ({ title: m.libelle, value: m.code }))"
                variant="outlined"
                class="premium-input"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="referenceTransaction"
                label="Référence de la transaction (reçu)"
                placeholder="Ex : OM-88217"
                variant="outlined"
                class="premium-input"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,application/pdf,.png,.jpg,.jpeg,.pdf"
            class="d-none"
            @change="onFileSelect"
          />

          <div
            class="drop-zone rounded-xl d-flex flex-column align-center justify-center text-center pa-8 mb-6 cursor-pointer mt-6"
            :class="{ 'drag-over': dragOver }"
            @click="fileInputRef?.click()"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <template v-if="preuve">
              <FileText :size="40" class="text-primary mb-3" />
              <div class="font-weight-bold text-body-1">{{ preuve.name }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ (preuve.size / 1024 / 1024).toFixed(2) }} Mo
              </div>
            </template>
            <template v-else>
              <Upload :size="40" class="text-medium-emphasis mb-3" />
              <div class="font-weight-bold text-body-1">Glissez la preuve ici</div>
              <div class="text-caption text-medium-emphasis">
                Image PNG/JPG ou PDF, 10 Mo maximum
              </div>
            </template>
          </div>

          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              size="large"
              variant="flat"
              class="font-weight-bold shadow-sm"
              :loading="envoiEnCours"
              :disabled="envoiEnCours"
              @click="deposer"
            >
              <Upload :size="18" class="mr-2" /> {{ rejete ? 'Redéposer la preuve' : 'Envoyer la preuve' }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <div v-else-if="!pasExige" class="d-flex justify-center align-center py-12">
      <v-alert type="warning" variant="tonal" border="start" class="w-100 max-width-600">
        <AlertCircle :size="24" class="mr-3" />
        Impossible de consulter le dépôt minimum de ce dossier.
      </v-alert>
    </div>
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

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

.drop-zone {
  border: 2px dashed rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.max-width-600 {
  max-width: 600px;
}
</style>