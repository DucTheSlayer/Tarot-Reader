<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, onMounted, ref } from 'vue'
import { getCardOfTheDay, toDateKey } from '../../data/cardOfTheDay'
import {
  buildDailyFortune,
  type DailyFortuneAspect
} from '../../data/dailyReading'
import { getCardsSnapshot } from '../../stores/cardStore'
import { drawCardsFromDeck } from '../../composables/useDrawCards'
import {
  showRewardedAd,
  warmRewardedAd,
  type RewardedQaResult
} from '../../services/advertising'
import type { TarotCard } from '../../types/tarotCard'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'
import AdIcon from '../../components/ads/AdIcon.vue'

const today = new Date()
const dateKey = toDateKey(today)
const deck = getCardsSnapshot()
const card = getCardOfTheDay(deck, today)
const dailyFortune = buildDailyFortune(card)
const revealedStorageKey = 'tarot:daily-revealed-date'
const clarificationStorageKey = `tarot:daily-clarification:${dateKey}`
const clarificationRoles = ["Behind today's card", 'Support or challenge', 'Action for today'] as const
const MAX_DAILY_CLARITY_READINGS = 3

function hasRevealedToday(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(revealedStorageKey) === dateKey
  } catch {
    return false
  }
}

const restoredReveal = hasRevealedToday()
const revealed = ref(restoredReveal)
const restoredClarificationSpreads = restoreClarificationSpreads()
const clarificationSpreads = ref<TarotCard[][]>(restoredClarificationSpreads)
const activeClarificationIndex = ref(Math.max(0, restoredClarificationSpreads.length - 1))
const clarificationCards = computed(() => clarificationSpreads.value[activeClarificationIndex.value] ?? [])
const canUnlockAnotherReading = computed(
  () => clarificationSpreads.value.length < MAX_DAILY_CLARITY_READINGS
)
const rewardState = ref<'idle' | 'loading' | 'skipped' | 'unavailable'>('idle')

onMounted(() => {
  warmRewardedAd()
})

function saveClarificationSpreads(spreads: TarotCard[][]): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(clarificationStorageKey, JSON.stringify({
      version: 2,
      spreads: spreads.map((spread) => spread.map(({ id }) => id))
    }))
  } catch {
    // Keep the earned spreads available for the current session.
  }
}

function restoreClarificationSpreads(): TarotCard[][] {
  if (typeof window === 'undefined') return []

  try {
    const storedValue = window.localStorage.getItem(clarificationStorageKey)
    if (!storedValue) return []

    let storedSpreads: string[][]
    try {
      const parsed: unknown = JSON.parse(storedValue)
      if (Array.isArray(parsed)) {
        // Backward compatibility with the first 3-card reward format.
        storedSpreads = [parsed.filter((id): id is string => typeof id === 'string')]
      } else if (
        parsed &&
        typeof parsed === 'object' &&
        'spreads' in parsed &&
        Array.isArray(parsed.spreads)
      ) {
        storedSpreads = parsed.spreads
          .filter((spread): spread is unknown[] => Array.isArray(spread))
          .map((spread) => spread.filter((id): id is string => typeof id === 'string'))
      } else {
        storedSpreads = []
      }
    } catch {
      // Backward compatibility with the previous single-card reward.
      storedSpreads = [[storedValue]]
    }

    const usedIds = new Set([card.id])
    const restoredSpreads: TarotCard[][] = []

    for (const storedIds of storedSpreads.slice(0, MAX_DAILY_CLARITY_READINGS)) {
      const restored = storedIds
        .map((id) => deck.find((item) => item.id === id))
        .filter((item): item is TarotCard => Boolean(item && !usedIds.has(item.id)))
        .filter((item, index, cards) => cards.findIndex(({ id }) => id === item.id) === index)
        .slice(0, 3)

      if (!restored.length) continue
      restored.forEach(({ id }) => usedIds.add(id))

      if (restored.length < 3) {
        const extraCards = drawCardsFromDeck(
          deck.filter((item) => !usedIds.has(item.id)),
          3 - restored.length
        )
        restored.push(...extraCards)
        extraCards.forEach(({ id }) => usedIds.add(id))
      }

      if (restored.length === 3) restoredSpreads.push(restored)
    }

    if (restoredSpreads.length) saveClarificationSpreads(restoredSpreads)
    return restoredSpreads
  } catch {
    return []
  }
}

