<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Globe,
  ImagePlus,
  PencilLine,
  Plus,
  Send,
  Trash2,
} from '@lucide/vue'

import { listeBlocsAccueilAdmin, modifierBlocAccueil, ordonnerBlocsAccueil } from '@/api/accueil'
import { extraireMessageErreur } from '@/api/client'
import type { BlocAccueilAdmin, ContenuBlocAccueil, TypeBlocAccueil } from '@/types'

const LIBELLES_TYPE: Record<TypeBlocAccueil, string> = {
  HERO: "Bannière d'accueil",
  REASSURANCE: 'Mentions de réassurance',
  CHIFFRES: 'Chiffres clés',
  ETAPES: 'Comment ça marche',
  SECURITE: 'Sécurité et conformité',
  TEMOIGNAGES: 'Témoignages',
  FAQ: 'Questions fréquentes',
  APPEL_ACTION: "Appel à l'action",
}

interface LigneChiffre {
  valeur: string
  libelle: string
}

interface LigneTitreDesc {
  titre: string
  description: string
}

interface LigneTemoignage {
  nom: string
  role: string
  texte: string
}

interface LigneQuestion {
  question: string
  reponse: string
}

const blocs = ref<BlocAccueilAdmin[]>([])
const chargement = ref(true)
const erreur = ref('')
const message = ref('')
const enregistrement = ref(false)
const publication = ref(false)

const blocSelectionne = ref<TypeBlocAccueil | null>(null)
const brouillonTitre = ref('')
const nouveauFichier = ref<File | null>(null)
const nouvelleMention = ref('')

const hero = reactive({
  cta_principal: '',
  lien_principal: '',
  cta_secondaire: '',
  lien_secondaire: '',
})
const mentions = ref<string[]>([])
const chiffres = ref<LigneChiffre[]>([])
const etapes = ref<LigneTitreDesc[]>([])
const cartes = ref<LigneTitreDesc[]>([])
const temoignages = ref<LigneTemoignage[]>([])
const questions = ref<LigneQuestion[]>([])
const appelAction = reactive({ cta: '', lien: '', slogan: '' })

const blocsTries = computed(() =>
  [...blocs.value].sort((a, b) => a.ordre - b.ordre),
)

const blocCourant = computed(
  () => blocs.value.find((b) => b.type === blocSelectionne.value) ?? null,
)

const nbPublies = computed(() => blocs.value.filter((b) => b.publie).length)

const imageActuelle = computed(() =>
  blocs.value.find((b) => b.type === blocSelectionne.value)?.image_url ?? undefined,
)

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    blocs.value = await listeBlocsAccueilAdmin()
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    chargement.value = false
  }
}

function selectionner(type: TypeBlocAccueil) {
  blocSelectionne.value = type
  const bloc = blocs.value.find((b) => b.type === type)
  const contenu = bloc?.contenu ?? {}
  brouillonTitre.value = bloc?.titre ?? ''
  nouveauFichier.value = null
  nouvelleMention.value = ''
  hero.cta_principal = contenu.cta_principal ?? ''
  hero.lien_principal = contenu.lien_principal ?? ''
  hero.cta_secondaire = contenu.cta_secondaire ?? ''
  hero.lien_secondaire = contenu.lien_secondaire ?? ''
  mentions.value = [...(contenu.mentions ?? [])]
  chiffres.value = JSON.parse(JSON.stringify(contenu.chiffres ?? [])) as LigneChiffre[]
  etapes.value = JSON.parse(JSON.stringify(contenu.etapes ?? [])) as LigneTitreDesc[]
  cartes.value = JSON.parse(JSON.stringify(contenu.cartes ?? [])) as LigneTitreDesc[]
  temoignages.value = JSON.parse(JSON.stringify(contenu.temoignages ?? [])) as LigneTemoignage[]
  questions.value = JSON.parse(JSON.stringify(contenu.questions ?? [])) as LigneQuestion[]
  appelAction.cta = contenu.cta ?? ''
  appelAction.lien = contenu.lien ?? ''
  appelAction.slogan = contenu.slogan ?? ''
}

