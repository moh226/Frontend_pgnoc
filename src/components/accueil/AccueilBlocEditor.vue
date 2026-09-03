<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Trash2, Image, X, Upload } from '@lucide/vue'
import type { TypeBlocAccueil } from '@/types'
import type {
  LigneChiffre,
  LigneTitreDesc,
  LigneTemoignage,
  LigneQuestion
} from '@/composables/useAccueilEditor'

defineProps<{
  blocSelectionne: TypeBlocAccueil
  hero: { cta_principal: string; lien_principal: string; cta_secondaire: string; lien_secondaire: string }
  mentions: string[]
  nouvelleMention: string
  chiffres: LigneChiffre[]
  etapes: LigneTitreDesc[]
  cartes: LigneTitreDesc[]
  temoignages: LigneTemoignage[]
  questions: LigneQuestion[]
  appelAction: { cta: string; lien: string; slogan: string }
  nouveauFichier: File | null
  imageActuelle?: string
}>()

const emit = defineEmits<{
  (e: 'update:nouvelleMention', value: string): void
  (e: 'ajouterMention'): void
  (e: 'surFichierChoisi', value: File | File[]): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

function onFileDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f && f.type.startsWith('image/')) emit('surFichierChoisi', f)
}

function onFileSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) emit('surFichierChoisi', f)
}

