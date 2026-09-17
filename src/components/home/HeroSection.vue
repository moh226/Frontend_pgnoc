<script setup lang="ts">
import { ArrowRight, LogIn, BadgeCheck, Fingerprint, Landmark, ShieldCheck, FileText, Clock, UserCheck, Search } from '@lucide/vue'

const trustItems = [
  { icon: ShieldCheck, label: 'Transaction sécurisée' },
  { icon: Fingerprint, label: 'KYC renforcé' },
  { icon: BadgeCheck, label: '100 % dématérialisé' },
  { icon: Search, label: 'Traçabilité complète' },
]

const mockupSteps = [
  { icon: BadgeCheck, label: 'Informations validées', done: true },
  { icon: BadgeCheck, label: 'Documents transmis', done: true },
  { icon: UserCheck, label: 'KYC vérifié', done: true },
  { icon: Clock, label: 'Validation SGI', done: false },
]
</script>

<template>
  <section class="hero-section" aria-labelledby="hero-title" data-aos="fade-up" data-aos-duration="800" data-aos-easing="ease-out-cubic">
    <div class="hero-background" aria-hidden="true">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="grid-pattern"></div>
    </div>

    <div class="hero-container">
      <div class="hero-grid">
        <div class="hero-content">
          <div class="hero-label" data-aos="fade-up" data-aos-duration="700" data-aos-delay="0">
            <span class="label-content">
              <Landmark :size="13" aria-hidden="true" />
              PLATEFORME DIGITALE POUR LES SGI ET INVESTISSEURS
            </span>
          </div>

          <h1 id="hero-title" class="hero-title" data-aos="fade-up" data-aos-duration="700" data-aos-delay="150">
            L'ouverture de votre compte-titres, simplement.
          </h1>

          <p class="hero-description" data-aos="fade-up" data-aos-duration="700" data-aos-delay="300">
            PGNOC-TI simplifie le processus d'ouverture de compte-titres en permettant aux investisseurs de constituer leur dossier et de suivre son traitement depuis une plateforme unique, sécurisée et conforme.
          </p>

          <div class="hero-cta" data-aos="fade-up" data-aos-duration="700" data-aos-delay="450">
            <router-link to="/inscription" class="btn-hero-primary">
              <span>Commencer une demande</span>
              <ArrowRight :size="18" aria-hidden="true" />
            </router-link>
            <router-link to="/login" class="btn-hero-secondary">
              <LogIn :size="17" aria-hidden="true" />
              <span>Découvrir la plateforme</span>
            </router-link>
          </div>

          <div class="hero-trust" data-aos="fade-up" data-aos-duration="700" data-aos-delay="600">
            <div v-for="item in trustItems" :key="item.label" class="trust-item">
              <component :is="item.icon" :size="15" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="600" data-aos-easing="ease-out-cubic">
          <div class="visual-stack">
            <div class="stack-card stack-back-2"></div>
            <div class="stack-card stack-back-1"></div>
            <div class="product-mockup">
              <header class="mockup-header">
                <div class="mockup-title-block">
                  <span class="mockup-reference">Demande d'ouverture de compte-titres</span>
                  <span class="mockup-subtitle">Réf. PGNOC-2026-0042</span>
                </div>
                <span class="status-badge status-in-progress">En instruction</span>
              </header>

              <div class="mockup-body">
                <div class="mockup-row">
                  <span class="mockup-label">Partenaire SGI</span>
                  <span class="mockup-value">
                    <Landmark :size="14" aria-hidden="true" />
                    SGI UEMOA
                  </span>
                </div>
                <div class="mockup-row">
                  <span class="mockup-label">Étape actuelle</span>
                  <span class="mockup-value">
                    <Search :size="14" aria-hidden="true" />
                    KYC · Vérifications
                  </span>
                </div>

                <div class="progress-block">
                  <div class="progress-header">
                    <span class="mockup-label">Avancement du dossier</span>
                    <span class="progress-value">76 %</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 76%"></div>
                  </div>
                </div>

                <div class="steps-list">
                  <div v-for="(step, index) in mockupSteps" :key="index" class="step-item" :class="{ done: step.done }" data-aos="fade-right" data-aos-duration="500" :data-aos-delay="index * 100 + 700">
                    <component :is="step.icon" :size="14" class="step-icon" aria-hidden="true" />
                    <span class="step-label">{{ step.label }}</span>
                  </div>
                </div>
              </div>

              <footer class="mockup-footer">
                <span class="mini-badge badge-success" data-aos="fade-up" data-aos-duration="500" data-aos-delay="1100">
                  <BadgeCheck :size="12" aria-hidden="true" />
                  KYC validé
                </span>
                <span class="mini-badge badge-warning" data-aos="fade-up" data-aos-duration="500" data-aos-delay="1200">
                  <FileText :size="12" aria-hidden="true" />
                  Convention signée
                </span>
              </footer>
            </div>

            <div class="floating-card" data-aos="fade-up" data-aos-duration="800" data-aos-delay="1300">
              <div class="floating-icon">
                <FileText :size="16" aria-hidden="true" />
              </div>
              <div class="floating-content">
                <strong>Dossiers tracés de bout en bout</strong>
                <small>Chaque action est horodatée et auditée</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hero-scroll-indicator" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 140px 32px 100px;
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
  color: rgb(var(--v-theme-on-surface));
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.4;
}

.orb-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -200px;
  background: rgb(var(--v-theme-primary));
}

.orb-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
  background: rgb(var(--v-theme-secondary));
  opacity: 0.3;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(var(--v-theme-primary), 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--v-theme-primary), 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.95fr;
  gap: 80px;
  align-items: center;
}

