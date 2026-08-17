<script setup lang="ts">
import { computed } from 'vue'
import { Building2, BadgeCheck, Target, Lightbulb, Layers, Users, MapPin, Trophy, Phone, Mail, Globe, Building } from '@lucide/vue'

import type { PresentationStructuree } from '@/types'

const props = defineProps<{ presentation: PresentationStructuree }>()

const identite = computed(() => {
  const p = props.presentation
  return {
    visible: Boolean(p.forme_sociale || p.date_creation_societe || p.capital_social),
    items: [
      p.forme_sociale ? { label: 'Forme sociale', valeur: p.forme_sociale } : null,
      p.date_creation_societe
        ? {
            label: 'Date de création',
            valeur: new Date(p.date_creation_societe + 'T00:00:00').toLocaleDateString('fr-FR'),
          }
        : null,
      p.capital_social ? { label: 'Capital social', valeur: p.capital_social } : null,
    ].filter((e): e is { label: string; valeur: string } => e !== null),
  }
})

const agrement = computed(() => {
  const p = props.presentation
  return {
    visible: Boolean(
      p.numero_agrement ||
        p.date_agrement ||
        p.autorite_agrement ||
        p.est_regule,
    ),
    items: [
      p.numero_agrement ? { label: 'Numéro d’agrément', valeur: p.numero_agrement } : null,
      p.date_agrement
        ? {
            label: 'Date d’agrément',
            valeur: new Date(p.date_agrement + 'T00:00:00').toLocaleDateString('fr-FR'),
          }
        : null,
      p.autorite_agrement ? { label: 'Autorité', valeur: p.autorite_agrement } : null,
    ].filter((e): e is { label: string; valeur: string } => e !== null),
  }
})

const contact = computed(() => {
  const p = props.presentation
  return {
    visible: Boolean(p.adresse || p.telephone || p.email_contact || p.site_web),
    adresse: p.adresse,
    telephone: p.telephone,
    email: p.email_contact,
    site_web: p.site_web,
  }
})
</script>

