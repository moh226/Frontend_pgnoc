<script setup lang="ts">
import type { ChampKycAdmin } from '@/types'
import { GripVertical, FileText, Eye, PowerOff, Power } from '@lucide/vue'

defineProps<{
  champ: ChampKycAdmin
  libellesType: Record<string, string>
}>()

defineEmits<{
  (e: 'basculer', champ: ChampKycAdmin): void
}>()
</script>

<template>
  <div 
    class="field-card bg-surface rounded-lg pa-4 d-flex align-center border"
    :class="{ 'opacity-70': !champ.actif }"
  >
    <!-- Poignée de drag (visuelle uniquement) -->
    <div class="cursor-grab text-grey-lighten-1 mr-3 flex-shrink-0">
      <GripVertical :size="20" />
    </div>

    <!-- Infos principales -->
    <div class="flex-grow-1 min-w-0 pr-4">
      <div class="d-flex align-center mb-1">
        <span class="font-weight-bold text-body-1 text-truncate mr-2">{{ champ.nom }}</span>
        <v-chip v-if="champ.obligatoire" color="error" size="x-small" variant="flat" class="font-weight-bold px-2">Requis</v-chip>
        <v-chip v-else color="info" size="x-small" variant="tonal" class="font-weight-bold px-2">Optionnel</v-chip>
      </div>
      
      <div class="text-caption text-medium-emphasis d-flex align-center flex-wrap gap-x-2 gap-y-1">
        <span class="d-flex align-center text-primary font-weight-medium">
          <FileText :size="12" class="mr-1" /> {{ libellesType[champ.type] }}
        </span>
        
        <span v-if="champ.type === 'CHOIX_UNIQUE' || champ.type === 'CHOIX_MULTIPLE'" class="text-truncate" style="max-width: 200px;">
          • {{ champ.options_choix?.join(', ') }}
        </span>
        <span v-else-if="champ.type === 'FICHIER' || champ.type === 'SELFIE'">
          • {{ champ.formats_acceptes || 'PDF' }} (max {{ champ.taille_max_mo }}Mo)
        </span>

        <span v-if="champ.champ_parent" class="d-flex align-center text-warning ml-2 border-l pl-2">
          <Eye :size="12" class="mr-1" />
          Conditionnel
        </span>
      </div>
    </div>

    <!-- Actions du champ -->
    <div class="d-flex align-center flex-shrink-0 gap-2">
      <v-chip
        size="small"
        :color="champ.actif ? 'success' : 'grey'"
        variant="tonal"
        class="font-weight-bold d-none d-sm-flex"
      >
        {{ champ.actif ? 'Actif' : 'Inactif' }}
      </v-chip>
      <v-btn
        icon
        variant="text"
        size="small"
        :color="champ.actif ? 'error' : 'success'"
        @click="$emit('basculer', champ)"
        :title="champ.actif ? 'Désactiver' : 'Activer'"
      >
        <PowerOff v-if="champ.actif" :size="18" />
        <Power v-else :size="18" />
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.field-card {
  transition: all 0.2s ease;
}
.opacity-70 {
  opacity: 0.7;
}
.gap-2 {
  gap: 8px;
}
.gap-x-2 {
  column-gap: 8px;
}
.gap-y-1 {
  row-gap: 4px;
}
</style>
