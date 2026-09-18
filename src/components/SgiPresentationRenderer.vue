<script setup lang="ts">
import { computed } from 'vue'
import {
  BadgeCheck,
  Briefcase,
  Building,
  Globe,
  Handshake,
  Landmark,
  Layers,
  Mail,
  MapPin,
  Phone,
  PieChart,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from '@lucide/vue'

import type { PresentationStructuree } from '@/types'

const ICONES_SERVICES = [Target, TrendingUp, Handshake, ShieldCheck, Briefcase, Landmark, PieChart, Layers]

const props = defineProps<{ presentation: PresentationStructuree }>()

function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean)
  const premieres = mots.slice(0, 2).map((m) => m.charAt(0).toUpperCase())
  return premieres.join('') || '—'
}

function formaterDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('fr-FR')
}

const identite = computed(() => {
  const p = props.presentation
  return {
    faits: [
      p.forme_sociale ? { label: 'Forme sociale', valeur: p.forme_sociale } : null,
      p.date_creation_societe ? { label: 'Date de création', valeur: formaterDate(p.date_creation_societe) } : null,
      p.capital_social ? { label: 'Capital social', valeur: p.capital_social } : null,
    ].filter((e): e is { label: string; valeur: string } => e !== null),
  }
})

const agrement = computed(() => {
  const p = props.presentation
  return {
    faits: [
      p.numero_agrement ? { label: 'Numéro d’agrément', valeur: p.numero_agrement } : null,
      p.date_agrement ? { label: 'Date d’agrément', valeur: formaterDate(p.date_agrement) } : null,
    ].filter((e): e is { label: string; valeur: string } => e !== null),
  }
})

