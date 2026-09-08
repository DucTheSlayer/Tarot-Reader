import type { TarotCard, YesNoAnswer } from '../types/tarotCard'
import { ui } from '../i18n/reading'

export interface VerdictInfo {
  label: string
  meaning: string
  variant: 'yes' | 'no' | 'maybe' | 'uncertain'
}

export const YES_NO_VERDICTS: Record<YesNoAnswer, VerdictInfo> = {
  yes: {
    label: 'YES',
    meaning: 'The energy is favourable — it is a good moment to move forward.',
    variant: 'yes'
  },
  no: {
    label: 'NO',
    meaning: 'The energy says pause — change direction or hold off for now.',
    variant: 'no'
  },
  maybe: {
    label: 'MAYBE',
    meaning: 'The outcome depends on the choices and actions you take next.',
    variant: 'maybe'
  },
  uncertain: {
    label: 'UNCLEAR',
    meaning: 'Not enough is clear right now — emotions may be noisy, or it is best to ask again later.',
    variant: 'uncertain'
  }
}

export interface YesNoGuidance {
  verdict: VerdictInfo
  why: string
  guidance: string
}

// Định dạng Answer/Why/Guidance từ lá đã rút, không thay đổi verdict ngẫu nhiên.
export function buildYesNoGuidance(card: TarotCard): YesNoGuidance {
  const verdict = YES_NO_VERDICTS[card.yesNo]
  return {
    verdict: { ...verdict, label: ui(verdict.label), meaning: ui(verdict.meaning) },
    why: card.yesNoMeaning,
    guidance: card.advice
  }
}
