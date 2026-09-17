<script setup lang="ts">
import { BadgeCheck, Database, Navigation, Layers, ShieldCheck, FileText, Clock, Search, CheckCircle } from '@lucide/vue'

const solutions = [
  {
    icon: Database,
    title: 'Centralisation',
    description: 'Toutes les informations et documents sont regroupés dans un espace unique. Fini les échanges dispersés par email ou courrier : investisseur et SGI travaillent sur le même dossier, en temps réel.',
    visual: 'centralisation'
  },
  {
    icon: Navigation,
    title: 'Simplicité guidée',
    description: "L'investisseur est accompagné pas à pas dans la constitution de son dossier. Chaque étape est claire, les champs requis sont identifiés, les formats acceptés précisés. Impossible d'oublier une pièce.",
    visual: 'simplicite'
  },
  {
    icon: Search,
    title: 'Suivi transparent',
    description: "L'investisseur visualise l'avancement de sa demande à tout moment : étape en cours, documents validés, actions attendues. Notifications automatiques à chaque changement de statut.",
    visual: 'suivi'
  },
  {
    icon: Layers,
    title: 'Organisation structurée',
    description: 'Les SGI disposent d\'un tableau de bord clair : dossiers à traiter, priorités, anomalies détectées, historique complet. Le traitement devient fluide, traçable et conforme.',
    visual: 'organisation'
  },
]

const mockupPanels = [
  { label: 'Dossiers en cours', value: '12', icon: FileText, trend: '+3 cette semaine' },
  { label: 'À valider aujourd\'hui', value: '5', icon: Clock, trend: 'Urgent' },
  { label: 'Progression moyenne', value: '68%', icon: Navigation, trend: 'Objectif 80%' },
  { label: 'Conformes KYC', value: '94%', icon: ShieldCheck, trend: 'Conforme AMF' },
]
</script>

<template>
  <section class="solution-section" id="solution" aria-labelledby="solution-title" data-aos="fade-up" data-aos-duration="800">
    <div class="section-container">
      <header class="section-header" data-aos="fade-up" data-aos-duration="700" data-aos-delay="0">
        <span class="section-surtitre">
          <span class="surtitre-dot" aria-hidden="true"></span>
          Notre réponse
        </span>
        <h2 id="solution-title" class="section-title">
          Une plateforme pour simplifier tout le processus.
        </h2>
        <p class="section-lead">
          PGNOC-TI transforme un parcours fragmenté en une expérience fluide, sécurisée et transparente pour toutes les parties prenantes.
        </p>
      </header>

      <div class="solution-grid" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200">
        <div class="solution-list">
          <div
            v-for="(solution, index) in solutions"
            :key="solution.title"
            class="solution-item"
            data-aos="fade-right"
            data-aos-duration="600"
            :data-aos-delay="index * 150 + 100"
          >
            <div class="solution-icon">
              <component :is="solution.icon" :size="22" aria-hidden="true" />
            </div>
            <div class="solution-content">
              <h3 class="solution-title">{{ solution.title }}</h3>
              <p class="solution-description">{{ solution.description }}</p>
            </div>
            <div class="solution-check" aria-hidden="true">
              <CheckCircle :size="20" />
            </div>
          </div>
        </div>

        <div class="solution-visual" aria-hidden="true" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="400" data-aos-easing="ease-out-cubic">
          <div class="dashboard-mockup">
            <header class="mockup-header">
              <div class="mockup-dots" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
              <span class="mockup-window-title">Tableau de bord PGNOC-TI</span>
            </header>

            <div class="mockup-content">
              <div class="kpi-row">
                <div v-for="(panel, index) in mockupPanels" :key="panel.label" class="kpi-card" data-aos="fade-up" data-aos-duration="500" :data-aos-delay="index * 100">
                  <div class="kpi-icon">
                    <component :is="panel.icon" :size="18" aria-hidden="true" />
                  </div>
                  <div class="kpi-data">
                    <span class="kpi-value">{{ panel.value }}</span>
                    <span class="kpi-label">{{ panel.label }}</span>
                    <span class="kpi-trend">{{ panel.trend }}</span>
                  </div>
                </div>
              </div>

              <div class="dossier-table">
                <div class="table-header">
                  <span>Référence</span>
                  <span>Investisseur</span>
                  <span>SGI</span>
                  <span>Étape</span>
                  <span>Progression</span>
                  <span>Action</span>
                </div>
                <div v-for="i in 4" :key="i" class="table-row" data-aos="fade-right" data-aos-duration="500" :data-aos-delay="i * 100">
                  <span class="font-mono">PGNOC-2026-00{{ 40 + i }}</span>
                  <span>Investisseur {{ i }}</span>
                  <span>SGI UEMOA</span>
                  <span><BadgeCheck :size="12" class="text-success" /> KYC</span>
                  <div class="mini-progress">
                    <div class="mini-bar" :style="{ width: `${60 + i * 8}%` }"></div>
                  </div>
                  <span class="action-btn">Voir</span>
                </div>
              </div>
            </div>
          </div>

          <div class="floating-stats" data-aos="fade-up" data-aos-duration="700" data-aos-delay="600">
            <div class="stat-card" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              <span class="stat-value">3×</span>
              <span class="stat-label">plus rapide</span>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-duration="500" data-aos-delay="150">
              <span class="stat-value">-80%</span>
              <span class="stat-label">erreurs de saisie</span>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-duration="500" data-aos-delay="300">
              <span class="stat-value">100%</span>
              <span class="stat-label">tracé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.solution-section {
  position: relative;
  padding: 120px 32px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface));
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 72px;
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

