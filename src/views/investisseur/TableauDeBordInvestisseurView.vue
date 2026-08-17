<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BellRing, Briefcase, CheckCircle2, ChevronRight, Clock, FolderPlus, XCircle } from '@lucide/vue'

import { creerDossier } from '@/api/dossiers'
import { listeSgi } from '@/api/sgi'
import { extraireMessageErreur } from '@/api/client'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useDossiersStore } from '@/stores/dossiers'
import { useNotificationsStore } from '@/stores/notifications'
import type { SgiPublique } from '@/types'
import { formaterJour } from '@/utils/format'

const router = useRouter()
const dossiers = useDossiersStore()
const notifications = useNotificationsStore()

const dialogNouveauDossier = ref(false)
const sgiDisponibles = ref<SgiPublique[]>([])
const sgiSelectionnee = ref('')
const creationEnCours = ref(false)
const erreurCreation = ref('')

async function ouvrirCreation() {
  erreurCreation.value = ''
  sgiSelectionnee.value = ''
  try {
    const reponse = await listeSgi()
    sgiDisponibles.value = reponse.results
    dialogNouveauDossier.value = true
  } catch (cause) {
    erreurCreation.value = extraireMessageErreur(cause)
  }
}

async function creer() {
  if (!sgiSelectionnee.value) return
  creationEnCours.value = true
  erreurCreation.value = ''
  try {
    const dossier = await creerDossier(sgiSelectionnee.value)
    dialogNouveauDossier.value = false
    await router.push({
      name: 'investisseur-dossier-edition',
      params: { id: dossier.id },
    })
  } catch (cause) {
    erreurCreation.value = extraireMessageErreur(cause)
  } finally {
    creationEnCours.value = false
  }
}

function demarrerDossier() {
  // Premier dossier : parcours de découverte (page onboarding).
  // Investisseur déjà actif : dialog de création direct.
  if (dossiers.liste.length === 0) {
    router.push({ name: 'onboarding-sgi' })
    return
  }
  void ouvrirCreation()
}

onMounted(async () => {
  await Promise.all([dossiers.chargerListe(), notifications.chargerCompte()])
})
</script>

