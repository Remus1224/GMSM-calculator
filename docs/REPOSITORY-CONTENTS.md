# GitHub 上傳內容與網站運作的關係

網站程式與維護資料分開管理。本輪新增極限屬性與輪迴星火資訊；本機開發過程不納入公開分支。

## 網站實際使用

| 位置 | 用途 |
| --- | --- |
| 根目錄 HTML/CSS/JS | 主選單與計算工具 |
| `assets/css/`、`assets/js/`、圖示與音效 | 共通樣式、GA4、圖片匯出及遊戲素材 |
| `1204/`、`light-sanctum-pray/` | 既有獨立工具與祈禱 runtime |
| `game-info/` 的 HTML/CSS/JS 與 `data/` | 十一項資訊、寵物食品計算機及其資料 |

新增的兩份資訊 JSON、星火素材與裝備 PNG 會由網站讀取，必須上傳。

## 不由網站載入，但保留於 GitHub

| 位置 | 用途 | 本輪狀態 |
| --- | --- | --- |
| `README.md` | 專案介紹與入口 | 更新資訊清單 |
| `docs/DATA-NOTES.md` | 資料來源、版本與公式 | 加入兩項資訊，整併過時說明 |
| `docs/MAINTENANCE.md` | 共通元件與維護流程 | 補上共通數字與分支/CI 流程 |
| `docs/REPOSITORY-CONTENTS.md` | 上傳範圍分類 | 更新本輪範圍 |
| `docs/analytics/GA4-TOOL-TRACKING.md` | 事件與報表設定 | 補上兩個中文資訊名稱 |
| `assets/equipment/category-icons-source.json` | 圖集座標與素材雜湊追溯 | 新增來源紀錄 |
| `LICENSE`、`THIRD_PARTY_NOTICES.md` | 授權與第三方素材聲明 | 沿用 |
| `.github/` | GitHub Actions CI 與回報格式 | 沿用 |
| `docs/releases/` | 既有里程碑紀錄 | 沿用，本輪不另新增 |
| `.gitignore` | 排除本機紀錄 | 沿用 |
| 本機預覽啟動器 | Windows 開發預覽 | 沿用，瀏覽器不載入 |

GA4 JavaScript 是網站程式，GA4 Markdown 才是維護文件；測量 ID 屬網站既有設定。圖集來源 JSON 供維護追溯，頁面不讀取它。

## 僅留本機、不上傳

`.local-docs/` 已由 `.gitignore` 排除，集中保存交接、調查、歷史 UI 迭代、資料轉換/驗證腳本、畫面截圖、比較頁、預覽暫存與私人 GA4 紀錄。舊 SVG 入口佔位圖也移入本機 `retired-assets/`。

目前交接摘要在 `.local-docs/handoff/game-info.md`；過時交接及 UI 修改腳本歸入 `.local-docs/history/`，保留原始內容以供回溯，不作為現行實作指示。Git 不會備份這些本機檔案，需另行保留。
