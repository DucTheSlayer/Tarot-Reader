<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NativeAdData } from '@alf/app-sdk'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import {
  adPlatform,
  adProviderStatus,
  adsQaEnabled,
  cleanupQaAds,
  hideBannerAd,
  initializeAdvertising,
  loadQaNativeAd,
  reportQaNativeClick,
  showQaAppOpen,
  showQaBanner,
  showQaInterstitial,
  showQaRewarded
} from '../../services/advertising'

type QaAction = 'banner' | 'interstitial' | 'rewarded' | 'appOpen' | 'native'
type QaState = 'idle' | 'loading' | 'shown' | 'hidden' | 'failed' | 'rewarded' | 'skipped' | 'preview'

const { t } = useI18n()
const states = reactive<Record<QaAction, QaState>>({
  banner: 'idle',
  interstitial: 'idle',
  rewarded: 'idle',
  appOpen: 'idle',
  native: 'idle'
})
const nativeAd = ref<NativeAdData | null>(null)
const webBannerPreview = ref(false)
const isAndroid = computed(() => adPlatform === 'android')

function stateLabel(state: QaState): string {
  return t(`adsQa.status.${state}`)
}

async function run(action: QaAction, operation: () => Promise<boolean>): Promise<void> {
  states[action] = 'loading'
  try {
    states[action] = (await operation()) ? 'shown' : 'failed'
  } catch (error) {
    console.warn(`Advertising QA action failed: ${action}`, error)
    states[action] = 'failed'
  }
}

async function testBanner(): Promise<void> {
  if (!isAndroid.value) {
    webBannerPreview.value = true
    states.banner = 'preview'
    return
  }
  await run('banner', showQaBanner)
}

async function hideBanner(): Promise<void> {
  webBannerPreview.value = false
  await hideBannerAd()
  states.banner = 'hidden'
}

async function testRewarded(): Promise<void> {
  await run('rewarded', () =>
    showQaRewarded((result) => {
      states.rewarded = result
    })
  )
}

async function testNative(): Promise<void> {
  states.native = 'loading'
  try {
    nativeAd.value = await loadQaNativeAd()
    states.native = nativeAd.value ? (isAndroid.value ? 'shown' : 'preview') : 'failed'
  } catch (error) {
    console.warn('Native advertising QA action failed.', error)
    states.native = 'failed'
  }
}

onMounted(async () => {
  await initializeAdvertising()
})

onUnmounted(() => {
  void hideBannerAd()
  void cleanupQaAds()
})
</script>

<template>
  <main class="ad-test-screen">
    <MysticalBackground />
    <ScreenHeader :title="t('adsQa.title')" back-to="/settings" />

    <div class="ad-test-content">
      <section class="qa-summary">
        <p>{{ t('adsQa.description') }}</p>
        <dl>
          <div>
            <dt>{{ t('adsQa.platform') }}</dt>
            <dd>{{ adPlatform }}</dd>
          </div>
          <div>
            <dt>AdMob</dt>
            <dd :class="adProviderStatus.adMob ? 'is-ready' : 'is-unavailable'">
              {{ t(adProviderStatus.adMob ? 'adsQa.ready' : 'adsQa.unavailable') }}
            </dd>
          </div>
          <div>
            <dt>AppLovin</dt>
            <dd :class="adProviderStatus.appLovin ? 'is-ready' : 'is-unavailable'">
              {{ t(adProviderStatus.appLovin ? 'adsQa.ready' : 'adsQa.unavailable') }}
            </dd>
          </div>
        </dl>
      </section>

      <p v-if="!adsQaEnabled" class="qa-warning">{{ t('adsQa.devOnly') }}</p>
      <p v-else-if="!isAndroid" class="qa-note">{{ t('adsQa.androidNote') }}</p>
      <p v-else class="qa-note">{{ t('adsQa.testNotice') }}</p>

      <section class="qa-grid" :aria-label="t('adsQa.controls')">
        <article class="qa-card">
          <div>
            <h2>{{ t('adsQa.banner') }}</h2>
            <p>{{ t('adsQa.bannerDescription') }}</p>
          </div>
          <span class="qa-status">{{ stateLabel(states.banner) }}</span>
          <div class="qa-actions">
            <button type="button" :disabled="states.banner === 'loading'" @click="testBanner">
              {{ t('adsQa.show') }}
            </button>
            <button type="button" class="secondary" @click="hideBanner">
              {{ t('adsQa.hide') }}
            </button>
          </div>
        </article>

        <article class="qa-card">
          <div>
            <h2>{{ t('adsQa.interstitial') }}</h2>
            <p>{{ t('adsQa.interstitialDescription') }}</p>
          </div>
          <span class="qa-status">{{ stateLabel(states.interstitial) }}</span>
          <button
            type="button"
            :disabled="!isAndroid || states.interstitial === 'loading'"
            @click="run('interstitial', showQaInterstitial)"
          >
            {{ t('adsQa.loadAndShow') }}
          </button>
        </article>

        <article class="qa-card">
          <div>
            <h2>{{ t('adsQa.rewarded') }}</h2>
            <p>{{ t('adsQa.rewardedDescription') }}</p>
          </div>
          <span class="qa-status">{{ stateLabel(states.rewarded) }}</span>
          <button
            type="button"
            :disabled="!isAndroid || states.rewarded === 'loading'"
            @click="testRewarded"
          >
            {{ t('adsQa.loadAndShow') }}
          </button>
        </article>

        <article class="qa-card">
          <div>
            <h2>{{ t('adsQa.appOpen') }}</h2>
            <p>{{ t('adsQa.appOpenDescription') }}</p>
          </div>
          <span class="qa-status">{{ stateLabel(states.appOpen) }}</span>
          <button
            type="button"
            :disabled="!isAndroid || states.appOpen === 'loading'"
            @click="run('appOpen', showQaAppOpen)"
          >
            {{ t('adsQa.loadAndShow') }}
          </button>
        </article>

        <article class="qa-card qa-card--native">
          <div>
            <h2>{{ t('adsQa.native') }}</h2>
            <p>{{ t('adsQa.nativeDescription') }}</p>
          </div>
          <span class="qa-status">{{ stateLabel(states.native) }}</span>
          <button type="button" :disabled="states.native === 'loading'" @click="testNative">
            {{ t('adsQa.load') }}
          </button>

          <div v-if="nativeAd" class="native-preview">
            <div class="native-preview__icon" aria-hidden="true">
              <img v-if="nativeAd.iconUrl" :src="nativeAd.iconUrl" alt="" />
              <span v-else>✦</span>
            </div>
            <div class="native-preview__copy">
              <span>{{ t('adsQa.adLabel') }}</span>
              <strong>{{ nativeAd.headline }}</strong>
              <p>{{ nativeAd.body }}</p>
              <small v-if="nativeAd.advertiser">{{ nativeAd.advertiser }}</small>
            </div>
            <button type="button" class="native-preview__cta" @click="reportQaNativeClick">
              {{ nativeAd.callToAction || t('adsQa.open') }}
            </button>
          </div>
        </article>
      </section>

      <div v-if="webBannerPreview" class="web-banner-preview">
        <span>{{ t('adsQa.adLabel') }}</span>
        <strong>{{ t('adsQa.webBanner') }}</strong>
      </div>
    </div>
  </main>
