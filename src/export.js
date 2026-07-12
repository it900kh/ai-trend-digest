// DBの要約済み記事を、サイトがそのまま読めるJSONへ書き出すモジュール
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { CONFIG } from "./config.js";
import { summarizedArticles } from "./db.js";

export function exportJson() {
  const rows = summarizedArticles(CONFIG.exportLimit);

  const payload = {
    updatedAt: new Date().toISOString(),
    count: rows.length,
    items: rows.map((r) => ({
      title: r.title,
      summary: r.summary,
      source: r.source,
      category: r.category, // research | product | business
      url: r.url,
      published: r.published,
    })),
  };

  mkdirSync(dirname(CONFIG.exportPath), { recursive: true });
  writeFileSync(CONFIG.exportPath, JSON.stringify(payload, null, 2), "utf8");
  return payload.count;
}

// 単体実行にも対応
if (import.meta.url === `file://${process.argv[1]}`) {
  const n = exportJson();
  console.log(`書き出し完了: ${n}件 → ${CONFIG.exportPath}`);
}
