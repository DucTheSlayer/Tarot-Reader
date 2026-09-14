<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, nextTick, ref, watch } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import {
  YEARLY_SLOTS,
  buildYearlyNorthStar,
  getYearlyCardReading
} from '../../data/spreadReadings'
import { useDrawCards } from '../../composables/useDrawCards'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ChevronIcon from '../../components/common/ChevronIcon.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import CardDrawAnimation from '../../components/common/CardDrawAnimation.vue'
import CardSlotLabel from '../../components/common/CardSlotLabel.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'

type Phase = 'initial' | 'drawing' | 'result'

const reduceMotion =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Vị trí tương đối của 5 mốc constellation, khớp thứ tự YEARLY_SLOTS.
const CONSTELLATION_POINTS = [
  { x: 50, y: 14 },
  { x: 14, y: 50 },
  { x: 86, y: 50 },
  { x: 32, y: 88 },
  { x: 68, y: 88 }
] as const

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const cards = ref<TarotCard[]>([])
const carouselEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const visited = ref<Set<number>>(new Set())
const northStarOpen = ref(false)
const northStarAutoOpened = ref(false)
const detailIndex = ref<number | null>(null)

const detailReading = computed(() => {
  if (detailIndex.value === null) return null
  const card = cards.value[detailIndex.value]
  if (!card) return null
  return {
    card,
    label: YEARLY_SLOTS[detailIndex.value],
    ...getYearlyCardReading(card, detailIndex.value)
  }
})

const northStar = computed(() => buildYearlyNorthStar(cards.value))
const visitedCount = computed(() => visited.value.size)
const visitedPolyline = computed(() =>
  CONSTELLATION_POINTS.filter((_, i) => visited.value.has(i))
    .map((p) => `${p.x},${p.y}`)
    .join(' ')
)

// Sau khi xem đủ 5 lá, tự mở North Star đúng một lần; vẫn luôn mở được bằng tay.
watch(visited, (set) => {
  if (!northStarAutoOpened.value && cards.value.length > 0 && set.size >= cards.value.length) {
    northStarAutoOpened.value = true
    northStarOpen.value = true
  }
})

function markVisited(i: number) {
  if (!visited.value.has(i)) {
    visited.value = new Set(visited.value).add(i)
  }
}

function scrollToIndex(i: number) {
  const el = carouselEl.value
  if (!el) return
  const slide = el.children[i] as HTMLElement | undefined
  if (!slide) return
  el.scrollTo({
    left: slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2,
    behavior: reduceMotion ? 'auto' : 'smooth'
  })
}

function goTo(i: number) {
  if (i < 0 || i >= cards.value.length) return
  activeIndex.value = i
  markVisited(i)
  scrollToIndex(i)
}

function goPrev() {
  goTo(activeIndex.value - 1)
}

function goNext() {
  goTo(activeIndex.value + 1)
}

function onSlideTap(i: number) {
  if (i === activeIndex.value) {
    detailIndex.value = i
  } else {
    goTo(i)
  }
}

function onScroll() {
  const el = carouselEl.value
  if (!el) return
  const center = el.scrollLeft + el.clientWidth / 2
  let closest = 0
  let best = Infinity
  Array.from(el.children).forEach((child, i) => {
    const item = child as HTMLElement
    const c = item.offsetLeft + item.offsetWidth / 2
    const d = Math.abs(c - center)
    if (d < best) {
      best = d
      closest = i
    }
  })
  if (closest !== activeIndex.value) {
    activeIndex.value = closest
    markVisited(closest)
  }
}

function startDraw() {
  if (phase.value !== 'initial') return
  cards.value = draw(5)
  phase.value = 'drawing'
}

function onRevealed() {
  resetResult()
  phase.value = 'result'
}

function drawAgain() {
  cards.value = draw(5)
  resetResult()
  phase.value = 'drawing'
}

function resetResult() {
  activeIndex.value = 0
  visited.value = new Set([0])
  northStarOpen.value = false
  northStarAutoOpened.value = false
  detailIndex.value = null
  nextTick(() => scrollToIndex(0))
}
</script>

