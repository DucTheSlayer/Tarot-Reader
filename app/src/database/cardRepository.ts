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
  yes_no_meaning,
  (SELECT payload FROM card_translations WHERE card_id = tarot_cards.id AND locale = 'vi') AS translation
`

async function queryCards(
  database: SQLiteDBConnection,
  statement: string,
  values: unknown[] = []
): Promise<TarotCard[]> {
  const result = await database.query(statement, values)
  return (result.values ?? []).map((row) => localizedEntity(
    mapTarotCardRow(row), row.translation,
    ['name', 'meaning', 'advice', 'yesNoMeaning'], () => i18n.global.locale.value
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
