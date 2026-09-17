<script setup lang="ts">
import { User, FileText, Upload, Eye, Bell, CheckCircle, Shield, ArrowRight, Home, FolderPlus, Briefcase, CheckCircle2, AlertCircle, Clock, ChevronRight } from '@lucide/vue'

const investorFeatures = [
  {
    icon: User,
    title: 'Création de demande guidée',
    description: 'Sélection de la SGI, création instantanée de l\'espace personnel, démarrage en 2 minutes.',
    highlight: true
  },
  {
    icon: FileText,
    title: 'Saisie structurée des informations',
    description: 'Formulaires étape par étape avec validation en temps réel, aide contextuelle, formats pré-définis.',
    highlight: false
  },
  {
    icon: Upload,
    title: 'Téléversement des documents',
    description: 'Glisser-déposer, aperçu avant envoi, vérification automatique du format et de la lisibilité.',
    highlight: false
  },
  {
    icon: Eye,
    title: 'Suivi temps réel du dossier',
    description: 'Barre de progression, étape courante visible, documents validés/en attente, historique complet.',
    highlight: true
  },
  {
    icon: Bell,
    title: 'Notifications automatiques',
    description: 'Email et/ou in-app à chaque changement de statut, demande de complément, décision finale.',
    highlight: false
  },
  {
    icon: Shield,
    title: 'KYC simplifié et sécurisé',
    description: 'Vérification d\'identité intégrée, selfie guidé, conformité réglementaire UEMOA/AMF.',
    highlight: false
  },
]
</script>

