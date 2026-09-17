<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Eye, EyeOff, LogOut, Shield, User as UserIcon, Mail, Calendar } from '@lucide/vue'

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

const nomComplet = computed(
  () => [profil.value?.prenom, profil.value?.nom].filter(Boolean).join(' ') || profil.value?.email || '',
)

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
    messageSucces.value = 'Profil enregistré avec succès.'
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

function deconnecter() {
  auth.deconnecter()
  void router.push({ name: 'login' })
}
</script>

<template>
  <v-container fluid class="page-profil pa-4">
    <v-alert v-if="erreurChargement" type="error" class="mb-4" variant="tonal" border="start">
      {{ erreurChargement }}
    </v-alert>

    <!-- Skeleton -->
    <div v-if="chargement" class="skeleton-profil" aria-busy="true" aria-label="Chargement du profil">
      <div class="skeleton-entete"></div>
      <div class="skeleton-bloc"></div>
      <div class="skeleton-bloc"></div>
    </div>

    <template v-else-if="profil">
      <!-- Carte profil -->
      <header class="profil-entete" data-aos="fade-down" data-aos-duration="600">
        <div class="profil-avatar" aria-hidden="true">{{ initiales }}</div>
        <h1 class="profil-nom">{{ nomComplet }}</h1>
        <span class="profil-role">{{ LIBELLES_ROLE[profil.role] }}</span>

        <div class="profil-meta">
          <span class="profil-meta-item">
            <Mail :size="13" /> {{ profil.email }}
          </span>
          <span v-if="profil.sgi" class="profil-meta-item">
            <Building2 :size="13" /> {{ profil.sgi }}
          </span>
          <span v-if="dateInscription" class="profil-meta-item">
            <Calendar :size="13" /> Membre depuis {{ dateInscription }}
          </span>
        </div>
      </header>

      <!-- Sélecteur d'onglet -->
      <div class="segmented" role="tablist" data-aos="fade-up" data-aos-delay="100">
        <button
          class="segment"
          :class="{ actif: ongletActif === 'profil' }"
          role="tab"
          :aria-selected="ongletActif === 'profil'"
          @click="ongletActif = 'profil'"
        >
          <UserIcon :size="16" /> Profil
        </button>
        <button
          class="segment"
          :class="{ actif: ongletActif === 'securite' }"
          role="tab"
          :aria-selected="ongletActif === 'securite'"
          @click="ongletActif = 'securite'"
        >
          <Shield :size="16" /> Sécurité
        </button>
      </div>

      <div v-show="ongletActif === 'profil'" class="panneau" data-aos="fade-up" data-aos-delay="150">
        <v-alert v-if="messageSucces" type="success" class="mb-4" variant="tonal">{{ messageSucces }}</v-alert>
        <v-alert v-if="erreurProfil" type="error" class="mb-4" variant="tonal">{{ erreurProfil }}</v-alert>

        <v-card class="carte-form">
          <v-card-text class="pa-5">
            <div class="champ-grille">
              <v-text-field v-model="prenom" label="Prénom" variant="outlined" density="comfortable" hide-details />
              <v-text-field v-model="nom" label="Nom" variant="outlined" density="comfortable" hide-details />
              <v-select
                v-if="estInvestisseur"
                v-model="typePersonne"
                :items="optionsTypePersonne"
                item-title="titre"
                item-value="value"
                label="Type de personne"
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field v-if="estAgent" v-model="matricule" label="Matricule" variant="outlined" density="comfortable" hide-details />
              <v-text-field v-if="estAdminSgi" v-model="fonction" label="Fonction" variant="outlined" density="comfortable" hide-details />
            </div>

            <v-btn
              color="primary"
              block
              class="btn-profil mt-5"
              :loading="enregistrement"
              :disabled="enregistrement"
              @click="enregistrerProfil"
            >
              Enregistrer les modifications
            </v-btn>
          </v-card-text>
        </v-card>
      </div>

      <div v-show="ongletActif === 'securite'" class="panneau" data-aos="fade-up" data-aos-delay="150">
        <v-alert v-if="messageMotDePasse" type="success" class="mb-4" variant="tonal">{{ messageMotDePasse }}</v-alert>
        <v-alert v-if="erreurMotDePasse" type="error" class="mb-4" variant="tonal">{{ erreurMotDePasse }}</v-alert>

        <v-card class="carte-form">
          <v-card-text class="pa-5">
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
                class="mb-2"
                hide-details
              />

              <button type="button" class="btn-afficher" @click="afficherMotsDePasse = !afficherMotsDePasse">
                <component :is="afficherMotsDePasse ? EyeOff : Eye" :size="16" />
                {{ afficherMotsDePasse ? 'Masquer les mots de passe' : 'Afficher les mots de passe' }}
              </button>

              <v-btn
                color="primary"
                type="submit"
                block
                class="btn-profil mt-4"
                :loading="enCoursChangement"
                :disabled="enCoursChangement"
              >
                Changer le mot de passe
              </v-btn>
            </v-form>

            <p class="note-securite">
              Après un changement de mot de passe, vous serez déconnecté et devrez vous reconnecter.
            </p>
          </v-card-text>
        </v-card>
      </div>

      <!-- Déconnexion -->
      <button class="btn-deconnexion" data-aos="fade-up" data-aos-delay="200" @click="deconnecter">
        <LogOut :size="18" />
        Se déconnecter
      </button>
    </template>
  </v-container>
</template>

<style scoped>
.page-profil {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

/* --- Entête profil --- */
.profil-entete {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0 24px;
}

.profil-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1a56c4 100%);
  color: white;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3);
}

.profil-nom {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(20px, 5vw, 24px);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.profil-role {
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profil-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 16px;
  margin-top: 16px;
}

.profil-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* --- Segmented control --- */
.segmented {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  margin-bottom: 20px;
}

.segment {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.segment.actif {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

/* --- Panneaux --- */
.panneau {
  margin-bottom: 24px;
}

.carte-form {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.champ-grille {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-profil {
  height: 46px;
  font-weight: 700;
  border-radius: 10px;
  text-transform: none;
}

.btn-afficher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  border: none;
  background: transparent;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 0;
}

.btn-deconnexion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-error), 0.3);
  background: rgba(var(--v-theme-error), 0.06);
  color: rgb(var(--v-theme-error));
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.btn-deconnexion:hover {
  background: rgba(var(--v-theme-error), 0.12);
  border-color: rgb(var(--v-theme-error));
}

.note-securite {
  margin: 16px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* --- Skeleton --- */
.skeleton-profil {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-entete,
.skeleton-bloc {
  border-radius: 16px;
  background: linear-gradient(90deg, rgb(var(--v-theme-outline)) 25%, rgb(var(--v-theme-surface-variant)) 50%, rgb(var(--v-theme-outline)) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-entete { height: 180px; }
.skeleton-bloc { height: 140px; }

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (min-width: 640px) {
  .champ-grille {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .page-profil {
    max-width: 720px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .page-profil {
    padding: 16px 12px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-entete,
  .skeleton-bloc,
  .segment {
    animation: none;
    transition: none;
  }
}
</style>