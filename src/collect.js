// 各RSSフィードから最新記事を集めてDBへ保存するモジュール
import Parser from "rss-parser";
import { SOURCES, CONFIG } from "./config.js";
import { isKnown, insertArticle } from "./db.js";

const parser = new Parser({ timeout: 15000 });

// HTMLタグを落として本文を要約用に短く整える
function cleanText(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000); // 長すぎる本文はトークン節約のため切り詰める
}

function isRecent(dateStr) {
  if (!dateStr) return true; // 日付不明は取りこぼさないよう通す
  const ageMs = Date.now() - new Date(dateStr).getTime();
  return ageMs <= CONFIG.maxAgeDays * 86400000;
}

export async function collectAll() {
  let added = 0;

  for (const src of SOURCES) {
    try {
      const feed = await parser.parseURL(src.url);
      const items = (feed.items || []).slice(0, CONFIG.itemsPerSource);

      for (const item of items) {
        const url = item.link;
        if (!url || isKnown(url) || !isRecent(item.isoDate)) continue;

        const ok = insertArticle({
          url,
          title: (item.title || "(無題)").trim(),
          source: src.name,
          category: src.category,
          published: item.isoDate || null,
          raw_content: cleanText(item.contentSnippet || item.content || item.summary || ""),
          collected: new Date().toISOString(),
        });
        if (ok) added++;
      }
      console.log(`  ✓ ${src.name}`);
    } catch (err) {
      // 1つのフィードが落ちても全体は止めない
      console.warn(`  ✗ ${src.name} — ${err.message}`);
    }
  }

  return added;
}
