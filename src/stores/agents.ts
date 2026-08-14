import { defineStore } from 'pinia'

import { creerAgent, listeAgents, modifierAgent } from '@/api/agents'
import { extraireMessageErreur } from '@/api/client'
import type { AgentSgi } from '@/types'

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    liste: [] as AgentSgi[],
    chargement: false,
    erreur: '',
  }),

  getters: {
    actifs: (etat) => etat.liste.filter((a) => a.is_active),
    inactifs: (etat) => etat.liste.filter((a) => !a.is_active),
  },

  actions: {
    async charger() {
      this.chargement = true
      this.erreur = ''
      try {
        this.liste = await listeAgents()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargement = false
      }
    },

    async creer(parametres: {
      email: string
      prenom?: string
      nom?: string
      matricule?: string
    }): Promise<AgentSgi> {
      this.erreur = ''
      try {
        const agent = await creerAgent(parametres)
        await this.charger()
        return agent
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },

    async basculerActif(id: string, actif: boolean) {
      this.erreur = ''
      try {
        await modifierAgent(id, { is_active: actif })
        await this.charger()
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
        throw cause
      }
    },
  },
})