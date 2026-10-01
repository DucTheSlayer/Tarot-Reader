<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean; type?: 'button' | 'submit' }>(), { disabled: false, type: 'button' })

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button :type="type" class="btn" :disabled="disabled" @click="emit('click')">
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  width: 100%;
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  filter: brightness(0.92);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  filter: saturate(0.6);
}
</style>
