<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { buildOpenQuestionSummary } from '../../data/spreadReadings'
import { useCardSelection, type DrawMode } from '../../composables/useCardSelection'
import { getCardsSnapshot } from '../../stores/cardStore'
import QuestionInput from '../../components/common/QuestionInput.vue'
import QuestionSuggestions from '../../components/common/QuestionSuggestions.vue'
import CardSelectionBoard from '../../components/common/CardSelectionBoard.vue'
import CardResultItem from '../../components/common/CardResultItem.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'

function browserStorage(kind: 'sessionStorage' | 'localStorage'): Storage | undefined {
  try { return window[kind] } catch { return undefined }
}
const selection = useCardSelection(getCardsSnapshot(), 3, browserStorage('sessionStorage'))
const { snapshot, candidates, cards, phase: drawPhase } = selection
// A saved reading must never bypass the question step on a fresh entry.
const hasStarted = ref(false)
const phase = computed(() => hasStarted.value ? drawPhase.value : 'initial')
const root = ref<HTMLElement | null>(null)
const question = ref(snapshot.value?.question ?? '')
const preferenceKey = 'tarot:draw-mode'
function preferredMode(): DrawMode {
  try { return browserStorage('localStorage')?.getItem(preferenceKey) === 'quick' ? 'quick' : 'manual' }
  catch { return 'manual' }
}
const mode = ref<DrawMode>(snapshot.value?.mode ?? preferredMode())
const trimmedQuestion = computed(() => question.value.trim())
const canStart = computed(() => trimmedQuestion.value.length > 0 && trimmedQuestion.value.length <= 160)
const combinedMessage = computed(() => buildOpenQuestionSummary(cards.value))
const suggestedQuestions = computed(() => [
  ui('What should I understand about this situation?'),
  ui('What is most important for me to notice right now?'),
  ui('What can help me move forward with clarity?')
])

function startDraw() {
  if (!canStart.value || phase.value !== 'initial') return
  selection.start(question.value, mode.value)
  hasStarted.value = true
  scrollToTop()
}

function chooseMode(value: DrawMode) {
  mode.value = value
  try { browserStorage('localStorage')?.setItem(preferenceKey, value) } catch { /* Use session preference. */ }
}

function drawAgain() {
  selection.start(trimmedQuestion.value, mode.value)
  scrollToTop()
}

function changeQuestion() {
  question.value = snapshot.value?.question ?? trimmedQuestion.value
  hasStarted.value = false
  selection.reset()
  scrollToTop()
}

async function scrollToTop() {
  await nextTick()
  root.value?.querySelector('.screen-content')?.scrollTo({ top: 0 })
}

let revealTimer: ReturnType<typeof setTimeout> | undefined
watch(() => [phase.value, snapshot.value?.mode, snapshot.value?.revealed.length], () => {
  if (revealTimer) clearTimeout(revealTimer)
  if (phase.value !== 'revealing') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    selection.revealAll()
    return
  }
  if (snapshot.value?.mode === 'manual') {
    // Let the third selection rise before automatically revealing the three cards.
    revealTimer = setTimeout(() => selection.revealAll(), 350)
    return
  }
  revealTimer = setTimeout(() => {
    const next = cards.value.findIndex((_, index) => !snapshot.value?.revealed.includes(index))
    if (next >= 0) selection.reveal(next)
  }, 650)
}, { immediate: true })
onUnmounted(() => { if (revealTimer) clearTimeout(revealTimer) })
</script>

<template>
  <main ref="root" class="screen themed-result-screen themed-result-screen--open" :class="{ 'themed-result-screen--active': phase !== 'initial' }">
    <ScreenHeader :title='ui("3 Card Spread")' back-to="/tarot" />
    <ScreenContent spread>
        <div v-if="hasStarted && snapshot" class="spread__reading">
          <p v-if="trimmedQuestion" class="screen__question">
            “{{ trimmedQuestion }}”
          </p>
          <CardSelectionBoard
            :candidates="candidates"
            :selected="snapshot.selected"
            :revealed="snapshot.revealed"
            :count="3"
            :manual="snapshot.mode === 'manual'"
            @select="selection.select"
            @deselect="selection.deselect"
          />
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
        </div>

      <Transition name="idle">
        <form v-if="phase === 'initial'" class="screen__idle spread__idle" @submit.prevent="startDraw">
          <p class="screen__intro">{{ ui("Ask an open question — three cards offer a perspective to reflect on, not a fixed answer.") }}</p>
          <QuestionInput
            v-model="question"
            :label='ui("Your question")'
            :placeholder='ui("What should I understand about this situation?")'
            :maxlength="160"
            required
          />
          <QuestionSuggestions
            v-model="question"
            :questions="suggestedQuestions"
            :label='ui("Suggested questions")'
          />
          <div class="spread__modes" role="group" :aria-label="ui('How would you like to draw?')">
            <button type="button" :aria-pressed="mode === 'manual'" @click="chooseMode('manual')">{{ ui('Choose your cards') }}</button>
            <button type="button" :aria-pressed="mode === 'quick'" @click="chooseMode('quick')">{{ ui('Quick draw') }}</button>
          </div>
          <p class="spread__mode-hint">{{ mode === 'manual' ? ui('Choose 3 from 9 face-down cards. They reveal automatically when you finish choosing.') : ui('Let the deck choose three cards and reveal them for you.') }}</p>
          <PrimaryButton type="submit" :disabled="!canStart">{{ mode === 'manual' ? ui('Choose 3 Cards') : ui('Draw 3 Cards') }}</PrimaryButton>
        </form>
      </Transition>
    </ScreenContent>
  </main>
</template>

<style scoped>
.spread__idle {
  padding-bottom: var(--space-2);
}

.spread__reading { display: flex; flex-direction: column; align-items: center; gap: 24px; padding-bottom: 16px; }
.screen__question { width: min(100%, 520px); margin: 0; padding-inline: 8px; text-align: center; color: #bdd5f0; font-family: var(--font-display); font-size: 16px; line-height: 1.6; overflow-wrap: anywhere; }
.spread__modes { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.spread__modes button { min-height: 48px; border: 1px solid var(--color-border); border-radius: 14px; padding: 10px; background: var(--color-surface); color: var(--color-text-muted); font: inherit; font-size: 14px; cursor: pointer; }
.spread__modes button[aria-pressed="true"] { border-color: #bdd5f0; background: rgba(91, 133, 188, .18); color: var(--color-text); }
.spread__modes button:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 3px; }
.spread__mode-hint { margin-top: -12px; color: var(--color-text-muted); font-size: 12px; line-height: 1.5; text-align: center; }

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
