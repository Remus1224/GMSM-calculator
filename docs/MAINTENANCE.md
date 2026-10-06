# 維護與共通樣式

## 網站結構

網站只有一份正式程式來源：主頁、`1204/`、`light-sanctum-pray/` 與 `game-info/`。測試修改使用 Git 分支及本機預覽，不再維護 Beta 副本。

資訊入口、標題與資料檔由 `game-info/data/catalog.json` 管理；資料與計算定義見 [DATA-NOTES.md](DATA-NOTES.md)，GA4 事件定義見 [GA4-TOOL-TRACKING.md](analytics/GA4-TOOL-TRACKING.md)。

## 共通規則

- `assets/css/site-theme.css`、`glass.css`：主題與玻璃材質。
- `site-components.css`：入口卡、控制項、數值卡、表格及手機分頁。工具專用 CSS 保留尺寸、欄位內容與斷點。
- `tool-shell.css` 與 `assets/js/tool-shell.js`：工具標題、版本與來源資訊、寬度、圖片儲存等工具外框。
- `assets/js/site-view-switch.js`：共通分頁切換；`site-notify.js`：共通提醒；`site-image-export.js`：圖片匯出支援。

新增入口使用 `site-menu-entry`。透明素材可透過 catalog 的 `iconStyle: "transparent"` 套用滿版底板，不另修改圖片。下拉選單、勾選與互動狀態優先採現有共通元件。

表格分頁使用 `site-table-paged-scroll`、`site-table-pages`、`site-table-page`、`site-table-page-grid`；固定左欄使用 `site-table-paged-layout`。可調參數包括 `--site-table-page-gap`、`--site-table-page-width`、`--site-table-fixed-column-width` 與 `--site-table-page-columns`。

寵物食品手機每段占滿可視寬度；六轉固定等級欄並每次滑動兩個核心；海洛斯 A 區每頁兩張表、B/C 每頁一組；輔助武器採固定鍊成區間及完整欄位組定位。

數字對齊使用 `site-table-number-aligned` 的固定數字槽位；百分號使用 `site-table-number-unit`。不要只用等寬欄的中心距離判斷文字間距，仍需考慮實際數字寬度。

呼吸提醒使用 `site-note-breath` 等共通類別，並遵守減少動畫偏好。規則採選用方式，避免影響未套用的工具。

## 檢查與預覽

GitHub Actions 的 `Validate project` 在 main 的 push 與 Pull Request 執行 JavaScript 語法、必要檔案、入口路徑、共通模組及 README 政策連結檢查。入口檢查也可執行：

```sh
node .github/scripts/verify-formal-paths.cjs
```

本機祈禱預覽入口為 `light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`，搭配同目錄的 `.ps1`。這兩個檔案供開發預覽，正式網站不載入。

靜態檢查不取代桌面/手機、圖片儲存與遊戲數值實際確認。

## 開發紀錄

交接、階段性調查與私人 GA4 設定保留在不納入 Git 的 `.local-docs/`；該資料夾的 README 提供移動對照。歷史紀錄含舊版指示，現行程式與本文件優先。
