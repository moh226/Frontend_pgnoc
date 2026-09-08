<script setup lang="ts">
import { BadgeCheck } from '@lucide/vue'
import type { BlocAccueilPublic } from '@/types'

defineProps<{
  bloc: BlocAccueilPublic
  masque?: boolean
}>()
</script>

<template>
  <section class="zone-reassurance" :class="{ 'apercu-masque': masque }">
    <div class="bande-nuit reveal-up-delay">
      <span class="etiquette-bande">Nos engagements</span>
      <div class="puces-reassurance">
        <div v-for="mention in bloc.contenu.mentions ?? []" :key="mention" class="puce-item">
          <span class="puce-icone">
            <BadgeCheck :size="18" />
          </span>
          {{ mention }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.zone-reassurance {
  display: flex;
  justify-content: center;
  padding: 32px 32px 96px;
  position: relative;
  z-index: 10;
  background: rgb(var(--v-theme-surface));
}

.bande-nuit {
  width: 100%;
  max-width: 1080px;
  padding: 26px 36px;
  border-radius: 16px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 10px 24px rgba(var(--v-theme-primary), 0.25);
  color: rgb(var(--v-theme-on-primary));
}

.reveal-up-delay {
  animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.etiquette-bande {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.etiquette-bande::before,
.etiquette-bande::after {
  content: '';
  width: 26px;
  height: 2px;
  border-radius: 999px;
  background: rgba(var(--v-theme-secondary), 0.6);
}

.puces-reassurance {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px 10px;
}

.puce-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background-color 0.18s, border-color 0.18s, transform 0.18s ease;
}

.puce-item:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(var(--v-theme-secondary), 0.6);
  transform: translateY(-2px);
}

.puce-icone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: rgb(var(--v-theme-secondary));
  background: rgba(var(--v-theme-secondary), 0.16);
  flex-shrink: 0;
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
  .zone-reassurance {
    padding: 0 14px;
    margin-top: -44px;
  }
  .bande-nuit {
    border-radius: 20px;
    padding: 20px 14px;
  }
  .puces-reassurance {
    flex-direction: column;
    align-items: stretch;
  }
  .puce-item {
    justify-content: flex-start;
  }
}
</style>