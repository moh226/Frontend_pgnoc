<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, FileText, Info, Building2 } from '@lucide/vue'
import { listeSgi, ficheSgi } from '@/api/sgi'
import { creerDossier } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import type { SgiPublique, FicheSgi } from '@/types'

const router = useRouter()

const sgis = ref<SgiPublique[]>([])
const chargement = ref(true)
const erreur = ref('')

const sgiSelectionnee = ref<string | null>(null)
const ficheActive = ref<FicheSgi | null>(null)
const chargementFiche = ref(false)

const modalePresentationOuverte = ref(false)
const creationEnCours = ref(false)

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

async function selectionnerSgi(id: string) {
  sgiSelectionnee.value = id
  modalePresentationOuverte.value = true
  chargementFiche.value = true
  try {
    ficheActive.value = await ficheSgi(id)
  } catch (cause) {
    console.error(cause)
  } finally {
    chargementFiche.value = false
  }
}

async function creerEspaceKyc() {
  if (sgiSelectionnee.value) {
    creationEnCours.value = true
    try {
      const dossier = await creerDossier(sgiSelectionnee.value)
      modalePresentationOuverte.value = false
      await router.push({ name: 'investisseur-dossier-edition', params: { id: dossier.id } })
    } catch (cause) {
      console.error(cause)
    } finally {
      creationEnCours.value = false
    }
  }
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
            :class="{ 'sgi-active': sgiSelectionnee === sgi.id }"
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

    <!-- Modale de Présentation -->
    <v-dialog v-model="modalePresentationOuverte" max-width="600px" persistent>
      <v-card class="modal-luxe">
        <v-card-title class="font-display d-flex align-center pt-6 px-6">
          <Info :size="24" class="text-primary mr-3" />
          Présentation de la SGI
        </v-card-title>
        <v-card-text class="px-6 py-4">
          <p class="mb-4">
            Vous avez sélectionné <strong>{{ sgis.find(s => s.id === sgiSelectionnee)?.nom }}</strong>. 
          </p>
          <div class="presentation-detaillee p-4 mb-4">
            <v-progress-circular v-if="chargementFiche" indeterminate color="primary" size="24" />
            <div v-else>
              <p class="mb-2 text-body-2">
                {{ ficheActive?.presentation || 'Aucune description fournie par cette SGI.' }}
              </p>
              <div v-if="ficheActive?.convention?.titre" class="mt-4 pt-4 border-top">
                <div class="d-flex align-center text-body-2 mb-2">
                  <FileText :size="16" class="text-error mr-2" />
                  <span class="font-weight-medium">{{ ficheActive.convention.titre }}</span>
                </div>
                <v-chip
                  :color="ficheActive.convention.signe_requis ? 'warning' : 'success'"
                  variant="flat"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ ficheActive.convention.signe_requis ? 'Signature requise' : 'Convention validée' }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-btn variant="text" @click="modalePresentationOuverte = false" color="grey-lighten-1">Retour</v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            variant="flat" 
            class="btn-principal" 
            :loading="creationEnCours"
            @click="creerEspaceKyc"
          >
            Créer le dossier KYC <ChevronRight :size="16" class="ml-1" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>



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

.sgi-active {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)), 0 10px 30px -10px rgba(var(--v-theme-primary), 0.2) !important;
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
  font-weight: 600;
}

.modal-luxe {
  border-radius: 16px !important;
}

.presentation-detaillee {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-outline));
}

.liste-avantages {
  list-style: none;
  padding: 0;
  margin: 0;
}

.liste-avantages li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
}



.btn-principal {
  height: 44px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 8px;
  text-transform: uppercase;
  font-size: 13px;
}
</style>
