<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setAppLocale } from '../../i18n'
import { hasAppMessages } from '../../i18n'
import { isPublishedLocale, LOCALE_OPTIONS, type AppLocale } from '../../i18n/locales'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
const { t, locale } = useI18n()
const changed = ref(false)
const languages = LOCALE_OPTIONS.filter((language) =>
  isPublishedLocale(language.value) && hasAppMessages(language.value)
)
function selectLanguage(value: AppLocale) {
  // Keep the component composer and the shared composer in sync. Some Android
  // WebViews update the native radio state before dispatching `change`, which
  // can otherwise leave the checked control out of sync with the app locale.
  locale.value = value
  setAppLocale(value)
  changed.value = true
}
</script>

<template>
  <main class="screen">
    <MysticalBackground />
    <ScreenHeader :title="t('settings.language')" back-to="/settings" />
    <div class="language-content">
      <p id="language-help">{{ t('settings.languageDescription') }}</p>
      <fieldset aria-describedby="language-help">
        <legend>{{ t('settings.language') }}</legend>
        <label v-for="language in languages" :key="language.value" :class="{ selected: locale === language.value }">
          <input type="radio" name="language" :value="language.value" :checked="locale === language.value" @click="selectLanguage(language.value)" />
          <span class="language-name">
            <span :lang="language.value">{{ language.label }}</span>
            <span v-if="language.englishLabel" class="language-name__english" lang="en">{{ language.englishLabel }}</span>
          </span>
          <small v-if="locale === language.value">{{ t('settings.selected') }}</small>
        </label>
      </fieldset>
      <p class="language-status" role="status" aria-live="polite">{{ changed ? t('settings.saved') : '' }}</p>
    </div>
  </main>
</template>

<style scoped>
.language-content { width: 100%; max-width: 520px; align-self: center; min-height: 0; overflow-y: auto; padding: 4px; }
.language-content p { color: var(--color-text-muted); line-height: 1.6; font-size: 14px; }
fieldset { border: 0; padding: 0; margin: 20px 0 0; min-width: 0; }
legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
label { display: flex; align-items: center; gap: 12px; min-height: 72px; padding: 18px 16px; margin-bottom: 12px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); cursor: pointer; }
label.selected { border-color: var(--color-gold); background: var(--color-primary-soft); }
input { width: 20px; height: 20px; flex-shrink: 0; accent-color: var(--color-primary); }
.language-name { display: flex; min-width: 0; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; }
.language-name__english { color: var(--color-text-muted); font-size: 12px; font-weight: 400; }
small { margin-inline-start: auto; color: var(--color-gold); font-size: 12px; }
label:focus-within { outline: 2px solid var(--color-gold); outline-offset: 2px; }
.language-status { min-height: 24px; }
</style>
