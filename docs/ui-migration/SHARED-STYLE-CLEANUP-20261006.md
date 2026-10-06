# 共用樣式整理（2026-10-06）

## 本輪調整

- 移除未使用的 HEXA 動畫、舊版 Will 暫停函式、表格數字 detail/pair 規則，以及共通選取規則中的 `.is-target` 分支。
- 創世統計與海洛斯統計改用 `.site-stat-grid`；資訊頁數字改用 `.site-table-number`，透過 token 保留各類數值的色彩和字重。
- 新增 opt-in `.site-section-title` 與 `.site-select-centered`，用於資訊頁區塊標題（含寵物與庫存設定標題），以及寵物、符文、創世再鍊成選單。
- 移除資訊頁重複的標題、選單置中、`--line` 別名和字型平滑設定；保留工具專屬尺寸、圖示、能力色與手機欄位分頁。
- 更新載入相關共用 CSS、腳本與資訊頁資源的入口快取版本。
- 補入寵物設定標題 margin token 與 BOSS 難度選單置中，並同步更新共用 CSS、主頁 site-pilot 與資訊頁 CSS 快取鍵。

## 驗證狀態

本輪未執行測試、語法檢查、瀏覽器檢視或圖片匯出；畫面與功能尚待使用者自行驗證。

## 主腳本載入修復（2026-10-06）

使用者回報主腳本第 607 行語法錯誤。原因是換行整理時使用了含字面反引號的單引號 PowerShell 正規表示式，將 `getPersistedControlKey` 的模板字串開頭誤改為換行；這不是移除函式造成的缺少定義。已恢復原本的控制項名稱鍵值字串並更新主腳本快取鍵。`script.js`、`assets/js/site-pilot.js`、`game-info/script.js` 的 `node --check` 均通過；未執行瀏覽器或功能測試。後續換行處理使用 `\r?\n` 正規表示式，避免把 JavaScript 反引號字串當成 PowerShell 跳脫序列。
## 有限原始碼檢查（2026-10-06）

- 核對同批修改差異及已移除項目的引用，未發現其他非預期程式碼變動；先前報錯的 switchTab、decorateHyperStatControls、liberationGetBossReward 定義均保留。
- 四個入口的 67 個 CSS／JS 本機資源引用均存在；21 份載入的 JavaScript 與 14 段內嵌腳本通過語法解析。正式路徑檢查通過，沒有入口指向 BETA。
- 修正寵物設定標題的共通 margin 覆蓋，以及創世三個分頁 BOSS 難度選單漏接置中。修改後重新確認 site-pilot 語法、四入口路徑及快取鍵。
- 五份本輪 CSS 的括號、字串與註解邊界檢查未報錯；12 份改動檔未發現混合換行或 Unicode 替代字元。LAN 啟動 PS1 語法解析通過。
- 本次為原始碼與資源檢查，沒有執行頁面腳本、啟動服務、瀏覽器操作、視覺驗證或圖片匯出；不代表所有實際操作均已驗證。
