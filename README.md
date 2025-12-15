# AI News Aggregator (Gemini API活用ニュースアプリ)

このプロジェクトは、複数のRSSフィードからニュースを取得し、Google Gemini APIを使用して各ニュース記事に自動的にキーワードタグを生成・付与して表示するWebアプリケーションです。

## 📋 機能要件・特徴

*   **カテゴリ選択**: Technology, Science, Business の中から好きなカテゴリを選択可能。
*   **RSS取得**: 選択されたカテゴリに基づいて、リアルタイムにRSSフィードからニュースを取得。
*   **AIタグ付け**: 取得したニュースのタイトルを「Gemini API」に送信し、関連するタグ（3つ）を自動生成。
*   **技術スタック**: Node.js, Express, TypeScript, Vanilla JS (Frontend)。

## ✅ 事前準備 (Prerequisites)

*   **Node.js**: v16以上推奨
*   **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey) から取得してください。

## 📦 インストール手順 (Installation)

1.  プロジェクトのディレクトリに移動し、依存関係をインストールします。

    ```bash
    npm install
    ```

2.  `.env` ファイルを作成し、APIキーを設定します。

    **ファイル名: `.env`**
    ```env
    PORT=3000
    GEMINI_API_KEY=ここにあなたのGemini_APIキーを貼り付け
    ```

## 🚀 実行方法 (Usage)

1.  以下のコマンドでサーバーを起動します。

    ```bash
    npx ts-node src/server.ts
    ```

2.  **ブラウザで以下のURLにアクセスします。**

    👉 **http://localhost:3000**

    > **⚠️ 重要**: `index.html` ファイルを直接ダブルクリックしたり、VS CodeのLive Server等で開かないでください。API通信が失敗します。必ず `http://localhost:3000` 経由でアクセスしてください。

## 📂 プロジェクト構成

```text
root/
├── public/
│   └── index.html      # フロントエンド (UI)
├── src/
│   └── server.ts       # バックエンド (API, RSS処理, Gemini連携)
├── .env                # 環境変数 (APIキー)
├── package.json
├── tsconfig.json
└── README.md




カテゴリ変更からニュースが画面に表示されるまでの、内部ロジック（データフロー）をステップごとに解説します。 このプロセスは大きく分けて**「①フロントエンド（要求）」「②バックエンド（収集・加工）」「③フロントエンド（描画）」**の3段階で構成されています。 --- ### 全体フロー図 `ユーザー操作` → `APIリクエスト` → `RSS取得(並列)` →
カテゴリ変更からニュースが画面に表示されるまでの、内部ロジック（データフロー）をステップごとに解説します。

このプロセスは大きく分けて**「①フロントエンド（要求）」「②バックエンド（収集・加工）」「③フロントエンド（描画）」**の3段階で構成されています。

全体フロー図
ユーザー操作 → APIリクエスト → RSS取得(並列) → Geminiでタグ生成 → JSONレスポンス → DOM更新

詳細ロジック解説
STEP 1. フロントエンド：要求のトリガー
ユーザーがチェックボックスを変更し、「Load News」ボタンを押したときの処理です（index.html 内の fetchNews() 関数）。

カテゴリの収集:
document.querySelectorAll('input...:checked') を使い、現在チェックが入っているカテゴリ（例: ['technology', 'business']）を配列として取得します。
APIへの送信:
取得した配列をJSON形式（{ categories: [...] }）に変換します。
fetch('/api/news', ...) を実行し、バックエンドに対して POSTリクエスト を送信します。
この間、画面には「Loading...」を表示し、ボタンを無効化（Disabled）して連打を防ぎます。
STEP 2. バックエンド：データの収集と加工
Node.jsサーバー（server.ts）がリクエストを受け取り、ニュースデータを生成する最も重要なパートです。

リクエスト受信:
/api/news エンドポイントが叩かれ、送られてきたカテゴリリストを受け取ります。
RSSフィードの並列取得（高速化）:
選択されたカテゴリに対応するRSS URLリスト（RSS_SOURCES）を参照します。
Promise.all を使用して、対象となる複数のRSSサイトへ同時にアクセスし、データを取得します（直列ではないため高速です）。
各RSSから最新の記事を抽出し、一つの配列（allNews）にまとめます。
ソートとフィルタリング:
取得した全記事を「日付の新しい順」に並び替えます。
Gemini APIの制限やパフォーマンスを考慮し、処理する記事数を一定数（例: 上位15件）に絞ります。
Gemini APIによるタグ生成（AI処理）:
ここがこのアプリの核心機能です。
絞り込んだ記事の「タイトル」をGemini APIに送信します。
プロンプト: Analyze this news headline and return exactly 3 keywords...（この見出しを分析し、3つのキーワードをJSON配列で返して）
Geminiから返ってきた文字列（例: ["AI", "Google", "Tech"]）を解析し、記事データに tags プロパティとして付与します。
STEP 3. フロントエンド：画面の描画
バックエンドから加工済みのデータが戻ってきた後の処理です。

レスポンスの受信:
サーバーから、タグが付与されたニュースデータの配列（JSON）を受け取ります。
DOM（HTML）の生成:
ニュース表示エリア（#news-container）の中身を一度空にします。
データ配列をループ処理し、各ニュースごとに以下のHTML要素を動的に作成します：
カテゴリ・日付: メタ情報として表示。
タイトル: 元記事へのリンク付き。
タグ: Geminiが生成したタグを <span class="tag">#AI</span> のような形で並べます。
色の動的変更:
記事のカテゴリ（technology, science 等）に応じて、カードの左線の色（border-left-color）をJavaScriptで切り替え、視認性を高めます。
完了:
ローディング表示を消し、ボタンを再度有効化します。
