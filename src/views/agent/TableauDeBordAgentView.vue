<script setup lang="ts">
import TableauDeBordEnConstruction from '@/components/TableauDeBordEnConstruction.vue'

const fonctions = [
  "Traiter les dossiers de cession qui m'ont été assignés",
  'Commenter et justifier les valeurs des champs KYC',
  'Déclencher les signatures des investisseurs (e-signature, OTP)',
  "Suivre les étapes du workflow jusqu'à l'archivage",
]
</script>

<template>
  <TableauDeBordEnConstruction
    titre="Tableau de bord agent SGI"
    description="Espace de travail de l'agent de société de gestion : instruction des dossiers et signatures."
    :prochaines-fonctions="fonctions"
  />
</template>
