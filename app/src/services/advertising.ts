import { readonly, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ALF, ALFAdMob, ALFAppLovinMAX, type NativeAdData } from '@alf/app-sdk'
import { config } from '../../config'
import { isInterstitialCooldownComplete } from './adPolicy'
import { TarotAdMobUiProxy } from './tarotAdMobUiProxy'

const ADMOB_ANDROID_TEST_IDS = {
  banner: 'ca-app-pub-3940256099942544/9214589741',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  appOpen: 'ca-app-pub-3940256099942544/9257395921',
  native: 'ca-app-pub-3940256099942544/2247696110'
} as const

const READY_TIMEOUT_MS = 10_000
const READY_POLL_MS = 250
const REWARDED_ON_DEMAND_TIMEOUT_MS = 2_000

export interface AdProviderStatus {
  appLovin: boolean
  adMob: boolean
}

export type RewardedQaResult = 'rewarded' | 'skipped'

export const adsQaEnabled = config.settings?.dev === true
export const adPlatform = Capacitor.getPlatform()

const providerStatusState = ref<AdProviderStatus>({ appLovin: false, adMob: false })
const bannerVisibleState = ref(false)
const bannerHeightState = ref(50)

export const adProviderStatus = readonly(providerStatusState)
export const bannerVisible = readonly(bannerVisibleState)
export const bannerHeight = readonly(bannerHeightState)

let initializationPromise: Promise<AdProviderStatus> | null = null
let bannerCreated = false
let bannerWanted = false
let interstitialWarm = false
let interstitialLoadPromise: Promise<void> | null = null
let rewardedWarm = false
let rewardedLoadPromise: Promise<void> | null = null
let lastFullscreenAdAt = 0
let removeRewardListeners: (() => void) | null = null

function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android'
}

function isWeb(): boolean {
  return Capacitor.getPlatform() === 'web'
}

function requireQaMode(): void {
  if (!adsQaEnabled) throw new Error('Advertising QA is disabled outside development builds.')
}

function requireAndroidQa(): void {
  requireQaMode()
  if (!isAndroid()) throw new Error('Native test ads require an Android build.')
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForReady(check: () => Promise<boolean>, timeoutMs = READY_TIMEOUT_MS): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      if (await check()) return true
    } catch {
      // A transient provider error is treated as not-ready until timeout.
    }
    await delay(READY_POLL_MS)
  }
  return false
}

export function initializeAdvertising(): Promise<AdProviderStatus> {
  if (initializationPromise) return initializationPromise

  initializationPromise = (async () => {
    if (isWeb()) return providerStatusState.value

    try {
      const sdk = ALF.Instance
      await sdk.initControllers()
      sdk.Config.set(config)

      const [appLovin, adMob] = await Promise.allSettled([
        sdk.Ads.init(),
        sdk.Ads.initAdMob()
      ])

      providerStatusState.value = {
        appLovin: appLovin.status === 'fulfilled',
        adMob: adMob.status === 'fulfilled'
      }
    } catch (error) {
      console.warn('Advertising initialization failed.', error)
    }

    return providerStatusState.value
  })()

  return initializationPromise
}

export async function showBannerAd(): Promise<boolean> {
  bannerWanted = true
  if (isWeb()) return false

  const status = await initializeAdvertising()
  try {
    if (adsQaEnabled) {
      if (!status.adMob) return false
      if (!bannerCreated) {
        const size = await TarotAdMobUiProxy.createBanner({
          adUnitId: ADMOB_ANDROID_TEST_IDS.banner,
          position: 'BOTTOM_CENTER',
          size: 'ADAPTIVE'
        })
        bannerHeightState.value = size.height || 50
        bannerCreated = true
      }
      if (!bannerWanted) {
        await TarotAdMobUiProxy.hideBanner({ adUnitId: ADMOB_ANDROID_TEST_IDS.banner })
        return false
      }
      await TarotAdMobUiProxy.showBanner({ adUnitId: ADMOB_ANDROID_TEST_IDS.banner })
    } else {
      if (!status.adMob && !status.appLovin) return false
      if (!bannerCreated) {
        await ALF.Instance.Ads.LoadBannerAd({ position: 'BOTTOM_CENTER', size: 'ADAPTIVE' })
        bannerHeightState.value = await ALF.Instance.Ads.GetAdHeight('banner')
        bannerCreated = true
      }
      if (!bannerWanted) {
        await ALF.Instance.Ads.HideBannerAd()
        return false
      }
      await ALF.Instance.Ads.ShowBannerAd()
    }

    bannerVisibleState.value = true
    return true
  } catch (error) {
    console.warn('Banner ad failed to show.', error)
    bannerVisibleState.value = false
    return false
  }
}

