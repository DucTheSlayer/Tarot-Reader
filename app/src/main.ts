import { createApp } from 'vue'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/animations.css'
import './styles/screen.css'
import './styles/reveal.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { loadCardStore } from './stores/cardStore'
import { loadZodiacStore } from './stores/zodiacStore'
import {
  initializeAdvertising,
  warmInterstitialAd
} from './services/advertising'

async function bootstrap() {
  const advertisingReady = initializeAdvertising()
  void advertisingReady.then(() => {
    warmInterstitialAd()
  })

  try {
    await Promise.all([loadCardStore(), loadZodiacStore()])
  } catch (error) {
    console.error('Failed to initialize the local content database.', error)
  }

  createApp(App).use(i18n).use(router).mount('#app')
  await router.isReady()
}

void bootstrap()
