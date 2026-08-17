<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Building2, History, Eye, Plus, CloudUpload, BadgeCheck, Target, Layers, Users, MapPin, Trophy, Phone } from '@lucide/vue'

import { presentationSgi, publierPresentation } from '@/api/sgiAdmin'
import { extraireMessageErreur } from '@/api/client'
import SgiPresentationRenderer from '@/components/SgiPresentationRenderer.vue'
import type { PresentationActivite, PresentationMembre, PresentationReference, PresentationSgi, PresentationStructuree } from '@/types'
import { formaterDate } from '@/utils/format'

const presentation = ref<PresentationSgi | null>(null)
const chargement = ref(false)
const erreur = ref('')
const succes = ref('')
const envoiEnCours = ref(false)

interface LigneActivite { titre: string; description: string }
interface LigneMembre { nom: string; fonction: string }
interface LigneReference { titre: string; annee: string; description: string }

const formulaire = reactive({
  forme_sociale: '',
  date_creation_societe: '',
  capital_social: '',
  numero_agrement: '',
  date_agrement: '',
  autorite_agrement: 'AMF-UEMOA (ex-CREPMF)',
  mission: '',
  vision: '',
  ancrage_regional: '',
  adresse: '',
  telephone: '',
  email_contact: '',
  site_web: '',
  activites: [] as LigneActivite[],
  membres: [] as LigneMembre[],
  references: [] as LigneReference[],
})

const apercuOuvert = ref(false)

const apercu = computed<PresentationStructuree>(() => ({
  forme_sociale: formulaire.forme_sociale,
  date_creation_societe: formulaire.date_creation_societe || null,
  capital_social: formulaire.capital_social,
  numero_agrement: formulaire.numero_agrement,
  date_agrement: formulaire.date_agrement || null,
  autorite_agrement: formulaire.autorite_agrement,
  est_regule: Boolean(formulaire.numero_agrement),
  mission: formulaire.mission,
  vision: formulaire.vision,
  ancrage_regional: formulaire.ancrage_regional,
  adresse: formulaire.adresse,
  telephone: formulaire.telephone,
  email_contact: formulaire.email_contact,
  site_web: formulaire.site_web,
  activites: formulaire.activites.map((a, i): PresentationActivite => ({ ...a, ordre: i })),
  membres: formulaire.membres.map((m, i): PresentationMembre => ({ ...m, ordre: i })),
  references: formulaire.references.map((r, i): PresentationReference => ({ ...r, ordre: i })),
}))

const rienRenseigne = computed(() => {
  const f = formulaire
  return !(
    f.forme_sociale || f.date_creation_societe || f.capital_social ||
    f.numero_agrement || f.date_agrement || f.mission || f.vision ||
    f.ancrage_regional || f.adresse || f.telephone || f.email_contact || f.site_web ||
    f.activites.length || f.membres.length || f.references.length
  )
})

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    presentation.value = await presentationSgi()
    const p = presentation.value
    formulaire.forme_sociale = p.forme_sociale
    formulaire.date_creation_societe = p.date_creation_societe ?? ''
    formulaire.capital_social = p.capital_social
    formulaire.numero_agrement = p.numero_agrement
    formulaire.date_agrement = p.date_agrement ?? ''
    formulaire.autorite_agrement = p.autorite_agrement || 'AMF-UEMOA (ex-CREPMF)'
    formulaire.mission = p.mission
    formulaire.vision = p.vision
    formulaire.ancrage_regional = p.ancrage_regional
    formulaire.adresse = p.adresse
    formulaire.telephone = p.telephone
    formulaire.email_contact = p.email_contact
    formulaire.site_web = p.site_web
    formulaire.activites = p.activites.map(({ titre, description }) => ({ titre, description }))
    formulaire.membres = p.membres.map(({ nom, fonction }) => ({ nom, fonction }))
    formulaire.references = p.references.map(({ titre, annee, description }) => ({ titre, annee, description }))
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

function ajouterLigne<L>(liste: L[]) {
  liste.push({} as L)
}

function retirerLigne<L>(liste: L[], index: number) {
  liste.splice(index, 1)
}

