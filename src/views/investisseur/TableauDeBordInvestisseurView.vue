<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, BellRing, Briefcase, CheckCircle2, ChevronRight, Clock, FolderPlus, XCircle } from '@lucide/vue'

import { creerDossier } from '@/api/dossiers'
import { listeSgi } from '@/api/sgi'
import { extraireMessageErreur } from '@/api/client'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useDossiersStore } from '@/stores/dossiers'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import type { SgiPublique } from '@/types'
import { formaterJour } from '@/utils/format'

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
  // Premier dossier : parcours de découverte (page onboarding).
  // Investisseur déjà actif : dialog de création direct.
  if (dossiers.liste.length === 0) {
    router.push({ name: 'onboarding-sgi' })
    return
  }
  void ouvrirCreation()
}

onMounted(async () => {
  await Promise.all([dossiers.chargerDashboard(), dossiers.chargerApercu(), notifications.chargerCompte()])
})
</script>

<template>
  <v-container fluid class="dashboard-luxe pa-6">
    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-4" closable>
      <div class="d-flex align-center flex-wrap ga-3">
        <span>{{ dossiers.erreur }}</span>
        <v-btn variant="tonal" size="small" @click="recharger">Réessayer</v-btn>
      </div>
    </v-alert>

    <!-- Échec du chargement des SGI : visible même si le dialog n'a pas pu s'ouvrir -->
    <v-alert v-if="erreurCreation && !dialogNouveauDossier" type="error" variant="tonal" border="start" class="mb-4" closable>
      <div class="d-flex align-center flex-wrap ga-3">
        <span>Impossible de charger la liste des SGI — {{ erreurCreation }}</span>
        <v-btn variant="tonal" size="small" @click="ouvrirCreation">Réessayer</v-btn>
      </div>
    </v-alert>

    <header class="mb-8">
      <h1 class="font-display text-h4 font-weight-bold mb-2">
        Bonjour{{ nomInvestisseur ? `, ${nomInvestisseur}` : '' }}
      </h1>
      <p class="text-muted">Suivez vos demandes d'ouverture de compte-titres et les prochaines actions à effectuer.</p>
    </header>

    <v-card v-if="dossierAvecAction" color="warning" variant="tonal" class="mb-6">
      <v-card-text class="d-flex align-center flex-wrap ga-4 pa-5">
        <v-avatar color="warning" variant="tonal" size="44">
          <AlertCircle :size="22" />
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-overline text-warning font-weight-bold">Action à effectuer</div>
          <div class="text-body-1 font-weight-bold">
            {{ dossierAvecAction.statut === 'REJETE' ? 'Des corrections sont demandées' : 'Votre dossier doit être complété' }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ dossierAvecAction.reference }} · {{ dossierAvecAction.progression_pct }}% complété
          </div>
        </div>
        <v-btn color="warning" variant="flat" @click="ouvrirDossier(dossierAvecAction)">
          {{ dossierAvecAction.statut === 'REJETE' ? 'Corriger' : 'Continuer' }}
          <ChevronRight :size="16" class="ml-2" />
        </v-btn>
      </v-card-text>
    </v-card>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 hover-lift">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="icon-box pa-3">
              <Briefcase :size="24" />
            </div>
          </div>
          <div class="text-h3 font-display font-weight-bold text-primary mb-1">{{ dashboard?.total_dossiers ?? 0 }}</div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">Total Dossiers</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 hover-lift">
          <div class="d-flex align-center justify-space-between mb-4">
            <v-progress-circular :model-value="dashboard?.progression_moyenne ?? 0" color="primary" size="30" width="3" />
          </div>
          <div class="text-h3 font-display font-weight-bold text-primary mb-1">{{ dashboard?.progression_moyenne ?? 0 }}%</div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">Progression moyenne</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 hover-lift">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="icon-box icon-box-info pa-3">
              <Clock :size="24" />
            </div>
          </div>
          <div class="text-h3 font-display font-weight-bold text-info mb-1">{{ dashboard?.par_statut.EN_INSTRUCTION ?? 0 }}</div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">En Instruction</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 hover-lift">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="icon-box icon-box-success pa-3">
              <CheckCircle2 :size="24" />
            </div>
          </div>
          <div class="text-h3 font-display font-weight-bold text-success mb-1">{{ dashboard?.par_statut.VALIDE ?? 0 }}</div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">Validés</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card pa-6 hover-lift">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="icon-box icon-box-error pa-3">
              <XCircle :size="24" />
            </div>
          </div>
          <div class="text-h3 font-display font-weight-bold text-error mb-1">{{ dashboard?.par_statut.REJETE ?? 0 }}</div>
          <div class="text-caption font-weight-medium text-medium-emphasis text-uppercase tracking-wider mt-auto">Rejetés</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card class="glass-panel">
          <v-card-title class="d-flex align-center pt-6 px-6 font-display font-weight-bold">
            <div>
              <div class="text-h6">Mes dossiers</div>
              <div class="section-caption">Vos demandes d'ouverture de compte-titres</div>
            </div>
            <v-spacer />
            <v-btn variant="text" color="primary" :to="{ name: 'investisseur-dossiers' }" class="text-sm">
              Voir tout <ChevronRight :size="16" class="ml-1" />
            </v-btn>
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <v-alert v-if="!dossiers.chargement && !dossiers.liste.length" type="info" variant="tonal" class="mt-4">
              Aucun dossier pour le moment. Commencez votre première demande d'ouverture.
              <v-btn variant="text" color="primary" size="small" class="mt-1" @click="demarrerDossier">
                Découvrir les SGI <ChevronRight :size="14" class="ml-1" />
              </v-btn>
            </v-alert>
            <div v-else-if="dossiers.liste.length" class="dossiers-recents mt-4">
              <v-card
                v-for="dossier in dossiers.liste"
                :key="dossier.id"
                class="dossier-item mb-3"
                variant="flat"
                @click="ouvrirDossier(dossier)"
              >
                <div class="dossier-topline d-flex align-center flex-wrap ga-3">
                  <v-avatar
                    :color="COULEURS_STATUT[dossier.statut]"
                    variant="tonal"
                    size="38"
                    class="dossier-avatar"
                  >
                    <Briefcase :size="18" />
                  </v-avatar>
                  <div class="dossier-info flex-grow-1">
                    <div class="dossier-reference">{{ dossier.reference }}</div>
                    <div class="text-caption text-muted d-flex align-center mt-1">
                      <Clock :size="13" class="mr-1" />
                      Créé le {{ formaterJour(dossier.date_creation) }}
                    </div>
                  </div>
                  <v-chip
                    :color="COULEURS_STATUT[dossier.statut]"
                    variant="tonal"
                    size="small"
                    class="dossier-status font-weight-bold"
                  >
                    {{ LIBELLES_STATUT[dossier.statut] }}
                  </v-chip>
                </div>

                <div class="dossier-progress mt-4">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption text-medium-emphasis">Progression du dossier</span>
                    <span class="text-caption font-weight-bold">{{ dossier.progression_pct }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="dossier.progression_pct"
                    :color="dossier.progression_pct >= 100 ? 'success' : 'primary'"
                    height="7"
                    rounded
                  />
                </div>

                <div class="dossier-bottomline d-flex align-center justify-space-between flex-wrap ga-2 mt-4">
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
                    class="dossier-action px-0"
                    @click.stop="ouvrirDossier(dossier)"
                  >
                    {{ actionPourDossier(dossier) ? (dossier.statut === 'REJETE' ? 'Corriger' : 'Continuer') : 'Consulter' }}
                    <ChevronRight :size="15" class="ml-1" />
                  </v-btn>
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
            Ouverture de compte-titres
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <p class="text-body-2 text-muted mb-6">
              Déposez une nouvelle demande d'ouverture de compte-titres auprès d'une de nos Sociétés de Gestion partenaires.
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

        <v-card class="glass-panel flex-grow-1 mt-6">
          <v-card-title class="d-flex align-center pt-6 px-6 font-display font-weight-bold">
            <Clock :size="20" class="mr-2 text-primary" />
            Dernières activités
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <v-list v-if="dashboard?.dernieres_activites.length" lines="two" class="pa-0 bg-transparent">
              <v-list-item
                v-for="activite in dashboard.dernieres_activites.slice(0, 4)"
                :key="`${activite.reference}-${activite.date_action}`"
                class="px-0"
              >
                <v-list-item-title class="font-weight-medium">{{ activite.reference }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ LIBELLES_STATUT[activite.statut] }} · {{ formaterJour(activite.date_action) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="text-body-2 text-muted mb-0">Vos activités apparaîtront ici.</p>
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

.dossier-item {
  border-radius: 12px;
  cursor: pointer;
  background: rgb(var(--v-theme-surface-variant)) !important;
  border: 1px solid rgb(var(--v-theme-outline));
  padding: 16px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.dossier-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1) !important;
}

.section-caption {
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.78rem;
  font-weight: 400;
  line-height: 1.4;
}

.dossier-reference {
  color: rgb(var(--v-theme-on-surface));
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.dossier-avatar {
  flex-shrink: 0;
}

.dossier-status {
  flex-shrink: 0;
  max-width: 100%;
}

.dossier-action {
  min-height: 36px;
  font-weight: 700;
}

.badge-geant {
  font-size: 14px;
  height: 36px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.select-luxe :deep(.v-field__input) {
  padding-top: 12px;
  padding-bottom: 12px;
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 600px) {
  .dashboard-luxe {
    padding: 20px 16px !important;
  }

  .dashboard-luxe header {
    margin-bottom: 24px !important;
  }

  .dashboard-luxe header h1 {
    font-size: 1.7rem !important;
  }
}
</style>
