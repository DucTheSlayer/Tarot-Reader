/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@vue/compiler-sfc'
import { baseParse, NodeTypes, type TemplateChildNode, type RootNode } from '@vue/compiler-dom'
import ts from 'typescript'
import catalogue from '../locales/reading.vi.json'

const root = fileURLToPath(new URL('..', import.meta.url))
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? files(path) : /\.(vue|ts)$/.test(path) && !path.endsWith('.test.ts') ? [path] : []
  })
}

describe('reading UI translation coverage', () => {
  it('has Vietnamese entries for every literal ui() call', () => {
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
    expect(missing).toEqual([])
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
