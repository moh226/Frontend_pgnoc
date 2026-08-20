<script setup lang="ts">
import { ref } from 'vue'
import { FileSignature, KeyRound, Send } from '@lucide/vue'

import { genererOtp, signerDossier } from '@/api/dossiers'
import { extraireMessageErreur } from '@/api/client'
import type { FicheSgi } from '@/types'

const props = defineProps<{
  dossierId: string
  fiche: FicheSgi | null
  progression: number
  estSigne: boolean
  peutSoumettre: boolean
  envoiEnCours: boolean
}>()

const emit = defineEmits<{
  (e: 'soumettre'): void
  (e: 'rafraichir-progression'): void
}>()

const dialogSignature = ref(false)
const codeOtpGenere = ref<string | null>(null)
const expirationOtp = ref<string | null>(null)
const saisieOtp = ref('')
const otpEnCours = ref(false)
const erreurOtp = ref('')

async function ouvrirSignature() {
  erreurOtp.value = ''
  saisieOtp.value = ''
  codeOtpGenere.value = null
  expirationOtp.value = null
  otpEnCours.value = true
  dialogSignature.value = true
  try {
    const reponse = await genererOtp(props.dossierId)
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
    await signerDossier(props.dossierId, saisieOtp.value.trim())
    dialogSignature.value = false
    emit('rafraichir-progression')
  } catch (cause) {
    erreurOtp.value = extraireMessageErreur(cause)
  } finally {
    otpEnCours.value = false
  }
}
</script>

<template>
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
      :disabled="progression < 100"
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
        @click="emit('soumettre')"
        :loading="envoiEnCours"
      >
        <Send :size="20" class="mr-3" /> Transmettre le dossier à la SGI
      </v-btn>
    </div>

    <!-- Modale de Signature OTP -->
    <v-dialog v-model="dialogSignature" max-width="500">
      <v-card class="rounded-xl elevation-24">
        <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4">
          <KeyRound :size="24" class="text-warning mr-3" />
          Signature Électronique
        </v-card-title>
        
        <v-card-text class="px-6 py-6 text-center">
          <div v-if="otpEnCours && !codeOtpGenere" class="py-8">
            <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
            <div class="text-body-2 text-medium-emphasis">Génération de votre code sécurisé...</div>
          </div>
          <div v-else>
            <v-alert v-if="erreurOtp" type="error" variant="tonal" class="mb-4 text-left border-l-4">
              {{ erreurOtp }}
            </v-alert>
            <template v-if="codeOtpGenere">
              <p class="text-body-2 mb-2">
                Un code de vérification vient d'être généré. Dans un environnement de production, ce code serait envoyé par SMS/Email.
              </p>
              <div class="glass-input pa-4 rounded-lg bg-surface-variant text-center my-4 code-box border">
                <span class="font-weight-black text-warning text-h4 font-display tracking-widest">{{ codeOtpGenere }}</span>
              </div>
              <p v-if="expirationOtp" class="text-caption text-medium-emphasis mb-6">
                Expire le : {{ new Date(expirationOtp).toLocaleString() }}
              </p>
              
              <v-text-field
                v-model="saisieOtp"
                label="Saisissez le code OTP"
                variant="outlined"
                class="premium-input mt-2"
                hide-details="auto"
                autocomplete="off"
                @keyup.enter="validerSignature"
              />
            </template>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6 pt-0 mt-2">
          <v-spacer />
          <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogSignature = false">Annuler</v-btn>
          <v-btn
            color="warning"
            variant="flat"
            class="px-6 font-weight-bold shadow-sm"
            :disabled="!saisieOtp.trim() || otpEnCours"
            :loading="otpEnCours && !!codeOtpGenere"
            @click="validerSignature"
          >
            Confirmer et Signer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.shadow-lg {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.border-l-4 {
  border-left-width: 4px !important;
}

.tracking-widest {
  letter-spacing: 0.1em !important;
}

.premium-input :deep(.v-field) {
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.btn-principal {
  text-transform: none;
  letter-spacing: 0;
}
</style>
