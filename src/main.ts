import { createApp, type Directive } from 'vue'
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

// Réveil des sections au défilement (page d'accueil publique)
const reveler: Directive<HTMLElement> = (element) => {
  if (!('IntersectionObserver' in window)) {
    element.classList.add('reveal-active')
    return
  }
  element.classList.add('reveal-initial')
  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (entree.isIntersecting) {
          element.classList.add('reveal-active')
          observateur.unobserve(element)
        }
      }
    },
    { threshold: 0.1 },
  )
  observateur.observe(element)
}

app.directive('reveal', reveler)

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