<template>
  <v-container fluid class="dashboard-luxe pa-6">
    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-4">
      {{ dossiers.erreur }}
    </v-alert>

    <header class="mb-8">
      <h1 class="font-display text-h4 font-weight-bold mb-2">Aperçu du Portefeuille</h1>
      <p class="text-muted">Gérez vos dossiers de cession et suivez leur instruction en temps réel.</p>
    </header>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card glass-panel pa-5 hover-lift">
          <v-card-text class="pa-0 d-flex flex-column h-100">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-caption text-uppercase font-weight-bold text-primary tracking-widest">Total Dossiers</span>
              <Briefcase class="text-primary" :size="20" />
            </div>
            <div class="text-h3 font-display font-weight-bold mt-auto">{{ dossiers.total }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card glass-panel pa-5 hover-lift stat-encours">
          <v-card-text class="pa-0 d-flex flex-column h-100">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-caption text-uppercase font-weight-bold text-info tracking-widest">En Instruction</span>
              <Clock class="text-info" :size="20" />
            </div>
            <div class="text-h3 font-display font-weight-bold mt-auto">{{ dossiers.parStatut.EN_INSTRUCTION }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card glass-panel pa-5 hover-lift stat-valide">
          <v-card-text class="pa-0 d-flex flex-column h-100">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-caption text-uppercase font-weight-bold text-success tracking-widest">Validés</span>
              <CheckCircle2 class="text-success" :size="20" />
            </div>
            <div class="text-h3 font-display font-weight-bold mt-auto">{{ dossiers.parStatut.VALIDE }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card glass-panel pa-5 hover-lift stat-rejete">
          <v-card-text class="pa-0 d-flex flex-column h-100">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-caption text-uppercase font-weight-bold text-error tracking-widest">Rejetés</span>
              <XCircle class="text-error" :size="20" />
            </div>
            <div class="text-h3 font-display font-weight-bold mt-auto">{{ dossiers.parStatut.REJETE }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card class="glass-panel main-panel">
          <v-card-title class="d-flex align-center pt-6 px-6 font-display font-weight-bold">
            Activité Récente
            <v-spacer />
            <v-btn variant="text" color="primary" :to="{ name: 'investisseur-dossiers' }" class="text-sm">
              Tout voir <ChevronRight :size="16" class="ml-1" />
            </v-btn>
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <v-alert v-if="!dossiers.chargement && !dossiers.liste.length" type="info" variant="tonal" class="mt-4">
              Aucun dossier pour le moment. Commencez votre première souscription.
              <v-btn variant="text" color="primary" size="small" class="mt-1" @click="demarrerDossier">
                Découvrir les SGI <ChevronRight :size="14" class="ml-1" />
              </v-btn>
            </v-alert>
            <div v-else-if="dossiers.liste.length" class="mt-4">
              <v-card
                v-for="dossier in dossiers.liste"
                :key="dossier.id"
                class="mb-4 hover-lift dossier-item"
                @click="router.push({ name: 'investisseur-dossier-detail', params: { id: dossier.id } })"
              >
                <div class="d-flex align-center pa-4 flex-wrap">
                  <div class="dossier-info flex-grow-1">
                    <div class="text-h6 font-display font-weight-bold mb-1">{{ dossier.reference }}</div>
                    <div class="text-caption text-muted d-flex align-center">
                      <Clock :size="14" class="mr-1" /> Créé le {{ formaterJour(dossier.date_creation) }}
                    </div>
                  </div>
                  
                  <div class="dossier-jauge px-6 d-none d-sm-flex align-center justify-center">
                    <v-progress-circular
                      :model-value="dossier.progression_pct"
                      :color="dossier.progression_pct >= 100 ? 'success' : 'primary'"
                      size="60"
                      width="6"
                      class="jauge-geante"
                    >
                      <span class="text-caption font-weight-bold">{{ dossier.progression_pct }}%</span>
                    </v-progress-circular>
                  </div>

                  <div class="dossier-badge text-right pl-4 border-left-glass d-flex flex-column justify-center">
                    <v-chip
                      size="large"
                      :color="COULEURS_STATUT[dossier.statut]"
                      variant="flat"
                      class="badge-geant font-weight-bold"
                    >
                      {{ LIBELLES_STATUT[dossier.statut] }}
                    </v-chip>
                  </div>
                </div>
              </v-card>
            </div>
            <v-progress-linear v-if="dossiers.chargement" indeterminate color="primary" class="mt-4" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" class="d-flex flex-column gap-6">
        <v-card class="glass-panel flex-grow-1">
          <v-card-title class="d-flex align-center pt-6 px-6 font-display font-weight-bold">
            <FolderPlus :size="20" class="mr-2 text-primary" />
            Souscription
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <p class="text-body-2 text-muted mb-6">
              Ouvrez un nouveau dossier de cession de titres auprès d'une de nos Sociétés de Gestion partenaires.
            </p>
            <v-btn color="primary" variant="flat" block class="btn-principal hover-lift" @click="demarrerDossier">
              Démarrer un Dossier <ChevronRight :size="16" class="ml-2" />
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="glass-panel flex-grow-1 mt-6">
          <v-card-title class="d-flex align-center pt-6 px-6 font-display font-weight-bold">
            <BellRing :size="20" class="mr-2 text-primary" />
            Alertes
            <v-badge v-if="notifications.compteNonLues" :content="notifications.compteNonLues" color="error" class="ml-4" />
            <v-spacer />
            <v-btn variant="text" color="primary" class="text-sm" :to="{ name: 'investisseur-notifications' }">
              Historique
            </v-btn>
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <v-alert
              v-if="!notifications.compteNonLues"
              type="success"
              variant="tonal"
              class="mb-0"
            >
              Votre espace est à jour. Aucune action requise.
            </v-alert>
            <div v-else class="text-center py-4">
              <v-chip color="error" variant="flat" size="large" class="badge-geant font-weight-bold">
                {{ notifications.compteNonLues }} Action(s) Requise(s)
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogNouveauDossier" max-width="560">
      <v-card class="glass-panel modal-luxe">
        <v-card-title class="font-display pt-6 px-6">Sélection SGI Partenaire</v-card-title>
        <v-card-text class="px-6 py-4">
          <p class="text-body-2 text-muted mb-6">
            Le processus KYC sera adapté selon les exigences réglementaires de la Société de Gestion sélectionnée.
          </p>
          <v-alert v-if="erreurCreation" type="error" variant="tonal" class="mb-4">
            {{ erreurCreation }}
          </v-alert>
          <div class="pa-1 border-radius-8">
            <v-select
              v-model="sgiSelectionnee"
              :items="sgiDisponibles.map((s) => ({ value: s.id, title: `${s.nom} (${s.code_sgi})` }))"
              label="Sélectionner une Institution"
              variant="plain"
              hide-details
              class="select-luxe"
            />
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="text" color="grey-lighten-1" @click="dialogNouveauDossier = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="btn-principal"
            :loading="creationEnCours"
            :disabled="!sgiSelectionnee"
            @click="creer"
          >
            Créer l'espace <ChevronRight :size="16" class="ml-1" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.dashboard-luxe {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.text-muted {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.kpi-card {
  height: 120px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)) 0%, transparent 100%);
  opacity: 0.5;
}

.stat-encours::before { background: linear-gradient(90deg, rgb(var(--v-theme-info)) 0%, transparent 100%); }
.stat-valide::before { background: linear-gradient(90deg, rgb(var(--v-theme-success)) 0%, transparent 100%); }
.stat-rejete::before { background: linear-gradient(90deg, rgb(var(--v-theme-error)) 0%, transparent 100%); }

.main-panel {
  border-radius: 16px;
  height: 100%;
}

.dossier-item {
  border-radius: 12px;
  cursor: pointer;
  background: rgb(var(--v-theme-surface-variant)) !important;
  border: 1px solid rgb(var(--v-theme-outline));
  transition: all 0.3s ease;
}

.dossier-item:hover {
  border-color: rgb(var(--v-theme-primary));
}

.jauge-geante :deep(.v-progress-circular__overlay) {
  stroke-linecap: round;
}

.badge-geant {
  font-size: 14px;
  height: 36px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.border-left-glass {
  border-left: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.btn-principal {
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 8px;
  text-transform: uppercase;
  font-size: 13px;
}

.modal-luxe {
  border-radius: 16px !important;
}

.select-luxe :deep(.v-field__input) {
  padding-top: 12px;
  padding-bottom: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.border-radius-8 {
  border-radius: 8px;
}
</style>