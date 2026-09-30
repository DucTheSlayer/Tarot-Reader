<script setup lang="ts">
defineProps<{
  kind: 'star' | 'flame' | 'drop' | 'swords' | 'pentacle' | 'layers' | 'moon' | 'compass' | 'question' | 'scales'
}>()
</script>

<template>
  <svg
    class="tarot-glyph"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="kind === 'star'">
      <path d="M12 2.5 14.4 9.6 21.5 12l-7.1 2.4L12 21.5l-2.4-7.1L2.5 12l7.1-2.4L12 2.5Z" />
      <path d="M19 3v3M17.5 4.5h3" />
    </template>
    <template v-else-if="kind === 'flame'">
      <path d="M12 22c-4.3 0-7-2.7-7-6.6 0-3.2 2-5.6 3.1-7.8.2 2.6 1.4 3.7 2.1 4.1.1-4.4 2.5-7.1 4.8-9.7-.2 3.8 4.7 6.4 4.7 11.4C19 19.3 16.4 22 12 22Z" />
      <path d="M12 21c-1.8 0-3-1.1-3-2.8 0-1.5 1-2.6 2.2-3.8.2 1.5 1.2 2.1 1.6 2.4.1-1.9 1.2-3.2 2.3-4.3 0 2.2 1.9 3.6 1.9 5.7 0 1.6-1.2 2.8-3 2.8Z" />
    </template>
    <path v-else-if="kind === 'drop'" d="M12 2.5c2.6 4 7 8.7 7 12a7 7 0 0 1-14 0c0-3.3 4.4-8 7-12Z" />
    <template v-else-if="kind === 'swords'">
      <path d="m4 3 11 11M3 4l1-1 4 1M14 15l5 5M13 17l4-4" />
      <path d="M20 3 9 14M21 4l-1-1-4 1M10 15l-5 5M11 17l-4-4" />
    </template>
    <template v-else-if="kind === 'pentacle'">
      <circle cx="12" cy="12" r="9" />
      <path d="m12 5 1.7 5.2h5.5l-4.5 3.2 1.7 5.2L12 15.4l-4.4 3.2 1.7-5.2-4.5-3.2h5.5L12 5Z" />
    </template>
    <template v-else-if="kind === 'layers'">
      <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" />
    </template>
    <path v-else-if="kind === 'moon'" d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
    <template v-else-if="kind === 'compass'">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5 5.5-2.1Z" />
    </template>
    <template v-else-if="kind === 'question'">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9a2.6 2.6 0 1 1 3.2 2.5c-.8.3-.8.9-.8 1.9M12 17h.01" />
    </template>
    <template v-else>
      <path d="M12 3v17M5 7h14M4 7l-2 6h5L5 7ZM19 7l-2 6h5l-3-6ZM9 20h6" />
    </template>
  </svg>
</template>

<style scoped>
.tarot-glyph { display: block; width: 20px; height: 20px; flex: 0 0 auto; }
</style>
