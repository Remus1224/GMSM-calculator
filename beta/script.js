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
    if(document.getElementById('sim-million-reset')) document.getElementById('sim-million-reset').checked = false;
    document.getElementById('result-hexa-reset-container').style.display = 'none';
}

function clearSim() {
    document.getElementById('sim-a').value = '';
    document.getElementById('sim-b').value = '';
    document.getElementById('sim-c').value = '';
    document.getElementById('sim-rolls').value = '';
    document.getElementById('target-a').value = '';
    document.getElementById('target-sub').value = '';
    document.getElementById('sim-stoploss').checked = true;
    if(document.getElementById('sim-million')) document.getElementById('sim-million').checked = false;
    document.getElementById('result-hexa-sim').style.display = 'none';
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
        if(bgmBtn) bgmBtn.classList.add('muted-bgm');
        
        const wrapper = document.getElementById('will-game-wrapper');
        if (wrapper && wrapper.classList.contains('fake-fullscreen')) {
            wrapper.classList.remove('fake-fullscreen');
            document.body.classList.remove('body-no-scroll');
        }
    }

    document.querySelectorAll('.tab-menu button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById('btn-' + tabId).classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');

    // ... (保留你原本 switchTab 內部的其他 if 判斷式，例如 lazyTableGenerated, transcend_updateUI 等) ...
    if (tabId === 'hexa-lazy' && !lazyTableGenerated) { setTimeout(generateLazyTable, 50); lazyTableGenerated = true; }
    if (tabId === 'hexa-visual' && !visualInitialized) { initVisualBars(); visualInitialized = true; }
    if (tabId === 'transcend') { tr_updateUI(); }
    if (tabId === 'craft') { cr_updateUI(); }
    if (tabId === 'hexa-prog' && !progInitialized) { initHexaProg(); progInitialized = true; }
    if (tabId === 'ignore' && !ignoreInitialized) { initIgnoreGrid(); ignoreInitialized = true; }

    willGameActive = (tabId === 'will');
    if (tabId === 'will') {
        if (!willInitialized) {
            will_init();
            willInitialized = true;
        } else {
            requestAnimationFrame(will_gameLoop);
        }
    }
}

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

