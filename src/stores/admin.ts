import { defineStore } from 'pinia'

import {
  creerSgiAdmin,
  creerUtilisateurAdmin,
  listeSgiAdmin,
  listeUtilisateursAdmin,
  modifierSgiAdmin,
  modifierUtilisateurAdmin,
  tableauDeBordAdmin,
} from '@/api/admin'
import { extraireMessageErreur } from '@/api/client'
import type { DashboardAdmin, SgiAdmin, UtilisateurAdmin } from '@/types'

export const useAdminStore = defineStore('adminGeneral', {
  state: () => ({
    tableauDeBord: null as DashboardAdmin | null,
    sgi: [] as SgiAdmin[],
    utilisateurs: [] as UtilisateurAdmin[],
    chargement: false,
    erreur: '',
  }),

  actions: {
    async chargerTableauDeBord() {
      this.erreur = ''
      try {
        this.tableauDeBord = await tableauDeBordAdmin()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      }
    },

    async chargerSgi() {
      this.chargement = true
      this.erreur = ''
      try {
        this.sgi = await listeSgiAdmin()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargement = false
      }
    },

    async creerSgi(parametres: { nom: string; code_sgi: string }) {
      this.erreur = ''
      try {
        await creerSgiAdmin(parametres)
        await this.chargerSgi()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async basculerSgi(id: string, actif: boolean) {
      this.erreur = ''
      try {
        await modifierSgiAdmin(id, { est_active: actif })
        await this.chargerSgi()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async chargerUtilisateurs(filtres: {
      role?: string
      email?: string
      actif?: boolean
    } = {}) {
      this.chargement = true
      this.erreur = ''
      try {
        this.utilisateurs = await listeUtilisateursAdmin(filtres)
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargement = false
      }
    },

    async creerUtilisateur(parametres: {
      email: string
      prenom?: string
      nom?: string
      role: string
      sgi?: string | null
      mot_de_passe: string
    }) {
      this.erreur = ''
      try {
        await creerUtilisateurAdmin(parametres)
        await this.chargerUtilisateurs()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async basculerUtilisateur(id: string, actif: boolean) {
      this.erreur = ''
      try {
        await modifierUtilisateurAdmin(id, { is_active: actif })
        await this.chargerUtilisateurs()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async changerRole(id: string, role: string, sgi: string | null) {
      this.erreur = ''
      try {
        await modifierUtilisateurAdmin(id, { role, sgi })
        await this.chargerUtilisateurs()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },
  },
})