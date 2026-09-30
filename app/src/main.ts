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
  warmInterstitialAd,
  warmRewardedAd
} from './services/advertising'

async function bootstrap() {
  createApp(App).use(i18n).use(router).mount('#app')
  await router.isReady()

  const startBackgroundServices = async () => {
    try {
      await Promise.all([loadCardStore(), loadZodiacStore()])
    } catch (error) {
      console.error('Failed to initialize the local content database.', error)
    }

    const advertisingReady = initializeAdvertising()
    void advertisingReady.then(() => {
      warmInterstitialAd()
      warmRewardedAd()
    })
  }

  // Give the WebView one frame to paint Home or the loading state before
  // opening SQLite and initializing advertising SDKs.
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => void startBackgroundServices())
  } else {
    void startBackgroundServices()
  }
}

void bootstrap()
