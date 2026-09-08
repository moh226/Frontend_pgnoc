<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Trash2, Image, X, Upload, Hash, ListOrdered, ShieldCheck, Quote, HelpCircle, Megaphone } from '@lucide/vue'
import type { TypeBlocAccueil } from '@/types'
import type {
  LigneChiffre,
  LigneTitreDesc,
  LigneTemoignage,
  LigneQuestion
} from '@/composables/useAccueilEditor'

defineProps<{
  blocSelectionne: TypeBlocAccueil
  hero: { slogan: string; cta_principal: string; lien_principal: string; cta_secondaire: string; lien_secondaire: string }
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

const ICONES_SECTION: Record<string, unknown> = {
  CHIFFRES: Hash,
  ETAPES: ListOrdered,
  SECURITE: ShieldCheck,
  TEMOIGNAGES: Quote,
  FAQ: HelpCircle,
}
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->

  <!-- HERO -->
  <template v-if="blocSelectionne === 'HERO'">
    <div class="ligne-champ">
      <label class="etiquette-champ">Sous-titre (accroche)</label>
      <v-textarea
        v-model="hero.slogan"
        density="comfortable"
        variant="outlined"
        hide-details
        rows="3"
        auto-grow
        class="premium-input"
        placeholder="Proposition de valeur affichée sous le titre principal."
      />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Bouton principal</label>
      <v-text-field v-model="hero.cta_principal" density="comfortable" variant="outlined" hide-details class="premium-input" placeholder="S'inscrire" />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Lien principal</label>
      <v-text-field v-model="hero.lien_principal" density="comfortable" variant="outlined" hide-details class="premium-input" placeholder="/inscription" />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Bouton secondaire</label>
      <v-text-field v-model="hero.cta_secondaire" density="comfortable" variant="outlined" hide-details class="premium-input" placeholder="Se connecter" />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Lien secondaire</label>
      <v-text-field v-model="hero.lien_secondaire" density="comfortable" variant="outlined" hide-details class="premium-input" placeholder="/login" />
    </div>
  </template>

  <!-- REASSURANCE -->
  <template v-if="blocSelectionne === 'REASSURANCE'">
    <p class="text-caption font-weight-bold text-medium-emphasis text-uppercase tracking-wider mb-3">
      Mentions affichées dans le bandeau
    </p>
    <div v-if="mentions.length" class="d-flex flex-wrap ga-2 mb-4">
      <v-chip
        v-for="(mention, i) in mentions"
        :key="`${mention}-${i}`"
        closable
        variant="tonal"
      >
        {{ mention }}
      </v-chip>
    </div>
    <p v-else class="text-body-2 text-medium-emphasis mb-4">
      Aucune mention pour le moment — ajoutez vos points de confiance ci-dessous.
    </p>
    <div class="groupe-ajout">
      <v-text-field
        :model-value="nouvelleMention"
        @update:model-value="(val) => emit('update:nouvelleMention', val)"
        density="comfortable"
        variant="outlined"
        hide-details
        class="premium-input"
        placeholder="Nouvelle mention (ex : Régulé par le CREPMF)"
        @keyup.enter="emit('ajouterMention')"
      />
      <v-btn color="primary" variant="tonal" class="font-weight-bold" @click="emit('ajouterMention')">
        <Plus :size="17" class="mr-1" /> Ajouter
      </v-btn>
    </div>
  </template>

  <!-- CHIFFRES -->
  <template v-if="blocSelectionne === 'CHIFFRES'">
    <div class="entete-section-liste">
      <component :is="ICONES_SECTION.CHIFFRES" :size="17" class="text-primary" />
      <span>Chiffres clés affichés</span>
      <v-spacer />
      <span class="compteur-items">{{ chiffres.length }}</span>
    </div>
    <v-card v-for="(chiffre, i) in chiffres" :key="i" class="element-repete mb-3">
      <div class="element-repete-corps">
        <v-text-field
          v-model="chiffre.valeur"
          label="Valeur"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          class="premium-input champ-court"
          placeholder="100 %"
        />
        <v-text-field
          v-model="chiffre.libelle"
          label="Libellé"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          class="premium-input"
          placeholder="dossiers tracés"
        />
      </div>
      <v-btn icon size="small" variant="text" color="error" class="btn-supprimer" @click="chiffres.splice(i, 1)">
        <Trash2 :size="15" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="tonal" class="font-weight-bold mt-2" @click="chiffres.push({ valeur: '', libelle: '' })">
      <Plus :size="17" class="mr-1" /> Ajouter un chiffre
    </v-btn>
  </template>

  <!-- ETAPES -->
  <template v-if="blocSelectionne === 'ETAPES'">
    <div class="entete-section-liste">
      <component :is="ICONES_SECTION.ETAPES" :size="17" class="text-primary" />
      <span>Étapes du parcours</span>
      <v-spacer />
      <span class="compteur-items">{{ etapes.length }}</span>
    </div>
    <v-card v-for="(etape, i) in etapes" :key="i" class="element-repete mb-3">
      <div class="numéro-etape">{{ i + 1 }}</div>
      <div class="element-repete-corps">
        <v-text-field
          v-model="etape.titre"
          label="Titre de l'étape"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          class="premium-input champ-court"
          placeholder="Créez votre compte"
        />
        <v-text-field
          v-model="etape.description"
          label="Description"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          class="premium-input"
          placeholder="Inscription en ligne en quelques minutes."
        />
      </div>
      <v-btn icon size="small" variant="text" color="error" class="btn-supprimer" @click="etapes.splice(i, 1)">
        <Trash2 :size="15" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="tonal" class="font-weight-bold mt-2" @click="etapes.push({ titre: '', description: '' })">
      <Plus :size="17" class="mr-1" /> Ajouter une étape
    </v-btn>
  </template>

  <!-- SÉCURITÉ -->
  <template v-if="blocSelectionne === 'SECURITE'">
    <div class="entete-section-liste">
      <component :is="ICONES_SECTION.SECURITE" :size="17" class="text-primary" />
      <span>Cartes sécurité</span>
      <v-spacer />
      <span class="compteur-items">{{ cartes.length }}</span>
    </div>
    <v-card v-for="(carte, i) in cartes" :key="i" class="element-repete mb-3">
      <div class="element-repete-corps element-repete-corps--colonne">
        <v-text-field
          v-model="carte.titre"
          label="Titre de la carte"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          class="premium-input"
          placeholder="Preuve de vie signée"
        />
        <v-textarea
          v-model="carte.description"
          label="Description"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          rows="2"
          auto-grow
          class="premium-input"
          placeholder="Chaque selfie est horodaté, haché et signé par le serveur."
        />
      </div>
      <v-btn icon size="small" variant="text" color="error" class="btn-supprimer" @click="cartes.splice(i, 1)">
        <Trash2 :size="15" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="tonal" class="font-weight-bold mt-2" @click="cartes.push({ titre: '', description: '' })">
      <Plus :size="17" class="mr-1" /> Ajouter une carte
    </v-btn>
  </template>

  <!-- TÉMOIGNAGES -->
  <template v-if="blocSelectionne === 'TEMOIGNAGES'">
    <div class="entete-section-liste">
      <component :is="ICONES_SECTION.TEMOIGNAGES" :size="17" class="text-primary" />
      <span>Témoignages</span>
      <v-spacer />
      <span class="compteur-items">{{ temoignages.length }}</span>
    </div>
    <v-card v-for="(temoignage, i) in temoignages" :key="i" class="element-repete mb-3">
      <div class="element-repete-corps element-repete-corps--colonne">
        <div class="element-repete-corps">
          <v-text-field
            v-model="temoignage.nom"
            label="Nom"
            density="comfortable"
            variant="outlined"
            hide-details="auto"
            class="premium-input champ-court"
            placeholder="Awa K."
          />
          <v-text-field
            v-model="temoignage.role"
            label="Rôle"
            density="comfortable"
            variant="outlined"
            hide-details="auto"
            class="premium-input champ-court"
            placeholder="Investisseuse"
          />
        </div>
        <v-textarea
          v-model="temoignage.texte"
          label="Témoignage"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          rows="2"
          auto-grow
          class="premium-input"
          placeholder="J'ai ouvert mon compte-titres à distance, en toute sérénité."
        />
      </div>
      <v-btn icon size="small" variant="text" color="error" class="btn-supprimer" @click="temoignages.splice(i, 1)">
        <Trash2 :size="15" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="tonal" class="font-weight-bold mt-2" @click="temoignages.push({ nom: '', role: '', texte: '' })">
      <Plus :size="17" class="mr-1" /> Ajouter un témoignage
    </v-btn>
  </template>

  <!-- FAQ -->
  <template v-if="blocSelectionne === 'FAQ'">
    <div class="entete-section-liste">
      <component :is="ICONES_SECTION.FAQ" :size="17" class="text-primary" />
      <span>Questions fréquentes</span>
      <v-spacer />
      <span class="compteur-items">{{ questions.length }}</span>
    </div>
    <v-card v-for="(question, i) in questions" :key="i" class="element-repete mb-3">
      <div class="numéro-etape">Q{{ i + 1 }}</div>
      <div class="element-repete-corps element-repete-corps--colonne">
        <v-text-field
          v-model="question.question"
          label="Question"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          class="premium-input"
          placeholder="Quels documents dois-je fournir ?"
        />
        <v-textarea
          v-model="question.reponse"
          label="Réponse"
          density="comfortable"
          variant="outlined"
          hide-details="auto"
          rows="2"
          auto-grow
          class="premium-input"
          placeholder="Une pièce d'identité valide et un selfie de vérification."
        />
      </div>
      <v-btn icon size="small" variant="text" color="error" class="btn-supprimer" @click="questions.splice(i, 1)">
        <Trash2 :size="15" />
      </v-btn>
    </v-card>
    <v-btn color="primary" variant="tonal" class="font-weight-bold mt-2" @click="questions.push({ question: '', reponse: '' })">
      <Plus :size="17" class="mr-1" /> Ajouter une question
    </v-btn>
  </template>

  <!-- APPEL À L'ACTION -->
  <template v-if="blocSelectionne === 'APPEL_ACTION'">
    <div class="entete-section-liste">
      <Megaphone :size="17" class="text-primary" />
      <span>Message final</span>
      <v-spacer />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Slogan</label>
      <v-text-field v-model="appelAction.slogan" density="comfortable" variant="outlined" hide-details class="premium-input" placeholder="Prêt à ouvrir votre compte-titres ?" />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Libellé du bouton</label>
      <v-text-field v-model="appelAction.cta" density="comfortable" variant="outlined" hide-details class="premium-input" placeholder="S'inscrire" />
    </div>
    <div class="ligne-champ">
      <label class="etiquette-champ">Lien du bouton</label>
      <v-text-field v-model="appelAction.lien" density="comfortable" variant="outlined" hide-details class="premium-input" placeholder="/inscription" />
    </div>
  </template>

  <!-- Image d'illustration du HERO -->
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
        class="hero-upload-zone d-flex align-center justify-center text-center flex-grow-1"
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
      <v-avatar v-if="imageActuelle" size="48" rounded class="elevation-1">
        <v-img :src="imageActuelle" cover />
      </v-avatar>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Libellés latéraux (HERO, CTA) ---------- */
.ligne-champ {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.ligne-champ:last-child {
  margin-bottom: 0;
}

.etiquette-champ {
  flex: 0 0 190px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.4;
}

.ligne-champ-ecartee {
  margin-top: 20px;
  border-top: 1px solid rgb(var(--v-theme-outline));
  padding-top: 20px;
}

/* ---------- En-tête des sections à éléments répétés ---------- */
.entete-section-liste {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.compteur-items {
  min-width: 26px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 800;
}

/* ---------- Élément répété (une ligne = une carte standard) ---------- */
.element-repete {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 16px 12px 16px 16px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface-variant)) !important;
  border: 1px solid rgb(var(--v-theme-outline));
  transition: border-color 0.18s ease;
}

.element-repete:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.element-repete-corps {
  display: flex;
  flex: 1;
  gap: 12px;
  min-width: 0;
}

.element-repete-corps--colonne {
  flex-direction: column;
  gap: 12px;
}

.champ-court {
  flex: 0 0 40%;
}

.numéro-etape {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  margin-right: 4px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 13px;
  font-weight: 800;
}

.btn-supprimer {
  flex-shrink: 0;
  margin-top: 2px;
}

/* ---------- Zone d'ajout (mentions) ---------- */
.groupe-ajout {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* ---------- Zone d'upload image ---------- */
.hero-upload-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.25);
  border-radius: 10px;
  background-color: transparent;
  transition: all 0.18s ease;
  cursor: pointer;
  padding: 12px 16px;
  min-height: 48px;
}

.hero-upload-zone:hover,
.hero-upload-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* ---------- Responsive ---------- */
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

  .element-repete-corps {
    flex-direction: column;
  }

  .champ-court {
    flex: unset;
  }
}
</style>
