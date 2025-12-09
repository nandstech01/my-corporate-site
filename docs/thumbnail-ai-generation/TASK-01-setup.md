# TASK-01: 環境構築・パッケージ設定

## 📌 概要

ナノバナナプロ（Gemini 3 Pro Image Preview）を使用するための
環境構築とパッケージインストールを行います。

## ✅ チェックリスト

- [ ] `@google/generative-ai` パッケージのインストール
- [ ] `GOOGLE_AI_API_KEY` 環境変数の設定
- [ ] APIキーの動作確認

## 📦 パッケージインストール

```bash
pnpm add @google/generative-ai
```

## 🔑 環境変数設定

`.env.local` に以下を追加:

```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

### APIキーの取得方法
1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. 「Get API Key」をクリック
3. 新しいAPIキーを作成
4. キーをコピーして `.env.local` に設定

## 🧪 動作確認用コード

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_AI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-3-pro-image-preview'
});

// 簡単なテスト
const result = await model.generateContent({
  contents: [{
    role: 'user',
    parts: [{ text: 'Hello, can you generate an image?' }]
  }],
  generationConfig: {
    responseModalities: ['TEXT'],
  },
});

console.log('API接続成功:', result.response.text());
```

## 📝 完了条件

1. パッケージがインストールされている
2. 環境変数が設定されている
3. APIへの接続が成功する

## ⏭️ 次のタスク

→ [TASK-02: ベース画像の準備](./TASK-02-base-images.md)

