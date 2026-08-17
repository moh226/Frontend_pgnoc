<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Settings2,
  Eye,
  Plus,
  Layers,
  FileText,
  Camera,
  Power,
  PowerOff,
  XCircle,
  GripVertical
} from '@lucide/vue'

import {
  creerChamp,
  creerEtape,
  listeChampsKycAdmin,
  listetEtapesKycAdmin,
  modifierChamp,
  modifierEtape,
} from '@/api/kycAdmin'
import { extraireMessageErreur } from '@/api/client'
import type { ChampKycAdmin, EtapeKycAdmin, TypeChampKyc } from '@/types'

const LIBELLES_TYPE: Record<TypeChampKyc, string> = {
  TEXTE_COURT: 'Texte court',
  TEXTE_LONG: 'Texte long',
  NOMBRE: 'Nombre',
  DATE: 'Date',
  BOOLEEN: 'Case à cocher',
  CHOIX_UNIQUE: 'Choix unique',
  CHOIX_MULTIPLE: 'Choix multiple',
  FICHIER: 'Fichier joint',
  SELFIE: 'Selfie de vérification',
}

const etapes = ref<EtapeKycAdmin[]>([])
const champsParEtape = ref(new Map<string, ChampKycAdmin[]>())
const chargement = ref(false)
const erreur = ref('')

const dialogEtape = ref(false)
const dialogChamp = ref(false)
const envoiEnCours = ref(false)

const formulaireEtape = ref({ nom: '', ordre: 1 })
const formulaireChamp = ref({
  etape: '',
  nom: '',
  code: '',
  type: 'TEXTE_COURT' as TypeChampKyc,
  obligatoire: true,
  ordre: 1,
  justification: '',
  options_choix: '',
  formats_acceptes: '',
  taille_max_mo: null as number | null,
})

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    const etapesChargees = await listetEtapesKycAdmin()
    etapes.value = [...etapesChargees].sort((a, b) => a.ordre - b.ordre)
    champsParEtape.value.clear()
    await Promise.all(
      etapes.value.map(async (e) => {
        champsParEtape.value.set(e.id, await listeChampsKycAdmin(e.id))
      }),
    )
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

async function creerNouvelleEtape() {
  if (!formulaireEtape.value.nom.trim()) return
  envoiEnCours.value = true
  erreur.value = ''
  try {
    const etape = await creerEtape({
      nom: formulaireEtape.value.nom.trim(),
      ordre: formulaireEtape.value.ordre,
    })
    champsParEtape.value.set(etape.id, [])
    etapes.value.push(etape)
    etapes.value.sort((a, b) => a.ordre - b.ordre)
    dialogEtape.value = false
    formulaireEtape.value = { nom: '', ordre: etapes.value.length + 1 }
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    envoiEnCours.value = false
  }
}

function ouvrirChamp(etapeId: string) {
  formulaireChamp.value = {
    etape: etapeId,
    nom: '',
    code: '',
    type: 'TEXTE_COURT',
    obligatoire: true,
    ordre: 1,
    justification: '',
    options_choix: '',
    formats_acceptes: '',
    taille_max_mo: null,
  }
  dialogChamp.value = true
}

