<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, ref } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import { buildOpenQuestionSummary } from '../../data/spreadReadings'
import { useDrawCards } from '../../composables/useDrawCards'
import QuestionInput from '../../components/common/QuestionInput.vue'
import QuestionSuggestions from '../../components/common/QuestionSuggestions.vue'
import CardDrawAnimation from '../../components/common/CardDrawAnimation.vue'
import CardResultItem from '../../components/common/CardResultItem.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'
import { showInterstitialAtNaturalBreak } from '../../services/advertising'

type Phase = 'initial' | 'drawing' | 'result'

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const question = ref('')
const cards = ref<TarotCard[]>([])

const trimmedQuestion = computed(() => question.value.trim())
const canStart = computed(() => trimmedQuestion.value.length > 0)
const combinedMessage = computed(() => buildOpenQuestionSummary(cards.value))
const suggestedQuestions = computed(() => [
  ui('What should I understand about this situation?'),
  ui('What is most important for me to notice right now?'),
  ui('What can help me move forward with clarity?')
])

function startDraw() {
  if (!canStart.value || phase.value !== 'initial') return
  cards.value = draw(3)
  phase.value = 'drawing'
}

function onRevealed() {
  if (phase.value !== 'drawing') return
  phase.value = 'result'
  void showInterstitialAtNaturalBreak()
}

function drawAgain() {
  cards.value = draw(3)
  phase.value = 'drawing'
}

function changeQuestion() {
  cards.value = []
  phase.value = 'initial'
}
</script>

<template>
  <main class="screen themed-result-screen themed-result-screen--open" :class="{ 'themed-result-screen--active': phase === 'result' }">
    <ScreenHeader :title='ui("3 Card Spread")' back-to="/tarot" />
    <ScreenContent :spread="phase === 'initial'">
      <CardDrawAnimation
        :cards="cards"
        :active="phase === 'drawing'"
        :tappable="false"
        auto-reveal
        variant="open-question"
        layout="triangle"
        :fly-duration="360"
        :hold-duration="180"
        :flip-duration="520"
        @revealed="onRevealed"
      >
        <template v-if="cards.length">
          <p v-if="trimmedQuestion" class="screen__question reveal-item reveal-item--1">
            “{{ trimmedQuestion }}”
          </p>

          <template v-if="phase === 'result'">
            <div class="spread__cards reveal-item reveal-item--2">
              <CardResultItem
                v-for="card in cards"
                :key="card.id"
                :card="card"
                :show-image="false"
              />
            </div>
            <section class="spread__message reveal-item reveal-item--3">
              <p class="spread__message-eyebrow">{{ ui("Combined message") }}</p>
              <p class="spread__message-body">{{ combinedMessage }}</p>
            </section>
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
          <QuestionSuggestions
            v-model="question"
            :questions="suggestedQuestions"
            :label='ui("Suggested questions")'
          />
          <PrimaryButton :disabled="!canStart" @click="startDraw">{{ ui("Draw Cards") }}</PrimaryButton>
        </div>
      </Transition>
    </ScreenContent>
  </main>
</template>

<style scoped>
.spread__idle {
  padding-bottom: var(--space-2);
}

.spread__cards {
  display: grid;
  width: min(100%, 520px);
  gap: 14px;
}

.spread__cards :deep(.result) {
  width: 100%;
  gap: 10px;
  padding: 18px 16px;
  border: 1px solid rgba(230, 199, 107, 0.22);
  border-radius: var(--radius-lg);
  background: rgba(26, 21, 48, 0.72);
}

.spread__cards :deep(.result__name) {
  max-width: 100%;
  font-size: clamp(19px, 5vw, 22px);
  line-height: 1.35;
  text-wrap: balance;
}

.spread__cards :deep(.result__meaning) {
  max-width: 44ch;
  font-size: 14px;
  line-height: 1.6;
  text-wrap: pretty;
}

.spread__cards :deep(.result__advice) {
  width: 100%;
  margin-top: 2px;
  padding: 12px 4px 0;
  border: 0;
  border-top: 1px solid rgba(230, 199, 107, 0.23);
  border-radius: 0;
  background: none;
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.6;
  text-wrap: pretty;
}

.spread__cards :deep(.result__advice-title) {
  margin-bottom: 6px;
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
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.65;
  text-wrap: pretty;
}

.reveal-actions { max-width: 520px; }
</style>