/* ========================================== */
/* 2. 六轉進度計算機引擎                       */
/* ========================================== */
const reqData = {
    skill: {
        big: [0,0,2,3,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,15],
        small:[0,0,40,50,60,70,80,90,100,110,125,140,155,170,185,200,215,230,245,260,280,300,320,340,360,380,400,420,440,460,500]
    },
    mastery: {
        big: [0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,6,7,7,7,8,8,8,8,9,9,9,10],
        small:[0,10,20,25,30,35,40,45,50,55,62,69,76,83,90,97,104,111,118,125,135,145,155,165,175,185,195,205,215,225,240]
    },
    enhance: {
        big: [0,1,2,2,2,2,2,2,2,2,5,5,5,5,5,5,5,5,5,5,10,10,10,10,10,10,10,10,10,10,15],
        small:[0,20,30,35,40,45,50,55,60,65,75,85,95,105,115,125,135,145,155,165,180,195,210,225,240,255,270,285,300,315,335]
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
    for(let i=1; i<=lv; i++) sum += arr[i] || 0;
    return sum;
}

function initHexaProg() {
    const container = document.getElementById('prog-cores-container');
    if (!container) return;
    let html = '';
    let selectOptions = '';
    for(let i=0; i<=30; i++) selectOptions += `<option value="${i}">Lv. ${i}</option>`;

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
    if(!isChecked) sel.value = '0';
}

function calcHexaProg() {
    let totalBigNeeded = 0, totalSmallNeeded = 0;
    let investedBig = 0, investedSmall = 0;

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
    { title: "特殊", type: "special", items: ["活動", "預留", "預留", "預留"] }
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
            
            card.innerHTML = `
                <div class="card-title">${equip}</div>
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
        if(inputElem) {
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
            'sound_status': tr_isMuted ? 'off' : 'on'});
    }
}

function tr_playSound(isSuccess) {
    if (tr_isMuted) return;
    if (isSuccess) {
        try { tr_sfxSuccess.currentTime = 0; tr_sfxSuccess.play(); } catch(e){}
    } else {
        try { tr_sfxFail.currentTime = 0; tr_sfxFail.play(); } catch(e){}
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
    if(tr_isAnimating) return;
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
    document.getElementById('ui-overlay-lv').innerText = tr_lv;
    document.getElementById('ui-lv-next').innerText = (tr_lv >= 70) ? "MAX" : tr_lv + 2;

    let failTextDOM = document.getElementById('ui-fails');
    failTextDOM.innerText = `失敗次數 ${tr_fails} / 7`;
    failTextDOM.style.color = (tr_fails >= 7) ? "#e74c3c" : "#888";

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

        let totalRate = baseRate + tr_bonus;
        let stoneName = "超越石"; let imgSrc = "assets/超越石.png";
        
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
        document.getElementById('m-enh-item-lv').innerText = newLv; 
        document.getElementById('m-enh-old-lv').innerText = oldLv;
        document.getElementById('m-enh-new-lv').innerText = newLv;
        
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
                failContainer.style.color = "#e74c3c";
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
        document.getElementById('m-scr-item-lv').innerText = oldLv;

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
    let totalRate = baseRate + tr_bonus;
    let roll = Math.random() * 100; 
    let isSuccess = roll < totalRate;

    let oldLv = tr_lv, oldBonus = tr_bonus, oldFails = tr_fails;

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

    let oldLv = tr_lv, oldFails = tr_fails;
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
    tr_lv = 30; tr_fails = 0; tr_bonus = 0.0; 
    tr_stat_normal = 0; tr_stat_radiant = 0; tr_stat_chaos = 0; tr_stat_scrolls = 0;
    tr_ev_stones_achieved = 0; tr_ev_scrolls_achieved = 0;
    tr_current_level_stones = 0; tr_current_fail_scrolls = 0;
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

let vA = 0, vB = 0, vC = 0, vClicks = 0;
let totalFragmentsUsed = 0; 
let isMuted = false;
let resetCountTracker = 0;
const enhanceSound = new Audio('assets/HexaCoreEnforcement.mp3');

function initVisualBars() {
    ['a', 'b', 'c'].forEach(type => {
        const container = document.getElementById('vbar-' + type);
        if(!container) return;
        container.innerHTML = ''; 
        for(let i=0; i<10; i++) {
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
        if(!container) return;
        const segments = container.children;
        const activeClass = (type === 'a') ? 'active-main' : 'active-sub';

        for(let i=0; i<10; i++) {
            if(i < levels[type]) segments[i].classList.add(activeClass);
            else segments[i].classList.remove(activeClass);
        }
    });

    let probA = getHexaProb(vA);
    let probB = 0, probC = 0;
    
    if (vA === 10) probA = 0;
    
    let remProb = 1.0 - probA;
    if (vB === 10 && vC === 10) {
        probB = 0; probC = 0;
    } else if (vB === 10) {
        probB = 0; probC = remProb;
    } else if (vC === 10) {
        probC = 0; probB = remProb;
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
        enhance10xBtn.style.opacity = '0.5'; enhance10xBtn.style.cursor = 'not-allowed';
        enhance1Btn.style.opacity = '0.5'; enhance1Btn.style.cursor = 'not-allowed';
    } else {
        enhance10xBtn.style.opacity = '1'; enhance10xBtn.style.cursor = 'pointer';
        enhance1Btn.style.opacity = '1'; enhance1Btn.style.cursor = 'pointer';
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
            'sound_status': isMuted ? 'off' : 'on'});
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
    vA = 0; vB = 0; vC = 0; vClicks = 0;
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
            if (Math.random() < getHexaProb(a) && a < 10) a++;
            else {
                if (Math.random() < 0.5) { if (b < 10) b++; else c++; } 
                else { if (c < 10) c++; else b++; }
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
                    if (Math.random() < getHexaProb(a) && a < 10) a++;
                    else {
                        if (Math.random() < 0.5) { if (b < 10) b++; else c++; } 
                        else { if (c < 10) c++; else b++; }
                    }
                }
                if (a >= 8 || b === 10 || c === 10) success++;
            }
            let winRate = (success / trialsWin) * 100;
            if (winRate > 5.0) {
                results.push({ a: startA, maxSub: startB, minSub: startC, winRate: winRate, occProb: occProb });
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
                    <th onclick="sortTable('a')" style="cursor:pointer; background-color:#003d99;">主屬性${currentSort.col==='a'?arrow:''}</th>
                    <th>較高附屬</th>
                    <th>較低附屬</th>
                    <th onclick="sortTable('occProb')" style="cursor:pointer; background-color:#003d99;">發生機率${currentSort.col==='occProb'?arrow:''}</th>
                    <th onclick="sortTable('winRate')" style="cursor:pointer; background-color:#003d99;">畢業機率${currentSort.col==='winRate'?arrow:''}</th>
                    <th>建議決策</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(r => {
        let tagHtml = "";
        if (r.winRate > 50) tagHtml = `<span class="tag tag-green">極佳<span class="desktop-space"> </span><br class="mobile-br">(保留)</span>`;
        else if (r.winRate > 35) tagHtml = `<span class="tag tag-green">普通<span class="desktop-space"> </span><br class="mobile-br">(保留)</span>`;
        else if (r.winRate > 15) tagHtml = `<span class="tag tag-yellow">偏弱<span class="desktop-space"> </span><br class="mobile-br">(建議重置)</span>`;
        else tagHtml = `<span class="tag tag-red">無法達成<span class="desktop-space"> </span><br class="mobile-br">(立刻重置)</span>`;

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
/* 7. HEXA 重置決策邏輯 (Reset Decision Sim)    */
/* ========================================== */
function checkHexaReset() {
    let a = parseInt(document.getElementById('reset-a').value) || 0;
    let b = parseInt(document.getElementById('reset-b').value) || 0;
    let c = parseInt(document.getElementById('reset-c').value) || 0;
    let rolls = parseInt(document.getElementById('reset-rolls').value) || 0;
    let targetA = parseInt(document.getElementById('reset-target-a').value) || 0;
    let targetSub = parseInt(document.getElementById('reset-target-sub').value) || 0;
    
    let useMillionReset = document.getElementById('sim-million-reset') ? document.getElementById('sim-million-reset').checked : false;

    let container = document.getElementById('result-hexa-reset-container');
    let mainBox = document.getElementById('result-hexa-reset-main');
    let detailBox = document.getElementById('result-hexa-reset-details');

    if (a + b + c + rolls !== 20) {
        container.style.display = 'block';
        mainBox.innerText = `⚠️ 錯誤：目前等級總和 (${a + b + c}) + 剩餘次數 (${rolls}) 應該要等於 20 喔！\n請確認輸入數字是否正確。`;
        detailBox.innerHTML = "";
        return;
    }

    if (targetA === 0 && targetSub === 0) {
        container.style.display = 'block';
        mainBox.innerText = "⚠️ 錯誤：請至少設定一項目標屬性等級 (>0) 才能進行決策判斷！";
        detailBox.innerHTML = "";
        return;
    }

    const trials = useMillionReset ? 1000000 : 30000;
    let gradSuccess = 0; 
    let baseSuccess = 0; 
    
    let countA = new Array(11).fill(0);
    let countB = new Array(11).fill(0);
    let countC = new Array(11).fill(0);

    for (let i = 0; i < trials; i++) {
        let simA = a, simB = b, simC = c;
        for (let roll = 0; roll < rolls; roll++) { 
            if (Math.random() < getHexaProb(simA) && simA < 10) simA++;
            else {
                if (Math.random() < 0.5) { if (simB < 10) simB++; else simC++; } 
                else { if (simC < 10) simC++; else simB++; }
            }
        }
        
        let maxSub = Math.max(simB, simC);
        let passedA = (targetA > 0 && simA >= targetA);
        let passedSub = (targetSub > 0 && maxSub >= targetSub);
        if (passedA || passedSub) gradSuccess++;
        
        countA[simA]++; countB[simB]++; countC[simC]++;
    }

    for (let i = 0; i < trials; i++) {
        let simA = 0, simB = 0, simC = 0;
        for (let roll = 0; roll < 20; roll++) {
            if (Math.random() < getHexaProb(simA) && simA < 10) simA++;
            else {
                if (Math.random() < 0.5) { if (simB < 10) simB++; else simC++; } 
                else { if (simC < 10) simC++; else simB++; }
            }
        }
        let maxSub = Math.max(simB, simC);
        let passedA = (targetA > 0 && simA >= targetA);
        let passedSub = (targetSub > 0 && maxSub >= targetSub);
        if (passedA || passedSub) baseSuccess++;
    }

    let winRate = (gradSuccess / trials) * 100;
    let baseWinRate = (baseSuccess / trials) * 100;
    let suggestion = "";
    
    if (winRate === 0) {
        suggestion = "💀 無法達成 (機率為 0%)，請立刻重置。";
    } else if (winRate >= baseWinRate * 3) {
        suggestion = `💎 歐洲人！(目前勝率 ${winRate.toFixed(2)}% > 全新 ${baseWinRate.toFixed(2)}%，衝！)`;
    } else if (winRate >= baseWinRate) {
        suggestion = `✅ 狀態不錯！(目前勝率 ${winRate.toFixed(2)}% > 全新 ${baseWinRate.toFixed(2)}%，繼續)`;
    } else if (winRate >= baseWinRate * 0.5) {
        suggestion = `⚠️ 狀態偏弱 (目前勝率 ${winRate.toFixed(2)}% < 全新 ${baseWinRate.toFixed(2)}%，建議重置)`;
    } else {
        suggestion = `❌ 狀態極差 (機率遠低於從頭來過，立刻重置)`;
    }

    container.style.display = 'block';
    mainBox.innerHTML = `📊 預估畢業勝率：${winRate.toFixed(2)}%<br><span style="font-size: 15px; color: ${winRate >= baseWinRate ? '#27ae60' : '#c0392b'};">${suggestion}</span>`;
    
    let htmlA = `<div style="flex: 1; min-width: 150px;"><div style="color:#0052cc; font-weight:bold; border-bottom: 1px solid #ccc; margin-bottom: 5px;">【主屬性 (A)】</div>`;
    for(let i = Math.max(0, a); i <= 10; i++) htmlA += `• ${i} 級：${((countA[i] / trials) * 100).toFixed(3)}%<br>`;
    htmlA += `</div>`;

    let htmlB = `<div style="flex: 1; min-width: 150px;"><div style="color:#c0392b; font-weight:bold; border-bottom: 1px solid #ccc; margin-bottom: 5px;">【附屬性 (B)】</div>`;
    for(let i = Math.max(0, b); i <= 10; i++) htmlB += `• ${i} 級：${((countB[i] / trials) * 100).toFixed(3)}%<br>`;
    htmlB += `</div>`;

    let htmlC = `<div style="flex: 1; min-width: 150px;"><div style="color:#e67e22; font-weight:bold; border-bottom: 1px solid #ccc; margin-bottom: 5px;">【附屬性 (C)】</div>`;
    for(let i = Math.max(0, c); i <= 10; i++) htmlC += `• ${i} 級：${((countC[i] / trials) * 100).toFixed(3)}%<br>`;
    htmlC += `</div>`;

    detailBox.innerHTML = `<div style="width:100%;"><strong>🔮 點完後可能性的機率分佈：</strong><br><span style="font-size: 13px; color: #7f8c8d;">(全新核心達成機率約為 ${baseWinRate.toFixed(2)}%)</span></div>${htmlA}${htmlB}${htmlC}`;
}

/* ========================================== */
/* 8. HEXA 目標屬性模擬邏輯 (Target Goal Sim)    */
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
    let valTsub = document.getElementById('target-sub').value;
    let tA = valTa === "" ? 0 : parseInt(valTa);
    let tSub = valTsub === "" ? 0 : parseInt(valTsub);

    let useStopLoss = document.getElementById('sim-stoploss').checked;
    let useMillion = document.getElementById('sim-million') ? document.getElementById('sim-million').checked : false;
    let resBox = document.getElementById('result-hexa-sim');

    if (sA + sB + sC + rolls !== 20) {
        resBox.style.display = 'block'; 
        resBox.innerHTML = `⚠️ 錯誤：目前等級總和 (${sA + sB + sC}) + 剩餘次數 (${rolls}) 必須等於 20 喔！<br>請確認輸入的數字是否正確。`; 
        return;
    }

    if (tA === 0 && tSub === 0) {
        resBox.style.display = 'block'; 
        resBox.innerHTML = "⚠️ 錯誤：請至少設定一項目標屬性等級 (>0) 才能進行模擬！"; 
        return;
    }

    const trials = useMillion ? 1000000 : 100000;
    let cSuccess = 0, cHitA = 0, cHitSub = 0, cHitBoth = 0, tFrag = 0; 
    let isGolden = (useStopLoss && tSub === 0 && (tA === 10 || tA === 9));

    for (let i = 0; i < trials; i++) {
        let a = sA, b = sB, c = sC, attFrag = 0, success = false;
        
        if ((tA > 0 && a >= tA) || (tSub > 0 && Math.max(b, c) >= tSub)) {
            success = true;
        }

        for (let r = 0; r < rolls && !success; r++) {
            let currMax = Math.max(b, c);
            let currentTotalRolls = sA + sB + sC + r; 

            if (useStopLoss) {
                let rem = rolls - r;
                let canHitA = (tA > 0) ? (a + rem >= tA) : false;
                let canHitSub = (tSub > 0) ? (currMax + rem >= tSub) : false;
                
                let possible = false;
                if (tA > 0 && tSub > 0) possible = (canHitA || canHitSub);
                else if (tA > 0) possible = canHitA;
                else if (tSub > 0) possible = canHitSub;

                if (!possible) break; 

                if (currentTotalRolls === 10 && tSub === 0) {
                    if (tA === 10 && a < 5) break; 
                    if (tA === 9 && a < 4) break;  
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

            if ((tA > 0 && a >= tA) || (tSub > 0 && Math.max(b, c) >= tSub)) {
                success = true;
            }
        }
        tFrag += attFrag;
        if (success) {
            cSuccess++;
            let finalMaxSub = Math.max(b, c);
            let passA = (tA > 0 && a >= tA);
            let passSub = (tSub > 0 && finalMaxSub >= tSub);
            if (passA) cHitA++;
            if (passSub) cHitSub++;
            if (passA && passSub) cHitBoth++;
        }
    }
    
    let prob = (cSuccess / trials) * 100;
    let avgCost = cSuccess > 0 ? (tFrag / cSuccess) : 0;
    
    let htmlOutput = `<strong>🎯 【 模擬 ${trials.toLocaleString()} 次結果 】</strong><br>`;
    
    if (useStopLoss) {
        htmlOutput += `<span style="color:${isGolden ? '#27ae60' : '#7f8c8d'}; font-size:13px;">`;
        if (isGolden) htmlOutput += `(套用提早停損及重置決策：前十次未達主屬${tA===10?'5':'4'}時直接重置)`;
        else htmlOutput += `(僅套用提早停損)`;
        htmlOutput += `</span><br><br>`;
    } else {
        htmlOutput += `<br><br>`;
    }
    
    if (tA > 0) htmlOutput += `• 單一核心達成 [主屬性 ${tA} 級] 的機率：<strong style="color:#0052cc;">${((cHitA / trials) * 100).toFixed(2)} %</strong><br>`;
    if (tSub > 0) htmlOutput += `• 單一核心達成 [任一附屬 ${tSub} 級] 的機率：<strong style="color:#c0392b;">${((cHitSub / trials) * 100).toFixed(2)} %</strong><br>`;
    
    if (tA > 0 && tSub > 0) {
        htmlOutput += `• 達成任一條件 (畢業) 的綜合機率：<strong style="color:#27ae60;">${prob.toFixed(2)} %</strong><br>`;
        htmlOutput += `• 歐洲人！同時達成兩者的機率：<strong>${((cHitBoth / trials) * 100).toFixed(2)} %</strong><br>`;
    }
    
    htmlOutput += `<br><hr style="border:0; border-top:1px solid #eee; margin:10px 0;">`;
    
    if (cSuccess > 0) {
        htmlOutput += `💰 預估碎片需求：平均準備約 <strong style="font-size:18px; color:#c0392b;">${Math.round(avgCost).toLocaleString()}</strong> 個碎片能達成目標`;
    } else {
        htmlOutput += `💀 起點狀態與剩餘次數不足以達成你設定的目標，機率為 0%。`;
    }

    resBox.style.display = 'block';
    resBox.innerHTML = htmlOutput;
}

tr_updateUI();

/* ========================================== */
/* 9. 製作模擬器邏輯 (Craft Simulator)           */
/* ========================================== */
let cr_fails = 0;
let cr_successes = 0; 
let cr_crystals_used = 0;
let cr_scrolls_used = 0;
let cr_isAnimating = false;
let cr_isMuted = false;
let cr_ev_achieved = 0;
let cr_current_attempts = 0;
let cr_mythic_type = 'necro'; 

const cr_sfx_success = new Audio('assets/AncientSuccess.wav');
const cr_sfx_fail = new Audio('assets/AncientFail.wav');

const CRAFT_DATA = {
    mythic_inherit: {
        baseRate: 30, additionalRate: 0,
        fromText: "神話", toText: "古代",
        fromColor: "#E42123", toColor: "#1cd1ed",
        desc: "<br>對選擇的裝備進行繼承製作。<br><br>可獲得和所選裝備相同類別的<span class='txt-sharp' style='color:#1cd1ed;'>古代裝備</span>。",
        meso: "1,204", equipName: "獅子心形克拉", toEquipName: "獅子心形克拉",          
        crystalName: "古代武器結晶", fromImg: "assets/獅子心形克拉.png", toImg: "assets/獅子心形克拉.webp", 
        crystalImg: "assets/古代武器結晶.png", crystalReq: 1,                   
        scrollName: "幸運的古代製作卷軸", scrollImg: "assets/卷軸空格.png", scrollReq: 2,
        confirmCustomHTML: `
            要進行古代級道具<span style="color:#ED7245; font-weight:bold;">繼承製作</span>嗎？<br>
            製作Lv.31以上的裝備成功時，裝備等級會重置，<br>
            並且會顯示為能力下降。<br>
            原有裝備的基本能力值會以相同比例維持。<br><br>
            死靈轉換製作：製作<span style="color:#1cd1ed; font-weight:bold;">古代級</span>的死靈道具<br>
            繼承製作：獲得相同類別的<span style="color:#1cd1ed; font-weight:bold;">古代</span>道具
        `,
        confirmHighlight: "古代", confirmTier: "古代級", confirmTierColor: "#ed7245", 
        successFromText: "神話", successFromColor: "#E42123", successToText: "古代", successToColor: "#1cd1ed",
        failFromText: "神話", failFromColor: "#E42123", failToText: "神話", failToColor: "#E42123"
    },
    mythic_necro: {
        baseRate: 4, additionalRate: 4,
        fromText: "神話", toText: "古代",
        fromColor: "#E42123", toColor: "#1cd1ed",
        desc: "對選擇的裝備進行死靈轉換製作。<br><br>製作成功時可獲得<span class='txt-sharp' style='color:#1cd1ed;'>古代</span>死靈道具。<br>把神話鍊成道具作為基本使用時，製作成功機率會提高。<br>",
        meso: "1,204", equipName: "獅子心形克拉", toEquipName: "死靈克拉",             
        crystalName: "古代武器結晶", fromImg: "assets/獅子心形克拉.png", toImg: "assets/死靈克拉.webp",
        crystalImg: "assets/古代武器結晶.png", crystalReq: 1,                   
        scrollName: "幸運的古代製作卷軸", scrollImg: "assets/卷軸空格.png", scrollReq: 2,
        confirmCustomHTML: `
            要進行古代級道具<span style="color:#ed7245; font-weight:bold;">死靈轉換製作</span>嗎？<br>
            製作Lv.31以上的裝備成功時，裝備等級會重置，<br>
            並且會顯示為能力下降。<br>
            原有裝備的基本能力值會以相同比例維持。<br><br>
            死靈轉換製作：製作<span style="color:#1cd1ed; font-weight:bold;">古代級</span>的死靈道具<br>
            繼承製作：獲得相同類別的<span style="color:#1cd1ed; font-weight:bold;">古代</span>道具
        `,
        confirmHighlight: "死靈", confirmTier: "死靈級", confirmTierColor: "#1cd1ed",
        successFromText: "神話", successFromColor: "#E42123", successToText: "死靈", successToColor: "#1cd1ed",
        failFromText: "神話", failFromColor: "#E42123", failToText: "神話", failToColor: "#E42123"
    },
    absolab: {
        baseRate: 12, additionalRate: 0,
        fromText: "死靈", toText: "航海師",
        fromColor: "#1cd1ed", toColor: "#CC9ED8",   
        desc: "以<span class='txt-sharp' style='color:#1cd1ed;'>在死靈裝備</span>製作<span class='txt-sharp' style='color:#CC9ED8;'>航海師裝備</span>。",
        meso: "1,204", equipName: "死靈克拉", toEquipName: "航海師克拉", 
        crystalName: "烙印武器結晶", fromImg: "assets/死靈克拉.webp", toImg: "assets/航海師克拉.webp",
        crystalImg: "assets/烙印武器結晶.png", crystalReq: 1,
        scrollName: "幸運的混沌製作卷軸(武器)", scrollImg: "assets/卷軸空格.png", scrollReq: 1,
        confirmHighlight: "航海師", confirmHighlightColor: "#ed7245", confirmTier: "混沌級", confirmTierColor: "#D02E9D",      
        successFromText: "古代", successFromColor: "#1cd1ed", successToText: "混沌", successToColor: "#CC9ED8",   
        failFromText: "古代", failFromColor: "#1cd1ed", failToText: "古代", failToColor: "#1cd1ed"
    },
    arcane: {
        baseRate: 10, additionalRate: 0,
        fromText: "航海師", toText: "神秘冥界幽靈",
        fromColor: "#CC9ED8", toColor: "#CC9ED8",   
        desc: "以<span class='txt-sharp' style='color:#CC9ED8;'>在航海師裝備</span>上製作<span class='txt-sharp' style='color:#CC9ED8;'>神秘冥界幽靈裝備</span>。",
        meso: "1,204", equipName: "航海師克拉", toEquipName: "神秘冥界幽靈克拉",
        crystalName: "夏德貝爾結晶(武器)", fromImg: "assets/航海師克拉.webp", toImg: "assets/神秘冥界幽靈克拉.webp",
        crystalImg: "assets/夏德貝爾結晶(武器).png", crystalReq: 1,
        scrollName: "幸運的混沌製作卷軸(武器)", scrollImg: "assets/卷軸空格.png", scrollReq: 1,
        confirmHighlight: "神秘冥界幽靈", confirmHighlightColor: "#ed7245", confirmTier: "混沌級", confirmTierColor: "#D02E9D", 
        successFromText: "混沌", successFromColor: "#CC9ED8", successToText: "混沌", successToColor: "#CC9ED8",   
        failFromText: "混沌", failFromColor: "#CC9ED8", failToText: "混沌", failToColor: "#CC9ED8"
    }
};

let cr_stage = 'arcane'; 

function cr_toggleSound() {
    cr_isMuted = !cr_isMuted;
    document.getElementById('btn-sound-toggle-cr').innerText = cr_isMuted ? "🔇 音效：關閉" : "🔊 音效：開啟";
    document.getElementById('btn-sound-toggle-cr').className = cr_isMuted ? "btn-sound muted" : "btn-sound";
    if (typeof gtag === 'function') {
        gtag('event', 'toggle_sound', {
            'simulator': 'craft',
            'sound_status': cr_isMuted ? 'off' : 'on'});
    }
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
    if(cr_isAnimating) return;
    
    let stageRadio = document.querySelector('input[name="cr-stage"]:checked');
    if(stageRadio) cr_stage = stageRadio.value;
    
    cr_fails = 0; cr_successes = 0; cr_crystals_used = 0;
    cr_scrolls_used = 0; cr_ev_achieved = 0; cr_current_attempts = 0;
    
    if(cr_stage === 'necro') {
        let necroDiv = document.getElementById('cr-scroll-necro-div');
        let chaosDiv = document.getElementById('cr-scroll-chaos-div');
        if(necroDiv) necroDiv.style.display = 'flex';
        if(chaosDiv) chaosDiv.style.display = 'none';
        
        let n1 = document.getElementById('cr-scroll-n1');
        let n2 = document.getElementById('cr-scroll-n2');
        if(n1) n1.value = "0";
        if(n2) n2.value = "0";
    } else {
        let necroDiv = document.getElementById('cr-scroll-necro-div');
        let chaosDiv = document.getElementById('cr-scroll-chaos-div');
        if(necroDiv) necroDiv.style.display = 'none';
        if(chaosDiv) chaosDiv.style.display = 'flex';
        
        let c1 = document.getElementById('cr-scroll-c1');
        if(c1) c1.value = "0";
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
        if (firstRate === 10) return `${folder}幸運的混沌製作卷軸(武器)10.png`;
    }
    return defaultImg; 
}

function cr_updateUI() {
    let activeKey = (cr_stage === 'necro') ? 'mythic_' + cr_mythic_type : cr_stage;
    let data = CRAFT_DATA[activeKey];
    let scrollInfo = cr_getScrollRate();
    let totalRate = data.baseRate + data.additionalRate + scrollInfo.rate;

    let equipImgElem = document.getElementById('cr-equip-from-img');
    let equipNameElem = document.getElementById('cr-equip-from-name');
    let overlayLvElem = document.getElementById('cr-overlay-lv'); 

    if(equipImgElem) {
        equipImgElem.style.display = ''; 
        equipImgElem.src = data.fromImg;
    }
    if(equipNameElem) equipNameElem.innerHTML = data.equipName;
    if(overlayLvElem) {
        let startLv = (cr_stage === 'necro') ? 30 : (cr_stage === 'absolab' ? 40 : 60);
        overlayLvElem.innerText = startLv;
    }

    let crystalImgElem = document.getElementById('cr-crystal-img');
    let crystalNameElem = document.getElementById('cr-crystal-name');
    if(crystalImgElem) {
        crystalImgElem.style.display = ''; 
        crystalImgElem.src = data.crystalImg;
    }
    if(crystalNameElem) crystalNameElem.innerHTML = `${data.crystalName}<br><span style="color:#888; font-weight:normal; font-size:0.85em;">1/${data.crystalReq}</span>`;

    let fromTextElem = document.getElementById('cr-stage-from-text');
    let toTextElem = document.getElementById('cr-stage-to-text');
    if(fromTextElem) { fromTextElem.innerText = data.fromText; fromTextElem.style.color = data.fromColor; }
    if(toTextElem) { toTextElem.innerText = data.toText; toTextElem.style.color = data.toColor; }

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

    if(descElem) {
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
    
    if(scrollImgElem) {
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
        rateBox.style.marginTop = 'auto'; 
        rateBox.style.width = '100%';

        if (cr_stage === 'necro' && cr_mythic_type === 'necro') {
            rateBox.innerHTML = `
                <div style="background-color: #ffffff; width: 100%; padding: 6px 0; border-top: 1px solid #e1e4e8; border-bottom: 1px solid #e1e4e8;">
                    <div class="txt-sharp" style="color: #1cd1ed; font-size: 14px;">
                        追加死靈轉換製作成功機率 : ${data.additionalRate}%
                    </div>
                </div>
                <div style="background-color: #F0F0F0; width: 100%; padding: 6px 0 10px 0;">
                    <div class="txt-sharp" style="color: #ED7245; font-size: 15px;">
                        死靈轉換製作成功機率 : ${scrollInfo.rate > 0 ? (data.baseRate + scrollInfo.rate) + '(' + data.baseRate + '+' + scrollInfo.rate + ')%' : data.baseRate + '%'}
                    </div>
                </div>
            `;
        } else if (cr_stage === 'necro' && cr_mythic_type === 'inherit') {
            rateBox.innerHTML = `
                <div style="background-color: #F0F0F0; width: 100%; padding: 10px 0 10px 0;"> <div class="txt-sharp" style="color: #ED7245; font-size: 15px;">
                        繼承製作成功機率 : ${scrollInfo.rate > 0 ? (data.baseRate + scrollInfo.rate) + '(' + data.baseRate + '+' + scrollInfo.rate + ')%' : data.baseRate + '%'}
                    </div>
                </div>
            `;
        } else {
            rateBox.innerHTML = `
                <div class="txt-sharp" style="color: #ED7245; font-size: 15px; padding-bottom: 10px; margin-bottom: 0;"> <span id="cr-stage-to-name-color">${data.toText}</span>製作成功率 : 
                    <span id="cr-total-rate" style="margin-left: 2px;">${scrollInfo.rate > 0 ? (data.baseRate + scrollInfo.rate) + '(' + data.baseRate + '+' + scrollInfo.rate + ')%' : data.baseRate + ' %'}</span>
                </div>
            `;
        }
    }

    let mesoElem = document.getElementById('cr-meso-cost');
    if(mesoElem) mesoElem.innerText = data.meso;

    let statSuccess = document.getElementById('cr-stat-success');
    let statFails = document.getElementById('cr-stat-fails');
    let statCrys = document.getElementById('cr-stat-crystals');
    let statScr = document.getElementById('cr-stat-scrolls');
    let statTotalUsed = document.getElementById('cr-stat-total-used');
    let evAtmpt = document.getElementById('cr-ev-attempts');

    if(statSuccess) statSuccess.innerText = cr_successes;
    if(statFails) statFails.innerText = cr_fails;
    if(statCrys) statCrys.innerText = cr_crystals_used;
    if(statScr) statScr.innerText = cr_scrolls_used;
    if(statTotalUsed) statTotalUsed.innerText = cr_crystals_used;

    let current_ev = (cr_current_attempts > 0) ? (100 / totalRate) : 0;
    if(evAtmpt) evAtmpt.innerText = (cr_ev_achieved + current_ev).toFixed(2);
}

function cr_showConfirm() {
    if(cr_isAnimating) return;
    let modal = document.getElementById('cr-confirm-modal');
    if(modal) {
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
    if(modal) modal.classList.remove('active');
}

function cr_executeCraft() {
    let confirmModal = document.getElementById('cr-confirm-modal');
    if(confirmModal) confirmModal.classList.remove('active');
    cr_isAnimating = true;
    
    if (typeof gtag === 'function') {
        gtag('event', 'action_craft', {
            'craft_stage': cr_stage});
    }

    try {
        let activeKey = (cr_stage === 'necro') ? 'mythic_' + cr_mythic_type : cr_stage;
        let data = CRAFT_DATA[activeKey];
        let scrollInfo = cr_getScrollRate();
        let totalRate = data.baseRate + data.additionalRate + scrollInfo.rate;

        cr_current_attempts++; cr_crystals_used++; cr_scrolls_used += scrollInfo.count;
        cr_updateUI();

        let isSuccess = (Math.random() * 100) < totalRate;
        let animOverlay = document.getElementById('cr-anim-overlay');
        
        if (animOverlay) {
            if (cr_stage === 'necro') {
                animOverlay.className = 'lightning-overlay ' + (isSuccess ? 'cr-anim-success-gold' : 'cr-anim-fail-gold');
            } else {
                animOverlay.className = 'lightning-overlay ' + (isSuccess ? 'cr-anim-success' : 'cr-anim-fail');
            }
            
            if (!cr_isMuted) {
                let sfx = isSuccess ? cr_sfx_success : cr_sfx_fail;
                sfx.currentTime = 0;
                sfx.play().catch(e => console.log("音效播放被阻擋：", e));
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
        console.error("製作發生錯誤：", e);
        cr_isAnimating = false;
        alert("UI 發生異常！系統已強制解鎖。");
    }
}

function cr_showResult(isSuccess, attempts_taken = 0) {
    let modal = document.getElementById('cr-result-modal');
    if(!modal) return;
    modal.classList.add('active');
    
    let statsBox = document.getElementById('cr-m-stats-box');
    let lvTag = document.getElementById('cr-m-lv-tag');
    let lvText = document.getElementById('cr-m-lv');
    let failCont = document.getElementById('cr-m-fail-text-container');
    
    let activeKey = (cr_stage === 'necro') ? 'mythic_' + cr_mythic_type : cr_stage;
    let data = CRAFT_DATA[activeKey]; 
    
    let stageFromElem = document.getElementById('cr-m-stage-from-color');
    let stageToElem = document.getElementById('cr-m-stage-to-color');
    let resultImgElem = document.getElementById('cr-m-equip-img');

    if (isSuccess) {
        if (stageFromElem && stageToElem) {
            stageFromElem.innerText = data.successFromText; stageFromElem.style.color = data.successFromColor;
            stageToElem.innerText = data.successToText; stageToElem.style.color = data.successToColor;
        }

        document.getElementById('cr-m-title').innerText = "製作成功";
        if (resultImgElem) { resultImgElem.style.display = ''; resultImgElem.src = data.toImg; }
        
        document.getElementById('cr-m-equip-name').innerText = data.toEquipName; 
        if(lvTag) lvTag.style.display = "block";
        if(lvText) lvText.innerText = "1"; 
        
        if(failCont) {
            failCont.style.display = "block";
            failCont.innerHTML = `累積製作 <span style="color:#e67e22; font-weight:bold;">${attempts_taken}</span> 次`;
        }
        if(statsBox) {
            statsBox.innerHTML = `
                <div class="cr-stat-row"><span style="color:#333;">攻擊力</span><span style="color:#ED7245;">1,204 <span style="color:#02f53b;">(▲1,204)</span></span></div>
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
        if (resultImgElem) { resultImgElem.style.display = ''; resultImgElem.src = data.fromImg; }
        document.getElementById('cr-m-equip-name').innerText = data.equipName;
        
        if(lvTag) lvTag.style.display = "block";
        if(lvText) {
            let failLv = (cr_stage === 'necro') ? 30 : (cr_stage === 'absolab' ? 40 : 60);
            lvText.innerText = failLv; 
        }
        
        if(failCont) {
            failCont.style.display = "block";
            failCont.innerHTML = `製作失敗次數 <span style="color:#c0392b; font-weight:bold;">${cr_fails}</span> / 5`;
        }
        
        if(statsBox) {
            statsBox.innerHTML = `<div style="text-align:center; padding: 15px 0; color:#555; font-size:14px; font-weight:bold;">能力值沒有變化。</div>`;
        }
    }
}

