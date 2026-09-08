<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed, nextTick, ref } from 'vue'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import PeriodTabs from '../../components/zodiac/PeriodTabs.vue'
import ZodiacSignPicker from '../../components/zodiac/ZodiacSignPicker.vue'
import { useZodiacStore } from '../../stores/zodiacStore'
import type { HoroscopePeriod, ZodiacSign } from '../../types/zodiac'

const zodiacStore = useZodiacStore()
const selectedSign = ref<ZodiacSign | null>(null)
const period = ref<HoroscopePeriod>('day')
const resultHeading = ref<HTMLElement | null>(null)

const reading = computed(() => {
  if (!selectedSign.value) return undefined
  return zodiacStore.getReading(selectedSign.value.id, period.value)
})

const sections = computed(() => {
  if (!reading.value) return []
  return [
    { key: 'love', symbol: '♡', title: 'Love', text: reading.value.love },
    { key: 'career', symbol: '✦', title: 'Career', text: reading.value.career },
    { key: 'finance', symbol: '◇', title: 'Finance', text: reading.value.finance },
    { key: 'wellbeing', symbol: '☾', title: 'Wellbeing', text: reading.value.wellbeing }
  ]
})

async function chooseSign(sign: ZodiacSign) {
  selectedSign.value = sign
  await nextTick()
  resultHeading.value?.focus()
}
</script>

<template>
  <main class="screen horoscope">
    <MysticalBackground />
    <ScreenHeader :title='ui("Horoscope")' back-to="/zodiac" />

    <div class="horoscope__scroll">
      <template v-if="!selectedSign">
        <section class="horoscope__intro">
          <span aria-hidden="true">☾</span>
          <div>
            <h2>{{ ui("Choose your sign") }}</h2>
            <p>{{ ui("Select a zodiac sign, then explore its Day, Week, or Year reflection.") }}</p>
          </div>
        </section>
        <ZodiacSignPicker
          :signs="zodiacStore.signs.value"
          mode="buttons"
          @select="chooseSign"
        />
      </template>

      <template v-else-if="reading">
        <section class="horoscope__sign" :class="`horoscope__sign--${selectedSign.element}`">
          <span class="horoscope__symbol" aria-hidden="true">{{ selectedSign.symbol }}</span>
          <div>
            <span>{{ selectedSign.dateRange }}</span>
            <h2 ref="resultHeading" tabindex="-1">{{ selectedSign.name }}</h2>
            <p>{{ ui('{element} · ruled by {planet}', { element: ui(selectedSign.element), planet: selectedSign.rulingPlanet }) }}</p>
          </div>
          <button type="button" @click="selectedSign = null">{{ ui("Change") }}</button>
        </section>

        <PeriodTabs v-model="period" />

        <section id="horoscope-panel" class="horoscope__overview" role="tabpanel">
          <span class="horoscope__eyebrow">{{ ui('{period} overview', { period: ui(period) }) }}</span>
          <p>{{ reading.overview }}</p>
        </section>

        <div class="horoscope__reading-grid">
          <section v-for="section in sections" :key="section.key" class="horoscope__reading-card">
            <div>
              <span aria-hidden="true">{{ section.symbol }}</span>
              <h3>{{ ui(section.title) }}</h3>
            </div>
            <p>{{ section.text }}</p>
          </section>
        </div>

        <section class="horoscope__guidance">
          <span aria-hidden="true">✦</span>
          <div>
            <h3>{{ ui("Your compass") }}</h3>
            <p>{{ reading.guidance }}</p>
          </div>
        </section>

        <p class="horoscope__disclaimer">{{ ui("A reflective reading for entertainment, not medical, legal, or financial advice.") }}</p>
      </template>
    </div>
  </main>
</template>

