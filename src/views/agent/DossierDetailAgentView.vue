<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { urlFichierValeur } from '@/api/dossiers'
import { COULEURS_STATUT, LIBELLES_STATUT } from '@/config/statuts'
import { useAuthStore } from '@/stores/auth'
import { useDossiersStore } from '@/stores/dossiers'
import { formaterDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const dossiers = useDossiersStore()
const auth = useAuthStore()

const id = computed(() => String(route.params.id))

const dialogCommentaire = ref(false)
const valeurCommentee = ref<string | null>(null)
const texteCommentaire = ref('')
const envoiEnCours = ref(false)

const dialogRejet = ref(false)
const motifRejet = ref('')

const dialogValidation = ref(false)

const estPriseEnChargeParMoi = computed(
  () => dossiers.detail?.agent_email === auth.utilisateur?.email,
)

function ouvrirCommentaire(valeurId: string) {
  valeurCommentee.value = valeurId
  texteCommentaire.value = ''
  dialogCommentaire.value = true
}

async function envoyerCommentaire() {
  if (!valeurCommentee.value || !texteCommentaire.value.trim()) return
  envoiEnCours.value = true
  try {
    await dossiers.commenterValeur(id.value, valeurCommentee.value, texteCommentaire.value)
    dialogCommentaire.value = false
  } finally {
    envoiEnCours.value = false
  }
}

async function prendreEnCharge() {
  await dossiers.prendreEnCharge(id.value)
}

async function rejeter() {
  if (!motifRejet.value.trim()) return
  envoiEnCours.value = true
  try {
    await dossiers.deciderDossier(id.value, 'rejeter', motifRejet.value)
    dialogRejet.value = false
    motifRejet.value = ''
  } finally {
    envoiEnCours.value = false
  }
}

async function valider() {
  envoiEnCours.value = true
  try {
    await dossiers.deciderDossier(id.value, 'valider')
    dialogValidation.value = false
  } finally {
    envoiEnCours.value = false
  }
}

onMounted(() => void dossiers.chargerDetail(id.value))
</script>

<template>
  <v-container fluid>
    <v-btn variant="text" color="primary" class="mb-2" @click="router.back()">
      <v-icon icon="mdi-arrow-left" class="mr-1" /> Retour
    </v-btn>

    <v-alert v-if="dossiers.erreur" type="error" variant="tonal" class="mb-4">
      {{ dossiers.erreur }}
    </v-alert>

    <template v-if="dossiers.detail">
      <v-card class="mb-4">
        <v-card-title class="d-flex align-center flex-wrap">
          <span class="font-display">{{ dossiers.detail.reference }}</span>
          <v-chip
            :color="COULEURS_STATUT[dossiers.detail.statut]"
            variant="tonal"
            class="ml-3"
          >
            {{ LIBELLES_STATUT[dossiers.detail.statut] }}
          </v-chip>
          <v-chip variant="tonal" class="ml-2">Version {{ dossiers.detail.version }}</v-chip>
          <v-spacer />

          <template v-if="dossiers.detail.statut === 'SOUMIS'">
            <v-btn color="primary" variant="flat" @click="prendreEnCharge">
              <v-icon icon="mdi-hand-okay" class="mr-1" /> Prendre en charge
            </v-btn>
          </template>
          <template v-else-if="dossiers.detail.statut === 'EN_INSTRUCTION'">
            <v-chip
              v-if="estPriseEnChargeParMoi"
              color="primary"
              variant="tonal"
              class="mr-2"
            >
              Instruit par vous
            </v-chip>
            <v-btn color="success" variant="flat" class="mr-2" @click="dialogValidation = true">
              <v-icon icon="mdi-check" class="mr-1" /> Valider
            </v-btn>
            <v-btn color="error" variant="tonal" @click="dialogRejet = true">
              <v-icon icon="mdi-close" class="mr-1" /> Rejeter
            </v-btn>
          </template>
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="dossiers.detail.statut === 'REJETE' && dossiers.detail.motif_rejet"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            Motif du rejet : {{ dossiers.detail.motif_rejet }}
          </v-alert>

          <v-row>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Investisseur</div>
              <div>{{ dossiers.detail.investisseur_email }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Soumis le</div>
              <div>{{ formaterDate(dossiers.detail.date_soumission) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Prise en charge</div>
              <div>{{ dossiers.detail.agent_email || '—' }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Convention</div>
              <div>
                <v-chip
                  size="small"
                  :color="dossiers.detail.convention_acceptee ? 'success' : 'warning'"
                  variant="tonal"
                >
                  {{ dossiers.detail.convention_acceptee ? 'Acceptée' : 'Non acceptée' }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Valeurs KYC saisies par l'investisseur</v-card-title>
        <v-card-text>
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
                <th v-if="dossiers.detail.statut === 'EN_INSTRUCTION'" class="text-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="valeur in dossiers.detail.valeurs_champs" :key="valeur.id">
                <td>
                  {{ valeur.champ }}
                  <v-tooltip v-if="valeur.est_corrige" text="Corrigé par l'investisseur après votre demande">
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        icon="mdi-alert-circle-check"
                        color="success"
                        size="16"
                        class="ml-1"
                      />
                    </template>
                  </v-tooltip>
                </td>
                <td>
                  <template v-if="valeur.fichier">
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      :href="urlFichierValeur(dossiers.detail!.id, valeur.id)"
                      target="_blank"
                    >
                      <v-icon icon="mdi-download" class="mr-1" /> Document
                    </v-btn>
                  </template>
                  <template v-else>{{ valeur.valeur || '—' }}</template>
                </td>
                <td>
                  <span :class="valeur.commentaire_agent ? 'text-warning' : ''">
                    {{ valeur.commentaire_agent || '—' }}
                  </span>
                </td>
                <td v-if="dossiers.detail.statut === 'EN_INSTRUCTION'" class="text-end">
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="ouvrirCommentaire(valeur.id)"
                  >
                    <v-icon icon="mdi-comment-outline" class="mr-1" />
                    {{ valeur.commentaire_agent ? 'Modifier le commentaire' : 'Commenter' }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </template>

    <v-progress-linear v-else-if="dossiers.detailChargement" indeterminate class="mt-4" />

    <v-dialog v-model="dialogCommentaire" max-width="560">
      <v-card>
        <v-card-title>Commenter une valeur</v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-3">
            Le commentaire signale à l'investisseur la correction à apporter. La valeur
            repassera en « à corriger ».
          </p>
          <v-textarea
            v-model="texteCommentaire"
            label="Commentaire (obligatoire)"
            variant="outlined"
            rows="3"
            counter
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCommentaire = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!texteCommentaire.trim() || envoiEnCours"
            :loading="envoiEnCours"
            @click="envoyerCommentaire"
          >
            Envoyer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogRejet" max-width="560">
      <v-card>
        <v-card-title class="text-error">Rejeter le dossier</v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-3">
            Le motif est obligatoire et sera notifié à l'investisseur, qui pourra
            corriger puis resoumettre son dossier.
          </p>
          <v-textarea
            v-model="motifRejet"
            label="Motif du rejet (obligatoire)"
            variant="outlined"
            rows="3"
            counter
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogRejet = false">Annuler</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :disabled="!motifRejet.trim() || envoiEnCours"
            :loading="envoiEnCours"
            @click="rejeter"
          >
            Rejeter le dossier
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogValidation" max-width="480">
      <v-card>
        <v-card-title class="text-success">Valider le dossier</v-card-title>
        <v-card-text>
          <p class="text-body-2">
            La validation est irréversible. Rappel : la validation exige une signature
            électronique complète du dossier (OTP + signature de l'investisseur). Si la
            signature n'est pas en place, le backend refusera la validation.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogValidation = false">Annuler</v-btn>
          <v-btn
            color="success"
            variant="flat"
            :loading="envoiEnCours"
            @click="valider"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>