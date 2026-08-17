<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BookOpen, CloudUpload, FileText, Download, CheckCircle2, AlertCircle } from '@lucide/vue'

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
  <v-container fluid class="page-container pa-6 pa-md-8">
    <div class="d-flex flex-column mb-8">
      <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
        <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
          <BookOpen :size="28" />
        </div>
        Convention Tarifaire
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Définissez le document officiel que les investisseurs devront lire et accepter.
      </p>
    </div>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="succes" type="success" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ succes }}
    </v-alert>

    <v-row>
      <v-col cols="12" lg="7">
        <v-card class="rounded-xl elevation-2 h-100">
          <v-card-title class="pa-6 border-b bg-surface-variant font-weight-bold">
            Nouvelle publication
          </v-card-title>
          <v-card-text class="pa-6">
            <v-progress-linear v-if="chargement" indeterminate color="primary" class="mb-4 rounded" />
            
            <template v-else>
              <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Informations</div>
              <v-text-field
                v-model="titre"
                label="Titre affiché aux investisseurs"
                placeholder="Ex: Convention d'Ouverture de Compte Titres"
                variant="outlined"
                class="premium-input mb-6"
                hide-details="auto"
              />
              
              <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Document PDF</div>
              
              <v-file-input
                :model-value="fichier"
                label="Fichier de la convention"
                accept="application/pdf,.pdf"
                variant="outlined"
                class="premium-file-input mb-8"
                prepend-icon=""
                @update:model-value="(f) => (fichier = Array.isArray(f) ? f[0] ?? null : f)"
              >
                <template v-slot:prepend-inner>
                  <div class="d-flex flex-column align-center justify-center w-100 py-4 text-center cursor-pointer">
                    <div class="bg-primary-lighten-5 rounded-circle pa-3 mb-2">
                      <CloudUpload :size="24" class="text-primary" />
                    </div>
                    <div class="text-body-1 font-weight-medium">Glissez ou sélectionnez un PDF</div>
                    <div class="text-caption text-medium-emphasis">Taille maximale : 10 Mo</div>
                  </div>
                </template>
              </v-file-input>
              
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                block
                class="font-weight-bold hover-lift"
                :loading="envoiEnCours"
                :disabled="!fichier && !titre.trim()"
                @click="publier"
              >
                <CloudUpload :size="18" class="mr-2" /> Publier la convention
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="rounded-xl elevation-2 h-100">
          <v-card-title class="pa-6 border-b bg-surface-variant font-weight-bold">
            Statut Actuel
          </v-card-title>
          <v-card-text class="pa-6">
            <v-progress-linear v-if="chargement" indeterminate color="primary" class="mb-4 rounded" />
            
            <template v-else>
              <div v-if="convention && !convention.fichier" class="text-center pa-8 bg-surface-variant rounded-xl border border-dashed">
                <AlertCircle :size="48" class="text-warning mb-4 mx-auto" />
                <div class="text-h6 font-weight-medium mb-2">Aucun fichier publié</div>
                <div class="text-body-2 text-medium-emphasis">
                  La signature de convention n'est pas exigée des investisseurs pour le moment.
                </div>
              </div>
              
              <div v-else-if="convention" class="current-file-card bg-surface border rounded-xl overflow-hidden">
                <div class="bg-success-lighten-5 pa-6 d-flex flex-column align-center text-center border-b">
                  <CheckCircle2 :size="48" class="text-success mb-3" />
                  <div class="text-h6 font-weight-bold text-success-darken-1 mb-1">Convention Active</div>
                  <div class="text-caption text-success">
                    Publiée le {{ formaterDate(convention.date_publication) }}
                  </div>
                </div>
                <div class="pa-6">
                  <div class="d-flex align-center mb-4">
                    <FileText :size="24" class="text-primary mr-3 flex-shrink-0" />
                    <div class="text-body-1 font-weight-medium text-truncate">
                      {{ convention.titre || 'Convention tarifaire' }}
                    </div>
                  </div>
                  <v-btn
                    v-if="convention.url_signee"
                    color="primary"
                    variant="tonal"
                    block
                    class="font-weight-bold"
                    :href="convention.url_signee"
                    target="_blank"
                  >
                    <Download :size="18" class="mr-2" /> Télécharger le PDF
                  </v-btn>
                </div>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.premium-input :deep(.v-field) {
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.premium-file-input :deep(.v-field) {
  border-radius: 12px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.2) !important;
  background-color: transparent !important;
}

.premium-file-input :deep(.v-field__input) {
  display: none !important;
}

.premium-file-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

.cursor-pointer {
  cursor: pointer;
}
</style>