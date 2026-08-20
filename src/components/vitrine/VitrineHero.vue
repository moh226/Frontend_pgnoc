<script setup lang="ts">
import { ArrowRight, LogIn, ChevronDown, BadgeCheck, Fingerprint, Landmark, ShieldCheck } from '@lucide/vue'
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()
</script>

<template>
  <section
    class="zone-hero"
    :class="{ 'apercu-masque': masque, 'has-image': !!bloc.image_url }"
    :style="bloc.image_url ? { backgroundImage: `url(${bloc.image_url})` } : {}"
  >
    <!-- Décor de fond -->
    <div class="hero-mesh blob-un"></div>
    <div class="hero-mesh blob-deux"></div>
    <div class="hero-mesh blob-trois"></div>
    <div class="hero-grille"></div>
    <div v-if="bloc.image_url" class="hero-overlay"></div>

    <div class="grille-hero reveal-up">
      <div class="bloc-texte">
        <h1 class="font-display gradient-text">{{ bloc.titre }}</h1>
        <div class="actions-hero">
          <v-btn
            v-if="bloc.contenu.cta_principal"
            color="primary"
            size="x-large"
            class="btn-hero-principal hover-lift"
            :to="bloc.contenu.lien_principal ?? '/inscription'"
          >
            {{ bloc.contenu.cta_principal }} <ArrowRight :size="18" class="ml-2" />
          </v-btn>
          <v-btn
            v-if="bloc.contenu.cta_secondaire"
            variant="outlined"
            size="x-large"
            class="btn-hero-secondaire hover-lift"
            :to="bloc.contenu.lien_secondaire ?? '/login'"
          >
            {{ bloc.contenu.cta_secondaire }} <LogIn :size="18" class="ml-2" />
          </v-btn>
        </div>

        <div class="bande-confiance">
          <span class="item-confiance"><ShieldCheck :size="16" /> Transaction sécurisée</span>
          <span class="item-confiance"><Fingerprint :size="16" /> KYC renforcé</span>
          <span class="item-confiance"><BadgeCheck :size="16" /> 100 % dématérialisé</span>
        </div>
      </div>

      <div class="bloc-visuel" aria-hidden="true">
        <div class="carte-mockup">
          <header class="mockup-entete">
            <div>
              <span class="mockup-reference font-display">Demande d'ouverture de compte-titres</span>
              <span class="mockup-sous-titre">N° PGNOC-2026-0042</span>
            </div>
            <span class="puce-statut">En instruction</span>
          </header>

          <div class="mockup-corps">
            <div class="ligne-mockup">
              <span class="libelle-mockup">Partenaire</span>
              <span class="valeur-mockup font-display"><Landmark :size="14" /> SGI UEMOA</span>
            </div>
            <div class="ligne-mockup">
              <span class="libelle-mockup">Étape actuelle</span>
              <span class="valeur-mockup font-display">KYC · Vérifications</span>
            </div>
            <div class="bloc-progression">
              <div class="entete-progression">
                <span class="libelle-mockup">Avancement du dossier</span>
                <span class="valeur-progression font-display">76 %</span>
              </div>
              <div class="barre-progression">
                <span class="barre-remplie"></span>
              </div>
            </div>
          </div>

          <footer class="mockup-pied">
            <span class="mini-puce mini-verte"><BadgeCheck :size="13" /> KYC validé</span>
            <span class="mini-puce mini-doree"><BadgeCheck :size="13" /> Convention signée</span>
          </footer>
        </div>

        <span class="carte-flottante carte-flottante-un">
          <span class="rond-flottant rond-dore"><ShieldCheck :size="16" /></span>
          <span class="texte-flottant">Signature électronique</span>
        </span>
        <span class="carte-flottante carte-flottante-deux">
          <span class="rond-flottant rond-vert"><BadgeCheck :size="16" /></span>
          <span class="texte-flottant">Dossier certifié conforme</span>
        </span>
      </div>
    </div>

    <ChevronDown class="indicateur-defilement" :size="28" />
  </section>
</template>

<style scoped>
.zone-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 100dvh;
  padding: 120px 32px 150px;
  background:
    radial-gradient(circle at 78% 12%, rgba(var(--v-theme-secondary), 0.12) 0%, transparent 40%),
    linear-gradient(180deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-background)) 100%);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  color: rgb(var(--v-theme-on-surface));
}

/* Blobs de couleur */
.hero-mesh {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  z-index: 0;
  pointer-events: none;
}

.blob-un {
  top: -16%;
  left: 22%;
  width: 52vw;
  height: 52vw;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.16) 0%, transparent 65%);
  animation: flottementMesh 12s ease-in-out infinite alternate;
}

.blob-deux {
  bottom: -20%;
  right: 6%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(var(--v-theme-accent), 0.13) 0%, transparent 65%);
  animation: flottementMesh 14s ease-in-out infinite alternate-reverse;
}

.blob-trois {
  top: 34%;
  right: 38%;
  width: 24vw;
  height: 24vw;
  background: radial-gradient(circle, rgba(var(--v-theme-secondary), 0.1) 0%, transparent 65%);
  animation: flottementMesh 16s ease-in-out infinite alternate;
}

@keyframes flottementMesh {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-30px, 34px) scale(1.12); }
}

/* Grille technique en filigrane */
.hero-grille {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(var(--v-theme-primary), 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--v-theme-primary), 0.05) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 78%);
  z-index: 0;
  pointer-events: none;
}

.has-image .hero-mesh,
.has-image .hero-grille {
  opacity: 0.15;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(var(--v-theme-surface), 0.5), rgba(var(--v-theme-surface), 0.88));
  z-index: 0;
}

