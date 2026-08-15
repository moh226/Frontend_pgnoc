<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, Mail, UserPlus } from '@lucide/vue'

import { extraireMessageErreur } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const prenom = ref('')
const nom = ref('')
const motDePasse = ref('')
const confirmation = ref('')
const afficherMotDePasse = ref(false)
const erreurs = ref<Record<string, string>>({})
const enCours = ref(false)

async function sInscrire() {
  erreurs.value = {}
  enCours.value = true
  try {
    await auth.sInscrire({
      email: email.value.trim(),
      prenom: prenom.value.trim(),
      nom: nom.value.trim(),
      password: motDePasse.value,
      password_confirmation: confirmation.value,
    })
    router.push({ name: 'login', query: { inscription: 'ok' } })
  } catch (cause) {
    const data = (cause as { response?: { data?: unknown } })?.response?.data
    if (data && typeof data === 'object') {
      const messages = Object.fromEntries(
        Object.entries(data as Record<string, unknown>).map(([cle, valeur]) => [
          cle,
          Array.isArray(valeur) ? String(valeur[0]) : String(valeur),
        ]),
      )
      erreurs.value = messages
    } else {
      erreurs.value = { global: extraireMessageErreur(cause) }
    }
  } finally {
    enCours.value = false
  }
}
</script>

<template>
  <v-container fluid class="auth-page pa-0">
    <div class="auth-zone">
      <v-card class="carte-forme" flat border>
        <header class="entete-forme">
          <div class="logo-bar">
            <span class="logo-icone">
              <UserPlus class="text-primary" :size="24" />
            </span>
            <span class="logo-texte font-display">PGNOC-TI</span>
          </div>
          <router-link class="lien-aide" :to="{ name: 'login' }">Se connecter</router-link>
        </header>

        <div class="titre-forme">
          <h2 class="font-display">Créer un compte investisseur</h2>
          <p>L'inscription est ouverte aux investisseurs uniquement.</p>
        </div>

        <v-alert v-if="erreurs.global" type="error" class="mb-4" variant="tonal">
          {{ erreurs.global }}
        </v-alert>

        <v-form @submit.prevent="sInscrire">
          <div class="champ-groupe">
            <label class="etiquette-champ" for="champ-email">Adresse Email</label>
            <div class="champ-doux">
              <v-text-field
                id="champ-email"
                v-model="email"
                variant="plain"
                type="email"
                placeholder="nom@entreprise.com"
                autocomplete="email"
                density="comfortable"
                hide-details
                :error-messages="erreurs.email"
                required
              />
              <Mail class="icone-champ" :size="20" />
            </div>
          </div>

          <v-row no-gutters class="champ-double">
            <v-col cols="12" sm="6" class="champ-groupe pr-sm-2">
              <label class="etiquette-champ" for="champ-prenom">Prénom</label>
              <div class="champ-doux">
                <v-text-field
                  id="champ-prenom"
                  v-model="prenom"
                  variant="plain"
                  placeholder="Jean"
                  autocomplete="given-name"
                  density="comfortable"
                  hide-details
                  :error-messages="erreurs.prenom"
                  required
                />
              </div>
            </v-col>
            <v-col cols="12" sm="6" class="champ-groupe pl-sm-2">
              <label class="etiquette-champ" for="champ-nom">Nom</label>
              <div class="champ-doux">
                <v-text-field
                  id="champ-nom"
                  v-model="nom"
                  variant="plain"
                  placeholder="Traoré"
                  autocomplete="family-name"
                  density="comfortable"
                  hide-details
                  :error-messages="erreurs.nom"
                  required
                />
              </div>
            </v-col>
          </v-row>

          <div class="champ-groupe">
            <label class="etiquette-champ" for="champ-mot-de-passe">Mot de passe</label>
            <div class="champ-doux">
              <v-text-field
                id="champ-mot-de-passe"
                v-model="motDePasse"
                variant="plain"
                :type="afficherMotDePasse ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                density="comfortable"
                hide-details
                :error-messages="erreurs.password"
                required
              />
              <button
                type="button"
                class="bouton-oeil"
                :aria-label="
                  afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                "
                @click="afficherMotDePasse = !afficherMotDePasse"
              >
                <EyeOff v-if="afficherMotDePasse" :size="20" />
                <Eye v-else :size="20" />
              </button>
            </div>
          </div>

          <div class="champ-groupe">
            <label class="etiquette-champ" for="champ-confirmation"
              >Confirmation du mot de passe</label
            >
            <div class="champ-doux">
              <v-text-field
                id="champ-confirmation"
                v-model="confirmation"
                variant="plain"
                type="password"
                placeholder="••••••••"
                autocomplete="new-password"
                density="comfortable"
                hide-details
                :error-messages="erreurs.password_confirmation"
                required
              />
            </div>
          </div>

          <v-btn color="primary" class="btn-principal hover-lift" type="submit" :loading="enCours" block>
            S'inscrire
            <ArrowRight :size="18" class="ml-2" />
          </v-btn>
        </v-form>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-zone {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  padding: 32px 20px;
}

.carte-forme {
  border-radius: 16px;
  padding: 32px;
  background-color: rgb(var(--v-theme-surface));
}

.entete-forme {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.logo-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-texte {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));
}

.lien-aide {
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-outline));
  transition: color 0.2s;
  text-decoration: none;
}

.lien-aide:hover {
  color: rgb(var(--v-theme-primary));
}

.titre-forme {
  margin-bottom: 24px;
}

.titre-forme h2 {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 8px;
}

.titre-forme p {
  font-size: 16px;
  line-height: 24px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.champ-groupe {
  margin-bottom: 20px;
}

.etiquette-champ {
  display: block;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-outline));
  margin-bottom: 4px;
}

.champ-doux {
  display: flex;
  align-items: center;
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 6px;
  padding: 0 8px;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.champ-doux:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-surface));
}

.champ-doux :deep(.v-text-field) {
  flex: 1;
  font-size: 16px;
}

.champ-doux :deep(.v-field) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.champ-doux :deep(.v-field__field input) {
  color: rgb(var(--v-theme-on-surface)) !important;
}

.icone-champ,
.bouton-oeil {
  color: rgb(var(--v-theme-outline));
  transition: color 0.2s;
}

.bouton-oeil {
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.bouton-oeil:hover {
  color: rgb(var(--v-theme-primary));
}

.btn-principal {
  height: 48px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  margin-top: 8px;
}

.btn-principal:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 24px rgba(var(--v-theme-primary), 0.25);
}

.btn-principal:active {
  transform: scale(0.97);
}

@media (max-width: 600px) {
  .carte-forme {
    padding: 24px 16px;
  }
}
</style>
