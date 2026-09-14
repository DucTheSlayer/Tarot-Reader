<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HomeModeTabs from '../../components/common/HomeModeTabs.vue'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import AdIcon from '../../components/ads/AdIcon.vue'
import { LOCALE_OPTIONS, type AppLocale } from '../../i18n/locales'
import { config } from '../../../config'
const { t, locale } = useI18n()
const showAdQa = config.settings?.dev === true
const localeLabel = computed(() =>
  LOCALE_OPTIONS.find((option) => option.value === locale.value as AppLocale)?.label ?? 'English'
)
</script>

<template>
  <main class="settings-screen">
    <MysticalBackground />
    <h1>{{ t('nav.settings') }}</h1>
    <nav class="settings-list" :aria-label="t('nav.settings')">
      <RouterLink to="/settings/language" class="settings-row">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h12M9 3v2M5 5c1 5 4 8 8 10M13 5c-1 5-4 8-9 11M14 21l4-10 4 10M15.5 17h5" /></svg>
        <span class="settings-row__label">{{ t('settings.language') }}</span>
        <span class="settings-row__value" :lang="locale">{{ localeLabel }}</span>
        <span class="settings-row__arrow" aria-hidden="true">›</span>
      </RouterLink>
      <RouterLink to="/settings/guide" class="settings-row">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v15M5 8h4M5 12h4M15 8h4M15 12h4" /></svg>
        <span class="settings-row__label">{{ t('onboarding.guideTitle') }}</span>
        <span class="settings-row__arrow" aria-hidden="true">›</span>
      </RouterLink>
      <RouterLink v-if="showAdQa" to="/settings/ad-test" class="settings-row">
        <AdIcon />
        <span class="settings-row__label">{{ t('adsQa.settingsLabel') }}</span>
        <span class="settings-row__value">DEV</span>
        <span class="settings-row__arrow" aria-hidden="true">›</span>
      </RouterLink>
    </nav>
    <HomeModeTabs />
  </main>
</template>

<style scoped>
.settings-screen { height: 100%; min-height: 0; width: 100%; display: flex; flex-direction: column; gap: 28px; padding: calc(env(safe-area-inset-top, 0px) + 32px) 16px calc(env(safe-area-inset-bottom, 0px) + 16px); overflow: hidden; isolation: isolate; background: var(--color-bg); }
h1 { flex-shrink: 0; text-align: center; font-size: 30px; color: var(--color-gold); line-height: 1.3; }
.settings-list { flex: 1; min-height: 0; overflow-y: auto; width: 100%; max-width: 520px; align-self: center; display: flex; flex-direction: column; gap: 12px; padding: 4px; }
.settings-row { flex-shrink: 0; display: flex; align-items: center; gap: 14px; min-height: 72px; padding: 18px 16px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); color: var(--color-text); }
.settings-row svg { width: 26px; height: 26px; flex-shrink: 0; fill: none; stroke: var(--color-primary); stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.settings-row__label { flex: 1; min-width: 0; font-size: 16px; line-height: 1.5; overflow-wrap: anywhere; }
.settings-row__value { font-size: 12px; color: var(--color-text-muted); }
.settings-row__arrow { font-size: 28px; line-height: 1; color: var(--color-text-muted); }
.settings-row:active { background: var(--color-primary-soft); }
.settings-row:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }
@media (max-width: 350px) { .settings-row { gap: 10px; padding-inline: 12px; } }
</style>