function grantClarificationSpread(): void {
  if (!canUnlockAnotherReading.value) return

  const usedIds = new Set([
    card.id,
    ...clarificationSpreads.value.flatMap((spread) => spread.map(({ id }) => id))
  ])
  const candidates = deck.filter((item) => !usedIds.has(item.id))
  const drawnCards = drawCardsFromDeck(candidates, 3)
  if (drawnCards.length < 3) return

  clarificationSpreads.value = [...clarificationSpreads.value, drawnCards]
  activeClarificationIndex.value = clarificationSpreads.value.length - 1
  saveClarificationSpreads(clarificationSpreads.value)
}

async function unlockClarificationSpread(): Promise<void> {
  if (rewardState.value === 'loading' || !canUnlockAnotherReading.value) return
  rewardState.value = 'loading'

  try {
    const started = await showRewardedAd((result: RewardedQaResult) => {
      if (result === 'rewarded') {
        grantClarificationSpread()
        rewardState.value = 'idle'
      } else {
        rewardState.value = 'skipped'
      }
    })
    if (!started) rewardState.value = 'unavailable'
  } catch (error) {
    console.warn('Rewarded clarification ad failed.', error)
    rewardState.value = 'unavailable'
  }
}

function showClarificationSpread(index: number): void {
  if (index < 0 || index >= clarificationSpreads.value.length) return
  activeClarificationIndex.value = index
}

function clarificationMessage(clarificationCard: TarotCard, index: number): string {
  const source = [
    "With {daily} as today's anchor, {name} reveals what is operating beneath the surface. {meaning}",
    '{name} shows what may support or challenge the energy of {daily}. {meaning}',
    '{name} turns the message of {daily} into one grounded action for today. {advice}'
  ][index]

  return ui(source, {
    daily: card.name,
    name: clarificationCard.name,
    meaning: clarificationCard.meaning,
    advice: clarificationCard.advice
  })
}

function clarificationSummary(): string {
  const [first, second, third] = clarificationCards.value
  if (!first || !second || !third) return ''

  return ui("Today's reading begins with {daily}: {dailyMeaning} {first} uncovers the layer beneath it, {second} shows the force helping or challenging it, and {third} turns the whole message into action. {action}", {
    daily: card.name,
    dailyMeaning: card.meaning,
    first: first.name,
    second: second.name,
    third: third.name,
    action: third.advice
  })
}

function revealCard() {
  if (revealed.value) return

  revealed.value = true

  try {
    window.localStorage.setItem(revealedStorageKey, dateKey)
  } catch {
    // Vẫn hiển thị kết quả trong phiên hiện tại nếu localStorage không khả dụng.
  }
}

const fortuneSymbols: Record<DailyFortuneAspect, string> = {
  finance: '◇',
  love: '♡',
  career: '✦'
}

function fortuneLabel(aspect: DailyFortuneAspect): string {
  return ui({ finance: 'Finance', love: 'Love', career: 'Career' }[aspect])
}

function fortuneMessage(aspect: DailyFortuneAspect): string {
  const source = {
    finance: '{name} invites steady, honest choices with resources. {advice}',
    love: '{name} asks you to keep your heart open. {advice}',
    career: '{name} points toward your work ahead. {advice}'
  }[aspect]

  return ui(source, { name: card.name, advice: card.advice })
}
</script>

