import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import CardSelectionBoard from './CardSelectionBoard.vue'
import { createDeck } from '../../test/fixtures'

describe('card selection board rendering', () => {
  const candidates = createDeck(9)
  function render(selected: number[], revealed: number[], manual = true) {
    return renderToString(createSSRApp(CardSelectionBoard, { candidates, selected, revealed, count: 3, manual }))
  }

  it('keeps card identities and front images hidden during selection', async () => {
    const html = await render([7, 2], [])
    expect(html).toContain('Selected 2 of 3')
    expect(html.match(/data-candidate=/g)).toHaveLength(9)
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(2)
    expect(html).not.toContain('selection-board__slots')
    for (const card of candidates) {
      expect(html).not.toContain(card.name)
      expect(html).not.toContain(card.image)
    }
  })

  it('keeps selected cards in the fan and exposes only identities already revealed', async () => {
    const html = await render([7, 2, 5], [1])
    expect(html.match(/data-candidate=/g)).toHaveLength(9)
    expect(html).toContain(candidates[2].name)
    expect(html).toContain(candidates[2].image)
    expect(html).not.toContain(candidates[7].name)
    expect(html).not.toContain(candidates[5].image)
    expect(html).not.toContain('Reveal All')
    expect(html).not.toContain('Undo last choice')
  })

  it('shows three equal revealed cards while keeping the other six hidden', async () => {
    const html = await render([7, 2, 5], [0, 1, 2])
    expect(html.match(/is-hidden/g)).toHaveLength(6)
    for (const index of [7, 2, 5]) {
      expect(html).toContain(candidates[index].name)
      expect(html).toContain(candidates[index].image)
    }
    expect(html).not.toContain(candidates[0].name)
    expect(html).not.toContain('Past')
    expect(html).not.toContain('Future')
  })

  it('shows automatic reveal guidance without manual-only instructions in quick mode', async () => {
    const html = await render([0, 1, 2], [], false)
    expect(html).toContain('Revealing your cards…')
    expect(html).not.toContain('Tap to reveal')
    expect(html).not.toContain('Undo last choice')
  })
})
