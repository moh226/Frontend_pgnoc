<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { extraireMessageErreur } from '@/api/client'
import { redirectionPourRole } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const motDePasse = ref('')
const afficherMotDePasse = ref(false)
const erreur = ref('')
const enCours = ref(false)

const orbeUn = ref<HTMLElement | null>(null)
const orbeDeux = ref<HTMLElement | null>(null)

function survol(e: MouseEvent) {
  if (window.innerWidth <= 768 || !orbeUn.value || !orbeDeux.value) return
  const x = e.clientX / window.innerWidth - 0.5
  const y = e.clientY / window.innerHeight - 0.5
  orbeUn.value.style.transform = `translate(${x * 20}px, ${y * 20}px)`
  orbeDeux.value.style.transform = `translate(${x * -40}px, ${y * -40}px)`
}

onMounted(() => window.addEventListener('mousemove', survol))
onUnmounted(() => window.removeEventListener('mousemove', survol))

async function seConnecter() {
  erreur.value = ''
  enCours.value = true
  try {
    await auth.seConnecter({ email: email.value.trim(), password: motDePasse.value })
    const demandee = route.query.redirection
    const destination =
      typeof demandee === 'string' && demandee.startsWith('/')
        ? demandee
        : redirectionPourRole(auth.role)
    router.push(destination)
  } catch (cause) {
    erreur.value =
      (cause as { response?: { status?: number } })?.response?.status === 401
        ? 'Identifiants incorrects.'
        : extraireMessageErreur(cause)
  } finally {
    enCours.value = false
  }
}

function continuerAvecGoogle() {
  window.location.href = `${import.meta.env.VITE_API_URL ?? '/api'}/comptes/oauth/google/login/`
}
</script>

<template>
  <v-container fluid class="auth-page pa-0">
    <div ref="orbeUn" class="orb orbe-un" />
    <div ref="orbeDeux" class="orb orbe-deux" />

    <v-row class="auth-split ma-0" no-gutters>
      <v-col cols="12" md="6" class="auth-visuel d-none d-md-flex align-center justify-center">
        <div class="contenu-visuel">
          <span class="etiquette">Security First Architecture</span>
          <h1 class="titre-visuel font-display">
            L'excellence en <br />
            <span class="accent">Haute Sécurité.</span>
          </h1>
          <p class="descriptif">
            Protégez vos actifs avec une technologie de pointe et une gestion de patrimoine
            exclusive.
          </p>
          <div class="carte-verre">
            <v-icon icon="mdi-verified-user" color="primary" size="24" />
            <div>
              <p class="carte-titre">Conformité KYC Temps Réel</p>
              <p class="carte-sous-titre">Actif • Session Sécurisée</p>
            </div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6" class="auth-forme d-flex flex-column align-center justify-center">
        <div class="carte-forme">
          <header class="entete-forme">
            <div class="logo-bar">
              <span class="logo-icone">
                <v-icon icon="mdi-lock" color="primary" size="26" />
              </span>
              <span class="logo-texte font-display">PGNOC-TI</span>
            </div>
            <a class="lien-aide" href="#">Aide</a>
          </header>

          <div class="titre-forme">
            <h2>Bienvenue</h2>
            <p>Veuillez entrer vos identifiants pour accéder à votre coffre-fort numérique.</p>
          </div>

          <v-alert
            v-if="route.query.inscription === 'ok'"
            type="success"
            class="mb-4"
            variant="tonal"
          >
            Inscription réussie. Connectez-vous pour continuer.
          </v-alert>
          <v-alert v-if="erreur" type="error" class="mb-4" variant="tonal">
            {{ erreur }}
          </v-alert>

          <v-form @submit.prevent="seConnecter">
            <div class="champ-groupe">
              <label class="etiquette-champ" for="champ-email">Adresse Email</label>
              <div class="champ-doux">
                <v-text-field
                  id="champ-email"
                  v-model="email"
                  variant="plain"
                  type="email"
                  placeholder="nom@sgi.com"
                  autocomplete="email"
                  density="comfortable"
                  hide-details
                  required
                />
                <v-icon icon="mdi-email-outline" class="icone-champ" size="16" />
              </div>
            </div>

            <div class="champ-groupe">
              <label class="etiquette-champ" for="champ-mot-de-passe">Mot de passe</label>
              <div class="champ-doux">
                <v-text-field
                  id="champ-mot-de-passe"
                  v-model="motDePasse"
                  variant="plain"
                  :type="afficherMotDePasse ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  density="comfortable"
                  hide-details
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
                  <v-icon
                    :icon="afficherMotDePasse ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    size="16"
                  />
                </button>
              </div>
              <div class="ligne-oubli">
                <a href="#" class="lien-oubli">Mot de passe oublié ?</a>
              </div>
            </div>

            <v-btn color="primary" class="btn-principal" type="submit" :loading="enCours" block>
              Se connecter
              <v-icon icon="mdi-arrow-right" size="16" class="ml-2" />
            </v-btn>

            <div class="separateur">
              <span class="separateur-ligne" />
              <span class="separateur-texte">OU</span>
              <span class="separateur-ligne" />
            </div>

            <v-btn class="btn-google" type="button" block @click="continuerAvecGoogle">
              <v-icon icon="mdi-google" size="20" class="mr-2" />
              Continuer avec Google
            </v-btn>
          </v-form>

          <p class="pied-forme">
            Pas encore de compte ?
            <router-link class="lien-principal" :to="{ name: 'inscription' }"
              >S'inscrire</router-link
            >
          </p>
        </div>

        <footer class="pied-legal">
          <div class="liens-legaux">
            <a href="#">Confidentialité</a>
            <a href="#">CGU</a>
            <a href="#">Compliance</a>
          </div>
          <p>© 2026 PGNOC-TI. Haute Sécurité.</p>
        </footer>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  position: relative;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.15;
  animation: flottement 20s ease-in-out infinite alternate;
  transition: transform 0.2s ease-out;
}