/* --- Hero Content --- */
.hero-content {
  max-width: 640px;
}

.hero-label {
  opacity: 0;
  transform: translateY(20px);
}

.hero-label[data-aos^="fade"] {
  opacity: 0;
  transform: translateY(20px);
}

.label-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.07);
  border: 1px solid rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title {
  margin: 24px 0 20px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(38px, 5vw, 64px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: rgb(var(--v-theme-on-surface));
  text-wrap: balance;
}

.hero-description {
  margin: 0 0 36px;
  font-size: clamp(16px, 1.4vw, 19px);
  line-height: 1.7;
  color: rgb(var(--v-theme-on-surface-variant));
  max-width: 520px;
}

.hero-cta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  padding: 16px 32px;
  border-radius: 12px;
  transition: box-shadow 0.2s ease, transform 0.15s ease, background-color 0.2s ease;
}

.btn-hero-primary:hover {
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.35);
  transform: translateY(-2px);
}

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  padding: 16px 32px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.04);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.btn-hero-secondary:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
}

.hero-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding-top: 28px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

.trust-item svg {
  color: rgb(var(--v-theme-success));
  flex-shrink: 0;
}

/* --- Hero Visual --- */
.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-stack {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.stack-card {
  position: absolute;
  inset: 0;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 20px;
}

.stack-back-2 {
  z-index: 0;
  transform: translate(32px, -32px) scale(0.96);
  opacity: 0.4;
}

.stack-back-1 {
  z-index: 1;
  transform: translate(16px, -16px) scale(0.98);
  opacity: 0.7;
}

.product-mockup {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 28px;
  border-radius: 20px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.05),
    0 20px 48px rgba(15, 23, 42, 0.1);
}

.mockup-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.mockup-title-block {
  flex: 1;
}

.mockup-reference {
  display: block;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.mockup-subtitle {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

.status-badge {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.status-in-progress {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.mockup-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mockup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.mockup-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.mockup-value {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.mockup-value svg {
  color: rgb(var(--v-theme-primary));
}

.progress-block {
  margin-top: 4px;
  padding: 18px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-value {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}

.progress-bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.03);
  transition: background-color 0.2s ease;
}

.step-item.done {
  background: rgba(var(--v-theme-success), 0.06);
}

.step-item.done .step-icon {
  color: rgb(var(--v-theme-success));
}

.step-icon {
  color: rgb(var(--v-theme-on-surface-variant));
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.step-item.done .step-label {
  color: rgb(var(--v-theme-success));
}

.mockup-footer {
  display: flex;
  gap: 10px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.mini-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.badge-success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.badge-warning {
  color: rgb(var(--v-theme-on-secondary));
  background: rgba(var(--v-theme-secondary), 0.14);
  border: 1px solid rgba(var(--v-theme-secondary), 0.4);
}

.floating-card {
  position: absolute;
  bottom: -28px;
  right: -40px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.floating-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: rgba(var(--v-theme-secondary), 0.16);
  color: rgb(var(--v-theme-on-secondary));
  flex-shrink: 0;
}

.floating-content {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.floating-content strong {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.floating-content small {
  font-size: 11.5px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.hero-scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: rgb(var(--v-theme-on-surface-variant));
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgb(var(--v-theme-outline));
  animation: bounce 2s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 60px;
    text-align: center;
  }

  .hero-content {
    max-width: 720px;
    margin: 0 auto;
  }

  .label-content {
    margin: 0 auto;
  }

  .hero-title {
    text-align: center;
  }

  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-trust {
    justify-content: center;
  }

  .hero-visual {
    max-width: 520px;
    margin: 0 auto;
  }

  .floating-card {
    right: -20px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 120px 20px 80px;
    min-height: auto;
  }

  .hero-grid {
    gap: 48px;
  }

  .stack-back-2 {
    transform: translate(20px, -20px) scale(0.96);
  }

  .stack-back-1 {
    transform: translate(10px, -10px) scale(0.98);
  }

  .floating-card {
    position: static;
    margin: 24px auto 0;
    width: fit-content;
    animation: none;
  }

  .hero-scroll-indicator {
    display: none;
  }
}

@media (max-width: 600px) {
  .hero-section {
    padding: 110px 16px 64px;
  }

  .btn-hero-primary,
  .btn-hero-secondary {
    width: 100%;
    justify-content: center;
  }

  .hero-trust {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .product-mockup {
    padding: 20px;
  }

  .mockup-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-label,
  .hero-title,
  .hero-description,
  .hero-cta,
  .hero-trust,
  .hero-visual,
  .floating-card,
  .hero-scroll-indicator,
  .progress-fill {
    animation: none;
    transition: none;
    opacity: 1;
    transform: none;
  }
}

/* AOS override pour forcer l'animation au chargement sur Hero */
[data-aos="fade-up"] {
  opacity: 0;
  transform: translateY(30px);
  transition-property: opacity, transform;
}

[data-aos="fade-up"].aos-animate {
  opacity: 1;
  transform: translateY(0);
}

[data-aos="zoom-in"] {
  opacity: 0;
  transform: scale(0.95);
  transition-property: opacity, transform;
}

[data-aos="zoom-in"].aos-animate {
  opacity: 1;
  transform: scale(1);
}

[data-aos="fade-right"] {
  opacity: 0;
  transform: translateX(-20px);
  transition-property: opacity, transform;
}

[data-aos="fade-right"].aos-animate {
  opacity: 1;
  transform: translateX(0);
}
</style>