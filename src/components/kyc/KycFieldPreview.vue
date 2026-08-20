<script setup lang="ts">
import { ref } from 'vue'
import { Eye, XCircle, Layers, FileText, Camera } from '@lucide/vue'
import type { ChampKycAdmin, EtapeKycAdmin } from '@/types'

const props = defineProps<{
  modelValue: boolean
  etapes: EtapeKycAdmin[]
  champsParEtape: Map<string, ChampKycAdmin[]>
}>()

defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const valeursApercu = ref<Record<string, string>>({})

function champVisibleDansApercu(champ: ChampKycAdmin): boolean {
  if (!champ.champ_parent) return true
  return valeursApercu.value[champ.champ_parent] === champ.valeur_declencheur
}

function nomDuParent(champ: ChampKycAdmin): string {
  if (!champ.champ_parent) return ''
  for (const champs of props.champsParEtape.values()) {
    const parent = champs.find((c) => c.id === champ.champ_parent)
    if (parent) return parent.nom
  }
  return champ.champ_parent.slice(0, 8)
}

function etapesVisibles(): EtapeKycAdmin[] {
  return props.etapes.filter((e) => e.actif)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800" scrollable>
    <v-card class="rounded-xl elevation-24 bg-background">
      <v-card-title class="d-flex align-center pa-6 bg-surface border-b">
        <div class="bg-primary-lighten-5 text-primary rounded-circle pa-2 mr-3">
          <Eye :size="24" />
        </div>
        <div>
          <div class="font-display font-weight-bold text-h6">Aperçu du formulaire</div>
          <div class="text-caption text-medium-emphasis">Simulation du rendu pour l'investisseur</div>
        </div>
        <v-spacer />
        <v-btn variant="tonal" icon color="grey-darken-1" size="small" @click="$emit('update:modelValue', false)">
          <XCircle :size="20" />
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pa-6 pa-md-8 custom-scrollbar bg-background">
        <v-alert type="info" variant="tonal" class="mb-6 rounded-lg border-l-4">
          Testez les champs et les conditions d'affichage en direct. Les données ne sont pas enregistrées.
        </v-alert>

        <template v-if="!etapesVisibles().length">
          <div class="text-center pa-8 bg-surface rounded-xl border border-dashed">
            <Layers :size="48" class="text-grey-lighten-1 mb-4 mx-auto" />
            <div class="text-h6 font-weight-medium mb-1">Aucune étape active</div>
            <div class="text-body-2 text-medium-emphasis">L'investisseur verra un parcours vide. Activez des étapes pour prévisualiser.</div>
          </div>
        </template>

        <div v-for="etape in etapesVisibles()" :key="etape.id" class="mb-8 bg-surface rounded-xl border overflow-hidden">
          <div class="bg-surface-variant px-6 py-4 border-b d-flex align-center">
            <div class="step-badge-small bg-primary text-white mr-3 font-weight-bold flex-shrink-0 d-flex align-center justify-center">
              {{ etape.ordre }}
            </div>
            <div class="text-h6 font-display font-weight-bold">{{ etape.nom }}</div>
          </div>

          <div class="pa-6">
            <v-alert
              v-if="!champsParEtape.get(etape.id)?.some((champ) => champ.actif)"
              type="warning"
              variant="tonal"
              class="mb-0 border-l-4"
            >
              Aucun champ actif configuré dans cette étape.
            </v-alert>

            <v-row v-else>
              <template v-for="champ in champsParEtape.get(etape.id)" :key="champ.id">
                <v-col cols="12" v-if="champ.actif">
                  <div v-if="champVisibleDansApercu(champ)">
                    <div class="text-caption font-weight-bold text-uppercase tracking-wider text-medium-emphasis mb-2">
                      {{ champ.nom }}
                      <span v-if="champ.obligatoire" class="text-error">*</span>
                    </div>

                    <v-text-field
                      v-if="champ.type === 'TEXTE_COURT' || champ.type === 'NOMBRE' || champ.type === 'DATE'"
                      :model-value="valeursApercu[champ.id]"
                      :type="champ.type === 'DATE' ? 'date' : champ.type === 'NOMBRE' ? 'number' : 'text'"
                      :hint="champ.justification || undefined"
                      persistent-hint
                      variant="outlined"
                      class="premium-input"
                      placeholder="Votre réponse"
                      @update:model-value="(v: string | null) => { valeursApercu[champ.id] = (v ?? '') }"
                    />
                    
                    <v-textarea
                      v-else-if="champ.type === 'TEXTE_LONG'"
                      :model-value="valeursApercu[champ.id]"
                      :hint="champ.justification || undefined"
                      persistent-hint
                      variant="outlined"
                      class="premium-input"
                      rows="3"
                      placeholder="Votre réponse"
                      @update:model-value="(v: string | null) => { valeursApercu[champ.id] = (v ?? '') }"
                    />
                    
                    <v-select
                      v-else-if="champ.type === 'CHOIX_UNIQUE'"
                      :model-value="valeursApercu[champ.id] || undefined"
                      :items="champ.options_choix ?? []"
                      :hint="champ.justification || undefined"
                      persistent-hint
                      variant="outlined"
                      class="premium-input"
                      placeholder="Sélectionnez une option"
                      @update:model-value="(v: string | null) => { valeursApercu[champ.id] = (v ?? '') }"
                    />
                    
                    <div v-else-if="champ.type === 'CHOIX_MULTIPLE'" class="bg-surface-variant pa-4 rounded-lg">
                      <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-2">{{ champ.justification }}</p>
                      <v-checkbox
                        v-for="option in champ.options_choix ?? []"
                        :key="option"
                        :label="option"
                        :model-value="(valeursApercu[champ.id] ?? '').split('|').includes(option)"
                        density="compact"
                        hide-details
                        color="primary"
                        @update:model-value="(c: boolean | null) => {
                          const actuelles = (valeursApercu[champ.id] ?? '').split('|').filter(Boolean)
                          valeursApercu[champ.id] = (c ? [...actuelles, option] : actuelles.filter((o) => o !== option)).join('|')
                        }"
                      />
                    </div>
                    
                    <v-switch
                      v-else-if="champ.type === 'BOOLEEN'"
                      :model-value="valeursApercu[champ.id] === 'oui'"
                      :label="champ.justification || 'Oui / Non'"
                      color="primary"
                      inset
                      class="mt-0"
                      hide-details
                      @update:model-value="(v: boolean | null) => { valeursApercu[champ.id] = v ? 'oui' : 'non' }"
                    />
                    
                    <div v-else-if="champ.type === 'FICHIER'" class="premium-file-input pa-6 rounded-lg text-center d-flex flex-column align-center justify-center">
                      <div class="bg-surface-variant rounded-circle pa-3 mb-3">
                        <FileText :size="24" class="text-primary" />
                      </div>
                      <div class="text-body-1 font-weight-medium">Dépôt de document simulé</div>
                      <div class="text-caption text-medium-emphasis">Formats acceptés : {{ champ.formats_acceptes || 'pdf' }} (Max {{ champ.taille_max_mo ?? '—' }} Mo)</div>
                    </div>

                    <div v-else-if="champ.type === 'SELFIE'" class="premium-file-input pa-6 rounded-lg text-center d-flex flex-column align-center justify-center">
                      <div class="bg-surface-variant rounded-circle pa-3 mb-3">
                        <Camera :size="24" class="text-primary" />
                      </div>
                      <div class="text-body-1 font-weight-medium">Selfie — capture caméra à la saisie</div>
                      <div class="text-caption text-medium-emphasis">L'investisseur se prend en photo carte en main (aucun upload de fichier existant) · Formats : {{ champ.formats_acceptes || 'jpg, png, webp' }} (Max {{ champ.taille_max_mo ?? 5 }} Mo)</div>
                    </div>

                    <div v-if="champ.champ_parent" class="text-caption text-warning mt-2 d-flex align-center">
                      <Eye :size="12" class="mr-1" />
                      Aperçu conditionnel : Affiché car « {{ nomDuParent(champ) }} » = {{ champ.valeur_declencheur }}
                    </div>
                  </div>

                  <div v-else class="pa-3 bg-surface-variant rounded-lg border border-dashed text-caption text-medium-emphasis d-flex align-center justify-center opacity-70">
                    <Eye :size="14" class="mr-2" />
                    {{ champ.nom }} (Masqué car « {{ nomDuParent(champ) }} » ≠ {{ champ.valeur_declencheur }})
                  </div>
                </v-col>
              </template>
            </v-row>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.step-badge-small {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 0.9rem;
}
.border-l-4 {
  border-left-width: 4px !important;
}
.tracking-wider {
  letter-spacing: 0.05em !important;
}
.premium-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: rgb(var(--v-theme-surface));
}
.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}
.premium-file-input {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.2);
  background-color: rgba(var(--v-theme-surface), 0.5);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
.opacity-70 {
  opacity: 0.7;
}
</style>
