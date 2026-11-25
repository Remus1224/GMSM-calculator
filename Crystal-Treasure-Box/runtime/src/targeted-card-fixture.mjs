// Manual row selection only. This module never imports or calls an RNG.
export function targetedFixtureKeys(entries, selectedKey, representative=false) {
  if(entries.length!==134||!entries.some(e=>e.officialSourceRowKey===selectedKey))throw Error('TARGET_ROW_NOT_IN_SELECTED_POOL');
  const keys=[selectedKey];
  if(representative){
    for(const grade of ['罕見','傳說','神話','古代','混沌']){
      const row=entries.find(e=>e.officialGrade===grade&&e.clientIdentity?.identityVerdict==='EXACT_CLIENT_IDENTITY')??entries.find(e=>e.officialGrade===grade);if(row)keys.push(row.officialSourceRowKey);
    }
    if(entries[0].pool==='NORMAL')for(const id of [55827,55387,55614]){
      const row=entries.find(e=>e.clientIdentity?.verifiedClientItemId===id);if(row)keys.push(row.officialSourceRowKey);
    }
  }
  const unique=[...new Set(keys)];return Array.from({length:11},(_,i)=>unique[i%unique.length]);
}

export function mountTargetedFixture({mode,host,pools,display,replay,autoOpen=true}) {
  if(mode!=='engineering')return null;
  const panel=document.createElement('section');panel.id='r6-targeted';
  panel.innerHTML=`<h3>R6 指定獎勵 · MANUAL_FIXTURE_ONLY</h3>
    <p>只展示，不抽樣、不計進度或額度。slot 1 為指定卡。</p>
    <label>獎池 <select id="r6-pool"><option>NORMAL</option><option>FEVER</option></select></label>
    <label>來源列／道具 <select id="r6-row" style="max-width:100%"></select></label>
    <button id="r6-show" type="button">顯示指定卡 ×11</button>
    <button id="r6-samples" type="button">顯示本池代表樣本11卡</button>
    <button id="r6-replay" type="button">同批卡回到未翻面</button>
    <p id="r6-status"></p><pre id="r6-receipt" style="max-height:160px;overflow:auto"></pre>`;
  host.prepend(panel);if(autoOpen)host.open=true;
  const $=id=>panel.querySelector('#'+id);
  const populate=()=>{const entries=pools[$('r6-pool').value];$('r6-row').replaceChildren(...entries.map(row=>{
    const o=document.createElement('option');o.value=row.officialSourceRowKey;
    o.textContent=`來源${row.officialSourceRow}／Excel${row.oddsSource.excelRow} · ${row.officialGrade??'非品級'} · ${row.announcementName} · ID ${row.clientIdentity?.verifiedClientItemId??'未唯一'}`;return o;
  }));};
  $('r6-pool').onchange=populate;populate();
  const run=async representative=>{try{
    const pool=$('r6-pool').value,keys=targetedFixtureKeys(pools[pool],$('r6-row').value,representative);
    $('r6-status').textContent='載入原有卡面……';await display(pool,keys);host.open=false;$('r6-status').textContent='已顯示；使用原畫面逐張翻卡／一次開啟／Confirm。';
  }catch(e){$('r6-status').textContent=String(e);}};
  $('r6-show').onclick=()=>run(false);$('r6-samples').onclick=()=>run(true);$('r6-replay').onclick=()=>{
    const accepted=replay();if(accepted)host.open=false;
    $('r6-status').textContent=accepted?'同一run與卡序已回到未翻面。':'請先顯示指定卡；沒有重抽或覆蓋其他流程。';
  };
  return panel;
}
