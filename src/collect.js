// 各RSSフィードから最新記事を集めてDBへ保存するモジュール
import Parser from "rss-parser";
import { SOURCES, CONFIG } from "./config.js";
import { insertArticle } from "./db.js";

const parser = new Parser({ timeout: CONFIG.feedTimeoutMs });

// HTMLタグを落として本文を要約用に短く整える
function cleanText(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CONFIG.maxContentChars);
}

function isRecent(dateStr) {
  if (!dateStr) return true; // 日付不明は取りこぼさないよう通す
  const ageMs = Date.now() - new Date(dateStr).getTime();
  return ageMs <= CONFIG.maxAgeDays * 86400000;
}

// 1つのフィードを取り込み、新規に保存できた件数を返す
async function collectSource(src) {
  const feed = await parser.parseURL(src.url);
  const items = (feed.items || []).slice(0, CONFIG.itemsPerSource);
  let added = 0;

  for (const item of items) {
    if (!item.link || !isRecent(item.isoDate)) continue;

    // 重複URLは insertArticle 側（INSERT OR IGNORE）が弾く
    const ok = insertArticle({
      url: item.link,
      title: (item.title || "(無題)").trim(),
      source: src.name,
      category: src.category,
      published: item.isoDate || null,
      raw_content: cleanText(item.contentSnippet || item.content || item.summary || ""),
      collected: new Date().toISOString(),
    });
    if (ok) added++;
  }

  return added;
}

export async function collectAll() {
  let added = 0;

  for (const src of SOURCES) {
    try {
      added += await collectSource(src);
      console.log(`  ✓ ${src.name}`);
    } catch (err) {
      // 1つのフィードが落ちても全体は止めない
      console.warn(`  ✗ ${src.name} — ${err.message}`);
    }
  }

  return added;
}
