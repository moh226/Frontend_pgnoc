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
      path: '/onboarding-sgi',
      name: 'onboarding-sgi',
      component: () => import('@/views/investisseur/ChoixSgiView.vue'),
      meta: { requiertAuthentification: true, roles: ['INVESTISSEUR'] },
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
        {
          path: 'dossiers',
          name: 'investisseur-dossiers',
          component: () => import('@/views/investisseur/DossiersListView.vue'),
        },
        {
          path: 'dossiers/:id',
          name: 'investisseur-dossier-detail',
          component: () => import('@/views/investisseur/DossierDetailView.vue'),
        },

        {
          path: 'notifications',
          name: 'investisseur-notifications',
          component: () => import('@/views/investisseur/NotificationsView.vue'),
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
        {
          path: 'dossiers',
          name: 'agent-dossiers',
          component: () => import('@/views/agent/DossiersAgentListView.vue'),
        },
        {
          path: 'dossiers/:id',
          name: 'agent-dossier-detail',
          component: () => import('@/views/agent/DossierDetailAgentView.vue'),
        },
        {
          path: 'notifications',
          name: 'agent-notifications',
          component: () => import('@/views/investisseur/NotificationsView.vue'),
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
        {
          path: 'dossiers',
          name: 'admin-sgi-dossiers',
          component: () => import('@/views/agent/DossiersAgentListView.vue'),
          props: { routeDetail: 'admin-sgi-dossier-detail' },
        },
        {
          path: 'dossiers/:id',
          name: 'admin-sgi-dossier-detail',
          component: () => import('@/views/agent/DossierDetailAgentView.vue'),
        },
        {
          path: 'agents',
          name: 'admin-sgi-agents',
          component: () => import('@/views/admin-sgi/AgentsView.vue'),
        },
        {
          path: 'convention',
          name: 'admin-sgi-convention',
          component: () => import('@/views/admin-sgi/ConventionView.vue'),
        },
        {
          path: 'presentation',
          name: 'admin-sgi-presentation',
          component: () => import('@/views/admin-sgi/PresentationView.vue'),
        },
        {
          path: 'kyc',
          name: 'admin-sgi-kyc',
          component: () => import('@/views/admin-sgi/KycView.vue'),
        },
        {
          path: 'notifications',
          name: 'admin-sgi-notifications',
          component: () => import('@/views/investisseur/NotificationsView.vue'),
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
        {
          path: 'sgi',
          name: 'admin-general-sgi',
          component: () => import('@/views/admin-general/SgisView.vue'),
        },
        {
          path: 'utilisateurs',
          name: 'admin-general-utilisateurs',
          component: () => import('@/views/admin-general/UtilisateursView.vue'),
        },
        {
          path: 'journal',
          name: 'admin-general-journal',
          component: () => import('@/views/admin-general/JournalAuditView.vue'),
        },
        {
          path: 'notifications',
          name: 'admin-general-notifications',
          component: () => import('@/views/investisseur/NotificationsView.vue'),
        },
      ],
    },
    {
      path: '/dossier-edition/:id',
      name: 'investisseur-dossier-edition',
      component: () => import('@/views/investisseur/DossierEditionView.vue'),
      meta: { requiertAuthentification: true, roles: ['INVESTISSEUR'] },
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
