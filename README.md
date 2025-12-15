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
