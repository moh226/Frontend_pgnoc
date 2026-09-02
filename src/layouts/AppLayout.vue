<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { Moon, Sun } from '@lucide/vue'

import { LIBELLES_ROLE, NAVIGATION_PAR_ROLE } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationsStore()
const theme = useTheme()

const navigation = (NAVIGATION_PAR_ROLE[auth.roleActuel ?? 'INVESTISSEUR'] ?? []).filter(item => !item.cache)

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

function deconnecter() {
  auth.deconnecter()
  router.push({ name: 'login' })
}

onMounted(() => {
  if (auth.estConnecte) {
    void notifications.chargerCompte()
  }
})
</script>

<template>
  <v-navigation-drawer permanent class="nav-institutionnelle" color="surface">
    <div class="px-4 py-6 d-flex align-center">
      <!-- Un espace pour le logo plus tard, pour l'instant PGNOC-TI text -->
      <h2 class="font-display font-weight-black text-primary mx-auto">PGNOC-TI</h2>
    </div>
    <v-list nav>
      <v-list-item
        v-for="item in navigation"
        :key="item.vers"
        :to="item.vers"
        :prepend-icon="item.icone"
        :title="item.titre"
        exact
        color="primary"
        class="mb-1 rounded-lg"
      >
        <template v-if="item.vers.endsWith('/notifications')" #append>
          <v-badge
            v-if="notifications.compteNonLues"
            :content="notifications.compteNonLues"
            color="error"
            inline
          />
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-app-bar flat color="background" class="border-b">
    <v-spacer />
    
    <v-btn icon @click="toggleTheme" class="mr-2" variant="text" color="on-background">
      <Sun v-if="theme.global.current.value.dark" :size="20" />
      <Moon v-else :size="20" />
    </v-btn>
    <v-chip v-if="auth.roleActuel" variant="tonal" color="primary" class="mr-2">

      {{ LIBELLES_ROLE[auth.roleActuel] }}
    </v-chip>
    <v-menu location="bottom end">
      <template #activator="{ props }">
        <v-btn variant="text" v-bind="props" prepend-icon="mdi-account-circle" color="on-background">
          {{ auth.nomComplet || auth.utilisateur?.email }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="deconnecter" prepend-icon="mdi-logout" title="Se déconnecter" />
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-main class="bg-background">
    <router-view />
  </v-main>
</template>

<style scoped>
/* Les styles sombres forcés sont retirés, on s'appuie sur le système de thème de Vuetify */
.nav-institutionnelle {
  border-right: 1px solid rgb(var(--v-theme-outline-variant)) !important;
}
.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant)) !important;
}
</style>