const hero = computed(() => {
  const p = props.presentation
  return {
    visible: Boolean(
      p.est_regule ||
        p.autorite_agrement ||
        p.mission ||
        p.vision ||
        identite.value.faits.length ||
        agrement.value.faits.length,
    ),
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
    <!-- HÉRO : légitimité régulée + mission + fiche d'identité -->
    <header v-if="hero.visible" class="bloc-hero">
      <div class="d-flex align-center flex-wrap gap-6 mb-6">
        <v-chip
          v-if="presentation.est_regule"
          color="success"
          variant="flat"
          size="small"
          class="badge-agreee font-weight-bold"
        >
          <BadgeCheck :size="16" class="mr-2" /> SGI agréée
        </v-chip>
        <span v-if="presentation.autorite_agrement" class="text-body-2 text-medium-emphasis">
          Autorité de tutelle : <strong>{{ presentation.autorite_agrement }}</strong>
        </span>
      </div>

      <p v-if="presentation.mission" class="lead-mission font-display">{{ presentation.mission }}</p>
      <p v-if="presentation.vision" class="lead-vision">{{ presentation.vision }}</p>

      <div v-if="identite.faits.length || agrement.faits.length" class="fiche-identite rounded-2xl">
        <div v-if="identite.faits.length" class="groupe-faits">
          <span class="libelle-groupe">Identité juridique</span>
          <div class="d-flex flex-wrap">
            <div v-for="fait in identite.faits" :key="fait.label" class="fait">
              <div class="fait-label">{{ fait.label }}</div>
              <div class="fait-valeur">{{ fait.valeur }}</div>
            </div>
          </div>
        </div>
        <div v-if="agrement.faits.length" class="groupe-faits">
          <span class="libelle-groupe">Agrément</span>
          <div class="d-flex flex-wrap">
            <div v-for="fait in agrement.faits" :key="fait.label" class="fait">
              <div class="fait-label">{{ fait.label }}</div>
              <div class="fait-valeur">{{ fait.valeur }}</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Domaines d'activité : cartes numérotées -->
    <section v-if="presentation.activites.length" class="bloc-section">
      <div class="section-entete">
        <div class="section-icon">
          <Layers :size="16" />
        </div>
        <h3 class="section-titre font-display">Domaines d'activité</h3>
      </div>
      <div class="grille-services">
        <article
          v-for="(activite, index) in presentation.activites"
          :key="activite.titre"
          class="carte-service rounded-xl pa-5"
        >
          <div class="d-flex align-center mb-4">
            <span class="numero-service font-display">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <component
              :is="ICONES_SERVICES[index % ICONES_SERVICES.length]"
              :size="22"
              class="icone-service"
            />
          </div>
          <h4 class="text-h6 font-weight-bold mb-1">{{ activite.titre }}</h4>
          <p v-if="activite.description" class="text-body-2 text-medium-emphasis mb-0">
            {{ activite.description }}
          </p>
        </article>
      </div>
    </section>

    <!-- Gouvernance et équipe -->
    <section v-if="presentation.membres.length" class="bloc-section">
      <div class="section-entete">
        <div class="section-icon">
          <Users :size="16" />
        </div>
        <h3 class="section-titre font-display">Gouvernance et équipe</h3>
      </div>
      <div class="grille-equipe">
        <article v-for="membre in presentation.membres" :key="membre.nom" class="carte-membre rounded-xl pa-5">
          <div class="avatar-membre font-display" aria-hidden="true">{{ initiales(membre.nom) }}</div>
          <div class="mt-4">
            <div class="font-weight-bold text-body-1">{{ membre.nom }}</div>
            <div v-if="membre.fonction" class="text-caption text-medium-emphasis mt-1 line-clamp-2">
              {{ membre.fonction }}
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Ancrage régional -->
    <section v-if="presentation.ancrage_regional" class="bloc-section">
      <div class="section-entete">
        <div class="section-icon">
          <MapPin :size="16" />
        </div>
        <h3 class="section-titre font-display">Ancrage régional</h3>
      </div>
      <p class="texte-large">{{ presentation.ancrage_regional }}</p>
    </section>

    <!-- Références et réalisations -->
    <section v-if="presentation.references.length" class="bloc-section">
      <div class="section-entete">
        <div class="section-icon">
          <Trophy :size="16" />
        </div>
        <h3 class="section-titre font-display">Références et réalisations</h3>
      </div>
      <div class="liste-references">
        <div
          v-for="reference in presentation.references"
          :key="reference.titre"
          class="reference rounded-lg pa-4"
        >
          <span v-if="reference.annee" class="reference-annee font-display">{{ reference.annee }}</span>
          <div class="flex-grow-1">
            <div class="font-weight-bold">{{ reference.titre }}</div>
            <div v-if="reference.description" class="text-body-2 text-medium-emphasis mt-1">
              {{ reference.description }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact et accès -->
    <section v-if="contact.visible" class="bloc-section">
      <div class="section-entete">
        <div class="section-icon">
          <Building :size="16" />
        </div>
        <h3 class="section-titre font-display">Contact et accès</h3>
      </div>
      <div class="grille-contact">
        <div v-if="contact.adresse" class="tuile-contact rounded-xl pa-4">
          <MapPin :size="18" class="icone-tuile flex-shrink-0" />
          <div>
            <span class="tuile-label">Adresse</span>
            <div class="tuile-valeur">{{ contact.adresse }}</div>
          </div>
        </div>
        <a
          v-if="contact.telephone"
          :href="`tel:${contact.telephone.replace(/\s/g, '')}`"
          class="tuile-contact lien rounded-xl pa-4"
        >
          <Phone :size="18" class="icone-tuile flex-shrink-0" />
          <div>
            <span class="tuile-label">Téléphone</span>
            <div class="tuile-valeur">{{ contact.telephone }}</div>
          </div>
        </a>
        <a
          v-if="contact.email"
          :href="`mailto:${contact.email}`"
          class="tuile-contact lien rounded-xl pa-4"
        >
          <Mail :size="18" class="icone-tuile flex-shrink-0" />
          <div>
            <span class="tuile-label">Email</span>
            <div class="tuile-valeur">{{ contact.email }}</div>
          </div>
        </a>
        <a
          v-if="contact.site_web"
          :href="contact.site_web"
          target="_blank"
          rel="noopener"
          class="tuile-contact lien rounded-xl pa-4"
        >
          <Globe :size="18" class="icone-tuile flex-shrink-0" />
          <div>
            <span class="tuile-label">Site web</span>
            <div class="tuile-valeur">{{ contact.site_web }}</div>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---------- Héro ---------- */
.bloc-hero {
  padding-bottom: 8px;
}

.badge-agreee {
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.lead-mission {
  font-size: clamp(20px, 2.6vw, 26px);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 18px;
  text-wrap: balance;
}

.lead-vision {
  font-size: 16px;
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface-variant));
  border-left: 3px solid rgb(var(--v-theme-secondary));
  padding-left: 16px;
  margin: 0 0 24px;
}

/* ---------- Fiche d'identité ---------- */
.fiche-identite {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  padding: 20px 24px;
}

.groupe-faits {
  min-width: 0;
}

.libelle-groupe {
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 10px;
}

.fait {
  max-width: 100%;
  margin-right: 14px;
  margin-bottom: 8px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.fait-label {
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.fait-valeur {
  font-weight: 700;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

/* ---------- En-têtes de section ---------- */
.bloc-section {
  margin-top: 34px;
}

.section-entete {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.section-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary-lighten-5));
}

.section-titre {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

/* ---------- Domaines d'activité (cartes numérotées) ---------- */
.grille-services {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
}

.carte-service {
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  transition: transform 0.18s ease, border-color 0.18s ease;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.carte-service:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.numero-service {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  color: rgba(var(--v-theme-primary), 0.18);
}

.icone-service {
  color: rgb(var(--v-theme-primary));
}

/* ---------- Gouvernance et équipe ---------- */
.grille-equipe {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.carte-membre {
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  overflow-wrap: anywhere;
  word-break: break-word;
}

.avatar-membre {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-primary));
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
}

/* ---------- Texte éditorial (ancrage régional) ---------- */
.texte-large {
  font-size: 17px;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

/* ---------- Références ---------- */
.liste-references {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reference {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  overflow-wrap: anywhere;
  word-break: break-word;
}

.reference-annee {
  flex-shrink: 0;
  min-width: 58px;
  text-align: center;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

/* ---------- Contact ---------- */
.grille-contact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.tuile-contact {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

a.tuile-contact {
  text-decoration: none;
  color: inherit;
  transition: border-color 0.18s ease;
}

a.tuile-contact:hover {
  border-color: rgba(var(--v-theme-primary), 0.45);
}

.icone-tuile {
  color: rgb(var(--v-theme-primary));
}

.tuile-label {
  display: block;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 2px;
}

.tuile-valeur {
  font-weight: 700;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

/* ---------- Responsive ---------- */
@media (max-width: 560px) {
  .fiche-identite {
    padding: 16px;
  }

  .reference {
    flex-direction: column;
  }
}
</style>