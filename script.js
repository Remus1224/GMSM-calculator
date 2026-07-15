// ==========================================
// 🌙 主題切換系統 (Dark/Light Mode)
// ==========================================
function toggleTheme() {
    // 取得 HTML 標籤
    const htmlElement = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');

    // 檢查目前是不是暗色模式
    const isDark = htmlElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
        // 切換回淺色模式
        htmlElement.removeAttribute('data-theme');
        if (themeBtn) themeBtn.innerText = '🌙';
    } else {
        // 切換到暗色模式
        htmlElement.setAttribute('data-theme', 'dark');
        if (themeBtn) themeBtn.innerText = '☀️';
    }
}

// 網頁載入時，檢查使用者之前選了什麼模式
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('msm-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.innerText = '☀️';
    }
    // ... 這裡保留你原本 DOMContentLoaded 裡的程式碼 (例如 initIgnoreGrid) ...
    if (typeof initIgnoreGrid === 'function') initIgnoreGrid();
});

/* ========================================== */
/* 1. 全域系統與頁籤路由 (已加入 GA4 追蹤)     */
/* ========================================== */
function clearReset() {
    document.getElementById('reset-a').value = '';
    document.getElementById('reset-b').value = '';
    document.getElementById('reset-c').value = '';
    document.getElementById('reset-rolls').value = '10';
    document.getElementById('reset-target-a').value = '';
    document.getElementById('reset-target-sub').value = '';
    
    if (document.getElementById('sim-million-reset')) {
        document.getElementById('sim-million-reset').checked = false;
    }

    // 隱藏新的兩張結果面板
    let mp = document.getElementById('res-main-panel');
    let dp = document.getElementById('res-detail-panel');
    if (mp) mp.style.display = 'none';
    if (dp) dp.style.display = 'none';
}

function clearSim() {
    document.getElementById('sim-a').value = '';
    document.getElementById('sim-b').value = '';
    document.getElementById('sim-c').value = '';
    document.getElementById('sim-rolls').value = '';
    document.getElementById('target-a').value = '';
    document.getElementById('target-sub').value = '';
    document.getElementById('sim-stoploss').checked = true;
    
    if (document.getElementById('sim-million')) {
        document.getElementById('sim-million').checked = false;
    }

    let resBox = document.getElementById('result-hexa-sim');
    if (resBox) resBox.style.display = 'none';
}

let lazyTableGenerated = false;
let visualInitialized = false;
let progInitialized = false;
let ignoreInitialized = false;
let willInitialized = false; // 新增這行
let willGameActive = false;  // 新增這行

function switchTab(tabId) {
    // 跨分頁靜音與解除鎖定防護
    if (tabId !== 'will') {
        if (typeof willBgm !== 'undefined') willBgm.pause();
        isBgmPlaying = false;
        const bgmBtn = document.getElementById('btn-will-bgm');
        if (bgmBtn) bgmBtn.classList.add('muted-bgm');

        const wrapper = document.getElementById('will-game-wrapper');
        if (wrapper && wrapper.classList.contains('fake-fullscreen')) {
            wrapper.classList.remove('fake-fullscreen');
            document.body.classList.remove('body-no-scroll');
        }
    }

    // 1. 隱藏所有選單按鈕與分頁內容 (單純移除 active，不強制覆蓋 display 屬性，保護你的 CSS 排版)
    document.querySelectorAll('.tab-menu button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // 2. 顯示目標按鈕與分頁內容
    const targetBtn = document.getElementById('btn-' + tabId);
    if (targetBtn) targetBtn.classList.add('active');

    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) targetTab.classList.add('active');

    // ... (保留你原本所有的分頁初始化與更新邏輯) ...
    if (tabId === 'hexa-lazy' && !lazyTableGenerated) {
        setTimeout(generateLazyTable, 50);
        lazyTableGenerated = true;
    }
    if (tabId === 'hexa-visual' && !visualInitialized) {
        initVisualBars();
        visualInitialized = true;
    }
    if (tabId === 'transcend') {
        tr_updateUI();
    }
    if (tabId === 'craft') {
        cr_updateUI();
    }

    if (tabId === 'acc-enhance') { acc_updateUI(); }

    if (tabId === 'hexa-prog' && !progInitialized) {
        initHexaProg();
        progInitialized = true;
    }
    if (tabId === 'ignore' && !ignoreInitialized) {
        initIgnoreGrid();
        ignoreInitialized = true;
    }

    willGameActive = (tabId === 'will');
    if (tabId === 'will') {
        if (!willInitialized) {
            will_init();
            willInitialized = true;
        } else {
            requestAnimationFrame(will_gameLoop);
        }
    }

    // ==========================================
    // 🌟 頂部導航列動態控制 (保護 Grid 完美排版)
    // ==========================================
    const subPageTitle = document.getElementById('sub-page-title');
    const backBtn = document.getElementById('btn-home');

    if (subPageTitle && backBtn) {
        // 定義每個分頁的專屬副標題
        const titleMap = {
            'home': '主選單',
            'notice': '布告欄',
            'ignore': '無視防禦計算機',
            'transcend': '超越模擬器',
            'craft': '製作模擬器',
            'hexa-prog': '六轉進度計算機',
            'hexa-visual': 'HEXA屬性模擬器',
            'hexa-lazy': 'HEXA懶人決策表',
            'hexa-reset': 'HEXA重置決策模擬',
            'hexa-sim': 'HEXA目標機率模擬',
            'will': '威爾二階練習機',
            'acc-enhance': '飾品強化模擬器',
            'emb-enhance': '紋章模擬器',
            'star': '星力強化模擬器',
        };

        if (titleMap[tabId]) {
            subPageTitle.innerText = titleMap[tabId];
        }

        // 判斷是否在首頁
        if (tabId === 'home') {
            // 首頁：將返回鍵「隱形」但保留佔據的空間，這樣中間的大廳選單才不會歪掉
            backBtn.style.visibility = 'hidden';

            // 強制移除 home-hide，確保按鈕與標題的本體還在畫面上
            backBtn.classList.remove('home-hide');
            subPageTitle.classList.remove('home-hide');
        } else {
            // 其他頁面：顯示返回鍵
            backBtn.style.visibility = 'visible';
            backBtn.classList.remove('home-hide');
            subPageTitle.classList.remove('home-hide');
        }
    }
}

// 確保網頁一開啟時，預設執行一次首頁狀態，避免任何跑版
document.addEventListener("DOMContentLoaded", () => {
    switchTab('home');
});

// 全新 iOS 友善的全螢幕按鈕邏輯 (鐵桶鎖死版)
window.toggleWillFullscreen = function() {
    const wrapper = document.getElementById('will-game-wrapper');
    const isNativeFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    const isFakeFullscreen = wrapper.classList.contains('fake-fullscreen');

    // 狀態 1：退出全螢幕
    if (isNativeFullscreen || isFakeFullscreen) {
        if (isNativeFullscreen) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
        if (isFakeFullscreen) {
            wrapper.classList.remove('fake-fullscreen');
            document.body.classList.remove('body-no-scroll');
        }
        return;
    }

    // 狀態 2：進入全螢幕
    const isAppleDevice = /Mac|iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (!isAppleDevice && (wrapper.requestFullscreen || wrapper.webkitRequestFullscreen)) {
        // 安卓與電腦：完美原生全螢幕
        if (wrapper.requestFullscreen) wrapper.requestFullscreen();
        else wrapper.webkitRequestFullscreen();
    } else {
        // iOS 方案：強制套用 fake-fullscreen 與背景鎖死
        wrapper.classList.add('fake-fullscreen');
        document.body.classList.add('body-no-scroll');
        window.scrollTo(0, 0);
    }
};

// ⚔️ 系統共通裝備資料庫 (供紋章與超越模擬器使用)
const shared_equip_items = [
    { 
        name: "神秘冥界幽靈天之星光權杖", 
        img: "assets/equipment/神秘冥界幽靈天之星光權杖.webp", 
        hasStar: true, starText: "M", 
        hasLv: true, lvText: "Lv.70",
        hasEmblem: true // 🌟 新增：控制菱形紋章顯示
    }/*,
    { 
        name: "神秘冥界幽靈克拉", 
        img: "assets/equipment/神秘冥界幽靈克拉.webp", 
        hasStar: false, starText: "M", 
        hasLv: true, lvText: "Lv.70",
        hasEmblem: true // 🌟 新增：控制菱形紋章顯示
    }*/
];

let emb_equip_idx = 0; // 紋章預設裝備 (星光權杖)
let tr_equip_idx = 0;  // 超越預設裝備 (星光權杖)

// 網頁載入時，自動填入裝備選單
document.addEventListener('DOMContentLoaded', () => {
    let embSelect = document.getElementById('emb-equip-select');
    let trSelect = document.getElementById('tr-equip-select');
    
    let optionsHtml = '';
    shared_equip_items.forEach((item, index) => {
        optionsHtml += `<option value="${index}">${item.name}</option>`;
    });

    if (embSelect) {
        embSelect.innerHTML = optionsHtml;
        embSelect.value = emb_equip_idx;
        emb_changeEquip(); // 初始化紋章圖片
    }
    if (trSelect) {
        trSelect.innerHTML = optionsHtml;
        trSelect.value = tr_equip_idx;
        tr_changeEquip(); // 初始化超越圖片
    }
});

// 🌟 紋章裝備切換邏輯
function emb_changeEquip() {
    let select = document.getElementById('emb-equip-select');
    if (!select) return;
    
    emb_equip_idx = parseInt(select.value) || 0;
    let item = shared_equip_items[emb_equip_idx];
    
    // 更新主畫面
    let uiImg = document.getElementById('emb-ui-img-equip');
    let uiName = document.getElementById('emb-ui-equip-name');
    if (uiImg) { 
        uiImg.src = item.img; 
        uiImg.style.display = ''; // 👈 補上這行：強制解除 onerror 造成的 display: none
    }
    if (uiName) uiName.innerText = item.name;

    // 動態控制主畫面遮罩
    let uiStar = document.getElementById('emb-ui-star-badge');
    let uiLv = document.getElementById('emb-ui-lv-badge');
    if (uiStar) { uiStar.style.display = item.hasStar ? 'flex' : 'none'; uiStar.innerHTML = `<span>${item.starText}</span>`; }
    if (uiLv) { uiLv.style.display = item.hasLv ? 'block' : 'none'; uiLv.innerHTML = `<span>${item.lvText}</span>`; }

    // 更新彈出視窗
    let mImg = document.getElementById('emb-m-img');
    let mName = document.getElementById('emb-m-equip-name');
    if (mImg) { 
        mImg.src = item.img; 
        mImg.style.display = '';
    }
    if (mName) mName.innerText = item.name;

    // 動態控制彈出視窗遮罩
    let mStar = document.getElementById('emb-m-star-badge');
    let mLv = document.getElementById('emb-m-lv-badge');
    if (mStar) { mStar.style.display = item.hasStar ? 'flex' : 'none'; mStar.innerHTML = `<span>${item.starText}</span>`; }
    if (mLv) { mLv.style.display = item.hasLv ? 'block' : 'none'; mLv.innerHTML = `<span>${item.lvText}</span>`; }
}

// 🌟 超越裝備切換邏輯
function tr_changeEquip() {
    let select = document.getElementById('tr-equip-select');
    if (!select) return;

    tr_equip_idx = parseInt(select.value) || 0;
    let item = shared_equip_items[tr_equip_idx];
    
    // 更新主畫面
    let uiImg = document.getElementById('tr-ui-img-equip');
    let uiName = document.getElementById('tr-ui-equip-name');
    if (uiImg) uiImg.src = item.img;
    if (uiName) uiName.innerText = item.name;

    // 動態控制主畫面遮罩
    let uiStar = document.getElementById('tr-ui-star-badge');
    let uiLv = document.getElementById('tr-ui-lv-badge');
    if (uiStar) { uiStar.style.display = item.hasStar ? 'flex' : 'none'; uiStar.innerHTML = `<span>${item.starText}</span>`; }
    if (uiLv) { uiLv.style.display = item.hasLv ? 'block' : 'none'; uiLv.innerHTML = `<span>${item.lvText}</span>`; } // 初始文字，可能會被超越的 JS 覆寫

    // 更新彈出視窗
    let mImg = document.getElementById('tr-m-img');
    let mName = document.getElementById('tr-m-equip-name');
    if (mImg) mImg.src = item.img;
    if (mName) mName.innerText = item.name;

    // 動態控制彈出視窗遮罩
    let mStar = document.getElementById('tr-m-star-badge');
    let mLv = document.getElementById('tr-m-lv-badge');
    if (mStar) { mStar.style.display = item.hasStar ? 'flex' : 'none'; mStar.innerHTML = `<span>${item.starText}</span>`; }
    if (mLv) { mLv.style.display = item.hasLv ? 'block' : 'none'; mLv.innerHTML = `<span>${item.lvText}</span>`; }
}

/* ========================================== */
/* 2. 六轉進度計算機引擎                       */
/* ========================================== */
const reqData = {
    skill: {
        big: [0, 0, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15],
        small: [0, 0, 40, 50, 60, 70, 80, 90, 100, 110, 125, 140, 155, 170, 185, 200, 215, 230, 245, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 500]
    },
    mastery: {
        big: [0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10],
        small: [0, 10, 20, 25, 30, 35, 40, 45, 50, 55, 62, 69, 76, 83, 90, 97, 104, 111, 118, 125, 135, 145, 155, 165, 175, 185, 195, 205, 215, 225, 240]
    },
    enhance: {
        big: [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 15],
        small: [0, 20, 30, 35, 40, 45, 50, 55, 60, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 335]
    },
    common: {
        big: [0, 10, 4, 4, 5, 5, 6, 6, 7, 7, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 17, 17, 17, 18, 18, 18, 19, 19, 19, 19, 20],
        small: [0, 200, 55, 69, 83, 97, 110, 124, 138, 152, 173, 193, 214, 235, 255, 276, 297, 317, 338, 359, 386, 414, 442, 469, 497, 525, 552, 580, 607, 635, 670]
    }
};

const coreConfig = [
    { id: 'sk1', label: '啟源技能', type: 'skill', mandatory: true, default: true, border: '#6A3CBB', bg: 'rgba(106, 60, 187, 0.08)' },
    { id: 'sk2', label: '技能核心 2', type: 'skill', mandatory: false, default: false, border: '#6A3CBB', bg: 'rgba(106, 60, 187, 0.08)' },
    { id: 'ma1', label: '精通核心 1', type: 'mastery', mandatory: false, default: true, border: '#9D3EA8', bg: 'rgba(157, 62, 168, 0.08)' },
    { id: 'ma2', label: '精通核心 2', type: 'mastery', mandatory: false, default: false, border: '#9D3EA8', bg: 'rgba(157, 62, 168, 0.08)' },
    { id: 'ma3', label: '精通核心 3', type: 'mastery', mandatory: false, default: false, border: '#9D3EA8', bg: 'rgba(157, 62, 168, 0.08)' },
    { id: 'ma4', label: '精通核心 4', type: 'mastery', mandatory: false, default: false, border: '#9D3EA8', bg: 'rgba(157, 62, 168, 0.08)' },
    { id: 'en1', label: '強化核心 1', type: 'enhance', mandatory: false, default: true, border: '#73D6FF', bg: 'rgba(115, 214, 255, 0.15)' },
    { id: 'en2', label: '強化核心 2', type: 'enhance', mandatory: false, default: true, border: '#73D6FF', bg: 'rgba(115, 214, 255, 0.15)' },
    { id: 'en3', label: '強化核心 3', type: 'enhance', mandatory: false, default: true, border: '#73D6FF', bg: 'rgba(115, 214, 255, 0.15)' },
    { id: 'en4', label: '強化核心 4', type: 'enhance', mandatory: false, default: true, border: '#73D6FF', bg: 'rgba(115, 214, 255, 0.15)' },
    { id: 'co1', label: '共通核心 1', type: 'common', mandatory: false, default: false, border: '#4D518C', bg: 'rgba(77, 81, 140, 0.08)' },
    { id: 'co2', label: '共通核心 2', type: 'common', mandatory: false, default: false, border: '#4D518C', bg: 'rgba(77, 81, 140, 0.08)' },
    { id: 'co3', label: '共通核心 3', type: 'common', mandatory: false, default: false, border: '#4D518C', bg: 'rgba(77, 81, 140, 0.08)' },
    { id: 'co4', label: '共通核心 4', type: 'common', mandatory: false, default: false, border: '#4D518C', bg: 'rgba(77, 81, 140, 0.08)' }
];

function getCumul(arr, lv) {
    let sum = 0;
    for (let i = 1; i <= lv; i++) sum += arr[i] || 0;
    return sum;
}

function initHexaProg() {
    const container = document.getElementById('prog-cores-container');
    if (!container) return;
    
    let html = '';
    let selectOptions = '';
    for (let i = 0; i <= 30; i++) selectOptions += `<option value="${i}">Lv. ${i}</option>`;

    const categories = [{ type: 'skill' }, { type: 'mastery' }, { type: 'enhance' }, { type: 'common' }];
    categories.forEach(cat => {
        let cores = coreConfig.filter(c => c.type === cat.type);
        html += `<div class="core-row">`;
        cores.forEach(core => {
            let isChecked = core.default ? 'checked' : '';
            let cbHtml = core.mandatory ?
                `<span style="font-weight:bold; color:#333333; font-size: 14px;">${core.label}</span>` :
                `<label style="cursor:pointer; display:flex; align-items:center; color:#333333; font-weight:bold; font-size: 14px; gap: 6px;"><input type="checkbox" id="cb-${core.id}" onchange="toggleCoreProg('${core.id}')" ${isChecked} style="width:16px;height:16px;margin:0;"> ${core.label}</label>`;

            html += `
                <div class="prog-item" id="item-${core.id}" style="background-color: ${core.bg}; border-left: 5px solid ${core.border}; ${(!core.mandatory && !core.default) ? 'opacity: 0.5;' : ''}">
                    <div style="display:flex; justify-content:center; align-items:center; margin-bottom: 8px; height: 24px;">
                        ${cbHtml}
                    </div>
                    <select id="sel-${core.id}" ${(!core.mandatory && !core.default) ? 'disabled' : ''}>${selectOptions}</select>
                </div>
            `;
        });
        html += `</div>`;
    });
    container.innerHTML = html;
}

function toggleCoreProg(id) {
    let cb = document.getElementById('cb-' + id);
    let sel = document.getElementById('sel-' + id);
    let item = document.getElementById('item-' + id);
    if (!cb || !sel || !item) return;

    let isChecked = cb.checked;
    sel.disabled = !isChecked;
    item.style.opacity = isChecked ? '1' : '0.5';
    if (!isChecked) sel.value = '0';
}

