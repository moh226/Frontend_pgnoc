<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { changerMonMotDePasse, mettreAJourMonProfil, recupererMonProfil } from '@/api/profil'
import { extraireMessageErreur } from '@/api/client'
import { LIBELLES_ROLE } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'
import type { ProfilMoi, TypePersonne } from '@/types'

const auth = useAuthStore()
const router = useRouter()

const ongletActif = ref<'profil' | 'securite'>('profil')

const profil = ref<ProfilMoi | null>(null)
const chargement = ref(true)
const erreurChargement = ref('')

const prenom = ref('')
const nom = ref('')
const typePersonne = ref<TypePersonne>('PHYSIQUE')
const matricule = ref('')
const fonction = ref('')

const enregistrement = ref(false)
const messageSucces = ref('')
const erreurProfil = ref('')

const ancienMotDePasse = ref('')
const nouveauMotDePasse = ref('')
const confirmation = ref('')
const afficherMotsDePasse = ref(false)
const enCoursChangement = ref(false)
const messageMotDePasse = ref('')
const erreurMotDePasse = ref('')

const initiales = computed(() => {
  const parts = [profil.value?.prenom, profil.value?.nom].filter(Boolean)
  if (parts.length) return parts.map((p) => p![0]).join('').toUpperCase().slice(0, 2)
  return (profil.value?.email ?? '?')[0].toUpperCase()
})

const estInvestisseur = computed(() => profil.value?.role === 'INVESTISSEUR')
const estAgent = computed(() => profil.value?.role === 'AGENT_SGI')
const estAdminSgi = computed(() => profil.value?.role === 'ADMIN_SGI')

const dateInscription = computed(() =>
  profil.value?.date_joined
    ? new Date(profil.value.date_joined).toLocaleDateString('fr-FR')
    : '',
)

const optionsTypePersonne = [
  { value: 'PHYSIQUE', titre: 'Personne physique' },
  { value: 'MORALE', titre: 'Personne morale' },
  { value: 'MINEUR', titre: 'Mineur' },
]

