// Viewport coordinates for the fixed-position Yearly animation cards.
export function getYearlyLayout(width: number, height: number) {
  const margin = 24
  const w = Math.min(width < 600 ? 76 : 104, (width - margin * 2) / 4.2)
  const h = w * 1.4
  const centerX = width / 2
  const radiusX = Math.min(width * 0.3, 230)
  const radiusY = Math.min(height * 0.2, 176)
  const minCenterY = 88.001 + h / 2 + radiusY
  const maxCenterY = height - 48 - h / 2 - radiusY
  const centerY = Math.min(maxCenterY, Math.max(minCenterY, height * 0.39))

  const at = (x: number, y: number) => ({ x: x - w / 2, y: y - h / 2, w, h })

  // Overview is the North Star in the centre. The four life areas orbit it.
  if (width < 600) {
    return [
      at(centerX, centerY),
      at(centerX, centerY - radiusY),
      at(centerX + radiusX, centerY),
      at(centerX, centerY + radiusY),
      at(centerX - radiusX, centerY)
    ]
  }

  return [
    at(centerX, centerY),
    at(centerX - radiusX, centerY - radiusY),
    at(centerX + radiusX, centerY - radiusY),
    at(centerX + radiusX, centerY + radiusY),
    at(centerX - radiusX, centerY + radiusY)
  ]
}