/* Décor statique : anneaux sur le visuel */
.bloc-visuel::before {
  content: '';
  position: absolute;
  right: -70px;
  top: -70px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  border: 1.5px dashed rgba(var(--v-theme-primary), 0.18);
  animation: virevolte 50s linear infinite;
  z-index: 1;
}

@keyframes virevolte {
  to { transform: rotate(360deg); }
}

.grille-hero {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.reveal-up {
  animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.bloc-texte h1 {
  font-size: clamp(40px, 5.4vw, 68px);
  line-height: 1.07;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin-bottom: 36px;
  text-align: left;
  text-wrap: balance;
}

.gradient-text {
  /* Rechute solide : le titre reste visible même si le dégradé de texte est indisponible */
  color: rgb(var(--v-theme-primary-darken-1, 10 46 124));
}

@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .gradient-text {
    background: linear-gradient(
      135deg,
      rgb(var(--v-theme-primary-darken-1, 10 46 124)) 0%,
      rgb(var(--v-theme-primary, 12 60 148)) 55%,
      rgb(var(--v-theme-primary-lighten-1, 24 84 200)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
}

.actions-hero {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-hero-principal {
  font-weight: 700;
  letter-spacing: 0.01em;
  border-radius: 18px;
  text-transform: none;
  padding: 0 34px;
  height: 58px;
  color: rgb(var(--v-theme-on-primary)) !important;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-darken-1))) !important;
  box-shadow: 0 12px 28px rgba(var(--v-theme-primary), 0.3) !important;
}

.btn-hero-principal:hover {
  box-shadow: 0 16px 36px rgba(var(--v-theme-primary), 0.42) !important;
}

.btn-hero-secondaire {
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 18px;
  text-transform: none;
  padding: 0 34px;
  height: 58px;
  color: rgb(var(--v-theme-primary)) !important;
  border: 1.5px solid rgba(var(--v-theme-primary), 0.3) !important;
  background: rgba(var(--v-theme-surface), 0.75) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.btn-hero-secondaire:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  background: rgba(var(--v-theme-surface), 0.95) !important;
}

.bande-confiance {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.item-confiance {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

.item-confiance svg {
  color: rgb(var(--v-theme-accent));
}

/* ---------------------- Visuel : mockup dossier ---------------------- */

.bloc-visuel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carte-mockup {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 430px;
  padding: 26px;
  border-radius: 26px;
  background: rgba(var(--v-theme-surface), 0.9);
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 34px 70px rgba(var(--v-theme-primary), 0.18);
  transform: rotate(1.8deg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.mockup-entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  margin-bottom: 16px;
}

.mockup-reference {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.mockup-sous-titre {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 3px;
}

.puce-statut {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.mockup-corps {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ligne-mockup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.libelle-mockup {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.valeur-mockup {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.valeur-mockup svg {
  color: rgb(var(--v-theme-primary));
}

.bloc-progression {
  margin-top: 6px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.entete-progression {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.valeur-progression {
  font-size: 18px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}

.barre-progression {
  height: 8px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  overflow: hidden;
}

.barre-remplie {
  display: block;
  width: 76%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-accent)));
}

.mockup-pied {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.mini-puce {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.mini-verte {
  color: rgb(var(--v-theme-accent-darken-1));
  background: rgba(var(--v-theme-accent), 0.1);
  border: 1px solid rgba(var(--v-theme-accent), 0.2);
}

.mini-doree {
  color: rgb(var(--v-theme-secondary-darken-1));
  background: rgba(var(--v-theme-secondary), 0.12);
  border: 1px solid rgba(var(--v-theme-secondary), 0.28);
}

/* Cartes flottantes autour du mockup */
.carte-flottante {
  position: absolute;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(var(--v-theme-surface), 0.92);
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 16px 34px rgba(var(--v-theme-primary), 0.16);
  font-size: 12px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  animation: flottementCarte 5s ease-in-out infinite;
}

.carte-flottante-un {
  top: -24px;
  left: -30px;
}

.carte-flottante-deux {
  bottom: -20px;
  right: -26px;
  animation-delay: 1.6s;
}

@keyframes flottementCarte {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.rond-flottant {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
}

.rond-dore {
  color: rgb(var(--v-theme-secondary-darken-1));
  background: rgba(var(--v-theme-secondary), 0.15);
}

.rond-vert {
  color: rgb(var(--v-theme-accent-darken-1));
  background: rgba(var(--v-theme-accent), 0.12);
}

.indicateur-defilement {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(var(--v-theme-primary), 0.35);
  animation: flottement 2.5s ease-in-out infinite;
  z-index: 2;
}

@keyframes flottement {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 10px); color: rgba(var(--v-theme-primary), 0.8); }
}

.apercu-masque {
  position: relative;
  opacity: 0.5;
  outline: 2px dashed rgb(var(--v-theme-error));
  outline-offset: -2px;
}

.apercu-masque::after {
  content: 'Désactivé — masqué sur la page publique';
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 30;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-on-error));
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 920px) {
  .grille-hero {
    grid-template-columns: 1fr;
    gap: 72px;
    text-align: center;
  }
  .bloc-texte h1 {
    text-align: center;
  }
  .actions-hero,
  .bande-confiance {
    justify-content: center;
  }
  .bloc-visuel {
    max-width: 460px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .zone-hero {
    padding: 96px 20px 130px;
    min-height: auto;
  }
  .bloc-visuel {
    display: none;
  }
  .bande-confiance {
    border-top: none;
    padding-top: 0;
    justify-content: flex-start;
  }
}
</style>