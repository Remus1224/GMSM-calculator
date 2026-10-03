/* Shared website-only contracts: notice severity, content/version zones and spacing. */
(() => {
 'use strict';
 const sectionSelectors='.ignore-layout-wrapper,.ignore-right-panel,.prog-resource-settings,.rune-category-panel,.authentic-world-panel,.genesis-panel,.tool-layout';
 const cardSelectors='.site-home-category,.app-grid,.grid-container,.rune-cards-grid,.authentic-rune-list,.authentic-region-cards,.hyper-skill-grid,.liberation-boss-list,.liberation-stage-list,.prog-core-groups,.core-row,.prog-stock-list,.prog-resource-grid,.consumption-grid,.notice-info-grid,.notice-timeline,.info-list';
 const fieldSelectors='.hexa-inputs,.level-setting-row,.hyper-profile-tabs,.prog-resource-stats';
 const rules={
  // Ignore keeps its original in-place BUG notice and game-version text; share spacing only.
  ignore:{title:'無視防禦計算機'},
  'hyper-stat':{title:'極限屬性計算機',gameVersion:'2026/07/29',remove:':scope > .hint'},
  rune:{title:'符文計算機',gameVersion:'2026/07/29',criticalSource:'.rune-version-notice',remove:'.rune-version-hint'},
  transcend:{title:'超越模擬器'},
  craft:{title:'製作模擬器'},
  'hexa-prog':{title:'六轉進度計算機',criticalSource:'.prog-common-note',remove:':scope > .hexa-progress-panel .prog-note'},
  liberation:{title:'創世解放與鍊成',gameVersion:'2026/07',criticalSource:'.liberation-data-notice',remove:'.liberation-version'},
  'hexa-visual':{title:'HEXA 屬性模擬器'},
  'hexa-lazy':{title:'HEXA 懶人重製表',operationSource:':scope > .hint'},
  'hexa-reset':{title:'HEXA 重置決策模擬',operationSource:':scope > .hint'},
  'hexa-sim':{title:'HEXA 目標機率模擬',operationSource:':scope > .hint'},
  will:{title:'威爾二階練習機',operationSource:':scope > .hint'},
  star:{title:'星力強化模擬器'},
  'acc-enhance':{title:'飾品強化模擬器'},
  'emb-enhance':{title:'紋章模擬器'}
 };
 const watchers=new WeakSet();
 const mountedRoots=new WeakMap();
 const make=(tag,className,text)=>{const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;};
 function spacing(root) {
  const mark=(parent,kind)=>{
   parent.dataset.siteSpace=kind;
   [...parent.children].filter(n=>!n.classList.contains('liquid_glass-cover')&&!n.classList.contains('liquid_glass-sharp')&&!n.classList.contains('liquid_glass-reflect')).forEach(n=>n.classList.add('site-space-item'));
  };
  [...root.children].filter(n=>!n.matches('script,style')).forEach(n=>n.classList.add('site-flow-item'));
  root.querySelectorAll(sectionSelectors).forEach(n=>mark(n,'sections'));
  root.querySelectorAll(cardSelectors).forEach(n=>mark(n,'cards'));
  root.querySelectorAll(fieldSelectors).forEach(n=>mark(n,'fields'));
 }
 function take(root,selector) {
  if(!selector)return '';
  const node=root.querySelector(selector);
  if(!node)return '';
  const text=node.textContent.trim().replace(/\s+/g,' ');
  node.remove();return text;
 }
 function material(node) {
  const G=window.GMSMGlass;
  if(!G)return;
  G.decorate(node);G.setCardRole(node,'info');
 }
 function noticeText(text){
  const content=make('span','site-note-text');
  // Keep clauses together when they fit; long clauses may still wrap on narrow screens.
  for(const phrase of text.match(/[^，,。；;！？!?]*[，,。；;！？!?]+[）」』】]*|[^，,。；;！？!?]+$/g)||[text]){
   content.append(make('span','site-note-phrase',phrase));
  }
  return content;
 }
 function alignNotice(root,notices,selector){
  const settings=root.querySelector(selector||'.settings-panel,.hexa-website-panel');
  let pending=false,lastWidth=-1;
  const number=value=>parseFloat(value)||0;
  const availableWidth=()=>{
   const style=getComputedStyle(root);
   const width=root.clientWidth-number(style.paddingLeft)-number(style.paddingRight);
   const settingsWidth=settings?.getBoundingClientRect().width;
   return settingsWidth>0?Math.min(width,settingsWidth):width;
  };
  const update=()=>{
   pending=false;
   const available=availableWidth();if(available<=0)return;
   lastWidth=available;
   // First wrap at the available width, then remove unused space beside the lines.
   notices.style.maxWidth=available+'px';notices.style.width='fit-content';
   let widest=0;
   notices.querySelectorAll('.site-tool-notice').forEach(row=>{
    const lines=[],walker=document.createTreeWalker(row,NodeFilter.SHOW_TEXT),range=document.createRange();
    for(let node=walker.nextNode();node;node=walker.nextNode()){
     range.selectNodeContents(node);
     for(const rect of range.getClientRects()){
      if(!rect.width)continue;
      let line=lines.find(line=>Math.abs(line.top-rect.top)<2);
      if(!line){line={top:rect.top,left:rect.left,right:rect.right};lines.push(line);}
      else {line.left=Math.min(line.left,rect.left);line.right=Math.max(line.right,rect.right);}
     }
    }
    for(const line of lines)widest=Math.max(widest,line.right-line.left);
   });
   if(!widest)return;
   const content=getComputedStyle(notices.querySelector('.liquid-surface-content')),surface=getComputedStyle(notices);
   const inset=number(content.paddingLeft)+number(content.paddingRight)+number(surface.borderLeftWidth)+number(surface.borderRightWidth);
   // Round outward so glyphs retain their current wrapping at fractional CSS pixels.
   notices.style.width=Math.min(available,Math.ceil(widest+inset+1))+'px';
  };
  const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
  new ResizeObserver(()=>{if(availableWidth()!==lastWidth)schedule();}).observe(root);
  if(settings)new ResizeObserver(schedule).observe(settings);
  new MutationObserver(schedule).observe(notices,{subtree:true,childList:true,characterData:true});
  document.fonts?.ready.then(schedule);schedule();
 }
 function mount(root,config) {
  if(!root||mountedRoots.get(root)?.parentElement===root)return;
  root.dataset.toolShell=config.id||config.title;
  root.classList.add('site-tool-flow');
  const critical=(config.critical||take(root,config.criticalSource)).replace(/（遊戲版本：[^）]*）/g,'').replace(/^💡\s*提示\s*[：:]\s*/,''),operation=(config.operation||take(root,config.operationSource)||'').replace(/^↻\s*/, '');
  if(config.remove)root.querySelectorAll(config.remove).forEach(n=>n.remove());
  const notices=make('aside','site-tool-notices');
  notices.setAttribute('aria-label','重要提醒');
  for(const [severity,text]of [['critical',critical],['operation',operation]]){
   if(!text)continue;
   const row=make('p','site-tool-notice');row.dataset.severity=severity;
   row.append(noticeText(text));notices.append(row);
  }
  const header=root.querySelector(':scope > .site-header,:scope > header');
  if(critical||operation){if(header)header.after(notices);else root.prepend(notices);}
  if(critical||operation){material(notices);alignNotice(root,notices,config.noticeWidthSource);}
  // Show only a supplied game-data version; never create an empty version card.
  if(config.gameVersion){
   const footer=config.footerNode||make('footer','');
   footer.classList.add('site-tool-version');
   // Keep the prayer table's export hook (.note-panel).
   footer.replaceChildren();
   const version=make('p','');
   version.append(make('span','site-version-line','遊戲版本 '+config.gameVersion));
   footer.append(version);root.append(footer);material(footer);
  }else config.footerNode?.remove();
  spacing(root);
  mountedRoots.set(root,root.firstElementChild);
  if(!watchers.has(root)){
   watchers.add(root);let pending=false;
   new MutationObserver(records=>{
    if(pending||!records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1)))return;
    pending=true;requestAnimationFrame(()=>{pending=false;spacing(root);});
   }).observe(root,{subtree:true,childList:true});
  }
 }
 window.GMSMToolShell=Object.freeze({mount,spacing});
 const init=()=>{
  for(const [id,config]of Object.entries(rules))mount(document.getElementById('tab-'+id),{...config,id});
  for(const id of ['home','notice']){
   const root=document.getElementById('tab-'+id);if(!root)continue;
   if(id==='home')root.querySelectorAll(':scope > .home-menu-category').forEach(title=>{
    const grid=title.nextElementSibling;if(!grid?.matches('.app-grid'))return;
    const group=make('section','site-home-category');title.before(group);group.append(title,grid);
   });
   root.classList.add('site-tool-flow');spacing(root);
  }
  if(document.body.classList.contains('generator-tool'))mount(document.querySelector('main.container'),{id:'1204',title:'1204 產生器'});
  if(document.body.classList.contains('pray-tool'))mount(document.querySelector('main.container'),{id:'pray',title:'光之聖所祈禱模擬器',operationSource:'#orientation-hint'});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
