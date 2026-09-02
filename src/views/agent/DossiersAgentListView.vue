<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Filter, FileText, ArrowRight, Hand } from '@lucide/vue'

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
  <v-container fluid class="page-container pa-6 pa-md-8">
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <FileText :size="28" />
          </div>
          Base des Dossiers
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Consultez et instruisez les demandes d'ouverture de compte.
        </p>
      </div>
    </div>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ erreur }}
    </v-alert>

    <!-- Barre de filtres stylisée -->
    <v-card class="rounded-xl elevation-2 mb-8 border bg-surface-variant">
      <v-card-text class="pa-4 pa-md-6 d-flex flex-wrap align-center gap-3">
        <div class="d-flex align-center mr-4 text-medium-emphasis">
          <Filter :size="18" class="mr-2" />
          <span class="font-weight-medium text-body-2 text-uppercase tracking-wider">Statuts</span>
        </div>
        
        <v-chip
          v-for="statut in statutsAffiches"
          :key="statut"
          class="font-weight-bold px-4 hover-lift"
          :color="filtresStatut.includes(statut) ? COULEURS_STATUT[statut] : 'grey-darken-1'"
          :variant="filtresStatut.includes(statut) ? 'flat' : 'outlined'"
          @click="basculerFiltre(statut)"
        >
          <v-icon v-if="filtresStatut.includes(statut)" icon="mdi-check" size="14" class="mr-1" />
          {{ LIBELLES_STATUT[statut] }}
        </v-chip>
      </v-card-text>
    </v-card>

    <v-card class="rounded-xl elevation-2 overflow-hidden border">
      <v-progress-linear v-if="chargement" indeterminate color="primary" />
      
      <v-alert
        v-if="!chargement && !liste.length"
        type="info"
        variant="tonal"
        class="ma-6 mb-6 border-l-4"
      >
        Aucun dossier trouvé{{ filtresStatut.length ? ' pour ces filtres' : '' }}.
      </v-alert>

      <v-list v-else lines="two" class="bg-transparent pa-0">
        <template v-for="(dossier, index) in liste" :key="dossier.id">
          <v-divider v-if="index > 0" />
          <v-list-item
            class="px-4 py-4 px-md-6 hover-row cursor-pointer"
            @click="router.push({ name: props.routeDetail, params: { id: dossier.id } })"
          >
            <template #prepend>
              <v-avatar :color="COULEURS_STATUT[dossier.statut] + '-lighten-4'" class="mr-4 text-center">
                <FileText :size="20" :class="`text-${COULEURS_STATUT[dossier.statut]}-darken-2`" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold text-body-1 mb-1">
              {{ dossier.reference }}
            </v-list-item-title>
            
            <v-list-item-subtitle class="text-body-2">
              <span class="font-weight-medium text-on-surface">{{ dossier.investisseur_email }}</span>
              <template v-if="dossier.date_soumission">
                <span class="mx-2">•</span>
                Soumis le {{ formaterJour(dossier.date_soumission) }}
              </template>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center flex-wrap justify-end gap-3" style="min-width: 250px;">
                <v-chip 
                  size="small" 
                  :color="COULEURS_STATUT[dossier.statut]" 
                  variant="flat"
                  class="font-weight-bold shadow-sm"
                >
                  {{ LIBELLES_STATUT[dossier.statut] }}
                </v-chip>
                
                <v-btn
                  v-if="dossier.statut === 'SOUMIS'"
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold"
                  @click.stop="prendreEnChargeDossier(dossier.id)"
                >
                  <Hand :size="14" class="mr-1" /> Assigner
                </v-btn>
                
                <ArrowRight :size="18" class="text-grey-lighten-1 ml-2 d-none d-sm-block" />
              </div>
            </template>
          </v-list-item>
        </template>
      </v-list>

      <v-divider />
      <div class="pa-4 bg-surface-variant">
        <v-pagination
          v-if="pages > 1"
          v-model="page"
          :length="pages"
          :total-visible="5"
          active-color="primary"
          rounded="circle"
        />
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.gap-3 {
  gap: 12px;
}

.hover-row {
  transition: background-color 0.2s ease;
}
.hover-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.hover-lift {
  transition: transform 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}
</style>