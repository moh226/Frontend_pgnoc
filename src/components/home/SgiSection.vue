<script setup lang="ts">
import { Users, FileText, Search, CheckCircle, Shield, Clock, Bell, BarChart3, ArrowRight, Filter, Download } from '@lucide/vue'

const sgiFeatures = [
  {
    icon: Users,
    title: 'Centralisation des demandes',
    description: 'Toutes les demandes d\'ouverture de compte arrivent dans un tableau de bord unique. Fini la dispersion entre emails, courriers et dépôts physiques.',
    highlight: true
  },
  {
    icon: FileText,
    title: 'Consultation structurée des dossiers',
    description: 'Vue d\'ensemble avec filtres (statut, date, SGI, progression), accès rapide au détail, historique complet des actions.',
    highlight: false
  },
  {
    icon: Search,
    title: 'Vérification guidée des informations',
    description: 'Contrôle KYC assisté : champs obligatoires signalés, documents pré-validés, anomalies détectées automatiquement.',
    highlight: true
  },
  {
    icon: Shield,
    title: 'Gestion des documents',
    description: 'Visualisation, annotation, validation/rejet par pièce, traçabilité totale, signature électronique intégrée.',
    highlight: false
  },
  {
    icon: BarChart3,
    title: 'Suivi du traitement et KPIs',
    description: 'Métriques temps réel : volume, délais moyens, taux de conformité, goulots d\'étranglement. Export pour reporting.',
    highlight: false
  },
  {
    icon: Clock,
    title: 'Notifications et escalades',
    description: 'Alertes automatiques sur dossiers en attente, relances investisseurs, seuils de délais, escalade hiérarchique.',
    highlight: false
  },
]
</script>

