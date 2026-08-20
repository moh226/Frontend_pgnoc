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
    <span class="securite-mesh mesh-un"></span>
    <span class="securite-mesh mesh-deux"></span>
    <span class="anneau-struct"></span>
    <header class="en-tete-section">
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
  background:
    radial-gradient(circle at 85% 10%, rgba(var(--v-theme-secondary), 0.14) 0%, transparent 40%),
    linear-gradient(135deg, rgb(var(--v-theme-primary-darken-1)) 0%, rgb(var(--v-theme-primary)) 65%, rgb(var(--v-theme-accent)) 160%);
  color: #fff;
}

/* Meshes lumineux */
.securite-mesh {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.mesh-un {
  width: 46vw;
  height: 46vw;
  top: -18%;
  left: -12%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary-lighten-1), 0.22) 0%, transparent 65%);
}

.mesh-deux {
  width: 40vw;
  height: 40vw;
  bottom: -22%;
  right: -8%;
  background: radial-gradient(circle, rgba(var(--v-theme-accent), 0.2) 0%, transparent 65%);
}

.anneau-struct {
  position: absolute;
  right: -120px;
  top: -120px;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  border: 1.5px dashed rgba(255, 255, 255, 0.12);
  pointer-events: none;
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

.carte-securite {
  padding: 30px 26px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background-color 0.3s ease;
}

.carte-securite:hover {
  transform: translateY(-6px);
  border-color: rgba(var(--v-theme-secondary), 0.55);
  background: rgba(255, 255, 255, 0.08);
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  margin-bottom: 22px;
  transition: transform 0.3s ease;
}

.carte-securite:hover .icon-wrapper {
  transform: scale(1.07) rotate(-4deg);
}

.teinte-1 {
  background: linear-gradient(135deg, rgba(var(--v-theme-accent), 0.4), rgba(var(--v-theme-accent), 0.1));
  border: 1px solid rgba(var(--v-theme-accent), 0.4);
}

.teinte-1 .icone-securite { color: #7ef0b3; }

.teinte-2 {
  background: linear-gradient(135deg, rgba(var(--v-theme-secondary), 0.35), rgba(var(--v-theme-secondary), 0.08));
  border: 1px solid rgba(var(--v-theme-secondary), 0.4);
}

.teinte-2 .icone-securite { color: rgb(var(--v-theme-secondary)); }

.teinte-3 {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary-lighten-1), 0.4), rgba(var(--v-theme-primary-lighten-1), 0.08));
  border: 1px solid rgba(var(--v-theme-primary-lighten-1), 0.45);
}

.teinte-3 .icone-securite { color: #cddfff; }

.carte-securite h3 {
  font-size: 19px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #fff;
  letter-spacing: -0.01em;
}

.carte-securite p {
  color: rgba(255, 255, 255, 0.68);
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