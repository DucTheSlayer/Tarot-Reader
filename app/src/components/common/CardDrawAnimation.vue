<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import { getYearlyLayout } from '../../data/yearlyLayout'
import { getThreeCardTriangleLayout } from '../../data/threeCardLayout'

const props = withDefaults(
  defineProps<{
    card?: TarotCard | null
    cards?: TarotCard[]
    active?: boolean
    revealOnMount?: boolean
    fanSize?: number
    flyDuration?: number
    holdDuration?: number
    flipDuration?: number
    captions?: { label: string; name: string }[]
    layout?: 'row' | 'triangle'
    variant?: 'default' | 'daily' | 'yes-no' | 'love' | 'money' | 'open-question' | 'yearly'
  }>(),
  {
    active: false,
    revealOnMount: false,
    fanSize: 5,
    flyDuration: 600,
    holdDuration: 450,
    flipDuration: 750,
    layout: 'row',
    variant: 'default'
  }
)

const emit = defineEmits<{ revealed: []; cardTap: [index: number]; cardRevealed: [index: number] }>()

type Stage = 'idle' | 'fly' | 'flip' | 'revealed'
const stage = ref<Stage>('idle')

interface FlyingCard {
  card: TarotCard
  target: { x: number; y: number; w: number; h: number }
  flying: boolean
  flipped: boolean
  style: Record<string, string>
}

const flyCards = ref<FlyingCard[]>([])

// Các lá đang trong lúc flip — khóa tap để tránh double event (open-question variant)
const flipping = new Set<number>()

const sourceCardEl = ref<HTMLElement | null>(null)

function setSourceCard(el: unknown) {
  sourceCardEl.value = (el as HTMLElement) || null
}

const reduceMotion =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const deck = computed<TarotCard[]>(() =>
  props.cards && props.cards.length ? props.cards : props.card ? [props.card] : []
)

const centerIndex = computed(() => Math.floor((props.fanSize - 1) / 2))

const fanAngles = computed(() => {
  const step = props.fanSize > 4 ? 12 : 16
  return Array.from(
    { length: props.fanSize },
    (_, i) => (i - (props.fanSize - 1) / 2) * step
  )
})

let timers: ReturnType<typeof setTimeout>[] = []

function clearTimers() {
  timers.forEach((t) => clearTimeout(t))
  timers = []
}

function reset() {
  clearTimers()
  flipping.clear()
  stage.value = 'idle'
  flyCards.value = []
}

watch(
  () => props.card,
  (c) => {
    if (!c) reset()
  }
)

watch(
  () => props.cards,
  (c) => {
    if (!c || !c.length) reset()
  }
)

watch(
  () => props.active,
  (on, was) => {
    if (on && !was && stage.value === 'idle') start()
  }
)

function targetGeometry() {
  const w = Math.min(window.innerWidth * 0.5, 210)
  const h = w * 1.4
  const x = (window.innerWidth - w) / 2
  const y = Math.max(window.innerHeight * 0.31 - h / 2, 88)
  return { x, y, w, h }
}

function rowGeometry(count: number) {
  const w = Math.min(window.innerWidth * 0.26, 104)
  const h = w * 1.4
  const gap = 12
  const total = count * w + (count - 1) * gap
  const startX = (window.innerWidth - total) / 2
  const y = Math.max(window.innerHeight * 0.26 - h / 2, 72)
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (w + gap),
    y,
    w,
    h
  }))
}

function triangleGeometry() {
  const screen = sourceCardEl.value?.closest('.screen')
  const header = screen?.querySelector<HTMLElement>('.screen-header')
  const headerBottom = header?.getBoundingClientRect().bottom ?? 56
  return getThreeCardTriangleLayout(window.innerWidth, window.innerHeight, headerBottom)
}

function yearlyGeometry() {
  return getYearlyLayout(window.innerWidth, window.innerHeight)
}

