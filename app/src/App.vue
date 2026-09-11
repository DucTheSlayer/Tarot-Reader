<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useCardStore } from './stores/cardStore'
import { useZodiacStore } from './stores/zodiacStore'
import AdBannerHost from './components/ads/AdBannerHost.vue'

const cardStore = useCardStore()
const zodiacStore = useZodiacStore()

const isReady = computed(
  () => cardStore.status.value === 'ready' && zodiacStore.status.value === 'ready'
)
const hasError = computed(
  () => cardStore.status.value === 'error' || zodiacStore.status.value === 'error'
)
const errorMessage = computed(
  () => cardStore.errorMessage.value || zodiacStore.errorMessage.value
)

function retryDatabase() {
  void Promise.all([cardStore.load(), zodiacStore.load()]).catch((error: unknown) => {
    console.error('Failed to retry the local content database.', error)
  })
}
</script>

<template>
  <div v-if="isReady" class="app-shell">
    <div class="app-shell__content">
      <RouterView />
    </div>
    <AdBannerHost />
  </div>

  <main v-else class="database-state">
    <div class="database-state__panel" role="status" aria-live="polite">
      <span class="database-state__symbol" aria-hidden="true">✦</span>
      <template v-if="hasError">
        <h1>{{ t('database.errorTitle') }}</h1>
        <p>{{ errorMessage }}</p>
        <button type="button" @click="retryDatabase">{{ t('database.retry') }}</button>
      </template>
      <template v-else>
        <h1>{{ t('database.loadingTitle') }}</h1>
        <p>{{ t('database.loadingDescription') }}</p>
      </template>
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
}

.app-shell__content {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.database-state {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: var(--space-5);
  background: var(--color-bg);
  color: var(--color-text);
  text-align: center;
}

.database-state__panel {
  width: min(100%, 420px);
  padding: var(--space-6) var(--space-5);
  border: 1px solid rgba(230, 199, 107, 0.24);
  border-radius: var(--radius-lg);
  background: rgba(20, 10, 40, 0.82);
  box-shadow: var(--shadow-lg);
}

.database-state__symbol {
  display: block;
  margin-bottom: var(--space-3);
  color: var(--color-gold);
  font-size: 2rem;
}

.database-state h1 {
  margin: 0;
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.database-state p {
  margin: var(--space-3) 0 0;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.database-state button {
  margin-top: var(--space-4);
  padding: 0.72rem 1.25rem;
  border: 1px solid rgba(230, 199, 107, 0.55);
  border-radius: 999px;
  background: rgba(230, 199, 107, 0.14);
  color: var(--color-gold);
  font: inherit;
  cursor: pointer;
}
</style>
