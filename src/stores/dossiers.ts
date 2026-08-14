import { defineStore } from 'pinia'

import {
  commenterValeur,
  detailDossier,
  listeDossiers,
  prendreEnCharge,
  rejeterDossier,
  validerDossier,
} from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import type { DossierDetail, DossierListeItem, StatutDossier } from '@/types'

export const useDossiersStore = defineStore('dossiers', {
  state: () => ({
    liste: [] as DossierListeItem[],
    total: 0,
    chargement: false,
    detail: null as DossierDetail | null,
    detailChargement: false,
    erreur: '',
  }),

  getters: {
    parStatut: (etat): Record<StatutDossier, number> => {
      const compteurs: Record<StatutDossier, number> = {
        BROUILLON: 0,
        SOUMIS: 0,
        EN_INSTRUCTION: 0,
        VALIDE: 0,
        REJETE: 0,
      }
      for (const dossier of etat.liste) {
        compteurs[dossier.statut] += 1
      }
      return compteurs
    },
    progressionMoyenne: (etat) =>
      etat.liste.length
        ? Math.round(etat.liste.reduce((somme, d) => somme + d.progression_pct, 0) / etat.liste.length)
        : 0,
  },

  actions: {
    async chargerListe() {
      this.chargement = true
      this.erreur = ''
      try {
        const reponse = await listeDossiers()
        this.liste = reponse.results
        this.total = reponse.count
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargement = false
      }
    },

    async chargerDetail(id: string) {
      this.detailChargement = true
      this.erreur = ''
      try {
        this.detail = await detailDossier(id)
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.detailChargement = false
      }
    },

    async prendreEnCharge(id: string) {
      this.erreur = ''
      try {
        this.detail = await prendreEnCharge(id)
        await this.chargerListe()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async commenterValeur(dossierId: string, valeurId: string, commentaire: string) {
      this.erreur = ''
      try {
        const resultat = await commenterValeur(dossierId, valeurId, commentaire)
        if (this.detail) {
          const valeur = this.detail.valeurs_champs.find((v) => v.id === valeurId)
          if (valeur) {
            valeur.commentaire_agent = resultat.commentaire_agent
            valeur.est_corrige = false
          }
        }
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async deciderDossier(id: string, decision: 'valider' | 'rejeter', motif = '') {
      this.erreur = ''
      try {
        this.detail = decision === 'valider' ? await validerDossier(id) : await rejeterDossier(id, motif)
        await this.chargerListe()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },
  },
})