function calcHexaProg() {
    let totalBigNeeded = 0;
    let totalSmallNeeded = 0;
    let investedBig = 0;
    let investedSmall = 0;

    coreConfig.forEach(core => {
        let isActive = false;
        if (core.mandatory) {
            isActive = true;
        } else {
            let cb = document.getElementById('cb-' + core.id);
            isActive = cb ? cb.checked : false;
        }

        if (isActive) {
            let sel = document.getElementById('sel-' + core.id);
            let lv = sel ? parseInt(sel.value) : 0;
            if (isNaN(lv)) lv = 0;

            let bigArr = reqData[core.type].big;
            let smallArr = reqData[core.type].small;

            totalBigNeeded += getCumul(bigArr, 30);
            totalSmallNeeded += getCumul(smallArr, 30);
            investedBig += getCumul(bigArr, lv);
            investedSmall += getCumul(smallArr, lv);
        }
    });

    let invBig = parseInt(document.getElementById('inv-big').value) || 0;
    let invFrag = parseInt(document.getElementById('inv-frag').value) || 0;
    let invConc = parseInt(document.getElementById('inv-conc').value) || 0;
    let invNrg = parseInt(document.getElementById('inv-nrg').value) || 0;
    let invWeak = parseInt(document.getElementById('inv-weak').value) || 0;

    let currentBagEnergy = (invBig * 1000) + (invConc * 500) + (invNrg * 200) + (invWeak * 10);
    let remainingFrag = Math.max(0, totalSmallNeeded - investedSmall);
    let remainingEnergy = Math.max(0, (totalBigNeeded - investedBig) * 1000);

    let shortfallFrag = Math.max(0, remainingFrag - invFrag);
    let shortfallEnergy = Math.max(0, remainingEnergy - currentBagEnergy);

    let hrsPerDay = parseFloat(document.getElementById('farm-hours').value) || 0;
    let farmFragHr = parseFloat(document.getElementById('farm-frag-hr').value) || 0;
    let farmNrgHr = parseFloat(document.getElementById('farm-nrg-hr').value) || 0;
    let farmWeakHr = parseFloat(document.getElementById('farm-weak-hr').value) || 0;

    let farmFragWk = parseFloat(document.getElementById('farm-frag-wk').value) || 0;
    let farmConcWk = parseFloat(document.getElementById('farm-conc-wk').value) || 0;
    let farmNrgWk = parseFloat(document.getElementById('farm-nrg-wk').value) || 0;
    let farmWeakWk = parseFloat(document.getElementById('farm-weak-wk').value) || 0;

    let dailyFrag = (farmFragHr * hrsPerDay) + (farmFragWk / 7);
    let daysFrag = dailyFrag > 0 ? shortfallFrag / dailyFrag : (shortfallFrag > 0 ? Infinity : 0);
    let grindHoursFrag = daysFrag * hrsPerDay;

    let dailyEnergy = ((farmNrgHr * 200) + (farmWeakHr * 10)) * hrsPerDay + ((farmConcWk * 500) + (farmNrgWk * 200) + (farmWeakWk * 10)) / 7;
    let daysEnergy = dailyEnergy > 0 ? shortfallEnergy / dailyEnergy : (shortfallEnergy > 0 ? Infinity : 0);
    let grindHoursEnergy = daysEnergy * hrsPerDay;

    document.getElementById('result-hexa-prog').style.display = 'block';

    let fragPct = totalSmallNeeded > 0 ? ((investedSmall + Math.min(invFrag, remainingFrag)) / totalSmallNeeded) * 100 : 100;
    let energyTotalNeeded = totalBigNeeded * 1000;
    let energyInvested = investedBig * 1000;
    let solPct = energyTotalNeeded > 0 ? ((energyInvested + Math.min(currentBagEnergy, remainingEnergy)) / energyTotalNeeded) * 100 : 100;

    document.getElementById('prog-bar-frag').style.width = fragPct.toFixed(1) + '%';
    document.getElementById('prog-bar-frag').innerText = fragPct.toFixed(1) + '%';
    document.getElementById('prog-txt-frag').innerText = `${(investedSmall).toLocaleString()} / ${totalSmallNeeded.toLocaleString()} (短缺: ${shortfallFrag.toLocaleString()})`;

    document.getElementById('prog-bar-sol').style.width = solPct.toFixed(1) + '%';
    document.getElementById('prog-bar-sol').innerText = solPct.toFixed(1) + '%';
    document.getElementById('prog-txt-sol').innerText = `${investedBig.toLocaleString()} / ${totalBigNeeded.toLocaleString()} (氣息短缺: ${shortfallEnergy.toLocaleString()})`;

    let timeBox = document.getElementById('prog-time-result');

    function formatTime(days, hours) {
        if (days === Infinity) return "無限期 (請填寫獲取速度)";
        if (days <= 0) return "✅ 庫存已可畢業";

        let gradDate = new Date();
        gradDate.setDate(gradDate.getDate() + Math.ceil(days));
        let m = gradDate.getMonth() + 1;
        let d = gradDate.getDate();
        let dateString = `${gradDate.getFullYear()}/${m.toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}`;

        return `約 ${Math.ceil(days)} 天 (共需掛機 ${Math.ceil(hours).toLocaleString()} 小時) - 預計 ${dateString}`;
    }

    if (totalBigNeeded === 0 && totalSmallNeeded === 0) {
        timeBox.innerHTML = `⚠️ 請先在上方勾選要養成的核心。`;
    } else {
        timeBox.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #444;">預估畢業時間</div>
            <div style="display:flex; flex-direction:column; gap:8px; font-size: 15px;">
                <div><strong style="display:inline-flex; align-items:center;"><img src="assets/靈魂艾爾達斯.png" style="width:16px; margin-right:4px;" onerror="this.style.display='none'"> 靈魂艾爾達斯：</strong> <span style="color:#8e44ad;">${formatTime(daysEnergy, grindHoursEnergy)}</span></div>
                <div><strong style="display:inline-flex; align-items:center;"><img src="assets/icon-Sol Erda Fragment.png" style="width:16px; margin-right:4px;" onerror="this.style.display='none'"> 靈魂艾爾達斯碎片：</strong> <span style="color:#2980b9;">${formatTime(daysFrag, grindHoursFrag)}</span></div>
            </div>
        `;
    }
}

/* ========================================== */
/* 3. 無視防禦計算機                           */
/* ========================================== */
const equipCategories = [
    { title: "防具類", type: "armor", items: ["帽子", "手套", "套服", "護肩", "鞋子", "腰帶", "披風"] },
    { title: "武器類", type: "weapon", items: ["副武", "三武"] },
    { title: "飾品類", type: "acc", items: ["支配者墜飾", "苦痛的根源", "巨大的恐怖", "被詛咒的魔島書"] },
    { title: "能力類", type: "ability", items: ["HEXA屬性"] },
    // 👇 1. 將這裡加上數字，確保 ID 唯一
    { title: "特殊", type: "special", items: ["活動", "預留1", "預留2", "預留3"] }
];

const equipments = equipCategories.flatMap(cat => cat.items);

function initIgnoreGrid() {
    const grid = document.getElementById('equip-grid');
    if (!grid) return;
    grid.innerHTML = '';

    equipCategories.forEach(category => {
        category.items.forEach(equip => {
            const card = document.createElement('div');
            card.className = `equip-card bg-${category.type}`;

            // 👇 2. 關鍵：如果名字結尾有數字（如預留1），在畫面上把數字去掉，保持視覺乾淨
            const displayTitle = equip.replace(/\d+$/, '');

            card.innerHTML = `
                <div class="card-title">${displayTitle}</div>
                <div class="card-input-wrapper">
                    <input type="text" inputmode="decimal" id="input-${equip}" oninput="calculateIgnore()" placeholder="">
                    <span class="card-percent">%</span>
                </div>
            `;
            grid.appendChild(card);
        });
    });
}

function calculateIgnore() {
    let values = [];

    equipments.forEach(equip => {
        let inputElem = document.getElementById('input-' + equip);
        if (inputElem) {
            let cleanVal = inputElem.value.replace(/[^\d.]/g, '');
            if (cleanVal !== "" && !isNaN(cleanVal)) {
                values.push(parseFloat(cleanVal));
            }
        }
    });

    const absolabElem = document.querySelector('input[name="absolab"]:checked');
    const arcaneElem = document.querySelector('input[name="arcane"]:checked');
    const absolabVal = absolabElem ? parseFloat(absolabElem.value) : 0;
    const arcaneVal = arcaneElem ? parseFloat(arcaneElem.value) : 0;

    const setEffectSum = absolabVal + arcaneVal;
    if (setEffectSum > 0) values.push(setEffectSum);

    let multiplier = 1.0;
    values.forEach(v => {
        multiplier *= (1.0 - (v / 100.0));
    });
    let totalIgnore = (1.0 - multiplier) * 100.0;

    let resultElem = document.getElementById('result-ignore');
    if (resultElem) {
        resultElem.innerText = `總無視防禦：${totalIgnore.toFixed(2)}%`;
    }
}

function clearIgnore() {
    equipments.forEach(equip => {
        let inputElem = document.getElementById('input-' + equip);
        if (inputElem) inputElem.value = '';
    });

    let absolabRadios = document.getElementsByName('absolab');
    absolabRadios.forEach(radio => {
        if (radio.value === "0") radio.checked = true;
    });

    let arcaneRadios = document.getElementsByName('arcane');
    arcaneRadios.forEach(radio => {
        if (radio.value === "0") radio.checked = true;
    });

    calculateIgnore();
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initIgnoreGrid === 'function') {
        initIgnoreGrid();
    }
});

/* ========================================== */
/* 4. 超越強化模擬器                           */
/* ========================================== */
let tr_lv = 30;
let tr_fails = 0;
let tr_bonus = 0.0;
let tr_stat_normal = 0;
let tr_stat_radiant = 0;
let tr_stat_chaos = 0;
let tr_stat_scrolls = 0;
let tr_ev_stones_achieved = 0;
let tr_ev_scrolls_achieved = 0;
let tr_current_level_stones = 0;
let tr_current_fail_scrolls = 0;
let tr_isAnimating = false;
let tr_isMuted = false;

const tr_sfxSuccess = new Audio('assets/AugmentSuccess.wav');
const tr_sfxFail = new Audio('assets/AugmentFail.wav');

function tr_getStoneEV(baseRate) {
    let expected = 0;
    let cumulativeFailProb = 1.0;
    let currentBonus = 0;
    let bonusStep = Math.max(5, Math.floor(baseRate * 0.2));

    for (let attempts = 1; attempts <= 40; attempts++) {
        let rate = Math.min(100, baseRate + currentBonus) / 100.0;
        let probSuccess = cumulativeFailProb * rate;
        expected += attempts * probSuccess;
        cumulativeFailProb *= (1 - rate);
        currentBonus = Math.min(50, currentBonus + bonusStep);
        if (cumulativeFailProb < 0.0001) break;
    }
    return expected;
}

function tr_toggleSound() {
    tr_isMuted = !tr_isMuted;
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (tr_isMuted) {
        soundBtn.innerText = "🔇 音效：關閉";
        soundBtn.classList.add('muted');
    } else {
        soundBtn.innerText = "🔊 音效：開啟";
        soundBtn.classList.remove('muted');
    }
    if (typeof gtag === 'function') {
        gtag('event', 'toggle_sound', {
            'simulator': 'transcend',
            'sound_status': tr_isMuted ? 'off' : 'on'
        });
    }
}

function tr_playSound(isSuccess) {
    if (tr_isMuted) return;
    if (isSuccess) {
        try { tr_sfxSuccess.currentTime = 0; tr_sfxSuccess.play(); } catch (e) { }
    } else {
        try { tr_sfxFail.currentTime = 0; tr_sfxFail.play(); } catch (e) { }
    }
}

function tr_validateCustomRate(inputElem) {
    document.querySelector(`input[name="${inputElem.dataset.group}"][value="custom"]`).checked = true;
    if (inputElem.value !== "") {
        let val = parseInt(inputElem.value);
        if (val > 100) inputElem.value = 100;
    }
    tr_updateUI();
}

function tr_onBlurCustomRate(inputElem) {
    let val = parseInt(inputElem.value);
    if (isNaN(val) || val < 1 || inputElem.value === "") {
        inputElem.value = 1;
    }
    tr_updateUI();
}

function tr_getSelectedRate(groupName, customInputId) {
    let radios = document.getElementsByName(groupName);
    let val = Array.from(radios).find(r => r.checked).value;
    if (val === 'custom') {
        let customVal = parseInt(document.getElementById(customInputId).value);
        return (isNaN(customVal) || customVal < 1) ? 1 : customVal;
    }
    return parseFloat(val);
}

function tr_forceStateChange() {
    if (tr_isAnimating) return;
    let newLv = parseInt(document.getElementById('input-equip-lv').value);
    if (newLv !== tr_lv) tr_bonus = 0.0;
    tr_lv = newLv;
    tr_fails = parseInt(document.getElementById('input-fail-count').value);
    tr_current_level_stones = 0;
    tr_updateUI();
}

function tr_switchMode(mode) {
    if (tr_isAnimating) return;
    let enhanceRadio = document.querySelector('input[name="sim-mode"][value="enhance"]');
    let scrollRadio = document.querySelector('input[name="sim-mode"][value="scroll"]');
    if (mode === 'enhance') enhanceRadio.checked = true;
    else if (mode === 'scroll') scrollRadio.checked = true;
    tr_updateUI();
}

function tr_updateUI() {
    let modeElem = document.querySelector('input[name="sim-mode"]:checked');
    if (!modeElem) return;
    let mode = modeElem.value;
    let container = document.getElementById('game-ui-container');
    if (!container) return;

    document.getElementById('input-equip-lv').value = tr_lv;
    document.getElementById('input-fail-count').value = tr_fails;
    document.getElementById('ui-lv-curr').innerText = tr_lv;
    document.getElementById('ui-lv-next').innerText = (tr_lv >= 70) ? "MAX" : tr_lv + 2;

    // 🌟 修正 1：主畫面等級遮罩
    let uiLvBadge = document.getElementById('tr-ui-lv-badge');
    if (uiLvBadge) {
        uiLvBadge.innerHTML = `<span>Lv.${tr_lv}</span>`;
    }

    let failTextDOM = document.getElementById('ui-fails');
    failTextDOM.innerText = `失敗次數 ${tr_fails} / 7`;
    failTextDOM.style.color = (tr_fails >= 7) ? "#E42123" : "#888";

    let stoneImg = document.getElementById('ui-stone-img');
    let stoneNameDOM = document.getElementById('ui-stone-name');
    let btnMain = document.getElementById('btn-main-action');

    let baseRate = tr_getSelectedRate('stone-rate', 'custom-stone-rate');
    let bonusStep = Math.max(5, Math.floor(baseRate * 0.2));

    if (mode === 'enhance') {
        document.getElementById('menu-enhance').classList.add('active');
        document.getElementById('menu-scroll').classList.remove('active');
        container.classList.remove('scroll-mode-active');
        document.getElementById('ui-coin-box').style.display = 'flex';

        let totalRate = Math.min(100, baseRate + tr_bonus);
        let stoneName = "超越石"; 
        let imgSrc = "assets/超越石.png";

        if (tr_lv >= 40 && tr_lv < 50) { stoneName = "發光超越石"; imgSrc = "assets/發光超越石.png"; }
        if (tr_lv >= 50 && tr_lv <= 70) { stoneName = "混沌超越石"; imgSrc = "assets/混沌超越石.png"; }

        stoneNameDOM.innerText = `${stoneName} ${baseRate}%`;
        stoneImg.src = imgSrc;

        document.getElementById('ui-total-rate').innerText = `${totalRate.toFixed(0)}%`;
        document.getElementById('ui-base-rate').innerText = `${baseRate}%`;
        document.getElementById('ui-bonus-rate').innerText = `${tr_bonus.toFixed(0)}%`;
        document.getElementById('ui-add-rate').innerText = `+${bonusStep}%`;

        btnMain.innerText = "超越";
        btnMain.disabled = (tr_lv >= 70 || tr_fails >= 7 || tr_isAnimating);

    } else {
        document.getElementById('menu-enhance').classList.remove('active');
        document.getElementById('menu-scroll').classList.add('active');
        container.classList.add('scroll-mode-active');
        document.getElementById('ui-coin-box').style.display = 'none';

        let scrollRate = tr_getSelectedRate('scroll-rate', 'custom-scroll-rate');
        let imgSrc = (scrollRate < 70) ? "assets/超越失敗扣除卷軸A.png" : "assets/超越失敗扣除卷軸B.png";

        stoneNameDOM.innerText = `超越失敗扣除卷軸 ${scrollRate}%`;
        stoneImg.src = imgSrc;

        btnMain.innerText = "套用";
        btnMain.disabled = (tr_fails <= 0 || tr_isAnimating);
    }

    document.getElementById('stat-stone-normal').innerText = tr_stat_normal;
    document.getElementById('stat-stone-radiant').innerText = tr_stat_radiant;
    document.getElementById('stat-stone-chaos').innerText = tr_stat_chaos;
    
    let totalStones = tr_stat_normal + tr_stat_radiant + tr_stat_chaos;
    document.getElementById('stat-stones-total').innerText = totalStones;

    let current_stone_ev = tr_current_level_stones > 0 ? tr_getStoneEV(baseRate) : 0;
    document.getElementById('stat-stones-ev').innerText = (tr_ev_stones_achieved + current_stone_ev).toFixed(2);

    document.getElementById('stat-scrolls-total').innerText = tr_stat_scrolls;
    document.getElementById('stat-scrolls-total-bottom').innerText = tr_stat_scrolls;

    let sRate = tr_getSelectedRate('scroll-rate', 'custom-scroll-rate');
    let current_scroll_ev = (tr_current_fail_scrolls > 0 && sRate > 0) ? (100 / sRate) : 0;
    document.getElementById('stat-scrolls-ev').innerText = (tr_ev_scrolls_achieved + current_scroll_ev).toFixed(2);
}

function tr_execute_action() {
    if (tr_isAnimating) return;
    let mode = document.querySelector('input[name="sim-mode"]:checked').value;
    if (mode === 'enhance') tr_action_transcend();
    else tr_action_scroll();
}

function tr_showModal(type, isSuccess, oldLv, newLv, oldBonus, newBonus, oldFails, newFails) {
    document.getElementById('result-modal').classList.add('active');

    if (type === 'enhance') {
        document.getElementById('modal-box-enhance').style.display = 'flex';
        document.getElementById('modal-box-scroll').style.display = 'none';
        
        document.getElementById('m-enh-old-lv').innerText = oldLv;
        document.getElementById('m-enh-new-lv').innerText = newLv;

        // 🌟 修正 2：超越成功彈出視窗的等級遮罩
        let mLvBadge = document.getElementById('tr-m-lv-badge');
        if (mLvBadge) {
            mLvBadge.innerHTML = `<span>Lv.${newLv}</span>`;
        }

        let header = document.getElementById('m-enh-title');
        let failContainer = document.getElementById('m-enh-fail-text-container');
        let statusTitle = document.getElementById('m-enh-status-title');
        let bonusSection = document.getElementById('m-enh-bonus-section');

        if (isSuccess) {
            header.innerText = "超越成功";
            failContainer.innerHTML = `失敗次數 <span id="m-enh-fail-count">${oldFails} / 7</span><span id="m-enh-fail-change" class="m-fail-change"></span>`;
            failContainer.style.color = "#777";
            failContainer.style.fontWeight = "normal";
            statusTitle.innerText = "超越成功。";
            bonusSection.style.display = 'block';
            document.getElementById('m-enh-status-sub').innerText = "追加超越成功機率重置";
            document.getElementById('m-enh-bonus-rate').innerText = "0%";
            document.getElementById('m-enh-bonus-rate').style.color = "#f3724c";
            document.getElementById('m-enh-bonus-hint').innerText = "";
        } else {
            header.innerText = "超越失敗";
            if (oldFails === 6 && newFails >= 7) {
                failContainer.innerHTML = `已達最大超越次數。`;
                failContainer.style.color = "#E42123";
                failContainer.style.fontWeight = "bold";
            } else {
                failContainer.innerHTML = `失敗次數 <span id="m-enh-fail-count">${oldFails} / 7</span><span id="m-enh-fail-change" class="m-fail-change">(+1)</span>`;
                failContainer.style.color = "#777";
                failContainer.style.fontWeight = "normal";
            }
            statusTitle.innerText = "超越失敗。";
            if (newBonus === 0 || oldBonus === newBonus) {
                bonusSection.style.display = 'none';
            } else {
                bonusSection.style.display = 'block';
                document.getElementById('m-enh-status-sub').innerText = "追加超越成功機率獲得";
                document.getElementById('m-enh-bonus-rate').innerText = `獎勵機率 ${oldBonus.toFixed(0)}% > ${newBonus.toFixed(0)}%`;
                document.getElementById('m-enh-bonus-rate').style.color = "#f3724c";
                document.getElementById('m-enh-bonus-hint').innerText = "獎勵機率最高可累積至50%。";
            }
        }
    } else {
        document.getElementById('modal-box-enhance').style.display = 'none';
        document.getElementById('modal-box-scroll').style.display = 'flex';
        
        // 🌟 修正 3：卷軸彈出視窗的等級遮罩
        let mScrLvBadge = document.getElementById('tr-m-scr-lv-badge');
        if (mScrLvBadge) {
            mScrLvBadge.innerHTML = `<span>Lv.${oldLv}</span>`;
        }

        let topText = document.getElementById('m-scr-top-text');
        let resultBox = document.getElementById('m-scr-result-box');

        if (isSuccess) {
            topText.innerText = "該裝備的超越失敗次數已扣除1。";
            resultBox.innerText = "失敗次數扣除成功！";
            resultBox.className = "m-scr-grey-box m-scr-text-orange";
        } else {
            topText.innerText = "該裝備的超越失敗次數未扣除。";
            resultBox.innerText = "失敗次數扣除失敗";
            resultBox.className = "m-scr-grey-box m-scr-text-grey";
        }
    }
}

function tr_closeModal() {
    document.getElementById('result-modal').classList.remove('active');
    tr_isAnimating = false;
    tr_updateUI();
}

function tr_action_transcend() {
    if (tr_isAnimating || tr_lv >= 70 || tr_fails >= 7) return;

    tr_isAnimating = true;
    tr_current_level_stones++;
    if (tr_lv < 40) tr_stat_normal++;
    else if (tr_lv < 50) tr_stat_radiant++;
    else tr_stat_chaos++;

    tr_updateUI();

    let baseRate = tr_getSelectedRate('stone-rate', 'custom-stone-rate');
    let totalRate = Math.min(100, baseRate + tr_bonus);
    let roll = Math.random() * 100;
    let isSuccess = roll < totalRate;

    let oldLv = tr_lv;
    let oldBonus = tr_bonus;
    let oldFails = tr_fails;

    tr_playSound(isSuccess);
    document.getElementById('ui-lightning').classList.add('active');

    setTimeout(() => {
        document.getElementById('ui-lightning').classList.remove('active');

        if (isSuccess) {
            tr_lv += 2;
            tr_bonus = 0.0;
            tr_ev_stones_achieved += tr_getStoneEV(baseRate);
            tr_current_level_stones = 0;
        } else {
            tr_fails++;
            let bonusStep = Math.max(5, Math.floor(baseRate * 0.2));
            tr_bonus = Math.min(50, tr_bonus + bonusStep);
        }
        tr_showModal('enhance', isSuccess, oldLv, tr_lv, oldBonus, tr_bonus, oldFails, tr_fails);
    }, 200);
}

function tr_action_scroll() {
    if (tr_isAnimating || tr_fails <= 0) return;

    tr_isAnimating = true;
    tr_stat_scrolls++;
    tr_current_fail_scrolls++;
    tr_updateUI();

    let scrollRate = tr_getSelectedRate('scroll-rate', 'custom-scroll-rate');
    let roll = Math.random() * 100;
    let isSuccess = roll < scrollRate;

    let oldLv = tr_lv;
    let oldFails = tr_fails;
    tr_playSound(isSuccess);

    setTimeout(() => {
        if (isSuccess) {
            tr_fails--;
            tr_ev_scrolls_achieved += (100 / scrollRate);
            tr_current_fail_scrolls = 0;
        }
        tr_showModal('scroll', isSuccess, oldLv, oldLv, 0, 0, oldFails, tr_fails);
    }, 200);
}

function tr_action_reset() {
    if (tr_isAnimating) return;
    tr_lv = 30;
    tr_fails = 0;
    tr_bonus = 0.0;
    tr_stat_normal = 0;
    tr_stat_radiant = 0;
    tr_stat_chaos = 0;
    tr_stat_scrolls = 0;
    tr_ev_stones_achieved = 0;
    tr_ev_scrolls_achieved = 0;
    tr_current_level_stones = 0;
    tr_current_fail_scrolls = 0;
    
    document.querySelector('input[name="sim-mode"][value="enhance"]').checked = true;
    tr_updateUI();
}

/* ========================================== */
/* 5. HEXA 屬性模擬器 (Visual Simulator)         */
/* ========================================== */
function getHexaProb(level) {
    if (level <= 2) return 0.35;
    if (level <= 5) return 0.20;
    if (level == 6) return 0.20;
    if (level == 7) return 0.15;
    if (level == 8) return 0.10;
    if (level == 9) return 0.05;
    return 0.0;
}

function getHexaCost(level) {
    if (level <= 2) return 10;
    if (level <= 5) return 20;
    if (level == 6) return 30;
    if (level == 7) return 30;
    if (level == 8) return 30;
    if (level == 9) return 50;
    return 50;
}

let vA = 0;
let vB = 0;
let vC = 0;
let vClicks = 0;
let totalFragmentsUsed = 0;
let isMuted = false;
let resetCountTracker = 0;
const enhanceSound = new Audio('assets/HexaCoreEnforcement.mp3');

function initVisualBars() {
    ['a', 'b', 'c'].forEach(type => {
        const container = document.getElementById('vbar-' + type);
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            let segment = document.createElement('div');
            segment.className = 'v-segment';
            container.appendChild(segment);
        }
    });
    updateVisualUI();
}

function formatProb(p) {
    let pct = p * 100;
    return Number.isInteger(pct) ? pct + '%' : pct.toFixed(1) + '%';
}

function updateVisualUI() {
    let levels = { 'a': vA, 'b': vB, 'c': vC };

    ['a', 'b', 'c'].forEach(type => {
        const container = document.getElementById('vbar-' + type);
        if (!container) return;
        const segments = container.children;
        const activeClass = (type === 'a') ? 'active-main' : 'active-sub';

        for (let i = 0; i < 10; i++) {
            if (i < levels[type]) {
                segments[i].classList.add(activeClass);
            } else {
                segments[i].classList.remove(activeClass);
            }
        }
    });

    let probA = getHexaProb(vA);
    let probB = 0;
    let probC = 0;

    if (vA === 10) probA = 0;

    let remProb = 1.0 - probA;
    if (vB === 10 && vC === 10) {
        probB = 0;
        probC = 0;
    } else if (vB === 10) {
        probB = 0;
        probC = remProb;
    } else if (vC === 10) {
        probC = 0;
        probB = remProb;
    } else {
        probB = remProb / 2;
        probC = remProb / 2;
    }

    document.getElementById('vprob-a').innerText = '強化機率：' + (vA < 10 ? formatProb(probA) : 'MAX');
    document.getElementById('vprob-b').innerText = '強化機率：' + (vB < 10 ? formatProb(probB) : 'MAX');
    document.getElementById('vprob-c').innerText = '強化機率：' + (vC < 10 ? formatProb(probC) : 'MAX');

    document.getElementById('v-clicks').innerText = vClicks;

    let resetBtn = document.getElementById('btn-reset-v');
    if (vClicks >= 10) {
        resetBtn.classList.add('highlight');
        resetBtn.disabled = false;
        resetBtn.style.opacity = '1';
        resetBtn.style.cursor = 'pointer';
    } else {
        resetBtn.classList.remove('highlight');
        resetBtn.disabled = true;
        resetBtn.style.opacity = '0.5';
        resetBtn.style.cursor = 'not-allowed';
    }

    let enhance10xBtn = document.getElementById('btn-enhance-10x');
    let enhance1Btn = document.getElementById('btn-enhance-1');
    
    if (vClicks >= 20) {
        enhance10xBtn.style.opacity = '0.5';
        enhance10xBtn.style.cursor = 'not-allowed';
        enhance1Btn.style.opacity = '0.5';
        enhance1Btn.style.cursor = 'not-allowed';
    } else {
        enhance10xBtn.style.opacity = '1';
        enhance10xBtn.style.cursor = 'pointer';
        enhance1Btn.style.opacity = '1';
        enhance1Btn.style.cursor = 'pointer';
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('btn-mute-v');
    if (isMuted) {
        muteBtn.innerText = '🔇 聲音：關';
        muteBtn.classList.add('muted-active');
    } else {
        muteBtn.innerText = '🔊 聲音：開';
        muteBtn.classList.remove('muted-active');
    }
    if (typeof gtag === 'function') {
        gtag('event', 'toggle_sound', {
            'simulator': 'hexa-visual',
            'sound_status': isMuted ? 'off' : 'on'
        });
    }
}

function clickVisualEnhance() {
    if (vClicks >= 20) return;

    if (!isMuted) {
        enhanceSound.currentTime = 0;
        enhanceSound.play().catch(error => { console.log("音效撥放失敗：", error); });
    }

    let cost = getHexaCost(vA);
    totalFragmentsUsed += cost;
    document.getElementById('v-fragments').innerText = totalFragmentsUsed;

    let probA = getHexaProb(vA);

    if (vA < 10 && Math.random() < probA) {
        vA++;
    } else {
        if (vB < 10 && vC < 10) {
            if (Math.random() < 0.5) vB++; else vC++;
        } else if (vB < 10) {
            vB++;
        } else if (vC < 10) {
            vC++;
        }
    }
    vClicks++;
    updateVisualUI();
}

function clickVisualEnhance10x() {
    if (vClicks >= 20) return;
    let rolls = Math.min(10, 20 - vClicks);

    if (!isMuted) {
        enhanceSound.currentTime = 0;
        enhanceSound.play().catch(error => { console.log("音效撥放失敗：", error); });
    }

    for (let i = 0; i < rolls; i++) {
        let cost = getHexaCost(vA);
        totalFragmentsUsed += cost;
        let probA = getHexaProb(vA);

        if (vA < 10 && Math.random() < probA) {
            vA++;
        } else {
            if (vB < 10 && vC < 10) {
                if (Math.random() < 0.5) vB++; else vC++;
            } else if (vB < 10) {
                vB++;
            } else if (vC < 10) {
                vC++;
            }
        }
        vClicks++;
    }

    document.getElementById('v-fragments').innerText = totalFragmentsUsed;
    updateVisualUI();
}

function resetVisual() {
    if (vClicks < 10) {
        alert("⚠️ 依據真實遊戲設定，必須點滿 10 次才能重置喔！");
        return;
    }
    resetCountTracker++;
    document.getElementById('v-reset-count').innerText = resetCountTracker;
    
    vA = 0;
    vB = 0;
    vC = 0;
    vClicks = 0;
    
    updateVisualUI();
}

function resetFragments() {
    totalFragmentsUsed = 0;
    resetCountTracker = 0;
    document.getElementById('v-fragments').innerText = totalFragmentsUsed;
    document.getElementById('v-reset-count').innerText = resetCountTracker;
}

/* ========================================== */
/* 6. HEXA 懶人決策表                          */
/* ========================================== */
let currentSort = { col: 'winRate', asc: false };

function generateLazyTable() {
    const trialsOccur = 100000;
    let occurrences = {};

    for (let i = 0; i < trialsOccur; i++) {
        let a = 0, b = 0, c = 0;
        for (let r = 0; r < 10; r++) {
            if (Math.random() < getHexaProb(a) && a < 10) {
                a++;
            } else {
                if (Math.random() < 0.5) { 
                    if (b < 10) b++; else c++; 
                } else { 
                    if (c < 10) c++; else b++; 
                }
            }
        }
        let maxSub = Math.max(b, c);
        let minSub = Math.min(b, c);
        let key = `${a}_${maxSub}_${minSub}`;
        occurrences[key] = (occurrences[key] || 0) + 1;
    }

    let results = [];
    const trialsWin = 15000;

    for (let key in occurrences) {
        let occProb = (occurrences[key] / trialsOccur) * 100;
        if (occProb > 0.05) {
            let parts = key.split('_');
            let startA = parseInt(parts[0]);
            let startB = parseInt(parts[1]);
            let startC = parseInt(parts[2]);
            let success = 0;
            
            for (let i = 0; i < trialsWin; i++) {
                let a = startA, b = startB, c = startC;
                for (let r = 0; r < 10; r++) {
                    if (Math.random() < getHexaProb(a) && a < 10) {
                        a++;
                    } else {
                        if (Math.random() < 0.5) { 
                            if (b < 10) b++; else c++; 
                        } else { 
                            if (c < 10) c++; else b++; 
                        }
                    }
                }
                if (a >= 8 || b === 10 || c === 10) success++;
            }
            let winRate = (success / trialsWin) * 100;
            if (winRate > 5.0) {
                results.push({ 
                    a: startA, 
                    maxSub: startB, 
                    minSub: startC, 
                    winRate: winRate, 
                    occProb: occProb 
                });
            }
        }
    }

    results.sort((x, y) => {
        let diff = x[currentSort.col] - y[currentSort.col];
        return currentSort.asc ? diff : -diff;
    });

    renderTable(results);
}

function renderTable(results) {
    let arrow = currentSort.asc ? " ▲" : " ▼";
    let html = `
        <table class="lazy-table">
            <thead>
                <tr>
                    <th onclick="sortTable('a')" style="cursor:pointer; background-color:#003d99;">主屬性${currentSort.col === 'a' ? arrow : ''}</th>
                    <th>較高附屬</th>
                    <th>較低附屬</th>
                    <th onclick="sortTable('occProb')" style="cursor:pointer; background-color:#003d99;">發生機率${currentSort.col === 'occProb' ? arrow : ''}</th>
                    <th onclick="sortTable('winRate')" style="cursor:pointer; background-color:#003d99;">畢業機率${currentSort.col === 'winRate' ? arrow : ''}</th>
                    <th>建議決策</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(r => {
        let tagHtml = "";
        if (r.winRate > 50) {
            tagHtml = `<span class="tag tag-green">極佳<span class="desktop-space"> </span><br class="mobile-br">(保留)</span>`;
        } else if (r.winRate > 35) {
            tagHtml = `<span class="tag tag-green">普通<span class="desktop-space"> </span><br class="mobile-br">(保留)</span>`;
        } else if (r.winRate > 15) {
            tagHtml = `<span class="tag tag-yellow">偏弱<span class="desktop-space"> </span><br class="mobile-br">(建議重置)</span>`;
        } else {
            tagHtml = `<span class="tag tag-red">無法達成<span class="desktop-space"> </span><br class="mobile-br">(立刻重置)</span>`;
        }

        html += `<tr>
            <td><strong>${r.a}</strong></td>
            <td>${r.maxSub}</td>
            <td>${r.minSub}</td>
            <td style="color:#7f8c8d;">${r.occProb.toFixed(2)}%</td>
            <td><strong>${r.winRate.toFixed(1)}%</strong></td>
            <td>${tagHtml}</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    document.getElementById('lazy-table-wrapper').innerHTML = html;
}

function sortTable(col) {
    if (currentSort.col === col) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort.col = col;
        currentSort.asc = false;
    }
    generateLazyTable();
}

/* ========================================== */
/* 7. HEXA 重置決策邏輯 (Reset Decision Sim)  */
/* ========================================== */
function checkHexaReset() {
    let a = parseInt(document.getElementById('reset-a').value) || 0;
    let b = parseInt(document.getElementById('reset-b').value) || 0;
    let c = parseInt(document.getElementById('reset-c').value) || 0;
    let rolls = parseInt(document.getElementById('reset-rolls').value) || 0;
    let targetA = parseInt(document.getElementById('reset-target-a').value) || 0;
    let targetSub1 = parseInt(document.getElementById('reset-target-sub').value) || 0;
    let targetSub2 = document.getElementById('reset-target-sub2') ? parseInt(document.getElementById('reset-target-sub2').value) || 0 : 0;

    let useMillionReset = document.getElementById('sim-million-reset') ? document.getElementById('sim-million-reset').checked : false;
    
    // 🌟 新增：讀取玩家選擇的是「或(OR)」還是「且(AND)」
    let conditionRule = document.querySelector('input[name="reset-condition"]:checked');
    let isAndMode = conditionRule ? (conditionRule.value === 'and') : false;

    let mainPanel = document.getElementById('res-main-panel');
    let detailPanel = document.getElementById('res-detail-panel');
    let mainBox = document.getElementById('result-hexa-reset-main');
    let detailBox = document.getElementById('result-hexa-reset-details');

    if (a + b + c + rolls !== 20) {
        mainPanel.style.display = 'block'; detailPanel.style.display = 'none';
        mainBox.innerHTML = `<div class="error-msg" style="text-align: center;"><div style="color: #FF3B30; font-weight: bold;">⚠️ 錯誤</div>目前等級總和 + 剩餘次數必須等於 20！</div>`;
        detailBox.innerHTML = ""; return;
    }

    if (targetA === 0 && targetSub1 === 0 && targetSub2 === 0) {
        mainPanel.style.display = 'block'; detailPanel.style.display = 'none';
        mainBox.innerHTML = `<div class="error-msg" style="text-align: center;"><div style="color: #FF3B30; font-weight: bold;">⚠️ 錯誤</div>請至少設定一項目標屬性！</div>`;
        detailBox.innerHTML = ""; return;
    }
    
    // ==========================================
    // 🌟 雙模式動態防呆機制
    // ==========================================
    let currMaxStart = Math.max(b, c);
    let currMinStart = Math.min(b, c);
    
    let reqA = targetA > 0 ? Math.max(0, targetA - a) : 0;
    let reqS1 = targetSub1 > 0 ? Math.max(0, targetSub1 - currMaxStart) : 0;
    let reqS2 = targetSub2 > 0 ? Math.max(0, targetSub2 - currMinStart) : 0;

    let impossible = false;
    let reqMsg = "";

    if (isAndMode) {
        // AND 模式：所有缺口加起來如果大於剩餘次數，絕對不可能達成
        let totalReq = reqA + reqS1 + reqS2;
        if (totalReq > rolls) {
            impossible = true;
            reqMsg = `您選擇「達成所有目標」，總共還需 <strong>${totalReq}</strong> 級，但只剩 <strong>${rolls}</strong> 次。`;
        }
    } else {
        // OR 模式：最容易的一個目標如果都大於剩餘次數，才不可能達成
        let arrReq = [];
        if (targetA > 0) arrReq.push(reqA);
        if (targetSub1 > 0) arrReq.push(reqS1);
        if (targetSub2 > 0) arrReq.push(reqS2);
        let minReq = Math.min(...arrReq);
        if (minReq > rolls) {
            impossible = true;
            reqMsg = `您選擇「達成任一目標」，最容易的目標還需 <strong>${minReq}</strong> 級，但只剩 <strong>${rolls}</strong> 次。`;
        }
    }

    if (impossible) {
        mainPanel.style.display = 'block'; detailPanel.style.display = 'none';
        mainBox.innerHTML = `
            <div class="error-msg" style="text-align: center; line-height: 1.6;">
                <div style="color: #FF3B30; font-weight: bold; margin-bottom: 6px;">⚠️ 數學上不可能達成</div>
                <div style="display: inline-block; text-align: left;">${reqMsg}<br>物理上無法達成，建議立刻重置。</div>
            </div>`;
        detailBox.innerHTML = "";
        return;
    }

    const trials = useMillionReset ? 1000000 : 30000;
    let gradSuccess = 0;
    let baseSuccess = 0;

    let countA = new Array(11).fill(0);
    let countB = new Array(11).fill(0);
    let countC = new Array(11).fill(0);

    // 🌟 1. 模擬「目前狀態」
    for (let i = 0; i < trials; i++) {
        let simA = a, simB = b, simC = c;
        for (let roll = 0; roll < rolls; roll++) {
            if (Math.random() < getHexaProb(simA) && simA < 10) simA++;
            else { if (Math.random() < 0.5) { if (simB < 10) simB++; else simC++; } else { if (simC < 10) simC++; else simB++; } }
        }

        let maxSub = Math.max(simB, simC);
        let minSub = Math.min(simB, simC);
        
        let passA = targetA > 0 ? (simA >= targetA) : false;
        let passS1 = targetSub1 > 0 ? (maxSub >= targetSub1) : false;
        let passS2 = targetSub2 > 0 ? (minSub >= targetSub2) : false;
        
        let isSuccess = false;
        if (isAndMode) {
            isSuccess = true; // 預設成功，只要有一個要求沒達成，就改為失敗
            if (targetA > 0 && !passA) isSuccess = false;
            if (targetSub1 > 0 && !passS1) isSuccess = false;
            if (targetSub2 > 0 && !passS2) isSuccess = false;
        } else {
            isSuccess = passA || passS1 || passS2;
        }
        
        if (isSuccess) gradSuccess++;

        countA[simA]++; countB[simB]++; countC[simC]++;
    }

    // 🌟 2. 模擬「全新核心 (0,0,0)」
    for (let i = 0; i < trials; i++) {
        let simA = 0, simB = 0, simC = 0;
        for (let roll = 0; roll < 20; roll++) {
            if (Math.random() < getHexaProb(simA) && simA < 10) simA++;
            else { if (Math.random() < 0.5) { if (simB < 10) simB++; else simC++; } else { if (simC < 10) simC++; else simB++; } }
        }
        
        let maxSub = Math.max(simB, simC);
        let minSub = Math.min(simB, simC);
        
        let passA = targetA > 0 ? (simA >= targetA) : false;
        let passS1 = targetSub1 > 0 ? (maxSub >= targetSub1) : false;
        let passS2 = targetSub2 > 0 ? (minSub >= targetSub2) : false;
        
        let isSuccess = false;
        if (isAndMode) {
            isSuccess = true;
            if (targetA > 0 && !passA) isSuccess = false;
            if (targetSub1 > 0 && !passS1) isSuccess = false;
            if (targetSub2 > 0 && !passS2) isSuccess = false;
        } else {
            isSuccess = passA || passS1 || passS2;
        }
        
        if (isSuccess) baseSuccess++;
    }

    function formatProb(p) {
        if (p === 0) return "0.00%";
        if (p < 0.01) return p.toFixed(4) + "%";
        return p.toFixed(2) + "%";
    }

    let winRate = (gradSuccess / trials) * 100;
    let baseWinRate = (baseSuccess / trials) * 100;
    let suggestion = "";

    if (winRate === 0) {
        suggestion = "無法達成 (機率為 0%)，請立刻重置。";
    } else if (winRate >= baseWinRate * 3) {
        suggestion = `歐洲人！(目前勝率 ${formatProb(winRate)} > 全新 ${formatProb(baseWinRate)}，衝！)`;
    } else if (winRate >= baseWinRate) {
        suggestion = `狀態不錯！(目前勝率 ${formatProb(winRate)} > 全新 ${formatProb(baseWinRate)}，繼續)`;
    } else if (winRate >= baseWinRate * 0.5) {
        suggestion = `狀態偏弱 (目前勝率 ${formatProb(winRate)} < 全新 ${formatProb(baseWinRate)}，建議重置)`;
    } else {
        suggestion = `狀態極差 (機率遠低於從頭來過，立刻重置)`;
    }

    mainPanel.style.display = 'block';
    detailPanel.style.display = 'block';

    let conditionText = isAndMode ? "(達成所有目標)" : "(達成任一目標)";

    mainBox.innerHTML = `
        <div style="font-size: 18px; font-weight: 800; color: var(--text-main, #333); margin-bottom: 8px;">預估畢業勝率 <span style="font-size: 14px; font-weight: normal; color: #888;">${conditionText}</span>：${formatProb(winRate)}</div>
        <div style="font-size: 15px; color: ${winRate >= baseWinRate ? '#34C759' : '#FF3B30'}; font-weight: 600;">${suggestion}</div>
    `;

    let htmlA = `<div style="flex: 1; min-width: 150px; color: var(--text-main, #333);"><div style="color:#007AFF; font-weight:bold; border-bottom: 1px solid var(--glass-border, #eee); padding-bottom: 5px; margin-bottom: 8px;">【主屬性 (A)】</div>`;
    for (let i = Math.max(0, a); i <= 10; i++) { htmlA += `<div style="margin-bottom: 4px;">• ${i} 級：${((countA[i] / trials) * 100).toFixed(3)}%</div>`; }
    htmlA += `</div>`;

    let htmlB = `<div style="flex: 1; min-width: 150px; color: var(--text-main, #333);"><div style="color:#FF3B30; font-weight:bold; border-bottom: 1px solid var(--glass-border, #eee); padding-bottom: 5px; margin-bottom: 8px;">【附屬性 (B)】</div>`;
    for (let i = Math.max(0, b); i <= 10; i++) { htmlB += `<div style="margin-bottom: 4px;">• ${i} 級：${((countB[i] / trials) * 100).toFixed(3)}%</div>`; }
    htmlB += `</div>`;

    let htmlC = `<div style="flex: 1; min-width: 150px; color: var(--text-main, #333);"><div style="color:#FF9500; font-weight:bold; border-bottom: 1px solid var(--glass-border, #eee); padding-bottom: 5px; margin-bottom: 8px;">【附屬性 (C)】</div>`;
    for (let i = Math.max(0, c); i <= 10; i++) { htmlC += `<div style="margin-bottom: 4px;">• ${i} 級：${((countC[i] / trials) * 100).toFixed(3)}%</div>`; }
    htmlC += `</div>`;

    detailBox.innerHTML = `
        <div style="width:100%; text-align: left; font-size: 14px; color: var(--text-main, #333);">
            <strong style="display:block; margin-bottom: 6px; font-size: 15px;">點完後可能性的機率分佈：</strong>
            <span style="font-size: 13px; color: var(--text-muted, #888); display: block; margin-bottom: 15px;">(全新核心達成機率約為 ${formatProb(baseWinRate)})</span>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 10px;">
                ${htmlA}${htmlB}${htmlC}
            </div>
        </div>
    `;
}

/* ========================================== */
/* 8. HEXA 目標屬性模擬邏輯 (Target Goal Sim) */
/* ========================================== */
function runHexaSimulation() {
    let valA = document.getElementById('sim-a').value;
    let valB = document.getElementById('sim-b').value;
    let valC = document.getElementById('sim-c').value;
    let valRolls = document.getElementById('sim-rolls').value;

    let sA = valA === "" ? 0 : parseInt(valA);
    let sB = valB === "" ? 0 : parseInt(valB);
    let sC = valC === "" ? 0 : parseInt(valC);
    let rolls = valRolls === "" ? 20 : parseInt(valRolls);

    let valTa = document.getElementById('target-a').value;
    let valTsub1 = document.getElementById('target-sub').value;
    let valTsub2 = document.getElementById('reset-target-sub2') ? document.getElementById('reset-target-sub2').value : "";

    let tA = valTa === "" ? 0 : parseInt(valTa);
    let tSub1 = valTsub1 === "" ? 0 : parseInt(valTsub1);
    let tSub2 = valTsub2 === "" ? 0 : parseInt(valTsub2);

    let useStopLoss = document.getElementById('sim-stoploss').checked;
    let useMillion = document.getElementById('sim-million') ? document.getElementById('sim-million').checked : false;
    let resBox = document.getElementById('result-hexa-sim');

    if (sA + sB + sC + rolls !== 20) {
        resBox.style.display = 'block';
        resBox.innerHTML = `
            <div class="error-msg" style="text-align: center; line-height: 1.6;">
                <div style="color: #FF3B30; font-weight: bold; margin-bottom: 6px;">⚠️ 錯誤</div>
                <div style="display: inline-block; text-align: left;">目前等級總和 (${sA + sB + sC}) + 剩餘次數 (${rolls}) 必須等於 20 喔！<br>請確認輸入的數字是否正確。</div>
            </div>`;
        return;
    }

    if (tA === 0 && tSub1 === 0 && tSub2 === 0) {
        resBox.style.display = 'block';
        resBox.innerHTML = `
            <div class="error-msg" style="text-align: center; line-height: 1.6;">
                <div style="color: #FF3B30; font-weight: bold; margin-bottom: 6px;">⚠️ 錯誤</div>
                <div>請至少設定一項目標屬性等級 (>0) 才能進行模擬！</div>
            </div>`;
        return;
    }

    let currMaxStart = Math.max(sB, sC);
    let currMinStart = Math.min(sB, sC);
    
    let reqA = tA > 0 ? Math.max(0, tA - sA) : Infinity;
    let reqS1 = tSub1 > 0 ? Math.max(0, tSub1 - currMaxStart) : Infinity;
    let reqS2 = tSub2 > 0 ? Math.max(0, tSub2 - currMinStart) : Infinity;

    let minReq = Math.min(reqA, reqS1, reqS2);

    if (minReq > rolls) {
        resBox.style.display = 'block';
        resBox.innerHTML = `
            <div class="error-msg" style="text-align: center; line-height: 1.6;">
                <div style="color: #FF3B30; font-weight: bold; margin-bottom: 6px;">⚠️ 數學上不可能達成</div>
                <div style="display: inline-block; text-align: left;">
                    您設定的目標中，最容易的一個都還需要 <strong>${minReq}</strong> 級，<br>
                    但目前只剩下 <strong>${rolls}</strong> 次點擊機會，這在物理上是不可能達成的！<br>
                    請調低目標或重新確認起始狀態。
                </div>
            </div>`;
        return; 
    }

    const trials = useMillion ? 1000000 : 100000;
    
    let cHitA = 0;
    let cHitSub1 = 0;
    let cHitSub2 = 0;
    let cHitAny = 0;   
    let cHitAll = 0;   

    // 原本：只計算成功的那顆核心花了多少碎片
    let totalFragFirst = 0; 
    let totalFragAll = 0;   

    // 🌟 新增：計算所有失敗墊檔的總碎片 (真實累積期望花費)
    let globalFragFirst = 0;
    let globalFragAll = 0;

    let hasA = tA > 0;
    let hasS1 = tSub1 > 0;
    let hasS2 = tSub2 > 0;
    let targetCount = (hasA ? 1 : 0) + (hasS1 ? 1 : 0) + (hasS2 ? 1 : 0);

    for (let i = 0; i < trials; i++) {
        let a = sA, b = sB, c = sC;
        let attFrag = 0;
        let hitFirstFrag = -1;

        let startHitAny = (hasA && sA >= tA) || (hasS1 && Math.max(sB, sC) >= tSub1) || (hasS2 && Math.min(sB, sC) >= tSub2);
        let startHitAll = (hasA ? sA >= tA : true) && (hasS1 ? Math.max(sB, sC) >= tSub1 : true) && (hasS2 ? Math.min(sB, sC) >= tSub2 : true);

        if (startHitAny) hitFirstFrag = 0;

        for (let r = 0; r < rolls; r++) {
            if (startHitAll) break; 

            let currMax = Math.max(b, c);
            let currMin = Math.min(b, c);

            let passA = hasA ? (a >= tA) : true;
            let passS1 = hasS1 ? (currMax >= tSub1) : true;
            let passS2 = hasS2 ? (currMin >= tSub2) : true;

            if (passA && passS1 && passS2) {
                break;
            }

            if (useStopLoss) {
                let remaining = rolls - r;
                let posA = (hasA && !passA) ? (a + remaining >= tA) : false;
                let posS1 = (hasS1 && !passS1) ? (currMax + remaining >= tSub1) : false;
                let posS2 = (hasS2 && !passS2) ? (currMin + remaining >= tSub2) : false;

                let currentTotalRolls = sA + sB + sC + r;
                if (currentTotalRolls === 10) {
                    if (tA === 10 && a < 5) posA = false;
                    if (tA === 9 && a < 4) posA = false;
                }

                if (!posA && !posS1 && !posS2) {
                    break;
                }
            }

            attFrag += getHexaCost(a);
            
            if (Math.random() < getHexaProb(a) && a < 10) {
                a++;
            } else {
                if (Math.random() < 0.5) {
                    if (b < 10) b++; else c++;
                } else {
                    if (c < 10) c++; else b++;
                }
            }

            if (hitFirstFrag === -1) {
                let nMax = Math.max(b, c);
                let nMin = Math.min(b, c);
                if ((hasA && a >= tA) || (hasS1 && nMax >= tSub1) || (hasS2 && nMin >= tSub2)) {
                    hitFirstFrag = attFrag;
                }
            }
        }

        let finalMax = Math.max(b, c);
        let finalMin = Math.min(b, c);

        let finalPassA = hasA && (a >= tA);
        let finalPassS1 = hasS1 && (finalMax >= tSub1);
        let finalPassS2 = hasS2 && (finalMin >= tSub2);

        let hitAny = finalPassA || finalPassS1 || finalPassS2;
        let hitAll = (hasA ? finalPassA : true) && (hasS1 ? finalPassS1 : true) && (hasS2 ? finalPassS2 : true);

        if (finalPassA) cHitA++;
        if (finalPassS1) cHitSub1++;
        if (finalPassS2) cHitSub2++;

        // 🌟 計算「任一目標就收手」策略的花費
        if (hitAny) {
            cHitAny++;
            if (hitFirstFrag === -1) hitFirstFrag = attFrag; 
            totalFragFirst += hitFirstFrag;
            globalFragFirst += hitFirstFrag; // 成功的話，這宇宙花的是成功時的碎片
        } else {
            globalFragFirst += attFrag; // 失敗的話，這宇宙陪葬的碎片全部加進去
        }
        
        // 🌟 計算「追求所有目標」策略的花費
        if (hitAll) {
            cHitAll++;
            totalFragAll += attFrag;
        }
        globalFragAll += attFrag; // 無論成敗，追求全拿的策略就是砸到最後
    }

    function formatProb(count) {
        let p = (count / trials) * 100;
        if (p === 0) return "0.00 %";
        if (p < 0.01) return p.toFixed(4) + " %";
        return p.toFixed(2) + " %";
    }

    let htmlOutput = `<div style="font-size: 18px; font-weight: 800; color: var(--text-main, #333); margin-bottom: 8px;">【 模擬 ${trials.toLocaleString()} 次結果 】</div>`;

    if (useStopLoss) {
        htmlOutput += `<div style="color:var(--text-muted, #888); font-size: 13px; margin-bottom: 15px;">`;
        htmlOutput += `(套用智慧停損：只有當「所有設定目標」都無望時，才會提早放棄以節省碎片)`;
        htmlOutput += `</div>`;
    } else {
        htmlOutput += `<div style="margin-bottom: 15px;"></div>`;
    }

    htmlOutput += `<div style="text-align: left; line-height: 1.8; color: var(--text-main, #333); font-size: 15px;">`;

    if (hasA) htmlOutput += `• 達成 [主屬性 ${tA} 級] 的機率：<strong style="color:#007AFF; font-size: 16px;">${formatProb(cHitA)}</strong><br>`;
    if (hasS1) htmlOutput += `• 達成 [較高附屬 ${tSub1} 級] 的機率：<strong style="color:#FF3B30; font-size: 16px;">${formatProb(cHitSub1)}</strong><br>`;
    if (hasS2) htmlOutput += `• 達成 [較低附屬 ${tSub2} 級] 的機率：<strong style="color:#FF9500; font-size: 16px;">${formatProb(cHitSub2)}</strong><br>`;

    if (targetCount > 1) {
        htmlOutput += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ccc;">`;
        htmlOutput += `• 達成 <strong>【任一目標】</strong> 的機率：<strong style="color:#34C759; font-size: 16px;">${formatProb(cHitAny)}</strong><br>`;
        htmlOutput += `• 同時達成 <strong>【所有目標】</strong> 的機率：<strong style="color:#AF52DE; font-size: 18px;">${formatProb(cHitAll)}</strong>`;
        htmlOutput += `</div>`;
    }
    htmlOutput += `</div>`;
    htmlOutput += `<div style="width: 100%; height: 1px; background-color: var(--glass-border, #eee); margin: 20px 0;"></div>`;

    // 🌟 輸出真實期望花費與單顆造價
    if (cHitAny > 0) {
        let winCostFirst = Math.round(totalFragFirst / cHitAny);
        let trueCostFirst = Math.round(globalFragFirst / cHitAny);
        
        // 這裡外層已經設定了 var(--text-main, #333)，裡面的文字只要不寫死顏色就會自動繼承！
        htmlOutput += `<div style="color: var(--text-main, #333); font-size: 15px;">`;
        
        if (targetCount > 1) {
            let winCostAll = cHitAll > 0 ? Math.round(totalFragAll / cHitAll).toLocaleString() : "∞";
            let trueCostAll = cHitAll > 0 ? Math.round(globalFragAll / cHitAll).toLocaleString() : "∞";
            
            htmlOutput += `<div style="margin-bottom:6px; font-weight:bold;">預估累積碎片需求 (包含重製的成本)：</div>`;
            
            // 💡 修正點 1：移除了寫死的 #555，小字改用 var(--text-muted, #888)
            htmlOutput += `<div style="font-size: 14px; margin-bottom:12px;">▶ 若達成 <strong>任一目標</strong> 就收手，平均需準備 <strong style="font-size: 17px; color:#34C759;">${trueCostFirst.toLocaleString()}</strong> 個碎片<br><span style="font-size:12px; color:var(--text-muted, #888);">(其中那顆成功核心本身的造價約為 ${winCostFirst.toLocaleString()} 個)</span></div>`;
            
            if (cHitAll > 0) {
                // 💡 修正點 2
                htmlOutput += `<div style="font-size: 14px;">▶ 若追求 <strong>所有目標</strong> 全拿，平均需準備 <strong style="font-size: 17px; color:#AF52DE;">${trueCostAll}</strong> 個碎片<br><span style="font-size:12px; color:var(--text-muted, #888);">(其中那顆成功核心本身成本約為 ${winCostAll} 個)</span></div>`;
            } else {
                // 💡 修正點 3
                htmlOutput += `<div style="font-size: 14px; color:var(--text-muted, #888);">▶ 追求所有目標的成功率趨近於 0，強烈不建議嘗試。</div>`;
            }
        } else {
             htmlOutput += `<div style="margin-bottom:6px; font-weight:bold;">預估累積碎片需求 (包含重製的成本)：</div>`;
             // 💡 修正點 4
             htmlOutput += `<div style="font-size: 14px;">平均需準備約 <strong style="font-size: 19px; color:#FF3B30;">${trueCostFirst.toLocaleString()}</strong> 個碎片才能達成目標<br><span style="font-size:13px; color:var(--text-muted, #888);">(其中那顆成功核心本身成本約為 ${winCostFirst.toLocaleString()} 個)</span></div>`;
        }
        htmlOutput += `</div>`;
    } else {
        htmlOutput += `<div style="color: #FF3B30; font-size: 15px; font-weight: bold;">在目前的起點與剩餘次數下，達成目標的機率為 0%，建議降低標準或重新模擬。</div>`;
    }

    resBox.style.display = 'block';
    resBox.innerHTML = htmlOutput;
}
/* ========================================== */
/* 9. 製作模擬器邏輯 (Craft Simulator)           */
/* ========================================== */

// 🌟 製作模擬器的資料庫也要補上 hasEmblem
const cr_equip_db = [
    {
        label: "天之星光權杖",
        mythic: { name: "龍尾巴天之星光權杖", img: "assets/equipment/龍尾巴天之星光權杖.png", hasEmblem: true },
        ancient: { name: "龍尾巴天之星光權杖", img: "assets/equipment/龍尾巴天之星光權杖.webp", hasEmblem: true },
        necro: { name: "死靈天之星光權杖", img: "assets/equipment/死靈天之星光權杖.webp", hasEmblem: true },
        absolab: { name: "航海師天之星光權杖", img: "assets/equipment/航海師天之星光權杖.webp", hasEmblem: true },
        arcane: { name: "神秘冥界幽靈天之星光權杖", img: "assets/equipment/神秘冥界幽靈天之星光權杖.webp", hasEmblem: true }
    }/*,
    {
        label: "克拉",
        mythic: { name: "獅子心形克拉", img: "assets/equipment/獅子心形克拉.png", hasEmblem: true },
        ancient: { name: "獅子心形克拉", img: "assets/equipment/獅子心形克拉.webp", hasEmblem: true },
        necro: { name: "死靈克拉", img: "assets/equipment/死靈克拉.webp", hasEmblem: true },
        absolab: { name: "航海師克拉", img: "assets/equipment/航海師克拉.webp", hasEmblem: true },
        arcane: { name: "神秘冥界幽靈克拉", img: "assets/equipment/神秘冥界幽靈克拉.webp", hasEmblem: true }
    }*/
];

let cr_equip_idx = 0; // 預設為權杖
let cr_fails = 0;
let cr_successes = 0;
let cr_crystals_used = 0;
let cr_scrolls_used = 0;
let cr_isAnimating = false;
let cr_isMuted = false;
let cr_ev_achieved = 0;
let cr_current_attempts = 0;
let cr_mythic_type = 'necro';
let cr_stage = 'arcane';

const cr_sfx_success = new Audio('assets/AncientSuccess.wav');
const cr_sfx_fail = new Audio('assets/AncientFail.wav');

// 🌟 修改：將寫死的圖片與名稱移除，改為 fromKey 與 toKey 指向資料庫
const CRAFT_DATA = {
    mythic_inherit: {
        fromKey: 'mythic', toKey: 'ancient',
        baseRate: 30, additionalRate: 0,
        fromText: "神話", toText: "古代", fromColor: "#E42123", toColor: "#1cd1ed",
        desc: "<br>對選擇的裝備進行繼承製作。<br><br>可獲得和所選裝備相同類別的<span class='txt-sharp' style='color:#1cd1ed;'>古代裝備</span>。",
        meso: "1,204", crystalName: "古代武器結晶", crystalImg: "assets/古代武器結晶.png", crystalReq: 1,
        scrollName: "幸運的古代製作卷軸", scrollImg: "assets/卷軸空格.png", scrollReq: 2,
        confirmCustomHTML: `
            要進行古代級道具<span style="color:#f3724c; font-weight:bold;">繼承製作</span>嗎？<br>
            製作Lv.31以上的裝備成功時，裝備等級會重置，並且會顯示為能力下降。<br>
            原有裝備的基本能力值會以相同比例維持。<br><br>
            死靈轉換製作：製作<span style="color:#1cd1ed; font-weight:bold;">古代級</span>的死靈道具<br>
            繼承製作：獲得相同類別的<span style="color:#1cd1ed; font-weight:bold;">古代</span>道具
        `,
        confirmHighlight: "古代", confirmTier: "古代級", confirmTierColor: "#ed7245",
        successFromText: "神話", successFromColor: "#E42123", successToText: "古代", successToColor: "#1cd1ed",
        failFromText: "神話", failFromColor: "#E42123", failToText: "神話", failToColor: "#E42123"
    },
    mythic_necro: {
        fromKey: 'mythic', toKey: 'necro',
        baseRate: 4, additionalRate: 4,
        fromText: "神話", toText: "古代", fromColor: "#E42123", toColor: "#1cd1ed",
        desc: "對選擇的裝備進行死靈轉換製作。<br><br>製作成功時可獲得<span class='txt-sharp' style='color:#1cd1ed;'>古代</span>死靈道具。<br>把神話鍊成道具作為基本使用時，製作成功機率會提高。<br>",
        meso: "1,204", crystalName: "古代武器結晶", crystalImg: "assets/古代武器結晶.png", crystalReq: 1,
        scrollName: "幸運的古代製作卷軸", scrollImg: "assets/卷軸空格.png", scrollReq: 2,
        confirmCustomHTML: `
            要進行古代級道具<span style="color:#f3724c; font-weight:bold;">死靈轉換製作</span>嗎？<br>
            製作Lv.31以上的裝備成功時，裝備等級會重置，並且會顯示為能力下降。<br>
            原有裝備的基本能力值會以相同比例維持。<br><br>
            死靈轉換製作：製作<span style="color:#1cd1ed; font-weight:bold;">古代級</span>的死靈道具<br>
            繼承製作：獲得相同類別的<span style="color:#1cd1ed; font-weight:bold;">古代</span>道具
        `,
        confirmHighlight: "死靈", confirmTier: "死靈級", confirmTierColor: "#1cd1ed",
        successFromText: "神話", successFromColor: "#E42123", successToText: "死靈", successToColor: "#1cd1ed",
        failFromText: "神話", failFromColor: "#E42123", failToText: "神話", failToColor: "#E42123"
    },
    absolab: {
        fromKey: 'necro', toKey: 'absolab',
        baseRate: 12, additionalRate: 0,
        fromText: "死靈", toText: "航海師", fromColor: "#1cd1ed", toColor: "#CC9ED8",
        desc: "以<span class='txt-sharp' style='color:#1cd1ed;'>在死靈裝備</span>製作<span class='txt-sharp' style='color:#CC9ED8;'>航海師裝備</span>。",
        meso: "1,204", crystalName: "烙印武器結晶", crystalImg: "assets/烙印武器結晶.png", crystalReq: 1,
        scrollName: "幸運的混沌製作卷軸(武器)", scrollImg: "assets/卷軸空格.png", scrollReq: 1,
        confirmHighlight: "航海師", confirmHighlightColor: "#ed7245", confirmTier: "混沌級", confirmTierColor: "#D02E9D",
        successFromText: "古代", successFromColor: "#1cd1ed", successToText: "混沌", successToColor: "#CC9ED8",
        failFromText: "古代", failFromColor: "#1cd1ed", failToText: "古代", failToColor: "#1cd1ed"
    },
    arcane: {
        fromKey: 'absolab', toKey: 'arcane',
        baseRate: 10, additionalRate: 0,
        fromText: "航海師", toText: "神秘冥界幽靈", fromColor: "#CC9ED8", toColor: "#CC9ED8",
        desc: "以<span class='txt-sharp' style='color:#CC9ED8;'>在航海師裝備</span>上製作<span class='txt-sharp' style='color:#CC9ED8;'>神秘冥界幽靈裝備</span>。",
        meso: "1,204", crystalName: "夏德貝爾結晶(武器)", crystalImg: "assets/夏德貝爾結晶(武器).png", crystalReq: 1,
        scrollName: "幸運的混沌製作卷軸(武器)", scrollImg: "assets/卷軸空格.png", scrollReq: 1,
        confirmHighlight: "神秘冥界幽靈", confirmHighlightColor: "#ed7245", confirmTier: "混沌級", confirmTierColor: "#D02E9D",
        successFromText: "混沌", successFromColor: "#CC9ED8", successToText: "混沌", successToColor: "#CC9ED8",
        failFromText: "混沌", failFromColor: "#CC9ED8", failToText: "混沌", failToColor: "#CC9ED8"
    }
};

// 網頁載入時自動初始化選單
document.addEventListener('DOMContentLoaded', () => {
    let selectElem = document.getElementById('cr-equip-select');
    if (selectElem) {
        let optionsHtml = '';
        cr_equip_db.forEach((item, index) => {
            optionsHtml += `<option value="${index}">${item.label}</option>`;
        });
        selectElem.innerHTML = optionsHtml;
        selectElem.value = cr_equip_idx;
        cr_updateUI(); 
    }
});

function cr_changeEquip() {
    let select = document.getElementById('cr-equip-select');
    if (select) {
        cr_equip_idx = parseInt(select.value) || 0;
        cr_updateUI();
    }
}

function cr_toggleSound() {
    cr_isMuted = !cr_isMuted;
    document.getElementById('btn-sound-toggle-cr').innerText = cr_isMuted ? "🔇 音效：關閉" : "🔊 音效：開啟";
    document.getElementById('btn-sound-toggle-cr').className = cr_isMuted ? "btn-sound muted" : "btn-sound";
}

function cr_changeMythicSub(type) {
    cr_mythic_type = type;
    cr_updateUI();
}

function cr_getScrollRate() {
    if (cr_stage === 'necro') {
        let n1 = document.getElementById('cr-scroll-n1');
        let n2 = document.getElementById('cr-scroll-n2');
        let v1 = n1 ? parseInt(n1.value) : 0;
        let v2 = n2 ? parseInt(n2.value) : 0;
        let count = (v1 > 0 ? 1 : 0) + (v2 > 0 ? 1 : 0);
        let firstRate = (v1 > 0) ? v1 : v2;
        return { rate: (v1 + v2), count: count, firstRate: firstRate };
    } else {
        let scrollElem = document.getElementById('cr-scroll-c1');
        let v1 = scrollElem ? parseInt(scrollElem.value) : 0;
        return { rate: v1, count: v1 > 0 ? 1 : 0, firstRate: v1 };
    }
}

function cr_forceStageChange() {
    if (cr_isAnimating) return;

    let stageRadio = document.querySelector('input[name="cr-stage"]:checked');
    if (stageRadio) cr_stage = stageRadio.value;

    cr_fails = 0; cr_successes = 0; cr_crystals_used = 0; cr_scrolls_used = 0; cr_ev_achieved = 0; cr_current_attempts = 0;

    if (cr_stage === 'necro') {
        let necroDiv = document.getElementById('cr-scroll-necro-div');
        let chaosDiv = document.getElementById('cr-scroll-chaos-div');
        if (necroDiv) necroDiv.style.display = 'flex';
        if (chaosDiv) chaosDiv.style.display = 'none';

        let n1 = document.getElementById('cr-scroll-n1');
        let n2 = document.getElementById('cr-scroll-n2');
        if (n1) n1.value = "0";
        if (n2) n2.value = "0";
    } else {
        let necroDiv = document.getElementById('cr-scroll-necro-div');
        let chaosDiv = document.getElementById('cr-scroll-chaos-div');
        if (necroDiv) necroDiv.style.display = 'none';
        if (chaosDiv) chaosDiv.style.display = 'flex';

        let c1 = document.getElementById('cr-scroll-c1');
        if (c1) c1.value = "0";
    }
    cr_updateUI();
}

function cr_getDynamicScrollImg(stage, firstRate, defaultImg) {
    if (!firstRate || firstRate === 0) return defaultImg;
    let folder = 'assets/';
    if (stage === 'necro') {
        if (firstRate >= 1 && firstRate <= 6) return `${folder}幸運的古代製作卷軸${firstRate}.png`;
        if (firstRate === 10 || firstRate === 15) return `${folder}幸運的古代製作卷軸5_10.png`;
    } else {
        if (firstRate === 3 || firstRate === 5 || firstRate === 7) return `${folder}幸運的混沌製作卷軸(武器)3_5_7.png`;
        if (firstRate === 10) return `${folder}幸運的混沌製作卷軸_武器_10.png`;
    }
    return defaultImg;
}

function cr_updateUI() {
    let activeKey = (cr_stage === 'necro') ? 'mythic_' + cr_mythic_type : cr_stage;
    let data = CRAFT_DATA[activeKey];
    let scrollInfo = cr_getScrollRate();
    let totalRate = data.baseRate + data.additionalRate + scrollInfo.rate;

    // 🌟 從資料庫抓取當前選擇武器的對應圖片與名稱
    let equipData = cr_equip_db[cr_equip_idx];
    let fromEquip = equipData[data.fromKey];

    let equipImgElem = document.getElementById('cr-equip-from-img');
    let equipNameElem = document.getElementById('cr-equip-from-name');
    let uiLvBadge = document.getElementById('cr-ui-lv-badge');
    let uiStarBadge = document.getElementById('cr-ui-star-badge');

    if (equipImgElem) {
        equipImgElem.style.display = '';
        equipImgElem.src = fromEquip.img;
    }
    if (equipNameElem) equipNameElem.innerHTML = fromEquip.name;
    
    // 🌟 動態更新主畫面的遮罩標籤：起始畫面固定為星星 M、對應初始等級
    let startLv = (cr_stage === 'necro') ? 30 : (cr_stage === 'absolab' ? 40 : 60);
    if (uiLvBadge) { uiLvBadge.style.display = 'block'; uiLvBadge.innerHTML = `<span>Lv.${startLv}</span>`; }
    if (uiStarBadge) { uiStarBadge.style.display = 'flex'; uiStarBadge.innerHTML = `<span>M</span>`; }

    let crystalImgElem = document.getElementById('cr-crystal-img');
    let crystalNameElem = document.getElementById('cr-crystal-name');
    if (crystalImgElem) { crystalImgElem.style.display = ''; crystalImgElem.src = data.crystalImg; }
    if (crystalNameElem) crystalNameElem.innerHTML = `${data.crystalName}<br><span style="color:#888; font-weight:normal; font-size:0.85em;">1/${data.crystalReq}</span>`;

    let fromTextElem = document.getElementById('cr-stage-from-text');
    let toTextElem = document.getElementById('cr-stage-to-text');
    if (fromTextElem) { fromTextElem.innerText = data.fromText; fromTextElem.style.color = data.fromColor; }
    if (toTextElem) { toTextElem.innerText = data.toText; toTextElem.style.color = data.toColor; }

    let descElem = document.getElementById('cr-desc-text');
    let descParent = descElem ? descElem.parentElement : null;
    let midGreySection = document.querySelector('#cr-game-ui-container .sec-grey-mid');

    if (cr_stage === 'necro') {
        if (descParent) { descParent.style.padding = '0'; descParent.style.backgroundColor = '#F0F0F0'; descParent.style.borderBottom = 'none'; }
        if (midGreySection) midGreySection.style.padding = '0';
    } else {
        if (descParent) { descParent.style.padding = '8px 0 8px 0'; descParent.style.backgroundColor = '#ffffff'; descParent.style.borderBottom = '1px solid #e1e4e8'; }
        if (midGreySection) midGreySection.style.padding = '12px 0 0 0';
    }

    if (descElem) {
        let descHTML = "";
        if (cr_stage === 'necro') {
            descHTML += `
                <div style="background-color: #FFFFFF; border-bottom: 1px solid #e1e4e8; padding: 4px 0; display: flex; justify-content: center;">
                    <div style="display: flex; gap: 110px; width: 400px; padding-left: 0px;">
                        <label style="cursor: pointer; display: flex; align-items: center; user-select: none; font-size: 14px; font-weight: bold; color: #333;">
                            <input type="checkbox" ${cr_mythic_type === 'inherit' ? 'checked' : ''} onchange="cr_changeMythicSub('inherit')" style="margin-right: 8px; width: 18px; height: 18px; accent-color: #3498db; cursor: pointer;"> 繼承
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; user-select: none; font-size: 14px; font-weight: bold; color: #333;">
                            <input type="checkbox" ${cr_mythic_type === 'necro' ? 'checked' : ''} onchange="cr_changeMythicSub('necro')" style="margin-right: 8px; width: 18px; height: 18px; accent-color: #3498db; cursor: pointer;"> 死靈轉換
                        </label>
                    </div>
                </div>
                <div style="background-color: #F0F0F0; padding: 15px 20px; font-size: 13px; color: #333; line-height: 1.6; text-align: center; font-weight: normal;">
                    ${data.desc}
                </div>
            `;
        } else {
            descHTML = data.desc;
        }
        descElem.innerHTML = descHTML;
    }

    let chaosTierList = document.getElementById('cr-chaos-tier-list');
    if (chaosTierList) {
        if (cr_stage === 'necro') chaosTierList.style.display = 'none';
        else chaosTierList.style.display = 'block';
    }

    let scrollCol = document.getElementById('cr-scroll-col');
    let scrollName = document.getElementById('cr-scroll-name');
    let scrollImgElem = document.getElementById('cr-scroll-img');

    if (scrollImgElem) {
        scrollImgElem.style.display = '';
        scrollImgElem.src = cr_getDynamicScrollImg(cr_stage, scrollInfo.firstRate, data.scrollImg);
    }

    if (scrollCol && scrollName) {
        if (scrollInfo.rate > 0 || scrollInfo.count > 0) {
            scrollCol.style.opacity = '1';
            scrollName.style.color = '#333';
            scrollName.style.fontWeight = 'bold';
            let scrollDisplayName = (cr_stage === 'necro') ? `${data.scrollName}` : `${data.scrollName}${scrollInfo.rate}%`;
            scrollName.innerHTML = `${scrollDisplayName}<br><span style="color:#888; font-weight:normal; font-size:0.85em;">${scrollInfo.count}/${data.scrollReq}</span>`;
        } else {
            scrollCol.style.opacity = '0.3';
            scrollName.style.color = '#888';
            scrollName.style.fontWeight = 'normal';
            scrollName.innerHTML = `卷軸`;
        }
    }

    let rateBox = document.querySelector('#cr-game-ui-container .rate-box');
    if (rateBox) {
        rateBox.style.marginTop = 'auto'; rateBox.style.width = '100%';
        if (cr_stage === 'necro' && cr_mythic_type === 'necro') {
            rateBox.innerHTML = `
                <div style="background-color: #ffffff; width: 100%; padding: 6px 0; border-top: 1px solid #e1e4e8; border-bottom: 1px solid #e1e4e8;">
                    <div class="txt-sharp" style="color: #1cd1ed; font-size: 14px;">追加死靈轉換製作成功機率 : ${data.additionalRate}%</div>
                </div>
                <div style="background-color: #F0F0F0; width: 100%; padding: 6px 0 10px 0;">
                    <div class="txt-sharp" style="color: #f3724c; font-size: 15px;">死靈轉換製作成功機率 : ${scrollInfo.rate > 0 ? (data.baseRate + scrollInfo.rate) + '(' + data.baseRate + '+' + scrollInfo.rate + ')%' : data.baseRate + '%'}</div>
                </div>
            `;
        } else if (cr_stage === 'necro' && cr_mythic_type === 'inherit') {
            rateBox.innerHTML = `
                <div style="background-color: #F0F0F0; width: 100%; padding: 10px 0 10px 0;">
                    <div class="txt-sharp" style="color: #f3724c; font-size: 15px;">繼承製作成功機率 : ${scrollInfo.rate > 0 ? (data.baseRate + scrollInfo.rate) + '(' + data.baseRate + '+' + scrollInfo.rate + ')%' : data.baseRate + '%'}</div>
                </div>
            `;
        } else {
            rateBox.innerHTML = `
                <div class="txt-sharp" style="color: #f3724c; font-size: 15px; padding-bottom: 10px; margin-bottom: 0;"> 
                    <span id="cr-stage-to-name-color">${data.toText}</span>製作成功率 : 
                    <span id="cr-total-rate" style="margin-left: 2px;">${scrollInfo.rate > 0 ? (data.baseRate + scrollInfo.rate) + '(' + data.baseRate + '+' + scrollInfo.rate + ')%' : data.baseRate + ' %'}</span>
                </div>
            `;
        }
    }

    let mesoElem = document.getElementById('cr-meso-cost');
    if (mesoElem) mesoElem.innerText = data.meso;

    let statSuccess = document.getElementById('cr-stat-success');
    let statFails = document.getElementById('cr-stat-fails');
    let statCrys = document.getElementById('cr-stat-crystals');
    let statScr = document.getElementById('cr-stat-scrolls');
    let statTotalUsed = document.getElementById('cr-stat-total-used');
    let evAtmpt = document.getElementById('cr-ev-attempts');

    if (statSuccess) statSuccess.innerText = cr_successes;
    if (statFails) statFails.innerText = cr_fails;
    if (statCrys) statCrys.innerText = cr_crystals_used;
    if (statScr) statScr.innerText = cr_scrolls_used;
    if (statTotalUsed) statTotalUsed.innerText = cr_crystals_used;

    let current_ev = (cr_current_attempts > 0) ? (100 / totalRate) : 0;
    if (evAtmpt) evAtmpt.innerText = (cr_ev_achieved + current_ev).toFixed(2);
}

function cr_showConfirm() {
    if (cr_isAnimating) return;
    let modal = document.getElementById('cr-confirm-modal');
    if (modal) {
        let activeKey = (cr_stage === 'necro') ? 'mythic_' + cr_mythic_type : cr_stage;
        let data = CRAFT_DATA[activeKey];
        let confirmBody = modal.querySelector('.cr-confirm-body');
        if (confirmBody) {
            if (data.confirmCustomHTML) {
                confirmBody.innerHTML = data.confirmCustomHTML;
            } else {
                let highlightColor = data.confirmHighlightColor || data.toColor;
                confirmBody.innerHTML = `
                    要製作<span style="color:${highlightColor}; font-weight:bold;">${data.confirmHighlight}</span>道具嗎？<br>
                    裝備等級會重置，能力可能會顯示下降。<br>
                    原有裝備持有的基本能力會以相同比例維持。<br><br>
                    ${data.confirmHighlight} 製作：<span style="color:${data.confirmTierColor}; font-weight:bold;">${data.confirmTier}</span>的${data.confirmHighlight}製作
                `;
            }
        }
        modal.classList.add('active');
    }
}

function cr_cancelConfirm() {
    let modal = document.getElementById('cr-confirm-modal');
    if (modal) modal.classList.remove('active');
}

function cr_executeCraft() {
    let confirmModal = document.getElementById('cr-confirm-modal');
    if (confirmModal) confirmModal.classList.remove('active');
    cr_isAnimating = true;

    try {
        let activeKey = (cr_stage === 'necro') ? 'mythic_' + cr_mythic_type : cr_stage;
        let data = CRAFT_DATA[activeKey];
        let scrollInfo = cr_getScrollRate();
        let totalRate = data.baseRate + data.additionalRate + scrollInfo.rate;

        cr_current_attempts++;
        cr_crystals_used++;
        cr_scrolls_used += scrollInfo.count;
        cr_updateUI();

        let isSuccess = (Math.random() * 100) < totalRate;
        let animOverlay = document.getElementById('cr-anim-overlay');

        if (animOverlay) {
            animOverlay.className = 'lightning-overlay ' + (isSuccess ? (cr_stage === 'necro' ? 'cr-anim-success-gold' : 'cr-anim-success') : (cr_stage === 'necro' ? 'cr-anim-fail-gold' : 'cr-anim-fail'));
            if (!cr_isMuted) {
                let sfx = isSuccess ? cr_sfx_success : cr_sfx_fail;
                sfx.currentTime = 0; sfx.play().catch(e => console.log(e));
            }

            setTimeout(() => {
                animOverlay.className = 'lightning-overlay';
                if (isSuccess) {
                    cr_successes++;
                    let attempts_taken = cr_current_attempts;
                    cr_fails = 0; cr_ev_achieved += (100 / totalRate); cr_current_attempts = 0;
                    cr_showResult(true, attempts_taken);
                } else {
                    cr_fails++;
                    cr_showResult(false);
                }
            }, 1260);
        }
    } catch (e) {
        console.error(e); cr_isAnimating = false;
    }
}

function cr_showResult(isSuccess, attempts_taken = 0) {
    let modal = document.getElementById('cr-result-modal');
    if (!modal) return;
    modal.classList.add('active');

    let statsBox = document.getElementById('cr-m-stats-box');
    let mLvBadge = document.getElementById('cr-m-lv-badge');
    let mStarBadge = document.getElementById('cr-m-star-badge'); // 🌟 加入星星抓取
    let failCont = document.getElementById('cr-m-fail-text-container');
    let resultImgElem = document.getElementById('cr-m-equip-img');

    let activeKey = (cr_stage === 'necro') ? 'mythic_' + cr_mythic_type : cr_stage;
    let data = CRAFT_DATA[activeKey];
    let equipData = cr_equip_db[cr_equip_idx];
    
    let toEquip = equipData[data.toKey];
    let fromEquip = equipData[data.fromKey];

    let stageFromElem = document.getElementById('cr-m-stage-from-color');
    let stageToElem = document.getElementById('cr-m-stage-to-color');

    if (isSuccess) {
        if (stageFromElem && stageToElem) {
            stageFromElem.innerText = data.successFromText; stageFromElem.style.color = data.successFromColor;
            stageToElem.innerText = data.successToText; stageToElem.style.color = data.successToColor;
        }

        document.getElementById('cr-m-title').innerText = "製作成功";
        if (resultImgElem) { resultImgElem.style.display = ''; resultImgElem.src = toEquip.img; }
        document.getElementById('cr-m-equip-name').innerText = toEquip.name;
        
        // 🌟 成功後等級強制重置為 Lv.1
        if (mLvBadge) { mLvBadge.style.display = 'block'; mLvBadge.innerHTML = `<span>Lv.1</span>`; }

        // 🌟 成功後星星依照不同階段扣除
        if (mStarBadge) {
            let newStar = "M";
            if (cr_stage === 'necro') newStar = "29";      // 神話 ➔ 古代/死靈 掉星為29
            else if (cr_stage === 'absolab') newStar = "29"; // 死靈 ➔ 航海師 掉星為29
            else if (cr_stage === 'arcane') newStar = "34";  // 航海師 ➔ 神秘 掉星為34
            
            mStarBadge.style.display = 'flex'; 
            mStarBadge.innerHTML = `<span>${newStar}</span>`; 
        }

        if (failCont) { failCont.style.display = "block"; failCont.innerHTML = `累積製作 <span style="color:#e67e22; font-weight:bold;">${attempts_taken}</span> 次`; }
        if (statsBox) {
            statsBox.innerHTML = `
                <div class="cr-stat-row"><span style="color:#333;">攻擊力</span><span style="color:#f3724c;">1,204 <span style="color:#58C701;">(▲1,204)</span></span></div>
                <div class="cr-stat-row"><span style="color:#E42123;">最終傷害增加</span><span style="color:#E42123;">1,204</span></div>
                <div class="cr-stat-row"><span style="color:#E42123;">最終傷害增加</span><span style="color:#E42123;">1,204</span></div>
            `;
        }
    } else {
        if (stageFromElem && stageToElem) {
            stageFromElem.innerText = data.failFromText; stageFromElem.style.color = data.failFromColor;
            stageToElem.innerText = data.failToText; stageToElem.style.color = data.failToColor;
        }

        document.getElementById('cr-m-title').innerText = "製作失敗";
        if (resultImgElem) { resultImgElem.style.display = ''; resultImgElem.src = fromEquip.img; }
        document.getElementById('cr-m-equip-name').innerText = fromEquip.name;

        // 🌟 失敗後等級維持原狀 (防呆判斷初始等級)
        if (mLvBadge) {
            let failLv = (cr_stage === 'necro') ? 30 : (cr_stage === 'absolab' ? 40 : 60);
            mLvBadge.style.display = 'block'; mLvBadge.innerHTML = `<span>Lv.${failLv}</span>`;
        }
        
        // 🌟 失敗後星星維持原本的 M
        if (mStarBadge) { 
            mStarBadge.style.display = 'flex'; 
            mStarBadge.innerHTML = `<span>M</span>`; 
        }

        if (failCont) { failCont.style.display = "block"; failCont.innerHTML = `製作失敗次數 <span style="color:#e74c3c; font-weight:bold;">${cr_fails}</span> / 5`; }
        if (statsBox) { statsBox.innerHTML = `<div style="text-align:center; padding: 15px 0; color:#555; font-size:14px; font-weight:bold;">能力值沒有變化。</div>`; }
    }
}

function cr_closeResult() {
    let modal = document.getElementById('cr-result-modal');
    if (modal) modal.classList.remove('active');
    cr_isAnimating = false;
    cr_updateUI();
}

function cr_action_reset() {
    if (cr_isAnimating) return;
    cr_fails = 0; cr_successes = 0; cr_crystals_used = 0; cr_scrolls_used = 0; cr_ev_achieved = 0; cr_current_attempts = 0;
    cr_updateUI();
}

/* ========================================== */
/* 10. 威爾一階特訓模擬引擎 (終極淨化版)         */
/* ========================================== */
const wCanvas = document.getElementById('willCanvas');
const wCtx = wCanvas ? wCanvas.getContext('2d') : null;

const WORLD_W = 1741;
const WORLD_H = 713;
const WORLD_CENTER = 870;

const CONFIG = {
    camera: { zoom: 1.3, offsetY: 100 },
    scale: { player: 1, boss: 1, legTop: 1, legBot: 1, crack: 0.85, hitEffect: 1 },
    pos: { floorY: 445, bossY: 600, crackX: 820, crackY: 450, legTopY: -280, legBotY: 1100, legTopOffsetX: 100, legBotOffsetX: 50 },
    time: { warn: 900, strike: 900, idle: 300 },
    player: { speed: 7, nativeFacingLeft: true, hitBot: 110, hitTop: 140 },
    boss: { speed: 2.5, followDistance: 30 }
};

const POS = { LL: 225, L2: 440, L1: 655, M: 870, R1: 1085, R2: 1300, RR: 1515 };

function will_togglePause(forceState) {
    wGame.isPaused = forceState;
    if (wGame.isPaused) {
        will_updateUI("⏸ 遊戲暫停", "#f1c40f", "點擊 ▶ 繼續");
    } else {
        will_updateUI("▶ 遊戲繼續", "#2ecc71", "準備...");
    }
}

function will_zoomStep(amount) {
    let newZoom = Math.max(1.0, Math.min(2.5, CONFIG.camera.zoom + amount));
    CONFIG.camera.zoom = Number(newZoom.toFixed(1));
    const display = document.getElementById('zoom-glass-val');
    if (display) display.innerText = CONFIG.camera.zoom.toFixed(1) + 'x';
}

// =========================================================================
// 🖼️ 【修改素材區】
// =========================================================================
const wAssets = {
    bgSmooth: new Image(), bgCrack: new Image(), boss: new Image(),
    pWalk: new Image(), pIdle: new Image(), legTop: new Image(), legBot: new Image(), crack: new Image()
};

wAssets.bgSmooth.src = 'assets/bg_Deep_Mirror.png';
wAssets.bgCrack.src = 'assets/bg_Deep_Mirror.png';
wAssets.crack.src = 'assets/screen_crack.png';
wAssets.pWalk.src = 'assets/player_walk.png';
wAssets.pIdle.src = 'assets/player_idle.png';
wAssets.boss.src = 'assets/boss_will.png';
wAssets.legTop.src = 'assets/spider_leg_top.png';
wAssets.legBot.src = 'assets/spider_leg_bottom.png';

wAssets.hitEffect = new Image();
wAssets.hitEffect.src = 'assets/spider_leg_hit.png';

const wSprites = {
    pWalk: { cols: 6, rows: 7, frames: 37, speed: 60, curr: 0, tick: 0 },
    pIdle: { cols: 9, rows: 9, frames: 80, speed: 60, curr: 0, tick: 0 },
    boss: { cols: 4, rows: 4, frames: 16, speed: 60, curr: 0, tick: 0 },
    legTop: { cols: 5, rows: 6, frames: 30, speed: 60, curr: 0, tick: 0 },
    legBot: { cols: 5, rows: 6, frames: 30, speed: 60, curr: 0, tick: 0 },
    crack: { cols: 3, rows: 3, frames: 8, speed: 60, curr: 0, tick: 0 },
    hitEffect: { cols: 3, rows: 3, frames: 9, speed: 80, curr: 0, tick: 0, active: false, hitX: 0, hitY: 0 }
};

// =========================================================================
// 🕷️ 終極 1:1 蜘蛛角陣型題庫設定
// =========================================================================
const WILL_PATTERNS = [
    {
        name: "困難混沌無地裂1 (中 ➔ 小左 ➔ 中)", crack: false, hint: "中 ➔ 小左 ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.LL, POS.L2, POS.L1], top: [POS.R1, POS.R2, POS.RR] },
            { safe: POS.L1, bot: [POS.LL - 150, POS.M, POS.R1, POS.R2, POS.RR, POS.RR + 200], top: [POS.L2] },
            { safe: POS.M, bot: [POS.LL, POS.L2, POS.L1], top: [POS.R1, POS.R2, POS.RR] }
        ]
    },
    {
        name: "困難混沌無地裂2 (中 ➔ 小右 ➔ 大右 ➔ 中)", crack: false, hint: "中 ➔ 小右 ➔ 大右 ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.L2, POS.R1, POS.L2, POS.RR], top: [POS.L1 - 50, POS.LL, POS.R2] },
            { safe: POS.R1, bot: [POS.L1, POS.R2], top: [POS.L2 - 50, POS.M - 50, POS.RR - 50] },
            { safe: POS.R2, bot: [POS.M - 30, POS.RR], top: [POS.R1 - 50, POS.L1 - 50] },
        ]
    },
    {
        name: "混沌無地裂3 (中 ➔ 大右 ➔ 小右 ➔ 中)", crack: false, hint: "中 ➔ 大右 ➔ 小右(中) ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.L2, POS.L1 + 130, POS.RR + 50], top: [POS.LL, POS.L1 - 80, ] },
            { safe: POS.R2, bot: [POS.LL, POS.L1 - 30, POS.RR - 30], top: [POS.L2 - 50, POS.M - 130, POS.M + 50] },
            { safe: POS.R1, bot: [POS.RR - 50], top: [POS.LL, POS.M - 120, POS.R2 - 90, POS.RR + 50] },
        ]
    },
    {
        name: "混沌無地裂4 (中 ➔ 大左 ➔ 不動 ➔ 中) ", crack: false, hint: "中 ➔ 大左 ➔ 不動 ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.LL - 70, POS.M - 80, POS.M + 100, POS.RR - 80, POS.RR + 80], top: [POS.L2 - 50, POS.R1 + 90], noDeduct: true },
            { safe: POS.L2, bot: [POS.RR - 50], top: [POS.LL - 100, POS.M - 100, POS.R1 - 120, POS.R2 - 150] },
            { safe: POS.L2, bot: [POS.R1 - 90, POS.R1 + 90], top: [POS.LL - 20, POS.M - 80, POS.R2 - 10] },
        ]
    },
    {
        name: "混沌地裂1 (中 ➔ 大左 ➔ 更大左 ➔ 中)", crack: true, hint: "中 ➔ 大左 ➔ 更大左 ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.M, POS.R1 + 50, POS.R2 + 100], top: [POS.RR + 30] },
            { safe: POS.L2, bot: [POS.LL], top: [POS.L2 + 100] },
            { safe: POS.LL, bot: [POS.LL, POS.R1 - 50], top: [POS.L2 - 50, POS.R1] },
        ]
    },
    {
        name: "混沌地裂2-型態1 (中 ➔ 大右 ➔ 中)", crack: true, hint: "中 ➔ 大右 ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.M, POS.R1], top: [POS.LL - 150, POS.LL + 50] },
            { safe: POS.R2, bot: [POS.L2 - 80, POS.L2 + 120], top: [POS.R1 + 80, POS.R2 + 30] },
            { safe: POS.M, bot: [POS.LL - 150, POS.LL + 50], top: [POS.M - 30, POS.R1 - 40] }
        ]
    },
    {
        name: "混沌地裂3-型態2 (中 ➔ 大右 ➔ 中)", crack: true, hint: "中 ➔ 大右 ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.LL - 100, POS.M], top: [POS.LL, POS.R1 - 80] },
            { safe: POS.R2, bot: [POS.L2 + 70, POS.R2 + 50], top: [POS.LL + 70, POS.R1 + 70] },
            { safe: POS.M, bot: [POS.L1 - 30, POS.RR - 80], top: [POS.M - 30, POS.RR + 70] }
        ]
    },
    {
        name: "困難混沌有地裂 (中 ➔ 大左 ➔ 中)", crack: true, hint: "中 ➔ 大左 ➔ 中",
        strikes: [
            { safe: POS.M, bot: [POS.LL - 100, POS.M], top: [POS.LL, POS.R1 - 80] },
            { safe: POS.R2, bot: [POS.L2 + 70, POS.R2 + 50], top: [POS.LL + 70, POS.R1 + 70] },
            { safe: POS.M, bot: [POS.L1 - 30, POS.RR - 80], top: [POS.M - 30, POS.RR + 70] }
        ]
    }
];

