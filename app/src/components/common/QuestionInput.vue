<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    label?: string
    maxlength?: number
  }>(),
  { placeholder: '', label: '' }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="question">
    <span v-if="label" class="question__label">{{ label }}</span>
    <input
      :value="modelValue"
      type="text"
      class="question__input"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>

<style scoped>
.question {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.question__label {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-muted);
}

.question__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 15px;
}

.question__input::placeholder {
  color: var(--color-text-muted);
}

.question__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
</style>
