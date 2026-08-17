<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Camera, CheckCircle, RefreshCw, CameraOff, ImageOff, AlertTriangle } from '@lucide/vue'

/**
 * Capture caméra directe pour un champ SELFIE (preuve de vie).
 *
 * La capture est CONTRAINTE à la caméra (aucun upload de fichier
 * existant) : c'est l'anti-fraude de niveau 1 côté expérience. Chaque
 * photo produite vient du flux live `getUserMedia`, recadrée en JPEG à
 * la taille de l'image affichée, puis confiée au parent (upload via
 * l'endpoint existant, qui pose la preuve serveur : hash + signature +
 * horodatage).
 *
 * États :
 *   - « enregistre » : un selfie est déjà téléversé ;
 *   - « pret »        : invite à ouvrir la caméra ;
 *   - « demarrage »   : demande de permission en cours ;
 *   - « capture »     : aperçu caméra en direct, bouton capturer ;
 *   - « relu »        : photo prise, valider / recommencer ;
 *   - « indisponible» : caméra absente ou refusée (message + réessai).
 */

const props = defineProps<{
  verrouille: boolean
}>()

const emit = defineEmits<{
  capturee: [photo: File]
}>()

type Etat =
  | { nom: 'pret' }
  | { nom: 'demarrage' }
  | { nom: 'capture' }
  | { nom: 'relu'; donnees: string }
  | { nom: 'indisponible'; message: string }

const etat = ref<Etat>({ nom: 'pret' })
const apercuVideo = ref<HTMLVideoElement | null>(null)
const demarrage = ref(false)

let flux: MediaStream | null = null
let image: HTMLCanvasElement | null = null

function arreterFlux() {
  flux?.getTracks().forEach((piste) => piste.stop())
  flux = null
}

function messageErreurCamera(cause: unknown, detaillerPermission: boolean): string {
  const nom = (cause as DOMException)?.name
  if (nom === 'NotAllowedError' || nom === 'SecurityError') {
    return detaillerPermission
      ? "L'accès à votre caméra a été refusé. Autorisez la caméra dans votre navigateur puis réessayez."
      : "L'accès à votre caméra est requis pour la preuve de vie : la capture ne peut pas être remplacée par un fichier existant."
  }
  if (nom === 'NotFoundError' || nom === 'OverconstrainedError') {
    return "Aucune caméra détectée sur cet appareil. Vérifiez votre matériel puis réessayez."
  }
  if (nom === 'NotReadableError') {
    return 'Votre caméra est utilisée par une autre application. Fermez-la puis réessayez.'
  }
  return "L'ouverture de la caméra a échoué. Réessayez dans un instant."
}

async function demarrerCamera() {
  if (props.verrouille) return
  demarrage.value = true
  etat.value = { nom: 'demarrage' }
  try {
    flux = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    await attendreFluxPret()
    etat.value = { nom: 'capture' }
  } catch (cause) {
    arreterFlux()
    etat.value = { nom: 'indisponible', message: messageErreurCamera(cause, true) }
  } finally {
    demarrage.value = false
  }
}

function attendreFluxPret(): Promise<void> {
  return new Promise((resoudre, rejeter) => {
    const video = apercuVideo.value
    if (!video) {
      rejeter(new Error('Aperçu vidéo introuvable.'))
      return
    }
    video.srcObject = flux
    video.onloadedmetadata = () => {
      video.play().catch(() => undefined)
      resoudre()
    }
  })
}

function capturer() {
  const video = apercuVideo.value
  if (!video || !video.videoWidth) return
  image = document.createElement('canvas')
  const largeur = video.videoWidth
  const hauteur = video.videoHeight
  image.width = largeur
  image.height = hauteur
  const contexte = image.getContext('2d')
  if (!contexte) return
  contexte.drawImage(video, 0, 0, largeur, hauteur)
  const donnees = image.toDataURL('image/jpeg', 0.92)
  etat.value = { nom: 'relu', donnees }
}

function recommencer() {
  if (etat.value.nom === 'relu' && flux) {
    etat.value = { nom: 'capture' }
    return
  }
  arreterFlux()
  etat.value = { nom: 'pret' }
}

function valider() {
  if (etat.value.nom !== 'relu') return
  image?.toBlob((blob) => {
    if (!blob) return
    const nom = `selfie-${Date.now()}.jpg`
    const fichier = new File([blob], nom, { type: 'image/jpeg' })
    arreterFlux()
    etat.value = { nom: 'pret' }
    emit('capturee', fichier)
  }, 'image/jpeg', 0.92)
}

