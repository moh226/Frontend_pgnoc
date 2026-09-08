<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, LifeBuoy, HelpCircle } from '@lucide/vue'

import { LIBELLES_ROLE, NAVIGATION_PAR_ROLE } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const props = defineProps<{
  cheminActif: string
}>()

const emit = defineEmits<{
  (e: 'navigation'): void
  (e: 'deconnecter'): void
  (e: 'support'): void
}>()

const auth = useAuthStore()
const notifications = useNotificationsStore()

// Navigation principale : tout sauf Paramètres (descendu en élément
// secondaire, en bas du sidebar, avec Aide).
const navigation = computed(() =>
  (NAVIGATION_PAR_ROLE[auth.roleActuel ?? 'INVESTISSEUR'] ?? [])
    .filter((item) => !item.cache && !item.vers.startsWith('/parametres')),
)

const initiales = computed(() =>
  [auth.utilisateur?.prenom?.[0], auth.utilisateur?.nom?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || auth.utilisateur?.email?.[0]?.toUpperCase() || 'P',
)

const espaceLabel = computed(() => {
  if (auth.roleActuel === 'INVESTISSEUR') return 'Espace investisseur'
  if (auth.roleActuel === 'AGENT_SGI') return 'Espace instruction'
  if (auth.roleActuel === 'ADMIN_SGI') return 'Administration SGI'
  return 'Administration générale'
})

const cheminParametres = '/parametres'

function estActif(vers: string): boolean {
  return (
    props.cheminActif === vers ||
    (vers !== navigation.value[0]?.vers && props.cheminActif.startsWith(`${vers}/`))
  )
}
</script>

<template>
  <div class="sidebar-contenu d-flex flex-column h-100">
    <!-- Marque -->
    <div class="brand-bloc px-6 pt-7 pb-6">
      <div class="d-flex align-center ga-3">
        <div class="brand-mark">P</div>
        <div class="min-w-0">
          <div class="brand-name">PGNOC<span class="brand-accent">-TI</span></div>
          <div class="brand-espace">{{ espaceLabel }}</div>
        </div>
      </div>
    </div>

    <!-- Navigation principale -->
    <div class="section-label px-6 pt-2 pb-1">Navigation</div>
    <nav class="px-4">
      <router-link
        v-for="item in navigation"
        :key="item.vers"
        :to="item.vers"
        class="nav-item"
        :class="{ 'nav-item--actif': estActif(item.vers) }"
        @click="emit('navigation')"
      >
        <v-icon :icon="item.icone" size="21" class="nav-icone" />
        <span class="nav-libelle">{{ item.titre }}</span>
        <span
          v-if="item.vers.endsWith('/notifications') && notifications.compteNonLues"
          class="nav-badge"
        >{{ notifications.compteNonLues }}</span>
      </router-link>
    </nav>

    <div class="flex-grow-1" />

    <!-- Support -->
    <div class="px-4 pb-2">
      <button class="encart-support" type="button" @click="emit('support')">
        <span class="encart-support-icone">
          <LifeBuoy :size="18" />
        </span>
        <span class="min-w-0">
          <span class="encart-support-titre d-block">Contacter le support</span>
          <span class="encart-support-texte d-block">Une question ? Nous sommes là.</span>
        </span>
      </button>
    </div>

    <!-- Éléments secondaires -->
    <div class="section-label px-6 pt-2 pb-1">Général</div>
    <nav class="px-4 pb-2">
      <router-link
        :to="cheminParametres"
        class="nav-item nav-item--compact"
        :class="{ 'nav-item--actif': estActif(cheminParametres) }"
        @click="emit('navigation')"
      >
        <v-icon icon="mdi-cog-outline" size="19" class="nav-icone" />
        <span class="nav-libelle">Paramètres</span>
      </router-link>
      <button class="nav-item nav-item--compact" type="button" @click="emit('support')">
        <HelpCircle :size="18" class="nav-icone-lucide" />
        <span class="nav-libelle">Aide</span>
      </button>
    </nav>

    <!-- Profil -->
    <div class="profil-bloc px-4 pb-5 pt-3">
      <v-menu location="top start" width="230">
        <template #activator="{ props: propsMenu }">
          <button v-bind="propsMenu" class="profil-carte w-100 text-left" type="button">
            <v-avatar color="primary" size="38" class="profil-avatar">{{ initiales }}</v-avatar>
            <span class="min-w-0 flex-grow-1">
              <span class="profil-nom d-block">{{ auth.nomComplet || auth.utilisateur?.email }}</span>
              <span class="profil-role d-block">{{ LIBELLES_ROLE[auth.roleActuel ?? 'INVESTISSEUR'] }}</span>
            </span>
            <ChevronRight :size="16" class="profil-chevron" />
          </button>
        </template>
        <v-list min-width="220">
          <v-list-item :title="auth.utilisateur?.email" subtitle="Compte connecté" prepend-icon="mdi-account-outline" />
          <v-divider class="my-2" />
          <v-list-item prepend-icon="mdi-logout" title="Se déconnecter" @click="emit('deconnecter')" />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Marque ---------- */
.brand-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  flex-shrink: 0;
}

.brand-name {
  color: rgb(var(--v-theme-on-surface));
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  white-space: nowrap;
  line-height: 1.15;
}

.brand-accent { color: rgb(var(--v-theme-primary)); }

.brand-espace {
  margin-top: 3px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}

.min-w-0 { min-width: 0; }

/* ---------- Libellés de section ---------- */
.section-label {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.75;
}

/* ---------- Éléments de navigation ---------- */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 0 12px;
  margin-bottom: 2px;
  border-radius: 10px;
  color: rgb(var(--v-theme-on-surface-variant));
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.nav-item--actif {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
  font-weight: 600;
}

.nav-icone {
  flex-shrink: 0;
  opacity: 0.9;
}

.nav-icone-lucide {
  flex-shrink: 0;
  width: 21px;
  display: grid;
  place-items: center;
  opacity: 0.9;
}

.nav-libelle {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-badge {
  flex-shrink: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-on-error));
  font-size: 0.68rem;
  font-weight: 800;
}

.nav-item--compact { min-height: 38px; }

/* ---------- Encart support ---------- */
.encart-support {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.05);
  color: rgb(var(--v-theme-on-surface));
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.encart-support:hover { background: rgba(var(--v-theme-primary), 0.09); }

.encart-support-icone {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.encart-support-titre {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.3;
}

.encart-support-texte {
  font-size: 0.72rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.3;
}

/* ---------- Profil ---------- */
.profil-bloc { margin-top: 6px; }

.profil-carte {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 8px 10px;
  border: none;
  border-radius: 12px;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.profil-carte:hover { background: rgba(var(--v-theme-primary), 0.06); }

.profil-avatar { flex-shrink: 0; font-size: 0.76rem; font-weight: 800; }

.profil-nom {
  font-size: 0.8rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profil-role {
  margin-top: 1px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profil-chevron {
  flex-shrink: 0;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.7;
}
</style>
