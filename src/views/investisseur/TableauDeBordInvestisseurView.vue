<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, BellRing, Briefcase, CheckCircle2, ChevronRight, Clock, FolderPlus, TrendingUp, FileText } from '@lucide/vue'

import { creerDossier } from '@/api/dossiers'
import { listeSgi } from '@/api/sgi'
import { extraireMessageErreur } from '@/api/client'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useDossiersStore } from '@/stores/dossiers'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import type { SgiPublique, StatutDossier } from '@/types'
import { formaterJour } from '@/utils/format'
import KpiCard from '@/components/investisseur/KpiCard.vue'

const router = useRouter()
const dossiers = useDossiersStore()
const notifications = useNotificationsStore()
const auth = useAuthStore()

const dialogNouveauDossier = ref(false)
const sgiDisponibles = ref<SgiPublique[]>([])
const sgiSelectionnee = ref('')
const creationEnCours = ref(false)
const erreurCreation = ref('')

const nomInvestisseur = computed(() => auth.utilisateur?.prenom ?? '')
const dashboard = computed(() => dossiers.dashboard)
const dossierAvecAction = computed(() =>
  dossiers.liste.find(
    (dossier) => dossier.statut === 'REJETE' || dossier.statut === 'BROUILLON',
  ),
)

function actionPourDossier(dossier: { statut: string; progression_pct: number }) {
  if (dossier.statut === 'REJETE') return 'Correction requise'
  if (dossier.statut === 'BROUILLON') {
    return dossier.progression_pct >= 100 ? 'Prêt à soumettre' : 'À compléter'
  }
  return ''
}

function ouvrirDossier(dossier: { id: string; statut: string; progression_pct: number }) {
  void router.push({
    name: dossier.statut === 'BROUILLON' || dossier.statut === 'REJETE'
      ? 'investisseur-dossier-edition'
      : 'investisseur-dossier-detail',
    params: { id: dossier.id },
  })
}

async function recharger() {
  await Promise.all([dossiers.chargerDashboard(), dossiers.chargerApercu(), notifications.chargerCompte()])
}

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
  if (dossiers.liste.length === 0) {
    router.push({ name: 'onboarding-sgi' })
    return
  }
  void ouvrirCreation()
}

onMounted(async () => {
  await Promise.all([dossiers.chargerDashboard(), dossiers.chargerApercu(), notifications.chargerCompte()])
})

/* --- Computed pour l'UI --- */
const salutation = computed(() => {
  const heure = new Date().getHours()
  if (heure < 12) return 'Bonjour'
  if (heure < 18) return 'Bon après-midi'
  return 'Bonsoir'
})

const initialesNom = computed(() => {
  const prenom = auth.utilisateur?.prenom ?? ''
  const nom = auth.utilisateur?.nom ?? ''
  return ((prenom[0] ?? '') + (nom[0] ?? '')).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = ['#0C3C94', '#F7C600', '#009639', '#3B82F6', '#8B5CF6', '#EC4899']
  const str = auth.utilisateur?.email ?? 'investisseur'
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})

const actionIcon = computed(() => {
  if (!dossierAvecAction.value) return AlertCircle
  return dossierAvecAction.value.statut === 'REJETE' ? AlertCircle : Clock
})

const actionBgColor = computed(() => {
  if (!dossierAvecAction.value) return 'var(--v-theme-warning)'
  return dossierAvecAction.value.statut === 'REJETE' ? 'rgba(228, 0, 43, 0.15)' : 'rgba(12, 60, 148, 0.15)'
})

const actionTitle = computed(() => {
  if (!dossierAvecAction.value) return ''
  return dossierAvecAction.value.statut === 'REJETE' ? 'Corrections demandées' : 'Dossier à compléter'
})

const actionBtnText = computed(() => {
  if (!dossierAvecAction.value) return ''
  return dossierAvecAction.value.statut === 'REJETE' ? 'Corriger' : 'Continuer'
})

const getStatutColor = (statut: string) =>
  COULEURS_STATUT[statut as StatutDossier] ?? '#0C3C94'

