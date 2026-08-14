<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { presentationSgi, publierPresentation } from '@/api/sgiAdmin'
import { extraireMessageErreur } from '@/api/client'
import type { PresentationSgi } from '@/types'
import { formaterDate } from '@/utils/format'

const presentation = ref<PresentationSgi | null>(null)
const contenu = ref('')
const chargement = ref(false)
const erreur = ref('')
const succes = ref('')
const envoiEnCours = ref(false)

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    presentation.value = await presentationSgi()
    contenu.value = presentation.value.contenu
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

async function publier() {
  envoiEnCours.value = true
  erreur.value = ''
  succes.value = ''
  try {
    presentation.value = await publierPresentation(contenu.value)
    succes.value = 'Présentation publiée avec succès.'
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

      <v-card>
        <v-card-title>Présentation de la SGI</v-card-title>
        <v-card-text>
          <v-progress-linear v-if="chargement" indeterminate class="mb-3" />
          <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-3">
              Ce contenu est affiché aux investisseurs sur la fiche publique de la SGI.
            </p>
            <v-textarea
              v-model="contenu"
              label="Présentation (marketing)"
              variant="outlined"
              rows="6"
              counter
              class="mb-3"
            />
            <div class="d-flex align-center ga-3">
              <v-btn
                color="primary"
                variant="flat"
                :loading="envoiEnCours"
                :disabled="!contenu.trim() || contenu === presentation?.contenu"
                @click="publier"
              >
                <v-icon icon="mdi-cloud-upload" class="mr-1" /> Publier
              </v-btn>
              <span v-if="presentation?.date_publication" class="text-caption text-medium-emphasis">
                Dernière publication : {{ formaterDate(presentation.date_publication) }}
              </span>
            </div>
          </template>
        </v-card-text>
      </v-card>
  </v-container>
</template>