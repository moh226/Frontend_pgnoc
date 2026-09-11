<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Cog, Folder, LayoutDashboard, Plus } from '@lucide/vue'

import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationsStore()

interface ItemOnglet {
  nom: string
  libelle: string
  icone: typeof LayoutDashboard
  vers: string
}

const onglets: ItemOnglet[] = [
  {
    nom: 'investisseur-tableau-de-bord',
    libelle: 'Accueil',
    icone: LayoutDashboard,
    vers: '/espace-investisseur',
  },
  {
    nom: 'investisseur-dossiers',
    libelle: 'Dossiers',
    icone: Folder,
    vers: '/espace-investisseur/dossiers',
  },
  {
    nom: 'investisseur-notifications',
    libelle: 'Alertes',
    icone: Bell,
    vers: '/espace-investisseur/notifications',
  },
  {
    nom: 'parametres',
    libelle: 'Réglages',
    icone: Cog,
    vers: '/parametres',
  },
]

const ongletsGauche = onglets.slice(0, 2)
const ongletsDroite = onglets.slice(2)

const compteurAlertes = computed(() => notifications.compteNonLues)

function naviguer(onglet: ItemOnglet) {
  if (route.name === onglet.nom) return
  void router.push({ name: onglet.nom })
}

function creerDossier() {
  void router.push({ name: 'onboarding-sgi' })
}

onMounted(() => {
  if (auth.estConnecte) void notifications.chargerCompte()
})
</script>

<template>
  <div class="zone-barre-mobile">
    <nav class="barre-nav-mobile" aria-label="Navigation principale">
      <div class="d-flex align-center justify-space-between h-100 px-3">
        <v-btn
          v-for="onglet in ongletsGauche"
          :key="onglet.nom"
          class="onglet-mobile"
          :class="{ 'actif': route.name === onglet.nom }"
          variant="text"
          @click="naviguer(onglet)"
        >
          <div class="d-flex flex-column align-center">
            <onglet.icone :size="22" />
            <span class="libelle-onglet">{{ onglet.libelle }}</span>
          </div>
        </v-btn>

        <div class="fab-mobile">
          <v-btn
            color="primary"
            class="fab-creer elevation-4"
            aria-label="Créer un dossier"
            @click="creerDossier"
          >
            <Plus :size="26" />
          </v-btn>
        </div>

        <v-btn
          v-for="onglet in ongletsDroite"
          :key="onglet.nom"
          class="onglet-mobile"
          :class="{ 'actif': route.name === onglet.nom }"
          variant="text"
          @click="naviguer(onglet)"
        >
          <div class="d-flex flex-column align-center">
            <v-badge
              v-if="onglet.nom === 'investisseur-notifications' && compteurAlertes"
              :content="compteurAlertes"
              color="error"
              floating
              offset-x="-8"
              offset-y="-6"
            >
              <onglet.icone :size="22" />
            </v-badge>
            <onglet.icone v-else :size="22" />
            <span class="libelle-onglet">{{ onglet.libelle }}</span>
          </div>
        </v-btn>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.zone-barre-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  /* Safe area iPhone (encoche / barre gestuelle). */
  padding-bottom: env(safe-area-inset-bottom);
}

.barre-nav-mobile {
  height: 64px;
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 -2px 12px rgba(15, 23, 42, 0.06);
}

.onglet-mobile {
  min-width: 0;
  flex: 1;
  height: 64px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.onglet-mobile.actif {
  color: rgb(var(--v-theme-primary));
}

.onglet-mobile.actif .libelle-onglet {
  font-weight: 700;
}

.libelle-onglet {
  font-size: 0.65rem;
  letter-spacing: -0.01em;
  margin-top: 2px;
}

.fab-mobile {
  width: 56px;
  display: flex;
  justify-content: center;
  /* Le FAB déborde légèrement au-dessus de la barre : effet app plus
     « native » qu'un simple bouton. */
  align-items: flex-start;
}

.fab-creer {
  width: 52px;
  height: 52px;
  margin-top: -22px;
  border-radius: 16px;
  color: rgb(var(--v-theme-on-primary));
}
</style>