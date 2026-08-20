<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Settings2,
  Eye,
  Plus,
  Layers,
  Power,
  PowerOff
} from '@lucide/vue'

import { useKycAdmin, LIBELLES_TYPE } from '@/composables/useKycAdmin'
import KycFieldCard from '@/components/kyc/KycFieldCard.vue'
import KycFieldPreview from '@/components/kyc/KycFieldPreview.vue'

const {
  etapes,
  champsParEtape,
  chargement,
  erreur,
  dialogEtape,
  dialogChamp,
  envoiEnCours,
  formulaireEtape,
  formulaireChamp,
  charger,
  creerNouvelleEtape,
  ouvrirChamp,
  creerNouveauChamp,
  basculerEtape,
  basculerChamp,
} = useKycAdmin()

const apercuOuvert = ref(false)

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ erreur }}
    </v-alert>

    <!-- En-tête de page premium -->
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <Settings2 :size="28" />
          </div>
          Parcours KYC
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Gérez les étapes et les informations requises pour l'ouverture de compte.
        </p>
      </div>
      <div class="d-flex align-center mt-4 mt-md-0 gap-3">
        <v-btn variant="outlined" color="primary" class="hover-lift" @click="apercuOuvert = true">
          <Eye :size="18" class="mr-2" /> Aperçu du formulaire
        </v-btn>
        <v-btn color="primary" variant="flat" class="hover-lift" @click="dialogEtape = true">
          <Plus :size="18" class="mr-2" /> Nouvelle étape
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="chargement" indeterminate color="primary" class="mb-6 rounded" />

    <v-alert v-if="!chargement && !etapes.length" type="info" variant="tonal" class="mb-6 rounded-lg border-l-4">
      Aucune étape définie. Créez votre première étape pour démarrer la configuration de votre parcours KYC.
    </v-alert>

    <!-- Liste des étapes (Accordéon stylisé) -->
    <v-expansion-panels v-else variant="accordion" class="premium-panels mb-6">
      <v-expansion-panel 
        v-for="etape in etapes" 
        :key="etape.id"
        class="mb-4 rounded-xl elevation-2 overflow-hidden"
      >
        <v-expansion-panel-title class="pa-4 pa-md-6" expand-icon="mdi-chevron-down">
          <div class="d-flex align-center flex-grow-1 w-100">
            <!-- Badge Numéro -->
            <div class="step-badge mr-4 flex-shrink-0 d-flex align-center justify-center font-weight-bold" :class="etape.actif ? 'bg-primary text-white' : 'bg-grey-lighten-2 text-grey-darken-2'">
              {{ etape.ordre }}
            </div>
            
            <!-- Informations de l'étape -->
            <div class="flex-grow-1 min-w-0">
              <div class="d-flex align-center flex-wrap gap-2 mb-1">
                <span class="text-h6 font-weight-bold text-truncate">{{ etape.nom }}</span>
                <v-chip
                  :color="etape.actif ? 'success' : 'error'"
                  variant="flat"
                  size="small"
                  class="font-weight-bold px-3 ml-2"
                >
                  {{ etape.actif ? 'Active' : 'Désactivée' }}
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                <Layers :size="14" class="d-inline-flex mr-1 align-text-bottom" />
                {{ champsParEtape.get(etape.id)?.length ?? 0 }} champ(s) configuré(s)
              </div>
            </div>
          </div>
        </v-expansion-panel-title>
        
        <v-expansion-panel-text class="bg-surface-variant pt-4 pb-6 px-4 px-md-6 border-t">
          
          <!-- En-tête des champs de l'étape -->
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-subtitle-1 font-weight-bold">Champs de l'étape</h3>
            <div class="d-flex gap-2">
              <v-btn size="small" variant="text" :color="etape.actif ? 'error' : 'success'" class="hover-lift font-weight-bold" @click="basculerEtape(etape)">
                <PowerOff v-if="etape.actif" :size="16" class="mr-2" />
                <Power v-else :size="16" class="mr-2" />
                {{ etape.actif ? "Désactiver" : "Activer" }} l'étape
              </v-btn>
              <v-btn size="small" color="primary" variant="flat" class="hover-lift font-weight-bold" @click="ouvrirChamp(etape.id)">
                <Plus :size="16" class="mr-1" /> Ajouter un champ
              </v-btn>
            </div>
          </div>

          <!-- Liste des champs (Cartes individuelles) -->
          <div v-if="!champsParEtape.get(etape.id)?.length" class="text-center pa-6 bg-surface rounded-lg border border-dashed">
            <div class="text-medium-emphasis mb-2">Aucun champ dans cette étape.</div>
          </div>
          
          <div class="fields-grid d-flex flex-column gap-3">
            <KycFieldCard
              v-for="champ in champsParEtape.get(etape.id)"
              :key="champ.id"
              :champ="champ"
              :libelles-type="LIBELLES_TYPE"
              @basculer="basculerChamp"
            />
          </div>

        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Modale Création Étape -->
    <v-dialog v-model="dialogEtape" max-width="500">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5">
          Nouvelle étape KYC
        </v-card-title>
        <v-card-text class="px-6 py-4">
          <p class="text-body-2 text-medium-emphasis mb-6">
            Créez une nouvelle section logique pour regrouper les informations demandées à l'investisseur.
          </p>
          <div class="d-flex flex-column gap-4">
            <v-text-field 
              v-model="formulaireEtape.nom" 
              label="Nom de l'étape" 
              placeholder="Ex: Informations personnelles"
              variant="outlined" 
              class="premium-input"
              hide-details="auto"
            />
            <v-text-field
              v-model.number="formulaireEtape.ordre"
              label="Ordre d'affichage"
              variant="outlined"
              type="number"
              min="1"
              class="premium-input"
              hide-details="auto"
            />
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogEtape = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="px-6 font-weight-bold"
            :loading="envoiEnCours"
            :disabled="!formulaireEtape.nom.trim()"
            @click="creerNouvelleEtape"
          >
            Créer l'étape
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modale Création Champ -->
    <v-dialog v-model="dialogChamp" max-width="600">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center">
          Nouveau champ
        </v-card-title>
        <v-card-text class="px-6 py-4 custom-scrollbar" style="max-height: 70vh; overflow-y: auto;">
          
          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Informations Générales</div>
          <v-text-field 
            v-model="formulaireChamp.nom" 
            label="Nom affiché (Label)" 
            variant="outlined" 
            class="premium-input mb-4" 
            hide-details="auto"
          />
          
          <v-text-field
            v-model="formulaireChamp.code"
            label="Code technique (Optionnel)"
            variant="outlined"
            class="premium-input mb-6"
            hint="Généré automatiquement si vide."
            persistent-hint
          />

          <v-divider class="mb-6" />

          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Paramétrage</div>
          
          <v-row class="mb-2">
            <v-col cols="12" sm="8">
              <v-select
                v-model="formulaireChamp.type"
                :items="Object.entries(LIBELLES_TYPE).map(([valeur, libelle]) => ({ value: valeur, title: libelle }))"
                label="Type de champ"
                variant="outlined"
                class="premium-input"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="formulaireChamp.ordre"
                label="Ordre"
                variant="outlined"
                type="number"
                min="1"
                class="premium-input"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-switch 
            v-model="formulaireChamp.obligatoire" 
            label="Ce champ est obligatoire" 
            color="primary" 
            inset 
            class="mb-4 ml-1"
            hide-details
          />

          <!-- Champs conditionnels selon le type -->
          <v-expand-transition>
            <div v-if="formulaireChamp.type === 'CHOIX_UNIQUE' || formulaireChamp.type === 'CHOIX_MULTIPLE'">
              <v-textarea
                v-model="formulaireChamp.options_choix"
                label="Options disponibles"
                hint="Séparez les options par des virgules (ex: Célibataire, Marié, Divorcé)"
                persistent-hint
                variant="outlined"
                rows="2"
                class="premium-input mb-4 mt-2"
              />
            </div>
          </v-expand-transition>

          <v-expand-transition>
            <div v-if="formulaireChamp.type === 'FICHIER' || formulaireChamp.type === 'SELFIE'" class="mt-2">
              <v-row>
                <v-col cols="12" sm="8">
                  <v-text-field
                    v-model="formulaireChamp.formats_acceptes"
                    :label="formulaireChamp.type === 'SELFIE' ? 'Formats acceptés (images uniquement)' : 'Formats acceptés'"
                    :placeholder="formulaireChamp.type === 'SELFIE' ? 'jpg, png, webp' : 'pdf, jpg, png'"
                    variant="outlined"
                    class="premium-input"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model.number="formulaireChamp.taille_max_mo"
                    label="Max (Mo)"
                    variant="outlined"
                    type="number"
                    min="1"
                    class="premium-input"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <v-textarea
            v-model="formulaireChamp.justification"
            label="Texte d'aide (Indication pour l'investisseur)"
            variant="outlined"
            rows="2"
            class="premium-input mt-6"
            hide-details="auto"
          />

        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-4 border-t">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogChamp = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="px-6 font-weight-bold"
            :loading="envoiEnCours"
            :disabled="!formulaireChamp.nom.trim()"
            @click="creerNouveauChamp"
          >
            Enregistrer le champ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <KycFieldPreview
      v-model="apercuOuvert"
      :etapes="etapes"
      :champs-par-etape="champsParEtape"
    />
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.premium-panels {
  border-radius: 16px;
  background: transparent !important;
}

.premium-panels :deep(.v-expansion-panel) {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgb(var(--v-theme-outline));
}

.step-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 1.1rem;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

/* Premium Inputs */
.premium-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: rgb(var(--v-theme-surface));
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
</style>