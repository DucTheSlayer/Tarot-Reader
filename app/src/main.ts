import { createApp } from 'vue'
import { ALF } from '@alf/app-sdk'
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
import { config } from '../config'

async function initializeAdvertising(): Promise<void> {
  try {
    const sdk = ALF.Instance
    await sdk.initControllers()
    sdk.Config.set(config)

    const [appLovin, adMob] = await Promise.allSettled([
      sdk.Ads.init(),
      sdk.Ads.initAdMob(),
    ])

    if (appLovin.status === 'rejected') {
      console.warn('AppLovin initialization failed.', appLovin.reason)
    }
    if (adMob.status === 'rejected') {
      console.warn('AdMob initialization failed.', adMob.reason)
    }
  } catch (error) {
    console.warn('ALF advertising initialization failed.', error)
  }
}

async function bootstrap() {
  void initializeAdvertising()

  try {
    await Promise.all([loadCardStore(), loadZodiacStore()])
  } catch (error) {
    console.error('Failed to initialize the local content database.', error)
  }

  createApp(App).use(i18n).use(router).mount('#app')
}

void bootstrap()
