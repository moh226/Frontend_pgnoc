<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
} from '@lucide/vue'

import { useDepotAgent } from '@/composables/useDepotAgent'
import { COULEURS_DEPOT, LIBELLES_DEPOT } from '@/config/depots'
import { formaterDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))

const {
  depot,
  chargement,
  erreur,
  envoiEnCours,
  dialogRejet,
  motifRejet,
  charger,
  approuver,
  rejeter,
} = useDepotAgent(id.value)

const peutVerifier = computed(() => depot.value?.statut === 'PREUVE_DEPOSEE')
const preuveOuvrable = computed(() => !!depot.value?.preuve_url)

onMounted(() => void charger())

function ouvrirPreuve() {
  if (depot.value?.preuve_url) window.open(depot.value.preuve_url, '_blank', 'noopener')
}
</script>

<template>
  <v-container fluid class="page-container pa-6">
    <v-btn variant="text" color="primary" class="mb-4 font-weight-bold px-0" @click="router.back()">
      <ArrowLeft :size="20" class="mr-2" /> Retour à la liste
    </v-btn>

    <v-alert v-if="erreur" type="error" variant="tonal" border="start" class="mb-6">
      {{ erreur }}
    </v-alert>

    <div v-if="chargement" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" width="4" />
    </div>

    <template v-else-if="depot">
      <v-card class="glass-panel mb-6 overflow-hidden">
        <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center flex-wrap gap-4">
          <div class="d-flex align-center">
            <div class="icon-box bg-surface text-primary rounded-circle pa-2 mr-4 elevation-1">
              <Wallet :size="24" />
            </div>
            <div>
              <div class="font-display text-h5 font-weight-bold">Dépôt minimum {{ depot.dossier_reference }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ depot.sgi_nom }}</div>
            </div>
          </div>
          <v-spacer />
          <v-chip :color="COULEURS_DEPOT[depot.statut]" variant="flat" class="font-weight-bold shadow-sm" size="large">
            {{ LIBELLES_DEPOT[depot.statut] }}
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <User :size="14" class="mr-2" /> Investisseur
              </div>
              <div class="text-body-1 font-weight-medium">{{ depot.investisseur_email }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <Banknote :size="14" class="mr-2" /> Montant requis
              </div>
              <div class="text-body-1 font-weight-bold text-primary">
                {{ Number(depot.montant_requis).toLocaleString('fr-FR') }} {{ depot.devise }}
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <Wallet :size="14" class="mr-2" /> Méthodes acceptées
              </div>
              <div class="d-flex flex-wrap gap-2">
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
            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center text-caption text-medium-emphasis text-uppercase tracking-wider mb-2">
                <Clock :size="14" class="mr-2" /> Dépôt / Vérification
              </div>
              <div class="text-body-2">
                {{ formaterDate(depot.date_depot) }}
                <template v-if="depot.date_verification">
                  <br />(vérifié le {{ formaterDate(depot.date_verification) }})
                </template>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <template v-if="depot.statut === 'PREUVE_DEPOSEE'">
            <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">
              Preuve déposée par l'investisseur
            </div>
            <v-row>
              <v-col cols="12" sm="4">
                <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Montant déclaré</div>
                <div class="font-weight-bold">{{ Number(depot.montant_depose).toLocaleString('fr-FR') }} FCFA</div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Méthode déclarée</div>
                <div class="font-weight-bold">{{ depot.methode_paiement || '—' }}</div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-medium-emphasis text-uppercase tracking-wider mb-1">Référence transaction</div>
                <div class="font-weight-bold">{{ depot.reference_transaction || '—' }}</div>
              </v-col>
            </v-row>

            <div class="d-flex flex-wrap align-center justify-space-between mt-6 ga-4">
              <v-btn
                variant="tonal"
                color="primary"
                class="font-weight-bold"
                :disabled="!preuveOuvrable"
                @click="ouvrirPreuve"
              >
                <Download :size="18" class="mr-2" /> Consulter la preuve originale
              </v-btn>
              <div class="d-flex flex-wrap gap-3">
                <v-btn
                  color="error"
                  variant="tonal"
                  size="large"
                  class="font-weight-bold"
                  :disabled="!peutVerifier || envoiEnCours"
                  @click="dialogRejet = true"
                >
                  <XCircle :size="18" class="mr-2" /> Rejeter la preuve
                </v-btn>
                <v-btn
                  color="success"
                  variant="flat"
                  size="large"
                  class="font-weight-bold shadow-sm"
                  :loading="envoiEnCours"
                  :disabled="envoiEnCours"
                  @click="approuver"
                >
                  <CheckCircle2 :size="18" class="mr-2" /> Approuver et ouvrir le compte
                </v-btn>
              </div>
            </div>
          </template>

          <template v-else>
            <v-alert
              v-if="depot.statut === 'APPROUVE'"
              type="success"
              variant="tonal"
              border="start"
              class="mb-4"
            >
              <div class="d-flex align-center">
                <ShieldCheck :size="24" class="mr-3" />
                <div>
                  <div class="font-weight-bold">Preuve approuvée — compte ouvert</div>
                  <div class="text-body-2">
                    Le dossier a été activé (STATUT « ACTIF ») le {{ formaterDate(depot.date_verification) }}.
                  </div>
                </div>
              </div>
            </v-alert>

            <v-alert
              v-else-if="depot.statut === 'REJETE'"
              type="error"
              variant="tonal"
              border="start"
              class="mb-4"
            >
              <div class="d-flex align-center">
                <AlertCircle :size="24" class="mr-3" />
                <div>
                  <div class="font-weight-bold">Preuve rejetée</div>
                  <div class="text-body-2">
                    Note envoyée à l'investisseur : {{ depot.commentaire_agent || '—' }}
                  </div>
                </div>
              </div>
            </v-alert>

            <v-alert v-else type="info" variant="tonal" border="start" class="mb-4">
              <div class="d-flex align-center">
                <Clock :size="24" class="mr-3" />
                <div>
                  <div class="font-weight-bold">En attente de dépôt</div>
                  <div class="text-body-2">L'investisseur n'a pas encore déposé sa preuve.</div>
                </div>
              </div>
            </v-alert>

            <div v-if="depot.preuve_url" class="d-flex align-center">
              <v-btn variant="tonal" color="primary" class="font-weight-bold" @click="ouvrirPreuve">
                <FileText :size="18" class="mr-2" /> Voir la preuve
              </v-btn>
            </div>
          </template>
        </v-card-text>
      </v-card>

      <v-card v-if="depot.instructions" class="glass-panel">
        <v-card-title class="pa-6 border-b bg-surface-variant font-weight-bold">
          Instructions de la SGI pour ce dépôt
        </v-card-title>
        <v-card-text class="pa-6 text-body-1">
          {{ depot.instructions }}
        </v-card-text>
      </v-card>
    </template>
  </v-container>

  <v-dialog v-model="dialogRejet" max-width="560">
    <v-card class="rounded-xl">
      <v-card-title class="pa-6 border-b bg-surface-variant font-weight-bold d-flex align-center">
        <XCircle :size="20" class="text-error mr-3" /> Rejeter la preuve de dépôt
      </v-card-title>
      <v-card-text class="pa-6">
        <v-alert type="warning" variant="tonal" class="mb-4">
          Le rejet renvoie la demande à l'investisseur : il pourra déposer une nouvelle preuve.
        </v-alert>
        <v-textarea
          v-model="motifRejet"
          label="Motif du rejet (envoyé à l'investisseur)"
          variant="outlined"
          rows="3"
          counter
          hide-details="auto"
          class="premium-input"
        />
      </v-card-text>
      <v-card-actions class="pa-6 pt-0 d-flex justify-end gap-3">
        <v-btn variant="text" color="medium-emphasis" class="font-weight-bold" @click="dialogRejet = false">
          Annuler
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          class="font-weight-bold"
          :loading="envoiEnCours"
          :disabled="!motifRejet.trim()"
          @click="rejeter"
        >
          <XCircle :size="18" class="mr-2" /> Confirmer le rejet
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.ga-4 { gap: 16px; }
</style>