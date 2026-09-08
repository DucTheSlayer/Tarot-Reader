import { describe, expect, it } from 'vitest'
import { createTarotCard } from '../test/fixtures'
import type { YesNoAnswer } from '../types/tarotCard'
import { buildYesNoGuidance } from './yesNo'

describe('Yes/No guidance', () => {
  it.each([
    ['yes', 'YES'],
    ['no', 'NO'],
    ['maybe', 'MAYBE'],
    ['uncertain', 'UNCLEAR']
  ] satisfies Array<[YesNoAnswer, string]>)('maps %s cards to the %s verdict', (answer, label) => {
    const card = createTarotCard({
      yesNo: answer,
      yesNoMeaning: `${answer} explanation`,
      advice: `${answer} guidance`
    })

    const result = buildYesNoGuidance(card)

    expect(result.verdict.label).toBe(label)
    expect(result.verdict.variant).toBe(answer)
    expect(result.why).toBe(`${answer} explanation`)
    expect(result.guidance).toBe(`${answer} guidance`)
  })
})