<template>
  <section class="investor-section" id="investisseur" aria-labelledby="investor-title" data-aos="fade-up" data-aos-duration="800">
    <div class="section-container">
      <header class="section-header" data-aos="fade-up" data-aos-duration="700" data-aos-delay="0">
        <span class="section-surtitre">
          <span class="surtitre-dot" aria-hidden="true"></span>
          Pour l'investisseur
        </span>
        <h2 id="investor-title" class="section-title">
          Une expérience plus simple pour l'investisseur.
        </h2>
        <p class="section-lead">
          De la première connexion à l'ouverture effective du compte, chaque interaction est conçue pour être claire, rapide et rassurante.
        </p>
      </header>

      <div class="investor-grid" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200">
        <div class="investor-features">
          <div
            v-for="(feature, index) in investorFeatures"
            :key="feature.title"
            class="feature-card"
            :class="{ highlighted: feature.highlight }"
            data-aos="fade-right"
            data-aos-duration="600"
            :data-aos-delay="index * 120 + 100"
          >
            <div class="feature-icon">
              <component :is="feature.icon" :size="20" aria-hidden="true" />
            </div>
            <div class="feature-content">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
            <div class="feature-check" aria-hidden="true">
              <CheckCircle :size="18" />
            </div>
          </div>
        </div>

        <div class="investor-visual" aria-hidden="true" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="300" data-aos-easing="ease-out-cubic">
          <div class="visual-composition">
            <!-- Main phone mockup - faithful to actual PGNOC-TI investor app -->
            <div class="phone-mockup-main">
              <div class="phone-frame">
                <div class="phone-notch" aria-hidden="true"></div>
                <div class="phone-screen">
                  <!-- iOS Status Bar -->
                  <div class="status-bar" aria-hidden="true">
                    <div class="status-bar-left">
                      <span class="status-bar-time">09:41</span>
                    </div>
                    <div class="status-bar-right">
                      <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22h8"/><path d="M5 12h14"/><path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/></svg>
                      <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12.1a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6.4a1 1 0 0 1-.34.66 2 2 0 0 0 0 3.5l-6.4 6.2a2 2 0 0 1-3.2 0l-6.4-6.2A1 1 0 0 1 1 19.1v-6.4a1 1 0 0 1 .34-.66 2 2 0 0 0 0-3.5l6.4-6.2a2 2 0 0 1 3.2 0l6.4 6.2A1 1 0 0 1 23 19.1v-6.4a1 1 0 0 1-.34-.66 2 2 0 0 0 0-3.5l-6.4-6.2a2 2 0 0 1-3.2 0Z"/></svg>
                      <svg class="status-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M11.673 8H5.327A1.327 1.327 0 0 0 4 9.327v5.346A1.327 1.327 0 0 0 5.327 16h6.346A1.327 1.327 0 0 0 13 14.673v-5.346A1.327 1.327 0 0 0 11.673 8M8 9.327V10h5v-1H8v-.673Z"/><path d="M14 9.327V10h5v-1h-5v-.673Z"/></svg>
                    </div>
                  </div>

                  <!-- App Header Bar -->
                  <header class="app-header-bar" role="banner">
                    <h1 class="app-title">PGNOC-TI</h1>
                    <button class="app-notif" aria-label="Notifications">
                      <Bell :size="20" />
                      <span class="badge">2</span>
                    </button>
                  </header>

                  <!-- Scrollable Screen Content -->
                  <div class="screen-content">
                    <!-- Header with greeting -->
                    <div class="app-header-section">
                      <div class="greeting-section">
                        <div class="greeting-label">Bonjour,</div>
                        <div class="greeting-name">Marie Dupont</div>
                      </div>
                      <div class="app-avatar">
                        <span>MD</span>
                      </div>
                    </div>

                    <!-- KPI Cards Row - faithful to real dashboard -->
                    <div class="kpi-row">
                      <div class="kpi-card">
                        <div class="kpi-icon primary"><Briefcase :size="20" /></div>
                        <div class="kpi-value">3</div>
                        <div class="kpi-label">Total Dossiers</div>
                      </div>
                      <div class="kpi-card">
                        <div class="kpi-icon info"><CheckCircle2 :size="20" /></div>
                        <div class="kpi-value">68%</div>
                        <div class="kpi-label">Progression moy.</div>
                      </div>
                      <div class="kpi-card">
                        <div class="kpi-icon warning"><Clock :size="20" /></div>
                        <div class="kpi-value">1</div>
                        <div class="kpi-label">En instruction</div>
                      </div>
                      <div class="kpi-card">
                        <div class="kpi-icon success"><CheckCircle2 :size="20" /></div>
                        <div class="kpi-value">2</div>
                        <div class="kpi-label">Validés</div>
                      </div>
                    </div>

                    <!-- Action Required Card - faithful to real dashboard -->
                    <div class="action-card">
                      <div class="action-icon"><AlertCircle :size="20" /></div>
                      <div class="action-content">
                        <div class="action-title">Action à effectuer</div>
                        <div class="action-desc">PGNOC-2026-0042 · 76% complété</div>
                      </div>
                      <button class="action-btn-small">Corriger</button>
                    </div>

                    <!-- Dossiers Section -->
                    <div class="section-title-row">
                      <h2 class="section-title">Mes dossiers</h2>
                      <a href="#" class="section-link">Voir tout</a>
                    </div>

                    <div class="dossiers-list">
                      <div class="dossier-item">
                        <div class="dossier-top">
                          <div class="dossier-avatar"><Briefcase :size="18" /></div>
                          <div class="dossier-info">
                            <div class="dossier-ref">PGNOC-2026-0042</div>
                            <div class="dossier-meta">Créé le 12/01/2026</div>
                          </div>
                          <span class="dossier-status instruction">En instruction</span>
                        </div>
                        <div class="dossier-progress">
                          <div class="progress-top">
                            <span class="progress-label">Progression du dossier</span>
                            <span class="progress-pct-small">76%</span>
                          </div>
                          <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: 76%"></div>
                          </div>
                        </div>
                        <div class="dossier-actions">
                          <span class="dossier-action-tag">À compléter</span>
                          <button class="dossier-btn">Continuer <ChevronRight :size="14" /></button>
                        </div>
                      </div>

                      <div class="dossier-item">
                        <div class="dossier-top">
                          <div class="dossier-avatar"><Briefcase :size="18" /></div>
                          <div class="dossier-info">
                            <div class="dossier-ref">PGNOC-2026-0038</div>
                            <div class="dossier-meta">Créé le 05/01/2026</div>
                          </div>
                          <span class="dossier-status valide">Validé</span>
                        </div>
                        <div class="dossier-progress">
                          <div class="progress-top">
                            <span class="progress-label">Progression du dossier</span>
                            <span class="progress-pct-small">100%</span>
                          </div>
                          <div class="progress-bar-small">
                            <div class="progress-fill-small success" style="width: 100%"></div>
                          </div>
                        </div>
                        <div class="dossier-actions">
                          <span class="dossier-action-tag">Soumis le 10/01</span>
                          <button class="dossier-btn">Consulter <ChevronRight :size="14" /></button>
                        </div>
                      </div>

                      <div class="dossier-item">
                        <div class="dossier-top">
                          <div class="dossier-avatar"><Briefcase :size="18" /></div>
                          <div class="dossier-info">
                            <div class="dossier-ref">PGNOC-2026-0035</div>
                            <div class="dossier-meta">Créé le 28/12/2025</div>
                          </div>
                          <span class="dossier-status brouillon">Brouillon</span>
                        </div>
                        <div class="dossier-progress">
                          <div class="progress-top">
                            <span class="progress-label">Progression du dossier</span>
                            <span class="progress-pct-small">45%</span>
                          </div>
                          <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: 45%"></div>
                          </div>
                        </div>
                        <div class="dossier-actions">
                          <span class="dossier-action-tag">À compléter</span>
                          <button class="dossier-btn">Continuer <ChevronRight :size="14" /></button>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom Navigation -->
                    <nav class="bottom-nav" aria-label="Navigation principale">
                      <button class="nav-item active" aria-current="page"><Home :size="22" /><span class="nav-label">Accueil</span></button>
                      <button class="nav-item"><FolderPlus :size="22" /><span class="nav-label">Dossiers</span></button>
                      <button class="nav-item"><Bell :size="22" /><span class="nav-label">Alertes</span></button>
                      <button class="nav-item"><User :size="22" /><span class="nav-label">Profil</span></button>
                    </nav>
                  </div>
                </div>
              </div>

              <div class="phone-shadow" aria-hidden="true"></div>
            </div>

            <!-- Floating benefit cards around the phone -->
            <div class="floating-benefits">
              <div class="benefit-card" data-aos="fade-up" data-aos-duration="600" data-aos-delay="400">
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <div class="benefit-text"><strong>Dossier 100% digital</strong><span>Plus de papier, tout en ligne</span></div>
              </div>

              <div class="benefit-card" data-aos="fade-up" data-aos-duration="600" data-aos-delay="500">
                <div class="benefit-icon"><Bell :size="18" /></div>
                <div class="benefit-text"><strong>Alertes temps réel</strong><span>Notifié à chaque étape</span></div>
              </div>

              <div class="benefit-card" data-aos="fade-up" data-aos-duration="600" data-aos-delay="600">
                <div class="benefit-icon"><Shield :size="18" /></div>
                <div class="benefit-text"><strong>Sécurité bancaire</strong><span>Données chiffrées, conformes</span></div>
              </div>
            </div>

            <!-- Desktop hint -->
            <div class="desktop-hint" data-aos="fade-up" data-aos-duration="600" data-aos-delay="700">
              <span>Disponible aussi sur ordinateur</span>
              <ArrowRight :size="16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.investor-section {
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