<template>
  <section class="sgi-section" id="sgi" aria-labelledby="sgi-title" data-aos="fade-up" data-aos-duration="800">
    <div class="section-container">
      <header class="section-header" data-aos="fade-up" data-aos-duration="700" data-aos-delay="0">
        <span class="section-surtitre">
          <span class="surtitre-dot" aria-hidden="true"></span>
          Pour les SGI
        </span>
        <h2 id="sgi-title" class="section-title">
          Une gestion plus structurée pour les SGI;
        </h2>
        <p class="section-lead">
          Transformez le traitement manuel en un processus industriel : centralisé, traçable, conforme. Vos agents gagnent du temps, vos clients gagnent en confiance;
        </p>
      </header>

      <div class="sgi-grid" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200">
        <div class="sgi-visual" aria-hidden="true" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="300" data-aos-easing="ease-out-cubic">
          <div class="desktop-mockup">
            <div class="desktop-frame">
              <header class="desktop-header">
                <div class="desktop-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="desktop-title">PGNOC-TI Agent SGI</span>
                <div class="desktop-actions">
                  <button class="header-btn"><Filter :size="14" /></button>
                  <button class="header-btn primary"><Download :size="14" /></button>
                </div>
              </header>

              <div class="desktop-content">
                <div class="desktop-sidebar">
                  <nav class="sidebar-nav">
                    <button class="nav-item active" data-aos="fade-right" data-aos-duration="500" data-aos-delay="100">
                      <BarChart3 :size="18" />
                      <span>Tableau de bord</span>
                    </button>
                    <button class="nav-item" data-aos="fade-right" data-aos-duration="500" data-aos-delay="200">
                      <FileText :size="18" />
                      <span>Dossiers</span>
                      <span class="nav-badge">12</span>
                    </button>
                    <button class="nav-item" data-aos="fade-right" data-aos-duration="500" data-aos-delay="300">
                      <Clock :size="18" />
                      <span>À traiter</span>
                      <span class="nav-badge urgent">5</span>
                    </button>
                    <button class="nav-item" data-aos="fade-right" data-aos-duration="500" data-aos-delay="400">
                      <CheckCircle :size="18" />
                      <span>Validés</span>
                    </button>
                    <button class="nav-item" data-aos="fade-right" data-aos-duration="500" data-aos-delay="500">
                      <Shield :size="18" />
                      <span>KYC</span>
                    </button>
                    <button class="nav-item" data-aos="fade-right" data-aos-duration="500" data-aos-delay="600">
                      <Bell :size="18" />
                      <span>Notifications</span>
                    </button>
                  </nav>
                </div>

                <div class="desktop-main">
                  <div class="main-header">
                    <h3>Dossiers en cours de traitement</h3>
                    <div class="main-filters">
                      <select class="filter-select">
                        <option>Tous les statuts</option>
                        <option>En instruction</option>
                        <option>KYC en attente</option>
                        <option>Complément requis</option>
                      </select>
                      <select class="filter-select">
                        <option>Toutes SGI</option>
                        <option>SGI UEMOA</option>
                        <option>SGI Côte d'Ivoire</option>
                      </select>
                    </div>
                  </div>

                  <div class="dossiers-table">
                    <div class="table-header-row">
                      <span>Référence</span>
                      <span>Investisseur</span>
                      <span>Étape</span>
                      <span>Progression</span>
                      <span>Délai</span>
                      <span>Action</span>
                    </div>
                    <div v-for="i in 5" :key="i" class="table-data-row" data-aos="fade-right" data-aos-duration="500" :data-aos-delay="i * 100">
                      <span class="font-mono">PGNOC-2026-00{{ 40 + i }}</span>
                      <span>Investisseur {{ i }}</span>
                      <span class="status-chip"><CheckCircle :size="10" /> KYC</span>
                      <div class="row-progress">
                        <div class="row-bar" :style="{ width: `${50 + i * 10}%` }"></div>
                      </div>
                      <span class="delay">{{ i === 1 || i === 3 ? '⚠ ' + i * 2 + 'j' : i * 2 + 'j' }}</span>
                      <button class="action-link">Traiter <ArrowRight :size="12" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="desktop-stats" data-aos="fade-up" data-aos-duration="700" data-aos-delay="500">
            <div class="stat-item" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              <span class="stat-number">-60%</span>
              <span class="stat-label">temps de traitement</span>
            </div>
            <div class="stat-item" data-aos="fade-up" data-aos-duration="500" data-aos-delay="150">
              <span class="stat-number">100%</span>
              <span class="stat-label">traçabilité</span>
            </div>
            <div class="stat-item" data-aos="fade-up" data-aos-duration="500" data-aos-delay="300">
              <span class="stat-number">0</span>
              <span class="stat-label">perte de dossier</span>
            </div>
          </div>
        </div>

        <div class="sgi-features">
          <div
            v-for="(feature, index) in sgiFeatures"
            :key="feature.title"
            class="feature-card"
            :class="{ highlighted: feature.highlight }"
            data-aos="fade-left"
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
      </div>

      <div class="sgi-cta" data-aos="fade-up" data-aos-duration="700" data-aos-delay="400">
        <router-link to="/inscription" class="btn-sgi-cta">
          <span>Démarrer avec ma SGI</span>
          <ArrowRight :size="18" aria-hidden="true" />
        </router-link>
        <p class="cta-note">Espace SGI réservé aux partenaires agréés · Contactez-nous pour l'intégration</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sgi-section {
  position: relative;
  padding: 120px 32px;
  background: rgb(var(--v-theme-surface));
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

/* --- SGI Grid --- */
.sgi-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.95fr;
  gap: 60px;
  align-items: start;
}

.sgi-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.desktop-mockup {
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.15);
  overflow: hidden;
}

.desktop-frame {
  display: flex;
  flex-direction: column;
  height: 520px;
  background: #F8FAFC;
}

.desktop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: white;
  border-bottom: 1px solid #E2E8F0;
}

.desktop-dots {
  display: flex;
  gap: 6px;
}

.desktop-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #E2E8F0;
}

