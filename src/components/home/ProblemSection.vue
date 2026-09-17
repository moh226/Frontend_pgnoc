<script setup lang="ts">
import { FileText, Clock, EyeOff, Users, ShieldAlert } from '@lucide/vue'

const problems = [
  {
    icon: FileText,
    title: 'Processus dispersé',
    description: 'Les informations et documents peuvent être transmis par différents canaux — email, courrier, dépôt physique — créant de la confusion et des pertes de temps pour toutes les parties.',
    accent: 'primary'
  },
  {
    icon: Clock,
    title: 'Documents multiples et redondants',
    description: "L'investisseur doit fournir plusieurs justificatifs identiques selon les interlocuteurs, sans visibilité sur ce qui a déjà été transmis ou validé.",
    accent: 'secondary'
  },
  {
    icon: EyeOff,
    title: 'Manque de visibilité',
    description: "Une fois le dossier déposé, l'investisseur n'a aucun moyen de savoir où en est son instruction. Aucune notification, aucun suivi, aucune transparence.",
    accent: 'success'
  },
  {
    icon: Users,
    title: 'Traitement manuel côté SGI',
    description: 'Les agents SGI doivent vérifier manuellement chaque information, croiser les documents, relancer les investisseurs — un processus lent, coûteux et source d\'erreurs.',
    accent: 'warning'
  },
]
</script>

<template>
  <section class="problem-section" id="probleme" aria-labelledby="problem-title" data-aos="fade-up" data-aos-duration="800">
    <div class="section-container">
      <header class="section-header" data-aos="fade-up" data-aos-duration="700" data-aos-delay="0">
        <span class="section-surtitre">
          <span class="surtitre-dot" aria-hidden="true"></span>
          Le constat
        </span>
        <h2 id="problem-title" class="section-title">
          L'ouverture d'un compte-titres ne devrait pas être aussi complexe.
        </h2>
        <p class="section-lead">
          Aujourd'hui, investisseurs et SGI font face à un parcours semé d'embûches. Voici ce qui bloque réellement le processus.
        </p>
        <div class="section-divider" aria-hidden="true">
          <span class="divider-line"></span>
          <span class="divider-accent"></span>
        </div>
      </header>

      <div class="problems-grid" role="list" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200">
        <article
          v-for="(problem, index) in problems"
          :key="problem.title"
          class="problem-card"
          :style="{ transitionDelay: `${index * 120}ms` }"
          role="listitem"
          data-aos="fade-up"
          data-aos-duration="600"
          :data-aos-delay="index * 150 + 300"
        >
          <div class="problem-icon" :class="`accent-${problem.accent}`">
            <component :is="problem.icon" :size="24" aria-hidden="true" />
          </div>

          <h3 class="problem-title">{{ problem.title }}</h3>

          <p class="problem-description">{{ problem.description }}</p>

          <div class="problem-underline" :class="`accent-${problem.accent}`" aria-hidden="true"></div>
        </article>
      </div>

      <div class="problem-summary" data-aos="fade-up" data-aos-duration="700" data-aos-delay="800">
        <div class="summary-card">
          <div class="summary-icon">
            <ShieldAlert :size="20" aria-hidden="true" />
          </div>
          <div class="summary-content">
            <h3>Un coût réel pour l'écosystème</h3>
            <p>Délais d'instruction allongés, risques d'erreurs de saisie, insatisfaction client, non-conformité réglementaire. Chaque jour sans solution numérique coûte du temps, de l'argent et de la confiance.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.problem-section {
  position: relative;
  padding: 120px 32px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 80px;
}

.section-surtitre {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.surtitre-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-secondary));
}

.section-title {
  margin: 0 0 16px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: rgb(var(--v-theme-on-surface));
  text-wrap: balance;
}

.section-lead {
  margin: 0;
  font-size: clamp(16px, 1.3vw, 19px);
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface-variant));
}

.section-divider {
  position: relative;
  width: 100px;
  height: 4px;
  margin: 28px auto 0;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  overflow: hidden;
}

.divider-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 30%;
  border-radius: 999px;
  background: rgb(var(--v-theme-secondary));
}

/* --- Problems Grid --- */
.problems-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  max-width: 1040px;
  margin: 0 auto 60px;
}

.problem-card {
  position: relative;
  padding: 40px 32px;
  border-radius: 20px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.problem-card:hover {
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.problem-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.problem-card:hover .problem-icon {
  transform: scale(1.08) rotate(-3deg);
}

.problem-icon.accent-primary {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.problem-icon.accent-secondary {
  background: rgba(var(--v-theme-secondary), 0.14);
  color: rgb(var(--v-theme-on-secondary));
}

.problem-icon.accent-success {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.problem-icon.accent-warning {
  background: rgba(var(--v-theme-warning), 0.12);
  color: rgb(var(--v-theme-warning));
}

.problem-title {
  margin: 0 0 12px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
}

.problem-description {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface-variant));
}

.problem-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0 0 20px 20px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.problem-card:hover .problem-underline {
  transform: scaleX(1);
}

.problem-underline.accent-primary {
  background: rgb(var(--v-theme-primary));
}

.problem-underline.accent-secondary {
  background: rgb(var(--v-theme-secondary));
}

.problem-underline.accent-success {
  background: rgb(var(--v-theme-success));
}

.problem-underline.accent-warning {
  background: rgb(var(--v-theme-warning));
}

/* --- Summary --- */
.problem-summary {
  max-width: 1040px;
  margin: 0 auto;
}

.summary-card {
  display: flex;
  gap: 20px;
  padding: 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.summary-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 13px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.summary-content h3 {
  margin: 0 0 8px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.summary-content p {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface-variant));
}

@media (max-width: 900px) {
  .problems-grid {
    grid-template-columns: 1fr;
    max-width: 520px;
  }

  .problem-card {
    padding: 32px 28px;
  }
}

@media (max-width: 600px) {
  .problem-section {
    padding: 96px 20px;
  }

  .section-header {
    margin-bottom: 56px;
  }

  .problem-card {
    padding: 28px 24px;
  }

  .summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .problem-card,
  .problem-underline,
  .problem-icon {
    transition: none;
  }

  .problem-underline {
    transform: scaleX(1);
  }
}
</style>