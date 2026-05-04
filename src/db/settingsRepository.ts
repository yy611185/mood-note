import { getDatabase } from "./database";

export type AppSettingKey = "ai_summary_enabled";

export async function getAppSetting(key: AppSettingKey): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ? LIMIT 1;",
    [key],
  );
  return row?.value ?? null;
}

export async function setAppSetting(key: AppSettingKey, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at;
    `,
    [key, value, new Date().toISOString()],
  );
}