.orbe-un {
  width: 400px;
  height: 400px;
  top: -80px;
  left: -80px;
  background-color: rgb(var(--v-theme-primary));
}

.orbe-deux {
  width: 300px;
  height: 300px;
  bottom: 40px;
  right: 40px;
  background-color: rgb(var(--v-theme-secondary));
  animation-delay: -5s;
}

@keyframes flottement {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(100px, 50px) scale(1.2);
  }
}

.auth-split {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
}

.auth-visuel {
  border-right: 1px solid rgba(var(--v-theme-outline), 0.15);
}

.contenu-visuel {
  max-width: 480px;
  padding: 32px;
}

.etiquette {
  display: block;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 16px;
  font-weight: 600;
}

.titre-visuel {
  font-size: 48px;
  line-height: 56px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));
}

.titre-visuel .accent {
  color: rgb(var(--v-theme-primary));
}

.descriptif {
  font-size: 18px;
  line-height: 28px;
  color: rgba(var(--v-theme-on-surface-variant), 0.8);
  max-width: 384px;
  margin-top: 16px;
}

.carte-verre {
  position: fixed;
  right: 40px;
  bottom: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(var(--v-theme-surface), 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  border-radius: 12px;
  padding: 16px;
  max-width: 280px;
  animation: pulsation 2.5s ease-in-out infinite;
}

@keyframes pulsation {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
}

.carte-verre .v-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.carte-titre {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.carte-sous-titre {
  font-size: 10px;
  color: rgb(var(--v-theme-outline));
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.auth-forme {
  background-color: rgba(var(--v-theme-background), 0.6);
  padding: 40px 32px 24px;
}

.carte-forme {
  width: 100%;
  max-width: 400px;
}

.entete-forme {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
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
  margin-bottom: 24px;
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
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.3);
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.champ-doux:focus-within {
  box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.15);
  border-bottom: 1px solid rgb(var(--v-theme-primary));
}

.champ-doux :deep(.v-text-field) {
  flex: 1;
  font-size: 16px;
}

.champ-doux :deep(.v-field) {
  background: transparent;
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

.ligne-oubli {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.lien-oubli {
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-primary), 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.lien-oubli:hover {
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
  margin-top: 16px;
}

.btn-principal:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 24px rgba(var(--v-theme-primary), 0.25);
}

.btn-principal:active {
  transform: scale(0.97);
}

.separateur {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.separateur-ligne {
  height: 1px;
  background: rgba(var(--v-theme-outline), 0.2);
  flex: 1;
}

.separateur-texte {
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-outline), 0.6);
}

.btn-google {
  height: 48px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.3);
  background: rgba(var(--v-theme-surface), 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  text-transform: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-google:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.btn-google:active {
  transform: scale(0.97);
}

.pied-forme {
  text-align: center;
  margin-top: 24px;
  color: rgba(var(--v-theme-on-surface-variant), 0.7);
  font-size: 16px;
}

.lien-principal {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}

.lien-principal:hover {
  text-decoration: underline;
}

.pied-legal {
  margin-top: 48px;
  width: 100%;
  max-width: 400px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.1);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.liens-legaux {
  display: flex;
  gap: 16px;
}

.liens-legaux a {
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-outline));
  text-decoration: none;
  transition: color 0.2s;
}

.liens-legaux a:hover {
  color: rgb(var(--v-theme-primary));
}

.pied-legal p {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-outline), 0.5);
}

@media (max-width: 959px) {
  .titre-visuel {
    font-size: 32px;
    line-height: 40px;
  }

  .carte-verre {
    display: none;
  }
}
</style>