function codeDuNom(nom: string): string {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

async function creerNouveauChamp() {
  if (!formulaireChamp.value.nom.trim()) return
  envoiEnCours.value = true
  erreur.value = ''
  try {
    const champ = await creerChamp({
      etape: formulaireChamp.value.etape,
      code: formulaireChamp.value.code.trim() || codeDuNom(formulaireChamp.value.nom),
      nom: formulaireChamp.value.nom.trim(),
      type: formulaireChamp.value.type,
      obligatoire: formulaireChamp.value.obligatoire,
      ordre: formulaireChamp.value.ordre,
      justification: formulaireChamp.value.justification.trim() || undefined,
      options_choix:
        formulaireChamp.value.type === 'CHOIX_UNIQUE' ||
        formulaireChamp.value.type === 'CHOIX_MULTIPLE'
          ? formulaireChamp.value.options_choix
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : null,
      formats_acceptes:
        formulaireChamp.value.type === 'FICHIER' ||
        formulaireChamp.value.type === 'SELFIE'
          ? formulaireChamp.value.formats_acceptes.trim() || undefined
          : undefined,
      taille_max_mo:
        formulaireChamp.value.type === 'FICHIER' ||
        formulaireChamp.value.type === 'SELFIE'
          ? formulaireChamp.value.taille_max_mo
          : null,
    })
    const actuels = champsParEtape.value.get(champ.etape) ?? []
    champsParEtape.value.set(champ.etape, [...actuels, champ])
    dialogChamp.value = false
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    envoiEnCours.value = false
  }
}

async function basculerEtape(etape: EtapeKycAdmin) {
  erreur.value = ''
  try {
    const maj = await modifierEtape(etape.id, { actif: !etape.actif })
    etape.actif = maj.actif
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  }
}

async function basculerChamp(champ: ChampKycAdmin) {
  erreur.value = ''
  try {
    const maj = await modifierChamp(champ.id, { actif: !champ.actif })
    champ.actif = maj.actif
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  }
}

// --- Aperçu temps réel du formulaire côté investisseur ---
const apercuOuvert = ref(false)
const valeursApercu = ref<Record<string, string>>({})

function champVisibleDansApercu(champ: ChampKycAdmin): boolean {
  if (!champ.champ_parent) return true
  return valeursApercu.value[champ.champ_parent] === champ.valeur_declencheur
}

function nomDuParent(champ: ChampKycAdmin): string {
  if (!champ.champ_parent) return ''
  for (const champs of champsParEtape.value.values()) {
    const parent = champs.find((c) => c.id === champ.champ_parent)
    if (parent) return parent.nom
  }
  return champ.champ_parent.slice(0, 8)
}

function etapesVisibles(): EtapeKycAdmin[] {
  return etapes.value.filter((e) => e.actif)
}

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
            <div 
              v-for="champ in champsParEtape.get(etape.id)" 
              :key="champ.id"
              class="field-card bg-surface rounded-lg pa-4 d-flex align-center border"
              :class="{ 'opacity-70': !champ.actif }"
            >
              <!-- Poignée de drag (visuelle uniquement) -->
              <div class="cursor-grab text-grey-lighten-1 mr-3 flex-shrink-0">
                <GripVertical :size="20" />
              </div>

              <!-- Infos principales -->
              <div class="flex-grow-1 min-w-0 pr-4">
                <div class="d-flex align-center mb-1">
                  <span class="font-weight-bold text-body-1 text-truncate mr-2">{{ champ.nom }}</span>
                  <v-chip v-if="champ.obligatoire" color="error" size="x-small" variant="flat" class="font-weight-bold px-2">Requis</v-chip>
                  <v-chip v-else color="info" size="x-small" variant="tonal" class="font-weight-bold px-2">Optionnel</v-chip>
                </div>
                
                <div class="text-caption text-medium-emphasis d-flex align-center flex-wrap gap-x-2 gap-y-1">
                  <span class="d-flex align-center text-primary font-weight-medium">
                    <FileText :size="12" class="mr-1" /> {{ LIBELLES_TYPE[champ.type] }}
                  </span>
                  
                  <span v-if="champ.type === 'CHOIX_UNIQUE' || champ.type === 'CHOIX_MULTIPLE'" class="text-truncate" style="max-width: 200px;">
                    • {{ champ.options_choix?.join(', ') }}
                  </span>
                  <span v-else-if="champ.type === 'FICHIER' || champ.type === 'SELFIE'">
                    • {{ champ.formats_acceptes || 'PDF' }} (max {{ champ.taille_max_mo }}Mo)
                  </span>

                  <span v-if="champ.champ_parent" class="d-flex align-center text-warning ml-2 border-l pl-2">
                    <Eye :size="12" class="mr-1" />
                    Conditionnel
                  </span>
                </div>
              </div>

              <!-- Actions du champ -->
              <div class="d-flex align-center flex-shrink-0 gap-2">
                <v-chip
                  size="small"
                  :color="champ.actif ? 'success' : 'grey'"
                  variant="tonal"
                  class="font-weight-bold d-none d-sm-flex"
                >
                  {{ champ.actif ? 'Actif' : 'Inactif' }}
                </v-chip>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="champ.actif ? 'error' : 'success'"
                  @click="basculerChamp(champ)"
                  :title="champ.actif ? 'Désactiver' : 'Activer'"
                >
                  <PowerOff v-if="champ.actif" :size="18" />
                  <Power v-else :size="18" />
                </v-btn>
              </div>
            </div>
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

    <!-- Aperçu temps réel du formulaire côté investisseur -->
    <v-dialog v-model="apercuOuvert" max-width="800" scrollable>
      <v-card class="rounded-xl elevation-24 bg-background">
        <v-card-title class="d-flex align-center pa-6 bg-surface border-b">
          <div class="bg-primary-lighten-5 text-primary rounded-circle pa-2 mr-3">
            <Eye :size="24" />
          </div>
          <div>
            <div class="font-display font-weight-bold text-h6">Aperçu du formulaire</div>
            <div class="text-caption text-medium-emphasis">Simulation du rendu pour l'investisseur</div>
          </div>
          <v-spacer />
          <v-btn variant="tonal" icon color="grey-darken-1" size="small" @click="apercuOuvert = false">
            <XCircle :size="20" />
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 pa-md-8 custom-scrollbar bg-background">
          <v-alert type="info" variant="tonal" class="mb-6 rounded-lg border-l-4">
            Testez les champs et les conditions d'affichage en direct. Les données ne sont pas enregistrées.
          </v-alert>

          <template v-if="!etapesVisibles().length">
            <div class="text-center pa-8 bg-surface rounded-xl border border-dashed">
              <Layers :size="48" class="text-grey-lighten-1 mb-4 mx-auto" />
              <div class="text-h6 font-weight-medium mb-1">Aucune étape active</div>
              <div class="text-body-2 text-medium-emphasis">L'investisseur verra un parcours vide. Activez des étapes pour prévisualiser.</div>
            </div>
          </template>

          <div v-for="etape in etapesVisibles()" :key="etape.id" class="mb-8 bg-surface rounded-xl border overflow-hidden">
            <div class="bg-surface-variant px-6 py-4 border-b d-flex align-center">
              <div class="step-badge-small bg-primary text-white mr-3 font-weight-bold flex-shrink-0 d-flex align-center justify-center">
                {{ etape.ordre }}
              </div>
              <div class="text-h6 font-display font-weight-bold">{{ etape.nom }}</div>
            </div>

            <div class="pa-6">
              <v-alert
                v-if="!champsParEtape.get(etape.id)?.some((champ) => champ.actif)"
                type="warning"
                variant="tonal"
                class="mb-0 border-l-4"
              >
                Aucun champ actif configuré dans cette étape.
              </v-alert>

              <v-row v-else>
                <template v-for="champ in champsParEtape.get(etape.id)" :key="champ.id">
                  <v-col cols="12" v-if="champ.actif">
                    <div v-if="champVisibleDansApercu(champ)">
                      <div class="text-caption font-weight-bold text-uppercase tracking-wider text-medium-emphasis mb-2">
                        {{ champ.nom }}
                        <span v-if="champ.obligatoire" class="text-error">*</span>
                      </div>

                      <v-text-field
                        v-if="champ.type === 'TEXTE_COURT' || champ.type === 'NOMBRE' || champ.type === 'DATE'"
                        :model-value="valeursApercu[champ.id]"
                        :type="champ.type === 'DATE' ? 'date' : champ.type === 'NOMBRE' ? 'number' : 'text'"
                        :hint="champ.justification || undefined"
                        persistent-hint
                        variant="outlined"
                        class="premium-input"
                        placeholder="Votre réponse"
                        @update:model-value="(v: string | null) => { valeursApercu[champ.id] = (v ?? '') }"
                      />
                      
                      <v-textarea
                        v-else-if="champ.type === 'TEXTE_LONG'"
                        :model-value="valeursApercu[champ.id]"
                        :hint="champ.justification || undefined"
                        persistent-hint
                        variant="outlined"
                        class="premium-input"
                        rows="3"
                        placeholder="Votre réponse"
                        @update:model-value="(v: string | null) => { valeursApercu[champ.id] = (v ?? '') }"
                      />
                      
                      <v-select
                        v-else-if="champ.type === 'CHOIX_UNIQUE'"
                        :model-value="valeursApercu[champ.id] || undefined"
                        :items="champ.options_choix ?? []"
                        :hint="champ.justification || undefined"
                        persistent-hint
                        variant="outlined"
                        class="premium-input"
                        placeholder="Sélectionnez une option"
                        @update:model-value="(v: string | null) => { valeursApercu[champ.id] = (v ?? '') }"
                      />
                      
                      <div v-else-if="champ.type === 'CHOIX_MULTIPLE'" class="bg-surface-variant pa-4 rounded-lg">
                        <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-2">{{ champ.justification }}</p>
                        <v-checkbox
                          v-for="option in champ.options_choix ?? []"
                          :key="option"
                          :label="option"
                          :model-value="(valeursApercu[champ.id] ?? '').split('|').includes(option)"
                          density="compact"
                          hide-details
                          color="primary"
                          @update:model-value="(c: boolean | null) => {
                            const actuelles = (valeursApercu[champ.id] ?? '').split('|').filter(Boolean)
                            valeursApercu[champ.id] = (c ? [...actuelles, option] : actuelles.filter((o) => o !== option)).join('|')
                          }"
                        />
                      </div>
                      
                      <v-switch
                        v-else-if="champ.type === 'BOOLEEN'"
                        :model-value="valeursApercu[champ.id] === 'oui'"
                        :label="champ.justification || 'Oui / Non'"
                        color="primary"
                        inset
                        class="mt-0"
                        hide-details
                        @update:model-value="(v: boolean | null) => { valeursApercu[champ.id] = v ? 'oui' : 'non' }"
                      />
                      
                      <div v-else-if="champ.type === 'FICHIER'" class="premium-file-input pa-6 rounded-lg text-center d-flex flex-column align-center justify-center">
                        <div class="bg-surface-variant rounded-circle pa-3 mb-3">
                          <FileText :size="24" class="text-primary" />
                        </div>
                        <div class="text-body-1 font-weight-medium">Dépôt de document simulé</div>
                        <div class="text-caption text-medium-emphasis">Formats acceptés : {{ champ.formats_acceptes || 'pdf' }} (Max {{ champ.taille_max_mo ?? '—' }} Mo)</div>
                      </div>

                      <div v-else-if="champ.type === 'SELFIE'" class="premium-file-input pa-6 rounded-lg text-center d-flex flex-column align-center justify-center">
                        <div class="bg-surface-variant rounded-circle pa-3 mb-3">
                          <Camera :size="24" class="text-primary" />
                        </div>
                        <div class="text-body-1 font-weight-medium">Selfie — capture caméra à la saisie</div>
                        <div class="text-caption text-medium-emphasis">L'investisseur se prend en photo carte en main (aucun upload de fichier existant) · Formats : {{ champ.formats_acceptes || 'jpg, png, webp' }} (Max {{ champ.taille_max_mo ?? 5 }} Mo)</div>
                      </div>

                      <div v-if="champ.champ_parent" class="text-caption text-warning mt-2 d-flex align-center">
                        <Eye :size="12" class="mr-1" />
                        Aperçu conditionnel : Affiché car « {{ nomDuParent(champ) }} » = {{ champ.valeur_declencheur }}
                      </div>
                    </div>

                    <div v-else class="pa-3 bg-surface-variant rounded-lg border border-dashed text-caption text-medium-emphasis d-flex align-center justify-center opacity-70">
                      <Eye :size="14" class="mr-2" />
                      {{ champ.nom }} (Masqué car « {{ nomDuParent(champ) }} » ≠ {{ champ.valeur_declencheur }})
                    </div>
                  </v-col>
                </template>
              </v-row>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
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

.step-badge-small {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 0.9rem;
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

.gap-x-2 {
  column-gap: 8px;
}

.gap-y-1 {
  row-gap: 4px;
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

.premium-file-input {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.2);
  background-color: rgba(var(--v-theme-surface), 0.5);
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

/* Transitions */
.opacity-70 {
  opacity: 0.7;
}
</style>