/* --- Investor Grid --- */
.investor-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.95fr;
  gap: 60px;
  align-items: start;
}

.investor-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.feature-card.highlighted {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.04) 0%, rgba(var(--v-theme-primary), 0.01) 100%);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.feature-card.highlighted:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.feature-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-title {
  margin: 0 0 6px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.feature-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface-variant));
}

.feature-check {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
}

/* --- Investor Visual --- */
.investor-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.visual-composition {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 100%;
  max-width: 520px;
}

/* Main phone mockup - faithful to actual PGNOC-TI investor app */
.phone-mockup-main {
  position: relative;
  width: 360px;
}

.phone-frame {
  position: relative;
  border-radius: 40px;
  background: #0F172A;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 30px;
  border-radius: 0 0 15px 15px;
  background: #0F172A;
  z-index: 10;
}

.phone-screen {
  position: relative;
  z-index: 1;
  width: 100%;
  aspect-ratio: 360 / 780;
  background: #F8FAFC;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* iOS status bar */
.status-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
  background: #F8FAFC;
}

.status-bar-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-bar-time {
  font-family: 'SF Pro Text', 'Inter', sans-serif;
  font-weight: 600;
}

.status-bar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  width: 16px;
  height: 16px;
}

/* App header */
.app-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 10px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.app-title {
  font-size: 17px;
  font-weight: 600;
  color: #0F172A;
}

.app-notif {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #F1F5F9;
  color: #475569;
  position: relative;
}

.app-notif .badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #E4002B;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Screen content - scrollable */
.screen-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #F8FAFC;
}

/* Header with greeting */
.app-header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.greeting-section {
  flex: 1;
}

.greeting-label {
  font-size: 15px;
  color: #64748B;
  margin-bottom: 4px;
}