.desktop-dots span:first-child { background: #FF5F57; }
.desktop-dots span:nth-child(2) { background: #FEBC2E; }
.desktop-dots span:last-child { background: #28CA42; }

.desktop-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
}

.desktop-actions {
  display: flex;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  background: white;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  border-color: #0C3C94;
  color: #0C3C94;
  background: rgba(12, 60, 148, 0.03);
}

.header-btn.primary {
  background: #0C3C94;
  border-color: #0C3C94;
  color: white;
}

.header-btn.primary:hover {
  background: #0A3075;
  border-color: #0A3075;
}

.desktop-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.desktop-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #E2E8F0;
  padding: 16px 8px;
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #F1F5F9;
  color: #0F172A;
}

.nav-item.active {
  background: #0C3C94;
  color: white;
}

.nav-item.active svg {
  color: white;
}

.nav-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(12, 60, 148, 0.1);
  color: #0C3C94;
}

.nav-item.active .nav-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-badge.urgent {
  background: rgba(228, 0, 43, 0.1);
  color: #E4002B;
}

.nav-item.active .nav-badge.urgent {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.desktop-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #F8FAFC;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.main-header h3 {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
}

.main-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  background: white;
  font-size: 12px;
  color: #0F172A;
  cursor: pointer;
  min-width: 180px;
}

.dossiers-table {
  display: flex;
  flex-direction: column;
}

.table-header-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1.2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748B;
  background: white;
  border: 1px solid #E2E8F0;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
}

.table-data-row {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1.2fr 1fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  font-size: 13px;
  color: #0F172A;
  background: white;
  border: 1px solid #E2E8F0;
  border-top: none;
  transition: background-color 0.2s ease;
}

.table-data-row:last-child {
  border-radius: 0 0 10px 10px;
}

.table-data-row:hover {
  background: rgba(12, 60, 148, 0.02);
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 600;
  color: #0C3C94;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #0C3C94;
  background: rgba(12, 60, 148, 0.08);
}

.status-chip svg {
  color: #0C3C94;
}

.row-progress {
  height: 6px;
  border-radius: 999px;
  background: #E2E8F0;
  overflow: hidden;
}

.row-bar {
  height: 100%;
  border-radius: 999px;
  background: #0C3C94;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.delay {
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #0C3C94;
  background: rgba(12, 60, 148, 0.08);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-link:hover {
  background: #0C3C94;
  color: white;
}

.action-link svg {
  transition: transform 0.2s ease;
}

.action-link:hover svg {
  transform: translateX(3px);
}

.desktop-stats {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  border-radius: 12px;
  background: white;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
}

.stat-number {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0C3C94;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* --- SGI Features --- */
.sgi-features {
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

/* --- SGI CTA --- */
.sgi-cta {
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.btn-sgi-cta {
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

.btn-sgi-cta:hover {
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.35);
  transform: translateY(-2px);
}

.cta-note {
  margin: 16px 0 0;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

@media (max-width: 1024px) {
  .sgi-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .sgi-features {
    max-width: 640px;
    margin: 0 auto;
  }

  .desktop-mockup {
    max-width: 720px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .sgi-section {
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

  .desktop-frame {
    height: auto;
    min-height: 500px;
  }

  .desktop-content {
    flex-direction: column;
  }

  .desktop-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #E2E8F0;
    padding: 12px 8px;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .nav-item {
    flex: 1 1 auto;
    min-width: 120px;
    justify-content: center;
    padding: 10px 12px;
  }

  .nav-item span:last-child {
    display: none;
  }

  .main-filters {
    width: 100%;
  }

  .filter-select {
    flex: 1;
    min-width: 0;
  }

  .table-header-row,
  .table-data-row {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .table-header-row span:nth-child(3),
  .table-header-row span:nth-child(6),
  .table-data-row span:nth-child(3),
  .table-data-row span:nth-child(6) {
    display: none;
  }

  .desktop-stats {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }

  .stat-item {
    flex: 1 1 calc(33% - 10px);
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .stat-item {
    flex: 1 1 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card,
  .nav-item,
  .row-bar,
  .stat-item,
  .action-link {
    transition: none;
  }
}
</style>