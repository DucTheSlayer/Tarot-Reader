<script setup lang="ts">
withDefaults(defineProps<{ direction?: 'left' | 'right' }>(), {
  direction: 'left'
})
</script>

<template>
  <svg
    class="chevron-icon"
    :class="`chevron-icon--${direction}`"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M14.5 6.5 9 12l5.5 5.5" />
  </svg>
</template>

<style scoped>
.chevron-icon {
  display: block;
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  overflow: visible;
  stroke: currentColor;
  stroke-width: 2.35;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chevron-icon--right {
  transform: rotate(180deg);
}
</style>
