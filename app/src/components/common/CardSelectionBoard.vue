<script setup lang="ts">
import { computed } from 'vue'
import type { TarotCard } from '../../types/tarotCard'
import { ui } from '../../i18n/reading'

const props = defineProps<{
  candidates: TarotCard[]
  selected: number[]
  revealed: number[]
  count: number
  manual: boolean
}>()
const emit = defineEmits<{ select: [index: number]; deselect: [index: number] }>()
const cardBack = '/cards/back.svg'
const complete = computed(() => props.selected.length === props.count)
const finished = computed(() => props.revealed.length === props.count)
const hasRevealed = (index: number) => props.revealed.includes(props.selected.indexOf(index))

function toggle(index: number) {
  if (complete.value || !props.manual) return
  if (props.selected.includes(index)) emit('deselect', index)
  else emit('select', index)
}
</script>

<template>
  <section class="selection-board" :aria-label="ui('Your three cards')">
    <p class="selection-board__progress" role="status" aria-live="polite">
      {{ finished ? ui('Three perspectives for your question.') : complete ? ui('Revealing your cards…') : ui('Selected {count} of {total}', { count: selected.length, total: count }) }}
    </p>
    <div class="selection-board__fan-scroll" :class="{ 'is-finished': finished }"
      :aria-label="finished ? ui('Your three cards') : ui('Choose from nine face-down cards')">
      <div class="selection-board__fan" :class="{ 'is-finished': finished }">
        <button v-for="(candidate, index) in candidates" :key="candidate.id" type="button"
          class="selection-board__candidate"
          :class="{ 'is-picked': selected.includes(index), 'is-revealed': hasRevealed(index), 'is-hidden': finished && !selected.includes(index) }"
          :style="{ '--angle': `${(index - 4) * 3}deg`, '--rise': `${Math.abs(index - 4) * 5}px`, order: finished ? selected.indexOf(index) : index }"
          :data-candidate="index"
          :disabled="complete || !manual"
          :aria-pressed="selected.includes(index)"
          :aria-label="hasRevealed(index) ? candidate.name : ui('Face-down card {number} of {total}', { number: index + 1, total: candidates.length })"
          @click="toggle(index)">
          <span class="selection-board__art">
            <span class="selection-board__inner">
              <span class="selection-board__face selection-board__face--back"><img :src="cardBack" alt="" /></span>
              <span class="selection-board__face selection-board__face--front"><img v-if="hasRevealed(index)" :src="candidate.image" alt="" /></span>
            </span>
          </span>
          <span class="selection-board__caption">{{ hasRevealed(index) ? candidate.name : index + 1 }}</span>
        </button>
      </div>
    </div>
    <p v-if="manual && !complete" class="selection-board__hint">{{ ui('Tap a card to select it. Tap again to deselect. Three cards reveal automatically.') }}</p>
  </section>
</template>

<style scoped>
.selection-board { width: min(100%, 520px); margin-inline: auto; }
.selection-board__progress { margin: 0 0 6px; min-height: 24px; color: var(--color-gold); font-size: 12px; line-height: 1.6; text-align: center; }
.selection-board__fan-scroll { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: rgba(166, 197, 234, .35) transparent; padding: 8px 2px; }
.selection-board__fan { width: 510px; min-height: 192px; margin-inline: auto; display: flex; align-items: flex-start; padding: 32px 12px 8px; }
.selection-board__candidate { flex: 0 0 54px; position: relative; width: 54px; min-height: 144px; padding: 0; border: 0; background: transparent; color: var(--color-text-muted); cursor: pointer; -webkit-tap-highlight-color: transparent; }
.selection-board__art { position: absolute; left: 0; top: var(--rise); width: 68px; height: 95px; border-radius: 7px; transform: rotate(var(--angle)); transform-origin: 50% 100%; transition: transform 220ms ease, top 220ms ease, box-shadow 220ms ease; box-shadow: var(--shadow-md); pointer-events: none; perspective: 900px; }
.selection-board__candidate.is-picked { z-index: 1; }
.selection-board__candidate.is-picked .selection-board__art { transform: translateY(-24px) rotate(var(--angle)); box-shadow: 0 0 0 1px var(--color-gold), var(--shadow-md); }
.selection-board__inner { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform 520ms cubic-bezier(.22, 1, .36, 1); }
.is-revealed .selection-board__inner { transform: rotateY(180deg); }
.selection-board__face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 7px; overflow: hidden; }
.selection-board__face--front { transform: rotateY(180deg); }
.selection-board__face img { width: 100%; height: 100%; object-fit: cover; display: block; }
.selection-board__caption { position: absolute; bottom: 0; left: 0; width: 54px; font-size: 10px; line-height: 1.4; }
.is-picked .selection-board__caption { color: var(--color-gold); }
.selection-board__candidate:disabled { cursor: default; }
.selection-board__candidate:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; border-radius: 6px; }
.selection-board__fan-scroll.is-finished { overflow: visible; }
.selection-board__fan.is-finished { width: 100%; min-height: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 16px 0 0; }
.is-finished .selection-board__candidate { width: 100%; min-width: 0; min-height: 0; }
.is-finished .selection-board__candidate.is-hidden { display: none; }
.is-finished .selection-board__candidate.is-picked .selection-board__art { position: relative; display: block; top: 0; width: 100%; height: auto; aspect-ratio: 5 / 7; transform: none; box-shadow: var(--shadow-md); }
.is-finished .selection-board__caption { position: static; display: block; width: 100%; min-height: 38px; margin-top: 10px; font-size: 11px; overflow-wrap: anywhere; }
.selection-board__hint { color: var(--color-text-muted); text-align: center; line-height: 1.6; font-size: 12px; margin: 12px 0 0; }
@media (prefers-reduced-motion: reduce) { .selection-board__art, .selection-board__inner { transition: none; } }
</style>