let wPlayer = { x: WORLD_CENTER, y: CONFIG.pos.floorY, radius: 15, targetX: null, facing: 'right' };
let wBoss = { x: WORLD_CENTER, facing: 'left' };
let wKeys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };
let wLastTime = 0;
let cameraX = 0;
let mTouchLeft = false;
let mTouchRight = false;
let isJoyDragging = false;

// 🌟 遊戲核心狀態 (包含防作弊機制與抽籤袋)
let wGame = {
    hits: 0,
    questionsAnswered: 0,
    totalQuestions: 7,
    currentPatternIdx: 0,
    phase: 'stopped',
    strikeIndex: 0,
    timer: 0,
    flashRed: 0,
    hasEvaluated: false,
    isPaused: false,
    playerName: "",
    maxHp: 1204000,
    currentHp: 1204000,
    targetHp: 1204000,
    healTimer: 0,
    patternBag: [], // 抽籤袋
    hasUsedHintThisGame: false // 🌟 防作弊追蹤器
};

// 🌟 背景音樂管理
let willBgm = new Audio('assets/MirrorCage.mp3');
willBgm.loop = true;
willBgm.volume = 0.3;
let isBgmPlaying = false;

// 🌟 設定狀態
let wSettings = {
    mode: 'chaos',
    endless: false,
    isCustom: false,
    customRounds: 2,
    hint: false,
    bgm: true
};

