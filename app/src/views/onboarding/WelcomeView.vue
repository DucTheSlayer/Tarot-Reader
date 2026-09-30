<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { hasAppMessages, setAppLocale } from '../../i18n'
import {
  isPublishedLocale,
  LOCALE_OPTIONS,
  type AppLocale
} from '../../i18n/locales'
import { completeOnboarding } from '../../data/onboarding'
import ChevronIcon from '../../components/common/ChevronIcon.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const reviewing = computed(() => route.name === 'usage-guide')
const page = ref(reviewing.value ? 1 : 0)
const touchStartX = ref<number | null>(null)

const languages = LOCALE_OPTIONS.filter(
  ({ value }) => isPublishedLocale(value) && hasAppMessages(value)
)

const flags: Record<AppLocale, string> = {
  en: '🇬🇧',
  vi: '🇻🇳',
  'es-419': '🇪🇸',
  'pt-BR': '🇧🇷',
  id: '🇮🇩',
  hi: '🇮🇳',
  th: '🇹🇭',
  fr: '🇫🇷',
  de: '🇩🇪',
  ja: '🇯🇵',
  ko: '🇰🇷',
  'zh-TW': '🇹🇼'
}

const slides = [
  {
    key: 'zodiac',
    image: '/assets/onboarding/zodiac-origins-v2.jpg',
    title: 'zodiacHome.origin',
    body: 'zodiacHome.originDescription',
    position: '50% 20%'
  },
  {
    key: 'cosmic',
    image: '/assets/onboarding/cosmic-secrets-v2.jpg',
    title: 'zodiacHome.subtitle',
    body: 'zodiacHome.horoscopeDescription',
    position: '50% 16%'
  },
  {
    key: 'daily',
    image: '/assets/onboarding/daily-guidance-v2.jpg',
    title: 'tarotHome.daily',
    body: 'onboarding.tip',
    position: '50% 13%'
  }
] as const

const activeSlideIndex = computed(() => Math.max(0, page.value - 1))
const activeSlide = computed(() => slides[activeSlideIndex.value])
const isLastSlide = computed(() => page.value === slides.length)

if (typeof window !== 'undefined') {
  slides.forEach(({ image }) => {
    const preload = new Image()
    preload.src = image
  })
}

function selectLanguage(value: AppLocale) {
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

function goNext() {
  if (isLastSlide.value) {
    finish()
    return
  }
  page.value += 1
}

function goPrevious() {
  if (page.value > (reviewing.value ? 1 : 0)) {
    page.value -= 1
    return
  }
  if (reviewing.value) void router.replace('/settings')
}

function goToSlide(index: number) {
  page.value = index + 1
}

function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0]?.clientX ?? null
}

function handleTouchEnd(event: TouchEvent) {
  const start = touchStartX.value
  const end = event.changedTouches[0]?.clientX
  touchStartX.value = null
  if (start === null || end === undefined || Math.abs(end - start) < 55) return
  if (end < start) goNext()
  else goPrevious()
}
</script>

<template>
  <main class="onboarding" @touchstart.passive="handleTouchStart" @touchend.passive="handleTouchEnd">
    <Transition name="page" mode="out-in">
      <section v-if="page === 0" key="language" class="language-screen">
        <header class="language-screen__header">
          <div>
            <h1>{{ t('settings.language') }}</h1>
            <p>{{ t('settings.languageDescription') }}</p>
          </div>
          <button
            type="button"
            class="language-screen__continue"
            :aria-label="t('common.explore')"
            @click="goNext"
          >
            <ChevronIcon direction="right" />
          </button>
        </header>

        <fieldset class="language-list">
          <legend>{{ t('settings.language') }}</legend>
          <label
            v-for="language in languages"
            :key="language.value"
            :class="{ selected: locale === language.value }"
          >
            <input
              type="radio"
              name="welcome-language"
              :value="language.value"
              :checked="locale === language.value"
              @click="selectLanguage(language.value)"
            />
            <span class="language-list__flag" aria-hidden="true">{{ flags[language.value] }}</span>
            <span class="language-list__name">
              <strong :lang="language.value">{{ language.label }}</strong>
              <small v-if="language.englishLabel" lang="en">{{ language.englishLabel }}</small>
            </span>
            <span v-if="locale === language.value" class="language-list__check" aria-hidden="true">✓</span>
          </label>
        </fieldset>
      </section>

      <section v-else :key="activeSlide.key" class="story-screen">
        <img
          class="story-screen__image"
          :src="activeSlide.image"
          :style="{ objectPosition: activeSlide.position }"
          alt=""
        />
        <div class="story-screen__veil" aria-hidden="true" />

        <div class="story-screen__content">
          <h1>{{ t(activeSlide.title) }}</h1>
          <p class="story-screen__description">{{ t(activeSlide.body) }}</p>

          <div class="story-screen__controls">
            <button type="button" class="story-screen__nav" :aria-label="t('common.back')" @click="goPrevious">
              <ChevronIcon />
            </button>
            <nav class="story-screen__dots" :aria-label="t('onboarding.stepsTitle')">
              <button
                v-for="(slide, index) in slides"
                :key="slide.key"
                type="button"
                :class="{ active: index === activeSlideIndex }"
                :aria-current="index === activeSlideIndex ? 'step' : undefined"
                :aria-label="t(slide.title)"
                @click="goToSlide(index)"
              />
            </nav>
            <button
              type="button"
              class="story-screen__nav"
              :aria-label="isLastSlide ? t('onboarding.start') : t('common.explore')"
              @click="goNext"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.onboarding {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: #fff;
  background: #120b2b;
  font-family: var(--font-sans);
}