<template>
  <main class="screen themed-result-screen themed-result-screen--yearly" :class="{ 'themed-result-screen--active': phase === 'result' }">
    <ScreenHeader :title='ui("Yearly Tarot")' back-to="/tarot" />
    <ScreenContent>
      <CardDrawAnimation
        v-if="phase === 'drawing'"
        :cards="cards"
        :active="true"
        variant="yearly"
        :fly-duration="320"
        :hold-duration="120"
        :flip-duration="520"
        @revealed="onRevealed"
      />

      <Transition name="result">
        <section v-if="phase === 'result' && cards.length" class="yearly">
          <p class="yearly__period">{{ ui("Your map for the next 12 months") }}</p>

          <div class="yearly__carousel-wrap">
            <button
              type="button"
              class="yearly__nav yearly__nav--prev"
              :aria-label='ui("Previous card")'
              :disabled="activeIndex === 0"
              @click="goPrev"
            >
              <ChevronIcon />
            </button>
            <div
              ref="carouselEl"
              class="yearly__carousel"
              tabindex="0"
              role="group"
              :aria-label='ui("Yearly spread carousel")'
              @scroll="onScroll"
            >
              <button
                v-for="(card, i) in cards"
                :key="card.id"
                type="button"
                class="yearly__slide"
                :class="{ 'yearly__slide--active': i === activeIndex }"
                :aria-label="`${ui(YEARLY_SLOTS[i])}: ${card.name}`"
                :aria-current="i === activeIndex ? 'true' : undefined"
                @click="onSlideTap(i)"
              >
                <img :src="card.image" :alt="card.name" class="yearly__slide-image" />
                <span class="yearly__slide-aspect">{{ ui(YEARLY_SLOTS[i]) }}</span>
                <span class="yearly__slide-name">{{ card.name }}</span>
              </button>
            </div>
            <button
              type="button"
              class="yearly__nav yearly__nav--next"
              :aria-label='ui("Next card")'
              :disabled="activeIndex === cards.length - 1"
              @click="goNext"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <p class="yearly__counter" aria-live="polite">
            {{ ui('{current} of {total}', { current: activeIndex + 1, total: cards.length }) }}
          </p>

          <div class="yearly__dots" role="group" :aria-label='ui("Card progress")'>
            <svg class="yearly__dots-path" viewBox="0 0 100 100" aria-hidden="true">
              <polyline v-if="visitedCount >= 2" :points="visitedPolyline" />
            </svg>
            <button
              v-for="(p, i) in CONSTELLATION_POINTS"
              :key="i"
              type="button"
              class="yearly__dot"
              :class="{
                'yearly__dot--active': i === activeIndex,
                'yearly__dot--visited': visited.has(i)
              }"
              :style="{ left: `${p.x}%`, top: `${p.y}%` }"
              :aria-label="ui('Go to {label}', { label: ui(YEARLY_SLOTS[i]) })"
              @click="goTo(i)"
            />
          </div>

          <section class="yearly__north">
            <button
              type="button"
              class="yearly__north-toggle"
              :aria-expanded="northStarOpen"
              @click="northStarOpen = !northStarOpen"
            >
              <span class="yearly__north-title">{{ ui("Your North Star") }}</span>
              <span class="yearly__north-chevron" aria-hidden="true">▾</span>
            </button>
            <div v-if="northStarOpen" class="yearly__north-body">
              <p class="yearly__north-overview">{{ northStar.overview }}</p>
              <ul class="yearly__north-highlights">
                <li v-for="highlight in northStar.highlights" :key="highlight">
                  {{ highlight }}
                </li>
              </ul>
            </div>
          </section>

          <div class="reveal-actions">
            <DrawAgainBar back-to="/tarot" @draw-again="drawAgain" />
          </div>
        </section>
      </Transition>

      <Transition name="idle">
        <div v-if="phase === 'initial'" class="screen__idle yearly__idle">
          <div class="yearly__intro">
            <p class="yearly__eyebrow">{{ ui("A map of the year ahead") }}</p>
            <p class="screen__intro">{{ ui("Five cards for the next 12 months — your overview, love, career, finance and health. Swipe through each aspect at your own pace.") }}</p>
          </div>
          <svg
            class="yearly__preview"
            viewBox="0 0 100 100"
            role="img"
            :aria-label='ui("Five-card spread preview")'
          >
            <polyline points="50,14 14,50 86,50 32,88 68,88 50,14" class="yearly__preview-path" />
            <circle
              v-for="(p, i) in CONSTELLATION_POINTS"
              :key="i"
              :cx="p.x"
              :cy="p.y"
              r="2.4"
              class="yearly__preview-star"
            />
          </svg>
          <PrimaryButton @click="startDraw">{{ ui("Draw My Year") }}</PrimaryButton>
        </div>
      </Transition>
    </ScreenContent>

    <Transition name="sheet">
      <div v-if="detailReading" class="yearly-sheet" @click.self="detailIndex = null">
        <div class="yearly-sheet__panel" role="dialog" aria-modal="true" :aria-label='ui("Card detail")'>
          <button
            type="button"
            class="yearly-sheet__close"
            :aria-label='ui("Close")'
            @click="detailIndex = null"
          >
            ✕
          </button>
          <CardSlotLabel :label="detailReading.label" />
          <img :src="detailReading.card.image" :alt="detailReading.card.name" class="yearly-sheet__image" />
          <h2 class="yearly-sheet__title">{{ detailReading.card.name }}</h2>
          <div class="yearly-sheet__sections">
            <section class="yearly-sheet__section">
              <h3>{{ ui("Energy") }}</h3>
              <p>{{ detailReading.energy }}</p>
            </section>
            <section class="yearly-sheet__section">
              <h3>{{ ui("What to nurture") }}</h3>
              <p>{{ detailReading.nurture }}</p>
            </section>
            <section class="yearly-sheet__section">
              <h3>{{ ui("What to watch") }}</h3>
              <p>{{ detailReading.watch }}</p>
            </section>
          </div>
          <p v-if="detailIndex === 3" class="yearly-sheet__disclaimer">{{ ui("For reflection only — this is not financial advice.") }}</p>
          <p v-else-if="detailIndex === 4" class="yearly-sheet__disclaimer">{{ ui("For reflection only — this is not medical advice.") }}</p>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.yearly__idle {
  padding-bottom: var(--space-2);
}

