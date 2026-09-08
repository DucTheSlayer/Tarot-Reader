<script setup lang="ts">
interface Star {
  left: number
  top: number
  size: number
  duration: number
  delay: number
  min: number
  max: number
  color: string
}

const signs = [
  'M6 4 C4 8 6 11 10 10 M18 4 C20 8 18 11 14 10 M12 4 V20',
  'M9 15 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M9 13 C8 9 6 7 3 6 M15 13 C16 9 18 7 21 6',
  'M5 3 H19 M7 4 V21 M17 4 V21 M5 21 H19',
  'M7 11 a3 3 0 1 0 0.01 0 M17 11 a3 3 0 1 0 0.01 0 M7 8 C5 6 4.5 5 6 4 M17 8 C19 6 19.5 5 18 4',
  'M12 4 C8 4 7 8 9 10 C11 12 13 12 13 10 M12 10 C11 15 8 17 6 19 M12 10 C14 14 17 16 18 18',
  'M6 3 H12 M6 3 V13 M6 3 L12 12 M12 12 V5 M12 12 C13.5 15 17 15 17 12',
  'M4 5 H20 M12 5 L8 13 M12 5 L16 13 M7 13 H17',
  'M6 3 V13 M6 3 L12 13 M12 13 V7 M12 13 L17 9 M17 9 L14 7 M17 9 L15 12',
  'M8 3 V21 M8 10 H18 M18 10 L14 7 M18 10 L14 13 M8 3 C5 3 4 5 6 6',
  'M9 3 C9 7 12 8 12 12 C12 16 15 17 15 13 C15 10 18 10 18 13 M12 12 C11 17 8 19 6 18',
  'M4 8 L7 11 L10 8 L13 11 L16 8 L19 11 M4 17 L7 20 L10 17 L13 20 L16 17 L19 20',
  'M10 4 C7 4 6 8 6 12 C6 16 7 20 10 20 M14 4 C17 4 18 8 18 12 C18 16 17 20 14 20 M6 12 H18'
]

const stars: Star[] = Array.from({ length: 18 }, () => ({
  left: Math.round(Math.random() * 1000) / 10,
  top: Math.round(Math.random() * 1000) / 10,
  size: Math.round((1 + Math.random() * 2) * 10) / 10,
  duration: Math.round((2 + Math.random() * 2) * 10) / 10,
  delay: Math.round(Math.random() * 40) / 10,
  min: Math.round((0.2 + Math.random() * 0.15) * 100) / 100,
  max: Math.round((0.45 + Math.random() * 0.15) * 100) / 100,
  color: Math.random() < 0.3 ? 'var(--color-gold)' : '#ffffff'
}))
</script>

<template>
  <div class="mystical-bg" aria-hidden="true">
    <div class="mystical-bg__glow"></div>

    <div class="mystical-bg__wheel">
      <svg class="mystical-bg__wheel-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="0.5" />
        <g
          v-for="(d, i) in signs"
          :key="i"
          :transform="`rotate(${i * 30} 50 50) translate(39.5 0) scale(0.22)`"
        >
          <path
            :d="d"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
    </div>

    <span
      v-for="(star, i) in stars"
      :key="i"
      class="mystical-bg__star"
      :style="{
        left: `${star.left}%`,
        top: `${star.top}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        color: star.color,
        animationDuration: `${star.duration}s`,
        animationDelay: `${star.delay}s`,
        '--twinkle-min': `${star.min}`,
        '--twinkle-max': `${star.max}`
      }"
    ></span>
  </div>
</template>

<style scoped>
.mystical-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.mystical-bg__wheel {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(160vmin, 120vh);
  height: min(160vmin, 120vh);
  transform: translate(-50%, -50%);
  color: var(--color-gold);
  opacity: 0.07;
}

.mystical-bg__wheel-svg {
  width: 100%;
  height: 100%;
}

.mystical-bg__glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 88vmin;
  height: 88vmin;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-primary) 0%, transparent 65%);
  opacity: 0.13;
}

.mystical-bg__star {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 2px currentColor;
  animation: mystical-twinkle 3s ease-in-out infinite both;
}

@keyframes mystical-twinkle {
  0%,
  100% {
    opacity: var(--twinkle-min);
  }
  50% {
    opacity: var(--twinkle-max);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mystical-bg__star {
    animation: none;
  }
}
</style>
