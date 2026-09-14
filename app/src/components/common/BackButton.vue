<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChevronIcon from './ChevronIcon.vue'

const { t } = useI18n()
defineProps<{ to: string }>()
</script>

<template>
  <RouterLink
    :to="to"
    class="back-button"
    :aria-label="t('common.back')"
    :title="t('common.back')"
  >
    <ChevronIcon />
  </RouterLink>
</template>

<style scoped>
.back-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--color-gold) 42%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-surface-raised) 78%, transparent);
  box-shadow: 0 6px 18px rgba(8, 3, 18, 0.2);
  color: var(--color-gold);
  font-size: 25px;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    transform 120ms ease;
  -webkit-tap-highlight-color: transparent;
}

.back-button:active {
  background: var(--color-primary-soft);
  transform: scale(0.96);
}

.back-button:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .back-button:hover {
    border-color: var(--color-gold);
    background: var(--color-primary-soft);
  }
}
</style>