<template>
  <main class="screen">
    <ScreenHeader :title='ui("Card of the Day")' back-to="/tarot" />
    <ScreenContent>
      <article class="daily">
        <div
          class="daily__oracle"
          :class="{
            'daily__oracle--revealed': revealed,
            'daily__oracle--restored': restoredReveal
          }"
        >
          <span class="daily__orbit daily__orbit--outer" aria-hidden="true"></span>
          <span class="daily__orbit daily__orbit--inner" aria-hidden="true"></span>
          <span class="daily__spark daily__spark--1" aria-hidden="true"></span>
          <span class="daily__spark daily__spark--2" aria-hidden="true"></span>
          <span class="daily__spark daily__spark--3" aria-hidden="true"></span>
          <button
            type="button"
            class="daily__card"
            :class="{
              'daily__card--revealed': revealed,
              'daily__card--restored': restoredReveal
            }"
            :disabled="revealed"
            :aria-label="revealed ? card.name : ui('Reveal today’s card')"
            @click="revealCard"
          >
            <span class="daily__card-inner">
              <span class="daily__face daily__face--back">
                <img src="/cards/back.svg" :alt='ui("Card back")' />
              </span>
              <span class="daily__face daily__face--front">
                <img :src="card.image" :alt="card.name" />
              </span>
            </span>
          </button>
        </div>

        <Transition name="daily-content" mode="out-in">
          <div v-if="!revealed" key="prompt" class="daily__prompt">
            <p>{{ ui("Your message for today is waiting.") }}</p>
            <div class="daily__action">
              <PrimaryButton @click="revealCard">{{ ui("Reveal Card") }}</PrimaryButton>
            </div>
          </div>

          <div v-else key="result" class="daily__result" aria-live="polite">
            <h2 class="daily__name">{{ card.name }}</h2>

            <section class="daily__section daily__section--meaning">
              <h3>{{ ui("Deeper meaning") }}</h3>
              <p>{{ card.meaning }}</p>
              <p class="daily__reflection">
                {{ ui("Today, {name} asks you to notice how this theme appears in your choices, conversations and mood. {advice}", { name: card.name, advice: card.advice }) }}
              </p>
              <div class="daily__energy">
                <span>{{ ui("Energy") }}</span>
                <p>{{ card.yesNoMeaning }}</p>
              </div>
            </section>

            <section class="daily__fortune" :aria-label='ui("Today’s fortune")'>
              <h3>{{ ui("Today’s fortune") }}</h3>
              <div class="daily__fortune-grid">
                <article
                  v-for="item in dailyFortune"
                  :key="item.aspect"
                  class="daily__fortune-item"
                >
                  <div class="daily__fortune-heading">
                    <span class="daily__fortune-symbol" aria-hidden="true">{{ fortuneSymbols[item.aspect] }}</span>
                    <h4>{{ fortuneLabel(item.aspect) }}</h4>
                    <strong>{{ item.score }}/5</strong>
                  </div>
                  <div class="daily__fortune-meter" aria-hidden="true">
                    <span
                      v-for="level in 5"
                      :key="level"
                      :class="{ 'is-active': level <= item.score }"
                    ></span>
                  </div>
                  <p>{{ fortuneMessage(item.aspect) }}</p>
                </article>
              </div>
            </section>

            <section class="daily__section daily__section--advice">
              <h3>{{ ui("Advice") }}</h3>
              <div class="daily__choices">
                <article class="daily__choice daily__choice--do">
                  <h4>{{ ui("Do") }}</h4>
                  <p>{{ ui("Keep this in view as you decide what comes next. {advice}", { advice: card.advice }) }}</p>
                </article>
                <article class="daily__choice daily__choice--avoid">
                  <h4>{{ ui("Avoid") }}</h4>
                  <p>{{ ui("{name} asks you to stay aware of the conditions already shaping this decision. Avoid treating a hopeful sign as a guarantee.", { name: card.name }) }}</p>
                </article>
              </div>
            </section>

            <section class="daily__reward">
              <template v-if="clarificationCards.length === 3">
                <p class="daily__reward-kicker">{{ ui("Your 4-card daily deep reading") }}</p>
                <p class="daily__reward-intro">{{ ui("Today’s card is the anchor; the three rewarded cards deepen its message.") }}</p>
                <div class="daily__anchor">
                  <img :src="card.image" :alt="card.name" />
                  <div>
                    <span>{{ ui("Today’s anchor") }}</span>
                    <h3>{{ card.name }}</h3>
                    <p>{{ ui("The central energy shaping this reading.") }}</p>
                  </div>
                </div>
                <p class="daily__anchor-bridge">{{ ui("Three cards reveal what sits behind this energy and how to work with it today.") }}</p>
                <div
                  v-if="clarificationSpreads.length > 1"
                  class="daily__clarity-history"
                  :aria-label='ui("Your clarity readings")'
                >
                  <button
                    v-for="(_, index) in clarificationSpreads"
                    :key="index"
                    type="button"
                    :class="{ 'is-active': index === activeClarificationIndex }"
                    :aria-pressed="index === activeClarificationIndex"
                    @click="showClarificationSpread(index)"
                  >
                    {{ ui('Reading {number}', { number: index + 1 }) }}
                  </button>
                </div>
                <div class="daily__clarity-cards">
                  <article
                    v-for="(clarificationCard, index) in clarificationCards"
                    :key="clarificationCard.id"
                    class="daily__clarity-card"
                  >
                    <span>{{ index + 1 }} · {{ ui(clarificationRoles[index]) }}</span>
                    <img :src="clarificationCard.image" :alt="clarificationCard.name" />
                    <h3>{{ clarificationCard.name }}</h3>
                  </article>
                </div>
                <div class="daily__clarity-reading">
                  <article
                    v-for="(clarificationCard, index) in clarificationCards"
                    :key="`${clarificationCard.id}-reading`"
                  >
                    <h4>{{ ui(clarificationRoles[index]) }}</h4>
                    <p>{{ clarificationMessage(clarificationCard, index) }}</p>
                  </article>
                </div>
                <div class="daily__clarity-summary">
                  <span>{{ ui("How the cards connect") }}</span>
                  <p>{{ clarificationSummary() }}</p>
                </div>
                <div v-if="canUnlockAnotherReading" class="daily__reward-more">
                  <h4>{{ ui("Want another perspective?") }}</h4>
                  <p>{{ ui("Watch another short ad to draw a fresh 3-card clarity spread.") }}</p>
                  <PrimaryButton
                    :disabled="rewardState === 'loading'"
                    @click="unlockClarificationSpread"
                  >
                    <AdIcon v-if="rewardState !== 'loading'" />
                    {{ rewardState === 'loading' ? ui("Preparing ad...") : ui("Watch ad and draw another spread") }}
                  </PrimaryButton>
                </div>
                <p v-else class="daily__reward-complete">
                  {{ ui("You have unlocked all {limit} clarity readings for today.", { limit: MAX_DAILY_CLARITY_READINGS }) }}
                </p>
              </template>
              <template v-else>
                <p class="daily__reward-kicker">{{ ui("Rewarded reading") }}</p>
                <h3>{{ ui("Deepen today’s card with 3 supporting cards") }}</h3>
                <p>{{ ui("Watch a short ad to uncover what lies behind today’s card, what supports or challenges it, and one action for today.") }}</p>
                <div class="daily__reward-preview" aria-hidden="true">
                  <span v-for="index in 3" :key="index">{{ index }}</span>
                </div>
                <PrimaryButton
                  :disabled="rewardState === 'loading'"
                  @click="unlockClarificationSpread"
                >
                  <AdIcon v-if="rewardState !== 'loading'" />
                  {{ rewardState === 'loading' ? ui("Preparing ad...") : ui("Watch ad and unlock 3 cards") }}
                </PrimaryButton>
              </template>
              <p v-if="rewardState === 'skipped'" class="daily__reward-status">
                {{ ui("The video was closed before the reward was earned.") }}
              </p>
              <p v-else-if="rewardState === 'unavailable'" class="daily__reward-status">
                {{ ui("No ad is available right now. Please try again.") }}
              </p>
            </section>

            <p class="daily__note">{{ ui("Your card changes tomorrow.") }}</p>
          </div>
        </Transition>
      </article>
    </ScreenContent>
  </main>
