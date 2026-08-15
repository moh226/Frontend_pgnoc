import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#0C3C94', /* Bleu UEMOA */
          'on-primary': '#FFFFFF',
          secondary: '#F7C600', /* Or / Jaune */
          'on-secondary': '#000000',
          accent: '#009639', /* Vert UEMOA */
          'on-accent': '#FFFFFF',
          background: '#F8FAFC', /* Gris très clair pour le fond global */
          surface: '#FFFFFF', /* Blanc pur pour les cartes */
          'surface-variant': '#F1F5F9', /* Gris clair pour les encarts */
          'on-surface': '#0F172A', /* Slate 900 pour un texte bien lisible */
          'on-surface-variant': '#475569', /* Texte secondaire */
          error: '#E4002B', /* Rouge UEMOA */
          warning: '#F59E0B',
          success: '#009639', /* Vert UEMOA */
          info: '#3B82F6',
          outline: '#E2E8F0', /* Bordures légères */
          'outline-variant': '#CBD5E1',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#0C3C94', /* Bleu UEMOA */
          'on-primary': '#FFFFFF',
          secondary: '#F7C600', /* Or / Jaune */
          'on-secondary': '#000000',
          accent: '#009639', /* Vert UEMOA */
          'on-accent': '#FFFFFF',
          background: '#0F172A', /* Slate 900 pour le fond global */
          surface: '#1E293B', /* Slate 800 pour les cartes */
          'surface-variant': '#334155', /* Slate 700 pour les encarts */
          'on-surface': '#F8FAFC', /* Texte clair */
          'on-surface-variant': '#94A3B8', /* Texte secondaire clair */
          error: '#E4002B', /* Rouge UEMOA */
          warning: '#F59E0B',
          success: '#009639', /* Vert UEMOA */
          info: '#3B82F6',
          outline: '#334155', /* Bordures foncées */
          'outline-variant': '#475569',
        },
      }
    },
  },
})
