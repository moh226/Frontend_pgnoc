<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle, DownloadCloud, File, X } from '@lucide/vue'
import CaptureSelfieField from '@/components/CaptureSelfieField.vue'
import type { ChampKyc } from '@/types'
import { formaterDate } from '@/utils/format'

const props = defineProps<{
  champ: ChampKyc
  valeur: string
  fichierUrl?: string | null
  fichierDateCapture?: string | null
  fichierEmpreinte?: string | null
  commentaireAgent?: string | null
  estCorrige?: boolean
  verrouille: boolean
  dossierId: string
  valeurId?: string
}>()

const emit = defineEmits<{
  (e: 'update:valeur', value: string): void
  (e: 'upload-fichier', file: File | null): void
  (e: 'ouvrir-fichier', dossierId: string, valeurId: string): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const fichierEnCours = ref<File | null>(null)

function getAccept(): string {
  return props.champ.formats_acceptes?.split(',').map((f) => '.' + f.trim()).join(',') ?? ''
}

function onFileDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) {
    fichierEnCours.value = f
    emit('upload-fichier', f)
  }
}

function onFileSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  if (f) {
    fichierEnCours.value = f
    emit('upload-fichier', f)
  }
}

function openFilePicker() {
  if (!props.verrouille) fileInputRef.value?.click()
}

function clearFile() {
  fichierEnCours.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  emit('upload-fichier', null)
}

function choixMultiples(): string[] {
  if (!props.valeur) return []
  try {
    const liste = JSON.parse(props.valeur)
    return Array.isArray(liste) ? liste : []
  } catch {
    return []
  }
}

const optionsChoix = computed(() => {
  if (!props.champ.options_choix) return []
  try {
    const liste = JSON.parse(props.champ.options_choix)
    return Array.isArray(liste) ? liste : []
  } catch {
    return []
  }
})
</script>

