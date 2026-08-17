<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Shield, ShieldAlert, UserPlus, Search, Power, PowerOff } from '@lucide/vue'

import { LIBELLES_ROLE } from '@/config/navigation'
import { ROLES_ADMIN } from '@/config/audit'
import { useAdminStore } from '@/stores/admin'
import { formaterDate } from '@/utils/format'

const admin = useAdminStore()

const filtreRole = ref('')
const filtreActif = ref<'actif' | 'inactif' | ''>('')
const rechercheEmail = ref('')

const dialogCreation = ref(false)
const envoiEnCours = ref(false)
const erreurFormulaire = ref('')
const formule = ref({
  email: '',
  prenom: '',
  nom: '',
  role: 'AGENT_SGI',
  sgi: '',
  mot_de_passe: '',
})

const sgiActives = computed(() => admin.sgi.filter((s) => s.est_active))

async function charger() {
  await admin.chargerSgi()
  await admin.chargerUtilisateurs({
    role: filtreRole.value || undefined,
    actif: filtreActif.value ? filtreActif.value === 'actif' : undefined,
    email: rechercheEmail.value || undefined,
  })
}

async function creer() {
  if (!formule.value.email.trim() || !formule.value.mot_de_passe) {
    erreurFormulaire.value = "L'email et le mot de passe initial sont obligatoires."
    return
  }
  envoiEnCours.value = true
  erreurFormulaire.value = ''
  try {
    await admin.creerUtilisateur({
      email: formule.value.email.trim(),
      prenom: formule.value.prenom.trim() || undefined,
      nom: formule.value.nom.trim() || undefined,
      role: formule.value.role,
      sgi: formule.value.sgi || null,
      mot_de_passe: formule.value.mot_de_passe,
    })
    dialogCreation.value = false
    formule.value = { email: '', prenom: '', nom: '', role: 'AGENT_SGI', sgi: '', mot_de_passe: '' }
  } catch {
    erreurFormulaire.value = admin.erreur
  } finally {
    envoiEnCours.value = false
  }
}

async function basculer(utilisateurId: string, actif: boolean) {
  try {
    await admin.basculerUtilisateur(utilisateurId, actif)
  } catch {
    // Erreur exposée par le store.
  }
}

watch([filtreRole, filtreActif, rechercheEmail], () => void charger())

