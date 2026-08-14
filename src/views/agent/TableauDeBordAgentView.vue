<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useDossiersStore } from '@/stores/dossiers'
import { useNotificationsStore } from '@/stores/notifications'
import { formaterJour } from '@/utils/format'

const router = useRouter()
const dossiers = useDossiersStore()
const notifications = useNotificationsStore()

const statutsAffiches = ['SOUMIS', 'EN_INSTRUCTION', 'VALIDE', 'REJETE'] as const
const enAttente = computed(() => dossiers.liste.filter((d) => d.statut === 'SOUMIS'))

async function prendreEnCharge(id: string) {
  await dossiers.prendreEnCharge(id)
}

onMounted(async () => {
  await Promise.all([dossiers.chargerListe(), notifications.chargerCompte()])
})
</script>

<template>
  <v-container fluid>
    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-4">
      {{ dossiers.erreur }}
    </v-alert>

    <v-row>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="pa-4" variant="tonal">
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon icon="mdi-folder-multiple-outline" class="mr-2" color="primary" />
            Dossiers de la SGI
          </v-card-title>
          <v-card-text class="text-h4 font-display">{{ dossiers.total }}</v-card-text>
        </v-card>
      </v-col>
      <v-col v-for="statut in statutsAffiches" :key="statut" cols="12" sm="6" lg="3">
        <v-card class="pa-4" variant="tonal">
          <v-card-text class="text-caption text-uppercase text-medium-emphasis">
            {{ LIBELLES_STATUT[statut] }}
          </v-card-text>
          <v-card-text class="pa-0 d-flex align-center">
            <v-icon :icon="'mdi-circle'" :color="COULEURS_STATUT[statut]" size="10" class="mr-2" />
            <span class="text-h4 font-display">{{ dossiers.parStatut[statut] }}</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            File d'attente (dossiers soumis)
            <v-spacer />
            <v-btn variant="text" color="primary" :to="{ name: 'agent-dossiers' }">
              Tous les dossiers
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-alert v-if="!dossiers.chargement && !enAttente.length" type="info" variant="tonal">
              Aucun dossier en attente de prise en charge.
            </v-alert>
            <v-list v-else density="compact">
              <v-list-item
                v-for="dossier in enAttente"
                :key="dossier.id"
                @click="router.push({ name: 'agent-dossier-detail', params: { id: dossier.id } })"
              >
                <template #prepend>
                  <v-icon icon="mdi-file-document-outline" color="primary" />
                </template>
                <v-list-item-title class="font-weight-medium">{{ dossier.reference }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ dossier.investisseur_email }} — soumis le {{ formaterJour(dossier.date_soumission) }}
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex align-center ga-2" style="min-width: 200px">
                    <v-chip size="small" color="warning" variant="tonal">En attente</v-chip>
                    <v-btn
                      size="small"
                      color="primary"
                      variant="flat"
                      @click.stop="prendreEnCharge(dossier.id)"
                    >
                      Prendre en charge
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            <v-progress-linear v-if="dossiers.chargement" indeterminate class="mt-2" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            Notifications
            <v-badge
              v-if="notifications.compteNonLues"
              :content="notifications.compteNonLues"
              color="error"
              class="ml-2"
            >
              <v-icon icon="mdi-bell-outline" />
            </v-badge>
            <v-spacer />
            <v-btn variant="text" color="primary" :to="{ name: 'agent-notifications' }">
              Voir tout
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-alert
              v-if="!notifications.compteNonLues"
              type="success"
              variant="tonal"
              class="mb-0"
            >
              Aucune notification en attente.
            </v-alert>
            <v-chip v-else color="primary" variant="tonal">
              {{ notifications.compteNonLues }} non lue(s)
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>