.greeting-name {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.02em;
}

.app-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #0C3C94;
  color: white;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
}

/* KPI Cards Row - faithful to real dashboard */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.kpi-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.kpi-icon.primary { background: rgba(12, 60, 148, 0.1); color: #0C3C94; }
.kpi-icon.info { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.kpi-icon.success { background: rgba(0, 150, 57, 0.1); color: #009639; }
.kpi-icon.warning { background: rgba(217, 119, 6, 0.1); color: #D97706; }

.kpi-value {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748B;
}

/* Action Required Card - faithful to real dashboard */
.action-card {
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #FCD34D;
  color: #92400E;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400E;
  margin-bottom: 2px;
}

.action-desc {
  font-size: 12px;
  color: #B45309;
  line-height: 1.4;
}

.action-btn-small {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  background: #F59E0B;
  color: white;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

/* Section title */
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
}

.section-link {
  font-size: 13px;
  font-weight: 600;
  color: #0C3C94;
  text-decoration: none;
}

/* Dossiers list */
.dossiers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dossier-item {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
}

.dossier-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.dossier-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(12, 60, 148, 0.1);
  color: #0C3C94;
  flex-shrink: 0;
}

.dossier-info {
  flex: 1;
  min-width: 0;
}

.dossier-ref {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 4px;
}

.dossier-meta {
  font-size: 11px;
  color: #64748B;
}

.dossier-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.dossier-status.instruction { background: rgba(12, 60, 148, 0.1); color: #0C3C94; }
.dossier-status.valide { background: rgba(0, 150, 57, 0.1); color: #009639; }
.dossier-status.brouillon { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.dossier-status.rejete { background: rgba(228, 0, 43, 0.1); color: #E4002B; }

.dossier-progress {
  margin-bottom: 12px;
}

.progress-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.progress-label {
  font-size: 11px;
  color: #64748B;
}

.progress-pct-small {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0C3C94;
}

.progress-bar-small {
  height: 6px;
  border-radius: 999px;
  background: #E2E8F0;
  overflow: hidden;
}

.progress-fill-small {
  height: 100%;
  border-radius: 999px;
  background: #0C3C94;
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-fill-small.success {
  background: #009639;
}

.dossier-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.dossier-action-tag {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(217, 119, 6, 0.1);
  color: #D97706;
}

.dossier-btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  background: #0C3C94;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Bottom nav */
.bottom-nav {
  display: flex;
  background: white;
  border-top: 1px solid #E2E8F0;
  padding: 8px 0 12px;
  position: relative;
  z-index: 10;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  color: #64748B;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-item.active {
  color: #0C3C94;
}

.nav-item svg {
  width: 22px;
  height: 22px;
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
}

.phone-shadow {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  filter: blur(10px);
}

/* Floating benefit cards */
.floating-benefits {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  width: 100%;
  max-width: 560px;
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  animation: float-benefit 5s ease-in-out infinite;
}

.benefit-card:nth-child(1) { animation-delay: 0s; }
.benefit-card:nth-child(2) { animation-delay: 1.5s; }
.benefit-card:nth-child(3) { animation-delay: 3s; }

@keyframes float-benefit {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.benefit-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.benefit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.benefit-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.3;
}

.benefit-text strong {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.benefit-text span {
  font-size: 11.5px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Desktop hint */
.desktop-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.desktop-hint svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.desktop-hint:hover svg {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .investor-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .investor-features {
    max-width: 640px;
    margin: 0 auto;
  }

  .visual-composition {
    max-width: 100%;
  }

  .phone-mockup-main {
    width: 340px;
  }
}

@media (max-width: 768px) {
  .investor-section {
    padding: 96px 20px;
  }

  .section-header {
    margin-bottom: 56px;
  }

  .feature-card {
    padding: 20px;
    gap: 16px;
  }

  .feature-icon {
    width: 44px;
    height: 44px;
  }

  .phone-mockup-main {
    width: 100%;
    max-width: 340px;
  }

  .floating-benefits {
    flex-direction: column;
    align-items: center;
  }

  .benefit-card {
    width: 100%;
    max-width: 320px;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .phone-mockup-main {
    width: 100%;
    max-width: 300px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card,
  .feature-icon,
  .progress-fill,
  .progress-fill-small,
  .benefit-card,
  .desktop-hint {
    transition: none;
    animation: none;
  }

  .benefit-card {
    animation: none;
  }
}
</style>