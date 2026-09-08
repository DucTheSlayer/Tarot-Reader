<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import {
  buildLoveSummary,
  buildMoneySummary,
  type LoveContext,
  type MoneyContext,
  type SpreadVariant
} from '../../data/spreadReadings'

const props = defineProps<{
  variant: SpreadVariant
  cards: TarotCard[]
  context: LoveContext | MoneyContext
}>()

const loveMessage = computed(() =>
  props.variant === 'love'
    ? buildLoveSummary(props.cards, props.context as LoveContext)
    : ''
)

const moneySections = computed(() =>
  props.variant === 'money'
    ? buildMoneySummary(props.cards, props.context as MoneyContext)
    : []
)
</script>

<template>
  <section class="summary" :class="`summary--${variant}`">
    <template v-if="variant === 'love'">
      <p class="summary__eyebrow">{{ ui("The three-card story") }}</p>
      <h2 class="summary__title">{{ ui("Message for the connection") }}</h2>
      <p class="summary__message">{{ loveMessage }}</p>
    </template>

    <template v-else>
      <p class="summary__eyebrow">{{ ui("Your practical reading") }}</p>
      <h2 class="summary__title">{{ ui("Financial perspective") }}</h2>
      <div class="summary__sections">
        <div v-for="section in moneySections" :key="section.title" class="summary__section">
          <h3>{{ section.title }}</h3>
          <p>{{ section.body }}</p>
        </div>
      </div>
      <p class="summary__disclaimer">{{ ui("For reflection only — this reading is not financial advice.") }}</p>
    </template>
  </section>
</template>

<style scoped>
.summary {
  width: min(100%, 520px);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-raised) 92%, transparent);
  box-shadow: var(--shadow-md);
}

.summary--love {
  border-color: color-mix(in srgb, var(--color-gold) 32%, transparent);
  background: linear-gradient(145deg, var(--color-primary-soft), var(--color-surface-raised));
  text-align: center;
}

.summary--money {
  border-color: rgba(221, 183, 88, 0.34);
  background: linear-gradient(145deg, rgba(34, 91, 88, 0.28), var(--color-surface-raised));
}

.summary__eyebrow {
  margin-bottom: var(--space-1);
  color: var(--color-gold);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.summary__title {
  margin-bottom: var(--space-3);
  font-size: 18px;
}

.summary__message,
.summary__section p {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.65;
}

.summary__sections {
  display: grid;
  gap: var(--space-3);
}

.summary__section {
  padding-left: var(--space-3);
  border-left: 2px solid rgba(221, 183, 88, 0.45);
}

.summary__section h3 {
  margin-bottom: var(--space-1);
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 13px;
}

.summary__disclaimer {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.5;
}
</style>
