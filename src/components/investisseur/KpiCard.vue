<script setup lang="ts">
import { computed, type Component } from 'vue'
import { TrendingUp } from '@lucide/vue'

interface Props {
  icon: Component
  value: string | number
  label: string
  color: string
  trend?: string
}

const props = defineProps<Props>()

const trendValue = computed(() => props.trend ?? null)
</script>

<template>
  <v-card class="kpi-card" data-aos="zoom-in" data-aos-duration="500">
    <div class="kpi-icon" :style="{ backgroundColor: color + '15', color: color }">
      <component :is="icon" :size="22" />
    </div>
    <div class="kpi-content">
      <div class="kpi-value">{{ value }}</div>
      <div class="kpi-label">{{ label }}</div>
      <div v-if="trendValue" class="kpi-trend">
        <TrendingUp :size="12" />
        <span>{{ trendValue }}</span>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.kpi-card {
  padding: 20px 16px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-value {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.kpi-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-on-surface-variant));
}

.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-success));
}
</style>