/* --- Solution Grid --- */
.solution-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 60px;
  align-items: start;
}

.solution-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 8px;
}

.solution-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.solution-item:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.solution-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.solution-item:hover .solution-icon {
  transform: scale(1.1);
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.solution-content {
  flex: 1;
  min-width: 0;
}

.solution-title {
  margin: 0 0 6px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.solution-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface-variant));
}

.solution-check {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
}

/* --- Solution Visual --- */
.solution-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-mockup {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.mockup-dots {
  display: flex;
  gap: 6px;
}

.mockup-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(var(--v-theme-outline-variant));
}

.mockup-dots span:first-child { background: #FF5F57; }
.mockup-dots span:nth-child(2) { background: #FEBC2E; }
.mockup-dots span:last-child { background: #28CA42; }

.mockup-window-title {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-left: 8px;
}

.mockup-content {
  padding: 24px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.kpi-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.kpi-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kpi-value {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.kpi-label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-trend {
  font-size: 11px;
  color: rgb(var(--v-theme-success));
  font-weight: 600;
}

.dossier-table {
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1fr 1.2fr 1fr 1fr;
  gap: 16px;
  padding: 14px 18px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1fr 1.2fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 14px 18px;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  transition: background-color 0.2s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(var(--v-theme-primary), 0.03);
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.text-success {
  color: rgb(var(--v-theme-success));
}

.mini-progress {
  height: 6px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  overflow: hidden;
}

.mini-bar {
  height: 100%;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
}

.action-btn {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  transition: color 0.2s ease;
}

.action-btn:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.floating-stats {
  display: flex;
  gap: 16px;
  padding: 0 4px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
}

.stat-value {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 1024px) {
  .solution-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .solution-list {
    max-width: 640px;
    margin: 0 auto;
  }

  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .floating-stats {
    max-width: 640px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .solution-section {
    padding: 96px 20px;
  }

  .section-header {
    margin-bottom: 56px;
  }

  .solution-item {
    padding: 20px;
    gap: 16px;
  }

  .solution-icon {
    width: 44px;
    height: 44px;
  }

  .mockup-content {
    padding: 20px;
  }

  .kpi-row {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    font-size: 12px;
  }

  .table-header span:nth-child(3),
  .table-header span:nth-child(6),
  .table-row span:nth-child(3),
  .table-row span:nth-child(6) {
    display: none;
  }

  .floating-stats {
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1 1 calc(50% - 8px);
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex: 1 1 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .solution-item,
  .solution-check,
  .kpi-card,
  .stat-card,
  .table-row {
    transition: none;
  }
}
</style>