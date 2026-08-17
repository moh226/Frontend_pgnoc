<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Check, CheckCircle, FileSignature, FileText, KeyRound, Send, ShieldCheck, DownloadCloud } from '@lucide/vue'

import CaptureSelfieField from '@/components/CaptureSelfieField.vue'

import {
  accepterConvention,
  detailDossier,
  enregistrerValeur,
  etapesKyc,
  genererOtp,
  signerDossier,
  soumettreDossier,
  televerserFichier,
  ouvrirFichierValeur,
} from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { ficheSgi } from '@/api/sgi'
import type { ChampKyc, EtapeKyc, FicheSgi, ValeurChamp } from '@/types'
import { formaterDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))

const detail = ref<Awaited<ReturnType<typeof detailDossier>> | null>(null)
const etapes = ref<EtapeKyc[]>([])
const fiche = ref<FicheSgi | null>(null)

const valeurs = ref<Record<string, ValeurChamp>>({})
const fichiers = ref<Record<string, File | null>>({})
const etatsSauvegarde = ref<Record<string, 'attente' | 'en_cours' | 'ok' | 'erreur'>>({})
const debounces = new Map<string, number>()
const sauvegardesEnCours = new Set<Promise<void>>()

const chargement = ref(false)
const erreur = ref('')
const envoiEnCours = ref(false)

// --- Signature OTP ---
const dialogSignature = ref(false)
const codeOtpGenere = ref<string | null>(null)
const expirationOtp = ref<string | null>(null)
const saisieOtp = ref('')
const otpEnCours = ref(false)
const erreurOtp = ref('')
const signaturePosee = ref(false)

const estModifiable = computed(() => {
  const statut = detail.value?.statut
  return statut === 'BROUILLON' || statut === 'REJETE'
})

const conventionPubliée = computed(() => Boolean(fiche.value?.convention.titre))

const progression = computed(() => detail.value?.progression_pct ?? 0)

const estSigne = computed(() => {
  return signaturePosee.value || Boolean(
    detail.value?.type_signature && detail.value?.date_signature
  )
})

const peutSoumettre = computed(
  () =>
    estModifiable.value &&
    progression.value >= 100 &&
    estSigne.value &&
    (!conventionPubliée.value || detail.value?.convention_acceptee),
)

function valeurBrute(champ: ChampKyc): string {
  return valeurs.value[champ.id]?.valeur ?? ''
}

function estVisible(champ: ChampKyc): boolean {
  if (!champ.champ_parent) return true
  const parent = valeurs.value[champ.champ_parent]
  return parent?.valeur === champ.valeur_declencheur
}

function champVerrouille(champ: ChampKyc): boolean {
  return detail.value?.statut === 'REJETE' && !valeurs.value[champ.id]?.commentaire_agent
}

function choixMultiples(champ: ChampKyc): string[] {
  const brute = valeurBrute(champ)
  if (!brute) return []
  try {
    const liste = JSON.parse(brute)
    return Array.isArray(liste) ? liste : []
  } catch {
    return []
  }
}

function optionsChoix(champ: ChampKyc): string[] {
  const brute = champ.options_choix
  if (!brute) return []
  try {
    const liste = JSON.parse(brute)
    return Array.isArray(liste) ? liste : []
  } catch {
    return []
  }
}

function inscrireSauvegarde(champId: string) {
  const champ = tousChamps.value.find((c) => c.id === champId)
  if (champ && champVerrouille(champ)) return
  etatsSauvegarde.value[champId] = 'attente'
  const precedent = debounces.get(champId)
  if (precedent !== undefined) window.clearTimeout(precedent)
  debounces.set(
    champId,
    window.setTimeout(() => {
      debounces.delete(champId)
      void sauvegarderValeur(champId)
    }, 500),
  )
}

async function sauvegarderValeur(champId: string) {
  const champ = tousChamps.value.find((c) => c.id === champId)
  if (!champ) return
  const valeur = valeurs.value[champ.id]
  if (!valeur) return
  if (etatsSauvegarde.value[champId] === 'en_cours') return

  const saisie = valeur.valeur ?? ''
  etatsSauvegarde.value[champId] = 'en_cours'
  const tache = (async () => {
    try {
      await enregistrerValeur(id.value, champId, saisie)
      await rafraichirProgression()
      etatsSauvegarde.value[champId] =
        (valeurs.value[champ.id]?.valeur ?? '') === saisie ? 'ok' : 'attente'
      if (etatsSauvegarde.value[champId] === 'attente') {
        void sauvegarderValeur(champId)
      }
    } catch (cause) {
      etatsSauvegarde.value[champId] = 'erreur'
      erreur.value = extraireMessageErreur(cause)
    }
  })()
  sauvegardesEnCours.add(tache)
  void tache.finally(() => sauvegardesEnCours.delete(tache))
}

