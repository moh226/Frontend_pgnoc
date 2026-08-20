<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { accueilPublique } from '@/api/accueil'
import VitrineAccueil from '@/components/VitrineAccueil.vue'
import type { BlocAccueilPublic } from '@/types'

const blocs = ref<BlocAccueilPublic[]>([])
const chargement = ref(true)
const erreur = ref('')

onMounted(async () => {
  try {
    blocs.value = await accueilPublique()
  } catch {
    erreur.value = "La page d'accueil est momentanément indisponible. Réessayez plus tard."
  } finally {
    chargement.value = false
  }
})
</script>

<template>
  <div v-if="chargement" class="d-flex align-center justify-center" style="min-height: 50dvh">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <v-alert v-else-if="erreur" type="error" variant="tonal" class="ma-8 rounded-lg border-l-4">
    {{ erreur }}
  </v-alert>

  <VitrineAccueil v-else :blocs="blocs" />
</template>