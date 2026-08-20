<script setup lang="ts">
import {
  Building2,
  History,
  Eye,
  CloudUpload,
  BadgeCheck,
  Target,
  Layers,
  Users,
  MapPin,
  Trophy,
  Phone,
} from '@lucide/vue'

import SgiPresentationRenderer from '@/components/SgiPresentationRenderer.vue'
import PresentationDynamicList from '@/components/presentation/PresentationDynamicList.vue'
import type { FieldDefinition } from '@/components/presentation/PresentationDynamicList.vue'
import { usePresentationForm } from '@/composables/usePresentationForm'
import { formaterDate } from '@/utils/format'

const {
  presentation,
  chargement,
  erreur,
  succes,
  envoiEnCours,
  apercuOuvert,
  formulaire,
  apercu,
  rienRenseigne,
  publier,
  ajouterActivite,
  supprimerActivite,
  ajouterMembre,
  supprimerMembre,
  ajouterReference,
  supprimerReference,
} = usePresentationForm()

const activiteFields: FieldDefinition[] = [
  { key: 'titre', label: 'Pôle (ex : Intermédiation / Investissement)' },
  { key: 'description', label: 'Description' },
]

const membreFields: FieldDefinition[] = [
  { key: 'nom', label: 'Nom' },
  { key: 'fonction', label: 'Fonction' },
]

const referenceFields: FieldDefinition[] = [
  { key: 'titre', label: 'Réalisation / distinction' },
  { key: 'annee', label: 'Année', width: '130px' },
]
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <div class="d-flex flex-column mb-8">
      <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
        <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
          <Building2 :size="28" />
        </div>
        Présentation SGI
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Personnalisez la page de presentation affichée aux investisseurs lors du choix de votre SGI.
      </p>
    </div>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="succes" type="success" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ succes }}
    </v-alert>

    <v-progress-linear v-if="chargement" indeterminate color="primary" class="mb-6 rounded" />

    <template v-else>
      <v-row no-gutters>
        <v-col cols="12" lg="7">
          <v-card class="rounded-xl elevation-2 overflow-hidden mb-6 mb-lg-0">
            <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center">
              <span class="font-weight-bold">Présentation de votre SGI</span>
              <v-spacer />
              <div
                v-if="presentation?.date_publication"
                class="text-caption text-medium-emphasis d-flex align-center mr-4"
              >
                <History :size="14" class="mr-1" />
                Mise à jour : {{ formaterDate(presentation.date_publication) }}
              </div>
              <v-btn
                size="small"
                variant="tonal"
                color="info"
                class="d-lg-none"
                @click="apercuOuvert = true"
              >
                <Eye :size="15" class="mr-1" /> Aperçu
              </v-btn>
            </v-card-title>

            <v-card-text class="pa-6">
              <!-- Identité juridique -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <Building2 :size="17" class="mr-2" /> Identité juridique
              </h2>
              <v-row class="mb-6">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formulaire.forme_sociale"
                    label="Forme sociale (ex : SA)"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formulaire.date_creation_societe"
                    label="Date de création"
                    variant="outlined"
                    type="date"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formulaire.capital_social"
                    label="Capital social"
                    variant="outlined"
                    density="comfortable"
                    placeholder="500 000 000 FCFA"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Agrément réglementaire -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <BadgeCheck :size="17" class="mr-2" /> Agrément réglementaire
              </h2>
              <v-row class="mb-6">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formulaire.numero_agrement"
                    label="Numéro d'agrément"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formulaire.date_agrement"
                    label="Date d'agrément"
                    variant="outlined"
                    type="date"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formulaire.autorite_agrement"
                    label="Autorité d'agrément"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Mission / Vision -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <Target :size="17" class="mr-2" /> Mission &amp; vision
              </h2>
              <v-row class="mb-6">
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="formulaire.mission"
                    label="Mission"
                    variant="outlined"
                    rows="3"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="formulaire.vision"
                    label="Vision"
                    variant="outlined"
                    rows="3"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Domaines d'activité -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <Layers :size="17" class="mr-2" /> Domaines d'activité
              </h2>
              <PresentationDynamicList
                :items="formulaire.activites"
                :fields="activiteFields"
                add-label="Ajouter un pôle"
                @add="ajouterActivite"
                @remove="supprimerActivite"
              />

              <!-- Gouvernance et équipe -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <Users :size="17" class="mr-2" /> Gouvernance et équipe
              </h2>
              <PresentationDynamicList
                :items="formulaire.membres"
                :fields="membreFields"
                add-label="Ajouter un dirigeant"
                @add="ajouterMembre"
                @remove="supprimerMembre"
              />

              <!-- Ancrage régional -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <MapPin :size="17" class="mr-2" /> Ancrage régional
              </h2>
              <v-textarea
                v-model="formulaire.ancrage_regional"
                label="Rattachement UEMOA / BRVM, présence pays membres…"
                variant="outlined"
                rows="2"
                class="mb-6"
                hide-details="auto"
              />

              <!-- Références -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <Trophy :size="17" class="mr-2" /> Références et réalisations
              </h2>
              <PresentationDynamicList
                :items="formulaire.references"
                :fields="referenceFields"
                add-label="Ajouter une référence"
                @add="ajouterReference"
                @remove="supprimerReference"
              />

              <!-- Contact -->
              <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
                <Phone :size="17" class="mr-2" /> Contact et accès
              </h2>
              <v-row class="mb-6">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulaire.adresse"
                    label="Adresse"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulaire.telephone"
                    label="Téléphone"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulaire.email_contact"
                    label="Email de contact"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulaire.site_web"
                    label="Site web"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="d-flex justify-end">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="large"
                  class="font-weight-bold px-8 hover-lift"
                  :loading="envoiEnCours"
                  :disabled="rienRenseigne"
                  @click="publier"
                >
                  <CloudUpload :size="18" class="mr-2" /> Publier la présentation
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5" class="d-none d-lg-block pl-lg-5">
          <v-card class="rounded-xl elevation-2 overflow-hidden apercu-en-direct">
            <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center">
              <span class="font-weight-bold d-flex align-center">
                <span class="dot-vert mr-2" />
                Aperçu en direct
              </span>
              <v-spacer />
              <v-chip size="x-small" color="success" variant="tonal" class="font-weight-bold">
                Temps réel
              </v-chip>
            </v-card-title>
            <v-card-text class="pa-6">
              <v-alert v-if="rienRenseigne" type="info" variant="tonal" class="mb-0">
                Remplissez une section pour voir l'aperçu se mettre à jour instantanément.
              </v-alert>
              <SgiPresentationRenderer v-else :presentation="apercu" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Aperçu temps réel (repli mobile) -->
    <v-dialog v-model="apercuOuvert" max-width="860" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center pa-5">
          <Eye :size="20" color="info" class="mr-2" />
          <span class="font-display font-weight-bold">Aperçu de la page « À propos »</span>
          <v-spacer />
          <v-btn variant="text" icon="mdi-close" @click="apercuOuvert = false" />
        </v-card-title>
        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" class="mb-5">
            Reflet direct de la configuration, même non enregistrée.
          </v-alert>
          <SgiPresentationRenderer :presentation="apercu" />
        </v-card-text>
        <v-card-actions class="pa-5">
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="apercuOuvert = false">
            Fermer l'aperçu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1100px;
  margin: 0 auto;
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.border-l-4 {
  border-left-width: 4px !important;
}

.hover-lift {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

.apercu-en-direct {
  position: sticky;
  top: 24px;
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
}

.dot-vert {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-success));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-success), 0.25);
  animation: pulsation 2s ease-in-out infinite;
}

@keyframes pulsation {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>