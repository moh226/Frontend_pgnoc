import { describe, it, expect } from 'vitest'
import { extraireErreurApi, extraireMessageErreur } from './client'

describe('client.ts - extraireMessageErreur', () => {
  it('doit extraire une string simple', () => {
    const err = { response: { data: 'Erreur simple' } }
    expect(extraireMessageErreur(err)).toBe('Erreur simple')
  })

  it('doit extraire un array plat (format hérité)', () => {
    const err = { response: { data: { email: ['Email invalide'] } } }
    expect(extraireMessageErreur(err)).toBe('Email invalide')
  })

  it('doit extraire un objet imbriqué (format hérité)', () => {
    const err = { response: { data: { user: { email: ['Email invalide'] } } } }
    expect(extraireMessageErreur(err)).toBe('Email invalide')
  })

  it('doit retourner le fallback si rien ne match', () => {
    const err = {}
    expect(extraireMessageErreur(err, 'Fallback')).toBe('Fallback')
  })

  // ── Enveloppe unifiée backend { code, message, … } ──

  it('doit afficher `message` de l’enveloppe unifiée, jamais `code`', () => {
    const err = {
      response: {
        status: 403,
        data: {
          code: 'CHAMP_VERROUILLE',
          message: 'Le champ « Nom » a été jugé conforme lors de la relecture.',
          detail: 'Le champ « Nom » a été jugé conforme lors de la relecture.',
        },
      },
    }
    expect(extraireMessageErreur(err)).toBe(
      'Le champ « Nom » a été jugé conforme lors de la relecture.',
    )
  })

  it('ne doit PAS préfixer le code HTTP (bruit technique pour l’utilisateur)', () => {
    const err = {
      response: {
        status: 400,
        data: {
          code: 'DOSSIER_INCOMPLET',
          message: 'Le dossier ne peut pas être soumis : 2 champs restent à renseigner.',
        },
      },
    }
    expect(extraireMessageErreur(err)).not.toContain('[400]')
  })
})

describe('client.ts - extraireErreurApi', () => {
  it('doit parser l’enveloppe unifiée complète', () => {
    const err = {
      response: {
        status: 400,
        data: {
          code: 'DOSSIER_INCOMPLET',
          message: 'Le dossier ne peut pas être soumis : 1 champ obligatoire reste à renseigner.',
          detail: '…',
          champs_manquants: [{ etape: 'Identité', champ: 'Copie CNIB', code: 'cnib' }],
          progression_pct: 66,
        },
      },
    }
    const apiErreur = extraireErreurApi(err)
    expect(apiErreur).not.toBeNull()
    expect(apiErreur!.code).toBe('DOSSIER_INCOMPLET')
    expect(apiErreur!.statut).toBe(400)
    expect(apiErreur!.champsManquants).toEqual([
      { etape: 'Identité', champ: 'Copie CNIB', code: 'cnib' },
    ])
  })

  it('doit parser le contexte de rejet (champs à corriger + commentaires)', () => {
    const err = {
      response: {
        status: 403,
        data: {
          code: 'CHAMP_VERROUILLE',
          message: 'Le champ « Nom » a été jugé conforme…',
          champ: 'Nom',
          champs_a_corriger: [
            { champ: 'Nom', code: 'nom', commentaire_agent: 'Illisible sur la CNIB.' },
          ],
        },
      },
    }
    const apiErreur = extraireErreurApi(err)
    expect(apiErreur!.champsACorriger).toEqual([
      { champ: 'Nom', code: 'nom', commentaire_agent: 'Illisible sur la CNIB.' },
    ])
  })

  it('doit exposer le délai de throttle quand présent', () => {
    const err = {
      response: {
        status: 429,
        data: {
          code: 'LIMITE_ATTEINTE',
          message: 'Trop de requêtes : réessayez dans 30 secondes.',
          attente_secondes: 30,
        },
      },
    }
    expect(extraireErreurApi(err)!.attenteSecondes).toBe(30)
  })

  it('doit parser les erreurs par champ de formulaire', () => {
    const err = {
      response: {
        status: 400,
        data: {
          code: 'VALIDATION_INVALIDE',
          message: '2 champs à corriger.',
          champs: { email: ['Un compte existe déjà.'], password: ['Trop court.'] },
        },
      },
    }
    expect(extraireErreurApi(err)!.champs).toEqual({
      email: ['Un compte existe déjà.'],
      password: ['Trop court.'],
    })
  })

  it('doit retourner null hors enveloppe (erreur réseau, payload hérité…)', () => {
    expect(extraireErreurApi(null)).toBeNull()
    expect(extraireErreurApi({})).toBeNull()
    expect(
      extraireErreurApi({ response: { status: 400, data: { email: ['invalide'] } } }),
    ).toBeNull()
  })
})
