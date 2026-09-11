<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { showInterstitialAtNaturalBreak } from '../../services/advertising'

const { t } = useI18n()
const router = useRouter()
const props = withDefaults(defineProps<{ backTo: string; changeQuestion?: boolean }>(), {
  changeQuestion: false
})

const emit = defineEmits<{ 'draw-again': []; 'change-question': [] }>()
const isNavigating = ref(false)

async function runAfterNaturalBreak(action: () => void | Promise<void>): Promise<void> {
  if (isNavigating.value) return
  isNavigating.value = true
  try {
    await showInterstitialAtNaturalBreak()
    await action()
  } finally {
    isNavigating.value = false
  }
}

function drawAgain(): void {
  void runAfterNaturalBreak(() => emit('draw-again'))
}

function goBack(): void {
  void runAfterNaturalBreak(async () => {
    await router.push(props.backTo)
  })
}
</script>

<template>
  <div class="bar">
    <button
      type="button"
      class="bar__btn bar__btn--primary"
      :disabled="isNavigating"
      @click="drawAgain"
    >
      {{ t('common.drawAgain') }}
    </button>
    <button
      v-if="changeQuestion"
      type="button"
      class="bar__btn bar__btn--ghost"
      :disabled="isNavigating"
      @click="emit('change-question')"
    >
      {{ t('common.changeQuestion') }}
    </button>
    <button
      type="button"
      class="bar__btn bar__btn--ghost"
      :disabled="isNavigating"
      @click="goBack"
    >
      {{ t('common.back') }}
    </button>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.bar__btn {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-full);
  border: none;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.bar__btn--primary {
  background: var(--color-primary);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.bar__btn--primary:active {
  filter: brightness(0.92);
}

.bar__btn--ghost {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.bar__btn:disabled {
  cursor: wait;
  opacity: 0.62;
}
</style>
