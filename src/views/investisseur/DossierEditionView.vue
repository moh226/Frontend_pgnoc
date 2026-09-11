<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, RotateCcw } from '@lucide/vue'

import { useDossierForm } from '@/composables/useDossierForm'
import { soumettreDossier, ouvrirFichierValeurSurf as ouvrirFichierValeur } from '@/api/dossiers'
import { extraireErreurApi, extraireMessageErreur } from '@/api/client'

import DossierSidebar from '@/components/dossier/DossierSidebar.vue'
import DossierConvention from '@/components/dossier/DossierConvention.vue'
import DossierValidation from '@/components/dossier/DossierValidation.vue'
import DossierDynamicField from '@/components/dossier/DossierDynamicField.vue'
import DossierRecapitulatif from '@/components/dossier/DossierRecapitulatif.vue'

const route = useRoute()
const router = useRouter()

const dossierId = computed(() => String(route.params.id))

const form = useDossierForm(dossierId.value)

onMounted(() => {
  form.chargerDossier()
})

function quitterFormulaire() {
  router.replace({ name: 'investisseur-dossier-detail', params: { id: dossierId.value } })
}

async function soumettreFinal() {
  // Garde anti-double-clic : si une soumission est déjà en cours,
  // on ignore le second clic (évite le 409 « déjà soumis »).
  if (form.envoiEnCours.value) return

  form.envoiEnCours.value = true
  form.erreur.value = ''
  form.champsManquantsSoumission.value = []
  try {
    const sauvegardesOk = await form.viderSauvegardes()
    if (!sauvegardesOk) {
      form.erreur.value =
        "Certaines sauvegardes ont échoué : corrigez les champs en erreur avant de soumettre."
      return
    }
    await soumettreDossier(dossierId.value)
    router.push({ name: 'investisseur-dossier-detail', params: { id: dossierId.value } })
  } catch (cause) {
    const apiErreur = extraireErreurApi(cause)
    // Message plus clair si le dossier est déjà soumis (double-clic fréquent)
    if (apiErreur?.code === 'DOSSIER_NON_SOUMETTABLE') {
      const statut = apiErreur.statut_actuel
      if (statut === 'SOUMIS') {
        form.erreur.value = 'Ce dossier a déjà été soumis. Merci d\'attendre la réponse de la SGI.'
      } else {
        form.erreur.value = apiErreur.message
      }
      await form.rafraichirProgression()
    } else {
      form.erreur.value = apiErreur?.message ?? extraireMessageErreur(cause)
    }
    if (apiErreur?.champsManquants?.length) {
      form.champsManquantsSoumission.value = apiErreur.champsManquants
    }
  } finally {
    form.envoiEnCours.value = false
  }
}