function flyCardIn(
  card: TarotCard,
  target: { x: number; y: number; w: number; h: number },
  index: number
) {
  const item: FlyingCard = { card, target, flying: true, flipped: false, style: {} }
  flyCards.value[index] = item

  if (props.variant === 'love') {
    const startX =
      index === 0 ? -target.w * 0.9 : index === 1 ? window.innerWidth + target.w * 0.1 : target.x
    const startY = index === 2 ? window.innerHeight + target.h * 0.1 : target.y + 24

    item.style = {
      left: '0px',
      top: '0px',
      width: `${target.w}px`,
      transform: `translate(${startX}px, ${startY}px) scale(0.94)`,
      opacity: '0'
    }
    requestAnimationFrame(() => {
      item.style = {
        left: '0px',
        top: '0px',
        width: `${target.w}px`,
        transform: `translate(${target.x}px, ${target.y}px) scale(1)`,
        opacity: '1',
        transition: `transform ${props.flyDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease-out`
      }
    })
    return
  }

  const source = sourceCardEl.value
  if (source) {
    const rect = source.getBoundingClientRect()
    const s = rect.width / target.w
    const tx1 = rect.left - (target.w * (1 - s)) / 2
    const ty1 = rect.top - (target.h * (1 - s)) / 2
    const angle = fanAngles.value[centerIndex.value]

    item.style = {
      left: '0px',
      top: '0px',
      width: `${target.w}px`,
      transform: `translate(${tx1}px, ${ty1}px) rotate(${angle}deg) scale(${s})`,
      opacity: '0'
    }
    requestAnimationFrame(() => {
      item.style = {
        left: '0px',
        top: '0px',
        width: `${target.w}px`,
        transform: `translate(${target.x}px, ${target.y}px) rotate(0deg) scale(1)`,
        opacity: '1',
        transition: `transform ${props.flyDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease-out`
      }
    })
  } else {
    item.style = {
      left: `${target.x}px`,
      top: `${target.y}px`,
      width: `${target.w}px`,
      transform: 'rotate(0deg) scale(1)',
      opacity: '1'
    }
  }
}

function revealAll(targets: { x: number; y: number; w: number; h: number }[]) {
  flyCards.value = deck.value.map((card, i) => ({
    card,
    target: targets[i],
    flying: true,
    flipped: true,
    style: {
      left: `${targets[i].x}px`,
      top: `${targets[i].y}px`,
      width: `${targets[i].w}px`,
      transform: 'rotate(0deg)',
      opacity: '1'
    }
  }))
  stage.value = 'revealed'
  emit('revealed')
  if (props.variant === 'open-question') {
    deck.value.forEach((_, i) => emit('cardRevealed', i))
  }
}

async function start() {
  const list = deck.value
  if (!list.length) return

  const targets =
    props.layout === 'triangle' && list.length === 3
      ? triangleGeometry()
      : props.variant === 'yearly'
        ? yearlyGeometry()
        : list.length === 1
          ? [targetGeometry()]
          : rowGeometry(list.length)

  if (reduceMotion) {
    revealAll(targets)
    return
  }

  stage.value = 'fly'
  await nextTick()

  const step = props.flyDuration + props.holdDuration
  list.forEach((card, i) => {
    const delay = i * step
    if (delay === 0) {
      flyCardIn(card, targets[i], i)
    } else {
      timers.push(setTimeout(() => flyCardIn(card, targets[i], i), delay))
    }
    // open-question: lá hạ cánh vẫn úp, user tự lật bằng tap
    if (props.variant !== 'open-question') {
      timers.push(setTimeout(() => (flyCards.value[i].flipped = true), delay + step))
    }
  })

  const extra =
    props.variant === 'open-question' ? 0 : props.flipDuration
  timers.push(
    setTimeout(() => {
      stage.value = 'revealed'
      emit('revealed')
    }, (list.length - 1) * step + step + extra)
  )
}

const revealTop = computed(() => {
  if (!flyCards.value.length) return 0
  const bottom = Math.max(...flyCards.value.map((fc) => fc.target.y + fc.target.h))
  return bottom + (props.captions ? 44 : 20)
})

const cardCenters = computed(() =>
  flyCards.value.map(({ target }) => ({
    x: target.x + target.w / 2,
    y: target.y + target.h / 2
  }))
)

const moneyPath = computed(() => cardCenters.value.map(({ x, y }) => `${x},${y}`).join(' '))

