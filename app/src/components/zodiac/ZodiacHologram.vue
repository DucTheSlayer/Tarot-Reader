<script setup lang="ts">
import { ref } from 'vue'
import type { ZodiacElement } from '../../types/zodiac'

withDefaults(
  defineProps<{
    signId: string
    symbol: string
    size?: 'small' | 'medium' | 'large'
    element?: ZodiacElement
    reveal?: boolean
  }>(),
  {
    size: 'medium',
    element: undefined,
    reveal: false
  }
)

const failed = ref(false)
</script>

<template>
  <span
    class="zodiac-hologram"
    :class="[
      `zodiac-hologram--${size}`,
      element ? `zodiac-hologram--${element}` : '',
      { 'zodiac-hologram--reveal': reveal }
    ]"
    aria-hidden="true"
  >
    <img
      v-if="!failed"
      :src="`/zodiac/${signId}.webp`"
      alt=""
      decoding="async"
      @error="failed = true"
    />
    <span v-else class="zodiac-hologram__fallback">{{ symbol }}</span>
    <span class="zodiac-hologram__scan" aria-hidden="true"></span>
    <span class="zodiac-hologram__shine" aria-hidden="true"></span>
    <span v-if="element && reveal" class="zodiac-hologram__element-effect" aria-hidden="true">
      <i v-for="particle in 6" :key="particle"></i>
    </span>
  </span>
</template>

<style scoped>
.zodiac-hologram {
  --hologram-size: 72px;
  position: relative;
  display: inline-grid;
  width: var(--hologram-size);
  aspect-ratio: 1;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--sign-accent, var(--color-gold)) 70%, #fff 10%);
  border-radius: 22%;
  background: #0a0817;
  box-shadow:
    inset 0 0 16px color-mix(in srgb, var(--sign-accent, var(--color-gold)) 19%, transparent),
    0 0 12px color-mix(in srgb, var(--sign-accent, var(--color-gold)) 24%, transparent);
  isolation: isolate;
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.zodiac-hologram--small { --hologram-size: 54px; }
.zodiac-hologram--medium { --hologram-size: 68px; }
.zodiac-hologram--large { --hologram-size: 92px; }

