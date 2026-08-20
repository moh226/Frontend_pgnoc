<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle, AlertCircle } from '@lucide/vue'

import { useDossierForm } from '@/composables/useDossierForm'
import { soumettreDossier, ouvrirFichierValeur } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'

import DossierSidebar from '@/components/dossier/DossierSidebar.vue'
import DossierConvention from '@/components/dossier/DossierConvention.vue'
import DossierValidation from '@/components/dossier/DossierValidation.vue'
import DossierDynamicField from '@/components/dossier/DossierDynamicField.vue'

const route = useRoute()
const router = useRouter()

const dossierId = computed(() => String(route.params.id))

const form = useDossierForm(dossierId.value)

onMounted(() => {
  form.chargerDossier()
})

function quitterFormulaire() {
  router.push({ name: 'investisseur-dossier-detail', params: { id: dossierId.value } })
}

async function soumettreFinal() {
  form.envoiEnCours.value = true
  form.erreur.value = ''
  try {
    await form.viderSauvegardes()
    await soumettreDossier(dossierId.value)
    router.push({ name: 'investisseur-dossier-detail', params: { id: dossierId.value } })
  } catch (cause) {
    form.erreur.value = extraireMessageErreur(cause)
  } finally {
    form.envoiEnCours.value = false
  }
}

// Fonction utilitaire pour le layout des champs
function getColSpan(type: string): number {
  if (['TEXTE_LONG', 'FICHIER', 'SELFIE', 'CHOIX_MULTIPLE'].includes(type)) return 12
  return 6 // TEXTE_COURT, NOMBRE, DATE, BOOLEEN, CHOIX_UNIQUE prennent 50% de la largeur
}

function estVisible(champId: string): boolean {
  const champ = form.tousChamps.value.find(c => c.id === champId)
  if (!champ || !champ.champ_parent) return true
  const parentVal = form.valeurs.value[champ.champ_parent]
  return parentVal?.valeur === champ.valeur_declencheur
}
</script>

