<script setup lang="ts">
import { ui } from '../../i18n/reading'
defineProps<{ label: string }>()
</script>

<template>
  <span class="slot-label">{{ ui(label) }}</span>
</template>

<style scoped>
.slot-label {
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-gold-soft);
  border: 1px solid rgba(230, 199, 107, 0.35);
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.5px;
  text-align: center;
}
</style>
