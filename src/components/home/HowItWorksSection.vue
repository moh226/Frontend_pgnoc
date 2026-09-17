<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Plus, FileText, Upload, Eye, CheckCircle, ArrowRight, User, Shield, Bell, Mail } from '@lucide/vue'
import AOS from 'aos'

const activeStep = ref(0)

const steps = [
  {
    number: '01',
    title: 'Créer votre demande',
    description: "L'investisseur sélectionne sa SGI partenaire et lance sa demande d'ouverture de compte-titres en quelques clics. Un espace personnel est créé instantanément.",
    icon: Plus,
    visual: {
      type: 'creation',
      elements: [
        { label: 'Choix de la SGI', icon: Shield, done: true },
        { label: 'Création du dossier', icon: FileText, done: true },
        { label: 'Espace personnel activé', icon: User, done: true },
      ]
    }
  },
  {
    number: '02',
    title: 'Constituer votre dossier',
    description: "L'investisseur renseigne ses informations (identité, situation financière, objectifs) et téléverse les pièces justificatives requises. La plateforme guide à chaque champ.",
    icon: Upload,
    visual: {
      type: 'constitution',
      elements: [
        { label: 'Informations personnelles', icon: User, done: true },
        { label: 'Documents d\'identité', icon: FileText, done: true },
        { label: 'Justificatifs financiers', icon: Shield, done: true },
        { label: 'Signature électronique', icon: CheckCircle, done: false },
      ]
    }
  },
  {
    number: '03',
    title: 'Suivre votre demande',
    description: "L'investisseur suit l'avancement en temps réel : validation KYC, instruction SGI, décision finale. Notifications à chaque étape. La SGI traite le dossier dans son espace dédié.",
    icon: Eye,
    visual: {
      type: 'suivi',
      elements: [
        { label: 'KYC validé', icon: CheckCircle, done: true },
        { label: 'Instruction SGI', icon: Shield, done: true },
        { label: 'Notification décision', icon: Bell, done: false },
        { label: 'Compte ouvert', icon: Mail, done: false },
      ]
    }
  },
]

function getVisualTitle(type: string): string {
  const titles: Record<string, string> = {
    creation: 'Nouvelle demande',
    constitution: 'Constitution du dossier',
    suivi: 'Suivi & notifications',
  }
  return titles[type] || ''
}

function getDoneCount(elements: Array<{ done: boolean }>): number {
  return elements.filter((e) => e.done).length
}

function setActiveStep(index: number) {
  activeStep.value = index
  nextTick(() => {
    AOS.refresh()
  })
}

onMounted(() => {
  AOS.refresh()
})
</script>

<template>
  <section class="how-it-works-section" id="comment-ca-marche" aria-labelledby="how-title" data-aos="fade-up" data-aos-duration="800">
    <div class="section-container">
      <header class="section-header" data-aos="fade-up" data-aos-duration="700" data-aos-delay="0">
        <span class="section-surtitre">
          <span class="surtitre-dot" aria-hidden="true"></span>
          Parcours utilisateur
        </span>
        <h2 id="how-title" class="section-title">
          Comment ça marche en 3 étapes
        </h2>
        <p class="section-lead">
          Un parcours linéaire, guidé et transparent. De la création de la demande à l'ouverture effective du compte.
        </p>
      </header>

      <div class="steps-container" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200">
        <div class="steps-nav" role="tablist" aria-label="Étapes du processus">
          <button
            v-for="(step, index) in steps"
            :key="step.number"
            class="step-nav-btn"
            :class="{ active: activeStep === index }"
            @click="setActiveStep(index)"
            :aria-selected="activeStep === index"
            :aria-controls="`panel-${index}`"
            :id="`tab-${index}`"
            role="tab"
            data-aos="fade-up"
            data-aos-duration="500"
            :data-aos-delay="index * 150 + 100"
          >
            <span class="step-nav-number">{{ step.number }}</span>
            <span class="step-nav-title">{{ step.title }}</span>
            <span class="step-nav-line" aria-hidden="true"></span>
          </button>
        </div>

        <div class="steps-content" role="tabpanel" :aria-labelledby="`tab-${activeStep}`" :id="`panel-${activeStep}`" tabindex="0">
          <div
            v-for="(step, index) in steps"
            :key="step.number"
            class="step-panel"
            v-show="activeStep === index"
          >
            <div class="step-main" data-aos="fade-right" data-aos-duration="600" data-aos-delay="100">
              <div class="step-header">
                <span class="step-badge">{{ step.number }}</span>
                <h3 class="step-title">{{ step.title }}</h3>
              </div>
              <p class="step-description">{{ step.description }}</p>
            </div>

            <div class="step-visual" aria-hidden="true" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="300" data-aos-easing="ease-out-cubic">
              <div class="visual-card">
                <header class="visual-header">
                  <span class="visual-title">{{ getVisualTitle(step.visual.type) }}</span>
                  <span class="visual-progress">{{ getDoneCount(step.visual.elements) }}/{{ step.visual.elements.length }}</span>
                </header>
                <div class="visual-elements">
                  <div
                    v-for="(element, elIndex) in step.visual.elements"
                    :key="elIndex"
                    class="visual-element"
                    :class="{ done: element.done }"
                    data-aos="fade-right"
                    data-aos-duration="500"
                    :data-aos-delay="elIndex * 100 + 400"
                  >
                    <div class="element-checkbox">
                      <component v-if="element.done" :is="CheckCircle" :size="14" aria-hidden="true" />
                      <component v-else :is="element.icon" :size="14" aria-hidden="true" />
                    </div>
                    <span class="element-label">{{ element.label }}</span>
                    <component v-if="!element.done" :is="ArrowRight" :size="14" class="element-next" aria-hidden="true" />
                  </div>
                </div>
                <div class="visual-progress-bar">
                  <div class="progress-fill" :style="{ width: `${(getDoneCount(step.visual.elements) / step.visual.elements.length) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="steps-cta" data-aos="fade-up" data-aos-duration="700" data-aos-delay="400">
        <router-link to="/inscription" class="btn-steps-cta">
          <span>Commencer votre demande</span>
          <ArrowRight :size="18" aria-hidden="true" />
        </router-link>
        <p class="cta-note">Gratuit pour l'investisseur · Aucune carte bancaire requise</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-it-works-section {
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
  margin: 0 auto 60px;
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

