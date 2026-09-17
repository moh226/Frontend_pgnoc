<script setup lang="ts">
import { ShieldCheck, Fingerprint, Lock, BadgeCheck, FileText, Clock, Database, UserCheck, AlertTriangle } from '@lucide/vue'

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: 'Authentification forte',
    description: 'Connexion par email/mot de passe avec hachage bcrypt, JWT à durée limitée (access/refresh), rotation automatique des tokens, déconnexion à l\'expiration.',
    badge: 'Implémenté'
  },
  {
    icon: Fingerprint,
    title: 'KYC / Vérification d\'identité',
    description: 'Processus KYC structuré par étapes (informations, documents, selfie), validation par agent SGI, conformité réglementaire UEMOA/AMF, traçabilité complète des vérifications.',
    badge: 'Implémenté'
  },
  {
    icon: Lock,
    title: 'Chiffrement et protection des données',
    description: 'HTTPS/TLS 1.3 obligatoire, mots de passe hachés (bcrypt), signatures serveur sur les valeurs critiques, empreintes SHA-256 sur les fichiers, séparation des environnements.',
    badge: 'Implémenté'
  },
  {
    icon: Database,
    title: 'Architecture multi-locataire isolée',
    description: 'Données cloisonnées par SGI (Row Level Security), pas d\'accès croisé entre SGI, administration centrale supervisée, journaux d\'audit immuables.',
    badge: 'Implémenté'
  },
  {
    icon: FileText,
    title: 'Traçabilité et audit complets',
    description: 'Journal d\'activité horodaté pour chaque action (création, modification, validation, rejet), utilisateur identifié, avant/après, adresse IP, user-agent. Exportable.',
    badge: 'Implémenté'
  },
  {
    icon: UserCheck,
    title: 'Gestion des rôles et permissions',
    description: 'RBAC strict : INVESTISSEUR, AGENT_SGI, ADMIN_SGI, ADMIN_GENERAL. Guards de navigation, vérifications côté serveur, masquage conditionnel des fonctionnalités.',
    badge: 'Implémenté'
  },
]

const complianceItems = [
  { icon: BadgeCheck, label: 'Conformité réglementation UEMOA', done: true },
  { icon: BadgeCheck, label: 'Respect directive AMF/AMC', done: true },
  { icon: BadgeCheck, label: 'Protection données personnelles (RGPD-inspiré)', done: true },
  { icon: BadgeCheck, label: 'Hébergement sécurisé région', done: true },
  { icon: Clock, label: 'Certification ISO 27001', done: false, note: 'En cours' },
  { icon: AlertTriangle, label: 'Tests d\'intrusion annuels', done: false, note: 'Planifié' },
]
</script>

