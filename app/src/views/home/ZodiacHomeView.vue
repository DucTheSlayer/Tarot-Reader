<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import dayWeekBg from '../../assets/cards/dayweek.webp'
import originBg from '../../assets/cards/origin.webp'
import HomeModeTabs from '../../components/common/HomeModeTabs.vue'
import MysticalBackground from '../../components/common/MysticalBackground.vue'

interface ZodiacHomeItem {
  to: string
  label: string
  desc: string
  image: string
  kicker: string
  accent: 'solar' | 'lunar'
}

const { t } = useI18n()

const items: ZodiacHomeItem[] = [
  {
    to: '/zodiac/origin',
    label: 'zodiacHome.origin',
    desc: 'zodiacHome.originDescription',
    image: originBg,
    kicker: 'zodiacHome.originKicker',
    accent: 'solar'
  },
  {
    to: '/zodiac/horoscope',
    label: 'zodiacHome.horoscope',
    desc: 'zodiacHome.horoscopeDescription',
    image: dayWeekBg,
    kicker: 'zodiacHome.horoscopeKicker',
    accent: 'lunar'
  }
]
</script>

<template>
  <main class="screen zodiac-home">
    <MysticalBackground />

    <header class="screen__hero">
      <span class="screen__eyebrow">{{ t('zodiacHome.eyebrow') }}</span>
      <h1 class="screen__title">{{ t('nav.zodiac') }}</h1>
      <p class="screen__subtitle">{{ t('zodiacHome.subtitle') }}</p>
    </header>

    <nav class="screen__nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="screen__item"
        :class="`screen__item--${item.accent}`"
      >
        <div class="screen__item-media">
          <img
            class="screen__item-image"
            :src="item.image"
            alt=""
          />
        </div>

        <div class="screen__item-info">
          <div class="screen__item-copy">
            <span class="screen__item-kicker">{{ t(item.kicker) }}</span>
            <h2 class="screen__item-label">{{ t(item.label) }}</h2>
            <p class="screen__item-desc">{{ t(item.desc) }}</p>
          </div>
          <span class="screen__item-action">
            {{ t('common.explore') }}
            <span class="screen__item-action-arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </router-link>
    </nav>

    <HomeModeTabs />
  </main>
</template>

<style scoped>
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  background: var(--color-bg);
  padding: var(--space-4);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  gap: var(--space-3);
  isolation: isolate;
}

.screen__hero {
  z-index: 1;
  flex-shrink: 0;
  margin-top: calc(env(safe-area-inset-top, 0px) + var(--space-3));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.screen__eyebrow {
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.screen__title {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: 28px;
  text-align: center;
  background: linear-gradient(180deg, #fff8e6 0%, #e8c874 55%, #c9a24d 100%);
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 22px rgba(232, 200, 116, 0.35);
}

.screen__subtitle {
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.05em;
}

.screen__nav {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: repeat(2, max-content);
  align-content: center;
  align-items: stretch;
  gap: var(--space-3);
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: var(--space-1);
  -webkit-overflow-scrolling: touch;
}

.screen__item {
  --portal-accent: var(--color-gold);
  --portal-glow: var(--color-gold-soft);
  position: relative;
  display: grid;
  grid-template-columns: minmax(148px, 48%) minmax(0, 1fr);
  width: 100%;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--portal-accent) 62%, var(--color-border));
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 88% 12%, var(--portal-glow), transparent 42%),
    rgba(20, 10, 40, 0.92);
  color: var(--color-text);
  box-shadow: var(--shadow-md), 0 0 0 transparent;
  animation: portal-arrive 520ms backwards cubic-bezier(0.22, 1, 0.36, 1);
  -webkit-tap-highlight-color: transparent;
}

