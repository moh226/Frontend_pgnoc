<script setup lang="ts">
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()

function initiales(nom: string): string {
  return (
    nom
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((morceau) => morceau[0]?.toUpperCase() ?? '')
      .join('') || 'PG'
  )
}
</script>

<template>
  <section v-reveal class="section-vitrine zone-temoignages" :class="{ 'apercu-masque': masque }">
    <span class="bordure-halo"></span>
    <header class="en-tete-section">
      <span class="sur-titre">Ils nous font confiance</span>
      <h2 class="font-display">{{ bloc.titre }}</h2>
      <span class="ornement-titre"></span>
    </header>
    <div class="grille-temoignages">
      <blockquote v-for="temoignage in bloc.contenu.temoignages ?? []" :key="temoignage.nom" class="carte-temoignage hover-lift">
        <span class="guillemet" aria-hidden="true">«</span>
        <p>{{ temoignage.texte }}</p>
        <footer>
          <span class="avatar-placeholder font-display">{{ initiales(temoignage.nom) }}</span>
          <span class="auteur-info">
            <span class="auteur-nom font-display">{{ temoignage.nom }}</span>
            <span class="auteur-role">{{ temoignage.role }}</span>
          </span>
        </footer>
      </blockquote>
    </div>
  </section>
</template>

<style scoped>
.zone-temoignages {
  background:
    radial-gradient(circle at 8% 20%, rgba(var(--v-theme-primary), 0.07) 0%, transparent 45%),
    radial-gradient(circle at 92% 80%, rgba(var(--v-theme-accent), 0.06) 0%, transparent 45%),
    rgb(var(--v-theme-background));
}

.bordure-halo {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 70%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.3), transparent);
  pointer-events: none;
}

.grille-temoignages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 26px;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Liseré dégradé autour des cartes */
.carte-temoignage {
  position: relative;
  margin: 0;
  padding: 34px 30px 26px;
  border-radius: 24px;
  background: rgb(var(--v-theme-surface));
  background-clip: padding-box;
  border: 1.5px solid transparent;
  box-shadow: 0 14px 34px rgba(var(--v-theme-primary), 0.07);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}

.carte-temoignage::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.5), rgba(var(--v-theme-secondary), 0.6), rgba(var(--v-theme-accent), 0.5));
  z-index: -1;
}

.carte-temoignage:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 46px rgba(var(--v-theme-primary), 0.14);
}

.guillemet {
  position: absolute;
  top: 2px;
  right: 22px;
  font-size: 68px;
  line-height: 1;
  font-weight: 900;
  /* Rechute solide : or si le dégradé de texte est indisponible */
  color: rgb(var(--v-theme-secondary, 247 198 0));
  pointer-events: none;
}

@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .guillemet {
    background: linear-gradient(135deg, rgb(var(--v-theme-secondary, 247 198 0)), rgb(var(--v-theme-secondary-darken-1, 198 158 0)));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
}

.carte-temoignage p {
  font-size: 16px;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 26px;
  padding-right: 36px;
}

.carte-temoignage footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #fff;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-accent)));
  box-shadow: 0 8px 18px rgba(var(--v-theme-primary), 0.3);
  flex-shrink: 0;
}

.auteur-info {
  display: flex;
  flex-direction: column;
}

.auteur-nom {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  font-size: 16px;
  letter-spacing: -0.01em;
}

.auteur-role {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
  margin-top: 2px;
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
</style>