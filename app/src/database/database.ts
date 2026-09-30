import { Capacitor } from '@capacitor/core'
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection
} from '@capacitor-community/sqlite'
import { defineCustomElements } from 'jeep-sqlite/loader'
import { CARD_DATABASE_UPGRADES } from './upgrades'

export const DB_NAME = 'tarot_cards'
export const DB_VERSION = 8

const sqlite = new SQLiteConnection(CapacitorSQLite)

let database: SQLiteDBConnection | null = null
let initialization: Promise<SQLiteDBConnection> | null = null
let webPlatformReady = false

async function prepareWebPlatform(): Promise<void> {
  if (Capacitor.getPlatform() !== 'web' || webPlatformReady) return

  defineCustomElements(window)

  if (!document.querySelector('jeep-sqlite')) {
    document.body.appendChild(document.createElement('jeep-sqlite'))
  }

  await customElements.whenDefined('jeep-sqlite')
  await sqlite.initWebStore()
  webPlatformReady = true
}

async function openDatabase(): Promise<SQLiteDBConnection> {
  await prepareWebPlatform()

  if (CARD_DATABASE_UPGRADES.length > 0) {
    await sqlite.addUpgradeStatement(DB_NAME, CARD_DATABASE_UPGRADES)
  }

  // jeep-sqlite throws when copyFromAssets(false) sees an existing IndexedDB
  // database instead of treating it as a no-op. Check first so browser reloads
  // open the existing copy without attempting to overwrite it.
  const databaseExists = await sqlite.isDatabase(DB_NAME)
  if (!databaseExists.result) {
    await sqlite.copyFromAssets(false)
  }

  const consistency = await sqlite.checkConnectionsConsistency()
  if (!consistency.result) {
    await sqlite.closeAllConnections()
  }

  const hasConnection = await sqlite.isConnection(DB_NAME, false)
  const connection = hasConnection.result
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false)

  const isOpen = await connection.isDBOpen()
  if (!isOpen.result) {
    await connection.open()
  }

  await connection.execute('PRAGMA foreign_keys = ON;', false)
  database = connection
  return connection
}

export function initializeDatabase(): Promise<SQLiteDBConnection> {
  if (database) return Promise.resolve(database)
  if (!initialization) {
    initialization = openDatabase().catch((error: unknown) => {
      initialization = null
      throw error
    })
  }
  return initialization
}

export async function closeDatabase(): Promise<void> {
  if (!database) return

  await database.close()
  await sqlite.closeConnection(DB_NAME, false)
  database = null
  initialization = null
}
