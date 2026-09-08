<script setup lang="ts">
import { ui } from '../../i18n/reading'
import type { TarotCard } from '../../types/tarotCard'

withDefaults(
  defineProps<{
    card: TarotCard
    showAdvice?: boolean
    showImage?: boolean
    meaning?: string
    advice?: string
    variant?: 'default' | 'love' | 'money'
  }>(),
  {
    showAdvice: true,
    showImage: true,
    variant: 'default'
  }
)
</script>

<template>
  <article class="result" :class="`result--${variant}`">
    <img v-if="showImage" :src="card.image" :alt="card.name" class="result__image" />
    <h2 class="result__name">{{ card.name }}</h2>
    <p class="result__meaning">{{ meaning ?? card.meaning }}</p>
    <p v-if="showAdvice" class="result__advice">
      <span class="result__advice-title">{{ ui("Advice") }}</span>
      {{ advice ?? card.advice }}
    </p>
  </article>
</template>

<style scoped>
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.result__image {
  width: 180px;
  max-width: 55vw;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.result__name {
  font-size: 24px;
  color: var(--color-gold);
}

.result--love .result__name {
  color: var(--color-gold);
}

.result--money .result__name {
  color: #e3c56f;
}

.result__meaning {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
}

.result__advice {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-muted);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.result__advice-title {
  display: block;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-gold);
  margin-bottom: 4px;
}
</style>
