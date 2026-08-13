<script setup lang="ts">
import TableauDeBordEnConstruction from '@/components/TableauDeBordEnConstruction.vue'

const fonctions = [
  'Superviser les SGI, sociétés et utilisateurs',
  'Gérer la place de cession (investisseurs, acteurs)',
  "Consulter le journal d'audit global avec export CSV",
  'Suivre les statistiques de la plateforme',
]
</script>

<template>
  <TableauDeBordEnConstruction
    titre="Tableau de bord admin général"
    description="Administration centrale de la plateforme PGNOC-TI."
    :prochaines-fonctions="fonctions"
  />
</template>
