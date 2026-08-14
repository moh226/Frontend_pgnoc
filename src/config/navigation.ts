import type { RoleCode } from '@/types'

export interface ItemNavigation {
  titre: string
  icone: string
  vers: string
}

export const LIBELLES_ROLE: Record<RoleCode, string> = {
  INVESTISSEUR: 'Investisseur',
  AGENT_SGI: 'Agent SGI',
  ADMIN_SGI: 'Admin SGI',
  ADMIN_GENERAL: 'Admin Général',
}

export const ROUTES_PAR_ROLE: Record<RoleCode, string> = {
  INVESTISSEUR: '/espace-investisseur',
  AGENT_SGI: '/espace-agent',
  ADMIN_SGI: '/admin-sgi',
  ADMIN_GENERAL: '/admin-general',
}

export function redirectionPourRole(role: RoleCode | null): string {
  return role ? (ROUTES_PAR_ROLE[role] ?? '/acces-refuse') : '/login'
}

export const NAVIGATION_PAR_ROLE: Record<RoleCode, ItemNavigation[]> = {
  INVESTISSEUR: [
    { titre: 'Tableau de bord', icone: 'mdi-view-dashboard', vers: '/espace-investisseur' },
    { titre: 'Mes dossiers', icone: 'mdi-folder-multiple-outline', vers: '/espace-investisseur/dossiers' },
    { titre: 'Notifications', icone: 'mdi-bell-outline', vers: '/espace-investisseur/notifications' },
  ],
  AGENT_SGI: [{ titre: 'Tableau de bord', icone: 'mdi-view-dashboard', vers: '/espace-agent' }],
  ADMIN_SGI: [{ titre: 'Tableau de bord', icone: 'mdi-view-dashboard', vers: '/admin-sgi' }],
  ADMIN_GENERAL: [
    { titre: 'Tableau de bord', icone: 'mdi-view-dashboard', vers: '/admin-general' },
  ],
}