function clearFile() {
  if (fileInputRef.value) fileInputRef.value.value = ''
  emit('surFichierChoisi', null as unknown as File)
}
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <!-- HERO -->
  <template v-if="blocSelectionne === 'HERO'">
    <div class="ligne-champ">
      <label class="etiquette-champ">Bouton principal</label>
      <v-text-field v-model="hero.cta_principal" density="comfortable" variant="outlined" hide-details />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Lien principal</label>
      <v-text-field v-model="hero.lien_principal" density="comfortable" variant="outlined" hide-details placeholder="/inscription" />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Bouton secondaire</label>
      <v-text-field v-model="hero.cta_secondaire" density="comfortable" variant="outlined" hide-details />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Lien secondaire</label>
      <v-text-field v-model="hero.lien_secondaire" density="comfortable" variant="outlined" hide-details placeholder="/login" />
    </div>
  </template>

  <!-- REASSURANCE -->
  <template v-if="blocSelectionne === 'REASSURANCE'">
    <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-3">
      Mentions affichées
    </p>
    <v-chip
      v-for="(mention, i) in mentions"
      :key="`${mention}-${i}`"
      closable
      class="mr-3 mb-3"
      @click:close="mentions.splice(i, 1)"
    >
      {{ mention }}
    </v-chip>
    <div class="groupe-ajout">
      <v-text-field
        :model-value="nouvelleMention"
        @update:model-value="(val) => emit('update:nouvelleMention', val)"
        density="comfortable"
        variant="outlined"
        hide-details
        placeholder="Nouvelle mention (ex : Régulé par le CREPMF)"
        @keyup.enter="emit('ajouterMention')"
      />
      <v-btn color="primary" variant="flat" @click="emit('ajouterMention')">
        <Plus :size="18" /> Ajouter
      </v-btn>
    </div>
  </template>

  <!-- CHIFFRES -->
  <template v-if="blocSelectionne === 'CHIFFRES'">
    <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-3">Chiffres clés</p>
    <v-card v-for="(chiffre, i) in chiffres" :key="i" variant="tonal" class="mb-4 pa-4 position-relative">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="chiffre.valeur" label="Valeur" density="comfortable" variant="outlined" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="chiffre.libelle" label="Libellé" density="comfortable" variant="outlined" />
        </v-col>
      </v-row>
      <v-btn icon size="small" variant="text" color="error" class="position-absolute" style="top: 4px; right: 4px" @click="chiffres.splice(i, 1)">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="outlined" class="mt-2" @click="chiffres.push({ valeur: '', libelle: '' })">
      <Plus :size="18" class="mr-2" /> Ajouter un chiffre
    </v-btn>
  </template>

  <!-- ETAPES -->
  <template v-if="blocSelectionne === 'ETAPES'">
    <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-3">Étapes du parcours</p>
    <v-card v-for="(etape, i) in etapes" :key="i" variant="tonal" class="mb-4 pa-4 position-relative">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="etape.titre" label="Titre" density="comfortable" variant="outlined" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="etape.description" label="Description" density="comfortable" variant="outlined" />
        </v-col>
      </v-row>
      <v-btn icon size="small" variant="text" color="error" class="position-absolute" style="top: 4px; right: 4px" @click="etapes.splice(i, 1)">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="outlined" class="mt-2" @click="etapes.push({ titre: '', description: '' })">
      <Plus :size="18" class="mr-2" /> Ajouter une étape
    </v-btn>
  </template>

  <!-- SÉCURITÉ -->
  <template v-if="blocSelectionne === 'SECURITE'">
    <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-3">Cartes sécurité</p>
    <v-card v-for="(carte, i) in cartes" :key="i" variant="tonal" class="mb-4 pa-4 position-relative">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="carte.titre" label="Titre" density="comfortable" variant="outlined" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="carte.description" label="Description" density="comfortable" variant="outlined" />
        </v-col>
      </v-row>
      <v-btn icon size="small" variant="text" color="error" class="position-absolute" style="top: 4px; right: 4px" @click="cartes.splice(i, 1)">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="outlined" class="mt-2" @click="cartes.push({ titre: '', description: '' })">
      <Plus :size="18" class="mr-2" /> Ajouter une carte
    </v-btn>
  </template>

  <!-- TÉMOIGNAGES -->
  <template v-if="blocSelectionne === 'TEMOIGNAGES'">
    <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-3">Témoignages</p>
    <v-card v-for="(temoignage, i) in temoignages" :key="i" variant="tonal" class="mb-4 pa-4 position-relative">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="temoignage.nom" label="Nom" density="comfortable" variant="outlined" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="temoignage.role" label="Rôle" density="comfortable" variant="outlined" />
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="temoignage.texte" label="Témoignage" density="comfortable" variant="outlined" multiline :rows="2" />
        </v-col>
      </v-row>
      <v-btn icon size="small" variant="text" color="error" class="position-absolute" style="top: 4px; right: 4px" @click="temoignages.splice(i, 1)">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="outlined" class="mt-2" @click="temoignages.push({ nom: '', role: '', texte: '' })">
      <Plus :size="18" class="mr-2" /> Ajouter un témoignage
    </v-btn>
  </template>

  <!-- FAQ -->
  <template v-if="blocSelectionne === 'FAQ'">
    <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-3">Questions fréquentes</p>
    <v-card v-for="(question, i) in questions" :key="i" variant="tonal" class="mb-4 pa-4 position-relative">
      <v-text-field v-model="question.question" label="Question" class="mb-3" density="comfortable" variant="outlined" />
      <v-text-field v-model="question.reponse" label="Réponse" density="comfortable" variant="outlined" multiline :rows="2" />
      <v-btn icon size="small" variant="text" color="error" class="position-absolute" style="top: 4px; right: 4px" @click="questions.splice(i, 1)">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="outlined" class="mt-2" @click="questions.push({ question: '', reponse: '' })">
      <Plus :size="18" class="mr-2" /> Ajouter une question
    </v-btn>
  </template>

  <!-- APPEL À L'ACTION -->
  <template v-if="blocSelectionne === 'APPEL_ACTION'">
    <div class="ligne-champ">
      <label class="etiquette-champ">Slogan</label>
      <v-text-field v-model="appelAction.slogan" density="comfortable" variant="outlined" hide-details />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Libellé du bouton</label>
      <v-text-field v-model="appelAction.cta" density="comfortable" variant="outlined" hide-details />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Lien du bouton</label>
      <v-text-field v-model="appelAction.lien" density="comfortable" variant="outlined" hide-details placeholder="/inscription" />
    </div>
  </template>

  <div v-if="blocSelectionne === 'HERO'" class="ligne-champ ligne-champ-ecartee">
    <label class="etiquette-champ">
      Image d'illustration
    </label>
    <div class="d-flex align-center flex-grow-1" style="gap: 16px;">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="d-none"
        @change="onFileSelect"
      />
      <div
        class="hero-upload-zone rounded-lg d-flex align-center justify-center text-center flex-grow-1"
        :class="{ 'hero-upload-zone--active': dragOver }"
        @click="fileInputRef?.click()"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onFileDrop"
      >
        <template v-if="!nouveauFichier">
          <Upload :size="18" class="text-medium-emphasis mr-2" />
          <span class="text-body-2 text-medium-emphasis">Choisir une image (conservé si vide)</span>
        </template>
        <template v-else>
          <Image :size="18" class="text-primary mr-2" />
          <span class="text-body-2 font-weight-medium text-primary mr-2">{{ nouveauFichier.name }}</span>
          <v-btn size="x-small" variant="text" icon @click.stop="clearFile">
            <X :size="14" />
          </v-btn>
        </template>
      </div>
      <v-avatar v-if="imageActuelle" size="48" rounded>
        <v-img :src="imageActuelle" />
      </v-avatar>
    </div>
  </div>
</template>

<style scoped>
/* Une ligne = un libellé + son champ, alignés sur la même rangée. */
.ligne-champ {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.ligne-champ:last-child {
  margin-bottom: 0;
}

/* Libellé à largeur fixe : tous les champs démarrent à la même colonne. */
.etiquette-champ {
  flex: 0 0 190px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.4;
}

/* Zone de saisie + bouton d'ajout sur la même ligne, bien espacés. */
.groupe-ajout {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  margin-bottom: 10px;
}

/* Dernière rangée du bloc (Image) : on l'écarte visiblement de la zone précédente. */
.ligne-champ-ecartee {
  margin-top: 20px;
  border-top: 1px solid rgb(var(--v-theme-outline));
  padding-top: 20px;
}

@media (max-width: 700px) {
  .ligne-champ {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .etiquette-champ {
    flex: unset;
  }

  .groupe-ajout {
    flex-direction: column;
    align-items: stretch;
  }
}

.hero-upload-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.25);
  background-color: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 12px 16px;
  min-height: 48px;
}

.hero-upload-zone:hover,
.hero-upload-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.03);
}
</style>
