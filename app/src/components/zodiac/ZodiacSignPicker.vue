<script setup lang="ts">
import { ui } from '../../i18n/reading'
import type { ZodiacSign } from '../../types/zodiac'

withDefaults(
  defineProps<{
    signs: readonly ZodiacSign[]
    mode?: 'links' | 'buttons'
    selectedId?: string
  }>(),
  {
    mode: 'buttons',
    selectedId: ''
  }
)

defineEmits<{
  select: [sign: ZodiacSign]
}>()
</script>

<template>
  <div class="sign-picker" :aria-label='ui("Choose a zodiac sign")'>
    <template v-for="(sign, index) in signs" :key="sign.id">
      <router-link
        v-if="mode === 'links'"
        :to="`/zodiac/origin/${sign.id}`"
        class="sign-picker__item"
        :class="`sign-picker__item--${sign.element}`"
        :aria-label="`${sign.name}, ${sign.dateRange}`"
        :style="{ '--sign-index': index }"
      >
        <span class="sign-picker__symbol" aria-hidden="true">{{ sign.symbol }}</span>
        <strong>{{ sign.name }}</strong>
        <small>{{ sign.dateRange }}</small>
      </router-link>

      <button
        v-else
        type="button"
        class="sign-picker__item"
        :class="[
          `sign-picker__item--${sign.element}`,
          { 'sign-picker__item--selected': selectedId === sign.id }
        ]"
        :aria-pressed="selectedId === sign.id"
        :style="{ '--sign-index': index }"
        @click="$emit('select', sign)"
      >
        <span class="sign-picker__symbol" aria-hidden="true">{{ sign.symbol }}</span>
        <strong>{{ sign.name }}</strong>
        <small>{{ sign.dateRange }}</small>
      </button>
    </template>
  </div>
</template>

<style scoped>
.sign-picker {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  width: 100%;
}

.sign-picker__item {
  --sign-accent: var(--color-gold);
  appearance: none;
  display: flex;
  min-width: 0;
  min-height: 104px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: var(--space-2) var(--space-1);
  border: 1px solid color-mix(in srgb, var(--sign-accent) 38%, var(--color-border));
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 16%, color-mix(in srgb, var(--sign-accent) 17%, transparent), transparent 48%),
    rgba(26, 21, 48, 0.88);
  color: var(--color-text);
  font: inherit;
  text-align: center;
  cursor: pointer;
  animation: constellation-rise 480ms
    calc(var(--sign-index, 0) * 42ms) cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.sign-picker__item--fire { --sign-accent: #f6a85f; }
.sign-picker__item--earth { --sign-accent: #9fc58d; }
.sign-picker__item--air { --sign-accent: #9ec8e8; }
.sign-picker__item--water { --sign-accent: #938ee8; }

.sign-picker__item--selected {
  border-color: var(--sign-accent);
  box-shadow: inset 0 0 18px color-mix(in srgb, var(--sign-accent) 13%, transparent);
}

.sign-picker__symbol {
  color: var(--sign-accent);
  font-family: Georgia, serif;
  font-size: 30px;
  line-height: 1;
  text-shadow: 0 0 12px color-mix(in srgb, var(--sign-accent) 50%, transparent);
  animation: zodiac-glyph-arrive 620ms
    calc(110ms + var(--sign-index, 0) * 42ms) cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.sign-picker strong {
  overflow: hidden;
  max-width: 100%;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
}

.sign-picker small {
  color: var(--color-text-muted);
  font-size: 9px;
  line-height: 1.35;
  white-space: nowrap;
}

.sign-picker__item:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

@media (hover: hover) {
  .sign-picker__item {
    transition: transform 160ms ease, border-color 160ms ease;
  }

  .sign-picker__item:hover {
    border-color: var(--sign-accent);
    transform: translateY(-2px);
  }
}

@media (min-width: 560px) {
  .sign-picker {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 700px) {
  .sign-picker {
    gap: clamp(12px, 1.6vw, 18px);
  }

  .sign-picker__item {
    min-height: 0;
    aspect-ratio: 4 / 3;
    gap: 6px;
    padding: clamp(14px, 2vw, 22px) 12px;
    border-radius: 16px;
  }

  .sign-picker__symbol {
    font-size: clamp(40px, 4.6vw, 52px);
  }

  .sign-picker strong {
    font-size: clamp(13px, 1.45vw, 16px);
  }

  .sign-picker small {
    font-size: clamp(10px, 1.1vw, 12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sign-picker__item,
  .sign-picker__symbol {
    animation: none;
    transition: none;
  }
}

@keyframes constellation-rise {
  from { opacity: 0; transform: translateY(12px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes zodiac-glyph-arrive {
  from { opacity: 0; transform: rotate(-18deg) scale(0.55); }
  to { opacity: 1; transform: rotate(0) scale(1); }
}
</style>
