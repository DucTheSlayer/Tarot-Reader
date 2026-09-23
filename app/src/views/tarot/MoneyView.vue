<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, ref } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import {
  getMoneyCardReading,
  MONEY_CONTEXT_OPTIONS,
  MONEY_SLOTS,
  type MoneyContext
} from '../../data/spreadReadings'
import { useDrawCards } from '../../composables/useDrawCards'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import CardDrawAnimation from '../../components/common/CardDrawAnimation.vue'
import CardResultItem from '../../components/common/CardResultItem.vue'
import CardSlotLabel from '../../components/common/CardSlotLabel.vue'
import ContextChipGroup from '../../components/common/ContextChipGroup.vue'
import SpreadSummary from '../../components/common/SpreadSummary.vue'
import DrawAgainBar from '../../components/common/DrawAgainBar.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'
import { showInterstitialAtNaturalBreak } from '../../services/advertising'

type Phase = 'initial' | 'drawing' | 'preview' | 'result'

const { draw } = useDrawCards()
const phase = ref<Phase>('initial')
const cards = ref<TarotCard[]>([])
const context = ref<MoneyContext | ''>('')

const cardDetails = computed(() => {
  const ctx = context.value
  if (!ctx) return []
  return cards.value.map((card, index) => ({
    card,
    label: MONEY_SLOTS[index],
    ...getMoneyCardReading(card, index, ctx)
  }))
})

function selectContext(value: string) {
  if (MONEY_CONTEXT_OPTIONS.some((option) => option.value === value)) {
    context.value = value as MoneyContext
  }
}

function startDraw() {
  if (!context.value || phase.value !== 'initial') return
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
  cards.value = []
  phase.value = 'initial'
}
</script>

<template>
  <main class="screen themed-result-screen themed-result-screen--money" :class="{ 'themed-result-screen--active': phase === 'result' }">
    <ScreenHeader class="money__header" :title='ui("Money Tarot")' back-to="/tarot" />
    <ScreenContent :spread="phase === 'initial'">
      <CardDrawAnimation
        :cards="cards"
        :active="phase === 'drawing'"
        :tappable="false"
        :show-captions="phase === 'result'"
        :captions="cards.map((card, index) => ({ label: MONEY_SLOTS[index], name: card.name }))"
        :preview-captions="[...MONEY_SLOTS]"
        layout="triangle"
        variant="money"
        :fly-duration="360"
        :hold-duration="180"
        :flip-duration="520"
        @revealed="onRevealed"
      >
        <template v-if="cards.length && context">
          <div v-if="phase === 'preview'" class="money__reveal reveal-item reveal-item--1">
            <PrimaryButton @click="reveal">{{ ui("Reveal Card") }}</PrimaryButton>
          </div>

          <template v-else-if="phase === 'result'">
            <article
              v-for="(detail, index) in cardDetails"
              :key="detail.card.id"
              class="money__card"
              :class="`reveal-item reveal-item--${index + 1}`"
            >
              <CardSlotLabel :label="detail.label" />
              <CardResultItem
                :card="detail.card"
                :meaning="detail.meaning"
                :advice="detail.advice"
                :show-image="false"
                variant="money"
              />
            </article>
            <SpreadSummary
              class="reveal-item reveal-item--4"
              variant="money"
              :cards="cards"
              :context="context"
            />
            <div class="reveal-item reveal-item--5 reveal-actions">
              <DrawAgainBar back-to="/tarot" @draw-again="drawAgain" />
            </div>
          </template>
        </template>
      </CardDrawAnimation>

      <Transition name="idle">
        <div v-if="phase === 'initial'" class="screen__idle money__idle">
          <div class="money__intro">
            <p class="money__eyebrow">{{ ui("A practical path forward") }}</p>
            <p class="screen__intro">{{ ui("Read the current position, the opportunity or obstacle, and the action worth considering next.") }}</p>
          </div>
          <ContextChipGroup
            :label='ui("Choose a financial focus")'
            name="money-context"
            :model-value="context"
            :options="MONEY_CONTEXT_OPTIONS"
            @update:model-value="selectContext"
          />
          <PrimaryButton :disabled="!context" @click="startDraw">{{ ui("Draw Cards") }}</PrimaryButton>
          <p class="money__initial-disclaimer">{{ ui("For reflection only — this reading is not financial advice.") }}</p>
        </div>
      </Transition>
    </ScreenContent>
  </main>
</template>

<style scoped>
.themed-result-screen--active .money__header {
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(9, 35, 38, 0.98), rgba(15, 52, 46, 0.98));
  box-shadow:
    0 -60px 0 28px rgba(9, 35, 38, 0.98),
    0 10px 28px rgba(3, 20, 23, 0.36);
  backdrop-filter: blur(12px);
}

.money__idle {
  padding-bottom: var(--space-2);
}

.money__intro {
  display: grid;
  gap: var(--space-2);
}

.money__eyebrow {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 1.2px;
  text-align: center;
  text-transform: uppercase;
}

.money__initial-disclaimer {
  color: var(--color-text-muted);
  font-size: 12.5px;
  text-align: center;
}

.money__initial-disclaimer {
  font-size: 10.5px;
  line-height: 1.45;
}

.money__reveal {
  width: 100%;
  max-width: 460px;
}

.money__card {
  display: flex;
  width: 100%;
  max-width: 460px;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.money__card + .money__card {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
</style>