<template>
  <div>
    <!-- Labels élégants -->
    <div class="text-caption font-weight-bold text-uppercase tracking-wider text-medium-emphasis mb-2 d-flex align-center">
      {{ champ.nom }}
      <span v-if="champ.obligatoire" class="text-error ml-1">*</span>
      <v-icon v-if="verrouille" icon="mdi-lock-outline" size="small" class="ml-1 text-medium-emphasis" />
    </div>

    <!-- Champs Textes Courts -->
    <v-text-field
      v-if="champ.type === 'TEXTE_COURT'"
      :model-value="valeur"
      :hint="champ.justification"
      persistent-hint
      variant="outlined"
      density="comfortable"
      class="premium-input"
      placeholder="Saisissez votre réponse"
      :readonly="verrouille"
      @update:model-value="(v: string) => emit('update:valeur', v)"
    />

    <!-- Champs Nombres -->
    <v-text-field
      v-else-if="champ.type === 'NOMBRE'"
      :model-value="valeur"
      :hint="champ.justification"
      persistent-hint
      variant="outlined"
      density="comfortable"
      type="number"
      class="premium-input"
      :readonly="verrouille"
      @update:model-value="(v: string) => emit('update:valeur', v)"
    />

    <!-- Champs Dates -->
    <v-text-field
      v-else-if="champ.type === 'DATE'"
      :model-value="valeur"
      :hint="champ.justification"
      persistent-hint
      variant="outlined"
      density="comfortable"
      type="date"
      class="premium-input"
      :readonly="verrouille"
      @update:model-value="(v: string) => emit('update:valeur', v)"
    />

    <!-- Champs Textes Longs -->
    <v-textarea
      v-else-if="champ.type === 'TEXTE_LONG'"
      :model-value="valeur"
      :hint="champ.justification"
      persistent-hint
      variant="outlined"
      rows="4"
      class="premium-input"
      :readonly="verrouille"
      @update:model-value="(v: string) => emit('update:valeur', v)"
    />

    <!-- Choix Unique -->
    <v-select
      v-else-if="champ.type === 'CHOIX_UNIQUE'"
      :model-value="valeur"
      :items="optionsChoix"
      :hint="champ.justification"
      persistent-hint
      variant="outlined"
      density="comfortable"
      class="premium-input"
      :readonly="verrouille"
      @update:model-value="(v: string | null) => emit('update:valeur', v ?? '')"
    />

    <!-- Booléen -->
    <v-switch
      v-else-if="champ.type === 'BOOLEEN'"
      :model-value="valeur === 'oui'"
      :label="champ.justification || 'Oui / Non'"
      color="primary"
      inset
      class="mt-0 premium-switch"
      :disabled="verrouille"
      @update:model-value="(v: boolean | null) => emit('update:valeur', v ? 'oui' : 'non')"
    />

    <!-- Choix Multiple -->
    <div v-else-if="champ.type === 'CHOIX_MULTIPLE'" class="premium-checkbox-group bg-surface-variant rounded-lg pa-4">
      <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-3">{{ champ.justification }}</p>
      <v-checkbox
        v-for="option in optionsChoix"
        :key="option"
        :label="option"
        :model-value="choixMultiples().includes(option)"
        color="primary"
        density="compact"
        hide-details
        class="mb-2"
        :disabled="verrouille"
        @update:model-value="(checked: boolean | null) => {
          const actuelles = choixMultiples()
          const nouvelles = checked ? [...actuelles, option] : actuelles.filter((o) => o !== option)
          emit('update:valeur', JSON.stringify(nouvelles))
        }"
      />
    </div>

    <!-- Selfie -->
    <div v-else-if="champ.type === 'SELFIE'">
      <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-3">{{ champ.justification }}</p>

      <div v-if="fichierUrl" class="uploaded-file-card d-flex align-center pa-4 rounded-lg mb-3 bg-surface border">
        <img
          :src="fichierUrl"
          :alt="champ.nom"
          class="selfie-thumb mr-4 cursor-pointer"
          @click="valeurId ? emit('ouvrir-fichier', dossierId, valeurId) : null"
        />
        <div class="flex-grow-1">
          <div class="text-body-2 font-weight-bold d-flex align-center">
            <CheckCircle :size="16" class="mr-2 text-success" /> Selfie de vérification enregistré
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Capturé le {{ formaterDate(fichierDateCapture ?? '') }} · horodaté et signé côté serveur
          </div>
        </div>
        <v-btn v-if="!verrouille" size="small" variant="text" color="primary" @click="emit('upload-fichier', null)">
          Reprendre
        </v-btn>
      </div>
      <CaptureSelfieField
        v-else
        :verrouille="verrouille"
        @capturee="(file: File) => emit('upload-fichier', file)"
      />
    </div>

    <!-- Fichiers -->
    <div v-else-if="champ.type === 'FICHIER'">
      <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-3">{{ champ.justification }}</p>
      
      <input
        ref="fileInputRef"
        type="file"
        :accept="getAccept()"
        class="d-none"
        :disabled="verrouille"
        @change="onFileSelect"
      />

      <div v-if="fichierUrl" class="uploaded-file-card d-flex align-center pa-4 rounded-lg mb-3 bg-surface border">
        <div class="icon-box bg-success-lighten-5 text-success rounded-circle d-flex align-center justify-center mr-4" style="width: 40px; height: 40px;">
          <CheckCircle :size="20" />
        </div>
        <div class="flex-grow-1">
          <div class="text-body-2 font-weight-bold">Document enregistré</div>
          <a
            href="#"
            @click.prevent="valeurId ? emit('ouvrir-fichier', dossierId, valeurId) : null"
            class="text-caption text-primary text-decoration-none hover-underline"
          >
            Voir le document actuel
          </a>
        </div>
        <v-btn v-if="!verrouille" size="small" variant="text" color="primary" @click="emit('upload-fichier', null)">
          Remplacer
        </v-btn>
      </div>

      <div
        v-else
        class="upload-drop-zone rounded-lg d-flex flex-column align-center justify-center text-center pa-6"
        :class="{ 'upload-drop-zone--active': dragOver, 'upload-drop-zone--disabled': verrouille }"
        @click="openFilePicker"
        @dragover.prevent="!verrouille && (dragOver = true)"
        @dragleave="dragOver = false"
        @drop.prevent="onFileDrop"
      >
        <template v-if="!fichierEnCours">
          <div class="upload-icon-wrapper rounded-circle d-flex align-center justify-center mb-3">
            <DownloadCloud :size="24" class="text-primary" />
          </div>
          <div class="text-body-1 font-weight-medium text-on-surface">Téléverser votre document</div>
          <div class="text-caption text-medium-emphasis mt-1">
            Cliquez ou glissez-déposez ici.<br>
            Formats : {{ champ.formats_acceptes }} (Max {{ champ.taille_max_mo }}MB)
          </div>
        </template>
        <template v-else>
          <div class="bg-success-lighten-5 rounded-circle d-flex align-center justify-center mb-3" style="width: 56px; height: 56px;">
            <File :size="24" class="text-success" />
          </div>
          <div class="text-body-1 font-weight-medium text-on-surface mb-1">{{ fichierEnCours.name }}</div>
          <div class="text-caption text-medium-emphasis mb-2">
            {{ (fichierEnCours.size / 1024 / 1024).toFixed(2) }} Mo
          </div>
          <v-btn
            v-if="!verrouille"
            size="x-small"
            variant="tonal"
            color="error"
            @click.stop="clearFile"
          >
            <X :size="14" class="mr-1" /> Supprimer
          </v-btn>
        </template>
      </div>
    </div>

    <!-- Commentaire Agent -->
    <v-alert
      v-if="commentaireAgent"
      type="warning"
      variant="tonal"
      class="mt-2 border-l-4"
    >
      <div class="text-caption font-weight-bold text-uppercase tracking-wider mb-1">Retour de l'agent</div>
      {{ commentaireAgent }}
    </v-alert>

    <!-- Champ verrouillé info -->
    <div
      v-if="verrouille"
      class="text-caption text-medium-emphasis mt-1 d-flex align-center"
    >
      <v-icon icon="mdi-lock-outline" size="small" class="mr-1" />
      Verrouillé — seuls les champs signalés par l'agent sont corrigeables après rejet.
    </div>
  </div>
</template>

<style scoped>
.tracking-wider {
  letter-spacing: 0.05em !important;
}

.border-l-4 {
  border-left-width: 4px !important;
}

.premium-input :deep(.v-field) {
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.premium-checkbox-group {
  border: 1px solid rgb(var(--v-theme-outline));
}

.selfie-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-outline));
}

.upload-drop-zone {
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.2);
  background-color: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 140px;
}

.upload-drop-zone:hover:not(.upload-drop-zone--disabled),
.upload-drop-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.upload-drop-zone--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-icon-wrapper {
  width: 56px;
  height: 56px;
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.hover-underline:hover {
  text-decoration: underline !important;
}
</style>
