<script setup lang="ts">
import { ui } from '../../i18n/reading'
import type { ContextOption } from '../../data/spreadReadings'

defineProps<{
  label: string
  name: string
  modelValue: string
  options: ContextOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <fieldset class="context-picker">
    <legend class="context-picker__label">{{ label }}</legend>
    <div class="context-picker__options">
      <label v-for="option in options" :key="option.value" class="context-picker__option">
        <input
          class="context-picker__input"
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="emit('update:modelValue', option.value)"
        />
        <span class="context-picker__chip">{{ ui(option.label) }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.context-picker {
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
}

.context-picker__label {
  width: 100%;
  margin-bottom: var(--space-3);
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}

.context-picker__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

.context-picker__option {
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.context-picker__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.context-picker__chip {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 13px;
  transition: border-color 180ms ease, background 180ms ease, color 180ms ease,
    transform 180ms ease;
}

.context-picker__input:checked + .context-picker__chip {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-text);
}

.context-picker__input:focus-visible + .context-picker__chip {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}

.context-picker__option:active .context-picker__chip {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .context-picker__chip {
    transition: none;
  }
}
</style>
