import type {
  HoroscopePeriod,
  HoroscopeReading,
  ZodiacElement,
  ZodiacModality,
  ZodiacSign
} from '../types/zodiac'

interface ZodiacSignRow {
  id: unknown
  display_order: unknown
  name: unknown
  symbol: unknown
  date_range: unknown
  element: unknown
  ruling_planet: unknown
  modality: unknown
  summary: unknown
  origin_story: unknown
  traits_text: unknown
  strengths_text: unknown
  challenges_text: unknown
  compatible_signs_text: unknown
  reflection_prompt: unknown
}

interface HoroscopeReadingRow {
  sign_id: unknown
  period: unknown
  overview: unknown
  love: unknown
  career: unknown
  finance: unknown
  wellbeing: unknown
  guidance: unknown
}

const ELEMENTS = new Set<ZodiacElement>(['fire', 'earth', 'air', 'water'])
const MODALITIES = new Set<ZodiacModality>(['cardinal', 'fixed', 'mutable'])
const PERIODS = new Set<HoroscopePeriod>(['day', 'week', 'year'])

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid zodiac field: ${field}`)
  }
  return value
}

function requiredInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`Invalid zodiac field: ${field}`)
  }
  return value
}

function splitList(value: unknown, field: string): string[] {
  const items = requiredString(value, field)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)

  if (items.length === 0) {
    throw new Error(`Invalid zodiac list: ${field}`)
  }
  return items
}

export function mapZodiacSignRow(row: ZodiacSignRow): ZodiacSign {
  const element = requiredString(row.element, 'element') as ZodiacElement
  const modality = requiredString(row.modality, 'modality') as ZodiacModality

  if (!ELEMENTS.has(element)) throw new Error(`Unknown zodiac element: ${element}`)
  if (!MODALITIES.has(modality)) throw new Error(`Unknown zodiac modality: ${modality}`)

  return {
    id: requiredString(row.id, 'id'),
    displayOrder: requiredInteger(row.display_order, 'display_order'),
    name: requiredString(row.name, 'name'),
    symbol: requiredString(row.symbol, 'symbol'),
    dateRange: requiredString(row.date_range, 'date_range'),
    element,
    rulingPlanet: requiredString(row.ruling_planet, 'ruling_planet'),
    modality,
    summary: requiredString(row.summary, 'summary'),
    originStory: requiredString(row.origin_story, 'origin_story'),
    traits: splitList(row.traits_text, 'traits_text'),
    strengths: splitList(row.strengths_text, 'strengths_text'),
    challenges: splitList(row.challenges_text, 'challenges_text'),
    compatibleSigns: splitList(row.compatible_signs_text, 'compatible_signs_text'),
    reflectionPrompt: requiredString(row.reflection_prompt, 'reflection_prompt')
  }
}

export function mapHoroscopeReadingRow(row: HoroscopeReadingRow): HoroscopeReading {
  const period = requiredString(row.period, 'period') as HoroscopePeriod
  if (!PERIODS.has(period)) throw new Error(`Unknown horoscope period: ${period}`)

  return {
    signId: requiredString(row.sign_id, 'sign_id'),
    period,
    overview: requiredString(row.overview, 'overview'),
    love: requiredString(row.love, 'love'),
    career: requiredString(row.career, 'career'),
    finance: requiredString(row.finance, 'finance'),
    wellbeing: requiredString(row.wellbeing, 'wellbeing'),
    guidance: requiredString(row.guidance, 'guidance')
  }
}
