import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export const vuetify = createVuetify({
  components, // ✅ Registers all Vuetify components like v-app, v-btn
  directives, // ✅ Registers Vuetify directives like v-ripple
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})
