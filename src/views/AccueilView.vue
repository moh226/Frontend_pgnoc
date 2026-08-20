<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Fingerprint,
  Landmark,
  LogIn,
  ShieldCheck,
  UserPlus,
} from '@lucide/vue'

import { accueilPublique } from '@/api/accueil'
import { redirectionPourRole } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'
import type { BlocAccueilPublic, ContenuBlocAccueil, TypeBlocAccueil } from '@/types'

const auth = useAuthStore()

const blocs = ref<BlocAccueilPublic[]>([])
const chargement = ref(true)
const erreur = ref('')

const hero = computed(() => bloc('HERO'))
const reassurance = computed(() => bloc('REASSURANCE'))
const chiffres = computed(() => bloc('CHIFFRES'))
const etapes = computed(() => bloc('ETAPES'))
const securite = computed(() => bloc('SECURITE'))
const temoignages = computed(() => bloc('TEMOIGNAGES'))
const faq = computed(() => bloc('FAQ'))
const appelAction = computed(() => bloc('APPEL_ACTION'))

function bloc(type: TypeBlocAccueil): BlocAccueilPublic | undefined {
  return blocs.value.find((b) => b.type === type)
}

function contenu(type: TypeBlocAccueil): ContenuBlocAccueil {
  return bloc(type)?.contenu ?? {}
}

onMounted(async () => {
  try {
    blocs.value = await accueilPublique()
  } catch {
    erreur.value = "La page d'accueil est momentanément indisponible. Réessayez plus tard."
  } finally {
    chargement.value = false
  }
})
</script>

