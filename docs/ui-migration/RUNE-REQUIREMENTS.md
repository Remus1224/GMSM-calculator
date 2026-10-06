# 符文需求表

資料來源：主網站 `script.js` 的 `runeUpgradeRequirements`、`arcaneRuneCosts`、`authenticRuneRequirements`、`esetraAuthenticRuneCosts` 與相同資料複製的 `cerniumAuthenticRuneCosts`。只列已提供升級需求的祕法與真實符文；鎖定符文不列。資料版本標示為 2026/07。

本輪新增 Game Info catalog 項目、需求 JSON、祕法／真實分頁與 URL `type` 切換、共通匯出列選擇器及符合手機完整顯示的三欄表格。匯出標題跟隨目前選取分頁。未執行測試或瀏覽器驗證。
本輪補正：符文種類切換器限制為兩欄，未選取的符文表格透過 `[hidden]` 完全隱藏。主對話已核對29列資料與語法，未做瀏覽器驗證。
本輪續加：各種類以既有地區圖示列出符文素材，表尾新增單顆符文 Lv.1 至最高等的符文數量與楓幣合計，不乘素材種類數。合計列保留共通數值樣式，字重700。
本輪新增首頁入口透明素材底板 opt-in 共通樣式，符文需求表透過 catalog 的 `iconStyle` 套用；素材圖檔未修改。
透明入口 hover 現在沿用相同固定漸層底板，避免共通 hover 填色覆蓋。
透明 modifier 移除局部邊框與內距，讓底色滿版，同時保留共通圖示尺寸與圓角。
