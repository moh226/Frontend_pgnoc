import { defineStore } from 'pinia'

import { connexion, inscription } from '@/api/auth'
import { rafraichirJeton } from '@/api/client'
import { recupererMonProfil } from '@/api/profil'
import type { Identifiants, Jetons, PayloadInscription, RoleCode, UtilisateurPublic } from '@/types'
import { jwtEstExpire, roleDepuisJwt } from '@/utils/jwt'

const CLE_STOCKAGE = 'pgnoc_ti_session'

interface SessionStockee {
  access: string | null
  refresh: string | null
  utilisateur: UtilisateurPublic | null
  role: RoleCode | null
}

function lireStockage(): SessionStockee | null {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE)
    if (!brut) return null
    const lu = JSON.parse(brut) as SessionStockee
    if (!lu.access) return null
    return lu
  } catch {
    return null
  }
}

let promesseInit: Promise<void> | null = null

// Anti-ressuscitation de session : un refresh token parti en vol AVANT
// un deconnecter() ne doit jamais réécrire la session fermée à son
// retour (sinon un logout sur un ordinateur partagé est silencieusement
// annulé). `deconnecter` marque la fermeture ; `fixerJetons` (seul
// chemin d'écriture du refresh) la respecte ; `seConnecter` la lève.
let sessionFermee = false

function ecrireStockage(session: SessionStockee): void {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(session))
  } catch {
    // Stockage indisponible (quota, navigation privée) : la session
    // reste en mémoire, on ne fait pas échouer la connexion.
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): SessionStockee => ({
    access: null,
    refresh: null,
    utilisateur: null,
    role: null,
  }),

  getters: {
    estConnecte: (etat) => Boolean(etat.access),
    roleActuel: (etat): RoleCode | null =>
      etat.role ?? (etat.access ? roleDepuisJwt(etat.access) : null),
    nomComplet: (etat) =>
      [etat.utilisateur?.prenom, etat.utilisateur?.nom].filter(Boolean).join(' ') ||
      etat.utilisateur?.email ||
      '',
  },

  actions: {
    initialiser() {
      if (!promesseInit) {
        promesseInit = this._initialiser()
      }
      return promesseInit
    },

    async _initialiser() {
      const lu = lireStockage()
      if (lu) {
        this.access = lu.access
        this.refresh = lu.refresh
        this.utilisateur = lu.utilisateur
        this.role = lu.role ?? (lu.access ? roleDepuisJwt(lu.access) : null)
        if (jwtEstExpire(this.access) && this.refresh) {
          try {
            await rafraichirJeton()
          } catch {
            this.deconnecter()
          }
        }
        // Session sans profil persisté (ex. anciennes sessions Google) :
        // on tente de le recharger silencieusement.
        if (this.access && !this.utilisateur) {
          await this.chargerProfil()
        }
      }
    },

    persister() {
      ecrireStockage({
        access: this.access,
        refresh: this.refresh,
        utilisateur: this.utilisateur,
        role: this.role,
      })
    },

    async seConnecter(identifiants: Identifiants) {
      const jetons: Jetons = await connexion(identifiants)
      sessionFermee = false
      this.access = jetons.access
      this.refresh = jetons.refresh
      this.utilisateur = jetons.utilisateur ?? null
      this.role = roleDepuisJwt(jetons.access)
      this.persister()
    },

    async sInscrire(payload: PayloadInscription) {
      await inscription(payload)
    },

    fixerJetons(access: string, refresh: string | null) {
      // Un refresh parti avant un deconnecter() ne doit jamais
      // ressusciter la session fermée.
      if (sessionFermee) return
      this.access = access
      this.refresh = refresh
      this.role = roleDepuisJwt(access) ?? this.role
      this.persister()
    },

    /** Lève le verrou de fermeture (connexion OAuth après un logout). */
    reouvrirSession() {
      sessionFermee = false
    },

    /** Charge (ou recharge) le profil de l'utilisateur connecté depuis l'API. */
    async chargerProfil() {
      if (!this.access) return
      try {
        const profil = await recupererMonProfil()
        this.utilisateur = {
          id: profil.id,
          email: profil.email,
          prenom: profil.prenom,
          nom: profil.nom,
          role: profil.role,
          date_joined: profil.date_joined,
        }
        this.role = profil.role ?? this.role
        this.persister()
      } catch {
        // Profil indisponible : la session reste valide (rôle issu du JWT),
        // on ne bloque pas la navigation.
      }
    },

    deconnecter() {
      sessionFermee = true
      this.access = null
      this.refresh = null
      this.utilisateur = null
      this.role = null
      try {
        localStorage.removeItem(CLE_STOCKAGE)
      } catch {
        // Stockage indisponible : rien à nettoyer.
      }
    },
  },
})