function will_drawSprite(ctx, img, cfg, x, y, scale = 1, flip = false, align = 'bottom-center') {
    if (!img.complete || img.naturalWidth === 0) return;
    const fw = img.naturalWidth / cfg.cols;
    const fh = img.naturalHeight / cfg.rows;
    const col = cfg.curr % cfg.cols;
    const row = Math.floor(cfg.curr / cfg.cols);
    
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    
    let drawX = -fw / 2;
    let drawY = -fh / 2;
    
    if (align === 'bottom-center') drawY = -fh;
    if (align === 'top-center') drawY = 0;
    
    ctx.drawImage(img, col * fw, row * fh, fw, fh, drawX * scale, drawY * scale, fw * scale, fh * scale);
    ctx.restore();
}

function tickSprite(cfg, dt, loop = true) {
    cfg.tick += dt;
    if (cfg.tick >= cfg.speed) {
        cfg.tick = 0;
        cfg.curr++;
        if (cfg.curr >= cfg.frames) cfg.curr = loop ? 0 : cfg.frames - 1;
    }
}

// 🌟 更新設定面板
window.will_updateSettings = function() {
    let modeRadio = document.querySelector('input[name="will-mode"]:checked');
    let lengthRadio = document.querySelector('input[name="will-length"]:checked');
    let hintCheck = document.getElementById('will-hint-toggle');
    let bgmCheck = document.getElementById('will-bgm-toggle');
    let customInput = document.getElementById('will-custom-rounds');

    if (modeRadio) wSettings.mode = modeRadio.value;
    
    if (lengthRadio) {
        wSettings.endless = (lengthRadio.value === 'endless');
        wSettings.isCustom = (lengthRadio.value === 'custom');
    }

    if (customInput) {
        wSettings.customRounds = parseInt(customInput.value) || 1;
        if (wSettings.customRounds < 1) wSettings.customRounds = 1;
    }

    if (hintCheck) wSettings.hint = hintCheck.checked;

    // 🎵 處理背景音樂
    if (bgmCheck) {
        wSettings.bgm = bgmCheck.checked;
        if (!wSettings.bgm && isBgmPlaying) {
            willBgm.pause();
            isBgmPlaying = false;
        }
        if (wSettings.bgm && !isBgmPlaying && wGame.phase !== 'stopped') {
            willBgm.play().then(() => { isBgmPlaying = true; }).catch(e => console.log(e));
        }
    }

    const hintBtn = document.getElementById('btn-will-hint');
    if (hintBtn) {
        if (wSettings.hint) hintBtn.classList.add('active-hint');
        else hintBtn.classList.remove('active-hint');
    }
};

