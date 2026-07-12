export const SOURCES = [
  { name: "arXiv (cs.AI)",   url: "http://export.arxiv.org/rss/cs.AI",              category: "research" },
  { name: "arXiv (cs.LG)",   url: "http://export.arxiv.org/rss/cs.LG",              category: "research" },
  { name: "Google AI Blog",  url: "https://blog.google/technology/ai/rss/",         category: "research" },
  { name: "OpenAI Blog",     url: "https://openai.com/blog/rss.xml",                category: "product" },
  { name: "Anthropic News",  url: "https://www.anthropic.com/rss.xml",              category: "product" },
  { name: "Hugging Face",    url: "https://huggingface.co/blog/feed.xml",           category: "product" },
  { name: "TechCrunch AI",   url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "business" },
  { name: "VentureBeat AI",  url: "https://venturebeat.com/category/ai/feed/",      category: "business" },
];

export const CONFIG = {
  // 収集
  itemsPerSource: 5,        // フィード毎の取り込み件数
  maxAgeDays: 7,            // 対象とする記事の新しさ
  feedTimeoutMs: 15000,     // RSS取得のタイムアウト
  maxContentChars: 2000,    // 本文の最大文字数（トークン節約）

  // 要約
  model: "gemini-2.5-flash-lite",
  maxSummariesPerRun: 30,   // 1回あたりの最大要約数（APIコストの上限）
  requestIntervalMs: 5000,  // API呼び出しの間隔（レート制限対策）

  // 書き出し
  exportLimit: 100,         // サイト用JSONに含める最大件数

  // パス
  dbPath: "./data/digest.db",
  exportPath: "./data/digest.json",
};
