<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  ShieldCheck,
  ShieldBan,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  ShieldAlert,
  ArrowRightLeft,
} from '@lucide/vue'
import { formaterDate } from '@/utils/format'
import { useAgentsStore } from '@/stores/agents'
import type { VerificationPreuveVie } from '@/api/dossiers'

const dialogCommentaire = defineModel<boolean>('dialogCommentaire', { required: true })
const texteCommentaire = defineModel<string>('texteCommentaire', { required: true })

const dialogRejet = defineModel<boolean>('dialogRejet', { required: true })
const motifRejet = defineModel<string>('motifRejet', { required: true })

const dialogValidation = defineModel<boolean>('dialogValidation', { required: true })

const dialogAuthenticite = defineModel<boolean>('dialogAuthenticite', { required: true })

const dialogTransfert = defineModel<boolean>('dialogTransfert', { required: true })
const agentCible = defineModel<string>('agentCible', { required: true })

const props = defineProps<{
  envoiEnCours: boolean
  verificationEnCours: boolean
  erreurVerification: string
  verificationPreuve: VerificationPreuveVie | null
  conforme: boolean
  agentEmail?: string | null
}>()

const emit = defineEmits<{
  envoyerCommentaire: []
  rejeter: []
  valider: []
  confirmerTransfert: []
}>()

const agentsStore = useAgentsStore()

const agentsActifs = computed(() =>
  agentsStore.liste
    .filter((a) => a.is_active)
    .map((a) => ({
      ...a,
      label: `${a.prenom || ''} ${a.nom || ''}`.trim() || a.email,
    })),
)

onMounted(async () => {
  if (!agentsStore.liste.length) {
    await agentsStore.charger()
  }
})
</script>