// 🌟 點擊遊戲內暫停按鈕
window.will_togglePauseState = function() {
    if (wGame.phase === 'stopped') return;
    wGame.isPaused = !wGame.isPaused;

    const pauseBtn = document.getElementById('btn-will-pause');
    
    if (wGame.isPaused) {
        if (pauseBtn) pauseBtn.innerText = '►';
        will_updateUI("⏸ 遊戲暫停", "#f1c40f", "點擊右上角 ► 繼續");

        // 🌟 音樂連動：遊戲暫停時，暫停音樂 (不洗掉播放進度)
        if (isBgmPlaying) {
            willBgm.pause();
        }
    } else {
        if (pauseBtn) pauseBtn.innerText = '❚❚';
        will_updateUI("▶ 遊戲繼續", "#2ecc71", "準備...");

        // 🌟 音樂連動：遊戲繼續時，如果設定有開音樂，就「接續」播放
        if (wSettings.bgm) {
            willBgm.play().then(() => { isBgmPlaying = true; }).catch(e => console.log(e));
        }
    }
};

// 🌟 點擊遊戲內燈泡切換提示 (結合防作弊)
window.will_toggleHintClick = function() {
    if (wGame.phase === 'stopped') return;
    let hintCheck = document.getElementById('will-hint-toggle');
    if (hintCheck) {
        hintCheck.checked = !hintCheck.checked;
    }
    will_updateSettings();

    // 🛡️ 防作弊核心：只要這局被打開過，永遠標記作弊
    if (wSettings.hint === true) {
        wGame.hasUsedHintThisGame = true;
    }
};

