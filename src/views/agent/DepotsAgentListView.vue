<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Filter, Wallet, ArrowRight } from '@lucide/vue'

import { listeDepotsAgent } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import EntetePage from '@/components/commun/EntetePage.vue'
import { COULEURS_DEPOT, LIBELLES_DEPOT, STATUTS_DEPOT } from '@/config/depots'
import type { DepotMinimumDetail, StatutDepot } from '@/types'
import { formaterJour } from '@/utils/format'

const router = useRouter()

const props = withDefaults(
  defineProps<{ routeDetail?: string }>(),
  { routeDetail: 'agent-depot-detail' },
)

const filtresStatut = ref<StatutDepot[]>([])
const liste = ref<DepotMinimumDetail[]>([])
const chargement = ref(false)
const erreur = ref('')

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    const reponse = await listeDepotsAgent(
      filtresStatut.value.length ? { statut: filtresStatut.value } : {},
    )
    liste.value = reponse.results
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

function basculerFiltre(statut: StatutDepot) {
  filtresStatut.value = filtresStatut.value.includes(statut)
    ? filtresStatut.value.filter((s) => s !== statut)
    : [...filtresStatut.value, statut]
}

function ouvrir(id: string) {
  void router.push({ name: props.routeDetail, params: { id } })
}

watch(filtresStatut, () => void charger())

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <EntetePage
      titre="Dépôts minimum à vérifier"
      sous-titre="Preuves de dépôt post-validation de votre SGI : approbation ou rejet."
    />

    <v-alert v-if="erreur" type="error" variant="tonal" border="start" class="mb-6">
      {{ erreur }}
    </v-alert>

    <!-- Barre de filtres stylisée (même design que Base des Dossiers) -->
    <v-card class="glass-panel mb-8">
      <v-card-text class="pa-4 pa-md-6 d-flex flex-wrap align-center gap-3">
        <div class="d-flex align-center mr-4 text-medium-emphasis">
          <Filter :size="18" class="mr-2" />
          <span class="font-weight-medium text-body-2 text-uppercase tracking-wider">Statuts</span>
        </div>

        <v-chip
          v-for="statut in STATUTS_DEPOT"
          :key="statut"
          class="font-weight-bold px-4"
          :color="filtresStatut.includes(statut) ? COULEURS_DEPOT[statut] : 'default'"
          :variant="filtresStatut.includes(statut) ? 'flat' : 'tonal'"
          @click="basculerFiltre(statut)"
        >
          <v-icon v-if="filtresStatut.includes(statut)" icon="mdi-check" size="14" class="mr-1" />
          {{ LIBELLES_DEPOT[statut] }}
        </v-chip>
      </v-card-text>
    </v-card>

    <v-card class="glass-panel overflow-hidden">
      <v-progress-linear v-if="chargement" indeterminate color="primary" />

      <v-alert v-if="!chargement && !liste.length" type="info" variant="tonal" class="ma-6 border-l-4">
        Aucun dépôt trouvé{{ filtresStatut.length ? ' pour ces filtres' : '' }}.
      </v-alert>

      <v-list v-else class="pa-0">
        <template v-for="(depot, index) in liste" :key="depot.id">
          <v-divider v-if="index > 0" />
          <v-list-item
            class="pa-4 list-item"
            @click="ouvrir(depot.id)"
          >
            <template #prepend>
              <v-avatar :color="COULEURS_DEPOT[depot.statut]" class="mr-4 rounded-lg">
                <Wallet :size="22" class="text-surface" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold d-flex align-center gap-2">
              {{ depot.dossier_reference }}
              <v-chip
                size="small"
                :color="COULEURS_DEPOT[depot.statut]"
                variant="flat"
                class="font-weight-bold ml-2"
              >
                {{ LIBELLES_DEPOT[depot.statut] }}
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle class="d-flex flex-wrap align-center gap-x-4">
              <span>{{ depot.investisseur_email }}</span>
              <span class="font-weight-medium text-primary">
                {{ Number(depot.montant_requis).toLocaleString('fr-FR') }} {{ depot.devise }}
              </span>
              <template v-if="depot.statut === 'PREUVE_DEPOSEE'">
                <span class="font-weight-medium">
                  Méthode : {{ depot.methode_paiement || '—' }}
                </span>
                <span>Déposé le {{ formaterJour(depot.date_depot) }}</span>
              </template>
              <template v-else-if="depot.commentaire_agent">
                <span>Note agent : {{ depot.commentaire_agent }}</span>
              </template>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center flex-wrap justify-end gap-3">
                <ArrowRight :size="18" class="text-medium-emphasis ml-2 d-none d-sm-block" />
              </div>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-x-4 { column-gap: 16px; }

.list-item {
  cursor: pointer;
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  transition: background-color 0.15s ease;
}

.list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>