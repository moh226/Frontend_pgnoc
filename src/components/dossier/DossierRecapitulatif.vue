<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Lock, PencilLine } from '@lucide/vue'
import type { ChampKyc, EtapeKyc, ValeurChamp } from '@/types'

/**
 * Récapitulatif structuré du dossier avant signature / résoumission.
 *
 * Étape dédiée du parcours (entre la saisie et la validation finale) :
 * l'investisseur relit ses réponses étape par étape, voit les valeurs
 * verrouillées (conservées telles quelles), les champs signalés par
 * l'agent avec leur commentaire, peut y retourner en un clic, puis
 * confirme l'exactitude pour débloquer la signature / la résoumission.
 */
const props = defineProps<{
  etapes: EtapeKyc[]
  valeurs: Record<string, ValeurChamp>
  champVerrouille: (champ: ChampKyc) => boolean
}>()

const emit = defineEmits<{
  (e: 'corriger', champ: ChampKyc): void
}>()

interface LigneRecap {
  champ: ChampKyc
  valeur: ValeurChamp | undefined
}

interface SectionRecap {
  etape: EtapeKyc
  lignes: LigneRecap[]
  renseignes: number
  total: number
  aCorriger: number
}

const sections = computed<SectionRecap[]>(() =>
  props.etapes.map((etape) => {
    const lignes = etape.champs
      .filter(champVisible)
      .map((champ) => ({ champ, valeur: props.valeurs[champ.id] }))
    return {
      etape,
      lignes,
      renseignes: lignes.filter((l) => valeurRenseignee(l)).length,
      total: lignes.length,
      aCorriger: lignes.filter((l) => Boolean(l.valeur?.commentaire_agent)).length,
    }
  }),
)

// La légende des champs verrouillés n'a de sens que s'il y en a : sur
// une première soumission (BROUILLON), aucun champ n'est figé et la
// note serait du bruit.
const aDesVerrouilles = computed(() =>
  sections.value.some((s) => s.lignes.some((l) => props.champVerrouille(l.champ))),
)

function champVisible(champ: ChampKyc): boolean {
  // Champ conditionnel : affiché dans le récapitulatif uniquement si la
  // condition est déclenchée par la valeur saisie dans CE dossier.
  if (!champ.champ_parent) return true
  return props.valeurs[champ.champ_parent]?.valeur === champ.valeur_declencheur
}

function valeurRenseignee(ligne: LigneRecap): boolean {
  const { champ, valeur } = ligne
  if (champ.type === 'FICHIER' || champ.type === 'SELFIE') return Boolean(valeur?.fichier)
  return Boolean(valeur?.valeur?.trim())
}

function valeurAffichee(ligne: LigneRecap): string {
  const { champ, valeur } = ligne
  if (!valeur) return 'Non renseigné'
  if (champ.type === 'FICHIER' || champ.type === 'SELFIE') return 'Document téléversé'
  if (champ.type === 'BOOLEEN') return valeur.valeur === 'oui' ? 'Oui' : 'Non'
  if (champ.type === 'CHOIX_MULTIPLE') {
    try {
      const liste = JSON.parse(valeur.valeur ?? '')
      return Array.isArray(liste) && liste.length ? liste.join(', ') : 'Non renseigné'
    } catch {
      return valeur.valeur?.trim() || 'Non renseigné'
    }
  }
  return valeur.valeur?.trim() ? valeur.valeur : 'Non renseigné'
}
</script>

<template>
  <div class="recapitulatif">
    <!-- Pas de bandeau redondant : les instructions sont dans le
         sous-titre de l'en-tête, l'état par section dans les chips des
         cartes, et le décompte des corrections dans le footer. Ici, on
         va droit au contenu : les cartes. -->

    <!-- Une carte par étape KYC, champs visibles uniquement -->
    <v-card
      v-for="(section, i) in sections"
      :key="section.etape.id"
      variant="outlined"
      class="mb-5 bg-surface"
    >
      <div class="recap-entete d-flex align-center flex-wrap ga-3">
        <div class="num-etape flex-shrink-0 d-flex align-center justify-center font-weight-bold">
          {{ i + 1 }}
        </div>
        <div class="flex-grow-1">
          <div class="text-body-1 font-weight-bold">{{ section.etape.nom }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ section.renseignes }} / {{ section.total }} renseignés
          </div>
        </div>
        <v-chip v-if="section.aCorriger" color="warning" variant="tonal" size="small">
          <AlertTriangle :size="14" class="mr-1" />
          {{ section.aCorriger === 1 ? '1 à corriger' : `${section.aCorriger} à corriger` }}
        </v-chip>
        <v-chip v-else-if="section.renseignes === section.total" color="success" variant="tonal" size="small">
          <CheckCircle2 :size="14" class="mr-1" /> Complète
        </v-chip>
        <v-chip v-else color="grey" variant="tonal" size="small">Incomplète</v-chip>
      </div>

      <div>
        <div
          v-for="ligne in section.lignes"
          :key="ligne.champ.id"
          class="recap-ligne"
          :class="{ 'recap-ligne--corriger': Boolean(ligne.valeur?.commentaire_agent) }"
        >
          <div class="recap-label">
            {{ ligne.champ.nom }}
            <span v-if="ligne.champ.obligatoire" class="text-error">*</span>
          </div>
          <div class="recap-valeur" :class="{ 'text-medium-emphasis': !valeurRenseignee(ligne) }">
            {{ valeurAffichee(ligne) }}
          </div>
          <div class="recap-statut">
            <v-chip v-if="ligne.valeur?.commentaire_agent" color="warning" size="x-small" variant="tonal">
              À corriger
            </v-chip>
            <v-chip v-else-if="ligne.valeur?.est_corrige" color="success" size="x-small" variant="tonal">
              Corrigé
            </v-chip>
            <v-chip v-else-if="champVerrouille(ligne.champ)" color="grey" size="x-small" variant="tonal">
              <Lock :size="12" class="mr-1" /> Verrouillé
            </v-chip>
          </div>

          <!-- Retour de l'agent + retour-correction en un clic -->
          <div v-if="ligne.valeur?.commentaire_agent" class="recap-commentaire">
            <v-alert type="warning" variant="tonal" density="compact" class="flex-grow-1 border-l-4">
              « {{ ligne.valeur.commentaire_agent }} »
            </v-alert>
            <v-btn
              size="small"
              color="primary"
              variant="tonal"
              class="ml-3 text-none font-weight-bold flex-shrink-0"
              @click="emit('corriger', ligne.champ)"
            >
              <PencilLine :size="14" class="mr-1" /> Corriger
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <p v-if="aDesVerrouilles" class="text-caption text-medium-emphasis d-flex align-center">
      <Lock :size="14" class="mr-1 flex-shrink-0" />
      Les champs « Verrouillés » ont été validés lors de la relecture : leurs
      valeurs sont conservées telles quelles et ne sont plus modifiables.
    </p>
  </div>
</template>

<style scoped>
.recap-entete {
  padding: 16px 20px;
}

.num-etape {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 0.9rem;
}

.recap-ligne {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) 2fr auto;
  gap: 8px 16px;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.4);
  transition: background-color 0.15s ease;
}

.recap-ligne:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.03);
}

.recap-ligne--corriger {
  border-left: 3px solid rgb(var(--v-theme-warning));
  background-color: rgba(var(--v-theme-warning), 0.04);
}

.recap-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.recap-valeur {
  font-size: 0.875rem;
  word-break: break-word;
}

.recap-statut {
  justify-self: end;
}

.recap-commentaire {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .recap-ligne {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .recap-statut {
    justify-self: start;
  }
}
</style>
