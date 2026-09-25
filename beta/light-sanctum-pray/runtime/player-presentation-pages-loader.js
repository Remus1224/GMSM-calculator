(() => {
  "use strict";

  const BASE_PLAYER_URL = "player-presentation.js?v=20260926-preset-phase1-base";
  const FOLLOWUP_SCRIPTS = [
    "confirm-bypass-parent.js?v=20260926-click-audio2",
    "site-bridge.js",
    "click-audio.js?v=20260926-mobile-audio1"
  ];

  function fail(message, error) {
    const text = "Preset Phase 1 loader failed: " + message;
    console.error(text, error || "");
    const status = document.getElementById("status");
    if (status) status.textContent = text;
    document.documentElement.dataset.presetPhase1 = "failed";
  }

  function replaceOnce(source, label, needle, replacement) {
    const first = source.indexOf(needle);
    if (first < 0) throw new Error(label + ": anchor not found");
    if (source.indexOf(needle, first + needle.length) >= 0) throw new Error(label + ": anchor is not unique");
    return source.slice(0, first) + replacement + source.slice(first + needle.length);
  }

  function patchPlayer(source) {
    source = replaceOnce(
      source,
      "preset state owner",
      '  const gameplayState={level:1,accumulatedExp:0,slots:[null,null,null,null,null],locks:[false,false,false,false,false],characterCoin:1000000,meso:1000000000000,prayCount:0,effectBusy:false,isPending:false,skipConfirm:false,lastTrigger:"init",lastTransition:"none"};',
      '  const gameplayState={level:1,accumulatedExp:0,slots:[null,null,null,null,null],locks:[false,false,false,false,false],characterCoin:1000000,meso:1000000000000,prayCount:0,effectBusy:false,isPending:false,skipConfirm:false,lastTrigger:"init",lastTransition:"none"};\n' +
      '  gameplayState.activePreset=1;\n' +
      '  gameplayState.presets=[\n' +
      '    {slots:gameplayState.slots,locks:gameplayState.locks},\n' +
      '    {slots:[null,null,null,null,null],locks:[false,false,false,false,false]},\n' +
      '    {slots:[null,null,null,null,null],locks:[false,false,false,false,false]}\n' +
      '  ];'
    );

    source = replaceOnce(
      source,
      "preset hit cache",
      '  let gameplayRandomSerial=0,gameplayPrayButtonBoundsCache=null,gameplaySkipButtonBoundsCache=null,gameplayLockBoundsCache=new Map(),gameplayCommitFrame=0,gameplayVisualSerial=0,gameplayVisualInterruptCount=0,gameplayAcceptedPrayCount=0,gameplayPresentationTimingLast=null;',
      '  let gameplayRandomSerial=0,gameplayPrayButtonBoundsCache=null,gameplaySkipButtonBoundsCache=null,gameplayLockBoundsCache=new Map(),gameplayPresetBoundsCache=new Map(),gameplayCommitFrame=0,gameplayVisualSerial=0,gameplayVisualInterruptCount=0,gameplayAcceptedPrayCount=0,gameplayPresentationTimingLast=null;'
    );

    source = replaceOnce(
      source,
      "preset helpers",
      '  function gameplayUnlockLevel(slot){return gameplayUnlockLevelBySlot.get(Math.round(num(slot,-1)))??null}\n  function gameplaySlotCount(level=gameplayState.level){const lv=gameplayLevelInfo(level);return Math.max(0,Math.round(num(lv&&lv.slotCount,0)))}',
      '  function gameplayUnlockLevel(slot){return gameplayUnlockLevelBySlot.get(Math.round(num(slot,-1)))??null}\n' +
      '  function gameplayPresetCount(level=gameplayState.level){const lv=gameplayLevelInfo(level);return Math.max(1,Math.min(3,Math.round(num(lv&&lv.presetCount,1))))}\n' +
      '  function gameplayPresetUnlockLevel(presetIndex){const n=Math.max(1,Math.min(3,Math.round(num(presetIndex,1)))),hit=gameplayLevelsSorted.find(x=>Math.round(num(x&&x.presetCount,0))>=n);return hit?Math.round(num(hit.level,1)):null}\n' +
      '  function gameplaySyncPresetAlias(){const n=Math.max(1,Math.min(3,Math.round(num(gameplayState.activePreset,1)))),p=gameplayState.presets[n-1]||gameplayState.presets[0];gameplayState.activePreset=n;gameplayState.slots=p.slots;gameplayState.locks=p.locks}\n' +
      '  function gameplayEnsureAvailablePreset(){const max=gameplayPresetCount();if(gameplayState.activePreset>max){gameplayState.activePreset=max;gameplaySyncPresetAlias()}else gameplaySyncPresetAlias()}\n' +
      '  function gameplaySwitchPreset(presetIndex){const n=Math.max(1,Math.min(3,Math.round(num(presetIndex,0)))),max=gameplayPresetCount();if(n<1||n>max){const unlock=gameplayPresetUnlockLevel(n);status.textContent="祈禱 Preset "+n+" 尚未開放"+(unlock?"（Lv."+unlock+" 解鎖）":"");return false}if(n===gameplayState.activePreset)return true;if(gameplayState.isPending){status.textContent="上一個祈禱請求仍在 pending；暫不切換 Preset。";return false}gameplayInterruptVisual("PresetSwitch");gameplayCloseConfirm();gameplayState.activePreset=n;gameplaySyncPresetAlias();gameplayState.lastTrigger="Scene Preset "+n;gameplayState.lastTransition="PresetSwitch="+n;gameplayRenderSceneState();gameplayRenderSimStatus();if(gameplayPanelVisible())renderGameplayPanel();status.textContent="祈禱 Preset "+n+"｜Client OnChangePreset / presetIndex model";return true}\n' +
      '  function gameplaySlotCount(level=gameplayState.level){const lv=gameplayLevelInfo(level);return Math.max(0,Math.round(num(lv&&lv.slotCount,0)))}'
    );

    source = replaceOnce(
      source,
      "preset render states",
      '  function gameplayRenderSceneState(){const lv=gameplayLevelInfo(gameplayState.level)||gameplayLevelsSorted[0];if(!lv)return;const next=gameplayLevelInfo(gameplayState.level+1),isMax=!next,',
      '  function gameplayRenderSceneState(){const lv=gameplayLevelInfo(gameplayState.level)||gameplayLevelsSorted[0];if(!lv)return;gameplayEnsureAvailablePreset();const presetCount=gameplayPresetCount();for(let preset=1;preset<=3;preset++){const key=String(preset).padStart(2,"0"),base="VarB_107Popup/Group/Pray/preset/"+key,available=preset<=presetCount,selected=available&&preset===gameplayState.activePreset,unlock=gameplayPresetUnlockLevel(preset);gameplayRuntimeActive.set(base+"/on",selected);gameplayRuntimeActive.set(base+"/off",available&&!selected);gameplayRuntimeActive.set(base+"/lock",!available);gameplayRuntimeText.set(base+"/on/01",String(preset));gameplayRuntimeText.set(base+"/off/01",String(preset));if(unlock)gameplayRuntimeText.set(base+"/lock/01","Lv."+unlock)}const next=gameplayLevelInfo(gameplayState.level+1),isMax=!next,'
    );

    source = replaceOnce(
      source,
      "preset status",
      'if(gameplaySimStatus)gameplaySimStatus.textContent="Lv."+gameplayState.level+"｜EXP "+gameplayState.accumulatedExp.toLocaleString()+"｜Slot "+num(gameplayLevelInfo(gameplayState.level)&&gameplayLevelInfo(gameplayState.level).slotCount,0)+"｜Lock "+locked+',
      'if(gameplaySimStatus)gameplaySimStatus.textContent="Lv."+gameplayState.level+"｜Preset "+gameplayState.activePreset+"/"+gameplayPresetCount()+"｜EXP "+gameplayState.accumulatedExp.toLocaleString()+"｜Slot "+num(gameplayLevelInfo(gameplayState.level)&&gameplayLevelInfo(gameplayState.level).slotCount,0)+"｜Lock "+locked+'
    );

    source = replaceOnce(
      source,
      "debug clear all presets",
      'if(clearSlots){gameplayState.slots=[null,null,null,null,null];gameplayState.locks=[false,false,false,false,false]}',
      'if(clearSlots){for(const p of gameplayState.presets){p.slots=[null,null,null,null,null];p.locks=[false,false,false,false,false]}gameplaySyncPresetAlias()}'
    );

    source = replaceOnce(
      source,
      "debug level shrink all presets",
      'if(newSlotCount<oldSlotCount){for(let slot=newSlotCount;slot<gameplayState.slots.length;slot++){gameplayState.slots[slot]=null;gameplayState.locks[slot]=false}}',
      'if(newSlotCount<oldSlotCount){for(const p of gameplayState.presets)for(let slot=newSlotCount;slot<p.slots.length;slot++){p.slots[slot]=null;p.locks[slot]=false}}gameplayEnsureAvailablePreset()'
    );

    source = replaceOnce(
      source,
      "debug opened slots all presets",
      'for(let slot=oldSlotCount;slot<newSlotCount;slot++){newSlots.push(slot);gameplayState.locks[slot]=false}',
      'for(let slot=oldSlotCount;slot<newSlotCount;slot++){newSlots.push(slot);for(const p of gameplayState.presets)p.locks[slot]=false}'
    );

    source = replaceOnce(
      source,
      "reset all presets",
      'gameplayState.slots=[null,null,null,null,null];gameplayState.locks=[false,false,false,false,false];gameplayState.characterCoin=1000000;',
      'gameplayState.presets=[{slots:[null,null,null,null,null],locks:[false,false,false,false,false]},{slots:[null,null,null,null,null],locks:[false,false,false,false,false]},{slots:[null,null,null,null,null],locks:[false,false,false,false,false]}];gameplayState.activePreset=1;gameplaySyncPresetAlias();gameplayState.characterCoin=1000000;'
    );

    source = replaceOnce(
      source,
      "preset bounds",
      '  function gameplayLockButtonBounds(slot){const n=Math.round(num(slot,-1));if(gameplayLockBoundsCache.has(n))return gameplayLockBoundsCache.get(n);const base="VarB_107Popup/Group/Pray/Right/List/BlessList_"+n,bounds=gameplayBoundsForPath(base+"/BlessList_A/Lock")||gameplayBoundsForPath(base+"/BlessList_Locked/Lock");gameplayLockBoundsCache.set(n,bounds);return bounds}\n  function gameplayInvalidateHitBounds(){gameplayPrayButtonBoundsCache=null;gameplaySkipButtonBoundsCache=null;gameplayLockBoundsCache.clear()}',
      '  function gameplayLockButtonBounds(slot){const n=Math.round(num(slot,-1));if(gameplayLockBoundsCache.has(n))return gameplayLockBoundsCache.get(n);const base="VarB_107Popup/Group/Pray/Right/List/BlessList_"+n,bounds=gameplayBoundsForPath(base+"/BlessList_A/Lock")||gameplayBoundsForPath(base+"/BlessList_Locked/Lock");gameplayLockBoundsCache.set(n,bounds);return bounds}\n' +
      '  function gameplayPresetButtonBounds(presetIndex){const n=Math.max(1,Math.min(3,Math.round(num(presetIndex,1))));if(gameplayPresetBoundsCache.has(n))return gameplayPresetBoundsCache.get(n);const base="VarB_107Popup/Group/Pray/preset/"+String(n).padStart(2,"0"),bounds=gameplayBoundsForPath(base);gameplayPresetBoundsCache.set(n,bounds);return bounds}\n' +
      '  function gameplayPresetHitFromPoint(p){for(let preset=1;preset<=3;preset++)if(gameplayPointInRect(p,gameplayPresetButtonBounds(preset)))return preset;return 0}\n' +
      '  function gameplayInvalidateHitBounds(){gameplayPrayButtonBoundsCache=null;gameplaySkipButtonBoundsCache=null;gameplayLockBoundsCache.clear();gameplayPresetBoundsCache.clear()}'
    );

    source = replaceOnce(
      source,
      "preset click",
      'canvas.addEventListener("click",ev=>{const p=gameplayCanvasPoint(ev);if(isPrayConfirmPopupScene){const action=prayConfirmButtonHit(p);if(action&&window.parent&&window.parent!==window)window.parent.postMessage({type:"maplem-pray-confirm-action",action},"*");return}const lockSlot=gameplaySceneLockHitFromPoint(p);',
      'canvas.addEventListener("click",ev=>{const p=gameplayCanvasPoint(ev);if(isPrayConfirmPopupScene){const action=prayConfirmButtonHit(p);if(action&&window.parent&&window.parent!==window)window.parent.postMessage({type:"maplem-pray-confirm-action",action},"*");return}const presetHit=gameplayPresetHitFromPoint(p);if(presetHit){gameplaySwitchPreset(presetHit);return}const lockSlot=gameplaySceneLockHitFromPoint(p);'
    );

    source = replaceOnce(
      source,
      "preset hover",
      'canvas.style.cursor=(gameplaySceneLockHitFromPoint(p)>=0||gameplayPointInRect(p,gameplaySkipButtonBounds())||gameplayPointInRect(p,gameplayPrayButtonBounds()))?"pointer":"default"',
      'const presetHit=gameplayPresetHitFromPoint(p),presetClickable=presetHit>0&&presetHit<=gameplayPresetCount();canvas.style.cursor=(presetClickable||gameplaySceneLockHitFromPoint(p)>=0||gameplayPointInRect(p,gameplaySkipButtonBounds())||gameplayPointInRect(p,gameplayPrayButtonBounds()))?"pointer":"default"'
    );

    source = replaceOnce(
      source,
      "preset diagnostic API",
      '  window.MAPLEM_PRAY_PRESENTATION_TIMING={last:()=>gameplayPresentationTimingLast?JSON.parse(JSON.stringify(gameplayPresentationTimingLast)):null};',
      '  window.MAPLEM_PRAY_PRESENTATION_TIMING={last:()=>gameplayPresentationTimingLast?JSON.parse(JSON.stringify(gameplayPresentationTimingLast)):null};\n' +
      '  window.MAPLEM_PRAY_PRESETS={snapshot:()=>({activePreset:gameplayState.activePreset,availablePresetCount:gameplayPresetCount(),unlockLevels:[1,2,3].map(gameplayPresetUnlockLevel),presets:gameplayState.presets.map((p,index)=>({preset:index+1,slots:p.slots.map(x=>x?{gradeInfoIndex:num(x.gradeInfoIndex,-1),optionCodeHash:String(x.optionCodeHash||""),optionValueRaw:num(x.optionValueRaw,0),displayText:gameplayOutcomeText(x)}:null),locks:p.locks.slice()}))})};'
    );

    return source;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("failed to load " + src));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    try {
      const response = await fetch(BASE_PLAYER_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("base player HTTP " + response.status);
      const original = await response.text();
      const patched = patchPlayer(original);
      const blob = new Blob([patched], { type: "text/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      try {
        await loadScript(blobUrl);
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
      for (const src of FOLLOWUP_SCRIPTS) await loadScript(src);
      document.documentElement.dataset.presetPhase1 = "ready";
      window.MAPLEM_PRAY_PRESET_PHASE1 = {
        ready: true,
        evidence: {
          onChangePreset: "SantuaryOfLightPopupFunc.OnChangePreset(int presetIndex)",
          currentPresetIndex: "SanctuaryOfLightStatFunc.GetCurrentPresetIndex()",
          slotOwner: "SearchStatSlot(presetIndex, slotIndex) / UpdateStatGrade(presetIndex, slotIndex, ..., locked)",
          availability: "LevelInfo.presetCount / GetPresetUnlockLevel(presetIndex)"
        }
      };
    } catch (error) {
      fail(error && error.message ? error.message : String(error), error);
    }
  }

  boot();
})();
