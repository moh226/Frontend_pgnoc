<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ClipboardList, Download, Search, History } from '@lucide/vue'

import { exporterJournal, journalAudit } from '@/api/admin'
import { extraireMessageErreur } from '@/api/client'
import { ACTIONS_AUDIT, LIBELLES_ACTION_AUDIT } from '@/config/audit'
import type { EntreeJournalAudit } from '@/types'
import { formaterDate } from '@/utils/format'

const page = ref(1)
const parPage = 25
const pages = ref(1)
const entrees = ref<EntreeJournalAudit[]>([])
const chargement = ref(false)
const erreur = ref('')
const exportEnCours = ref(false)

const filtreAction = ref('')
const filtreEmail = ref('')

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    const reponse = await journalAudit({
      action: filtreAction.value || undefined,
      email: filtreEmail.value || undefined,
      page: page.value,
      page_size: parPage,
    })
    entrees.value = reponse.results
    pages.value = Math.max(1, Math.ceil(reponse.count / parPage))
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

async function exporter() {
  exportEnCours.value = true
  erreur.value = ''
  try {
    await exporterJournal({
      action: filtreAction.value || undefined,
      email: filtreEmail.value || undefined,
    })
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    exportEnCours.value = false
  }
}

function afficherDiff(donnees: Record<string, unknown> | null): string {
  if (!donnees) return '—'
  return Object.entries(donnees)
    .map(([cle, valeur]) => `${cle}: ${String(valeur)}`)
    .join(', ')
}

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    
    <!-- En-tête -->
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <ClipboardList :size="28" />
          </div>
          Journal d'Audit
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Traçabilité complète des actions effectuées sur la plateforme.
        </p>
      </div>
      <div class="mt-4 mt-md-0">
        <v-btn color="primary" variant="tonal" size="large" class="font-weight-bold hover-lift" :loading="exportEnCours" @click="exporter">
          <Download :size="18" class="mr-2" /> Exporter en CSV
        </v-btn>
      </div>
    </div>

    <!-- Barre de recherche -->
    <v-card class="rounded-xl elevation-2 mb-8 border bg-surface-variant">
      <v-card-text class="pa-4 pa-md-6 d-flex flex-wrap align-center gap-4">
        <v-select
          v-model="filtreAction"
          :items="ACTIONS_AUDIT.map((a) => ({ value: a, title: LIBELLES_ACTION_AUDIT[a] }))"
          label="Filtrer par action"
          variant="outlined"
          density="comfortable"
          clearable
          bg-color="surface"
          hide-details
          class="premium-input filtre-item"
          @update:model-value="page = 1; charger()"
        >
          <template #prepend-inner>
            <History :size="18" class="text-medium-emphasis mr-2" />
          </template>
        </v-select>
        
        <v-text-field
          v-model="filtreEmail"
          label="Rechercher un auteur par email..."
          variant="outlined"
          density="comfortable"
          clearable
          bg-color="surface"
          hide-details
          class="premium-input flex-grow-1 min-w-200"
          @update:model-value="page = 1; charger()"
        >
          <template #prepend-inner>
            <Search :size="18" class="text-medium-emphasis mr-2" />
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ erreur }}
    </v-alert>

    <!-- Tableau des logs -->
    <v-card class="rounded-xl elevation-2 overflow-hidden border">
      <v-progress-linear v-if="chargement" indeterminate color="primary" />
      
      <v-alert
        v-if="!chargement && !entrees.length"
        type="info"
        variant="tonal"
        class="ma-6 mb-6 border-l-4"
      >
        Aucune trace trouvée pour ces critères.
      </v-alert>

      <v-table v-else class="premium-table">
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-uppercase text-body-2 font-weight-bold tracking-wider px-6 py-4">Date & Heure</th>
            <th class="text-uppercase text-body-2 font-weight-bold tracking-wider px-6 py-4">Auteur</th>
            <th class="text-uppercase text-body-2 font-weight-bold tracking-wider px-6 py-4">Action</th>
            <th class="text-uppercase text-body-2 font-weight-bold tracking-wider px-6 py-4">Entité</th>
            <th class="text-uppercase text-body-2 font-weight-bold tracking-wider px-6 py-4">Modifications</th>
            <th class="text-uppercase text-body-2 font-weight-bold tracking-wider px-6 py-4 text-end">Adresse IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entree in entrees" :key="entree.id" class="table-row">
            <td class="px-6 py-4 text-body-1 font-weight-medium whitespace-nowrap">
              {{ formaterDate(entree.date_action) }}
            </td>
            <td class="px-6 py-4 text-body-1">
              <span class="font-weight-bold text-primary">{{ entree.utilisateur_email || 'Système' }}</span>
            </td>
            <td class="px-6 py-4">
              <v-chip size="small" variant="tonal" color="info" class="font-weight-bold">
                {{ entree.action_libelle }}
              </v-chip>
            </td>
            <td class="px-6 py-4 text-body-1">
              <div class="font-weight-medium">{{ entree.entite_concernee || '—' }}</div>
              <div v-if="entree.entite_id" class="text-body-2 text-medium-emphasis mt-1 text-uppercase tracking-wider">
                ID: {{ entree.entite_id.slice(0, 8) }}
              </div>
            </td>
            <td class="px-6 py-4 text-body-1">
              <v-tooltip location="bottom" max-width="400" :disabled="!entree.avant && !entree.apres">
                <template v-slot:activator="{ props }">
                  <span
                    v-bind="props"
                    class="diff-text d-inline-block text-truncate text-medium-emphasis"
                    style="max-width: 250px;"
                  >
                    <template v-if="entree.avant || entree.apres">
                      {{ afficherDiff(entree.apres) || '—' }}
                    </template>
                    <template v-else>—</template>
                  </span>
                </template>
                <div class="text-body-2">
                  <div class="text-error font-weight-bold mb-1">Avant :</div>
                  <div class="mb-2">{{ afficherDiff(entree.avant) || 'Aucun' }}</div>
                  <div class="text-success font-weight-bold mb-1">Après :</div>
                  <div>{{ afficherDiff(entree.apres) || 'Aucun' }}</div>
                </div>
              </v-tooltip>
            </td>
            <td class="px-6 py-4 text-body-2 text-medium-emphasis font-weight-medium text-end whitespace-nowrap">
              {{ entree.ip_address || '—' }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-divider />
      
      <div class="pa-4 bg-surface-variant">
        <v-pagination
          v-if="pages > 1"
          v-model="page"
          :length="pages"
          :total-visible="5"
          active-color="primary"
          rounded="circle"
          @update:model-value="charger"
        />
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.gap-4 {
  gap: 16px;
}

.min-w-200 {
  min-width: 200px;
}

.filtre-item {
  width: 250px;
  flex: none;
}
@media (max-width: 600px) {
  .filtre-item {
    width: 100%;
    flex: 1 1 100%;
  }
}

.premium-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
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
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.table-row td {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

.whitespace-nowrap {
  white-space: nowrap;
}

.diff-text {
  border-bottom: 1px dotted rgba(var(--v-theme-on-surface), 0.3);
  cursor: help;
}
</style>