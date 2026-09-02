<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, UserPlus } from '@lucide/vue'

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

function continuerAvecGoogle() {
  window.location.href = `${import.meta.env.VITE_API_URL ?? '/api'}/comptes/oauth/google/login/`
}
</script>

<template>
  <div class="auth-page">
    <!-- Branding à gauche (masqué sur mobile) -->
    <div class="brand-content">
      <div class="brand-badge">
        <UserPlus :size="20" />
        <span>Inscription</span>
      </div>
      <h1 class="brand-titre">
        Demandez votre <span class="brand-accent">compte-titre</span> en ligne.
      </h1>
      <p class="brand-desc">
        Créez votre compte investisseur et soumettez votre demande
        de compte-titre auprès d'une SGI partenaire en quelques clics.
      </p>
      <div class="brand-features">
        <div class="brand-feature">
          <div class="brand-feature-icon">
            <Lock :size="18" />
          </div>
          <div>
            <p class="brand-feature-title">Données protégées</p>
            <p class="brand-feature-desc">Chiffrement de bout en bout</p>
          </div>
        </div>
        <div class="brand-feature">
          <div class="brand-feature-icon brand-feature-icon--accent">
            <UserPlus :size="18" />
          </div>
          <div>
            <p class="brand-feature-title">Inscription rapide</p>
            <p class="brand-feature-desc">En quelques minutes seulement</p>
          </div>
        </div>
      </div>
      <!--<p class="brand-footer">© 2026 PGNOC-TI</p>-->
    </div>

    <!-- Formulaire à droite, sur carte blanche -->
    <main class="form-panel">
      <div class="form-card">
        <header class="form-header">
          <div class="form-logo">
            <div class="form-logo-icon">
              <UserPlus :size="20" />
            </div>
            <span class="form-logo-text">PGNOC-TI</span>
          </div>
        </header>

        <div class="form-title">
          <h2>Créer un compte</h2>
          <p>L'inscription est ouverte aux investisseurs uniquement.</p>
        </div>

        <v-alert v-if="erreurs.global" type="error" class="mb-6" variant="tonal" rounded="lg">
          {{ erreurs.global }}
        </v-alert>

        <v-form @submit.prevent="sInscrire" class="form-body">
          <div class="field">
            <label class="field-label" for="reg-email">Email</label>
            <div class="field-input">
              <Mail class="field-icon" :size="18" />
              <input
                id="reg-email"
                v-model="email"
                type="email"
                placeholder="vous@entreprise.com"
                autocomplete="email"
                required
              />
            </div>
            <span v-if="erreurs.email" class="field-error">{{ erreurs.email }}</span>
          </div>

          <div class="field-row-grid">
            <div class="field">
              <label class="field-label" for="reg-prenom">Prénom</label>
              <div class="field-input">
                <User class="field-icon" :size="18" />
                <input
                  id="reg-prenom"
                  v-model="prenom"
                  type="text"
                  placeholder="Jean"
                  autocomplete="given-name"
                  required
                />
              </div>
              <span v-if="erreurs.prenom" class="field-error">{{ erreurs.prenom }}</span>
            </div>
            <div class="field">
              <label class="field-label" for="reg-nom">Nom</label>
              <div class="field-input">
                <User class="field-icon" :size="18" />
                <input
                  id="reg-nom"
                  v-model="nom"
                  type="text"
                  placeholder="Traoré"
                  autocomplete="family-name"
                  required
                />
              </div>
              <span v-if="erreurs.nom" class="field-error">{{ erreurs.nom }}</span>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-password">Mot de passe</label>
            <div class="field-input">
              <Lock class="field-icon" :size="18" />
              <input
                id="reg-password"
                v-model="motDePasse"
                :type="afficherMotDePasse ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="field-toggle"
                :aria-label="afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                @click="afficherMotDePasse = !afficherMotDePasse"
              >
                <EyeOff v-if="afficherMotDePasse" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
            <span v-if="erreurs.password" class="field-error">{{ erreurs.password }}</span>
          </div>

          <div class="field">
            <label class="field-label" for="reg-confirm">Confirmer le mot de passe</label>
            <div class="field-input">
              <Lock class="field-icon" :size="18" />
              <input
                id="reg-confirm"
                v-model="confirmation"
                type="password"
                placeholder="••••••••"
                autocomplete="new-password"
                required
              />
            </div>
            <span v-if="erreurs.password_confirmation" class="field-error">{{ erreurs.password_confirmation }}</span>
          </div>

          <button type="submit" class="btn-primary" :disabled="enCours">
            <span v-if="enCours" class="btn-spinner" />
            <span v-else>S'inscrire</span>
            <ArrowRight v-if="!enCours" :size="18" />
          </button>
        </v-form>

        <div class="divider">
          <span class="divider-line" />
          <span class="divider-text">OU</span>
          <span class="divider-line" />
        </div>

        <button type="button" class="btn-google" @click="continuerAvecGoogle">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          S'inscrire avec Google
        </button>

        <p class="form-footer">
          Déjà un compte ?
          <router-link :to="{ name: 'login' }" class="form-footer-link">
            Se connecter
          </router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  background: linear-gradient(135deg, #0C3C94 0%, #091E4D 35%, #D6DEE8 65%, rgb(var(--v-theme-surface)) 100%);
  color: #fff;
}

