<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

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
  <v-container fluid>
    <v-alert v-if="admin.erreur" type="error" variant="tonal" class="mb-4">
      {{ admin.erreur }}
    </v-alert>

    <div class="d-flex flex-wrap align-center ga-2 mb-4">
      <span class="text-h6">Comptes internes</span>
      <v-spacer />
      <v-select
        v-model="filtreRole"
        :items="ROLES_ADMIN.map((r) => ({ value: r, title: LIBELLES_ROLE[r] }))"
        label="Rôle"
        variant="outlined"
        density="compact"
        clearable
        class="filtre"
      />
      <v-select
        v-model="filtreActif"
        :items="[
          { value: 'actif', title: 'Actifs' },
          { value: 'inactif', title: 'Inactifs' },
        ]"
        label="Statut"
        variant="outlined"
        density="compact"
        clearable
        class="filtre"
      />
      <v-text-field
        v-model="rechercheEmail"
        label="Email"
        variant="outlined"
        density="compact"
        clearable
        class="filtre"
      />
      <v-btn color="primary" variant="flat" @click="dialogCreation = true">
        <v-icon icon="mdi-account-plus" class="mr-1" /> Créer un compte
      </v-btn>
    </div>

    <v-card>
      <v-progress-linear v-if="admin.chargement" indeterminate />
      <v-alert
        v-if="!admin.chargement && !admin.utilisateurs.length"
        type="info"
        variant="tonal"
        class="ma-4 mb-0"
      >
        Aucun compte pour ces critères.
      </v-alert>
      <v-table v-else>
        <thead>
          <tr>
            <th>Compte</th>
            <th>Rôle</th>
            <th>SGI</th>
            <th>Depuis</th>
            <th>Statut</th>
            <th class="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="utilisateur in admin.utilisateurs" :key="utilisateur.id">
            <td>
              <div class="font-weight-medium">{{ utilisateur.email }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ `${utilisateur.prenom} ${utilisateur.nom}`.trim() }}
              </div>
            </td>
            <td>
              <v-chip size="small" variant="tonal" color="primary">
                {{ LIBELLES_ROLE[utilisateur.role as keyof typeof LIBELLES_ROLE] ?? utilisateur.role }}
              </v-chip>
            </td>
            <td>{{ admin.sgi.find((s) => s.id === utilisateur.sgi)?.nom ?? '—' }}</td>
            <td>{{ formaterDate(utilisateur.date_joined) }}</td>
            <td>
              <v-chip :color="utilisateur.is_active ? 'success' : 'error'" variant="tonal" size="small">
                {{ utilisateur.is_active ? 'Actif' : 'Inactif' }}
              </v-chip>
            </td>
            <td class="text-end">
              <v-btn
                size="small"
                :color="utilisateur.is_active ? 'error' : 'success'"
                :variant="utilisateur.is_active ? 'tonal' : 'flat'"
                @click="basculer(utilisateur.id, !utilisateur.is_active)"
              >
                {{ utilisateur.is_active ? 'Désactiver' : 'Réactiver' }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogCreation" max-width="600">
      <v-card>
        <v-card-title>Créer un compte interne</v-card-title>
        <v-card-text>
          <v-alert v-if="erreurFormulaire" type="error" variant="tonal" class="mb-3">
            {{ erreurFormulaire }}
          </v-alert>
          <v-text-field v-model="formule.email" label="Email (obligatoire)" variant="outlined" type="email" class="mb-3" />
          <v-row class="mb-3">
            <v-col cols="6">
              <v-text-field v-model="formule.prenom" label="Prénom" variant="outlined" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="formule.nom" label="Nom" variant="outlined" />
            </v-col>
          </v-row>
          <v-select
            v-model="formule.role"
            :items="ROLES_ADMIN.map((r) => ({ value: r, title: LIBELLES_ROLE[r] }))"
            label="Rôle"
            variant="outlined"
            class="mb-3"
          />
          <v-select
            v-model="formule.sgi"
            :items="sgiActives.map((s) => ({ value: s.id, title: s.nom }))"
            label="SGI de rattachement"
            variant="outlined"
            class="mb-3"
            clearable
            :hint="formule.role === 'ADMIN_GENERAL' ? 'Non requis pour un admin général.' : 'Obligatoire pour un rôle SGI.'"
            persistent-hint
          />
          <v-text-field
            v-model="formule.mot_de_passe"
            label="Mot de passe initial (obligatoire)"
            variant="outlined"
            type="password"
            hint="Remis à l'intéressé par un canal sûr. Jamais renvoyé par l'API."
            persistent-hint
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCreation = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="envoiEnCours"
            :disabled="!formule.email.trim() || !formule.mot_de_passe"
            @click="creer"
          >
            Créer le compte
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.filtre {
  max-width: 220px;
}
</style>