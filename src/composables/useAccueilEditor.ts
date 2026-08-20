import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { listeBlocsAccueilAdmin, modifierBlocAccueil, ordonnerBlocsAccueil } from '@/api/accueil'
import { extraireMessageErreur } from '@/api/client'
import type {
  BlocAccueilAdmin,
  BlocAccueilPublic,
  ContenuBlocAccueil,
  TypeBlocAccueil,
} from '@/types'

export const LIBELLES_TYPE: Record<TypeBlocAccueil, string> = {
  HERO: "Bannière d'accueil",
  REASSURANCE: 'Mentions de réassurance',
  CHIFFRES: 'Chiffres clés',
  ETAPES: 'Comment ça marche',
  SECURITE: 'Sécurité et conformité',
  TEMOIGNAGES: 'Témoignages',
  FAQ: 'Questions fréquentes',
  APPEL_ACTION: "Appel à l'action",
}

export interface LigneChiffre {
  valeur: string
  libelle: string
}

export interface LigneTitreDesc {
  titre: string
  description: string
}

export interface LigneTemoignage {
  nom: string
  role: string
  texte: string
}

export interface LigneQuestion {
  question: string
  reponse: string
}

export function useAccueilEditor() {
  const blocs = ref<BlocAccueilAdmin[]>([])
  const chargement = ref(true)
  const erreur = ref('')
  const message = ref('')
  const enregistrement = ref(false)
  const publication = ref(false)

  const blocSelectionne = ref<TypeBlocAccueil | null>(null)
  const brouillonTitre = ref('')
  const nouveauFichier = ref<File | null>(null)

  function surFichierChoisi(valeur: File | File[]) {
    nouveauFichier.value = Array.isArray(valeur) ? (valeur[0] ?? null) : valeur
  }

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

  const urlObjetHero = ref<string | null>(null)

  watch(nouveauFichier, (fichier) => {
    if (urlObjetHero.value) URL.revokeObjectURL(urlObjetHero.value)
    urlObjetHero.value = fichier ? URL.createObjectURL(fichier) : null
  })

  onBeforeUnmount(() => {
    if (urlObjetHero.value) URL.revokeObjectURL(urlObjetHero.value)
  })

  function apercuBlocs(): BlocAccueilPublic[] {
    const modifie = blocSelectionne.value
    const imageUrlHero = modifie === 'HERO' ? (urlObjetHero.value ?? undefined) : undefined
    let imageHero: string | null = null
    let titreHero = ''
    let contenuHero: ContenuBlocAccueil = {}
    if (modifie) {
      imageHero = imageUrlHero ?? blocs.value.find((b) => b.type === 'HERO')?.image_url ?? null
      titreHero = brouillonTitre.value
      contenuHero = contenuConstruit()
    }
    return blocsTries.value.map((bloc) => {
      if (bloc.type === modifie) {
        return {
          type: bloc.type,
          titre: titreHero,
          contenu: contenuHero,
          image_url:
            bloc.type === 'HERO' ? imageHero : (bloc.image_url ?? null),
        }
      }
      return { type: bloc.type, titre: bloc.titre, contenu: bloc.contenu, image_url: bloc.image_url }
    })
  }

  const apercuMasques = computed<Partial<Record<TypeBlocAccueil, boolean>>>(() =>
    Object.fromEntries(
      blocs.value.filter((b) => !b.actif).map((b) => [b.type, true]),
    ),
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

  return {
    blocs,
    chargement,
    erreur,
    message,
    enregistrement,
    publication,
    blocSelectionne,
    brouillonTitre,
    nouveauFichier,
    nouvelleMention,
    hero,
    mentions,
    chiffres,
    etapes,
    cartes,
    temoignages,
    questions,
    appelAction,
    blocsTries,
    blocCourant,
    nbPublies,
    imageActuelle,
    apercuMasques,
    apercuBlocs,
    charger,
    selectionner,
    ajouterMention,
    enregistrerBloc,
    deplacer,
    basculerActif,
    publierPage,
    surFichierChoisi,
  }
}
