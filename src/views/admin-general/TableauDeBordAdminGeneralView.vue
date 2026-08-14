<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { LIBELLES_ACTION_AUDIT } from '@/config/audit'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { LIBELLES_ROLE } from '@/config/navigation'
import { useAdminStore } from '@/stores/admin'
import { useNotificationsStore } from '@/stores/notifications'
import type { StatutDossier } from '@/types'
import { formaterHeure, formaterJour } from '@/utils/format'

const admin = useAdminStore()
const notifications = useNotificationsStore()

const statuts = Object.keys(LIBELLES_STATUT) as StatutDossier[]

const avoirsStatut = computed(() => generateurStats())

function generateurStats() {
  const modeles = (admin.tableauDeBord?.dossiers.par_statut ?? {}) as Partial<
    Record<StatutDossier, number>
  >
  const resultat: number[] = []
  for (const statut of statuts) {
    resultat.push(Number(modeles[statut] ?? 0))
  }
  return resultat
}

function roleLibelle(role: string): string {
  return LIBELLES_ROLE[role as keyof typeof LIBELLES_ROLE] ?? role
}

onMounted(async () => {
  await Promise.all([admin.chargerTableauDeBord(), notifications.chargerCompte()])
})
</script>

<template>
  <v-container fluid>
    <v-alert v-if="admin.erreur" type="error" variant="tonal" class="mb-4">
      {{ admin.erreur }}
    </v-alert>

    <template v-if="admin.tableauDeBord">
      <v-row>
        <v-col cols="12" sm="6" lg="3">
          <v-card class="pa-4" variant="tonal">
            <v-card-title class="text-h6 d-flex align-center">
              <v-icon icon="mdi-folder-multiple-outline" class="mr-2" color="primary" />
              Dossiers
            </v-card-title>
            <v-card-text class="text-h4 font-display">
              {{ admin.tableauDeBord.dossiers.total }}
            </v-card-text>
            <v-card-text class="pa-0 text-caption text-medium-emphasis">
              {{ admin.tableauDeBord.dossiers.soumis_aujourd_hui }} soumis aujourd'hui
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card class="pa-4" variant="tonal">
            <v-card-title class="text-h6 d-flex align-center">
              <v-icon icon="mdi-bank-outline" class="mr-2" color="primary" />
              SGI partenaires
            </v-card-title>
            <v-card-text class="text-h4 font-display">
              {{ admin.tableauDeBord.sgi.actives }}
              <span class="text-body-2 text-medium-emphasis">/ {{ admin.tableauDeBord.sgi.total }}</span>
            </v-card-text>
            <v-card-text class="pa-0 text-caption" :class="admin.tableauDeBord.sgi.sans_convention_publiee ? 'text-warning' : 'text-medium-emphasis'">
              {{ admin.tableauDeBord.sgi.sans_convention_publiee }} sans convention publiée
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card class="pa-4" variant="tonal">
            <v-card-title class="text-h6 d-flex align-center">
              <v-icon icon="mdi-account-group-outline" class="mr-2" color="primary" />
              Comptes
            </v-card-title>
            <v-card-text class="text-h4 font-display">
              {{ admin.tableauDeBord.utilisateurs.actifs }}
              <span class="text-body-2 text-medium-emphasis">/ {{ admin.tableauDeBord.utilisateurs.total }}</span>
            </v-card-text>
            <v-card-text class="pa-0">
              <v-chip
                v-for="(effectif, role) in admin.tableauDeBord.utilisateurs.par_role"
                :key="role"
                size="small"
                variant="tonal"
                class="mr-1 mb-1"
              >
                {{ roleLibelle(role) }} : {{ effectif }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card class="pa-4" variant="tonal">
            <v-card-title class="text-h6 d-flex align-center">
              <v-icon icon="mdi-bell-outline" class="mr-2" color="primary" />
              Notifications
            </v-card-title>
            <v-card-text class="text-h4 font-display">
              {{ notifications.compteNonLues }}
            </v-card-text>
            <v-btn variant="text" color="primary" size="small" :to="{ name: 'admin-general-notifications' }">
              Voir tout
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" lg="5">
          <v-card>
            <v-card-title>Dossiers par statut</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="(statut, index) in statuts" :key="statut">
                  <template #prepend>
                    <v-icon :icon="'mdi-circle'" :color="COULEURS_STATUT[statut]" size="10" class="mr-2" />
                  </template>
                  <v-list-item-title>
                    {{ LIBELLES_STATUT[statut] }}
                  </v-list-item-title>
                  <template #append>
                    <span class="text-h6 font-display">{{ avoirsStatut[index] }}</span>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="7">
          <v-card>
            <v-card-title class="d-flex align-center">
              Activité récente (journal d'audit)
              <v-spacer />
              <v-btn variant="text" color="primary" :to="{ name: 'admin-general-journal' }">
                Journal complet
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(trace, index) in admin.tableauDeBord.activite_recente"
                  :key="index"
                >
                  <template #prepend>
                    <v-icon icon="mdi-history" color="primary" />
                  </template>
                  <v-list-item-title>
                    {{ LIBELLES_ACTION_AUDIT[trace.action] ?? trace.action }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ trace.email || '—' }}
                    <template v-if="trace.entite_concernee">
                      — {{ trace.entite_concernee }}
                      <span class="text-caption">{{ trace.entite_id?.slice(0, 8) }}</span>
                    </template>
                  </v-list-item-subtitle>
                  <template #append>
                    <span class="text-caption text-medium-emphasis">
                      {{ formaterJour(trace.date) }} {{ formaterHeure(trace.date) }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
              <v-alert
                v-if="!admin.tableauDeBord.activite_recente.length"
                type="info"
                variant="tonal"
                class="mb-0"
              >
                Aucune activité récente.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-progress-linear v-else indeterminate class="mt-4" />
  </v-container>
</template>