const avatarBgColor = (statut: string) => getStatutColor(statut) + '20'
const avatarColorFn = (statut: string) => getStatutColor(statut)

/* --- KPI Cards --- */
const kpiCards = computed(() => [
  {
    key: 'total',
    icon: Briefcase,
    value: dashboard.value?.total_dossiers ?? 0,
    label: 'Total dossiers',
    color: '#0C3C94',
    trend: '+2 ce mois',
  },
  {
    key: 'progression',
    icon: TrendingUp,
    value: (dashboard.value?.progression_moyenne ?? 0) + '%',
    label: 'Progression moy.',
    color: '#3B82F6',
    trend: 'Objectif 80%',
  },
  {
    key: 'enInstruction',
    icon: Clock,
    value: dashboard.value?.par_statut?.EN_INSTRUCTION ?? 0,
    label: 'En instruction',
    color: '#F7C600',
  },
  {
    key: 'valides',
    icon: CheckCircle2,
    value: dashboard.value?.par_statut?.VALIDE ?? 0,
    label: 'Validés',
    color: '#009639',
  },
])
</script>

<template>
  <v-container fluid class="dashboard-mobile pa-4">
    <!-- Skeleton loading initial -->
    <div v-if="dossiers.dashboardChargement" class="skeleton-dashboard" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div class="skeleton-header">
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
      </div>
      <div class="skeleton-card skeleton-card--action"></div>
      <div class="skeleton-kpi-grid">
        <div class="skeleton-kpi" v-for="i in 4" :key="i"></div>
      </div>
      <div class="skeleton-card skeleton-card--dossiers" v-for="i in 3" :key="i"></div>
    </div>

    <!-- Contenu principal -->
    <div v-else class="dashboard-contenu">
      <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-4" closable>
        <div class="d-flex align-center flex-wrap ga-3">
          <span>{{ dossiers.erreur }}</span>
          <v-btn variant="tonal" size="small" @click="recharger">Réessayer</v-btn>
        </div>
      </v-alert>

      <v-alert v-else-if="erreurCreation && !dialogNouveauDossier" type="error" variant="tonal" border="start" class="mb-4" closable>
        <div class="d-flex align-center flex-wrap ga-3">
          <span>Impossible de charger la liste des SGI — {{ erreurCreation }}</span>
          <v-btn variant="tonal" size="small" @click="ouvrirCreation">Réessayer</v-btn>
        </div>
      </v-alert>

      <!-- Header avec salutation -->
      <header class="dashboard-header" data-aos="fade-down" data-aos-duration="600">
        <div class="header-greeting">
          <div class="greeting-text">
            <span class="greeting-time">{{ salutation }}</span>
            <span class="greeting-name">{{ nomInvestisseur ? `, ${nomInvestisseur}` : '' }}</span>
          </div>
          <div class="greeting-avatar" :style="{ backgroundColor: avatarColor }">
            {{ initialesNom }}
          </div>
        </div>
        <p class="header-subtitle" data-aos="fade-up" data-aos-delay="100">Suivez vos demandes d'ouverture de compte-titres</p>
      </header>

      <!-- Carte demande en cours / action requise -->
      <div v-if="dossierAvecAction" class="carte-action" data-aos="slide-up" data-aos-duration="600" data-aos-delay="100">
        <div class="action-icon" :style="{ backgroundColor: actionBgColor }">
          <component :is="actionIcon" :size="24" />
        </div>
        <div class="action-content">
          <div class="action-label">Action requise</div>
          <div class="action-title">{{ actionTitle }}</div>
          <div class="action-meta">
            <span>{{ dossierAvecAction.reference }}</span>
            <span class="action-progress">{{ dossierAvecAction.progression_pct }}% complété</span>
          </div>
        </div>
        <v-btn
          color="warning"
          variant="flat"
          class="action-btn"
          @click="ouvrirDossier(dossierAvecAction)"
        >
          {{ actionBtnText }}
          <ChevronRight :size="16" class="ml-2" />
        </v-btn>
      </div>

      <!-- KPI Cards Grid -->
      <div class="kpi-grid" data-aos="fade-up" data-aos-duration="500" data-aos-delay="150">
        <KpiCard
          v-for="(kpi, index) in kpiCards"
          :key="kpi.key"
          :icon="kpi.icon"
          :value="kpi.value"
          :label="kpi.label"
          :color="kpi.color"
          :trend="kpi.trend"
          :data-aos-delay="index * 80 + 150"
        />
      </div>

      <!-- Section Mes dossiers récents -->
      <section class="section-dossiers" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">Mes dossiers</h2>
            <p class="section-caption">Vos demandes d'ouverture de compte-titres</p>
          </div>
          <v-btn
            v-if="dossiers.liste.length"
            variant="text"
            color="primary"
            :to="{ name: 'investisseur-dossiers' }"
            class="section-link"
          >
            Voir tout <ChevronRight :size="14" class="ml-1" />
          </v-btn>
        </div>

        <v-alert v-if="!dossiers.chargement && !dossiers.liste.length" type="info" variant="tonal" class="mt-4" data-aos="fade-up">
          Aucun dossier pour le moment. Commencez votre première demande d'ouverture.
          <v-btn variant="text" color="primary" size="small" class="mt-2" @click="demarrerDossier">
            Démarrer un dossier <ChevronRight :size="14" class="ml-1" />
          </v-btn>
        </v-alert>

        <div v-else-if="dossiers.liste.length" class="dossiers-liste" role="list">
          <div
            v-for="(dossier, index) in dossiers.liste.slice(0, 3)"
            :key="dossier.id"
            class="dossier-card-mobile"
            @click="ouvrirDossier(dossier)"
            role="listitem"
            tabindex="0"
            @keydown.enter="ouvrirDossier(dossier)"
            :data-aos="index === 0 ? 'slide-up' : 'fade-up'"
            :data-aos-delay="index * 100 + 250"
            :data-aos-duration="500"
          >
            <div class="dossier-header-row">
              <div class="dossier-avatar-wrapper" :style="{ backgroundColor: avatarBgColor(dossier.statut) }">
                <FileText :size="20" :style="{ color: avatarColorFn(dossier.statut) }" />
              </div>
              <div class="dossier-info-main">
                <div class="dossier-ref">{{ dossier.reference }}</div>
                <div class="dossier-meta">
                  <Clock :size="12" class="mr-1" />
                  <span>Créé le {{ formaterJour(dossier.date_creation) }}</span>
                </div>
              </div>
              <span class="statut-badge" :style="{ backgroundColor: avatarColorFn(dossier.statut), color: 'white' }">
                {{ LIBELLES_STATUT[dossier.statut] }}
              </span>
            </div>

            <div class="dossier-progress-mobile">
              <div class="progress-header">
                <span class="progress-label">Progression</span>
                <span class="progress-value">{{ dossier.progression_pct }}%</span>
              </div>
              <div class="progress-bar-mobile">
                <div
                  class="progress-fill-mobile"
                  :style="{ width: dossier.progression_pct + '%', backgroundColor: dossier.progression_pct >= 100 ? 'var(--v-theme-success)' : 'var(--v-theme-primary)' }"
                ></div>
              </div>
            </div>

            <div class="dossier-footer-mobile">
              <span v-if="actionPourDossier(dossier)" class="action-tag warning">{{ actionPourDossier(dossier) }}</span>
              <span v-else-if="dossier.date_soumission" class="action-tag neutral">Soumis le {{ formaterJour(dossier.date_soumission) }}</span>
              <span v-else class="action-tag neutral">Aucune action requise</span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                class="dossier-action-btn"
                @click.stop="ouvrirDossier(dossier)"
              >
                {{ actionPourDossier(dossier) ? (dossier.statut === 'REJETE' ? 'Corriger' : 'Continuer') : 'Consulter' }}
                <ChevronRight :size="14" class="ml-1" />
              </v-btn>
            </div>
          </div>

          <v-btn
            v-if="dossiers.liste.length > 3"
            variant="text"
            color="primary"
            :to="{ name: 'investisseur-dossiers' }"
            class="voir-plus-btn"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Voir les {{ dossiers.liste.length - 3 }} autres dossiers
            <ChevronRight :size="14" class="ml-1" />
          </v-btn>
        </div>
      </section>

      <!-- Sidebar cards -->
      <section class="sidebar-cards" data-aos="fade-up" data-aos-duration="500" data-aos-delay="300">
        <div class="card-grid">
          <!-- Carte Nouveau Dossier -->
          <v-card class="sidebar-card" @click="demarrerDossier">
            <v-card-title class="d-flex align-center pt-5 px-5 font-display font-weight-bold">
              <div class="card-icon card-icon--primary" aria-hidden="true">
                <FolderPlus :size="20" />
              </div>
              <div>
                <div class="card-title">Nouveau dossier</div>
                <div class="card-subtitle">Ouvrir un compte-titres</div>
              </div>
            </v-card-title>
            <v-card-text class="px-5 pb-5">
              <p class="text-body-2 text-muted mb-5">Déposez une nouvelle demande auprès d'une Société de Gestion partenaire.</p>
              <v-btn color="primary" variant="flat" block class="btn-principal hover-lift">
                Démarrer <ChevronRight :size="16" class="ml-2" />
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Carte Alertes -->
          <v-card class="sidebar-card">
            <v-card-title class="d-flex align-center pt-5 px-5 font-display font-weight-bold">
              <div class="card-icon card-icon--warning" aria-hidden="true">
                <BellRing :size="20" />
              </div>
              <div>
                <div class="card-title">Alertes</div>
                <div class="card-subtitle">{{ notifications.compteNonLues || 0 }} action(s) requise(s)</div>
              </div>
            </v-card-title>
            <v-card-text class="px-5 pb-5">
              <v-alert v-if="!notifications.compteNonLues" type="success" variant="tonal" class="mb-0">
                Votre espace est à jour. Aucune action requise.
              </v-alert>
              <div v-else class="text-center py-3">
                <v-chip color="error" variant="flat" size="large" class="badge-geant font-weight-bold">
                  {{ notifications.compteNonLues }} Action(s) Requise(s)
                </v-chip>
              </div>
              <v-btn variant="text" color="primary" class="text-sm mt-3" :to="{ name: 'investisseur-notifications' }">
                Voir l'historique <ChevronRight :size="14" class="ml-1" />
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Carte Activités récentes -->
          <v-card class="sidebar-card">
            <v-card-title class="d-flex align-center pt-5 px-5 font-display font-weight-bold">
              <div class="card-icon card-icon--info" aria-hidden="true">
                <Clock :size="20" />
              </div>
              <div>
                <div class="card-title">Activité récente</div>
                <div class="card-subtitle">{{ dashboard?.dernieres_activites?.length ?? 0 }} action(s)</div>
              </div>
            </v-card-title>
            <v-card-text class="px-5 pb-5">
              <v-list v-if="dashboard?.dernieres_activites?.length" lines="two" class="pa-0 bg-transparent">
                <v-list-item
                  v-for="activite in dashboard.dernieres_activites.slice(0, 3)"
                  :key="`${activite.reference}-${activite.date_action}`"
                  class="px-0"
                >
                  <v-list-item-title class="font-weight-medium">{{ activite.reference }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ LIBELLES_STATUT[activite.statut] }} · {{ formaterJour(activite.date_action) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <p v-else class="text-body-2 text-muted mb-0">Aucune activité pour le moment.</p>
            </v-card-text>
          </v-card>
        </div>
      </section>
    </div>

    <!-- Dialog création dossier -->
    <v-dialog v-model="dialogNouveauDossier" max-width="560">
      <v-card class="glass-panel modal-luxe">
        <v-card-title class="font-display pt-6 px-6">Sélection SGI Partenaire</v-card-title>
        <v-card-text class="px-6 py-4">
          <p class="text-body-2 text-muted mb-6">Le processus KYC sera adapté selon les exigences réglementaires de la Société de Gestion sélectionnée.</p>
          <v-alert v-if="erreurCreation" type="error" variant="tonal" class="mb-4">{{ erreurCreation }}</v-alert>
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
          <v-btn color="primary" variant="flat" class="btn-principal" :loading="creationEnCours" :disabled="!sgiSelectionnee" @click="creer">
            Créer l'espace <ChevronRight :size="16" class="ml-1" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.dashboard-mobile {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.dashboard-contenu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0 8px;
}

.header-greeting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.greeting-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.greeting-time {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

.greeting-name {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.02em;
}

.greeting-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: white;
}

.header-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 400;
}

