<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { listeDossiers } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { COULEURS_STATUT, LIBELLES_STATUT, STATUTS_DOSSIER } from '@/config/statuts'
import type { DossierListeItem, StatutDossier } from '@/types'
import { formaterJour } from '@/utils/format'

const router = useRouter()

const dossiers = ref<DossierListeItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSuivante = ref(false)
const pagePrecedente = ref(false)
const chargement = ref(false)
const erreur = ref('')
const filtresStatut = ref<StatutDossier[]>([])

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    const reponse = await listeDossiers({ statut: filtresStatut.value, page: page.value })
    dossiers.value = reponse.results
    total.value = reponse.count
    pageSuivante.value = Boolean(reponse.next)
    pagePrecedente.value = Boolean(reponse.previous)
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

function basculerFiltre(statut: StatutDossier) {
  filtresStatut.value = filtresStatut.value.includes(statut)
    ? filtresStatut.value.filter((s) => s !== statut)
    : [...filtresStatut.value, statut]
  page.value = 1
}

watch([filtresStatut, page], () => void charger())

onMounted(() => void charger())
</script>

<template>
  <v-container fluid>
    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-4">{{ erreur }}</v-alert>

    <v-card-title class="text-h6 pa-0 mb-3">Mes dossiers ({{ total }})</v-card-title>

    <div class="mb-3 d-flex flex-wrap ga-2">
      <v-chip
        v-for="statut in STATUTS_DOSSIER"
        :key="statut"
        :color="COULEURS_STATUT[statut]"
        :variant="filtresStatut.includes(statut) ? 'flat' : 'tonal'"
        filter
        :model-value="filtresStatut.includes(statut)"
        @click="basculerFiltre(statut)"
      >
        {{ LIBELLES_STATUT[statut] }}
      </v-chip>
    </div>

    <v-card>
      <v-progress-linear v-if="chargement" indeterminate />
      <v-table>
        <thead>
          <tr>
            <th>Référence</th>
            <th>Statut</th>
            <th>Progression</th>
            <th>Créé le</th>
            <th>Dernière soumission</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dossier in dossiers"
            :key="dossier.id"
            class="ligne-cliquable"
            @click="router.push({ name: 'investisseur-dossier-detail', params: { id: dossier.id } })"
          >
            <td class="font-weight-medium text-primary">{{ dossier.reference }}</td>
            <td>
              <v-chip size="small" :color="COULEURS_STATUT[dossier.statut]" variant="tonal">
                {{ LIBELLES_STATUT[dossier.statut] }}
              </v-chip>
            </td>
            <td>
              <div class="d-flex align-center ga-2" style="max-width: 200px">
                <v-progress-linear
                  :model-value="dossier.progression_pct"
                  height="6"
                  rounded
                  class="flex-grow-1"
                />
                <span class="text-caption">{{ dossier.progression_pct }}%</span>
              </div>
            </td>
            <td>{{ formaterJour(dossier.date_creation) }}</td>
            <td>{{ formaterJour(dossier.date_soumission) }}</td>
          </tr>
          <tr v-if="!chargement && !dossiers.length">
            <td colspan="5">
              <v-alert type="info" variant="tonal" class="mb-0">
                Aucun dossier ne correspond à ces critères.
              </v-alert>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-card-actions v-if="pagePrecedente || pageSuivante">
        <v-btn variant="text" :disabled="!pagePrecedente" @click="page -= 1">
          <v-icon icon="mdi-chevron-left" /> Précédent
        </v-btn>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">Page {{ page }}</span>
        <v-spacer />
        <v-btn variant="text" :disabled="!pageSuivante" @click="page += 1">
          Suivant <v-icon icon="mdi-chevron-right" />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.ligne-cliquable {
  cursor: pointer;
}

.ligne-cliquable:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
}
</style>