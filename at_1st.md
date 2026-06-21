# 指示書：幼児向けお着替え遊びWebアプリ

## 目的

4歳前後の子どもが、1画面の中で順番に服を選び、選んだ服装がキャラクターに反映される「お着替え遊びWebアプリ」を作る。

最初はローカルで動作確認し、最終的に GitHub Pages で公開できる構成にする。

## 技術スタック

- Vite
- React
- TypeScript
- CSS Modules または通常のCSS
- GitHub Pages

外部バックエンド、DB、ログイン機能は不要。

## アプリの基本仕様

### 画面構成

画面遷移は使わない。  
1画面完結にする。

画面には以下を表示する。

1. タイトル
2. 現在の案内文
3. キャラクタープレビュー
4. 選択カテゴリ一覧
5. やりなおすボタン

### 選択フロー

選択順は以下。

1. ひとをえらぶ
   - おんなのこ
   - おとこのこ

2. うえのふく
   - Tシャツ
   - シャツ
   - ブラウス
   - トレーナー

3. したのふく
   - ズボン
   - ジーンズ
   - はんズボン
   - スカート

4. みにつけるもの
   - リュック
   - めがね
   - ぼうし

### ロック仕様

- 最初は「ひとをえらぶ」だけ押せる。
- ひとを選ぶと「うえのふく」が押せる。
- うえのふくを選ぶと「したのふく」が押せる。
- したのふくを選ぶと「みにつけるもの」が押せる。
- みにつけるものを選ぶと完成状態になる。
- 未来のカテゴリはグレーアウトする。
- グレーアウト中のカテゴリには「まだあとでね」と表示する。
- 過去に選んだカテゴリは選び直し可能。
- 選び直しても、それ以降の選択は基本的に保持する。
- 「やりなおす」を押すとすべてリセットする。

## UI要件

- スマホ・タブレット前提のレスポンシブデザイン。
- 幼児が押しやすいようにカードは大きめにする。
- 文字はひらがな多めにする。
- 明るくやさしい色味にする。
- 角丸、大きめ余白、やわらかい雰囲気にする。
- 現在選ぶカテゴリは目立たせる。
- 選択済みカードは分かりやすく強調する。
- 押せないカードは disabled にし、クリックしても反応しない。
- 男女で選べる服は制限しない。
- どの服もどのキャラクターにも着せられるようにする。

## キャラクタープレビュー仕様

選択内容をプレビューに反映する。

### MVPの実装方針

最初は画像素材に依存せず、CSS図形と絵文字・簡易イラストで実装する。  
ただし、将来的に透過PNGまたはSVG素材に差し替えられるよう、レイヤー構造を保つ。

プレビューは以下のレイヤー構造にする。

```text
base character
top clothing
bottom clothing
accessory
```

React上では、以下のような構造にする。

```tsx
<div className="avatarStage">
  <div className="avatarBase" />
  <div className={`topLayer top-${selected.top}`} />
  <div className={`bottomLayer bottom-${selected.bottom}`} />
  <div className={`accessoryLayer accessory-${selected.accessory}`} />
</div>
```

未選択のレイヤーは表示しない。

## データ構造

選択肢はハードコードでよいが、あとから増やしやすい形にする。

```ts
type StepKey = "person" | "top" | "bottom" | "accessory";

type Option = {
  id: string;
  label: string;
  emoji?: string;
};

type Step = {
  key: StepKey;
  title: string;
  shortTitle: string;
  options: Option[];
};
```

選択状態は以下。

```ts
type Selected = {
  person: string | null;
  top: string | null;
  bottom: string | null;
  accessory: string | null;
};
```

## ステップ判定

以下のような関数を作る。

```ts
const getCurrentStepIndex = (selected: Selected): number => {
  if (!selected.person) return 0;
  if (!selected.top) return 1;
  if (!selected.bottom) return 2;
  if (!selected.accessory) return 3;
  return 4;
};
```

カテゴリが操作可能かどうかは以下。

