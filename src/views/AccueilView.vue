<script setup lang="ts">
import HomeNavbar from '@/components/home/HomeNavbar.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import ProblemSection from '@/components/home/ProblemSection.vue'
import SolutionSection from '@/components/home/SolutionSection.vue'
import HowItWorksSection from '@/components/home/HowItWorksSection.vue'
import InvestorSection from '@/components/home/InvestorSection.vue'
import SgiSection from '@/components/home/SgiSection.vue'
import SecuritySection from '@/components/home/SecuritySection.vue'
import FinalCtaSection from '@/components/home/FinalCtaSection.vue'
import HomeFooter from '@/components/home/HomeFooter.vue'
</script>

<template>
  <div class="accueil-public">
    <HomeNavbar />

    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <InvestorSection />
      <SgiSection />
      <SecuritySection />
      <FinalCtaSection />
    </main>

    <HomeFooter />
  </div>
</template>

<style scoped>
.accueil-public {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-surface));
}

.accueil-public main {
  flex: 1;
}
</style>