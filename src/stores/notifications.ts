import { defineStore } from 'pinia'

import { compteNonLues, listeNotifications, marquerLue } from '@/api/notifications'
import { extraireMessageErreur } from '@/api/client'
import type { NotificationItem } from '@/types'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationItem[],
    compteNonLues: 0,
    chargement: false,
    erreur: '',
  }),

  actions: {
    async charger() {
      this.chargement = true
      this.erreur = ''
      try {
        const reponse = await listeNotifications()
        this.notifications = reponse.results
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargement = false
      }
    },

    async chargerCompte() {
      try {
        const reponse = await compteNonLues()
        this.compteNonLues = reponse.compte
      } catch {
        this.compteNonLues = 0
      }
    },

    async marquerCommeLue(id: string) {
      await marquerLue(id)
      const notification = this.notifications.find((n) => n.id === id)
      if (notification) notification.lue = true
      if (this.compteNonLues > 0) this.compteNonLues -= 1
    },
  },
})