function onFlyTap(index: number) {
  if (stage.value !== 'revealed') return

  if (props.variant === 'open-question') {
    const fc = flyCards.value[index]
    if (!fc || fc.flipped || flipping.has(index)) return
    flipping.add(index)
    fc.flipped = true
    emit('cardRevealed', index)
    timers.push(setTimeout(() => flipping.delete(index), props.flipDuration + 100))
    return
  }

  if (!props.captions) return
  emit('cardTap', index)
}

// Mở lần lượt các lá còn úp (open-question) — khóa tap trong lúc flip
function revealRemaining() {
  if (stage.value !== 'revealed' || props.variant !== 'open-question') return
  const pending: number[] = []
  flyCards.value.forEach((fc, i) => {
    if (!fc.flipped && !flipping.has(i)) pending.push(i)
  })
  pending.forEach((i, order) => {
    timers.push(
      setTimeout(() => {
        const fc = flyCards.value[i]
        if (!fc || fc.flipped || flipping.has(i)) return
        flipping.add(i)
        fc.flipped = true
        emit('cardRevealed', i)
        timers.push(setTimeout(() => flipping.delete(i), props.flipDuration + 100))
      }, order * 180)
    )
  })
}

defineExpose({ revealRemaining })

onMounted(() => {
  if (props.revealOnMount && props.card) {
    revealAll([targetGeometry()])
  } else if (props.active && deck.value.length) {
    start()
  }
})

onUnmounted(clearTimers)
</script>

<template>
  <div
    class="fan"
    :class="[`fan--${variant}`, { 'fan--animating': stage !== 'idle' }]"
    aria-hidden="true"
  >
    <div class="fan__glow"></div>
    <img
      v-for="(angle, i) in fanAngles"
      :key="i"
      src="/cards/back.svg"
      alt=""
      class="fan__card"
      :ref="i === centerIndex ? setSourceCard : undefined"
      :style="{ transform: `rotate(${angle}deg)` }"
    />
  </div>

  <svg
    v-if="stage === 'revealed' && variant === 'love' && cardCenters.length === 3"
    class="spread-decoration spread-decoration--love"
    aria-hidden="true"
  >
    <line
      :x1="cardCenters[0].x"
      :y1="cardCenters[0].y"
      :x2="cardCenters[1].x"
      :y2="cardCenters[1].y"
    />
    <line
      :x1="cardCenters[1].x"
      :y1="cardCenters[1].y"
      :x2="cardCenters[2].x"
      :y2="cardCenters[2].y"
    />
    <line
      :x1="cardCenters[2].x"
      :y1="cardCenters[2].y"
      :x2="cardCenters[0].x"
      :y2="cardCenters[0].y"
    />
  </svg>

  <svg
    v-if="stage === 'revealed' && variant === 'money' && cardCenters.length === 3"
    class="spread-decoration spread-decoration--money"
    aria-hidden="true"
  >
    <polyline :points="moneyPath" />
  </svg>

  <div
    v-for="(fc, i) in flyCards"
    :key="i"
    class="fly"
    :class="[
      `fly--${variant}`,
      {
        'fly--tappable': (captions || variant === 'open-question') && stage === 'revealed',
        'fly--flipped': fc.flipped
      }
    ]"
    :style="fc.style"
    :aria-hidden="(captions || variant === 'open-question') && stage === 'revealed' ? undefined : 'true'"
    :role="(captions || variant === 'open-question') && stage === 'revealed' ? 'button' : undefined"
    @click="onFlyTap(i)"
  >
    <div class="fly__card" :class="{ 'fly__card--flipped': fc.flipped }">
      <div class="fly__face fly__face--back">
        <img src="/cards/back.svg" alt="" />
      </div>
      <div class="fly__face fly__face--front">
        <img :src="fc.card.image" :alt="fc.card.name" />
      </div>
    </div>
    <div v-if="captions && fc.flipped" class="fly__caption">
      <span class="fly__caption-label">{{ ui(captions[i].label) }}</span>
    </div>
  </div>

  <div v-if="stage === 'revealed'" class="reveal" :style="{ top: `${revealTop}px` }">
    <slot></slot>
  </div>
</template>

