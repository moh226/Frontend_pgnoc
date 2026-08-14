<script setup lang="ts">
import { onMounted, ref } from 'vue'

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
  <v-container fluid>
    <v-alert v-if="admin.erreur" type="error" variant="tonal" class="mb-4">
      {{ admin.erreur }}
    </v-alert>

    <div class="d-flex align-center mb-4">
      <span class="text-h6">SGI partenaires</span>
      <v-spacer />
      <v-btn color="primary" variant="flat" @click="dialogCreation = true">
        <v-icon icon="mdi-plus" class="mr-1" /> Ajouter une SGI
      </v-btn>
    </div>

    <v-card>
      <v-progress-linear v-if="admin.chargement" indeterminate />
      <v-alert
        v-if="!admin.chargement && !admin.sgi.length"
        type="info"
        variant="tonal"
        class="ma-4 mb-0"
      >
        Aucune SGI enregistrée.
      </v-alert>
      <v-table v-else>
        <thead>
          <tr>
            <th>SGI</th>
            <th>Code</th>
            <th>Dossiers</th>
            <th>Personnel</th>
            <th>Depuis</th>
            <th class="text-end">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sgi in admin.sgi" :key="sgi.id">
            <td>
              <div class="d-flex align-center">
                <v-avatar v-if="sgi.logo" size="28" class="mr-2">
                  <v-img :src="sgi.logo" />
                </v-avatar>
                <span class="font-weight-medium">{{ sgi.nom }}</span>
              </div>
            </td>
            <td>{{ sgi.code_sgi }}</td>
            <td>{{ sgi.nb_dossiers }}</td>
            <td>{{ sgi.nb_utilisateurs }}</td>
            <td>{{ formaterJour(sgi.date_creation) }}</td>
            <td class="text-end">
              <v-chip :color="sgi.est_active ? 'success' : 'error'" variant="tonal" size="small" class="mr-2">
                {{ sgi.est_active ? 'Active' : 'Suspendue' }}
              </v-chip>
              <v-btn
                size="small"
                :color="sgi.est_active ? 'error' : 'success'"
                :variant="sgi.est_active ? 'tonal' : 'flat'"
                @click="basculer(sgi.id, !sgi.est_active)"
              >
                {{ sgi.est_active ? 'Suspendre' : 'Réactiver' }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogCreation" max-width="520">
      <v-card>
        <v-card-title>Ajouter une SGI partenaire</v-card-title>
        <v-card-text>
          <v-alert v-if="erreurFormulaire" type="error" variant="tonal" class="mb-3">
            {{ erreurFormulaire }}
          </v-alert>
          <v-text-field v-model="formulaire.nom" label="Nom de la SGI (obligatoire)" variant="outlined" class="mb-3" />
          <v-text-field
            v-model="formulaire.code_sgi"
            label="Code SGI (obligatoire)"
            variant="outlined"
            hint="Ex : SGIADBG"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCreation = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="envoiEnCours"
            :disabled="!formulaire.nom.trim() || !formulaire.code_sgi.trim()"
            @click="creer"
          >
            Créer la SGI
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>