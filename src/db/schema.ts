export const createDiaryEntriesTableSql = `
  CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL UNIQUE,
    mood TEXT NOT NULL,
    mood_score REAL NOT NULL,
    what_happened TEXT,
    happy_events TEXT NOT NULL DEFAULT '[]',
    unhappy_events TEXT NOT NULL DEFAULT '[]',
    one_sentence_summary TEXT,
    ai_summary TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const createDiaryPhotosTableSql = `
  CREATE TABLE IF NOT EXISTS diary_photos (
    id TEXT PRIMARY KEY NOT NULL,
    diary_id TEXT NOT NULL,
    local_uri TEXT NOT NULL,
    caption TEXT,
    is_cover INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (diary_id) REFERENCES diary_entries(id) ON DELETE CASCADE
  );
`;

export const createTagsTableSql = `
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );
`;

export const createDiaryEntryTagsTableSql = `
  CREATE TABLE IF NOT EXISTS diary_entry_tags (
    diary_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (diary_id, tag_id),
    FOREIGN KEY (diary_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
`;

export const createTimeCapsulesTableSql = `
  CREATE TABLE IF NOT EXISTS time_capsules (
    id TEXT PRIMARY KEY NOT NULL,
    diary_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    open_date TEXT NOT NULL,
    is_opened INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    opened_at TEXT,
    FOREIGN KEY (diary_id) REFERENCES diary_entries(id) ON DELETE SET NULL
  );
`;

export const createAppSettingsTableSql = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const createIndexSql = [
  "CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);",
  "CREATE INDEX IF NOT EXISTS idx_diary_photos_diary_id ON diary_photos(diary_id);",
  "CREATE INDEX IF NOT EXISTS idx_time_capsules_open_date ON time_capsules(open_date);",
  "CREATE INDEX IF NOT EXISTS idx_time_capsules_diary_id ON time_capsules(diary_id);",
];

export const createTableSql = [
  createDiaryEntriesTableSql,
  createDiaryPhotosTableSql,
  createTagsTableSql,
  createDiaryEntryTagsTableSql,
  createTimeCapsulesTableSql,
  createAppSettingsTableSql,
  ...createIndexSql,
];
