<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Banknote, Save } from '@lucide/vue'

import { configDepotMinimum, publierConfigDepotMinimum } from '@/api/sgiAdmin'
import { extraireMessageErreur } from '@/api/client'
import EntetePage from '@/components/commun/EntetePage.vue'
import type { ConfigDepotMinimum, MethodePaiementCode } from '@/types'
import { formaterDate } from '@/utils/format'

const METHODES = [
  { code: 'ORANGE_MONEY', libelle: 'Orange Money' },
  { code: 'MOOV_MONEY', libelle: 'Moov Money' },
  { code: 'WAVE', libelle: 'Wave' },
  { code: 'MTN_MONEY', libelle: 'MTN Mobile Money' },
  { code: 'VIREMENT', libelle: 'Virement bancaire' },
  { code: 'ESPECES', libelle: 'Espèces' },
] as const

const chargement = ref(false)
const erreur = ref('')
const succes = ref('')
const envoiEnCours = ref(false)

const config = ref<ConfigDepotMinimum | null>(null)
const exige = ref(false)
const montant = ref('')
const instructions = ref('')
const methodes = ref<MethodePaiementCode[]>([])

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    config.value = await configDepotMinimum()
    exige.value = config.value.exige_depot
    montant.value = String(Number(config.value.montant_depot_min) || 0)
    instructions.value = config.value.instructions
    methodes.value = config.value.methodes_acceptees.map((m) => m.code)
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

async function enregistrer() {
  erreur.value = ''
  succes.value = ''

  if (exige.value) {
    const valeur = Number(montant.value)
    if (!montant.value || !Number.isFinite(valeur) || valeur <= 0) {
      erreur.value = 'Le montant minimum doit être un nombre positif.'
      return
    }
    if (methodes.value.length === 0) {
      erreur.value = 'Sélectionnez au moins une méthode de paiement acceptée.'
      return
    }
  }

  envoiEnCours.value = true
  try {
    config.value = await publierConfigDepotMinimum({
      exige_depot: exige.value,
      montant_depot_min: montant.value || '0',
      instructions: instructions.value.trim(),
      methodes_acceptees: methodes.value,
    })
    succes.value = 'Configuration du dépôt minimum enregistrée.'
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    envoiEnCours.value = false
  }
}

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <EntetePage
      titre="Dépôt minimum post-validation"
      sous-titre="Exigez un dépôt avant d'activer les comptes-titres de vos investisseurs. Le dossier est ouvert (statut ACTIF) uniquement après approbation de la preuve."
    />

    <v-alert v-if="erreur" type="error" variant="tonal" border="start" class="mb-6">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="succes" type="success" variant="tonal" border="start" class="mb-6">
      {{ succes }}
    </v-alert>

    <v-card class="glass-panel overflow-hidden">
      <v-progress-linear v-if="chargement" indeterminate color="primary" />
      <v-card-title class="pa-6 border-b bg-surface-variant font-weight-bold d-flex align-center">
        <Banknote :size="20" class="text-primary mr-3" />
        Configuration générale
        <v-spacer />
        <span v-if="config?.date_modification" class="text-caption text-medium-emphasis font-weight-regular">
          Dernière modification : {{ formaterDate(config.date_modification) }}
        </span>
      </v-card-title>
      <v-card-text class="pa-6">
        <template v-if="!chargement">
          <v-switch
            v-model="exige"
            color="primary"
            inset
            hide-details
            class="mb-6"
            :label="exige ? 'Un dépôt minimum est exigé pour toute ouverture de compte' : 'Aucun dépôt minimum exigé'"
          />

          <div class="d-flex flex-column mb-6" style="max-width: 420px;">
            <v-text-field
              v-model="montant"
              label="Montant minimum à déposer (FCFA)"
              type="number"
              min="0"
              step="5000"
              variant="outlined"
              class="premium-input"
              hide-details="auto"
              :disabled="!exige"
            />
          </div>

          <v-textarea
            v-model="instructions"
            label="Instructions à afficher aux investisseurs"
            placeholder="Ex : effectuez le dépôt via Orange Money au numéro 07 XX XX XX XX puis joignez la preuve du virement."
            variant="outlined"
            rows="3"
            counter
            hide-details="auto"
            class="premium-input mb-6"
            :disabled="!exige"
          />

          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-3">
            Méthodes de paiement acceptées
          </div>
          <div class="d-flex flex-wrap gap-3 mb-8">
            <v-checkbox
              v-for="methode in METHODES"
              :key="methode.code"
              :label="methode.libelle"
              :value="methode.code"
              v-model="methodes"
              color="primary"
              density="compact"
              :disabled="!exige"
              hide-details
            />
          </div>

          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              size="large"
              variant="flat"
              class="font-weight-bold shadow-sm"
              :loading="envoiEnCours"
              :disabled="envoiEnCours || chargement"
              @click="enregistrer"
            >
              <Save :size="18" class="mr-2" /> Enregistrer la configuration
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.gap-3 { gap: 12px; }
</style>