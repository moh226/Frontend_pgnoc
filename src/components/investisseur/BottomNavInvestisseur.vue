<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Cog, Folder, LayoutDashboard, Plus, Briefcase } from '@lucide/vue'

import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationsStore()

interface OngletMobile {
  nom: string
  libelle: string
  icone: typeof LayoutDashboard
  iconeActive?: typeof LayoutDashboard
  vers: string
  badge?: number
}

const onglets: OngletMobile[] = [
  {
    nom: 'investisseur-tableau-de-bord',
    libelle: 'Accueil',
    icone: LayoutDashboard,
    vers: '/espace-investisseur',
  },
  {
    nom: 'investisseur-dossiers',
    libelle: 'Demandes',
    icone: Folder,
    iconeActive: Briefcase,
    vers: '/espace-investisseur/dossiers',
  },
  {
    nom: 'investisseur-notifications',
    libelle: 'Alertes',
    icone: Bell,
    vers: '/espace-investisseur/notifications',
  },
  {
    nom: 'parametres',
    libelle: 'Profil',
    icone: Cog,
    vers: '/parametres',
  },
]

const compteurAlertes = computed(() => notifications.compteNonLues)

function naviguer(onglet: OngletMobile) {
  if (route.name === onglet.nom) return
  void router.push({ name: onglet.nom })
}

function creerDossier() {
  void router.push({ name: 'onboarding-sgi' })
}

onMounted(() => {
  if (auth.estConnecte) void notifications.chargerCompte()
})
</script>

<template>
  <div class="zone-barre-mobile" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
    <nav class="barre-nav-mobile" aria-label="Navigation principale investisseur" role="navigation">
      <div class="nav-contenu">
        <button
          v-for="onglet in onglets"
          :key="onglet.nom"
          class="onglet-mobile"
          :class="{ actif: route.name === onglet.nom }"
          @click="naviguer(onglet)"
          :aria-current="route.name === onglet.nom ? 'page' : undefined"
          :aria-label="onglet.libelle"
        >
          <div class="icone-wrapper">
            <component
              :is="route.name === onglet.nom && onglet.iconeActive ? onglet.iconeActive : onglet.icone"
              :size="24"
              aria-hidden="true"
            />
            <span
              v-if="onglet.nom === 'investisseur-notifications' && compteurAlertes"
              class="badge-notif"
              :aria-label="`${compteurAlertes} alertes non lues`"
            >
              {{ compteurAlertes > 9 ? '9+' : compteurAlertes }}
            </span>
          </div>
          <span class="libelle-onglet">{{ onglet.libelle }}</span>
        </button>

        <button
          class="fab-creer"
          @click="creerDossier"
          aria-label="Créer une nouvelle demande"
        >
          <Plus :size="24" aria-hidden="true" />
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.zone-barre-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding-bottom: env(safe-area-inset-bottom);
}

.barre-nav-mobile {
  height: 72px;
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.08);
}

.nav-contenu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 8px;
  max-width: 480px;
  margin: 0 auto;
}

.onglet-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 8px 4px;
  border: none;
  background: transparent;
  color: rgb(var(--v-theme-on-surface-variant));
  cursor: pointer;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.onglet-mobile:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
  border-radius: 12px;
}

.onglet-mobile.actif {
  color: rgb(var(--v-theme-primary));
}

.icone-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.onglet-mobile:not(.actif) .icone-wrapper:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: scale(1.05);
}

.onglet-mobile.actif .icone-wrapper {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.libelle-onglet {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.2;
  transition: font-weight 0.2s ease;
}

.onglet-mobile.actif .libelle-onglet {
  font-weight: 700;
}

.badge-notif {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background-color: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-on-error));
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.fab-creer {
  position: relative;
  z-index: 10;
  width: 56px;
  height: 56px;
  margin: 0 4px;
  margin-bottom: 8px;
  border-radius: 16px;
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border: none;
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.35);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.fab-creer:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.fab-creer:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.45);
}

.fab-creer:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
}

/* Animation d'entrée du FAB */
.fab-creer {
  animation: fab-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

@keyframes fab-enter {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animation d'entrée des onglets */
.onglet-mobile {
  animation: nav-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(16px);
}

.onglet-mobile:nth-child(1) { animation-delay: 50ms; }
.onglet-mobile:nth-child(2) { animation-delay: 100ms; }
.onglet-mobile:nth-child(3) { animation-delay: 150ms; }
.onglet-mobile:nth-child(4) { animation-delay: 200ms; }

@keyframes nav-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fab-creer,
  .onglet-mobile,
  .icone-wrapper,
  .badge-notif {
    animation: none !important;
    opacity: 1;
    transform: none;
    transition: none;
  }
}

@media (max-width: 360px) {
  .nav-contenu { padding: 0 4px; }
  .icone-wrapper { width: 40px; height: 40px; }
  .libelle-onglet { font-size: 0.62rem; }
  .fab-creer { width: 52px; height: 52px; }
}
</style>