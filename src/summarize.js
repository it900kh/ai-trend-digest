// Claude API を使って、収集した記事を非エンジニア向けに2〜3行へ要約するモジュール
import Anthropic from "@anthropic-ai/sdk";
import { CONFIG } from "./config.js";
import { pendingArticles, saveSummary } from "./db.js";

const client = new Anthropic(); // ANTHROPIC_API_KEY 環境変数を自動で読む

const SYSTEM_PROMPT = `あなたはAIニュースを一般読者向けにやさしく伝える編集者です。
渡されたAI関連記事を、次のルールで日本語で要約してください。

- 中学生でも理解できる平易な言葉を使う
- 専門用語はできるだけ避け、必要なら括弧で短く補足する（例：LLM（文章を作るAI））
- 2〜3行（およそ80〜120文字）にまとめる
- 「なぜ重要か」「何が新しいか」が伝わるようにする
- 誇張や憶測はせず、記事の事実に沿う
- 要約本文のみを出力し、前置きや「要約：」などのラベルは付けない`;

async function summarizeOne(article) {
  const msg = await client.messages.create({
    model: CONFIG.model,
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `タイトル: ${article.title}\n出典: ${article.source}\n本文: ${article.raw_content || "(本文なし)"}`,
      },
    ],
  });

  return msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export async function summarizePending() {
  const pending = pendingArticles(CONFIG.maxSummariesPerRun);
  let done = 0;

  for (const article of pending) {
    try {
      const summary = await summarizeOne(article);
      if (summary) {
        saveSummary(article.id, summary);
        done++;
        console.log(`  ✓ ${article.title.slice(0, 40)}…`);
      }
    } catch (err) {
      console.warn(`  ✗ ${article.title.slice(0, 40)} — ${err.message}`);
    }
  }

  return done;
}