onBeforeUnmount(arreterFlux)
</script>

<template>
  <div class="selfie-capture">
    <template v-if="etat.nom === 'capture' || etat.nom === 'demarrage'">
      <div class="camera-frame position-relative overflow-hidden rounded-lg bg-slate-900">
        <video
          v-if="etat.nom === 'capture'"
          ref="apercuVideo"
          class="camera-preview w-100"
          autoplay
          playsinline
          muted
        />
        <div v-else class="camera-loading d-flex flex-column align-center justify-center">
          <v-progress-circular indeterminate color="primary" size="48" width="4" />
          <span class="text-caption text-white mt-3">Ouverture de la caméra…</span>
        </div>

        <div class="camera-hint d-flex align-center px-4 py-3">
          <AlertTriangle :size="16" class="text-warning mr-2 flex-shrink-0" />
          <span class="text-caption text-white">
            Fond neutre recommandé, visage et carte clairement lisibles, sans lunettes de soleil.
          </span>
        </div>
      </div>

      <div class="d-flex align-center justify-center mt-4">
        <v-btn
          v-if="etat.nom === 'capture'"
          color="primary"
          variant="flat"
          size="large"
          class="btn-principal"
          @click="capturer"
        >
          <Camera :size="18" class="mr-2" /> Capturer le selfie
        </v-btn>
        <v-btn variant="text" class="font-weight-bold mr-4 text-medium-emphasis" @click="recommencer">
          Annuler
        </v-btn>
      </div>
    </template>

    <template v-else-if="etat.nom === 'relu'">
      <div class="camera-frame overflow-hidden rounded-lg bg-slate-900">
        <img :src="etat.donnees" alt="Aperçu de votre selfie" class="w-100" />
      </div>

      <div class="d-flex align-center justify-center mt-4">
        <v-btn
          color="success"
          variant="flat"
          size="large"
          class="btn-principal mr-4"
          @click="valider"
        >
          <CheckCircle :size="18" class="mr-2" /> Valider ce selfie
        </v-btn>
        <v-btn variant="text" class="font-weight-bold text-medium-emphasis" @click="recommencer">
          <RefreshCw :size="16" class="mr-2" /> Reprendre
        </v-btn>
      </div>
      <p class="text-caption text-medium-emphasis text-center mt-3">
        Vérifiez que votre visage et votre carte sont bien visibles avant de valider.
      </p>
    </template>

    <template v-else-if="etat.nom === 'indisponible'">
      <v-alert type="error" variant="tonal" class="mb-3 border-l-4" :icon="false">
        <div class="d-flex align-center">
          <CameraOff :size="20" class="mr-3 text-error flex-shrink-0" />
          <div>
            <div class="font-weight-bold mb-1">{{ etat.message }}</div>
            <div class="text-caption">
              La preuve de vie doit être prise en direct par la caméra : un fichier existant ne peut pas la remplacer.
            </div>
          </div>
        </div>
      </v-alert>
      <v-btn color="primary" variant="flat" class="btn-principal" @click="demarrerCamera">
        <RefreshCw :size="16" class="mr-2" /> Réessayer
      </v-btn>
    </template>

    <template v-else>
      <div class="premium-file-input pa-6 rounded-lg text-center d-flex flex-column align-center justify-center">
        <div class="upload-icon-wrapper bg-surface-variant rounded-circle d-flex align-center justify-center mb-3">
          <ImageOff :size="24" class="text-primary" />
        </div>
        <div class="text-body-1 font-weight-medium text-on-surface">Caméra requise pour cette étape</div>
        <div class="text-caption text-medium-emphasis mt-1">
          Vous prendrez une photo de vous, carte d'identité en main, directement face à la caméra.
        </div>
        <v-btn
          v-if="!verrouille"
          color="primary"
          variant="flat"
          class="btn-principal mt-4"
          :loading="demarrage"
          @click="demarrerCamera"
        >
          <Camera :size="18" class="mr-2" /> Ouvrir la caméra
        </v-btn>
      </div>
    </template>
  </div>
</template>

<style scoped>
.camera-frame {
  max-width: 560px;
  margin: 0 auto;
  background-color: #0f172a;
}

.camera-preview {
  display: block;
  transform: scaleX(-1);
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.camera-loading {
  height: 240px;
}

.camera-hint {
  background-color: rgba(255, 255, 255, 0.08);
}

.upload-icon-wrapper {
  width: 56px;
  height: 56px;
}

.btn-principal {
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 8px;
  text-transform: uppercase;
  font-size: 13px;
  height: 44px;
}
</style>