function cr_closeResult() {
    let modal = document.getElementById('cr-result-modal');
    if(modal) modal.classList.remove('active');
    cr_isAnimating = false; cr_updateUI();
}

function cr_action_reset() {
    if (cr_isAnimating) return;
    cr_fails = 0; cr_successes = 0; cr_crystals_used = 0;
    cr_scrolls_used = 0; cr_ev_achieved = 0; cr_current_attempts = 0;
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
    boss: {speed: 2.5, followDistance: 30 }
};

const POS = { LL: 225, L2: 440, L1: 655, M: 870, R1: 1085, R2: 1300, RR: 1515 };

function will_togglePause(forceState) {
    wGame.isPaused = forceState;
    if (wGame.isPaused) will_updateUI("⏸ 遊戲暫停", "#f1c40f", "點擊 ▶ 繼續");
    else will_updateUI("▶ 遊戲繼續", "#2ecc71", "準備...");
}

function will_zoomStep(amount) {
    let newZoom = Math.max(1.0, Math.min(2.5, CONFIG.camera.zoom + amount));
    CONFIG.camera.zoom = Number(newZoom.toFixed(1));
    const display = document.getElementById('zoom-glass-val');
    if(display) display.innerText = CONFIG.camera.zoom.toFixed(1) + 'x';
}

