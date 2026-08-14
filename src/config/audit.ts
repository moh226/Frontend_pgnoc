import type { RoleCode } from '@/types'

export const LIBELLES_ACTION_AUDIT: Record<string, string> = {
  CONNEXION: 'Connexion',
  INSCRIPTION: 'Inscription',
  CREATION_DOSSIER: 'Création de dossier',
  TRANSITION_DOSSIER: 'Transition de statut',
  COMMENTAIRE_AGENT: "Commentaire d'un agent",
  ACCEPTATION_CONVENTION: 'Acceptation de la convention',
  CREATION_SGI: "Création d'une SGI",
  MODIFICATION_SGI: "Modification d'une SGI",
  CREATION_UTILISATEUR: "Création d'un compte",
  MODIFICATION_UTILISATEUR: "Modification d'un compte",
}

export const ACTIONS_AUDIT = Object.keys(LIBELLES_ACTION_AUDIT)

export const ROLES_ADMIN: RoleCode[] = ['AGENT_SGI', 'ADMIN_SGI', 'ADMIN_GENERAL']