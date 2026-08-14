<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { conventionSgi, publierConvention } from '@/api/sgiAdmin'
import { extraireMessageErreur } from '@/api/client'
import type { ConventionSgi } from '@/types'
import { formaterDate } from '@/utils/format'

const convention = ref<ConventionSgi | null>(null)
const chargement = ref(false)
const erreur = ref('')

const titre = ref('')
const fichier = ref<File | null>(null)
const envoiEnCours = ref(false)
const succes = ref('')

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    convention.value = await conventionSgi()
    titre.value = convention.value.titre
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

async function publier() {
  if (!fichier.value && !titre.value.trim()) return
  envoiEnCours.value = true
  erreur.value = ''
  succes.value = ''
  try {
    convention.value = await publierConvention({
      titre: titre.value.trim() || undefined,
      fichier_pdf: fichier.value ?? undefined,
    })
    fichier.value = null
    succes.value = 'Convention publiée avec succès.'
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    envoiEnCours.value = false
  }
}

onMounted(() => void charger())
</script>

<template>
  <v-container fluid>
    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-4">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="succes" type="success" variant="tonal" class="mb-4">
      {{ succes }}
    </v-alert>

    <v-row>
      <v-col cols="12" lg="7">
        <v-card>
          <v-card-title>Convention tarifaire de la SGI</v-card-title>
          <v-card-text>
            <v-progress-linear v-if="chargement" indeterminate class="mb-3" />
            <template v-else>
              <v-text-field
                v-model="titre"
                label="Titre de la convention"
                variant="outlined"
                class="mb-3"
              />
              <v-file-input
                :model-value="fichier"
                label="Fichier PDF (max 10 Mo)"
                accept="application/pdf,.pdf"
                variant="outlined"
                class="mb-3"
                @update:model-value="(f) => (fichier = Array.isArray(f) ? f[0] ?? null : f)"
              />
              <v-btn
                color="primary"
                variant="flat"
                :loading="envoiEnCours"
                :disabled="!fichier && !titre.trim()"
                @click="publier"
              >
                <v-icon icon="mdi-cloud-upload" class="mr-1" /> Publier la convention
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card>
          <v-card-title>Convention actuelle</v-card-title>
          <v-card-text>
            <v-alert
              v-if="convention && !convention.fichier"
              type="info"
              variant="tonal"
              class="mb-0"
            >
              Aucun fichier publié : la signature de convention n'est pas exigée des
              investisseurs pour le moment.
            </v-alert>
            <template v-else-if="convention">
              <v-list-item prepend-icon="mdi-file-pdf-box" class="px-0">
                <v-list-item-title class="font-weight-medium">{{
                  convention.titre || 'Convention tarifaire'
                }}</v-list-item-title>
                <v-list-item-subtitle>
                  Publiée le {{ formaterDate(convention.date_publication) }}
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    v-if="convention.url_signee"
                    variant="text"
                    color="primary"
                    :href="convention.url_signee"
                    target="_blank"
                  >
                    Voir le PDF
                  </v-btn>
                </template>
              </v-list-item>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>