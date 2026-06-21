import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const sourceCode = readFileSync("src/App.tsx", "utf8");
const rootAbsoluteAssetPattern = /["'`]\/assets\/(cards|preview)\//;

if (rootAbsoluteAssetPattern.test(sourceCode)) {
  throw new Error("src/App.tsx に /assets/... のルート絶対パスが残っています。");
}

const distAssetsDir = "dist/assets";
const jsFiles = readdirSync(distAssetsDir).filter((file) => file.endsWith(".js"));

if (jsFiles.length === 0) {
  throw new Error("dist/assets に JavaScript ファイルが見つかりません。先に npm run build を実行してください。");
}

const builtCode = jsFiles.map((file) => readFileSync(join(distAssetsDir, file), "utf8")).join("\n");

if (rootAbsoluteAssetPattern.test(builtCode)) {
  throw new Error("ビルド成果物に /assets/... のルート絶対パスが残っています。");
}

const requiredSnippets = [
  "/kids-dress-up/",
  '"assets/cards/person-girl.png"',
  '"assets/preview/top-tshirt.png"',
];

for (const snippet of requiredSnippets) {
  if (!builtCode.includes(snippet)) {
    throw new Error(`ビルド成果物に ${snippet} が含まれていません。`);
  }
}

console.log("Asset paths are based on Vite BASE_URL and no root-absolute /assets paths remain.");
