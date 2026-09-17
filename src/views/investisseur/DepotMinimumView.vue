<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Download, FileText, Upload } from '@lucide/vue'

import { useDepotMinimum } from '@/composables/useDepotMinimum'
import { LIBELLES_DEPOT } from '@/config/depots'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))

const {
  depot,
  chargement,
  erreur,
  pasExige,
  montantDepose,
  methodePaiement,
  referenceTransaction,
  preuve,
  envoiEnCours,
  succes,
  charger,
  deposer,
} = useDepotMinimum(id.value)

const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const formulaireVisible = computed(() => {
  const statut = depot.value?.statut
  return statut === 'EN_ATTENTE' || statut === 'REJETE'
})

const enAttenteVerification = computed(() => depot.value?.statut === 'PREUVE_DEPOSEE')
const approuve = computed(() => depot.value?.statut === 'APPROUVE')
const rejete = computed(() => depot.value?.statut === 'REJETE')

function formaterMontant(valeur: string | null | undefined): string {
  if (valeur === null || valeur === undefined || valeur === '') return '—'
  const nombre = Number(valeur)
  if (!Number.isFinite(nombre)) return '—'
  return nombre.toLocaleString('fr-FR')
}

onMounted(() => void charger())

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] ?? null
  if (f) preuve.value = f
  // Réinitialise la valeur native : permet de re-sélectionner le même
  // fichier après un échec d'envoi (sinon l'événement « change » ne
  // se redéclenche pas).
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) preuve.value = f
}

function ouvrirPreuve() {
  if (depot.value?.preuve_url) window.open(depot.value.preuve_url, '_blank', 'noopener')
}
</script>