<template>
  <div v-if="chargement" class="d-flex align-center justify-center" style="min-height: 50dvh">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <v-alert
    v-else-if="erreur"
    type="error"
    variant="tonal"
    class="ma-8 rounded-lg border-l-4"
  >
    {{ erreur }}
  </v-alert>

  <div v-else class="accueil">
    <!-- Barre de navigation -->
    <header class="barre-accueil">
      <router-link class="logo-accueil" :to="{ name: 'accueil' }">
        <span class="logo-picto">
          <Landmark :size="20" />
        </span>
        <span class="font-display">PGNOC-TI</span>
      </router-link>

      <nav class="liens-barre">
        <router-link v-if="!auth.estConnecte" :to="{ name: 'inscription' }">S'inscrire</router-link>
        <router-link v-if="!auth.estConnecte" :to="{ name: 'login' }">Se connecter</router-link>
        <router-link
          v-if="auth.estConnecte"
          class="bouton-espace"
          :to="redirectionPourRole(auth.role)"
        >
          Mon espace <ArrowRight :size="16" />
        </router-link>
      </nav>
    </header>

    <main>
      <!-- HERO -->
      <section
        v-if="hero"
        class="zone-hero"
        :style="hero.image_url ? { backgroundImage: `url(${hero.image_url})` } : {}"
      >
        <div class="voile-hero" />
        <div class="contenu-hero">
          <h1 class="font-display">{{ hero.titre }}</h1>
          <div class="actions-hero">
            <v-btn
              v-if="contenu('HERO').cta_principal"
              color="primary"
              size="x-large"
              class="btn-principal hover-lift"
              :to="contenu('HERO').lien_principal ?? '/inscription'"
            >
              {{ contenu('HERO').cta_principal }} <ArrowRight :size="18" class="ml-2" />
            </v-btn>
            <v-btn
              v-if="contenu('HERO').cta_secondaire"
              variant="outlined"
              size="x-large"
              class="btn-hero-secondaire hover-lift"
              :to="contenu('HERO').lien_secondaire ?? '/login'"
            >
              {{ contenu('HERO').cta_secondaire }} <LogIn :size="18" class="ml-2" />
            </v-btn>
          </div>
        </div>
        <ChevronDown class="indicateur-defilement" :size="28" />
      </section>

      <!-- REASSURANCE -->
      <section v-if="reassurance" class="zone-reassurance">
        <div class="puces-reassurance">
          <span v-for="mention in contenu('REASSURANCE').mentions ?? []" :key="mention">
            <BadgeCheck :size="18" /> {{ mention }}
          </span>
        </div>
      </section>

      <!-- CHIFFRES -->
      <section v-if="chiffres" class="zone-section zone-chiffres">
        <h2 class="font-display">{{ chiffres.titre }}</h2>
        <div class="grille-chiffres">
          <div v-for="chiffre in contenu('CHIFFRES').chiffres ?? []" :key="chiffre.libelle" class="carte-chiffre">
            <span class="valeur-chiffre font-display">{{ chiffre.valeur }}</span>
            <span class="libelle-chiffre">{{ chiffre.libelle }}</span>
          </div>
        </div>
      </section>

      <!-- ETAPES -->
      <section v-if="etapes" class="zone-section zone-etapes">
        <h2 class="font-display">{{ etapes.titre }}</h2>
        <div class="grille-etapes">
          <article v-for="etape in contenu('ETAPES').etapes ?? []" :key="etape.titre" class="carte-etape">
            <h3 class="font-display">{{ etape.titre }}</h3>
            <p>{{ etape.description }}</p>
          </article>
        </div>
      </section>

      <!-- SECURITE -->
      <section v-if="securite" class="zone-section zone-securite">
        <h2 class="font-display">{{ securite.titre }}</h2>
        <div class="grille-cartes">
          <article v-for="carte in contenu('SECURITE').cartes ?? []" :key="carte.titre" class="carte-securite">
            <ShieldCheck :size="28" class="texte-primary" />
            <h3 class="font-display">{{ carte.titre }}</h3>
            <p>{{ carte.description }}</p>
          </article>
        </div>
      </section>

      <!-- TEMOIGNAGES -->
      <section v-if="temoignages" class="zone-section zone-temoignages">
        <h2 class="font-display">{{ temoignages.titre }}</h2>
        <div class="grille-temoignages">
          <blockquote v-for="temoignage in contenu('TEMOIGNAGES').temoignages ?? []" :key="temoignage.nom" class="carte-temoignage">
            <p>« {{ temoignage.texte }} »</p>
            <footer>
              <Fingerprint :size="16" />
              <span class="font-weight-bold">{{ temoignage.nom }}</span>
              <span class="texte-muet">{{ temoignage.role }}</span>
            </footer>
          </blockquote>
        </div>
      </section>

      <!-- FAQ -->
      <section v-if="faq" class="zone-section zone-faq">
        <h2 class="font-display">{{ faq.titre }}</h2>
        <v-expansion-panels variant="accordion" class="panneaux-faq">
          <v-expansion-panel
            v-for="question in contenu('FAQ').questions ?? []"
            :key="question.question"
          >
            <v-expansion-panel-title class="font-weight-bold">
              {{ question.question }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>{{ question.reponse }}</v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </section>
    </main>

    <!-- APPEL À L'ACTION -->
    <footer v-if="appelAction" class="zone-appel-action">
      <p v-if="contenu('APPEL_ACTION').slogan" class="font-display slogan-appel">
        {{ contenu('APPEL_ACTION').slogan }}
      </p>
      <v-btn
        v-if="contenu('APPEL_ACTION').cta"
        color="primary"
        size="x-large"
        class="btn-principal hover-lift"
        :to="contenu('APPEL_ACTION').lien ?? '/inscription'"
      >
        {{ contenu('APPEL_ACTION').cta }} <UserPlus :size="18" class="ml-2" />
      </v-btn>
      <p class="mention-legale">
        PGNOC-TI — Plateforme de gestion des nouveaux comptes titres. Informations données à titre
        indicatif.
      </p>
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
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background-color: rgba(var(--v-theme-background), 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.logo-accueil {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-on-surface));
}