async function chargerProfil() {
  chargement.value = true
  erreurChargement.value = ''
  try {
    profil.value = await recupererMonProfil()
    prenom.value = profil.value.prenom
    nom.value = profil.value.nom
    typePersonne.value = profil.value.type_personne ?? 'PHYSIQUE'
    matricule.value = profil.value.matricule ?? ''
    fonction.value = profil.value.fonction ?? ''
  } catch (cause) {
    erreurChargement.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

onMounted(chargerProfil)

async function enregistrerProfil() {
  enregistrement.value = true
  messageSucces.value = ''
  erreurProfil.value = ''
  try {
    profil.value = await mettreAJourMonProfil({
      prenom: prenom.value.trim(),
      nom: nom.value.trim(),
      type_personne: estInvestisseur.value ? typePersonne.value : undefined,
      matricule: estAgent.value ? matricule.value.trim() : undefined,
      fonction: estAdminSgi.value ? fonction.value.trim() : undefined,
    })
    auth.$patch({
      utilisateur: { ...auth.utilisateur, prenom: prenom.value.trim(), nom: nom.value.trim() },
    })
    auth.persister()
    messageSucces.value = "Profil enregistré avec succès."
  } catch (cause) {
    erreurProfil.value = extraireMessageErreur(cause)
  } finally {
    enregistrement.value = false
  }
}

async function changerMotDePasse() {
  enCoursChangement.value = true
  messageMotDePasse.value = ''
  erreurMotDePasse.value = ''
  try {
    await changerMonMotDePasse({
      ancien_mot_de_passe: ancienMotDePasse.value,
      nouveau_mot_de_passe: nouveauMotDePasse.value,
      confirmation: confirmation.value,
    })
    auth.deconnecter()
    await router.push({ name: 'login', query: { mot_de_passe_change: 'ok' } })
  } catch (cause) {
    erreurMotDePasse.value = extraireMessageErreur(cause)
  } finally {
    enCoursChangement.value = false
  }
}
</script>

<template>
  <v-container fluid class="pa-6" style="max-width: 960px">
    <div class="d-flex align-center mb-4">
      <h1 class="font-display text-h6">Paramètres</h1>
    </div>

    <v-alert v-if="erreurChargement" type="error" class="mb-4" variant="tonal">
      {{ erreurChargement }}
    </v-alert>

    <template v-if="profil">
      <v-card class="mb-6" variant="tonal">
        <v-card-text class="d-flex align-center ga-4">
          <v-avatar color="primary" size="56">
            <span class="text-h6 font-weight-bold">{{ initiales }}</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              {{ [profil.prenom, profil.nom].filter(Boolean).join(' ') || profil.email }}
            </div>
            <div class="text-body-2 text-medium-emphasis">{{ profil.email }}</div>
            <v-chip size="small" variant="tonal" color="primary" class="mt-1 mr-1">
              {{ LIBELLES_ROLE[profil.role] }}
            </v-chip>
            <v-chip v-if="profil.sgi" size="small" variant="outlined" class="mt-1 mr-1">
              {{ profil.sgi }}
            </v-chip>
          </div>
          <v-spacer />
          <div class="text-body-2 text-medium-emphasis text-right">
            <div>Membre depuis</div>
            <div class="font-weight-medium">{{ dateInscription }}</div>
          </div>
        </v-card-text>
      </v-card>

      <v-tabs v-model="ongletActif" color="primary" class="mb-4">
        <v-tab value="profil">Profil</v-tab>
        <v-tab value="securite">Sécurité</v-tab>
      </v-tabs>

      <v-window v-model="ongletActif">
        <v-window-item value="profil">
          <v-card variant="tonal">
            <v-card-text>
              <v-alert v-if="messageSucces" type="success" class="mb-4" variant="tonal">
                {{ messageSucces }}
              </v-alert>
              <v-alert v-if="erreurProfil" type="error" class="mb-4" variant="tonal">
                {{ erreurProfil }}
              </v-alert>

              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="prenom"
                    label="Prénom"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="nom"
                    label="Nom"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col v-if="estInvestisseur" cols="12" sm="6">
                  <v-select
                    v-model="typePersonne"
                    :items="optionsTypePersonne"
                    item-title="titre"
                    item-value="value"
                    label="Type de personne"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col v-if="estAgent" cols="12" sm="6">
                  <v-text-field
                    v-model="matricule"
                    label="Matricule"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col v-if="estAdminSgi" cols="12" sm="6">
                  <v-text-field
                    v-model="fonction"
                    label="Fonction"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
              </v-row>

              <div class="d-flex justify-end mt-4">
                <v-btn
                  color="primary"
                  :loading="enregistrement"
                  :disabled="enregistrement"
                  @click="enregistrerProfil"
                >
                  Enregistrer
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="securite">
          <v-card variant="tonal">
            <v-card-text>
              <v-alert v-if="messageMotDePasse" type="success" class="mb-4" variant="tonal">
                {{ messageMotDePasse }}
              </v-alert>
              <v-alert v-if="erreurMotDePasse" type="error" class="mb-4" variant="tonal">
                {{ erreurMotDePasse }}
              </v-alert>

              <v-form @submit.prevent="changerMotDePasse">
                <v-text-field
                  v-model="ancienMotDePasse"
                  label="Mot de passe actuel"
                  variant="outlined"
                  density="comfortable"
                  type="password"
                  autocomplete="current-password"
                  class="mb-4"
                  hide-details
                />
                <v-text-field
                  v-model="nouveauMotDePasse"
                  label="Nouveau mot de passe"
                  variant="outlined"
                  density="comfortable"
                  :type="afficherMotsDePasse ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="mb-4"
                  hide-details
                />
                <v-text-field
                  v-model="confirmation"
                  label="Confirmer le nouveau mot de passe"
                  variant="outlined"
                  density="comfortable"
                  :type="afficherMotsDePasse ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="mb-4"
                  hide-details
                />

                <div class="d-flex align-center justify-space-between">
                  <v-btn
                    variant="text"
                    color="on-surface"
                    prepend-icon="mdi-eye-outline"
                    @click="afficherMotsDePasse = !afficherMotsDePasse"
                  >
                    {{ afficherMotsDePasse ? 'Masquer' : 'Afficher' }}
                  </v-btn>
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="enCoursChangement"
                    :disabled="enCoursChangement"
                  >
                    Changer le mot de passe
                  </v-btn>
                </div>
              </v-form>

              <p class="text-body-2 text-medium-emphasis mt-4">
                Après un changement de mot de passe, vous serez déconnecté et devrez vous
                reconnecter. Toutes vos autres sessions sont révoquées.
              </p>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </template>
  </v-container>
</template>