</template>

<style scoped>
.daily {
  display: flex;
  width: 100%;
  max-width: 460px;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin: 0 auto;
  padding: var(--space-2) 0 var(--space-4);
  text-align: center;
}

.daily__oracle {
  position: relative;
  width: min(58vw, 215px);
  isolation: isolate;
}

.daily__card {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  perspective: 1000px;
  -webkit-tap-highlight-color: transparent;
}

.daily__orbit {
  position: absolute;
  z-index: 0;
  border: 1px solid rgba(230, 199, 107, 0.3);
  border-radius: 50%;
  pointer-events: none;
}

.daily__orbit::after {
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-gold);
  box-shadow: 0 0 10px rgba(230, 199, 107, 0.9);
}

.daily__orbit--outer {
  inset: 5% -24%;
  animation: daily-orbit 12s linear infinite;
}

.daily__orbit--inner {
  inset: 15% -14%;
  border-style: dashed;
  animation: daily-orbit 8s linear infinite reverse;
}

.daily__spark {
  position: absolute;
  z-index: 1;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff2bc;
  box-shadow: 0 0 12px rgba(230, 199, 107, 0.9);
  animation: daily-spark 2.8s ease-in-out infinite;
}

.daily__spark--1 { top: 8%; left: -12%; }
.daily__spark--2 { top: 47%; right: -18%; animation-delay: -0.9s; }
.daily__spark--3 { bottom: 6%; left: -8%; animation-delay: -1.8s; }

