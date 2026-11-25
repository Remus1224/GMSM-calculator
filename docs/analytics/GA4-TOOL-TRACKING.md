# GA4 工具追蹤

## 現況與涵蓋範圍

根頁與 1204 產生器原先載入 GA4 資源 `G-FSW7VLPBYS`；根頁有少數模擬器與音效舊事件，1204 有 `download_1204_generator`。資訊頁及祈禱頁原先沒有 GA4 loader，主頁舊事件也未完整涵蓋全部工具。共用 `assets/js/site-analytics.js` 現在負責正式網站的單一 loader 與新事件。Local file、localhost、loopback 與私有 LAN 位址不載入 gtag、不送新事件。

| 入口 | 穩定 tool_id | 顯示名稱 | 分類 | surface |
| --- | --- | --- | --- | --- |
| 主頁 | `transcend` | 超越模擬器 | simulator | main |
| 主頁 | `craft` | 製作模擬器 | simulator | main |
| 主頁 | `emb-enhance` | 紋章模擬器 | simulator | main |
| 主頁 | `acc-enhance` | 飾品強化模擬器 | simulator | main |
| 主頁 | `star` | 星力強化模擬器 | simulator | main |
| 主頁 | `ignore` | 無視防禦計算機 | calculator | main |
| 主頁 | `hyper-stat` | 極限屬性計算機 | calculator | main |
| 主頁 | `rune` | 符文計算機 | calculator | main |
| 主頁 | `liberation` | 創世解放計算機 | calculator | main |
| 主頁 | `hexa-prog` | 六轉進度計算機 | hexa | main |
| 主頁 | `hexa-visual` | HEXA屬性模擬器 | hexa | main |
| 主頁 | `hexa-lazy` | HEXA懶人決策表 | hexa | main |
| 主頁 | `hexa-reset` | HEXA重置決策模擬 | hexa | main |
| 主頁 | `hexa-sim` | HEXA目標機率模擬 | hexa | main |
| 主頁 | `will` | 威爾二階練習機 | practice | main |
| 主頁 | `notice` | 布告欄 | site | main |
| 資訊首頁 | `info-home` | 也許有用的資訊 | site | info |
| 資訊頁 | `info-genesis-liberation` | 創世解放 | information | info |
| 資訊頁 | `info-helos-seal` | 海洛斯的封印 | information | info |
| 資訊頁 | `info-constellation-core` | 星座核心 | information | info |
| 資訊頁 | `info-light-sanctum-pray-exp` | 光之聖所 祈禱 | information | info |
| 資訊頁 | `info-hexa-core` | 六轉核心 | information | info |
| 資訊頁 | `pet-food-table` | 寵物食品 | information | info |
| 資訊頁 | `pet-food-calculator` | 寵物食品計算機 | calculator | info |
| 資訊頁 | `info-secondary-weapon` | 輔助武器鍊成 | information | info |
| 資訊頁 | `info-rune-requirements` | 神秘/真實符文 | information | info |
| 資訊頁 | `info-starforce-requirements` | 星力強化 | information | info |
| 資訊頁 | `info-hyper-stat-requirements` | 極限屬性 | information | info |
| 資訊頁 | `info-flame-expectations` | 輪迴星火 | information | info |
| 獨立頁 | `1204-generator` | 1204 產生器 | site | generator |
| 獨立頁 | `light-sanctum-pray` | 光之聖所祈禱模擬器 | simulator | pray |

資訊首頁以 `info-home` 獨立記錄開啟，顯示「也許有用的資訊」，分類為 `site`；十一項資料頁維持 `information`，可用分類篩選個別資訊人氣。首頁切入資訊、返回首頁、重新整理與 BFCache 返回都沿用每次進入記錄規則；連續重複初始化不多記，尚在載入或載入失敗不誤記首頁。

資訊頁的 `tool_name` 使用 catalog 標題；寵物食品計算機使用固定名稱。資訊頁閱讀會記錄 `tool_view`，不要求操作，因此不能只用 `tool_use` 排行判斷資訊頁是否有人查閱。

## 事件與去重

`tool_view` 表示進入某個工具。連續呼叫同一個 `tool_id` 不重複送；切到另一工具或首頁後再進入會再記一次。重新整理、新分頁及 BFCache 返回各自開始新 visit。GA 的總使用者會做使用者層級去重，事件計數仍會包含每次進入。

`tool_use` 表示該 visit 中第一次可信的操作：設定欄位、選單，或按下工具操作按鈕。每個 visit 最多一筆，`action_type` 僅為 `configure`、`action`、`simulate` 之一。初始化、預設值還原、程式合成事件，以及導覽、分頁切換、主題、音效、全螢幕、匯出／下載按鈕不會當成工具操作。祈禱模擬器只在合法 iframe state 首次基準之後觀察到累積結晶增加時記 `simulate`；不傳送消耗量。

`tool_export` 僅在 PNG 建立並觸發下載或長按預覽後記錄；`save_method` 僅為 `download` 或 `long_press`。舊事件（例如 `use_simulator`、`toggle_sound`、`download_1204_generator`）保留給既有報表。舊事件與新 `tool_use`／`tool_export` 是不同事件，不要相加當作同一指標。

三種新事件共用 `tool_id`、`tool_name`、`tool_category`、`tool_surface`。`tool_use` 另帶 `action_type`，`tool_export` 另帶 `save_method`。不傳輸欄位值、輸入文字、價格、等級、玩家名稱、消耗數值或整份表單。GA4 自動 page_view 維持開啟；本程式不另外送 virtual page_view，避免與 enhanced measurement 重複。

### 極限屬性資訊追蹤

