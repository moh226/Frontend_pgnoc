<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  Globe,
  ImagePlus,
  PencilLine,
  Send,
  X,
} from '@lucide/vue'

import VitrineAccueil from '@/components/VitrineAccueil.vue'
import AccueilBlocEditor from '@/components/accueil/AccueilBlocEditor.vue'
import { useAccueilEditor, LIBELLES_TYPE } from '@/composables/useAccueilEditor'

const {
  chargement,
  erreur,
  message,
  enregistrement,
  publication,
  blocSelectionne,
  brouillonTitre,
  nouveauFichier,
  nouvelleMention,
  hero,
  mentions,
  chiffres,
  etapes,
  cartes,
  temoignages,
  questions,
  appelAction,
  blocsTries,
  blocCourant,
  nbPublies,
  imageActuelle,
  apercuMasques,
  apercuBlocs,
  charger,
  selectionner,
  ajouterMention,
  enregistrerBloc,
  deplacer,
  basculerActif,
  publierPage,
  surFichierChoisi,
} = useAccueilEditor()

const apercuOuvert = ref(false)

onMounted(charger)
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <Globe :size="28" />
          </div>
          Page d'accueil
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Personnalisez les huit blocs de la vitrine publique puis publiez vos changements.
        </p>
      </div>
      <div class="actions-page">
        <v-chip :color="nbPublies === 8 ? 'success' : 'warning'" variant="flat" class="font-weight-bold">
          {{ nbPublies }}/8 blocs publiés
        </v-chip>
        <div class="separateur-actions" />
        <v-btn variant="outlined" size="large" class="font-weight-bold" @click="apercuOuvert = true">
          <Eye :size="18" class="mr-2" /> Aperçu
        </v-btn>
        <v-btn color="primary" variant="flat" size="large" class="font-weight-bold hover-lift" :loading="publication" @click="publierPage">
          <Send :size="18" class="mr-2" /> Publier la page
        </v-btn>
      </div>
    </div>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="message" type="success" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ message }}
    </v-alert>

    <v-row v-if="!chargement" class="align-stretch">
      <v-col cols="12" md="4" lg="3">
        <v-card class="rounded-xl elevation-2 overflow-hidden border h-100">
          <v-card-title class="font-weight-bold text-body-1 bg-surface-variant">
            Ordre des blocs
          </v-card-title>
          <v-list density="comfortable">
            <v-list-item
              v-for="(bloc, index) in blocsTries"
              :key="bloc.type"
              :active="bloc.type === blocSelectionne"
              class="mb-1"
              @click="selectionner(bloc.type)"
            >
              <template #prepend>
                <span class="text-caption font-weight-bold text-primary mr-2">{{ index + 1 }}</span>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ LIBELLES_TYPE[bloc.type] }}
              </v-list-item-title>
              <template #append>
                <v-icon
                  :color="bloc.actif ? 'success' : 'grey'"
                  size="small"
                  class="mr-1"
                  @click.stop="basculerActif(bloc)"
                >
                  {{ bloc.actif ? 'mdi-eye' : 'mdi-eye-off' }}
                </v-icon>
                <v-btn icon size="x-small" variant="text" :disabled="index === 0" @click.stop="deplacer(index, -1)">
                  <ArrowUp :size="16" />
                </v-btn>
                <v-btn icon size="x-small" variant="text" :disabled="index === blocsTries.length - 1" @click.stop="deplacer(index, 1)">
                  <ArrowDown :size="16" />
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8" lg="9">
        <v-card v-if="blocSelectionne && blocCourant" class="rounded-xl elevation-2 overflow-hidden border">
          <v-card-title class="font-weight-bold bg-surface-variant d-flex align-center justify-space-between">
            <span class="d-flex align-center">
              <PencilLine :size="18" class="mr-2 text-primary" />
              {{ LIBELLES_TYPE[blocSelectionne] }}
            </span>
            <v-chip v-if="blocCourant.publie" color="success" size="small" variant="flat">
              Publié
            </v-chip>
            <v-chip v-else color="warning" size="small" variant="flat">Brouillon</v-chip>
          </v-card-title>

          <v-card-text>
            <div class="ligne-champ mb-4">
              <label class="etiquette-champ">
                Titre de section
              </label>
              <v-text-field v-model="brouillonTitre" density="comfortable" variant="outlined" hide-details placeholder="Titre affiché au-dessus du bloc" />
            </div>

            <AccueilBlocEditor
              :blocSelectionne="blocSelectionne"
              :hero="hero"
              :mentions="mentions"
              :nouvelleMention="nouvelleMention"
              @update:nouvelleMention="(val) => nouvelleMention = val"
              @ajouterMention="ajouterMention"
              :chiffres="chiffres"
              :etapes="etapes"
              :cartes="cartes"
              :temoignages="temoignages"
              :questions="questions"
              :appelAction="appelAction"
              :nouveauFichier="nouveauFichier"
              :imageActuelle="imageActuelle"
              @surFichierChoisi="surFichierChoisi"
            />
          </v-card-text>

          <v-card-actions class="px-6 py-4">
            <v-btn color="primary" variant="flat" class="font-weight-bold" :loading="enregistrement" @click="enregistrerBloc">
              <Check :size="18" class="mr-2" /> Enregistrer le bloc
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card v-else class="rounded-xl elevation-2 border d-flex align-center justify-center pa-12 text-center h-100">
          <div>
            <ImagePlus :size="40" class="mx-auto mb-3 text-primary" />
            <p class="text-medium-emphasis">Sélectionnez un bloc dans la liste pour l'éditer.</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-progress-circular v-if="chargement" indeterminate color="primary" class="d-block mx-auto my-12" />

    <!-- Aperçu en direct de la configuration (dont les blocs non enregistrés) -->
    <v-dialog v-model="apercuOuvert" fullscreen transition="dialog-bottom-transition">
      <v-card class="apercu-conteneur" flat>
        <div class="barre-apercu">
          <span class="font-display font-weight-bold">Aperçu de la page d'accueil</span>
          <span class="texte-note-apercu">
            Les blocs désactivés sont signalés ; votre brouillon du bloc en cours est inclus.
          </span>
          <v-btn size="small" variant="tonal" @click="apercuOuvert = false">
            <X :size="16" class="mr-1" /> Fermer l'aperçu
          </v-btn>
        </div>
        <div class="corps-apercu">
          <VitrineAccueil :blocs="apercuBlocs()" :masques="apercuMasques" />
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.ligne-champ {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.etiquette-champ {
  flex: 0 0 190px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.4;
}

.actions-page {
  display: flex;
  align-items: center;
  gap: 24px;
}

.separateur-actions {
  width: 1px;
  height: 32px;
  background-color: rgb(var(--v-theme-outline));
}

@media (max-width: 959.98px) {
  .actions-page {
    margin-top: 16px;
    flex-wrap: wrap;
    gap: 16px;
  }
}

.apercu-conteneur {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background-color: rgb(var(--v-theme-background));
}

.barre-apercu {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  flex-shrink: 0;
  z-index: 10;
}

.texte-note-apercu {
  flex: 1;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.corps-apercu {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 700px) {
  .ligne-champ {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .etiquette-champ {
    flex: unset;
  }
}
</style>