async function viderSauvegardes() {
  for (const champId of [...debounces.keys()]) {
    window.clearTimeout(debounces.get(champId))
    debounces.delete(champId)
    void sauvegarderValeur(champId)
  }
  for (let essai = 0; essai < 30 && sauvegardesEnCours.size > 0; essai++) {
    await Promise.allSettled([...sauvegardesEnCours])
  }
}

const tousChamps = computed(() => etapes.value.flatMap((e) => e.champs))

async function surFichierSelectionne(champ: ChampKyc, fichier: File | null) {
  if (champVerrouille(champ)) return
  fichiers.value[champ.id] = fichier
  if (!fichier) return
  etatsSauvegarde.value[champ.id] = 'en_cours'
  erreur.value = ''
  const tache = (async () => {
    try {
      const reponse = await televerserFichier(id.value, champ.id, fichier)
      valeurs.value[champ.id] = {
        id: reponse.id,
        champ: champ.id,
        valeur: null,
        fichier: reponse.url_signee,
        empreinte_sha256: reponse.empreinte_sha256 ?? null,
        signature_serveur: null,
        date_capture: reponse.date_capture ?? null,
        commentaire_agent: null,
        est_corrige: false,
        date_maj: new Date().toISOString(),
      }
      etatsSauvegarde.value[champ.id] = 'ok'
      await rafraichirProgression()
    } catch (cause) {
      etatsSauvegarde.value[champ.id] = 'erreur'
      fichiers.value[champ.id] = null
      erreur.value = extraireMessageErreur(cause)
    }
  })()
  sauvegardesEnCours.add(tache)
  void tache.finally(() => sauvegardesEnCours.delete(tache))
}

async function rafraichirProgression() {
  try {
    detail.value = await detailDossier(id.value)
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  }
}

async function accepterConventionDossier() {
  envoiEnCours.value = true
  erreur.value = ''
  try {
    await accepterConvention(id.value)
    await rafraichirProgression()
    etapeGlobaleActive.value++
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    envoiEnCours.value = false
  }
}

async function ouvrirSignature() {
  erreurOtp.value = ''
  saisieOtp.value = ''
  codeOtpGenere.value = null
  expirationOtp.value = null
  otpEnCours.value = true
  dialogSignature.value = true
  try {
    const reponse = await genererOtp(id.value)
    codeOtpGenere.value = reponse.code
    expirationOtp.value = reponse.expiration
  } catch (cause) {
    erreurOtp.value = extraireMessageErreur(cause)
  } finally {
    otpEnCours.value = false
  }
}

async function validerSignature() {
  if (!saisieOtp.value.trim()) return
  otpEnCours.value = true
  erreurOtp.value = ''
  try {
    await signerDossier(id.value, saisieOtp.value.trim())
    signaturePosee.value = true
    await rafraichirProgression()
  } catch (cause) {
    erreurOtp.value = extraireMessageErreur(cause)
  } finally {
    otpEnCours.value = false
  }
}

async function soumettre() {
  envoiEnCours.value = true
  erreur.value = ''
  try {
    await viderSauvegardes()
    await soumettreDossier(id.value)
    await router.push({ name: 'investisseur-dossier-detail', params: { id: id.value } })
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    envoiEnCours.value = false
  }
}

function revenir() {
  router.push({ name: 'investisseur-dossier-detail', params: { id: id.value } })
}

// --- Navigation Globale (Split Screen) ---

const etapeGlobaleActive = ref(0)

interface GlobalStep {
  id: string
  titre: string
  sousTitre?: string
  type: 'convention' | 'kyc' | 'validation'
  kycIndex?: number
}