// Navigation guidée depuis l'erreur de soumission : l'étape du premier
// champ manquant. Retombe sur l'étape courante si le code est inconnu.
function allerAuPremierChampManquant() {
  const premier = form.champsManquantsSoumission.value[0]
  if (premier) form.allerAuChamp(premier.code)
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

const restantsObligatoires = computed(() =>
  form.statistiquesEtapes.value.reduce((acc, s) => acc + (s.restants ?? 0), 0),
)

// État de l'étape KYC COURANTE (compteur + chip dans l'en-tête) : un
// simple texte « 3/3 » passait inaperçu.
const statsEtapeCourante = computed(() => {
  const kycIndex = form.etapeCourante.value?.kycIndex
  if (kycIndex === undefined) return null
  return form.statistiquesEtapes.value[kycIndex] ?? null
})

// Libellé du bouton de continuation : court, orienté action.
const libelleContinuer = computed(() => {
  if (form.etapeCouranteIncomplete.value) return 'Complétez les champs requis'
  const suivante = form.etapesGlobales.value[form.etapeGlobaleActive.value + 1]
  if (suivante?.type === 'recapitulatif') return 'Suivant'
  if (suivante?.type === 'validation') {
    return form.detail.value?.statut === 'REJETE' ? 'Résoumettre' : 'Soumettre'
  }
  return 'Suivant'
})
</script>

<template>
  <div class="split-layout">
    <DossierSidebar 
      :etapesGlobales="form.etapesGlobales.value"
      :etapeGlobaleActive="form.etapeGlobaleActive.value"
      :statistiques-etapes="form.statistiquesEtapes.value"
      @quitter="quitterFormulaire"
      @changer-etape="index => form.etapeGlobaleActive.value = index"
    />

    <main class="main-content bg-background d-flex flex-column position-relative">
      <!-- Loading Overlay -->
      <div v-if="form.chargement.value" class="loading-overlay d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="64" width="6" />
      </div>

      <!-- Échec de chargement : message visible + actions (plus jamais de page blanche) -->
      <div v-else-if="!form.detail.value || !form.etapeCourante.value" class="flex-grow-1 d-flex align-center justify-center pa-8">
        <div class="text-center" style="max-width: 460px;">
          <v-avatar color="error" variant="tonal" size="64" class="mb-4">
            <AlertCircle :size="32" />
          </v-avatar>
          <h2 class="text-h6 font-display font-weight-bold mb-2">Impossible de charger le dossier</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">
            {{ form.erreur.value || 'Une erreur est survenue lors du chargement du dossier.' }}
          </p>
          <div class="d-flex justify-center ga-3">
            <v-btn color="primary" variant="flat" @click="form.chargerDossier()">
              <RotateCcw :size="16" class="mr-2" /> Réessayer
            </v-btn>
            <v-btn variant="text" @click="quitterFormulaire">Retour au dossier</v-btn>
          </div>
        </div>
      </div>

      <template v-else-if="form.detail.value && form.etapeCourante.value">
        <!-- Header de la zone de contenu -->
         <header class="content-header px-8 py-6 border-b d-flex align-center bg-surface">
          <div>
            <h1 class="text-h4 font-display font-weight-bold text-on-surface mb-1">{{ form.etapeCourante.value.titre }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              <template v-if="form.etapeCourante.value.type === 'convention'">
                Veuillez prendre connaissance du document officiel lié à votre SGI.
              </template>
              <template v-else-if="form.etapeCourante.value.type === 'kyc'">
              </template>
              <template v-else-if="form.etapeCourante.value.type === 'recapitulatif'">
                Parcourez vos réponses étape par étape, corrigez si besoin, puis confirmez pour
                {{ form.detail.value.statut === 'REJETE' ? 'resoumettre' : 'signer' }} votre dossier.
              </template>
              <template v-else>
                Finalisez votre demande en signant numériquement votre dossier.
              </template>
            </p>
            <!-- État de l'étape courante : compteur + chip (la barre est
                 inutile — la complétion globale est déjà en haut à
                 droite, et le chip dit l'essentiel). -->
            <div v-if="statsEtapeCourante" class="step-progress mt-3">
              <div class="d-flex align-center flex-wrap ga-3 step-progress-inner">
                <span class="text-body-2 font-weight-bold text-nowrap">
                  {{ statsEtapeCourante.completes }} / {{ statsEtapeCourante.total }} champs renseignés
                </span>
                <v-chip
                  v-if="!statsEtapeCourante.restants"
                  size="small"
                  color="success"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  <CheckCircle :size="16" class="mr-1" />
                  Étape complète
                </v-chip>
                <v-chip v-else size="small" color="warning" variant="tonal" class="font-weight-bold">
                  <AlertCircle :size="16" class="mr-1" />
                  {{ statsEtapeCourante.restants }}
                  obligatoire{{ statsEtapeCourante.restants > 1 ? 's' : '' }} restant{{ statsEtapeCourante.restants > 1 ? 's' : '' }}
                </v-chip>
              </div>
            </div>
          </div>
          <v-spacer />
          <!-- Circular Progress (Top Right) -->
          <div class="d-flex align-center">
            <div class="text-right mr-4 d-none d-sm-block">
              <div class="text-body-2 font-weight-bold text-uppercase tracking-wider text-medium-emphasis">Complétion</div>
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
        <div class="px-8 pt-6" v-if="form.erreur.value || (form.detail.value.statut === 'REJETE' && form.champsCommentes.value.length)">
          <v-alert v-if="form.erreur.value" type="error" variant="tonal" class="mb-0">
            <div class="d-flex align-center flex-wrap ga-2">
              <div class="flex-grow-1">{{ form.erreur.value }}</div>
              <v-btn
                v-if="form.champsManquantsSoumission.value.length"
                size="small"
                color="error"
                variant="tonal"
                class="text-none font-weight-bold"
                @click="allerAuPremierChampManquant"
              >
                <ArrowRight :size="16" class="mr-1" />
                Aller au champ manquant
              </v-btn>
            </div>
          </v-alert>

          <!-- Rejet : la demande de correction de l'agent, champ par champ.
               Chaque entrée est cliquable et mène directement à l'étape
               concernée — l'investisseur voit QUOI corriger et POURQUOI
               sans parcourir tout le formulaire. -->
          <v-alert
            v-if="form.detail.value.statut === 'REJETE' && form.champsCommentes.value.length"
            type="warning"
            variant="tonal"
            class="mb-0 mt-4 border-l-4"
          >
            <div class="font-weight-bold mb-1">
              <v-icon icon="mdi-comment-processing-outline" size="small" class="mr-1" />
              {{
                form.champsCommentes.value.length === 1
                  ? '1 correction demandée par la SGI'
                  : `${form.champsCommentes.value.length} corrections demandées par la SGI`
              }}
            </div>
            <div v-if="form.detail.value.motif_rejet" class="text-body-2 mb-2">
              {{ form.detail.value.motif_rejet }}
            </div>
            <v-list density="compact" class="bg-transparent pa-0" lines="two">
              <v-list-item
                v-for="champ in form.champsCommentes.value"
                :key="champ.id"
                class="px-2 rounded-lg pointer"
                @click="form.allerAuChamp(champ.code)"
              >
                <template #prepend>
                  <v-icon icon="mdi-arrow-right-circle-outline" size="small" color="warning" class="mr-2" />
                </template>
                <v-list-item-title class="text-body-2 font-weight-bold">{{ champ.nom }}</v-list-item-title>
                <v-list-item-subtitle class="text-wrap">
                  « {{ form.valeurs.value[champ.id]?.commentaire_agent }} »
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
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
                    :motif-verrouillage="form.motifVerrouillage(champ)"
                    :note-edition="form.noteEdition(champ)"
                    :dossier-id="dossierId"
                    :valeur-id="form.valeurs.value[champ.id]?.id"
                    @update:valeur="(v) => { if (form.champVerrouille(champ)) return; const existing = form.valeurs.value[champ.id] || { champ: champ.id }; form.valeurs.value[champ.id] = { ...existing, champ: champ.id, valeur: v }; form.inscrireSauvegarde(champ.id) }"
                    @upload-fichier="(f) => form.surFichierSelectionne(champ, f)"
                    @ouvrir-fichier="ouvrirFichierValeur"
                  />
                </v-col>
              </template>
            </v-row>
          </template>

          <!-- CONTENU : RÉCAPITULATIF (relecture structurée avant transmission) -->
          <template v-else-if="form.etapeCourante.value.type === 'recapitulatif'">
            <DossierRecapitulatif
              :etapes="form.etapes.value"
              :valeurs="form.valeurs.value"
              :champ-verrouille="form.champVerrouille"
              @corriger="(champ) => form.allerAuChamp(champ.code)"
            />
          </template>

          <!-- CONTENU : VALIDATION FINALE -->
          <template v-else-if="form.etapeCourante.value.type === 'validation'">
            <v-alert
              v-if="form.detail.value.statut === 'REJETE' && (form.progression.value < 100 || !form.conventionAJour.value)"
              type="warning"
              variant="tonal"
              class="mb-6 border-l-4"
            >
              <div class="font-weight-bold">Le bouton « Résoumettre » s'activera une fois que :</div>
              <ul class="mb-0 mt-2 pl-4">
                <li v-if="form.progression.value < 100">
                  tous les champs obligatoires sont renseignés — il en reste
                  {{ restantsObligatoires }} dans les étapes KYC. Les champs verrouillés déjà
                  remplis restent affichés, sans modification possible.
                </li>
                <li v-if="!form.conventionAJour.value">
                  la convention tarifaire est (de nouveau) acceptée dans sa version actuelle —
                  revenez à l'étape « Convention Tarifaire » et acceptez-la.
                </li>
              </ul>
            </v-alert>

            <DossierValidation
              :dossier-id="dossierId"
              :fiche="form.fiche.value"
              :progression="form.progression.value"
              :est-signe="Boolean(form.detail.value.type_signature && form.detail.value.date_signature)"
              :signature-obligatoire="form.detail.value.statut !== 'REJETE'"
              :resoumission="form.detail.value.statut === 'REJETE'"
              :peut-soumettre="form.estModifiable.value && form.progression.value >= 100 && (form.detail.value.statut === 'REJETE' || Boolean(form.detail.value.type_signature && form.detail.value.date_signature)) && form.conventionAJour.value"
              :envoi-en-cours="form.envoiEnCours.value"
              @soumettre="soumettreFinal"
              @rafraichir-progression="form.rafraichirProgression"
            />
          </template>

        </div>

        <!-- Footer Action Bar -->
        <footer class="content-footer bg-surface border-t px-8 py-4 d-flex align-center">
          <template v-if="form.etapeCourante.value.type === 'convention'">
            <div class="text-body-2 text-medium-emphasis flex-grow-1">
              <template v-if="!form.conventionAJour.value">
                La convention tarifaire doit être (ré)acceptée pour continuer — la SGI en a publié une nouvelle version.
              </template>
              <template v-else>
                La convention a été acceptée : vous pouvez poursuivre la saisie.
              </template>
            </div>
            <v-btn
              v-if="!form.conventionAJour.value"
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
                <span class="text-body-2 text-primary font-weight-medium">Sauvegarde en cours...</span>
              </template>
              <template v-else-if="Object.values(form.etatsSauvegarde.value).some(e => e === 'erreur')">
                <AlertCircle :size="16" class="text-error mr-2" />
                <span class="text-body-2 text-error font-weight-medium">Erreur lors de la sauvegarde</span>
              </template>
              <template v-else-if="Object.values(form.etatsSauvegarde.value).some(e => e === 'ok')">
                <CheckCircle :size="16" class="text-success mr-2" />
                <span class="text-body-2 text-success font-weight-medium">Toutes les modifications sont enregistrées</span>
              </template>
            </div>

            <div class="d-flex align-center justify-between gap-3">
              <v-btn
                v-if="form.etapeGlobaleActive.value > (form.conventionPubliee.value ? 1 : 0)"
                variant="text"
                class="text-primary font-weight-bold"
                @click="form.etapeGlobaleActive.value--"
              >
                <ArrowLeft :size="16" class="mr-1" /> Précédent
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="btn-principal px-6 shadow-sm"
                :disabled="form.etapeCouranteIncomplete.value"
                @click="form.continuerEtape"
              >
                {{ libelleContinuer }}
              </v-btn>
            </div>
          </template>

          <!-- Récapitulatif : confirmation explicite avant signature /
               résoumission — le flux demandé : vérifier → confirmer →
               transmettre. -->
          <template v-else-if="form.etapeCourante.value.type === 'recapitulatif'">
            <div class="d-flex align-center justify-between gap-3">
              <v-btn
                variant="text"
                class="text-primary font-weight-bold"
                @click="form.etapeGlobaleActive.value--"
              >
                <ArrowLeft :size="16" class="mr-1" /> Précédent
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="btn-principal px-6 shadow-sm"
                @click="form.etapeGlobaleActive.value++"
              >
                <CheckCircle :size="16" class="mr-2" />
                {{ form.detail.value.statut === 'REJETE' ? 'Résoumettre' : 'Soumettre' }}
              </v-btn>
            </div>
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

.step-progress {
  display: flex;
}

.step-progress-inner {
  row-gap: 8px;
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

.pointer {
  cursor: pointer;
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

@media (max-width: 600px) {
  .content-header {
    min-height: 0 !important;
    padding: 16px !important;
    flex-wrap: wrap;
    gap: 12px;
  }

  .content-header h1 {
    font-size: 1.25rem !important;
  }

  .content-body {
    padding: 16px !important;
  }

  .content-footer {
    min-height: 0 !important;
    padding: 12px 16px !important;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
