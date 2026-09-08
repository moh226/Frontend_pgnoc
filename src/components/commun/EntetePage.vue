<script setup lang="ts">
defineProps<{
  titre: string
  sousTitre: string
}>()
</script>

<template>
  <div class="entete-page mb-8">
    <!-- Titre, sous-titre et actions sur une même rangée : sans icône,
     le texte démarre à gauche et les actions restent alignées sur la
     ligne du titre. -->
    <div class="entete-page-rangee">
      <div class="min-width-0">
        <h1 class="text-h4 font-display font-weight-bold mb-0">
          {{ titre }}
        </h1>
      </div>
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

/* Rangée unique : titre à gauche, actions poussées à droite, centrées
   sur la même ligne. */
.entete-page-rangee {
  display: flex;
  align-items: center;
  gap: 16px;
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

/* Sous-titre sous le texte du titre. */
.entete-page-sous-titre {
  margin-top: 2px;
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
}
</style>
