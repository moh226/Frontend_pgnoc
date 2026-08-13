import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#4edea3',
          'on-primary': '#0a1f16',
          secondary: '#d9a441',
          background: '#0c1324',
          surface: '#191f31',
          'surface-variant': '#222b45',
          'on-surface': '#dce1fb',
          'on-surface-variant': '#959fb3',
          error: '#ff6b6b',
          warning: '#e8a33d',
          success: '#4edea3',
          outline: '#8b93b8',
          'outline-variant': '#3a4161',
        },
      },
    },
  },
})
