import { afterEach, describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { localizedEntity } from './localizedEntity'
import { i18n, setAppLocale } from './index'
import { ui } from './reading'
import catalogue from '../locales/reading.vi.json'
import { createTarotCard } from '../test/fixtures'
import { buildYesNoGuidance } from '../data/yesNo'
import { buildLoveSummary, buildMoneySummary, buildOpenQuestionSummary, buildYearlyNorthStar, getYearlyCardReading } from '../data/spreadReadings'

afterEach(() => setAppLocale('en'))

describe('reactive translated content', () => {
  it('updates existing drawn objects without changing ID, image or verdict', () => {
    const locale = ref('en')
    const original = createTarotCard({ id: 'fool', name: 'The Fool', yesNo: 'maybe' })
    const card = localizedEntity(original, JSON.stringify({ name: 'Kẻ Khờ', id: 'bad', yesNo: 'yes' }), ['name'], () => locale.value)
    const drawn = ref([card])
    const before = drawn.value[0]
    const title = computed(() => drawn.value[0].name)
    expect(title.value).toBe('The Fool')
    locale.value = 'vi'
    expect(title.value).toBe('Kẻ Khờ')
    expect(drawn.value[0]).toBe(before)
    expect(card.id).toBe('fool')
    expect(card.yesNo).toBe('maybe')
    expect(card.image).toBe(original.image)
    expect(original.name).toBe('The Fool')
    locale.value = 'en'
    expect(title.value).toBe('The Fool')
  })

  it.each([null, '{broken', '{}', '{"name":""}', '{"name":42}'])('falls back to English for invalid or missing translations: %s', payload => {
    const result = localizedEntity({ name: 'The Sun' }, payload, ['name'], () => 'vi')
    expect(result.name).toBe('The Sun')
  })

  it('translates lists without changing enum fields', () => {
    const sign = localizedEntity({ element: 'fire', traits: ['Bold'] }, { traits: ['Can đảm'], element: 'Lửa' }, ['traits'], () => 'vi')
    expect(sign.traits).toEqual(['Can đảm'])
    expect(sign.element).toBe('fire')
  })

  it('switches among multiple locale payloads and falls back field by field', () => {
    const locale = ref('es-419')
    const card = localizedEntity(
      { name: 'The Sun', meaning: 'Joy' },
      {
        'es-419': JSON.stringify({ name: 'El Sol', meaning: 'Alegría' }),
        fr: JSON.stringify({ name: 'Le Soleil' })
      },
      ['name', 'meaning'],
      () => locale.value
    )
    expect(card.name).toBe('El Sol')
    expect(card.meaning).toBe('Alegría')
    locale.value = 'fr'
    expect(card.name).toBe('Le Soleil')
    expect(card.meaning).toBe('Joy')
    locale.value = 'de'
    expect(card.name).toBe('The Sun')
  })

  it('keeps all interpolation placeholders and translations nonempty', () => {
    const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
    for (const [source, target] of Object.entries(catalogue)) {
      expect(target.trim(), source).not.toBe('')
      expect(placeholders(target), source).toEqual(placeholders(source))
    }
    setAppLocale('vi')
    expect(ui('{count} cards', { count: 78 })).toBe('78 lá bài')
    expect(ui('Unknown future label')).toBe('Unknown future label')
    // Placeholder-like user content must not be interpreted a second time.
    expect(ui('Go to {label}', { label: '{count}<script>' })).toBe('Đến {count}<script>')
  })

  it('updates complete readings reactively and retains their selected cards', () => {
    setAppLocale('en')
    const cards = Array.from({ length: 5 }, (_, index) => localizedEntity(
      createTarotCard({ id: String(index), name: 'The Sun', yesNo: 'yes' }),
      { name: 'Mặt Trời', meaning: 'Niềm vui.', advice: 'Tỏa sáng.', yesNoMeaning: 'Nghiêng về có.' },
      ['name', 'meaning', 'advice', 'yesNoMeaning'], () => i18n.global.locale.value
    ))
    const reading = computed(() => ({
      love: buildLoveSummary(cards, 'relationship'), money: buildMoneySummary(cards, 'general'),
      open: buildOpenQuestionSummary(cards), year: buildYearlyNorthStar(cards),
      detail: getYearlyCardReading(cards[0], 0), yesNo: buildYesNoGuidance(cards[0])
    }))
    const english = reading.value
    setAppLocale('vi')
    expect(reading.value.love).toContain('Trong mối quan hệ hiện tại')
    expect(reading.value.money[0].title).toBe('Cơ hội')
    expect(reading.value.open).toContain('Mặt Trời')
    expect(reading.value.year.highlights).toHaveLength(4)
    expect(reading.value.detail.energy).toContain('mười hai tháng')
    expect(reading.value.yesNo.verdict.label).toBe('CÓ')
    expect(cards.map(card => card.id)).toEqual(['0', '1', '2', '3', '4'])
    setAppLocale('en')
    expect(reading.value).toEqual(english)
  })
})
