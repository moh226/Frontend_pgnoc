import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

interface GestionJwt {
  accessCourant(): string | null
  refreshCourant(): string | null
  appliquer(access: string, refresh: string | null): void
  deconnecter(): void
  redirigerVersLogin(): void
}

let gestionJwt: GestionJwt = {
  accessCourant: () => null,
  refreshCourant: () => null,
  appliquer: () => undefined,
  deconnecter: () => undefined,
  redirigerVersLogin: () => undefined,
}

export function enregistrerGestionJwt(gestion: GestionJwt): void {
  gestionJwt = gestion
}

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

// Instance dédiée aux appels publics (refresh) : même timeout que `api`
// pour qu'un serveur qui ne répond pas ne bloque jamais la navigation.
const clientPublic: AxiosInstance = axios.create({
  baseURL: api.defaults.baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const url = config.url ?? ''
  const estAppelPublic = url.includes('/login') || url.includes('/register') || url.includes('/refresh')
  if (estAppelPublic) return config
  const access = gestionJwt.accessCourant()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

let rafraichissement: Promise<string> | null = null

export function rafraichirJeton(): Promise<string> {
  rafraichissement ??= (async () => {
    const refresh = gestionJwt.refreshCourant()
    if (!refresh) throw new Error('Aucun refresh token en session')
    const reponse = await clientPublic.post('/comptes/login/refresh/', {
      refresh,
    })
    const access: string = reponse.data.access
    // Si la réponse omet un nouveau refresh, on conserve le courant
    // (sinon la session serait invalidée au prochain rafraîchissement).
    gestionJwt.appliquer(access, typeof reponse.data.refresh === 'string' ? reponse.data.refresh : refresh)
    return access
  })()

  return rafraichissement.finally(() => {
    rafraichissement = null
  })
}

interface ConfigAvecNouvelleTentative extends InternalAxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.response.use(
  (reponse) => reponse,
  async (erreur: AxiosError) => {
    const config = erreur.config as ConfigAvecNouvelleTentative | undefined
    const url = config?.url ?? ''
    const estAppelPublic = url.includes('/login') || url.includes('/register')
    if (erreur.response?.status !== 401 || !config || config._retry || estAppelPublic) {
      return Promise.reject(erreur)
    }

    config._retry = true
    try {
      const access = await rafraichirJeton()
      config.headers.Authorization = `Bearer ${access}`
      return api(config)
    } catch (cause) {
      gestionJwt.deconnecter()
      gestionJwt.redirigerVersLogin()
      return Promise.reject(cause)
    }
  },
)

// ─────────────────────────────────────────────────────────────
// Enveloppe d'erreur unifiée du backend (voir pgnoc/erreurs.py) :
// toute erreur API sort au format { code, message, detail, champs? }.
//   - `message` : phrase française complète, affichable telle quelle ;
//   - `code`    : identifiant stable pour brancher de la logique UI
//                 (navigation guidée, retry, déconnexion…) ;
//   - `champs`  : erreurs par champ de formulaire, pour surligner les
//                 inputs fautifs ;
//   - contexte métier additionnel selon le code (`champs_manquants`,
//     `champs_a_corriger`, `attente_secondes`…).
// ─────────────────────────────────────────────────────────────
export interface ErreurChampManquant {
  etape: string
  champ: string
  code: string
}

export interface ErreurChampACorriger {
  champ: string
  code: string
  commentaire_agent: string
}

export interface ErreurApi {
  code: string
  message: string
  /** Erreurs par champ de formulaire (ex: { email: ['…'] }). */
  champs?: Record<string, string[]>
  /** Contexte DOSSIER_INCOMPLET : champs à renseigner, avec leur étape. */
  champsManquants?: ErreurChampManquant[]
  /** Contexte CHAMP_VERROUILLE : champs signalés par l'agent. */
  champsACorriger?: ErreurChampACorriger[]
  /** Contexte LIMITE_ATTEINTE : délai d'attente conseillé. */
  attenteSecondes?: number
  statut?: number
  /** Statut actuel du dossier (ex: SOUMIS) dans les erreurs DOSSIER_NON_SOUMETTABLE. */
  statut_actuel?: string
}

/** Extrait l'enveloppe d'erreur unifiée, ou null si la réponse n'en est pas une. */
export function extraireErreurApi(erreur: unknown): ErreurApi | null {
  const axiosErr = erreur as AxiosError
  const data = axiosErr?.response?.data
  if (!data || typeof data !== 'object') return null
  const corps = data as Record<string, unknown>
  if (typeof corps.code !== 'string' || typeof corps.message !== 'string') return null

  const apiErreur: ErreurApi = {
    code: corps.code,
    message: corps.message,
    statut: axiosErr.response?.status,
  }

  if (corps.champs && typeof corps.champs === 'object') {
    const champs: Record<string, string[]> = {}
    for (const [cle, valeur] of Object.entries(corps.champs)) {
      if (Array.isArray(valeur)) champs[cle] = valeur.map(String)
      else if (typeof valeur === 'string') champs[cle] = [valeur]
    }
    if (Object.keys(champs).length) apiErreur.champs = champs
  }
  if (Array.isArray(corps.champs_manquants)) {
    apiErreur.champsManquants = corps.champs_manquants as ErreurChampManquant[]
  }
  if (Array.isArray(corps.champs_a_corriger)) {
    apiErreur.champsACorriger = corps.champs_a_corriger as ErreurChampACorriger[]
  }
  if (typeof corps.attente_secondes === 'number') {
    apiErreur.attenteSecondes = corps.attente_secondes
  }
  return apiErreur
}

export function extraireMessageErreur(
  erreur: unknown,
  fallback = 'Une erreur est survenue. Réessayez.',
): string {
  const axiosErr = erreur as AxiosError
  const data = axiosErr?.response?.data

  // Enveloppe unifiée : `message` est une phrase française complète,
  // prête à afficher. On ne JAMAIS remonter `code` (identifiant
  // technique) et on n'ajoute pas de préfixe [403] — c'est du bruit
  // pour l'utilisateur final, le code HTTP ne l'aide pas à agir.
  const apiErreur = extraireErreurApi(erreur)
  if (apiErreur) return apiErreur.message

  function messageDepuis(donnees: unknown): string | null {
    if (typeof donnees === 'string') return donnees
    if (!donnees || typeof donnees !== 'object') return null

    for (const valeur of Object.values(donnees)) {
      if (typeof valeur === 'string') return valeur
      if (Array.isArray(valeur) && typeof valeur[0] === 'string') return valeur[0]
      const imbrique = messageDepuis(valeur)
      if (imbrique) return imbrique
    }
    return null
  }

  const message = messageDepuis(data)
  if (message) return message

  if (axiosErr?.code === 'ECONNABORTED') return 'Le serveur ne répond pas. Vérifiez votre connexion.'
  if (axiosErr?.message?.includes('Network Error')) return 'Erreur réseau. Vérifiez que le serveur est accessible.'

  return fallback
}
