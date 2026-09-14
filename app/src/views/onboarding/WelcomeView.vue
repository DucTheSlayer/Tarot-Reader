<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setAppLocale } from '../../i18n'
import { completeOnboarding } from '../../data/onboarding'
import PrimaryButton from '../../components/common/PrimaryButton.vue'
import BackButton from '../../components/common/BackButton.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const reviewing = computed(() => route.name === 'usage-guide')
const steps = ['choose', 'draw', 'read'] as const

function selectLanguage(value: 'vi' | 'en') {
  locale.value = value
  setAppLocale(value)
}

function finish() {
  if (reviewing.value) {
    void router.replace('/settings')
    return
  }

  completeOnboarding()
  void router.replace('/tarot')
}
</script>

<template>
  <main class="welcome">
    <div class="welcome__content">
      <BackButton v-if="reviewing" to="/settings" class="welcome__back" />

      <header class="welcome__header">
        <div class="welcome__emblem" aria-hidden="true">✦</div>
        <p class="welcome__brand">SEREIN TAROT</p>
        <p class="welcome__eyebrow">TAROT · ZODIAC</p>
        <h1>{{ t(reviewing ? 'onboarding.guideTitle' : 'onboarding.title') }}</h1>
        <p class="welcome__intro">{{ t('onboarding.intro') }}</p>
      </header>

      <fieldset v-if="!reviewing" class="welcome__languages">
        <legend>{{ t('settings.language') }}</legend>
        <label
          v-for="language in (['vi', 'en'] as const)"
          :key="language"
          :class="{ selected: locale === language }"
        >
          <input
            type="radio"
            name="welcome-language"
            :checked="locale === language"
            @click="selectLanguage(language)"
          />
          <span :lang="language">{{ language === 'vi' ? 'Tiếng Việt' : 'English' }}</span>
        </label>
      </fieldset>

      <section class="welcome__guide" aria-labelledby="guide-steps">
        <h2 id="guide-steps">{{ t('onboarding.stepsTitle') }}</h2>
        <ol class="welcome__steps">
          <li v-for="(step, index) in steps" :key="step">
            <span class="welcome__number" aria-hidden="true">{{ index + 1 }}</span>
            <div>
              <h3>{{ t(`onboarding.${step}Title`) }}</h3>
              <p>{{ t(`onboarding.${step}Body`) }}</p>
            </div>
          </li>
        </ol>
      </section>

      <aside class="welcome__tip">
        <span aria-hidden="true">✧</span>
        <p>{{ t('onboarding.tip') }}</p>
      </aside>
      <p class="welcome__note">{{ t('onboarding.note') }}</p>
      <PrimaryButton @click="finish">
        {{ reviewing ? t('common.back') : t('onboarding.start') }}
        <span aria-hidden="true">{{ reviewing ? '✓' : '→' }}</span>
      </PrimaryButton>
    </div>
  </main>
</template>

<style scoped>
.welcome {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  background: radial-gradient(ellipse at top, #392052, var(--color-bg) 62%);
  padding: calc(env(safe-area-inset-top, 0px) + 18px) 18px calc(env(safe-area-inset-bottom, 0px) + 24px);
}

.welcome__content { max-width: 560px; margin: 0 auto; }
.welcome__back { margin-bottom: 4px; }
.welcome__header { text-align: center; }
.welcome__emblem {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 10px;
  border: 1px solid var(--color-gold);
  border-radius: 50%;
  color: var(--color-gold);
  font-size: 28px;
  background: rgba(230, 199, 107, .06);
  box-shadow: 0 0 30px rgba(230, 199, 107, .08);
}
.welcome__brand { color: var(--color-gold); letter-spacing: .2em; font-size: 11px; font-weight: 700; }
.welcome__eyebrow { color: var(--color-text-muted); letter-spacing: .16em; font-size: 9px; margin-top: 3px; }
h1 { color: var(--color-gold); font-size: clamp(25px, 6vw, 32px); line-height: 1.2; margin-top: 12px; }
.welcome__intro { max-width: 500px; margin: 9px auto 0; line-height: 1.52; color: var(--color-text-muted); font-size: 14px; }

.welcome__languages { display: flex; gap: 10px; border: 0; padding: 0; margin: 18px 0; }
legend { text-align: center; margin-bottom: 8px; font-size: 13px; }
.welcome__languages label {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  cursor: pointer;
  background: rgba(24, 20, 48, .54);
}
.welcome__languages .selected { border-color: var(--color-gold); background: rgba(230, 199, 107, .09); }
input { accent-color: var(--color-primary); width: 17px; height: 17px; }

.welcome__guide { margin-top: 18px; }
h2 { font-size: 18px; margin-bottom: 10px; }
.welcome__steps { list-style: none; padding: 0; margin: 0; display: grid; gap: 9px; }
li {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  background: rgba(24, 20, 48, .72);
}
.welcome__number {
  display: grid;
  place-items: center;
  flex: 0 0 28px;
  height: 28px;
  color: var(--color-gold);
  border: 1px solid rgba(230, 199, 107, .4);
  border-radius: 9px;
  font-weight: 700;
}
h3 { font-family: var(--font-sans); font-size: 15px; line-height: 1.35; }
li p { margin-top: 3px; color: var(--color-text-muted); font-size: 13px; line-height: 1.48; }
.welcome__tip {
  display: flex;
  gap: 10px;
  margin: 12px 0 9px;
  padding: 12px;
  background: rgba(230, 199, 107, .06);
  border: 1px solid rgba(230, 199, 107, .26);
  border-radius: 14px;
  color: var(--color-gold);
  font-size: 13px;
  line-height: 1.48;
}
.welcome__note { text-align: center; color: var(--color-text-muted); font-size: 11px; line-height: 1.5; margin-bottom: 9px; }
.welcome :deep(button) { min-height: 50px; }
.welcome :deep(:focus-visible) { outline: 2px solid var(--color-gold); outline-offset: 3px; }

@media (min-width: 720px) {
  .welcome__steps { grid-template-columns: repeat(3, 1fr); }
  li { min-height: 138px; }
}
</style>
