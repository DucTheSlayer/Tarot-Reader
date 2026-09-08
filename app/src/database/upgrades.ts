import type { capSQLiteVersionUpgrade } from '@capacitor-community/sqlite'
import zodiacSchemaSql from '../../../database/migrations/002_zodiac.sql?raw'
import zodiacSeedSql from '../../../database/seeds/003_zodiac.sql?raw'
import translationSchemaSql from '../../../database/migrations/003_translations.sql?raw'
import translationSeedSql from '../../../database/seeds/004_translations.sql?raw'
import { migrationStatements } from './sqlStatements'

// The SQL files are shared with the DB Browser/build workflow, so fresh
// installs and upgrades from the bundled v1 database use the same schema/data.
export const CARD_DATABASE_UPGRADES: capSQLiteVersionUpgrade[] = [
  {
    toVersion: 2,
    statements: migrationStatements(zodiacSchemaSql, zodiacSeedSql)
  },
  {
    toVersion: 3,
    statements: migrationStatements(translationSchemaSql, translationSeedSql)
  }
]
