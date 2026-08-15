<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, AlertTriangle, ArrowLeft, Building2, Clock, Download, Edit3, FileSignature, FileText } from '@lucide/vue'

import { etapesKyc, genererOtp, signerDossier, urlFichierValeur } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import { ficheSgi } from '@/api/sgi'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useDossiersStore } from '@/stores/dossiers'
import type { ChampKyc, FicheSgi } from '@/types'
import { formaterDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const dossiers = useDossiersStore()

const id = computed(() => String(route.params.id))

const fiche = ref<FicheSgi | null>(null)
const champsParId = ref(new Map<string, ChampKyc>())
const chargementFiche = ref(false)

const dialogOtp = ref(false)
const codeOtpGenere = ref<string | null>(null)
const expirationOtp = ref<string | null>(null)
const saisieOtp = ref('')
const otpEnCours = ref(false)
const erreurOtp = ref('')
const signaturePosee = ref(false)

const estEditable = computed(() => {
  const statut = dossiers.detail?.statut
  return statut === 'BROUILLON' || statut === 'REJETE'
})

async function chargerComplement() {
  if (!dossiers.detail) return
  chargementFiche.value = true
  try {
    const [reponseFiche, reponseEtapes] = await Promise.all([
      ficheSgi(dossiers.detail.sgi),
      etapesKyc(dossiers.detail.sgi),
    ])
    fiche.value = reponseFiche
    const carte = new Map<string, ChampKyc>()
    for (const etape of reponseEtapes.results) {
      for (const champ of etape.champs) carte.set(champ.id, champ)
    }
    champsParId.value = carte
  } finally {
    chargementFiche.value = false
  }
}

function nomDuChamp(id: string): string {
  return champsParId.value.get(id)?.nom ?? id.slice(0, 8)
}

async function ouvrirOtp() {
  erreurOtp.value = ''
  saisieOtp.value = ''
  codeOtpGenere.value = null
  expirationOtp.value = null
  otpEnCours.value = true
  try {
    const reponse = await genererOtp(id.value)
    codeOtpGenere.value = reponse.code
    expirationOtp.value = reponse.expiration
    dialogOtp.value = true
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
    await dossiers.chargerDetail(id.value)
  } catch (cause) {
    erreurOtp.value = extraireMessageErreur(cause)
  } finally {
    otpEnCours.value = false
  }
}

onMounted(async () => {
  await dossiers.chargerDetail(id.value)
  await chargerComplement()
})
</script>

<template>
  <v-container fluid class="page-detail pa-6">
    <v-btn variant="text" color="primary" class="mb-4 hover-lift" @click="router.back()">
      <ArrowLeft :size="18" class="mr-2" /> Retour
    </v-btn>

    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-4">
      {{ dossiers.erreur }}
    </v-alert>

    <template v-if="dossiers.detail">
      <v-card class="mb-6 main-panel">
        <v-card-title class="d-flex align-center flex-wrap pt-6 px-6">
          <span class="font-display text-h5 font-weight-bold">{{ dossiers.detail.reference }}</span>
          <v-chip
            :color="COULEURS_STATUT[dossiers.detail.statut]"
            variant="flat"
            class="ml-4 font-weight-bold text-uppercase badge-statut"
            size="large"
          >
            {{ LIBELLES_STATUT[dossiers.detail.statut] }}
          </v-chip>
          <v-chip variant="tonal" class="ml-2 font-weight-medium">V{{ dossiers.detail.version }}</v-chip>
          <v-spacer />
          <v-btn
            v-if="estEditable"
            color="primary"
            variant="flat"
            class="ml-3 btn-principal hover-lift"
            @click="router.push({ name: 'investisseur-dossier-edition', params: { id: id } })"
          >
            <Edit3 :size="16" class="mr-2" /> Modifier le dossier
          </v-btn>
          <v-btn
            v-if="estEditable && dossiers.detail.convention_acceptee"
            variant="flat"
            color="warning"
            class="ml-3 btn-principal hover-lift"
            @click="ouvrirOtp"
          >
            <FileSignature :size="16" class="mr-2" /> Signer
          </v-btn>
          <span class="text-caption text-muted ml-4 d-none d-md-flex">
            {{ dossiers.detail.investisseur_email }}
          </span>
        </v-card-title>
        <v-card-text class="px-6 pb-6">
          <v-alert
            v-if="dossiers.detail.statut === 'REJETE' && dossiers.detail.motif_rejet"
            type="error"
            variant="tonal"
            class="mb-6 alert-rejet"
            border="start"
          >
            <template #prepend>
              <AlertCircle :size="24" class="mr-3 text-error" />
            </template>
            <div class="font-weight-bold mb-1">Dossier Rejeté - Corrections Requises</div>
            {{ dossiers.detail.motif_rejet }}
          </v-alert>

          <div class="d-flex align-center mb-2">
            <span class="text-body-2 mr-3">Progression</span>
            <v-progress-linear
              :model-value="dossiers.detail.progression_pct"
              height="8"
              rounded
              class="flex-grow-1"
            />
            <span class="text-body-2 ml-3 font-weight-medium">
              {{ dossiers.detail.progression_pct }}%
            </span>
          </div>

          <v-row class="mt-2">
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Créé le</div>
              <div>{{ formaterDate(dossiers.detail.date_creation) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Soumis le</div>
              <div>{{ formaterDate(dossiers.detail.date_soumission) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Agent en charge</div>
              <div>{{ dossiers.detail.agent_email || 'Non assigné' }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Signature</div>
              <div>
                {{
                  dossiers.detail.type_signature
                    ? `${dossiers.detail.type_signature}${dossiers.detail.date_signature ? ' le ' + formaterDate(dossiers.detail.date_signature) : ''}`
                    : 'Non signé'
                }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" lg="5" class="d-flex flex-column gap-6">
          <v-card class="flex-grow-1">
            <v-card-title class="d-flex align-center pt-6 px-6 font-display font-weight-bold">
              <v-avatar size="40" color="primary" variant="tonal" class="mr-3">
                <Building2 :size="20" />
              </v-avatar>
              {{ fiche?.nom ?? 'Société de gestion' }}
            </v-card-title>
            <v-card-text class="px-6 pb-6">
              <v-skeleton-loader v-if="chargementFiche" type="paragraph" class="bg-transparent" />
              <template v-else>
                  Code SGI : <span class="font-weight-bold text-primary">{{ fiche?.code_sgi ?? '—' }}</span>
                <p v-if="fiche?.presentation" class="text-body-2 mt-3 text-muted">
                  {{ fiche.presentation }}
                </p>
                <div class="divider-glass my-4"></div>
                <template v-if="fiche?.convention.titre">
                  <div class="d-flex align-center mb-3">
                    <FileText :size="18" class="text-error mr-2" />
                    <span class="font-weight-medium">{{ fiche.convention.titre }}</span>
                  </div>
                  <v-chip
                    :color="fiche.convention.signe_requis ? 'warning' : 'success'"
                    variant="flat"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{
                      fiche.convention.signe_requis
                        ? 'Signature requise avant soumission'
                        : 'Convention validée'
                    }}
                  </v-chip>
                </template>
                <v-alert v-else type="info" variant="tonal" class="mb-0">
                  Aucune convention déposée par cette SGI pour le moment.
                </v-alert>
              </template>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="7">
          <v-card class="h-100">
            <v-card-title class="pt-6 px-6 font-display font-weight-bold">Valeurs du dossier KYC</v-card-title>
            <v-card-text class="px-6 pb-6">
              <v-alert
                v-if="!dossiers.detail.valeurs_champs.length"
                type="info"
                variant="tonal"
                class="mb-0"
              >
                Aucune valeur saisie pour le moment.
              </v-alert>
              <v-table v-else>
                <thead>
                  <tr>
                    <th>Champ</th>
                    <th>Valeur</th>
                    <th>Commentaire agent</th>
                    <th>Maj</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="valeur in dossiers.detail.valeurs_champs" :key="valeur.id">
                    <td>
                      {{ nomDuChamp(valeur.champ) }}
                      <v-tooltip v-if="valeur.est_corrige" text="Corrigé après demande de l'agent">
                        <template #activator="{ props }">
                          <AlertTriangle v-bind="props" :size="16" class="text-warning ml-2 d-inline" />
                        </template>
                      </v-tooltip>
                    </td>
                    <td>
                      <template v-if="valeur.fichier">
                        <v-btn
                          variant="text"
                          color="primary"
                          size="small"
                          :href="urlFichierValeur(dossiers.detail.id, valeur.id)"
                          target="_blank"
                          class="btn-sm hover-lift"
                        >
                          <Download :size="14" class="mr-1" /> Document
                        </v-btn>
                      </template>
                      <template v-else>{{ valeur.valeur || '—' }}</template>
                    </td>
                    <td>{{ valeur.commentaire_agent || '—' }}</td>
                    <td>{{ formaterDate(valeur.date_maj) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-progress-linear v-else-if="dossiers.detailChargement" indeterminate class="mt-4" />

    <v-dialog v-model="dialogOtp" max-width="520">
      <v-card class="modal-luxe">
        <v-card-title class="font-display pt-6 px-6 font-weight-bold d-flex align-center">
          <FileSignature :size="24" class="text-warning mr-3" />
          Signature Électronique
        </v-card-title>
        <v-card-text class="px-6 py-4">
          <v-alert v-if="erreurOtp" type="error" variant="tonal" class="mb-3">
            {{ erreurOtp }}
          </v-alert>
          <v-alert v-if="signaturePosee" type="success" variant="tonal" class="mb-3">
            Signature posée avec succès.
          </v-alert>
          <template v-if="codeOtpGenere">
            <div class="pa-4 border-radius-8 text-center my-4 code-box">
              <span class="font-weight-black text-warning text-h4 font-display tracking-widest">{{ codeOtpGenere }}</span>
            </div>
            <p v-if="expirationOtp" class="text-caption text-error text-center mb-6 font-weight-medium">
              <Clock :size="12" class="d-inline mr-1" /> Expire le {{ formaterDate(expirationOtp) }}
            </p>
            <div class="px-2 pt-2 rounded">
              <v-text-field
                v-model="saisieOtp"
                label="Saisissez le code OTP"
                variant="plain"
                maxlength="8"
                class="text-center font-display"
                :disabled="signaturePosee || otpEnCours"
                @keyup.enter="validerSignature"
              />
            </div>
          </template>
          <v-skeleton-loader v-else-if="otpEnCours" type="paragraph" />
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="text" color="grey-lighten-1" @click="dialogOtp = false">Fermer</v-btn>
          <v-btn
            v-if="codeOtpGenere && !signaturePosee"
            color="warning"
            variant="flat"
            class="btn-principal"
            :loading="otpEnCours"
            :disabled="!saisieOtp.trim()"
            @click="validerSignature"
          >
            Valider la signature
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.page-detail {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.text-muted {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.main-panel {
  border-radius: 16px;
}

.badge-statut {
  letter-spacing: 0.05em;
}

.btn-principal {
  height: 40px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 8px;
  text-transform: uppercase;
  font-size: 12px;
}

.btn-sm {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
}

.alert-rejet {
  border-left-width: 4px;
}

.divider-glass {
  height: 1px;
  background: rgb(var(--v-theme-outline));
}

.modal-luxe {
  border-radius: 16px !important;
}

.border-radius-8 {
  border-radius: 8px;
}

.code-box {
  background: rgba(var(--v-theme-warning), 0.1) !important;
  border: 1px dashed rgba(var(--v-theme-warning), 0.3) !important;
}

:deep(.v-table) {
  background: transparent !important;
}

:deep(.v-table th) {
  text-transform: uppercase;
  font-size: 11px !important;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-on-surface-variant)) !important;
  border-bottom: 1px solid rgb(var(--v-theme-outline)) !important;
}

:deep(.v-table td) {
  border-bottom: 1px solid rgb(var(--v-theme-outline)) !important;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px !important;
}

:deep(.v-table tbody tr:hover) {
  background: rgba(var(--v-theme-surface), 0.3) !important;
}
</style>