onMounted(() => void charger())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    
    <!-- En-tête -->
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <Shield :size="28" />
          </div>
          Comptes Internes
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Supervisez l'ensemble des administrateurs et des agents du système.
        </p>
      </div>
      <div class="mt-4 mt-md-0">
        <v-btn color="primary" variant="flat" size="large" class="font-weight-bold hover-lift" @click="dialogCreation = true">
          <UserPlus :size="18" class="mr-2" /> Créer un compte
        </v-btn>
      </div>
    </div>

    <!-- Barre de filtres -->
    <v-card class="rounded-xl elevation-2 mb-8 border bg-surface-variant">
      <v-card-text class="pa-4 pa-md-6 d-flex flex-wrap align-center gap-4">
        <v-select
          v-model="filtreRole"
          :items="ROLES_ADMIN.map((r) => ({ value: r, title: LIBELLES_ROLE[r] }))"
          label="Filtrer par rôle"
          variant="outlined"
          density="comfortable"
          clearable
          bg-color="surface"
          hide-details
          class="premium-input filtre-item"
        />
        <v-select
          v-model="filtreActif"
          :items="[
            { value: 'actif', title: 'Comptes Actifs' },
            { value: 'inactif', title: 'Comptes Inactifs' },
          ]"
          label="Filtrer par statut"
          variant="outlined"
          density="comfortable"
          clearable
          bg-color="surface"
          hide-details
          class="premium-input filtre-item"
        />
        <v-text-field
          v-model="rechercheEmail"
          label="Rechercher un email..."
          variant="outlined"
          density="comfortable"
          clearable
          bg-color="surface"
          hide-details
          class="premium-input flex-grow-1 min-w-200"
        >
          <template #prepend-inner>
            <Search :size="18" class="text-medium-emphasis mr-2" />
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>

    <v-alert v-if="admin.erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ admin.erreur }}
    </v-alert>

    <!-- Tableau -->
    <v-card class="rounded-xl elevation-2 overflow-hidden border">
      <v-progress-linear v-if="admin.chargement" indeterminate color="primary" />
      
      <v-alert
        v-if="!admin.chargement && !admin.utilisateurs.length"
        type="info"
        variant="tonal"
        class="ma-6 mb-6 border-l-4"
      >
        Aucun compte ne correspond à vos critères de recherche.
      </v-alert>

      <v-table v-else class="premium-table">
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Utilisateur</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Rôle Système</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">SGI Rattachée</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Inscription</th>
            <th class="text-end text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Statut & Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="utilisateur in admin.utilisateurs" :key="utilisateur.id" class="table-row">
            <td class="px-6 py-4">
              <div class="d-flex align-center">
                <v-avatar :color="utilisateur.role === 'ADMIN_GENERAL' ? 'warning-lighten-4' : 'primary-lighten-4'" size="40" class="mr-3 font-weight-bold" :class="utilisateur.role === 'ADMIN_GENERAL' ? 'text-warning-darken-2' : 'text-primary'">
                  {{ (utilisateur.prenom?.[0] || '') + (utilisateur.nom?.[0] || utilisateur.email[0]).toUpperCase() }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-1">{{ utilisateur.email }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ `${utilisateur.prenom || ''} ${utilisateur.nom || ''}`.trim() || '—' }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 font-weight-medium">
              <v-chip 
                size="small" 
                variant="tonal" 
                :color="utilisateur.role === 'ADMIN_GENERAL' ? 'warning' : 'primary'"
                class="font-weight-bold"
              >
                {{ LIBELLES_ROLE[utilisateur.role as keyof typeof LIBELLES_ROLE] ?? utilisateur.role }}
              </v-chip>
            </td>
            <td class="px-6 py-4 text-body-2 font-weight-medium">
              {{ admin.sgi.find((s) => s.id === utilisateur.sgi)?.nom ?? '—' }}
            </td>
            <td class="px-6 py-4 text-body-2 text-medium-emphasis">
              {{ formaterDate(utilisateur.date_joined) }}
            </td>
            <td class="px-6 py-4 text-end d-flex justify-end align-center gap-3">
              <v-chip 
                :color="utilisateur.is_active ? 'success' : 'grey'" 
                variant="flat" 
                size="small"
                class="font-weight-bold px-3"
              >
                {{ utilisateur.is_active ? 'Actif' : 'Inactif' }}
              </v-chip>
              <v-btn
                icon
                size="small"
                variant="tonal"
                :color="utilisateur.is_active ? 'error' : 'success'"
                @click="basculer(utilisateur.id, !utilisateur.is_active)"
                :title="utilisateur.is_active ? 'Désactiver le compte' : 'Réactiver le compte'"
              >
                <PowerOff v-if="utilisateur.is_active" :size="16" />
                <Power v-else :size="16" />
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Modale Création Compte Interne -->
    <v-dialog v-model="dialogCreation" max-width="600">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center">
          <ShieldAlert :size="24" class="text-warning mr-3" />
          Nouveau compte interne
        </v-card-title>
        <v-card-text class="px-6 py-4">
          <v-alert v-if="erreurFormulaire" type="error" variant="tonal" class="mb-4 border-l-4">
            {{ erreurFormulaire }}
          </v-alert>
          
          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Informations d'accès</div>
          
          <v-text-field 
            v-model="formule.email" 
            label="Adresse Email professionnelle" 
            variant="outlined" 
            type="email" 
            class="premium-input mb-4" 
            hide-details="auto"
          />
          
          <v-row class="mb-2">
            <v-col cols="6">
              <v-text-field v-model="formule.prenom" label="Prénom" variant="outlined" class="premium-input" hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="formule.nom" label="Nom" variant="outlined" class="premium-input" hide-details="auto" />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Autorisations</div>

          <v-select
            v-model="formule.role"
            :items="ROLES_ADMIN.map((r) => ({ value: r, title: LIBELLES_ROLE[r] }))"
            label="Rôle système"
            variant="outlined"
            class="premium-input mb-4"
            hide-details="auto"
          />
          
          <v-expand-transition>
            <div v-if="formule.role !== 'ADMIN_GENERAL'">
              <v-select
                v-model="formule.sgi"
                :items="sgiActives.map((s) => ({ value: s.id, title: s.nom }))"
                label="SGI de rattachement"
                variant="outlined"
                class="premium-input mb-4"
                clearable
                hint="Obligatoire pour les agents/admins SGI afin de limiter leur accès."
                persistent-hint
              />
            </div>
          </v-expand-transition>
          
          <v-divider class="my-6" />

          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Sécurité</div>

          <v-text-field
            v-model="formule.mot_de_passe"
            label="Mot de passe initial (Provisoire)"
            variant="outlined"
            class="premium-input"
            hide-details="auto"
          />
          <div class="text-caption text-medium-emphasis mt-2">
            Le mot de passe doit être transmis de manière sécurisée à l'utilisateur.
          </div>
          
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-4 border-t">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogCreation = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="px-6 font-weight-bold"
            :loading="envoiEnCours"
            :disabled="!formule.email.trim() || !formule.mot_de_passe"
            @click="creer"
          >
            Générer l'accès
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

.border-t {
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.gap-4 {
  gap: 16px;
}

.gap-3 {
  gap: 12px;
}

.min-w-200 {
  min-width: 200px;
}

.filtre-item {
  width: 200px;
  flex: none;
}
@media (max-width: 600px) {
  .filtre-item {
    width: 100%;
    flex: 1 1 100%;
  }
}

.premium-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.premium-table {
  background: transparent !important;
}

.premium-table th {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.table-row td {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
}
</style>