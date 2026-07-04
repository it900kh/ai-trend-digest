// 収集元とパイプライン設定をまとめたファイル
// 収集元を増やしたいときは SOURCES に追記するだけでOK

export const SOURCES = [
  // --- 研究 ---
  { name: "arXiv (cs.AI)",   url: "http://export.arxiv.org/rss/cs.AI",              category: "research" },
  { name: "arXiv (cs.LG)",   url: "http://export.arxiv.org/rss/cs.LG",              category: "research" },
  { name: "Google AI Blog",  url: "https://blog.google/technology/ai/rss/",         category: "research" },

  // --- 製品 ---
  { name: "OpenAI Blog",     url: "https://openai.com/blog/rss.xml",                category: "product" },
  { name: "Anthropic News",  url: "https://www.anthropic.com/rss.xml",              category: "product" },
  { name: "Hugging Face",    url: "https://huggingface.co/blog/feed.xml",           category: "product" },

  // --- ビジネス ---
  { name: "TechCrunch AI",   url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "business" },
  { name: "VentureBeat AI",  url: "https://venturebeat.com/category/ai/feed/",      category: "business" },
];

export const CONFIG = {
  // 各フィードから取り込む最新記事数
  itemsPerSource: 5,
  // 何日前までの記事を対象にするか
  maxAgeDays: 7,
  // 要約に使うモデル
  model: "claude-sonnet-4-6",
  // 1回の実行で新規要約する最大件数（APIコスト管理用）
  maxSummariesPerRun: 30,
  // DBファイルの場所
  dbPath: "./data/digest.db",
  // サイト用にエクスポートするJSONの場所
  exportPath: "./data/digest.json",
};