export async function hideBannerAd(): Promise<void> {
  bannerWanted = false
  bannerVisibleState.value = false
  if (isWeb() || !bannerCreated) return

  try {
    if (adsQaEnabled) {
      await TarotAdMobUiProxy.hideBanner({ adUnitId: ADMOB_ANDROID_TEST_IDS.banner })
    } else {
      await ALF.Instance.Ads.HideBannerAd()
    }
  } catch {
    // Hiding is best-effort; route changes must never be blocked by an ad.
  }
}

export async function destroyBannerAd(): Promise<void> {
  bannerWanted = false
  bannerVisibleState.value = false
  if (isWeb() || !bannerCreated) return

  try {
    if (adsQaEnabled) {
      await TarotAdMobUiProxy.destroyBanner({ adUnitId: ADMOB_ANDROID_TEST_IDS.banner })
    } else {
      await ALF.Instance.Ads.DestroyBannerAd()
    }
  } catch {
    // Cleanup is best-effort.
  } finally {
    bannerCreated = false
  }
}

async function loadInterstitial(): Promise<void> {
  if (isWeb()) return
  const status = await initializeAdvertising()

  if (adsQaEnabled) {
    if (!status.adMob) return
    await TarotAdMobUiProxy.loadInterstitial({ adUnitId: ADMOB_ANDROID_TEST_IDS.interstitial })
  } else {
    if (!status.appLovin) return
    await ALF.Instance.Ads.LoadInterstitial()
  }
  interstitialWarm = true
}

export function warmInterstitialAd(): void {
  if (interstitialWarm || interstitialLoadPromise || isWeb()) return

  interstitialLoadPromise = loadInterstitial()
    .catch((error) => console.warn('Interstitial preload failed.', error))
    .finally(() => {
      interstitialLoadPromise = null
    })
}

async function isInterstitialReady(): Promise<boolean> {
  if (adsQaEnabled) {
    const result = await TarotAdMobUiProxy.isInterstitialReady({
      adUnitId: ADMOB_ANDROID_TEST_IDS.interstitial
    })
    return result.ready
  }

  const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android'
  const adUnitId = ALF.Instance.Config.get(
    `keys.applovin.${platform}.interstitial`
  ) as string | undefined
  if (!adUnitId) return false
  const result = await ALFAppLovinMAX.isInterstitialReady({ adUnitId })
  return result.ready
}

async function showPreparedInterstitial(): Promise<boolean> {
  if (!interstitialWarm || !(await isInterstitialReady())) return false

  if (adsQaEnabled) {
    await TarotAdMobUiProxy.showInterstitial({ adUnitId: ADMOB_ANDROID_TEST_IDS.interstitial })
  } else {
    await ALF.Instance.Ads.ShowInterstitial()
  }

  interstitialWarm = false
  lastFullscreenAdAt = Date.now()
  setTimeout(warmInterstitialAd, 1_000)
  return true
}

export async function showInterstitialAtNaturalBreak(): Promise<boolean> {
  if (isWeb() || !isInterstitialCooldownComplete(lastFullscreenAdAt)) return false
  await initializeAdvertising()

  if (!interstitialWarm) {
    warmInterstitialAd()
    return false
  }

  try {
    return await showPreparedInterstitial()
  } catch (error) {
    console.warn('Interstitial ad failed to show.', error)
    interstitialWarm = false
    warmInterstitialAd()
    return false
  }
}