.yearly__intro {
  display: grid;
  gap: var(--space-2);
}

.yearly__eyebrow {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 1.2px;
  text-align: center;
  text-transform: uppercase;
}

.yearly__preview {
  width: min(58vw, 220px);
  height: min(58vw, 220px);
  overflow: visible;
  flex-shrink: 0;
}

.yearly__preview-path {
  fill: none;
  stroke: rgba(232, 200, 116, 0.5);
  stroke-width: 1.2;
  stroke-dasharray: 10 8;
  animation: preview-draw 3.4s linear infinite;
}

.yearly__preview-star {
  fill: var(--color-gold);
  opacity: 0.85;
  animation: star-twinkle 2.4s ease-in-out infinite;
}

@keyframes preview-draw {
  from { stroke-dashoffset: 140; }
  to { stroke-dashoffset: 0; }
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
}

.yearly {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}

.yearly__period {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 1.2px;
  text-align: center;
  text-transform: uppercase;
}

.yearly__carousel-wrap {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.yearly__carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-4) calc(50% - min(36vw, 135px));
  scrollbar-width: none;
}

.yearly__carousel::-webkit-scrollbar {
  display: none;
}

.yearly__slide {
  flex: 0 0 min(72vw, 270px);
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  opacity: 0.52;
  transform: scale(0.9);
  transition: opacity 220ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  -webkit-tap-highlight-color: transparent;
}

.yearly__slide--active {
  opacity: 1;
  transform: scale(1);
}

.yearly__slide-image {
  width: 100%;
  aspect-ratio: 300 / 420;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(232, 200, 116, 0.25);
  transition: border-color 220ms ease, box-shadow 220ms ease, transform 200ms ease;
}

.yearly__slide--active .yearly__slide-image {
  border-color: rgba(232, 200, 116, 0.58);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.5), 0 0 24px rgba(232, 200, 116, 0.18);
}

.yearly__slide:active .yearly__slide-image {
  transform: scale(0.985);
}