<template>
  <section class="security-section" id="securite" aria-labelledby="security-title" data-aos="fade-up" data-aos-duration="800">
    <div class="section-container">
      <header class="section-header" data-aos="fade-up" data-aos-duration="700" data-aos-delay="0">
        <span class="section-surtitre">
          <span class="surtitre-dot" aria-hidden="true"></span>
          Sécurité & conformité
        </span>
        <h2 id="security-title" class="section-title">
          La sécurité au cœur de vos démarches;
        </h2>
        <p class="section-lead">
          PGNOC-TI intègre la sécurité à chaque niveau : authentification, chiffrement, traçabilité, conformité. Seules les fonctionnalités réellement implémentées sont présentées ici;
        </p>
      </header>

      <div class="security-grid" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200">
        <div class="security-cards">
          <article
            v-for="(feature, index) in securityFeatures"
            :key="feature.title"
            class="security-card"
            data-aos="fade-right"
            data-aos-duration="600"
            :data-aos-delay="index * 120 + 100"
          >
            <div class="card-icon">
              <component :is="feature.icon" :size="22" aria-hidden="true" />
            </div>
            <div class="card-content">
              <div class="card-header">
                <h3 class="card-title">{{ feature.title }}</h3>
                <span class="card-badge">{{ feature.badge }}</span>
              </div>
              <p class="card-description">{{ feature.description }}</p>
            </div>
          </article>
        </div>

        <div class="compliance-panel" data-aos="zoom-in" data-aos-duration="900" data-aos-delay="300" data-aos-easing="ease-out-cubic">
          <div class="panel-header">
            <div class="panel-icon">
              <ShieldCheck :size="24" aria-hidden="true" />
            </div>
            <div>
              <h3 class="panel-title">Conformité & engagements</h3>
              <p class="panel-subtitle">État réel des certifications et audits</p>
            </div>
          </div>

          <ul class="compliance-list" role="list">
            <li
              v-for="(item, index) in complianceItems"
              :key="item.label"
              class="compliance-item"
              :class="{ 'in-progress': !item.done }"
              data-aos="fade-left"
              data-aos-duration="500"
              :data-aos-delay="index * 100 + 100"
            >
              <div class="item-indicator">
                <component v-if="item.done" :is="BadgeCheck" :size="16" aria-hidden="true" />
                <component v-else :is="item.icon" :size="16" aria-hidden="true" />
              </div>
              <div class="item-content">
                <span class="item-label">{{ item.label }}</span>
                <span v-if="item.note" class="item-note">{{ item.note }}</span>
              </div>
            </li>
          </ul>

          <div class="panel-footer">
            <p class="footer-note">
              <FileText :size="14" aria-hidden="true" />
              La documentation technique et les politiques de sécurité sont disponibles sur demande pour les partenaires SGI agréés;
            </p>
          </div>
        </div>
      </div>

      <div class="security-cta" data-aos="fade-up" data-aos-duration="700" data-aos-delay="400">
        <router-link to="/login" class="btn-security-cta">
          <span>Accéder à la plateforme sécurisée</span>
          <Lock :size="18" aria-hidden="true" />
        </router-link>
        <p class="cta-note">Connexion chiffrée · Session surveillée · Déconnexion automatique</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.security-section {
  position: relative;
  padding: 120px 32px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface));
}

.section-container {
  max-width: 1200px;
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

/* --- Security Grid --- */
.security-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 48px;
  align-items: start;
}

.security-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-card {
  display: flex;
  gap: 20px;
  padding: 28px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.security-card:hover {
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 13px;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.security-card:hover .card-icon {
  transform: scale(1.08) rotate(-3deg);
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.card-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.card-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.card-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* --- Compliance Panel --- */
.compliance-panel {
  position: sticky;
  top: 100px;
  padding: 32px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface-variant)) 100%);
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
}

.panel-header {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.panel-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}

.panel-title {
  margin: 0 0 4px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.panel-subtitle {
  margin: 0;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.compliance-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.compliance-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.03);
  border: 1px solid rgba(var(--v-theme-primary), 0.06);
  transition: background-color 0.2s ease;
}

.compliance-item:hover {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgba(var(--v-theme-primary), 0.15);
}

.compliance-item.in-progress {
  background: rgba(var(--v-theme-warning), 0.05);
  border-color: rgba(var(--v-theme-warning), 0.1);
}

.compliance-item.in-progress:hover {
  background: rgba(var(--v-theme-warning), 0.08);
  border-color: rgba(var(--v-theme-warning), 0.2);
}

.item-indicator {
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

.compliance-item.in-progress .item-indicator {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.12);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-label {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.item-note {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-warning));
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.panel-footer {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.footer-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.5;
}

.footer-note svg {
  flex-shrink: 0;
  color: rgb(var(--v-theme-primary));
}

/* --- Security CTA --- */
.security-cta {
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

.btn-security-cta {
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

.btn-security-cta:hover {
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.35);
  transform: translateY(-2px);
}

.cta-note {
  margin: 16px 0 0;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

@media (max-width: 1024px) {
  .security-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .compliance-panel {
    position: static;
    max-width: 640px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .security-section {
    padding: 96px 20px;
  }

  .section-header {
    margin-bottom: 56px;
  }

  .security-card {
    padding: 24px;
    gap: 16px;
  }

  .card-icon {
    width: 48px;
    height: 48px;
  }

  .compliance-panel {
    padding: 24px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .security-card,
  .compliance-panel,
  .compliance-item,
  .security-cta {
    transition: none;
  }
}
</style>