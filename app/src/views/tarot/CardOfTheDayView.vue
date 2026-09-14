<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { ref } from 'vue'
import { getCardOfTheDay, toDateKey } from '../../data/cardOfTheDay'
import { getCardsSnapshot } from '../../stores/cardStore'
import { drawCardsFromDeck } from '../../composables/useDrawCards'
import { showRewardedAd, type RewardedQaResult } from '../../services/advertising'
import type { TarotCard } from '../../types/tarotCard'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'
import AdIcon from '../../components/ads/AdIcon.vue'

const today = new Date()
const dateKey = toDateKey(today)
const deck = getCardsSnapshot()
const card = getCardOfTheDay(deck, today)
const revealedStorageKey = 'tarot:daily-revealed-date'
const clarificationStorageKey = `tarot:daily-clarification:${dateKey}`

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
const clarificationCard = ref<TarotCard | null>(restoreClarificationCard())
const rewardState = ref<'idle' | 'loading' | 'skipped' | 'unavailable'>('idle')

function restoreClarificationCard(): TarotCard | null {
  if (typeof window === 'undefined') return null
  try {
    const storedId = window.localStorage.getItem(clarificationStorageKey)
    return deck.find((item) => item.id === storedId) ?? null
  } catch {
    return null
  }
}

function grantClarificationCard(): void {
  const candidates = deck.filter((item) => item.id !== card.id)
  const [drawnCard] = drawCardsFromDeck(candidates, 1)
  if (!drawnCard) return

  clarificationCard.value = drawnCard
  try {
    window.localStorage.setItem(clarificationStorageKey, drawnCard.id)
  } catch {
    // Keep the earned card available for the current session.
  }
}

async function unlockClarificationCard(): Promise<void> {
  if (rewardState.value === 'loading' || clarificationCard.value) return
  rewardState.value = 'loading'

  try {
    const started = await showRewardedAd((result: RewardedQaResult) => {
      if (result === 'rewarded') {
        grantClarificationCard()
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

function revealCard() {
  if (revealed.value) return

  revealed.value = true

  try {
    window.localStorage.setItem(revealedStorageKey, dateKey)
  } catch {
    // Vẫn hiển thị kết quả trong phiên hiện tại nếu localStorage không khả dụng.
  }
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

            <section class="daily__section">
              <h3>{{ ui("Meaning") }}</h3>
              <p>{{ card.meaning }}</p>
            </section>

            <section class="daily__section daily__section--advice">
              <h3>{{ ui("Advice") }}</h3>
              <p>{{ card.advice }}</p>
            </section>

            <section class="daily__reward">
              <template v-if="clarificationCard">
                <p class="daily__reward-kicker">{{ ui("Your clarification card") }}</p>
                <div class="daily__clarification">
                  <img :src="clarificationCard.image" :alt="clarificationCard.name" />
                  <div>
                    <h3>{{ clarificationCard.name }}</h3>
                    <p>{{ clarificationCard.meaning }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <h3>{{ ui("Draw a bonus clarification card") }}</h3>
                <p>{{ ui("Watch a short ad to reveal one extra card for today.") }}</p>
                <PrimaryButton
                  :disabled="rewardState === 'loading'"
                  @click="unlockClarificationCard"
                >
                  <AdIcon v-if="rewardState !== 'loading'" />
                  {{ rewardState === 'loading' ? ui("Preparing ad...") : ui("Watch ad and draw") }}
                </PrimaryButton>
                <p v-if="rewardState === 'skipped'" class="daily__reward-status">
                  {{ ui("The video was closed before the reward was earned.") }}
                </p>
                <p v-else-if="rewardState === 'unavailable'" class="daily__reward-status">
                  {{ ui("No ad is available right now. Please try again.") }}
                </p>
              </template>
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
.daily__clarification h3 {
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 14px;
}

.daily__reward > p:not(.daily__reward-kicker),
.daily__clarification p {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.daily__clarification {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
  animation: clarification-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.daily__clarification img {
  width: 72px;
  aspect-ratio: 300 / 420;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
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
  .daily__clarification {
    animation: none;
  }

  .daily-content-enter-from,
  .daily-content-leave-to {
    transform: none;
  }
}
</style>
