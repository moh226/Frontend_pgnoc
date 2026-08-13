<script setup lang="ts">
import TableauDeBordEnConstruction from '@/components/TableauDeBordEnConstruction.vue'

const fonctions = [
  'Consulter mes investissements (KYC, conventions, dossiers)',
  "Suivre l'avancement de mes dossiers de cession",
  'Télécharger les documents (conventions, justificatifs)',
  'Signer mes dossiers par code OTP',
]
</script>

<template>
  <TableauDeBordEnConstruction
    titre="Tableau de bord investisseur"
    description="Espace personnel du détenteur de titres : suivi de ses investissements et de ses dossiers de cession."
    :prochaines-fonctions="fonctions"
  />
</template>
