<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Landmark, Plus, Power, PowerOff, Building2 } from '@lucide/vue'

import { useAdminStore } from '@/stores/admin'
import { formaterJour } from '@/utils/format'

const admin = useAdminStore()

const dialogCreation = ref(false)
const envoiEnCours = ref(false)
const erreurFormulaire = ref('')
const formulaire = ref({ nom: '', code_sgi: '' })

async function creer() {
  if (!formulaire.value.nom.trim() || !formulaire.value.code_sgi.trim()) {
    erreurFormulaire.value = 'Le nom et le code sont obligatoires.'
    return
  }
  envoiEnCours.value = true
  erreurFormulaire.value = ''
  try {
    await admin.creerSgi({
      nom: formulaire.value.nom.trim(),
      code_sgi: formulaire.value.code_sgi.trim(),
    })
    dialogCreation.value = false
    formulaire.value = { nom: '', code_sgi: '' }
  } catch {
    erreurFormulaire.value = admin.erreur
  } finally {
    envoiEnCours.value = false
  }
}

async function basculer(sgiId: string, actif: boolean) {
  try {
    await admin.basculerSgi(sgiId, actif)
  } catch {
    // Erreur exposée par le store.
  }
}

onMounted(() => void admin.chargerSgi())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <!-- En-tête -->
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <Landmark :size="28" />
          </div>
          SGI Partenaires
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Gérez la liste et le statut des Sociétés de Gestion et d'Intermédiation enregistrées.
        </p>
      </div>
      <div class="mt-4 mt-md-0">
        <v-btn color="primary" variant="flat" size="large" class="font-weight-bold hover-lift" @click="dialogCreation = true">
          <Plus :size="18" class="mr-2" /> Ajouter une SGI
        </v-btn>
      </div>
    </div>

    <v-alert v-if="admin.erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ admin.erreur }}
    </v-alert>

    <v-card class="rounded-xl elevation-2 overflow-hidden border">
      <v-progress-linear v-if="admin.chargement" indeterminate color="primary" />
      
      <v-alert
        v-if="!admin.chargement && !admin.sgi.length"
        type="info"
        variant="tonal"
        class="ma-6 mb-6 border-l-4"
      >
        Aucune SGI enregistrée dans le système.
      </v-alert>

      <v-table v-else class="premium-table">
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">SGI</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Code</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4 text-center">Dossiers</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4 text-center">Agents</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Date d'ajout</th>
            <th class="text-end text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Statut & Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sgi in admin.sgi" :key="sgi.id" class="table-row">
            <td class="px-6 py-4">
              <div class="d-flex align-center">
                <v-avatar v-if="sgi.logo" size="40" class="mr-4 elevation-1 bg-white">
                  <v-img :src="sgi.logo" />
                </v-avatar>
                <div v-else class="bg-primary-lighten-5 text-primary rounded-circle d-flex align-center justify-center mr-4" style="width: 40px; height: 40px;">
                  <Building2 :size="20" />
                </div>
                <span class="font-weight-bold text-body-1">{{ sgi.nom }}</span>
              </div>
            </td>
            <td class="px-6 py-4 font-weight-medium">
              <v-chip size="small" variant="tonal" color="primary-darken-1" class="font-weight-bold text-uppercase">
                {{ sgi.code_sgi }}
              </v-chip>
            </td>
            <td class="px-6 py-4 text-center font-weight-bold text-primary">{{ sgi.nb_dossiers }}</td>
            <td class="px-6 py-4 text-center font-weight-medium text-medium-emphasis">{{ sgi.nb_utilisateurs }}</td>
            <td class="px-6 py-4 text-body-2 text-medium-emphasis">{{ formaterJour(sgi.date_creation) }}</td>
            <td class="px-6 py-4 text-end d-flex justify-end align-center gap-3">
              <v-chip 
                :color="sgi.est_active ? 'success' : 'error'" 
                variant="flat" 
                size="small"
                class="font-weight-bold px-3"
              >
                {{ sgi.est_active ? 'Active' : 'Suspendue' }}
              </v-chip>
              <v-btn
                icon
                size="small"
                variant="tonal"
                :color="sgi.est_active ? 'error' : 'success'"
                @click="basculer(sgi.id, !sgi.est_active)"
                :title="sgi.est_active ? 'Suspendre la SGI' : 'Réactiver la SGI'"
              >
                <PowerOff v-if="sgi.est_active" :size="16" />
                <Power v-else :size="16" />
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogCreation" max-width="500">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center">
          <Building2 :size="24" class="text-primary mr-3" />
          Ajouter une SGI
        </v-card-title>
        <v-card-text class="px-6 py-4">
          <v-alert v-if="erreurFormulaire" type="error" variant="tonal" class="mb-4 border-l-4">
            {{ erreurFormulaire }}
          </v-alert>
          
          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Informations</div>
          
          <v-text-field 
            v-model="formulaire.nom" 
            label="Nom officiel de la SGI" 
            placeholder="Ex: SGI Atlantique"
            variant="outlined" 
            class="premium-input mb-4" 
            hide-details="auto"
          />
          <v-text-field
            v-model="formulaire.code_sgi"
            label="Code identifiant unique"
            placeholder="Ex: SGIADBG"
            variant="outlined"
            class="premium-input mb-2"
            hide-details="auto"
          />
          <div class="text-caption text-medium-emphasis mt-2">
            Ce code est utilisé dans les requêtes API et ne peut plus être modifié par la suite.
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
            :disabled="!formulaire.nom.trim() || !formulaire.code_sgi.trim()"
            @click="creer"
          >
            Enregistrer la SGI
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

.premium-input :deep(.v-field) {
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
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

.gap-3 {
  gap: 12px;
}
</style>