import type { ArcanaType, TarotCard, TarotSuit, YesNoAnswer } from '../types/tarotCard'

interface TarotCardRow {
  id: unknown
  deck_order: unknown
  arcana_type: unknown
  major_number: unknown
  suit: unknown
  rank_number: unknown
  name: unknown
  image_path: unknown
  meaning: unknown
  advice: unknown
  yes_no: unknown
  yes_no_meaning: unknown
}

const ARCANA_TYPES = new Set<ArcanaType>(['major', 'minor'])
const TAROT_SUITS = new Set<TarotSuit>(['wands', 'cups', 'swords', 'pentacles'])
const YES_NO_VALUES = new Set<YesNoAnswer>(['yes', 'no', 'maybe', 'uncertain'])

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid tarot card field: ${field}`)
  }
  return value
}

function requiredInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`Invalid tarot card field: ${field}`)
  }
  return value
}

function nullableInteger(value: unknown, field: string): number | null {
  if (value === null) return null
  return requiredInteger(value, field)
}

export function mapTarotCardRow(row: TarotCardRow): TarotCard {
  const arcanaType = requiredString(row.arcana_type, 'arcana_type') as ArcanaType
  const yesNo = requiredString(row.yes_no, 'yes_no') as YesNoAnswer
  const suit = row.suit === null ? null : (requiredString(row.suit, 'suit') as TarotSuit)

  if (!ARCANA_TYPES.has(arcanaType)) {
    throw new Error(`Unknown arcana_type: ${arcanaType}`)
  }
  if (suit !== null && !TAROT_SUITS.has(suit)) {
    throw new Error(`Unknown tarot suit: ${suit}`)
  }
  if (!YES_NO_VALUES.has(yesNo)) {
    throw new Error(`Unknown yes_no value: ${yesNo}`)
  }

  const card: TarotCard = {
    id: requiredString(row.id, 'id'),
    deckOrder: requiredInteger(row.deck_order, 'deck_order'),
    arcanaType,
    majorNumber: nullableInteger(row.major_number, 'major_number'),
    suit,
    rankNumber: nullableInteger(row.rank_number, 'rank_number'),
    name: requiredString(row.name, 'name'),
    image: requiredString(row.image_path, 'image_path'),
    meaning: requiredString(row.meaning, 'meaning'),
    advice: requiredString(row.advice, 'advice'),
    yesNo,
    yesNoMeaning: requiredString(row.yes_no_meaning, 'yes_no_meaning')
  }

  if (card.arcanaType === 'major' && (card.majorNumber === null || card.suit !== null)) {
    throw new Error(`Invalid Major Arcana metadata: ${card.id}`)
  }
  if (card.arcanaType === 'minor' && (card.majorNumber !== null || card.suit === null || card.rankNumber === null)) {
    throw new Error(`Invalid Minor Arcana metadata: ${card.id}`)
  }

  return card
}
