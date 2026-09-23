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

type Phase = 'initial' | 'drawing' | 'preview' | 'result'

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
  phase.value = 'preview'
}

function reveal() {
  if (phase.value !== 'preview') return
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

          <div v-if="phase === 'preview'" class="spread__reveal reveal-item reveal-item--2">
            <PrimaryButton @click="reveal">{{ ui("Reveal Card") }}</PrimaryButton>
          </div>

          <template v-else-if="phase === 'result'">
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

.spread__reveal {
  width: 100%;
  max-width: 460px;
}

.spread__cards {
  display: grid;
  width: 100%;
  max-width: 460px;
  gap: var(--space-4);
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
</style>