// 🌟 顯示開始畫面 (重置並停止音樂)
window.will_showStartScreen = function() {
    wGame.phase = 'stopped';
    willBgm.pause();
    isBgmPlaying = false;

    // 🎯 呼叫總指揮：切換到 START 狀態
    will_updateUIState('START');
};

// 🌟 按下「開始」按鈕 (結合題數與防作弊初始化)
window.will_startGame = function() {
    will_updateSettings();
    let nameInput = document.getElementById('will-player-name').value.trim();
    if (typeof gtag === 'function') {
        gtag('event', 'use_simulator', {
            'simulator_name': 'will'
        });
    }

    wGame.playerName = nameInput !== "" ? nameInput : "nickname1204";

    const hudName = document.getElementById('ms-name-text');
    if (hudName) hudName.innerText = wGame.playerName;

    wPlayer.x = WORLD_CENTER;
    wPlayer.targetX = null;
    wBoss.x = WORLD_CENTER;
    wBoss.facing = 'left';
    
    wGame.hits = 0;
    wGame.questionsAnswered = 0;
    wGame.hasUsedHintThisGame = wSettings.hint;

    let baseQuestions = (wSettings.mode === 'hard') ? 3 : 7;

    if (wSettings.endless) {
        wGame.totalQuestions = Infinity;
    } else if (wSettings.isCustom) {
        wGame.totalQuestions = wSettings.customRounds * baseQuestions;
    } else {
        wGame.totalQuestions = baseQuestions;
    }

    wGame.currentHp = wGame.maxHp;
    wGame.targetHp = wGame.maxHp;
    wGame.healTimer = 0;

    const hitHud = document.getElementById('ms-hit-text');
    if (hitHud) hitHud.innerText = `被擊中次數: 0`;
    const hpBar = document.getElementById('ms-hp-bar');
    const hpText = document.getElementById('ms-hp-text');
    if (hpBar) hpBar.style.width = `100%`;
    if (hpText) hpText.innerText = wGame.maxHp.toLocaleString();

    wGame.patternBag = [];

    wGame.currentPatternIdx = will_pickNextPattern();
    wGame.strikeIndex = 0;
    wGame.phase = 'ready';
    wGame.timer = 2000;
    wGame.flashRed = 0;
    wGame.hasEvaluated = false;
    wGame.isPaused = false;

    const pauseBtn = document.getElementById('btn-will-pause');
    if (pauseBtn) pauseBtn.innerText = '❚❚';

    // 🎯 呼叫總指揮：切換到 PLAYING 狀態 (取代了原本好幾行手動隱藏的代碼)
    will_updateUIState('PLAYING');

    will_updateUI("練習開始", "#2ecc71", "準備...");

    willBgm.currentTime = 0;
    if (wSettings.bgm) {
        willBgm.play().then(() => { isBgmPlaying = true; }).catch(e => console.log("需互動"));
    } else {
        isBgmPlaying = false;
    }

    wLastTime = performance.now();
};

// 🌟 顯示成績單 (純淨版：JS 僅負責邏輯，外觀交給 CSS Class)
window.will_showResultScreen = function() {
    document.getElementById('res-name').innerText = wGame.playerName || "nickname1204";

    let diffStr = "混沌";
    if (wSettings.mode === 'hard') diffStr = "困難";
    else if (wSettings.mode === 'random') diffStr = "動態隨機";

    document.getElementById('res-diff').innerText = diffStr;

    let modeStr = "全機制1次";
    if (wSettings.isCustom) {
        modeStr = `全機制${wSettings.customRounds}次`;
    }

    // 🛡️ JS 僅負責套用乾淨的 HTML 結構與 Class，不再寫死 Style
    if (wSettings.endless) {
        modeStr = `<span class="mode-title-wrapper">無限練習<span class="mode-subtitle note-gray">(完成 ${wGame.questionsAnswered} 題)</span></span>`;
    } else if (wGame.questionsAnswered < wGame.totalQuestions) {
        modeStr = `<span class="mode-title-wrapper">${modeStr}<span class="mode-subtitle note-red">(未完成)</span></span>`;
    }

    document.getElementById('res-mode').innerHTML = modeStr;
    document.getElementById('res-hint').innerText = wGame.hasUsedHintThisGame ? "已開啟" : "未開啟";

    // 🌟 完美通關變色處理 (必須 0次 + 完整通關 才亮綠色)
    const hitValueElem = document.getElementById('res-hits');
    hitValueElem.innerText = wGame.hits;

    const hitWrapper = hitValueElem.parentElement;
    hitWrapper.removeAttribute('style');

    // 🛡️ 新增嚴格判斷：0次 且 (是無限模式 或 答題數達到總題數) 才算真正完美
    let isPerfectClear = (wGame.hits === 0) && (wSettings.endless || wGame.questionsAnswered >= wGame.totalQuestions);

    if (isPerfectClear) {
        hitWrapper.classList.remove('hit-danger');
        hitWrapper.classList.add('hit-success');
    } else {
        // 有被擊中，或者「雖然 0 次但未完成」，一律給紅色！
        hitWrapper.classList.remove('hit-success');
        hitWrapper.classList.add('hit-danger');
    }

    // 🎯 呼叫總指揮：切換到 RESULT 狀態
    will_updateUIState('RESULT');
};

// 🌟 🏁 提早結算功能 (純結算，不強制增加擊中次數)
window.will_forceEndGame = function() {
    if (wGame.phase === 'stopped' || wGame.phase === 'victory') return;

    wGame.phase = 'victory';
    will_updateUI("提早結算", "#f1c40f", "計算成績中...");

    setTimeout(() => {
        will_showResultScreen();
    }, 800);
};

window.will_playAgain = function() {
    document.getElementById('will-result-overlay').style.display = 'none';
    will_startGame();
};

window.will_updateVolume = function() {
    let volSlider = document.getElementById('will-bgm-volume');
    if (volSlider && typeof willBgm !== 'undefined') {
        willBgm.volume = parseFloat(volSlider.value);
    }
};

// 🌟 遊戲初始化綁定
function will_init() {
    if (!wCanvas) return;
    wCanvas.width = WORLD_W;
    wCanvas.height = WORLD_H;

    window.addEventListener('keydown', e => { if (wKeys.hasOwnProperty(e.key)) wKeys[e.key] = true; });
    window.addEventListener('keyup', e => { if (wKeys.hasOwnProperty(e.key)) wKeys[e.key] = false; });

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const joyBase = document.getElementById('joystick-base');
    if (joyBase) {
        if (!isTouchDevice) {
            joyBase.style.display = 'none';
        } else {
            joyBase.addEventListener('touchstart', joyStart, { passive: false });
            joyBase.addEventListener('touchmove', joyMove, { passive: false });
            joyBase.addEventListener('touchend', joyEnd);
            joyBase.addEventListener('touchcancel', joyEnd);
        }
    }

    will_updateSettings();
    will_showStartScreen();
    requestAnimationFrame(will_gameLoop);
}

// 🌟 智慧選題系統 (支援原有固定題庫與全新動態隨機模式)
function will_pickNextPattern() {
    // =========================================================================
    // 🌟 新增：如果玩家選取了全新的「動態隨機」模式
    // =========================================================================
    if (wSettings.mode === 'random') {
        const lanes = [POS.LL, POS.L2, POS.L1, POS.M, POS.R1, POS.R2, POS.RR];
        const isCrack = Math.random() < 0.5; // 50% 機率有地裂，50% 無地裂
        let randomStrikes = [];
        let lastSafeIdx = 3; // 第一波安全區從中央(M)開始算，防暴走

        for (let s = 0; s < 3; s++) {
            // 演算法防呆：下一波的安全軌道，只能在上一波的左右一格內 (-1, 0, 1)
            let shift = Math.floor(Math.random() * 3) - 1;
            let currentSafeIdx = lastSafeIdx + shift;
            if (currentSafeIdx < 0) currentSafeIdx = 0;
            if (currentSafeIdx > 6) currentSafeIdx = 6;

            lastSafeIdx = currentSafeIdx;
            let safeX = lanes[currentSafeIdx];
            let botLegs = [];
            let topLegs = [];

            if (isCrack === false) {
                // 【無地裂模式：閃躲腳】安全區絕不生腳，其餘軌道 40% 機率長蜘蛛腳
                for (let i = 0; i < lanes.length; i++) {
                    if (i === currentSafeIdx) continue;
                    if (Math.random() < 0.4) botLegs.push(lanes[i]);
                    if (Math.random() < 0.4) topLegs.push(lanes[i]);
                }
            } else {
                // 【有地裂模式：接住腳】安全區必生蜘蛛腳讓玩家踩，其餘軌道 15% 機率生出干擾干擾腳
                let legType = Math.random();
                if (legType < 0.4) {
                    botLegs.push(safeX);
                } else if (legType < 0.8) {
                    topLegs.push(safeX);
                } else {
                    botLegs.push(safeX);
                    topLegs.push(safeX);
                }

                for (let i = 0; i < lanes.length; i++) {
                    if (i === currentSafeIdx) continue;
                    if (Math.random() < 0.15) {
                        if (Math.random() < 0.5) botLegs.push(lanes[i]);
                        else topLegs.push(lanes[i]);
                    }
                }
            }

            randomStrikes.push({ safe: safeX, bot: botLegs, top: topLegs });
        }

        // 🎯 核心防爆技巧：把現場臨時印製的隨機題目塞到第 8 號虛擬槽位，0~7 號原本題庫動都不會動！
        WILL_PATTERNS[8] = {
            name: `動態隨機機制 (${isCrack ? "有地裂" : "無地裂"})`,
            crack: isCrack,
            hint: isCrack ? "請找腳踩進去！" : "請避開所有腳！",
            strikes: randomStrikes
        };
        return 8; // 叫遊戲引擎直接去讀取第 8 號槽位
    }

    // =========================================================================
    // 🔒 原本的固定題庫邏輯，100% 完整保留，完全沒變動！
    // =========================================================================
    let allowedIndices = (wSettings.mode === 'hard') ? [0, 1, 7] : [0, 1, 2, 3, 4, 5, 6];

    if (!wGame.patternBag || wGame.patternBag.length === 0) {
        wGame.patternBag = [...allowedIndices];
        for (let i = wGame.patternBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wGame.patternBag[i], wGame.patternBag[j]] = [wGame.patternBag[j], wGame.patternBag[i]];
        }
    }
    return wGame.patternBag.pop();
}

let activeTouchId = null;

function joyStart(e) {
    if (typeof willGameActive !== 'undefined' && !willGameActive) return;
    if (wGame.phase === 'stopped') return;
    e.preventDefault();
    if (isJoyDragging) return;
    
    const touch = e.changedTouches[0];
    activeTouchId = touch.identifier;
    isJoyDragging = true;
    
    const stick = document.getElementById('joystick-stick');
    stick.style.transition = 'none';
    joyUpdate(touch);
}

function joyMove(e) {
    if (!isJoyDragging) return;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
            joyUpdate(e.changedTouches[i]);
            break;
        }
    }
}

function joyEnd(e) {
    if (!isJoyDragging) return;
    let isOurTouchReleased = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
            isOurTouchReleased = true;
            break;
        }
    }
    if (!isOurTouchReleased) return;
    
    isJoyDragging = false;
    activeTouchId = null;
    
    const stick = document.getElementById('joystick-stick');
    stick.style.transform = `translate(0px, 0px)`;
    stick.style.transition = 'transform 0.2s ease-out';
    mTouchLeft = false;
    mTouchRight = false;
}

function joyUpdate(touch) {
    const rect = document.getElementById('joystick-base').getBoundingClientRect();
    const stick = document.getElementById('joystick-stick');
    let dx = touch.clientX - (rect.left + rect.width / 2);
    let dy = touch.clientY - (rect.top + rect.height / 2);
    let dist = Math.sqrt(dx * dx + dy * dy);
    let maxR = (rect.width / 2) - (stick.offsetWidth / 2);
    
    if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
    }
    
    stick.style.transform = `translate(${dx}px, ${dy}px)`;
    let threshold = maxR * 0.4;
    mTouchLeft = dx < -threshold;
    mTouchRight = dx > threshold;
}

function will_updateUI(text, color, subtext = "") {
    const statusEl = document.getElementById('will-status');
    const timerEl = document.getElementById('will-timer');
    if (statusEl) {
        statusEl.innerText = text;
        statusEl.style.color = color;
    }
    if (timerEl) {
        timerEl.innerText = subtext;
    }
}

// 🌟 智慧型提示文字動態翻譯機
function will_getHintText(currPattern) {
    if (!wSettings.hint) return " ";
    // 如果是原本的固定模式，直接回傳原廠寫好的 hint 即可
    if (wSettings.mode !== 'random') return `提示: ${currPattern.hint}`;

    // 如果是全新的動態隨機模式，自動將隨機座標 (870, 440) 翻譯成精美文字路徑！
    let pathNames = currPattern.strikes.map(s => {
        if (s.safe === POS.M) return "中";
        if (s.safe === POS.L1) return "小左";
        if (s.safe === POS.L2) return "大左";
        if (s.safe === POS.LL) return "極左";
        if (s.safe === POS.R1) return "小右";
        if (s.safe === POS.R2) return "大右";
        if (s.safe === POS.RR) return "極右";
        return "未知";
    }).join(" ➔ ");

    return `提示 [${currPattern.crack ? "接腳" : "躲腳"}]: ${pathNames}`;
}

// =========================================================================
// 🎮 遊戲 UI 狀態中央控制器 (純淨防誤殺版)
// =========================================================================
function will_updateUIState(state) {
    const startOverlay = document.getElementById('will-start-overlay');
    const resultOverlay = document.getElementById('will-result-overlay');
    const joystick = document.getElementById('joystick-base');
    const hud = document.getElementById('ms-player-hud');

    const pnlMid = document.getElementById('glass-controls-mid');
    const pnlBot = document.getElementById('glass-controls-bottom');
    const btnPause = document.getElementById('btn-will-pause');
    const btnRestart = document.getElementById('btn-will-restart');
    const btnEnd = document.getElementById('btn-will-end');

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (state === 'START') {
        if (startOverlay) startOverlay.style.display = 'flex';
        if (resultOverlay) resultOverlay.style.display = 'none';
        if (hud) hud.style.display = 'none';
        if (joystick) joystick.style.display = 'none';

        const statusEl = document.getElementById('will-status');
        const timerEl = document.getElementById('will-timer');
        if (statusEl) statusEl.innerText = '';
        if (timerEl) timerEl.innerText = '';

        if (pnlMid) pnlMid.style.display = 'none';
        if (pnlBot) pnlBot.style.display = 'none';
        if (btnPause) btnPause.style.display = 'none';
        if (btnRestart) btnRestart.style.display = 'none';
        if (btnEnd) btnEnd.style.display = 'none';
    }
    else if (state === 'PLAYING') {
        if (startOverlay) startOverlay.style.display = 'none';
        if (resultOverlay) resultOverlay.style.display = 'none';
        if (hud) hud.style.display = 'flex';
        if (joystick && isTouchDevice) joystick.style.display = 'flex';

        if (pnlMid) pnlMid.style.display = 'flex';
        if (pnlBot) pnlBot.style.display = 'flex';
        if (btnPause) btnPause.style.display = '';
        if (btnRestart) btnRestart.style.display = '';
        if (btnEnd) btnEnd.style.display = '';
    }
    else if (state === 'RESULT') {
        if (startOverlay) startOverlay.style.display = 'none';
        if (resultOverlay) resultOverlay.style.display = 'flex';
        if (hud) hud.style.display = 'none';
        if (joystick) joystick.style.display = 'none';

        if (pnlMid) pnlMid.style.display = 'none';
        if (pnlBot) pnlBot.style.display = 'none';
        if (btnPause) btnPause.style.display = 'none';
        if (btnRestart) btnRestart.style.display = '';
        if (btnEnd) btnEnd.style.display = 'none';
    }
}

function will_nextQuestion() {
    wGame.questionsAnswered++;

    if (!wSettings.endless && wGame.questionsAnswered >= wGame.totalQuestions) {
        wGame.phase = 'victory';
        will_updateUI("練習完成", "#f1c40f", "計算成績中...");

        setTimeout(() => {
            will_showResultScreen();
        }, 800);
        return;
    }

    wGame.currentPatternIdx = will_pickNextPattern();
    wGame.strikeIndex = 0;
    wGame.phase = 'ready';
    wGame.timer = 1500;
    wPlayer.targetX = null;
}

function will_update(dt) {
    if (wGame.isPaused || wGame.phase === 'stopped') return;

    let dx = 0;
    if (wKeys.ArrowLeft || wKeys.a || mTouchLeft) dx -= 1;
    if (wKeys.ArrowRight || wKeys.d || mTouchRight) dx += 1;

    let moveDistance = CONFIG.player.speed * (dt / 16.666);
    if (dx !== 0) {
        wPlayer.targetX = null;
        wPlayer.x += dx * moveDistance;
        wPlayer.facing = dx > 0 ? 'right' : 'left';
    }
    wPlayer.x = Math.max(0, Math.min(WORLD_W, wPlayer.x));

    let isMoving = (dx !== 0);
    if (isMoving) {
        tickSprite(wSprites.pWalk, dt);
        wSprites.pIdle.curr = 0;
    } else {
        tickSprite(wSprites.pIdle, dt);
        wSprites.pWalk.curr = 0;
    }
    tickSprite(wSprites.boss, dt);

    // ============================================
    // 🌟 在這裡貼上這段：更新受擊特效 (播完就自動關閉)
    // ============================================
    if (wSprites.hitEffect.active) {
        wSprites.hitEffect.tick += dt;
        if (wSprites.hitEffect.tick >= wSprites.hitEffect.speed) {
            wSprites.hitEffect.tick = 0;
            wSprites.hitEffect.curr++;
            if (wSprites.hitEffect.curr >= wSprites.hitEffect.frames) {
                wSprites.hitEffect.active = false; // 9幀播完，關閉特效
            }
        }
    }

    // ============================================
    // 🌟 新增：Boss 自動追蹤玩家系統
    // ============================================
    let distToPlayer = wPlayer.x - wBoss.x;
    let absDist = Math.abs(distToPlayer);

    // 當距離超過我們設定的「保持距離」時，Boss 才會開始移動
    if (absDist > CONFIG.boss.followDistance) {
        let dir = distToPlayer > 0 ? 1 : -1; // 1 代表往右走，-1 代表往左走
        let moveDistance = CONFIG.boss.speed * (dt / 16.666);

        // 防抖動處理：如果王已經快貼到保持距離了，就直接定位，避免前後瘋狂抽搐
        if (absDist - CONFIG.boss.followDistance < moveDistance) {
            wBoss.x = wPlayer.x - (dir * CONFIG.boss.followDistance);
        } else {
            wBoss.x += dir * moveDistance; // Boss 移動
        }
    }

    // 讓王永遠盯著玩家的方向看
    wBoss.facing = distToPlayer > 0 ? 'right' : 'left';

    if (wGame.flashRed > 0) wGame.flashRed -= dt;

    if (wGame.healTimer > 0) {
        wGame.healTimer -= dt;
        if (wGame.healTimer <= 0) {
            wGame.targetHp = wGame.maxHp;
        }
    }

    if (wGame.currentHp > wGame.targetHp) {
        wGame.currentHp -= (wGame.maxHp / 500) * dt;
        if (wGame.currentHp < wGame.targetHp) wGame.currentHp = wGame.targetHp;
    } else if (wGame.currentHp < wGame.targetHp) {
        wGame.currentHp += (wGame.maxHp / 300) * dt;
        if (wGame.currentHp > wGame.targetHp) wGame.currentHp = wGame.targetHp;
    }

    if (wGame.phase !== 'victory' && wGame.phase !== 'stopped') {
        wGame.timer -= dt;
        let currPattern = WILL_PATTERNS[wGame.currentPatternIdx];

        if (wGame.phase === 'ready' && wGame.timer <= 0) {
            wGame.phase = 'warn';
            wGame.timer = CONFIG.time.warn;
            wSprites.crack.curr = 0;
            wSprites.legTop.curr = 0;
            wSprites.legBot.curr = 0;
            wSprites.crack.tick = 0;
            wSprites.legTop.tick = 0;
            wSprites.legBot.tick = 0;

            let qNumStr = wSettings.endless ? `${wGame.questionsAnswered + 1}` : `${wGame.questionsAnswered + 1}/${wGame.totalQuestions}`;
            let hintStr = will_getHintText(currPattern);
            will_updateUI(`第 ${qNumStr} 題`, "white", hintStr);
        }

        if (wGame.phase === 'warn' || wGame.phase === 'strike' || wGame.phase === 'idle') {
            tickSprite(wSprites.legTop, dt, false);
            tickSprite(wSprites.legBot, dt, false);
            if (currPattern.crack) tickSprite(wSprites.crack, dt, false);
        }

        if (wGame.phase === 'warn' && wGame.timer <= 0) {
            wGame.phase = 'strike';
            wGame.timer = CONFIG.time.strike;
            wGame.hasEvaluated = false;
        }
        else if (wGame.phase === 'strike') {
            if (!wGame.hasEvaluated && wSprites.legBot.curr >= 22 && wSprites.legBot.curr <= 25) {
                wGame.hasEvaluated = true;
                let currentStrike = currPattern.strikes[wGame.strikeIndex];
                let inDangerZone = false;

                currentStrike.bot.forEach(dangerX => {
                    if (Math.abs(wPlayer.x - dangerX) <= CONFIG.player.hitBot) inDangerZone = true;
                });
                currentStrike.top.forEach(dangerX => {
                    if (Math.abs(wPlayer.x - dangerX) <= CONFIG.player.hitTop) inDangerZone = true;
                });

                let isHit = currPattern.crack ? !inDangerZone : inDangerZone;

                if (isHit) {
                    // 🌟 觸發特效：每次被打中都從第 0 幀開始播
                    wSprites.hitEffect.active = true;
                    wSprites.hitEffect.curr = 0;
                    wSprites.hitEffect.tick = 0;

                    wSprites.hitEffect.hitX = wPlayer.x;
                    // 同時鎖定 Y 軸，這樣就算之後王飄高了，特效依然在原地爆炸
                    wSprites.hitEffect.hitY = CONFIG.pos.floorY - 70;

                    if (currentStrike.noDeduct) {
                        wGame.flashRed = 500;
                        will_updateUI("此被擊中次數不增加", "#f39c12", " ");
                    } else {
                        wGame.hits++;
                        wGame.flashRed = 500;

                        wGame.targetHp = 1204;
                        wGame.healTimer = 600;

                        const hitHud = document.getElementById('ms-hit-text');
                        if (hitHud) hitHud.innerText = `被擊中次數: ${wGame.hits}`;
                    }
                }
            }
            if (wGame.timer <= 0) {
                wGame.phase = 'idle';
                wGame.timer = CONFIG.time.idle;
                // 🌟 這裡保持乾淨！不要在這裡洗掉文字，讓提示文字可以「活過」接下來的 300ms 
            }
        }
        else if (wGame.phase === 'idle' && wGame.timer <= 0) {
            // ============================================
            // 🌟 核心修正：搬到這裡！等 300ms 空窗期「結束」，下一波蜘蛛腳準備出來前才洗掉文字
            // ============================================
            let currPattern = WILL_PATTERNS[wGame.currentPatternIdx];
            let qNumStr = wSettings.endless ? `${wGame.questionsAnswered + 1}` : `${wGame.questionsAnswered + 1}/${wGame.totalQuestions}`;
            let hintStr = will_getHintText(currPattern);
            will_updateUI(`第 ${qNumStr} 題`, "white", hintStr);

            wGame.strikeIndex++;
            if (wGame.strikeIndex >= currPattern.strikes.length) {
                will_updateUI("✅ 本題結束！", "#2ecc71", " ");
                wGame.phase = 'next_wait';
                wGame.timer = 1000;
            } else {
                wGame.phase = 'warn';
                wGame.timer = CONFIG.time.warn;
                wSprites.legTop.curr = 0;
                wSprites.legBot.curr = 0;
                wSprites.legTop.tick = 0;
                wSprites.legBot.tick = 0;
            }
        }
        else if (wGame.phase === 'next_wait' && wGame.timer <= 0) {
            will_nextQuestion();
        }
    }
}

