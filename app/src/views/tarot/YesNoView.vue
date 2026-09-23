<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, ref } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import { useDrawCards } from '../../composables/useDrawCards'
import { buildYesNoGuidance } from '../../data/yesNo'
import QuestionInput from '../../components/common/QuestionInput.vue'
import QuestionSuggestions from '../../components/common/QuestionSuggestions.vue'
import CardDrawAnimation from '../../components/common/CardDrawAnimation.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'
import { showInterstitialAtNaturalBreak } from '../../services/advertising'

type Phase = 'initial' | 'drawing' | 'result'

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const question = ref('')
const card = ref<TarotCard | null>(null)

const trimmedQuestion = computed(() => question.value.trim())
const guidance = computed(() => (card.value ? buildYesNoGuidance(card.value) : null))
const suggestedQuestions = computed(() => [
  ui('Is now a good time to make this change?'),
  ui('Should I give this situation more time?'),
  ui('Will this choice support my next step?')
])

function startDraw() {
  if (phase.value !== 'initial') return
  card.value = draw(1)[0]
  phase.value = 'drawing'
}

function onRevealed() {
  phase.value = 'result'
  void showInterstitialAtNaturalBreak()
}

function drawAgain() {
  card.value = null
  phase.value = 'initial'
}

function clearQuestion() {
  question.value = ''
}
</script>

<template>
  <main
    class="screen themed-result-screen themed-result-screen--yesno"
    :class="[
      guidance ? `themed-result-screen--${guidance.verdict.variant}` : '',
      { 'themed-result-screen--active': phase === 'result' }
    ]"
  >
    <ScreenHeader :title='ui("Yes or No")' back-to="/tarot" />
    <ScreenContent :spread="phase === 'initial'">
      <CardDrawAnimation :card="card" :active="phase === 'drawing'" variant="yes-no" @revealed="onRevealed">
        <template v-if="card && guidance">
          <p v-if="trimmedQuestion" class="screen__question reveal-item reveal-item--1">
            “{{ trimmedQuestion }}”
          </p>
          <p v-else class="screen__question reveal-item reveal-item--1">{{ ui("Your answer") }}</p>

          <div
            class="verdict reveal-item reveal-item--2"
            :class="`verdict--${guidance.verdict.variant}`"
            role="status"
            aria-live="polite"
          >
            <svg
              class="verdict__icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
              <template v-if="guidance.verdict.variant === 'yes'">
                <path d="M8 12.4l2.6 2.6L16 9.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </template>
              <template v-else-if="guidance.verdict.variant === 'no'">
                <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </template>
              <template v-else-if="guidance.verdict.variant === 'maybe'">
                <path d="M8.5 9.5h7M8.5 12h7M8.5 14.5h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </template>
              <template v-else>
                <path d="M9.6 9.4a2.6 2.6 0 1 1 3.4 2.5c-1 .4-1.5 1-1.5 2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="11.5" cy="17.4" r="0.7" fill="currentColor" />
              </template>
            </svg>
            <span class="verdict__label">{{ guidance.verdict.label }}</span>
          </div>
          <p class="verdict__meaning reveal-item reveal-item--3">{{ guidance.verdict.meaning }}</p>

          <h2 class="reveal-item reveal-item--4 reveal-name">{{ card.name }}</h2>

          <div class="reveal-item reveal-item--5 reveal-advice">
            <span class="reveal-advice__title">{{ ui("Why this answer") }}</span>
            {{ guidance.why }}
          </div>
          <div class="reveal-item reveal-item--6 reveal-advice">
            <span class="reveal-advice__title">{{ ui("Guidance") }}</span>
            {{ guidance.guidance }}
          </div>

          <div class="reveal-item reveal-item--7 reveal-actions">
            <DrawAgainBar back-to="/tarot" @draw-again="drawAgain" />
          </div>
        </template>
      </CardDrawAnimation>

      <Transition name="idle">
        <div v-if="phase === 'initial'" class="screen__idle yesno__idle">
          <p class="screen__intro">{{ ui("Ask a question that can be answered with Yes or No, then draw a single card for a clear answer.") }}</p>

          <div class="yesno__form">
            <QuestionInput
              v-model="question"
              :label='ui("Your question (optional)")'
              :placeholder='ui("e.g. Should I change my job?")'
              :maxlength="140"
            />
            <QuestionSuggestions
              v-model="question"
              :questions="suggestedQuestions"
              :label='ui("Suggested questions")'
            />
            <p class="yesno__helper">{{ ui("Try a clear question that could be answered Yes or No.") }}</p>
            <p v-if="!trimmedQuestion" class="yesno__hold">{{ ui("Hold your question in mind.") }}</p>
            <button
              v-if="trimmedQuestion"
              type="button"
              class="yesno__clear"
              @click="clearQuestion"
            >{{ ui("Clear question") }}</button>
            <PrimaryButton @click="startDraw">{{ ui("Draw Card") }}</PrimaryButton>
          </div>
        </div>
      </Transition>
    </ScreenContent>
  </main>