</template>

<style scoped>
.ad-test-screen {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: var(--space-4);
  padding: var(--space-4);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  overflow: hidden;
  isolation: isolate;
  background: var(--color-bg);
}

.ad-test-content {
  flex: 1;
  min-height: 0;
  width: min(100%, 680px);
  align-self: center;
  overflow-y: auto;
  padding: 2px 2px var(--space-6);
}

.qa-summary,
.qa-card,
.qa-note,
.qa-warning {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
}

.qa-summary {
  padding: var(--space-4);
}

.qa-summary > p,
.qa-card p {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.55;
}

.qa-summary dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: var(--space-4) 0 0;
}

.qa-summary dl > div {
  min-width: 0;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
}

.qa-summary dt {
  color: var(--color-text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.qa-summary dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  color: var(--color-text);
  font-weight: 600;
}

.is-ready { color: var(--color-success) !important; }
.is-unavailable { color: var(--color-danger) !important; }

.qa-note,
.qa-warning {
  margin: var(--space-3) 0;
  padding: var(--space-3) var(--space-4);
  color: var(--color-gold);
  font-size: 13px;
  line-height: 1.5;
}

.qa-warning { color: var(--color-danger); }

.qa-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.qa-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
}

.qa-card--native { grid-column: 1 / -1; }

.qa-card h2 {
  margin-bottom: 4px;
  color: var(--color-gold);
  font-size: 18px;
}

.qa-status {
  align-self: flex-start;
  padding: 4px 9px;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.qa-actions {
  display: flex;
  gap: var(--space-2);
}

.qa-card > button,
.qa-actions button,
.native-preview__cta {
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.qa-actions button { flex: 1; }

.qa-actions .secondary {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

button:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.native-preview {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-gold) 32%, transparent);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
}

.native-preview__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-gold);
  font-size: 24px;
  overflow: hidden;
}

.native-preview__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.native-preview__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.native-preview__copy span,
.native-preview__copy small {
  color: var(--color-text-muted);
  font-size: 10px;
}

.native-preview__copy strong {
  overflow-wrap: anywhere;
  color: var(--color-text);
  font-size: 14px;
}

.native-preview__copy p {
  overflow-wrap: anywhere;
  font-size: 12px;
}

.native-preview__cta {
  min-height: 36px;
  padding: 7px 12px;
  font-size: 12px;
}

.web-banner-preview {
  position: sticky;
  bottom: 0;
  display: flex;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  border: 1px dashed var(--color-gold);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  color: var(--color-text);
}

.web-banner-preview span {
  color: var(--color-gold);
  font-size: 11px;
  text-transform: uppercase;
}

@media (max-width: 520px) {
  .qa-grid { grid-template-columns: 1fr; }
  .qa-card--native { grid-column: auto; }
  .native-preview { grid-template-columns: 44px minmax(0, 1fr); }
  .native-preview__cta { grid-column: 1 / -1; }
}
</style>