// =========================================================================
// 🖼️ 【修改素材區】
// =========================================================================
const wAssets = {
    bgSmooth: new Image(), bgCrack: new Image(), boss: new Image(),
    pWalk: new Image(), pIdle: new Image(), legTop: new Image(), legBot: new Image(), crack: new Image()
};

wAssets.bgSmooth.src = 'assets/bg_Deep_Mirror.png';       
wAssets.bgCrack.src  = 'assets/bg_Deep_Mirror.png';       
wAssets.crack.src    = 'assets/screen_crack.png';         
wAssets.pWalk.src    = 'assets/player_walk.png';          
wAssets.pIdle.src    = 'assets/player_idle.png';          
wAssets.boss.src     = 'assets/boss_will.png';            
wAssets.legTop.src   = 'assets/spider_leg_top.png';       
wAssets.legBot.src   = 'assets/spider_leg_bottom.png'; 
wAssets.hitEffect = new Image();
wAssets.hitEffect.src = 'assets/spider_leg_hit.png';   

const wSprites = {
    pWalk:  { cols: 6, rows: 7, frames: 37, speed: 60, curr: 0, tick: 0 },
    pIdle:  { cols: 9, rows: 9, frames: 80, speed: 60, curr: 0, tick: 0 },
    boss:   { cols: 4, rows: 4, frames: 16, speed: 60, curr: 0, tick: 0 },
    legTop: { cols: 5, rows: 6, frames: 30, speed: 60, curr: 0, tick: 0 },
    legBot: { cols: 5, rows: 6, frames: 30, speed: 60, curr: 0, tick: 0 },
    crack:  { cols: 3, rows: 3, frames: 8,  speed: 60, curr: 0, tick: 0 },
    hitEffect: { cols: 3, rows: 3, frames: 9, speed: 80, curr: 0, tick: 0, active: false, hitX: 0, hitY: 0 }
};

