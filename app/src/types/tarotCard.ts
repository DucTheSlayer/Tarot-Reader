export type YesNoAnswer = 'yes' | 'no' | 'maybe' | 'uncertain'
export type ArcanaType = 'major' | 'minor'
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles'

export interface TarotCard {
  id: string
  deckOrder: number
  arcanaType: ArcanaType
  majorNumber: number | null
  suit: TarotSuit | null
  rankNumber: number | null
  name: string
  image: string
  meaning: string
  advice: string
  yesNo: YesNoAnswer
  yesNoMeaning: string
}
