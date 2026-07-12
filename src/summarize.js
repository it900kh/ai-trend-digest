// 未要約の記事を Gemini API でやさしい日本語に要約するモジュール
import { GoogleGenAI } from "@google/genai";
import { CONFIG } from "./config.js";
import { pendingArticles, saveSummary } from "./db.js";

const PROMPT_PREFIX = `あなたはAIニュースを一般読者向けにやさしく伝える編集者です。
渡されたAI関連記事を、次のルールで日本語で要約してください。

- 中学生でも理解できる平易な言葉を使う
- 専門用語はできるだけ避け、必要なら括弧で短く補足する（例：LLM（文章を作るAI））
- 2〜3行（およそ80〜120文字）にまとめる
- 「なぜ重要か」「何が新しいか」が伝わるようにする
- 誇張や憶測はせず、記事の事実に沿う
- 要約本文のみを出力し、前置きや「要約：」などのラベルは付けない

---
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function summarizeOne(ai, article) {
  const prompt =
    PROMPT_PREFIX +
    `タイトル: ${article.title}\n出典: ${article.source}\n本文: ${article.raw_content || "(本文なし)"}`;

  const response = await ai.models.generateContent({
    model: CONFIG.model,
    contents: prompt,
  });

  return (response.text || "").trim();
}

export async function summarizePending() {
  const pending = pendingArticles(CONFIG.maxSummariesPerRun);
  if (pending.length === 0) return 0;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("環境変数 GEMINI_API_KEY が設定されていません");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let done = 0;
  for (const [i, article] of pending.entries()) {
    try {
      const summary = await summarizeOne(ai, article);
      if (summary) {
        saveSummary(article.id, summary);
        done++;
        console.log(`  ✓ ${article.title.slice(0, 40)}…`);
      }
    } catch (err) {
      // 失敗した記事は summary が空のまま残り、次回の実行で再挑戦される
      console.warn(`  ✗ ${article.title.slice(0, 40)} — ${err.message}`);
    }
    // レート制限対策の待機（最後の1件の後は不要）
    if (i < pending.length - 1) await sleep(CONFIG.requestIntervalMs);
  }

  return done;
}
