export interface CardRect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Two cards above and one centred below. `contentTop` is the bottom edge of
 * the screen header, so fixed-position cards never cover Back or the title.
 */
export function getThreeCardTriangleLayout(
  viewportWidth: number,
  viewportHeight: number,
  contentTop: number
): CardRect[] {
  const sidePadding = 16
  const columnGap = 14
  const rowGap = Math.max(30, Math.min(46, viewportHeight * 0.055))
  const width = Math.min(
    viewportWidth * 0.36,
    150,
    (viewportWidth - sidePadding * 2 - columnGap) / 2
  )
  const height = width * 1.4
  const centerX = viewportWidth / 2
  const topY = Math.max(contentTop + 12, 68)
  const bottomY = topY + height + rowGap

  return [
    { x: centerX - width - columnGap / 2, y: topY, w: width, h: height },
    { x: centerX + columnGap / 2, y: topY, w: width, h: height },
    { x: centerX - width / 2, y: bottomY, w: width, h: height }
  ]
}
