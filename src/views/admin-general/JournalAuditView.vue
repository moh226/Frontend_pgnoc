<script setup lang="ts">
import { onMounted, ref } from 'vue'

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
  <v-container fluid>
    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-4">
      {{ erreur }}
    </v-alert>

    <div class="d-flex flex-wrap align-center ga-2 mb-4">
      <span class="text-h6">Journal d'audit</span>
      <v-spacer />
      <v-select
        v-model="filtreAction"
        :items="ACTIONS_AUDIT.map((a) => ({ value: a, title: LIBELLES_ACTION_AUDIT[a] }))"
        label="Action"
        variant="outlined"
        density="compact"
        clearable
        class="filtre"
        @update:model-value="page = 1; charger()"
      />
      <v-text-field
        v-model="filtreEmail"
        label="Email de l'auteur"
        variant="outlined"
        density="compact"
        clearable
        class="filtre"
        @update:model-value="page = 1; charger()"
      />
      <v-btn color="primary" variant="tonal" :loading="exportEnCours" @click="exporter">
        <v-icon icon="mdi-download" class="mr-1" /> Export CSV
      </v-btn>
    </div>

    <v-card>
      <v-progress-linear v-if="chargement" indeterminate />
      <v-alert
        v-if="!chargement && !entrees.length"
        type="info"
        variant="tonal"
        class="ma-4 mb-0"
      >
        Aucune trace pour ces critères.
      </v-alert>
      <v-table v-else>
        <thead>
          <tr>
            <th>Date</th>
            <th>Auteur</th>
            <th>Action</th>
            <th>Entité</th>
            <th>Changement</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entree in entrees" :key="entree.id">
            <td class="whitespace-nowrap">{{ formaterDate(entree.date_action) }}</td>
            <td>{{ entree.utilisateur_email || '—' }}</td>
            <td>{{ entree.action_libelle }}</td>
            <td>
              {{ entree.entite_concernee || '—' }}
              <span v-if="entree.entite_id" class="text-caption text-medium-emphasis">
                {{ entree.entite_id.slice(0, 8) }}
              </span>
            </td>
            <td>
              <span
                v-if="entree.avant || entree.apres"
                class="text-caption"
                :title="`Avant : ${afficherDiff(entree.avant)}\nAprès : ${afficherDiff(entree.apres)}`"
              >
                {{ afficherDiff(entree.apres).slice(0, 60) || '—' }}
              </span>
              <span v-else>—</span>
            </td>
            <td class="text-caption text-medium-emphasis">{{ entree.ip_address || '—' }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-if="pages > 1"
        v-model="page"
        :length="pages"
        :total-visible="5"
        class="my-4"
        @update:model-value="charger"
      />
    </v-card>
  </v-container>
</template>

<style scoped>
.filtre {
  max-width: 240px;
}
.whitespace-nowrap {
  white-space: nowrap;
}
</style>