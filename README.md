# AIトレンド ダイジェスト — 収集・要約パイプライン

AI関連のニュースをRSSから自動収集し、Claude API を使って**非エンジニア向けに2〜3行**へ要約します。結果は SQLite に保存し、サイトが読めるJSONへ書き出します。

## 仕組み

```
RSS収集 → SQLite保存 → Claudeで要約 → digest.json 書き出し → サイトが表示
（重複はURLで自動スキップ）
```

## セットアップ

```bash
npm install
export ANTHROPIC_API_KEY="sk-ant-..."   # APIキーを設定
npm run run                             # 収集→要約→書き出しを一括実行
```

実行すると以下が生成されます。

- `data/digest.db` … 全記事と要約の履歴（SQLite）
- `data/digest.json` … サイト表示用（要約済みの最新100件）

## ファイル構成

| ファイル | 役割 |
|---|---|
| `src/config.js` | 収集元RSSと各種設定（**収集元の追加はここ**） |
| `src/collect.js` | RSSから記事を集めてDBへ保存 |
| `src/summarize.js` | Claude APIでやさしい要約を生成 |
| `src/export.js` | DB → サイト用JSON への書き出し |
| `src/db.js` | SQLiteの初期化・保存・取得 |
| `src/index.js` | 全体の実行入口 |

## 自動実行

`.github/workflows/digest.yml` を含みます。GitHubリポジトリの
Settings → Secrets に `ANTHROPIC_API_KEY` を登録すれば、
**毎日 日本時間 7:00** に自動で収集・要約・コミットされます（無料枠で運用可能）。

## 収集元を増やす

`src/config.js` の `SOURCES` に1行追加するだけです。

```js
{ name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/", category: "business" },
```

`category` は `research` / `product` / `business` のいずれか（サイトのフィルターと連動）。

## コスト管理

- `itemsPerSource` … フィード毎の取り込み件数
- `maxSummariesPerRun` … 1回あたりの最大要約数（APIコストの上限）
- `maxAgeDays` … 対象とする記事の新しさ
