import { readFile, readdir } from 'node:fs/promises'
import { dirname, extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const cardsRoot = join(appRoot, 'public', 'cards')
const artRoot = join(appRoot, 'artwork-source', 'tarot')

async function walk(root, extension) {
  const entries = await readdir(root, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path, extension))
    else if (extname(entry.name) === extension) files.push(path)
  }

  return files
}

const artFiles = await walk(artRoot, '.jpg')
const wrapperFiles = (await walk(cardsRoot, '.svg'))
  .filter((path) => !path.endsWith(`${join('cards', 'back.svg')}`))

const errors = []

if (artFiles.length !== 78) errors.push(`Expected 78 JPG artworks, found ${artFiles.length}.`)
if (wrapperFiles.length !== 78) errors.push(`Expected 78 SVG wrappers, found ${wrapperFiles.length}.`)

for (const wrapperPath of wrapperFiles) {
  const svg = await readFile(wrapperPath, 'utf8')
  const href = svg.match(/<image href="([^"]+)"/)?.[1]

  if (!href?.startsWith('data:image/jpeg;base64,')) {
    errors.push(`${relative(appRoot, wrapperPath)} does not contain embedded JPEG artwork.`)
    continue
  }

  const embeddedArtwork = Buffer.from(href.slice('data:image/jpeg;base64,'.length), 'base64')
  const wrapperRelativePath = relative(cardsRoot, wrapperPath)
  const artRelativePath = wrapperRelativePath.startsWith(`minor${sep}`)
    ? wrapperRelativePath.slice(`minor${sep}`.length).replace(/\.svg$/, '.jpg')
    : wrapperRelativePath.replace(/\.svg$/, '.jpg')
  const sourceArtwork = await readFile(join(artRoot, artRelativePath))

  if (!embeddedArtwork.equals(sourceArtwork)) {
    errors.push(`${relative(appRoot, wrapperPath)} does not embed its matching source artwork.`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Validated 78 Tarot artworks and 78 SVG wrappers.')
}
