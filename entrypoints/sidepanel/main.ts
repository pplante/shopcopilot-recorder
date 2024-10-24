import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import { createApp } from 'vue'
import App from './App.vue'
import '@/styles/styles'

createApp(App)
  .use(ConfirmationService)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })
  .mount('#app')
