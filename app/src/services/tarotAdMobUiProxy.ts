import { registerPlugin } from '@capacitor/core'
import type { NativeAdData } from '@alf/app-sdk'

interface AdUnitOptions {
  adUnitId: string
}

interface ReadyResult {
  ready: boolean
}

interface BannerOptions extends AdUnitOptions {
  position: 'TOP_CENTER' | 'BOTTOM_CENTER'
  size: 'ADAPTIVE' | 'BANNER'
}

interface BannerSizeResult {
  width: number
  height: number
}

interface TarotAdMobUiProxyPlugin {
  createBanner(options: BannerOptions): Promise<BannerSizeResult>
  getBannerHeight(): Promise<{ height: number }>
  showBanner(options: AdUnitOptions): Promise<void>
  hideBanner(options: AdUnitOptions): Promise<void>
  destroyBanner(options: AdUnitOptions): Promise<void>
  loadInterstitial(options: AdUnitOptions): Promise<void>
  isInterstitialReady(options: AdUnitOptions): Promise<ReadyResult>
  showInterstitial(options: AdUnitOptions): Promise<void>
  loadRewardedAd(options: AdUnitOptions): Promise<void>
  isRewardedAdReady(options: AdUnitOptions): Promise<ReadyResult>
  showRewardedAd(options: AdUnitOptions): Promise<void>
  loadOpenAppAd(options: AdUnitOptions): Promise<void>
  isOpenAppAdReady(options: AdUnitOptions): Promise<ReadyResult>
  showOpenAppAd(options: AdUnitOptions): Promise<void>
  loadNativeAd(options: AdUnitOptions): Promise<NativeAdData>
  destroyNativeAd(options: AdUnitOptions): Promise<void>
  reportNativeAdClick(options: AdUnitOptions): Promise<void>
}

export const TarotAdMobUiProxy = registerPlugin<TarotAdMobUiProxyPlugin>(
  'TarotAdMobUiProxy'
)
