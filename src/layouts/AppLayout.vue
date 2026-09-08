<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { Bell, LifeBuoy, Menu, Moon, Sun } from '@lucide/vue'

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
const dialogSupport = ref(false)

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

function ouvrirSupport() {
  dialogSupport.value = true
  if (mobile.value) drawerOuvert.value = false
}

watch(() => route.fullPath, fermerDrawerMobile)

onMounted(() => {
  if (auth.estConnecte) void notifications.chargerCompte()
})
</script>

<template>
  <!-- Composition sans bordures dures : le sidebar et la barre partagent
       le même fond de surface, la séparation vient d'une différence de
       teinte très légère (le contenu reste sur le fond global) et d'une
       ombre douce verticale. Deux drawers distincts (bug Vuetify documenté
       sur la bascule dynamique temporary/permanent), contenu mutualisé. -->
  <v-navigation-drawer
    v-if="mobile"
    v-model="drawerOuvert"
    temporary
    width="280"
    color="surface"
  >
    <SidebarContenu
      :chemin-actif="route.path"
      @navigation="fermerDrawerMobile"
      @deconnecter="deconnecter"
      @support="ouvrirSupport"
    />
  </v-navigation-drawer>

  <v-navigation-drawer v-else permanent width="280" color="surface" class="sidebar-ombre">
    <SidebarContenu :chemin-actif="route.path" @deconnecter="deconnecter" @support="ouvrirSupport" />
  </v-navigation-drawer>

  <v-app-bar flat color="surface" height="64" class="app-bar px-4 px-sm-6">
    <v-btn v-if="mobile" icon variant="text" aria-label="Ouvrir le menu" class="icone-barre" @click="drawerOuvert = !drawerOuvert">
      <Menu :size="22" />
    </v-btn>
    <div v-if="mobile" class="marque-mobile ml-1">PGNOC<span>-TI</span></div>
    <v-spacer />
    <v-btn icon aria-label="Notifications" variant="text" color="on-surface" class="icone-barre mr-1" @click="ouvrirNotifications">
      <Bell :size="19" />
      <v-badge v-if="notifications.compteNonLues" :content="notifications.compteNonLues" color="error" floating />
    </v-btn>
    <v-btn icon aria-label="Changer de thème" @click="toggleTheme" class="icone-barre mr-2" variant="text" color="on-surface">
      <Sun v-if="theme.global.current.value.dark" :size="20" />
      <Moon v-else :size="20" />
    </v-btn>
    <v-chip v-if="auth.roleActuel" variant="tonal" color="primary" size="small" class="mr-2 d-none d-sm-flex font-weight-bold">
      {{ LIBELLES_ROLE[auth.roleActuel] }}
    </v-chip>
  </v-app-bar>

  <v-main class="zone-contenu">
    <router-view />
  </v-main>

  <!-- Support -->
  <v-dialog v-model="dialogSupport" max-width="440">
    <v-card class="pa-2">
      <v-card-title class="font-display font-weight-bold d-flex align-center pt-4 px-4">
        <LifeBuoy :size="22" class="text-primary mr-3" />
        Contacter le support
      </v-card-title>
      <v-card-text class="px-4 pb-2">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Notre équipe vous accompagne dans l'utilisation de la plateforme et le traitement
          de vos demandes d'ouverture de compte-titres.
        </p>
        <div class="d-flex flex-column ga-3">
          <div class="d-flex align-center ga-3">
            <v-icon icon="mdi-email-outline" size="20" class="text-primary" />
            <div>
              <div class="text-body-2 font-weight-bold">support@pgnoc-ti.org</div>
              <div class="text-caption text-medium-emphasis">Réponse sous 24 h ouvrées</div>
            </div>
          </div>
          <div class="d-flex align-center ga-3">
            <v-icon icon="mdi-phone-outline" size="20" class="text-primary" />
            <div>
              <div class="text-body-2 font-weight-bold">+225 27 20 00 00 00</div>
              <div class="text-caption text-medium-emphasis">Lundi – Vendredi, 8h – 17h</div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-4 pb-4 pt-0">
        <v-spacer />
        <v-btn variant="text" class="font-weight-bold" @click="dialogSupport = false">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Ombre verticale très discrète : structure l'interface sans trait dur. */
.sidebar-ombre {
  box-shadow: 1px 0 0 rgba(var(--v-theme-on-surface), 0.05),
              4px 0 16px rgba(15, 23, 42, 0.04);
}

/* La barre partage le fond du sidebar : la transition se fait au niveau
   du contenu principal (fond global plus clair), sans bordure. */
/* Le contenu principal porte le fond global (plus léger que la surface
   du sidebar/barre) : la séparation entre chrome et contenu se lit
   naturellement, sans aucun trait. */
.zone-contenu {
  background-color: rgb(var(--v-theme-background));
}

.app-bar {
  color: rgb(var(--v-theme-on-surface));
}

.icone-barre { min-width: 42px; min-height: 42px; }

.marque-mobile {
  color: rgb(var(--v-theme-on-surface));
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.04rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.marque-mobile span { color: rgb(var(--v-theme-primary)); }

@media (max-width: 600px) {
  .app-bar { padding-left: 4px !important; padding-right: 8px !important; }
  .marque-mobile { font-size: 0.98rem; }
}
</style>
