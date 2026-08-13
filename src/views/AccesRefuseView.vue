<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <v-container fluid class="d-flex align-center justify-center fill-height">
    <v-card width="420" class="pa-4 text-center">
      <v-icon icon="mdi-shield-off-outline" size="48" color="error" />
      <div class="text-h6 mt-2">Accès refusé</div>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Votre rôle ne vous permet pas d'accéder à cet espace.
      </p>
      <v-btn color="primary" class="mt-4" @click="router.push('/')">Retour à mon espace</v-btn>
    </v-card>
  </v-container>
</template>
