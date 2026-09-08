<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()
</script>

<template>
  <section v-reveal class="section-vitrine zone-cta" :class="{ 'apercu-masque': masque }">
    <div class="bandeau-cta">
      <span class="cta-ligne-doree"></span>
      <div class="conteneur-cta">
        <span class="sur-titre-cta">Prêt à commencer ?</span>
        <h2 class="font-display">{{ bloc.titre }}</h2>
        <p v-if="bloc.contenu.slogan">{{ bloc.contenu.slogan }}</p>

        <v-btn
          v-if="bloc.contenu.cta_principal"
          size="x-large"
          class="btn-cta hover-lift"
          :to="bloc.contenu.lien_principal ?? '/inscription'"
        >
          {{ bloc.contenu.cta_principal }}
          <ArrowRight :size="20" class="ml-2 icone-cta" />
        </v-btn>
      </div>
    </div>
  </section>
</template>

<style scoped>
.zone-cta {
  background: rgb(var(--v-theme-surface));
  padding-top: 32px;
  padding-bottom: 96px;
}

.bandeau-cta {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
  padding: 92px 48px;
  border-radius: 16px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 10px 24px rgba(var(--v-theme-primary), 0.25);
  overflow: hidden;
  text-align: center;
  color: rgb(var(--v-theme-on-primary));
}

.cta-ligne-doree {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgb(var(--v-theme-secondary));
  pointer-events: none;
}

.conteneur-cta {
  position: relative;
  z-index: 2;
  max-width: 760px;
  margin: 0 auto;
}

.sur-titre-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.conteneur-cta h2 {
  font-size: clamp(30px, 4.5vw, 50px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.12;
  margin-bottom: 20px;
  text-wrap: balance;
  color: #fff;
}

.conteneur-cta p {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 40px;
  line-height: 1.65;
}

.btn-cta {
  font-weight: 700;
  letter-spacing: 0.01em;
  border-radius: 12px;
  text-transform: none;
  padding: 0 44px;
  height: 62px;
  font-size: 17px;
  color: rgb(var(--v-theme-primary)) !important;
  background: #fff !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25) !important;
}

.icone-cta {
  transition: transform 0.18s ease;
}

.btn-cta:hover .icone-cta {
  transform: translateX(4px);
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
  .bandeau-cta {
    padding: 64px 24px;
    border-radius: 12px;
  }
}
</style>