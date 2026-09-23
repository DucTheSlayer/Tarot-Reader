import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const cardsRoot = join(appRoot, 'public', 'cards')
const artRoot = join(appRoot, 'artwork-source', 'tarot')

const majorArcana = [
  ['fool', '0', 'The Fool'],
  ['magician', 'I', 'The Magician'],
  ['high-priestess', 'II', 'The High Priestess'],
  ['empress', 'III', 'The Empress'],
  ['emperor', 'IV', 'The Emperor'],
  ['hierophant', 'V', 'The Hierophant'],
  ['lovers', 'VI', 'The Lovers'],
  ['chariot', 'VII', 'The Chariot'],
  ['strength', 'VIII', 'Strength'],
  ['hermit', 'IX', 'The Hermit'],
  ['wheel-of-fortune', 'X', 'Wheel of Fortune'],
  ['justice', 'XI', 'Justice'],
  ['hanged-man', 'XII', 'The Hanged Man'],
  ['death', 'XIII', 'Death'],
  ['temperance', 'XIV', 'Temperance'],
  ['devil', 'XV', 'The Devil'],
  ['tower', 'XVI', 'The Tower'],
  ['star', 'XVII', 'The Star'],
  ['moon', 'XVIII', 'The Moon'],
  ['sun', 'XIX', 'The Sun'],
  ['judgement', 'XX', 'Judgement'],
  ['world', 'XXI', 'The World']
]

const ranks = [
  ['ace', 'A', 'Ace'],
  ['two', 'II', 'Two'],
  ['three', 'III', 'Three'],
  ['four', 'IV', 'Four'],
  ['five', 'V', 'Five'],
  ['six', 'VI', 'Six'],
  ['seven', 'VII', 'Seven'],
  ['eight', 'VIII', 'Eight'],
  ['nine', 'IX', 'Nine'],
  ['ten', 'X', 'Ten'],
  ['page', 'P', 'Page'],
  ['knight', 'KN', 'Knight'],
  ['queen', 'Q', 'Queen'],
  ['king', 'K', 'King']
]

const suits = {
  wands: { label: 'Wands', accent: '#ef9f45' },
  cups: { label: 'Cups', accent: '#7bc6d9' },
  swords: { label: 'Swords', accent: '#b9c9e8' },
  pentacles: { label: 'Pentacles', accent: '#8fc78d' }
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function titleSize(title) {
  if (title.length <= 12) return 17
  if (title.length <= 18) return 14.5
  return 12.5
}

function cardSvg({ artDataUri, marker, title, accent = '#e6c76b' }) {
  const safeTitle = escapeXml(title.toUpperCase())
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <clipPath id="card-clip"><rect width="300" height="420" rx="16"/></clipPath>
    <linearGradient id="title-shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#090916" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#090916" stop-opacity="0.72"/>
      <stop offset="1" stop-color="#090916" stop-opacity="0.96"/>
    </linearGradient>
    <radialGradient id="marker-bg" cx="50%" cy="38%" r="70%">
      <stop offset="0" stop-color="#29203f"/>
      <stop offset="1" stop-color="#0a0913"/>
    </radialGradient>
  </defs>
  <g clip-path="url(#card-clip)">
    <image href="${artDataUri}" width="300" height="420" preserveAspectRatio="xMidYMid slice"/>
    <rect y="326" width="300" height="94" fill="url(#title-shade)"/>
  </g>
  <rect x="5" y="5" width="290" height="410" rx="13" fill="none" stroke="#f1d783" stroke-width="2"/>
  <rect x="10" y="10" width="280" height="400" rx="10" fill="none" stroke="#f1d783" stroke-opacity="0.5"/>
  <path d="M18 50V22h28M282 50V22h-28M18 370v28h28M282 370v28h-28" fill="none" stroke="${accent}" stroke-width="1.4"/>
  <circle cx="150" cy="27" r="20" fill="url(#marker-bg)" stroke="#f1d783" stroke-width="1.6"/>
  <circle cx="150" cy="27" r="16" fill="none" stroke="${accent}" stroke-opacity="0.55"/>
  <text x="150" y="33" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="15" font-weight="700" fill="#f7e4a5">${escapeXml(marker)}</text>
  <rect x="24" y="361" width="252" height="43" rx="20" fill="#090916" fill-opacity="0.9" stroke="#f1d783" stroke-width="1.4"/>
  <text x="150" y="388" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize(title)}" letter-spacing="1.4" fill="#f7e4a5">${safeTitle}</text>
</svg>
`
}

for (const [slug, marker, title] of majorArcana) {
  const artwork = await readFile(join(artRoot, `${slug}.jpg`))
  await writeFile(
    join(cardsRoot, `${slug}.svg`),
    cardSvg({ artDataUri: `data:image/jpeg;base64,${artwork.toString('base64')}`, marker, title }),
    'utf8'
  )
}

for (const [suit, { label, accent }] of Object.entries(suits)) {
  const suitRoot = join(cardsRoot, 'minor', suit)
  await mkdir(suitRoot, { recursive: true })

  for (const [slug, marker, rank] of ranks) {
    const title = `${rank} of ${label}`
    const artwork = await readFile(join(artRoot, suit, `${slug}.jpg`))
    await writeFile(
      join(suitRoot, `${slug}.svg`),
      cardSvg({ artDataUri: `data:image/jpeg;base64,${artwork.toString('base64')}`, marker, title, accent }),
      'utf8'
    )
  }
}

console.log(`Generated ${majorArcana.length + ranks.length * Object.keys(suits).length} tarot card wrappers.`)
