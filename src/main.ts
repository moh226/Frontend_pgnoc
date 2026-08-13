import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './style.css'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useAuthStore } from './stores/auth'
import { enregistrerGestionJwt } from './api/client'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

enregistrerGestionJwt({
  accessCourant: () => useAuthStore().access,
  refreshCourant: () => useAuthStore().refresh,
  appliquer: (access, refresh) => useAuthStore().fixerJetons(access, refresh),
  deconnecter: () => useAuthStore().deconnecter(),
})

useAuthStore().initialiser()

app.use(router)
app.use(vuetify)
app.mount('#app')