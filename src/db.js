// SQLite の初期化と記事の保存・取得をまとめたモジュール
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { CONFIG } from "./config.js";

mkdirSync(dirname(CONFIG.dbPath), { recursive: true });

const db = new Database(CONFIG.dbPath);
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

// 既に取り込み済みのURLか判定
const hasStmt = db.prepare("SELECT 1 FROM articles WHERE url = ?");
export function isKnown(url) {
  return !!hasStmt.get(url);
}

// 新しい記事を追加（要約はまだ空）
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO articles (url, title, source, category, published, raw_content, collected)
  VALUES (@url, @title, @source, @category, @published, @raw_content, @collected)
`);
export function insertArticle(a) {
  return insertStmt.run(a).changes > 0;
}

// 要約がまだ無い記事を取得
export function pendingArticles(limit) {
  return db
    .prepare("SELECT * FROM articles WHERE summary IS NULL ORDER BY published DESC LIMIT ?")
    .all(limit);
}

// 要約を書き込む
const updateStmt = db.prepare("UPDATE articles SET summary = ? WHERE id = ?");
export function saveSummary(id, summary) {
  updateStmt.run(summary, id);
}

// サイト表示用：要約済みの記事を新しい順で取得
export function summarizedArticles(limit = 100) {
  return db
    .prepare("SELECT * FROM articles WHERE summary IS NOT NULL ORDER BY published DESC LIMIT ?")
    .all(limit);
}

export default db;
