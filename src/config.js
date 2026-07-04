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
  itemsPerSource: 5,
  maxAgeDays: 7,
  model: "gemini-2.5-flash",
  maxSummariesPerRun: 30,
  dbPath: "./data/digest.db",
  exportPath: "./data/digest.json",
};
