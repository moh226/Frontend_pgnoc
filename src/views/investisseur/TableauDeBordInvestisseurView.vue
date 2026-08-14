<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useDossiersStore } from '@/stores/dossiers'
import { useNotificationsStore } from '@/stores/notifications'
import { formaterJour } from '@/utils/format'

const router = useRouter()
const dossiers = useDossiersStore()
const notifications = useNotificationsStore()

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
      <v-col cols="12" sm="6" lg="4" xl="2">
        <v-card class="pa-4" variant="tonal">
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon icon="mdi-folder-multiple-outline" class="mr-2" color="primary" />
            Dossiers
          </v-card-title>
          <v-card-text class="text-h4 font-display">{{ dossiers.total }}</v-card-text>
        </v-card>
      </v-col>
      <v-col v-for="statut in ['BROUILLON', 'SOUMIS', 'EN_INSTRUCTION', 'VALIDE', 'REJETE']" :key="statut" cols="12" sm="6" lg="4" xl="2">
        <v-card class="pa-4" variant="tonal">
          <v-card-text class="text-caption text-uppercase text-medium-emphasis">
            {{ LIBELLES_STATUT[statut as keyof typeof LIBELLES_STATUT] }}
          </v-card-text>
          <v-card-text class="pa-0 d-flex align-center">
            <v-icon :icon="'mdi-circle'" :color="COULEURS_STATUT[statut as keyof typeof COULEURS_STATUT]" size="10" class="mr-2" />
            <span class="text-h4 font-display">
              {{ dossiers.parStatut[statut as keyof typeof dossiers.parStatut] }}
            </span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            Mes dossiers récents
            <v-spacer />
            <v-btn variant="text" color="primary" :to="{ name: 'investisseur-dossiers' }">
              Tout voir
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-alert v-if="!dossiers.chargement && !dossiers.liste.length" type="info" variant="tonal">
              Aucun dossier pour le moment. Votre espace se remplira dès votre première
              souscription.
            </v-alert>
            <v-list v-else-if="dossiers.liste.length" density="compact">
              <v-list-item
                v-for="dossier in dossiers.liste"
                :key="dossier.id"
                @click="router.push({ name: 'investisseur-dossier-detail', params: { id: dossier.id } })"
              >
                <template #prepend>
                  <v-icon icon="mdi-file-document-outline" color="primary" />
                </template>
                <v-list-item-title class="font-weight-medium">{{ dossier.reference }}</v-list-item-title>
                <v-list-item-subtitle>
                  Créé le {{ formaterJour(dossier.date_creation) }}
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex align-center ga-4" style="min-width: 180px">
                    <v-progress-linear
                      :model-value="dossier.progression_pct"
                      height="6"
                      rounded
                      class="flex-grow-1"
                    />
                    <v-chip
                      size="small"
                      :color="COULEURS_STATUT[dossier.statut]"
                      variant="tonal"
                    >
                      {{ LIBELLES_STATUT[dossier.statut] }}
                    </v-chip>
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
            <v-badge v-if="notifications.compteNonLues" :content="notifications.compteNonLues" color="error" class="ml-2">
              <v-icon icon="mdi-bell-outline" />
            </v-badge>
            <v-spacer />
            <v-btn variant="text" color="primary" :to="{ name: 'investisseur-notifications' }">
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
            <v-chip color="primary" variant="tonal" class="mb-2">
              {{ notifications.compteNonLues }} non lue(s)
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>