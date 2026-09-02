<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Landmark, 
  Users, 
  Bell,
  ArrowRight,
  Clock,
  History,
  Activity
} from '@lucide/vue'

import { FEATURES } from '@/config/features'
import { LIBELLES_ACTION_AUDIT } from '@/config/audit'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { LIBELLES_ROLE } from '@/config/navigation'
import { useAdminStore } from '@/stores/admin'
import { useNotificationsStore } from '@/stores/notifications'
import type { StatutDossier } from '@/types'
import { formaterHeure, formaterJour } from '@/utils/format'

const admin = useAdminStore()
const notifications = useNotificationsStore()

const statuts = Object.keys(LIBELLES_STATUT) as StatutDossier[]

const avoirsStatut = computed(() => generateurStats())

function generateurStats() {
  const modeles = (admin.tableauDeBord?.dossiers.par_statut ?? {}) as Partial<
    Record<StatutDossier, number>
  >
  const resultat: number[] = []
  for (const statut of statuts) {
    resultat.push(Number(modeles[statut] ?? 0))
  }
  return resultat
}

function roleLibelle(role: string): string {
  return LIBELLES_ROLE[role as keyof typeof LIBELLES_ROLE] ?? role
}

onMounted(async () => {
  await Promise.all([admin.chargerTableauDeBord(), notifications.chargerCompte()])
})
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <div class="d-flex flex-column mb-8">
      <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
        <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
          <LayoutDashboard :size="28" />
        </div>
        Supervision Globale
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Vue d'ensemble de l'activité du système, des SGI partenaires et de la sécurité.
      </p>
    </div>

    <v-alert v-if="admin.erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ admin.erreur }}
    </v-alert>

    <template v-if="admin.tableauDeBord">
      <!-- KPI Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3">
          <v-card class="kpi-card rounded-xl elevation-2 h-100 overflow-hidden">
            <div class="bg-primary-lighten-5 pa-6 d-flex flex-column h-100">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="icon-box bg-white text-primary rounded-circle pa-3 elevation-1">
                  <FolderKanban :size="24" />
                </div>
              </div>
              <div class="text-h3 font-display font-weight-bold text-primary mb-1">
                {{ admin.tableauDeBord.dossiers.total }}
              </div>
              <div class="text-body-2 font-weight-bold text-primary-darken-1 text-uppercase tracking-wider mb-2">
                Dossiers KYC
              </div>
              <div class="text-caption font-weight-medium bg-white rounded-lg px-3 py-1 d-inline-flex align-center mt-auto align-self-start text-primary shadow-sm">
                <Activity :size="14" class="mr-1" />
                +{{ admin.tableauDeBord.dossiers.soumis_aujourd_hui }} aujourd'hui
              </div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" lg="3">
          <v-card class="kpi-card rounded-xl elevation-2 h-100 overflow-hidden">
            <div class="bg-indigo-lighten-5 pa-6 d-flex flex-column h-100">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="icon-box bg-white text-indigo rounded-circle pa-3 elevation-1">
                  <Landmark :size="24" />
                </div>
              </div>
              <div class="text-h3 font-display font-weight-bold text-indigo mb-1 d-flex align-end">
                {{ admin.tableauDeBord.sgi.actives }}
                <span class="text-h5 text-indigo-lighten-2 ml-1 pb-1">/ {{ admin.tableauDeBord.sgi.total }}</span>
              </div>
              <div class="text-body-2 font-weight-bold text-indigo-darken-1 text-uppercase tracking-wider mb-2">
                SGI Partenaires
              </div>
              <div 
                v-if="admin.tableauDeBord.sgi.sans_convention_publiee"
                class="text-caption font-weight-bold bg-warning-lighten-5 text-warning-darken-2 border border-warning-lighten-3 rounded-lg px-3 py-1 mt-auto align-self-start"
              >
                {{ admin.tableauDeBord.sgi.sans_convention_publiee }} SGI sans convention
              </div>
              <div v-else class="text-caption font-weight-medium bg-white text-indigo rounded-lg px-3 py-1 mt-auto align-self-start shadow-sm">
                Toutes ont une convention
              </div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" lg="3">
          <v-card class="kpi-card rounded-xl elevation-2 h-100 overflow-hidden">
            <div class="bg-success-lighten-5 pa-6 d-flex flex-column h-100">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="icon-box bg-white text-success rounded-circle pa-3 elevation-1">
                  <Users :size="24" />
                </div>
              </div>
              <div class="text-h3 font-display font-weight-bold text-success mb-1 d-flex align-end">
                {{ admin.tableauDeBord.utilisateurs.actifs }}
                <span class="text-h5 text-success-lighten-2 ml-1 pb-1">/ {{ admin.tableauDeBord.utilisateurs.total }}</span>
              </div>
              <div class="text-body-2 font-weight-bold text-success-darken-1 text-uppercase tracking-wider mb-3">
                Comptes Internes
              </div>
              <div class="d-flex flex-wrap gap-2 mt-auto">
                <v-chip
                  v-for="(effectif, role) in admin.tableauDeBord.utilisateurs.par_role"
                  :key="role"
                  size="small"
                  variant="flat"
                  color="white"
                  class="font-weight-bold text-success-darken-2 shadow-sm"
                >
                  {{ roleLibelle(role) }} ({{ effectif }})
                </v-chip>
              </div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" lg="3">
          <v-card class="kpi-card rounded-xl elevation-2 h-100 overflow-hidden">
            <div class="pa-6 d-flex flex-column h-100" :class="notifications.compteNonLues ? 'bg-error-lighten-5' : 'bg-surface-variant'">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="icon-box bg-white rounded-circle pa-3 elevation-1" :class="notifications.compteNonLues ? 'text-error' : 'text-medium-emphasis'">
                  <Bell :size="24" :class="{'pulse-animation': notifications.compteNonLues}" />
                </div>
              </div>
              <div class="text-h3 font-display font-weight-bold mb-1" :class="notifications.compteNonLues ? 'text-error' : 'text-medium-emphasis'">
                {{ notifications.compteNonLues }}
              </div>
              <div class="text-body-2 font-weight-bold text-uppercase tracking-wider mb-2" :class="notifications.compteNonLues ? 'text-error-darken-1' : 'text-medium-emphasis'">
                Alertes Non Lues
              </div>
              <v-btn 
                variant="flat" 
                size="small" 
                class="mt-auto align-self-start font-weight-bold shadow-sm bg-white"
                :class="notifications.compteNonLues ? 'text-error' : 'text-medium-emphasis'"
                :to="{ name: 'admin-general-notifications' }"
              >
                Boîte de réception <ArrowRight :size="14" class="ml-1" />
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <!-- Ventilation par statut -->
        <v-col :cols="FEATURES.JOURNAL_AUDIT ? 5 : 12">
          <v-card class="rounded-xl elevation-2 h-100 d-flex flex-column">
            <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center font-weight-bold">
              <FolderKanban :size="20" class="text-primary mr-3" />
              Répartition des dossiers
            </v-card-title>
            <v-card-text class="pa-4 flex-grow-1">
              <v-list class="bg-transparent pa-0 custom-list">
                <template v-for="(statut, index) in statuts" :key="statut">
                  <v-list-item class="px-4 py-3 rounded-lg mb-2 bg-surface-variant">
                    <template #prepend>
                      <v-icon :icon="'mdi-circle'" :color="COULEURS_STATUT[statut]" size="14" class="mr-3" />
                    </template>
                    
                    <v-list-item-title class="font-weight-medium">
                      {{ LIBELLES_STATUT[statut] }}
                    </v-list-item-title>
                    
                    <template #append>
                      <v-chip :color="COULEURS_STATUT[statut]" variant="tonal" class="font-weight-bold ml-2">
                        {{ avoirsStatut[index] }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Activité Récente (Audit) -->
        <template v-if="FEATURES.JOURNAL_AUDIT">
          <v-col cols="7">
            <v-card class="rounded-xl elevation-2 h-100 d-flex flex-column">
              <v-card-title class="pa-6 border-b bg-surface-variant d-flex align-center">
                <History :size="20" class="text-primary mr-3" />
                <span class="font-weight-bold">Activité récente (Audit)</span>
                <v-spacer />
                <v-btn variant="text" color="primary" class="font-weight-bold text-caption tracking-wider hover-lift" :to="{ name: 'admin-general-journal' }">
                  Journal complet <ArrowRight :size="16" class="ml-1" />
                </v-btn>
              </v-card-title>
              
              <v-card-text class="pa-0 flex-grow-1">
                <div v-if="!admin.tableauDeBord.activite_recente.length" class="pa-8 text-center h-100 d-flex flex-column justify-center align-center">
                  <Clock :size="48" class="text-grey-lighten-1 mb-4" />
                  <div class="text-body-1 text-medium-emphasis">Aucune activité récente enregistrée.</div>
                </div>
                
                <v-list v-else lines="two" class="bg-transparent pa-0 custom-list">
                  <template v-for="(trace, index) in admin.tableauDeBord.activite_recente" :key="index">
                    <v-divider v-if="index > 0" />
                    <v-list-item class="px-6 py-4 hover-row">
                      <template #prepend>
                        <v-avatar color="info-lighten-4" class="mr-4 text-info">
                          <Activity :size="20" />
                        </v-avatar>
                      </template>
                      
                      <v-list-item-title class="font-weight-bold text-body-1 mb-1">
                        {{ LIBELLES_ACTION_AUDIT[trace.action] ?? trace.action }}
                      </v-list-item-title>
                      
                      <v-list-item-subtitle class="text-caption text-medium-emphasis">
                        <span class="font-weight-medium text-on-surface">{{ trace.email || 'Système' }}</span>
                        <template v-if="trace.entite_concernee">
                          <span class="mx-2">•</span>
                          {{ trace.entite_concernee }}
                          <span class="text-medium-emphasis"> (ID: {{ trace.entite_id?.slice(0, 8) }})</span>
                        </template>
                      </v-list-item-subtitle>
                      
                      <template #append>
                        <div class="d-flex flex-column align-end justify-center ml-4">
                          <span class="text-caption font-weight-medium text-medium-emphasis mb-1">
                            {{ formaterJour(trace.date) }}
                          </span>
                          <span class="text-caption text-disabled">
                            {{ formaterHeure(trace.date) }}
                          </span>
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </template>

    <div v-else class="d-flex justify-center align-center h-100 py-12">
      <v-progress-circular indeterminate color="primary" size="64" width="4" />
    </div>
  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -8px rgba(0,0,0,0.15) !important;
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

.gap-2 {
  gap: 8px;
}

.hover-row {
  transition: background-color 0.2s ease;
}
.hover-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.hover-lift {
  transition: transform 0.2s ease;
}
.hover-lift:hover {
  transform: translateX(4px);
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.pulse-animation {
  animation: pulse 2s infinite;
}
</style>