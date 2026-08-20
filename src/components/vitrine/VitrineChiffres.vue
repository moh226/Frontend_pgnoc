<script setup lang="ts">
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()
</script>

<template>
  <section v-reveal class="section-vitrine zone-chiffres" :class="{ 'apercu-masque': masque }">
    <header class="en-tete-section">
      <span class="sur-titre">En chiffres</span>
      <h2 class="font-display">{{ bloc.titre }}</h2>
      <span class="ornement-titre"></span>
    </header>
    <div class="bande-chiffres">
      <div
        v-for="(chiffre, index) in bloc.contenu.chiffres ?? []"
        :key="chiffre.libelle"
        class="item-chiffre"
      >
        <span v-if="index > 0" class="separateur-chiffre"></span>
        <span class="valeur-chiffre font-display">{{ chiffre.valeur }}</span>
        <span class="libelle-chiffre">{{ chiffre.libelle }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.zone-chiffres {
  background:
    radial-gradient(circle at 12% 90%, rgba(var(--v-theme-accent), 0.06) 0%, transparent 42%),
    rgb(var(--v-theme-surface));
}

.bande-chiffres {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 36px;
  max-width: 1080px;
  margin: 0 auto;
  padding: 44px 48px;
  border-radius: 24px;
  background: rgb(var(--v-theme-background));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: inset 0 2px 0 rgba(var(--v-theme-surface), 0.8), 0 14px 40px rgba(var(--v-theme-primary), 0.07);
  position: relative;
}

.item-chiffre {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 8px 0;
}

.separateur-chiffre {
  position: absolute;
  left: -18px;
  top: 15%;
  bottom: 15%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(var(--v-theme-primary), 0.25), transparent);
}

.valeur-chiffre {
  font-size: clamp(40px, 4.5vw, 56px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  /* Rechute solide : chiffres toujours visibles */
  color: rgb(var(--v-theme-primary-darken-1, 10 46 124));
}

@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .valeur-chiffre {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary-darken-1, 10 46 124)) 0%, rgb(var(--v-theme-primary, 12 60 148)) 55%, rgb(var(--v-theme-accent, 0 150 57)) 130%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
}

.libelle-chiffre {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
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

@media (max-width: 600px) {
  .bande-chiffres {
    gap: 24px;
    padding: 32px 20px;
  }
  .separateur-chiffre {
    display: none;
  }
}
</style>