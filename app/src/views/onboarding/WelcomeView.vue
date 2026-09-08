<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setAppLocale } from '../../i18n'
import { completeOnboarding } from '../../data/onboarding'
import PrimaryButton from '../../components/common/PrimaryButton.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const reviewing = computed(() => route.name === 'usage-guide')
const steps = ['choose', 'draw', 'read'] as const
function start() {
  completeOnboarding()
  void router.replace('/tarot')
}
</script>

<template>
  <main class="welcome">
    <div class="welcome__content">
      <RouterLink v-if="reviewing" to="/settings" class="welcome__back">← {{ t('common.back') }}</RouterLink>
      <header class="welcome__header">
        <div class="welcome__emblem" aria-hidden="true">✦</div>
        <p class="welcome__eyebrow">TAROT &amp; ZODIAC</p>
        <h1>{{ t(reviewing ? 'onboarding.guideTitle' : 'onboarding.title') }}</h1>
        <p class="welcome__intro">{{ t('onboarding.intro') }}</p>
      </header>

      <fieldset class="welcome__languages">
        <legend>{{ t('settings.language') }}</legend>
        <label v-for="language in (['vi', 'en'] as const)" :key="language" :class="{ selected: locale === language }">
          <input type="radio" name="welcome-language" :checked="locale === language" @change="setAppLocale(language)" />
          <span :lang="language">{{ language === 'vi' ? 'Tiếng Việt' : 'English' }}</span>
        </label>
      </fieldset>

      <section aria-labelledby="guide-steps">
        <h2 id="guide-steps">{{ t('onboarding.stepsTitle') }}</h2>
        <ol class="welcome__steps">
          <li v-for="(step, index) in steps" :key="step">
            <span class="welcome__number" aria-hidden="true">{{ index + 1 }}</span>
            <div><h3>{{ t(`onboarding.${step}Title`) }}</h3><p>{{ t(`onboarding.${step}Body`) }}</p></div>
          </li>
        </ol>
      </section>

      <aside class="welcome__tip"><span aria-hidden="true">✧</span><p>{{ t('onboarding.tip') }}</p></aside>
      <p class="welcome__note">{{ t('onboarding.note') }}</p>
      <PrimaryButton @click="start">{{ t('onboarding.start') }} <span aria-hidden="true">→</span></PrimaryButton>
    </div>
  </main>
</template>

<style scoped>
.welcome { height: 100%; min-height: 0; overflow-y: auto; background: radial-gradient(ellipse at top, #392052, var(--color-bg) 65%); padding: calc(env(safe-area-inset-top, 0px) + 24px) 20px calc(env(safe-area-inset-bottom, 0px) + 28px); }
.welcome__content { max-width: 480px; margin: 0 auto; }
.welcome__back { display: inline-flex; align-items: center; min-height: 48px; color: var(--color-text); margin-bottom: 12px; }
.welcome__header { text-align: center; }
.welcome__emblem { display: grid; place-items: center; width: 64px; height: 64px; margin: 0 auto 16px; border: 1px solid var(--color-gold); border-radius: 50%; color: var(--color-gold); font-size: 36px; background: rgba(230,199,107,.06); }
.welcome__eyebrow { color: var(--color-gold); letter-spacing: .18em; font-size: 11px; margin-bottom: 12px; }
h1 { color: var(--color-gold); font-size: clamp(26px, 7vw, 34px); line-height: 1.25; }
.welcome__intro { margin-top: 12px; line-height: 1.65; color: var(--color-text-muted); }
.welcome__languages { display: flex; gap: 12px; border: 0; padding: 0; margin: 24px 0; }
legend { text-align: center; margin-bottom: 10px; font-size: 14px; }
.welcome__languages label { flex: 1; display: flex; gap: 8px; align-items: center; justify-content: center; min-height: 48px; border: 1px solid var(--color-border); border-radius: 16px; cursor: pointer; }
.welcome__languages .selected { border-color: var(--color-gold); background: rgba(230,199,107,.09); }
input { accent-color: var(--color-primary); width: 18px; height: 18px; }
h2 { font-size: 20px; margin-bottom: 16px; }
.welcome__steps { list-style: none; padding: 0; margin: 0; display: grid; gap: 20px; }
li { display: flex; align-items: flex-start; gap: 14px; }
.welcome__number { display: grid; place-items: center; flex: 0 0 32px; height: 32px; color: var(--color-gold); border: 1px solid var(--color-border); border-radius: 50%; }
h3 { font-family: var(--font-sans); font-size: 16px; line-height: 1.5; }
li p { margin-top: 4px; color: var(--color-text-muted); font-size: 14px; line-height: 1.65; }
.welcome__tip { display: flex; gap: 12px; margin: 24px 0 16px; padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; color: var(--color-gold); font-size: 14px; line-height: 1.6; }
.welcome__note { text-align: center; color: var(--color-text-muted); font-size: 12px; line-height: 1.6; margin-bottom: 12px; }
.welcome :deep(button) { min-height: 52px; }
.welcome :deep(:focus-visible) { outline: 2px solid var(--color-gold); outline-offset: 4px; }
</style>