</template>

<style scoped>
.yesno__idle {
  padding-bottom: var(--space-2);
}

.yesno__form {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.yesno__helper,
.yesno__hold {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-muted);
  text-align: center;
}

.yesno__clear {
  align-self: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.yesno__clear:active {
  color: var(--color-gold);
}

.verdict {
  position: relative;
  isolation: isolate;
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 1.5px;
  border: 1px solid currentColor;
  animation: verdict-arrive 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.verdict::before,
.verdict::after {
  content: '';
  position: absolute;
  inset: -7px;
  z-index: -1;
  border: 1px solid currentColor;
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
}

.verdict::after { inset: -13px; }

.verdict__icon {
  flex-shrink: 0;
  animation: verdict-icon-arrive 620ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.verdict__meaning {
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-muted);
  text-align: center;
  max-width: 340px;
}

.verdict--yes {
  color: #2dd4bf;
  background: rgba(45, 212, 191, 0.14);
}

.verdict--no {
  color: #fb7185;
  background: rgba(251, 113, 133, 0.14);
}

.verdict--maybe {
  color: var(--color-gold);
  background: var(--color-gold-soft);
}

.verdict--uncertain {
  color: #b9aef0;
  background: rgba(185, 174, 240, 0.14);
}

.verdict--yes::before,
.verdict--yes::after {
  animation: verdict-expand 1.15s ease-out both;
}

.verdict--yes::after { animation-delay: 150ms; }
.verdict--no::before { animation: verdict-contract 700ms ease-out both; }
.verdict--maybe::before { animation: verdict-shimmer 1.4s ease-in-out 2; }
.verdict--uncertain::before { animation: verdict-drift 2.2s ease-in-out 2; }

@keyframes verdict-arrive {
  from { opacity: 0; transform: translateY(12px) scale(0.82); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes verdict-icon-arrive {
  from { opacity: 0; transform: rotate(-35deg) scale(0.55); }
  to { opacity: 1; transform: rotate(0) scale(1); }
}

@keyframes verdict-expand {
  0% { opacity: 0.7; transform: scale(0.75); }
  100% { opacity: 0; transform: scale(1.22); }
}

@keyframes verdict-contract {
  0% { opacity: 0; transform: scale(1.25); }
  60% { opacity: 0.65; }
  100% { opacity: 0; transform: scale(0.88); }
}

@keyframes verdict-shimmer {
  0%, 100% { opacity: 0; transform: translateX(-4px); }
  50% { opacity: 0.55; transform: translateX(4px); }
}

@keyframes verdict-drift {
  0%, 100% { opacity: 0.12; transform: translateX(-5px) rotate(-1deg); }
  50% { opacity: 0.5; transform: translateX(5px) rotate(1deg); }
}

@media (prefers-reduced-motion: reduce) {
  .verdict,
  .verdict__icon,
  .verdict::before,
  .verdict::after {
    animation: none;
  }
}
</style>
