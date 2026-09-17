<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Circle, Clock, FileCheck, FileSignature, Send, ShieldCheck, XCircle } from '@lucide/vue'

import type { StatutDossier } from '@/types'

interface Props {
  statut: StatutDossier
  progression: number
  dateCreation?: string | null
  dateSoumission?: string | null
  dateInstruction?: string | null
  dateDecision?: string | null
}

const props = defineProps<Props>()

interface EtapeTimeline {
  code: string
  titre: string
  description: string
  icone: typeof Circle
  atteinte: boolean
  actuelle: boolean
  date?: string | null
}

const etapes = computed<EtapeTimeline[]>(() => {
  const statut = props.statut
  const rejete = statut === 'REJETE'
  const progression = props.progression

  // Position logique selon le statut réel du dossier.
  const rang: Record<StatutDossier, number> = {
    BROUILLON: 0,
    SOUMIS: 2,
    EN_INSTRUCTION: 3,
    VALIDE: 4,
    ACTIF: 4,
    REJETE: 2,
  }
  const positionCourante = rang[statut] ?? 0

  const base: Omit<EtapeTimeline, 'atteinte' | 'actuelle'>[] = [
    {
      code: 'creation',
      titre: 'Demande créée',
      description: 'Espace dossier ouvert',
      icone: FileSignature,
      date: props.dateCreation,
    },
    {
      code: 'informations',
      titre: 'Informations complétées',
      description: 'Formulaire KYC renseigné',
      icone: FileCheck,
      date: null,
    },
    {
      code: 'documents',
      titre: 'Documents transmis',
      description: 'Pièces justificatives envoyées',
      icone: Send,
      date: props.dateSoumission,
    },
    {
      code: 'verification',
      titre: 'Vérification SGI',
      description: 'Instruction du dossier en cours',
      icone: ShieldCheck,
      date: props.dateInstruction,
    },
    {
      code: 'validation',
      titre: rejete ? 'Décision rendue' : 'Validation',
      description: rejete ? 'Corrections demandées' : 'Compte-titres ouvert',
      icone: rejete ? XCircle : CheckCircle2,
      date: props.dateDecision,
    },
  ]

  return base.map((etape, index) => ({
    ...etape,
    atteinte: index <= positionCourante || (index <= 1 && progression >= 100 && positionCourante >= 0),
    actuelle: index === positionCourante,
  }))
})

const estRejete = computed(() => props.statut === 'REJETE')
</script>

<template>
  <div class="timeline-dossier" :class="{ 'est-rejete': estRejete }" role="list" aria-label="Étapes de la demande">
    <div
      v-for="(etape, index) in etapes"
      :key="etape.code"
      class="timeline-etape"
      :class="{ atteinte: etape.atteinte, actuelle: etape.actuelle, derniere: index === etapes.length - 1 }"
      role="listitem"
      :data-aos="'fade-up'"
      :data-aos-delay="index * 80"
      data-aos-duration="450"
    >
      <div class="etape-rail" aria-hidden="true">
        <div class="etape-pastille">
          <component :is="etape.atteinte ? (etape.actuelle ? etape.icone : CheckCircle2) : Circle" :size="16" />
        </div>
        <span v-if="index < etapes.length - 1" class="etape-ligne" :class="{ remplie: etapes[index + 1].atteinte }"></span>
      </div>

      <div class="etape-contenu">
        <div class="etape-entete">
          <span class="etape-numero">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="etape-titre">{{ etape.titre }}</span>
        </div>
        <p class="etape-description">{{ etape.description }}</p>
        <span v-if="etape.date" class="etape-date">
          <Clock :size="11" class="mr-1" />
          {{ new Date(etape.date).toLocaleDateString('fr-FR') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-dossier {
  display: flex;
  flex-direction: column;
}

.timeline-etape {
  display: flex;
  gap: 16px;
  min-height: 72px;
}

.etape-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
}

.etape-pastille {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface-variant));
  border: 2px solid rgb(var(--v-theme-outline));
  color: rgb(var(--v-theme-on-surface-variant));
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.timeline-etape.atteinte .etape-pastille {
  background: rgba(var(--v-theme-success), 0.12);
  border-color: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-success));
}

.timeline-etape.actuelle .etape-pastille {
  background: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.15);
  animation: pulse-etape 2s ease-in-out infinite;
}

@keyframes pulse-etape {
  0%, 100% { box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.15); }
  50% { box-shadow: 0 0 0 8px rgba(var(--v-theme-primary), 0.08); }
}

.timeline-dossier.est-rejete .timeline-etape.actuelle .etape-pastille {
  background: rgb(var(--v-theme-error));
  border-color: rgb(var(--v-theme-error));
  box-shadow: 0 0 0 4px rgba(228, 0, 43, 0.15);
}

.etape-ligne {
  flex: 1;
  width: 2px;
  min-height: 24px;
  margin: 4px 0;
  background: rgb(var(--v-theme-outline));
  border-radius: 999px;
  transition: background-color 0.4s ease;
}

.etape-ligne.remplie {
  background: rgb(var(--v-theme-success));
}

.etape-contenu {
  flex: 1;
  min-width: 0;
  padding-bottom: 20px;
}

.etape-entete {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.etape-numero {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.6;
}

.etape-titre {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.timeline-etape.atteinte .etape-titre {
  color: rgb(var(--v-theme-on-surface));
}

.timeline-etape.actuelle .etape-titre {
  color: rgb(var(--v-theme-primary));
}

.timeline-dossier.est-rejete .timeline-etape.actuelle .etape-titre {
  color: rgb(var(--v-theme-error));
}

.etape-description {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface-variant));
}

.etape-date {
  display: inline-flex;
  align-items: center;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

@media (prefers-reduced-motion: reduce) {
  .etape-pastille {
    animation: none;
    transition: none;
  }

  .etape-ligne {
    transition: none;
  }
}
</style>