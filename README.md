# GMSM-calculator

楓之谷M（Global MapleStory M / GMSM）玩家工具箱。  
A free, community-maintained toolbox for Global MapleStory M players.

**線上使用 / Live site:**  
https://remus1224.github.io/GMSM-calculator/

> 本專案為非官方社群工具，與 NEXON、MapleStory 或 MapleStory M 官方無隸屬、合作或背書關係。

## 專案內容

GMSM-calculator 收錄多種楓之谷M相關模擬器、計算機與 HEXA 工具，目標是把遊戲內較難直接估算、反覆試算或比較的內容整理成可直接在瀏覽器使用的工具。

目前主站包含 **18 個工具與「也許有用的資訊」入口**：

### 模擬器（6）

- 超越模擬器
- 製作模擬器
- 紋章模擬器
- 飾品強化模擬器
- 星力強化模擬器
- 光之聖所祈禱模擬器

### 計算機（5）

- 無視防禦計算機
- 極限屬性計算機
- 符文計算機
- 創世解放計算機
- 寵物食品計算機

### 六轉與 HEXA（5）

- 六轉進度計算機
- HEXA 屬性模擬器
- HEXA 懶人重製表
- HEXA 重置決策模擬
- HEXA 目標機率模擬

### 練習與其他（2）

- 威爾二階練習機
- 1204 產生器

### 資訊

[也許有用的資訊](game-info/) 收錄十一項資訊：創世解放、海洛斯的封印、六轉核心、星座核心、光之聖所 祈禱、極限屬性、神秘/真實符文、寵物食品、星力強化、輔助武器鍊成與輪迴星火。首頁分為「成長與強化」和「機率與期望值」。

資訊館與 GA4 正式里程碑：[2026/10/09 版本紀錄](docs/releases/2026.10.09.md)（[2026/10/06 初始整併紀錄](docs/releases/2026.10.06.md)）。

維護文件：[資料與計算規則](docs/DATA-NOTES.md)、[共通樣式與維護](docs/MAINTENANCE.md)、[上傳內容分類](docs/REPOSITORY-CONTENTS.md)。

網站亦提供日間／夜間模式，以及瀏覽器端的計算資料備份與還原功能。

## 專案狀態

本專案持續依照 Global MapleStory M 的內容更新、玩家需求與實際測試結果維護。

遊戲版本更新後，公式、機率、素材需求或其他數值可能發生變動；如發現結果與遊戲內實際內容不同，歡迎透過 GitHub Issues 回報，並盡量附上版本、操作步驟與可供核對的資料。

## 里程碑 / Milestones

- [`2026.10.09`](docs/releases/2026.10.09.md) — 18 個工具、11 項資訊與全站 GA4 追蹤
- [`2026.10`](docs/releases/2026.10.md) — 全站 Unified Glass UI 與共通視覺基線
- [`2026.09.1`](docs/releases/2026.09.1.md) — 1204 產生器與光之聖所祈禱模擬器
- [`2026.09`](docs/releases/2026.09.md) — 第一份 OSS Stable Baseline

## 使用方式

不需要安裝程式，直接開啟線上網站即可：

https://remus1224.github.io/GMSM-calculator/

此專案目前以 HTML、CSS 與 JavaScript 為主，主要功能直接在瀏覽器端執行。

## 回報問題

如果你發現：

- 計算結果與遊戲內不一致
- 遊戲改版後資料過期
- 操作流程或顯示異常
- 特定裝置／瀏覽器出現問題

可以透過 GitHub Issues 回報。若是數值或公式問題，提供遊戲版本、截圖、輸入值與預期結果會更容易重現與確認。

## 開發與維護方式

這是一個由個人持續維護的社群專案。

網站採單一程式與素材來源，測試中的變更使用 Git 分支及本機預覽，不再維護重複的 Beta 目錄。

專案需求、遊戲邏輯、公式、資料整理、驗證案例、介面方向與發布決策由維護者負責；實作過程會使用 ChatGPT、Codex、Gemini 等 AI 開發工具協助撰寫、重構、檢查與測試程式碼。

AI 產生的內容不會被視為遊戲資料的權威來源。涉及公式、數值與遊戲機制的修改，仍需要依可取得的遊戲資料與實際測試進行確認。

## 授權

除第三方素材與另有標示的內容外，本專案中由本專案提供、且維護者有權授權的原始程式碼以 **MIT License** 授權。

MapleStory、MapleStory M、相關名稱、商標、圖像、圖示及其他遊戲衍生素材不包含在 MIT License 的授權範圍內。詳細說明請參閱 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

完整 MIT License 請參閱 [`LICENSE`](LICENSE)。

## Disclaimer

This is an unofficial, non-commercial community project. It is not affiliated with, endorsed by, or sponsored by NEXON or the MapleStory / MapleStory M development and publishing teams.

Game names, trademarks, artwork, icons, images, and other third-party materials remain the property of their respective rights holders.
