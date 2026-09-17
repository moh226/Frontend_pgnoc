<script setup lang="ts">
import { ArrowRight, ShieldCheck, Fingerprint, BadgeCheck, Search } from '@lucide/vue'

const trustItems = [
  { icon: ShieldCheck, label: 'Transaction sécurisée' },
  { icon: Fingerprint, label: 'KYC renforcé' },
  { icon: BadgeCheck, label: '100 % dématérialisé' },
  { icon: Search, label: 'Traçabilité complète' },
]
</script>

<template>
  <section class="final-cta-section" aria-labelledby="final-cta-title" data-aos="fade-up" data-aos-duration="800" data-aos-easing="ease-out-cubic">
    <div class="cta-background" aria-hidden="true">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="grid-pattern"></div>
    </div>

    <div class="section-container">
      <div class="cta-content" data-aos="fade-up" data-aos-duration="800" data-aos-delay="0">
        <span class="cta-surtitre" data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
          <span class="surtitre-dot" aria-hidden="true"></span>
          Prêt à simplifier votre démarche ?
        </span>

        <h2 id="final-cta-title" class="cta-title" data-aos="fade-up" data-aos-duration="700" data-aos-delay="200">
          Ouvrez votre compte-titres en toute confiance avec PGNOC-TI;
        </h2>

        <p class="cta-lead" data-aos="fade-up" data-aos-duration="700" data-aos-delay="300">
          Rejoignez les investisseurs et SGI qui ont choisi la simplicité, la sécurité et la transparence;
        </p>

        <div class="cta-trust" aria-label="Engagements de confiance" data-aos="fade-up" data-aos-duration="600" data-aos-delay="400">
          <div v-for="(item, index) in trustItems" :key="item.label" class="cta-trust-item" data-aos="fade-up" data-aos-duration="500" :data-aos-delay="index * 100 + 500">
            <component :is="item.icon" :size="16" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div class="cta-actions" data-aos="fade-up" data-aos-duration="700" data-aos-delay="600">
          <router-link to="/inscription" class="btn-cta-primary">
            <span>Commencer une demande</span>
            <ArrowRight :size="20" aria-hidden="true" />
          </router-link>
          <router-link to="/login" class="btn-cta-secondary">
            <span>Se connecter</span>
          </router-link>
        </div>

        <p class="cta-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="700">
          Gratuit pour l'investisseur · Aucune carte bancaire · Conforme UEMOA/AMF
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.final-cta-section {
  position: relative;
  padding: 120px 32px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
}

.cta-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}

.orb-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -150px;
  background: rgb(var(--v-theme-primary));
}

.orb-2 {
  width: 350px;
  height: 350px;
  bottom: -100px;
  left: -100px;
  background: rgb(var(--v-theme-secondary));
  opacity: 0.25;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(var(--v-theme-primary), 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--v-theme-primary), 0.025) 1px, transparent 1px);
  background-size: 80px 80px;
}

.section-container {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cta-surtitre {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgb(var(--v-theme-secondary));
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.surtitre-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-secondary));
}

.cta-title {
  margin: 0 0 16px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: clamp(32px, 4.5vw, 54px);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: rgb(var(--v-theme-on-surface));
  text-wrap: balance;
}

.cta-lead {
  margin: 0 0 28px;
  font-size: clamp(17px, 1.5vw, 20px);
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface-variant));
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.cta-trust {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 28px;
  margin-bottom: 36px;
  padding: 24px 0;
  border-top: 1px solid rgba(var(--v-theme-primary), 0.15);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.cta-trust-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

.cta-trust-item svg {
  color: rgb(var(--v-theme-success));
  flex-shrink: 0;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.btn-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgb(var(--v-theme-primary));
  background: white;
  padding: 18px 44px;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease, transform 0.15s ease, background-color 0.2s ease;
}

.btn-cta-primary:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
  background: rgb(var(--v-theme-surface-variant));
}

.btn-cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 17px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  padding: 18px 44px;
  border-radius: 14px;
  border: 1px solid rgb(var(--v-theme-outline));
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(8px);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.btn-cta-secondary:hover {
  background: rgb(var(--v-theme-surface));
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
}

.cta-note {
  margin: 0;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.8;
}

@media (max-width: 768px) {
  .final-cta-section {
    padding: 96px 20px;
  }

  .cta-title {
    font-size: clamp(28px, 5vw, 42px);
  }

  .cta-lead {
    font-size: 16px;
  }

  .cta-trust {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .btn-cta-primary,
  .btn-cta-secondary {
    width: 100%;
    justify-content: center;
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-cta-primary,
  .btn-cta-secondary {
    width: 100%;
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta-content {
    transition: none;
  }
}
</style>