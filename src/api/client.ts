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
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
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
    const reponse = await axios.post(`${api.defaults.baseURL}/comptes/login/refresh/`, {
      refresh,
    })
    const access: string = reponse.data.access
    gestionJwt.appliquer(access, reponse.data.refresh ?? null)
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

export function extraireMessageErreur(
  erreur: unknown,
  fallback = 'Une erreur est survenue. Réessayez.',
): string {
  const axiosErr = erreur as AxiosError
  const status = axiosErr?.response?.status
  const data = axiosErr?.response?.data

  if (status) {
    if (typeof data === 'string') return `[${status}] ${data}`
    if (data && typeof data === 'object') {
      const premiere = Object.values(data)[0]
      if (Array.isArray(premiere)) return `[${status}] ${String(premiere[0])}`
      if (typeof premiere === 'string') return `[${status}] ${premiere}`
      if (premiere && typeof premiere === 'object') {
        const interne = Object.values(premiere)[0]
        if (Array.isArray(interne)) return `[${status}] ${String(interne[0])}`
        if (typeof interne === 'string') return `[${status}] ${interne}`
      }
    }
    return `[${status}] ${fallback}`
  }

  if (axiosErr?.code === 'ECONNABORTED') return 'Le serveur ne répond pas. Vérifiez votre connexion.'
  if (axiosErr?.message?.includes('Network Error')) return 'Erreur réseau. Vérifiez que le serveur est accessible.'

  return fallback
}