<script setup lang="ts">
import { ui } from '../../i18n/reading'
import MysticalBackground from './MysticalBackground.vue'

withDefaults(
  defineProps<{
    title: string
    backTo?: string
    theme?: 'tarot' | 'zodiac'
  }>(),
  { theme: 'tarot' }
)
</script>

<template>
  <main class="screen" :class="{ 'theme-zodiac': theme === 'zodiac' }">
    <MysticalBackground v-if="theme === 'tarot'" />
    <header v-if="backTo" class="screen__bar">
      <router-link :to="backTo" class="screen__back">{{ ui("← Back") }}</router-link>
    </header>
    <div class="screen__body">
      <h1>{{ title }}</h1>
      <p class="screen__note">{{ ui('This screen is coming soon.') }}</p>
    </div>
  </main>
</template>

<style scoped>
.screen {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  padding: var(--space-4);
}

.screen__bar {
  display: flex;
  padding: var(--space-2) 0 var(--space-4);
}

.screen__back {
  color: var(--color-text-muted);
  font-size: 15px;
}

.screen__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  text-align: center;
}

.screen__note {
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
