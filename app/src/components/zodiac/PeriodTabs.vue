<script setup lang="ts">
import type { HoroscopePeriod } from '../../types/zodiac'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
  modelValue: HoroscopePeriod
}>()

const emit = defineEmits<{
  'update:modelValue': [period: HoroscopePeriod]
}>()

const periods: Array<{ value: HoroscopePeriod; label: string }> = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'year', label: 'Year' }
]

function moveFocus(from: HoroscopePeriod, direction: -1 | 1) {
  const index = periods.findIndex((period) => period.value === from)
  const next = periods[(index + direction + periods.length) % periods.length]
  emit('update:modelValue', next.value)
  requestAnimationFrame(() => {
    document.querySelector<HTMLButtonElement>(`[data-period="${next.value}"]`)?.focus()
  })
}
</script>

<template>
  <div class="period-tabs" role="tablist" :aria-label="t('period.label')">
    <button
      v-for="period in periods"
      :key="period.value"
      type="button"
      role="tab"
      :data-period="period.value"
      :aria-selected="props.modelValue === period.value"
      :tabindex="props.modelValue === period.value ? 0 : -1"
      :class="{ 'period-tabs__tab--active': props.modelValue === period.value }"
      class="period-tabs__tab"
      @click="emit('update:modelValue', period.value)"
      @keydown.left.prevent="moveFocus(period.value, -1)"
      @keydown.right.prevent="moveFocus(period.value, 1)"
    >
      {{ t(`period.${period.value}`) }}
    </button>
  </div>
</template>

<style scoped>
.period-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: rgba(20, 10, 40, 0.72);
}

.period-tabs__tab {
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-muted);
  font: 600 13px/1 var(--font-sans);
  cursor: pointer;
}

.period-tabs__tab--active {
  border-color: rgba(230, 199, 107, 0.5);
  background: var(--color-primary-soft);
  color: var(--color-gold);
  box-shadow: inset 0 0 12px var(--color-gold-soft);
}

.period-tabs__tab:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

@media (min-width: 700px) {
  .period-tabs {
    gap: 6px;
    padding: 6px;
  }

  .period-tabs__tab {
    min-height: 48px;
    font-size: 15px;
  }
}
</style>
