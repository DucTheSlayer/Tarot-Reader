<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
withDefaults(defineProps<{ backTo: string; changeQuestion?: boolean }>(), {
  changeQuestion: false
})

const emit = defineEmits<{ 'draw-again': []; 'change-question': [] }>()
</script>

<template>
  <div class="bar">
    <button type="button" class="bar__btn bar__btn--primary" @click="emit('draw-again')">
      {{ t('common.drawAgain') }}
    </button>
    <button
      v-if="changeQuestion"
      type="button"
      class="bar__btn bar__btn--ghost"
      @click="emit('change-question')"
    >
      {{ t('common.changeQuestion') }}
    </button>
    <router-link :to="backTo" class="bar__btn bar__btn--ghost">{{ t('common.back') }}</router-link>
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
</style>
