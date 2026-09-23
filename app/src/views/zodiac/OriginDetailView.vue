<script setup lang="ts">
import { ui } from '../../i18n/reading'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ZodiacHologram from '../../components/zodiac/ZodiacHologram.vue'
import { useZodiacStore } from '../../stores/zodiacStore'

const route = useRoute()
const zodiacStore = useZodiacStore()
const sign = computed(() => zodiacStore.getSign(String(route.params.signId)))
</script>

<template>
  <main
    class="screen origin-detail"
    :class="sign ? `origin-detail--${sign.element}` : ''"
  >
    <MysticalBackground />

    <div v-if="sign" class="origin-detail__atmosphere" aria-hidden="true">
      <img :src="`/zodiac/${sign.id}.webp`" alt="" decoding="async" />
      <span class="origin-detail__orbit origin-detail__orbit--outer"></span>
      <span class="origin-detail__orbit origin-detail__orbit--inner"></span>
      <i v-for="particle in 9" :key="particle"></i>
    </div>

    <ScreenHeader :title="ui(sign ? 'Zodiac Origin' : 'Sign not found')" back-to="/zodiac/origin" />

    <div v-if="sign" class="origin-detail__scroll">
      <section class="origin-detail__hero" :class="`origin-detail__hero--${sign.element}`">
        <ZodiacHologram
          :key="sign.id"
          class="origin-detail__symbol"
          :sign-id="sign.id"
          :symbol="sign.symbol"
          :element="sign.element"
          size="large"
          reveal
        />
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
.origin-detail {
  --origin-accent: var(--color-gold);
  --origin-accent-rgb: 230, 199, 107;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(circle at 78% 18%, rgba(var(--origin-accent-rgb), 0.12), transparent 34%),
    linear-gradient(150deg, #211139 0%, #180d31 50%, #120a28 100%);
}

.origin-detail--fire {
  --origin-accent: #f6a85f;
  --origin-accent-rgb: 246, 168, 95;
  background:
    radial-gradient(circle at 78% 16%, rgba(255, 125, 61, 0.22), transparent 30%),
    radial-gradient(circle at 28% 84%, rgba(125, 36, 42, 0.22), transparent 34%),
    linear-gradient(145deg, #28102e 0%, #1e102f 50%, #140a27 100%);
}

.origin-detail--earth {
  --origin-accent: #9fc58d;
  --origin-accent-rgb: 159, 197, 141;
  background:
    radial-gradient(circle at 78% 16%, rgba(125, 177, 112, 0.2), transparent 31%),
    radial-gradient(circle at 20% 80%, rgba(91, 113, 67, 0.2), transparent 34%),
    linear-gradient(145deg, #15262c 0%, #171b2c 52%, #120e26 100%);
}

.origin-detail--air {
  --origin-accent: #9ec8e8;
  --origin-accent-rgb: 158, 200, 232;
  background:
    radial-gradient(circle at 78% 16%, rgba(111, 194, 236, 0.22), transparent 31%),
    radial-gradient(circle at 22% 82%, rgba(128, 119, 218, 0.18), transparent 36%),
    linear-gradient(145deg, #101d39 0%, #171431 54%, #110b28 100%);
}

.origin-detail--water {
  --origin-accent: #938ee8;
  --origin-accent-rgb: 147, 142, 232;
  background:
    radial-gradient(circle at 78% 16%, rgba(112, 101, 224, 0.24), transparent 31%),
    radial-gradient(circle at 18% 84%, rgba(44, 117, 162, 0.2), transparent 36%),
    linear-gradient(145deg, #101533 0%, #191137 52%, #110a29 100%);
}

.origin-detail__atmosphere {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.origin-detail__atmosphere::before {
  position: absolute;
  inset: -18%;
  background: conic-gradient(
    from 20deg at 72% 28%,
    transparent 0 22%,
    rgba(var(--origin-accent-rgb), 0.07) 30%,
    transparent 39% 67%,
    rgba(var(--origin-accent-rgb), 0.05) 75%,
    transparent 84%
  );
  content: '';
  animation: origin-aurora-turn 28s linear infinite;
}

.origin-detail__atmosphere::after {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(12, 6, 28, 0.08), rgba(12, 6, 28, 0.5)),
    radial-gradient(circle at center, transparent 25%, rgba(7, 4, 20, 0.34) 100%);
  content: '';
}

.origin-detail__atmosphere img {
  position: absolute;
  top: 10%;
  right: -3%;
  width: min(46vw, 520px);
  min-width: 300px;
  aspect-ratio: 1;
  border-radius: 24%;
  object-fit: cover;
  opacity: 0.11;
  filter: saturate(1.15) contrast(1.08) drop-shadow(0 0 42px rgba(var(--origin-accent-rgb), 0.36));
  -webkit-mask-image: radial-gradient(circle, #000 30%, rgba(0, 0, 0, 0.78) 54%, transparent 73%);
  mask-image: radial-gradient(circle, #000 30%, rgba(0, 0, 0, 0.78) 54%, transparent 73%);
  animation: origin-art-breathe 8s ease-in-out infinite;
}

.origin-detail__orbit {
  position: absolute;
  top: 48%;
  left: 68%;
  border: 1px solid rgba(var(--origin-accent-rgb), 0.16);
  border-right-color: transparent;
  border-bottom-color: rgba(var(--origin-accent-rgb), 0.05);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-14deg);
}

.origin-detail__orbit--outer {
  width: min(72vw, 760px);
  aspect-ratio: 1;
  animation: origin-orbit 32s linear infinite;
}

.origin-detail__orbit--inner {
  width: min(49vw, 510px);
  aspect-ratio: 1;
  animation: origin-orbit-reverse 23s linear infinite;
}

.origin-detail__atmosphere i {
  position: absolute;
  z-index: 1;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(var(--origin-accent-rgb), 0.9);
  box-shadow: 0 0 9px rgba(var(--origin-accent-rgb), 0.85);
  animation: origin-star-drift 5.6s ease-in-out infinite;
}

.origin-detail__atmosphere i:nth-of-type(1) { left: 8%; top: 23%; animation-delay: -0.5s; }
.origin-detail__atmosphere i:nth-of-type(2) { left: 19%; top: 67%; animation-delay: -2.3s; }
.origin-detail__atmosphere i:nth-of-type(3) { left: 31%; top: 39%; animation-delay: -4.1s; }
.origin-detail__atmosphere i:nth-of-type(4) { left: 45%; top: 82%; animation-delay: -1.4s; }
.origin-detail__atmosphere i:nth-of-type(5) { left: 57%; top: 18%; animation-delay: -3.7s; }
.origin-detail__atmosphere i:nth-of-type(6) { left: 69%; top: 61%; animation-delay: -0.9s; }
.origin-detail__atmosphere i:nth-of-type(7) { left: 79%; top: 35%; animation-delay: -2.8s; }
.origin-detail__atmosphere i:nth-of-type(8) { left: 88%; top: 76%; animation-delay: -4.6s; }
.origin-detail__atmosphere i:nth-of-type(9) { left: 94%; top: 13%; animation-delay: -1.9s; }

.origin-detail :deep(.screen-header) {
  position: relative;
  z-index: 2;
}

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
    radial-gradient(circle at 13% 22%, color-mix(in srgb, var(--sign-accent) 21%, transparent), transparent 38%),
    linear-gradient(120deg, rgba(24, 12, 43, 0.94), rgba(17, 9, 37, 0.8));
  box-shadow:
    0 18px 48px rgba(4, 2, 16, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(12px);
}
.origin-detail__hero--fire { --sign-accent: #f6a85f; }
.origin-detail__hero--earth { --sign-accent: #9fc58d; }
.origin-detail__hero--air { --sign-accent: #9ec8e8; }
.origin-detail__hero--water { --sign-accent: #938ee8; }
.origin-detail__symbol {
  --hologram-size: 82px;
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
  background: rgba(22, 16, 45, 0.76);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.018);
  backdrop-filter: blur(10px);
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

@keyframes origin-aurora-turn {
  to { transform: rotate(360deg); }
}

@keyframes origin-art-breathe {
  0%, 100% { opacity: 0.08; transform: scale(0.97) rotate(-2deg); }
  50% { opacity: 0.14; transform: scale(1.025) rotate(1deg); }
}

@keyframes origin-orbit {
  from { transform: translate(-50%, -50%) rotate(-14deg); }
  to { transform: translate(-50%, -50%) rotate(346deg); }
}

@keyframes origin-orbit-reverse {
  from { transform: translate(-50%, -50%) rotate(18deg); }
  to { transform: translate(-50%, -50%) rotate(-342deg); }
}

@keyframes origin-star-drift {
  0%, 100% { opacity: 0.22; transform: translateY(5px) scale(0.65); }
  50% { opacity: 0.9; transform: translateY(-7px) scale(1.15); }
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
    --hologram-size: clamp(98px, 11vw, 124px);
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
  .origin-detail__symbol { --hologram-size: 64px; }
  .origin-detail__columns { grid-template-columns: 1fr; }
}

@media (max-width: 699px) {
  .origin-detail__atmosphere img {
    top: 5%;
    right: -38%;
    width: 118vw;
    min-width: 0;
    opacity: 0.08;
  }

  .origin-detail__orbit {
    left: 72%;
  }

  .origin-detail__orbit--outer { width: 138vw; }
  .origin-detail__orbit--inner { width: 92vw; }
}

@media (prefers-reduced-motion: reduce) {
  .origin-detail__atmosphere::before,
  .origin-detail__atmosphere img,
  .origin-detail__orbit,
  .origin-detail__atmosphere i {
    animation: none !important;
  }
}
</style>
