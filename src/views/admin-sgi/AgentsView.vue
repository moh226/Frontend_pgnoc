<script setup lang="ts">
import { onMounted, ref } from 'vue'

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
  <v-container fluid>
    <v-alert v-if="agents.erreur" type="error" variant="tonal" class="mb-4">
      {{ agents.erreur }}
    </v-alert>

    <div class="d-flex align-center mb-4">
      <span class="text-h6">Agents de la SGI</span>
      <v-spacer />
      <v-btn color="primary" variant="flat" @click="dialogCreation = true">
        <v-icon icon="mdi-account-plus" class="mr-1" /> Créer un agent
      </v-btn>
    </div>

    <v-card>
      <v-progress-linear v-if="agents.chargement" indeterminate />
      <v-alert
        v-if="!agents.chargement && !agents.liste.length"
        type="info"
        variant="tonal"
        class="ma-4 mb-0"
      >
        Aucun agent pour le moment.
      </v-alert>
      <v-table v-else>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Matricule</th>
            <th>Depuis</th>
            <th>Statut</th>
            <th class="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="agent in agents.liste" :key="agent.id">
            <td>
              <div class="font-weight-medium">
                {{ agent.prenom || agent.nom ? `${agent.prenom} ${agent.nom}`.trim() : '—' }}
              </div>
              <div class="text-caption text-medium-emphasis">{{ agent.email }}</div>
            </td>
            <td>{{ agent.matricule || '—' }}</td>
            <td>{{ formaterDate(agent.date_joined) }}</td>
            <td>
              <v-chip :color="agent.is_active ? 'success' : 'error'" variant="tonal" size="small">
                {{ agent.is_active ? 'Actif' : 'Désactivé' }}
              </v-chip>
            </td>
            <td class="text-end">
              <v-btn
                size="small"
                :color="agent.is_active ? 'error' : 'success'"
                :variant="agent.is_active ? 'tonal' : 'flat'"
                @click="basculerActif(agent.id, !agent.is_active)"
              >
                {{ agent.is_active ? 'Désactiver' : 'Réactiver' }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogCreation" max-width="560">
      <v-card>
        <v-card-title>Créer un compte agent</v-card-title>
        <v-card-text>
          <v-alert v-if="erreurFormulaire" type="error" variant="tonal" class="mb-3">
            {{ erreurFormulaire }}
          </v-alert>
          <v-text-field
            v-model="formulaire.email"
            label="Adresse email (obligatoire)"
            variant="outlined"
            type="email"
            class="mb-3"
          />
          <v-text-field v-model="formulaire.prenom" label="Prénom" variant="outlined" class="mb-3" />
          <v-text-field v-model="formulaire.nom" label="Nom" variant="outlined" class="mb-3" />
          <v-text-field
            v-model="formulaire.matricule"
            label="Matricule"
            variant="outlined"
            hint="Laissé vide, le compte reste créé sans matricule."
          />
          <p class="text-body-2 text-medium-emphasis mt-3">
            Un mot de passe temporaire est généré automatiquement si aucun n'est fourni
            (gestion des mots de passe réservée à l'admin général).
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCreation = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="envoiEnCours"
            :disabled="!formulaire.email.trim()"
            @click="creer"
          >
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="compteCree !== null" max-width="520" @update:model-value="(v) => !v && (compteCree = null)">
      <v-card>
        <v-card-title class="text-success d-flex align-center">
          <v-icon icon="mdi-check-circle" class="mr-2" /> Compte agent créé
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-3">
            Communiquez ces identifiants à l'agent de façon sécurisée. Le mot de passe
            ne sera plus jamais affiché.
          </p>
          <v-sheet variant="tonal" class="pa-4 mb-1">
            <div class="text-caption text-medium-emphasis">Email</div>
            <div class="font-weight-medium">{{ compteCree?.email }}</div>
            <v-divider class="my-2" />
            <div class="text-caption text-medium-emphasis">Mot de passe initial</div>
            <div class="font-dixonate">{{ compteCree?.mot_de_passe }}</div>
          </v-sheet>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="compteCree = null">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>