// =========================================================================
// 🕷️ 終極 1:1 蜘蛛角陣型題庫設定
// =========================================================================
const WILL_PATTERNS = [
    { 
        name: "困難混沌無地裂1 (中 ➔ 小左 ➔ 中)", crack: false, hint: "中 ➔ 小左 ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.LL, POS.L2, POS.L1], top: [POS.R1, POS.R2, POS.RR] },
            { safe: POS.L1, bot: [POS.LL-150, POS.M, POS.R1, POS.R2, POS.RR, POS.RR+200], top: [POS.L2] },
            { safe: POS.M,  bot: [POS.LL, POS.L2, POS.L1], top: [POS.R1, POS.R2, POS.RR] }
        ]
    },
    { 
        name: "困難混沌無地裂2 (中 ➔ 小右 ➔ 大右 ➔ 中)", crack: false, hint: "中 ➔ 小右 ➔ 大右 ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.L2, POS.R1, POS.L2, POS.RR], top: [POS.L1-50, POS.LL, POS.R2] }, 
            { safe: POS.R1, bot: [POS.L1, POS.R2], top: [POS.L2-50, POS.M-50, POS.RR-50] }, 
            { safe: POS.R2, bot: [POS.M-30, POS.RR ], top: [POS.R1-50,POS.L1-50 ] }, 
        ]
    },
    { 
        name: "混沌無地裂3 (中 ➔ 大右 ➔ 小右 ➔ 中)", crack: false, hint: "中 ➔ 大右 ➔ 小右(中) ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.L2, POS.L1+130, POS.RR+50], top: [POS.LL, POS.L1-80, ] },
            { safe: POS.R2, bot: [POS.LL, POS.L1-30, POS.RR-30], top: [POS.L2-50, POS.M-130, POS.M+50] },
            { safe: POS.R1, bot: [POS.RR-50], top: [POS.LL,POS.M-120,POS.R2-90,POS.RR+50] },
        ]
    },
    { 
        name: "混沌無地裂4 (中 ➔ 大左 ➔ 不動 ➔ 中) ", crack: false, hint: "中 ➔ 大左 ➔ 不動 ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.LL-70, POS.M-80,POS.M+100,POS.RR-80, POS.RR+80], top: [POS.L2-50,POS.R1+90], noDeduct: true },
            { safe: POS.L2, bot: [POS.RR-50], top: [POS.LL-100, POS.M-100, POS.R1-120,POS.R2-150] },
            { safe: POS.L2, bot: [POS.R1-90,POS.R1+90], top: [POS.LL-20, POS.M-80,POS.R2-10] }, 
        ]
    },
    { 
        name: "混沌地裂1 (中 ➔ 大左 ➔ 更大左 ➔ 中)", crack: true, hint: "中 ➔ 大左 ➔ 更大左 ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.M, POS.R1+50, POS.R2+100 ], top: [POS.RR+30] },
            { safe: POS.L2, bot: [POS.LL], top: [POS.L2+100] },
            { safe: POS.LL, bot: [POS.LL, POS.R1-50], top: [POS.L2-50, POS.R1] },
        ]
    },
    { 
        name: "混沌地裂2-型態1 (中 ➔ 大右 ➔ 中)", crack: true, hint: "中 ➔ 大右 ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.M,POS.R1], top: [POS.LL-150, POS.LL+50] },
            { safe: POS.R2, bot: [POS.L2-80, POS.L2+120], top: [POS.R1+80, POS.R2+30] },
            { safe: POS.M,  bot: [POS.LL-150, POS.LL+50], top: [POS.M-30,POS.R1-40] }
        ]
    },
    { 
        name: "混沌地裂3-型態2 (中 ➔ 大右 ➔ 中)", crack: true, hint: "中 ➔ 大右 ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.LL-100, POS.M ], top: [POS.LL, POS.R1-80] },
            { safe: POS.R2, bot: [POS.L2+70, POS.R2+50], top: [POS.LL+70, POS.R1+70] },
            { safe: POS.M,  bot: [POS.L1-30, POS.RR-80], top: [POS.M-30, POS.RR+70] }
        ]
    },
    { 
        name: "困難混沌有地裂 (中 ➔ 大左 ➔ 中)", crack: true, hint: "中 ➔ 大左 ➔ 中",
        strikes: [
            { safe: POS.M,  bot: [POS.LL-100, POS.M ], top: [POS.LL, POS.R1-80] },
            { safe: POS.R2, bot: [POS.L2+70, POS.R2+50], top: [POS.LL+70, POS.R1+70] },
            { safe: POS.M,  bot: [POS.L1-30, POS.RR-80], top: [POS.M-30, POS.RR+70] }
        ]
    }
];

