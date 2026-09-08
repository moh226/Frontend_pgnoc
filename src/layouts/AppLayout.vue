<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { Bell, ChevronRight, Menu, Moon, Sun } from '@lucide/vue'

import { LIBELLES_ROLE, NAVIGATION_PAR_ROLE } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const notifications = useNotificationsStore()
const theme = useTheme()
const { mobile } = useDisplay()

const drawerOuvert = ref(false)

const navigation = computed(() =>
  (NAVIGATION_PAR_ROLE[auth.roleActuel ?? 'INVESTISSEUR'] ?? []).filter((item) => !item.cache),
)

const initiales = computed(() =>
  [auth.utilisateur?.prenom?.[0], auth.utilisateur?.nom?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || auth.utilisateur?.email?.[0]?.toUpperCase() || 'P',
)

const espaceLabel = computed(() => {
  if (auth.roleActuel === 'INVESTISSEUR') return 'Espace investisseur'
  if (auth.roleActuel === 'AGENT_SGI') return 'Espace instruction'
  if (auth.roleActuel === 'ADMIN_SGI') return 'Administration SGI'
  return 'Administration générale'
})

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

function deconnecter() {
  drawerOuvert.value = false
  auth.deconnecter()
  void router.push({ name: 'login' })
}

function fermerDrawerMobile() {
  if (mobile.value) drawerOuvert.value = false
}

function estActif(vers: string): boolean {
  return route.path === vers ||
    (vers !== navigation.value[0]?.vers && route.path.startsWith(`${vers}/`))
}

function ouvrirNotifications() {
  const routeNotifications = navigation.value.find((item) => item.vers.endsWith('/notifications'))
  if (routeNotifications) void router.push(routeNotifications.vers)
}

watch(() => route.fullPath, fermerDrawerMobile)

onMounted(() => {
  if (auth.estConnecte) void notifications.chargerCompte()
})
</script>

<template>
  <!-- Sidebar unique : permanent et toujours déplié sur desktop (280px),
       drawer temporaire superposé sur mobile. Le système de layout
       Vuetify décale automatiquement la barre et le contenu. -->
  <v-navigation-drawer
    v-model="drawerOuvert"
    :temporary="mobile"
    :permanent="!mobile"
    width="280"
    class="nav-institutionnelle"
    color="surface"
  >
    <div class="sidebar-inner d-flex flex-column h-100">
      <div class="brand-block px-5 py-6">
        <div class="d-flex align-center ga-3">
          <div class="brand-mark">P</div>
          <div>
            <div class="brand-name">PGNOC<span>-TI</span></div>
            <div class="brand-context">{{ espaceLabel }}</div>
          </div>
        </div>
      </div>

      <div class="navigation-label px-5 pt-7 pb-2">Navigation</div>
      <v-list nav class="px-3 py-1">
        <v-list-item
          v-for="item in navigation"
          :key="item.vers"
          :to="item.vers"
          :active="estActif(item.vers)"
          active-class="navigation-active"
          class="navigation-item mb-1 rounded-xl"
          @click="fermerDrawerMobile"
        >
          <template #prepend><v-icon :icon="item.icone" size="20" /></template>
          <v-list-item-title>{{ item.titre }}</v-list-item-title>
          <template #append>
            <v-badge
              v-if="item.vers.endsWith('/notifications') && notifications.compteNonLues"
              :content="notifications.compteNonLues"
              color="error"
              inline
            />
            <ChevronRight v-else :size="15" class="navigation-arrow" />
          </template>
        </v-list-item>
      </v-list>

      <div class="flex-grow-1" />
      <div class="sidebar-footer pa-3">
        <v-menu location="top start">
          <template #activator="{ props }">
            <button v-bind="props" class="profile-card w-100 text-left">
              <v-avatar color="primary" size="38" class="profile-avatar">{{ initiales }}</v-avatar>
              <span class="profile-copy">
                <strong>{{ auth.nomComplet || auth.utilisateur?.email }}</strong>
                <small>{{ LIBELLES_ROLE[auth.roleActuel ?? 'INVESTISSEUR'] }}</small>
              </span>
              <ChevronRight :size="16" class="profile-chevron" />
            </button>
          </template>
          <v-list min-width="220">
            <v-list-item :title="auth.utilisateur?.email" subtitle="Compte connecté" prepend-icon="mdi-account-outline" />
            <v-divider class="my-2" />
            <v-list-item @click="deconnecter" prepend-icon="mdi-logout" title="Se déconnecter" />
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-navigation-drawer>

  <v-app-bar flat color="background" class="border-b app-bar-modern px-2 px-sm-4">
    <v-btn v-if="mobile" icon variant="text" aria-label="Ouvrir le menu" class="topbar-icon" @click="drawerOuvert = !drawerOuvert">
      <Menu :size="22" />
    </v-btn>
    <div v-if="mobile" class="mobile-brand ml-1">PGNOC<span>-TI</span></div>
    <v-spacer />
    <v-btn icon aria-label="Notifications" variant="text" color="on-background" class="topbar-icon mr-1" @click="ouvrirNotifications">
      <Bell :size="19" />
      <v-badge v-if="notifications.compteNonLues" :content="notifications.compteNonLues" color="error" floating />
    </v-btn>
    <v-btn icon aria-label="Changer de thème" @click="toggleTheme" class="topbar-icon mr-2" variant="text" color="on-background">
      <Sun v-if="theme.global.current.value.dark" :size="20" />
      <Moon v-else :size="20" />
    </v-btn>
    <v-chip v-if="auth.roleActuel" variant="tonal" color="primary" class="mr-2 d-none d-sm-flex">
      {{ LIBELLES_ROLE[auth.roleActuel] }}
    </v-chip>
  </v-app-bar>

  <v-main class="bg-background">
    <router-view />
  </v-main>
</template>

<style scoped>
.nav-institutionnelle { border-right: 1px solid rgb(var(--v-theme-outline)) !important; }
.brand-block { border-bottom: 1px solid rgb(var(--v-theme-outline)); }
.brand-mark { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 12px; color: rgb(var(--v-theme-on-primary)); background: rgb(var(--v-theme-primary)); box-shadow: 0 2px 6px rgba(var(--v-theme-primary), 0.3); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.15rem; font-weight: 800; flex-shrink: 0; }
.brand-name, .mobile-brand { color: rgb(var(--v-theme-on-surface)); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.06rem; font-weight: 800; letter-spacing: -0.04em; white-space: nowrap; }
.brand-name span, .mobile-brand span { color: rgb(var(--v-theme-primary)); }
.brand-context { margin-top: 2px; color: rgb(var(--v-theme-on-surface-variant)); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
.navigation-label { color: rgb(var(--v-theme-on-surface-variant)); font-size: 0.67rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.navigation-item { min-height: 46px; color: rgb(var(--v-theme-on-surface-variant)) !important; transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease; }
.navigation-item:hover { color: rgb(var(--v-theme-primary)) !important; background: rgba(var(--v-theme-primary), 0.055); transform: translateX(2px); }
.navigation-active { color: rgb(var(--v-theme-primary)) !important; background: rgba(var(--v-theme-primary), 0.1) !important; font-weight: 700; box-shadow: inset 3px 0 0 rgb(var(--v-theme-primary)); }
.navigation-active :deep(.v-icon) { color: rgb(var(--v-theme-primary)); }
.navigation-arrow { opacity: 0.45; }
.sidebar-footer { border-top: 1px solid rgb(var(--v-theme-outline)); }
.profile-card { display: flex; align-items: center; gap: 10px; min-height: 58px; padding: 8px; border: 1px solid transparent; border-radius: 12px; color: rgb(var(--v-theme-on-surface)); background: transparent; cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease; }
.profile-card:hover { border-color: rgb(var(--v-theme-outline)); background: rgb(var(--v-theme-surface-variant)); }
.profile-avatar { flex-shrink: 0; font-size: 0.78rem; font-weight: 800; }
.profile-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; }
.profile-copy strong, .profile-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.profile-copy strong { font-size: 0.78rem; }
.profile-copy small { margin-top: 2px; color: rgb(var(--v-theme-on-surface-variant)); font-size: 0.68rem; }
.profile-chevron { flex-shrink: 0; color: rgb(var(--v-theme-on-surface-variant)); }
.app-bar-modern { min-height: 64px; }
.border-b { border-bottom: 1px solid rgb(var(--v-theme-outline-variant)) !important; }
.topbar-icon { min-width: 42px; min-height: 42px; }
@media (max-width: 600px) { .app-bar-modern { padding-left: 4px !important; padding-right: 8px !important; } .mobile-brand { font-size: 0.98rem; } }
</style>
