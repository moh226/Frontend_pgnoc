import { defineStore } from 'pinia'

import {
  commenterValeur,
  dashboardInvestisseur,
  detailDossier,
  listeDossiers,
  prendreEnCharge,
  rejeterDossier,
  soumettreDossier,
  validerDossier,
} from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import type { DashboardInvestisseur, DossierDetail, DossierListeItem, StatutDossier } from '@/types'

export const useDossiersStore = defineStore('dossiers', {
  state: () => ({
    liste: [] as DossierListeItem[],
    total: 0,
    chargement: false,
    detail: null as DossierDetail | null,
    detailChargement: false,
    erreur: '',
    dashboard: null as DashboardInvestisseur | null,
    dashboardChargement: false,
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
    async chargerDashboard() {
      this.dashboardChargement = true
      this.erreur = ''
      try {
        const reponse = await dashboardInvestisseur()
        const statuts: StatutDossier[] = ['BROUILLON', 'SOUMIS', 'EN_INSTRUCTION', 'VALIDE', 'REJETE']
        this.dashboard = {
          ...reponse,
          par_statut: Object.fromEntries(
            statuts.map((statut) => [statut, reponse.par_statut?.[statut] ?? 0]),
          ) as Record<StatutDossier, number>,
        }
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.dashboardChargement = false
      }
    },

    async chargerApercu() {
      this.chargement = true
      this.erreur = ''
      try {
        const reponse = await listeDossiers({ page: 1, page_size: 5 })
        this.liste = reponse.results
        this.total = reponse.count
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargement = false
      }
    },

    async chargerListe() {
      this.chargement = true
      this.erreur = ''
      try {
        // Les tableaux de bord comptent par statut sur la liste entière :
        // on charge toutes les pages (page_size max, bornée à 5000 items).
        const elements: DossierListeItem[] = []
        let page = 1
        let reponse = await listeDossiers({ page, page_size: 100 })
        elements.push(...reponse.results)
        while (reponse.next && page < 50) {
          page += 1
          reponse = await listeDossiers({ page, page_size: 100 })
          elements.push(...reponse.results)
        }
        this.liste = elements
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

    async soumettre(id: string) {
      this.erreur = ''
      try {
        this.detail = await soumettreDossier(id)
        await this.chargerListe()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },
  },
})