.screen__item:nth-child(2) { animation-delay: 90ms; }
.screen__item--solar { --portal-accent: #e7b95e; --portal-glow: rgba(231, 185, 94, 0.17); }
.screen__item--lunar { --portal-accent: #b689ff; --portal-glow: rgba(182, 137, 255, 0.18); }

.screen__item-media {
  flex: none;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-height: 168px;
  padding: 0;
  overflow: hidden;
  background: var(--color-surface-raised);
}

.screen__item-image {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1), filter 300ms ease;
}

.screen__item-info {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  min-height: 0;
  padding: var(--space-4);
  border-left: 1px solid color-mix(in srgb, var(--portal-accent) 24%, var(--color-border));
  background: linear-gradient(145deg, rgba(20, 10, 40, 0.9), rgba(32, 18, 58, 0.96));
}

.screen__item-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.screen__item-kicker {
  color: var(--portal-accent);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.14em;
  opacity: 0.8;
  text-transform: uppercase;
}

.screen__item-label {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(15px, 4.2vw, 19px);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.04em;
  color: var(--portal-accent);
  text-shadow: 0 0 12px var(--portal-glow);
  text-wrap: balance;
}

.screen__item-desc {
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.55;
  text-wrap: pretty;
}

.screen__item-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 36px;
  margin-top: auto;
  padding: 7px 12px;
  border: 1px solid color-mix(in srgb, var(--portal-accent) 58%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--portal-accent) 11%, transparent);
  color: var(--portal-accent);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.screen__item-action-arrow {
  font-size: 16px;
  line-height: 1;
  transition: transform 220ms ease;
}

.screen__item:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}

@media (hover: hover) {
  .screen__item {
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 220ms ease,
      box-shadow 260ms ease;
  }

  .screen__item:hover {
    border-color: var(--portal-accent);
    box-shadow: var(--shadow-lg), 0 0 30px var(--portal-glow);
    transform: translateY(-5px);
  }

  .screen__item:hover .screen__item-image {
    filter: saturate(1.08) contrast(1.03);
    transform: scale(1.04);
  }

  .screen__item:hover .screen__item-action-arrow {
    transform: translateX(4px);
  }
}

.screen__item:active {
  transform: translateY(-1px) scale(0.995);
}

@media (min-width: 700px) {
  .screen {
    gap: clamp(16px, 2vw, 24px);
    padding: clamp(20px, 2.5vw, 32px);
    padding-bottom: calc(clamp(20px, 2.5vw, 32px) + env(safe-area-inset-bottom));
  }

  .screen__hero {
    gap: 3px;
  }

  .screen__eyebrow {
    font-size: 11px;
  }

  .screen__title {
    font-size: clamp(34px, 4vw, 44px);
  }

  .screen__subtitle {
    font-size: 14px;
  }

  .screen__nav {
    grid-template-columns: repeat(2, minmax(0, 420px));
    grid-template-rows: max-content;
    justify-content: center;
    gap: clamp(20px, 3vw, 32px);
    max-width: min(92vw, 920px);
  }

  .screen__item {
    display: flex;
    flex-direction: column;
  }

  .screen__item-media {
    aspect-ratio: 1;
    height: auto;
    min-height: 0;
  }

  .screen__item-info {
    flex: 1;
    gap: var(--space-4);
    min-height: 154px;
    padding: clamp(18px, 2.2vw, 24px);
    border-top: 1px solid color-mix(in srgb, var(--portal-accent) 24%, var(--color-border));
    border-left: 0;
  }

  .screen__item-copy {
    gap: 7px;
  }

  .screen__item-kicker {
    font-size: 10px;
  }

  .screen__item-label {
    font-size: clamp(20px, 2.3vw, 24px);
  }

  .screen__item-desc {
    font-size: clamp(13px, 1.35vw, 15px);
  }

  .screen__item-action {
    min-height: 42px;
    padding-inline: 16px;
    font-size: 14px;
  }
}

@keyframes portal-arrive {
  from { opacity: 0; transform: translateY(18px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .screen__item,
  .screen__item-image,
  .screen__item-action-arrow {
    animation: none;
    transition: none;
  }
}

</style>
