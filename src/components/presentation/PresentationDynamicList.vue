<script setup lang="ts">
import { Plus } from '@lucide/vue'

export interface FieldDefinition {
  key: string
  label: string
  width?: string
  placeholder?: string
}

defineProps<{
  items: Record<string, unknown>[]
  fields: FieldDefinition[]
  addLabel: string
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', index: number): void
}>()
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div>
    <div
      v-for="(item, i) in items"
      :key="i"
      class="d-flex align-start mb-3 gap-2"
    >
      <v-text-field
        v-for="field in fields"
        :key="field.key"
        v-model="item[field.key]"
        :label="field.label"
        :placeholder="field.placeholder"
        variant="outlined"
        density="comfortable"
        :class="!field.width ? 'flex-grow-1' : ''"
        :style="field.width ? { maxWidth: field.width } : {}"
        hide-details="auto"
      />
      <v-btn
        variant="text"
        color="error"
        icon="mdi-delete-outline"
        @click="emit('remove', i)"
      />
    </div>
    <v-btn
      variant="tonal"
      color="primary"
      size="small"
      class="mb-6"
      @click="emit('add')"
    >
      <Plus :size="15" class="mr-1" /> {{ addLabel }}
    </v-btn>
  </div>
</template>

<style scoped>
.gap-2 {
  gap: 10px;
}
</style>