let wPlayer = { x: WORLD_CENTER, y: CONFIG.pos.floorY, radius: 15, targetX: null, facing: 'right' };
let wBoss = { x: WORLD_CENTER, facing: 'left' };
let wKeys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };
let wLastTime = 0; let cameraX = 0;
let mTouchLeft = false; let mTouchRight = false; let isJoyDragging = false; 

// 🌟 遊戲核心狀態 (包含防作弊機制與抽籤袋)
let wGame = { 
    hits: 0, 
    questionsAnswered: 0, 
    totalQuestions: 7, 
    currentPatternIdx: 0, 
    phase: 'stopped', 
    strikeIndex: 0, timer: 0, flashRed: 0, hasEvaluated: false, isPaused: false,
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
    const fw = img.naturalWidth / cfg.cols; const fh = img.naturalHeight / cfg.rows;
    const col = cfg.curr % cfg.cols; const row = Math.floor(cfg.curr / cfg.cols);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
    let drawX = -fw / 2; let drawY = -fh / 2;
    if (align === 'bottom-center') drawY = -fh;   
    if (align === 'top-center') drawY = 0;        
    ctx.drawImage(img, col * fw, row * fh, fw, fh, drawX * scale, drawY * scale, fw * scale, fh * scale);
    ctx.restore();
}

