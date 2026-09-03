import { computed, ref, type Ref } from 'vue'
import { creerEtape, creerChamp } from '@/api/kycAdmin'
import { extraireMessageErreur } from '@/api/client'
import { TEMPLATES_KYC, type TemplateEtape } from '@/config/kycTemplates'
import type { EtapeKycAdmin } from '@/types'

export function useKycTemplates(
  etapes: Ref<EtapeKycAdmin[]>,
  onCharge: () => Promise<void>,
) {
  const activationEnCours = ref<string | null>(null)
  const erreur = ref('')

  const templates = computed(() => TEMPLATES_KYC)

  const templatesActifs = computed(() => {
    const nomsExistants = new Set(etapes.value.map((e) => e.nom.toLowerCase()))
    return TEMPLATES_KYC.filter((t) => nomsExistants.has(t.nom.toLowerCase()))
  })

  function estDejaActif(templateId: string): boolean {
    const template = TEMPLATES_KYC.find((t) => t.id === templateId)
    if (!template) return false
    return etapes.value.some((e) => e.nom.toLowerCase() === template.nom.toLowerCase())
  }

  async function activerTemplate(template: TemplateEtape) {
    activationEnCours.value = template.id
    erreur.value = ''

    try {
      const prochainOrdre = etapes.value.length
        ? Math.max(...etapes.value.map((e) => e.ordre)) + 1
        : 1

      const etape = await creerEtape({
        nom: template.nom,
        ordre: prochainOrdre,
      })

      let ordreChamp = 1
      for (const champTemplate of template.champs) {
        await creerChamp({
          etape: etape.id,
          code: champTemplate.code,
          nom: champTemplate.nom,
          type: champTemplate.type,
          obligatoire: champTemplate.obligatoire,
          ordre: ordreChamp++,
          justification: champTemplate.justification,
          options_choix: champTemplate.options ?? null,
          formats_acceptes: champTemplate.formats_acceptes,
          taille_max_mo: champTemplate.taille_max_mo ?? null,
        })
      }

      await onCharge()
    } catch (cause) {
      erreur.value = extraireMessageErreur(cause)
    } finally {
      activationEnCours.value = null
    }
  }

  return {
    templates,
    templatesActifs,
    activationEnCours,
    erreur,
    estDejaActif,
    activerTemplate,
  }
}
