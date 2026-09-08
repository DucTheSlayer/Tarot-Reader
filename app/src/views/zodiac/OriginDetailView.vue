<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import { useZodiacStore } from '../../stores/zodiacStore'

const route = useRoute()
const zodiacStore = useZodiacStore()
const sign = computed(() => zodiacStore.getSign(String(route.params.signId)))
</script>

<template>
  <main class="screen origin-detail">
    <MysticalBackground />
    <ScreenHeader :title="ui(sign ? 'Zodiac Origin' : 'Sign not found')" back-to="/zodiac/origin" />

    <div v-if="sign" class="origin-detail__scroll">
      <section class="origin-detail__hero" :class="`origin-detail__hero--${sign.element}`">
        <span class="origin-detail__symbol" aria-hidden="true">{{ sign.symbol }}</span>
        <div>
          <p class="origin-detail__dates">{{ sign.dateRange }}</p>
          <h2>{{ sign.name }}</h2>
          <p class="origin-detail__summary">{{ sign.summary }}</p>
        </div>
      </section>

      <dl class="origin-detail__facts">
        <div>
          <dt>{{ ui("Element") }}</dt>
          <dd>{{ ui(sign.element) }}</dd>
        </div>
        <div>
          <dt>{{ ui("Ruling planet") }}</dt>
          <dd>{{ sign.rulingPlanet }}</dd>
        </div>
        <div>
          <dt>{{ ui("Modality") }}</dt>
          <dd>{{ ui(sign.modality) }}</dd>
        </div>
      </dl>

      <section class="origin-detail__section">
        <span class="origin-detail__eyebrow">{{ ui("Origin story") }}</span>
        <p>{{ sign.originStory }}</p>
      </section>

      <section class="origin-detail__section">
        <span class="origin-detail__eyebrow">{{ ui("Key traits") }}</span>
        <div class="origin-detail__chips">
          <span v-for="trait in sign.traits" :key="trait">{{ trait }}</span>
        </div>
      </section>

      <div class="origin-detail__columns">
        <section class="origin-detail__section">
          <span class="origin-detail__eyebrow">{{ ui("Natural gifts") }}</span>
          <ul>
            <li v-for="strength in sign.strengths" :key="strength">{{ strength }}</li>
          </ul>
        </section>
        <section class="origin-detail__section">
          <span class="origin-detail__eyebrow">{{ ui("Growing edges") }}</span>
          <ul>
            <li v-for="challenge in sign.challenges" :key="challenge">{{ challenge }}</li>
          </ul>
        </section>
      </div>

      <section class="origin-detail__section">
        <span class="origin-detail__eyebrow">{{ ui("Natural harmony") }}</span>
        <p>{{ sign.compatibleSigns.join(' · ') }}</p>
      </section>

      <blockquote>“{{ sign.reflectionPrompt }}”</blockquote>
    </div>

    <section v-else class="origin-detail__missing">
      <span aria-hidden="true">✦</span>
      <h2>{{ ui("This sign is not written in our sky") }}</h2>
      <router-link to="/zodiac/origin">{{ ui("Return to all 12 signs") }}</router-link>
    </section>
  </main>
</template>