<style scoped>
.fan {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 190px;
  animation: fan-float 4s ease-in-out infinite;
  will-change: transform;
}

.fan--animating {
  animation: none;
}

.fan__glow {
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: min(330px, 90%);
  height: 220px;
  border-radius: 50%;
  transform: translateX(-50%);
  background: radial-gradient(
    closest-side,
    rgba(139, 92, 246, 0.32),
    rgba(230, 199, 107, 0.16) 55%,
    transparent 78%
  );
  filter: blur(26px);
  animation: fan-glow 3.6s ease-in-out infinite;
  transition: opacity 400ms ease;
  pointer-events: none;
  z-index: 0;
}

.fan--animating .fan__glow {
  animation: none;
  opacity: 0.3;
}

.fan__card {
  position: relative;
  z-index: 1;
  width: 112px;
  max-width: 28vw;
  margin: 0 -26px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  transform-origin: bottom center;
  opacity: 1;
  transition: opacity 400ms ease;
}

.fan--animating .fan__card {
  opacity: 0;
}

.fly {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  perspective: 1000px;
  will-change: transform;
  pointer-events: none;
}

.spread-decoration {
  position: fixed;
  inset: 0;
  z-index: 45;
  width: 100vw;
  height: 100vh;
  overflow: visible;
  pointer-events: none;
}

.spread-decoration--love line {
  stroke: var(--color-gold);
  stroke-opacity: 0.42;
  stroke-width: 1.5;
  stroke-dasharray: 420;
  stroke-dashoffset: 420;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--color-primary) 72%, transparent));
  animation: trace-connection 720ms ease-out forwards;
}

.spread-decoration--money polyline {
  fill: none;
  stroke: rgba(227, 197, 111, 0.52);
  stroke-width: 2;
  stroke-dasharray: 520;
  stroke-dashoffset: 520;
  filter: drop-shadow(0 0 7px rgba(227, 197, 111, 0.55));
  animation: trace-progress 680ms ease-out forwards;
}

.fly--tappable {
  pointer-events: auto;
  cursor: pointer;
}

.fly__caption {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.fly__caption-label {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-gold);
  opacity: 0.85;
}

.fly__card {
  position: relative;
  width: 100%;
  aspect-ratio: 300 / 420;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}

.fly__card--flipped {
  transform: rotateY(180deg);
}

.fly__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.fly__face img {
  width: 100%;
  height: 100%;
  display: block;
}

.fly__face--front {
  transform: rotateY(180deg);
}

.fly--love.fly--flipped .fly__face--front {
  animation: love-card-glow 720ms ease-out;
}

.fly--money.fly--flipped .fly__face--front {
  animation: money-card-flash 520ms ease-out;
}

.fly--yearly.fly--flipped .fly__face--front {
  animation: yearly-card-glow 620ms ease-out;
}

.fly--love .fly__caption-label {
  color: var(--color-gold);
}

.fly--money .fly__caption-label {
  color: #e3c56f;
}

.fly--yearly .fly__caption-label {
  color: #e8c874;
}

.reveal {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom));
}

@keyframes fan-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes fan-glow {
  0%,
  100% {
    opacity: 0.55;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.95;
    transform: translateX(-50%) scale(1.07);
  }
}

@keyframes trace-connection {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes trace-progress {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes love-card-glow {
  0%,
  100% {
    box-shadow: var(--shadow-lg);
  }
  45% {
    box-shadow: 0 0 28px color-mix(in srgb, var(--color-primary) 64%, transparent);
  }
}

@keyframes money-card-flash {
  0%,
  100% {
    box-shadow: var(--shadow-lg);
  }
  35% {
    box-shadow: 0 0 24px rgba(227, 197, 111, 0.7);
  }
}

@keyframes yearly-card-glow {
  0%,
  100% {
    box-shadow: var(--shadow-lg);
  }
  45% {
    box-shadow: 0 0 26px rgba(232, 200, 116, 0.62);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fan,
  .fan__glow,
  .spread-decoration line,
  .spread-decoration polyline,
  .fly__face--front {
    animation: none;
  }

  .spread-decoration line,
  .spread-decoration polyline {
    stroke-dashoffset: 0;
  }
}
</style>
