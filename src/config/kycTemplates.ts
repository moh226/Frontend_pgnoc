import type { TypeChampKyc } from '@/types'

export interface TemplateChamp {
  code: string
  nom: string
  type: TypeChampKyc
  obligatoire: boolean
  justification?: string
  options?: string[]
  formats_acceptes?: string
  taille_max_mo?: number
}

export interface TemplateEtape {
  id: string
  nom: string
  description: string
  icon: string
  champs: TemplateChamp[]
}

export const TEMPLATES_KYC: TemplateEtape[] = [
  {
    id: 'profil_patrimonial',
    nom: 'Profil patrimonial',
    description: 'Informations sur le profil financier et les objectifs d\'investissement de l\'investisseur.',
    icon: 'TrendingUp',
    champs: [
      {
        code: 'origine_fonds',
        nom: 'Origine des fonds',
        type: 'TEXTE_LONG',
        obligatoire: true,
        justification: 'Décrivez l\'origine des fonds que vous comptez investir (héritage, épargne, revenus professionnels, etc.).',
      },
      {
        code: 'revenus_annuels',
        nom: 'Revenus nets annuels',
        type: 'CHOIX_UNIQUE',
        obligatoire: true,
        justification: 'Sélectionnez la tranche correspondant à vos revenus nets annuels.',
        options: ['Moins de 1M FCFA', '1M à 5M FCFA', '5M à 20M FCFA', 'Plus de 20M FCFA'],
      },
      {
        code: 'horizon_placement',
        nom: 'Horizon de placement',
        type: 'CHOIX_UNIQUE',
        obligatoire: true,
        justification: 'Durée pendant laquelle vous comptez laisser vos fonds investis.',
        options: ['Court terme (moins de 3 ans)', 'Moyen terme (3 à 10 ans)', 'Long terme (plus de 10 ans)'],
      },
      {
        code: 'strategie_investissement',
        nom: 'Stratégie d\'investissement',
        type: 'CHOIX_UNIQUE',
        obligatoire: true,
        justification: 'Votre appétence au risque détermine la stratégie recommandée.',
        options: ['Prudent', 'Équilibré', 'Risqué'],
      },
      {
        code: 'objectifs_placement',
        nom: 'Objectifs de placement',
        type: 'CHOIX_UNIQUE',
        obligatoire: true,
        justification: 'L\'objectif principal de votre investissement.',
        options: ['Rendement', 'Spéculation', 'Mixte'],
      },
      {
        code: 'connaissances_boursieres',
        nom: 'Connaissances boursières',
        type: 'CHOIX_UNIQUE',
        obligatoire: true,
        justification: 'Évaluez votre niveau de connaissance des marchés financiers.',
        options: ['Notions', 'Moyen', 'Expert'],
      },
    ],
  },
  {
    id: 'type_gestion',
    nom: 'Type de gestion',
    description: 'Choisissez le mode de gestion de votre compte-titre.',
    icon: 'Settings',
    champs: [
      {
        code: 'type_gestion',
        nom: 'Type de gestion',
        type: 'CHOIX_UNIQUE',
        obligatoire: true,
        justification: 'La gestion sous mandat confie la gestion de votre portefeuille à la SGI. La gestion libre vous donne accès direct aux marchés.',
        options: ['Compte géré (sous mandat)', 'Compte non-géré (gestion libre)'],
      },
    ],
  },
  {
    id: 'mode_epargne',
    nom: 'Mode d\'épargne',
    description: 'Définissez votre mode d\'alimentation du compte.',
    icon: 'PiggyBank',
    champs: [
      {
        code: 'mode_epargne',
        nom: 'Mode d\'épargne',
        type: 'CHOIX_UNIQUE',
        obligatoire: true,
        justification: 'Choisissez comment vous souhaitez alimenter votre compte.',
        options: ['Versement unique', 'Versement périodique'],
      },
      {
        code: 'frequence_epargne',
        nom: 'Fréquence des versements',
        type: 'CHOIX_UNIQUE',
        obligatoire: false,
        justification: 'Si vous avez choisi le versement périodique, sélectionnez la fréquence.',
        options: ['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'],
      },
      {
        code: 'montant_versement_periodique',
        nom: 'Montant par versement (FCFA)',
        type: 'NOMBRE',
        obligatoire: false,
        justification: 'Montant que vous comptez verser à chaque période.',
      },
    ],
  },
]
