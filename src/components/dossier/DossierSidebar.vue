<script setup lang="ts">
import { ArrowLeft, Check, ShieldCheck } from '@lucide/vue'

defineProps<{
  etapesGlobales: Array<{ id: string; titre: string; sousTitre?: string }>
  etapeGlobaleActive: number
}>()

const emit = defineEmits<{
  (e: 'quitter'): void
  (e: 'changer-etape', index: number): void
}>()
</script>

<template>
  <aside class="sidebar bg-slate-900 d-flex flex-column h-100">
    <div class="pa-6 border-b border-white-10">
      <v-btn variant="text" class="text-white hover-lift px-0 text-body-2 font-weight-medium" @click="emit('quitter')">
        <ArrowLeft :size="18" class="mr-2" /> Quitter le formulaire
      </v-btn>
    </div>

    <div class="pa-6 flex-grow-1 overflow-y-auto custom-scrollbar-dark">
      <h2 class="text-h5 font-display text-white font-weight-bold mb-8">Progression</h2>
      
      <div class="vertical-stepper">
        <div 
          v-for="(step, i) in etapesGlobales" 
          :key="step.id" 
          class="step-item d-flex"
          :class="{ 
            'active': etapeGlobaleActive === i, 
            'completed': i < etapeGlobaleActive 
          }"
          @click="i < etapeGlobaleActive ? emit('changer-etape', i) : null"
          :style="{ cursor: i < etapeGlobaleActive ? 'pointer' : 'default' }"
        >
          <!-- Ligne de connexion -->
          <div class="step-connector" v-if="i < etapesGlobales.length - 1"></div>
          
          <!-- Cercle indicateur -->
          <div class="step-circle mr-4 flex-shrink-0 d-flex align-center justify-center">
            <Check v-if="i < etapeGlobaleActive" :size="14" />
            <span v-else>{{ (i + 1).toString().padStart(2, '0') }}</span>
          </div>
          
          <!-- Textes -->
          <div class="step-text pb-8">
            <div class="text-caption text-uppercase tracking-wider step-subtitle mb-1">
              {{ step.sousTitre }}
            </div>
            <div class="text-body-1 font-weight-medium step-title">
              {{ step.titre }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pa-6 mt-auto">
      <div class="security-card pa-4 rounded-lg">
        <div class="d-flex align-center mb-2">
          <ShieldCheck class="text-success mr-2" :size="20" />
          <span class="text-caption font-weight-bold text-uppercase text-success tracking-wider">Sécurité Avancée</span>
        </div>
        <p class="text-caption text-grey-lighten-1 mb-0 line-height-1-5">
          Vos données sont chiffrées de bout-en-bout via AES-256 et stockées dans des serveurs souverains sécurisés.
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.bg-slate-900 {
  background-color: #0f172a;
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.hover-lift {
  transition: transform 0.2s ease;
}
.hover-lift:hover {
  transform: translateX(-4px);
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.line-height-1-5 {
  line-height: 1.5;
}

/* Custom Scrollbar Dark */
.custom-scrollbar-dark::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar-dark::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Vertical Stepper */
.vertical-stepper {
  position: relative;
}

.step-item {
  position: relative;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.step-item.active {
  opacity: 1;
}

.step-item.completed {
  opacity: 0.8;
}

.step-item.completed:hover {
  opacity: 1;
}

.step-connector {
  position: absolute;
  top: 32px;
  left: 15px;
  bottom: -8px;
  width: 2px;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.step-item.completed .step-connector {
  background-color: rgb(var(--v-theme-primary));
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step-item.active .step-circle {
  background-color: transparent;
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1);
}

.step-item.completed .step-circle {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.step-subtitle {
  color: rgba(255, 255, 255, 0.7);
}

.step-item.active .step-subtitle {
  color: rgb(var(--v-theme-primary));
}

.step-title {
  color: white;
}

.security-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.05);
}
</style>
