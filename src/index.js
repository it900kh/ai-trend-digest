// パイプライン全体の入口：収集 → 要約 → JSON書き出し を順に実行
import { collectAll } from "./collect.js";
import { summarizePending } from "./summarize.js";
import { exportJson } from "./export.js";

async function main() {
  console.log("① 記事を収集中…");
  const added = await collectAll();
  console.log(`  新規 ${added} 件を取り込みました\n`);

  console.log("② 要約を生成中…");
  const summarized = await summarizePending();
  console.log(`  ${summarized} 件を要約しました\n`);

  console.log("③ サイト用JSONを書き出し中…");
  const exported = exportJson();
  console.log(`  ${exported} 件を書き出しました\n`);

  console.log("完了しました。");
}

main().catch((err) => {
  console.error("実行中にエラーが発生しました:", err);
  process.exit(1);
});
