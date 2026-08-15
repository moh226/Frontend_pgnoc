<script setup lang="ts">
import { computed, onMounted } from 'vue'

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
  <v-container fluid>
    <v-alert v-if="notifications.erreur" type="error" variant="tonal" class="mb-4">
      {{ notifications.erreur }}
    </v-alert>

    <v-card-title class="text-h6 pa-0 mb-3">Notifications</v-card-title>

    <v-card>
      <v-progress-linear v-if="notifications.chargement" indeterminate />
      <v-alert
        v-if="!notifications.chargement && !chronologiques.length"
        type="info"
        variant="tonal"
        class="ma-4 mb-0"
      >
        Aucune notification.
      </v-alert>
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
              <v-chip size="small" color="primary">Non lue</v-chip>
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