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
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
