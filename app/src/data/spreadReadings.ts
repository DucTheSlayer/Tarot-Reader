import type { TarotCard } from '../types/tarotCard'
import { ui } from '../i18n/reading'

export type LoveContext = 'single' | 'exploring' | 'relationship'
export type MoneyContext = 'general' | 'incomeCareer' | 'spending'
export type SpreadVariant = 'love' | 'money'

export interface ContextOption<T extends string = string> {
  value: T
  label: string
}

export const LOVE_CONTEXT_OPTIONS: ContextOption<LoveContext>[] = [
  { value: 'single', label: 'Single' },
  { value: 'exploring', label: 'Exploring' },
  { value: 'relationship', label: 'In a relationship' }
]

export const MONEY_CONTEXT_OPTIONS: ContextOption<MoneyContext>[] = [
  { value: 'general', label: 'General finances' },
  { value: 'incomeCareer', label: 'Income & career' },
  { value: 'spending', label: 'Spending' }
]

export const LOVE_SLOTS = ['You', 'Their Energy', 'Connection'] as const
export const MONEY_SLOTS = ['Current Position', 'Opportunity / Obstacle', 'Next Action'] as const

const loveContextCopy: Record<LoveContext, string> = {
  single: 'For your life as a single person',
  exploring: 'In this developing connection',
  relationship: 'Within your current relationship'
}

const moneyContextCopy: Record<MoneyContext, string> = {
  general: 'In your overall financial picture',
  incomeCareer: 'Around income and career',
  spending: 'Around spending and resource choices'
}

const lovePositionCopy = [
  'this card reflects what you are bringing into love',
  'this card describes the energy you may be meeting, rather than a fixed claim about another person',
  'this card shows the pattern taking shape between you'
] as const

const moneyPositionCopy = [
  'this card mirrors the position you are working from now',
  'this card points to an opening or a caution worth noticing',
  'this card focuses on the most useful next move'
] as const

export function getLoveCardReading(card: TarotCard, index: number, context: LoveContext) {
  return {
    meaning: `${ui(loveContextCopy[context])}, ${ui(lovePositionCopy[index])}. ${card.meaning}`,
    advice: card.advice
  }
}

export function getMoneyCardReading(card: TarotCard, index: number, context: MoneyContext) {
  return {
    meaning: `${ui(moneyContextCopy[context])}, ${ui(moneyPositionCopy[index])}. ${card.meaning}`,
    advice: index === 2 ? card.advice : ui('Keep this in view as you decide what comes next. {advice}', { advice: card.advice })
  }
}

export function buildLoveSummary(cards: TarotCard[], context: LoveContext): string {
  if (cards.length < 3) return ''

  return ui('{context}, {first} asks you to notice your own needs first. {second} describes the energy you are encountering, while {third} shows what the connection can teach you. {advice}', {
    context: ui(loveContextCopy[context]), first: cards[0].name, second: cards[1].name, third: cards[2].name, advice: cards[2].advice
  })
}

export function buildMoneySummary(cards: TarotCard[], context: MoneyContext) {
  if (cards.length < 3) return []

  return [
    {
      title: ui('Opportunity'),
      body: ui('{context}, {name} reveals where a useful opening or shift may appear. {meaning}', { context: ui(moneyContextCopy[context]), name: cards[1].name, meaning: cards[1].meaning })
    },
    {
      title: ui('Watch carefully'),
      body: ui('{name} asks you to stay aware of the conditions already shaping this decision. Avoid treating a hopeful sign as a guarantee.', { name: cards[0].name })
    },
    {
      title: ui('Next step'),
      body: ui('{name} brings the action point: {advice}', { name: cards[2].name, advice: cards[2].advice })
    }
  ]
}

export function buildOpenQuestionSummary(cards: TarotCard[]): string {
  if (cards.length < 3) return ''
  return [
    ui('{name} sets the tone for how this situation is unfolding.', { name: cards[0].name }),
    ui('{name} marks the turning point or tension at its core.', { name: cards[1].name }),
    ui('{name} points the way forward — {advice}', { name: cards[2].name, advice: cards[2].advice })
  ].join(' ')
}

export const YEARLY_SLOTS = ['Overview', 'Love', 'Career', 'Finance', 'Health'] as const

const yearlyAspectCopy = [
  'the tone of the next twelve months',
  'how love and connection may unfold in the year ahead',
  'the direction of your work, purpose and ambition',
  'how money and resources are likely to move',
  'the energy and wellbeing worth protecting'
] as const

const yearlyNurtureCopy = [
  'let this quality guide each season',
  'let this shape how you open to connection',
  'let this steer the work you choose to grow',
  'let this keep your money choices steady',
  'let this be the rhythm you protect daily'
] as const

const yearlyWatchCopy = [
  'notice the months when this theme presses hardest',
  'watch for fear or expectation distorting connection',
  'watch for drift between effort and purpose',
  'watch for spending or saving driven by mood',
  'notice when exhaustion is mistaken for weakness'
] as const

export function getYearlyCardReading(card: TarotCard, index: number) {
  return {
    energy: ui('{name} shapes {aspect}. {meaning}', { name: card.name, aspect: ui(yearlyAspectCopy[index]), meaning: card.meaning }),
    nurture: `${ui(yearlyNurtureCopy[index])}. ${card.advice}`,
    watch: ui(yearlyWatchCopy[index])
  }
}

export interface YearlyNorthStar {
  overview: string
  highlights: string[]
}

export function buildYearlyNorthStar(cards: TarotCard[]): YearlyNorthStar {
  if (cards.length < 5) return { overview: '', highlights: [] }
  const [overview, love, career, finance, health] = cards
  return {
    overview: ui('{name} sets the tone for the whole year: {meaning}', { name: overview.name, meaning: overview.meaning }),
    highlights: [
      ui('{name} asks you to keep your heart open. {advice}', { name: love.name, advice: love.advice }),
      ui('{name} points toward your work ahead. {advice}', { name: career.name, advice: career.advice }),
      ui('{name} invites steady, honest choices with resources. {advice}', { name: finance.name, advice: finance.advice }),
      ui('{name} reminds you to protect your energy. {advice}', { name: health.name, advice: health.advice })
    ]
  }
}
