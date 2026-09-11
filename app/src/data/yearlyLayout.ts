// Viewport coordinates for the fixed-position Yearly animation cards.
export function getYearlyLayout(width: number, height: number) {
  const gap = 12
  const margin = 24
  const compact = width < 600
  const columns = compact ? 3 : 5
  const rows = compact ? 2 : 1
  const arc = compact ? 0 : 16
  const w = Math.min(
    (width - margin * 2 - gap * (columns - 1)) / columns,
    (height - 160 - gap * (rows - 1) - arc) / (rows * 1.4),
    compact ? 112 : 132
  )
  const h = w * 1.4
  const totalHeight = rows * h + (rows - 1) * gap + arc
  const top = Math.max(88, (height - totalHeight) * 0.38)

  return Array.from({ length: 5 }, (_, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns
    const rowCount = Math.min(columns, 5 - row * columns)
    const rowWidth = rowCount * w + (rowCount - 1) * gap
    return {
      x: (width - rowWidth) / 2 + column * (w + gap),
      y: top + row * (h + gap) + (compact ? 0 : arc * ((index - 2) / 2) ** 2),
      w,
      h
    }
  })
}