<style scoped>
.origin-detail { isolation: isolate; }
.origin-detail__scroll {
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
.origin-detail__hero {
  --sign-accent: var(--color-gold);
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid color-mix(in srgb, var(--sign-accent) 48%, var(--color-border));
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 13% 22%, color-mix(in srgb, var(--sign-accent) 17%, transparent), transparent 38%),
    rgba(20, 10, 40, 0.86);
}
.origin-detail__hero--fire { --sign-accent: #f6a85f; }
.origin-detail__hero--earth { --sign-accent: #9fc58d; }
.origin-detail__hero--air { --sign-accent: #9ec8e8; }
.origin-detail__hero--water { --sign-accent: #938ee8; }
.origin-detail__symbol {
  min-width: 76px;
  color: var(--sign-accent);
  font: 64px/1 Georgia, serif;
  text-align: center;
  text-shadow: 0 0 20px color-mix(in srgb, var(--sign-accent) 42%, transparent);
}
.origin-detail__dates { color: var(--color-text-muted); font-size: 11px; }
.origin-detail__hero h2 { margin: 3px 0 var(--space-2); color: var(--color-gold); font-size: clamp(22px, 7vw, 34px); }
.origin-detail__summary { color: var(--color-text-muted); font-size: 12px; line-height: 1.6; }
.origin-detail__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
}
.origin-detail__facts div,
.origin-detail__section {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(26, 21, 48, 0.78);
}
.origin-detail__facts dt,
.origin-detail__eyebrow {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.origin-detail__facts dd { margin: 4px 0 0; color: var(--color-text); font-size: 11px; text-transform: capitalize; }
.origin-detail__section { display: flex; flex-direction: column; gap: var(--space-2); }
.origin-detail__section p,
.origin-detail__section li { color: var(--color-text-muted); font-size: 12px; line-height: 1.7; }
.origin-detail__chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.origin-detail__chips span {
  padding: 5px 9px;
  border: 1px solid rgba(230, 199, 107, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-size: 10px;
}
.origin-detail__columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); }
.origin-detail__section ul { display: grid; gap: var(--space-1); margin: 0; padding-left: 17px; }
.origin-detail blockquote {
  margin: 0;
  padding: var(--space-4);
  border-left: 2px solid var(--color-gold);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--color-gold-soft);
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 13px;
  line-height: 1.65;
}
.origin-detail__missing {
  z-index: 1;
  display: grid;
  flex: 1;
  place-content: center;
  gap: var(--space-3);
  text-align: center;
}
.origin-detail__missing span { color: var(--color-gold); font-size: 32px; }
.origin-detail__missing h2 { font-size: 18px; }
.origin-detail__missing a { color: var(--color-gold); }

@media (min-width: 700px) {
  .origin-detail {
    gap: 20px;
    padding: clamp(20px, 2.5vw, 32px);
    padding-bottom: calc(clamp(20px, 2.5vw, 32px) + env(safe-area-inset-bottom));
  }

  .origin-detail__scroll {
    gap: clamp(14px, 1.7vw, 20px);
    max-width: min(92vw, 1040px);
    padding: 8px 2px 28px;
  }

  .origin-detail__hero {
    gap: clamp(22px, 3vw, 34px);
    padding: clamp(22px, 3vw, 32px);
  }

  .origin-detail__symbol {
    min-width: 108px;
    font-size: clamp(78px, 9vw, 102px);
  }

  .origin-detail__dates {
    font-size: clamp(12px, 1.2vw, 14px);
  }

  .origin-detail__hero h2 {
    margin: 5px 0 10px;
    font-size: clamp(30px, 4vw, 42px);
  }

  .origin-detail__summary {
    max-width: 760px;
    font-size: clamp(13px, 1.45vw, 16px);
    line-height: 1.7;
  }

  .origin-detail__facts {
    gap: clamp(12px, 1.5vw, 18px);
  }

  .origin-detail__facts div,
  .origin-detail__section {
    padding: clamp(17px, 2vw, 24px);
    border-radius: 16px;
  }

  .origin-detail__facts dt,
  .origin-detail__eyebrow {
    font-size: clamp(10px, 1.05vw, 12px);
  }

  .origin-detail__facts dd {
    margin-top: 7px;
    font-size: clamp(13px, 1.35vw, 15px);
  }

  .origin-detail__section {
    gap: var(--space-3);
  }

  .origin-detail__section p,
  .origin-detail__section li {
    font-size: clamp(13px, 1.4vw, 16px);
    line-height: 1.75;
  }

  .origin-detail__chips {
    gap: 10px;
  }

  .origin-detail__chips span {
    padding: 7px 12px;
    font-size: clamp(11px, 1.2vw, 13px);
  }

  .origin-detail__columns {
    gap: clamp(12px, 1.5vw, 18px);
  }

  .origin-detail__section ul {
    gap: 6px;
    padding-left: 20px;
  }

  .origin-detail blockquote {
    padding: clamp(19px, 2.2vw, 26px);
    border-left-width: 3px;
    font-size: clamp(14px, 1.55vw, 17px);
    line-height: 1.75;
  }
}

@media (max-width: 360px) {
  .origin-detail__symbol { min-width: 54px; font-size: 48px; }
  .origin-detail__columns { grid-template-columns: 1fr; }
}
</style>