const etapesGlobales = computed<GlobalStep[]>(() => {
  const list: GlobalStep[] = []
  if (conventionPubliée.value) {
    list.push({
      id: 'convention',
      titre: 'Convention Tarifaire',
      sousTitre: 'Conditions Générales',
      type: 'convention'
    })
  }
  for (let i = 0; i < etapes.value.length; i++) {
    const kycStep = etapes.value[i]
    list.push({
      id: kycStep.id,
      titre: kycStep.nom,
      sousTitre: `Étape ${kycStep.ordre}`,
      type: 'kyc',
      kycIndex: i
    })
  }
  list.push({
    id: 'validation',
    titre: 'Validation Finale',
    sousTitre: 'Signature & Soumission',
    type: 'validation'
  })
  return list
})

const etapeCourante = computed(() => etapesGlobales.value[etapeGlobaleActive.value] || null)

// Initialiser l'étape globale correcte au chargement
onMounted(async () => {
  chargement.value = true
  erreur.value = ''
  try {
    const detailCharge = await detailDossier(id.value)
    detail.value = detailCharge
    const [reponseEtapes, reponseFiche] = await Promise.all([
      etapesKyc(detailCharge.sgi),
      ficheSgi(detailCharge.sgi),
    ])
    fiche.value = reponseFiche
    etapes.value = reponseEtapes.results
    for (const valeur of detailCharge.valeurs_champs) {
      valeurs.value[valeur.champ] = valeur
    }

    // Calculer la première étape incomplète
    let currentGlobalIndex = 0
    if (conventionPubliée.value && !detailCharge.convention_acceptee) {
      currentGlobalIndex = 0
    } else {
      // Trouver l'étape KYC où on s'est arrêté (en fonction de detailCharge.etape_courante)
      let kycIndex = 0
      if (detailCharge.etape_courante) {
        kycIndex = etapes.value.findIndex((e) => e.id === detailCharge.etape_courante)
        if (kycIndex === -1) kycIndex = 0
      }
      
      const convOffset = conventionPubliée.value ? 1 : 0
      currentGlobalIndex = convOffset + kycIndex
      
      // Si la progression est à 100%, aller directement à la validation finale
      if (detailCharge.progression_pct >= 100) {
        currentGlobalIndex = etapesGlobales.value.length - 1
      }
    }
    etapeGlobaleActive.value = currentGlobalIndex

  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
})

function etapeSuivante() {
  if (etapeGlobaleActive.value < etapesGlobales.value.length - 1) {
    etapeGlobaleActive.value++
  }
}

function etapePrecedente() {
  if (etapeGlobaleActive.value > 0) {
    etapeGlobaleActive.value--
  }
}

// Fonction utilitaire pour le layout des champs
function getColSpan(type: string): number {
  if (['TEXTE_LONG', 'FICHIER', 'SELFIE', 'CHOIX_MULTIPLE'].includes(type)) return 12
  return 6 // TEXTE_COURT, NOMBRE, DATE, BOOLEEN, CHOIX_UNIQUE prennent 50% de la largeur
}
</script>

<template>
  <div class="split-layout">
    <!-- Panneau Gauche (Progression & Réassurance) -->
    <aside class="sidebar bg-slate-900 d-flex flex-column">
      <div class="pa-6 border-b border-white-10">
        <v-btn variant="text" class="text-white hover-lift px-0 text-body-2 font-weight-medium" @click="revenir">
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
            @click="i < etapeGlobaleActive ? (etapeGlobaleActive = i) : null"
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

    <!-- Panneau Droit (Contenu du Formulaire) -->
    <main class="main-content bg-background d-flex flex-column position-relative">
      <!-- Loading Overlay -->
      <div v-if="chargement" class="loading-overlay d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="64" width="6" />
      </div>

      <template v-else-if="detail && etapeCourante">
        <!-- Header de la zone de contenu -->
        <header class="content-header px-8 py-6 border-b d-flex align-center bg-surface">
          <div>
            <h1 class="text-h4 font-display font-weight-bold text-on-surface mb-1">{{ etapeCourante.titre }}</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              <template v-if="etapeCourante.type === 'convention'">
                Veuillez prendre connaissance du document officiel lié à votre SGI.
              </template>
              <template v-else-if="etapeCourante.type === 'kyc'">
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
              <div class="text-h6 font-weight-bold">{{ progression }}%</div>
            </div>
            <v-progress-circular
              :model-value="progression"
              :color="progression >= 100 ? 'success' : 'primary'"
              size="48"
              width="5"
            />
          </div>
        </header>

        <!-- Alertes Globales -->
        <div class="px-8 pt-6" v-if="erreur || (detail.statut === 'REJETE' && detail.motif_rejet)">
          <v-alert v-if="erreur" type="error" variant="tonal" class="mb-0">
            {{ erreur }}
          </v-alert>
          <v-alert v-if="detail.statut === 'REJETE' && detail.motif_rejet" type="error" variant="tonal" class="mb-0 mt-4 border-l-4">
            <div class="font-weight-bold mb-1">Dossier rejeté — corrections demandées</div>
            {{ detail.motif_rejet }}
            <div class="text-caption mt-2">
              Seuls les champs accompagnés d'un retour de l'agent sont modifiables ;
              les autres sont verrouillés.
            </div>
          </v-alert>
        </div>

        <!-- Scrollable Content Area -->
        <div class="content-body flex-grow-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          
          <!-- CONTENU : CONVENTION -->
          <template v-if="etapeCourante.type === 'convention'">
            <div class="pdf-container rounded-xl elevation-2">
              <iframe 
                v-if="fiche?.convention?.fichier_url"
                :src="fiche.convention.fichier_url" 
                class="pdf-iframe" 
                title="Prévisualisation Convention"
              ></iframe>
              <div v-else class="pdf-placeholder d-flex flex-column align-center justify-center bg-surface-variant">
                <FileText :size="48" class="text-medium-emphasis mb-4" />
                <h3 class="text-h6 font-weight-medium mb-2">Aperçu indisponible</h3>
                <p class="text-body-2 text-medium-emphasis mb-0">La SGI n'a pas joint de fichier lisible.</p>
              </div>
            </div>
          </template>

          <!-- CONTENU : KYC (Champs Dynamiques) -->
          <template v-else-if="etapeCourante.type === 'kyc' && etapeCourante.kycIndex !== undefined">
            <v-row>
              <template v-for="champ in etapes[etapeCourante.kycIndex].champs" :key="champ.id">
                <v-col v-if="estVisible(champ)" cols="12" :md="getColSpan(champ.type)">
                  
                  <!-- Labels élégants -->
                  <div class="text-caption font-weight-bold text-uppercase tracking-wider text-medium-emphasis mb-2 d-flex align-center">
                    {{ champ.nom }}
                    <span v-if="champ.obligatoire" class="text-error ml-1">*</span>
                    <v-icon v-if="champVerrouille(champ)" icon="mdi-lock-outline" size="small" class="ml-1 text-medium-emphasis" />
                  </div>

                  <!-- Champs Textes Courts -->
                  <v-text-field
                    v-if="champ.type === 'TEXTE_COURT'"
                    :model-value="valeurBrute(champ)"
                    :hint="champ.justification"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    class="premium-input"
                    placeholder="Saisissez votre réponse"
                    :readonly="champVerrouille(champ)"
                    @update:model-value="(v: string) => { valeurs[champ.id] = { ...valeurs[champ.id], champ: champ.id, valeur: v }; inscrireSauvegarde(champ.id) }"
                  />

                  <!-- Champs Nombres -->
                  <v-text-field
                    v-else-if="champ.type === 'NOMBRE'"
                    :model-value="valeurBrute(champ)"
                    :hint="champ.justification"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    class="premium-input"
                    :readonly="champVerrouille(champ)"
                    @update:model-value="(v: string) => { valeurs[champ.id] = { ...valeurs[champ.id], champ: champ.id, valeur: v }; inscrireSauvegarde(champ.id) }"
                  />

                  <!-- Champs Dates -->
                  <v-text-field
                    v-else-if="champ.type === 'DATE'"
                    :model-value="valeurBrute(champ)"
                    :hint="champ.justification"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    type="date"
                    class="premium-input"
                    :readonly="champVerrouille(champ)"
                    @update:model-value="(v: string) => { valeurs[champ.id] = { ...valeurs[champ.id], champ: champ.id, valeur: v }; inscrireSauvegarde(champ.id) }"
                  />

                  <!-- Champs Textes Longs -->
                  <v-textarea
                    v-else-if="champ.type === 'TEXTE_LONG'"
                    :model-value="valeurBrute(champ)"
                    :hint="champ.justification"
                    persistent-hint
                    variant="outlined"
                    rows="4"
                    class="premium-input"
                    :readonly="champVerrouille(champ)"
                    @update:model-value="(v: string) => { valeurs[champ.id] = { ...valeurs[champ.id], champ: champ.id, valeur: v }; inscrireSauvegarde(champ.id) }"
                  />

                  <!-- Choix Unique (Select au lieu de radio pour le côté premium) -->
                  <v-select
                    v-else-if="champ.type === 'CHOIX_UNIQUE'"
                    :model-value="valeurBrute(champ)"
                    :items="optionsChoix(champ)"
                    :hint="champ.justification"
                    persistent-hint
                    variant="outlined"
                    density="comfortable"
                    class="premium-input"
                    :readonly="champVerrouille(champ)"
                    @update:model-value="(v: string | null) => { valeurs[champ.id] = { ...valeurs[champ.id], champ: champ.id, valeur: v ?? '' }; inscrireSauvegarde(champ.id) }"
                  />

                  <!-- Booléen (Switch premium) -->
                  <v-switch
                    v-else-if="champ.type === 'BOOLEEN'"
                    :model-value="valeurBrute(champ) === 'oui'"
                    :label="champ.justification || 'Oui / Non'"
                    color="primary"
                    inset
                    class="mt-0 premium-switch"
                    :disabled="champVerrouille(champ)"
                    @update:model-value="(v: boolean | null) => { valeurs[champ.id] = { ...valeurs[champ.id], champ: champ.id, valeur: v ? 'oui' : 'non' }; inscrireSauvegarde(champ.id) }"
                  />

                  <!-- Choix Multiple -->
                  <div v-else-if="champ.type === 'CHOIX_MULTIPLE'" class="premium-checkbox-group bg-surface-variant rounded-lg pa-4">
                    <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-3">{{ champ.justification }}</p>
                    <v-checkbox
                      v-for="option in optionsChoix(champ)"
                      :key="option"
                      :label="option"
                      :model-value="choixMultiples(champ).includes(option)"
                      color="primary"
                      density="compact"
                      hide-details
                      class="mb-2"
                      :disabled="champVerrouille(champ)"
                      @update:model-value="(c: boolean | null) => {
                        const actuelles = choixMultiples(champ)
                        const nouvelles = c ? [...actuelles, option] : actuelles.filter((o) => o !== option)
                        valeurs[champ.id] = { ...valeurs[champ.id], champ: champ.id, valeur: JSON.stringify(nouvelles) }
                        inscrireSauvegarde(champ.id)
                      }"
                    />
                  </div>

                  <!-- Selfie de preuve de vie (capture caméra contrainte) -->
                  <div v-else-if="champ.type === 'SELFIE'">
                    <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-3">{{ champ.justification }}</p>

                    <!-- Selfie déjà enregistré -->
                    <div v-if="valeurs[champ.id]?.fichier" class="uploaded-file-card d-flex align-center pa-4 rounded-lg mb-3 bg-surface border">
                      <img
                        :src="valeurs[champ.id].fichier ?? undefined"
                        alt="Votre selfie de vérification"
                        class="selfie-thumb mr-4"
                        @click="ouvrirFichierValeur(id, valeurs[champ.id].id)"
                      />
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-bold d-flex align-center">
                          <CheckCircle :size="16" class="mr-2 text-success" /> Selfie de vérification enregistré
                        </div>
                        <div class="text-caption text-medium-emphasis mt-1">
                          Capturé le {{ formaterDate(valeurs[champ.id].date_capture) }} · horodaté et signé côté serveur
                        </div>
                      </div>
                      <v-btn v-if="!champVerrouille(champ)" size="small" variant="text" color="primary" @click="valeurs[champ.id].fichier = null">
                        Reprendre
                      </v-btn>
                    </div>

                    <!-- Capture caméra (aucun upload de fichier existant) -->
                    <CaptureSelfieField
                      v-else
                      :verrouille="champVerrouille(champ)"
                      @capturee="(page: File) => surFichierSelectionne(champ, page)"
                    />
                  </div>

                  <!-- Fichiers -->
                  <div v-else-if="champ.type === 'FICHIER'">
                    <p v-if="champ.justification" class="text-caption text-medium-emphasis mb-3">{{ champ.justification }}</p>
                    
                    <!-- Fichier Déjà Uploadé -->
                    <div v-if="valeurs[champ.id]?.fichier" class="uploaded-file-card d-flex align-center pa-4 rounded-lg mb-3 bg-surface border">
                      <div class="icon-box bg-success-lighten-5 text-success rounded-circle d-flex align-center justify-center mr-4" style="width: 40px; height: 40px;">
                        <CheckCircle :size="20" />
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-bold">Document enregistré</div>
                        <a
                          href="#"
                          @click.prevent="ouvrirFichierValeur(id, valeurs[champ.id].id)"
                          class="text-caption text-primary text-decoration-none hover-underline"
                        >
                          Voir le document actuel
                        </a>
                      </div>
                      <v-btn v-if="!champVerrouille(champ)" size="small" variant="text" color="primary" @click="valeurs[champ.id].fichier = null">
                        Remplacer
                      </v-btn>
                    </div>

                    <!-- Zone de Dépôt / Input -->
                    <v-file-input
                      v-else
                      :model-value="fichiers[champ.id]"
                      :accept="champ.formats_acceptes.split(',').map((f) => '.' + f.trim()).join(',')"
                      variant="outlined"
                      class="premium-file-input"
                      prepend-icon=""
                      :disabled="champVerrouille(champ)"
                      @update:model-value="(f: File | File[]) => surFichierSelectionne(champ, Array.isArray(f) ? f[0] ?? null : f)"
                    >
                      <template v-slot:prepend-inner>
                        <div class="d-flex flex-column align-center justify-center w-100 py-6 text-center" style="cursor: pointer;">
                          <div class="upload-icon-wrapper bg-surface-variant rounded-circle d-flex align-center justify-center mb-3">
                            <DownloadCloud :size="24" class="text-primary" />
                          </div>
                          <div class="text-body-1 font-weight-medium text-on-surface">Téléverser votre document</div>
                          <div class="text-caption text-medium-emphasis mt-1">
                            Cliquez ou glissez-déposez ici.<br>
                            Formats : {{ champ.formats_acceptes }} (Max {{ champ.taille_max_mo }}MB)
                          </div>
                        </div>
                      </template>
                    </v-file-input>
                  </div>

                  <!-- Commentaire Agent -->
                  <v-alert
                    v-if="valeurs[champ.id]?.commentaire_agent"
                    type="warning"
                    variant="tonal"
                    class="mt-2 border-l-4"
                  >
                    <div class="text-caption font-weight-bold text-uppercase tracking-wider mb-1">Retour de l'agent</div>
                    {{ valeurs[champ.id].commentaire_agent }}
                  </v-alert>

                  <!-- Champ verrouillé (rejet : non signalé par l'agent) -->
                  <div
                    v-if="champVerrouille(champ)"
                    class="text-caption text-medium-emphasis mt-1 d-flex align-center"
                  >
                    <v-icon icon="mdi-lock-outline" size="small" class="mr-1" />
                    Verrouillé — seuls les champs signalés par l'agent sont corrigeables après rejet.
                  </div>
                </v-col>
              </template>
            </v-row>
          </template>

          <!-- CONTENU : VALIDATION FINALE -->
          <template v-else-if="etapeCourante.type === 'validation'">
            <div class="d-flex flex-column align-center justify-center py-12 text-center">
              <div class="bg-primary-lighten-5 text-primary rounded-circle pa-6 mb-6">
                <FileSignature :size="48" />
              </div>
              <h2 class="text-h5 font-weight-bold mb-4">Prêt à soumettre votre dossier ?</h2>
              <p class="text-body-1 text-medium-emphasis max-w-md mx-auto mb-8">
                Vous avez complété à 100% les étapes requises. Afin de garantir l'authenticité de votre démarche, une signature électronique par code OTP est nécessaire avant la transmission à la SGI « {{ fiche?.nom }} ».
              </p>
              
              <v-btn
                v-if="!estSigne"
                color="warning"
                variant="flat"
                size="x-large"
                class="btn-principal shadow-lg"
                :disabled="progression < 100 || (!conventionPubliée || !detail?.convention_acceptee) && conventionPubliée"
                @click="ouvrirSignature"
              >
                <KeyRound :size="20" class="mr-3" /> 
                Signer électroniquement
              </v-btn>
              
              <div v-else class="text-center w-100 max-w-md">
                <v-alert type="success" variant="tonal" class="mb-6 text-left border-l-4">
                  <div class="font-weight-bold">Signature validée</div>
                  Votre dossier est signé et prêt à être envoyé.
                </v-alert>
                <v-btn
                  color="success"
                  variant="flat"
                  size="x-large"
                  block
                  class="btn-principal shadow-lg"
                  :disabled="!peutSoumettre || envoiEnCours"
                  @click="soumettre"
                  :loading="envoiEnCours"
                >
                  <Send :size="20" class="mr-3" /> Transmettre le dossier à la SGI
                </v-btn>
              </div>
            </div>
          </template>

        </div>

        <!-- Footer Action Bar -->
        <footer class="content-footer bg-surface border-t px-8 py-4 d-flex align-center">
          <!-- Si on est sur la convention -->
          <template v-if="etapeCourante.type === 'convention'">
            <div class="text-caption text-medium-emphasis flex-grow-1">
              La convention tarifaire doit être acceptée pour continuer.
            </div>
            <v-btn
              v-if="!detail.convention_acceptee"
              color="primary"
              variant="flat"
              class="btn-principal px-6"
              :loading="envoiEnCours"
              @click="accepterConventionDossier"
            >
              <CheckCircle :size="16" class="mr-2" /> Accepter et Continuer
            </v-btn>
            <v-btn v-else color="primary" variant="flat" class="btn-principal px-6" @click="etapeSuivante">
              Continuer <ArrowRight :size="16" class="ml-2" />
            </v-btn>
          </template>

          <!-- Si on est sur du KYC classique -->
          <template v-else-if="etapeCourante.type === 'kyc'">
            <div class="d-flex align-center text-medium-emphasis text-caption">
              <span v-if="sauvegardesEnCours.size > 0">
                <v-progress-circular indeterminate size="12" width="2" class="mr-2" /> Sauvegarde en cours...
              </span>
              <span v-else>
                <Check :size="14" class="mr-1 d-inline" /> Brouillon sauvegardé
              </span>
            </div>
            <v-spacer />
            <v-btn variant="text" class="font-weight-bold mr-4 text-medium-emphasis hover-lift" @click="etapePrecedente">
              Retour
            </v-btn>
            <v-btn color="primary" variant="flat" class="btn-principal px-8" @click="etapeSuivante">
              Étape suivante <ArrowRight :size="16" class="ml-2" />
            </v-btn>
          </template>

          <!-- Si on est sur la Validation (pas de footer spécifique nécessaire vu que l'action est au centre, mais on garde le bouton retour) -->
          <template v-else>
            <v-spacer />
            <v-btn variant="text" class="font-weight-bold text-medium-emphasis hover-lift" @click="etapePrecedente">
              <ArrowLeft :size="16" class="mr-2" /> Revoir mes informations
            </v-btn>
          </template>
        </footer>
      </template>
    </main>

    <!-- Modale Signature OTP (Identique à avant, juste recentrée/restylée pour coller au luxe) -->
    <v-dialog v-model="dialogSignature" max-width="450" persistent>
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="font-display pt-8 px-8 font-weight-bold d-flex flex-column align-center text-center">
          <div class="bg-warning-lighten-5 text-warning rounded-circle pa-4 mb-4">
            <KeyRound :size="32" />
          </div>
          Signature Électronique
        </v-card-title>
        <v-card-text class="px-8 py-2 text-center">
          <v-alert v-if="erreurOtp" type="error" variant="tonal" class="mb-4 text-left border-l-4">
            {{ erreurOtp }}
          </v-alert>
          <v-alert v-if="signaturePosee" type="success" variant="tonal" class="mb-4 text-left border-l-4">
            <CheckCircle :size="18" class="mr-2 d-inline" /> Signature validée avec succès.
          </v-alert>
          
          <v-progress-circular v-if="otpEnCours && !codeOtpGenere" indeterminate color="warning" size="48" width="4" class="my-8" />
          <template v-else-if="!signaturePosee">
            <p v-if="codeOtpGenere" class="text-body-2 text-medium-emphasis mb-6">
              Veuillez saisir le code confidentiel à 6 chiffres généré pour vous ci-dessous.
            </p>
            <p v-else class="text-body-2 text-medium-emphasis mb-6">
              Un code confidentiel à 6 chiffres vous a été adressé par SMS/email : saisissez-le ci-dessous.
            </p>
            <div v-if="codeOtpGenere" class="bg-surface-variant pa-4 rounded-lg mb-6 code-box border-dashed">
              <span class="font-weight-black text-warning text-h3 font-display tracking-widest letter-spacing-large">{{ codeOtpGenere }}</span>
            </div>

            <v-text-field
              v-model="saisieOtp"
              label="Saisissez le code ici"
              variant="outlined"
              maxlength="6"
              class="text-center font-display premium-input"
              :disabled="otpEnCours"
              @keyup.enter="validerSignature"
            />

            <p v-if="expirationOtp" class="text-caption text-error font-weight-medium mt-2">
              Expire bientôt. Validez rapidement.
            </p>
          </template>
        </v-card-text>
        <v-card-actions class="px-8 pb-8 pt-4 d-flex justify-center flex-column gap-3">
          <v-btn
            v-if="!signaturePosee"
            color="warning"
            variant="flat"
            class="btn-principal w-100 mb-2"
            size="large"
            :loading="otpEnCours"
            :disabled="!saisieOtp.trim()"
            @click="validerSignature"
          >
            Confirmer la signature
          </v-btn>
          <v-btn variant="text" color="grey" class="w-100 font-weight-bold" @click="dialogSignature = false">
            {{ signaturePosee ? 'Fermer' : 'Annuler' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.split-layout {
  display: flex;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-slate-900 {
  background-color: #0f172a !important;
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Vertical Stepper Custom */
.vertical-stepper {
  display: flex;
  flex-direction: column;
}

.step-item {
  position: relative;
  min-height: 80px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.step-item.active {
  opacity: 1;
}

.step-item.completed {
  opacity: 1;
}

.step-connector {
  position: absolute;
  left: 13px; /* Center of the 28px circle */
  top: 28px;
  bottom: 0;
  width: 2px;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.step-item.completed .step-connector {
  background-color: rgb(var(--v-theme-success));
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  z-index: 2;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.step-item.active .step-circle {
  background-color: transparent;
  border-color: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-success));
}

.step-item.completed .step-circle {
  background-color: rgb(var(--v-theme-success));
  color: #fff;
}

.step-subtitle {
  color: rgba(255, 255, 255, 0.5);
}

.step-item.active .step-subtitle {
  color: rgb(var(--v-theme-success));
}

.step-title {
  color: rgba(255, 255, 255, 0.8);
}

.step-item.active .step-title {
  color: #ffffff;
}

.security-card {
  border: 1px solid rgba(var(--v-theme-success), 0.3);
  background-color: rgba(var(--v-theme-success), 0.05);
}

/* --- MAIN CONTENT --- */
.main-content {
  flex-grow: 1;
  background-color: rgb(var(--v-theme-background));
  height: 100%;
}

.content-header {
  min-height: 100px;
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

.border-dashed {
  border: 1px dashed rgba(var(--v-theme-warning), 0.5);
}

.max-w-md {
  max-width: 600px;
}

/* Form Styles */
.premium-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: rgb(var(--v-theme-surface));
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.premium-switch :deep(.v-label) {
  opacity: 1;
  font-weight: 500;
  font-size: 14px;
}

/* Custom File Input to look like a drag-and-drop zone */
.premium-file-input :deep(.v-field) {
  border-radius: 12px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.2) !important;
  background-color: transparent !important;
}

.premium-file-input :deep(.v-field__input) {
  display: none !important; /* Cache le vrai input pour ne laisser que le prepend-inner stylisé */
}

.premium-file-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}

.upload-icon-wrapper {
  width: 56px;
  height: 56px;
}

.selfie-thumb {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  cursor: zoom-in;
  border: 1px solid rgb(var(--v-theme-outline));
}

/* PDF Viewer */
.pdf-container {
  height: calc(100vh - 280px);
  min-height: 500px;
  background-color: rgb(var(--v-theme-surface-variant));
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-outline));
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-placeholder {
  height: 100%;
}

/* Misc */
.tracking-wider {
  letter-spacing: 0.05em !important;
}

.letter-spacing-large {
  letter-spacing: 0.15em !important;
}

.line-height-1-5 {
  line-height: 1.5;
}

.btn-principal {
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 8px;
  text-transform: uppercase;
  font-size: 13px;
  height: 44px;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(var(--v-theme-primary), 0.3), 0 4px 6px -2px rgba(var(--v-theme-primary), 0.15) !important;
}

/* Scrollbars */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.2);
}

.custom-scrollbar-dark::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar-dark::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>