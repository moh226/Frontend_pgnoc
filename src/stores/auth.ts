import { defineStore } from 'pinia'

import { connexion, inscription } from '@/api/auth'
import { rafraichirJeton } from '@/api/client'
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

export const useAuthStore = defineStore('auth', {
  state: (): SessionStockee => ({
    access: null,
    refresh: null,
    utilisateur: null,
    role: null,
  }),

  getters: {
    estConnecte: (etat) => Boolean(etat.access),
    role: (etat): RoleCode | null =>
      etat.role ?? (etat.access ? roleDepuisJwt(etat.access) : null),
    nomComplet: (etat) =>
      [etat.utilisateur?.prenom, etat.utilisateur?.nom].filter(Boolean).join(' ') ||
      etat.utilisateur?.email ||
      '',
  },

  actions: {
    initialiser() {
      const lu = lireStockage()
      if (lu) {
        this.access = lu.access
        this.refresh = lu.refresh
        this.utilisateur = lu.utilisateur
        this.role = lu.role ?? (lu.access ? roleDepuisJwt(lu.access) : null)
        if (jwtEstExpire(this.access) && this.refresh) {
          rafraichirJeton().catch(() => this.deconnecter())
        }
      }
    },

    persister() {
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({
          access: this.access,
          refresh: this.refresh,
          utilisateur: this.utilisateur,
          role: this.role,
        }),
      )
    },

    async seConnecter(identifiants: Identifiants) {
      const jetons: Jetons = await connexion(identifiants)
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
      this.access = access
      this.refresh = refresh
      this.role = roleDepuisJwt(access) ?? this.role
      this.persister()
    },

    deconnecter() {
      this.access = null
      this.refresh = null
      this.utilisateur = null
      this.role = null
      localStorage.removeItem(CLE_STOCKAGE)
    },
  },
})