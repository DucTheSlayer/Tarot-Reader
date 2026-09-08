// One-time mechanical migration of static Vue template copy into ui() calls.
// Untranslated text is reported, never guessed. Safe to run again.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { parse } from '@vue/compiler-sfc'
import { baseParse } from '@vue/compiler-dom'
const root = resolve(import.meta.dirname, '..')
const catalog = JSON.parse(readFileSync(resolve(root, 'src/locales/reading.vi.json'), 'utf8'))
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(resolve(dir, e.name)) : e.name.endsWith('.vue') ? [resolve(dir, e.name)] : [])
}
const missing = new Set()
for (const path of [...files(resolve(root, 'src/views/tarot')), ...files(resolve(root, 'src/views/zodiac')), ...files(resolve(root, 'src/components/common')), ...files(resolve(root, 'src/components/zodiac'))]) {
  const source = readFileSync(path, 'utf8')
  const { descriptor } = parse(source)
  if (!descriptor.template || !descriptor.scriptSetup) continue
  const template = descriptor.template
  const edits = []
  const literal = value => JSON.stringify(value).replaceAll("'", '\\u0027')
  function visit(node) {
    if (node.type === 2) {
      const value = node.content.replace(/\s+/g, ' ').trim()
      if (catalog[value]) edits.push([node.loc.start.offset, node.loc.end.offset, `{{ ui(${literal(value)}) }}`])
      else if (/[a-zA-Z]/.test(value)) missing.add(value)
    }
    if (node.type === 1) for (const prop of node.props) {
      if (prop.type === 6 && ['aria-label','title','label','placeholder','alt'].includes(prop.name) && prop.value) {
        const value = prop.value.content
        if (catalog[value]) edits.push([prop.loc.start.offset, prop.loc.end.offset, `:${prop.name}='ui(${literal(value)})'`])
        else if (/[a-zA-Z]/.test(value)) missing.add(value)
      }
    }
    for (const child of node.children ?? []) visit(child)
  }
  visit(baseParse(template.content))
  if (!edits.length) continue
  let result = source
  for (const [start, end, text] of edits.sort((a,b) => b[0]-a[0])) {
    result = result.slice(0, template.loc.start.offset + start) + text + result.slice(template.loc.start.offset + end)
  }
  if (!source.includes('import { ui }')) {
    const module = relative(dirname(path), resolve(root, 'src/i18n/reading')).replaceAll('\\','/')
    result = result.replace('<script setup lang="ts">', `<script setup lang="ts">\nimport { ui } from '${module}'`)
  }
  writeFileSync(path, result)
}
console.log('Remaining static template copy:', [...missing].sort())