<template>
  <div class="presentation-renderer">
    <!-- Identité juridique -->
    <section v-if="identite.visible" class="mb-7">
      <div class="d-flex align-center mb-3">
        <div class="section-icon mr-3">
          <Building2 :size="18" />
        </div>
        <h3 class="text-h6 font-display font-weight-bold mb-0">Identité juridique</h3>
      </div>
      <div class="d-flex flex-wrap">
        <div
          v-for="element in identite.items"
          :key="element.label"
          class="fact-chip mr-3 mb-2 pa-3 rounded-lg bg-surface-variant"
        >
          <div class="text-caption text-medium-emphasis">{{ element.label }}</div>
          <div class="font-weight-bold">{{ element.valeur }}</div>
        </div>
      </div>
    </section>

    <!-- Agrément réglementaire -->
    <section v-if="agrement.visible" class="mb-7">
      <div class="d-flex align-center mb-3">
        <div class="section-icon mr-3">
          <BadgeCheck :size="18" />
        </div>
        <h3 class="text-h6 font-display font-weight-bold mb-0">Acteur régulé</h3>
        <v-chip v-if="presentation.est_regule" color="success" size="small" variant="tonal" class="ml-3">
          Agréé AMF-UEMOA
        </v-chip>
      </div>
      <div class="d-flex flex-wrap">
        <div
          v-for="element in agrement.items"
          :key="element.label"
          class="fact-chip mr-3 mb-2 pa-3 rounded-lg bg-surface-variant"
        >
          <div class="text-caption text-medium-emphasis">{{ element.label }}</div>
          <div class="font-weight-bold">{{ element.valeur }}</div>
        </div>
      </div>
    </section>

    <!-- Mission / Vision -->
    <template v-if="presentation.mission || presentation.vision">
      <section v-if="presentation.mission" class="mb-7">
        <div class="d-flex align-center mb-2">
          <div class="section-icon mr-3">
            <Target :size="18" />
          </div>
          <h3 class="text-h6 font-display font-weight-bold mb-0">Notre mission</h3>
        </div>
        <p class="text-body-1 mb-0">{{ presentation.mission }}</p>
      </section>
      <section v-if="presentation.vision" class="mb-7">
        <div class="d-flex align-center mb-2">
          <div class="section-icon mr-3">
            <Lightbulb :size="18" />
          </div>
          <h3 class="text-h6 font-display font-weight-bold mb-0">Notre vision</h3>
        </div>
        <p class="text-body-1 mb-0">{{ presentation.vision }}</p>
      </section>
    </template>

    <!-- Domaines d'activité -->
    <section v-if="presentation.activites.length" class="mb-7">
      <div class="d-flex align-center mb-3">
        <div class="section-icon mr-3">
          <Layers :size="18" />
        </div>
        <h3 class="text-h6 font-display font-weight-bold mb-0">Domaines d'activité</h3>
      </div>
      <v-row>
        <v-col
          v-for="activite in presentation.activites"
          :key="activite.titre"
          cols="12"
          md="4"
          class="pb-0"
        >
          <div class="activite-card pa-4 rounded-lg bg-surface-variant h-100">
            <div class="font-weight-bold text-primary mb-1">{{ activite.titre }}</div>
            <div v-if="activite.description" class="text-body-2 text-medium-emphasis">
              {{ activite.description }}
            </div>
          </div>
        </v-col>
      </v-row>
    </section>

    <!-- Gouvernance et équipe -->
    <section v-if="presentation.membres.length" class="mb-7">
      <div class="d-flex align-center mb-3">
        <div class="section-icon mr-3">
          <Users :size="18" />
        </div>
        <h3 class="text-h6 font-display font-weight-bold mb-0">Gouvernance et équipe</h3>
      </div>
      <div class="d-flex flex-wrap">
        <div
          v-for="membre in presentation.membres"
          :key="membre.nom"
          class="membre-card mr-3 mb-3 pa-4 rounded-lg bg-surface-variant"
        >
          <div class="font-weight-bold">{{ membre.nom }}</div>
          <div v-if="membre.fonction" class="text-caption text-medium-emphasis">
            {{ membre.fonction }}
          </div>
        </div>
      </div>
    </section>

    <!-- Ancrage régional -->
    <section v-if="presentation.ancrage_regional" class="mb-7">
      <div class="d-flex align-center mb-2">
        <div class="section-icon mr-3">
          <MapPin :size="18" />
        </div>
        <h3 class="text-h6 font-display font-weight-bold mb-0">Ancrage régional</h3>
      </div>
      <p class="text-body-1 mb-0">{{ presentation.ancrage_regional }}</p>
    </section>

    <!-- Références / réalisations -->
    <section v-if="presentation.references.length" class="mb-7">
      <div class="d-flex align-center mb-3">
        <div class="section-icon mr-3">
          <Trophy :size="18" />
        </div>
        <h3 class="text-h6 font-display font-weight-bold mb-0">Références et réalisations</h3>
      </div>
      <v-list density="compact" class="bg-transparent pa-0">
        <v-list-item v-for="reference in presentation.references" :key="reference.titre" class="px-0">
          <v-list-item-title class="font-weight-medium">
            {{ reference.titre }}
            <v-chip v-if="reference.annee" size="x-small" variant="tonal" class="ml-2">
              {{ reference.annee }}
            </v-chip>
          </v-list-item-title>
          <v-list-item-subtitle v-if="reference.description">
            {{ reference.description }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </section>

    <!-- Contact et accès -->
    <section v-if="contact.visible" class="mb-2">
      <div class="d-flex align-center mb-3">
        <div class="section-icon mr-3">
          <Building :size="18" />
        </div>
        <h3 class="text-h6 font-display font-weight-bold mb-0">Contact et accès</h3>
      </div>
      <div class="d-flex flex-column gap-2">
        <div v-if="contact.adresse" class="d-flex align-center text-body-2">
          <MapPin :size="15" class="mr-2 text-medium-emphasis" /> {{ contact.adresse }}
        </div>
        <a v-if="contact.telephone" :href="`tel:${contact.telephone.replace(/\s/g, '')}`" class="d-flex align-center text-body-2 text-decoration-none text-on-surface">
          <Phone :size="15" class="mr-2 text-medium-emphasis" /> {{ contact.telephone }}
        </a>
        <a v-if="contact.email" :href="`mailto:${contact.email}`" class="d-flex align-center text-body-2 text-decoration-none text-on-surface">
          <Mail :size="15" class="mr-2 text-medium-emphasis" /> {{ contact.email }}
        </a>
        <a v-if="contact.site_web" :href="contact.site_web" target="_blank" rel="noopener" class="d-flex align-center text-body-2 text-decoration-none text-on-surface">
          <Globe :size="15" class="mr-2 text-medium-emphasis" /> {{ contact.site_web }}
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.section-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary-lighten-5));
}

.fact-chip {
  min-width: 140px;
}

.gap-2 {
  gap: 10px;
}
</style>