<template>
  <v-container fluid class="page-depot pa-4">
    <!-- En-tête -->
    <header class="page-header" data-aos="fade-down" data-aos-duration="600">
      <button class="btn-retour" aria-label="Retour" @click="router.back()">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1 class="page-title">Dépôt minimum</h1>
        <p class="page-subtitle">Preuve de virement du dépôt d'ouverture</p>
      </div>
    </header>

    <v-alert v-if="erreur" type="error" variant="tonal" border="start" class="mb-4">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="succes" type="success" variant="tonal" border="start" class="mb-4">
      {{ succes }}
    </v-alert>

    <v-alert v-if="pasExige" type="info" variant="tonal" border="start" class="mb-4" data-aos="fade-up">
      La SGI n'exige pas de dépôt minimum pour ouvrir ce compte : le dossier a été activé directement.
    </v-alert>

    <!-- Skeleton -->
    <div v-if="chargement" class="skeleton-depot" aria-busy="true" aria-label="Chargement du dépôt minimum">
      <div class="skeleton-bloc skeleton-bloc--principal"></div>
      <div class="skeleton-bloc"></div>
    </div>

    <template v-else-if="depot">
      <!-- Récapitulatif du dépôt requis -->
      <v-card class="carte-depot mb-4" data-aos="fade-up" data-aos-duration="500">
        <div class="carte-entete">
          <div class="carte-entete-icon" aria-hidden="true">
            <FileText :size="22" />
          </div>
          <div class="carte-entete-texte">
            <div class="carte-titre">Dépôt minimum requis</div>
            <div class="carte-sous-titre">{{ depot.dossier_reference }} · {{ depot.sgi_nom }}</div>
          </div>
          <span
            class="statut-badge"
            :class="`statut--${depot.statut.toLowerCase()}`"
          >
            {{ LIBELLES_DEPOT[depot.statut] }}
          </span>
        </div>

        <div class="carte-corps">
          <div class="info-montant">
            <span class="info-label">Montant à déposer</span>
            <span class="info-valeur info-valeur--principale">
              {{ formaterMontant(depot.montant_requis) }} {{ depot.devise }}
            </span>
          </div>

          <div class="info-bloc">
            <span class="info-label">Méthodes acceptées</span>
            <div class="chips-methodes">
              <span v-for="methode in depot.methodes_acceptees" :key="methode.code" class="chip-methode">
                {{ methode.libelle }}
              </span>
              <span v-if="!depot.methodes_acceptees?.length" class="info-vide">Aucune méthode précisée</span>
            </div>
          </div>

          <div v-if="depot.instructions" class="info-bloc">
            <span class="info-label">Instructions</span>
            <p class="info-texte">{{ depot.instructions }}</p>
          </div>
        </div>
      </v-card>

      <!-- Preuve approuvée -->
      <v-card v-if="approuve" class="carte-etat carte-etat--succes mb-4" data-aos="fade-up" data-aos-delay="100">
        <div class="etat-ligne">
          <CheckCircle2 :size="28" class="etat-icone text-success" aria-hidden="true" />
          <div>
            <div class="etat-titre">Dépôt approuvé — compte ouvert</div>
            <p class="etat-texte">Votre dossier est désormais actif. Merci de votre confiance.</p>
            <p v-if="depot.reference_transaction" class="etat-detail">
              Référence vérifiée : {{ depot.reference_transaction }}
              <template v-if="depot.commentaire_agent"> — Note de l'agent : {{ depot.commentaire_agent }}</template>
            </p>
          </div>
        </div>
      </v-card>

      <!-- Preuve déposée, en attente -->
      <v-card v-if="enAttenteVerification" class="carte-etat carte-etat--info mb-4" data-aos="fade-up" data-aos-delay="100">
        <div class="etat-ligne">
          <Clock :size="28" class="etat-icone text-info" aria-hidden="true" />
          <div class="etat-contenu">
            <div class="etat-titre">Preuve déposée — vérification en cours</div>
            <p class="etat-texte">Un agent de la SGI contrôle votre preuve. Vous serez notifié de la décision.</p>
          </div>
        </div>

        <v-btn
          v-if="depot.preuve_url"
          variant="tonal"
          color="primary"
          class="btn-revoir font-weight-bold mt-4"
          @click="ouvrirPreuve"
        >
          <Download :size="18" class="mr-2" /> Revoir la preuve déposée
        </v-btn>

        <div class="etat-grille">
          <div class="etat-item">
            <span class="info-label">Montant déposé</span>
            <span class="etat-valeur">{{ formaterMontant(depot.montant_depose) }} {{ depot.devise }}</span>
          </div>
          <div class="etat-item">
            <span class="info-label">Méthode</span>
            <span class="etat-valeur">{{ depot.methode_paiement || '—' }}</span>
          </div>
          <div class="etat-item">
            <span class="info-label">Référence</span>
            <span class="etat-valeur">{{ depot.reference_transaction || '—' }}</span>
          </div>
        </div>
      </v-card>

      <!-- Rejet : motif -->
      <v-alert v-if="rejete && depot.commentaire_agent" type="error" variant="tonal" border="start" class="mb-4" data-aos="fade-up">
        <div class="font-weight-bold mb-1">Preuve rejetée par l'agent :</div>
        <div>{{ depot.commentaire_agent }}</div>
        <div class="text-body-2 mt-2">Corrigez la preuve et redéposez-la ci-dessous.</div>
      </v-alert>

      <!-- Formulaire de dépôt -->
      <v-card v-if="formulaireVisible" class="carte-depot" data-aos="fade-up" data-aos-delay="150">
        <div class="carte-entete">
          <div class="carte-entete-icon" aria-hidden="true">
            <Upload :size="20" />
          </div>
          <div class="carte-entete-texte">
            <div class="carte-titre">{{ rejete ? 'Redéposer la preuve' : 'Déposer la preuve' }}</div>
            <div class="carte-sous-titre">Renseignez les informations du virement puis joignez le reçu</div>
          </div>
        </div>

        <div class="carte-corps">
          <div class="champ-grille">
            <v-text-field
              v-model="montantDepose"
              label="Montant effectivement déposé"
              type="number"
              min="1"
              variant="outlined"
              density="comfortable"
              :suffix="depot.devise"
              class="premium-input"
              hide-details="auto"
            />
            <v-select
              v-model="methodePaiement"
              label="Méthode de paiement utilisée"
              :items="depot.methodes_acceptees.map((m) => ({ title: m.libelle, value: m.code }))"
              variant="outlined"
              density="comfortable"
              class="premium-input"
              hide-details="auto"
            />
            <v-text-field
              v-model="referenceTransaction"
              label="Référence de la transaction (reçu)"
              placeholder="Ex : OM-88217"
              variant="outlined"
              density="comfortable"
              class="premium-input champ-pleine-largeur"
              hide-details="auto"
            />
          </div>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,application/pdf,.png,.jpg,.jpeg,.pdf"
            class="d-none"
            @change="onFileSelect"
          />

          <div
            class="drop-zone"
            :class="{ 'drag-over': dragOver, 'a-fichier': !!preuve }"
            role="button"
            tabindex="0"
            :aria-label="preuve ? `Fichier sélectionné : ${preuve.name}. Cliquez pour changer.` : 'Ajouter la preuve du dépôt'"
            @click="fileInputRef?.click()"
            @keydown.enter="fileInputRef?.click()"
            @keydown.space.prevent="fileInputRef?.click()"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <template v-if="preuve">
              <FileText :size="36" class="drop-icone text-primary" aria-hidden="true" />
              <div class="drop-titre">{{ preuve.name }}</div>
              <div class="drop-detail">{{ (preuve.size / 1024 / 1024).toFixed(2) }} Mo · Cliquez pour changer</div>
            </template>
            <template v-else>
              <Upload :size="36" class="drop-icone" aria-hidden="true" />
              <div class="drop-titre">Glissez la preuve ici</div>
              <div class="drop-detail">Image PNG/JPG ou PDF · 10 Mo maximum</div>
            </template>
          </div>

          <v-btn
            color="primary"
            block
            class="btn-envoyer mt-4"
            :loading="envoiEnCours"
            :disabled="envoiEnCours"
            @click="deposer"
          >
            <Upload :size="18" class="mr-2" />
            {{ rejete ? 'Redéposer la preuve' : 'Envoyer la preuve' }}
          </v-btn>
        </div>
      </v-card>
    </template>

    <div v-else-if="!pasExige && !erreur" class="etat-indisponible" data-aos="fade-up">
      <AlertCircle :size="28" class="text-warning mb-2" aria-hidden="true" />
      <p>Impossible de consulter le dépôt minimum de ce dossier.</p>
    </div>
  </v-container>
