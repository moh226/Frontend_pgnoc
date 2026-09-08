<script setup lang="ts">
import { ArrowRight, LogIn, BadgeCheck, Fingerprint, Landmark, ShieldCheck, FileText } from '@lucide/vue'
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()
</script>

<template>
  <section class="zone-hero" :class="{ 'apercu-masque': masque, 'has-image': !!bloc.image_url }">
    <div v-if="bloc.image_url" class="hero-overlay"></div>

    <div class="conteneur-hero reveal-up">
      <div class="grille-hero">
        <div class="bloc-texte">
          <span class="etiquette-institution">
            <Landmark :size="13" />
            Marché financier régional · UEMOA
          </span>

          <h1 class="font-display">{{ bloc.titre }}</h1>

          <p v-if="bloc.contenu.slogan" class="slogan-hero">
            {{ bloc.contenu.slogan }}
          </p>

          <div class="actions-hero">
            <v-btn
              v-if="bloc.contenu.cta_principal"
              color="primary"
              size="large"
              class="btn-hero-principal"
              :to="bloc.contenu.lien_principal ?? '/inscription'"
            >
              {{ bloc.contenu.cta_principal }} <ArrowRight :size="18" class="ml-2" />
            </v-btn>
            <v-btn
              v-if="bloc.contenu.cta_secondaire"
              variant="outlined"
              size="large"
              class="btn-hero-secondaire"
              :to="bloc.contenu.lien_secondaire ?? '/login'"
            >
              <LogIn :size="17" class="mr-2" /> {{ bloc.contenu.cta_secondaire }}
            </v-btn>
          </div>

          <div class="bande-confiance">
            <span class="item-confiance"><ShieldCheck :size="15" /> Transaction sécurisée</span>
            <span class="item-confiance"><Fingerprint :size="15" /> KYC renforcé</span>
            <span class="item-confiance"><BadgeCheck :size="15" /> 100 % dématérialisé</span>
          </div>
        </div>

        <div class="bloc-visuel" aria-hidden="true">
          <div class="pile-arriere pile-arriere-deux"></div>
          <div class="pile-arriere pile-arriere-un"></div>
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

          <span class="carte-stat-agents">
            <span class="rond-agents"><FileText :size="15" /></span>
            <span class="texte-agents">
              <strong>Dossiers tracés de bout en bout</strong>
              <small>Chaque action est horodatée et auditée</small>
            </span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.zone-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 92dvh;
  padding: 148px 32px 96px;
  background: rgb(var(--v-theme-surface));
  background-size: cover;
  background-position: center;
  overflow: hidden;
  color: rgb(var(--v-theme-on-surface));
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--v-theme-surface), 0.86);
  z-index: 0;
}

.conteneur-hero {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.grille-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 64px;
  align-items: center;
}

.reveal-up {
  animation: slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- Colonne texte ---------- */

.etiquette-institution {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.07);
  border: 1px solid rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bloc-texte h1 {
  font-size: clamp(34px, 4.4vw, 54px);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0 0 20px;
  text-align: left;
  text-wrap: balance;
  color: rgb(var(--v-theme-primary));
}

.slogan-hero {
  max-width: 480px;
  margin: 0 0 34px;
  font-size: clamp(15px, 1.3vw, 17px);
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface-variant));
}

.actions-hero {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-hero-principal {
  font-weight: 700;
  letter-spacing: 0.01em;
  border-radius: 10px;
  text-transform: none;
  padding: 0 30px;
  height: 52px;
}

.btn-hero-secondaire {
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 10px;
  text-transform: none;
  padding: 0 30px;
  height: 52px;
  color: rgb(var(--v-theme-primary));
  border-color: rgba(var(--v-theme-primary), 0.35);
}

.bande-confiance {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin-top: 34px;
  padding-top: 24px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.item-confiance {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

.item-confiance svg {
  color: rgb(var(--v-theme-success));
}

/* ---------- Colonne visuelle : aperçu produit ---------- */

.bloc-visuel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Effet de pile : deux cartes en arrière-plan, statiques */
.pile-arriere {
  position: absolute;
  background: rgb(var(--v-theme-background));
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 16px;
}

.pile-arriere-un {
  inset: 14px -14px -14px 14px;
  z-index: 1;
}

.pile-arriere-deux {
  inset: 28px -28px -28px 28px;
  z-index: 0;
  opacity: 0.6;
}

.carte-mockup {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 430px;
  padding: 26px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
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
  border-radius: 12px;
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
  background: rgb(var(--v-theme-primary));
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
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.mini-doree {
  color: rgb(var(--v-theme-on-secondary));
  background: rgba(var(--v-theme-secondary), 0.14);
  border: 1px solid rgba(var(--v-theme-secondary), 0.4);
}

/* Encart preuve de traçabilité */
.carte-stat-agents {
  position: absolute;
  z-index: 4;
  bottom: -22px;
  left: -34px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.rond-agents {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
  color: rgb(var(--v-theme-on-secondary));
  background: rgba(var(--v-theme-secondary), 0.18);
}

.texte-agents {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.texte-agents strong {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.texte-agents small {
  font-size: 11.5px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* ---------- États ---------- */

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

@media (prefers-reduced-motion: reduce) {
  .reveal-up {
    animation: none;
    opacity: 1;
  }
}

@media (max-width: 920px) {
  .grille-hero {
    grid-template-columns: 1fr;
    gap: 72px;
    text-align: center;
  }
  .etiquette-institution {
    margin-left: auto;
    margin-right: auto;
  }
  .bloc-texte h1 {
    text-align: center;
  }
  .slogan-hero {
    margin-left: auto;
    margin-right: auto;
  }
  .actions-hero,
  .bande-confiance {
    justify-content: center;
  }
  .bloc-visuel {
    max-width: 460px;
    margin: 0 auto;
  }
  .carte-stat-agents {
    left: -10px;
  }
}

@media (max-width: 600px) {
  .zone-hero {
    padding: 128px 20px 72px;
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
