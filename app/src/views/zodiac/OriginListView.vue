<script setup lang="ts">
import { ui } from '../../i18n/reading'
import MysticalBackground from '../../components/common/MysticalBackground.vue'
import ScreenHeader from '../../components/common/ScreenHeader.vue'
import ZodiacSignPicker from '../../components/zodiac/ZodiacSignPicker.vue'
import { useZodiacStore } from '../../stores/zodiacStore'

const zodiacStore = useZodiacStore()
</script>

<template>
  <main class="screen origin-list">
    <MysticalBackground />
    <ScreenHeader :title='ui("Zodiac Origin")' back-to="/zodiac" />

    <div class="origin-list__scroll">
      <section class="origin-list__intro">
        <span aria-hidden="true">✦</span>
        <p>{{ ui("Meet the twelve archetypes written across the sky. Choose a sign to explore its mythology, element, gifts, and growing edges.") }}</p>
      </section>

      <ZodiacSignPicker :signs="zodiacStore.signs.value" mode="links" />

      <p class="origin-list__note">{{ ui("Zodiac profiles are invitations to reflection, not fixed definitions of a person.") }}</p>
    </div>
  </main>
</template>

<style scoped>
.origin-list { isolation: isolate; }
.origin-list__scroll {
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 2px 1px var(--space-3);
}
.origin-list__intro {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid rgba(230, 199, 107, 0.26);
  border-radius: var(--radius-md);
  background: rgba(20, 10, 40, 0.72);
  animation: origin-intro-arrive 520ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.origin-list__intro span {
  color: var(--color-gold);
  font-size: 20px;
  animation: origin-compass 5s linear infinite;
}
.origin-list__intro p,
.origin-list__note { color: var(--color-text-muted); font-size: 12px; line-height: 1.65; }
.origin-list__note { padding: 0 var(--space-2); text-align: center; }

@media (min-width: 700px) {
  .origin-list {
    gap: 20px;
    padding: clamp(20px, 2.5vw, 32px);
    padding-bottom: calc(clamp(20px, 2.5vw, 32px) + env(safe-area-inset-bottom));
  }

  .origin-list__scroll {
    gap: clamp(16px, 2vw, 24px);
    max-width: min(92vw, 1040px);
    padding: 8px 2px 24px;
  }

  .origin-list__intro {
    gap: var(--space-4);
    padding: 18px 22px;
  }

  .origin-list__intro span {
    font-size: 26px;
  }

  .origin-list__intro p {
    font-size: clamp(13px, 1.35vw, 15px);
    line-height: 1.7;
  }

  .origin-list__note {
    font-size: clamp(12px, 1.25vw, 14px);
  }
}

@keyframes origin-intro-arrive {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes origin-compass {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .origin-list__intro,
  .origin-list__intro span { animation: none; }
}
</style>