<template>
  <div class="split-layout">
    <DossierSidebar 
      :etapesGlobales="form.etapesGlobales.value"
      :etapeGlobaleActive="form.etapeGlobaleActive.value"
      @quitter="quitterFormulaire"
      @changer-etape="index => form.etapeGlobaleActive.value = index"
    />

    <main class="main-content bg-background d-flex flex-column position-relative">
      <!-- Loading Overlay -->
      <div v-if="form.chargement.value" class="loading-overlay d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="64" width="6" />
      </div>

      <template v-else-if="form.detail.value && form.etapeCourante.value">
        <!-- Header de la zone de contenu -->
        <header class="content-header px-8 py-6 border-b d-flex align-center bg-surface">
          <div>
            <h1 class="text-h4 font-display font-weight-bold text-on-surface mb-1">{{ form.etapeCourante.value.titre }}</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              <template v-if="form.etapeCourante.value.type === 'convention'">
                Veuillez prendre connaissance du document officiel lié à votre SGI.
              </template>
              <template v-else-if="form.etapeCourante.value.type === 'kyc'">
                Veuillez renseigner ces informations avec exactitude pour garantir la fluidité de votre certification.
              </template>
              <template v-else>
                Finalisez votre demande en signant numériquement votre dossier.
              </template>
            </p>
          </div>
          <v-spacer />
          <!-- Circular Progress (Top Right) -->
          <div class="d-flex align-center">
            <div class="text-right mr-4 d-none d-sm-block">
              <div class="text-caption font-weight-bold text-uppercase tracking-wider text-medium-emphasis">Complétion</div>
              <div class="text-h6 font-weight-bold">{{ form.progression.value }}%</div>
            </div>
            <v-progress-circular
              :model-value="form.progression.value"
              :color="form.progression.value >= 100 ? 'success' : 'primary'"
              size="48"
              width="5"
            />
          </div>
        </header>

        <!-- Alertes Globales -->
        <div class="px-8 pt-6" v-if="form.erreur.value || (form.detail.value.statut === 'REJETE' && form.detail.value.motif_rejet)">
          <v-alert v-if="form.erreur.value" type="error" variant="tonal" class="mb-0">
            {{ form.erreur.value }}
          </v-alert>
          <v-alert v-if="form.detail.value.statut === 'REJETE' && form.detail.value.motif_rejet" type="error" variant="tonal" class="mb-0 mt-4 border-l-4">
            <div class="font-weight-bold mb-1">Dossier rejeté — corrections demandées</div>
            {{ form.detail.value.motif_rejet }}
            <div class="text-caption mt-2">
              Seuls les champs accompagnés d'un retour de l'agent sont modifiables ;
              les autres sont verrouillés.
            </div>
          </v-alert>
        </div>

        <!-- Scrollable Content Area -->
        <div class="content-body flex-grow-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          
          <!-- CONTENU : CONVENTION -->
          <template v-if="form.etapeCourante.value.type === 'convention'">
            <DossierConvention :fiche="form.fiche.value" />
          </template>

          <!-- CONTENU : KYC (Champs Dynamiques) -->
          <template v-else-if="form.etapeCourante.value.type === 'kyc' && form.etapeCourante.value.kycIndex !== undefined">
            <v-row>
              <template v-for="champ in form.etapes.value[form.etapeCourante.value.kycIndex].champs" :key="champ.id">
                <v-col v-if="estVisible(champ.id)" cols="12" :md="getColSpan(champ.type)">
                  <DossierDynamicField 
                    :champ="champ"
                    :valeur="form.valeurs.value[champ.id]?.valeur ?? ''"
                    :fichier-url="form.valeurs.value[champ.id]?.fichier"
                    :fichier-date-capture="form.valeurs.value[champ.id]?.date_capture"
                    :fichier-empreinte="form.valeurs.value[champ.id]?.empreinte_sha256"
                    :commentaire-agent="form.valeurs.value[champ.id]?.commentaire_agent"
                    :est-corrige="form.valeurs.value[champ.id]?.est_corrige"
                    :verrouille="form.champVerrouille(champ)"
                    :dossier-id="dossierId"
                    :valeur-id="form.valeurs.value[champ.id]?.id"
                    @update:valeur="(v) => { form.valeurs.value[champ.id] = { ...form.valeurs.value[champ.id], champ: champ.id, valeur: v }; form.inscrireSauvegarde(champ.id) }"
                    @upload-fichier="(f) => form.surFichierSelectionne(champ, f)"
                    @ouvrir-fichier="ouvrirFichierValeur"
                  />
                </v-col>
              </template>
            </v-row>
          </template>

          <!-- CONTENU : VALIDATION FINALE -->
          <template v-else-if="form.etapeCourante.value.type === 'validation'">
            <DossierValidation 
              :dossier-id="dossierId"
              :fiche="form.fiche.value"
              :progression="form.progression.value"
              :est-signe="Boolean(form.detail.value.type_signature && form.detail.value.date_signature)"
              :peut-soumettre="form.estModifiable.value && form.progression.value >= 100 && Boolean(form.detail.value.type_signature && form.detail.value.date_signature) && (!form.conventionPubliee.value || form.detail.value.convention_acceptee)"
              :envoi-en-cours="form.envoiEnCours.value"
              @soumettre="soumettreFinal"
              @rafraichir-progression="form.rafraichirProgression"
            />
          </template>

        </div>

        <!-- Footer Action Bar -->
        <footer class="content-footer bg-surface border-t px-8 py-4 d-flex align-center">
          <template v-if="form.etapeCourante.value.type === 'convention'">
            <div class="text-caption text-medium-emphasis flex-grow-1">
              La convention tarifaire doit être acceptée pour continuer.
            </div>
            <v-btn
              v-if="!form.detail.value.convention_acceptee"
              color="primary"
              variant="flat"
              class="btn-principal px-6"
              :loading="form.envoiEnCours.value"
              @click="form.accepterConventionDossier"
            >
              <CheckCircle :size="16" class="mr-2" /> Accepter et Continuer
            </v-btn>
            <v-btn
              v-else
              color="primary"
              variant="tonal"
              class="btn-principal px-6"
              @click="form.etapeGlobaleActive.value++"
            >
              Étape suivante
            </v-btn>
          </template>
          
          <template v-else-if="form.etapeCourante.value.type === 'kyc'">
            <!-- Status Indicators for Saving -->
            <div class="d-flex align-center flex-grow-1 mr-4">
              <template v-if="Object.values(form.etatsSauvegarde.value).some(e => e === 'en_cours' || e === 'attente')">
                <v-progress-circular indeterminate size="16" width="2" color="primary" class="mr-2" />
                <span class="text-caption text-primary font-weight-medium">Sauvegarde en cours...</span>
              </template>
              <template v-else-if="Object.values(form.etatsSauvegarde.value).some(e => e === 'erreur')">
                <AlertCircle :size="16" class="text-error mr-2" />
                <span class="text-caption text-error font-weight-medium">Erreur lors de la sauvegarde</span>
              </template>
              <template v-else-if="Object.values(form.etatsSauvegarde.value).some(e => e === 'ok')">
                <CheckCircle :size="16" class="text-success mr-2" />
                <span class="text-caption text-success font-weight-medium">Toutes les modifications sont enregistrées</span>
              </template>
            </div>
            
            <v-btn
              color="primary"
              variant="flat"
              class="btn-principal px-6 shadow-sm"
              @click="form.etapeGlobaleActive.value++"
            >
              Continuer vers {{ form.etapeGlobaleActive.value === form.etapesGlobales.value.length - 2 ? 'la signature' : 'l\'étape suivante' }}
            </v-btn>
          </template>
        </footer>
      </template>

    </main>
  </div>
</template>

<style scoped>
.split-layout {
  display: flex;
  height: calc(100vh - 64px); /* Ajuster selon la hauteur de la navbar AppLayout */
  width: 100%;
  overflow: hidden;
  background-color: rgb(var(--v-theme-background));
}

.main-content {
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--v-theme-background), 0.8);
  z-index: 10;
  backdrop-filter: blur(4px);
}

.content-header {
  min-height: 100px;
}

.content-footer {
  min-height: 72px;
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.border-t {
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-wider {
  letter-spacing: 0.05em !important;
}

.btn-principal {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

/* Custom Scrollbar for Main Content */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(var(--v-theme-outline));
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

@media (max-width: 960px) {
  .split-layout {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 64px);
  }
  
  :deep(.sidebar) {
    width: 100% !important;
    height: auto !important;
    border-right: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  :deep(.vertical-stepper) {
    display: flex;
    overflow-x: auto;
    padding-bottom: 16px;
  }
  
  :deep(.step-item) {
    flex: 0 0 auto;
    width: 200px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  :deep(.step-connector) {
    display: none;
  }
}
</style>