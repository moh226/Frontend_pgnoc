import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VuetifyPlugin from 'vite-plugin-vuetify'
 
import webfontDl from 'vite-plugin-webfont-dl'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webfontDownload = ((webfontDl as unknown as { default: typeof webfontDl }).default ?? webfontDl) as any

export default defineConfig({
  plugins: [
    vue(),
    VuetifyPlugin({ autoImport: true }),
    webfontDownload([
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
    ]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
server: {
    host: '::',
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  optimizeDeps: {
    // Toutes les dépendances découvertes dans les pages chargées à la
    // volée (composants Vuetify des vues lazy) sont pré-optimisées au
    // démarrage : sans cela, la première visite de chaque page
    // déclenchait une ré-optimisation et un RELOAD COMPLET de l'app.
    // La liste correspond aux composants réellement utilisés dans src/
    // (scanner : <v-…> dans les templates).
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core',
      'vuetify/components/VAutocomplete',
      'vuetify/components/VApp',
      'vuetify/components/VAlert',
      'vuetify/components/VAppBar',
      'vuetify/components/VAvatar',
      'vuetify/components/VBadge',
      'vuetify/components/VBtn',
      'vuetify/components/VBtnToggle',
      'vuetify/components/VCard',
      'vuetify/components/VCheckbox',
      'vuetify/components/VChip',
      'vuetify/components/VDialog',
      'vuetify/components/VDivider',
      'vuetify/components/VExpansionPanel',
      'vuetify/components/VExpansionPanels',
      'vuetify/components/VForm',
      'vuetify/components/VGrid',
      'vuetify/components/VIcon',
      'vuetify/components/VImg',
      'vuetify/components/VList',
      'vuetify/components/VMain',
      'vuetify/components/VMenu',
      'vuetify/components/VNavigationDrawer',
      'vuetify/components/VNoSsr',
      'vuetify/components/VPagination',
      'vuetify/components/VProgressCircular',
      'vuetify/components/VProgressLinear',
      'vuetify/components/VSelect',
      'vuetify/components/VSkeletonLoader',
      'vuetify/components/VSwitch',
      'vuetify/components/VTable',
      'vuetify/components/VTabs',
      'vuetify/components/VTextarea',
      'vuetify/components/VTextField',
      'vuetify/components/VTooltip',
      'vuetify/components/VWindow',
      'vuetify/components/transitions',
    ],
  },
})
