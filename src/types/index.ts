export type RoleCode = 'INVESTISSEUR' | 'AGENT_SGI' | 'ADMIN_SGI' | 'ADMIN_GENERAL'

export interface UtilisateurPublic {
  id: string
  email: string
  prenom: string
  nom: string
  role: RoleCode
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

export interface ResultatPagines<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type StatutDossier = 'BROUILLON' | 'SOUMIS' | 'EN_INSTRUCTION' | 'VALIDE' | 'REJETE'

export interface DossierListeItem {
  id: string
  reference: string
  investisseur_email: string
  sgi: string
  statut: StatutDossier
  progression_pct: number
  date_creation: string
  date_soumission: string | null
}

export interface ValeurChamp {
  id: string
  champ: string
  valeur: string | null
  fichier: string | null
  empreinte_sha256: string | null
  signature_serveur: string | null
  date_capture: string | null
  commentaire_agent: string | null
  est_corrige: boolean
  date_maj: string
}

export interface DossierDetail extends DossierListeItem {
  etape_courante: string | null
  agent: string | null
  agent_email: string | null
  version: number
  motif_rejet: string
  convention_acceptee: boolean
  type_signature: string
  date_signature: string | null
  date_instruction: string | null
  date_decision: string | null
  valeurs_champs: ValeurChamp[]
}

export interface ChampKyc {
  id: string
  code: string
  nom: string
  type: string
  obligatoire: boolean
  ordre: number
  justification: string
  options_choix: string | null
  champ_parent: string | null
  valeur_declencheur: string
  formats_acceptes: string
  taille_max_mo: number | null
}

export interface EtapeKyc {
  id: string
  nom: string
  ordre: number
  champs: ChampKyc[]
}

export interface SgiPublique {
  id: string
  nom: string
  code_sgi: string
  logo: string | null
}

export interface ConventionInfo {
  titre: string
  signe_requis: boolean
  fichier_url: string | null
}

export interface PresentationActivite {
  titre: string
  description: string
  ordre: number
}

export interface PresentationMembre {
  nom: string
  fonction: string
  ordre: number
}

export interface PresentationReference {
  titre: string
  annee: string
  description: string
  ordre: number
}

export interface PresentationStructuree {
  forme_sociale: string
  date_creation_societe: string | null
  capital_social: string
  numero_agrement: string
  date_agrement: string | null
  autorite_agrement: string
  est_regule: boolean
  mission: string
  vision: string
  ancrage_regional: string
  adresse: string
  telephone: string
  email_contact: string
  site_web: string
  activites: PresentationActivite[]
  membres: PresentationMembre[]
  references: PresentationReference[]
}

export interface FicheSgi extends SgiPublique {
  presentation: PresentationStructuree
  convention: ConventionInfo
}

export interface NotificationItem {
  id: string
  titre: string
  message: string
  lue: boolean
  type_notif: string
  type_libelle: string
  date_creation: string
}

export interface CompteNonLues {
  compte: number
}

export type TypeChampKyc =
  | 'TEXTE_COURT'
  | 'TEXTE_LONG'
  | 'NOMBRE'
  | 'DATE'
  | 'BOOLEEN'
  | 'CHOIX_UNIQUE'
  | 'CHOIX_MULTIPLE'
  | 'FICHIER'
  | 'SELFIE'

export interface AgentSgi {
  id: string
  email: string
  prenom: string
  nom: string
  matricule: string
  is_active: boolean
  date_joined: string
  mot_de_passe_initial?: string
}

export interface EtapeKycAdmin {
  id: string
  nom: string
  ordre: number
  actif: boolean
  date_creation: string
}

export interface ChampKycAdmin {
  id: string
  etape: string
  code: string
  nom: string
  type: TypeChampKyc
  obligatoire: boolean
  ordre: number
  justification: string
  options_choix: string[] | null
  champ_parent: string | null
  valeur_declencheur: string
  formats_acceptes: string
  taille_max_mo: number | null
  actif: boolean
}

export interface ConventionSgi {
  titre: string
  fichier: string
  url_signee: string
  date_publication: string | null
  date_modification: string | null
}

export type PresentationSgi = PresentationStructuree & {
  date_publication: string | null
}

export interface TraceActivite {
  date: string
  email: string | null
  action: string
  entite_concernee: string | null
  entite_id: string | null
}

export interface DashboardAdmin {
  dossiers: {
    total: number
    soumis_aujourd_hui: number
    par_statut: Record<StatutDossier, number>
  }
  sgi: {
    total: number
    actives: number
    sans_convention_publiee: number
  }
  utilisateurs: {
    total: number
    actifs: number
    par_role: Partial<Record<RoleCode, number>>
  }
  activite_recente: TraceActivite[]
}

export interface SgiAdmin {
  id: string
  nom: string
  code_sgi: string
  logo: string | null
  est_active: boolean
  date_creation: string
  nb_utilisateurs: number
  nb_dossiers: number
}

export interface UtilisateurAdmin {
  id: string
  email: string
  prenom: string
  nom: string
  role: string
  sgi: string | null
  is_active: boolean
  date_joined: string
}

export interface EntreeJournalAudit {
  id: string
  date_action: string
  utilisateur: string | null
  utilisateur_email: string | null
  action: string
  action_libelle: string
  entite_concernee: string | null
  entite_id: string | null
  avant: Record<string, unknown> | null
  apres: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string
}
