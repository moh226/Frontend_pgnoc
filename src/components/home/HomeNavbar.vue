<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Landmark, Menu, X, LogIn, UserPlus } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { redirectionPourRole } from '@/config/navigation'

const auth = useAuthStore()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="home-navbar"
    :class="{ 'is-scrolled': isScrolled, 'mobile-open': isMobileMenuOpen }"
    role="banner"
  >
    <div class="navbar-container">
      <router-link class="navbar-brand" to="/" aria-label="PGNOC-TI - Accueil">
        <span class="brand-icon" aria-hidden="true">
          <Landmark :size="22" />
        </span>
        <span class="brand-text">
          <span class="brand-name">PGNOC-TI</span>
          <span class="brand-tagline">Marché financier régional</span>
        </span>
      </router-link>

      <nav class="navbar-nav" :class="{ 'is-open': isMobileMenuOpen }" role="navigation" aria-label="Navigation principale">
        <div class="nav-actions">
          <router-link v-if="!auth.estConnecte" to="/login" class="btn-ghost" @click="closeMobileMenu">
            <LogIn :size="16" class="mr-1" aria-hidden="true" />
            Se connecter
          </router-link>
          <router-link
            v-if="!auth.estConnecte"
            to="/inscription"
            class="btn-primary"
            @click="closeMobileMenu"
          >
            <UserPlus :size="16" class="mr-1" aria-hidden="true" />
            Commencer
          </router-link>
          <router-link
            v-if="auth.estConnecte"
            :to="redirectionPourRole(auth.roleActuel)"
            class="btn-primary"
            @click="closeMobileMenu"
          >
            Mon espace
          </router-link>
        </div>
      </nav>

      <button
        class="mobile-menu-btn"
        @click="toggleMobileMenu"
        :aria-expanded="isMobileMenuOpen"
        :aria-label="isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
        aria-controls="mobile-nav"
      >
        <Menu v-if="!isMobileMenuOpen" :size="24" aria-hidden="true" />
        <X v-else :size="24" aria-hidden="true" />
      </button>
    </div>

    <div v-if="isMobileMenuOpen" class="mobile-backdrop" @click="closeMobileMenu" aria-hidden="true" />
  </header>
</template>

<style scoped>
.home-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid transparent;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.home-navbar.is-scrolled {
  background: rgba(255, 255, 255, 0.95);
  border-bottom-color: rgb(var(--v-theme-outline));
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-name {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--v-theme-primary));
}

.brand-tagline {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 8px;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 10px 18px;
  border-radius: 8px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.btn-ghost:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
  padding: 10px 22px;
  border-radius: 8px;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.btn-primary:hover {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-1px);
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.mobile-menu-btn:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.mobile-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

@media (max-width: 1024px) {
  .navbar-nav {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    max-width: 85vw;
    flex-direction: column;
    align-items: stretch;
    padding: 100px 24px 40px;
    background: rgb(var(--v-theme-surface));
    border-left: 1px solid rgb(var(--v-theme-outline));
    box-shadow: -24px 0 40px rgba(15, 23, 42, 0.15);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1000;
    overflow-y: auto;
  }

  .navbar-nav.is-open {
    transform: translateX(0);
  }

  .nav-actions {
    flex-direction: column;
    align-items: stretch;
    margin-left: 0;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgb(var(--v-theme-outline));
    width: 100%;
  }

  .btn-ghost,
  .btn-primary {
    justify-content: center;
    width: 100%;
  }

  .mobile-menu-btn {
    display: flex;
    z-index: 1001;
  }

  .mobile-backdrop {
    display: block;
  }
}

@media (max-width: 600px) {
  .navbar-container {
    padding: 0 20px;
    height: 64px;
  }

  .brand-tagline {
    display: none;
  }

  .navbar-nav {
    width: 100%;
    max-width: 100%;
    padding: 96px 20px 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-navbar,
  .navbar-nav,
  .btn-primary {
    transition: none;
  }
}
</style>