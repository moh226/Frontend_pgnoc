<script setup lang="ts">
import TableauDeBordEnConstruction from '@/components/TableauDeBordEnConstruction.vue'

const fonctions = [
  'Paramétrer le parcours KYC (sections, champs, ordre)',
  'Gérer la convention tarifaire et la présentation de la SGI',
  'Créer les comptes agents de ma SGI',
  "Consulter le journal d'audit",
]
</script>

<template>
  <TableauDeBordEnConstruction
    titre="Tableau de bord admin SGI"
    description="Administration de la société de gestion : paramétrage KYC, convention, agents."
    :prochaines-fonctions="fonctions"
  />
</template>
