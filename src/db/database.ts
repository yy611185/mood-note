import * as SQLite from "expo-sqlite";

import { createTableSql } from "./schema";

const databaseName = "mood_note.db";
const currentSchemaVersion = 1;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let lastDatabaseError: unknown = null;

export class DatabaseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "DatabaseError";
    this.cause = options?.cause;
  }
}

async function setupDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await database.execAsync("PRAGMA foreign_keys = ON;");
    for (const sql of createTableSql) {
      await database.execAsync(sql);
    }
    await runMigrations(database);
  } catch (error) {
    throw new DatabaseError("本地数据库初始化失败。", { cause: error });
  }
}

async function getDatabaseUserVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  const row = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
  return row?.user_version ?? 0;
}

async function setDatabaseUserVersion(database: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await database.execAsync(`PRAGMA user_version = ${version};`);
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const version = await getDatabaseUserVersion(database);
  if (version >= currentSchemaVersion) {
    return;
  }

  if (version < 1) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    await setDatabaseUserVersion(database, 1);
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    lastDatabaseError = null;
    databasePromise = SQLite.openDatabaseAsync(databaseName)
      .then(async (database) => {
        await setupDatabase(database);
        return database;
      })
      .catch((error) => {
        lastDatabaseError = error;
        databasePromise = null;
        throw error;
      });
  }

  return databasePromise;
}

export async function isDatabaseReady(): Promise<boolean> {
  try {
    await getDatabase();
    return true;
  } catch {
    return false;
  }
}

export function getLastDatabaseError(): unknown {
  return lastDatabaseError;
}

export async function resetDatabaseForDevelopment(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM diary_entry_tags;
    DELETE FROM diary_photos;
    DELETE FROM time_capsules;
    DELETE FROM tags;
    DELETE FROM diary_entries;
  `);
}
