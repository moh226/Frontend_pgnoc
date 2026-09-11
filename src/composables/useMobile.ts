import { computed } from 'vue'
import { useDisplay } from 'vuetify'

/**
 * Vue mobile-first de l'application.
 *
 * Un seul point de décision « mobile » pour les vues investisseur : les
 * composants répondent à `estMobile` et le desktop (>= md) conserve son
 * rendu actuel. `mobile` (breakpoint xs) reste exposé pour les cas où
 * l'on veut distinguer les très petits écrans.
 */
export function useMobile() {
  const display = useDisplay()

  const estMobile = computed(() => display.smAndDown.value)

  return {
    estMobile,
    isMobile: estMobile,
    mobile: display.mobile,
    smAndDown: display.smAndDown,
    smAndUp: display.smAndUp,
    largeur: display.width,
  }
}