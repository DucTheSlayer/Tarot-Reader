<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  modelValue: string
  questions: readonly string[]
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const list = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
let autoAdvanceTimer: number | undefined
let resumeTimer: number | undefined
let scrollFrame: number | undefined

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToQuestion(index: number, behavior: ScrollBehavior = 'smooth') {
  const container = list.value
  const item = container?.children.item(index) as HTMLElement | null
  if (!container || !item) return

  activeIndex.value = index
  container.scrollTo({ left: item.offsetLeft - 2, behavior })
}

function startAutoAdvance(delay = 3200) {
  window.clearTimeout(autoAdvanceTimer)
  if (prefersReducedMotion()) return

  autoAdvanceTimer = window.setTimeout(() => {
    const count = list.value?.children.length ?? 0
    if (count < 2) return
    scrollToQuestion((activeIndex.value + 1) % count)
    startAutoAdvance(4200)
  }, delay)
}

function pauseAutoAdvance() {
  window.clearTimeout(autoAdvanceTimer)
  window.clearTimeout(resumeTimer)
  resumeTimer = window.setTimeout(() => startAutoAdvance(), 6500)
}

function syncActiveIndex() {
  if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame)
  scrollFrame = window.requestAnimationFrame(() => {
    const container = list.value
    if (!container?.children.length) return

    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY
    Array.from(container.children).forEach((child, index) => {
      const distance = Math.abs((child as HTMLElement).offsetLeft - container.scrollLeft)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    activeIndex.value = closestIndex
  })
}

onMounted(() => startAutoAdvance())

onBeforeUnmount(() => {
  window.clearTimeout(autoAdvanceTimer)
  window.clearTimeout(resumeTimer)
  if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame)
})
</script>

<template>
  <fieldset class="suggestions">
    <legend class="suggestions__label">{{ label }}</legend>
    <div
      ref="list"
      class="suggestions__list"
      @scroll.passive="syncActiveIndex"
      @pointerdown="pauseAutoAdvance"
      @wheel.passive="pauseAutoAdvance"
      @focusin="pauseAutoAdvance"
    >
      <button
        v-for="question in questions"
        :key="question"
        type="button"
        class="suggestions__item"
        :class="{ 'suggestions__item--selected': modelValue.trim() === question }"
        :aria-pressed="modelValue.trim() === question"
        @click="emit('update:modelValue', question)"
      >
        {{ question }}
      </button>
    </div>
    <div v-if="questions.length > 1" class="suggestions__progress" aria-hidden="true">
      <span
        v-for="(_, index) in questions"
        :key="index"
        :class="{ 'is-active': index === activeIndex }"
      ></span>
    </div>
  </fieldset>
</template>

<style scoped>
.suggestions {
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
}

.suggestions__label {
  margin-bottom: var(--space-2);
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
}

.suggestions__list {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: 2px 2px var(--space-1);
  cursor: grab;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  overscroll-behavior-inline: contain;
  touch-action: pan-x pan-y;
  -webkit-overflow-scrolling: touch;
}

.suggestions__list::-webkit-scrollbar {
  display: none;
}

.suggestions__list:active {
  cursor: grabbing;
}

.suggestions__item {
  flex: 0 0 min(calc(100% - 28px), 320px);
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  scroll-snap-align: start;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 12.5px;
  line-height: 1.4;
  text-align: left;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
  -webkit-tap-highlight-color: transparent;
}

.suggestions__progress {
  display: flex;
  justify-content: center;
  gap: 6px;
  min-height: 6px;
  margin-top: var(--space-1);
}

.suggestions__progress span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-text-muted);
  opacity: 0.34;
  transition: width 220ms ease, border-radius 220ms ease, background 220ms ease, opacity 220ms ease;
}

.suggestions__progress span.is-active {
  width: 18px;
  border-radius: var(--radius-full);
  background: var(--color-gold);
  opacity: 1;
}

.suggestions__item--selected {
  border-color: var(--color-gold);
  background: var(--color-gold-soft);
  color: var(--color-text);
}

.suggestions__item:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

@media (hover: hover) {
  .suggestions__item:hover {
    border-color: color-mix(in srgb, var(--color-gold) 70%, transparent);
    color: var(--color-text);
  }
}

@media (prefers-reduced-motion: reduce) {
  .suggestions__item,
  .suggestions__progress span {
    transition: none;
  }
}
</style>
