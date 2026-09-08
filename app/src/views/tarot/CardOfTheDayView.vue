<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { ref } from 'vue'
import { getCardOfTheDay, toDateKey } from '../../data/cardOfTheDay'
import { getCardsSnapshot } from '../../stores/cardStore'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ScreenContent from '../../components/common/ScreenContent.vue'
import PrimaryButton from '../../components/common/PrimaryButton.vue'

const today = new Date()
const dateKey = toDateKey(today)
const card = getCardOfTheDay(getCardsSnapshot(), today)
const revealedStorageKey = 'tarot:daily-revealed-date'

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

.daily__card {
  width: min(58vw, 215px);
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  perspective: 1000px;
  -webkit-tap-highlight-color: transparent;
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

@media (prefers-reduced-motion: reduce) {
  .daily__card-inner,
  .daily-content-enter-active,
  .daily-content-leave-active {
    transition: none;
    transition-delay: 0ms;
  }

  .daily-content-enter-from,
  .daily-content-leave-to {
    transform: none;
  }
}
</style>
