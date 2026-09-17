import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import AOS from 'aos'
import 'aos/dist/aos.css'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './style.css'

import App from './App.vue'
import router from './router'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'
import { enregistrerGestionJwt } from '@/api/client'

// Service worker PWA (mise à jour automatique en arrière-plan).
registerSW({ immediate: true })

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

enregistrerGestionJwt({
  accessCourant: () => useAuthStore().access,
  refreshCourant: () => useAuthStore().refresh,
  appliquer: (access, refresh) => useAuthStore().fixerJetons(access, refresh),
  deconnecter: () => useAuthStore().deconnecter(),
  redirigerVersLogin: () => {
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
  }
})

useAuthStore().initialiser()

app.use(router)
app.use(vuetify)
app.mount('#app')

// Initialiser AOS après le montage
AOS.init({
  duration: 700,
  easing: 'ease-out-cubic',
  once: true,
  offset: 50,
  disable: 'mobile',
  startEvent: 'DOMContentLoaded',
})