import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VuetifyPlugin from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
 
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
    VitePWA({
      registerType: 'autoUpdate',
      // Icônes générées depuis public/favicon.svg (générateur sharp),
      // placées automatiquement dans public/ (pwa-64x64, pwa-192x192,
      // pwa-512x512, maskable-icon-512x512, apple-touch-icon…).
      pwaAssets: {
        preset: 'minimal-2023',
        image: 'public/favicon.svg',
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PGNOC-TI — Espace Investisseur',
        short_name: 'PGNOC-TI',
        description: 'Suivez vos demandes d’ouverture de compte-titres et déposez vos justificatifs.',
        lang: 'fr',
        theme_color: '#0C3C94',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/espace-investisseur',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // L'API n'est JAMAIS mise en cache : réseau uniquement.
        navigateFallbackDenylist: [/^\/api\//, /^\/media\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
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
