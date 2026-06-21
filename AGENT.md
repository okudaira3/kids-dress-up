# AGENT.md

## このリポジトリでやること

4歳前後の子ども向けに、1画面で完結する「お着替え遊びWebアプリ」を作る。

- 順番に服を選ぶ
- 選んだ内容をキャラクタープレビューへ即時反映する
- 最初はローカルで完成させる
- 最終的に GitHub Pages へ公開できる構成にする

## プロダクト理解

このアプリの中心は「幼児でも迷いにくい順番操作」と「見た目の変化がすぐ分かること」。

- 画面遷移は使わない
- 1画面完結
- スマホ、タブレット前提
- 文字はひらがな多め
- 大きいカードで押しやすくする
- 明るくやさしい見た目にする

## 実装対象

技術スタックは以下。

- Vite
- React
- TypeScript
- CSS Modules または通常の CSS
- GitHub Pages

不要なものは以下。

- バックエンド
- DB
- ログイン

## 画面要素

1画面内に以下を置く。

1. タイトル
2. 現在の案内文
3. キャラクタープレビュー
4. 選択カテゴリ一覧
5. やりなおすボタン

## 選択フロー

順番は固定。

1. `person`
   - おんなのこ
   - おとこのこ
2. `top`
   - Tシャツ
   - シャツ
   - ブラウス
   - トレーナー
3. `bottom`
   - ズボン
   - ジーンズ
   - はんズボン
   - スカート
4. `accessory`
   - リュック
   - めがね
   - ぼうし

## 操作ルール

- 最初は `person` だけ選べる
- 1つ選ぶごとに次のカテゴリを解放する
- 未来のカテゴリは disabled にする
- disabled 中のカテゴリには「まだあとでね」を表示する
- 過去カテゴリは選び直し可能
- 選び直しても以降の選択は原則保持する
- 「やりなおす」で全選択を初期化する

## 状態管理ルール

型はこの前提で実装する。

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

type Selected = {
  person: string | null;
  top: string | null;
  bottom: string | null;
  accessory: string | null;
};
```

ステップ判定はこの考え方を守る。

```ts
const getCurrentStepIndex = (selected: Selected): number => {
  if (!selected.person) return 0;
  if (!selected.top) return 1;
  if (!selected.bottom) return 2;
  if (!selected.accessory) return 3;
  return 4;
};

const isStepEnabled = (stepIndex: number, selected: Selected): boolean => {
  const currentStepIndex = getCurrentStepIndex(selected);
  return stepIndex <= currentStepIndex;
};
```

完成条件は以下。

```ts
const isComplete = !!(
  selected.person &&
  selected.top &&
  selected.bottom &&
  selected.accessory
);
```

## プレビュー方針

MVP では画像素材に依存しない。

- CSS 図形
- 絵文字
- 簡易イラスト

ただし将来の差し替えを見越して、レイヤー構造は維持する。

```text
base character
top clothing
bottom clothing
accessory
```

React 構造の目安。

```tsx
<div className="avatarStage">
  <div className="avatarBase" />
  <div className={`topLayer top-${selected.top}`} />
  <div className={`bottomLayer bottom-${selected.bottom}`} />
  <div className={`accessoryLayer accessory-${selected.accessory}`} />
</div>
```

未選択レイヤーは表示しない。

## 見た目の基準

- スマホでは 1 カラム
- タブレット以上では横並び可
- 大きいカード
- 角丸
- 大きめ余白
- やわらかい色
- 現在のカテゴリを目立たせる
- 選択済みカードを強調する
- disabled カードは本当に押せない状態にする

## プレビュー表現の最低基準

ベース。

- 丸い顔
- 髪型で男女差を軽く表現
- 体は白いベース服

服。

- Tシャツ: 黄色
- シャツ: 水色、襟つき風
- ブラウス: ピンク、丸襟風
- トレーナー: 黄緑、長袖風
- ズボン: ベージュ
- ジーンズ: 青
- はんズボン: 緑
- スカート: ピンク

アクセサリー。

- リュック: 横または前に記号的表示で可
- めがね: 顔の上
- ぼうし: 頭の上

## 作成対象ファイル

最終的に少なくとも以下を持つ構成にする。

```text
.github/workflows/deploy.yml
src/App.tsx
src/App.css
src/main.tsx
src/vite-env.d.ts
public/
index.html
package.json
tsconfig.json
tsconfig.node.json
vite.config.ts
README.md
```

## デプロイ要件

- GitHub Pages 前提で `vite.config.ts` の `base` を設定する
- 現時点の想定 repo 名は `kids-dress-up`
- `base` は `/kids-dress-up/`
- repo 名変更時は `README.md` に `base` 変更ルールを書く
- `.github/workflows/deploy.yml` を用意して `main` push で Pages へ deploy する

## 品質基準

- TypeScript の型エラーを出さない
- `npm run build` を通す
- スマホ幅でも崩さない
- disabled カテゴリは操作不能にする
- 過去カテゴリの選び直しを可能にする
- 選択内容をプレビューへ反映する
- GitHub Actions で Pages 配備できる構成にする

## 実装時の判断基準

- まずは MVP を完成させる
- 画像生成素材ベースではなく CSS レイヤーで組む
- 将来の PNG/SVG 差し替えを邪魔しない DOM/CSS 構造にする
- 複雑な状態管理ライブラリは入れない
- 選択肢データはハードコードでよいが、拡張しやすい形にする

## README に必ず書くこと

- アプリ概要
- ローカル実行方法
- GitHub Pages 公開方法
- repo 名変更時の `base` 設定
- 今後の改善案

改善案として入れる項目。

- CSS 図形から透過 PNG または SVG への差し替え
- 色違い追加
- 靴、靴下追加
- 完成コメントの複数化
- 音声読み上げ
- 画像保存

## 注意

- 選択肢カード用の画像と、重ね着プレビュー用の画像は用途が違う
- 着せ替え画像を将来導入する場合、全素材は同一キャンバス、同一位置基準、透過背景で揃える
- 最初の MVP は CSS で成立させる
