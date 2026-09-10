<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, ref } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import { buildOpenQuestionSummary } from '../../data/spreadReadings'
import { useDrawCards } from '../../composables/useDrawCards'
import QuestionInput from '../../components/common/QuestionInput.vue'
import CardDrawAnimation from '../../components/common/CardDrawAnimation.vue'
import CardResultItem from '../../components/common/CardResultItem.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'

type Phase = 'initial' | 'drawing' | 'revealing' | 'result'

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const question = ref('')
const cards = ref<TarotCard[]>([])
const revealedCount = ref(0)
const detailIndex = ref<number | null>(null)

const animationRef = ref<InstanceType<typeof CardDrawAnimation> | null>(null)

const trimmedQuestion = computed(() => question.value.trim())
const canStart = computed(() => trimmedQuestion.value.length > 0)
const allRevealed = computed(() => revealedCount.value >= cards.value.length)
const combinedMessage = computed(() => buildOpenQuestionSummary(cards.value))

function startDraw() {
  if (!canStart.value || phase.value !== 'initial') return
  cards.value = draw(3)
  revealedCount.value = 0
  phase.value = 'drawing'
}

function onRevealed() {
  phase.value = 'revealing'
}

function onCardRevealed() {
  revealedCount.value += 1
  if (allRevealed.value) {
    phase.value = 'result'
  }
}

function onCardTap(index: number) {
  if (phase.value === 'result') {
    detailIndex.value = index
  }
}

function revealAll() {
  animationRef.value?.revealRemaining()
}

function drawAgain() {
  cards.value = draw(3)
  revealedCount.value = 0
  detailIndex.value = null
  phase.value = 'drawing'
}

function changeQuestion() {
  cards.value = []
  revealedCount.value = 0
  detailIndex.value = null
  phase.value = 'initial'
}
</script>

<template>
  <main class="screen themed-result-screen themed-result-screen--open" :class="{ 'themed-result-screen--active': phase === 'result' }">
    <ScreenHeader :title='ui("3 Card Spread")' back-to="/tarot" />
    <ScreenContent :spread="phase === 'initial'">
      <CardDrawAnimation
        ref="animationRef"
        :cards="cards"
        :active="phase === 'drawing'"
        variant="open-question"
        layout="triangle"
        :fly-duration="360"
        :hold-duration="180"
        :flip-duration="520"
        @revealed="onRevealed"
        @card-revealed="onCardRevealed"
        @card-tap="onCardTap"
      >
        <template v-if="cards.length">
          <p v-if="trimmedQuestion" class="screen__question reveal-item reveal-item--1">
            “{{ trimmedQuestion }}”
          </p>

          <template v-if="phase === 'revealing'">
            <p class="spread__progress reveal-item reveal-item--2">
              {{ ui('Revealed {count} of 3', { count: revealedCount }) }}
            </p>
            <button
              v-if="!allRevealed"
              type="button"
              class="spread__reveal-all reveal-item reveal-item--3"
              @click="revealAll"
            >{{ ui("Reveal All") }}</button>
          </template>

          <template v-else-if="phase === 'result'">
            <section class="spread__message reveal-item reveal-item--2">
              <p class="spread__message-eyebrow">{{ ui("Combined message") }}</p>
              <p class="spread__message-body">{{ combinedMessage }}</p>
            </section>
            <p class="spread__hint reveal-item reveal-item--3">{{ ui("Tap a card to see its meaning") }}</p>
            <div class="reveal-item reveal-item--4 reveal-actions">
              <DrawAgainBar
                back-to="/tarot"
                change-question
                @draw-again="drawAgain"
                @change-question="changeQuestion"
              />
            </div>
          </template>
        </template>
      </CardDrawAnimation>

      <Transition name="idle">
        <div v-if="phase === 'initial'" class="screen__idle spread__idle">
          <p class="screen__intro">{{ ui("Ask an open question — three cards offer a perspective to reflect on, not a fixed answer.") }}</p>
          <QuestionInput
            v-model="question"
            :label='ui("Your question")'
            :placeholder='ui("What should I understand about this situation?")'
            :maxlength="160"
          />
          <PrimaryButton :disabled="!canStart" @click="startDraw">{{ ui("Draw Cards") }}</PrimaryButton>
        </div>
      </Transition>
    </ScreenContent>

    <Transition name="sheet">
      <div v-if="detailIndex !== null" class="spread-sheet" @click.self="detailIndex = null">
        <div class="spread-sheet__panel" role="dialog" aria-modal="true" :aria-label='ui("Card detail")'>
          <button
            type="button"
            class="spread-sheet__close"
            :aria-label='ui("Close")'
            @click="detailIndex = null"
          >
            ✕
          </button>
          <CardResultItem :card="cards[detailIndex]" />
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.spread__idle {
  padding-bottom: var(--space-2);
}

.spread__progress {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 1px;
  text-align: center;
}

.spread__reveal-all {
  width: 100%;
  max-width: 460px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 15px;
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.spread__reveal-all:active {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.spread__hint {
  color: var(--color-text-muted);
  font-size: 12.5px;
  text-align: center;
}

.spread__message {
  width: min(100%, 520px);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-raised) 92%, transparent);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.spread__message-eyebrow {
  margin-bottom: var(--space-1);
  color: var(--color-gold);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.spread__message-body {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.65;
}

.spread-sheet {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(10, 5, 25, 0.68);
}

.spread-sheet__panel {
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-lg);
  -webkit-overflow-scrolling: touch;
}

.spread-sheet__close {
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

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 250ms ease;
}

.sheet-enter-active .spread-sheet__panel,
.sheet-leave-active .spread-sheet__panel {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .spread-sheet__panel,
.sheet-leave-to .spread-sheet__panel {
  transform: translateY(40px);
}

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active .spread-sheet__panel,
  .sheet-leave-active .spread-sheet__panel {
    transition: none;
  }
}
</style>