極限屬性資訊沿用上述三種共通事件，工具 ID 為 `info-hyper-stat-requirements`，中文工具名稱為「極限屬性」，與主頁的「極限屬性計算機」分開統計。

進入頁面記錄 `tool_view`，首次使用能力選單記錄 `tool_use`，成功儲存圖片記錄 `tool_export`。能力選單不傳送所選的能力名稱或 ID；同一頁內切換能力不增加頁面進入次數。既有工具人氣報表與已設定的共通維度即可統計，不需要新增事件或維度。本機預覽仍不載入 GA4、不送事件。

## GA4 後台設定

1. 登入 GA4，選擇 Measurement ID 為 `G-FSW7VLPBYS` 的正確資源與資料串流。
2. 前往「管理」>「資料顯示」>「自訂定義」>「建立自訂維度」。範圍選「事件」，事件參數名稱照下表逐字輸入。四個必要維度是前四項；後兩項可選。

| 維度名稱 | 事件參數 | 必要性 |
| --- | --- | --- |
| 工具 ID | `tool_id` | 必要 |
| 工具名稱 | `tool_name` | 必要 |
| 工具分類 | `tool_category` | 必要 |
| 工具入口 | `tool_surface` | 必要 |
| 操作類型 | `action_type` | 選用 |
| 儲存方式 | `save_method` | 選用 |

3. 前往「探索」>「任意形式」（Free form）。加入維度「工具名稱」與「事件名稱」，加入指標「總使用者」與「事件計數」。把「工具名稱」放在列，把兩個指標放在值；篩選「事件名稱」完全符合 `tool_view`，依「總使用者」降冪排序。複製此分頁兩次，分別把事件名稱篩選改成 `tool_use` 和 `tool_export`。`tool_view` 的工具名稱排行用來看人氣；資訊查閱不一定會產生 `tool_use`。
4. 正式資料可在 GA4「報表」>「即時」查看事件；「管理」>「資料顯示」>「DebugView」用於除錯。DebugView 只會顯示啟用了 `debug_mode` 或 Tag Assistant 的除錯流量；本次程式不全域開啟 debug mode。事件參數可在事件詳情與已註冊的自訂維度中確認。
5. 新自訂維度通常需約 24–48 小時才可用於探索；設定前漏掉的歷史事件無法回補。程式已送出 `tool_view`、`tool_use`、`tool_export`，不需在 GA4 UI 另外建立這三個自訂事件，也不需設為 key event。

Google 官方說明：[建立事件範圍的自訂維度與指標](https://support.google.com/analytics/answer/14239696?hl=zh-Hant)、[GA4 探索](https://support.google.com/analytics/answer/9355963?hl=zh-Hant)。

## 水晶寶箱（2026-11-25 發布）

工具 ID `crystal-treasure-box`、中文名「水晶寶箱模擬器」、分類 simulator、surface crystal-treasure-box。僅外層頁載入單一共通 loader，iframe 不載入 GA，避免重複 page_view。

沿用 tool_view 與首次真實抽取的 tool_use（simulate）；需可信 iframe 抽取按鈕操作並觀察到實際計數增加。主題、靜音、全螢幕、重設與程式合成 click 不記 use。初始化不記 use，每 visit 最多一次。

tool_ready 每 visit 一次：load_time_ms 為外層導覽起至觀察到素材就緒，500ms 偵測精度；load_time_bucket 為 under_2s／2_5s／5_10s／10_20s／over_20s；cache_status 為 hit／miss／partial／unavailable。tool_load_error 每 visit 最多一次，load_stage 僅 bootstrap／assets／movies／effects／timeout。載入事件不送原始錯誤、道具、種子、runId 或診斷；分類數量另見下節。

本地／LAN 維持不載入 gtag、不送事件。後台沿用既有工具排行，另建立載入時間區間、影片快取狀態、載入階段等事件維度與 load_time_ms 指標；部署後才開始收資料。


### Crystal Treasure Box 抽取與物品統計

`tool_draw_stats` 每筆送出增量，不是設定頁累積快照。回到可抽取的商店後等待 1 秒，使用 idle callback（有 1.5 秒上限）送出；動畫/發卡/翻卡期間不送出此事件。連續再使用一次的數輪可合併，17 個數量參數加 4 個工具識別參數，不逐張發送。

- `draw_count`, `normal_draws`, `fever_draws`：抽數
- `fever_triggers`, `gauge_triggers`, `lucky_triggers`：觸發次數
- `item_ancient_crystal`, `item_mythic_sub`, `item_legendary_sub`：副武分類數量
- `item_chaos`, `item_ancient`, `item_mythic`, `item_legendary`, `item_rare`：裝備分類數量
- `item_shards5`, `item_shards10`：交換券張數，不乘碎片面額
- `round_count`：本批次含幾輪，保留事件參數，未占用自訂指標

GA4 已建立上述前 16 個參數的標準單位自訂指標。
探索「水晶寶箱｜抽取與物品統計」分頁：抽取與Fever（6項）、獲得物品（10項），篩選工具 ID 完全符合 crystal-treasure-box。
https://analytics.google.com/analytics/web/#/analysis/a394430589p537262629/edit/m2IK7zC3QKiCiu516pI11g

本機/LAN不送事件；不送個別道具名稱、run ID、seed、原始診斷。傳送是 best effort：直接關閉頁面、擋廣告或網路失敗可能漏記，不把 GA4 視為精準帳本；不在離開頁面時強制重送。重新模擬不扣除歷史已送數字，未送增量在同一父頁記憶體中保留至下次商店空閒；重新整理則清除未送增量。
