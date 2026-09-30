<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import HomeModeTabs from '../../components/common/HomeModeTabs.vue'
import MysticalBackground from '../../components/common/MysticalBackground.vue'

interface HomeItem {
  to: string
  label: string
  image?: string
  theme?: 'treasure' | 'moon' | 'scale' | 'love' | 'yearly' | 'spread'
}

const { t } = useI18n()

const items: HomeItem[] = [
  { to: '/tarot/daily', label: 'tarotHome.daily', image: '/assets/cards/daily-tarot.webp', theme: 'moon' },
  { to: '/tarot/yes-no', label: 'tarotHome.yesNo', image: '/assets/cards/yes-no.webp', theme: 'scale' },
  { to: '/tarot/love', label: 'tarotHome.love', image: '/assets/cards/love.webp', theme: 'love' },
  { to: '/tarot/money', label: 'tarotHome.money', image: '/assets/cards/money.webp', theme: 'treasure' },
  { to: '/tarot/yearly', label: 'tarotHome.yearly', image: '/assets/cards/yearly.webp', theme: 'yearly' },
  { to: '/tarot/3-card-spread', label: 'tarotHome.spread', image: '/assets/cards/3-card.webp', theme: 'spread' }
]

</script>

<template>
  <main class="screen">
    <MysticalBackground :animate="false" />
    <h1 class="screen__title">{{ t('nav.tarot') }}</h1>
    <router-link to="/tarot/library" class="screen__library-link">
      <span aria-hidden="true">✦</span>
      {{ t('tarotHome.library') }}
      <span aria-hidden="true">→</span>
    </router-link>
    <nav class="screen__nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :style="item.image
          ? { backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined"
        class="screen__item"
        :class="{
          'screen__item--treasure': item.theme === 'treasure',
          'screen__item--moon': item.theme === 'moon',
          'screen__item--scale': item.theme === 'scale',
          'screen__item--love': item.theme === 'love',
          'screen__item--yearly': item.theme === 'yearly',
          'screen__item--spread': item.theme === 'spread'
        }"
      >
        <span class="screen__item-label">{{ t(item.label) }}</span>
      </router-link>
    </nav>

    <HomeModeTabs />
  </main>
</template>

<style scoped>
.screen__title {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: 28px;
  text-align: center;
  background: linear-gradient(180deg, #fff8e6 0%, #e8c874 55%, #c9a24d 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 22px rgba(232, 200, 116, 0.35);
}

.screen__library-link {
  z-index: 1;
  align-self: center;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
  min-height: 34px;
  padding: 0 var(--space-3);
  border: 1px solid rgba(230, 199, 107, 0.38);
  border-radius: var(--radius-full);
  background: rgba(20, 10, 40, 0.72);
  color: var(--color-gold);
  font-size: 11px;
  font-weight: 600;
}

.screen__library-link:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.screen__nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, max-content);
  align-content: start;
  gap: var(--space-4);
  padding-bottom: var(--space-2);
}

.screen__item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  aspect-ratio: 5 / 7;
  width: 100%;
  max-width: 240px;
  justify-self: center;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  border: 1.5px solid rgba(230, 199, 107, 0.5);
  background: var(--color-surface);
  color: var(--color-text);
  overflow: hidden;
  transition: border-color 180ms ease, box-shadow 220ms ease, transform 180ms ease;
}

.screen__item::before {
  content: '';
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(230, 199, 107, 0.3);
  border-radius: calc(var(--radius-md) - 4px);
  pointer-events: none;
  z-index: 1;
}

.screen__item:active { transform: scale(0.975); }

@media (hover: hover) {
  .screen__item:hover {
    border-color: rgba(246, 218, 139, 0.86);
    box-shadow: 0 12px 30px rgba(8, 3, 24, 0.32), 0 0 18px rgba(230, 199, 107, 0.12);
    transform: translateY(-3px);
  }
}

.screen__item--treasure,
.screen__item--moon,
.screen__item--scale,
.screen__item--love,
.screen__item--yearly,
.screen__item--spread {
  border-color: rgba(230, 199, 107, 0.6);
}

.screen__item-label {
  position: relative;
  z-index: 2;
  margin-top: auto;
  font-family: var(--font-display);
  font-size: 15px;
  line-height: 1.25;
  text-align: center;
  color: var(--color-gold);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
}

@media (min-width: 700px) {
  .screen__title {
    font-size: 34px;
  }

  .screen__library-link {
    min-height: 46px;
    gap: 10px;
    padding: 0 20px;
    font-size: 14px;
  }

  .screen__nav {
    grid-template-columns: repeat(2, minmax(0, 240px));
    justify-content: center;
    column-gap: clamp(32px, 5vw, 48px);
    row-gap: var(--space-4);
    width: 100%;
    max-width: 560px;
    margin-inline: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .screen__item {
    transition: none;
  }
}

</style>
