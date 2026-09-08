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
    <div class="entete-page-titre">
      <div class="icon-box pa-2">
        <component :is="icone" :size="28" />
      </div>
      <div class="min-width-0">
        <h1 class="text-h4 font-display font-weight-bold mb-1">
          {{ titre }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ sousTitre }}
        </p>
      </div>
    </div>
    <!-- Les actions s'alignent sur la LIGNE DU TITRE (pas sur le bloc
         entier) : boutons et étiquettes partagent la même ligne de base
         que le titre, quel que soit le nombre d'actions. -->
    <div v-if="$slots.actions" class="entete-page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.entete-page {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.entete-page-titre {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
  /* Icon-box (54px) alignée sur le titre : la légère correction
     d'1px compense l'espacement interne du titre Plus Jakarta Sans. */
  padding-top: 1px;
}

.entete-page-titre .icon-box {
  flex-shrink: 0;
}

.entete-page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  /* Alignement sur la ligne du titre (h4 = 32px) : les actions de
     40px (bouton par défaut) sont centrées sur cette hauteur. */
  height: 44px;
  margin-top: 2px;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 959.98px) {
  .entete-page {
    flex-direction: column;
    align-items: stretch;
  }

  .entete-page-actions {
    height: auto;
    margin-top: 16px;
    flex-wrap: wrap;
  }
}
</style>
