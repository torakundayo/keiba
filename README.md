# 3連複 確率構造分析

単勝・複勝オッズから3連複の的中確率を推定し、確率構造を可視化するツール。

**[Demo](https://keiba-six.vercel.app/)**

![トップページ](public/images/top.png)

## このツールについて

競馬の3連複は控除率25%（払戻率75%）のため、どのような購入戦略でも長期的に利益を出すことは構造的に困難です。このツールは「どの組み合わせが相対的に有利か」を可視化し、確率構造を理解するための教育的ツールです。

**774レースのバックテスト**で検証した結果:
- 確率モデルのランキングは有効（的中組合せの中央順位は上位3.6%）
- しかし最も回収率の高い戦略でも47%にとどまる
- 購入点数を増やすほど回収率は低下する

## 仕組み

単勝オッズと複勝オッズという**2つの異なる市場データ**を使い、3連複の各組み合わせの期待回収率を推定します。

| データソース | 役割 | 推定するもの |
|-------------|------|-------------|
| 単勝オッズ | 価格モデル | 市場の3連複オッズ |
| 複勝オッズ | 確率モデル | 3着以内確率（的中確率） |

**期待回収率** = 0.75 × 確率モデル ÷ 価格モデル

単一モデルでは期待回収率が必ず75%に固定されますが、2つのデータソースの評価のズレにより個別の組み合わせの期待回収率は変動します。詳しくは[計算方法ページ](https://keiba-six.vercel.app/explanation)を参照。

## ページ構成

### 買い目分析 (`/analysis`)

レースを選んで確率上位の組み合わせを確認できます。購入点数ごとの的中率・回収率の比較も表示。

![レース選択](public/images/analysis-select.png)

![分析結果](public/images/analysis-result.png)

### 計算方法 (`/explanation`)

確率モデルの数学的根拠を解説。JRAのパリミュチュエル方式、2つのオッズを使う理由、具体的な計算例を掲載。

![計算方法](public/images/explanation.png)

### 考察 (`/insight`)

なぜ75%を超えられないのか、想定される反論への回答、他のギャンブルとの比較、認知バイアスについて解説。

![考察](public/images/insight.png)

### 検証 (`/backtest`)

774レースのバックテスト結果。Top-N戦略別パフォーマンス、回収率の内訳分解、順位分布の分析。

![検証](public/images/backtest.png)

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui |
| 数式レンダリング | KaTeX (react-katex) |
| データ取得 | TanStack Query + Axios |
| スクレイピング | Cheerio (サーバーサイド) |
| ホスティング | Vercel |

## プロジェクト構造

```
src/
├── app/
│   ├── page.tsx                # トップページ
│   ├── analysis/page.tsx       # 買い目分析
│   ├── explanation/page.tsx    # 計算方法
│   ├── insight/page.tsx        # 考察
│   ├── backtest/page.tsx       # 検証（バックテスト）
│   └── api/                    # APIルート（オッズ取得）
├── components/
│   ├── calculator/             # UIコンポーネント（20個）
│   ├── ui/                     # shadcn/ui基盤コンポーネント
│   ├── Navigation.tsx          # ナビゲーションバー
│   └── Providers.tsx           # React Context / QueryClient
├── hooks/                      # カスタムHooks
├── lib/calculator/             # 計算ロジック（確率推定・Harville・最適化）
├── contexts/                   # Calculator Context
└── types/                      # 型定義
```

## ローカル開発

```bash
npm install
npm run dev
# http://localhost:3000
```

### バックテストデータの生成

```bash
npx tsx scripts/backtest-topn.ts
# public/data/backtest-topn-results.json が生成される
```

## ライセンス

MIT
