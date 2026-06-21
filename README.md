# kids-dress-up

4歳前後の子ども向けに、1画面で服を順番に選べるお着替え Web アプリです。選んだ内容はその場でキャラクタープレビューに反映されます。

## アプリ概要

- 1画面完結
- `ひと -> うえのふく -> したのふく -> みにつけるもの` の順で選択
- まだ先のカテゴリはロック
- 過去のカテゴリは選び直し可能
- GitHub Pages 公開前提

## ローカル実行方法

```bash
npm install
npm run dev
```

## ビルド確認

```bash
npm run build
npm run preview
```

## GitHub Pages 公開方法

1. GitHub で Public リポジトリを作成する
2. このプロジェクトをそのリポジトリへ push する
3. GitHub の `Settings > Pages` で `GitHub Actions` を使う設定にする
4. `main` ブランチへ push すると `.github/workflows/deploy.yml` により自動デプロイされる

## `base` 設定

`vite.config.ts` では現在のリポジトリ名 `kids-dress-up` を前提に、`base: "/kids-dress-up/"` を設定しています。

リポジトリ名を変更した場合は、`vite.config.ts` の `base` も変更してください。

例:

- repo 名が `my-app` の場合は `base: "/my-app/"`

## 画像素材の加工

元画像を `assets/source/` に置いたあと、以下を実行します。

```bash
python scripts/process_assets.py
```

出力先:

- カード画像: `public/assets/cards/`
- プレビュー用透過画像: `public/assets/preview/`
- 確認用一覧画像: `public/assets/debug/contact-sheet.png`

## 今後の改善案

- CSS ベース人物を透過 PNG または SVG に差し替える
- 服の色違いを追加する
- 靴や靴下を追加する
- 完成時コメントを複数パターンにする
- 音声読み上げを追加する
- 選んだ服装を画像保存できるようにする