.yearly__slide-aspect {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.yearly__slide-name {
  font-size: 17px;
  color: var(--color-text);
  text-align: center;
  line-height: 1.3;
}

.yearly__nav {
  position: absolute;
  top: calc(var(--space-4) + min(50.4vw, 189px));
  transform: translateY(-50%);
  z-index: 2;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  color: var(--color-gold);
  font-size: 21px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  -webkit-tap-highlight-color: transparent;
}

.yearly__nav--prev {
  left: 4px;
}

.yearly__nav--next {
  right: 4px;
}

.yearly__nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.yearly__nav:not(:disabled):active {
  filter: brightness(1.2);
}

.yearly__counter {
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 1px;
  text-align: center;
}

.yearly__dots {
  position: relative;
  width: 140px;
  height: 82px;
}

.yearly__dots-path {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.yearly__dots-path polyline {
  fill: none;
  stroke: rgba(232, 200, 116, 0.45);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.yearly__dot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 11px;
  height: 11px;
  padding: 0;
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-full);
  background: transparent;
  opacity: 0.4;
  cursor: pointer;
  transition: opacity 200ms ease, background 200ms ease, box-shadow 200ms ease, transform 200ms ease;
  -webkit-tap-highlight-color: transparent;
}

.yearly__dot--visited {
  opacity: 0.8;
  background: var(--color-gold-soft);
}

.yearly__dot--active {
  opacity: 1;
  background: var(--color-gold);
  box-shadow: 0 0 12px rgba(232, 200, 116, 0.85);
  transform: translate(-50%, -50%) scale(1.35);
}

.yearly__north {
  width: min(100%, 520px);
  border: 1px solid rgba(232, 200, 116, 0.3);
  border-radius: var(--radius-lg);
  background: linear-gradient(150deg, rgba(49, 43, 112, 0.4), var(--color-surface-raised));
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.yearly__north-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-gold);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.yearly__north-title {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.6px;
}

.yearly__north-chevron {
  font-size: 13px;
  opacity: 0.8;
  transition: transform 200ms ease;
}

.yearly__north-toggle[aria-expanded='true'] .yearly__north-chevron {
  transform: rotate(180deg);
}

.yearly__north-body {
  display: grid;
  gap: var(--space-3);
  padding: 0 var(--space-4) var(--space-4);
  border-top: 1px solid rgba(232, 200, 116, 0.2);
  padding-top: var(--space-3);
}

.yearly__north-overview {
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.65;
}

.yearly__north-highlights {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-left: var(--space-4);
  color: var(--color-text-muted);
  font-size: 12.5px;
  line-height: 1.6;
}

.yearly-sheet {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(10, 5, 25, 0.68);
}

.yearly-sheet__panel {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 460px;
  max-height: 82vh;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  overflow-y: auto;
  padding: var(--space-5) var(--space-4) var(--space-6);
  border: 1px solid rgba(232, 200, 116, 0.3);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-lg);
  -webkit-overflow-scrolling: touch;
}

.yearly-sheet__close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}

.yearly-sheet__image {
  width: min(64vw, 250px);
  max-width: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.yearly-sheet__title {
  font-size: 22px;
  color: var(--color-gold);
}

.yearly-sheet__sections {
  width: 100%;
  display: grid;
  gap: var(--space-3);
}

.yearly-sheet__section {
  padding-left: var(--space-3);
  border-left: 2px solid rgba(232, 200, 116, 0.45);
}

.yearly-sheet__section h3 {
  margin-bottom: var(--space-1);
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 13px;
}

.yearly-sheet__section p {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.65;
}

.yearly-sheet__disclaimer {
  width: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
}

.result-enter-active,
.result-leave-active {
  transition: opacity 300ms ease;
}

.result-enter-from,
.result-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 250ms ease;
}

.sheet-enter-active .yearly-sheet__panel,
.sheet-leave-active .yearly-sheet__panel {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .yearly-sheet__panel,
.sheet-leave-to .yearly-sheet__panel {
  transform: translateY(40px);
}

@media (prefers-reduced-motion: reduce) {
  .yearly__preview-path,
  .yearly__preview-star {
    animation: none;
  }

  .yearly__slide,
  .yearly__slide-image {
    transition: none;
  }

  .result-enter-active,
  .result-leave-active,
  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active .yearly-sheet__panel,
  .sheet-leave-active .yearly-sheet__panel {
    transition: none;
  }

  .result-enter-from,
  .result-leave-to,
  .sheet-enter-from,
  .sheet-leave-to {
    opacity: 0;
  }

  .sheet-enter-from .yearly-sheet__panel,
  .sheet-leave-to .yearly-sheet__panel {
    transform: none;
  }
}
</style>