async function publier() {
  envoiEnCours.value = true
  erreur.value = ''
  succes.value = ''
  try {
    presentation.value = await publierPresentation(apercu.value)
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
  <v-container fluid class="page-container pa-6 pa-md-8">
    <div class="d-flex flex-column mb-8">
      <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
        <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
          <Building2 :size="28" />
        </div>
        Présentation SGI
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Personnalisez la page « À propos » affichée aux investisseurs lors du choix de votre SGI.
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
          <span class="font-weight-bold">Page « À propos » de votre SGI</span>
          <v-spacer />
          <div v-if="presentation?.date_publication" class="text-caption text-medium-emphasis d-flex align-center mr-4">
            <History :size="14" class="mr-1" />
            Mise à jour : {{ formaterDate(presentation.date_publication) }}
          </div>
          <v-btn size="small" variant="tonal" color="info" class="d-lg-none" @click="apercuOuvert = true">
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
              <v-text-field v-model="formulaire.forme_sociale" label="Forme sociale (ex : SA)" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="formulaire.date_creation_societe" label="Date de création" variant="outlined" type="date" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="formulaire.capital_social" label="Capital social" variant="outlined" density="comfortable" placeholder="500 000 000 FCFA" hide-details="auto" />
            </v-col>
          </v-row>

          <!-- Agrément réglementaire -->
          <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <BadgeCheck :size="17" class="mr-2" /> Agrément réglementaire
          </h2>
          <v-row class="mb-6">
            <v-col cols="12" md="4">
              <v-text-field v-model="formulaire.numero_agrement" label="Numéro d'agrément" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="formulaire.date_agrement" label="Date d'agrément" variant="outlined" type="date" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="formulaire.autorite_agrement" label="Autorité d'agrément" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
          </v-row>

          <!-- Mission / Vision -->
          <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <Target :size="17" class="mr-2" /> Mission &amp; vision
          </h2>
          <v-row class="mb-6">
            <v-col cols="12" md="6">
              <v-textarea v-model="formulaire.mission" label="Mission" variant="outlined" rows="3" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea v-model="formulaire.vision" label="Vision" variant="outlined" rows="3" hide-details="auto" />
            </v-col>
          </v-row>

          <!-- Domaines d'activité -->
          <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <Layers :size="17" class="mr-2" /> Domaines d'activité
          </h2>
          <div v-for="(activite, i) in formulaire.activites" :key="i" class="d-flex align-start mb-3 gap-2">
            <v-text-field v-model="activite.titre" label="Pôle (ex : Intermédiation / Investissement)" variant="outlined" density="comfortable" class="flex-grow-1" hide-details="auto" />
            <v-text-field v-model="activite.description" label="Description" variant="outlined" density="comfortable" class="flex-grow-1" hide-details="auto" />
            <v-btn variant="text" color="error" icon="mdi-delete-outline" @click="retirerLigne(formulaire.activites, i)" />
          </div>
          <v-btn variant="tonal" color="primary" size="small" class="mb-6" @click="ajouterLigne(formulaire.activites)">
            <Plus :size="15" class="mr-1" /> Ajouter un pôle
          </v-btn>

          <!-- Gouvernance et équipe -->
          <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <Users :size="17" class="mr-2" /> Gouvernance et équipe
          </h2>
          <div v-for="(membre, i) in formulaire.membres" :key="i" class="d-flex align-start mb-3 gap-2">
            <v-text-field v-model="membre.nom" label="Nom" variant="outlined" density="comfortable" class="flex-grow-1" hide-details="auto" />
            <v-text-field v-model="membre.fonction" label="Fonction" variant="outlined" density="comfortable" class="flex-grow-1" hide-details="auto" />
            <v-btn variant="text" color="error" icon="mdi-delete-outline" @click="retirerLigne(formulaire.membres, i)" />
          </div>
          <v-btn variant="tonal" color="primary" size="small" class="mb-6" @click="ajouterLigne(formulaire.membres)">
            <Plus :size="15" class="mr-1" /> Ajouter un dirigeant
          </v-btn>

          <!-- Ancrage régional -->
          <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <MapPin :size="17" class="mr-2" /> Ancrage régional
          </h2>
          <v-textarea v-model="formulaire.ancrage_regional" label="Rattachement UEMOA / BRVM, présence pays membres…" variant="outlined" rows="2" class="mb-6" hide-details="auto" />

          <!-- Références -->
          <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <Trophy :size="17" class="mr-2" /> Références et réalisations
          </h2>
          <div v-for="(reference, i) in formulaire.references" :key="i" class="d-flex align-start mb-3 gap-2">
            <v-text-field v-model="reference.titre" label="Réalisation / distinction" variant="outlined" density="comfortable" class="flex-grow-1" hide-details="auto" />
            <v-text-field v-model="reference.annee" label="Année" variant="outlined" density="comfortable" style="max-width: 130px;" hide-details="auto" />
            <v-btn variant="text" color="error" icon="mdi-delete-outline" @click="retirerLigne(formulaire.references, i)" />
          </div>
          <v-btn variant="tonal" color="primary" size="small" class="mb-6" @click="ajouterLigne(formulaire.references)">
            <Plus :size="15" class="mr-1" /> Ajouter une référence
          </v-btn>

          <!-- Contact -->
          <h2 class="text-subtitle-1 font-weight-bold text-primary mb-3 d-flex align-center">
            <Phone :size="17" class="mr-2" /> Contact et accès
          </h2>
          <v-row class="mb-6">
            <v-col cols="12" md="6">
              <v-text-field v-model="formulaire.adresse" label="Adresse" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulaire.telephone" label="Téléphone" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulaire.email_contact" label="Email de contact" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulaire.site_web" label="Site web" variant="outlined" density="comfortable" hide-details="auto" />
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
          <p class="text-caption text-medium-emphasis text-right mt-2">
            La sauvegarde rend immédiatement la page visible par les investisseurs.
          </p>
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
          <v-btn color="primary" variant="flat" @click="apercuOuvert = false">Fermer l'aperçu</v-btn>
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

.gap-2 {
  gap: 10px;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>