.logo-picto {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.liens-barre {
  display: flex;
  align-items: center;
  gap: 24px;
}

.liens-barre a {
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: color 0.2s;
}

.liens-barre a:hover {
  color: rgb(var(--v-theme-primary));
}

.bouton-espace {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgb(var(--v-theme-primary)) !important;
}

.zone-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 78dvh;
  padding: 64px 32px;
  background-color: rgb(var(--v-theme-surface));
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.voile-hero {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(13, 71, 161, 0.92),
    rgba(6, 46, 113, 0.85)
  );
}

.contenu-hero {
  position: relative;
  z-index: 1;
  max-width: 860px;
  text-align: center;
  color: rgb(var(--v-theme-on-primary));
}

.contenu-hero h1 {
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 40px;
}

.actions-hero {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-principal {
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 8px;
  text-transform: none;
}

.btn-hero-secondaire {
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 8px;
  text-transform: none;
  color: rgb(var(--v-theme-on-primary)) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.indicateur-defilement {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  color: rgb(var(--v-theme-on-primary));
  opacity: 0.7;
  animation: flottement 2s ease-in-out infinite;
}

@keyframes flottement {
  0%,
  100% {
    transform: translate(-50%, 0);
  }
  50% {
    transform: translate(-50%, 8px);
  }
}

.zone-reassurance {
  display: flex;
  justify-content: center;
  padding: 24px 32px;
  background-color: rgb(var(--v-theme-primary-darken-2));
  color: rgb(var(--v-theme-on-primary));
}

.puces-reassurance {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 40px;
  justify-content: center;
  max-width: 1100px;
}

.puces-reassurance span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.zone-section {
  padding: 72px 32px;
}

.zone-section h2 {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 48px;
}

.zone-chiffres {
  background-color: rgb(var(--v-theme-surface));
}

.grille-chiffres {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.carte-chiffre {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  border-radius: 16px;
  background-color: rgb(var(--v-theme-background));
  border: 1px solid rgb(var(--v-theme-outline));
}

.valeur-chiffre {
  font-size: 44px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.libelle-chiffre {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.zone-etapes {
  background-color: rgb(var(--v-theme-background));
}

.grille-etapes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.carte-etape {
  padding: 28px;
  border-radius: 16px;
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
}

.carte-etape h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 8px;
}

.carte-etape p {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.6;
}

.zone-securite {
  background-color: rgb(var(--v-theme-surface));
}

.grille-cartes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.carte-securite {
  padding: 28px;
  border-radius: 16px;
  background-color: rgb(var(--v-theme-background));
  border: 1px solid rgb(var(--v-theme-outline));
}

.carte-securite h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 12px 0 8px;
}

.carte-securite p {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.6;
}

.texte-primary {
  color: rgb(var(--v-theme-primary));
}

.zone-temoignages {
  background-color: rgb(var(--v-theme-background));
}

.grille-temoignages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.carte-temoignage {
  margin: 0;
  padding: 28px;
  border-radius: 16px;
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.carte-temoignage p {
  font-size: 16px;
  line-height: 1.7;
  font-style: italic;
}

.carte-temoignage footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: rgb(var(--v-theme-primary));
}

.texte-muet {
  color: rgb(var(--v-theme-on-surface-variant));
}

.zone-faq {
  background-color: rgb(var(--v-theme-surface));
}

.panneaux-faq {
  max-width: 820px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
}

.zone-appel-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 72px 32px;
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  text-align: center;
}

.slogan-appel {
  font-size: 28px;
  font-weight: 700;
}

.mention-legale {
  font-size: 12px;
  opacity: 0.75;
  max-width: 520px;
}

@media (max-width: 600px) {
  .barre-accueil {
    padding: 12px 16px;
  }
  .zone-hero {
    padding: 48px 16px;
  }
  .zone-section {
    padding: 48px 16px;
  }
}
</style>
