<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BellRing, CheckCircle2 } from '@lucide/vue'

import { useNotificationsStore } from '@/stores/notifications'
import { formaterDate } from '@/utils/format'

const notifications = useNotificationsStore()

const ICONES_PAR_TYPE: Record<string, string> = {
  DOSSIER: 'mdi-folder-outline',
  CONVENTION: 'mdi-file-pdf-box',
  UTILISATEUR: 'mdi-account-outline',
  OTP: 'mdi-shield-key-outline',
}

function iconePour(type: string): string {
  return ICONES_PAR_TYPE[type] ?? 'mdi-bell-outline'
}

const chronologiques = computed(() =>
  [...notifications.notifications].sort(
    (a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime(),
  ),
)

onMounted(() => void notifications.charger())
</script>

<template>
  <v-container fluid class="pa-6 pa-md-8">
    <div class="d-flex flex-column mb-8">
      <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
        <div class="icon-box pa-2 mr-4">
          <BellRing :size="28" />
        </div>
        Notifications
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Vos alertes et messages liés à l'activité de vos dossiers.
      </p>
    </div>

    <v-alert v-if="notifications.erreur" type="error" variant="tonal" border="start" class="mb-6">
      {{ notifications.erreur }}
    </v-alert>

    <v-card class="glass-panel">
      <v-progress-linear v-if="notifications.chargement" indeterminate />

      <div
        v-if="!notifications.chargement && !chronologiques.length"
        class="empty-state"
      >
        <div class="empty-state-icon">
          <CheckCircle2 :size="34" />
        </div>
        <div class="text-h6 font-weight-medium mb-1">Aucune notification</div>
        <div class="text-body-2 text-medium-emphasis">
          Vous serez prévenu ici dès qu'une action concerne vos dossiers.
        </div>
      </div>

      <v-list v-else density="comfortable">
        <v-list-item
          v-for="notification in chronologiques"
          :key="notification.id"
          :class="{ 'item-non-lue': !notification.lue }"
        >
          <template #prepend>
            <v-icon :icon="iconePour(notification.type_notif)" color="primary" />
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ notification.titre }}
          </v-list-item-title>
          <v-list-item-subtitle class="mt-1">
            {{ notification.message }}
            <span class="text-caption text-medium-emphasis ml-2">
              {{ formaterDate(notification.date_creation) }}
            </span>
          </v-list-item-subtitle>
          <template #append>
            <div v-if="!notification.lue" class="d-flex align-center ga-2">
              <v-chip size="small" color="primary" variant="tonal">Non lue</v-chip>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="notifications.marquerCommeLue(notification.id)"
              >
                Marquer comme lue
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <div v-if="notifications.aPlus" class="text-center pa-4">
        <v-btn
          color="primary"
          variant="tonal"
          :loading="notifications.chargementPlus"
          @click="notifications.chargerPlus()"
        >
          <v-icon icon="mdi-chevron-down" class="mr-1" /> Charger plus
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.item-non-lue {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