async function loadRewardedAd(): Promise<void> {
  if (isWeb()) return
  const status = await initializeAdvertising()

  if (adsQaEnabled) {
    if (!status.adMob) return
    await TarotAdMobUiProxy.loadRewardedAd({ adUnitId: ADMOB_ANDROID_TEST_IDS.rewarded })
  } else {
    if (!status.appLovin) return
    await ALF.Instance.Ads.LoadRewardedVideo()
  }
  rewardedWarm = true
}

export function warmRewardedAd(): void {
  if (rewardedWarm || rewardedLoadPromise || isWeb()) return

  rewardedLoadPromise = loadRewardedAd()
    .catch((error) => console.warn('Rewarded preload failed.', error))
    .finally(() => {
      rewardedLoadPromise = null
    })
}

async function isRewardedReady(): Promise<boolean> {
  if (adsQaEnabled) {
    const result = await TarotAdMobUiProxy.isRewardedAdReady({
      adUnitId: ADMOB_ANDROID_TEST_IDS.rewarded
    })
    return result.ready
  }

  const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android'
  const adUnitId = ALF.Instance.Config.get(
    `keys.applovin.${platform}.rewarded`
  ) as string | undefined
  if (!adUnitId) return false
  const result = await ALFAppLovinMAX.isRewardedAdReady({ adUnitId })
  return result.ready
}

function warmNextRewardedAd(): void {
  rewardedWarm = false
  setTimeout(warmRewardedAd, 3_000)
}

export async function preloadAppOpenAd(): Promise<void> {
  if (isWeb()) return
  const status = await initializeAdvertising()
  if (!status.adMob) return

  try {
    if (adsQaEnabled) {
      await TarotAdMobUiProxy.loadOpenAppAd({ adUnitId: ADMOB_ANDROID_TEST_IDS.appOpen })
    } else {
      await ALF.Instance.Ads.LoadAdMobAppOpenAd()
    }
  } catch (error) {
    console.warn('App Open ad preload failed.', error)
  }
}

async function isAppOpenReady(): Promise<boolean> {
  if (adsQaEnabled) {
    const result = await TarotAdMobUiProxy.isOpenAppAdReady({ adUnitId: ADMOB_ANDROID_TEST_IDS.appOpen })
    return result.ready
  }
  return ALF.Instance.Ads.IsAdMobAppOpenAdReady()
}

export async function showAppOpenAdAtStartup(): Promise<boolean> {
  if (isWeb()) return false
  const status = await initializeAdvertising()
  if (!status.adMob) return false

  try {
    if (!(await waitForReady(isAppOpenReady, 5_000))) return false
    if (adsQaEnabled) {
      await TarotAdMobUiProxy.showOpenAppAd({ adUnitId: ADMOB_ANDROID_TEST_IDS.appOpen })
    } else {
      await ALF.Instance.Ads.ShowAdMobAppOpenAd()
    }
    lastFullscreenAdAt = Date.now()
    return true
  } catch (error) {
    console.warn('App Open ad failed to show.', error)
    return false
  }
}

export async function showQaBanner(): Promise<boolean> {
  requireAndroidQa()
  return showBannerAd()
}

export async function showQaInterstitial(): Promise<boolean> {
  requireAndroidQa()
  const status = await initializeAdvertising()
  if (!status.adMob) return false

  await TarotAdMobUiProxy.loadInterstitial({ adUnitId: ADMOB_ANDROID_TEST_IDS.interstitial })
  const ready = await waitForReady(async () => {
    const result = await TarotAdMobUiProxy.isInterstitialReady({
      adUnitId: ADMOB_ANDROID_TEST_IDS.interstitial
    })
    return result.ready
  })
  if (!ready) return false
  await TarotAdMobUiProxy.showInterstitial({ adUnitId: ADMOB_ANDROID_TEST_IDS.interstitial })
  return true
}

