<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Filter, FileText, ArrowRight, Hand } from '@lucide/vue'

import { listeDossiers, prendreEnCharge } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import EntetePage from '@/components/commun/EntetePage.vue'
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

const priseEnChargeEnCours = ref<string | null>(null)

async function prendreEnChargeDossier(id: string) {
  // Garde anti double-clic : le second POST échouerait (409) sans
  // explication pour l'utilisateur.
  if (priseEnChargeEnCours.value) return
  priseEnChargeEnCours.value = id
  erreur.value = ''
  try {
    await prendreEnCharge(id)
    await charger()
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    priseEnChargeEnCours.value = null
  }
}

watch([filtresStatut, page], () => void charger())

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <EntetePage :icone="FileText" titre="Base des Dossiers" sous-titre="Consultez et instruisez les demandes d'ouverture de compte." />

    <v-alert v-if="erreur" type="error" variant="tonal" border="start" class="mb-6">
      {{ erreur }}
    </v-alert>

    <!-- Barre de filtres stylisée -->
    <v-card class="glass-panel mb-8">
      <v-card-text class="pa-4 pa-md-6 d-flex flex-wrap align-center gap-3">
        <div class="d-flex align-center mr-4 text-medium-emphasis">
          <Filter :size="18" class="mr-2" />
          <span class="font-weight-medium text-body-2 text-uppercase tracking-wider">Statuts</span>
        </div>
        
        <v-chip
          v-for="statut in statutsAffiches"
          :key="statut"
          class="font-weight-bold px-4"
          :color="filtresStatut.includes(statut) ? COULEURS_STATUT[statut] : 'default'"
          :variant="filtresStatut.includes(statut) ? 'flat' : 'tonal'"
          @click="basculerFiltre(statut)"
        >
          <v-icon v-if="filtresStatut.includes(statut)" icon="mdi-check" size="14" class="mr-1" />
          {{ LIBELLES_STATUT[statut] }}
        </v-chip>
      </v-card-text>
    </v-card>

    <v-card class="glass-panel overflow-hidden">
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
              <v-avatar :color="COULEURS_STATUT[dossier.statut]" variant="tonal" class="mr-4">
                <FileText :size="20" />
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
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ LIBELLES_STATUT[dossier.statut] }}
                </v-chip>
                
                <v-btn
                  v-if="dossier.statut === 'SOUMIS'"
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold"
                  :loading="priseEnChargeEnCours === dossier.id"
                  :disabled="priseEnChargeEnCours !== null"
                  @click.stop="prendreEnChargeDossier(dossier.id)"
                >
                  <Hand :size="14" class="mr-1" /> Assigner
                </v-btn>
                
                <ArrowRight :size="18" class="text-medium-emphasis ml-2 d-none d-sm-block" />
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

.gap-3 {
  gap: 12px;
}
</style>