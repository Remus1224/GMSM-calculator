# GitHub 上傳內容與網站運作的關係

本清單區分「瀏覽器實際使用」與「開發/專案管理」檔案。公開儲存庫包含兩者；不被網站載入不代表應刪除，CI、授權與維護文件仍有用途。

## 網站功能

| 位置 | 用途 |
| --- | --- |
| 根目錄 `index.html`、`script.js`、`style.css`、`craft-effects.js` | 主選單與各工具 |
| `assets/css/`、`assets/js/`、圖示/音效素材 | 共通樣式、操作、GA4、圖片匯出及遊戲素材 |
| `1204/` 的頁面、樣式、腳本與素材 | 1204 產生器 |
| `light-sanctum-pray/` 的頁面、樣式、腳本、runtime 與素材 | 光之聖所祈禱模擬器 |
| `game-info/` 的 HTML/CSS/JS、`data/` 與 `assets/` | 九項資訊、寵物食品計算機與資料 |

此處分類是目錄用途，不表示每一個歷史素材都經過執行時使用率檢查。

## 不屬於網站功能、但仍保留上傳

| 檔案/位置 | 用途 | 本次 PR 的情況 |
| --- | --- | --- |
| `README.md` | GitHub 專案介紹與文件入口 | 更新 |
| `LICENSE`、`THIRD_PARTY_NOTICES.md` | 原始碼授權與第三方素材聲明 | 沿用既有檔案 |
| `docs/releases/*.md` | 更新與里程碑紀錄 | 新增 `2026.10.06.md`，其餘沿用 main |
| `docs/DATA-NOTES.md` | 資料來源與計算規則 | 整併新增 |
| `docs/MAINTENANCE.md` | 共通樣式及檢查方式 | 整併新增 |
| `docs/REPOSITORY-CONTENTS.md` | 上傳內容分類，即本文件 | 新增 |
| `docs/analytics/GA4-TOOL-TRACKING.md` | GA4 事件與後台設定說明 | 移動並保留 |
| `docs/screenshots/shared-cleanup-round2/` | 6 張前後截圖與 1 個比較 HTML | 移動並保留，主站不載入 |
| `.github/workflows/validate.yml` | GitHub Actions CI | 更新 |
| `.github/scripts/verify-formal-paths.cjs` | CI/本機入口檢查 | 更新 |
| `.github/ISSUE_TEMPLATE/` | GitHub 問題回報格式 | 沿用既有檔案 |
| `.gitignore` | 排除本機私人與開發紀錄 | 新增/更新 |
| `light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`、`.ps1` | Windows 本機預覽啟動器 | 新增，瀏覽器不載入 |

注意：GA4 的 `assets/js/site-analytics.js` 是網站程式；GA4 的 MD 說明文件才是開發文件。`game-info/data/*.json` 是網站讀取的資料，也必須保留。

## 本機保留、不再納入分支最新內容

`.local-docs/` 集中保存 13 份交接/調查/過程紀錄，以及私人 GA4 後台紀錄與 4 張截圖。原始內容保留，依交接、調查、歷史、私人紀錄分類；此資料夾不會被 Git 備份。

先前提交過的公開開發文件仍可能存在 Git 歷史；本次移除的是分支最新版本及 PR 最終檔案內容，不改寫既有提交歷史。私人 GA4 帳戶紀錄從未納入提交。