.daily__oracle--revealed:not(.daily__oracle--restored)::after {
  content: '';
  position: absolute;
  inset: -18%;
  z-index: 0;
  border: 1px solid rgba(255, 238, 172, 0.7);
  border-radius: 50%;
  animation: daily-aura-reveal 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  pointer-events: none;
}

.daily__card:disabled {
  cursor: default;
}

.daily__card:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 5px;
}

.daily__card-inner {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 300 / 420;
  transform-style: preserve-3d;
  transition: transform 680ms cubic-bezier(0.22, 1, 0.36, 1);
}

.daily__card--revealed .daily__card-inner {
  transform: rotateY(180deg);
}

.daily__card--restored .daily__card-inner {
  transition: none;
}

.daily__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 1px solid rgba(230, 199, 107, 0.42);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg), 0 0 24px rgba(230, 199, 107, 0.14);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.daily__face img {
  display: block;
  width: 100%;
  height: 100%;
}

.daily__face--front {
  transform: rotateY(180deg);
}

.daily__prompt,
.daily__result {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.daily__prompt p {
  color: var(--color-text-muted);
  font-size: 14px;
}

.daily__action {
  width: min(100%, 280px);
}

.daily__name {
  color: var(--color-gold);
  font-size: 25px;
}

.daily__section {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  text-align: left;
}

.daily__section--advice {
  background: var(--color-gold-soft);
  border-color: rgba(230, 199, 107, 0.28);
}

.daily__section--meaning {
  background: linear-gradient(145deg, var(--color-surface-raised), color-mix(in srgb, var(--color-primary-soft) 55%, var(--color-surface-raised)));
}

.daily__section h3 {
  margin-bottom: var(--space-2);
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 13px;
}

.daily__section p {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.65;
}

.daily__reflection {
  margin-top: var(--space-3);
  color: var(--color-text) !important;
}

.daily__energy {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(230, 199, 107, 0.2);
}

.daily__energy span {
  display: block;
  margin-bottom: var(--space-1);
  color: var(--color-gold);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.daily__fortune {
  width: 100%;
  text-align: left;
}

.daily__fortune > h3 {
  margin-bottom: var(--space-3);
  color: var(--color-gold);
  font-family: var(--font-serif);
  font-size: 18px;
  text-align: center;
}

.daily__fortune-grid {
  display: grid;
  gap: var(--space-3);
}

.daily__fortune-item {
  padding: var(--space-3);
  border: 1px solid rgba(230, 199, 107, 0.22);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface-raised) 86%, var(--color-primary-soft));
}

.daily__fortune-heading {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: var(--space-2);
}

.daily__fortune-symbol {
  color: var(--color-gold);
  font-size: 20px;
  line-height: 1;
  text-align: center;
}

.daily__fortune-heading h4 {
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
}

.daily__fortune-heading strong {
  color: var(--color-gold);
  font-size: 13px;
}

.daily__fortune-meter {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  margin: var(--space-2) 0;
}

.daily__fortune-meter span {
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.daily__fortune-meter span.is-active {
  background: linear-gradient(90deg, var(--color-gold), #fff0ad);
  box-shadow: 0 0 7px rgba(230, 199, 107, 0.32);
}

.daily__fortune-item p {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.daily__choices {
  display: grid;
  gap: var(--space-3);
}

.daily__choice {
  padding-left: var(--space-3);
  border-left: 2px solid;
}

.daily__choice h4 {
  margin-bottom: var(--space-1);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.daily__choice--do {
  border-color: #77c99b;
}

.daily__choice--do h4 {
  color: #91ddb0;
}

.daily__choice--avoid {
  border-color: #d79a83;
}

.daily__choice--avoid h4 {
  color: #e5ad98;
}

.daily__choice + .daily__choice {
  padding-top: var(--space-2);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.daily__note {
  color: var(--color-text-muted);
  font-size: 12px;
}

.daily__reward {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid rgba(230, 199, 107, 0.32);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary-soft) 70%, var(--color-surface-raised));
  text-align: left;
}

.daily__reward > h3,
.daily__reward-kicker,
.daily__clarity-card h3 {
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 14px;
}

.daily__reward > p:not(.daily__reward-kicker),
.daily__clarity-reading p,
.daily__clarity-summary p {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.daily__reward-intro {
  margin-top: var(--space-1) !important;
}

.daily__anchor {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
  padding: var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-gold) 45%, var(--color-border));
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-gold-soft), color-mix(in srgb, var(--color-surface-raised) 94%, transparent));
  text-align: left;
}