export async function showRewardedAd(
  onResult: (result: RewardedQaResult) => void
): Promise<boolean> {
  if (isWeb()) return false
  const status = await initializeAdvertising()

  if (adsQaEnabled ? !status.adMob : !status.appLovin) return false

  if (!rewardedWarm) warmRewardedAd()

  const ready = await waitForReady(isRewardedReady, REWARDED_ON_DEMAND_TIMEOUT_MS)
  if (!ready) {
    rewardedWarm = false
    warmRewardedAd()
    return false
  }

  if (adsQaEnabled) {
    removeRewardListeners?.()
    let completed = false
    const complete = (result: RewardedQaResult) => {
      if (completed) return
      completed = true
      onResult(result)
      removeRewardListeners?.()
      warmNextRewardedAd()
    }
    const rewardListener = await ALFAdMob.addListener(
      'OnRewardedAdReceivedRewardEvent',
      () => complete('rewarded')
    )
    const skipListener = await ALFAdMob.addListener(
      'OnRewardedAdSkippedEvent',
      () => complete('skipped')
    )
    removeRewardListeners = () => {
      rewardListener.remove()
      skipListener.remove()
      removeRewardListeners = null
    }

    rewardedWarm = false
    await TarotAdMobUiProxy.showRewardedAd({ adUnitId: ADMOB_ANDROID_TEST_IDS.rewarded })
    lastFullscreenAdAt = Date.now()
    return true
  }

  if (!status.appLovin) return false
  const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android'
  const adUnitId = ALF.Instance.Config.get(
    `keys.applovin.${platform}.rewarded`
  ) as string | undefined
  if (!adUnitId) return false

  rewardedWarm = false
  await ALF.Instance.Ads.ShowRewardedVideo((result) => {
    onResult(result)
    warmRewardedAd()
  })
  lastFullscreenAdAt = Date.now()
  return true
}

export async function showQaRewarded(
  onResult: (result: RewardedQaResult) => void
): Promise<boolean> {
  requireAndroidQa()
  return showRewardedAd(onResult)
}

export async function showQaAppOpen(): Promise<boolean> {
  requireAndroidQa()
  await preloadAppOpenAd()
  return showAppOpenAdAtStartup()
}

const WEB_NATIVE_PREVIEW: NativeAdData = {
  adUnitId: 'web-preview',
  headline: 'Test Ad · Discover Your Daily Card',
  body: 'This preview checks the native ad layout. Android loads Google test inventory.',
  callToAction: 'Explore',
  iconUrl: '',
  imageUrl: '',
  mediaUrl: '',
  price: '',
  store: '',
  starRating: 0,
  advertiser: 'Tarot QA'
}

export async function loadQaNativeAd(): Promise<NativeAdData | null> {
  requireQaMode()
  if (isWeb()) return WEB_NATIVE_PREVIEW
  requireAndroidQa()

  const status = await initializeAdvertising()
  if (!status.adMob) return null
  try {
    return await TarotAdMobUiProxy.loadNativeAd({ adUnitId: ADMOB_ANDROID_TEST_IDS.native })
  } catch (error) {
    console.warn('Native test ad failed to load.', error)
    return null
  }
}

export async function reportQaNativeClick(): Promise<void> {
  if (!adsQaEnabled || !isAndroid()) return
  try {
    await TarotAdMobUiProxy.reportNativeAdClick({ adUnitId: ADMOB_ANDROID_TEST_IDS.native })
  } catch (error) {
    console.warn('Native test ad click could not be reported.', error)
  }
}

export async function cleanupQaAds(): Promise<void> {
  removeRewardListeners?.()
  if (!adsQaEnabled || !isAndroid()) return
  try {
    await TarotAdMobUiProxy.destroyNativeAd({ adUnitId: ADMOB_ANDROID_TEST_IDS.native })
  } catch {
    // Cleanup is best-effort.
  }
}
