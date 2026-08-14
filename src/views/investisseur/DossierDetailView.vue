<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { etapesKyc, urlFichierValeur } from '@/api/dossiers'
import { ficheSgi } from '@/api/sgi'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useDossiersStore } from '@/stores/dossiers'
import type { ChampKyc, FicheSgi } from '@/types'
import { formaterDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const dossiers = useDossiersStore()

const id = computed(() => String(route.params.id))

const fiche = ref<FicheSgi | null>(null)
const champsParId = ref(new Map<string, ChampKyc>())
const chargementFiche = ref(false)

async function chargerComplement() {
  if (!dossiers.detail) return
  chargementFiche.value = true
  try {
    const [reponseFiche, reponseEtapes] = await Promise.all([
      ficheSgi(dossiers.detail.sgi),
      etapesKyc(dossiers.detail.sgi),
    ])
    fiche.value = reponseFiche
    const carte = new Map<string, ChampKyc>()
    for (const etape of reponseEtapes.results) {
      for (const champ of etape.champs) carte.set(champ.id, champ)
    }
    champsParId.value = carte
  } finally {
    chargementFiche.value = false
  }
}

function nomDuChamp(id: string): string {
  return champsParId.value.get(id)?.nom ?? id.slice(0, 8)
}

onMounted(async () => {
  await dossiers.chargerDetail(id.value)
  await chargerComplement()
})
</script>

<template>
  <v-container fluid>
    <v-btn variant="text" color="primary" class="mb-2" @click="router.back()">
      <v-icon icon="mdi-arrow-left" class="mr-1" /> Retour
    </v-btn>

    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-4">
      {{ dossiers.erreur }}
    </v-alert>

    <template v-if="dossiers.detail">
      <v-card class="mb-4">
        <v-card-title class="d-flex align-center flex-wrap">
          <span class="font-display">{{ dossiers.detail.reference }}</span>
          <v-chip
            :color="COULEURS_STATUT[dossiers.detail.statut]"
            variant="tonal"
            class="ml-3"
          >
            {{ LIBELLES_STATUT[dossiers.detail.statut] }}
          </v-chip>
          <v-chip variant="tonal" class="ml-2">Version {{ dossiers.detail.version }}</v-chip>
          <v-spacer />
          <span class="text-caption text-medium-emphasis">
            {{ dossiers.detail.investisseur_email }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="dossiers.detail.statut === 'REJETE' && dossiers.detail.motif_rejet"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            Motif du rejet : {{ dossiers.detail.motif_rejet }}
          </v-alert>

          <div class="d-flex align-center mb-2">
            <span class="text-body-2 mr-3">Progression</span>
            <v-progress-linear
              :model-value="dossiers.detail.progression_pct"
              height="8"
              rounded
              class="flex-grow-1"
            />
            <span class="text-body-2 ml-3 font-weight-medium">
              {{ dossiers.detail.progression_pct }}%
            </span>
          </div>

          <v-row class="mt-2">
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Créé le</div>
              <div>{{ formaterDate(dossiers.detail.date_creation) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Soumis le</div>
              <div>{{ formaterDate(dossiers.detail.date_soumission) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Agent en charge</div>
              <div>{{ dossiers.detail.agent_email || 'Non assigné' }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Signature</div>
              <div>
                {{
                  dossiers.detail.type_signature
                    ? `${dossiers.detail.type_signature}${dossiers.detail.date_signature ? ' le ' + formaterDate(dossiers.detail.date_signature) : ''}`
                    : 'Non signé'
                }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" lg="5">
          <v-card>
            <v-card-title>
              <v-avatar size="36" color="primary" variant="tonal" class="mr-3">
                <v-icon icon="mdi-bank-outline" />
              </v-avatar>
              {{ fiche?.nom ?? 'Société de gestion' }}
            </v-card-title>
            <v-card-text>
              <v-skeleton-loader v-if="chargementFiche" type="paragraph" />
              <template v-else>
                <div class="text-caption text-medium-emphasis mb-1">
                  Code : {{ fiche?.code_sgi ?? '—' }}
                </div>
                <p v-if="fiche?.presentation" class="text-body-2 mt-2">
                  {{ fiche.presentation }}
                </p>
                <v-divider class="my-3" />
                <template v-if="fiche?.convention.titre">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-file-pdf-box" color="error" class="mr-2" />
                    <span class="font-weight-medium">{{ fiche.convention.titre }}</span>
                  </div>
                  <v-chip
                    :color="fiche.convention.signe_requis ? 'warning' : 'success'"
                    variant="tonal"
                    size="small"
                    class="mt-2"
                  >
                    {{
                      fiche.convention.signe_requis
                        ? 'Signature requise avant soumission'
                        : 'Convention validée par la SGI'
                    }}
                  </v-chip>
                </template>
                <v-alert v-else type="info" variant="tonal" class="mb-0">
                  Aucune convention déposée par cette SGI pour le moment.
                </v-alert>
              </template>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="7">
          <v-card>
            <v-card-title>Valeurs du parcours KYC</v-card-title>
            <v-card-text>
              <v-alert
                v-if="!dossiers.detail.valeurs_champs.length"
                type="info"
                variant="tonal"
                class="mb-0"
              >
                Aucune valeur saisie pour le moment.
              </v-alert>
              <v-table v-else>
                <thead>
                  <tr>
                    <th>Champ</th>
                    <th>Valeur</th>
                    <th>Commentaire agent</th>
                    <th>Maj</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="valeur in dossiers.detail.valeurs_champs" :key="valeur.id">
                    <td>
                      {{ nomDuChamp(valeur.champ) }}
                      <v-tooltip v-if="valeur.est_corrige" text="Corrigé après demande de l'agent">
                        <template #activator="{ props }">
                          <v-icon v-bind="props" icon="mdi-alert-circle-check" color="warning" size="16" />
                        </template>
                      </v-tooltip>
                    </td>
                    <td>
                      <template v-if="valeur.fichier">
                        <v-btn
                          variant="text"
                          color="primary"
                          size="small"
                          :href="urlFichierValeur(dossiers.detail.id, valeur.id)"
                          target="_blank"
                        >
                          <v-icon icon="mdi-download" class="mr-1" /> Document
                        </v-btn>
                      </template>
                      <template v-else>{{ valeur.valeur || '—' }}</template>
                    </td>
                    <td>{{ valeur.commentaire_agent || '—' }}</td>
                    <td>{{ formaterDate(valeur.date_maj) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-progress-linear v-else-if="dossiers.detailChargement" indeterminate class="mt-4" />
  </v-container>
</template>