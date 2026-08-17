<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Building2, ChevronRight, FileText } from '@lucide/vue'

import { ficheSgi } from '@/api/sgi'
import { creerDossier } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import SgiPresentationRenderer from '@/components/SgiPresentationRenderer.vue'
import type { FicheSgi } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))

const fiche = ref<FicheSgi | null>(null)
const chargement = ref(true)
const erreur = ref('')
const creationEnCours = ref(false)

onMounted(async () => {
  try {
    fiche.value = await ficheSgi(id.value)
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
})

async function creerEspaceKyc() {
  creationEnCours.value = true
  erreur.value = ''
  try {
    const dossier = await creerDossier(id.value)
    await router.push({ name: 'investisseur-dossier-edition', params: { id: dossier.id } })
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    creationEnCours.value = false
  }
}

function revenir() {
  router.push({ name: 'onboarding-sgi' })
}
</script>

<template>
  <v-container fluid class="onboarding-page pa-0">
    <div class="orb orbe-un" />

    <div class="onboarding-zone">
      <header class="text-center mb-10">
        <h1 class="titre-visuel font-display mb-4">À propos de la SGI</h1>
        <p class="descriptif mx-auto">
          Découvrez la Société de Gestion d'Intermédiation avant d'ouvrir votre compte-titres.
        </p>
      </header>

      <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 mx-auto" style="max-width: 700px;">
        {{ erreur }}
      </v-alert>

      <div v-if="chargement" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <template v-else-if="fiche">
        <div class="page-luxe pa-8">
          <v-btn variant="text" color="primary" class="mb-4 px-0" @click="revenir">
            <ArrowLeft :size="16" class="mr-2" /> Retour à la liste des SGI
          </v-btn>

          <div class="d-flex align-center mb-6">
            <div v-if="fiche.logo" class="logo-sgi mr-4 rounded-lg overflow-hidden d-flex align-center justify-center">
              <img :src="fiche.logo" :alt="fiche.nom" class="w-100 h-100 object-fit-cover" />
            </div>
            <div v-else class="logo-placeholder mr-4">
              <Building2 :size="32" class="text-primary" />
            </div>
            <div>
              <h2 class="font-display text-h4 font-weight-bold mb-1">{{ fiche.nom }}</h2>
              <p class="text-muted font-weight-bold tracking-widest text-uppercase mb-0">
                Code : {{ fiche.code_sgi }}
              </p>
            </div>
          </div>

          <SgiPresentationRenderer :presentation="fiche.presentation" />

          <v-alert
            v-if="!fiche.presentation.est_regule && !fiche.presentation.mission && !fiche.presentation.activites.length"
            type="info"
            variant="tonal"
            class="mb-6"
          >
            Cette SGI n'a pas encore publié sa présentation détaillée.
          </v-alert>

          <div v-if="fiche.convention.titre" class="d-flex align-center pa-4 rounded-lg bg-surface-variant mb-8">
            <FileText :size="18" class="text-error mr-3" />
            <div class="flex-grow-1">
              <div class="font-weight-medium">{{ fiche.convention.titre }}</div>
              <div class="text-caption text-medium-emphasis">
                La convention tarifaire sera à accepter lors de l'ouverture du dossier.
              </div>
            </div>
            <v-chip
              :color="fiche.convention.signe_requis ? 'warning' : 'success'"
              variant="flat"
              size="small"
              class="font-weight-bold"
            >
              {{ fiche.convention.signe_requis ? 'Signature requise' : 'Convention validée' }}
            </v-chip>
          </div>

          <div class="text-right">
            <v-btn
              color="primary"
              variant="flat"
              size="x-large"
              class="btn-principal px-8"
              :loading="creationEnCours"
              @click="creerEspaceKyc"
            >
              Créer le dossier KYC <ChevronRight :size="18" class="ml-2" />
            </v-btn>
          </div>
        </div>
      </template>
    </div>
  </v-container>
</template>

<style scoped>
.onboarding-page {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
  position: relative;
  overflow: hidden;
  padding: 40px 0;
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
  right: 15%;
  background-color: rgb(var(--v-theme-primary));
}

.onboarding-zone {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
}

.titre-visuel {
  font-size: 36px;
  font-weight: 700;
}

.descriptif {
  font-size: 17px;
  color: rgba(var(--v-theme-on-surface-variant), 0.8);
  max-width: 560px;
}

.page-luxe {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 20px 60px -30px rgba(0, 0, 0, 0.3);
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

.logo-sgi {
  width: 64px;
  height: 64px;
}

.text-muted {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.6;
  font-size: 12px;
}

.btn-principal {
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 10px;
  text-transform: uppercase;
  font-size: 13px;
}
</style>