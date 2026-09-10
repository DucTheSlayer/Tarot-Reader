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
    <router-link
      :to="backTo"
      class="screen-header__back"
      :aria-label="t('common.back')"
      :title="t('common.back')"
    >
      <svg
        class="screen-header__back-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </router-link>
    <h1 class="screen-header__title">{{ title }}</h1>
  </header>
</template>

<style scoped>
.screen-header {
  position: relative;
  z-index: 55;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
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
  justify-self: start;
  width: 48px;
  height: 48px;
  border: 1px solid color-mix(in srgb, var(--color-gold) 42%, transparent);
  border-radius: 50%;
  color: var(--color-gold);
  background: color-mix(in srgb, var(--color-surface-raised) 78%, transparent);
  box-shadow: 0 6px 18px rgba(8, 3, 18, 0.2);
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    transform 120ms ease;
  -webkit-tap-highlight-color: transparent;
}

.screen-header__back-icon {
  display: block;
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.screen-header__back:active {
  background: var(--color-primary-soft);
  transform: scale(0.96);
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

@media (hover: hover) and (pointer: fine) {
  .screen-header__back:hover {
    border-color: var(--color-gold);
    background: var(--color-primary-soft);
  }
}

@media (min-width: 700px) {
  .screen-header__title {
    font-size: 28px;
    letter-spacing: 0.04em;
  }
}
</style>
