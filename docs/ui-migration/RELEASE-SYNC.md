# 正式版同步紀錄（2026-10-04）

狀態：已依使用者授權，將本輪已驗收 Beta 內容逐檔套用至 feature/game-info-v21-local-ui 分支的正式入口。這次更新提交與推送到同名分支，main 與公開站發布尚未變更。外觀、公告與功能已由使用者確認。

## 同步範圍

共 32 個候選檔案：8 個需更新、18 個需新增、6 個共通檔案／素材已在目前工作目錄中到位。既有楓幣素材更新與金幣檔案移除也須納入後續發布變更清單。

| 處理 | 正式路徑 | 來源 | 分類 |
| --- | --- | --- |
| update | index.html | beta/index.html | entry_and_tool |
| update | style.css | beta/style.css | entry_and_tool |
| update | script.js | beta/script.js | entry_and_tool |
| update | 1204/index.html | beta/1204/index.html | entry_and_tool |
| update | 1204/style.css | beta/1204/style.css | entry_and_tool |
| update | 1204/script.js | beta/1204/script.js | entry_and_tool |
| update | light-sanctum-pray/index.html | beta/light-sanctum-pray/index.html | entry_and_tool |
| update | light-sanctum-pray/style.css | beta/light-sanctum-pray/style.css | entry_and_tool |
| add | assets/css/hexa-decisions.css | beta/assets/css/hexa-decisions.css | accepted_tool_module |
| add | assets/css/hexa-progress.css | beta/assets/css/hexa-progress.css | accepted_tool_module |
| add | assets/css/home.css | beta/assets/css/home.css | accepted_tool_module |
| add | assets/css/hyper-stat.css | beta/assets/css/hyper-stat.css | accepted_tool_module |
| add | assets/css/ignore.css | beta/assets/css/ignore.css | accepted_tool_module |
| add | assets/css/liberation.css | beta/assets/css/liberation.css | accepted_tool_module |
| add | assets/css/notice.css | beta/assets/css/notice.css | accepted_tool_module |
| add | assets/css/rune.css | beta/assets/css/rune.css | accepted_tool_module |
| add | assets/css/simulator-settings.css | beta/assets/css/simulator-settings.css | accepted_tool_module |
| add | assets/css/standalone-tools.css | beta/assets/css/standalone-tools.css | accepted_tool_module |
| add | assets/css/tool-shell.css | beta/assets/css/tool-shell.css | accepted_tool_module |
| add | assets/js/genesis-layout.js | beta/assets/js/genesis-layout.js | accepted_tool_module |
| add | assets/js/hexa-progress.js | beta/assets/js/hexa-progress.js | accepted_tool_module |
| add | assets/js/simulator-settings.js | beta/assets/js/simulator-settings.js | accepted_tool_module |
| add | assets/js/site-pilot.js | beta/assets/js/site-pilot.js | accepted_tool_module |
| add | assets/js/standalone-tools.js | beta/assets/js/standalone-tools.js | accepted_tool_module |
| add | assets/js/tool-shell.js | beta/assets/js/tool-shell.js | accepted_tool_module |
| retain | assets/css/site-theme.css | assets/css/site-theme.css | shared_component |
| retain | assets/css/glass.css | assets/css/glass.css | shared_component |
| retain | assets/css/site-components.css | assets/css/site-components.css | shared_component |
| retain | assets/css/calculator-components.css | assets/css/calculator-components.css | shared_component |
| retain | assets/js/glass.js | assets/js/glass.js | shared_component |
| add | assets/hexa/icon_靈魂艾爾達斯氣息100.png | beta/assets/hexa/icon_靈魂艾爾達斯氣息100.png | required_asset |
| retain | assets/common/icon_楓幣.png | assets/common/icon_楓幣.png | accepted_asset_rename |

## 已處理的引用差異

三個入口的玻璃共通 CSS／JS 及工具模組引用已轉為正式相對路徑；候選入口不引用 beta/。保留正式祈禱 iframe：`runtime/index.html?v=20260926-preset-r1`。129 筆 HTML／CSS 本地引用存在，沒有缺檔。

## 必須保留

- 正式 craft-effects.js 的威爾素材失敗重試補丁；不以 Beta 檔案覆蓋。
- 正式祈禱外殼 script.js、音效控制與 runtime 全部 60 個檔案；候選包不含 runtime 覆蓋。
- 現有計算資料與瀏覽器保存格式；HEXA 第二副屬性舊 key 的相容讀取保留。

## 不是只有 CSS 的差異

- HEXA 第二副屬性欄位 ID、重設與保存相容性修正。
- 六轉現行 Beta 的啟源勾選、未開放核心隱藏與氣息（100）庫存欄位。
- 創世鍊成明細改為純資訊表，保留上方目標選單。
- 公告日期、未讀狀態與本次簡短更新說明。

以上是目前已驗收並同步的 Beta 輸入／顯示行為，於清單中與材質整理分開記錄；不把它們宣稱為純 CSS 調整。

## 排除項目

- beta/game-info/**：Beta-only information center; not part of this update
- beta/night-background-tuner.html, beta/assets/*/night-background-tuner.*：Background experiment pages are not accepted product entries
- beta/craft-effects.js：Would remove formal Will asset loader patch
- beta/light-sanctum-pray/runtime/**：Formal runtime remains unchanged
- tools/**, START_LAN_PREVIEW.cmd, artifacts/**：Local preview and verification tooling are not website payload
- beta/assets/craft/Item_混沌武器結晶.png, beta/assets/equipment/混沌天之星光權杖.webp：Copied Beta repairs match existing formal assets; no new formal files needed

## 準備位置與後續套用

- 候選檔案：`E:/game-info/formal-sync-20261004/candidate`。
- 完整來源／目標 SHA-256 與保留清單：[formal-sync-inventory.json](formal-sync-inventory.json)。候選資料夾原檔為 `E:/game-info/formal-sync-20261004/inventory.json`。
- 套用前已確認來源、候選及正式現況 hash；8 個原檔已備份於 `E:/game-info/formal-sync-20261004/formal-before`，18 個新增檔亦列入清單。
- 後續提交依本清單逐檔選取，避免混入資訊中心、調色頁與本地驗證工具。

## 本次必要確認

機器紀錄：[formal-sync-verification.json](formal-sync-verification.json)。

- 9 份候選 JavaScript 語法正常。
- 正式路徑主選單、布告欄、1204 與祈禱外殼載入正常，沒有缺檔、頁面 JS 例外或整頁橫向溢出。
- 10 個模擬器內部場景／彈窗 DOM 與目前正式來源一致。
- 祈禱外殼沿用正式 iframe query，runtime bridge 已就緒。
- 沿用使用者已確認的外觀與功能，不重跑完整視覺或遊戲流程矩陣。

套用輔助程式：`E:/game-info/formal-sync-20261004/apply-formal-sync.cjs`。本次已完成 26 個需新增／更新的正式檔案套用，6 個已到位檔案維持原樣；套用後再次確認全部 32 個檔案與候選版本一致，保留補丁及 60 個 runtime 檔案的 SHA-256 均未改變。

## 分支提交範圍

同時提交已驗收的 Beta 對應程式、樣式與必要素材，包含先前補齊的兩張製作素材；資訊中心與調色頁的本地修改不納入本次提交。只選取明確路徑，沒有整個工作目錄一起提交。
