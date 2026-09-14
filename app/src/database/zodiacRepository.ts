import { initializeDatabase } from './database'
import { mapHoroscopeReadingRow, mapZodiacSignRow } from './zodiacMapper'
import type { HoroscopeReading, ZodiacSign } from '../types/zodiac'
import { localizedEntity } from '../i18n/localizedEntity'
import { i18n } from '../i18n'

const SIGN_COLUMNS = `
  id, display_order, name, symbol, date_range, element, ruling_planet,
  modality, summary, origin_story, traits_text, strengths_text,
  challenges_text, compatible_signs_text, reflection_prompt
`

const READING_COLUMNS = `
  sign_id, period, overview, love, career, finance, wellbeing, guidance
`

async function loadTranslations(
  table: 'zodiac_translations' | 'horoscope_translations'
): Promise<Map<string, Record<string, string>>> {
  const database = await initializeDatabase()
  const result = await database.query(
    `SELECT sign_id, ${table === 'horoscope_translations' ? 'period, ' : ''}locale, payload FROM ${table};`
  )
  const translations = new Map<string, Record<string, string>>()
  for (const row of result.values ?? []) {
    const key = table === 'horoscope_translations'
      ? `${String(row.sign_id)}:${String(row.period)}`
      : String(row.sign_id)
    translations.set(key, {
      ...translations.get(key),
      [String(row.locale)]: String(row.payload)
    })
  }
  return translations
}

export const zodiacRepository = {
  async getAllSigns(): Promise<ZodiacSign[]> {
    const database = await initializeDatabase()
    const result = await database.query(
      `SELECT ${SIGN_COLUMNS}
       FROM zodiac_signs
       WHERE is_active = 1
       ORDER BY display_order ASC;`
    )
    const translations = await loadTranslations('zodiac_translations')
    return (result.values ?? []).map((row) => {
      const sign = mapZodiacSignRow(row)
      return localizedEntity(sign, translations.get(sign.id),
        ['name', 'dateRange', 'rulingPlanet', 'summary', 'originStory', 'traits', 'strengths',
          'challenges', 'compatibleSigns', 'reflectionPrompt'], () => i18n.global.locale.value)
    })
  },

  async getAllReadings(): Promise<HoroscopeReading[]> {
    const database = await initializeDatabase()
    const result = await database.query(
      `SELECT ${READING_COLUMNS}
       FROM horoscope_readings
       ORDER BY sign_id ASC,
         CASE period WHEN 'day' THEN 1 WHEN 'week' THEN 2 ELSE 3 END;`
    )
    const translations = await loadTranslations('horoscope_translations')
    return (result.values ?? []).map((row) => {
      const reading = mapHoroscopeReadingRow(row)
      return localizedEntity(reading, translations.get(`${reading.signId}:${reading.period}`),
        ['overview', 'love', 'career', 'finance', 'wellbeing', 'guidance'], () => i18n.global.locale.value)
    })
  }
}
