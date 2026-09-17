<script setup lang="ts">
import { computed } from 'vue'
import { Landmark } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { redirectionPourRole } from '@/config/navigation'

const auth = useAuthStore()
const currentYear = new Date().getFullYear()

const footerLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Connexion', to: '/login', publicOnly: true },
  { label: 'Inscription', to: '/inscription', publicOnly: true },
  { label: 'Mon espace', to: '', authOnly: true },
]

const legalLinks = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Politique de confidentialité', to: '/confidentialite' },
  { label: 'Conditions d\'utilisation', to: '/conditions' },
]

const visibleLinks = computed(() => {
  return footerLinks.filter((link) => {
    if (link.publicOnly && auth.estConnecte) return false
    if (link.authOnly && !auth.estConnecte) return false
    return true
  })
})

function getLinkTo(link: (typeof footerLinks)[0]) {
  if (link.authOnly && auth.estConnecte) {
    return redirectionPourRole(auth.roleActuel)
  }
  return link.to
}
</script>

<template>
  <footer class="home-footer" role="contentinfo" data-aos="fade-up" data-aos-duration="700">
    <div class="footer-main">
      <div class="footer-grid">
        <div class="footer-brand" data-aos="fade-right" data-aos-duration="600" data-aos-delay="100">
          <div class="footer-logo" aria-hidden="true">
            <Landmark :size="24" />
          </div>
          <div class="footer-brand-info">
            <div class="footer-brand-name">PGNOC-TI</div>
            <p class="footer-brand-desc">
              Plateforme de gestion numérique des demandes d'ouverture de compte-titres pour investisseurs en SGI;
            </p>
          </div>
        </div>

        <nav class="footer-nav" aria-label="Navigation principale" data-aos="fade-up" data-aos-duration="600" data-aos-delay="200">
          <h4 class="footer-nav-title">Navigation</h4>
          <ul class="footer-link-list">
            <li v-for="(link, index) in visibleLinks" :key="link.label" data-aos="fade-up" data-aos-duration="500" :data-aos-delay="index * 100 + 300">
              <router-link :to="getLinkTo(link)" class="footer-link">
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </nav>

        <nav class="footer-nav" aria-label="Informations légales" data-aos="fade-up" data-aos-duration="600" data-aos-delay="300">
          <h4 class="footer-nav-title">Légal</h4>
          <ul class="footer-link-list">
            <li v-for="(link, index) in legalLinks" :key="link.label" data-aos="fade-up" data-aos-duration="500" :data-aos-delay="index * 100 + 300">
              <router-link :to="link.to" class="footer-link">
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </nav>

        <div class="footer-contact" data-aos="fade-left" data-aos-duration="600" data-aos-delay="400">
          <h4 class="footer-nav-title">Contact</h4>
          <address class="footer-address">
            <p>PGNOC-TI - Marché financier régional UEMOA</p>
            <p>
              <a href="mailto:contact@pgnoc-ti.uemoa" class="footer-contact-link">
                contact@pgnoc-ti.uemoa
              </a>
            </p>
            <p>
              <a href="tel:+225xxxxxxxx" class="footer-contact-link">
                +225 XX XX XX XX
              </a>
            </p>
          </address>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p class="footer-copyright">
          © {{ currentYear }} PGNOC-TI. Tous droits réservés;
        </p>
        <p class="footer-seal">
          Ouverture de compte-titres · Sécurité · Transparence · Conformité UEMOA
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.home-footer {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.footer-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 32px 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 48px;
}

.footer-brand {
  max-width: 360px;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-on-secondary));
  margin-bottom: 16px;
}

.footer-brand-name {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
  color: white;
}

.footer-brand-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
}

.footer-nav-title {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.footer-link-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  padding: 6px 0;
  border-radius: 8px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.footer-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.06);
}

.footer-address {
  font-style: normal;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
}

.footer-address p {
  margin: 0 0 8px;
}

.footer-contact-link {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-contact-link:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-copyright {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.footer-seal {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px 32px;
  }

  .footer-brand {
    grid-column: 1 / -1;
    max-width: none;
  }
}

@media (max-width: 600px) {
  .footer-main {
    padding: 48px 20px 32px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .footer-logo {
    margin: 0 auto 16px;
  }

  .footer-nav-title {
    margin-bottom: 12px;
  }

  .footer-link-list {
    align-items: center;
  }

  .footer-address {
    text-align: center;
  }

  .footer-bottom-content {
    padding: 16px 20px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-link,
  .footer-contact-link {
    transition: none;
  }
}
</style>