<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, ChevronRight, FolderOpen, FileText, Search, X } from '@lucide/vue'
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
const recherche = ref('')

const dossiersFiltres = computed(() => {
  const terme = recherche.value.trim().toLowerCase()
  if (!terme) return dossiers.value
  return dossiers.value.filter(
    (d) => d.reference.toLowerCase().includes(terme) || d.sgi.toLowerCase().includes(terme),
  )
})

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

function reinitialiserFiltres() {
  filtresStatut.value = []
  recherche.value = ''
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

function couleurStatut(statut: StatutDossier) {
  return COULEURS_STATUT[statut] ?? '#0C3C94'
}

watch([filtresStatut, page], () => void charger())

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-demandes pa-4">
    <!-- Header -->
    <header class="page-header" data-aos="fade-down" data-aos-duration="600">
      <div>
        <h1 class="page-title">Mes demandes</h1>
        <p class="page-subtitle">Gérez vos demandes d'ouverture de compte-titres</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        class="btn-nouvelle"
        :to="{ name: 'onboarding-sgi' }"
        data-aos="zoom-in"
        data-aos-delay="100"
      >
        Nouvelle
      </v-btn>
    </header>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-4" closable>
      <div class="d-flex align-center flex-wrap ga-3">
        <span>{{ erreur }}</span>
        <v-btn variant="tonal" size="small" @click="charger">Réessayer</v-btn>
      </div>
    </v-alert>

    <!-- Barre de recherche -->
    <div class="barre-recherche" data-aos="fade-up" data-aos-delay="100">
      <Search :size="18" class="icone-recherche" aria-hidden="true" />
      <input
        v-model="recherche"
        type="search"
        class="champ-recherche"
        placeholder="Rechercher une référence ou SGI…"
        aria-label="Rechercher un dossier"
      />
      <button
        v-if="recherche"
        class="effacer-recherche"
        aria-label="Effacer la recherche"
        @click="recherche = ''"
      >
        <X :size="16" />
      </button>
    </div>

    <!-- Filtres par statut -->
    <div class="filtres-scroll" data-aos="fade-up" data-aos-delay="150">
      <button
        v-for="statut in STATUTS_DOSSIER"
        :key="statut"
        class="filtre-chip"
        :class="{ actif: filtresStatut.includes(statut) }"
        :style="filtresStatut.includes(statut) ? { backgroundColor: couleurStatut(statut), borderColor: couleurStatut(statut), color: 'white' } : { borderColor: couleurStatut(statut) + '55', color: couleurStatut(statut) }"
        @click="basculerFiltre(statut)"
      >
        <span class="filtre-dot" :style="{ backgroundColor: filtresStatut.includes(statut) ? 'white' : couleurStatut(statut) }"></span>
        {{ LIBELLES_STATUT[statut] }}
      </button>
      <button
        v-if="filtresStatut.length || recherche"
        class="filtre-chip filtre-reset"
        @click="reinitialiserFiltres"
      >
        Réinitialiser
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="chargement" class="skeleton-liste" aria-busy="true" aria-label="Chargement des demandes">
      <div v-for="i in 4" :key="i" class="skeleton-carte-demandes"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!dossiersFiltres.length" class="empty-state" data-aos="zoom-in" data-aos-duration="500">
      <div class="empty-icon" aria-hidden="true">
        <FolderOpen :size="36" />
      </div>
      <h2 class="empty-title">
        {{ filtresStatut.length || recherche ? 'Aucun résultat' : 'Aucune demande' }}
      </h2>
      <p class="empty-text">
        {{ filtresStatut.length || recherche ? 'Aucune demande ne correspond à ces critères.' : "Vous n'avez pas encore de dossier. Commencez votre première demande d'ouverture." }}
      </p>
      <v-btn
        v-if="!filtresStatut.length && !recherche"
        color="primary"
        variant="flat"
        class="btn-principal"
        :to="{ name: 'onboarding-sgi' }"
      >
        Démarrer un dossier <ChevronRight :size="16" class="ml-2" />
      </v-btn>
      <v-btn v-else variant="outlined" color="primary" @click="reinitialiserFiltres">
        Réinitialiser les filtres
      </v-btn>
    </div>

    <!-- Liste des demandes -->
    <div v-else class="liste-demandes" role="list">
      <p class="compteur-resultats">{{ total }} demande(s)</p>
      <article
        v-for="(dossier, index) in dossiersFiltres"
        :key="dossier.id"
        class="carte-demande"
        data-aos="fade-up"
        :data-aos-delay="index * 70"
        data-aos-duration="450"
        tabindex="0"
        role="listitem"
        @click="ouvrirDossier(dossier)"
        @keydown.enter="ouvrirDossier(dossier)"
      >
        <div class="carte-header">
          <div class="demande-avatar" :style="{ backgroundColor: couleurStatut(dossier.statut) + '20' }">
            <FileText :size="20" :style="{ color: couleurStatut(dossier.statut) }" />
          </div>
          <div class="demande-info">
            <div class="demande-ref">{{ dossier.reference }}</div>
            <div class="demande-sgi">{{ dossier.sgi }}</div>
          </div>
          <span class="statut-badge" :style="{ backgroundColor: couleurStatut(dossier.statut) }">
            {{ LIBELLES_STATUT[dossier.statut] }}
          </span>
        </div>

        <div class="carte-progress">
          <div class="progress-header">
            <span class="progress-label">Progression</span>
            <span class="progress-value">{{ dossier.progression_pct }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: dossier.progression_pct + '%', backgroundColor: dossier.progression_pct >= 100 ? 'rgb(var(--v-theme-success))' : 'rgb(var(--v-theme-primary))' }"
            ></div>
          </div>
        </div>

        <div class="carte-footer">
          <span class="demande-date">
            <Clock :size="12" class="mr-1" />
            {{ formaterJour(dossier.date_creation) }}
          </span>
          <span v-if="actionPourDossier(dossier)" class="action-tag warning">{{ actionPourDossier(dossier) }}</span>
          <span v-else class="action-tag neutral">
            {{ dossier.date_soumission ? `Soumis le ${formaterJour(dossier.date_soumission)}` : 'Aucune action' }}
          </span>
          <ChevronRight :size="18" class="chevron" aria-hidden="true" />
        </div>
      </article>

      <!-- Pagination -->
      <div v-if="pagePrecedente || pageSuivante" class="pagination">
        <v-btn variant="outlined" color="primary" :disabled="!pagePrecedente" @click="page -= 1">
          Précédent
        </v-btn>
        <span class="page-indic">Page {{ page }}</span>
        <v-btn variant="outlined" color="primary" :disabled="!pageSuivante" @click="page += 1">
          Suivant
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.page-demandes {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(24px, 5vw, 30px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.btn-nouvelle {
  flex-shrink: 0;
  height: 40px;
  font-weight: 700;
  border-radius: 10px;
  text-transform: none;
}

/* --- Barre de recherche --- */
.barre-recherche {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 14px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  margin-bottom: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.barre-recherche:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}

.icone-recherche {
  flex-shrink: 0;
  color: rgb(var(--v-theme-on-surface-variant));
}

.champ-recherche {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  font-family: inherit;
  color: rgb(var(--v-theme-on-surface));
}

.champ-recherche::placeholder {
  color: rgb(var(--v-theme-on-surface-variant));
}

.effacer-recherche {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  cursor: pointer;
}

/* --- Filtres --- */
.filtres-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 18px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filtres-scroll::-webkit-scrollbar {
  display: none;
}

.filtre-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1.5px solid rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.filtre-chip:active {
  transform: scale(0.96);
}

.filtre-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.filtre-reset {
  border-style: dashed;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* --- Liste --- */
.liste-demandes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compteur-resultats {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.carte-demande {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.carte-demande:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.carte-demande:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.carte-demande:active {
  transform: scale(0.99);
}

.carte-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.demande-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.demande-info {
  flex: 1;
  min-width: 0;
}

.demande-ref {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demande-sgi {
  margin-top: 3px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.statut-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  color: white;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.carte-progress {
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

.progress-bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.carte-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.demande-date {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface-variant));
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

.chevron {
  margin-left: auto;
  flex-shrink: 0;
  color: rgb(var(--v-theme-primary));
}

/* --- Empty state --- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  margin-bottom: 20px;
}

.empty-title {
  margin: 0 0 8px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.empty-text {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface-variant));
}

.btn-principal {
  height: 44px;
  font-weight: 700;
  border-radius: 10px;
  text-transform: none;
}

/* --- Pagination --- */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.page-indic {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* --- Skeleton --- */
.skeleton-liste {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-carte-demandes {
  height: 160px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgb(var(--v-theme-outline)) 25%, rgb(var(--v-theme-surface-variant)) 50%, rgb(var(--v-theme-outline)) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (min-width: 768px) {
  .liste-demandes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .compteur-resultats,
  .pagination {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .page-demandes {
    max-width: 1100px;
    margin: 0 auto;
  }

  .liste-demandes {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .page-demandes {
    padding: 16px 12px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-carte-demandes {
    animation: none;
  }

  .carte-demande,
  .filtre-chip,
  .progress-fill {
    transition: none;
  }
}
</style>