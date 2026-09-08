<script lang="ts">
let previousModeIndex: number | null = null
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const activeModeIndex = computed(() => {
  if (route.path.startsWith('/zodiac')) return 1
  if (route.path.startsWith('/settings')) return 2
  return 0
})

const originIndex = previousModeIndex ?? activeModeIndex.value
const sliderIndex = ref(originIndex)
const isSliding = ref(false)

onMounted(() => {
  const targetIndex = activeModeIndex.value

  if (sliderIndex.value === targetIndex) {
    previousModeIndex = targetIndex
    return
  }

  requestAnimationFrame(() => {
    isSliding.value = true
    sliderIndex.value = targetIndex
    previousModeIndex = targetIndex
  })
})
</script>

<template>
  <footer
    class="mode-tabs"
    :class="{ 'mode-tabs--sliding': isSliding }"
    :aria-label="t('nav.label')"
  >
    <span
      class="mode-tabs__slider"
      :class="{ 'mode-tabs__slider--animated': isSliding }"
      :style="{
        transform: `translateX(calc(${sliderIndex} * (var(--tab-size) + var(--tabs-gap))))`
      }"
      aria-hidden="true"
    ></span>

    <router-link to="/tarot" class="mode-tabs__tab" :aria-label="t('nav.tarot')">
      <svg
        class="mode-tabs__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="6" y="2.5" width="12" height="19" rx="2.25" />
        <path d="M12 7.1 13.15 10 16 11.2 13.15 12.4 12 15.3 10.85 12.4 8 11.2 10.85 10 12 7.1Z" />
      </svg>
      <span class="mode-tabs__label" aria-hidden="true">{{ t('nav.tarot') }}</span>
    </router-link>

    <router-link to="/zodiac" class="mode-tabs__tab" :aria-label="t('nav.zodiac')">
      <svg
        class="mode-tabs__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.25" />
        <path d="M12 3v5.75M12 15.25V21M3 12h5.75M15.25 12H21M5.64 5.64l4.07 4.07M14.29 14.29l4.07 4.07M18.36 5.64l-4.07 4.07M9.71 14.29l-4.07 4.07" />
      </svg>
      <span class="mode-tabs__label" aria-hidden="true">{{ t('nav.zodiac') }}</span>
    </router-link>

    <router-link to="/settings" class="mode-tabs__tab" :aria-label="t('nav.settings')">
      <svg
        class="mode-tabs__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span class="mode-tabs__label" aria-hidden="true">{{ t('nav.settings') }}</span>
    </router-link>
  </footer>
</template>

<style scoped>
.mode-tabs {
  --tabs-padding: var(--space-1);
  --tabs-gap: var(--space-1);
  --tab-size: 38px;
  --active-size: 144px;
  position: relative;
  flex-shrink: 0;
  align-self: center;
  display: flex;
  width: max-content;
  max-width: 100%;
  gap: var(--tabs-gap);
  padding: var(--tabs-padding);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-raised);
}

.mode-tabs__slider {
  position: absolute;
  z-index: 0;
  top: var(--tabs-padding);
  left: var(--tabs-padding);
  width: var(--active-size);
  height: var(--tab-size);
  overflow: hidden;
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  box-shadow:
    inset 0 0 12px var(--color-primary-soft),
    0 0 16px var(--color-primary-soft);
  pointer-events: none;
  will-change: transform;
}

.mode-tabs__slider::after {
  content: '';
  position: absolute;
  top: -45%;
  bottom: -45%;
  left: -30%;
  width: 42%;
  background: linear-gradient(90deg, transparent, rgba(255, 248, 220, 0.3), transparent);
  opacity: 0;
  transform: skewX(-16deg);
}

.mode-tabs__slider--animated {
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mode-tabs--sliding .mode-tabs__slider::after {
  animation: mode-slider-glint 420ms ease-out;
}

.mode-tabs__tab {
  position: relative;
  z-index: 1;
  flex: 0 0 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 0;
  width: 38px;
  height: 38px;
  padding: 0 9px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  transition:
    flex-basis 220ms cubic-bezier(0.22, 1, 0.36, 1),
    width 220ms cubic-bezier(0.22, 1, 0.36, 1),
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.mode-tabs__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  opacity: 0.72;
  color: currentColor;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform: scale(1);
  transition:
    width 180ms ease,
    height 180ms ease,
    opacity 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.mode-tabs__label {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  transform: translateX(-4px);
  transition:
    max-width 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 140ms ease,
    transform 220ms ease;
}

.mode-tabs__tab.router-link-active {
  flex-basis: var(--active-size);
  width: var(--active-size);
  gap: var(--space-2);
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  color: var(--color-text);
}

.mode-tabs__tab.router-link-active .mode-tabs__icon {
  width: 20px;
  height: 20px;
  flex-basis: 20px;
  opacity: 1;
  color: var(--color-gold);
  transform: scale(1.04);
  filter: drop-shadow(0 0 5px var(--color-gold-soft));
}

.mode-tabs__tab.router-link-active .mode-tabs__label {
  max-width: 100px;
  opacity: 1;
  transform: translateX(0);
}

.mode-tabs--sliding .mode-tabs__tab.router-link-active .mode-tabs__icon {
  animation: mode-icon-settle 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mode-tabs--sliding .mode-tabs__tab.router-link-active .mode-tabs__label {
  animation: mode-label-settle 320ms 70ms both cubic-bezier(0.22, 1, 0.36, 1);
}

.mode-tabs__tab:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

@media (min-width: 700px) {
  .mode-tabs {
    --tabs-padding: 6px;
    --tabs-gap: 6px;
    --tab-size: 46px;
    --active-size: 138px;
  }

  .mode-tabs__tab {
    flex-basis: 46px;
    width: 46px;
    height: 46px;
    padding-inline: 11px;
    font-size: 15px;
  }

  .mode-tabs__icon {
    width: 22px;
    height: 22px;
    flex-basis: 22px;
  }

  .mode-tabs__tab.router-link-active {
    flex-basis: 138px;
    width: 138px;
    gap: 10px;
  }

  .mode-tabs__tab.router-link-active .mode-tabs__icon {
    width: 24px;
    height: 24px;
    flex-basis: 24px;
  }

  .mode-tabs__tab.router-link-active .mode-tabs__label {
    max-width: 88px;
  }
}

@keyframes mode-slider-glint {
  0% { left: -30%; opacity: 0; }
  24% { opacity: 0.7; }
  100% { left: 105%; opacity: 0; }
}

@keyframes mode-icon-settle {
  0% { opacity: 0.5; transform: scale(0.78) rotate(-8deg); }
  68% { transform: scale(1.13) rotate(2deg); }
  100% { opacity: 1; transform: scale(1.04) rotate(0); }
}

@keyframes mode-label-settle {
  from { opacity: 0; transform: translateX(-7px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .mode-tabs__slider,
  .mode-tabs__tab,
  .mode-tabs__icon,
  .mode-tabs__label {
    transition: none;
    animation: none;
  }
}
</style>
