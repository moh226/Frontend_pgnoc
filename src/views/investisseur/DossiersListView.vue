<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Briefcase, Clock, ChevronRight, FolderOpen } from '@lucide/vue'

import { listeDossiers } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { COULEURS_STATUT, LIBELLES_STATUT, STATUTS_DOSSIER } from '@/config/statuts'
import type { DossierListeItem, StatutDossier } from '@/types'
import { formaterJour } from '@/utils/format'

const router = useRouter()

const dossiers = ref<DossierListeItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSuivante = ref(false)
const pagePrecedente = ref(false)
const chargement = ref(false)
const erreur = ref('')
const filtresStatut = ref<StatutDossier[]>([])

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    const reponse = await listeDossiers({ statut: filtresStatut.value, page: page.value })
    dossiers.value = reponse.results
    total.value = reponse.count
    pageSuivante.value = Boolean(reponse.next)
    pagePrecedente.value = Boolean(reponse.previous)
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

function basculerFiltre(statut: StatutDossier) {
  filtresStatut.value = filtresStatut.value.includes(statut)
    ? filtresStatut.value.filter((s) => s !== statut)
    : [...filtresStatut.value, statut]
  page.value = 1
}

function actionPourDossier(dossier: DossierListeItem) {
  if (dossier.statut === 'REJETE') return 'Correction requise'
  if (dossier.statut === 'BROUILLON') {
    return dossier.progression_pct >= 100 ? 'Prêt à soumettre' : 'À compléter'
  }
  return ''
}

function ouvrirDossier(dossier: DossierListeItem) {
  const route =
    dossier.statut === 'BROUILLON' || dossier.statut === 'REJETE'
      ? 'investisseur-dossier-edition'
      : 'investisseur-dossier-detail'
  router.push({ name: route, params: { id: dossier.id } })
}