function contenuConstruit(): ContenuBlocAccueil {
  switch (blocSelectionne.value) {
    case 'HERO':
      return {
        cta_principal: hero.cta_principal,
        lien_principal: hero.lien_principal,
        cta_secondaire: hero.cta_secondaire,
        lien_secondaire: hero.lien_secondaire,
      }
    case 'REASSURANCE':
      return { mentions: mentions.value }
    case 'CHIFFRES':
      return { chiffres: chiffres.value }
    case 'ETAPES':
      return { etapes: etapes.value }
    case 'SECURITE':
      return { cartes: cartes.value }
    case 'TEMOIGNAGES':
      return { temoignages: temoignages.value }
    case 'FAQ':
      return { questions: questions.value }
    case 'APPEL_ACTION':
      return { cta: appelAction.cta, lien: appelAction.lien, slogan: appelAction.slogan }
    default:
      return {}
  }
}

function ajouterMention() {
  if (!nouvelleMention.value.trim()) return
  mentions.value.push(nouvelleMention.value.trim())
  nouvelleMention.value = ''
}

async function enregistrerBloc() {
  if (!blocSelectionne.value) return
  enregistrement.value = true
  erreur.value = ''
  message.value = ''
  try {
    await modifierBlocAccueil(blocSelectionne.value, {
      titre: brouillonTitre.value,
      contenu: contenuConstruit(),
      image: nouveauFichier.value,
    })
    message.value = 'Bloc enregistré.'
    await charger()
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    enregistrement.value = false
  }
}

async function deplacer(index: number, direction: -1 | 1) {
  const trie = blocsTries.value
  const cible = index + direction
  if (cible < 0 || cible >= trie.length) return
  const source = trie[index]
  const destination = trie[cible]
  await Promise.all([
    modifierBlocAccueil(source.type, { ordre: destination.ordre }),
    modifierBlocAccueil(destination.type, { ordre: source.ordre }),
  ])
  await charger()
}

async function basculerActif(bloc: BlocAccueilAdmin) {
  erreur.value = ''
  try {
    await modifierBlocAccueil(bloc.type, { actif: !bloc.actif })
    await charger()
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  }
}

async function publierPage() {
  publication.value = true
  erreur.value = ''
  message.value = ''
  try {
    await ordonnerBlocsAccueil({
      blocs: blocsTries.value.map((b) => ({ type: b.type, actif: b.actif, ordre: b.ordre })),
      publier: true,
    })
    message.value = 'Page publiée : les blocs actifs sont désormais visibles en page d\'accueil.'
    await charger()
  } catch (cause) {
    erreur.value = extraireMessageErreur(cause)
  } finally {
    publication.value = false
  }
}