/* --- Steps Container --- */
.steps-container {
  min-height: 320px;
}

.steps-nav {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  padding: 8px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
}

.step-nav-btn {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.step-nav-btn:hover {
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.step-nav-btn.active {
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}

.step-nav-number {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface-variant));
  transition: color 0.2s ease;
}

.step-nav-btn.active .step-nav-number {
  color: rgb(var(--v-theme-primary));
}

.step-nav-title {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  text-align: center;
  transition: color 0.2s ease;
}

.step-nav-btn.active .step-nav-title {
  color: rgb(var(--v-theme-on-surface));
}

.step-nav-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 3px;
  border-radius: 999px 999px 0 0;
  background: rgb(var(--v-theme-primary));
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.step-nav-btn.active .step-nav-line {
  transform: translateX(-50%) scaleX(1);
}

/* --- Step Panels --- */
.steps-content {
  min-height: 320px;
}

.step-panel {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 48px;
  align-items: start;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.step-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
}

.step-description {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface-variant));
  max-width: 480px;
}

/* --- Visual Card --- */
.step-visual {
  position: sticky;
  top: 100px;
}

.visual-card {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
  overflow: hidden;
}

.visual-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.visual-title {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.visual-progress {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.visual-elements {
  padding: 16px 20px;
}

.visual-element {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.03);
  transition: background-color 0.2s ease;
}

.visual-element.done {
  background: rgba(var(--v-theme-success), 0.06);
}

.element-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  color: rgb(var(--v-theme-on-surface-variant));
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  transition: all 0.2s ease;
}

.visual-element.done .element-checkbox {
  color: rgb(var(--v-theme-on-success));
  background: rgb(var(--v-theme-success));
  border-color: rgb(var(--v-theme-success));
}

.element-label {
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  flex: 1;
}

.visual-element.done .element-label {
  color: rgb(var(--v-theme-success));
}

.element-next {
  flex-shrink: 0;
  color: rgb(var(--v-theme-outline-variant));
  transition: color 0.2s ease, transform 0.2s ease;
}

.visual-element:not(.done):hover .element-next {
  color: rgb(var(--v-theme-primary));
  transform: translateX(3px);
}

.visual-progress-bar {
  height: 4px;
  background: rgba(var(--v-theme-primary), 0.1);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 0;
  background: rgb(var(--v-theme-primary));
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* --- Steps CTA --- */
.steps-cta {
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.btn-steps-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  padding: 16px 36px;
  border-radius: 12px;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.btn-steps-cta:hover {
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.35);
  transform: translateY(-2px);
}

.cta-note {
  margin: 16px 0 0;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

@media (max-width: 900px) {
  .step-panel {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .step-visual {
    position: static;
    max-width: 420px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .how-it-works-section {
    padding: 96px 20px;
  }

  .section-header {
    margin-bottom: 48px;
  }

  .steps-nav {
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px;
  }

  .step-nav-btn {
    flex: 1 1 calc(50% - 4px);
    min-width: 140px;
    padding: 16px 12px;
  }

  .step-nav-title {
    font-size: 12px;
  }

  .step-title {
    font-size: 20px;
  }

  .step-description {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .steps-nav {
    flex-direction: column;
  }

  .step-nav-btn {
    flex-direction: row;
    justify-content: flex-start;
    gap: 14px;
    text-align: left;
    min-width: 0;
  }

  .step-nav-line {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-panel,
  .visual-element,
  .progress-fill,
  .steps-cta,
  .step-nav-line {
    transition: none;
  }

  .step-nav-line {
    transform: translateX(-50%) scaleX(0);
  }

  .step-nav-btn.active .step-nav-line {
    transform: translateX(-50%) scaleX(1);
  }
}
</style>