<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useCardStore } from './stores/cardStore'
import { useZodiacStore } from './stores/zodiacStore'
import AdBannerHost from './components/ads/AdBannerHost.vue'

const { t } = useI18n()
const cardStore = useCardStore()
const zodiacStore = useZodiacStore()
const route = useRoute()

const isHome = computed(() => route.name === 'tarot-home' || route.name === 'zodiac-home')
const requiresCards = computed(() => isHome.value || route.meta.requiresCards === true)
const requiresZodiac = computed(() => isHome.value || route.meta.requiresZodiac === true)
const isReady = computed(() =>
  (!requiresCards.value || cardStore.status.value === 'ready') &&
  (!requiresZodiac.value || zodiacStore.status.value === 'ready')
)
const hasError = computed(() =>
  (requiresCards.value && cardStore.status.value === 'error') ||
  (requiresZodiac.value && zodiacStore.status.value === 'error')
)
const errorMessage = computed(
  () => requiresCards.value
    ? cardStore.errorMessage.value
    : zodiacStore.errorMessage.value
)

const loadingProgress = ref(8)
let progressTimer: ReturnType<typeof setInterval> | undefined

function stopProgressTimer() {
  if (progressTimer === undefined) return
  clearInterval(progressTimer)
  progressTimer = undefined
}

watch([isReady, hasError], ([ready, error]) => {
  stopProgressTimer()
  if (ready || error) return

  loadingProgress.value = 8
  progressTimer = setInterval(() => {
    if (loadingProgress.value < 56) loadingProgress.value += 4
    else if (loadingProgress.value < 80) loadingProgress.value += 2
    else if (loadingProgress.value < 92) loadingProgress.value += 1
    else stopProgressTimer()
  }, 160)
}, { immediate: true })

onBeforeUnmount(stopProgressTimer)

function retryDatabase() {
  void Promise.all([cardStore.load(), zodiacStore.load()]).catch((error: unknown) => {
    console.error('Failed to retry the local content database.', error)
  })
}
</script>

<template>
  <div v-if="isReady" class="app-shell">
    <div class="app-shell__content">
      <RouterView />
    </div>
    <AdBannerHost />
  </div>

  <main v-else class="database-state">
    <div class="database-state__stars" aria-hidden="true" />
    <div class="database-state__zodiac" aria-hidden="true" />
    <div class="database-state__panel" role="status" aria-live="polite">
      <template v-if="hasError">
        <div class="database-state__identity">
          <img class="database-state__icon" src="/assets/branding/app-icon.png" alt="" />
          <h1>{{ t('database.errorTitle') }}</h1>
          <p class="database-state__error">{{ errorMessage }}</p>
          <button type="button" @click="retryDatabase">{{ t('database.retry') }}</button>
        </div>
      </template>
      <template v-else>
        <div class="database-state__identity">
          <img class="database-state__icon" src="/assets/branding/app-icon.png" alt="" />
          <h1>Tarot Zodiac Pocket</h1>
        </div>
        <div class="database-state__loader">
          <p class="database-state__loading-label">
            {{ t('database.loadingTitle') }} ({{ loadingProgress }}%)…
          </p>
          <span
            class="database-state__progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="loadingProgress"
          >
            <i :style="{ width: `${loadingProgress}%` }" />
          </span>
          <p class="database-state__description">{{ t('database.loadingDescription') }}</p>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
}

.app-shell__content {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.database-state {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  padding: max(var(--space-5), env(safe-area-inset-top)) var(--space-5)
    max(var(--space-6), env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at 50% 43%, rgba(151, 102, 205, 0.22), transparent 28%),
    radial-gradient(circle at 16% 84%, rgba(88, 57, 140, 0.2), transparent 34%),
    linear-gradient(180deg, #302044 0%, #231432 55%, #1b1029 100%);
  color: var(--color-text);
  text-align: center;
  isolation: isolate;
}

.database-state__stars {
  position: absolute;
  z-index: -1;
  inset: 0;
  opacity: 0.46;
  background-image:
    radial-gradient(circle at 16% 22%, #fff 0 1px, transparent 1.6px),
    radial-gradient(circle at 78% 16%, #e8c874 0 1px, transparent 1.7px),
    radial-gradient(circle at 67% 71%, #fff 0 1px, transparent 1.5px),
    radial-gradient(circle at 28% 82%, #c79aff 0 1px, transparent 1.6px);
  background-size: 150px 170px, 190px 210px, 130px 160px, 220px 190px;
}

.database-state__zodiac {
  position: absolute;
  z-index: -1;
  top: 35%;
  left: 50%;
  width: min(88vw, 430px);
  aspect-ratio: 1;
  border: 1px solid rgba(225, 199, 255, 0.08);
  border-radius: 50%;
  box-shadow:
    0 0 0 34px rgba(225, 199, 255, 0.025),
    0 0 0 68px rgba(225, 199, 255, 0.018);
  transform: translate(-50%, -50%);
}

.database-state__zodiac::before,
.database-state__zodiac::after {
  position: absolute;
  content: '';
  inset: 16%;
  border: 1px dashed rgba(225, 199, 255, 0.08);
  border-radius: 50%;
}

.database-state__zodiac::after {
  inset: 35%;
  border-style: solid;
}

.database-state__panel {
  display: flex;
  width: min(100%, 430px);
  min-height: calc(100dvh - var(--space-6) * 2);
  margin: 0 auto;
  flex-direction: column;
  justify-content: space-between;
}

.database-state__identity {
  margin: auto 0;
  transform: translateY(6vh);
}

.database-state__icon {
  display: block;
  width: clamp(108px, 31vw, 144px);
  aspect-ratio: 1;
  margin: 0 auto var(--space-5);
  border-radius: 24%;
  box-shadow: 0 14px 38px rgba(5, 1, 14, 0.4), 0 0 28px rgba(144, 89, 229, 0.22);
}

.database-state h1 {
  margin: 0;
  color: #fffaf2;
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 7vw, 2.35rem);
  font-weight: 650;
  line-height: 1.2;
  text-shadow: 0 3px 18px rgba(12, 4, 23, 0.7);
}

.database-state p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.database-state__loader {
  padding-bottom: clamp(var(--space-2), 5vh, var(--space-7));
}

.database-state__loading-label {
  color: #fff !important;
  font-size: 0.98rem;
}

.database-state__progress {
  display: block;
  width: min(86%, 310px);
  height: 8px;
  margin: var(--space-3) auto var(--space-4);
  overflow: hidden;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.54);
  box-shadow: inset 0 1px 2px rgba(10, 3, 20, 0.26);
}

.database-state__progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7244df, #9a61ef);
  box-shadow: 0 0 10px rgba(154, 97, 239, 0.55);
  transition: width 180ms ease-out;
}

.database-state__description {
  color: rgba(255, 255, 255, 0.78) !important;
  font-size: 0.84rem;
}

.database-state__error {
  margin-top: var(--space-3) !important;
}

.database-state button {
  margin-top: var(--space-4);
  padding: 0.72rem 1.25rem;
  border: 1px solid rgba(230, 199, 107, 0.55);
  border-radius: 999px;
  background: rgba(230, 199, 107, 0.14);
  color: var(--color-gold);
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .database-state__progress i {
    transition: none;
  }
}
</style>
