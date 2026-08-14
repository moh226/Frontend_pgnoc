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
  AGENT_SGI: [
    { titre: 'Tableau de bord', icone: 'mdi-view-dashboard', vers: '/espace-agent' },
    { titre: 'Dossiers à instruire', icone: 'mdi-folder-multiple-outline', vers: '/espace-agent/dossiers' },
    { titre: 'Notifications', icone: 'mdi-bell-outline', vers: '/espace-agent/notifications' },
  ],
  ADMIN_SGI: [
    { titre: 'Tableau de bord', icone: 'mdi-view-dashboard', vers: '/admin-sgi' },
    { titre: 'Dossiers', icone: 'mdi-folder-multiple-outline', vers: '/admin-sgi/dossiers' },
    { titre: 'Agents', icone: 'mdi-account-group-outline', vers: '/admin-sgi/agents' },
    { titre: 'Parcours KYC', icone: 'mdi-form-select', vers: '/admin-sgi/kyc' },
    { titre: 'Convention', icone: 'mdi-file-pdf-box', vers: '/admin-sgi/convention' },
    { titre: 'Présentation', icone: 'mdi-text-box-outline', vers: '/admin-sgi/presentation' },
    { titre: 'Notifications', icone: 'mdi-bell-outline', vers: '/admin-sgi/notifications' },
  ],
  ADMIN_GENERAL: [
    { titre: 'Tableau de bord', icone: 'mdi-view-dashboard', vers: '/admin-general' },
    { titre: 'SGI partenaires', icone: 'mdi-bank-outline', vers: '/admin-general/sgi' },
    { titre: 'Comptes internes', icone: 'mdi-account-group-outline', vers: '/admin-general/utilisateurs' },
    { titre: "Journal d'audit", icone: 'mdi-shield-search-outline', vers: '/admin-general/journal' },
    { titre: 'Notifications', icone: 'mdi-bell-outline', vers: '/admin-general/notifications' },
  ],
}
