<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Landmark } from '@lucide/vue'

import { redirectionPourRole } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'
import type { BlocAccueilPublic, TypeBlocAccueil } from '@/types'

import VitrineHero from '@/components/vitrine/VitrineHero.vue'
import VitrineReassurance from '@/components/vitrine/VitrineReassurance.vue'
import VitrineChiffres from '@/components/vitrine/VitrineChiffres.vue'
import VitrineEtapes from '@/components/vitrine/VitrineEtapes.vue'
import VitrineSecurite from '@/components/vitrine/VitrineSecurite.vue'
import VitrineTemoignages from '@/components/vitrine/VitrineTemoignages.vue'
import VitrineFaq from '@/components/vitrine/VitrineFaq.vue'
import VitrineAppelAction from '@/components/vitrine/VitrineAppelAction.vue'

const props = withDefaults(
  defineProps<{
    blocs: BlocAccueilPublic[]
    /** Blocs désactivés : visibles en aperçu mais signalés (masqués en public). */
    masques?: Partial<Record<TypeBlocAccueil, boolean>>
  }>(),
  { masques: () => ({}) },
)

const auth = useAuthStore()

const annee = new Date().getFullYear()

const souvenir = computed(() => new Map(props.blocs.map((b) => [b.type, b])))

function bloc(type: TypeBlocAccueil): BlocAccueilPublic | undefined {
  return souvenir.value.get(type)
}

function estMasque(type: TypeBlocAccueil): boolean {
  return !!props.masques[type]
}
</script>

<template>
  <div class="accueil">
    <!-- Barre de navigation -->
    <header class="barre-accueil">
      <div class="conteneur-barre">
        <router-link class="logo-accueil" :to="{ name: 'accueil' }">
          <span class="logo-picto">
            <Landmark :size="20" />
          </span>
          <span class="logo-bloc">
            <span class="font-display logo-nom">PGNOC-TI</span>
            <span class="logo-sous-titre">Marché financier régional</span>
          </span>
        </router-link>

        <nav class="liens-barre">
          <router-link v-if="!auth.estConnecte" class="lien-texte" :to="{ name: 'login' }">Se connecter</router-link>
          <router-link
            v-if="!auth.estConnecte"
            class="bouton-inscription"
            :to="{ name: 'inscription' }"
          >
            S'inscrire
          </router-link>
          <router-link
            v-if="auth.estConnecte"
            class="bouton-espace"
            :to="redirectionPourRole(auth.roleActuel)"
          >
            Mon espace <ArrowRight :size="16" />
          </router-link>
        </nav>
      </div>
    </header>

    <main>
      <VitrineHero
        v-if="bloc('HERO')"
        :bloc="bloc('HERO')!"
        :masque="estMasque('HERO')"
      />

      <VitrineReassurance
        v-if="bloc('REASSURANCE')"
        :bloc="bloc('REASSURANCE')!"
        :masque="estMasque('REASSURANCE')"
      />

      <VitrineChiffres
        v-if="bloc('CHIFFRES')"
        :bloc="bloc('CHIFFRES')!"
        :masque="estMasque('CHIFFRES')"
      />

      <VitrineEtapes
        v-if="bloc('ETAPES')"
        :bloc="bloc('ETAPES')!"
        :masque="estMasque('ETAPES')"
      />

      <VitrineSecurite
        v-if="bloc('SECURITE')"
        :bloc="bloc('SECURITE')!"
        :masque="estMasque('SECURITE')"
      />

      <VitrineTemoignages
        v-if="bloc('TEMOIGNAGES')"
        :bloc="bloc('TEMOIGNAGES')!"
        :masque="estMasque('TEMOIGNAGES')"
      />

      <VitrineFaq
        v-if="bloc('FAQ')"
        :bloc="bloc('FAQ')!"
        :masque="estMasque('FAQ')"
      />
    </main>

    <VitrineAppelAction
      v-if="bloc('APPEL_ACTION')"
      :bloc="bloc('APPEL_ACTION')!"
      :masque="estMasque('APPEL_ACTION')"
    />

    <footer class="pied-accueil">
      <div class="pied-contenu">
        <div class="pied-marque">
          <span class="pied-logo">
            <Landmark :size="22" />
          </span>
          <div>
            <div class="pied-nom font-display">PGNOC-TI</div>
            <p>Plateforme de gestion numérique des demandes d'ouverture de compte-titres pour investisseurs en SGI.</p>
          </div>
        </div>
        <nav class="pied-liens">
          <router-link v-if="!auth.estConnecte" :to="{ name: 'inscription' }">S'inscrire</router-link>
          <router-link v-if="!auth.estConnecte" :to="{ name: 'login' }">Se connecter</router-link>
          <router-link v-if="auth.estConnecte" :to="redirectionPourRole(auth.roleActuel)">
            Mon espace
          </router-link>
        </nav>
      </div>
      <div class="pied-barre">
        <span>© {{ annee }} PGNOC-TI. Tous droits réservés.</span>
        <span class="pied-sceau">Ouverture de compte-titres · Sécurité · Transparence</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.accueil {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.barre-accueil {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.conteneur-barre {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 68px;
  padding: 0 24px;
}

.logo-accueil {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-bloc {
  display: flex;
  flex-direction: column;
}

.logo-nom {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
  line-height: 1.15;
}

.logo-sous-titre {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.logo-picto {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.liens-barre {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lien-texte {
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  transition: color 0.18s, background-color 0.18s;
}

.lien-texte:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}

.bouton-inscription {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 8px;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  transition: box-shadow 0.18s ease;
}

.bouton-inscription:hover {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.bouton-espace {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-primary)) !important;
  background: rgb(var(--v-theme-primary)) !important;
  border-radius: 8px;
  padding: 10px 20px !important;
  transition: box-shadow 0.18s ease !important;
}

.bouton-espace:hover {
  color: rgb(var(--v-theme-on-primary)) !important;
  background: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3) !important;
}

/* ----------------- Footer ----------------- */

.pied-accueil {
  margin-top: auto;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.pied-contenu {
  max-width: 1120px;
  margin: 0 auto;
  padding: 56px 32px 40px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.pied-marque {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  max-width: 420px;
}

.pied-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-on-secondary));
  flex-shrink: 0;
}

.pied-nom {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.pied-marque p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.pied-liens {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pied-liens a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 10px;
  transition: color 0.2s, background-color 0.2s;
}

.pied-liens a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.pied-barre {
  max-width: 1120px;
  margin: 0 auto;
  padding: 18px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.pied-sceau {
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--v-theme-secondary));
}

@media (max-width: 600px) {
  .accueil {
    padding-top: 0;
  }

  .conteneur-barre {
    min-height: 60px;
    padding: 0 16px;
  }

  .logo-sous-titre {
    display: none;
  }

  .lien-texte {
    padding: 8px 10px;
    font-size: 13px;
  }

  .bouton-inscription {
    padding: 8px 16px;
  }

  .pied-contenu {
    flex-direction: column;
    padding: 44px 24px 32px;
  }

  .pied-barre {
    padding: 14px 24px;
    justify-content: center;
    text-align: center;
  }
}
</style>