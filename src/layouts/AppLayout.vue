<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { Bell, Menu, Moon, Sun } from '@lucide/vue'

import { LIBELLES_ROLE, NAVIGATION_PAR_ROLE } from '@/config/navigation'
import SidebarContenu from '@/components/commun/SidebarContenu.vue'
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
  <!-- Deux drawers distincts (v-if / v-else) : Vuetify laisse le drawer
       dans un état interne incohérent quand on bascule dynamiquement
       `temporary`/`permanent` via des props — le sidebar desktop
       n'apparaissait alors qu'après un redimensionnement de fenêtre.
       Le contenu est mutualisé dans SidebarContenu (zéro duplication). -->
  <v-navigation-drawer
    v-if="mobile"
    v-model="drawerOuvert"
    temporary
    width="280"
    class="nav-institutionnelle"
    color="surface"
  >
    <SidebarContenu
      :chemin-actif="route.path"
      @navigation="fermerDrawerMobile"
      @deconnecter="deconnecter"
    />
  </v-navigation-drawer>

  <v-navigation-drawer
    v-else
    permanent
    width="280"
    class="nav-institutionnelle"
    color="surface"
  >
    <SidebarContenu :chemin-actif="route.path" @deconnecter="deconnecter" />
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
.mobile-brand { color: rgb(var(--v-theme-on-surface)); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.06rem; font-weight: 800; letter-spacing: -0.04em; }
.mobile-brand span { color: rgb(var(--v-theme-primary)); }
.app-bar-modern { min-height: 64px; }
.border-b { border-bottom: 1px solid rgb(var(--v-theme-outline-variant)) !important; }
.topbar-icon { min-width: 42px; min-height: 42px; }
@media (max-width: 600px) { .app-bar-modern { padding-left: 4px !important; padding-right: 8px !important; } .mobile-brand { font-size: 0.98rem; } }
</style>
