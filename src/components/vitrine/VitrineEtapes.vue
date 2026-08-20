<script setup lang="ts">
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()
</script>

<template>
  <section v-reveal class="section-vitrine zone-etapes" :class="{ 'apercu-masque': masque }">
    <header class="en-tete-section">
      <span class="sur-titre">Comment ça marche</span>
      <h2 class="font-display">{{ bloc.titre }}</h2>
      <span class="ornement-titre"></span>
    </header>
    <div class="bento-etapes">
      <article v-for="(etape, index) in bloc.contenu.etapes ?? []" :key="etape.titre" class="carte-etape hover-lift">
        <span class="numero-fantome font-display">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="badge-numero font-display">{{ index + 1 }}</span>
        <h3 class="font-display">{{ etape.titre }}</h3>
        <p>{{ etape.description }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.zone-etapes {
  background:
    radial-gradient(circle at 90% 15%, rgba(var(--v-theme-secondary), 0.08) 0%, transparent 45%),
    rgb(var(--v-theme-background));
}

.bento-etapes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 26px;
  max-width: 1120px;
  margin: 0 auto;
  position: relative;
}

.carte-etape {
  position: relative;
  padding: 30px 26px 28px;
  border-radius: 22px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 12px 30px rgba(var(--v-theme-primary), 0.06);
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}

.carte-etape:hover {
  transform: translateY(-6px);
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 20px 44px rgba(var(--v-theme-primary), 0.12);
}

/* Numéro fantôme en filigrane */
.numero-fantome {
  position: absolute;
  top: -18px;
  right: -6px;
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.09) 0%, rgba(var(--v-theme-accent), 0.05) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.carte-etape:hover .numero-fantome {
  opacity: 0.75;
}

.badge-numero {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-accent)) 100%);
  box-shadow: 0 10px 22px rgba(var(--v-theme-primary), 0.3);
}

.carte-etape h3 {
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}

.carte-etape p {
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