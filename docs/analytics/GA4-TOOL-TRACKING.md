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
| 獨立頁 | `1204-generator` | 1204 產生器 | site | generator |
| 獨立頁 | `light-sanctum-pray` | 光之聖所祈禱模擬器 | simulator | pray |

資訊頁的 `tool_name` 使用 catalog 標題；寵物食品計算機使用固定名稱。資訊頁閱讀會記錄 `tool_view`，不要求操作，因此不能只用 `tool_use` 排行判斷資訊頁是否有人查閱。

## 事件與去重

`tool_view` 表示進入某個工具。連續呼叫同一個 `tool_id` 不重複送；切到另一工具或首頁後再進入會再記一次。重新整理、新分頁及 BFCache 返回各自開始新 visit。GA 的總使用者會做使用者層級去重，事件計數仍會包含每次進入。

`tool_use` 表示該 visit 中第一次可信的操作：設定欄位、選單，或按下工具操作按鈕。每個 visit 最多一筆，`action_type` 僅為 `configure`、`action`、`simulate` 之一。初始化、預設值還原、程式合成事件，以及導覽、分頁切換、主題、音效、全螢幕、匯出／下載按鈕不會當成工具操作。祈禱模擬器只在合法 iframe state 首次基準之後觀察到累積結晶增加時記 `simulate`；不傳送消耗量。

`tool_export` 僅在 PNG 建立並觸發下載或長按預覽後記錄；`save_method` 僅為 `download` 或 `long_press`。舊事件（例如 `use_simulator`、`toggle_sound`、`download_1204_generator`）保留給既有報表。舊事件與新 `tool_use`／`tool_export` 是不同事件，不要相加當作同一指標。

三種新事件共用 `tool_id`、`tool_name`、`tool_category`、`tool_surface`。`tool_use` 另帶 `action_type`，`tool_export` 另帶 `save_method`。不傳輸欄位值、輸入文字、價格、等級、玩家名稱、消耗數值或整份表單。GA4 自動 page_view 維持開啟；本程式不另外送 virtual page_view，避免與 enhanced measurement 重複。

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