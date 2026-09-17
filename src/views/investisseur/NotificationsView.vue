<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BellRing, CheckCircle2, ChevronDown, FileText, Info, ShieldAlert, User } from '@lucide/vue'

import { useNotificationsStore } from '@/stores/notifications'
import type { NotificationItem } from '@/types'
import { formaterDate } from '@/utils/format'

const notifications = useNotificationsStore()

interface ConfigurationNotif {
  icone: typeof BellRing
  couleur: string
}

function configuration(type: string): ConfigurationNotif {
  const map: Record<string, ConfigurationNotif> = {
    DOSSIER: { icone: FileText, couleur: '#0C3C94' },
    CONVENTION: { icone: FileText, couleur: '#F7C600' },
    UTILISATEUR: { icone: User, couleur: '#3B82F6' },
    OTP: { icone: ShieldAlert, couleur: '#D97706' },
    SYSTEME: { icone: Info, couleur: '#64748B' },
  }
  return map[type] ?? { icone: BellRing, couleur: '#0C3C94' }
}

function debutJour(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

interface GroupeNotifications {
  cle: string
  libelle: string
  items: NotificationItem[]
}

const groupes = computed<GroupeNotifications[]>(() => {
  const aujourdHui = debutJour(new Date())
  const ilYA7Jours = aujourdHui - 6 * 24 * 60 * 60 * 1000

  const tries = [...notifications.notifications].sort(
    (a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime(),
  )

  const resultat: GroupeNotifications[] = [
    { cle: 'aujourd-hui', libelle: "Aujourd'hui", items: [] },
    { cle: 'semaine', libelle: 'Cette semaine', items: [] },
    { cle: 'ancien', libelle: 'Plus ancien', items: [] },
  ]

  for (const notif of tries) {
    const jour = debutJour(new Date(notif.date_creation))
    if (jour >= aujourdHui) resultat[0].items.push(notif)
    else if (jour >= ilYA7Jours) resultat[1].items.push(notif)
    else resultat[2].items.push(notif)
  }

  return resultat.filter((g) => g.items.length > 0)
})

const aucuneNotification = computed(
  () => !notifications.chargement && notifications.notifications.length === 0,
)

function marquerLue(item: NotificationItem) {
  if (item.lue) return
  void notifications.marquerCommeLue(item.id)
}

onMounted(() => void notifications.charger())
</script>

<template>
  <v-container fluid class="page-notifications pa-4">
    <header class="page-header" data-aos="fade-down" data-aos-duration="600">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="page-subtitle">
          {{ notifications.compteNonLues ? `${notifications.compteNonLues} non lue(s)` : 'Tout est à jour' }}
        </p>
      </div>
      <div class="header-badge" :class="{ active: notifications.compteNonLues }" aria-hidden="true">
        <BellRing :size="22" />
      </div>
    </header>

    <v-alert v-if="notifications.erreur" type="error" variant="tonal" class="mb-4" closable>
      {{ notifications.erreur }}
    </v-alert>

    <!-- Skeleton -->
    <div v-if="notifications.chargement" class="skeleton-notifs" aria-busy="true" aria-label="Chargement des notifications">
      <div v-for="i in 5" :key="i" class="skeleton-notif"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="aucuneNotification" class="empty-state" data-aos="zoom-in" data-aos-duration="500">
      <div class="empty-icon" aria-hidden="true">
        <CheckCircle2 :size="36" />
      </div>
      <h2 class="empty-title">Aucune notification</h2>
      <p class="empty-text">Vous serez prévenu ici dès qu'une action concerne vos dossiers.</p>
    </div>

    <!-- Groupes -->
    <div v-else class="groupes">
      <section
        v-for="(groupe, gi) in groupes"
        :key="groupe.cle"
        class="groupe"
        data-aos="fade-up"
        :data-aos-delay="gi * 80"
        data-aos-duration="450"
      >
        <h2 class="groupe-titre">{{ groupe.libelle }}</h2>

        <div class="groupe-liste" role="list">
          <article
            v-for="(notif, index) in groupe.items"
            :key="notif.id"
            class="carte-notif"
            :class="{ 'non-lue': !notif.lue }"
            role="listitem"
            tabindex="0"
            data-aos="fade-up"
            :data-aos-delay="index * 50"
            data-aos-duration="400"
            @click="marquerLue(notif)"
            @keydown.enter="marquerLue(notif)"
          >
            <div class="notif-icon" :style="{ backgroundColor: configuration(notif.type_notif).couleur + '18', color: configuration(notif.type_notif).couleur }">
              <component :is="configuration(notif.type_notif).icone" :size="20" />
            </div>

            <div class="notif-contenu">
              <div class="notif-entete">
                <span class="notif-titre">{{ notif.titre }}</span>
                <span v-if="!notif.lue" class="point-non-lu" aria-label="Non lue"></span>
              </div>
              <p class="notif-message">{{ notif.message }}</p>
              <span class="notif-date">{{ formaterDate(notif.date_creation) }}</span>
            </div>
          </article>
        </div>
      </section>

      <div v-if="notifications.aPlus" class="charger-plus">
        <v-btn
          color="primary"
          variant="tonal"
          rounded="lg"
          :loading="notifications.chargementPlus"
          @click="notifications.chargerPlus()"
        >
          <ChevronDown :size="16" class="mr-1" /> Charger plus
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.page-notifications {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(24px, 5vw, 30px);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.header-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  flex-shrink: 0;
}

.header-badge.active {
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
}

/* --- Groupes --- */
.groupes {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.groupe-titre {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-on-surface-variant));
}

.groupe-liste {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* --- Carte notification --- */
.carte-notif {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.carte-notif.non-lue {
  background: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.18);
}

.carte-notif.non-lue::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: rgb(var(--v-theme-primary));
}

.carte-notif:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.07);
}

.carte-notif:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.notif-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.notif-contenu {
  flex: 1;
  min-width: 0;
}

.notif-entete {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-titre {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.point-non-lu {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  animation: pulse-point 2s ease-in-out infinite;
}

@keyframes pulse-point {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.notif-message {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface-variant));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-date {
  display: inline-block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.8;
}

/* --- Empty state --- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
  margin-bottom: 20px;
}

.empty-title {
  margin: 0 0 8px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface-variant));
}

.charger-plus {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

/* --- Skeleton --- */
.skeleton-notifs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-notif {
  height: 88px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgb(var(--v-theme-outline)) 25%, rgb(var(--v-theme-surface-variant)) 50%, rgb(var(--v-theme-outline)) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (min-width: 768px) {
  .page-notifications {
    max-width: 760px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .page-notifications {
    padding: 16px 12px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-notif,
  .point-non-lu {
    animation: none;
  }

  .carte-notif {
    transition: none;
  }
}
</style>