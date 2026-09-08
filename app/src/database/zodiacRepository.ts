import { initializeDatabase } from './database'
import { mapHoroscopeReadingRow, mapZodiacSignRow } from './zodiacMapper'
import type { HoroscopeReading, ZodiacSign } from '../types/zodiac'
import { localizedEntity } from '../i18n/localizedEntity'
import { i18n } from '../i18n'

const SIGN_COLUMNS = `
  id, display_order, name, symbol, date_range, element, ruling_planet,
  modality, summary, origin_story, traits_text, strengths_text,
  challenges_text, compatible_signs_text, reflection_prompt,
  (SELECT payload FROM zodiac_translations WHERE sign_id = zodiac_signs.id AND locale = 'vi') AS translation
`

const READING_COLUMNS = `
  sign_id, period, overview, love, career, finance, wellbeing, guidance,
  (SELECT payload FROM horoscope_translations AS tr WHERE tr.sign_id = horoscope_readings.sign_id
    AND tr.period = horoscope_readings.period AND tr.locale = 'vi') AS translation
`

export const zodiacRepository = {
  async getAllSigns(): Promise<ZodiacSign[]> {
    const database = await initializeDatabase()
    const result = await database.query(
      `SELECT ${SIGN_COLUMNS}
       FROM zodiac_signs
       WHERE is_active = 1
       ORDER BY display_order ASC;`
    )
    return (result.values ?? []).map((row) => localizedEntity(mapZodiacSignRow(row), row.translation,
      ['name', 'dateRange', 'rulingPlanet', 'summary', 'originStory', 'traits', 'strengths',
        'challenges', 'compatibleSigns', 'reflectionPrompt'], () => i18n.global.locale.value))
  },

  async getAllReadings(): Promise<HoroscopeReading[]> {
    const database = await initializeDatabase()
    const result = await database.query(
      `SELECT ${READING_COLUMNS}
       FROM horoscope_readings
       ORDER BY sign_id ASC,
         CASE period WHEN 'day' THEN 1 WHEN 'week' THEN 2 ELSE 3 END;`
    )
    return (result.values ?? []).map((row) => localizedEntity(mapHoroscopeReadingRow(row), row.translation,
      ['overview', 'love', 'career', 'finance', 'wellbeing', 'guidance'], () => i18n.global.locale.value))
  }
}