button,
label {
  -webkit-tap-highlight-color: transparent;
}

.language-screen {
  position: relative;
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 18px env(safe-area-inset-bottom, 0px);
  background:
    linear-gradient(180deg, rgba(26, 13, 58, 0.2), rgba(10, 10, 35, 0.96)),
    radial-gradient(circle at 50% 3%, rgba(144, 82, 225, 0.42), transparent 38%),
    #111027;
}

.language-screen::before {
  position: absolute;
  z-index: 0;
  top: -115px;
  left: 50%;
  width: 390px;
  height: 390px;
  border: 1px solid rgba(220, 190, 255, 0.13);
  border-radius: 50%;
  box-shadow:
    0 0 0 36px rgba(197, 151, 255, 0.025),
    0 0 0 78px rgba(197, 151, 255, 0.02);
  content: '';
  transform: translateX(-50%);
}

.language-screen__header {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 4px 20px;
}

.language-screen__header h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(30px, 8vw, 38px);
  font-weight: 600;
  line-height: 1.2;
}

.language-screen__header p:last-child {
  max-width: 360px;
  margin: 10px 0 0;
  color: rgba(239, 234, 255, 0.7);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
}

.language-screen__continue {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  border: 1px solid rgba(215, 185, 255, 0.35);
  border-radius: 50%;
  color: var(--color-gold);
  background: color-mix(in srgb, var(--color-surface-raised) 82%, transparent);
  box-shadow: 0 6px 18px rgba(8, 3, 18, 0.24);
  font-size: 22px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 120ms ease;
}

.language-screen__continue :deep(.chevron-icon) {
  width: 22px;
  height: 22px;
}

.language-list {
  position: relative;
  z-index: 1;
  min-height: 0;
  margin: 0;
  padding: 0 2px calc(env(safe-area-inset-bottom, 0px) + 18px);
  overflow-y: auto;
  border: 0;
  scrollbar-width: none;
}

.language-list::-webkit-scrollbar {
  display: none;
}

.language-list legend {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.language-list label {
  display: grid;
  min-height: 68px;
  margin-bottom: 10px;
  padding: 11px 15px;
  grid-template-columns: 46px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 13px;
  border: 1px solid rgba(216, 201, 255, 0.09);
  border-radius: 19px;
  background: rgba(48, 45, 76, 0.82);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.035);
  cursor: pointer;
  transition: 180ms ease;
}

