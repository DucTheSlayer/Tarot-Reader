<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import HomeModeTabs from '../../components/common/HomeModeTabs.vue'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import { config } from '../../../config'
const { t, locale } = useI18n()
const showAdQa = config.settings?.dev === true
</script>

<template>
  <main class="settings-screen">
    <MysticalBackground />
    <h1>{{ t('nav.settings') }}</h1>
    <nav class="settings-list" :aria-label="t('nav.settings')">
      <RouterLink to="/settings/language" class="settings-row">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h12M9 3v2M5 5c1 5 4 8 8 10M13 5c-1 5-4 8-9 11M14 21l4-10 4 10M15.5 17h5" /></svg>
        <span class="settings-row__label">{{ t('settings.language') }}</span>
        <span class="settings-row__value" :lang="locale">{{ locale === 'vi' ? 'Tiếng Việt' : 'English' }}</span>
        <span class="settings-row__arrow" aria-hidden="true">›</span>
      </RouterLink>
      <RouterLink to="/settings/guide" class="settings-row">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v15M5 8h4M5 12h4M15 8h4M15 12h4" /></svg>
        <span class="settings-row__label">{{ t('onboarding.guideTitle') }}</span>
        <span class="settings-row__arrow" aria-hidden="true">›</span>
      </RouterLink>
      <RouterLink v-if="showAdQa" to="/settings/ad-test" class="settings-row">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M7 15V9h2.5a2 2 0 0 1 0 4H7M15 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2V9Z" />
        </svg>
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
