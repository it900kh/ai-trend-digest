// SQLite の初期化と記事の保存・取得をまとめたモジュール
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { CONFIG } from "./config.js";

// import しただけではDBを作らず、最初に使われた時点で初期化する
let db = null;

function getDb() {
  if (db) return db;

  mkdirSync(dirname(CONFIG.dbPath), { recursive: true });
  db = new Database(CONFIG.dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      url         TEXT UNIQUE NOT NULL,   -- 重複判定のキー
      title       TEXT NOT NULL,
      source      TEXT NOT NULL,
      category    TEXT NOT NULL,
      published   TEXT,                   -- 元記事の公開日時 (ISO)
      raw_content TEXT,                   -- 収集した本文（要約の元ネタ）
      summary     TEXT,                   -- 2〜3行のやさしい要約
      collected   TEXT NOT NULL           -- 収集した日時 (ISO)
    );
  `);

  return db;
}

// 新しい記事を追加。URLが重複していた場合は false を返す
export function insertArticle(a) {
  const stmt = getDb().prepare(`
    INSERT OR IGNORE INTO articles (url, title, source, category, published, raw_content, collected)
    VALUES (@url, @title, @source, @category, @published, @raw_content, @collected)
  `);
  return stmt.run(a).changes > 0;
}

// 要約がまだ無い記事を新しい順で取得
export function pendingArticles(limit) {
  return getDb()
    .prepare("SELECT * FROM articles WHERE summary IS NULL ORDER BY published DESC LIMIT ?")
    .all(limit);
}

// 要約を書き込む
export function saveSummary(id, summary) {
  getDb().prepare("UPDATE articles SET summary = ? WHERE id = ?").run(summary, id);
}

// サイト表示用：要約済みの記事を新しい順で取得
export function summarizedArticles(limit) {
  return getDb()
    .prepare("SELECT * FROM articles WHERE summary IS NOT NULL ORDER BY published DESC LIMIT ?")
    .all(limit);
}