</template>

<style scoped>
.page-depot {
  min-height: 100dvh;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

/* --- En-tête --- */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-retour {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.btn-retour:hover {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.page-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(20px, 5vw, 26px);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* --- Cartes --- */
.carte-depot {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.carte-entete {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.carte-entete-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
}

.carte-entete-texte {
  flex: 1;
  min-width: 0;
}

.carte-titre {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.carte-sous-titre {
  margin-top: 2px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.statut-badge {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: white;
}

.statut--en_attente { background: rgb(var(--v-theme-warning)); }
.statut--preuve_deposee { background: rgb(var(--v-theme-info)); }
.statut--approuve { background: rgb(var(--v-theme-success)); }
.statut--rejete { background: rgb(var(--v-theme-error)); }

.carte-corps {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-montant {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.06) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-on-surface-variant));
}

.info-valeur {
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.info-valeur--principale {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}

.info-bloc {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-texte {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface));
}

.info-vide {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.chips-methodes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-methode {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-size: 12px;
  font-weight: 700;
}

/* --- Cartes état --- */
.carte-etat {
  border-radius: 16px;
  padding: 18px;
  border: 1px solid rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));
}

.carte-etat--succes { border-color: rgba(var(--v-theme-success), 0.35); background: rgba(var(--v-theme-success), 0.05); }
.carte-etat--info { border-color: rgba(var(--v-theme-info), 0.35); background: rgba(var(--v-theme-info), 0.05); }

.etat-ligne {
  display: flex;
  gap: 14px;
}

.etat-icone { flex-shrink: 0; }

.etat-contenu { flex: 1; min-width: 0; }

.etat-titre {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.etat-texte {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: rgb(var(--v-theme-on-surface-variant));
}

.etat-detail {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.etat-grille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.6);
}

.etat-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.etat-valeur {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-revoir { text-transform: none; }

/* --- Formulaire --- */
.champ-grille {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 20px;
  margin-top: 18px;
  border-radius: 16px;
  border: 2px dashed rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface-variant));
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.drop-zone.a-fichier {
  border-style: solid;
  border-color: rgba(var(--v-theme-primary), 0.4);
  background: rgba(var(--v-theme-primary), 0.04);
}

.drop-zone:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.drop-icone {
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 12px;
}

.drop-titre {
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-detail {
  margin-top: 4px;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.btn-envoyer {
  height: 48px;
  font-weight: 700;
  border-radius: 12px;
  text-transform: none;
}

/* --- État indisponible --- */
.etat-indisponible {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* --- Skeleton --- */
.skeleton-depot {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-bloc {
  border-radius: 16px;
  background: linear-gradient(90deg, rgb(var(--v-theme-outline)) 25%, rgb(var(--v-theme-surface-variant)) 50%, rgb(var(--v-theme-outline)) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-bloc--principal { height: 220px; }
.skeleton-bloc:not(.skeleton-bloc--principal) { height: 160px; }

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* --- Responsive --- */
@media (min-width: 640px) {
  .champ-grille {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .champ-pleine-largeur {
    grid-column: 1 / -1;
  }
}

@media (min-width: 768px) {
  .page-depot {
    max-width: 760px;
    margin: 0 auto;
  }

  .etat-grille {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .page-depot {
    padding: 16px 12px !important;
  }

  .etat-grille {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .carte-sous-titre {
    white-space: normal;
  }

  .statut-badge {
    align-self: flex-start;
  }

  .carte-entete {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-bloc,
  .drop-zone,
  .btn-retour {
    animation: none;
    transition: none;
  }
}
</style>