/* --- Carte Action --- */
.carte-action {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  position: relative;
  overflow: hidden;
}

.carte-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}

.action-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-primary));
}

.action-title {
  margin-top: 2px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.action-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.action-progress {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.action-btn {
  flex-shrink: 0;
  margin-left: 8px;
  height: 40px;
  font-weight: 700;
  border-radius: 10px;
}

/* --- KPI Grid --- */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* --- Section Dossiers --- */
.section-dossiers {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
}

.section-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.section-caption {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.section-link {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  height: 32px;
}

.dossiers-liste {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* --- Dossier Card Mobile --- */
.dossier-card-mobile {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.dossier-card-mobile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.dossier-card-mobile:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.dossier-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dossier-avatar-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.dossier-info-main {
  flex: 1;
  min-width: 0;
}

.dossier-ref {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.dossier-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.statut-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dossier-progress-mobile {
  padding-top: 12px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.progress-label {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

.progress-value {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.progress-bar-mobile {
  height: 6px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  overflow: hidden;
}

.progress-fill-mobile {
  height: 100%;
  border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.dossier-footer-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.action-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.action-tag.warning {
  background: rgba(217, 119, 6, 0.15);
  color: #D97706;
}

.action-tag.neutral {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-on-surface-variant));
}

.dossier-action-btn {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  height: 32px;
  border-radius: 8px;
}

.voir-plus-btn {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
}

/* --- Sidebar Cards --- */
.sidebar-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  cursor: pointer;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.sidebar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin-right: 14px;
}

.card-icon--primary { background: rgba(12, 60, 148, 0.1); color: #0C3C94; }
.card-icon--warning { background: rgba(217, 119, 6, 0.1); color: #D97706; }
.card-icon--info { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }

.card-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 2px;
}

.card-subtitle {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.text-muted {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.btn-principal {
  height: 44px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border-radius: 10px;
  text-transform: none;
}

.badge-geant {
  font-size: 14px;
  height: 36px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* --- Skeleton Loading --- */
.skeleton-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0 100px;
}

.skeleton-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgb(var(--v-theme-outline)) 25%, rgb(var(--v-theme-surface-variant)) 50%, rgb(var(--v-theme-outline)) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-line--short { width: 40%; }
.skeleton-line--medium { width: 60%; }

.skeleton-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.skeleton-kpi {
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgb(var(--v-theme-outline)) 25%, rgb(var(--v-theme-surface-variant)) 50%, rgb(var(--v-theme-outline)) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-card {
  border-radius: 16px;
  background: linear-gradient(90deg, rgb(var(--v-theme-outline)) 25%, rgb(var(--v-theme-surface-variant)) 50%, rgb(var(--v-theme-outline)) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-card--action { height: 90px; }
.skeleton-card--dossiers { height: 160px; }
.skeleton-card--side { height: 140px; }

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive */
@media (min-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-mobile {
    max-width: 1100px;
    margin: 0 auto;
  }

  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .dashboard-mobile {
    padding: 16px 12px !important;
  }

  .greeting-name {
    font-size: 24px;
  }

  .kpi-grid {
    gap: 10px;
  }

  .dossier-card-mobile {
    padding: 16px;
  }

  .dossier-ref {
    font-size: 14px;
  }

  .statut-badge {
    min-width: 64px;
    font-size: 9px;
  }

  .btn-principal {
    height: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .skeleton-kpi,
  .skeleton-card {
    animation: none;
  }

  .dossier-card-mobile,
  .sidebar-card,
  .kpi-card,
  .carte-action {
    transition: none;
  }
}
</style>