/* ── Branding (gauche) ── */
.brand-content {
  position: absolute;
  top: 50%;
  left: 80px;
  transform: translateY(-50%);
  max-width: 440px;
  z-index: 1;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 32px;
}

.brand-titre {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
}

.brand-accent {
  color: #F7C600;
}

.brand-desc {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 40px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand-feature {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  flex-shrink: 0;
}

.brand-feature-icon--accent {
  background: rgba(247, 198, 0, 0.2);
  color: #F7C600;
}

.brand-feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.brand-feature-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 2px 0 0;
}

.brand-footer {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 32px 0 0;
}

/* ── Formulaire (droite, carte blanche) ── */
.form-panel {
  margin-left: auto;
  width: 560px;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: rgb(var(--v-theme-surface));
  border-radius: 24px 0 0 24px;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.form-card {
  width: 100%;
  max-width: 380px;
}

.form-header {
  margin-bottom: 40px;
}

.form-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgb(var(--v-theme-primary));
  color: #fff;
}

.form-logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));
}

.form-title {
  margin-bottom: 32px;
}

.form-title h2 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.form-title p {
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

/* ── Champs ── */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.field-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 48px;
  background: rgb(var(--v-theme-surface-variant));
  border: 1.5px solid var(--v-theme-outline);
  border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(12, 60, 148, 0.1);
  background: rgb(var(--v-theme-surface));
}

.field-icon {
  color: rgb(var(--v-theme-on-surface-variant));
  flex-shrink: 0;
  transition: color 0.2s;
}

.field-input:focus-within .field-icon {
  color: rgb(var(--v-theme-primary));
}

.field-input input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  font-family: inherit;
  caret-color: rgb(var(--v-theme-primary));
}

.field-input input::placeholder {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.6;
}

.field-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: rgb(var(--v-theme-on-surface-variant));
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.field-toggle:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(12, 60, 148, 0.08);
}

.field-error {
  font-size: 12px;
  color: rgb(var(--v-theme-error));
}

/* ── Boutons ── */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  margin-top: 8px;
  padding: 0 24px;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow: 0 4px 16px rgba(12, 60, 148, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.2;
}

.divider-text {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 48px;
  padding: 0 24px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface));
  border: 1.5px solid var(--v-theme-outline);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.btn-google:hover {
  background: rgb(var(--v-theme-outline));
  border-color: rgb(var(--v-theme-outline));
}

/* ── Footer ── */
.form-footer {
  text-align: center;
  margin-top: 28px;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.form-footer-link {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}

.form-footer-link:hover {
  text-decoration: underline;
}

/* ── Responsive ── */
@media (max-width: 959px) {
  .brand-content {
    display: none;
  }

  .form-panel {
    width: 100%;
    border-radius: 0;
  }

  .field-row-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
