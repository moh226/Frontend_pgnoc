<script setup lang="ts">
import { onMounted, ref } from 'vue'

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
        formulaireChamp.value.type === 'FICHIER'
          ? formulaireChamp.value.formats_acceptes.trim() || undefined
          : undefined,
      taille_max_mo:
        formulaireChamp.value.type === 'FICHIER'
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

onMounted(() => void charger())
</script>

<template>
  <v-container fluid>
    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-4">
      {{ erreur }}
    </v-alert>

    <div class="d-flex align-center mb-4">
      <span class="text-h6">Parcours KYC de la SGI</span>
      <v-spacer />
      <v-btn color="primary" variant="flat" @click="dialogEtape = true">
        <v-icon icon="mdi-plus" class="mr-1" /> Nouvelle étape
      </v-btn>
    </div>

    <v-progress-linear v-if="chargement" indeterminate class="mb-3" />

    <v-alert v-if="!chargement && !etapes.length" type="info" variant="tonal" class="mb-3">
      Aucune étape définie. Créez votre première étape pour démarrer le parcours KYC.
    </v-alert>

    <v-expansion-panels v-else variant="accordion" class="mb-3">
      <v-expansion-panel v-for="etape in etapes" :key="etape.id">
        <v-expansion-panel-title>
          <div class="d-flex align-center flex-grow-1">
            <span class="mr-2 text-medium-emphasis">Étape {{ etape.ordre }}</span>
            <span class="font-weight-medium">{{ etape.nom }}</span>
            <v-chip
              :color="etape.actif ? 'success' : 'error'"
              variant="tonal"
              size="small"
              class="ml-3"
            >
              {{ etape.actif ? 'Active' : 'Désactivée' }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="text-caption text-medium-emphasis mb-2">
            {{ champsParEtape.get(etape.id)?.length ?? 0 }} champ(s)
          </div>
          <v-list density="compact" class="mb-3">
            <v-list-item v-for="champ in champsParEtape.get(etape.id)" :key="champ.id">
              <template #prepend>
                <v-icon
                  icon="mdi-form-textbox"
                  :color="champ.actif ? 'primary' : 'grey'"
                />
              </template>
              <v-list-item-title class="font-weight-medium">{{ champ.nom }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ LIBELLES_TYPE[champ.type] }}
                <template v-if="champ.type === 'CHOIX_UNIQUE' || champ.type === 'CHOIX_MULTIPLE'">
                  — {{ champ.options_choix?.join(', ') }}
                </template>
                <template v-else-if="champ.type === 'FICHIER'">
                  — {{ champ.formats_acceptes || 'pdf' }} · max {{ champ.taille_max_mo }} Mo
                </template>
                <template v-if="!champ.obligatoire"> · optionnel</template>
              </v-list-item-subtitle>
              <template #append>
                <v-chip
                  size="small"
                  :color="champ.actif ? 'success' : 'error'"
                  variant="tonal"
                  class="mr-2"
                >
                  {{ champ.actif ? 'Actif' : 'Désactivé' }}
                </v-chip>
                <v-btn
                  size="small"
                  variant="text"
                  :color="champ.actif ? 'error' : 'success'"
                  @click="basculerChamp(champ)"
                >
                  {{ champ.actif ? 'Désactiver' : 'Réactiver' }}
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-btn size="small" variant="tonal" color="primary" class="mb-2" @click="ouvrirChamp(etape.id)">
            <v-icon icon="mdi-plus" class="mr-1" /> Ajouter un champ
          </v-btn>
          <v-divider class="my-2" />
          <v-btn size="small" variant="text" :color="etape.actif ? 'error' : 'success'" @click="basculerEtape(etape)">
            {{ etape.actif ? "Désactiver l'étape" : "Réactiver l'étape" }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog v-model="dialogEtape" max-width="480">
      <v-card>
        <v-card-title>Nouvelle étape KYC</v-card-title>
        <v-card-text>
          <v-text-field v-model="formulaireEtape.nom" label="Nom de l'étape (obligatoire)" variant="outlined" class="mb-3" />
          <v-text-field
            v-model.number="formulaireEtape.ordre"
            label="Ordre d'affichage"
            variant="outlined"
            type="number"
            min="1"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogEtape = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="envoiEnCours"
            :disabled="!formulaireEtape.nom.trim()"
            @click="creerNouvelleEtape"
          >
            Créer l'étape
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogChamp" max-width="640">
      <v-card>
        <v-card-title>Nouveau champ KYC</v-card-title>
        <v-card-text>
          <v-text-field v-model="formulaireChamp.nom" label="Nom affiché (obligatoire)" variant="outlined" class="mb-3" />
          <v-text-field
            v-model="formulaireChamp.code"
            label="Code technique"
            variant="outlined"
            class="mb-3"
            hint="Généré depuis le nom si vide. Ne change jamais après création."
          />
          <v-select
            v-model="formulaireChamp.type"
            :items="Object.entries(LIBELLES_TYPE).map(([valeur, libelle]) => ({ value: valeur, title: libelle }))"
            label="Type de champ"
            variant="outlined"
            class="mb-3"
          />
          <v-row class="mb-3">
            <v-col cols="6">
              <v-switch v-model="formulaireChamp.obligatoire" label="Obligatoire" color="primary" inset />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="formulaireChamp.ordre"
                label="Ordre"
                variant="outlined"
                type="number"
                min="1"
              />
            </v-col>
          </v-row>
          <v-textarea
            v-if="formulaireChamp.type === 'CHOIX_UNIQUE' || formulaireChamp.type === 'CHOIX_MULTIPLE'"
            v-model="formulaireChamp.options_choix"
            label="Options (séparées par des virgules)"
            variant="outlined"
            rows="2"
            class="mb-3"
          />
          <v-row v-if="formulaireChamp.type === 'FICHIER'" class="mb-3">
            <v-col cols="6">
              <v-text-field
                v-model="formulaireChamp.formats_acceptes"
                label="Formats acceptés (ex: pdf,jpg,png)"
                variant="outlined"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="formulaireChamp.taille_max_mo"
                label="Taille max (Mo) — obligatoire"
                variant="outlined"
                type="number"
                min="1"
              />
            </v-col>
          </v-row>
          <v-textarea
            v-model="formulaireChamp.justification"
            label="Justification (expliquée à l'investisseur)"
            variant="outlined"
            rows="2"
            counter
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogChamp = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="envoiEnCours"
            :disabled="!formulaireChamp.nom.trim()"
            @click="creerNouveauChamp"
          >
            Créer le champ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>