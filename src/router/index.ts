import { createRouter, createWebHistory } from 'vue-router'

import { redirectionPourRole } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'
import type { RoleCode } from '@/types'

declare module 'vue-router' {
  interface RouteMeta {
    requiertAuthentification?: boolean
    roles?: RoleCode[]
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/inscription',
      name: 'inscription',
      component: () => import('@/views/auth/RegisterView.vue'),
    },
    {
      path: '/oauth',
      name: 'oauth-google',
      component: () => import('@/views/auth/OAuthGoogleCallbackView.vue'),
    },
    {
      path: '/acces-refuse',
      name: 'acces-refuse',
      component: () => import('@/views/AccesRefuseView.vue'),
    },
    {
      path: '/espace-investisseur',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiertAuthentification: true, roles: ['INVESTISSEUR'] },
      children: [
        {
          path: '',
          name: 'investisseur-tableau-de-bord',
          component: () => import('@/views/investisseur/TableauDeBordInvestisseurView.vue'),
        },
      ],
    },
    {
      path: '/espace-agent',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiertAuthentification: true, roles: ['AGENT_SGI'] },
      children: [
        {
          path: '',
          name: 'agent-tableau-de-bord',
          component: () => import('@/views/agent/TableauDeBordAgentView.vue'),
        },
      ],
    },
    {
      path: '/admin-sgi',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiertAuthentification: true, roles: ['ADMIN_SGI'] },
      children: [
        {
          path: '',
          name: 'admin-sgi-tableau-de-bord',
          component: () => import('@/views/admin-sgi/TableauDeBordAdminSgiView.vue'),
        },
      ],
    },
    {
      path: '/admin-general',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiertAuthentification: true, roles: ['ADMIN_GENERAL'] },
      children: [
        {
          path: '',
          name: 'admin-general-tableau-de-bord',
          component: () => import('@/views/admin-general/TableauDeBordAdminGeneralView.vue'),
        },
      ],
    },
    {
      path: '/',
      redirect: () => redirectionPourRole(useAuthStore().role),
    },
    {
      path: '/:chemin(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((vers) => {
  const auth = useAuthStore()

  if (vers.meta.requiertAuthentification && !auth.estConnecte) {
    return {
      name: 'login',
      query: vers.fullPath === '/' ? {} : { redirection: vers.fullPath },
    }
  }

  if (vers.meta.roles?.length && auth.role && !vers.meta.roles.includes(auth.role)) {
    return { name: 'acces-refuse' }
  }

  if ((vers.name === 'login' || vers.name === 'inscription') && auth.estConnecte) {
    const destination = redirectionPourRole(auth.role)
    return destination === '/login' ? { name: 'acces-refuse' } : destination
  }

  return true
})

export default router
