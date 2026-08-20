<script setup lang="ts">
import { FileText } from '@lucide/vue'
import type { FicheSgi } from '@/types'

defineProps<{
  fiche: FicheSgi | null
}>()
</script>

<template>
  <div class="pdf-container rounded-xl elevation-2">
    <iframe 
      v-if="fiche?.convention?.fichier_url"
      :src="fiche.convention.fichier_url" 
      class="pdf-iframe" 
      title="Prévisualisation Convention"
    ></iframe>
    <div v-else class="pdf-placeholder d-flex flex-column align-center justify-center bg-surface-variant">
      <FileText :size="48" class="text-medium-emphasis mb-4" />
      <h3 class="text-h6 font-weight-medium mb-2">Aperçu indisponible</h3>
      <p class="text-body-2 text-medium-emphasis mb-0">La SGI n'a pas joint de fichier lisible.</p>
    </div>
  </div>
</template>

<style scoped>
.pdf-container {
  height: 100%;
  min-height: 500px;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-outline));
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
}

.pdf-placeholder {
  height: 100%;
  min-height: 500px;
}
</style>
