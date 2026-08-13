export type RoleCode = 'INVESTISSEUR' | 'AGENT_SGI' | 'ADMIN_SGI' | 'ADMIN_GENERAL'

export interface UtilisateurPublic {
  id: string
  email: string
  prenom: string
  nom: string
  role: string
  date_joined: string
}

export interface Jetons {
  access: string
  refresh: string
  utilisateur?: UtilisateurPublic
}

export interface Identifiants {
  email: string
  password: string
}

export interface PayloadInscription {
  email: string
  prenom: string
  nom: string
  password: string
  password_confirmation: string
}