.language-list label.selected {
  border-color: rgba(237, 219, 255, 0.58);
  background: linear-gradient(105deg, #b894ff, #7852ec);
  box-shadow: 0 12px 28px rgba(87, 50, 176, 0.34);
  transform: translateY(-1px);
}

.language-list input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.language-list__flag {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  font-size: 29px;
  line-height: 1;
}

.language-list__name {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.language-list__name strong {
  overflow: hidden;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.language-list__name small {
  color: rgba(236, 230, 255, 0.58);
  font-family: var(--font-sans);
  font-size: 12px;
}

.language-list label.selected small {
  color: rgba(255, 255, 255, 0.76);
}

.language-list__check {
  font-size: 18px;
  font-weight: 800;
}

.language-list label:focus-within,
.language-screen__continue:focus-visible,
.story-screen__nav:focus-visible,
.story-screen__dots button:focus-visible {
  outline: 2px solid #f4d98d;
  outline-offset: 3px;
}

.story-screen {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #130b2c;
}

.story-screen__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.002);
}

.story-screen__veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(8, 4, 23, 0.28) 0%, transparent 18%),
    linear-gradient(180deg, transparent 43%, rgba(17, 8, 39, 0.68) 61%, #160d32 78%, #160d32 100%);
}

.language-screen__continue:active {
  border-color: var(--color-gold);
  background: var(--color-primary-soft);
  transform: scale(0.96);
}

.story-screen__content {
  position: absolute;
  z-index: 2;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  min-height: 31%;
  padding: 14px 26px calc(env(safe-area-inset-bottom, 0px) + 22px);
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.story-screen__content::before {
  content: '✦';
  margin-bottom: 2px;
  color: #e9c978;
  font-family: var(--font-display);
  font-size: 14px;
  line-height: 1;
  text-shadow: 0 0 14px rgba(226, 187, 100, 0.62);
}

.story-screen__content h1 {
  max-width: 470px;
  margin: 0;
  color: #f5dd98;
  background: linear-gradient(180deg, #fff3bd 4%, #edcf7c 55%, #cfa85c 100%);
  background-clip: text;
  font-family: var(--font-display);
  font-size: clamp(26px, 6.7vw, 34px);
  font-weight: 600;
  line-height: 1.28;
  text-wrap: balance;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.story-screen__content h1::after {
  display: block;
  width: 42px;
  height: 1px;
  margin: 8px auto 0;
  background: linear-gradient(90deg, transparent, rgba(233, 201, 120, 0.9), transparent);
  box-shadow: 0 0 8px rgba(226, 187, 100, 0.4);
  content: '';
}

.story-screen__description {
  max-width: 390px;
  margin: 8px 0 0;
  color: rgba(250, 247, 255, 0.78);
  font-family: var(--font-sans);
  font-size: clamp(13px, 3.5vw, 15px);
  font-weight: 400;
  line-height: 1.5;
  text-wrap: balance;
}

.story-screen__controls {
  display: grid;
  width: min(100%, 260px);
  margin-top: 16px;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 14px;
}

.story-screen__nav {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-gold);
  background: color-mix(in srgb, var(--color-surface) 84%, transparent);
  box-shadow: var(--shadow-sm);
  font-size: 21px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background 160ms ease, border-color 160ms ease, transform 120ms ease;
  -webkit-tap-highlight-color: transparent;
}

.story-screen__nav :deep(.chevron-icon) {
  width: 21px;
  height: 21px;
}

.story-screen__nav:active {
  border-color: color-mix(in srgb, var(--color-gold) 60%, transparent);
  background: var(--color-primary-soft);
  transform: scale(0.95);
}

.story-screen__dots {
  display: flex;
  min-height: 30px;
  margin: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.story-screen__dots button {
  width: 8px;
  min-width: 8px;
  height: 8px;
  min-height: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(221, 199, 255, 0.3);
  cursor: pointer;
  transition: 180ms ease;
}

.story-screen__dots button.active {
  width: 32px;
  background: #cba7ff;
  box-shadow: 0 0 16px rgba(199, 156, 255, 0.72);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(18px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

@media (max-height: 700px) {
  .language-screen {
    padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
  }

  .language-screen__header {
    padding-bottom: 12px;
  }

  .language-screen__header h1 {
    font-size: 30px;
  }

  .language-screen__header p:last-child {
    margin-top: 6px;
    font-size: 12px;
  }

  .language-list label {
    min-height: 60px;
    margin-bottom: 8px;
    padding-block: 8px;
  }

  .language-list__flag {
    width: 39px;
    height: 39px;
    font-size: 26px;
  }

  .story-screen__content {
    min-height: 33%;
    padding-top: 8px;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
  }

  .story-screen__content h1 {
    font-size: 25px;
  }

  .story-screen__description {
    margin-top: 7px;
    font-size: 13px;
  }

  .story-screen__dots {
    min-height: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .language-list label,
  .story-screen__dots button {
    transition: none;
  }
}
</style>