onMounted(charger)
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-8">
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-display font-weight-bold d-flex align-center mb-2">
          <div class="icon-box bg-primary-lighten-5 text-primary rounded-lg pa-2 mr-4">
            <Globe :size="28" />
          </div>
          Page d'accueil
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Personnalisez les huit blocs de la vitrine publique puis publiez vos changements.
        </p>
      </div>
      <div class="mt-4 mt-md-0 d-flex align-center gap-3">
        <v-chip :color="nbPublies === 8 ? 'success' : 'warning'" variant="flat" class="font-weight-bold">
          {{ nbPublies }}/8 blocs publiés
        </v-chip>
        <v-btn color="primary" variant="flat" size="large" class="font-weight-bold hover-lift" :loading="publication" @click="publierPage">
          <Send :size="18" class="mr-2" /> Publier la page
        </v-btn>
      </div>
    </div>

    <v-alert v-if="erreur" type="error" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ erreur }}
    </v-alert>
    <v-alert v-if="message" type="success" variant="tonal" class="mb-6 rounded-lg border-l-4">
      {{ message }}
    </v-alert>

    <v-row v-if="!chargement" class="align-stretch">
      <v-col cols="12" md="4" lg="3">
        <v-card class="rounded-xl elevation-2 overflow-hidden border h-100">
          <v-card-title class="font-weight-bold text-body-1 bg-surface-variant">
            Ordre des blocs
          </v-card-title>
          <v-list density="comfortable">
            <v-list-item
              v-for="(bloc, index) in blocsTries"
              :key="bloc.type"
              :active="bloc.type === blocSelectionne"
              class="mb-1"
              @click="selectionner(bloc.type)"
            >
              <template #prepend>
                <span class="text-caption font-weight-bold text-primary mr-2">{{ index + 1 }}</span>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ LIBELLES_TYPE[bloc.type] }}
              </v-list-item-title>
              <template #append>
                <v-icon
                  :color="bloc.actif ? 'success' : 'grey'"
                  size="small"
                  class="mr-1"
                  @click.stop="basculerActif(bloc)"
                >
                  {{ bloc.actif ? 'mdi-eye' : 'mdi-eye-off' }}
                </v-icon>
                <v-btn icon size="x-small" variant="text" :disabled="index === 0" @click.stop="deplacer(index, -1)">
                  <ArrowUp :size="16" />
                </v-btn>
                <v-btn icon size="x-small" variant="text" :disabled="index === blocsTries.length - 1" @click.stop="deplacer(index, 1)">
                  <ArrowDown :size="16" />
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8" lg="9">
        <v-card v-if="blocSelectionne && blocCourant" class="rounded-xl elevation-2 overflow-hidden border">
          <v-card-title class="font-weight-bold bg-surface-variant d-flex align-center justify-space-between">
            <span class="d-flex align-center">
              <PencilLine :size="18" class="mr-2 text-primary" />
              {{ LIBELLES_TYPE[blocSelectionne] }}
            </span>
            <v-chip v-if="blocCourant.publie" color="success" size="small" variant="flat">
              Publié
            </v-chip>
            <v-chip v-else color="warning" size="small" variant="flat">Brouillon</v-chip>
          </v-card-title>

          <v-card-text>
            <div class="d-flex align-center gap-3 mb-4">
              <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">
                Titre de section
              </label>
              <v-text-field v-model="brouillonTitre" density="comfortable" variant="outlined" hide-details placeholder="Titre affiché au-dessus du bloc" />
            </div>

            <!-- HERO -->
            <template v-if="blocSelectionne === 'HERO'">
              <div class="d-flex align-center gap-3 mb-3">
                <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">Bouton principal</label>
                <v-text-field v-model="hero.cta_principal" density="comfortable" variant="outlined" hide-details />
              </div>
              <div class="d-flex align-center gap-3 mb-3">
                <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">Lien principal</label>
                <v-text-field v-model="hero.lien_principal" density="comfortable" variant="outlined" hide-details placeholder="/inscription" />
              </div>
              <div class="d-flex align-center gap-3 mb-3">
                <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">Bouton secondaire</label>
                <v-text-field v-model="hero.cta_secondaire" density="comfortable" variant="outlined" hide-details />
              </div>
              <div class="d-flex align-center gap-3 mb-3">
                <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">Lien secondaire</label>
                <v-text-field v-model="hero.lien_secondaire" density="comfortable" variant="outlined" hide-details placeholder="/login" />
              </div>
            </template>

            <!-- REASSURANCE -->
            <template v-if="blocSelectionne === 'REASSURANCE'">
              <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-2">
                Mentions affichées
              </p>
              <v-chip
                v-for="(mention, i) in mentions"
                :key="`${mention}-${i}`"
                closable
                class="mr-2 mb-2"
                @click:close="mentions.splice(i, 1)"
              >
                {{ mention }}
              </v-chip>
              <div class="d-flex gap-2">
                <v-text-field v-model="nouvelleMention" density="comfortable" variant="outlined" hide-details placeholder="Nouvelle mention (ex : Régulé par le CREPMF)" @keyup.enter="ajouterMention" />
                <v-btn color="primary" variant="flat" @click="ajouterMention">
                  <Plus :size="18" /> Ajouter
                </v-btn>
              </div>
            </template>

            <!-- CHIFFRES -->
            <template v-if="blocSelectionne === 'CHIFFRES'">
              <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-2">Chiffres clés</p>
              <v-card v-for="(chiffre, i) in chiffres" :key="i" variant="tonal" class="mb-3 pa-4 position-relative">
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
              <v-btn color="primary" variant="outlined" @click="chiffres.push({ valeur: '', libelle: '' })">
                <Plus :size="18" class="mr-2" /> Ajouter un chiffre
              </v-btn>
            </template>

            <!-- ETAPES -->
            <template v-if="blocSelectionne === 'ETAPES'">
              <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-2">Étapes du parcours</p>
              <v-card v-for="(etape, i) in etapes" :key="i" variant="tonal" class="mb-3 pa-4 position-relative">
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
              <v-btn color="primary" variant="outlined" @click="etapes.push({ titre: '', description: '' })">
                <Plus :size="18" class="mr-2" /> Ajouter une étape
              </v-btn>
            </template>

            <!-- SÉCURITÉ -->
            <template v-if="blocSelectionne === 'SECURITE'">
              <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-2">Cartes sécurité</p>
              <v-card v-for="(carte, i) in cartes" :key="i" variant="tonal" class="mb-3 pa-4 position-relative">
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
              <v-btn color="primary" variant="outlined" @click="cartes.push({ titre: '', description: '' })">
                <Plus :size="18" class="mr-2" /> Ajouter une carte
              </v-btn>
            </template>

            <!-- TÉMOIGNAGES -->
            <template v-if="blocSelectionne === 'TEMOIGNAGES'">
              <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-2">Témoignages</p>
              <v-card v-for="(temoignage, i) in temoignages" :key="i" variant="tonal" class="mb-3 pa-4 position-relative">
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
              <v-btn color="primary" variant="outlined" @click="temoignages.push({ nom: '', role: '', texte: '' })">
                <Plus :size="18" class="mr-2" /> Ajouter un témoignage
              </v-btn>
            </template>

            <!-- FAQ -->
            <template v-if="blocSelectionne === 'FAQ'">
              <p class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase mb-2">Questions fréquentes</p>
              <v-card v-for="(question, i) in questions" :key="i" variant="tonal" class="mb-3 pa-4 position-relative">
                <v-col cols="12" class="pa-0 mb-3">
                  <v-text-field v-model="question.question" label="Question" density="comfortable" variant="outlined" />
                </v-col>
                <v-col cols="12" class="pa-0 mb-3">
                  <v-text-field v-model="question.reponse" label="Réponse" density="comfortable" variant="outlined" multiline :rows="2" />
                </v-col>
                <v-btn icon size="small" variant="text" color="error" class="position-absolute" style="top: 4px; right: 4px" @click="questions.splice(i, 1)">
                  <Trash2 :size="16" />
                </v-btn>
              </v-card>
              <v-btn color="primary" variant="outlined" @click="questions.push({ question: '', reponse: '' })">
                <Plus :size="18" class="mr-2" /> Ajouter une question
              </v-btn>
            </template>

            <!-- APPEL À L'ACTION -->
            <template v-if="blocSelectionne === 'APPEL_ACTION'">
              <div class="d-flex align-center gap-3 mb-3">
                <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">Slogan</label>
                <v-text-field v-model="appelAction.slogan" density="comfortable" variant="outlined" hide-details />
              </div>
              <div class="d-flex align-center gap-3 mb-3">
                <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">Libellé du bouton</label>
                <v-text-field v-model="appelAction.cta" density="comfortable" variant="outlined" hide-details />
              </div>
              <div class="d-flex align-center gap-3 mb-3">
                <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">Lien du bouton</label>
                <v-text-field v-model="appelAction.lien" density="comfortable" variant="outlined" hide-details placeholder="/inscription" />
              </div>
            </template>

            <div class="d-flex align-center gap-3 mt-6">
              <label class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase" style="min-width: 120px">
                Image d'illustration
              </label>
              <v-file-input
                accept="image/*"
                density="comfortable"
                variant="outlined"
                hide-details
                :model-value="nouveauFichier"
                prepend-icon=""
                label="Choisir une image (conservé si vide)"
                class="flex-grow-1"
                @update:model-value="(fichiers) => (nouveauFichier = (fichiers as File[])[0] ?? null)"
              />
              <v-avatar v-if="imageActuelle" size="48" rounded>
                <v-img :src="imageActuelle" />
              </v-avatar>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn color="primary" variant="flat" class="font-weight-bold" :loading="enregistrement" @click="enregistrerBloc">
              <Check :size="18" class="mr-2" /> Enregistrer le bloc
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card v-else class="rounded-xl elevation-2 border d-flex align-center justify-center pa-12 text-center h-100">
          <div>
            <ImagePlus :size="40" class="mx-auto mb-3 text-primary" />
            <p class="text-medium-emphasis">Sélectionnez un bloc dans la liste pour l'éditer.</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-progress-circular v-if="chargement" indeterminate color="primary" class="d-block mx-auto my-12" />
  </v-container>
</template>