.daily__anchor img {
  width: 56px;
  aspect-ratio: 2 / 3;
  flex: 0 0 auto;
  border-radius: var(--radius-sm);
  object-fit: cover;
  box-shadow: var(--shadow-sm);
}

.daily__anchor span {
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.daily__anchor h3 {
  margin-top: 2px;
  font-family: var(--font-display);
  font-size: 18px;
}

.daily__anchor p {
  margin-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.daily__anchor-bridge {
  position: relative;
  margin: var(--space-3) auto 0 !important;
  padding-top: var(--space-3);
  text-align: center;
}

.daily__anchor-bridge::before {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: var(--space-2);
  background: var(--color-gold);
  content: '';
  opacity: 0.6;
}

.daily__clarity-history {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.daily__clarity-history button {
  flex: 1;
  min-height: 36px;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 11px;
}

.daily__clarity-history button.is-active {
  border-color: var(--color-gold);
  background: var(--color-gold-soft);
  color: var(--color-gold);
}

.daily__clarity-history button:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.daily__reward-preview {
  display: grid;
  grid-template-columns: repeat(3, 42px);
  justify-content: center;
  gap: var(--space-2);
  margin: var(--space-3) 0;
}

.daily__reward-preview span {
  display: grid;
  aspect-ratio: 300 / 420;
  place-items: center;
  border: 1px solid rgba(230, 199, 107, 0.42);
  border-radius: 6px;
  background: linear-gradient(145deg, rgba(90, 56, 142, 0.72), rgba(24, 13, 48, 0.94));
  color: var(--color-gold);
  font-family: var(--font-display);
  box-shadow: 0 7px 18px rgba(0, 0, 0, 0.24);
}

.daily__clarity-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
  animation: clarification-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.daily__clarity-card {
  min-width: 0;
  text-align: center;
}

.daily__clarity-card > span {
  display: block;
  min-height: 30px;
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 700;
  line-height: 1.3;
  text-transform: uppercase;
}

.daily__clarity-card img {
  display: block;
  width: 100%;
  aspect-ratio: 300 / 420;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.daily__clarity-card h3 {
  margin-top: var(--space-2);
  overflow-wrap: anywhere;
  font-size: 11px;
  line-height: 1.35;
}

.daily__clarity-reading {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.daily__clarity-reading article {
  padding-left: var(--space-3);
  border-left: 2px solid rgba(230, 199, 107, 0.42);
}

.daily__clarity-reading h4,
.daily__clarity-summary span {
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.daily__clarity-summary {
  margin-top: var(--space-4);
  padding: var(--space-3);
  border: 1px solid rgba(230, 199, 107, 0.24);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-gold-soft) 70%, transparent);
}

.daily__reward-more {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(230, 199, 107, 0.2);
}

.daily__reward-more h4 {
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 14px;
}

.daily__reward-more p,
.daily__reward-complete {
  color: var(--color-text-muted);
  font-size: 12.5px;
  line-height: 1.55;
}

.daily__reward-complete {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(230, 199, 107, 0.2);
  text-align: center;
}

.daily__reward-status {
  color: var(--color-danger) !important;
}

.daily-content-enter-active,
.daily-content-leave-active {
  transition: opacity 220ms ease, transform 240ms ease;
}

.daily-content-enter-active {
  transition-delay: 300ms;
}

.daily-content-enter-from,
.daily-content-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes daily-orbit {
  to { transform: rotate(360deg); }
}

@keyframes daily-spark {
  0%, 100% { opacity: 0.3; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.35); }
}

@keyframes daily-aura-reveal {
  from { opacity: 0.9; transform: scale(0.45); }
  to { opacity: 0; transform: scale(1.15); }
}

@keyframes clarification-rise {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .daily__card-inner,
  .daily-content-enter-active,
  .daily-content-leave-active {
    transition: none;
    transition-delay: 0ms;
  }

  .daily__orbit,
  .daily__spark,
  .daily__oracle--revealed::after,
  .daily__clarity-cards {
    animation: none;
  }

  .daily-content-enter-from,
  .daily-content-leave-to {
    transform: none;
  }
}
</style>
