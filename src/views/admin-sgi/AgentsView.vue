<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Users, UserPlus, ShieldAlert, Power, PowerOff, ShieldCheck } from '@lucide/vue'

import { useAgentsStore } from '@/stores/agents'
import { formaterDate } from '@/utils/format'

const agents = useAgentsStore()

const dialogCreation = ref(false)
const envoiEnCours = ref(false)
const erreurFormulaire = ref('')
const compteCree = ref<{ email: string; mot_de_passe: string } | null>(null)

const formulaire = ref({
  email: '',
  prenom: '',
  nom: '',
  matricule: '',
})

async function creer() {
  if (!formulaire.value.email.trim()) {
    erreurFormulaire.value = "L'adresse email est obligatoire."
    return
  }
  envoiEnCours.value = true
  erreurFormulaire.value = ''
  try {
    const agent = await agents.creer({
      email: formulaire.value.email.trim(),
      prenom: formulaire.value.prenom.trim() || undefined,
      nom: formulaire.value.nom.trim() || undefined,
      matricule: formulaire.value.matricule.trim() || undefined,
    })
    if (agent.mot_de_passe_initial) {
      compteCree.value = { email: agent.email, mot_de_passe: agent.mot_de_passe_initial }
    }
    dialogCreation.value = false
    formulaire.value = { email: '', prenom: '', nom: '', matricule: '' }
  } catch {
    erreurFormulaire.value = agents.erreur
  } finally {
    envoiEnCours.value = false
  }
}

async function basculerActif(agentId: string, actif: boolean) {
  try {
    await agents.basculerActif(agentId, actif)
  } catch {
    // L'erreur est exposée via le store.
  }
}

