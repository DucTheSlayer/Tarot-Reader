/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@vue/compiler-sfc'
import { baseParse, NodeTypes, type TemplateChildNode, type RootNode } from '@vue/compiler-dom'
import ts from 'typescript'
import { PUBLISHED_LOCALES } from './locales'

const root = fileURLToPath(new URL('..', import.meta.url))
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? files(path) : /\.(vue|ts)$/.test(path) && !path.endsWith('.test.ts') ? [path] : []
  })
}

describe('reading UI translation coverage', () => {
  it('has entries for every literal ui() call in every published non-English locale', () => {
    for (const locale of PUBLISHED_LOCALES.filter((item) => item !== 'en')) {
      const cataloguePath = resolve(root, `locales/reading.${locale}.json`)
      const catalogue = JSON.parse(readFileSync(cataloguePath, 'utf8')) as Record<string, string>
      const missing: string[] = []
      for (const file of ['views', 'components', 'data'].flatMap(dir => files(resolve(root, dir)))) {
        const source = readFileSync(file, 'utf8')
        // Vue interpolation expressions are not a TS file; literal calls can be checked independently.
        for (const match of source.matchAll(/\bui\(\s*((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'))/g)) {
          const expression = ts.createSourceFile('literal.ts', match[1], ts.ScriptTarget.Latest)
          const statement = expression.statements[0]
          if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)) {
            const key = statement.expression.text
            if (!(key in catalogue)) missing.push(`${file}: ${key}`)
          }
        }
      }
      expect(missing, locale).toEqual([])
    }
  })

  it('keeps the same interface keys in every published locale', () => {
    const flatten = (value: Record<string, unknown>, prefix = ''): string[] =>
      Object.entries(value).flatMap(([key, item]) => typeof item === 'string'
        ? [`${prefix}${key}`]
        : flatten(item as Record<string, unknown>, `${prefix}${key}.`))
    const english = JSON.parse(readFileSync(resolve(root, 'locales/en.json'), 'utf8'))
    const expected = flatten(english).sort()
    for (const locale of PUBLISHED_LOCALES.filter((item) => item !== 'en')) {
      const catalogue = JSON.parse(readFileSync(resolve(root, `locales/${locale}.json`), 'utf8'))
      expect(flatten(catalogue).sort(), locale).toEqual(expected)
    }
  })

  it('does not leave static English copy in reading templates or accessibility labels', () => {
    const missing: string[] = []
    for (const file of ['views/tarot', 'views/zodiac', 'components/common', 'components/zodiac'].flatMap(dir => files(resolve(root, dir))).filter(file => file.endsWith('.vue'))) {
      const template = parse(readFileSync(file, 'utf8')).descriptor.template
      if (!template) continue
      function visit(node: RootNode | TemplateChildNode) {
        if (node.type === NodeTypes.TEXT && /[A-Za-z]/.test(node.content)) missing.push(`${file}: ${node.content.trim()}`)
        if (node.type === NodeTypes.ELEMENT) for (const prop of node.props) {
          if (prop.type === NodeTypes.ATTRIBUTE && ['title', 'label', 'aria-label', 'placeholder', 'alt'].includes(prop.name) && /[A-Za-z]/.test(prop.value?.content ?? '')) missing.push(`${file}: ${prop.value?.content}`)
        }
        if (node.type === NodeTypes.ROOT || node.type === NodeTypes.ELEMENT) {
          for (const child of node.children) visit(child)
        }
      }
      visit(baseParse(template.content))
    }
    expect(missing).toEqual([])
  })
})
