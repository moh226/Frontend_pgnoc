<script setup lang="ts">
defineProps<{
  titre: string
  description: string
  prochainesFonctions: string[]
}>()
</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="text-h6">{{ titre }}</v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-4">
          {{ description }}
        </v-alert>
        <v-list-subheader>Fonctionnalités à venir</v-list-subheader>
        <v-list>
          <v-list-item
            v-for="fonction in prochainesFonctions"
            :key="fonction"
            prepend-icon="mdi-calendar-clock"
            :title="fonction"
          />
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>
