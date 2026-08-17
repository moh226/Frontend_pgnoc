<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Building2 } from '@lucide/vue'
import { listeSgi } from '@/api/sgi'
import { extraireMessageErreur } from '@/api/client'
import type { SgiPublique } from '@/types'

const router = useRouter()

const sgis = ref<SgiPublique[]>([])
const chargement = ref(true)
const erreur = ref('')

onMounted(async () => {
  try {
    const reponse = await listeSgi()
    sgis.value = reponse.results
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
})

function selectionnerSgi(id: string) {
  void router.push({ name: 'onboarding-sgi-detail', params: { id } })
}
</script>

<template>
  <v-container fluid class="onboarding-page pa-0">
    <div class="orb orbe-un" />
    
    <div class="onboarding-zone">
      <header class="text-center mb-12">
        <h1 class="titre-visuel font-display mb-4">Sélectionnez votre SGI</h1>
        <p class="descriptif mx-auto">
          Choisissez la Société de Gestion d'Intermédiation qui accompagnera 
          la création de votre portefeuille.
        </p>
      </header>

      <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 mx-auto" style="max-width: 600px;">
        {{ erreur }}
      </v-alert>

      <div v-if="chargement" class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <v-row v-else class="justify-center">
        <v-col v-for="sgi in sgis" :key="sgi.id" cols="12" md="4">
          <v-card 
            class="carte-sgi hover-lift"
            @click="selectionnerSgi(sgi.id)"
          >
            <div class="logo-placeholder mb-6">
              <Building2 :size="32" class="text-primary" />
            </div>
            <h3 class="font-display mb-2">{{ sgi.nom }}</h3>
            <p class="text-muted text-sm font-weight-bold tracking-widest text-uppercase">Code : {{ sgi.code_sgi }}</p>
            
            <div class="mt-auto pt-6 text-right">
              <v-btn variant="text" color="primary" class="btn-decouvrir">
                Découvrir <ChevronRight :size="16" class="ml-1" />
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.onboarding-page {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.1;
}

.orbe-un {
  width: 500px;
  height: 500px;
  top: -100px;
  left: 20%;
  background-color: rgb(var(--v-theme-primary));
}

.onboarding-zone {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  padding: 40px;
}

.titre-visuel {
  font-size: 40px;
  font-weight: 700;
}

.descriptif {
  font-size: 18px;
  color: rgba(var(--v-theme-on-surface-variant), 0.8);
  max-width: 600px;
}

.carte-sgi {
  padding: 32px;
  border-radius: 16px;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-muted {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.6;
}

.text-sm {
  font-size: 14px;
}

.btn-decouvrir {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 12px;
}
</style>