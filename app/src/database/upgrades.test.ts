/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { CARD_DATABASE_UPGRADES } from './upgrades'
import { DB_VERSION } from './database'
import { migrationStatements } from './sqlStatements'
import initial from '../../../database/migrations/001_initial.sql?raw'
import major from '../../../database/seeds/001_major_arcana.sql?raw'
import minor from '../../../database/seeds/002_minor_arcana.sql?raw'

const require = createRequire(import.meta.url)
const initSqlJs = require('sql.js')
const SQL = await initSqlJs()
const originalTables = ['tarot_cards', 'zodiac_signs', 'horoscope_readings']
const translationTables = ['card_translations', 'zodiac_translations', 'horoscope_translations']

describe('SQLite upgrades', () => {
  it('opens the database at the latest registered upgrade version', () => {
    expect(DB_VERSION).toBe(CARD_DATABASE_UPGRADES.at(-1)?.toVersion)
  })

  it('splits SQL safely with punctuation, escaped apostrophes and line comments', () => {
    expect(migrationStatements("BEGIN; -- ignored;\nINSERT INTO x VALUES ('don''t; split -- this'); COMMIT; PRAGMA user_version = 3;"))
      .toEqual(["INSERT INTO x VALUES ('don''t; split -- this')"])
    expect(() => migrationStatements("SELECT 'unfinished")).toThrow('Unterminated')
  })

  it('upgrades v1 through v6, preserves every original field and matches bundled translations', () => {
    const database = new SQL.Database()
    const bundled = new SQL.Database(readFileSync(new URL('../../public/assets/databases/tarot_cardsSQLite.db', import.meta.url)))
    try {
      database.run('PRAGMA foreign_keys = ON')
      database.run(initial)
      database.run(major)
      database.run(minor)
      const cardsBefore = database.exec('SELECT * FROM tarot_cards ORDER BY id')
      for (const statement of CARD_DATABASE_UPGRADES[0].statements) database.run(statement)
      expect(database.exec('SELECT * FROM tarot_cards ORDER BY id')).toEqual(cardsBefore)
      const before = originalTables.map(table => database.exec(`SELECT * FROM ${table} ORDER BY 1, 2`))
      database.run('BEGIN')
      for (const statement of CARD_DATABASE_UPGRADES[1].statements) database.run(statement)
      database.run('PRAGMA user_version = 3')
      database.run('COMMIT')
      database.run('BEGIN')
      for (const statement of CARD_DATABASE_UPGRADES[2].statements) database.run(statement)
      database.run('PRAGMA user_version = 4')
      database.run('COMMIT')
      database.run('BEGIN')
      for (const statement of CARD_DATABASE_UPGRADES[3].statements) database.run(statement)
      database.run('PRAGMA user_version = 5')
      database.run('COMMIT')
      database.run('BEGIN')
      for (const statement of CARD_DATABASE_UPGRADES[4].statements) database.run(statement)
      database.run('PRAGMA user_version = 6')
      database.run('COMMIT')
      expect(originalTables.map(table => database.exec(`SELECT * FROM ${table} ORDER BY 1, 2`))).toEqual(before)
      expect(database.exec('PRAGMA foreign_key_check')).toEqual([])
      expect(database.exec('PRAGMA user_version')[0].values[0][0]).toBe(6)
      for (const [index, table] of translationTables.entries()) {
        const rows = database.exec(`SELECT * FROM ${table} ORDER BY 1, 2`)
        expect(rows[0].values).toHaveLength([780, 120, 360][index])
        expect(rows).toEqual(bundled.exec(`SELECT * FROM ${table} ORDER BY 1, 2`))
      }
      database.run("INSERT INTO card_translations (card_id, locale, payload) VALUES ('fool', 'xx-test', '{\"name\":\"Test\"}')")
      expect(database.exec("SELECT locale FROM card_translations WHERE locale = 'xx-test'")[0].values[0][0]).toBe('xx-test')
    } finally {
      database.close()
      bundled.close()
    }
  })
})
