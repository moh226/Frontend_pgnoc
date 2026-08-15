<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { listeDossiers, prendreEnCharge } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import type { DossierListeItem, StatutDossier } from '@/types'
import { formaterJour } from '@/utils/format'

const router = useRouter()

const props = withDefaults(
  defineProps<{ routeDetail?: string }>(),
  { routeDetail: 'agent-dossier-detail' },
)

const filtresStatut = ref<StatutDossier[]>([])
const page = ref(1)
const parPage = 10

const liste = ref<DossierListeItem[]>([])
const total = ref(0)
const chargement = ref(false)
const erreur = ref('')

const statutsAffiches: StatutDossier[] = ['SOUMIS', 'EN_INSTRUCTION', 'VALIDE', 'REJETE']
const pages = ref(1)

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    const reponse = await listeDossiers({
      statut: filtresStatut.value,
      page: page.value,
      page_size: parPage,
    })
    liste.value = reponse.results
    total.value = reponse.count
    pages.value = Math.max(1, Math.ceil(reponse.count / parPage))
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

async function prendreEnChargeDossier(id: string) {
  erreur.value = ''
  try {
    await prendreEnCharge(id)
    await charger()
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  }
}

watch([filtresStatut, page], () => void charger())

onMounted(() => void charger())
</script>

<template>
  <v-container fluid>
    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-4">
      {{ erreur }}
    </v-alert>

    <div class="d-flex flex-wrap align-center mb-4">
      <span class="text-h6 mr-3">Dossiers de la SGI</span>
      <v-chip
        v-for="statut in statutsAffiches"
        :key="statut"
        class="mr-2"
        :color="filtresStatut.includes(statut) ? COULEURS_STATUT[statut] : undefined"
        :variant="filtresStatut.includes(statut) ? 'flat' : 'tonal'"
        @click="basculerFiltre(statut)"
      >
        {{ LIBELLES_STATUT[statut] }}
      </v-chip>
    </div>

    <v-card>
      <v-progress-linear v-if="chargement" indeterminate />
      <v-alert
        v-if="!chargement && !liste.length"
        type="info"
        variant="tonal"
        class="ma-4 mb-0"
      >
        Aucun dossier{{ filtresStatut.length ? ' pour ces filtres' : '' }}.
      </v-alert>
      <v-list v-else density="comfortable">
        <v-list-item
          v-for="dossier in liste"
          :key="dossier.id"
          @click="router.push({ name: props.routeDetail, params: { id: dossier.id } })"
        >
          <template #prepend>
            <v-icon icon="mdi-file-document-outline" color="primary" />
          </template>
          <v-list-item-title class="font-weight-medium">{{ dossier.reference }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ dossier.investisseur_email }}
            <template v-if="dossier.date_soumission">
              — soumis le {{ formaterJour(dossier.date_soumission) }}
            </template>
          </v-list-item-subtitle>
          <template #append>
            <div class="d-flex align-center ga-2" style="min-width: 200px">
              <v-chip size="small" :color="COULEURS_STATUT[dossier.statut]" variant="tonal">
                {{ LIBELLES_STATUT[dossier.statut] }}
              </v-chip>
              <v-btn
                v-if="dossier.statut === 'SOUMIS'"
                size="small"
                color="primary"
                variant="flat"
                @click.stop="prendreEnChargeDossier(dossier.id)"
              >
                Prendre en charge
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
      <v-pagination
        v-if="pages > 1"
        v-model="page"
        :length="pages"
        :total-visible="5"
        class="my-4"
      />
    </v-card>
  </v-container>
</template>