function tickSprite(cfg, dt, loop = true) {
    cfg.tick += dt;
    if (cfg.tick >= cfg.speed) {
        cfg.tick = 0; cfg.curr++;
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
    
    if(modeRadio) wSettings.mode = modeRadio.value;
    if(lengthRadio) {
        wSettings.endless = (lengthRadio.value === 'endless');
        wSettings.isCustom = (lengthRadio.value === 'custom'); 
    }
    
    if(customInput) {
        wSettings.customRounds = parseInt(customInput.value) || 1;
        if(wSettings.customRounds < 1) wSettings.customRounds = 1; 
    }
    
    if(hintCheck) wSettings.hint = hintCheck.checked;
    
    // 🎵 處理背景音樂
    if(bgmCheck) {
        wSettings.bgm = bgmCheck.checked;
        if (!wSettings.bgm && isBgmPlaying) {
            willBgm.pause(); isBgmPlaying = false;
        }
        if (wSettings.bgm && !isBgmPlaying && wGame.phase !== 'stopped') {
            willBgm.play().then(() => { isBgmPlaying = true; }).catch(e=>console.log(e));
        }
    }
    
    const hintBtn = document.getElementById('btn-will-hint');
    if(hintBtn) {
        if(wSettings.hint) hintBtn.classList.add('active-hint');
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
    wGame.playerName = nameInput !== "" ? nameInput : "nickname1204";
    
    const hudName = document.getElementById('ms-name-text');
    if (hudName) hudName.innerText = wGame.playerName;

    wPlayer.x = WORLD_CENTER; wPlayer.targetX = null;
    wBoss.x = WORLD_CENTER; wBoss.facing = 'left';
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
    wGame.strikeIndex = 0; wGame.phase = 'ready'; wGame.timer = 2000; 
    wGame.flashRed = 0; wGame.hasEvaluated = false; wGame.isPaused = false;
    
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
    
    // 🌟 完美通關變色處理 (透過 toggle / add Class 來切換狀態)
    const hitValueElem = document.getElementById('res-hits');
    hitValueElem.innerText = wGame.hits;
    
    const hitWrapper = hitValueElem.parentElement;
    
    if (wGame.hits === 0) {
        hitWrapper.classList.remove('hit-danger');
        hitWrapper.classList.add('hit-success');
    } else {
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
    wCanvas.width = WORLD_W; wCanvas.height = WORLD_H;
    
    window.addEventListener('keydown', e => { if(wKeys.hasOwnProperty(e.key)) wKeys[e.key] = true; });
    window.addEventListener('keyup', e => { if(wKeys.hasOwnProperty(e.key)) wKeys[e.key] = false; });
    
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const joyBase = document.getElementById('joystick-base');
    if (joyBase) {
        if (!isTouchDevice) joyBase.style.display = 'none';
        else {
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
                if (legType < 0.4) botLegs.push(safeX);
                else if (legType < 0.8) topLegs.push(safeX);
                else { botLegs.push(safeX); topLegs.push(safeX); }
                
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
        if (e.changedTouches[i].identifier === activeTouchId) { isOurTouchReleased = true; break; }
    }
    if (!isOurTouchReleased) return; 
    isJoyDragging = false; activeTouchId = null;
    const stick = document.getElementById('joystick-stick');
    stick.style.transform = `translate(0px, 0px)`; 
    stick.style.transition = 'transform 0.2s ease-out';
    mTouchLeft = false; mTouchRight = false;
}

function joyUpdate(touch) {
    const rect = document.getElementById('joystick-base').getBoundingClientRect();
    const stick = document.getElementById('joystick-stick');
    let dx = touch.clientX - (rect.left + rect.width / 2); 
    let dy = touch.clientY - (rect.top + rect.height / 2);
    let dist = Math.sqrt(dx * dx + dy * dy); 
    let maxR = (rect.width / 2) - (stick.offsetWidth / 2);
    if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
    stick.style.transform = `translate(${dx}px, ${dy}px)`;
    let threshold = maxR * 0.4; 
    mTouchLeft = dx < -threshold; 
    mTouchRight = dx > threshold;
}

function will_updateUI(text, color, subtext = "") {
    const statusEl = document.getElementById('will-status');
    const timerEl = document.getElementById('will-timer');
    if(statusEl) { statusEl.innerText = text; statusEl.style.color = color; }
    if(timerEl) timerEl.innerText = subtext;
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
        if(startOverlay) startOverlay.style.display = 'flex';
        if(resultOverlay) resultOverlay.style.display = 'none';
        if(hud) hud.style.display = 'none';
        if(joystick) joystick.style.display = 'none';
        
        const statusEl = document.getElementById('will-status');
        const timerEl = document.getElementById('will-timer');
        if(statusEl) statusEl.innerText = '';
        if(timerEl) timerEl.innerText = '';
        
        if(pnlMid) pnlMid.style.display = 'none'; 
        if(pnlBot) pnlBot.style.display = 'none'; 
        if(btnPause) btnPause.style.display = 'none';
        if(btnRestart) btnRestart.style.display = 'none';
        if(btnEnd) btnEnd.style.display = 'none';
    } 
    else if (state === 'PLAYING') {
        if(startOverlay) startOverlay.style.display = 'none';
        if(resultOverlay) resultOverlay.style.display = 'none';
        if(hud) hud.style.display = 'flex';
        if(joystick && isTouchDevice) joystick.style.display = 'flex';
        
        if(pnlMid) pnlMid.style.display = 'flex';
        if(pnlBot) pnlBot.style.display = 'flex';
        if(btnPause) btnPause.style.display = '';
        if(btnRestart) btnRestart.style.display = '';
        if(btnEnd) btnEnd.style.display = '';
    } 
    else if (state === 'RESULT') {
        if(startOverlay) startOverlay.style.display = 'none';
        if(resultOverlay) resultOverlay.style.display = 'flex';
        if(hud) hud.style.display = 'none';
        if(joystick) joystick.style.display = 'none';
        
        if(pnlMid) pnlMid.style.display = 'none';
        if(pnlBot) pnlBot.style.display = 'none';
        if(btnPause) btnPause.style.display = 'none';
        if(btnRestart) btnRestart.style.display = ''; 
        if(btnEnd) btnEnd.style.display = 'none';
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
    wGame.strikeIndex = 0; wGame.phase = 'ready'; wGame.timer = 1500; wPlayer.targetX = null; 
}

function will_update(dt) {
    if (wGame.isPaused || wGame.phase === 'stopped') return;

    let dx = 0;
    if (wKeys.ArrowLeft || wKeys.a || mTouchLeft) dx -= 1;
    if (wKeys.ArrowRight || wKeys.d || mTouchRight) dx += 1;

    let moveDistance = CONFIG.player.speed * (dt / 16.666);
    if (dx !== 0) {
        wPlayer.targetX = null; wPlayer.x += dx * moveDistance; wPlayer.facing = dx > 0 ? 'right' : 'left';
    }
    wPlayer.x = Math.max(0, Math.min(WORLD_W, wPlayer.x));

    let isMoving = (dx !== 0);
    if (isMoving) { tickSprite(wSprites.pWalk, dt); wSprites.pIdle.curr = 0; }
    else { tickSprite(wSprites.pIdle, dt); wSprites.pWalk.curr = 0; }
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
            wGame.phase = 'warn'; wGame.timer = CONFIG.time.warn;
            wSprites.crack.curr = 0; wSprites.legTop.curr = 0; wSprites.legBot.curr = 0; 
            wSprites.crack.tick = 0; wSprites.legTop.tick = 0; wSprites.legBot.tick = 0; 
            
            let qNumStr = wSettings.endless ? `${wGame.questionsAnswered + 1}` : `${wGame.questionsAnswered + 1}/${wGame.totalQuestions}`;
            let hintStr = will_getHintText(currPattern);
            will_updateUI(`第 ${qNumStr} 題`, "white", hintStr);
        }

        if (wGame.phase === 'warn' || wGame.phase === 'strike' || wGame.phase === 'idle') {
            tickSprite(wSprites.legTop, dt, false); tickSprite(wSprites.legBot, dt, false);
            if (currPattern.crack) tickSprite(wSprites.crack, dt, false);
        }

        if (wGame.phase === 'warn' && wGame.timer <= 0) {
            wGame.phase = 'strike'; wGame.timer = CONFIG.time.strike; wGame.hasEvaluated = false; 
        }
        else if (wGame.phase === 'strike') {
            if (!wGame.hasEvaluated && wSprites.legBot.curr >= 22 && wSprites.legBot.curr <= 25) {
                wGame.hasEvaluated = true; 
                let currentStrike = currPattern.strikes[wGame.strikeIndex];
                let inDangerZone = false;
                
                currentStrike.bot.forEach(dangerX => { if (Math.abs(wPlayer.x - dangerX) <= CONFIG.player.hitBot) inDangerZone = true; });
                currentStrike.top.forEach(dangerX => { if (Math.abs(wPlayer.x - dangerX) <= CONFIG.player.hitTop) inDangerZone = true; });

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
                wGame.phase = 'next_wait'; wGame.timer = 1000;
            } else {
                wGame.phase = 'warn'; wGame.timer = CONFIG.time.warn; 
                wSprites.legTop.curr = 0; wSprites.legBot.curr = 0; wSprites.legTop.tick = 0; wSprites.legBot.tick = 0; 
            }
        }
        else if (wGame.phase === 'next_wait' && wGame.timer <= 0) { will_nextQuestion(); }
    }
}

function will_draw() {
    wCtx.clearRect(0, 0, wCanvas.width, wCanvas.height);
    wCtx.imageSmoothingEnabled = true; wCtx.imageSmoothingQuality = 'high';

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
    if (bgImg.complete && bgImg.naturalWidth > 0) wCtx.drawImage(bgImg, 0, 0, WORLD_W, WORLD_H);

    if (wGame.phase !== 'ready' && wGame.phase !== 'victory' && wGame.phase !== 'stopped' && currPattern.crack) {
        will_drawSprite(wCtx, wAssets.crack, wSprites.crack, CONFIG.pos.crackX, CONFIG.pos.crackY, CONFIG.scale.crack, false, 'center');
    }

    // 🌟 將原本寫死的 WORLD_CENTER 改成 wBoss.x，並加上轉身機制
    let isBossFlipped = (wBoss.facing === 'right'); // 假設你的王圖預設是面向左
    will_drawSprite(wCtx, wAssets.boss, wSprites.boss, wBoss.x, CONFIG.pos.bossY, CONFIG.scale.boss, isBossFlipped, 'bottom-center');

    if ((wGame.phase === 'warn' || wGame.phase === 'strike' || wGame.phase === 'idle') && wGame.strikeIndex < currPattern.strikes.length) {
        let currentStrike = currPattern.strikes[wGame.strikeIndex];
        currentStrike.top.forEach(xPos => { will_drawSprite(wCtx, wAssets.legTop, wSprites.legTop, xPos + CONFIG.pos.legTopOffsetX, CONFIG.pos.legTopY, CONFIG.scale.legTop, false, 'top-center'); });
        currentStrike.bot.forEach(xPos => { will_drawSprite(wCtx, wAssets.legBot, wSprites.legBot, xPos + CONFIG.pos.legBotOffsetX, CONFIG.pos.legBotY, CONFIG.scale.legBot, false, 'bottom-center'); });
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
