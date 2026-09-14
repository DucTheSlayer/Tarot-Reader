<script setup lang="ts">
import BackButton from './BackButton.vue'
defineProps<{
  title: string
  backTo: string
}>()
</script>

<template>
  <header class="screen-header">
    <BackButton :to="backTo" class="screen-header__back" />
    <h1 class="screen-header__title">{{ title }}</h1>
  </header>
</template>

<style scoped>
.screen-header {
  position: relative;
  z-index: 55;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  column-gap: var(--space-1);
  align-items: center;
  min-height: 48px;
  margin-top: env(safe-area-inset-top, 0px);
}

.screen-header__back {
  justify-self: start;
}

.screen-header__title {
  grid-column: 2;
  min-width: 0;
  font-size: clamp(16px, 5vw, 22px);
  color: var(--color-gold);
  text-align: center;
  line-height: 1.45;
  white-space: normal;
  overflow-wrap: anywhere;
}

@media (min-width: 700px) {
  .screen-header__title {
    font-size: 28px;
    letter-spacing: 0.04em;
  }
}
</style>
