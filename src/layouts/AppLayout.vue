<script setup lang="ts">
import { useRouter } from 'vue-router'

import { LIBELLES_ROLE, NAVIGATION_PAR_ROLE } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const navigation = NAVIGATION_PAR_ROLE[auth.role ?? 'INVESTISSEUR'] ?? []

function deconnecter() {
  auth.deconnecter()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-navigation-drawer permanent>
    <v-list nav>
      <v-list-item
        v-for="item in navigation"
        :key="item.vers"
        :to="item.vers"
        :prepend-icon="item.icone"
        :title="item.titre"
        exact
      />
    </v-list>
  </v-navigation-drawer>

  <v-app-bar flat>
    <v-app-bar-title>PGNOC-TI</v-app-bar-title>
    <v-spacer />
    <v-chip v-if="auth.role" variant="tonal" color="primary" class="mr-2">
      {{ LIBELLES_ROLE[auth.role] }}
    </v-chip>
    <v-menu location="bottom end">
      <template #activator="{ props }">
        <v-btn variant="text" v-bind="props" prepend-icon="mdi-account-circle">
          {{ auth.nomComplet || auth.utilisateur?.email }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="deconnecter" prepend-icon="mdi-logout" title="Se déconnecter" />
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-main>
    <router-view />
  </v-main>
</template>
