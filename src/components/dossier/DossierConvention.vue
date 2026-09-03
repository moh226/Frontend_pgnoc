<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Download } from '@lucide/vue'
import type { FicheSgi } from '@/types'

const props = defineProps<{
  fiche: FicheSgi | null
}>()

const iframeSrc = computed(() => {
  const url = props.fiche?.convention?.fichier_url
  if (!url) return null
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.pathname + parsed.search
  } catch {
    return url
  }
})

const downloadHref = computed(() => {
  const url = props.fiche?.convention?.fichier_url
  if (!url) return '#'
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.pathname + parsed.search
  } catch {
    return url
  }
})
</script>

<template>
  <div class="pdf-container rounded-xl elevation-2">
    <template v-if="iframeSrc">
      <iframe 
        :src="iframeSrc" 
        class="pdf-iframe" 
        title="Prévisualisation Convention"
      ></iframe>
      <div class="pdf-fallback-bar bg-surface border-t d-flex align-center justify-space-between pa-3">
        <span class="text-caption text-medium-emphasis">Le PDF ne s'affiche pas ?</span>
        <v-btn
          size="small"
          variant="tonal"
          color="primary"
          :href="downloadHref"
          target="_blank"
        >
          <Download :size="14" class="mr-1" /> Télécharger le PDF
        </v-btn>
      </div>
    </template>
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
  display: flex;
  flex-direction: column;
}

.pdf-iframe {
  width: 100%;
  flex: 1;
  min-height: 0;
  border: none;
}

.pdf-fallback-bar {
  flex-shrink: 0;
}

.pdf-placeholder {
  height: 100%;
  min-height: 500px;
}
</style>
