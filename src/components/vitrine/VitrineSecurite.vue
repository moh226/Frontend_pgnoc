<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()
</script>

<template>
  <section v-reveal class="section-vitrine zone-securite" :class="{ 'apercu-masque': masque }">
    <header class="en-tete-section en-tete-claire">
      <span class="sur-titre">Sécurité & conformité</span>
      <h2 class="font-display">{{ bloc.titre }}</h2>
      <span class="ornement-titre"></span>
    </header>
    <div class="grille-cartes">
      <article v-for="(carte, index) in bloc.contenu.cartes ?? []" :key="carte.titre" class="carte-securite">
        <div class="icon-wrapper" :class="'teinte-' + ((index % 3) + 1)">
          <ShieldCheck :size="26" class="icone-securite" />
        </div>
        <h3 class="font-display">{{ carte.titre }}</h3>
        <p>{{ carte.description }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.zone-securite {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

/* En-tête clair sur fond bleu */
.en-tete-claire .sur-titre {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgb(var(--v-theme-secondary));
}

.en-tete-claire .sur-titre::before {
  background: rgb(var(--v-theme-secondary));
}

.en-tete-claire h2 {
  color: #fff;
}

.en-tete-claire .ornement-titre {
  background: rgb(var(--v-theme-secondary));
}

.en-tete-claire .ornement-titre::after {
  background: rgb(var(--v-theme-secondary));
}

.grille-cartes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Cartes blanches sur fond bleu */
.carte-securite {
  padding: 30px 26px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.carte-securite:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin-bottom: 22px;
  transition: transform 0.18s ease;
}

.carte-securite:hover .icon-wrapper {
  transform: scale(1.07) rotate(-4deg);
}

/* Teintes à plat : 12 % de la couleur de marque */
.teinte-1 {
  background: rgba(var(--v-theme-success), 0.12);
}

.teinte-1 .icone-securite { color: rgb(var(--v-theme-success)); }

.teinte-2 {
  background: rgba(var(--v-theme-secondary), 0.16);
}

.teinte-2 .icone-securite { color: rgb(var(--v-theme-on-secondary)); }

.teinte-3 {
  background: rgba(var(--v-theme-primary), 0.12);
}

.teinte-3 .icone-securite { color: rgb(var(--v-theme-primary)); }

.carte-securite h3 {
  font-size: 19px;
  font-weight: 700;
  margin: 0 0 12px;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.carte-securite p {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.65;
  font-size: 15px;
  margin: 0;
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