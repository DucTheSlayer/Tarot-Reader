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
    previewCaptions?: string[]
    previewContext?: 'single' | 'exploring' | 'relationship' | ''
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
const resultScrollOffset = ref(0)

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
  resultScrollOffset.value = 0
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

  if (props.variant === 'open-question') {
    const startX =
      index === 0 ? -target.w - 20 : index === 2 ? window.innerWidth + 20 : target.x
    const startY = index === 1 ? window.innerHeight + target.h * 0.15 : target.y + 34

    item.style = {
      left: '0px',
      top: '0px',
      width: `${target.w}px`,
      transform: `translate(${startX}px, ${startY}px) scale(0.9)`,
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
      timers.push(setTimeout(() => {
        flyCards.value[i].flipped = true
        emit('cardRevealed', i)
      }, delay + step))
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

const flippedCount = computed(() => flyCards.value.filter((card) => card.flipped).length)
const currentProgressIndex = computed(() =>
  Math.min(flippedCount.value, Math.max(deck.value.length - 1, 0))
)

const moneyPath = computed(() => cardCenters.value.map(({ x, y }) => `${x},${y}`).join(' '))

const resultCardOpacity = computed(() =>
  Math.max(0, Math.min(1, 1 - resultScrollOffset.value / 140))
)

const revealedCardsTappable = computed(() =>
  stage.value === 'revealed' &&
  resultScrollOffset.value < 88 &&
  (!!props.captions || props.variant === 'open-question')
)

const resultOverlayStyle = computed(() => ({
  transform: `translateY(-${resultScrollOffset.value}px)`,
  opacity: resultCardOpacity.value
}))

function onRevealScroll(event: Event) {
  resultScrollOffset.value = (event.currentTarget as HTMLElement).scrollTop
}

function onFlyTap(index: number) {
  if (!revealedCardsTappable.value) return

  if (props.variant === 'open-question') {
    const fc = flyCards.value[index]
    if (!fc || flipping.has(index)) return
    if (fc.flipped) {
      emit('cardTap', index)
      return
    }
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
    class="draw-source"
    :class="[
      `draw-source--${variant}`,
      previewContext ? `draw-source--${previewContext}` : '',
      { 'draw-source--animating': active || stage !== 'idle' }
    ]"
    aria-hidden="true"
  >
    <div class="draw-source__glow"></div>

    <template v-if="variant === 'yes-no'">
      <div class="oracle-ring oracle-ring--outer"></div>
      <div class="oracle-ring oracle-ring--inner"></div>
      <span v-for="i in 8" :key="i" class="oracle-mark" :style="{ transform: `rotate(${(i - 1) * 45}deg)` }">✦</span>
      <img src="/cards/back.svg" alt="" class="source-card source-card--oracle" :ref="setSourceCard" />
    </template>

    <template v-else-if="variant === 'love'">
      <svg class="source-path source-path--love" viewBox="0 0 320 180">
        <path d="M62 68 Q160 155 258 68" />
      </svg>
      <div v-for="i in 3" :key="i" class="source-slot source-slot--love" :class="`source-slot--${i - 1}`">
        <img src="/cards/back.svg" alt="" class="source-card" :ref="i === 2 ? setSourceCard : undefined" />
        <span v-if="previewCaptions?.[i - 1]" class="source-caption">{{ ui(previewCaptions[i - 1]) }}</span>
      </div>
    </template>

    <template v-else-if="variant === 'money'">
      <svg class="source-path source-path--money" viewBox="0 0 320 180">
        <path d="M43 122 C105 80 195 136 277 68" />
      </svg>
      <div v-for="i in 3" :key="i" class="source-slot source-slot--money" :class="`source-slot--${i - 1}`">
        <span class="source-node"></span>
        <img src="/cards/back.svg" alt="" class="source-card" :ref="i === 2 ? setSourceCard : undefined" />
        <span v-if="previewCaptions?.[i - 1]" class="source-caption">{{ ui(previewCaptions[i - 1]) }}</span>
      </div>
    </template>

    <template v-else-if="variant === 'open-question'">
      <div v-for="i in 3" :key="i" class="source-slot source-slot--window" :class="`source-slot--${i - 1}`">
        <span class="source-halo"></span>
        <img src="/cards/back.svg" alt="" class="source-card" :ref="i === 2 ? setSourceCard : undefined" />
      </div>
    </template>

    <template v-else>
      <img
        v-for="(angle, i) in fanAngles"
        :key="i"
        src="/cards/back.svg"
        alt=""
        class="source-card source-card--fan"
        :ref="i === centerIndex ? setSourceCard : undefined"
        :style="{ transform: `rotate(${angle}deg)` }"
      />
    </template>
  </div>

  <svg
    v-if="stage === 'revealed' && variant === 'love' && cardCenters.length === 3"
    class="spread-decoration spread-decoration--love"
    :style="resultOverlayStyle"
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
    :style="resultOverlayStyle"
    aria-hidden="true"
  >
    <polyline :points="moneyPath" />
  </svg>

  <p v-if="stage === 'fly' && variant === 'love' && captions?.length" class="draw-progress">
    {{ ui('Card {current} of {total} · {label}', {
      current: Math.min(flippedCount + 1, deck.length),
      total: deck.length,
      label: ui(captions[currentProgressIndex].label)
    }) }}
  </p>

  <div
    v-for="(fc, i) in flyCards"
    :key="i"
    class="fly"
    :class="[
      `fly--${variant}`,
      `fly--slot-${i}`,
      {
        'fly--tappable': revealedCardsTappable,
        'fly--flipped': fc.flipped
      }
    ]"
    :style="[
      fc.style,
      stage === 'revealed'
        ? { translate: `0 -${resultScrollOffset}px`, opacity: resultCardOpacity }
        : undefined
    ]"
    :aria-hidden="revealedCardsTappable ? undefined : 'true'"
    :role="revealedCardsTappable ? 'button' : undefined"
    :tabindex="revealedCardsTappable ? 0 : undefined"
    @click="onFlyTap(i)"
    @keydown.enter.prevent="onFlyTap(i)"
    @keydown.space.prevent="onFlyTap(i)"
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

  <div
    v-if="stage === 'revealed'"
    class="reveal"
    :style="{ '--reveal-top': `${revealTop}px` }"
    @scroll.passive="onRevealScroll"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.draw-source {
  position: relative;
  width: min(100%, 360px);
  height: 190px;
  animation: fan-float 4s ease-in-out infinite;
  will-change: transform;
  margin-inline: auto;
}

.draw-source--animating {
  animation: none;
}

.draw-source__glow {
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

.draw-source--animating .draw-source__glow {
  animation: none;
  opacity: 0.3;
}

.draw-source--love .draw-source__glow {
  background: radial-gradient(closest-side, rgba(172, 76, 126, 0.38), rgba(226, 164, 194, 0.18) 56%, transparent 80%);
}

.draw-source--money .draw-source__glow {
  background: radial-gradient(closest-side, rgba(33, 126, 99, 0.34), rgba(210, 166, 94, 0.14) 56%, transparent 80%);
}

.draw-source--yes-no .draw-source__glow {
  background: radial-gradient(closest-side, rgba(156, 139, 202, 0.3), rgba(224, 215, 236, 0.12) 56%, transparent 80%);
}

.draw-source--open-question .draw-source__glow {
  background: radial-gradient(closest-side, rgba(68, 116, 170, 0.32), rgba(177, 199, 224, 0.12) 56%, transparent 80%);
}

.draw-source--yearly .draw-source__glow {
  background: radial-gradient(closest-side, rgba(108, 83, 180, 0.34), rgba(232, 200, 116, 0.19) 56%, transparent 80%);
}

.source-card {
  display: block;
  width: 100%;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
}

.source-card--fan {
  position: absolute;
  left: calc(50% - 56px);
  bottom: 0;
  z-index: 1;
  width: 112px;
  max-width: 28vw;
  transform-origin: bottom center;
  opacity: 1;
  transition: opacity 400ms ease;
}

.draw-source--animating .source-card,
.draw-source--animating .source-slot,
.draw-source--animating .source-path,
.draw-source--animating .source-node,
.draw-source--animating .source-halo,
.draw-source--animating .oracle-ring,
.draw-source--animating .oracle-mark {
  opacity: 0;
}

/* The preview must disappear in the same render that starts a draw. Keeping
   its layout box lets us measure the launch point without flashing old slots. */
.draw-source--animating .source-slot,
.draw-source--animating .source-path,
.draw-source--animating .source-card--oracle {
  visibility: hidden;
  transition: none;
}

.source-slot {
  position: absolute;
  z-index: 2;
  width: 74px;
  opacity: 1;
  transition: opacity 220ms ease, transform 360ms ease;
}

.source-caption {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  width: 106px;
  transform: translateX(-50%);
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 9px;
  line-height: 1.25;
  letter-spacing: 0.35px;
  text-align: center;
}

.source-path {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;
  transition: opacity 360ms ease;
}

.source-path path {
  fill: none;
  stroke-linecap: round;
}

.source-slot--love.source-slot--0 { left: 27px; top: 20px; transform: rotate(-7deg); }
.source-slot--love.source-slot--1 { left: calc(50% - 37px); top: 58px; }
.source-slot--love.source-slot--2 { right: 27px; top: 20px; transform: rotate(7deg); }
.source-path--love path {
  stroke: rgba(226, 164, 194, 0.58);
  stroke-width: 1.4;
  stroke-dasharray: 7 7;
  filter: drop-shadow(0 0 7px rgba(226, 164, 194, 0.7));
  animation: love-thread-flow 2.4s linear infinite;
}
.source-slot--love { animation: love-slot-pulse 3.2s ease-in-out infinite; }
.source-slot--love.source-slot--1 { animation-delay: -1.05s; }
.source-slot--love.source-slot--2 { animation-delay: -2.1s; }
.draw-source--single .source-slot--love.source-slot--0 { left: calc(50% - 37px); top: 14px; transform: none; }
.draw-source--single .source-slot--love.source-slot--1 { left: 38px; top: 65px; transform: rotate(-8deg); }
.draw-source--single .source-slot--love.source-slot--2 { right: 38px; top: 65px; transform: rotate(8deg); }
.draw-source--exploring .source-slot--love.source-slot--1 { top: 68px; }

.source-slot--money.source-slot--0 { left: 25px; top: 71px; }
.source-slot--money.source-slot--1 { left: calc(50% - 37px); top: 47px; }
.source-slot--money.source-slot--2 { right: 25px; top: 18px; }
.source-slot--money .source-caption { top: calc(100% + 19px); }
.source-path--money path {
  stroke: rgba(92, 205, 165, 0.56);
  stroke-width: 2;
  stroke-dasharray: 5 7;
  animation: money-path-flow 1.5s linear infinite;
}
.source-node { position: absolute; left: 50%; bottom: -10px; width: 8px; height: 8px; border: 1px solid #d2a65e; border-radius: 50%; transform: translateX(-50%); background: #17372f; box-shadow: 0 0 10px rgba(92, 205, 165, 0.7); transition: opacity 360ms ease; animation: money-node-pulse 1.8s ease-in-out infinite; }
.source-slot--money.source-slot--1 .source-node { animation-delay: -0.6s; }
.source-slot--money.source-slot--2 .source-node { animation-delay: -1.2s; }

.source-slot--window { top: 40px; }
.source-slot--window.source-slot--0 { left: 26px; }
.source-slot--window.source-slot--1 { left: calc(50% - 37px); top: 24px; }
.source-slot--window.source-slot--2 { right: 26px; }
.source-halo { position: absolute; inset: -16px; z-index: -1; border: 1px solid rgba(164, 196, 235, 0.26); border-radius: 50%; background: radial-gradient(circle, rgba(103, 153, 211, 0.2), transparent 66%); transition: opacity 360ms ease; animation: window-halo 2.6s ease-in-out infinite; }
.source-slot--window.source-slot--1 .source-halo { animation-delay: -0.85s; }
.source-slot--window.source-slot--2 .source-halo { animation-delay: -1.7s; }

.draw-source--yes-no { height: 216px; }
.source-card--oracle { position: absolute; left: calc(50% - 52px); top: 22px; z-index: 3; width: 104px; }
.oracle-ring { position: absolute; left: 50%; top: 50%; border: 1px solid rgba(216, 198, 241, 0.34); border-radius: 50%; transform: translate(-50%, -50%); transition: opacity 360ms ease; }
.oracle-ring--outer { width: 210px; height: 210px; animation: oracle-turn 16s linear infinite; }
.oracle-ring--inner { width: 166px; height: 166px; border-style: dashed; animation: oracle-turn 12s linear infinite reverse; }
.oracle-mark { position: absolute; left: calc(50% - 5px); top: 1px; width: 10px; height: 214px; color: rgba(230, 199, 107, 0.54); font-size: 10px; text-align: center; transform-origin: 5px 107px; transition: opacity 360ms ease; }

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

.draw-progress {
  position: fixed;
  left: 50%;
  bottom: calc(var(--space-5) + env(safe-area-inset-bottom));
  z-index: 55;
  width: max-content;
  max-width: calc(100vw - 32px);
  padding: 7px 14px;
  border: 1px solid rgba(226, 164, 194, 0.3);
  border-radius: var(--radius-full);
  transform: translateX(-50%);
  background: rgba(35, 15, 53, 0.84);
  color: #efd6df;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-align: center;
  backdrop-filter: blur(8px);
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

.fly--open-question.fly--slot-0.fly--flipped .fly__face--front {
  animation: past-card-reveal 620ms ease-out;
}

.fly--open-question.fly--slot-1.fly--flipped .fly__face--front {
  animation: present-card-reveal 620ms ease-out;
}

.fly--open-question.fly--slot-2.fly--flipped .fly__face--front {
  animation: future-card-reveal 620ms ease-out;
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
  top: 0;
  bottom: 0;
  z-index: 40;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding:
    var(--reveal-top, 0px)
    var(--space-4)
    calc(72px + env(safe-area-inset-bottom));
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

@keyframes oracle-turn {
  to { transform: translate(-50%, -50%) rotate(360deg); }
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

@keyframes love-thread-flow {
  to { stroke-dashoffset: -28; }
}

@keyframes love-slot-pulse {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(226, 164, 194, 0)); }
  50% { filter: drop-shadow(0 0 9px rgba(226, 164, 194, 0.35)); }
}

@keyframes money-path-flow {
  to { stroke-dashoffset: -24; }
}

@keyframes money-node-pulse {
  0%, 100% { transform: translateX(-50%) scale(0.82); opacity: 0.55; }
  50% { transform: translateX(-50%) scale(1.25); opacity: 1; }
}

@keyframes window-halo {
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 0.95; transform: scale(1.08); }
}

@keyframes past-card-reveal {
  0%, 100% { box-shadow: var(--shadow-lg); }
  45% { box-shadow: -10px 0 28px rgba(116, 158, 210, 0.62); }
}

@keyframes present-card-reveal {
  0%, 100% { box-shadow: var(--shadow-lg); }
  45% { box-shadow: 0 0 30px rgba(242, 215, 142, 0.7); }
}

@keyframes future-card-reveal {
  0%, 100% { box-shadow: var(--shadow-lg); }
  45% { box-shadow: 10px 0 28px rgba(161, 126, 222, 0.68); }
}

@media (prefers-reduced-motion: reduce) {
  .draw-source,
  .draw-source__glow,
  .oracle-ring,
  .spread-decoration line,
  .spread-decoration polyline,
  .fly__face--front,
  .source-path path,
  .source-slot,
  .source-node,
  .source-halo {
    animation: none;
  }

  .spread-decoration line,
  .spread-decoration polyline {
    stroke-dashoffset: 0;
  }
}
</style>
