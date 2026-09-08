export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water'
export type ZodiacModality = 'cardinal' | 'fixed' | 'mutable'
export type HoroscopePeriod = 'day' | 'week' | 'year'

export interface ZodiacSign {
  id: string
  displayOrder: number
  name: string
  symbol: string
  dateRange: string
  element: ZodiacElement
  rulingPlanet: string
  modality: ZodiacModality
  summary: string
  originStory: string
  traits: readonly string[]
  strengths: readonly string[]
  challenges: readonly string[]
  compatibleSigns: readonly string[]
  reflectionPrompt: string
}

export interface HoroscopeReading {
  signId: string
  period: HoroscopePeriod
  overview: string
  love: string
  career: string
  finance: string
  wellbeing: string
  guidance: string
}
