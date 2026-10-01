import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import initSqlJs from '../../app/node_modules/sql.js/dist/sql-wasm.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const root = resolve(scriptDirectory, '../..')
const databasePath = resolve(root, 'app/public/assets/databases/tarot_cardsSQLite.db')
const wasmPath = resolve(root, 'app/public/assets/sql-wasm.wasm')
const initialSchemaPath = resolve(root, 'database/migrations/001_initial.sql')
const zodiacSchemaPath = resolve(root, 'database/migrations/002_zodiac.sql')
const majorSeedPath = resolve(root, 'database/seeds/001_major_arcana.sql')
const minorSeedPath = resolve(root, 'database/seeds/002_minor_arcana.sql')
const zodiacSeedPath = resolve(root, 'database/seeds/003_zodiac.sql')

const SQL = await initSqlJs({
  wasmBinary: await readFile(wasmPath)
})
const database = new SQL.Database(await readFile(databasePath))

const [result] = database.exec(`
  SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN arcana_type = 'major' THEN 1 ELSE 0 END) AS major,
    SUM(CASE WHEN arcana_type = 'minor' THEN 1 ELSE 0 END) AS minor
  FROM tarot_cards
  WHERE is_active = 1;
`)

if (!result || result.values.length !== 1) {
  throw new Error('Web SQLite validation query returned no result.')
}

const [total, major, minor] = result.values[0].map(Number)
if (total !== 78 || major !== 22 || minor !== 56) {
  throw new Error(`Unexpected web SQLite counts: total=${total}, major=${major}, minor=${minor}`)
}

const [zodiacResult] = database.exec(`
  SELECT
    (SELECT COUNT(*) FROM zodiac_signs WHERE is_active = 1) AS signs,
    (SELECT COUNT(*) FROM horoscope_readings) AS readings,
    (SELECT user_version FROM pragma_user_version) AS version;
`)

if (!zodiacResult || zodiacResult.values.length !== 1) {
  throw new Error('Web zodiac validation query returned no result.')
}

const [signs, readings, version] = zodiacResult.values[0].map(Number)
if (signs !== 12 || readings !== 36 || version !== 9) {
  throw new Error(
    `Unexpected web zodiac counts/version: signs=${signs}, readings=${readings}, version=${version}`
  )
}

database.close()

function migrationStatements(...sources) {
  return sources
    .join('\n')
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => {
      if (!statement) return false
      return !/^(?:BEGIN|COMMIT|PRAGMA\s+user_version)/i.test(statement)
    })
}

// Recreate a v1 install, apply the exact statement splitting used by the app,
// and confirm Tarot rows survive the v2 Zodiac upgrade.
const upgradeDatabase = new SQL.Database()
upgradeDatabase.run(await readFile(initialSchemaPath, 'utf8'))
upgradeDatabase.run(await readFile(majorSeedPath, 'utf8'))
upgradeDatabase.run(await readFile(minorSeedPath, 'utf8'))

const upgradeStatements = migrationStatements(
  await readFile(zodiacSchemaPath, 'utf8'),
  await readFile(zodiacSeedPath, 'utf8')
)
for (const statement of upgradeStatements) {
  upgradeDatabase.run(statement)
}
upgradeDatabase.run('PRAGMA user_version = 2;')

const [upgradeResult] = upgradeDatabase.exec(`
  SELECT
    (SELECT COUNT(*) FROM tarot_cards WHERE is_active = 1) AS cards,
    (SELECT COUNT(*) FROM zodiac_signs WHERE is_active = 1) AS signs,
    (SELECT COUNT(*) FROM horoscope_readings) AS readings,
    (SELECT user_version FROM pragma_user_version) AS version;
`)
const [upgradedCards, upgradedSigns, upgradedReadings, upgradedVersion] =
  upgradeResult.values[0].map(Number)

if (
  upgradedCards !== 78 ||
  upgradedSigns !== 12 ||
  upgradedReadings !== 36 ||
  upgradedVersion !== 2
) {
  throw new Error(
    `v1 to v2 upgrade failed: cards=${upgradedCards}, signs=${upgradedSigns}, ` +
    `readings=${upgradedReadings}, version=${upgradedVersion}`
  )
}
upgradeDatabase.close()

console.log(
  `PASS: sql.js opened database v${version} ` +
  `(${total} cards, ${signs} signs, ${readings} horoscope readings), ` +
  'and the v1 → v2 upgrade preserved all Tarot cards.'
)
