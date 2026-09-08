<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icone: Component
  titre: string
  sousTitre: string
}>()
</script>

<template>
  <div class="entete-page mb-8">
    <!-- Une seule rangée de 54px (hauteur de l'icon-box) : l'icône, le
         titre ET les actions sont tous centrés sur cette même ligne.
         Le sous-titre passe en dessous, aligné sous le texte. -->
    <div class="entete-page-rangee">
      <div class="icon-box pa-2">
        <component :is="icone" :size="28" />
      </div>
      <h1 class="text-h4 font-display font-weight-bold mb-0">
        {{ titre }}
      </h1>
      <div v-if="$slots.actions" class="entete-page-actions">
        <slot name="actions" />
      </div>
    </div>
    <p class="entete-page-sous-titre text-body-1 text-medium-emphasis mb-0">
      {{ sousTitre }}
    </p>
  </div>
</template>

<style scoped>
.entete-page {
  min-width: 0;
}

/* Rangée unique : icône (54px) + titre, actions poussées à droite,
   toutes centrées verticalement sur la même ligne. */
.entete-page-rangee {
  display: flex;
  align-items: center;
  gap: 16px;
}

.entete-page-rangee .icon-box {
  flex-shrink: 0;
}

.entete-page-rangee h1 {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entete-page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Sous-titre aligné sous le TEXTE (icône 54px + écart 16px). */
.entete-page-sous-titre {
  margin-top: 2px;
  margin-left: 70px;
}

@media (max-width: 959.98px) {
  .entete-page-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .entete-page-rangee {
    flex-wrap: wrap;
    row-gap: 12px;
  }

  .entete-page-sous-titre {
    margin-left: 0;
  }
}
</style>
