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
    // Numéro de séquence du dernier chargerDetail demandé : les
    // réponses tardives d'un chargement précédent sont ignorées.
    _sequenceDetail: 0,
  }),

  getters: {
    parStatut: (etat): Record<StatutDossier, number> => {
      const compteurs: Record<StatutDossier, number> = {
        BROUILLON: 0,
        SOUMIS: 0,
        EN_INSTRUCTION: 0,
        VALIDE: 0,
        REJETE: 0,
        ACTIF: 0,
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
        const statuts: StatutDossier[] = ['BROUILLON', 'SOUMIS', 'EN_INSTRUCTION', 'VALIDE', 'REJETE', 'ACTIF']
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
      const sequence = ++this._sequenceDetail
      this.detail = null
      this.detailChargement = true
      this.erreur = ''
      try {
        const detail = await detailDossier(id)
        // Navigation rapide A→B : seule la réponse du dernier chargement
        // demandé fait foi (les réponses tardives sont ignorées).
        if (sequence === this._sequenceDetail) {
          this.detail = detail
        }
      } catch (cause) {
        if (sequence === this._sequenceDetail) {
          this.erreur = extraireMessageErreur(cause)
        }
      } finally {
        if (sequence === this._sequenceDetail) {
          this.detailChargement = false
        }
      }
    },

    async prendreEnCharge(id: string) {
      this.erreur = ''
      try {
        const detail = await prendreEnCharge(id)
        this.detail = detail
        this._rafraichirItemListe(detail)
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
        const detail =
          decision === 'valider' ? await validerDossier(id) : await rejeterDossier(id, motif)
        this.detail = detail
        this._rafraichirItemListe(detail)
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async soumettre(id: string) {
      this.erreur = ''
      try {
        const detail = await soumettreDossier(id)
        this.detail = detail
        this._rafraichirItemListe(detail)
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    /** Remplace l'élément de `liste` par le détail à jour (sans recharger
     *  toutes les pages : une mutation = une requête, pas cinquante). */
    _rafraichirItemListe(detail: DossierDetail) {
      const index = this.liste.findIndex((d) => d.id === detail.id)
      if (index !== -1) {
        this.liste[index] = {
          ...this.liste[index],
          statut: detail.statut,
          progression_pct: detail.progression_pct,
          date_soumission: detail.date_soumission,
        }
      }
    },
  },
})