watch([filtresStatut, page], () => void charger())

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-dossiers pa-6">
    <header class="mb-8">
      <h1 class="font-display text-h4 font-weight-bold mb-2">Mes dossiers</h1>
      <p class="text-muted">
        Gérez vos demandes d'ouverture de compte-titres et suivez leur progression.
      </p>
    </header>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-5" closable>
      <div class="d-flex align-center flex-wrap ga-3">
        <span>{{ erreur }}</span>
        <v-btn variant="tonal" size="small" @click="charger">Réessayer</v-btn>
      </div>
    </v-alert>

    <div class="filtres-section mb-6">
      <div class="d-flex align-center flex-wrap ga-3">
        <v-chip
          v-for="statut in STATUTS_DOSSIER"
          :key="statut"
          :color="COULEURS_STATUT[statut]"
          :variant="filtresStatut.includes(statut) ? 'flat' : 'tonal'"
          filter
          :model-value="filtresStatut.includes(statut)"
          size="small"
          class="filtre-chip"
          @click="basculerFiltre(statut)"
        >
          {{ LIBELLES_STATUT[statut] }}
        </v-chip>
        <v-chip
          v-if="filtresStatut.length"
          variant="text"
          size="small"
          class="ml-1"
          @click="filtresStatut = []; page = 1"
        >
          Tout afficher
        </v-chip>
      </div>
    </div>

    <v-progress-linear v-if="chargement" indeterminate color="primary" class="mb-5" />

    <div v-if="!chargement && !dossiers.length" class="empty-state text-center py-16">
      <v-avatar color="primary" variant="tonal" size="72" class="mb-5">
        <FolderOpen :size="36" />
      </v-avatar>
      <h2 class="text-h6 font-weight-bold mb-2">Aucun dossier</h2>
      <p class="text-body-2 text-muted mb-6">
        {{ filtresStatut.length ? 'Aucun dossier ne correspond à ces filtres.' : 'Vous n\'avez pas encore de dossier. Commencez votre première demande d\'ouverture.' }}
      </p>
      <v-btn
        v-if="!filtresStatut.length"
        color="primary"
        variant="flat"
        class="btn-principal"
        :to="{ name: 'onboarding-sgi' }"
      >
        Démarrer un dossier <ChevronRight :size="16" class="ml-2" />
      </v-btn>
      <v-btn
        v-else
        variant="outlined"
        color="primary"
        @click="filtresStatut = []; page = 1"
      >
        Réinitialiser les filtres
      </v-btn>
    </div>

    <v-row v-else class="dossiers-grid">
      <v-col
        v-for="dossier in dossiers"
        :key="dossier.id"
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card class="dossier-card glass-panel" @click="ouvrirDossier(dossier)">
          <div class="dossier-card-header d-flex align-center flex-wrap ga-3 mb-4">
            <v-avatar
              :color="COULEURS_STATUT[dossier.statut]"
              variant="tonal"
              size="42"
              class="dossier-avatar"
            >
              <Briefcase :size="20" />
            </v-avatar>
            <div class="flex-grow-1 min-width-0">
              <div class="dossier-reference text-truncate">{{ dossier.reference }}</div>
              <div class="text-caption text-muted d-flex align-center mt-1">
                <Clock :size="12" class="mr-1" />
                Créé le {{ formaterJour(dossier.date_creation) }}
              </div>
            </div>
            <v-chip
              :color="COULEURS_STATUT[dossier.statut]"
              variant="tonal"
              size="small"
              class="font-weight-bold dossier-chip-status"
            >
              {{ LIBELLES_STATUT[dossier.statut] }}
            </v-chip>
          </div>

          <div class="dossier-progress">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption text-medium-emphasis">Progression</span>
              <span class="text-caption font-weight-bold">{{ dossier.progression_pct }}%</span>
            </div>
            <v-progress-linear
              :model-value="dossier.progression_pct"
              :color="dossier.progression_pct >= 100 ? 'success' : 'primary'"
              height="7"
              rounded
            />
          </div>

          <div class="dossier-card-footer d-flex align-center justify-space-between flex-wrap ga-2 mt-4 pt-4">
            <v-chip
              v-if="actionPourDossier(dossier)"
              size="small"
              color="warning"
              variant="tonal"
              class="font-weight-medium"
            >
              {{ actionPourDossier(dossier) }}
            </v-chip>
            <span v-else class="text-caption text-medium-emphasis">
              {{ dossier.date_soumission ? `Soumis le ${formaterJour(dossier.date_soumission)}` : 'Aucune action requise' }}
            </span>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              class="dossier-action-btn px-0 font-weight-bold"
              @click.stop="ouvrirDossier(dossier)"
            >
              {{ actionPourDossier(dossier) ? (dossier.statut === 'REJETE' ? 'Corriger' : 'Continuer') : 'Consulter' }}
              <ChevronRight :size="15" class="ml-1" />
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="pagePrecedente || pageSuivante" class="pagination-section mt-6 d-flex align-center justify-center ga-4">
      <v-btn
        variant="outlined"
        color="primary"
        :disabled="!pagePrecedente"
        @click="page -= 1"
      >
        <v-icon icon="mdi-chevron-left" class="mr-1" /> Précédent
      </v-btn>
      <span class="text-caption text-medium-emphasis font-weight-medium">Page {{ page }}</span>
      <v-btn
        variant="outlined"
        color="primary"
        :disabled="!pageSuivante"
        @click="page += 1"
      >
        Suivant <v-icon icon="mdi-chevron-right" class="ml-1" />
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.page-dossiers {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.text-muted {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.filtres-section {
  padding: 12px 16px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
}

.filtre-chip {
  font-weight: 600;
  font-size: 0.78rem;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.dossier-card {
  cursor: pointer;
  padding: 20px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dossier-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1) !important;
}

.dossier-card-header {
  min-height: 42px;
}

.min-width-0 {
  min-width: 0;
}

.dossier-reference {
  color: rgb(var(--v-theme-on-surface));
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.dossier-chip-status {
  flex-shrink: 0;
}

.dossier-card-footer {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.3);
  margin-top: auto;
}

.dossier-action-btn {
  min-height: 32px;
  font-weight: 700;
}

.dossier-avatar {
  flex-shrink: 0;
}

.btn-principal {
  letter-spacing: 0.04em;
  font-size: 13px;
}

@media (max-width: 600px) {
  .page-dossiers {
    padding: 20px 16px !important;
  }

  .page-dossiers header {
    margin-bottom: 24px !important;
  }

  .page-dossiers header h1 {
    font-size: 1.7rem !important;
  }

  .filtres-section {
    padding: 10px 12px;
  }
}
</style>