<style scoped>
.horoscope { isolation: isolate; }
.horoscope__scroll {
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 2px 1px var(--space-3);
}
.horoscope__intro {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid rgba(230, 199, 107, 0.28);
  border-radius: var(--radius-lg);
  background: rgba(20, 10, 40, 0.78);
}
.horoscope__intro > span { color: var(--color-gold); font-size: 32px; }
.horoscope__intro h2 { color: var(--color-gold); font-size: 18px; }
.horoscope__intro p { margin-top: 5px; color: var(--color-text-muted); font-size: 12px; line-height: 1.55; }
.horoscope__sign {
  --sign-accent: var(--color-gold);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid color-mix(in srgb, var(--sign-accent) 45%, var(--color-border));
  border-radius: var(--radius-lg);
  background: rgba(20, 10, 40, 0.84);
}
.horoscope__sign--fire { --sign-accent: #f6a85f; }
.horoscope__sign--earth { --sign-accent: #9fc58d; }
.horoscope__sign--air { --sign-accent: #9ec8e8; }
.horoscope__sign--water { --sign-accent: #938ee8; }
.horoscope__symbol { color: var(--sign-accent); font: 40px/1 Georgia, serif; text-shadow: 0 0 14px color-mix(in srgb, var(--sign-accent) 46%, transparent); }
.horoscope__sign div > span,
.horoscope__sign p { color: var(--color-text-muted); font-size: 10px; text-transform: capitalize; }
.horoscope__sign h2 { margin: 2px 0; color: var(--color-gold); font-size: 19px; outline: 0; }
.horoscope__sign button {
  min-height: 30px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  color: var(--color-gold);
  font: 600 10px/1 var(--font-sans);
  cursor: pointer;
}
.horoscope__overview,
.horoscope__reading-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(26, 21, 48, 0.78);
}
.horoscope__overview { border-color: rgba(230, 199, 107, 0.34); }
.horoscope__eyebrow {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.horoscope__overview p,
.horoscope__reading-card p,
.horoscope__guidance p { color: var(--color-text-muted); font-size: 12px; line-height: 1.7; }
.horoscope__reading-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); }
.horoscope__reading-card > div { display: flex; align-items: center; gap: var(--space-2); }
.horoscope__reading-card > div span { color: var(--color-gold); font-size: 18px; }
.horoscope__reading-card h3 { color: var(--color-text); font-size: 12px; }
.horoscope__guidance {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid rgba(230, 199, 107, 0.45);
  border-radius: var(--radius-md);
  background: var(--color-gold-soft);
}
.horoscope__guidance > span { color: var(--color-gold); font-size: 24px; }
.horoscope__guidance h3 { margin-bottom: var(--space-1); color: var(--color-gold); font-size: 13px; }
.horoscope__disclaimer { padding: 0 var(--space-2); color: var(--color-text-muted); font-size: 9px; line-height: 1.5; text-align: center; }
.horoscope button:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }

@media (min-width: 700px) {
  .horoscope {
    gap: 20px;
    padding: clamp(20px, 2.5vw, 32px);
    padding-bottom: calc(clamp(20px, 2.5vw, 32px) + env(safe-area-inset-bottom));
  }

  .horoscope__scroll {
    gap: clamp(16px, 2vw, 24px);
    max-width: min(92vw, 1040px);
    padding: 8px 2px 24px;
  }

  .horoscope__intro {
    gap: var(--space-4);
    padding: 18px 22px;
  }

  .horoscope__intro > span {
    font-size: 40px;
  }

  .horoscope__intro h2 {
    font-size: clamp(19px, 2vw, 23px);
  }

  .horoscope__intro p {
    margin-top: 7px;
    font-size: clamp(13px, 1.35vw, 15px);
    line-height: 1.65;
  }

  .horoscope__sign {
    gap: 18px;
    padding: 18px 22px;
  }

  .horoscope__symbol {
    font-size: clamp(48px, 5vw, 58px);
  }

  .horoscope__sign div > span,
  .horoscope__sign p {
    font-size: clamp(11px, 1.15vw, 13px);
  }

  .horoscope__sign h2 {
    margin: 4px 0;
    font-size: clamp(22px, 2.5vw, 28px);
  }

  .horoscope__sign button {
    min-height: 40px;
    padding: 0 16px;
    font-size: 12px;
  }

  .horoscope__overview,
  .horoscope__reading-card {
    gap: var(--space-3);
    padding: clamp(18px, 2.2vw, 24px);
  }

  .horoscope__eyebrow {
    font-size: 12px;
  }

  .horoscope__overview p,
  .horoscope__reading-card p,
  .horoscope__guidance p {
    font-size: clamp(13px, 1.35vw, 15px);
    line-height: 1.75;
  }

  .horoscope__reading-grid {
    gap: clamp(12px, 1.6vw, 18px);
  }

  .horoscope__reading-card > div {
    gap: var(--space-3);
  }

  .horoscope__reading-card > div span {
    font-size: 24px;
  }

  .horoscope__reading-card h3,
  .horoscope__guidance h3 {
    font-size: 15px;
  }

  .horoscope__guidance {
    gap: var(--space-4);
    padding: clamp(18px, 2.2vw, 24px);
  }

  .horoscope__guidance > span {
    font-size: 30px;
  }

  .horoscope__disclaimer {
    font-size: 11px;
  }
}

@media (max-width: 360px) {
  .horoscope__reading-grid { grid-template-columns: 1fr; }
}
</style>
