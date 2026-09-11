<script setup lang="ts">
import MysticalBackground from './MysticalBackground.vue'

withDefaults(defineProps<{ spread?: boolean }>(), { spread: false })
</script>

<template>
  <div class="screen-content" :class="{ 'screen-content--spread': spread }">
    <MysticalBackground />
    <div class="screen-content__inner">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.screen-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  padding: var(--space-2) var(--space-1) var(--space-2);
}

.screen-content__inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-top: auto;
  margin-bottom: auto;
}

.screen-content--spread .screen-content__inner {
  margin-top: 0;
  margin-bottom: 0;
  flex: 1;
  justify-content: flex-start;
  gap: clamp(28px, 5vh, 52px);
}
</style>
