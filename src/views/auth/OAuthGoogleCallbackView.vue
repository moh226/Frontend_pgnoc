<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { redirectionPourRole } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const enCours = ref(true)
const messageErreur = ref('')

const MESSAGES_ERREUR: Record<string, string> = {
  acces_refuse: "Autorisation Google refusée.",
  code_manquant: 'Réponse Google incomplète.',
  etat_invalide: 'Session invalide ou expirée. Réessayez.',
  identite_indisponible: 'Impossible de récupérer votre identité Google.',
  email_non_verifie: 'L\'adresse Google doit être vérifiée avant la connexion.',
  aucun_email: 'Google n\'a fourni aucune adresse email.',
  compte_conflit: 'Cet email est déjà lié à un autre compte Google.',
}

function extraireJetons(hash: string): { access: string; refresh: string } | null {
  if (!hash.startsWith('#')) return null
  const parametres = new URLSearchParams(hash.slice(1))
  const access = parametres.get('access')
  const refresh = parametres.get('refresh')
  return access && refresh ? { access, refresh } : null
}

onMounted(async () => {
  try {
    const erreur = typeof route.query.error === 'string' ? route.query.error : ''
    if (erreur) {
      messageErreur.value = MESSAGES_ERREUR[erreur] ?? 'La connexion Google a échoué.'
      return
    }

    const jetons = extraireJetons(window.location.hash)
    if (!jetons) {
      messageErreur.value = 'Réponse Google incomplète. Réessayez.'
      return
    }

    auth.fixerJetons(jetons.access, jetons.refresh)
    await router.replace(redirectionPourRole(auth.role))
  } catch (cause) {
    console.error('Retour Google : erreur inattendue', cause)
    messageErreur.value = 'La connexion Google a échoué. Réessayez.'
  } finally {
    enCours.value = false
  }
})

const titre = computed(() => (messageErreur.value ? 'Connexion Google impossible' : 'Connexion en cours…'))
</script>

<template>
  <v-container fluid class="auth-page pa-0">
    <div class="orb orbe-un" />
    <div class="orb orbe-deux" />

    <div class="carte">
      <v-icon
        :icon="messageErreur ? 'mdi-google' : 'mdi-loading'"
        :class="{ 'icone-rotation': !messageErreur }"
        color="primary"
        size="40"
      />
      <div class="titre">{{ titre }}</div>
      <div class="sous-titre">
        {{
          messageErreur
            ? messageErreur
            : 'Retour de Google en cours, vérification de votre session…'
        }}
      </div>
      <v-btn v-if="messageErreur" color="primary" class="mt-4" :to="{ name: 'login' }">
        Retour à la connexion
      </v-btn>
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

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.12;
}

.orbe-un {
  width: 380px;
  height: 380px;
  top: -100px;
  left: -100px;
  background-color: rgb(var(--v-theme-primary));
}

.orbe-deux {
  width: 320px;
  height: 320px;
  bottom: -80px;
  right: -80px;
  background-color: rgb(var(--v-theme-secondary));
}

.carte {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  max-width: 380px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(var(--v-theme-surface), 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.icone-rotation {
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}

.titre {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.sous-titre {
  font-size: 14px;
  line-height: 20px;
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>