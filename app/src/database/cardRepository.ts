import type { SQLiteDBConnection } from '@capacitor-community/sqlite'
import type { TarotCard } from '../types/tarotCard'
import { initializeDatabase } from './database'
import { mapTarotCardRow } from './cardMapper'
import { localizedEntity } from '../i18n/localizedEntity'
import { i18n } from '../i18n'

const CARD_COLUMNS = `
  id,
  deck_order,
  arcana_type,
  major_number,
  suit,
  rank_number,
  name,
  image_path,
  meaning,
  advice,
  yes_no,
  yes_no_meaning
`

async function loadTranslations(
  database: SQLiteDBConnection,
  cardIds: string[]
): Promise<Map<string, Record<string, string>>> {
  const translations = new Map<string, Record<string, string>>()
  if (!cardIds.length) return translations
  const placeholders = cardIds.map(() => '?').join(', ')
  const result = await database.query(
    `SELECT card_id, locale, payload FROM card_translations WHERE card_id IN (${placeholders});`,
    cardIds
  )
  for (const row of result.values ?? []) {
    const cardId = String(row.card_id)
    translations.set(cardId, {
      ...translations.get(cardId),
      [String(row.locale)]: String(row.payload)
    })
  }
  return translations
}

async function queryCards(
  database: SQLiteDBConnection,
  statement: string,
  values: unknown[] = []
): Promise<TarotCard[]> {
  const result = await database.query(statement, values)
  const originals = (result.values ?? []).map(mapTarotCardRow)
  const translations = await loadTranslations(database, originals.map((card) => card.id))
  return originals.map((card) => localizedEntity(
    card, translations.get(card.id), ['name', 'meaning', 'advice', 'yesNoMeaning'],
    () => i18n.global.locale.value
  ))
}

export const cardRepository = {
  async getAll(): Promise<TarotCard[]> {
    const database = await initializeDatabase()
    return queryCards(
      database,
      `SELECT ${CARD_COLUMNS}
       FROM tarot_cards
       WHERE is_active = 1
       ORDER BY deck_order ASC;`
    )
  },

  async getById(id: string): Promise<TarotCard | null> {
    const database = await initializeDatabase()
    const cards = await queryCards(
      database,
      `SELECT ${CARD_COLUMNS}
       FROM tarot_cards
       WHERE id = ? AND is_active = 1
       LIMIT 1;`,
      [id]
    )
    return cards[0] ?? null
  }
}
