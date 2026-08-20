<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Minus } from '@lucide/vue'
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()

const activePanel = ref<number | null>(0)
</script>

<template>
  <section v-reveal class="section-vitrine zone-faq" :class="{ 'apercu-masque': masque }">
    <header class="en-tete-section">
      <span class="sur-titre">Questions fréquentes</span>
      <h2 class="font-display">{{ bloc.titre }}</h2>
      <span class="ornement-titre"></span>
    </header>

    <div class="conteneur-faq">
      <v-expansion-panels v-model="activePanel" class="faq-panels">
        <v-expansion-panel
          v-for="(item, index) in bloc.contenu.questions ?? []"
          :key="item.question"
          :value="index"
          class="faq-panel"
          elevation="0"
        >
          <v-expansion-panel-title class="faq-titre font-display" expand-icon="">
            <span class="puce-question">?</span>
            {{ item.question }}
            <template #actions>
              <span class="icon-toggle" :class="{ 'is-active': activePanel === index }">
                <Plus v-if="activePanel !== index" :size="18" />
                <Minus v-else :size="18" />
              </span>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="faq-texte">
            {{ item.reponse }}
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </section>
</template>

<style scoped>
.zone-faq {
  background: rgb(var(--v-theme-surface-variant));
}

.conteneur-faq {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.faq-panels {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: transparent !important;
}

.faq-panel {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgb(var(--v-theme-outline)) !important;
  border-radius: 18px !important;
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.faq-panel:hover {
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.faq-panel--active {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.1);
}

.faq-titre {
  font-size: 17px !important;
  font-weight: 700 !important;
  padding: 20px 20px !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  letter-spacing: -0.01em;
  min-height: 0 !important;
  gap: 14px;
}

.puce-question {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-secondary));
  background: linear-gradient(135deg, rgb(var(--v-theme-secondary)), rgb(var(--v-theme-secondary-darken-1)));
  box-shadow: 0 6px 14px rgba(var(--v-theme-secondary), 0.3);
}

.faq-texte {
  color: rgb(var(--v-theme-on-surface-variant)) !important;
  font-size: 15px !important;
  line-height: 1.7 !important;
  padding: 0 20px 22px 68px !important;
}

.icon-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.07);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.icon-toggle.is-active {
  color: rgb(var(--v-theme-on-secondary));
  background: rgb(var(--v-theme-secondary));
  border-color: rgb(var(--v-theme-secondary));
  transform: rotate(90deg);
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