<template>
  <!-- Modale Vérification Authenticité -->
  <v-dialog v-model="dialogAuthenticite" max-width="600">
    <v-card class="rounded-xl elevation-24">
      <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4">
        <ShieldCheck v-if="conforme" :size="28" class="text-success mr-3" />
        <ShieldBan v-else :size="28" class="text-error mr-3" />
        Contrôle Cryptographique
      </v-card-title>
      
      <v-card-text class="pa-6">
        <div v-if="verificationEnCours" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48" width="4" class="mb-4" />
          <div class="text-body-1 text-medium-emphasis">Vérification de la signature en cours...</div>
        </div>
        
        <v-alert v-else-if="erreurVerification" type="error" variant="tonal" class="mb-0 border-l-4">
          {{ erreurVerification }}
        </v-alert>
        
        <template v-else-if="verificationPreuve">
          <v-alert
            :type="conforme ? 'success' : 'error'"
            variant="flat"
            class="mb-6 shadow-sm font-weight-medium"
          >
            {{ verificationPreuve.detail }}
          </v-alert>
          
          <div class="bg-surface-variant rounded-lg pa-4 border mb-6">
            <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">
              Empreinte Numérique (SHA-256)
            </div>
            <code class="d-block text-body-2 bg-surface pa-3 rounded border text-primary" style="word-break: break-all;">
              {{ verificationPreuve.empreinte_sha256 || 'Non disponible' }}
            </code>
          </div>
          
          <v-row>
            <v-col cols="12" sm="4">
              <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">Horodatage</div>
              <div class="text-body-1 font-weight-medium">{{ formaterDate(verificationPreuve.date_capture) }}</div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">Intégrité</div>
              <v-chip size="small" variant="flat" :color="verificationPreuve.concordante ? 'success' : 'error'" class="font-weight-bold px-3">
                <CheckCircle2 v-if="verificationPreuve.concordante" :size="14" class="mr-1" />
                <XCircle v-else :size="14" class="mr-1" />
                {{ verificationPreuve.concordante ? 'Fichier Intact' : 'Altération Détectée' }}
              </v-chip>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-caption text-uppercase font-weight-bold tracking-wider text-medium-emphasis mb-2">Signature Serveur</div>
              <v-chip size="small" variant="flat" :color="verificationPreuve.signature_valide ? 'success' : 'error'" class="font-weight-bold px-3">
                <CheckCircle2 v-if="verificationPreuve.signature_valide" :size="14" class="mr-1" />
                <XCircle v-else :size="14" class="mr-1" />
                {{ verificationPreuve.signature_valide ? 'Certifiée' : 'Invalide' }}
              </v-chip>
            </v-col>
          </v-row>
        </template>
      </v-card-text>
      
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn color="primary" variant="tonal" class="font-weight-bold px-6" @click="dialogAuthenticite = false">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modale Commentaire -->
  <v-dialog v-model="dialogCommentaire" max-width="500">
    <v-card class="rounded-xl elevation-24">
      <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4">
        <MessageSquare :size="24" class="text-warning mr-3" />
        Demander une correction
      </v-card-title>
      <v-card-text class="px-6 py-6">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Ce message sera envoyé à l'investisseur. Le dossier ne pourra pas être validé tant que cette valeur ne sera pas corrigée.
        </p>
        <v-textarea
          v-model="texteCommentaire"
          label="Explication de la correction requise"
          variant="outlined"
          rows="4"
          counter
          class="premium-input"
          hide-details="auto"
          placeholder="Veuillez fournir un document plus lisible..."
        />
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0 border-t mt-2">
        <v-spacer />
        <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogCommentaire = false">Annuler</v-btn>
        <v-btn
          color="warning"
          variant="flat"
          class="px-6 font-weight-bold shadow-sm"
          :disabled="!texteCommentaire.trim() || envoiEnCours"
          :loading="envoiEnCours"
          @click="emit('envoyerCommentaire')"
        >
          Envoyer la demande
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modale Rejet -->
  <v-dialog v-model="dialogRejet" max-width="500">
    <v-card class="rounded-xl elevation-24">
      <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4 text-error">
        <XCircle :size="24" class="mr-3" />
        Rejeter le dossier
      </v-card-title>
      <v-card-text class="px-6 py-6">
        <v-alert type="error" variant="tonal" class="mb-4 border-l-4">
          <template #prepend>
            <AlertCircle :size="20" class="mr-2" />
          </template>
          <span class="text-body-2 font-weight-medium">Le dossier entier sera renvoyé à l'investisseur.</span>
        </v-alert>
        <v-textarea
          v-model="motifRejet"
          label="Motif global du rejet (obligatoire)"
          variant="outlined"
          rows="4"
          counter
          class="premium-input"
          hide-details="auto"
          placeholder="Ex: Pièce d'identité non conforme et selfie flou."
        />
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0 border-t mt-2">
        <v-spacer />
        <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogRejet = false">Annuler</v-btn>
        <v-btn
          color="error"
          variant="flat"
          class="px-6 font-weight-bold shadow-sm"
          :disabled="!motifRejet.trim() || envoiEnCours"
          :loading="envoiEnCours"
          @click="emit('rejeter')"
        >
          Rejeter définitivement
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modale Validation -->
  <v-dialog v-model="dialogValidation" max-width="500">
    <v-card class="rounded-xl elevation-24">
      <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4 text-success">
        <CheckCircle2 :size="24" class="mr-3" />
        Validation Définitive
      </v-card-title>
      <v-card-text class="px-6 py-6">
        <v-alert type="warning" variant="tonal" class="mb-0 border-l-4">
          <template #prepend>
            <ShieldAlert :size="20" class="mr-2" />
          </template>
          <div class="font-weight-bold mb-1">Action Irréversible</div>
          <div class="text-body-2">
            Assurez-vous que toutes les pièces ont été vérifiées. Le système bloquera automatiquement la validation si la convention n'est pas signée électroniquement (OTP) par le client.
          </div>
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0 border-t mt-2">
        <v-spacer />
        <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogValidation = false">Annuler</v-btn>
        <v-btn
          color="success"
          variant="flat"
          size="large"
          class="px-8 font-weight-bold shadow-sm"
          :loading="envoiEnCours"
          @click="emit('valider')"
        >
          <CheckCircle2 :size="18" class="mr-2" /> Valider le dossier
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modale Transfert -->
  <v-dialog v-model="dialogTransfert" max-width="500">
    <v-card class="rounded-xl elevation-24">
      <v-card-title class="pt-6 px-6 font-display font-weight-bold text-h5 d-flex align-center border-b pb-4">
        <ArrowRightLeft :size="24" class="text-warning mr-3" />
        Transférer le dossier
      </v-card-title>
      <v-card-text class="px-6 py-6">
        <div class="text-body-2 text-medium-emphasis mb-4">
          Agent actuel : <strong>{{ agentEmail || '—' }}</strong>
        </div>

        <v-autocomplete
          v-model="agentCible"
          :items="agentsActifs"
          item-title="label"
          item-value="id"
          label="Sélectionner un agent"
          variant="outlined"
          class="premium-input mb-4"
          hide-details="auto"
          clearable
          placeholder="Rechercher un agent..."
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="item.email" />
          </template>
        </v-autocomplete>

        <v-alert type="warning" variant="tonal" class="border-l-4 mb-0">
          <template #prepend>
            <AlertCircle :size="20" class="mr-2" />
          </template>
          <span class="text-body-2 font-weight-medium">
            Le dossier sera transféré à l'agent sélectionné. Vous n'aurez plus accès à ce dossier.
          </span>
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0 border-t mt-2">
        <v-spacer />
        <v-btn variant="text" class="font-weight-bold mr-2" color="grey-darken-1" @click="dialogTransfert = false">Annuler</v-btn>
        <v-btn
          color="warning"
          variant="flat"
          class="px-6 font-weight-bold shadow-sm"
          :disabled="!agentCible || envoiEnCours"
          :loading="envoiEnCours"
          @click="emit('confirmerTransfert')"
        >
          <ArrowRightLeft :size="16" class="mr-2" /> Transférer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
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

.premium-input :deep(.v-field) {
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.premium-input :deep(.v-field:hover) {
  border-color: rgb(var(--v-theme-primary));
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}
</style>