.zodiac-hologram--fire { --element-glow: #ff9d5c; }
.zodiac-hologram--earth { --element-glow: #9fc58d; }
.zodiac-hologram--air { --element-glow: #a9dcff; }
.zodiac-hologram--water { --element-glow: #9b92ff; }

.zodiac-hologram--reveal {
  animation: zodiac-frame-reveal 820ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.zodiac-hologram--reveal img,
.zodiac-hologram--reveal .zodiac-hologram__fallback {
  animation:
    zodiac-art-reveal 760ms cubic-bezier(0.2, 0.9, 0.25, 1) both,
    hologram-pulse 4.8s 760ms ease-in-out infinite;
}

.zodiac-hologram::before {
  position: absolute;
  inset: 8%;
  z-index: 1;
  border: 1px solid color-mix(in srgb, var(--sign-accent, var(--color-gold)) 40%, transparent);
  border-radius: 18%;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.08);
  content: '';
  pointer-events: none;
}

.zodiac-hologram img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.96) contrast(1.04) brightness(0.96);
  animation: hologram-pulse 4.8s ease-in-out infinite;
}

.zodiac-hologram__fallback {
  color: var(--sign-accent, var(--color-gold));
  font: 700 calc(var(--hologram-size) * 0.54) / 1 Georgia, serif;
  text-shadow: 0 0 14px currentColor;
}

.zodiac-hologram__scan,
.zodiac-hologram__shine,
.zodiac-hologram__element-effect {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  pointer-events: none;
}

.zodiac-hologram__element-effect {
  z-index: 3;
  overflow: hidden;
}

.zodiac-hologram__element-effect i,
.zodiac-hologram__element-effect::before,
.zodiac-hologram__element-effect::after {
  position: absolute;
  display: block;
  content: '';
}

/* Fire: sparks rise from the lower edge. */
.zodiac-hologram--fire .zodiac-hologram__element-effect {
  background: radial-gradient(circle at 50% 112%, rgba(255, 125, 56, 0.56), transparent 58%);
  animation: zodiac-fire-flare 1050ms ease-out both;
}

.zodiac-hologram--fire .zodiac-hologram__element-effect i {
  bottom: 8%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #ffd49a;
  box-shadow: 0 0 7px var(--element-glow);
  animation: zodiac-fire-spark 900ms ease-out both;
}

.zodiac-hologram--fire .zodiac-hologram__element-effect i:nth-child(1) { left: 14%; animation-delay: 60ms; }
.zodiac-hologram--fire .zodiac-hologram__element-effect i:nth-child(2) { left: 29%; animation-delay: 170ms; }
.zodiac-hologram--fire .zodiac-hologram__element-effect i:nth-child(3) { left: 44%; animation-delay: 20ms; }
.zodiac-hologram--fire .zodiac-hologram__element-effect i:nth-child(4) { left: 58%; animation-delay: 230ms; }
.zodiac-hologram--fire .zodiac-hologram__element-effect i:nth-child(5) { left: 72%; animation-delay: 110ms; }
.zodiac-hologram--fire .zodiac-hologram__element-effect i:nth-child(6) { left: 86%; animation-delay: 280ms; }

/* Earth: grounded rings and softly drifting motes. */
.zodiac-hologram--earth .zodiac-hologram__element-effect::before,
.zodiac-hologram--earth .zodiac-hologram__element-effect::after {
  inset: 17%;
  border: 1px solid color-mix(in srgb, var(--element-glow) 72%, transparent);
  border-radius: 28%;
  animation: zodiac-earth-ring 1050ms ease-out both;
}

.zodiac-hologram--earth .zodiac-hologram__element-effect::after {
  inset: 5%;
  animation-delay: 140ms;
}

.zodiac-hologram--earth .zodiac-hologram__element-effect i {
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: #d9e8b2;
  box-shadow: 0 0 6px var(--element-glow);
  animation: zodiac-earth-mote 900ms ease-out both;
}

.zodiac-hologram--earth .zodiac-hologram__element-effect i:nth-child(1) { left: 13%; top: 27%; }
.zodiac-hologram--earth .zodiac-hologram__element-effect i:nth-child(2) { left: 29%; top: 72%; animation-delay: 90ms; }
.zodiac-hologram--earth .zodiac-hologram__element-effect i:nth-child(3) { left: 47%; top: 16%; animation-delay: 180ms; }
.zodiac-hologram--earth .zodiac-hologram__element-effect i:nth-child(4) { left: 61%; top: 76%; animation-delay: 40ms; }
.zodiac-hologram--earth .zodiac-hologram__element-effect i:nth-child(5) { left: 78%; top: 33%; animation-delay: 220ms; }
.zodiac-hologram--earth .zodiac-hologram__element-effect i:nth-child(6) { left: 86%; top: 62%; animation-delay: 130ms; }

/* Air: two light orbit paths sweep around the sign. */
.zodiac-hologram--air .zodiac-hologram__element-effect::before,
.zodiac-hologram--air .zodiac-hologram__element-effect::after {
  inset: 18% -18%;
  border: 1px solid rgba(194, 232, 255, 0.72);
  border-right-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
  animation: zodiac-air-orbit 1050ms ease-out both;
}

.zodiac-hologram--air .zodiac-hologram__element-effect::after {
  inset: 29% -8%;
  animation-delay: 120ms;
  animation-direction: reverse;
}

.zodiac-hologram--air .zodiac-hologram__element-effect i {
  left: -18%;
  width: 24%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #d9f2ff);
  box-shadow: 0 0 5px var(--element-glow);
  animation: zodiac-air-streak 780ms ease-out both;
}

.zodiac-hologram--air .zodiac-hologram__element-effect i:nth-child(1) { top: 18%; animation-delay: 40ms; }
.zodiac-hologram--air .zodiac-hologram__element-effect i:nth-child(2) { top: 31%; animation-delay: 150ms; }
.zodiac-hologram--air .zodiac-hologram__element-effect i:nth-child(3) { top: 44%; animation-delay: 80ms; }
.zodiac-hologram--air .zodiac-hologram__element-effect i:nth-child(4) { top: 57%; animation-delay: 230ms; }
.zodiac-hologram--air .zodiac-hologram__element-effect i:nth-child(5) { top: 70%; animation-delay: 120ms; }
.zodiac-hologram--air .zodiac-hologram__element-effect i:nth-child(6) { top: 82%; animation-delay: 270ms; }

/* Water: concentric ripples and bubbles bloom from the center. */
.zodiac-hologram--water .zodiac-hologram__element-effect::before,
.zodiac-hologram--water .zodiac-hologram__element-effect::after {
  left: 50%;
  top: 50%;
  width: 34%;
  aspect-ratio: 1;
  border: 1px solid rgba(181, 198, 255, 0.82);
  border-radius: 50%;
  animation: zodiac-water-ripple 1100ms ease-out both;
}

.zodiac-hologram--water .zodiac-hologram__element-effect::after { animation-delay: 180ms; }

.zodiac-hologram--water .zodiac-hologram__element-effect i {
  bottom: 12%;
  width: 4px;
  height: 4px;
  border: 1px solid #cbd4ff;
  border-radius: 50%;
  box-shadow: 0 0 5px var(--element-glow);
  animation: zodiac-water-bubble 920ms ease-out both;
}

.zodiac-hologram--water .zodiac-hologram__element-effect i:nth-child(1) { left: 18%; animation-delay: 60ms; }
.zodiac-hologram--water .zodiac-hologram__element-effect i:nth-child(2) { left: 32%; animation-delay: 210ms; }
.zodiac-hologram--water .zodiac-hologram__element-effect i:nth-child(3) { left: 45%; animation-delay: 120ms; }
.zodiac-hologram--water .zodiac-hologram__element-effect i:nth-child(4) { left: 59%; animation-delay: 290ms; }
.zodiac-hologram--water .zodiac-hologram__element-effect i:nth-child(5) { left: 73%; animation-delay: 160ms; }
.zodiac-hologram--water .zodiac-hologram__element-effect i:nth-child(6) { left: 84%; animation-delay: 350ms; }

.zodiac-hologram__scan {
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 3px,
    rgba(188, 224, 255, 0.09) 4px,
    transparent 5px
  );
  mix-blend-mode: screen;
  opacity: 0.55;
}

.zodiac-hologram__shine {
  width: 62%;
  left: -82%;
  background: linear-gradient(
    105deg,
    transparent 5%,
    rgba(135, 218, 255, 0.08) 28%,
    rgba(255, 231, 157, 0.34) 50%,
    rgba(198, 145, 255, 0.13) 70%,
    transparent 95%
  );
  filter: blur(1px);
  transform: skewX(-12deg);
  animation: hologram-sweep 5.2s ease-in-out infinite;
}

@media (hover: hover) {
  .zodiac-hologram:hover {
    transform: translateY(-2px) scale(1.025);
    box-shadow:
      inset 0 0 18px color-mix(in srgb, var(--sign-accent, var(--color-gold)) 24%, transparent),
      0 0 19px color-mix(in srgb, var(--sign-accent, var(--color-gold)) 38%, transparent);
  }
}

@keyframes hologram-sweep {
  0%, 18% { transform: translateX(0) skewX(-12deg); opacity: 0; }
  28% { opacity: 1; }
  58%, 100% { transform: translateX(310%) skewX(-12deg); opacity: 0; }
}

@keyframes hologram-pulse {
  0%, 100% { filter: saturate(0.94) contrast(1.04) brightness(0.94); }
  50% { filter: saturate(1.08) contrast(1.07) brightness(1.04); }
}

@keyframes zodiac-frame-reveal {
  0% { opacity: 0; transform: scale(0.72) rotate(-4deg); filter: brightness(1.7); }
  58% { opacity: 1; transform: scale(1.07) rotate(1deg); filter: brightness(1.18); }
  100% { opacity: 1; transform: scale(1) rotate(0); filter: brightness(1); }
}

@keyframes zodiac-art-reveal {
  from { opacity: 0.28; transform: scale(1.18); filter: saturate(0.5) brightness(1.55) blur(2px); }
  to { opacity: 1; transform: scale(1); filter: saturate(0.96) contrast(1.04) brightness(0.96); }
}

@keyframes zodiac-fire-flare {
  0% { opacity: 0; transform: scaleY(0.3); transform-origin: bottom; }
  32% { opacity: 1; }
  100% { opacity: 0; transform: scaleY(1.18); transform-origin: bottom; }
}

@keyframes zodiac-fire-spark {
  0% { opacity: 0; transform: translate(0, 5px) scale(0.4); }
  22% { opacity: 1; }
  100% { opacity: 0; transform: translate(7px, calc(var(--hologram-size) * -0.72)) scale(0.1); }
}

@keyframes zodiac-earth-ring {
  0% { opacity: 0; transform: scale(0.55) rotate(-15deg); }
  38% { opacity: 0.9; }
  100% { opacity: 0; transform: scale(1.38) rotate(8deg); }
}

@keyframes zodiac-earth-mote {
  0% { opacity: 0; transform: translateY(7px) rotate(0); }
  38% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-7px) rotate(90deg); }
}

@keyframes zodiac-air-orbit {
  0% { opacity: 0; transform: scale(0.45) rotate(-28deg); }
  42% { opacity: 0.9; }
  100% { opacity: 0; transform: scale(1.12) rotate(30deg); }
}

@keyframes zodiac-air-streak {
  0% { opacity: 0; transform: translateX(0) scaleX(0.3); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: translateX(calc(var(--hologram-size) * 1.25)) scaleX(1); }
}

@keyframes zodiac-water-ripple {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
  34% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(3.4); }
}

@keyframes zodiac-water-bubble {
  0% { opacity: 0; transform: translateY(4px) scale(0.5); }
  28% { opacity: 1; }
  100% { opacity: 0; transform: translateY(calc(var(--hologram-size) * -0.68)) scale(1.25); }
}

@media (prefers-reduced-motion: reduce) {
  .zodiac-hologram,
  .zodiac-hologram img,
  .zodiac-hologram__shine,
  .zodiac-hologram__element-effect,
  .zodiac-hologram__element-effect::before,
  .zodiac-hologram__element-effect::after,
  .zodiac-hologram__element-effect i {
    animation: none !important;
    transition: none;
  }
}
</style>
