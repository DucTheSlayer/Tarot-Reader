<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineProps<{
  title: string
  backTo: string
}>()
</script>

<template>
  <header class="screen-header">
    <router-link :to="backTo" class="screen-header__back">← {{ t('common.back') }}</router-link>
    <h1 class="screen-header__title">{{ title }}</h1>
  </header>
</template>

<style scoped>
.screen-header {
  position: relative;
  z-index: 55;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 72px;
  column-gap: var(--space-1);
  align-items: center;
  min-height: 48px;
  margin-top: env(safe-area-inset-top, 0px);
}

.screen-header__back {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-inline: var(--space-2);
  border-radius: var(--radius-md);
  font-size: 15px;
  white-space: nowrap;
  color: var(--color-text);
  -webkit-tap-highlight-color: transparent;
}

.screen-header__back:active {
  background: var(--color-primary-soft);
}

.screen-header__back:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.screen-header__title {
  grid-column: 2;
  min-width: 0;
  font-size: clamp(16px, 5vw, 22px);
  color: var(--color-gold);
  text-align: center;
  line-height: 1.45;
  white-space: normal;
  overflow-wrap: anywhere;
}

@media (min-width: 700px) {
  .screen-header {
    grid-template-columns: 88px minmax(0, 1fr) 88px;
  }

  .screen-header__back {
    font-size: 17px;
  }

  .screen-header__title {
    font-size: 28px;
    letter-spacing: 0.04em;
  }
}
</style>
