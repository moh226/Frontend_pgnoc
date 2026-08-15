import { defineStore } from 'pinia'

import { compteNonLues, listeNotifications, marquerLue } from '@/api/notifications'
import { extraireMessageErreur } from '@/api/client'
import type { NotificationItem } from '@/types'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationItem[],
    compteNonLues: 0,
    chargement: false,
    chargementPlus: false,
    pageCourante: 0,
    aPlus: false,
    erreur: '',
  }),

  actions: {
    async charger() {
      this.chargement = true
      this.erreur = ''
      try {
        const reponse = await listeNotifications(false, 1)
        this.notifications = reponse.results
        this.pageCourante = 1
        this.aPlus = Boolean(reponse.next)
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargement = false
      }
    },

    async chargerPlus() {
      if (this.chargementPlus || !this.aPlus) return
      this.chargementPlus = true
      this.erreur = ''
      try {
        const reponse = await listeNotifications(false, this.pageCourante + 1)
        const dejaPresentes = new Set(this.notifications.map((n) => n.id))
        this.notifications.push(...reponse.results.filter((n) => !dejaPresentes.has(n.id)))
        this.pageCourante += 1
        this.aPlus = Boolean(reponse.next)
      } catch (cause) {
        this.erreur = extraireMessageErreur(cause)
      } finally {
        this.chargementPlus = false
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