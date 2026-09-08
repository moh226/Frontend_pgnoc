<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderKanban,
  Users,
  Clock,
  FileCheck,
  XCircle,
  Bell,
  ArrowRight,
  TrendingUp,
  FileText,
  CheckCircle2
} from '@lucide/vue'

import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import EntetePage from '@/components/commun/EntetePage.vue'
import { useAgentsStore } from '@/stores/agents'
import { useDossiersStore } from '@/stores/dossiers'
import { useNotificationsStore } from '@/stores/notifications'
import { formaterJour } from '@/utils/format'

const router = useRouter()
const dossiers = useDossiersStore()
const agents = useAgentsStore()
const notifications = useNotificationsStore()

const statutsAffiches = [
  { id: 'SOUMIS', icon: Clock },
  { id: 'EN_INSTRUCTION', icon: TrendingUp },
  { id: 'VALIDE', icon: FileCheck },
  { id: 'REJETE', icon: XCircle }
] as const

const enCours = computed(() =>
  dossiers.liste.filter((d) => ['SOUMIS', 'EN_INSTRUCTION'].includes(d.statut)),
)

onMounted(async () => {
  await Promise.all([
    dossiers.chargerListe(),
    agents.charger(),
    notifications.chargerCompte(),
  ])
})
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <EntetePage titre="Tableau de Bord" sous-titre="Vue d'ensemble de l'activité de votre SGI et des dossiers en attente." />

    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" border="start" class="mb-6">
      {{ dossiers.erreur }}
    </v-alert>

    <!-- KPI Cards (Top Row) -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 d-flex flex-column">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="icon-box pa-3">
              <FolderKanban :size="24" />
            </div>
          </div>
          <div class="text-h3 font-display font-weight-bold text-primary mb-1">
            {{ dossiers.total }}
          </div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">
            Total Dossiers
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 d-flex flex-column">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="icon-box icon-box-info pa-3">
              <Users :size="24" />
            </div>
          </div>
          <div class="text-h3 font-display font-weight-bold text-info mb-1">
            {{ agents.actifs.length }}
          </div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">
            Agents Actifs
          </div>
        </v-card>
      </v-col>

      <!-- Statuts spécifiques -->
      <v-col v-for="statut in statutsAffiches" :key="statut.id" cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 d-flex flex-column">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="icon-box pa-3" :class="`icon-box-${COULEURS_STATUT[statut.id]}`.toLowerCase()">
              <component :is="statut.icon" :size="24" />
            </div>
            <v-chip size="x-small" :color="COULEURS_STATUT[statut.id]" variant="tonal" class="font-weight-bold">
              {{ LIBELLES_STATUT[statut.id] }}
            </v-chip>
          </div>
          <div class="text-h3 font-display font-weight-bold mb-1" :class="`text-${COULEURS_STATUT[statut.id]}`.toLowerCase()">
            {{ dossiers.parStatut[statut.id] || 0 }}
          </div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">
            Dossiers
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Dossiers en cours -->
      <v-col cols="12" lg="8">
        <v-card class="glass-panel h-100 d-flex flex-column">
          <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center">
            <FileText :size="20" class="mr-3 text-primary" />
            <span class="font-weight-bold">Dossiers en cours de traitement</span>
            <v-spacer />
            <v-btn variant="text" color="primary" class="font-weight-bold text-caption tracking-wider" :to="{ name: 'admin-sgi-dossiers' }">
              Tous les dossiers <ArrowRight :size="16" class="ml-1" />
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-0 flex-grow-1">
            <v-progress-linear v-if="dossiers.chargement" indeterminate color="primary" />

            <div v-if="!dossiers.chargement && !enCours.length" class="pa-8 text-center h-100 d-flex flex-column justify-center align-center">
              <CheckCircle2 :size="48" class="text-success mb-4" />
              <div class="text-h6 font-weight-medium mb-1">Tout est à jour !</div>
              <div class="text-body-2 text-medium-emphasis">Aucun dossier ne requiert votre attention pour le moment.</div>
            </div>

            <v-list v-else lines="two" class="bg-transparent pa-0 custom-list">
              <template v-for="(dossier, i) in enCours" :key="dossier.id">
                <v-divider v-if="i > 0" />
                <v-list-item
                  class="px-6 py-4 hover-row"
                  @click="router.push({ name: 'admin-sgi-dossier-detail', params: { id: dossier.id } })"
                >
                  <template #prepend>
                    <v-avatar :color="COULEURS_STATUT[dossier.statut]" variant="tonal" class="mr-4">
                      <FileText :size="20" />
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-bold text-body-1 mb-1">
                    {{ dossier.reference }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="text-caption text-medium-emphasis">
                    <span class="font-weight-medium text-on-surface">{{ dossier.investisseur_email }}</span>
                    <span class="mx-2">•</span>
                    Soumis le {{ formaterJour(dossier.date_soumission) }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-chip size="small" :color="COULEURS_STATUT[dossier.statut]" variant="tonal" class="font-weight-bold ml-4">
                      {{ LIBELLES_STATUT[dossier.statut] }}
                    </v-chip>
                    <ArrowRight :size="16" class="ml-4 text-medium-emphasis" />
                  </template>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Notifications -->
      <v-col cols="12" lg="4">
        <v-card class="glass-panel h-100 d-flex flex-column">
          <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center">
            <v-badge
              v-if="notifications.compteNonLues"
              :content="notifications.compteNonLues"
              color="error"
              class="mr-4"
            >
              <Bell :size="20" class="text-primary" />
            </v-badge>
            <Bell v-else :size="20" class="text-primary mr-3" />

            <span class="font-weight-bold">Notifications</span>
            <v-spacer />
            <v-btn variant="text" color="primary" class="font-weight-bold text-caption tracking-wider" :to="{ name: 'admin-sgi-notifications' }">
              Voir tout <ArrowRight :size="16" class="ml-1" />
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-6 flex-grow-1 d-flex flex-column justify-center align-center text-center">
            <template v-if="!notifications.compteNonLues">
              <div class="icon-box icon-box-success pa-4 mb-4 rounded-circle">
                <CheckCircle2 :size="32" />
              </div>
              <div class="text-body-1 font-weight-medium">Aucune alerte</div>
              <div class="text-caption text-medium-emphasis">Vous êtes à jour.</div>
            </template>

            <template v-else>
              <div class="icon-box icon-box-error pa-4 mb-4 rounded-circle">
                <Bell :size="32" class="pulse-animation" />
              </div>
              <div class="text-h5 font-weight-bold text-error mb-2">
                {{ notifications.compteNonLues }}
              </div>
              <div class="text-body-2 font-weight-medium text-medium-emphasis text-uppercase tracking-wider">
                Non lue(s)
              </div>
              <v-btn color="primary" variant="tonal" class="mt-6 font-weight-bold" :to="{ name: 'admin-sgi-notifications' }">
                Consulter la boîte de réception
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .pulse-animation {
    animation: none;
  }
}
</style>