function will_draw() {
    wCtx.clearRect(0, 0, wCanvas.width, wCanvas.height);
    wCtx.imageSmoothingEnabled = true;
    wCtx.imageSmoothingQuality = 'high';

    const renderScale = 1 * CONFIG.camera.zoom;

    let cameraX = wPlayer.x - ((wCanvas.width / renderScale) / 2);
    let maxCameraX = WORLD_W - (wCanvas.width / renderScale);
    cameraX = Math.max(0, Math.min(Math.max(0, maxCameraX), cameraX));

    let focusY = CONFIG.pos.floorY - 120;
    let cameraY = focusY - ((wCanvas.height / renderScale) / 2);
    let maxCameraY = WORLD_H - (wCanvas.height / renderScale);
    cameraY = Math.max(0, Math.min(Math.max(0, maxCameraY), cameraY));

    wCtx.save();
    wCtx.scale(renderScale, renderScale);
    wCtx.translate(-cameraX, -cameraY);

    let currPattern = WILL_PATTERNS[wGame.currentPatternIdx] || WILL_PATTERNS[0];
    let bgImg = (wGame.phase !== 'ready' && wGame.phase !== 'victory' && wGame.phase !== 'stopped' && currPattern.crack) ? wAssets.bgCrack : wAssets.bgSmooth;
    if (bgImg.complete && bgImg.naturalWidth > 0) {
        wCtx.drawImage(bgImg, 0, 0, WORLD_W, WORLD_H);
    }

    if (wGame.phase !== 'ready' && wGame.phase !== 'victory' && wGame.phase !== 'stopped' && currPattern.crack) {
        will_drawSprite(wCtx, wAssets.crack, wSprites.crack, CONFIG.pos.crackX, CONFIG.pos.crackY, CONFIG.scale.crack, false, 'center');
    }

    // 🌟 將原本寫死的 WORLD_CENTER 改成 wBoss.x，並加上轉身機制
    let isBossFlipped = (wBoss.facing === 'right'); // 假設你的王圖預設是面向左
    will_drawSprite(wCtx, wAssets.boss, wSprites.boss, wBoss.x, CONFIG.pos.bossY, CONFIG.scale.boss, isBossFlipped, 'bottom-center');

    if ((wGame.phase === 'warn' || wGame.phase === 'strike' || wGame.phase === 'idle') && wGame.strikeIndex < currPattern.strikes.length) {
        let currentStrike = currPattern.strikes[wGame.strikeIndex];
        currentStrike.top.forEach(xPos => {
            will_drawSprite(wCtx, wAssets.legTop, wSprites.legTop, xPos + CONFIG.pos.legTopOffsetX, CONFIG.pos.legTopY, CONFIG.scale.legTop, false, 'top-center');
        });
        currentStrike.bot.forEach(xPos => {
            will_drawSprite(wCtx, wAssets.legBot, wSprites.legBot, xPos + CONFIG.pos.legBotOffsetX, CONFIG.pos.legBotY, CONFIG.scale.legBot, false, 'bottom-center');
        });
    }

    //if (!(wGame.flashRed > 0 && Math.floor(wGame.flashRed / 100) % 2 === 0)) {
    let isMoving = (wKeys.ArrowLeft || wKeys.ArrowRight || wKeys.a || wKeys.d || mTouchLeft || mTouchRight);
    let pImg = isMoving ? wAssets.pWalk : wAssets.pIdle;
    let pCfg = isMoving ? wSprites.pWalk : wSprites.pIdle;
    let isFlipped = CONFIG.player.nativeFacingLeft ? (wPlayer.facing === 'right') : (wPlayer.facing === 'left');
    will_drawSprite(wCtx, pImg, pCfg, wPlayer.x, CONFIG.pos.floorY, CONFIG.scale.player, isFlipped, 'bottom-center');
    //}

    // ============================================
    // 🌟 貼上這段：畫出受擊特效
    // ============================================
    if (wSprites.hitEffect.active) {
        // 使用 'center' 對齊，並將 Y 軸設定在 floorY - 70 (大約是玩家身體中心點)
        will_drawSprite(wCtx, wAssets.hitEffect, wSprites.hitEffect, wSprites.hitEffect.hitX, wSprites.hitEffect.hitY, CONFIG.scale.hitEffect, false, 'center');
    }

    wCtx.restore();

    if (wGame.phase !== 'stopped') {
        const hpBar = document.getElementById('ms-hp-bar');
        const hpText = document.getElementById('ms-hp-text');
        if (hpBar) hpBar.style.width = `${(wGame.currentHp / wGame.maxHp) * 100}%`;
        if (hpText) hpText.innerText = Math.floor(wGame.currentHp).toLocaleString();
    }

    /*if (wGame.flashRed > 0) {
        wCtx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        wCtx.fillRect(0, 0, wCanvas.width, wCanvas.height);
    }*/
}

function will_gameLoop(timestamp) {
    if (typeof willGameActive !== 'undefined' && !willGameActive) return;
    if (!wLastTime) wLastTime = timestamp;
    
    const dt = timestamp - wLastTime;
    wLastTime = timestamp;

    if (dt > 0 && dt < 100) {
        will_update(dt);
    }

    will_draw();
    requestAnimationFrame(will_gameLoop);
}


// ==========================================
// 💍 飾品強化模擬器邏輯 (終極淨化 100% 邏輯版)
// ==========================================

// 1. 建立飾品資料庫
const acc_items = [
    { name: "請選擇飾品", mat: "", isPlaceholder: true }, 
    { name: "支配者墜飾", mat: "扭曲的時間碎片" },
    { name: "口紅控制器標誌", mat: "失去光芒的核心碎片" },
    { name: "充滿魔力的眼罩", mat: "破滅的劍碎片" },
    { name: "巨大的恐怖", mat: "巨大的恐怖" }, 
    { name: "黑色光芒屠殺者：劍士", mat: "黑色光芒的殘骸" },
    { name: "黑色光芒屠殺者：法師", mat: "黑色光芒的殘骸" },
    { name: "黑色光芒屠殺者：弓箭手", mat: "黑色光芒的殘骸" },
    { name: "黑色光芒屠殺者：盜賊", mat: "黑色光芒的殘骸" },
    { name: "黑色光芒屠殺者：海盜", mat: "黑色光芒的殘骸" },
    { name: "被詛咒的紅魔導書", mat: "破碎的鏡子碎片" },
    { name: "被詛咒的藍魔導書", mat: "破碎的鏡子碎片" },
    { name: "苦痛的根源", mat: "苦痛的根源" },
    { name: "指揮官力量耳環", mat: "指揮官力量耳環" },
    { name: "創世胸章", mat: "創世與破壞的氣息" } 
];

// 2. 預設機率表
const acc_default_probs = [
    [100, 0, 0, 0],   // +0 » +1 
    [60, 40, 0, 0],   // +1 » +2 
    [30, 70, 0, 0],   // +2 » +3 
    [20, 80, 0, 0],   // +3 » +4 
    [16, 84, 0, 0],   // +4 » +5 
    [12, 88, 0, 0],   // +5 » +6 
    [10, 90, 0, 0],   // +6 » +7 
    [8, 92, 0, 0],    // +7 » +8
    [4, 96, 0, 0],    // +8 » +9
    [3, 97, 0, 0]     // +9 » +10
];

// 3. 紋章資料庫
const acc_emblems = [
    "Lv.1 殘忍的紋章", 
    "Lv.1 強力紋章", 
    "Lv.1 神聖紋章", 
    "Lv.1 征服紋章", 
    "Lv.1 機靈紋章", 
    "Lv.1 銳利紋章"
];

const acc_sfxSuccess = new Audio('assets/Enchant.wav'); 
const acc_sfxFail = new Audio('assets/EnchantFail.mp3');

// 狀態變數
let acc_current_emblem = ""; 
let acc_selected_idx = 0; 
let acc_stars = 0;
let acc_attempts = 0;
let acc_successes = 0;
let acc_fails = 0;
let acc_isAnimating = false;
let acc_isMuted = false;
let acc_current_level_attempts = 0; 
let acc_stats_history = Array.from({length: 10}, () => ({ attempts: 0, fails: 0 }));