onMounted(() => void agents.charger())
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    
    <!-- En-tête -->
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <Users :size="28" />
          </div>
          Gestion des Agents
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Gérez les accès et les statuts des collaborateurs de votre SGI.
        </p>
      </div>
      <div class="mt-4 mt-md-0">
        <v-btn color="primary" variant="flat" size="large" class="font-weight-bold hover-lift" @click="dialogCreation = true">
          <UserPlus :size="18" class="mr-2" /> Ajouter un agent
        </v-btn>
      </div>
    </div>

    <v-alert v-if="agents.erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ agents.erreur }}
    </v-alert>

    <v-card class="rounded-xl elevation-2 overflow-hidden border">
      <v-progress-linear v-if="agents.chargement" indeterminate color="primary" />
      
      <v-alert
        v-if="!agents.chargement && !agents.liste.length"
        type="info"
        variant="tonal"
        class="ma-6 mb-6 border-l-4"
      >
        Aucun compte agent créé pour le moment.
      </v-alert>

      <v-table v-else class="premium-table">
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Agent</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Matricule</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Date d'ajout</th>
            <th class="text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Statut</th>
            <th class="text-end text-uppercase text-caption font-weight-bold tracking-wider px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="agent in agents.liste" :key="agent.id" class="table-row">
            <td class="px-6 py-4">
              <div class="d-flex align-center">
                <v-avatar color="primary-lighten-4" size="40" class="mr-3 text-primary font-weight-bold">
                  {{ (agent.prenom?.[0] || '') + (agent.nom?.[0] || agent.email[0]).toUpperCase() }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-1">
                    {{ agent.prenom || agent.nom ? `${agent.prenom} ${agent.nom}`.trim() : '—' }}
                  </div>
                  <div class="text-caption text-medium-emphasis">{{ agent.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 font-weight-medium">
              <v-chip v-if="agent.matricule" size="small" variant="tonal" class="font-weight-bold text-uppercase">
                {{ agent.matricule }}
              </v-chip>
              <span v-else class="text-medium-emphasis">—</span>
            </td>
            <td class="px-6 py-4 text-body-2 text-medium-emphasis">
              {{ formaterDate(agent.date_joined) }}
            </td>
            <td class="px-6 py-4">
              <v-chip 
                :color="agent.is_active ? 'success' : 'grey'" 
                variant="flat" 
                size="small"
                class="font-weight-bold px-3"
              >
                {{ agent.is_active ? 'Actif' : 'Désactivé' }}
              </v-chip>
            </td>
            <td class="px-6 py-4 text-end">
              <v-btn
                size="small"
                :color="agent.is_active ? 'error' : 'success'"
                variant="tonal"
                class="font-weight-bold"
                @click="basculerActif(agent.id, !agent.is_active)"
              >
                <PowerOff v-if="agent.is_active" :size="14" class="mr-1" />
                <Power v-else :size="14" class="mr-1" />
                {{ agent.is_active ? 'Désactiver' : 'Réactiver' }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Modale Création Agent -->
    <v-dialog v-model="dialogCreation" max-width="500">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center">
          Nouveau collaborateur
        </v-card-title>
        <v-card-text class="px-6 py-4">
          <v-alert v-if="erreurFormulaire" type="error" variant="tonal" class="mb-4 border-l-4">
            {{ erreurFormulaire }}
          </v-alert>
          
          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4">Identifiants</div>
          
          <v-text-field
            v-model="formulaire.email"
            label="Adresse email professionnelle"
            placeholder="jean.dupont@sgi.com"
            variant="outlined"
            type="email"
            class="premium-input mb-4"
            hide-details="auto"
          />
          
          <div class="text-subtitle-2 text-uppercase text-primary font-weight-bold tracking-wider mb-4 mt-6">Informations (Optionnel)</div>
          
          <v-row class="mb-1">
            <v-col cols="6">
              <v-text-field 
                v-model="formulaire.prenom" 
                label="Prénom" 
                variant="outlined" 
                class="premium-input" 
                hide-details="auto"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field 
                v-model="formulaire.nom" 
                label="Nom" 
                variant="outlined" 
                class="premium-input" 
                hide-details="auto"
              />
            </v-col>
          </v-row>
          
          <v-text-field
            v-model="formulaire.matricule"
            label="Matricule RH"
            variant="outlined"
            class="premium-input mb-2 mt-2"
            hide-details="auto"
          />

          <v-alert type="info" variant="tonal" class="mt-4 py-2 border-l-4 d-flex align-center">
            <template #prepend>
              <ShieldAlert :size="20" class="mr-2" />
            </template>
            <span class="text-caption">
              Un mot de passe temporaire robuste sera généré automatiquement.
            </span>
          </v-alert>

        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-4 border-t">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogCreation = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="px-6 font-weight-bold"
            :loading="envoiEnCours"
            :disabled="!formulaire.email.trim()"
            @click="creer"
          >
            Créer le compte
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modale Résultat Création -->
    <v-dialog :model-value="compteCree !== null" max-width="450" @update:model-value="(v) => !v && (compteCree = null)" persistent>
      <v-card class="rounded-xl elevation-24">
        <div class="bg-success-lighten-5 pa-6 d-flex flex-column align-center text-center border-b">
          <ShieldCheck :size="48" class="text-success mb-3" />
          <h2 class="text-h5 font-weight-bold text-success-darken-1 mb-1">Accès Sécurisé Généré</h2>
          <p class="text-caption text-success-darken-2 mb-0">
            Communiquez ces identifiants à l'agent de façon sécurisée.<br/>
            <strong>Le mot de passe ne sera plus jamais affiché.</strong>
          </p>
        </div>
        
        <v-card-text class="pa-6 text-center">
          <div class="bg-surface-variant rounded-lg pa-4 border mb-2">
            <div class="text-uppercase text-caption font-weight-bold text-medium-emphasis mb-1 tracking-wider">Identifiant (Email)</div>
            <div class="text-body-1 font-weight-bold mb-4">{{ compteCree?.email }}</div>
            
            <div class="text-uppercase text-caption font-weight-bold text-medium-emphasis mb-1 tracking-wider">Mot de passe temporaire</div>
            <div class="text-h6 font-weight-black text-primary letter-spacing-large user-select-all">
              {{ compteCree?.mot_de_passe }}
            </div>
          </div>
          <div class="text-caption text-medium-emphasis mt-2">
            Astuce : L'agent devra obligatoirement changer ce mot de passe à sa première connexion.
          </div>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6 pt-0 d-flex justify-center">
          <v-btn color="primary" variant="flat" size="large" class="w-100 font-weight-bold" @click="compteCree = null">J'ai copié les accès</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
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

.letter-spacing-large {
  letter-spacing: 0.1em !important;
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

.user-select-all {
  user-select: all;
  cursor: copy;
}
</style>