```ts
const isStepEnabled = (
  stepIndex: number,
  selected: Selected
): boolean => {
  const currentStepIndex = getCurrentStepIndex(selected);
  return stepIndex <= currentStepIndex;
};
```

完成状態は以下。

```ts
const isComplete = selected.person
  && selected.top
  && selected.bottom
  && selected.accessory;
```

## GitHub Pages公開要件

GitHub Pagesで公開できるようにする。

### package.json

`homepage` は使わなくてよい。  
Viteの `base` を設定する。

### vite.config.ts

リポジトリ名を `kids-dress-up` と仮定して、以下のように設定する。

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/kids-dress-up/",
});
```

ただし、READMEに以下を明記する。

```text
リポジトリ名を変更した場合は vite.config.ts の base も変更すること。
例：
repo-name が my-app の場合 base は "/my-app/"
```

### GitHub Actions

`.github/workflows/deploy.yml` を作成して、mainブランチにpushされたらGitHub Pagesへデプロイする。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 作成してほしいファイル

以下の構成で作る。

```text
kids-dress-up/
  .github/
    workflows/
      deploy.yml
  src/
    App.tsx
    App.css
    main.tsx
    vite-env.d.ts
  public/
  index.html
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  README.md
```

## 実装要件

### App.tsx

- steps配列を定義する。
- selected stateをuseStateで管理する。
- handleSelect(stepKey, optionId) を作る。
- reset関数を作る。
- getCurrentStepIndexを作る。
- isStepEnabledを作る。
- キャラクタープレビュー用コンポーネントを作る。
- 選択カテゴリ表示用コンポーネントを作る。
- 完成時に「できた！」を表示する。

### App.css

- 子ども向けの明るいUI。
- レスポンシブ対応。
- スマホでは1カラム。
- タブレット以上ではプレビューと選択肢を横並びにしてもよい。
- カードは大きく、押しやすくする。
- disabledカテゴリはグレーアウトする。
- 現在カテゴリは少し強調する。
- 選択済みカードは枠線や背景で強調する。

## プレビュー表現

MVPではCSSだけで簡易表現する。

### ベース

- 丸い顔
- 髪型で「おんなのこ」「おとこのこ」を軽く区別
- 体はシンプルな白いベース服

### 服

選択に応じて色や形が変わるようにする。

例：

- Tシャツ：黄色
- シャツ：水色、襟つき風
- ブラウス：ピンク、丸襟風
- トレーナー：黄緑、長袖風
- ズボン：ベージュ
- ジーンズ：青
- はんズボン：緑
- スカート：ピンク

### アクセサリー

- リュック：背中側ではなく、横または前に記号的に表示してよい
- めがね：顔の上に表示
- ぼうし：頭の上に表示

## READMEに書く内容

READMEには以下を書く。

1. アプリ概要
2. ローカル実行方法
3. GitHub Pages公開方法
4. リポジトリ名を変えた場合の `base` 設定
5. 今後の改善案

ローカル実行方法は以下。

```bash
npm install
npm run dev
```

ビルド確認は以下。

```bash
npm run build
npm run preview
```

## 今後の改善案

READMEに以下を記載する。

- CSS図形から透過PNGまたはSVG素材に差し替える
- 服の色違いを追加する
- 靴や靴下を追加する
- 完成時のコメントを複数パターンにする
- 音声読み上げを追加する
- 選んだ服装を画像保存できるようにする

## 品質条件

- TypeScriptで型エラーが出ないこと。
- `npm run build` が成功すること。
- スマホ幅でも破綻しないこと。
- クリックできないカテゴリは本当に操作できないこと。
- 過去カテゴリの選び直しができること。
- 選んだ内容がプレビューに反映されること。
- GitHub ActionsでPagesデプロイできること。

## 注意

- 画像生成AIで作ったカード画像は、選択肢カード用としては使えるが、着せ替えプレビューにそのまま重ねる用途には向かない。
- 着せ替え用画像を追加する場合は、全素材を同じキャンバスサイズ・同じ位置基準・透過背景で作ること。
- 最初のMVPでは、CSS図形で着せ替えプレビューを実装する。