import { createVuetify } from 'vuetify'

export default createVuetify({
  defaults: {
    VBtn: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      rounded: 'lg',
    },
    VCardTitle: {
      class: 'font-display',
      style: 'line-height: 1.3; letter-spacing: -0.01em;',
    },
    VCardText: {
      style: 'line-height: 1.65;',
    },
    VDataTable: {
      VTh: {
        class: 'font-weight-bold',
        style: 'font-size: 0.8125rem; letter-spacing: 0.04em;',
      },
      VTd: {
        style: 'font-size: 0.9375rem; line-height: 1.55;',
      },
    },
    VListItemTitle: {
      style: 'line-height: 1.4;',
    },
    VListItemSubtitle: {
      style: 'font-size: 0.875rem; line-height: 1.5;',
    },
    VAlert: {
      style: 'line-height: 1.6;',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          /* Marque UEMOA : bleu, or, vert, rouge */
          primary: '#0C3C94',
          'on-primary': '#FFFFFF',
          secondary: '#F7C600',
          'on-secondary': '#0F172A',
          accent: '#009639',
          'on-accent': '#FFFFFF',
          /* Neutres */
          background: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-variant': '#F1F5F9',
          'on-surface': '#0F172A',
          'on-surface-variant': '#475569',
          outline: '#E2E8F0',
          'outline-variant': '#CBD5E1',
          /* Sémantique */
          error: '#E4002B',
          'on-error': '#FFFFFF',
          warning: '#D97706',
          'on-warning': '#FFFFFF',
          success: '#009639',
          'on-success': '#FFFFFF',
          info: '#3B82F6',
          'on-info': '#FFFFFF',
        },
      },
      dark: {
        dark: true,
        colors: {
          /* Marque éclaircie pour rester lisible sur fond sombre */
          primary: '#5C8DFF',
          'on-primary': '#0A1E4F',
          secondary: '#F7C600',
          'on-secondary': '#0F172A',
          accent: '#34C77B',
          'on-accent': '#06130C',
          /* Neutres */
          background: '#0F172A',
          surface: '#1E293B',
          'surface-variant': '#334155',
          'on-surface': '#F8FAFC',
          'on-surface-variant': '#94A3B8',
          outline: '#334155',
          'outline-variant': '#475569',
          /* Sémantique éclaircie */
          error: '#FF6B6B',
          'on-error': '#2A0508',
          warning: '#FFB224',
          'on-warning': '#241300',
          success: '#34C77B',
          'on-success': '#06130C',
          info: '#7CB8FF',
          'on-info': '#0A1E4F',
        },
      },
    },
  },
})