function acc_toggleSound() {
    acc_isMuted = !acc_isMuted;
    let btn = document.getElementById('btn-sound-toggle-acc');
    if (btn) {
        btn.innerText = acc_isMuted ? "🔇 音效：關閉" : "🔊 音效：開啟";
        btn.className = acc_isMuted ? "btn-sound muted" : "btn-sound";
    }
    if (typeof gtag === 'function') {
        gtag('event', 'toggle_sound', { 'simulator': 'acc_enhance', 'sound_status': acc_isMuted ? 'off' : 'on' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const selectElem = document.getElementById('acc-item-select');
    if (selectElem) {
        let html = '';
        acc_items.forEach((item, index) => {
            html += `<option value="${index}" ${index === acc_selected_idx ? 'selected' : ''}>${item.name}</option>`;
        });
        selectElem.innerHTML = html;
    }
    acc_forceStateChange();
});

function acc_forceStateChange() {
    if (acc_isAnimating) return;
    acc_selected_idx = parseInt(document.getElementById('acc-item-select').value) || 0;
    
    let starSel = document.getElementById('acc-star-select');

    if (acc_items[acc_selected_idx].isPlaceholder) {
        acc_stars = 0;
        acc_current_emblem = "";
        if (starSel) starSel.value = "0";
    } else {
        acc_stars = parseInt(starSel ? starSel.value : 0) || 0;
        acc_current_emblem = ""; 
    }

    if (acc_stars < 10 && starSel) {
        let opt10 = starSel.querySelector('option[value="10"]');
        if (opt10) opt10.remove();
    }

    acc_current_level_attempts = 0;

    if (acc_stars < 10) {
        let inS = document.getElementById('acc-in-s');
        let inM = document.getElementById('acc-in-m');
        let inD = document.getElementById('acc-in-d');
        let inR = document.getElementById('acc-in-r');
        
        if (inS) inS.value = acc_default_probs[acc_stars][0];
        if (inM) inM.value = acc_default_probs[acc_stars][1];
        if (inD) inD.value = acc_default_probs[acc_stars][2];
        if (inR) inR.value = acc_default_probs[acc_stars][3];
    }
    acc_updateUI();
}

function acc_customProbChange() {
    let inS = document.getElementById('acc-in-s');
    if (inS && inS.value !== "") {
        let val = parseFloat(inS.value);
        if (val > 100) {
            inS.value = 100; // 超過 100 強制降回 100
        } else if (val < 0) {
            inS.value = 0;   // 避免玩家輸入負數來搞破壞
        }
    }
    acc_updateUI();
}

function acc_updateUI() {
    let item = acc_items[acc_selected_idx];
    const statDetailElem = document.getElementById('acc-stat-detail');
    const nameDisp = document.getElementById('acc-equip-name-display');
    const matDisp = document.getElementById('acc-mat-name-display'); 
    const lvTextElem = document.getElementById('acc-ui-lv-text'); 

    if (item.isPlaceholder) {
        if (nameDisp) { nameDisp.innerText = "基本"; nameDisp.className = 'equip-name acc-equip-placeholder'; nameDisp.style.color = ''; }
        if (matDisp) { matDisp.innerText = "材料"; matDisp.className = 'equip-name acc-equip-placeholder'; matDisp.style.color = ''; }

        document.getElementById('acc-ui-img-main').src = "";
        document.getElementById('acc-ui-img-mat').src = "";
        
        let starOverlay = document.getElementById('acc-overlay-star');
        if (starOverlay) starOverlay.parentElement.style.display = 'none';
        if (document.getElementById('acc-star-select')) document.getElementById('acc-star-select').value = "0";
        
        if (lvTextElem) lvTextElem.innerHTML = `<span>-</span> <span class="acc-lv-arrow">»</span> <span class="lv-next" style="color: #f3724c;">-</span>`;
        
        if (statDetailElem) {
            statDetailElem.style.removeProperty('flex-direction');
            statDetailElem.style.removeProperty('align-items');
            statDetailElem.style.removeProperty('justify-content');
            statDetailElem.style.removeProperty('gap');
            statDetailElem.innerHTML = `
                <div class="acc-placeholder-text">
                    <div class="acc-placeholder-main">可使用兩個相同的飾品進行星力數值的強化。</div>
                    <div class="acc-placeholder-sub">請在上方選單說明中確認詳細條件。</div>
                </div>`;
        }

        ['s', 'm', 'd', 'r'].forEach(id => {
            if (document.getElementById(`acc-ui-prob-${id}`)) document.getElementById(`acc-ui-prob-${id}`).innerText = "-";
            if (document.getElementById(`acc-in-${id}`)) document.getElementById(`acc-in-${id}`).value = "0";
        });

        if (document.getElementById('btn-acc-action')) document.getElementById('btn-acc-action').disabled = true;
        let statsContainer = document.getElementById('acc-stats-container');
        if (statsContainer) statsContainer.innerHTML = "";
        return; 
    }

    if (nameDisp) { nameDisp.innerText = item.name; nameDisp.classList.remove('acc-equip-placeholder'); }
    if (matDisp) { matDisp.innerHTML = `${item.mat}`; matDisp.classList.remove('acc-equip-placeholder'); }
    
    let starOverlay = document.getElementById('acc-overlay-star');
    if (acc_stars >= 10) {
        document.getElementById('acc-ui-img-main').src = `assets/equipment/紋章${item.name}.png`;
        if (starOverlay) { starOverlay.parentElement.style.display = 'flex'; starOverlay.innerText = 'M'; }
    } else {
        document.getElementById('acc-ui-img-main').src = `assets/equipment/${item.name}.png`;
        if (starOverlay) { starOverlay.parentElement.style.display = 'flex'; starOverlay.innerText = acc_stars; }
    }
    
    document.getElementById('acc-ui-img-mat').src = `assets/equipment/${item.mat}.png`;
    document.getElementById('acc-ui-img-main').style.display = '';
    document.getElementById('acc-ui-img-mat').style.display = '';

    let starSel = document.getElementById('acc-star-select');
    if (starSel) {
        if (acc_stars === 10 && !starSel.querySelector('option[value="10"]')) {
            starSel.insertAdjacentHTML('beforeend', `<option value="10">+ 10</option>`);
        }
        starSel.value = acc_stars;
    }
    
    let nextStarText = acc_stars >= 10 ? "MAX" : `+${acc_stars + 1}`;
    if (lvTextElem) lvTextElem.innerHTML = `+<span id="acc-star-curr">${acc_stars}</span> <span class="acc-lv-arrow">»</span> <span class="lv-next" style="color: #f3724c;"><span id="acc-star-next">${nextStarText}</span></span>`;

    let isCmd = (item.name === "指揮官力量耳環" || item.name === "創世胸章"); 
    let cumulative_normal = [0, 195000, 520000, 1170000, 2340000, 3900000, 5460000, 7020000, 8580000, 10140000, 11700000];
    let cumulative_cmd = [0, 292500, 780000, 1755000, 3510000, 5850000, 8190000, 10530000, 12870000, 15210000, 17550000];
    let inc_normal = [195000, 325000, 650000, 1170000, 1560000, 1560000, 1560000, 1560000, 1560000, 1560000];
    let inc_cmd = [292500, 487500, 975000, 1755000, 2340000, 2340000, 2340000, 2340000, 2340000, 2340000];

    let current_cumulative = isCmd ? cumulative_cmd[acc_stars] : cumulative_normal[acc_stars];
    let increase = (acc_stars < 10) ? (isCmd ? inc_cmd[acc_stars] : inc_normal[acc_stars]) : 0;
    let total_curr = current_cumulative + increase; 
    
    if (statDetailElem) {
        statDetailElem.style.setProperty('flex-direction', 'column', 'important');
        statDetailElem.style.setProperty('align-items', 'flex-start', 'important');
        statDetailElem.style.setProperty('justify-content', 'center', 'important');
        statDetailElem.style.setProperty('gap', '8px', 'important');

        let statHtml = `
            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                <span class="acc-stat-title">最大傷害</span> 
                <div class="acc-stat-values">
                    <span class="acc-stat-total">${total_curr.toLocaleString()}</span>
                    <span class="acc-stat-base">(${current_cumulative.toLocaleString()} + ${increase.toLocaleString()})</span>
                    ${acc_stars < 10 ? `<span class="acc-stat-up">(▲${increase.toLocaleString()})</span>` : ''}
                </div>
            </div>`;

        if (acc_stars >= 10 && acc_current_emblem) {
            statHtml += `
            <div style="width: 100%; display: flex; justify-content: flex-start; align-items: center;">
                <span class="acc-stat-title" style="color: #4a5468; display: flex; align-items: center;">
                    <svg style="width:16px; height:16px; margin-right:6px;" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="4" fill="#636e82"/>
                        <path d="M12 6.5 L17.5 12 L12 17.5 L6.5 12 Z" fill="none" stroke="#fff" stroke-width="1.8"/>
                        <circle cx="12" cy="12" r="2.5" fill="#fff"/>
                    </svg>
                    ${acc_current_emblem}
                </span> 
            </div>`;
        }
        statDetailElem.innerHTML = statHtml;
    }

    let inS = document.getElementById('acc-in-s');
    let inM = document.getElementById('acc-in-m');
    let inD = document.getElementById('acc-in-d');
    let inR = document.getElementById('acc-in-r');

    let p_s = inS ? parseFloat(inS.value) || 0 : 0;
    let p_m = Math.max(0, 100 - p_s); 
    let p_d = inD ? parseFloat(inD.value) || 0 : 0;
    let p_r = inR ? parseFloat(inR.value) || 0 : 0;

    if (acc_stars >= 10) { p_s = 0; p_m = 0; p_d = 0; p_r = 0; }

    if (inM && acc_stars < 10) inM.value = p_m.toFixed(0); 

    if (document.getElementById('acc-ui-prob-s')) document.getElementById('acc-ui-prob-s').innerText = p_s.toFixed(2) + "%";
    if (document.getElementById('acc-ui-prob-m')) document.getElementById('acc-ui-prob-m').innerText = p_m.toFixed(2) + "%";
    if (document.getElementById('acc-ui-prob-d')) document.getElementById('acc-ui-prob-d').innerText = p_d.toFixed(2) + "%";
    if (document.getElementById('acc-ui-prob-r')) document.getElementById('acc-ui-prob-r').innerText = p_r.toFixed(2) + "%";

    if (document.getElementById('btn-acc-action')) document.getElementById('btn-acc-action').disabled = (acc_stars >= 10 || acc_isAnimating);

    let statsContainer = document.getElementById('acc-stats-container');
    if (statsContainer && !item.isPlaceholder) {
        let statsHtmlContent = `
            <div class="acc-stats-header">
                <div>各星級消耗 <span class="acc-stats-hint">(隱藏未點擊)</span></div>
                <div class="acc-stats-hint-ev">理論期望</div>
            </div>
            <div class="acc-stats-body">
        `;
        
        for (let i = 0; i < 10; i++) {
            let s_rate = acc_default_probs[i][0];
            let ev = s_rate > 0 ? (100 / s_rate).toFixed(2) : "∞";
            let hist = acc_stats_history[i];
            
            if (hist.attempts > 0 || i === acc_stars) {
                let isCurrent = (i === acc_stars) ? 'current-lv' : '';
                
                statsHtmlContent += `
                <div class="acc-stat-hist-row ${isCurrent}">
                    <div class="acc-hist-lv"><span class="lv-num">${i}</span><span class="arr">»</span><span class="lv-next-num">${i+1}</span></div>
                    <div class="acc-hist-main">嘗試 <span class="val-try">${hist.attempts}</span> 次</div>
                    <div class="acc-hist-ev">${ev}</div>
                </div>`;
            }
        }
        statsHtmlContent += `</div>
        <div class="acc-stats-footer">
            <span>總嘗試：<span class="val-try">${acc_attempts}</span></span>
            <span>失敗：<span class="val-fail">${acc_fails}</span></span>
        </div>`;
        
        statsContainer.innerHTML = statsHtmlContent;
    }
}

function acc_executeEnhance() {
    if (acc_items[acc_selected_idx].isPlaceholder || acc_isAnimating || acc_stars >= 10) return;
    acc_isAnimating = true;

    let inS = document.getElementById('acc-in-s');
    let p_s = inS ? parseFloat(inS.value) || 0 : 0;

    let roll = Math.random() * 100;
    let isSuccess = false, isMaintain = false, isDecrease = false, isReset = false;

    if (roll < p_s) { isSuccess = true; }
    else { isMaintain = true; }

    acc_attempts++;
    acc_current_level_attempts++;
    let oldStar = acc_stars;
    
    if (oldStar < 10) {
        acc_stats_history[oldStar].attempts++;
        if (!isSuccess) {
            acc_stats_history[oldStar].fails++;
        }
    }
    
    if (!acc_isMuted) {
        let sfx = isSuccess ? acc_sfxSuccess : acc_sfxFail;
        sfx.currentTime = 0;
        sfx.play().catch(e => console.log("音效未啟用", e));
    }

    let animOverlay = document.getElementById('acc-anim-overlay');
    
    if (animOverlay) {
        animOverlay.style.display = '';
        animOverlay.classList.add('active');

        setTimeout(() => {
            animOverlay.classList.remove('active');
            
            if (isSuccess) { 
                acc_stars++; acc_successes++; 
                if (acc_stars === 10) {
                    acc_current_emblem = acc_emblems[Math.floor(Math.random() * acc_emblems.length)];
                }
            }
            else if (isMaintain) { acc_fails++; }
            
            let statusObj = { isSuccess, isMaintain, isDecrease, isReset };
            acc_showResult(statusObj, oldStar, acc_stars);
        }, 200); 
    } else {
        if (isSuccess) { 
            acc_stars++; acc_successes++; 
            if (acc_stars === 10) acc_current_emblem = acc_emblems[Math.floor(Math.random() * acc_emblems.length)];
        }
        else if (isMaintain) { acc_fails++; }
        
        let statusObj = { isSuccess, isMaintain, isDecrease, isReset };
        acc_showResult(statusObj, oldStar, acc_stars);
    }

    if (typeof gtag === 'function') {
        gtag('event', 'use_simulator', { 'simulator_name': 'acc_enhance' });
    }
}

function acc_showResult(statusObj, oldStar, newStar) {
    let modal = document.getElementById('acc-result-modal');
    if (!modal) return;

    let titleElem = document.getElementById('acc-m-title');
    let colorHex = "#4a5468"; 
    let titleStr = "";

    if (statusObj.isSuccess) { titleStr = "強化成功"; colorHex = "#4a5468"; }
    else if (statusObj.isMaintain) { titleStr = "等級維持"; colorHex = "#4a5468"; }
    else if (statusObj.isDecrease) { titleStr = "強化下降"; colorHex = "#c0392b"; }
    else if (statusObj.isReset) { titleStr = "裝備破壞"; colorHex = "#8e44ad"; }

    titleElem.innerText = titleStr;
    titleElem.style.backgroundColor = colorHex;

    let item = acc_items[acc_selected_idx];
    let isCmd = (item.name === "指揮官力量耳環" || item.name === "創世胸章"); 
    let cumulative_normal = [0, 195000, 520000, 1170000, 2340000, 3900000, 5460000, 7020000, 8580000, 10140000, 11700000];
    let cumulative_cmd = [0, 292500, 780000, 1755000, 3510000, 5850000, 8190000, 10530000, 12870000, 15210000, 17550000];
    let inc_normal = [195000, 325000, 650000, 1170000, 1560000, 1560000, 1560000, 1560000, 1560000, 1560000];
    let inc_cmd = [292500, 487500, 975000, 1755000, 2340000, 2340000, 2340000, 2340000, 2340000, 2340000];

    let emblemHtml = '';
    if (newStar >= 10 && acc_current_emblem) {
        emblemHtml = `
        <div style="width: 100%; display: flex; justify-content: flex-start; align-items: center; margin-top: 8px;">
            <span class="acc-stat-title" style="color: #4a5468; display: flex; align-items: center;">
                <svg style="width:16px; height:16px; margin-right:6px;" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#636e82"/>
                    <path d="M12 6.5 L17.5 12 L12 17.5 L6.5 12 Z" fill="none" stroke="#fff" stroke-width="1.8"/>
                    <circle cx="12" cy="12" r="2.5" fill="#fff"/>
                </svg>
                ${acc_current_emblem}
            </span> 
        </div>`;
    }

    let statHtml = '';
    if (statusObj.isSuccess) {
        let oldCumulative = isCmd ? cumulative_cmd[oldStar] : cumulative_normal[oldStar];
        let increase = isCmd ? inc_cmd[oldStar] : inc_normal[oldStar];
        let newTotal = isCmd ? cumulative_cmd[newStar] : cumulative_normal[newStar];
        
        statHtml = `
            <div class="acc-stat-container acc-modal-stat">
                <div class="acc-stat-wrapper" style="flex-direction: column; align-items: flex-start; gap: 0;">
                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                        <span class="acc-stat-title">最大傷害</span> 
                        <div class="acc-stat-values">
                            <span class="acc-stat-total">${newTotal.toLocaleString()}</span>
                            <span class="acc-stat-base">(${oldCumulative.toLocaleString()} + ${increase.toLocaleString()})</span>
                            <span class="acc-stat-up">(▲${increase.toLocaleString()})</span>
                        </div>
                    </div>
                    ${emblemHtml}
                </div>
            </div>`;
    } else {
        let currentCumulative = isCmd ? cumulative_cmd[newStar] : cumulative_normal[newStar];
        
        statHtml = `
            <div class="acc-stat-container acc-modal-stat">
                <div class="acc-stat-wrapper" style="flex-direction: column; align-items: flex-start; gap: 0;">
                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                        <span class="acc-stat-title">最大傷害</span> 
                        <div class="acc-stat-values">
                            <span class="acc-stat-total">${currentCumulative.toLocaleString()}</span>
                            <span class="acc-stat-base">(${currentCumulative.toLocaleString()} + 0)</span>
                        </div>
                    </div>
                    ${emblemHtml}
                </div>
            </div>`;
    }
    
    if (document.getElementById('acc-m-white-mid')) document.getElementById('acc-m-white-mid').innerHTML = statHtml;

    let mImg = document.getElementById('acc-m-img');
    let mStarTag = document.getElementById('acc-m-star-tag');

    if (newStar >= 10) {
        if (mImg) mImg.src = `assets/equipment/紋章${item.name}.png`;
        if (mStarTag) {
            mStarTag.parentElement.style.display = 'flex';
            mStarTag.innerText = 'M';
        }
    } else {
        if (mImg) mImg.src = `assets/equipment/${item.name}.png`;
        if (mStarTag) {
            mStarTag.parentElement.style.display = 'flex';
            mStarTag.innerText = newStar;
        }
    }
    
    if (mImg) mImg.style.display = ''; 
    if (document.getElementById('acc-m-equip-name')) document.getElementById('acc-m-equip-name').innerText = item.name;
    
    let attemptsElem = document.getElementById('acc-m-attempts-text');
    if (attemptsElem) {
        attemptsElem.innerHTML = `累積強化 <span class="acc-m-attempts-num">${acc_current_level_attempts}</span> 次`;
    }

    if (document.getElementById('acc-m-old-star')) document.getElementById('acc-m-old-star').innerText = oldStar;
    if (document.getElementById('acc-m-new-star')) document.getElementById('acc-m-new-star').innerText = newStar;
    
    let newColor = (statusObj.isSuccess || statusObj.isMaintain) ? "#f3724c" : (statusObj.isDecrease || statusObj.isReset ? "#c0392b" : "#7f8c8d");
    if (document.getElementById('acc-m-new-color')) document.getElementById('acc-m-new-color').style.color = newColor;

    if (oldStar !== newStar) {
        acc_current_level_attempts = 0; 
        if (newStar < 10) {
            let inS = document.getElementById('acc-in-s');
            let inM = document.getElementById('acc-in-m');
            let inD = document.getElementById('acc-in-d');
            let inR = document.getElementById('acc-in-r');
            if(inS) inS.value = acc_default_probs[newStar][0];
            if(inM) inM.value = acc_default_probs[newStar][1];
            if(inD) inD.value = acc_default_probs[newStar][2];
            if(inR) inR.value = acc_default_probs[newStar][3];
        }
    }

    modal.classList.add('active');
    acc_updateUI();
}

function acc_closeResult() {
    let modal = document.getElementById('acc-result-modal');
    if (modal) modal.classList.remove('active');
    acc_isAnimating = false;
    acc_updateUI();
}

function acc_reset() {
    if (acc_isAnimating) return;
    acc_stars = 0;
    acc_attempts = 0;
    acc_successes = 0;
    acc_fails = 0;
    acc_current_emblem = ""; 
    acc_current_level_attempts = 0;
    acc_stats_history = Array.from({length: 10}, () => ({ attempts: 0, fails: 0 }));
    
    let starSel = document.getElementById('acc-star-select');
    if (starSel) {
        let opt10 = starSel.querySelector('option[value="10"]');
        if (opt10) opt10.remove(); 
        starSel.value = "0";
    }
    acc_forceStateChange();
}

// ==========================================
// 🛡️ 紋章強化模擬器邏輯 (Emblem Enhance)
// ==========================================

// 1. 屬性資料庫 (Lv 1 ~ 15)
const emb_stats_data = [
    { lv: 1, maxDmg: 0, critDmg: 5.0 },
    { lv: 2, maxDmg: 0, critDmg: 8.0 },
    { lv: 3, maxDmg: 0, critDmg: 11.0 },
    { lv: 4, maxDmg: 0, critDmg: 15.0 },
    { lv: 5, maxDmg: 0, critDmg: 20.0 },
    { lv: 6, maxDmg: 100000, critDmg: 20.8 },
    { lv: 7, maxDmg: 250000, critDmg: 21.6 },
    { lv: 8, maxDmg: 420000, critDmg: 22.4 },
    { lv: 9, maxDmg: 600000, critDmg: 23.2 },
    { lv: 10, maxDmg: 960000, critDmg: 24.0 },
    { lv: 11, maxDmg: 1710000, critDmg: 24.8 },
    { lv: 12, maxDmg: 2760000, critDmg: 25.6 },
    { lv: 13, maxDmg: 4260000, critDmg: 26.4 },
    { lv: 14, maxDmg: 6660000, critDmg: 27.2 },
    { lv: 15, maxDmg: 12000000, critDmg: 28.0 }
];

// 2. 升級機率與材料資料庫 (升級 "前往" 該等級所需)
const emb_rate_data = [
    { baseRate: 80, maxMat: 2, matName: "紋章的痕跡" },       // 1->2
    { baseRate: 60, maxMat: 2, matName: "紋章的痕跡" },       // 2->3
    { baseRate: 30, maxMat: 4, matName: "紋章的痕跡" },       // 3->4
    { baseRate: 20, maxMat: 5, matName: "紋章的痕跡" },       // 4->5
    { baseRate: 20, maxMat: 5, matName: "紋章的痕跡" },       // 5->6
    { baseRate: 15, maxMat: 5, matName: "紋章的痕跡" },       // 6->7
    { baseRate: 100, maxMat: 1, matName: "混沌紋章的痕跡" },   // 7->8
    { baseRate: 100, maxMat: 1, matName: "混沌紋章的痕跡" },   // 8->9
    { baseRate: 50, maxMat: 2, matName: "混沌紋章的痕跡" },    // 9->10
    { baseRate: 25, maxMat: 3, matName: "混沌紋章的痕跡" },    // 10->11
    { baseRate: 20, maxMat: 3, matName: "混沌紋章的痕跡" },    // 11->12
    { baseRate: 15, maxMat: 3, matName: "混沌紋章的痕跡" },    // 12->13
    { baseRate: 10, maxMat: 4, matName: "混沌紋章的痕跡" },    // 13->14
    { baseRate: 5, maxMat: 6, matName: "混沌紋章的痕跡" }      // 14->15
];

const emb_sfxSuccess = new Audio('assets/Enchant.wav'); 
const emb_sfxFail = new Audio('assets/Enchant.wav'); // TODO: 未來若有失敗音效可替換此檔名

// 狀態變數
let emb_lv = 1; 
let emb_mat_count = 1;
let emb_isAnimating = false;
let emb_attempts = 0;
let emb_successes = 0;
let emb_fails = 0;
let emb_current_level_attempts = 0;
let emb_mats_normal_used = 0;
let emb_mats_chaos_used = 0;
let emb_isMuted = false; 
let emb_stats_history = Array.from({length: 15}, () => ({ attempts: 0, fails: 0, mats: 0, lastMatCount: 1 }));

function emb_toggleSound() {
    emb_isMuted = !emb_isMuted;
    let btn = document.getElementById('btn-sound-toggle-emb');
    if (btn) {
        btn.innerText = emb_isMuted ? "🔇 音效：關閉" : "🔊 音效：開啟";
        btn.className = emb_isMuted ? "btn-sound muted" : "btn-sound";
    }
    if (typeof gtag === 'function') {
        gtag('event', 'toggle_sound', { 'simulator': 'emb_enhance', 'sound_status': emb_isMuted ? 'off' : 'on' });
    }
}

document.addEventListener('DOMContentLoaded', () => { emb_updateUI(); });

function emb_forceStateChange() {
    if (emb_isAnimating) return;
    
    let selectElem = document.getElementById('emb-lv-select');
    if (!selectElem) return; // 加入防呆檢查

    emb_lv = parseInt(selectElem.value) || 1;
    
    // 如果手動選擇的等級小於 15，確保選單裡沒有 Lv.15
    if (emb_lv < 15) {
        let opt15 = selectElem.querySelector('option[value="15"]');
        if (opt15) opt15.remove();
    }
    
    emb_mat_count = 1;
    emb_current_level_attempts = 0;
    emb_updateUI();
}

// ==========================================
// 🔄 紋章模擬器：更新 UI 畫面 (最終純淨版)
// ==========================================
function emb_updateUI() {
    let selectElem = document.getElementById('emb-lv-select');
    if (selectElem) {
        // 動態解鎖 Lv.15 選項
        if (emb_lv === 15 && !selectElem.querySelector('option[value="15"]')) {
            selectElem.insertAdjacentHTML('beforeend', `<option value="15">Lv.15</option>`);
        }
        selectElem.value = emb_lv; // 設定目前選中的值
    }
    
    let currData = emb_stats_data[emb_lv - 1];
    let nextData = emb_lv < 15 ? emb_stats_data[emb_lv] : currData;
    
    // 更新介面數值
    if (document.getElementById('emb-ui-curr-lv')) document.getElementById('emb-ui-curr-lv').innerText = emb_lv;
    
    let diamondLvElem = document.getElementById('emb-ui-diamond-lv');
    let diamondBadgeElem = document.getElementById('emb-ui-diamond-badge');
    
    if (diamondLvElem) diamondLvElem.innerText = emb_lv;
    if (diamondBadgeElem) {
        let doubleClass = emb_lv >= 10 ? ' is-double' : '';
        diamondBadgeElem.className = 'emb-diamond-badge ' + (emb_lv >= 8 ? 'emb-bg-purple' : 'emb-bg-blue') + doubleClass;
    }
    
    let nextLvElem = document.getElementById('emb-ui-next-lv');
    if (nextLvElem) nextLvElem.innerText = emb_lv >= 15 ? "MAX" : (emb_lv + 1);
    
    let statHtml = '';
    if (nextData.maxDmg > 0 || currData.maxDmg > 0) {
        let increase = nextData.maxDmg - currData.maxDmg;
        statHtml += `
            <div class="emb-stat-item">
                <span class="emb-stat-label">最大傷害</span>
                <span class="emb-stat-val">
                    ${nextData.maxDmg.toLocaleString()}
                    ${emb_lv < 15 ? `(<span class="emb-val-highlight">▲${increase.toLocaleString()}</span>)` : ''}
                </span>
            </div>`;
    }
    
    let critInc = (nextData.critDmg - currData.critDmg).toFixed(1);
    statHtml += `
        <div class="emb-stat-item">
            <span class="emb-stat-label">致命攻擊傷害</span>
            <span class="emb-stat-val">
                ${nextData.critDmg.toFixed(1)}%
                ${emb_lv < 15 ? `(<span class="emb-val-highlight">▲${critInc}%</span>)` : ''}
            </span>
        </div>`;
        
    if (document.getElementById('emb-ui-stat-list')) document.getElementById('emb-ui-stat-list').innerHTML = statHtml;

    let btnAction = document.getElementById('btn-emb-action');
    let ctrlWrap = document.getElementById('emb-ui-controller-wrap');
    
    if (emb_lv >= 15) {
        if (document.getElementById('emb-ui-prob-s')) document.getElementById('emb-ui-prob-s').innerText = "0%";
        if (document.getElementById('emb-ui-prob-m')) document.getElementById('emb-ui-prob-m').innerText = "0%";
        if (ctrlWrap) ctrlWrap.classList.add('disabled');
        if (btnAction) btnAction.disabled = true;
    } else {
        let rateInfo = emb_rate_data[emb_lv - 1];
        if (document.getElementById('emb-ui-img-mat')) document.getElementById('emb-ui-img-mat').src = `assets/${rateInfo.matName}.png`;
        
        let successRate = Math.min(100, rateInfo.baseRate * emb_mat_count);
        let maintainRate = 100 - successRate;
        
        if (document.getElementById('emb-ui-prob-s')) document.getElementById('emb-ui-prob-s').innerText = successRate + "%";
        if (document.getElementById('emb-ui-prob-m')) document.getElementById('emb-ui-prob-m').innerText = maintainRate + "%";
        
        if (document.getElementById('emb-ui-mat-curr')) document.getElementById('emb-ui-mat-curr').innerText = emb_mat_count;
        if (document.getElementById('emb-ui-mat-max')) document.getElementById('emb-ui-mat-max').innerText = rateInfo.maxMat;
        
        if (ctrlWrap) ctrlWrap.classList.remove('disabled');
        if (btnAction) btnAction.disabled = false;
    }

    // 📊 下方動態統計面板渲染
    let statsContainer = document.getElementById('emb-stats-container');
    if (statsContainer) {
        let statsHtmlContent = `
            <div class="acc-stats-header">
                <div>各星級消耗 <span class="acc-stats-hint">(隱藏未點擊)</span></div>
                <div class="acc-stats-hint-ev">當前期望</div>
            </div>
            <div class="acc-stats-body">
        `;
        
        for (let i = 1; i < 15; i++) {
            let hist = emb_stats_history[i];
            let rateInfo = emb_rate_data[i - 1];
            
            let matToUse = (i === emb_lv) ? emb_mat_count : hist.lastMatCount;
            let currentSuccessRate = Math.min(100, rateInfo.baseRate * matToUse); 
            
            let evText = "∞";
            if (currentSuccessRate > 0) {
                let evAttempts = 100 / currentSuccessRate; 
                let evMats = evAttempts * matToUse;
                
                // 單行期望值，沒有 <br>
                evText = `${evAttempts.toFixed(1)}次 <span style="font-size: 11px; color:#888;">(約${evMats.toFixed(1)}個)</span>`;
            }
            
            if (hist.attempts > 0 || i === emb_lv) {
                let isCurrent = (i === emb_lv) ? 'current-lv' : '';
                
                // 🌟 1. 將網格改為 1fr auto 1fr (左右平分，中間自適應)
                statsHtmlContent += `
                <div class="acc-stat-hist-row ${isCurrent}" style="grid-template-columns: 1fr auto 1fr; align-items: center;">
                    
                    <div class="acc-hist-lv" style="text-align: left;"><span class="lv-num">${i}</span><span class="arr">»</span><span class="lv-next-num">${i+1}</span></div>
                    
                    <div class="acc-hist-main" style="text-align: center;">消耗 <span class="val-try">${hist.mats}</span> 個</div>
                    
                    <div class="acc-hist-ev" style="text-align: right;">${evText}</div>
                    
                </div>`;
            }
        }
        
        // 🌟 完全移除嘗試/成功/失敗，只保留置中的材料總結
        statsHtmlContent += `</div>
        <div style="display: flex; justify-content: center; gap: 25px; font-size: 14px; font-weight: bold; color: #555; margin-top: 15px; margin-bottom: 5px;">
            <div>一般痕跡：<span style="color: #f3724c; font-size: 16px;">${emb_mats_normal_used}</span></div>
            <div>混沌痕跡：<span style="color: #8e44ad; font-size: 16px;">${emb_mats_chaos_used}</span></div>
        </div>`;
        
        statsContainer.innerHTML = statsHtmlContent;
    }
}

function emb_changeMat(amount) {
    if (emb_lv >= 15 || emb_isAnimating) return;
    let max = emb_rate_data[emb_lv - 1].maxMat;
    emb_mat_count += amount;
    if (emb_mat_count < 1) emb_mat_count = 1;
    if (emb_mat_count > max) emb_mat_count = max;
    emb_updateUI();
}

function emb_setMaxMat() {
    if (emb_lv >= 15 || emb_isAnimating) return;
    emb_mat_count = emb_rate_data[emb_lv - 1].maxMat;
    emb_updateUI();
}


function emb_executeEnhance() {
    if (emb_lv >= 15 || emb_isAnimating) return;
    emb_isAnimating = true;

    let rateInfo = emb_rate_data[emb_lv - 1];
    let successRate = Math.min(100, rateInfo.baseRate * emb_mat_count);
    
    let roll = Math.random() * 100;
    let isSuccess = roll < successRate;

    emb_attempts++;
    emb_current_level_attempts++;
    let oldLv = emb_lv;

    emb_stats_history[oldLv].mats += emb_mat_count;

    emb_stats_history[oldLv].lastMatCount = emb_mat_count;

    if (rateInfo.matName === "紋章的痕跡") {
        emb_mats_normal_used += emb_mat_count;
    } else {
        emb_mats_chaos_used += emb_mat_count;
    } 

    emb_stats_history[oldLv].attempts++;
    if (!isSuccess) {
        emb_stats_history[oldLv].fails++;
        emb_fails++;
    }

    if (!emb_isMuted) {
        let sfx = isSuccess ? emb_sfxSuccess : emb_sfxFail; 
        sfx.currentTime = 0;
        sfx.play().catch(e => console.log("音效未啟用", e));
    }

    let animOverlay = document.getElementById('emb-anim-overlay');
    if (animOverlay) {
        animOverlay.style.display = '';
        animOverlay.classList.add('active');

        setTimeout(() => {
            animOverlay.classList.remove('active');
            
            if (isSuccess) { 
                emb_lv++; 
                emb_successes++; 
            }
            emb_showResult(isSuccess, oldLv, emb_lv);
        }, 200); 
    } else {
        if (isSuccess) { emb_lv++; emb_successes++; }
        emb_showResult(isSuccess, oldLv, emb_lv);
    }
}

function emb_showResult(isSuccess, oldLv, newLv) {
    let modal = document.getElementById('emb-result-modal');
    if (!modal) return;

    if (document.getElementById('emb-m-title')) document.getElementById('emb-m-title').innerText = isSuccess ? "紋章強化成功" : "紋章強化失敗";
    if (document.getElementById('emb-m-old-lv')) document.getElementById('emb-m-old-lv').innerText = oldLv;
    if (document.getElementById('emb-m-new-lv')) document.getElementById('emb-m-new-lv').innerText = newLv;
    
    let mDiamondLvElem = document.getElementById('emb-m-diamond-lv');
    let mDiamondBadgeElem = document.getElementById('emb-m-diamond-badge');
    
    if (mDiamondLvElem) mDiamondLvElem.innerText = newLv;
    if (mDiamondBadgeElem) {
        let doubleClass = newLv >= 10 ? ' is-double' : '';
        mDiamondBadgeElem.className = 'emb-diamond-badge ' + (newLv >= 8 ? 'emb-bg-purple' : 'emb-bg-blue') + doubleClass;
    }

    let oldData = emb_stats_data[oldLv - 1];
    let newData = emb_stats_data[newLv - 1];
    let statHtml = '';

    if (oldData.maxDmg > 0 || newData.maxDmg > 0) {
        let increase = newData.maxDmg - oldData.maxDmg;
        statHtml += `
            <div class="emb-m-stat-item">
                <span class="emb-m-stat-label ${isSuccess ? 'success' : ''}">最大傷害</span>
                <span class="emb-m-stat-val ${isSuccess ? 'success-val' : 'fail-val'}">
                    ${isSuccess ? newData.maxDmg.toLocaleString() : oldData.maxDmg.toLocaleString()}
                    ${isSuccess ? `<span>(▲${increase.toLocaleString()})</span>` : ''}
                </span>
            </div>`;
    }

    let critInc = (newData.critDmg - oldData.critDmg).toFixed(1);
    statHtml += `
        <div class="emb-m-stat-item">
            <span class="emb-m-stat-label">致命攻擊傷害</span>
            <span class="emb-m-stat-val ${isSuccess ? 'success-val' : 'fail-val'}">
                ${isSuccess ? newData.critDmg.toFixed(1) : oldData.critDmg.toFixed(1)}%
                ${isSuccess ? `<span>(▲${critInc}%)</span>` : ''}
            </span>
        </div>`;
        
    if (document.getElementById('emb-m-stat-list')) document.getElementById('emb-m-stat-list').innerHTML = statHtml;

    let attemptsElem = document.getElementById('emb-m-attempts-text');
    if (attemptsElem) {
        attemptsElem.innerHTML = `累積強化 <span class="acc-m-attempts-num">${emb_current_level_attempts}</span> 次`;
    }

    let costBox = document.getElementById('emb-m-bottom-cost');
    if (costBox) {
        if (isSuccess) {
            costBox.innerHTML = `1,204 <span>(▲1,204)</span>`;
        } else {
            costBox.innerHTML = `1,204`;
        }
    }

    if (isSuccess) {
        emb_current_level_attempts = 0; 
        emb_mat_count = 1; 
    }

    modal.classList.add('active');
    emb_updateUI();
}

function emb_closeResult() {
    let modal = document.getElementById('emb-result-modal');
    if (modal) modal.classList.remove('active');
    emb_isAnimating = false;
    emb_updateUI();
}

function emb_reset() {
    if (emb_isAnimating) return;

    // 1. 重設 JavaScript 變數
    emb_lv = 1;
    emb_mat_count = 1;
    emb_attempts = 0;
    emb_successes = 0;
    emb_fails = 0;
    emb_current_level_attempts = 0;
    emb_mats_normal_used = 0;
    emb_mats_chaos_used = 0; 
    
    // 🌟 同步更新：確保清除狀態時，這個新欄位也回到預設值 1
    emb_stats_history = Array.from({length: 15}, () => ({ attempts: 0, fails: 0, mats: 0, lastMatCount: 1 }));
    
    let selectElem = document.getElementById('emb-lv-select');
    if (selectElem) {
        selectElem.value = "1"; // 強制選單歸零回 Lv.1
        
        // 確保 Lv.15 選項被移除
        let opt15 = selectElem.querySelector('option[value="15"]');
        if (opt15) opt15.remove();
    }
    
    // 3. 最後再呼叫更新畫面
    emb_forceStateChange();
}
