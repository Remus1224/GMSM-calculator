import {createPlayerRecords} from './player-records.mjs?v=2';
const playerRecords=createPlayerRecords({onChange:()=>window.dispatchEvent(new Event('crystalchest-player-state'))});
import {fetchResource as fetch,loadImage,resourceSnapshot,measureStartup} from './resource-loader.mjs?startupProbe=1';
import { createFrameLoadQueue } from './fx-frame-load-queue.mjs';
import {sha256Digest} from './sha256-http-compat.mjs';
import * as compactLuckyTools from './compact-lucky-atlas.mjs?startupProbe=1';
window.__releaseLuckyTools={...compactLuckyTools,sha256Digest,loadImage};
import { cardResultVisualPolicy, retryVoucherQuantity } from './card-result-visual-policy.mjs?r31r5=20261105a';
import { createProbabilityInfoModal } from './probability-info-modal.mjs?p11d6=20261109';
const p31Ui=await fetch('data/r14p31-single-ui.json?r31r5=20261105').then(r=>{if(!r.ok)throw Error('P31_UI_CONTRACT_REQUIRED');return measureStartup('data.body-and-json',()=>r.json(),r.url);});
import { createNormalLocalSimulator } from './normal-local-simulation.mjs?r12p3=20261031a';
import { createNormalLocalFullFlowController } from './normal-local-full-flow.mjs?r14p10=20261107a';
import { createLocalFeverSimulation, isFinalLocalFeverRunConfirmEligible } from './local-fever-simulation.mjs?r12p4r12=20261101a';
import { createFeverLocalSimulator } from './fever-local-simulation.mjs';
import { createFlipAllBatch, advanceFlipAllBatch, finishFlipAllBatch } from './flip-all-scheduler.mjs';
import { createLuckyFeverOverlay } from './lucky-fever-overlay.mjs?costProbe=15';
import { evaluateLuckyFeverPurchase } from './lucky-fever-probability.mjs?r12p3=20261031a';
import { resolveMovieForRows as resolveP5MovieForRows } from './movie-selector-p5.mjs?r14p5r1=20261107a';
import { createMovieSelectorP6Pending, resumeMovieSelectorP6Manually } from './movie-selector-p6-resume.mjs?r14p6=20261107a';
import { validateP9EquivalenceAdapter, P9_P5_RUNTIME_SHA256, P9_ADAPTER_SHA256 } from './movie-selector-p9-equivalence.mjs?r14p9=20261107c';
import { appendBoundedHistory } from './run-metrics-retention.mjs?p12a15p2=20261112';
import { createShopTargetSyncCache, shopTargetStateKey, applyShopTargetStateIfChanged, shouldPublishFeverBackgroundReceipt } from './shop-idle-render-sync.mjs?p12a16=20261113';

// P3R1 engine import/preparation overlaps initial app assets; no await on Unity or particle activation.
const r14p30P3EarlyQuery=new URLSearchParams(window.location.search);
const r14p30P3EarlyPromise=r14p30P3EarlyQuery.get('r14p30P3')!=='0'?import('./p3-canvas-background.mjs?v=3&startupProbe=1').then(m=>m.createOneTimeBackgroundMotion({redraw:()=>window.cleanRebuild?.requestFXRender?.('p3'),onStatus:s=>{const receipt=document.getElementById('p30p3-receipt');if(receipt)receipt.textContent=JSON.stringify(s.timing?.shopReadyAt===null?s:(window.__r14p30P3?.snapshot()??s),null,2);const note=document.getElementById('p30p3-status');if(note){const message=s.error?'來源播放器停止：'+s.error:!s.applicable?(s.ready?'引擎已預備；三組粒子尚未啟動。':'背景引擎預備中；不阻塞商店或影片。'):s.loading?'冷啟動尚未完成；卡片照常顯示，時間收據標記 COLD_NOT_READY。':s.ready?'三組原始 Box2 持續播放；'+(s.variant==='motion'?'B 有動畫':'A 隱藏動畫，保留同一粒子時鐘')+'。':'等待來源播放器。';if(note.textContent!==message)note.textContent=message;}}})):null;

// New renderer for saved serialized data. NGUI live draw-call construction is unresolved.
// R14-P28-P5: player-approved original Chaos Grade source is the Web default.
// Explicit r14p28P4R2=0 restores legacy neutral diagnostic; r14p28P3=1
// selects historical DarkBlue comparison unless P4R2 is explicitly forced on.
const r14p28Params=new URLSearchParams(window.location.search);
const r14p5MovieParams=new URLSearchParams(window.location.search);
// P11-D5: all Player URLs use the same in-stage shop and render route. The old
// preview query remains an accepted alias; engineering still requires explicit opt-in.
const p11InStageShellEnabled=r14p5MovieParams.get('mode')==='player'||(r14p5MovieParams.get('mode')==='engineering'&&r14p5MovieParams.get('r14p30P1B')==='1'&&r14p5MovieParams.get('p11ShellPreview')==='inStage');
// P12-B5R2 controlled admission: improve only the five accepted shell labels below 1:1.
const p12B5FormalPlayerRoute=r14p5MovieParams.get('mode')==='player';
let p12B5TextRasterEnabled=p12B5FormalPlayerRoute&&r14p5MovieParams.get('p12b5r2Disable')!=='1';
const r14p5MovieEnabled=r14p5MovieParams.get('mode')==='engineering'&&r14p5MovieParams.get('movieSelectorP5')==='1';
const r14p10PlayerEnabled=r14p5MovieParams.get('mode')==='player';
const movieSelectorSourcesEnabled=r14p10PlayerEnabled||r14p5MovieEnabled;
const r14p28P4R2Flag=r14p28Params.get('r14p28P4R2');
const r14p28P3Requested=r14p28Params.get('r14p28P3')==='1';
// R14-P29-P2: player-accepted P29 movie + row82 icon join is ON by default.
// Explicit r14p29P1=0 opts out to the historical P5R1 behavior for comparison only.
const r14p29P1Enabled=r14p28Params.get('r14p29P1')!=='0';
const r14p28P4R2Enabled=r14p28P4R2Flag==='1'||(r14p28P4R2Flag!=='0'&&!r14p28P3Requested);
const r14p28P3Enabled=!r14p28P4R2Enabled&&r14p28P3Requested;
const $=id=>document.getElementById(id);
const luckyFeverOverlay=createLuckyFeverOverlay();
let luckyFeverDiagnosticSequence=0,normalSingleLuckyFeverSequence=0;
const localFeverSimulation=createLocalFeverSimulation();
const [ui,raw,fixtures,manifest,blocker,fxData,nonFxAssets,normalCardPreviewIconAdmission,normalR5VisualContract,normalR6VisualContract,feverLocalVisualAdmission]=await Promise.all(['data/scene-ui.json?r31r5=20261105','data/popup-serialized.json?r31r5=20261105','data/fixtures.json?r31r5=20261105',(r14p28P4R2Enabled?'data/ASSET_MANIFEST-p28p4r2.json?r31r5=20261105':'ASSET_MANIFEST.json?normalR2CardAssets=20261029d'),'data/inputblocker-source.json?r31r5=20261105','data/fx-r4.json?r31r5=20261105','data/nonfx-assets.json?r31r5=20261105','data/normal-r3-result-preview-icon-admission.json?r31r5=20261105','data/normal-r5-visual-contract.json?r31r5=20261105','data/normal-r6-visual-contract.json?r31r5=20261105',(r14p28P4R2Enabled?'data/fever-local-visual-admission-p28p4r2.json?r31r6=20261105':(r14p28P3Enabled?'data/fever-local-visual-admission-p28p3.json?r31r6=20261105':'data/fever-local-visual-admission.json?r31r6=20261105'))].map(async p=>{const r=await fetch(p);if(!r.ok)throw Error(p+' '+r.status);return measureStartup('data.body-and-json',()=>r.json(),r.url);}));
async function movieSelectorSha256(text){const bytes=await sha256Digest(new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(byte=>byte.toString(16).padStart(2,'0')).join('').toUpperCase();}
let movieSelectorP5Text=null,movieSelectorP9Text=null,movieSelectorLoadError=null;
if(movieSelectorSourcesEnabled){
 try{
  const [p5Response,p9Response]=await Promise.all([fetch('data/movie-selector-p5-admission.json?r14p10=20261107a'),fetch('data/movie-selector-p9-equivalence.json?r14p10=20261107a')]);
  if(!p5Response.ok||!p9Response.ok)throw Error(`SOURCE_HTTP_${p5Response.status}_${p9Response.status}`);
  [movieSelectorP5Text,movieSelectorP9Text]=await Promise.all([p5Response.text(),p9Response.text()]);
 }catch(error){movieSelectorLoadError=String(error);}
}
const movieSelectorP5Hash=movieSelectorP5Text?await movieSelectorSha256(movieSelectorP5Text):null;
const movieSelectorP5Admission=(()=>{try{return movieSelectorP5Text?JSON.parse(movieSelectorP5Text):null;}catch(error){movieSelectorLoadError=String(error);return null;}})();
const movieSelectorP5HashValid=movieSelectorP5Hash===P9_P5_RUNTIME_SHA256;
const movieSelectorP5StructureValid=movieSelectorP5Admission?.schema==='CrystalChest.MovieSelectorP5.RuntimeAdmission.v1'&&movieSelectorP5Admission?.sourceAdmissionSha256==='AAC2576EDDFA363C3A5F610A3510DC76FE78811588721B6EDB3F7FD3F2E94C50'&&Array.isArray(movieSelectorP5Admission?.rows)&&movieSelectorP5Admission.rows.length===268&&movieSelectorP5Admission.rows.every(row=>typeof row.sourceRowKey==='string'&&['NORMAL','FEVER'].includes(row.pool))&&new Set(movieSelectorP5Admission.rows.map(row=>row.sourceRowKey)).size===268;
const movieSelectorP9Hash=movieSelectorP9Text?await movieSelectorSha256(movieSelectorP9Text):null;
const movieSelectorP9Equivalence=(()=>{try{return movieSelectorP9Text&&movieSelectorP9Hash===P9_ADAPTER_SHA256?JSON.parse(movieSelectorP9Text):null;}catch(error){movieSelectorLoadError=String(error);return null;}})();
const movieSelectorP9Validation=movieSelectorSourcesEnabled?(movieSelectorP5HashValid&&movieSelectorP5StructureValid&&movieSelectorP9Hash===P9_ADAPTER_SHA256?validateP9EquivalenceAdapter({adapter:movieSelectorP9Equivalence,p5Admission:movieSelectorP5Admission}):{ok:false,reason:movieSelectorLoadError?'SOURCE_LOAD_FAILED':!movieSelectorP5HashValid?'P5_RUNTIME_ADMISSION_HASH_MISMATCH':!movieSelectorP5StructureValid?'P5_RUNTIME_ADMISSION_STRUCTURE_INVALID':'P9_ADAPTER_HASH_MISMATCH'}):{ok:false,reason:'PLAYER_OR_ENGINEERING_OPT_IN_DISABLED'};
const movieSelectorSourcesReady=movieSelectorSourcesEnabled&&movieSelectorP5HashValid&&movieSelectorP5StructureValid&&movieSelectorP9Validation.ok;
const movieSelectorP9ByRowKey=new Map(movieSelectorP9Validation.ok?movieSelectorP9Equivalence.rows.map(row=>[row.sourceRowKey,row]):[]);
const movieSelectorP5ByRowKey=new Map(((movieSelectorSourcesReady&&movieSelectorP5Admission?.rows)||[]).map(row=>[row.sourceRowKey,row]));
const movieSelectorManualControl=$('movie-selector-manual-controls');if(movieSelectorManualControl)movieSelectorManualControl.hidden=r14p10PlayerEnabled;
const p10MovieRuntimeDecisions=[];
function recordP10MovieDecision({pool,runId,results,selection}){if(!r14p10PlayerEnabled)return null;playerRecords.recordRun({pool,runId,results});const rowKeys=(results||[]).map(row=>row?.sourceRowKey??null);let receipt=p10MovieRuntimeDecisions.find(row=>row.runId===runId);if(!receipt){receipt={classification:'WEB_CONDITIONAL_MOVIE_SELECTOR',runId,pool,sourceRowKeys:rowKeys,selectionStatus:selection?.status??'UNRESOLVED_INPUT',movie:selection?.movie??null,movieIndex:selection?.movieIndex??null,movieFile:selection?.movie?nonFxAssets.movieSelection.movies[selection.movie]?.file??null:null,decisionSourceCounts:selection?.decisionSourceCounts??null,skip:null,playbackEnd:null,playerMode:true,nativeDefine2128:'UNRESOLVED',nativeParity:'NOT_CLAIMED',safeRecovery:null};p10MovieRuntimeDecisions.push(receipt);}else Object.assign(receipt,{pool,sourceRowKeys:rowKeys,selectionStatus:selection?.status??'UNRESOLVED_INPUT',movie:selection?.movie??null,movieIndex:selection?.movieIndex??null,movieFile:selection?.movie?nonFxAssets.movieSelection.movies[selection.movie]?.file??null:null,decisionSourceCounts:selection?.decisionSourceCounts??null});return receipt;}
function updateP10MoviePlayback(runId,trigger){if(!r14p10PlayerEnabled)return;const receipt=[...p10MovieRuntimeDecisions].reverse().find(row=>row.runId===runId);if(receipt){receipt.skip=trigger==='skip';receipt.playbackEnd=trigger;}}
function updateP10NoMovieRecovery(runId,reason){if(!r14p10PlayerEnabled)return;const receipt=[...p10MovieRuntimeDecisions].reverse().find(row=>row.runId===runId);if(receipt){receipt.movie=null;receipt.movieIndex=null;receipt.movieFile=null;receipt.safeRecovery='CONTINUE_SAME_RESULT_BATCH_WITHOUT_VIDEO';receipt.safeRecoveryReason=reason;}}
window.__p10MovieSelector=Object.freeze({buildId:'P10_WEB_CONDITIONAL_MOVIE_SELECTOR_20261107A',enabled:r14p10PlayerEnabled,classification:'WEB_CONDITIONAL_MOVIE_SELECTOR',snapshot:()=>({enabled:r14p10PlayerEnabled,sourcesReady:movieSelectorSourcesReady,p5HashValid:movieSelectorP5HashValid,p5RowCount:movieSelectorP5ByRowKey.size,p9Validation:movieSelectorP9Validation,define2128:'UNRESOLVED',nativeParity:'NOT_CLAIMED',decisions:p10MovieRuntimeDecisions.map(row=>({...row,sourceRowKeys:[...row.sourceRowKeys]}))})});
const canvas=$('scene');let ctx=canvas.getContext('2d'),canvasResolutionProbeEnabled=false,canvasRenderScale=1,visualQualityMeasurement=null,lastVisualQualityRenderMs=null;
const imageCache=new Map();
async function image(path){if(!imageCache.has(path)){imageCache.set(path,loadImage(path).catch(error=>{imageCache.delete(path);throw error;}));}return imageCache.get(path);}
const needed=new Set(Object.values(manifest.textures).map(a=>a.file));
needed.add(p31Ui.voucher.file);
const p11StoreTitleBgPath='assets/p11-s1r5/com_title_bar.png',p11StoreLeftBgPath='assets/p11-s1r5/com_tap_n.png';
const p11EventStoreLabelPath='assets/ui/p11-event-store-label.png';
needed.add(p11StoreTitleBgPath);needed.add(p11StoreLeftBgPath);
if(p11InStageShellEnabled)needed.add(p11EventStoreLabelPath);
manifest.cards.back_unique={file:'assets/cards/ui_item_card_lucky_back_unique.png',sha256:'81e2917b1383ae1b0d5171160fbbc68fb8008449cad863f2371bcfc065a7decb',pathID:'-1320679715914715803',bundle:'6588604.msm'};
Object.values(manifest.cards).forEach(a=>needed.add(a.file));Object.values(manifest.items).forEach(a=>needed.add(a.file));
needed.add(nonFxAssets.movieSkip.art.background.file);needed.add(nonFxAssets.movieSkip.art.arrow.file);
await window.crystalChestEnsureNameFont((manifest.fontFixture.runtimeFile||manifest.fontFixture.file));
const loaded=await Promise.all([...needed].map(async p=>[p,await image(p)]));const imgs=new Map(loaded);
const normalLocalCardAssetBySourceSha=new Map(Object.values(manifest.cards).map(asset=>[asset.sourceReferenceSha256||asset.sha256,asset]));
if(normalCardPreviewIconAdmission.schema!=='CrystalChest.NormalR3.IconAdmission.v1'||!Array.isArray(normalCardPreviewIconAdmission.rows))throw Error('NORMAL_R3_ICON_ADMISSION_INVALID');
const normalLocalPreviewIconByRowKey=new Map(normalCardPreviewIconAdmission.rows.map(row=>[row.sourceRowKey,row]));
if(normalR5VisualContract.schema!=='CrystalChest.NormalR5.VisualContract.v1'||!Array.isArray(normalR5VisualContract.entries))throw Error('NORMAL_R5_VISUAL_CONTRACT_INVALID');
const normalLocalVisualContractByRowKey=new Map(normalR5VisualContract.entries.map(row=>[row.sourceRowKey,row]));
if(normalR6VisualContract.schema!=='CrystalChest.NormalR6.VisualContract.v1'||!Array.isArray(normalR6VisualContract.entries))throw Error('NORMAL_R6_VISUAL_CONTRACT_INVALID');
const normalLocalR6VisualContractByRowKey=new Map(normalR6VisualContract.entries.map(row=>[row.sourceRowKey,row]));
if(feverLocalVisualAdmission.schema!=='CrystalChest.FeverLocalVisualAdmission.v1'||feverLocalVisualAdmission.classification!=='WEB_SIMULATION_ONLY_NOT_NATIVE_FEVER_RESULT_CONTRACT'||!Array.isArray(feverLocalVisualAdmission.rows)||feverLocalVisualAdmission.rows.length!==134)throw Error('FEVER_LOCAL_VISUAL_ADMISSION_INVALID');
const feverLocalVisualAdmissionByRowKey=new Map(feverLocalVisualAdmission.rows.map(row=>[row.sourceRowKey,row]));
function movieP5StatusText(selection){if(r14p10PlayerEnabled){if(selection?.status==='CANDIDATE'){const counts=selection.decisionSourceCounts||{};return `WEB_CONDITIONAL_MOVIE_SELECTOR：${selection.movie}/movieIndex ${selection.movieIndex}；來源 exact ${counts.exact??'未知'}、equivalent ${counts.equivalent??'未知'}；Define 2128 與 Native parity 未確認。`;}return `Player 自動選片安全停止：${selection?.status||'UNRESOLVED_INPUT'}；保留本次結果，不重抽。`; }if(!r14p5MovieEnabled||$('movie-selector-p5-mode')?.value!=='auto')return `手動 Fixture：${selection?.movie||$('movie-source')?.value||'N'} 影片；不按獎勵自動選片。`;if(selection?.status==='CANDIDATE'){const counts=selection.decisionSourceCounts||{};return `AUTO_CONDITIONAL_WEB_CANDIDATE_DEFINE2128_ON：${selection.movie}/movieIndex ${selection.movieIndex}；來源 exact ${counts.exact??'未知'}、equivalent ${counts.equivalent??'未知'}；ENGINEERING_FIXTURE_ONLY。Define 2128 與 Native parity 未確認。`;}return `自動選片未完成：${selection?.status||'UNRESOLVED_INPUT'}；沒有自動 N 或替代影片。`; }
function resolveMovieP5ForRows(pool,results){const autoMode=r14p10PlayerEnabled||(r14p5MovieEnabled&&$('movie-selector-p5-mode')?.value==='auto');let selection=!movieSelectorSourcesReady&&autoMode?{status:'UNRESOLVED_INPUT',reason:movieSelectorP9Validation.reason||movieSelectorLoadError||'SOURCE_ADMISSION_NOT_READY'}:resolveP5MovieForRows({pool,results,admissionByRowKey:movieSelectorP5ByRowKey,decisionEquivalentByRowKey:movieSelectorP9Validation.ok?movieSelectorP9ByRowKey:null,manualMovie:$('movie-source')?.value||'N',mode:autoMode?'auto':'manual',minEquipLevel:movieSelectorP5Admission?.minEquipLevel??1});if(r14p10PlayerEnabled&&selection.status==='CANDIDATE')selection={...selection,classification:'WEB_CONDITIONAL_MOVIE_SELECTOR',nativeDefine2128:'UNRESOLVED',nativeParity:'NOT_CLAIMED'};window.__r14p5LastMovieSelection=selection;const status=$('movie-selector-p5-status');if(status)status.textContent=movieP5StatusText(selection);return selection;}
window.__r14p5MovieSelector=Object.freeze({buildId:'R14P9_EQUIVALENCE_ENGINEERING_CANDIDATE_20261107A',enabled:r14p5MovieEnabled,classification:'ENGINEERING_FIXTURE_ONLY_DEFINE2128_ON_CONDITIONAL_NOT_NATIVE_ACTIVE_RULE',snapshot:()=>({enabled:r14p5MovieEnabled,mode:$('movie-selector-p5-mode')?.value??'MANUAL',rowAdmissionCount:movieSelectorP5ByRowKey.size,normalDrawCount:movieSelectorP5Admission?.rows.filter(row=>row.pool==='NORMAL').length??0,feverDrawCount:movieSelectorP5Admission?.rows.filter(row=>row.pool==='FEVER').length??0,sourceAdmissionSha256:movieSelectorP5Admission?.sourceAdmissionSha256??null,p5RuntimeHashValid:movieSelectorP5HashValid,p5RuntimeSha256:movieSelectorP5Hash,equivalenceValidation:movieSelectorP9Validation,adapterSha256:movieSelectorP9Hash,ambiguousRowCount:movieSelectorP9ByRowKey.size,activityDefine2128:'UNRESOLVED',nativeParity:'NOT_CLAIMED',lastSelection:window.__r14p5LastMovieSelection??null}),resolveRows:(pool,sourceRowKeys)=>{if(!r14p5MovieEnabled||$('movie-selector-p5-mode')?.value!=='auto')return {status:'ENGINEERING_AUTO_MODE_REQUIRED'};if(!Array.isArray(sourceRowKeys))return {status:'UNRESOLVED_INPUT',reason:'SOURCE_ROW_KEYS_REQUIRED'};return resolveMovieP5ForRows(pool,sourceRowKeys.map(sourceRowKey=>({sourceRowKey})));}});
window.__r14p28P3=Object.freeze({buildId:'R14P28P3_CHAOS_CARD_ADMISSION_20261103A',enabled:r14p28P3Enabled,classification:'OPT_IN_WEB_ANNOUNCEMENT_GRADE_CANDIDATE_NOT_NATIVE_PARITY',snapshot:()=>({enabled:r14p28P3Enabled,buildId:'R14P28P3_CHAOS_CARD_ADMISSION_20261103A',chaosRows:feverLocalVisualAdmission.rows.filter(row=>row.officialGrade==='混沌').length,chaosAdmitted:feverLocalVisualAdmission.rows.filter(row=>row.officialGrade==='混沌'&&row.visualStatus==='CARD_DISPLAY_ADMITTED_WEB_ONLY'&&row.card?.gradeOverlay?.assetKey==='grade_ancient').length,sourceFile:r14p28P3Enabled?'fever-local-visual-admission-p28p3.json':'fever-local-visual-admission.json',nativeParity:'NOT_CLAIMED',gradeOverlayEvidence:'WEB_ONLY_NOT_NATIVE_CHAOS_PROVEN'})});
window.__r14p28P4R2=Object.freeze({buildId:'R14P28P4R2_ORIGINAL_CHAOS_GRADE_SOURCE_20261103A',enabled:r14p28P4R2Enabled,classification:'SOURCE_BOUND_GRADE_PNG_WEB_ANNOUNCEMENT_STYLE_NOT_LIVE_FEVER_PARITY',snapshot:()=>({enabled:r14p28P4R2Enabled,buildId:'R14P28P4R2_ORIGINAL_CHAOS_GRADE_SOURCE_20261103A',chaosRows:feverLocalVisualAdmission.rows.filter(row=>row.officialGrade==='混沌').length,chaosAdmitted:feverLocalVisualAdmission.rows.filter(row=>row.officialGrade==='混沌'&&row.visualStatus==='CARD_DISPLAY_ADMITTED_WEB_ONLY'&&row.card?.gradeOverlay?.assetKey==='grade_chaos').length,sourceFile:r14p28P4R2Enabled?'fever-local-visual-admission-p28p4r2.json':r14p28P3Enabled?'fever-local-visual-admission-p28p3.json':'fever-local-visual-admission.json',assetName:'inven_item_lv_pink86',expectedSourcePngSha256:'a52b0decbb8b84c448fffec69b29e10ec8153ef97b0ed60f6704c3ad7a2ecaa6',nativeParity:'NOT_CLAIMED',liveResultGrade:'UNKNOWN'})});
window.__r14p29P1=Object.freeze({buildId:'R14P29P1_FEVER_MOVIE_AND_VERIFIED_ICON_JOIN_20261103A',enabled:r14p29P1Enabled,snapshot:()=>({enabled:r14p29P1Enabled,buildId:'R14P29P1_FEVER_MOVIE_AND_VERIFIED_ICON_JOIN_20261103A',movieSelection:'MANUAL_NATIVE_FIXTURE_N_H_R_NOT_OFFICIAL_AUTO_SELECTION',feverMoviePhase:typeof feverTenPendingRun==='undefined'?null:feverTenPendingRun?.phase??null,feverMovieKey:typeof feverTenPendingRun==='undefined'?null:feverTenPendingRun?.movieKey??null,feverRunId:typeof feverTenPendingRun==='undefined'?null:feverTenPendingRun?.runId??null,feverRow82IconMapKey:'LEGACY_SOURCE_PNG_SHA__P29_DEFAULT_OPT_OUT_AVAILABLE',feverRow82ExpectedRuntimeAsset:'assets/icons/c771b94dd2e97310063c039dd208601466738e4de150f998b8d074410c61213e.png',feverRow82Admission:(()=>{const entry=[...feverLocalPoolEntryByRowKey.values()].find(row=>row.officialSourceRow===82);if(!entry)return 'POOL_NOT_INITIALIZED';const gate=feverLocalRowContract(entry);return gate.plan?'CARD_DISPLAY_ADMITTED_WEB_ONLY':gate.reason;})(),sourceRow82CanonicalItemId:'UNRESOLVED_NO_ITEM_SUBSTITUTION',movieActive,sessionMode:session?.mode??null,sessionPhase:session?.phase??null,feverQuota:localFeverSimulation.snapshot().usesRemaining,liveResultGrade:'UNKNOWN',nativeParity:'NOT_CLAIMED'})});
let normalLocalPoolEntryByRowKey=new Map();
let feverLocalPoolEntryByRowKey=new Map();
function normalLocalVisualDisplayContractGate(result){
 const contract=normalLocalVisualContractByRowKey.get(result?.sourceRowKey),official=normalLocalPoolEntryByRowKey.get(result?.sourceRowKey),display=contract?.displayContract,icon=display?.icon,card=display?.cardAppearance;
 if(!contract||!official||contract.admissionClass!=='WEB_VISUAL_DISPLAY_ONLY'||contract.resultPayloadRemainsNull!==true||result?.pool!=='NORMAL'||result?.payloadStatus!=='RESULT_PAYLOAD_UNRESOLVED'||result?.resultPayload!==null)return null;
 if(result.officialSourceSheet!==official.officialSourceSheet||result.officialSourceRow!==official.officialSourceRow||result.announcementName!==official.announcementName||result.officialProbabilityPercentRaw!==official.officialProbabilityPercentRaw)return null;
 if(result.identity?.status!=='EXACT_CLIENT_IDENTITY'||official.clientIdentity?.identityVerdict!=='EXACT_CLIENT_IDENTITY'||official.clientIdentity?.serverPayloadProven!==false)return null;
 const sourceIcon=official.icon||{},manifestIcon=manifest.poolIcons?.[icon?.sourcePngSha256];
 if(sourceIcon.state!=='SOURCE_ICON_CONNECTED'||!manifestIcon||icon.path!==sourceIcon.runtimeAssetPath||icon.sourcePngSha256!==sourceIcon.sourcePngSha256||icon.runtimePngSha256!==sourceIcon.runtimePngSha256||icon.actualPngSha256!==sourceIcon.runtimePngSha256||icon.actualRgbaSha256!==sourceIcon.sourceRgbaSha256||manifestIcon.file!==icon.path||manifestIcon.runtimePngSha256!==icon.runtimePngSha256||manifestIcon.sourceRgbaSha256!==icon.sourceRgbaSha256)return null;
 const sourceRef=(manifestIcon.sourceReferences||[]).some(ref=>ref.iconName===icon.iconName&&ref.bundle===icon.bundle&&ref.cab===icon.cab&&String(ref.pathId)===String(icon.pathId));
 if(!sourceRef||icon.iconName!==sourceIcon.iconName)return null;
 const front=card?.front&&manifest.cards[card.front.assetKey],grade=card?.gradeOverlay&&manifest.cards[card.gradeOverlay.assetKey];
 const bound=(asset,source)=>asset&&source&&asset.file===source.file&&asset.sha256===source.sha256&&asset.bundle===source.bundle&&asset.cab===source.cab&&String(asset.pathID)===String(source.pathID);
 if(card?.displayStyle!=='MYTHIC_STYLE_PLAYER_VISUAL_ONLY'||card?.displayGradeEvidence!=='PLAYER_VISUAL_ACCEPTED_NON_EQUIP_MYTHIC_STYLE_APPEARANCE'||card?.liveResultGrade!=='UNKNOWN'||card?.effects!=='OFF_NOT_INCLUDED'||card?.specialOutline!=='NOT_INCLUDED'||!bound(front,card.front)||!bound(grade,card.gradeOverlay))return null;
 return {contract,display,icon,card,front,grade};
}
function normalLocalR6VisualDisplayContractGate(result){
 const contract=normalLocalR6VisualContractByRowKey.get(result?.sourceRowKey),official=normalLocalPoolEntryByRowKey.get(result?.sourceRowKey),display=contract?.displayContract,icon=display?.icon,card=display?.cardAppearance;
 if(!contract||!official||contract.admissionClass!=='WEB_VISUAL_DISPLAY_ONLY'||contract.resultPayloadRemainsNull!==true||result?.pool!=='NORMAL'||result?.payloadStatus!=='RESULT_PAYLOAD_UNRESOLVED'||result?.resultPayload!==null)return null;
 if(contract.verifiedClientItemId!==null||result.identity?.verifiedClientItemId!==null||official.clientIdentity?.verifiedClientItemId!==null||official.clientIdentity?.serverPayloadProven!==false)return null;
 if(result.identity?.status!==contract.identityVerdict||official.clientIdentity?.identityVerdict!==contract.identityVerdict||JSON.stringify(result.identity?.candidateClientItemIds)!==JSON.stringify(contract.candidateClientItemIds)||JSON.stringify(official.clientIdentity?.candidateClientItemIds)!==JSON.stringify(contract.candidateClientItemIds))return null;
 if(result.officialSourceSheet!==official.officialSourceSheet||result.officialSourceRow!==contract.officialSourceRow||official.officialSourceRowKey!==contract.sourceRowKey||result.announcementName!==official.announcementName||result.announcementName!==contract.announcementName||result.officialProbabilityPercentRaw!==official.officialProbabilityPercentRaw||result.officialProbabilityPercentRaw!==contract.officialProbabilityPercentRaw||official.officialGrade!==card?.announcementGrade)return null;
 if(!icon?.path?.startsWith('assets/')||icon.path.split('/').pop()!==`${icon.runtimePngSha256}.png`||icon.actualRgbaSha256!==icon.sourceRgbaSha256)return null;
 const officialDisplay=official.icon?.playerDisplayImage;
 const rowDisplayMatch=officialDisplay?.evidenceClass==='PLAYER_VISUAL_CONFIRMED'&&officialDisplay.legacyEntryKey===result.sourceRowKey&&officialDisplay.runtimeAssetPath===icon.path&&officialDisplay.runtimePngSha256===icon.runtimePngSha256&&officialDisplay.runtimeRgbaSha256===icon.actualRgbaSha256&&officialDisplay.legacyPngSha256===icon.sourcePngSha256&&officialDisplay.legacyRgbaSha256===icon.sourceRgbaSha256;
 const poolIcon=manifest.poolIcons?.[icon.runtimePngSha256],poolIconMatch=poolIcon?.file===icon.path&&poolIcon.runtimePngSha256===icon.runtimePngSha256&&poolIcon.sourceRgbaSha256===icon.actualRgbaSha256&&(poolIcon.sourceReferences||[]).some(ref=>ref.iconName===icon.iconNameOrCandidate&&ref.bundle===icon.bundle&&ref.cab===icon.cab&&String(ref.pathId)===String(icon.pathID));
 const playerIcon=manifest.playerConfirmedPoolIcons?.icons?.[icon.runtimePngSha256],playerIconMatch=playerIcon?.runtimeAssetPath===icon.path&&playerIcon.runtimePngSha256===icon.runtimePngSha256&&playerIcon.runtimeRgbaSha256===icon.actualRgbaSha256&&(playerIcon.announcementRows||[]).includes(result.sourceRowKey);
 if(!rowDisplayMatch&&!poolIconMatch&&!playerIconMatch)return null;
 const expectedGradeAssets={'古代':['Ancient','front_ancient','grade_ancient'],'傳說':['Legendary','front_legendary','grade_legendary'],'罕見':['Unique','front_unique','grade_unique']}[card?.announcementGrade];
 if(!expectedGradeAssets||card?.displayStyle!=='ANNOUNCEMENT_GRADE_WEB_STYLE_ONLY'||card?.gradeEvidence!=='OFFICIAL_ANNOUNCEMENT_GRADE_NOT_LIVE_RESULT_GRADE'||card?.frontAssetKey!==expectedGradeAssets[1]||card?.gradeOverlayAssetKey!==expectedGradeAssets[2]||card?.partText!=='OMITTED'||card?.fx!=='OFF'||card?.nativeParity!=='NOT_CLAIMED')return null;
 const front=manifest.cards[card.frontAssetKey],grade=manifest.cards[card.gradeOverlayAssetKey];
 const bound=(asset,source)=>asset&&source&&asset.file===source.file&&asset.sha256===source.sha256&&asset.bundle===source.bundle&&asset.cab===source.cab&&String(asset.pathID)===String(source.pathID);
 if(!bound(front,card.front)||!bound(grade,card.gradeOverlay))return null;
 return {contract,display,icon,card,front,grade};
}
function normalLocalPreviewIconGate(result,item,icon){
 const admitted=normalLocalPreviewIconByRowKey.get(result.sourceRowKey);
 const sourceSha=icon?.sourcePngSha256,poolIcon=sourceSha&&manifest.poolIcons?.[sourceSha];
 if(!admitted||!poolIcon)return false;
 const evidenceAllowed=['SOURCE_DIRECT_PNG_SHA_EXACT','SOURCE_DERIVED_RGBA_PIXEL_EXACT'];
 const sourceRef=(poolIcon.sourceReferences||[]).some(ref=>ref.iconName===admitted.iconName&&ref.bundle===admitted.bundle&&ref.cab===admitted.cab&&String(ref.pathId)===String(admitted.pathID));
 return admitted.itemID===item?.itemID
  &&admitted.runtimeAssetPath===icon?.runtimeAssetPath
  &&admitted.payloadItemIconSourcePngSha256===sourceSha
  &&admitted.evidence&&evidenceAllowed.includes(admitted.evidence)
  &&admitted.sha256===admitted.manifestRuntimePngSha256
  &&admitted.payloadItemIconSourceRgbaSha256===admitted.runtimeIconRgbaSha256
  &&admitted.payloadItemIconSourceRgbaSha256===poolIcon.sourceRgbaSha256
  &&poolIcon.sourcePngSha256===sourceSha
  &&poolIcon.file===admitted.runtimeAssetPath
  &&poolIcon.runtimePngSha256===admitted.sha256
  &&sourceRef;
}
function normalLocalCardPreviewStatus(result){
 if(normalLocalVisualDisplayContractGate(result))return 'WEB_VISUAL_DISPLAY_ONLY_READY';
 if(normalLocalVisualContractByRowKey.has(result?.sourceRowKey))return 'WEB_VISUAL_CONTRACT_SOURCE_JOIN_FAILED';
 if(normalLocalR6VisualDisplayContractGate(result))return 'WEB_VISUAL_DISPLAY_ONLY_READY';
 if(normalLocalR6VisualContractByRowKey.has(result?.sourceRowKey))return 'WEB_VISUAL_CONTRACT_SOURCE_JOIN_FAILED';
 if(result?.pool==='NORMAL'&&result?.payloadStatus==='RESULT_PAYLOAD_UNRESOLVED')return 'ROW_ONLY_DIAGNOSTIC';
 if(result?.pool!=='NORMAL'||result?.payloadStatus!=='LOCAL_STATIC_ITEM_PAYLOAD_AVAILABLE_NOT_SERVER_RESULT'||!result?.resultPayload?.item)return 'RESULT_PAYLOAD_UNRESOLVED';
 const presentation=result.resultPayload.cardPresentation,front=presentation?.front,grade=presentation?.gradeOverlay;
 const frontAsset=front&&normalLocalCardAssetBySourceSha.get(front.sha256),gradeAsset=grade&&normalLocalCardAssetBySourceSha.get(grade.sha256);
 const bound=(asset,source)=>asset&&asset.bundle===source.bundle&&asset.cab===source.cab&&String(asset.pathID)===String(source.pathId);
 if(!bound(frontAsset,front)||!bound(gradeAsset,grade))return 'PREVIEW_BLOCKED_SOURCE_CARD_ASSET_GAP';
 const item=result.resultPayload.item,icon=result.resultPayload.icon||{};
 if(!normalLocalPreviewIconGate(result,item,icon))return 'PREVIEW_BLOCKED_ICON_ROW_JOIN_OR_RUNTIME_SHA_GAP';
 return 'AVAILABLE_SOURCE_BOUND_DIAGNOSTIC_ONLY';
}
function normalLocalCardPresentation(result){
 const visual=normalLocalVisualDisplayContractGate(result);
 if(visual){
  const admitted=visual.contract.displayContract.icon;
  return {front:visual.front,grade:visual.grade,iconPath:admitted.path,iconSha256:admitted.runtimePngSha256,displayOnly:true,admissionClass:'WEB_VISUAL_DISPLAY_ONLY',displayGrade:'MYTHIC_STYLE_PLAYER_VISUAL_ONLY',gradeEvidence:visual.card.displayGradeEvidence,previewKind:'normal-local-r5-player-visual-only'};
 }
 const r6Visual=normalLocalR6VisualDisplayContractGate(result);
 if(r6Visual){const admitted=r6Visual.contract.displayContract.icon;return {front:r6Visual.front,grade:r6Visual.grade,iconPath:admitted.path,iconSha256:admitted.runtimePngSha256,displayOnly:true,admissionClass:'WEB_VISUAL_DISPLAY_ONLY',displayGrade:r6Visual.card.announcementGrade,gradeEvidence:r6Visual.card.gradeEvidence,previewKind:'normal-local-r6-announcement-grade-web-only'};}
 const payload=result?.resultPayload,presentation=payload?.cardPresentation;
 if(result?.pool!=='NORMAL'||result?.payloadStatus!=='LOCAL_STATIC_ITEM_PAYLOAD_AVAILABLE_NOT_SERVER_RESULT'||!payload?.item||!presentation?.front||!presentation?.gradeOverlay)return null;
 const front=normalLocalCardAssetBySourceSha.get(presentation.front.sha256),grade=normalLocalCardAssetBySourceSha.get(presentation.gradeOverlay.sha256);
 const isBound=(asset,source)=>asset&&asset.bundle===source.bundle&&asset.cab===source.cab&&String(asset.pathID)===String(source.pathId);
 if(!isBound(front,presentation.front)||!isBound(grade,presentation.gradeOverlay))return null;
 const iconPath=payload.icon?.runtimeAssetPath,admittedIcon=normalLocalPreviewIconByRowKey.get(result.sourceRowKey);
 if(typeof iconPath!=='string'||!iconPath.startsWith('assets/')||!normalLocalPreviewIconGate(result,payload.item,payload.icon))return null;
 return {front,grade,iconPath,frontSource:presentation.front,gradeSource:presentation.gradeOverlay,iconSha256:admittedIcon.sha256,displayOnly:false,admissionClass:'SOURCE_BOUND_STATIC_PREVIEW'};
}
function feverLocalRowContract(entry){
 const admitted=feverLocalVisualAdmissionByRowKey.get(entry?.officialSourceRowKey);
 if(!admitted||entry.pool!=='FEVER'||admitted.pool!=='FEVER'||admitted.announcementName!==entry.announcementName||admitted.officialProbabilityPercentRaw!==entry.officialProbabilityPercentRaw||admitted.officialExactFractionRaw!==entry.officialExactFractionRaw||admitted.officialSourceRow!==entry.officialSourceRow)return {admission:null,iconPath:null,plan:null,reason:'FEVER_ROW_KEY_OR_OFFICIAL_FIELDS_MISMATCH'};
 if(JSON.stringify(admitted.clientIdentity?.candidateClientItemIds)!==JSON.stringify(entry.clientIdentity?.candidateClientItemIds||[])||admitted.clientIdentity?.identityVerdict!==entry.clientIdentity?.identityVerdict||admitted.clientIdentity?.verifiedClientItemId!==(entry.clientIdentity?.verifiedClientItemId??null))return {admission:admitted,iconPath:null,plan:null,reason:'FEVER_IDENTITY_CONTRACT_MISMATCH'};
 let iconValid=false;
 if(entry.icon?.state==='SOURCE_ICON_CONNECTED'){
  const icon=admitted.icon,poolIcon=manifest.poolIcons?.[entry.icon.sourcePngSha256];
   iconValid=icon?.status==='ASSET_SHA_VERIFIED'&&icon.path===entry.icon.runtimeAssetPath&&icon.sourcePngSha256===entry.icon.sourcePngSha256&&icon.runtimePngSha256===entry.icon.runtimePngSha256&&icon.sourceRgbaSha256===entry.icon.sourceRgbaSha256&&icon.iconName===entry.icon.iconName&&poolIcon?.file===icon.path&&poolIcon.runtimePngSha256===icon.runtimePngSha256&&poolIcon.sourceRgbaSha256===entry.icon.sourceRgbaSha256&&(poolIcon.sourceReferences||[]).some(ref=>ref.iconName===entry.icon.iconName&&ref.bundle===icon.bundle&&ref.cab===icon.cab&&String(ref.pathId)===String(icon.pathId));
 }else{
  const source=entry.icon?.playerDisplayImage,icon=admitted.icon,player=manifest.playerConfirmedPoolIcons?.icons?.[r14p29P1Enabled?source?.legacyPngSha256:source?.runtimePngSha256];
  iconValid=source?.evidenceClass==='PLAYER_VISUAL_CONFIRMED'&&icon?.status==='ASSET_SHA_VERIFIED'&&icon.evidence==='PLAYER_VISUAL_CONFIRMED'&&icon.path===source.runtimeAssetPath&&icon.runtimePngSha256===source.runtimePngSha256&&icon.sourceRgbaSha256===source.legacyRgbaSha256&&source.legacyEntryKey===entry.officialSourceRowKey&&player?.runtimeAssetPath===icon.path&&player.runtimePngSha256===icon.runtimePngSha256&&player.runtimeRgbaSha256===icon.sourceRgbaSha256&&(player.announcementRows||[]).includes(entry.officialSourceRowKey);
 }
 const iconPath=iconValid?admitted.icon.path:null;
 const card=admitted.card;
 if(!iconValid||!card||!['WEB_ANNOUNCEMENT_GRADE_STYLE','PLAYER_VISUAL_REUSED_EXACT_ITEM_ID'].includes(card.status))return {admission:admitted,iconPath,plan:null,reason:iconValid?admitted.reason:'FEVER_ICON_SOURCE_OR_RUNTIME_MAPPING_MISMATCH'};
 let cardJoinValid=false;
 if(card.status==='WEB_ANNOUNCEMENT_GRADE_STYLE'){
  const expected={'神話':['front_mythic','grade_mythic'],'古代':['front_ancient','grade_ancient'],...(r14p28P4R2Enabled?{'混沌':['front_ancient','grade_chaos']}:r14p28P3Enabled?{'混沌':['front_ancient','grade_ancient']}:{}),'傳說':['front_legendary','grade_legendary'],'罕見':['front_unique','grade_unique']}[entry.officialGrade];
  const front=expected&&manifest.cards[expected[0]],grade=expected&&manifest.cards[expected[1]];
  cardJoinValid=card.displayStyle==='ANNOUNCEMENT_GRADE_WEB_STYLE_ONLY'&&card.announcementGrade===entry.officialGrade&&card.liveResultGrade==='UNKNOWN'&&card.nativeParity==='NOT_CLAIMED'&&card.front?.assetKey===expected?.[0]&&card.gradeOverlay?.assetKey===expected?.[1]&&front?.file===card.front.file&&front?.sha256===card.front.sha256&&front?.bundle===card.front.bundle&&front?.cab===card.front.cab&&String(front?.pathID)===String(card.front.pathId)&&grade?.file===card.gradeOverlay.file&&grade?.sha256===card.gradeOverlay.sha256&&grade?.bundle===card.gradeOverlay.bundle&&grade?.cab===card.gradeOverlay.cab&&String(grade?.pathID)===String(card.gradeOverlay.pathId);
 }
 if(card.status==='PLAYER_VISUAL_REUSED_EXACT_ITEM_ID'){
  const itemId=entry.clientIdentity?.verifiedClientItemId,normalRow=[...normalLocalPoolEntryByRowKey.values()].find(row=>row.clientIdentity?.identityVerdict==='EXACT_CLIENT_IDENTITY'&&row.clientIdentity?.verifiedClientItemId===itemId),visual=normalRow&&normalLocalVisualContractByRowKey.get(normalRow.officialSourceRowKey),appearance=visual?.displayContract?.cardAppearance,front=appearance?.front?.assetKey&&manifest.cards[appearance.front.assetKey],grade=appearance?.gradeOverlay?.assetKey&&manifest.cards[appearance.gradeOverlay.assetKey];
  cardJoinValid=Number.isInteger(itemId)&&visual?.admissionClass==='WEB_VISUAL_DISPLAY_ONLY'&&appearance?.displayStyle==='MYTHIC_STYLE_PLAYER_VISUAL_ONLY'&&card.sourceNormalRowKey===normalRow?.officialSourceRowKey&&card.liveResultGrade==='UNKNOWN'&&front?.file===card.front.file&&front?.sha256===card.front.sha256&&String(front?.pathID)===String(card.front.pathId)&&grade?.file===card.gradeOverlay.file&&grade?.sha256===card.gradeOverlay.sha256&&String(grade?.pathID)===String(card.gradeOverlay.pathId);
 }
 if(!cardJoinValid)return {admission:admitted,iconPath,plan:null,reason:'FEVER_CARD_ASSET_OR_GRADE_CONTRACT_MISMATCH'};
 const front=manifest.cards[card.front.assetKey],grade=manifest.cards[card.gradeOverlay.assetKey];
  return {admission:admitted,iconPath,plan:{front,grade,iconPath,displayOnly:true,admissionClass:'WEB_VISUAL_DISPLAY_ONLY',displayGrade:card.announcementGrade??(card.displayStyle==='MYTHIC_STYLE_PLAYER_VISUAL_ONLY'?'玩家確認神話樣式':card.displayStyle),gradeEvidence:card.gradeEvidence,liveResultGrade:'UNKNOWN'},reason:admitted.reason};
}
const nodes=new Map(ui.objects.map(o=>[o.id,o]));
const transforms=new Map(ui.objects.map(o=>[o.transform,o]));
const componentsByOwner=new Map();for(const c of ui.components){if(!componentsByOwner.has(c.owner))componentsByOwner.set(c.owner,[]);componentsByOwner.get(c.owner).push(c);}
const components=ui.components.filter(c=>['UISprite','UILabel','UITexture'].includes(c.class));
const shopChestTweenComponent=ui.components.find(c=>c.class==='TweenPosition'&&c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Treasurebox_Crystal');
const languageByOwner=new Map(ui.components.filter(c=>c.class==='CUILanguage').map(c=>[c.owner,c.fields]));
const appQuery=new URLSearchParams(window.location.search);
const p12A16IdleRenderSyncEnabled=appQuery.get('mode')==='player'&&appQuery.get('p12A16IdleSyncReuse')==='1';
const p12UnityMemoryDiagnosticEnabled=appQuery.get('mode')==='player'&&appQuery.get('p12MemDiag')==='1';
const p11InStageShellNode=$('p11-instage-shop-shell');
let p11InStageLastPhase=null,p11StoreBasePaintStatus='NOT_ENABLED',p11StoreVisualReferencePaintStatus='NOT_ENABLED';const p11InStageShellTransitions=[];
function p11InStagePhase(){if(!p11InStageShellEnabled)return 'DISABLED';if($('movie')&&!$('movie').hidden)return 'MOVIE';if(movieActive)return 'MOVIE';if(moviePending||normalR9StartPending||feverTenStartPending||normalLocalTenStartPending||normalLocalTenPendingRun||normalLocalSingleResumePending||normalLocalTenResumePending)return 'PURCHASE_PENDING';if(showing){if(session?.phase==='dealing')return 'DEALING';if(session?.phase==='ready')return 'READY_TO_FLIP';if(session?.phase==='complete')return 'RESULT';return `RESULT_${session?.phase??'ACTIVE'}`;}if(luckyFeverOverlay.snapshot().visible)return 'LUCKY_FEVER_OVERLAY';return 'SHOP';}
function p11InStageShopVisible(){return p11InStageShellEnabled;}
function syncP11InStageShell(){const phase=p11InStagePhase(),transition=phase!==p11InStageLastPhase,visible=transition?p11InStageShopVisible():p11InStageShellEnabled;if(p11InStageShellNode){if(p12A16IdleRenderSyncEnabled){applyShopTargetStateIfChanged(p11InStageShellNode,{hidden:true,dataset:{state:'DOM_OVERLAY_DISABLED_SOURCE_CANVAS_COMPOSITE',phase},attributes:{'aria-hidden':'true'}});}else{p11InStageShellNode.hidden=true;p11InStageShellNode.setAttribute('aria-hidden','true');p11InStageShellNode.dataset.state='DOM_OVERLAY_DISABLED_SOURCE_CANVAS_COMPOSITE';p11InStageShellNode.dataset.phase=phase;}}if(transition){p11InStageLastPhase=phase;const r=stage.getBoundingClientRect();p11InStageShellTransitions.push({at:performance.now(),phase,visible,stage:{x:r.x,y:r.y,width:r.width,height:r.height},canvas:[canvas.width,canvas.height],logical:[fixture.width,fixture.height]});if(p11InStageShellTransitions.length>24)p11InStageShellTransitions.shift();}if(p12A16IdleRenderSyncEnabled)return;return {enabled:p11InStageShellEnabled,visible,domOverlayVisible:false,compositeOwner:p11InStageShellEnabled?'MAIN_SCENE_CANVAS':'EXISTING_PLAYER_RENDER',phase,stage:p11InStageShellTransitions.at(-1)?.stage??null,transitions:p11InStageShellTransitions.map(row=>({...row}))};}
window.__p11S1R6=Object.freeze({classification:'P11_S1R8R0_SOURCE_DIRECT_PARTIAL_CANVAS_COMPOSITE_PLAYER_PENDING',enabled:p11InStageShellEnabled,snapshot:()=>({enabled:p11InStageShellEnabled,visible:p11InStageShopVisible(),domOverlayVisible:false,compositeOwner:p11InStageShellEnabled?'MAIN_SCENE_CANVAS':'EXISTING_PLAYER_RENDER',state:p11InStageShellEnabled?'SOURCE_BASES_CANVAS_COMPOSITE':'DISABLED',paintStatus:p11StoreBasePaintStatus,stage:stage.getBoundingClientRect().toJSON(),logical:[fixture.width,fixture.height],canvas:[canvas.width,canvas.height],transitions:p11InStageShellTransitions.map(row=>({...row})),sourceBases:[{sprite:'TitleBg/com_title_bar',rect:{x:0,y:0,width:1280,height:86},drawOrder:4},{sprite:'LeftBG/com_tap_n',rect:{x:0,y:84,width:156,height:636},drawOrder:3}],unresolved:['Store frame vs Gacha root NGUI runtime panel/depth ordering','white content tab instance and binding','EVENT category row instance and selected sprite binding','outer title runtime localization value']})});
const r14P32R2R14Enabled=appQuery.get('mode')==='engineering'&&appQuery.get('r14p32r2r14')==='1';
function r14P32R14FeverRunId(){if(!showing)return null;if(session?.mode==='local-fever-ten-display')return String(session.feverRunId??session.metrics?.runId??'');if(r14P32R2R14Enabled&&session?.targetedFixture&&session.targetedPool==='FEVER')return String(session.normalRunId??session.metrics?.runId??'');return null;}
let screenFxCandidate=null;
let r14ScreenFxPixelProbe={runId:null,frame:null,changedPixels:null};
let r14R4LayerMetrics={runId:null,flash02PaintFrames:0,screenFxPaintFrames:0};
function r14R4ResetLayerMetrics(runId){r14R4LayerMetrics={runId:runId===null?null:String(runId),flash02PaintFrames:0,screenFxPaintFrames:0};}
function r14R4PublishLayerStatus(){const state=screenFxCandidate?.snapshot();if(state?.mode!=='COMBINED_FLASH02_SCREENFX')return;const note=$('r14p32r2r14-status');if(!note)return;const p8=r14p30P8Player?.snapshot();note.textContent=`${state.classification} · ${state.mode} · 同一 run ${r14R4LayerMetrics.runId??'待開始'} · Flash02 Unity 輸出影格 ${p8?.drawnFrames??0}（成功 paint ${r14R4LayerMetrics.flash02PaintFrames}）· ScreenFX Canvas 圖片 drawCalls ${state.drawCalls}（成功 paint ${r14R4LayerMetrics.screenFxPaintFrames}）· ScreenFX 首次 Canvas 變化像素 ${r14ScreenFxPixelProbe.runId===state.runId?(r14ScreenFxPixelProbe.changedPixels??'待繪製'):'待繪製'} · 工程層序 Flash02 → ScreenFX → cards；Native layer 未閉合。`;}
// P8 MANUAL_FIXTURE_ONLY: TenTime source activation/routing remains unresolved.
const r14p30P8Enabled=true;const p12P8LazyEnabled=appQuery.get('mode')==='player'&&appQuery.get('p12P8Lazy')==='1';const p12BoundRunMetricsEnabled=appQuery.get('mode')==='player'&&appQuery.get('p12RunMetricsRetention')==='1';const p31r2SharedResultUi=appQuery.get('sharedResultUi')!=='0';
let r14p30P8Player=null;
let p8HiddenRedrawsSkipped = 0;
function requestP8Render() {
  if (appQuery.get('luckyUnderlayQuiet') === '1' && luckyFeverOverlay.snapshot().activeRunId !== null) {
    p8HiddenRedrawsSkipped++;
    return;
  }
  requestFXRender('p8');
}

function p12P8Prewarm(reason){if(!p12P8LazyEnabled||!r14p30P8Player)return;trace.push({event:'p8-lazy-prewarm-request',at:performance.now(),reason});void r14p30P8Player.ensurePrepared();}
function r14p30P8Eligible(keepSameRunUnderOverlay=false){const feverBackgroundMode=session?.mode==='local-fever-ten-display'&&appQuery.get('feverBackground')!=='off',manualFeverFixture=r14P32R2R14Enabled&&appQuery.get('mode')==='engineering'&&session?.targetedFixture&&session.targetedPool==='FEVER',screenMode=screenFxCandidate?.snapshot().mode??'CURRENT_FLASH02',screenFxOwnsFeverBackground=['SCREENFX_CANDIDATE','OFF'].includes(screenMode);return !document.hidden&&!(r14P32R2R14Enabled&&(feverBackgroundMode||manualFeverFixture)&&screenFxOwnsFeverBackground)&&showing&&!movieActive&&!moviePending&&(session?.mode==='normal-local-ten-draw'||feverBackgroundMode||manualFeverFixture)&&['dealing','ready','complete'].includes(session?.phase)&&(keepSameRunUnderOverlay||luckyFeverOverlay.snapshot().activeRunId===null);}
function r14p30P8CardRects(){if(!r14p30P8Eligible())return [];return session.cards.map((card,i)=>{const p=cardPose(i,performance.now());return {slot:i+1,x:640+p.x-99.5*p.scale,y:360-p.y-125*p.scale,width:199*p.scale,height:250*p.scale};});}

// R2 timing observations only; original media/card/FX clocks are not rescheduled here.
function r14p30P8Calibration(){
 if(appQuery.get('r14p30P8R2')!=='1'&&appQuery.get('r14p30P8R3')!=='1')return null;
 const now=performance.now(),started=session?.mode==='normal-local-ten-draw'?session.started:null;
 return {sessionStartedAt:started,moveMs:timing.moveMs,settledCards:started===null?null:session.cards.filter((c,i)=>now-started>=(i+1)*timing.moveMs).length,
 movie:{active:movieActive,pending:moviePending,mediaTime:movie.currentTime,duration:movie.duration},
 flowEvents:trace.filter(e=>['normal-local-ten-movie-start','normal-local-ten-movie-finish','normal-local-ten-result-bound','deal-start','deal-complete'].includes(e.event)).map(e=>({event:e.event,at:e.at,trigger:e.trigger??null,movieKey:e.movieKey??null}))};
}
// P7 manual original-outline display. Native Define/result routing remains unknown.
const r14p30P7Enabled=appQuery.get('r14p30P7')!=='0';const p31r2LegacyOutline=appQuery.get('mode')==='engineering'&&appQuery.get('outlineFixture')==='slots';
const r8OneTimeCandidateEnabled=appQuery.get('mode')==='engineering'&&appQuery.get('r14p32r2r8')==='1';let r8OneTimeRootChoice='off',r8OneTimeControls=null;
let r14p30P7Player=null;
let cbOptions={fxMode:'backfx',enabled:true,scale:1,x:0,y:0,opacity:1,delayMs:0},cbPlayAt=0,p32BackPlayer=null;
function r9OneTimeSingleFullFlowRoute(){return Boolean(session?.mode==='normal-local-preview'&&session?.fullFlow===true&&session?.phase==='complete'&&session?.count===1);}
function r9OneTimeVisualPolicy(){if(!r9OneTimeSingleFullFlowRoute())return null;const record=session?.oneTimeOutlinePolicyRecord,entry=normalLocalPoolEntryByRowKey.get(session?.sourceRowKey);if(!record||record.result?.pool!=='NORMAL'||record.result?.sourceRowKey!==session?.sourceRowKey||record.result?.officialSourceRowKey!==entry?.officialSourceRowKey||entry?.pool!=='NORMAL')return null;return cardResultVisualPolicy(record,entry);}
function r8OneTimeLegendarySourceMatch(){const sample=session?.oneTimeOutlineSample,sourceBound=r9OneTimeSingleFullFlowRoute()||(r8OneTimeCandidateEnabled&&session?.mode==='normal-local-preview'&&session?.fullFlow!==true);return Boolean(sourceBound&&session?.phase==='complete'&&session?.count===1&&sample?.itemId&&sample.itemType==='Equip'&&sample.effectiveGradeType===5&&sample.effectiveGrade==='Legendary'&&session.frontAssetFile===manifest.cards.front_legendary.file);}
function r9OneTimeOutlineKind(){return r9OneTimeSingleFullFlowRoute()?Number(r9OneTimeVisualPolicy()?.extraOutlineKind)||0:(r8OneTimeCandidateEnabled&&r8OneTimeRootChoice==='root2'&&r8OneTimeLegendarySourceMatch()?2:0);}
function r9OneTimeRoot2Active(){return r9OneTimeOutlineKind()===2;}
function r8OneTimeOutlineTargets(){const root=r9OneTimeOutlineKind();if(!root||![1,2].includes(root))return [];const card=session?.cards?.[0];if(!card||card.openAt===null||performance.now()-card.openAt<timing.flipMs)return [];const policy=r9OneTimeVisualPolicy();return [{slot:1,root,file:session.frontAssetFile,center:{x:640,y:360},revealed:true,classification:`ONETIME_${root===2?'LEGENDARY_ROOT2':'PLAYER_POLICY_ROOT1'}_WEB_VISUAL_ADAPTATION`,policyLayer:policy?.ruleLayer??'R8_ENGINEERING_DIAGNOSTIC_ONLY',itemId:policy?.itemId??session?.oneTimeOutlineSample?.itemId??null,sourceRowKey:session?.sourceRowKey??null}];}
function r14p30P7Eligible(){const oneTimeCandidate=r9OneTimeOutlineKind()>0;return !document.hidden&&showing&&!movieActive&&!moviePending&&(['normal-local-ten-draw','local-fever-ten-display'].includes(session?.mode)||session?.targetedFixture===true||oneTimeCandidate)&&['ready','complete'].includes(session?.phase)&&luckyFeverOverlay.snapshot().activeRunId===null;}
function p31r3CardPolicy(record){const key=record?.result?.sourceRowKey;return cardResultVisualPolicy(record,(record?.result?.pool==='FEVER'?feverLocalPoolEntryByRowKey:normalLocalPoolEntryByRowKey).get(key));}
function p31r2OutlineTargets(){if(!r14p30P7Eligible())return [];if(session?.mode==='normal-local-preview')return r8OneTimeOutlineTargets();return session.displayOrder.flatMap((resultIndex,i)=>{const record=session.resultCards[resultIndex],file=record?.plan?.front?.file;const root=p31r3CardPolicy(record).extraOutlineKind;if(!root||record.renderState!=='CARD_READY')return [];const pose=cardPose(i,performance.now());return [{slot:i+1,root,file,center:{x:640+pose.x,y:360-pose.y},revealed:!$('backs').checked&&session.cards[i].openAt!==null&&performance.now()-session.cards[i].openAt>=timing.flipMs}];});}
function r14p30P7CardRects(){return p31r2OutlineTargets().map(t=>({...t,bounds:{x:t.center.x-99.5,y:t.center.y-125,width:199,height:250}}));}
function installR8OneTimeControls(){const parent=document.getElementById('p30p7-controls');if(!parent||r8OneTimeControls)return;const box=document.createElement('div');box.id='r8-onetime-outline-controls';box.style.cssText='margin-top:10px;padding:9px;border:1px solid #8eb1d2;border-radius:7px;background:#1c2935';box.innerHTML='<strong>R8 單抽傳說正面框｜ENGINEERING_FIXTURE_ONLY</strong><p>OFF／Root2 視覺候選。僅對本地 Normal 結果中可核 ItemType=Equip、Grade.Type=5、Legendary 卡啟用。現有 Unity WebGL 輸出為 TenTime Root2；它是 OneTime 原始根的 Web 視覺代理，不代表同一 GO 或 Native 1:1。</p><label for="r8-onetime-outline-choice">同一張單抽結果： </label><select id="r8-onetime-outline-choice"><option value="off">OFF｜原畫面</option><option value="root2">Root2｜原始 OneTime 條件候選</option></select> <span id="r8-onetime-outline-status" role="status" aria-live="polite"></span>';parent.append(box);r8OneTimeControls=box;const select=box.querySelector('#r8-onetime-outline-choice');select.value=r8OneTimeRootChoice;select.addEventListener('change',()=>{r8OneTimeRootChoice=select.value==='root2'?'root2':'off';render();});}
function r8OneTimeUpdateStatus(){if(!r8OneTimeControls)return;const status=r8OneTimeControls.querySelector('#r8-onetime-outline-status');if(!status)return;let message;if(r8OneTimeRootChoice==='off')message='OFF；不啟動 OneTime 外框候選。';else if(session?.mode!=='normal-local-preview')message='等待 Normal 單抽本地結果預覽；不影響 10+1／Fever／玩家模式。';else if(!r8OneTimeLegendarySourceMatch())message='此卡不符合 Equip／Grade.Type=5／Legendary／front_legendary 條件；保持無額外動態框。';else{const snap=r14p30P7Player?.snapshot();message=snap?.scope?.mapping==='ONETIME_MULTI_GRADE_WEB_VISUAL_ADAPTATION'&&snap.effectiveMask>0?'Root2 候選已套用 · run '+(snap.selection?.run??'pending')+' · renderedFrames '+snap.renderedFrames:snap?.ready?'符合條件；等待 Root2 Unity 影格。':'符合條件；等待 P7 Runtime 預載。';}if(status.textContent!==message)status.textContent=message;}
function r14p30P7Scene(){const eligible=r14p30P7Eligible(),now=performance.now(),targets=[...p31r2OutlineTargets(),...cbBackTargets(now)];if(p31r2LegacyOutline){const revealedMask=eligible&&!$('backs').checked?[1,5].reduce((m,i,bit)=>m|(session.cards[i].openAt!==null&&now-session.cards[i].openAt>=timing.flipMs?1<<bit:0),0):0;return {allowPilot:!showing&&!movieActive&&!moviePending,result:eligible?{run:String(session.normalRunId??session.feverRunId??session.metrics.runId),revealedMask,positions:{x1:target(1).x,y1:target(1).y,x2:target(5).x+5,y2:target(5).y}}:null};}
return {allowPilot:appQuery.get('mode')==='engineering'&&!showing&&!movieActive&&!moviePending,result:eligible?{run:String(session.mode==='normal-local-preview'?'onetime-'+session.started+'-'+session.sourceRowKey:(session.normalRunId??session.feverRunId??session.metrics.runId)),mapping:session.mode==='normal-local-preview'?'ONETIME_MULTI_GRADE_WEB_VISUAL_ADAPTATION':'WEB_GRADE_VISUAL_MAPPING',targets,selection:session.mode==='normal-local-preview'?(()=>{const policy=r9OneTimeVisualPolicy();return {pool:'NORMAL',sourceRowKey:session.sourceRowKey,itemId:policy?.itemId??null,itemType:policy?.itemType??null,grade:policy?.effectiveGrade??policy?.originalGrade??null,gradeEvidence:policy?.gradeEvidence??'UNKNOWN',ruleLayer:policy?.ruleLayer??'BLOCKED_BY_SOURCE_JOIN',expectedRoot:policy?.extraOutlineKind??0,nativePredicate:'SOURCE_UNRESOLVED'};})():undefined,revealedMask:targets.reduce((m,t)=>m|(t.revealed?1<<(t.root-1):0),0),positions:{x1:-320,y1:0,x2:325,y2:0}}:null};}

const requestedActivityFixture=appQuery.get('activityFixture');
const activityFixtureMode=requestedActivityFixture===null&&appQuery.get('mode')==='player'?'secondaryWeapon':requestedActivityFixture==='secondaryWeapon'?'secondaryWeapon':'serialized';
// R14-P30-P1B: engineering-only Normal 10+1 result-background comparison. No player-mode change.
const r14p30P1BEnabled=appQuery.get('mode')==='engineering'&&appQuery.get('r14p30P1B')==='1';
const r14p30P1BBuildId='R14P30P1B_NORMAL_TENTIME_BACKGROUND_AB_20261104A';
const P11_D3_PLAYER_SELECTED_FRAME_ALPHA=0.85; // Player-approved Web visual value; serialized source TweenAlpha.to remains 0.70.
let r14p30P1BVariant='baseline',r14p30P1BAlpha=0.85;
// R14-P30-P2: OneTime original Fader is already in the shipped Popup. Historical S3-F10 blocker layer is an optional comparison, not a proven live state.
const r14p30P2Enabled=['player','engineering'].includes(appQuery.get('mode'))&&appQuery.get('r14p30P2')==='1';
const r14p30P2BuildId='R14P30P2_ONETIME_SOURCE_BACKGROUND_AB_20261104A';
let r14p30P2Variant='fader-only';
// R14-P30-P3: source Box2 background only; engineering opt-in, no player default change.
const r14p30P3Enabled=appQuery.get('r14p30P3')!=='0';
const r14p30P3Player=r14p30P3Enabled?await r14p30P3EarlyPromise:null;
function r14p30P3Eligible(){return !document.hidden&&r14p30P3Enabled&&showing&&!movieActive&&!moviePending&&['single','normal-local-preview'].includes(session?.mode)&&fixture.background==='frame'&&luckyFeverOverlay.snapshot().activeRunId===null;}
document.addEventListener('visibilitychange',()=>{if(document.hidden)r14p30P3Player?.endResult('hidden');window.cleanRebuild?.render?.();});
window.__r14p30P3=Object.freeze({enabled:r14p30P3Enabled,snapshot:()=>({enabled:r14p30P3Enabled,applicable:r14p30P3Eligible(),sessionMode:session?.mode??null,itemID:session?.item?.itemID??null,sourceRowKey:session?.sourceRowKey??null,cardCount:session?.cards?.length??0,started:session?.started??null,sessionPhase:session?.phase??null,opened:session?.cards?.filter(c=>c.openAt!==null).length??0,normalGaugeReady:normalResultFeverGaugeReady(performance.now()),fever:localFeverSimulation.snapshot(),lucky:luckyFeverOverlay.snapshot(),p2:window.__r14p30P2?.snapshot()??null,p1b:window.__r14p30P1B?.snapshot()??null,r4:window.__r14p27R4?.snapshot()??null,sourceParticles:['flash_p001','center_b001','bf_p001'],nativeBranch:'FORCED_SOURCE_CONDITIONAL_NOT_INFERRED_FROM_RESULT_GRADE',player:r14p30P3Player?.snapshot()??null})});


const fx0304CandidateMode=appQuery.get('fx0304');
const fx0304DiagnosticCandidate=appQuery.get('mode')==='engineering'&&['full-card','full-03','full-04','single-03','single-04'].includes(fx0304CandidateMode);
const fx0304SingleDiagnosticCandidate=fx0304DiagnosticCandidate&&fx0304CandidateMode.startsWith('single-');
const fx0304SelectorOverride=fx0304DiagnosticCandidate?(fx0304CandidateMode.endsWith('-03')?'03':fx0304CandidateMode.endsWith('-04')?'04':null):null;
const fx0304SelectedSlotValue=Number(appQuery.get('fx0304Slot'));
const fx0304TenTimeReplayCandidate=fx0304SingleDiagnosticCandidate&&appQuery.get('fx0304Replay')==='tenTime'&&Number.isInteger(fx0304SelectedSlotValue)&&fx0304SelectedSlotValue>=1&&fx0304SelectedSlotValue<=11;
const fx0304SelectedSlotIndex=fx0304TenTimeReplayCandidate?fx0304SelectedSlotValue-1:null;
const fx0304TraceEnabled=fx0304TenTimeReplayCandidate&&appQuery.get('r14p24Trace')==='1';
const fx0304P25StreamMode=fx0304TenTimeReplayCandidate&&['baseline','after','regression'].includes(appQuery.get('r14p25Stream'))?appQuery.get('r14p25Stream'):null;
const fx0304P25TraceEnabled=Boolean(fx0304P25StreamMode);
const fx0304P25BuildId='R14P25_AR3_AFTER_BOUNDED_PREFETCH_20261102';
const fx0304TraceHoldTarget=fx0304TraceEnabled&&appQuery.get('r14p24Hold')==='1';
const fx0304TraceBuildId='R14P24_LIVE_TRACE_20261102A';
const fx0304LayerMode=fx0304SingleDiagnosticCandidate&&['card-only','fx-only','composite'].includes(appQuery.get('fx0304Layer'))?appQuery.get('fx0304Layer'):null;
const fx0304SampleAgeMs=fx0304LayerMode?Math.max(0,Math.min(5000,Number.isFinite(Number(appQuery.get('fx0304AgeMs')))?Number(appQuery.get('fx0304AgeMs')):233.333)):null;
const r14p27R4Enabled=['player','engineering'].includes(appQuery.get('mode'))&&(appQuery.get('r14p27R4')==='1'||(appQuery.get('mode')==='player'&&appQuery.get('r14p27R4')!=='0'));
const r14p27R4Scale=1.30; // Preserve R4 default baseline; R5 tuning is a separate opt-in overlay.
const r14p27R5Enabled=r14p27R4Enabled&&(appQuery.get('r14p27R5')==='1'||(appQuery.get('mode')==='player'&&appQuery.get('r14p27R5')!=='0'));
const r14p27R4BuildId='R14P27R5_TUNABLE_R4_20261103A';
const r14p27R4Stats={drawCalls:0,skippedNotReady:0,missingSourceFrames:0,firstDraw:null,lastDraw:null,source:'R4_UNMODIFIED_CAPTURE_PNG',selectorMode:'WEB_ADAPTATION_FORCED_03_NOT_LIVE_SELECTOR'};

const whiteBurstAdaptationEnabled=['1','true','on','adapt'].includes(String(appQuery.get('r14p27Adapt')??'').toLowerCase())||['1','true','on'].includes(String(appQuery.get('r14p27White')??'').toLowerCase());
const whiteBurstAdaptationBuildId='R14P27_WEB_ADAPT_WHITE_BURST_20261102A';
const whiteBurstDurationMs=340;
const activityFixtureVisualOverrides=new Map([
 ['GachaGlobalLucky/Root/Frame/GachaCrystalPage/New_Title/Global',false],
 ['GachaGlobalLucky/Root/Frame/GachaCrystalPage/New_Title/PromotionVer',true],
 ['GachaGlobalLucky/Root/Frame/GachaCrystalPage/ChaosFever/Event_ChaosFever',false],
 ['GachaGlobalLucky/Root/Frame/GachaCrystalPage/Event_SecondaryWeapon',true]
]);
const fixture={width:1280,height:720,activeHeight:720,cameraRect:{x:0,y:0,width:1,height:1},portrait:false,orientationType:2,hostParent:'IDENTITY_FIXTURE',nameFont:'FONT_FIXTURE_NOT_PROVEN_LIVE',textRuntimeMultiplier:1,background:'frame'};
fixture.uiRootScale=2/fixture.activeHeight;
fixture.cameraSize=Math.max(fixture.cameraRect.height*1280/fixture.width,fixture.cameraRect.width*720/fixture.height);
let showing=false,session=null,raf=0,trace=[],comparison=null,movieActive=false,nextDrawCount=11;
let p11D3FrameAlphaLast=null;
let shopFeverModeActive=false,shopGaugeGlowVisible=false,shopGaugeGlowStartedAt=null,shopGaugeGlowRaf=0;
let shopAmbientRaf=0,shopAmbientLastAt=null,shopAmbientElapsedSeconds=0,shopAmbientTicking=false;
let moviePending=false,flowGeneration=0;
// The exact result session is mandatory: OneTime/Fever/diagnostic TenTime remain unchanged.
function r14p30P1BEligible(){return r14p30P1BEnabled&&showing&&session?.mode==='normal-local-ten-draw'&&fixture.background==='frame';}
function r14p30P1BFrameTweenOverride(){return r14p30P1BEligible()&&r14p30P1BVariant==='f53-reference'?r14p30P1BAlpha:null;}
function r14p30P1BInvalidate(){popupLayerKey='';if(r14p30P1BEnabled)render();}
function p11D3FrameAlphaDecision(originalSerializedAlpha){
 const resultFrameActive=showing&&!movieActive&&!moviePending;
 if(!resultFrameActive)return {originalSerializedAlpha,effectiveWebAlpha:originalSerializedAlpha,policy:'SOURCE_ALPHA_OUTSIDE_RESULT_FRAME'};
 if(r14p30P1BEligible()){
  const comparisonAlpha=r14p30P1BFrameTweenOverride();
  return {originalSerializedAlpha,effectiveWebAlpha:comparisonAlpha??originalSerializedAlpha,policy:comparisonAlpha===null?'ENGINEERING_A_SOURCE_0_70':'ENGINEERING_B_WEB_VISUAL_CANDIDATE'};
 }
 return {originalSerializedAlpha,effectiveWebAlpha:P11_D3_PLAYER_SELECTED_FRAME_ALPHA,policy:'PLAYER_SELECTED_WEB_VISUAL_ADAPTATION'};
}
function r14p30P2Eligible(){return r14p30P2Enabled&&showing&&['single','normal-local-preview'].includes(session?.mode)&&fixture.background==='frame';}
function r14p30P2UseSourceBlocker(){return r14p30P2Eligible()&&r14p30P2Variant==='historical-dual';}
function r14p30P2Invalidate(){if(r14p30P2Enabled)render();}

let localFeverDiagnosticActionSequence=0;
let feverLocalSimulator=null,feverTenStartPending=false,feverTenStartGeneration=0,feverTenRunSequence=0,feverTenPendingRun=null;
const normalLocalFullFlow=createNormalLocalFullFlowController();
const normalSingleLuckyFeverRuns=new Map();
const feverAutoCycleCompletedRunIds=new Set();
const movie=$('movie'),movieSkip=$('movie-skip'),stage=$('stage');
let p12B5TextLayer=null,p12B5TextContext=null,p12B5FrameLayout=null,p12B5FallbackMainOnly=false,p12B5TextMode='MAIN_CANVAS',p12B5TextDraws=[],p12B5OverlayDrawCount=0,p12B5OverlayBytes=0,p12B5OverlayLastRect=null,p12B5OverlayCacheKey=null,p12B5OverlayError=null,p12B5LastViewportKey=null;
const p12B5TargetTexts=new Set(['水晶商店','查詢','主頁','寶箱','寵物']);
const skipBg=$('movie-skip-bg'),skipArrow=$('movie-skip-arrow'),skipLabel=$('movie-skip-label');
let p10SafeRecovery=null;
const defaultMovieSkipLabel=nonFxAssets.movieSkip.art.label.text;
function clearP10SafeRecovery(){p10SafeRecovery=null;if(movieSkip){delete movieSkip.dataset.p10SafeRecovery;movieSkip.setAttribute('aria-label','跳過');movieSkip.removeAttribute('title');movieSkip.hidden=true;}if(skipLabel)skipLabel.textContent=defaultMovieSkipLabel;}
function showP10SafeRecovery({kind,runId,pool,sourceRowKeys,continueSameBatch}){if(!r14p10PlayerEnabled)return false;p10SafeRecovery={kind,runId,pool,sourceRowKeys:[...sourceRowKeys],continueSameBatch};movieSkip.dataset.p10SafeRecovery='true';movieSkip.setAttribute('aria-label','選片來源未閉合；不播放影片，繼續顯示本次已固定結果');movieSkip.title='保留目前抽樣結果，不選擇替代影片，也不重新抽獎。';skipLabel.textContent='繼續結果';movieSkip.hidden=false;setStatus('本次影片來源無法安全判定；原抽樣結果與順序已保留。按「繼續結果」可不播放影片、直接顯示同一批結果；不會重抽或替代影片。');return true;}
skipBg.src=nonFxAssets.movieSkip.art.background.file;skipArrow.src=nonFxAssets.movieSkip.art.arrow.file;skipLabel.textContent=nonFxAssets.movieSkip.art.label.text;
function syncMovieSkipScale(){const unit=Math.min(1,Math.max(.65,stage.clientWidth/1600));const px=value=>`${(value*unit).toFixed(3)}px`;movieSkip.style.setProperty('--skip-unit',String(unit));for(const [name,value] of Object.entries({'skip-right':94,'skip-top':42,'skip-button-width':170,'skip-button-height':60,'skip-plane-width':170,'skip-plane-height':60,'skip-bg-width':164,'skip-bg-height':48,'skip-label-offset':-14,'skip-label-width':150,'skip-label-height':60,'skip-font-size':20,'skip-shadow-offset':1,'skip-arrow-offset':42,'skip-arrow-width':22,'skip-arrow-height':18}))movieSkip.style.setProperty(`--${name}`,px(value));}
const stageObserver=new ResizeObserver(()=>{syncMovieSkipScale();const changed=syncCanvasResolutionProbeScale(),textGeometryChanged=p12B5GeometryChanged();if((changed||textGeometryChanged)&&!raf){render();if(changed&&canvasResolutionProbeEnabled&&!showing&&!movieActive&&!moviePending)measureStaticRender();}writeVisualQualityReceipt();});stageObserver.observe(stage);syncMovieSkipScale();
const flipAudioFiles={normal:nonFxAssets.flipAudio.normal.file,special:nonFxAssets.flipAudio.special.file};
let audioContext=null,audioMasterGain=null,audioPreparationPromise=null,activeAudioSources=0;
const audioBuffers=new Map();
const audioRuntime={contextState:'not-created',resumeRequests:0,resumeFailures:[],fetchRequests:0,decodedClips:0,decodeFailures:[],sourceStarts:0,sourceStartFailures:[],lastResumeRequestedAt:null,lastResumeSettledAt:null,lastPreparation:null};
function resumeAudioFromGesture(){
 if(!audioContext)return Promise.resolve({status:'no-context'});
 audioRuntime.resumeRequests++;audioRuntime.lastResumeRequestedAt=performance.now();
 try{return Promise.resolve(audioContext.resume()).then(()=>{audioRuntime.contextState=audioContext.state;audioRuntime.lastResumeSettledAt=performance.now();return {status:audioContext.state};}).catch(error=>{const failure={at:performance.now(),message:String(error)};audioRuntime.resumeFailures.push(failure);audioRuntime.contextState=audioContext.state;return {status:'failed',error:failure.message};});}
 catch(error){const failure={at:performance.now(),message:String(error)};audioRuntime.resumeFailures.push(failure);audioRuntime.contextState=audioContext.state;return Promise.resolve({status:'failed',error:failure.message});}
}
function loadAudioBuffer(key,path){
 const existing=audioBuffers.get(key);if(existing)return existing.promise;
 const entry={status:'fetching',path,buffer:null,promise:null,error:null};audioBuffers.set(key,entry);
 entry.promise=(async()=>{try{audioRuntime.fetchRequests++;const response=await fetch(path,{cache:'force-cache'});if(!response.ok)throw Error(`${path} ${response.status}`);const data=await response.arrayBuffer();entry.status='decoding';const buffer=await audioContext.decodeAudioData(data);entry.buffer=buffer;entry.status='ready';audioRuntime.decodedClips++;return buffer;}catch(error){entry.status='failed';entry.error=String(error);audioRuntime.decodeFailures.push({key,path,message:String(error)});return null;}})();return entry.promise;
}
function prepareAudioFromGesture(){
 if(!$('sound-enabled').checked){const result={at:performance.now(),status:'sound-disabled'};audioRuntime.lastPreparation=result;return Promise.resolve(result);}
 if(!audioContext){try{const AudioContextType=window.AudioContext||window.webkitAudioContext;if(!AudioContextType)throw Error('Web Audio API is unavailable');audioContext=new AudioContextType();audioMasterGain=audioContext.createGain();audioMasterGain.gain.value=playerRecords.snapshot().muted?0:1;audioMasterGain.connect(audioContext.destination);audioRuntime.contextState=audioContext.state;}catch(error){audioRuntime.contextState='unavailable';audioRuntime.resumeFailures.push({at:performance.now(),message:String(error)});audioRuntime.lastPreparation={at:performance.now(),status:'unavailable',error:String(error)};return Promise.resolve({status:'unavailable',error:String(error)});}}
 const resume=resumeAudioFromGesture();
 if(!audioPreparationPromise)audioPreparationPromise=Promise.all([loadAudioBuffer('normal',flipAudioFiles.normal),loadAudioBuffer('special',flipAudioFiles.special)]);
 return Promise.all([resume,audioPreparationPromise]).then(([resumeResult,buffers])=>{const result={at:performance.now(),status:resumeResult.status,buffersReady:buffers.every(Boolean),contextState:audioContext.state,clips:audioClipSnapshot()};audioRuntime.lastPreparation=result;return result;});
}

// FX source PNGs are loaded only after the diagnostic FX switch is enabled. AR3 affects engineering after-mode prefetch only.
const serialEarlyFlash = appQuery.get('flashLoadMode') === 'serial-early';
const enqueueFXLoad = createFrameLoadQueue(serialEarlyFlash);
const fxBitmaps=new Map();let bitmapUse=0;
const stageRenderCosts={frames:0,totalMs:0,maxMs:0,phases:{}};
const fxMetrics={requestFXFrameCalls:0,fetchRequests:0,createImageBitmapCalls:0,decodedFrames:0,fetchBytes:0,failures:[],closedBitmaps:0,fetchTotalMs:0,shaTotalMs:0,decodeTotalMs:0,frameLoads:[]};
const p24Trace={schema:'CrystalChest.R14P24.LivePlaybackTrace.v1',buildId:fx0304TraceBuildId,enabled:fx0304TraceEnabled,holdTarget:fx0304TraceHoldTarget,sessionId:null,phase:'not-started',events:[],frameSamples:[],lastFrameSampleKey:null,drawEffectsCalls:0,selectedDrawCalls:0,targetFrameDrawn:false,targetFrameReceipt:null,targetFrameMissed:false,frame80Drawn:false,frame80Receipt:null,pendingTargetFrame:null,freezeUntil:0,canvas:null,loaderMetrics:null,errors:[]};
function p24TraceRecord(event,fields={}){if(!fx0304TraceEnabled)return;const entry={event,atPerformanceMs:Math.round(performance.now()*1000)/1000,phase:session?.phase??p24Trace.phase,...fields};p24Trace.events.push(entry);if(p24Trace.events.length>400)p24Trace.events.shift();}
const p25Trace={schema:'CrystalChest.R14P25.FXFrameStreaming.v1',buildId:fx0304P25BuildId,enabled:fx0304P25TraceEnabled,mode:fx0304P25StreamMode,sessionId:null,phase:'not-started',events:[],roots:{},frames:{},frameReadbacks:[],pendingReadback:null,stream:{renderCalls:0,validSourceOpportunities:0,sourceEmptySamples:0,readyAtRenderStart:0,readyAtDrawDecision:0,notReadyAtDraw:0,drawImageSuccess:0,drawImageErrors:0,skippedNotReady:0},cache:{requests:0,misses:0,readyHits:0,pendingHits:0,fetchStarts:0,fetchSuccess:0,decodeStarts:0,decodeSuccess:0,decodeErrors:0,evictions:0,reloadsAfterEviction:0,repeatedDecodes:0,closed:0,liveBitmapCount:0,peakLiveBitmapCount:0,liveDecodedBytesEstimate:0,peakDecodedBytesEstimate:0,fetchMs:0,shaMs:0,decodeMs:0,performanceMemory:null},settings:{pinEnabled:false,freezeEnabled:false,flipAllSchedulePreserved:true,lookahead:fx0304P25StreamMode==='after'?6:3,warmupFrames:fx0304P25StreamMode==='after'?12:0},canvas:null,resourceTiming:null,errors:[]};
const p25EvictedFiles=new Set(),p25ProtectedFiles=new Set();
function p25Record(event,fields={}){if(!fx0304P25TraceEnabled)return;p25Trace.events.push({event,atPerformanceMs:Number(performance.now().toFixed(3)),phase:session?.phase??p25Trace.phase,...fields});if(p25Trace.events.length>250)p25Trace.events.shift();}
function p25FrameStats(selector,index,file){const key=`${selector}:${index}`;return p25Trace.frames[key]??(p25Trace.frames[key]={selector,index,file,renderOpportunities:0,sourceEmptySamples:0,readyAtRenderStart:0,readyAtDrawDecision:0,notReadyAtDraw:0,drawImageSuccess:0,drawImageErrors:0,fetchStarts:0,decodeCount:0,decodeSuccess:0,evictions:0,reloads:0});}
function p25MemorySnapshot(){const m=performance.memory;return m?{available:true,usedJSHeapSize:m.usedJSHeapSize,totalJSHeapSize:m.totalJSHeapSize,jsHeapSizeLimit:m.jsHeapSizeLimit,classification:'BROWSER_JS_HEAP_NOT_IMAGEBITMAP_OR_GPU_MEMORY'}:{available:false,classification:'PERFORMANCE_MEMORY_UNAVAILABLE'};}
function p25ResourceTimingSnapshot(){const entries=performance.getEntriesByType('resource').filter(e=>e.name.includes('/assets/fx/r4/'));return {entryCount:entries.length,uniqueResourceCount:new Set(entries.map(e=>e.name)).size,transferSizeBytes:entries.reduce((a,e)=>a+(e.transferSize||0),0),encodedBodySizeBytes:entries.reduce((a,e)=>a+(e.encodedBodySize||0),0),decodedBodySizeBytes:entries.reduce((a,e)=>a+(e.decodedBodySize||0),0),durationMs:Number(entries.reduce((a,e)=>a+e.duration,0).toFixed(3)),classification:'RESOURCE_TIMING_IS_PAGE_VISIBLE_AND_MAY_REFLECT_HTTP_CACHE'};}
function p25Publish(){if(!fx0304P25TraceEnabled)return;const rect=canvas.getBoundingClientRect();p25Trace.phase=session?.phase??p25Trace.phase;p25Trace.canvas={logical:[fixture.width,fixture.height],backing:[canvas.width,canvas.height],cssRect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},viewport:[window.innerWidth,window.innerHeight],devicePixelRatio:window.devicePixelRatio,globalAlpha:ctx.globalAlpha,compositeOperation:ctx.globalCompositeOperation};p25Trace.cache={...p25Trace.cache,loaderMetrics:{...fxMetrics,failures:fxMetrics.failures.length},entryCount:fxBitmaps.size,decodedEntryCount:[...fxBitmaps.values()].filter(v=>v.bitmap).length,pendingEntryCount:[...fxBitmaps.values()].filter(v=>v.ready&&!v.bitmap).length,performanceMemory:p25MemorySnapshot()};p25Trace.resourceTiming=p25ResourceTimingSnapshot();window.__r14p25StreamTrace=p25Trace;$('performance-details').open=true;$('performance-receipt').textContent=JSON.stringify(p25Trace,null,2);}
function p25StartSession(){if(!fx0304P25TraceEnabled)return;p25Trace.finished=false;p25Trace.summary=null;p25Trace.frameReadbacks=[];p25Trace.pendingReadback=null;p25Trace.sessionId=`R14P25-${Date.now()}-${session?.metrics?.runId??0}`;p25Trace.phase='dealing';p25Trace.events=[];p25Trace.roots={};p25Trace.frames={};p25Trace.stream={renderCalls:0,validSourceOpportunities:0,sourceEmptySamples:0,readyAtRenderStart:0,readyAtDrawDecision:0,notReadyAtDraw:0,drawImageSuccess:0,drawImageErrors:0,skippedNotReady:0};p25Trace.cache={requests:0,misses:0,readyHits:0,pendingHits:0,fetchStarts:0,fetchSuccess:0,decodeStarts:0,decodeSuccess:0,decodeErrors:0,evictions:0,reloadsAfterEviction:0,repeatedDecodes:0,closed:0,liveBitmapCount:0,peakLiveBitmapCount:0,liveDecodedBytesEstimate:0,peakDecodedBytesEstimate:0,fetchMs:0,shaMs:0,decodeMs:0};p25EvictedFiles.clear();p25ProtectedFiles.clear();p25Record('session-start',{mode:session.mode,sessionRunId:session.metrics.runId,fixture:'R9 Fixture A fixed 11-card TenTime stage',selectedSlot:fx0304SelectedSlotValue,selectorOverride:fx0304SelectorOverride,selectorEvidence:'EXPLICIT_ENGINEERING_OVERRIDE_NOT_NATIVE_RESULT',pinEnabled:false,clockFrozen:false,dealMs:11*timing.moveMs,flipAllPerCardWaitMs:timing.perCardWaitMs});if(fx0304P25StreamMode==='after')p25WarmupInitialFrames();p25Publish();}
function p25WarmupInitialFrames(){const selectors=new Set(Array.from({length:11},(_,i)=>i===fx0304SelectedSlotIndex?fx0304SelectorOverride:fixtures.groups[0][i].fxSelector)),indices=[];for(const selector of selectors){const frames=fxData.captures[selector]?.frames??[];let warmed=0;for(const [index,frame] of frames.entries()){if(!frame?.file)continue;requestFXFrame(selector,index);indices.push({selector,index});if(++warmed>=12)break;}}p25Record('initial-frame-warmup',{selectors:[...selectors],frames:indices,classification:'ENGINEERING_ONLY_PREFETCH_DURING_EXISTING_DEAL_NO_WAIT_NO_CLOCK_CHANGE'});}
let p24TraceSourceShaPromise=null;
function p24TraceLoadSourceSha(){if(!fx0304TraceEnabled||p24TraceSourceShaPromise)return;p24TraceSourceShaPromise=(async()=>{const script=document.querySelector('script[type="module"][src*="src/app.js"]');try{const response=await fetch(script.src,{cache:'no-store'});if(!response.ok)throw Error(`app.js ${response.status}`);const bytes=await response.arrayBuffer(),digest=await sha256Digest(bytes),sha256=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');p24Trace.loadedModule={url:script.src,httpStatus:response.status,byteLength:bytes.byteLength,sha256};}catch(error){p24Trace.loadedModule={url:script?.src??null,error:String(error)};}p24TracePublish();})();}
function p24TracePublish(){if(!fx0304TraceEnabled)return;const script=document.querySelector('script[type="module"][src*="src/app.js"]'),rect=canvas.getBoundingClientRect();p24Trace.phase=session?.phase??p24Trace.phase;p24Trace.canvas={logical:[fixture.width,fixture.height],backing:[canvas.width,canvas.height],cssRect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},viewport:[window.innerWidth,window.innerHeight],devicePixelRatio:window.devicePixelRatio,moduleUrl:script?.src??null};p24Trace.loaderMetrics={...fxMetrics,failures:[...fxMetrics.failures]};$('performance-details').open=true;$('performance-receipt').textContent=JSON.stringify(p24Trace,null,2);p24TraceLoadSourceSha();}
function p24TraceRoiSummary(){
 const width=199,height=250,x=40,y=305,sx=canvas.width/fixture.width,sy=canvas.height/fixture.height,left=Math.max(0,Math.round(x*sx)),top=Math.max(0,Math.round(y*sy)),right=Math.min(canvas.width,Math.round((x+width)*sx)),bottom=Math.min(canvas.height,Math.round((y+height)*sy));
 try{const pixels=ctx.getImageData(left,top,right-left,bottom-top).data;let sumY=0,white=0,visible=0,minX=right,maxX=-1,minY=bottom,maxY=-1,hash=2166136261;for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3],Y=.2126*r+.7152*g+.0722*b;sumY+=Y;if(a&&Math.max(r,g,b)>16){visible++;const px=(i/4)%(right-left),py=Math.floor((i/4)/(right-left));minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);}if(Y>=220&&Math.max(r,g,b)-Math.min(r,g,b)<=55)white++;for(let c=0;c<4;c++){hash^=pixels[i+c];hash=Math.imul(hash,16777619);}}
  return {logicalRect:{x,y,width,height},backingRect:{x:left,y:top,width:right-left,height:bottom-top},pixelCount:(right-left)*(bottom-top),meanRec709Y:Number((sumY/((right-left)*(bottom-top))).toFixed(6)),whitePixelsY220Neutral55:white,whiteRatio:Number((white/((right-left)*(bottom-top))).toFixed(6)),visiblePixels:visible,visibleBounds:minX<right?[minX,minY,maxX+1,maxY+1]:null,rgbaFnv1a32:(hash>>>0).toString(16).padStart(8,'0')};
 }catch(error){return {logicalRect:{x,y,width,height},readbackError:String(error)};}
}
function p25CloseBitmap(bitmap){if(!fx0304P25TraceEnabled||!bitmap)return;const bytes=bitmap.width*bitmap.height*4;p25Trace.cache.closed++;p25Trace.cache.liveBitmapCount=Math.max(0,p25Trace.cache.liveBitmapCount-1);p25Trace.cache.liveDecodedBytesEstimate=Math.max(0,p25Trace.cache.liveDecodedBytesEstimate-bytes);}
function requestFXFrame(selector,n,{pin=false}={}){
 fxMetrics.requestFXFrameCalls++;
 if(!$('fx-enabled').checked&&!r14p27R4Enabled)return null;
 const f=fxData.captures[selector]?.frames[n];if(!f)return null;const p25Stats=fx0304P25TraceEnabled?p25FrameStats(selector,n,f.file):null;if(fx0304P25TraceEnabled)p25Trace.cache.requests++;
 let entry=fxBitmaps.get(f.file);
 if(!entry){if(fx0304P25TraceEnabled){p25Trace.cache.misses++;if(p25EvictedFiles.has(f.file)){p25Trace.cache.reloadsAfterEviction++;p25Stats.reloads++;}p25Stats.fetchStarts++;p25Trace.cache.fetchStarts++;}
  entry={bitmap:null,use:++bitmapUse,selector,frameIndex:n,ready:null,controller:new AbortController(),pinned:pin,createdAt:performance.now(),fetchStartedAt:performance.now()};fxBitmaps.set(f.file,entry);
  if(fx0304TraceEnabled&&selector===fx0304SelectorOverride&&n===(fx0304SelectorOverride==='04'?80:20))p24TraceRecord('fx-image-fetch-start',{selector,frameIndex:n,file:f.file,fetchAtPerformanceMs:Math.round(performance.now()*1000)/1000});entry.ready=enqueueFXLoad(async()=>{try{fxMetrics.fetchRequests++;const response=await fetch(f.file,{signal:entry.controller.signal});if(!response.ok)throw Error(`${f.file} ${response.status}`);const blob=await response.blob();fxMetrics.fetchBytes+=blob.size;const diagnosticFetchMs=performance.now()-entry.fetchStartedAt;fxMetrics.fetchTotalMs+=diagnosticFetchMs;if(fx0304P25TraceEnabled){p25Trace.cache.fetchSuccess++;p25Trace.cache.fetchMs+=performance.now()-entry.fetchStartedAt;}if(!$('fx-enabled').checked&&!r14p27R4Enabled)return null;const shaStarted=performance.now(),digest=await sha256Digest(await blob.arrayBuffer());if(fx0304P25TraceEnabled)p25Trace.cache.shaMs+=performance.now()-shaStarted;const diagnosticShaMs=performance.now()-shaStarted;fxMetrics.shaTotalMs+=diagnosticShaMs;const actualSha256=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');if(actualSha256!==String(f.sha256).toLowerCase())throw Error('FX frame SHA mismatch: '+f.file);fxMetrics.createImageBitmapCalls++;if(fx0304P25TraceEnabled)p25Trace.cache.decodeStarts++;const decodeStarted=performance.now(),bitmap=await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'});if(fx0304P25TraceEnabled)p25Trace.cache.decodeMs+=performance.now()-decodeStarted;const diagnosticDecodeMs=performance.now()-decodeStarted;fxMetrics.decodeTotalMs+=diagnosticDecodeMs;fxMetrics.frameLoads.push({file:f.file,fetchMs:diagnosticFetchMs,shaMs:diagnosticShaMs,decodeMs:diagnosticDecodeMs,finishedAt:performance.now()});if(fxMetrics.frameLoads.length>32)fxMetrics.frameLoads.shift();if(bitmap.width!==f.width||bitmap.height!==f.height){bitmap.close();throw Error('FX frame dimensions mismatch: '+f.file);}if((!$('fx-enabled').checked&&!r14p27R4Enabled)||fxBitmaps.get(f.file)!==entry){bitmap.close();fxMetrics.closedBitmaps++;p25CloseBitmap(bitmap);return null;}entry.bitmap=bitmap;fxMetrics.decodedFrames++;
    if(fx0304P25TraceEnabled){p25Trace.cache.decodeSuccess++;if(p25Stats.decodeCount>0)p25Trace.cache.repeatedDecodes++;p25Stats.decodeCount++;p25Stats.decodeSuccess++;const bytes=bitmap.width*bitmap.height*4;p25Trace.cache.liveBitmapCount++;p25Trace.cache.liveDecodedBytesEstimate+=bytes;p25Trace.cache.peakLiveBitmapCount=Math.max(p25Trace.cache.peakLiveBitmapCount,p25Trace.cache.liveBitmapCount);p25Trace.cache.peakDecodedBytesEstimate=Math.max(p25Trace.cache.peakDecodedBytesEstimate,p25Trace.cache.liveDecodedBytesEstimate);}
    const protectedMode=fx0304P25StreamMode==='after',decoded=[...fxBitmaps].filter(([,v])=>v.bitmap),evictable=decoded.filter(([key,v])=>!v.pinned&&(!protectedMode||!p25ProtectedFiles.has(key))).sort((a,b)=>a[1].use-b[1].use);let decodedCount=decoded.length,decodedBytes=decoded.reduce((n,[,v])=>n+v.bitmap.width*v.bitmap.height*4,0);const afterCap=48,afterBytesCap=256*1024*1024;while(protectedMode?(decodedCount>afterCap||decodedBytes>afterBytesCap)&&evictable.length>0:evictable.length>28){const [key,v]=evictable.shift();if(fx0304P25TraceEnabled){p25EvictedFiles.add(key);p25Trace.cache.evictions++;const fs=p25FrameStats(v.selector,v.frameIndex,key);fs.evictions++;}if(fx0304TraceEnabled&&v.selector===fx0304SelectorOverride&&key===fxData.captures[fx0304SelectorOverride]?.frames[fx0304SelectorOverride==='04'?80:20]?.file)p24TraceRecord('fx-image-evicted',{selector:v.selector,file:key,frameIndex:fx0304SelectorOverride==='04'?80:20,reason:'LRU_OVER_28_UNPINNED_BITMAPS'});const victimBytes=v.bitmap.width*v.bitmap.height*4;p25CloseBitmap(v.bitmap);v.bitmap.close();fxMetrics.closedBitmaps++;fxBitmaps.delete(key);decodedCount--;decodedBytes-=victimBytes;}if(protectedMode&&fx0304P25TraceEnabled&&(decodedCount>afterCap||decodedBytes>afterBytesCap))p25Trace.cache.protectedBudgetPressureSamples=(p25Trace.cache.protectedBudgetPressureSamples||0)+1;
    if(fx0304TraceEnabled&&selector===fx0304SelectorOverride&&[20,80].includes(n))p24TraceRecord('fx-image-decoded',{selector,frameIndex:n,file:f.file,sha256:f.sha256,dimensions:[bitmap.width,bitmap.height],byteLength:blob.size,decode:'success'});if(serialEarlyFlash&&showing&&($('fx-enabled').checked||r14p27R4Active())){requestFXRender('flash-decode');}else if(showing&&($('fx-enabled').checked||r14p27R4Active())){if(fx0304P25StreamMode==='after')schedule();else render();}return bitmap;
   }catch(error){if(error.name!=='AbortError')fxMetrics.failures.push({file:f.file,message:String(error)});if(fx0304P25TraceEnabled){p25Trace.cache.decodeErrors++;p25Trace.errors.push({file:f.file,message:String(error)});}if(fx0304TraceEnabled&&selector===fx0304SelectorOverride&&[20,80].includes(n)){p24Trace.errors.push({file:f.file,message:String(error)});p24TraceRecord('fx-image-load-or-decode-failed',{selector,frameIndex:n,file:f.file,message:String(error)});p24TracePublish();}return null;}});
 }else {if(pin)entry.pinned=true;if(fx0304P25TraceEnabled){if(entry.bitmap)p25Trace.cache.readyHits++;else p25Trace.cache.pendingHits++;}}
 entry.use=++bitmapUse;return entry.bitmap;
}
function releaseFXFrames(preserveWarmFrames = false) {
  for (const [file, entry] of fxBitmaps) {
    if (preserveWarmFrames && serialEarlyFlash && entry.pinned && entry.selector === '03') continue;
    entry.controller?.abort();
    if (entry.bitmap) {
      p25CloseBitmap(entry.bitmap);
      entry.bitmap.close();
      fxMetrics.closedBitmaps++;
    }
    fxBitmaps.delete(file);
  }
}

const p31Note=document.createElement('p');p31Note.id='p31-ui-note';p31Note.hidden=true;p31Note.style.cssText='grid-column:1/-1;margin:0;font-size:11px';p31Note.textContent='玩家裁定：消費使用寶箱券，單抽／單抽Retry 1、10+1／Fever Retry 10；活動時間為固定展示，不扣款。';document.getElementById('normal-local-player').append(p31Note);
const p31Receipt=document.createElement('pre');p31Receipt.id='p31-receipt';p31Receipt.style.cssText='max-height:180px;overflow:auto';document.getElementById('diagnostic-mode').append(p31Receipt);
function p31r3VisualRows(){return session?.resultCards?session.displayOrder.map((idx,slot)=>({slot:slot+1,sourceRowKey:session.resultCards[idx].result.sourceRowKey,...p31r3CardPolicy(session.resultCards[idx]),opened:session.cards[slot].openAt!==null})):[];}
let p31ReceiptAt=-Infinity,p31ReceiptKey="";
const playerReceiptPolicy={policy:'SKIP_ENGINEERING_RECEIPTS_IN_PLAYER',skippedUpdates:0};
function updateP31Receipt(){const eligible=showing&&!movieActive&&!moviePending&&['single','normal-local-preview'].includes(session?.mode);const feverCandidate=showing&&session?.mode==='local-fever-ten-display'&&appQuery.get('feverBackground')!=='off',noteHidden=!(eligible||feverCandidate),noteText=feverCandidate?'Fever背景：WEB_ADAPTATION／NOT_NATIVE_VERIFIED，玩家待驗收；可用FX面板stop關閉。':'玩家裁定：消費使用寶箱券，單抽／單抽Retry 1、10+1／Fever Retry 10；活動時間為固定展示，不扣款。';if(p12A16IdleRenderSyncEnabled){if(p31Note.hidden!==noteHidden)p31Note.hidden=noteHidden;if(p31Note.textContent!==noteText)p31Note.textContent=noteText;}else{p31Note.hidden=noteHidden;p31Note.textContent=noteText;}if(appQuery.get('mode')==='player'){playerReceiptPolicy.skippedUpdates++;return;}const receiptNow=performance.now(),receiptKey=[showing,movieActive,moviePending,session?.normalRunId??session?.feverRunId??session?.metrics?.runId,session?.phase,session?.cards?.filter(c=>c.openAt!==null).length].join('|');if(receiptKey===p31ReceiptKey&&receiptNow-p31ReceiptAt<250)return;p31ReceiptAt=receiptNow;p31ReceiptKey=receiptKey;const c=components.find(c=>c.class==='UISprite'&&c.path==='GachaResultPopup/ButtonRetryObject/ButtonRetry');p31Receipt.textContent=JSON.stringify({classification:['PLAYER_DECISION','WEB_ADAPTATION'],resultUi:resultUiDecision(),runId:session?.normalRunId??session?.feverRunId??session?.metrics?.runId??null,backFX:p32BackPlayer?.snapshot()??null,root2Audit:p32Root2Audit,root2Review:p32Root2Review,perCard:p31r3VisualRows(),cardBackReview:session?.cardBackReview??null,cardBackOptions:cbOptions,cardBackFxClass:cbOptions.fxMode==='backfx'?'ORIGINAL_PARTICLE_ENGINEERING_REPLAY':'LEGACY_ROOT1_WEB_ADAPTATION',targetedFixture:session?.targetedFixture??false,performanceRunCount:performanceRuns.length,costUI:components.filter(c=>(c.class==='UISprite'&&voucherIconPath(c.path))||(c.class==='UILabel'&&voucherQuantityForPath(c.path)!==null)).map(c=>({path:c.path,type:c.class,visible:active(pathChain(c.owner)),display:c.class==='UISprite'?p31Ui.voucher.name:labelText(c)})),eligible,sessionMode:session?.mode??null,phase:session?.phase??null,sourceRowKey:session?.sourceRowKey??null,flow:normalLocalFullFlow.current(),lastFlow:normalLocalFullFlow.receipt(),gauge:localFeverSimulation.snapshot(),retryHidden:$('retry').hidden,retryDisabled:$('retry').disabled,sourceBounds:c?sourceComponentScreenBounds(c):null,referenceValues:p31Ui,trace:trace.filter(e=>e.event.startsWith('normal-local-')||e.event==='one-time-result-stable')},null,2);const r6Receipt=$('r6-receipt');if(r6Receipt)r6Receipt.textContent=JSON.stringify({classification:'MANUAL_FIXTURE_ONLY',active:session?.targetedFixture??false,pool:session?.targetedPool??null,runId:session?.targetedFixture?session.normalRunId:null,phase:session?.targetedFixture?session.phase:null,rows:session?.targetedFixture?r6SourceRows():[],gauge:localFeverSimulation.snapshot(),performanceRunCount:performanceRuns.length},null,2);}
const overrides={'GachaResultPopup':true,'GachaResultPopup/OneTimeGacha':false,'GachaResultPopup/TenTimeGacha':true,'GachaResultPopup/GachaStick':false,'GachaResultPopup/ButtonFever':false,'GachaResultPopup/ButtonFlipAll':false,'GachaResultPopup/UnderFrame':false,'GachaResultPopup/ButtonConfirm':true,'GachaResultPopup/ButtonRetryObject':true,'GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SubTab_Normal/BtnSelect/Active':true,'GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SubTab_Normal/BtnSelect/Basic':false,'GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SbuTab_Fever/BtnSelect/Active':false,'GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SbuTab_Fever/BtnSelect/Basic':true};
let resultUiFrameCache=null;
function pathChain(owner){const a=[],seen=new Set();let o=nodes.get(owner);while(o&&!seen.has(o.id)){seen.add(o.id);a.unshift(o);const p=o.father;if(!p||p.IsNull||String(p.m_PathID)==='0')break;o=transforms.get(o.sourceFile+':'+p.m_PathID);}return a;}
function panel(o){return (componentsByOwner.get(o.id)||[]).find(c=>c.class==='UIPanel');}
function applyTransform(chain,leafOffsetY=0){const cameraPixelsPerUnit=fixture.height*fixture.uiRootScale/(2*fixture.cameraSize);ctx.translate(fixture.width/2,fixture.height/2);ctx.scale(cameraPixelsPerUnit,cameraPixelsPerUnit);for(let i=0;i<chain.length;i++){const o=chain[i],p=o.localPosition||{},s=o.localScale||{},q=o.localRotation||{},offsetY=i===chain.length-1?leafOffsetY:0;ctx.translate(p.X||0,-((p.Y||0)+offsetY));ctx.rotate(-2*Math.atan2(q.Z||0,q.W??1));ctx.scale(s.X??1,s.Y??1);const f=panel(o)?.fields;if(f&&f.mClipping&&f.mClipRange){const r=f.mClipRange;ctx.beginPath();ctx.rect(r.x-r.z/2,-r.y-r.w/2,r.z,r.w);ctx.clip();}}}
function active(chain,forVisual=true){return chain.every(o=>{let a=overrides[o.transformPath];if(forVisual&&activityFixtureMode==='secondaryWeapon'&&activityFixtureVisualOverrides.has(o.transformPath))a=activityFixtureVisualOverrides.get(o.transformPath);if(o.transformPath==='GachaResultPopup/Frame')a=fixture.background==='frame';if(forVisual&&o.transformPath==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Lucky_Gauge/Effect_Gauge_Full')a=shopGaugeGlowVisible;if(forVisual&&o.transformPath==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/BTN_10+1')a=!shopFeverModeActive;if(forVisual&&o.transformPath==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/New_BTN_Fever')a=shopFeverModeActive;if(forVisual&&o.transformPath==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/New_BTN_Fever/Box/Rewardfx')a=false;if(forVisual&&o.transformPath==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/10+1_Tip')a=shopFeverModeActive;return a??o.activeSelf!==false;});}
function alpha(chain){let a=1;for(const o of chain)a*=panel(o)?.fields.mAlpha??1;return a;}
function bounds(f){let w=f.mWidth||0,h=f.mHeight||0,p=f.mPivot??4;return {w,h,x:-(p%3)*w/2,y:-Math.floor(p/3)*h/2};}
// Resolve the fully specified, same-parent anchor case. Other target/rotation cases retain serialized bounds.
function anchoredBounds(c,chain){const f=c.fields,base=bounds(f),parent=chain.at(-2),node=chain.at(-1);if(!parent||!node)return base;const anchors=[f.leftAnchor,f.rightAnchor,f.topAnchor,f.bottomAnchor];if(anchors.some(a=>!a||Number(a.target?.m_FileID)!==0||String(a.target?.m_PathID)!==String(parent.transform.split(':').at(-1))))return base;const target=(componentsByOwner.get(parent.id)||[]).find(x=>['UISprite','UITexture','UIWidget'].includes(x.class));if(!target)return base;const p=bounds(target.fields),pos=node.localPosition||{};const l=p.x+anchors[0].relative*p.w+anchors[0].absolute-(pos.X||0),r=p.x+anchors[1].relative*p.w+anchors[1].absolute-(pos.X||0);const t=p.y+(1-anchors[2].relative)*p.h-anchors[2].absolute+(pos.Y||0),b=p.y+(1-anchors[3].relative)*p.h-anchors[3].absolute+(pos.Y||0);return r>l&&b>t?{x:l,y:t,w:r-l,h:b-t}:base;}
function sourceCanvasPoint(chain,x,y){for(const o of chain){const p=o.localPosition||{},s=o.localScale||{},q=o.localRotation||{},theta=2*Math.atan2(q.Z||0,q.W??1);x*=s.X??1;y*=s.Y??1;const rx=x*Math.cos(-theta)-y*Math.sin(-theta),ry=x*Math.sin(-theta)+y*Math.cos(-theta);x=rx+(p.X||0);y=ry-(p.Y||0);}const k=fixture.height*fixture.uiRootScale/(2*fixture.cameraSize);return {x:fixture.width/2+k*x,y:fixture.height/2+k*y};}
function sourceComponentScreenBounds(c,chain=pathChain(c.owner)){const b=anchoredBounds(c,chain),points=[[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]].map(([x,y])=>sourceCanvasPoint(chain,x,y));return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};}
const tinted=new Map();function tintedImage(img,col){if(!col||[col.r,col.g,col.b].every(v=>v===1))return img;const key=img.src+':'+[col.r,col.g,col.b].join(',');if(!tinted.has(key)){const surface=document.createElement('canvas');surface.width=img.width;surface.height=img.height;const t=surface.getContext('2d');t.drawImage(img,0,0);t.globalCompositeOperation='multiply';t.fillStyle=`rgb(${Math.round(col.r*255)},${Math.round(col.g*255)},${Math.round(col.b*255)})`;t.fillRect(0,0,img.width,img.height);t.globalCompositeOperation='destination-in';t.drawImage(img,0,0);tinted.set(key,surface);}return tinted.get(key);}
function sprite(img,r,b,type,fillDegenerateCenter=false){
  if(type!==1 || !(r.borderLeft||r.borderRight||r.borderTop||r.borderBottom)){ctx.drawImage(img,r.x,r.y,r.width,r.height,b.x,b.y,b.w,b.h);return;}
  const sx=[r.x,r.x+r.borderLeft,r.x+r.width-r.borderRight,r.x+r.width], sy=[r.y,r.y+r.borderTop,r.y+r.height-r.borderBottom,r.y+r.height];
  const dx=[b.x,b.x+r.borderLeft,b.x+b.w-r.borderRight,b.x+b.w],dy=[b.y,b.y+r.borderTop,b.y+b.h-r.borderBottom,b.y+b.h];
  for(let y=0;y<3;y++)for(let x=0;x<3;x++){const sw=sx[x+1]-sx[x],sh=sy[y+1]-sy[y],dw=dx[x+1]-dx[x],dh=dy[y+1]-dy[y];if(sw>0&&sh>0&&dw>0&&dh>0)ctx.drawImage(img,sx[x],sy[y],sw,sh,dx[x],dy[y],dw,dh);else if(fillDegenerateCenter&&x===1&&sw===0&&sh>0&&dw>0&&dh>0){/* The original 30px track has a collapsed UV center. Its adjacent source columns are identical; stretch that source texel across only this opted-in Gauge track. */ctx.drawImage(img,sx[x]-1,sy[y],1,sh,dx[x],dy[y],dw,dh);}}
}
function paintP11OriginalStoreBases(){
 if(!p11InStageShellEnabled){p11StoreBasePaintStatus='NOT_ENABLED';return false;}
 const title=imgs.get(p11StoreTitleBgPath),left=imgs.get(p11StoreLeftBgPath);
 if(!title||!left||title.naturalWidth!==8||title.naturalHeight!==12||left.naturalWidth!==8||left.naturalHeight!==8){p11StoreBasePaintStatus='SOURCE_IMAGE_NOT_READY_OR_DIMENSION_MISMATCH';return false;}
 // Source NGUI centered root: LeftBG depth 3, then TitleBg depth 4.
 sprite(left,{x:0,y:0,width:8,height:8,borderLeft:2,borderRight:2,borderTop:2,borderBottom:2},{x:0,y:84,w:156,h:636},1);
 sprite(title,{x:0,y:0,width:8,height:12,borderLeft:2,borderRight:2,borderTop:2,borderBottom:6},{x:0,y:0,w:1280,h:86},1);
 p11StoreBasePaintStatus='DRAWN_ON_MAIN_SCENE_CANVAS_SOURCE_DIRECT_PARTIAL';return true;
}
function paintP11ScreenshotStoreVisualReference(textFramePrepared=false){
 if(!p11InStageShellEnabled){p11StoreVisualReferencePaintStatus='NOT_ENABLED';return false;}
 const p12B5CaptureText=(textFramePrepared?p12B5TextMode:p12B5BeginTextFrame())==='OVERLAY';
 // Screenshot-geometry mapping only: reference PNG 1276x716 -> logical 1280x720 by uniform contain.
 // This transform is local to these decorative draws; Canvas/stage sizing and input mapping stay untouched.
 const k=720/716,ox=(1280-1276*k)/2;ctx.save();ctx.translate(ox,0);ctx.scale(k,k);
 const fill=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
 const label=(value,x,y,size,color,weight='500',align='center')=>{if(p12B5TargetTexts.has(value)){if(p12B5TextMode==='HIDDEN')return;if(p12B5CaptureText){p12B5TextDraws.push({text:value,x:ox+x*k,y:y*k,size:size*k,color,weight,align});return;}}ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${weight} ${size}px Arial, "Microsoft JhengHei", sans-serif`;ctx.fillText(value,x,y);};
 // PLAYER_GAME_SCREENSHOT_VISUAL: the primary EVENT screenshot samples as one continuous white strip (#FFFFFF),
 // unlike R8R3's gray band/white selected patch. Existing serialized Canvas UILabel + active UISprite own the text/underline.
 fill('#FFFFFF',156,86,1124,71);
 label('水晶商店',20,43,34,'#F7F7F8','700','left');
 // Search control shape is screenshot-grounded. StoreSearch code exposes InputButton/InputText/SearchButton,
 // but the captured GameObject, sprite, hierarchy and exact field-to-screenshot binding remain unresolved.
 fill('#364456',7,102,140,36);ctx.strokeStyle='#C3CDD9';ctx.lineWidth=3;ctx.beginPath();ctx.arc(23,120,6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(27.5,124.5);ctx.lineTo(32,129);ctx.stroke();label('查詢',86,120,16,'#D6D9DE','500');
 // User-requested order and custom Apple wording are not the order/text shown in this screenshot; this is a marked web visual adaptation.
 const entries=[{text:'主頁'},{text:'寶箱',event:true,active:true},{text:'渣男蘋果'},{text:'渣男蘋果收藏家',size:18},{text:'寵物'}];
 const top=155,rowH=89;
 const eventStoreLabel=imgs.get(p11EventStoreLabelPath);
 entries.forEach((entry,index)=>{const y=top+index*rowH;if(entry.active)fill('#EE7546',0,y,156,rowH);if(entry.event&&eventStoreLabel?.naturalWidth===46&&eventStoreLabel.naturalHeight===46)ctx.drawImage(eventStoreLabel,0,y,46,46);label(entry.text,78,y+rowH/2+1,entry.size??20,entry.active?'#FFFFFF':'#D0D2D7',entry.active?'700':'500');});
 // Bottom navigation colors are sampled as a separate screenshot band; no click behavior is added.
 fill('#415066',0,600,156,60);fill('#415066',0,660,156,56);label('前往美容商店',78,630,18,'#FFFFFF','500');label('前往商店',78,688,20,'#FFFFFF','500');
 ctx.restore();p11StoreVisualReferencePaintStatus='DRAWN_ON_MAIN_SCENE_CANVAS_PLAYER_SCREENSHOT_VISUAL';return true;
}
function p12B5ViewportKey(){const r=stage.getBoundingClientRect();return `${r.x.toFixed(3)}|${r.y.toFixed(3)}|${r.width.toFixed(3)}|${r.height.toFixed(3)}|${window.devicePixelRatio||1}`;}
function p12B5GeometryChanged(){const key=p12B5ViewportKey(),changed=p12B5LastViewportKey!==null&&key!==p12B5LastViewportKey;p12B5LastViewportKey=key;return changed;}
function p12B5SafeShopTextState(){
 const modal=$('probability-modal-overlay');
 if(!p12B5FormalPlayerRoute||!p11InStageShellEnabled||document.visibilityState!=='visible'||!modal||!modal.hidden||session!==null||showing||movieActive||moviePending||normalR9StartPending||feverTenStartPending||normalLocalTenStartPending||normalLocalTenPendingRun||normalLocalSingleResumePending||normalLocalTenResumePending||normalLocalFullFlow.current())return false;
 try{if(luckyFeverOverlay.snapshot().visible)return false;}catch{return false;}
 return true;
}
function p12B5SmallStageLayout(){
 const r=stage.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
 if(!(r.width>0&&r.height>0&&dpr>0))return null;
 const sx=r.width/1280,sy=r.height/720;
 // The improvement is useful only below native 1280x720 output and for a uniform stage fit.
 if(sx>=0.9999||sy>=0.9999||Math.abs(sx-sy)>0.001)return null;
 return {x:r.x,y:r.y,width:r.width,height:r.height,dpr,scaleX:sx,scaleY:sy,backingWidth:Math.max(1,Math.round(r.width*dpr)),backingHeight:Math.max(1,Math.round(r.height*dpr))};
}
function p12B5EnsureLayer(layout){
 if(!p12B5TextLayer){p12B5TextLayer=document.createElement('canvas');p12B5TextLayer.id='p12b5-shop-text-layer';p12B5TextLayer.setAttribute('aria-hidden','true');p12B5TextLayer.hidden=true;p12B5TextLayer.width=0;p12B5TextLayer.height=0;p12B5TextLayer.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;user-select:none;image-rendering:auto';stage.insertBefore(p12B5TextLayer,canvas.nextSibling);}
 if(p12B5TextLayer.width!==layout.backingWidth||p12B5TextLayer.height!==layout.backingHeight){p12B5TextLayer.width=layout.backingWidth;p12B5TextLayer.height=layout.backingHeight;p12B5OverlayCacheKey=null;p12B5TextContext=null;}
 p12B5TextContext=p12B5TextContext||p12B5TextLayer.getContext('2d',{alpha:true});
 if(!p12B5TextContext||p12B5TextLayer.width<=0||p12B5TextLayer.height<=0)return false;
 p12B5OverlayBytes=p12B5TextLayer.width*p12B5TextLayer.height*4;p12B5OverlayLastRect={x:layout.x,y:layout.y,width:layout.width,height:layout.height,dpr:layout.dpr};return true;
}
function p12B5HideAndReleaseLayer(){
 if(!p12B5TextLayer)return;
 p12B5TextLayer.hidden=true;
 if(p12B5TextLayer.width!==0||p12B5TextLayer.height!==0){p12B5TextLayer.width=0;p12B5TextLayer.height=0;}
 p12B5TextLayer.remove();p12B5TextLayer=null;p12B5TextContext=null;p12B5OverlayCacheKey=null;p12B5OverlayBytes=0;p12B5OverlayLastRect=null;
}
function p12B5BeginTextFrame(){
 p12B5TextDraws=[];p12B5FrameLayout=null;
 if(p12B5FallbackMainOnly){p12B5TextMode='MAIN_CANVAS';p12B5HideAndReleaseLayer();return 'MAIN_CANVAS';}
 if(!p12B5SafeShopTextState()){p12B5TextMode='HIDDEN';p12B5HideAndReleaseLayer();return 'HIDDEN';}
 const layout=p12B5TextRasterEnabled?p12B5SmallStageLayout():null;
 if(layout){if(!p12B5EnsureLayer(layout)){p12B5OverlayError='CANVAS_CONTEXT_OR_BACKING_UNAVAILABLE';p12B5TextMode='MAIN_CANVAS';p12B5HideAndReleaseLayer();return 'MAIN_CANVAS';}p12B5FrameLayout=layout;p12B5TextMode='OVERLAY';return 'OVERLAY';}
 p12B5TextMode='MAIN_CANVAS';p12B5HideAndReleaseLayer();return 'MAIN_CANVAS';
}
function p12B5FallbackToMain(reason){
 p12B5OverlayError=String(reason);p12B5FrameLayout=null;p12B5TextDraws=[];p12B5HideAndReleaseLayer();p12B5FallbackMainOnly=true;
 try{renderFrame(performance.now());}finally{p12B5FallbackMainOnly=false;}
}
function p12B5CommitTextFrame(){
 const layout=p12B5FrameLayout;
 if(!layout||p12B5TextMode!=='OVERLAY')return;
 if(p12B5TextDraws.length!==p12B5TargetTexts.size){p12B5FallbackToMain(`EXPECTED_${p12B5TargetTexts.size}_LABELS_GOT_${p12B5TextDraws.length}`);return;}
 try{
  const layer=p12B5TextLayer,c=p12B5TextContext;if(!layer||!c)throw Error('TEXT_LAYER_CONTEXT_MISSING');
  const key=`${layout.backingWidth}x${layout.backingHeight}|${layout.x.toFixed(3)},${layout.y.toFixed(3)},${layout.width.toFixed(3)},${layout.height.toFixed(3)},${layout.dpr}|${p12B5TextDraws.map(x=>`${x.text}/${x.x}/${x.y}/${x.size}/${x.color}/${x.weight}/${x.align}`).join('|')}`;
  if(key!==p12B5OverlayCacheKey){c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,layer.width,layer.height);c.setTransform(layer.width/1280,0,0,layer.height/720,0,0);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';for(const item of p12B5TextDraws){c.textAlign=item.align;c.textBaseline='middle';c.fillStyle=item.color;c.font=`${item.weight} ${item.size}px Arial, "Microsoft JhengHei", sans-serif`;c.fillText(item.text,item.x,item.y);}p12B5OverlayCacheKey=key;p12B5OverlayDrawCount++;}
  layer.hidden=false;p12B5OverlayError=null;
 }catch(error){p12B5FallbackToMain(error);}
}
function p12B5Snapshot(){const rect=stage.getBoundingClientRect();return {revision:'P12-B5R2',enabled:p12B5TextRasterEnabled,classification:'WEB_PRESENTATION_EXPERIMENT',nativeFontParity:'NOT_CLAIMED',state:p12B5TextMode,eligible:p12B5TextMode==='OVERLAY'&&Boolean(p12B5FrameLayout),labels:[...p12B5TargetTexts],drawnLabels:p12B5TextDraws.map(x=>x.text),drawCount:p12B5OverlayDrawCount,stage:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,logical:[1280,720],devicePixelRatio:window.devicePixelRatio||1},canvas:{exists:Boolean(p12B5TextLayer),width:p12B5TextLayer?.width??0,height:p12B5TextLayer?.height??0,rgbaBytes:p12B5OverlayBytes,hidden:p12B5TextLayer?.hidden??true,zIndex:2,pointerEvents:'none',lastRect:p12B5OverlayLastRect},mainCanvasUnchanged:[canvas.width,canvas.height],fallbackError:p12B5OverlayError};}
if(p12B5FormalPlayerRoute){
 window.__p12B5TextCandidate=Object.freeze({classification:'WEB_PRESENTATION_EXPERIMENT',enabled:p12B5TextRasterEnabled,nativeFontParity:'NOT_CLAIMED',snapshot:p12B5Snapshot,setEnabled:value=>{p12B5TextRasterEnabled=Boolean(value);render();return p12B5Snapshot();}});
 const modal=$('probability-modal-overlay');if(modal)new MutationObserver(()=>{if(!raf)render();}).observe(modal,{attributes:true,attributeFilter:['hidden']});
 const resizeTextView=()=>{if(p12B5GeometryChanged()&&!raf)render();};window.addEventListener('resize',resizeTextView,{passive:true});window.visualViewport?.addEventListener('resize',resizeTextView,{passive:true});document.addEventListener('visibilitychange',()=>{if(!raf)render();});document.fonts?.addEventListener('loadingdone',()=>{if(p12B5TextRasterEnabled&&!raf)render();});
}
window.__p11S1R8R3=Object.freeze({classification:'P11_D5_UNIFIED_PLAYER_SOURCE_PARTIAL_PLAYER_PENDING',enabled:p11InStageShellEnabled,snapshot:()=>({enabled:p11InStageShellEnabled,formalPlayerRoute:appQuery.get('mode')==='player',visualReferencePaintStatus:p11StoreVisualReferencePaintStatus,sourceBasePaintStatus:p11StoreBasePaintStatus,composition:'single #stage/#scene 1280x720 canvas; no iframe/extra shell/scene resize',stage:stage.getBoundingClientRect().toJSON(),canvas:[canvas.width,canvas.height],reference:{file:'PLAYER_REFERENCE_EVENT_SHOP_20261108.png',raster:[1276,716],mapping:'uniform contain into 1280x720, decoration-only transform'},visualElements:[{element:'TitleBg',evidence:'SOURCE_DIRECT'},{element:'LeftBG',evidence:'SOURCE_DIRECT'},{element:'store title',evidence:'PLAYER_GAME_SCREENSHOT_VISUAL'},{element:'search/query row',evidence:'PLAYER_GAME_SCREENSHOT_VISUAL; control class fields code-confirmed; instance binding unresolved'},{element:'sidebar order/labels/active EVENT chest',evidence:'WEB_ADAPTATION based on user order and screenshot shape; native runtime order/label/selected skin unresolved'},{element:'white content tab',evidence:'PLAYER_GAME_SCREENSHOT_VISUAL; MainTabItem/CategoryTabItem runtime binding unresolved'},{element:'bottom navigation',evidence:'PLAYER_GAME_SCREENSHOT_VISUAL; native component/sprite binding unresolved'}],nativeParity:'NOT_CLAIMED'})});
window.__p11S1R8R4=Object.freeze({classification:'P11_SCREENSHOT_VISUAL_CANDIDATE_NOT_NATIVE_PARITY_PLAYER_PENDING',enabled:p11InStageShellEnabled,snapshot:()=>({enabled:p11InStageShellEnabled,formalPlayerRoute:appQuery.get('mode')==='player',nativeParity:'NOT_CLAIMED',composition:'single existing 1280x720 #scene Canvas',whiteTab:{uniqueBackgroundOwner:'paintP11ScreenshotStoreVisualReference',band:'#FFFFFF',rect:{x:156,y:86,width:1124,height:71},selectedPatchRemoved:true,underlineOwner:'GachaGlobalLucky/Root/TabView/SubTabList/SubTab_Crystal/BtnSelect/Active UISprite',underlineSprite:'com_w_tab_s02',serializedSize:[280,4],serializedDepth:3,drawnSeparately:true,duplicateUnderlineRemoved:true,labelOwner:'GachaGlobalLucky/Root/TabView/SubTabList/SubTab_Crystal/BtnSelect/Active/TextBtnSelect UILabel + CUILanguage',labelKey:'UI_Generic_GachaGlobalLucky_1',resolvedText:'水晶\\n寶箱',duplicateTextAdded:false,tabRuntimeStyleBinding:'SOURCE_UNRESOLVED'},eventBadge:{asset:p11EventStoreLabelPath,sourceSprite:'StoreAtlas/Event_Store_Label',atlasPathID:'-325475099022620933',texturePathID:'2601687657925745150',atlasRect:{x:1793,y:1334,width:46,height:46},assetLoaded:Boolean(imgs.get(p11EventStoreLabelPath)),placement:'PLAYER_GAME_SCREENSHOT_VISUAL at 宝箱 row origin',runtimeCategoryBinding:'SOURCE_UNRESOLVED'},stage:stage.getBoundingClientRect().toJSON(),canvas:[canvas.width,canvas.height]})});
function voucherQuantityForPath(path){if(path==='GachaResultPopup/ButtonRetryObject/ButtonRetry/Count')return retryVoucherQuantity(session,p31Ui.quantities);if(path.endsWith('/OneTimeCost'))return p31Ui.quantities.single;if(path.endsWith('/LuckyTimeCost'))return p31Ui.quantities.feverTen;if(path.endsWith('/TenTimeCost'))return p31Ui.quantities.ten;return null;}
function voucherIconPath(path){return path.endsWith('/PriceIcon')||path==='GachaResultPopup/ButtonRetryObject/ButtonRetry/CostIcon';}
function baseLabelText(c){if(shopFeverModeActive&&c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/New_BTN_Fever/Box/Active/Desc')return 'Fever 10+1購買';if(c.path==='GachaResultPopup/ButtonRetryObject/ButtonRetry/Label'&&session?.mode==='local-fever-ten-display')return 'Fever 10+1 再抽';if(c.path==='GachaResultPopup/ButtonRetryObject/ButtonRetry/Label'&&session?.mode==='normal-local-ten-draw')return '10+1 再抽';const voucherQuantity=voucherQuantityForPath(c.path);if(voucherQuantity!==null)return String(voucherQuantity);if(c.path==='GachaResultPopup/Event_SecondaryWeapon/Text_RemainTime')return p31Ui.resultActivityTime.display;if(activityFixtureMode==='secondaryWeapon'&&c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Event_SecondaryWeapon/Time/Txt_RemainTime')return '12天04小時';if(activityFixtureMode==='secondaryWeapon'&&c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/New_InfoText')return 'Fever值達MAX時，可進行Fever抽取!\nFever抽取時，可獲得[FF81FA]混沌[-]等級裝備!\n輔助武器、神話/古代裝備＆混沌結晶碎片登場機率2倍!';const f=c.fields;const loc=languageByOwner.get(c.owner);const key=loc?.NationDefaultText?.[2]||loc?.DefaultText;return (key&&ui.language[key])||f.mText||'';}
function resultUiDecision(){return resultUiFrameCache??resultFeverRetrySnapshot();}
function labelText(c){const fever=resultUiDecision();if(fever.feverVisible&&c.path==='GachaResultPopup/ButtonFever/Box/Active/Desc')return 'Fever 10+1購買';if(fever.feverVisible&&c.path==='GachaResultPopup/ButtonFever/Btn_Tip/Desc')return [fever.usesText,fever.timeText].filter(Boolean).join('\n');if(fever.resultRoute==='FEVER_EXHAUSTED_NORMAL_RETRY'&&c.path==='GachaResultPopup/ButtonRetryObject/ButtonRetry/Label')return '10+1 再抽';return baseLabelText(c);}
const sourceRichLabelPaths=new Set([
 'GachaGlobalLucky/Root/Frame/GachaCrystalPage/GachaPickMessage/Txt_Desc',
 'GachaGlobalLucky/Root/Frame/GachaCrystalPage/ChaosFever/Event_ChaosFever/Top/Txt_Desc',
 'GachaGlobalLucky/Root/Frame/GachaCrystalPage/Event_SecondaryWeapon/Top/Text_Info',
 'GachaGlobalLucky/Root/Frame/GachaCrystalPage/New_InfoText',
 'GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/ScrollView_text/Bottom_Text'
]);
function richColorEqual(a,b){return a.r===b.r&&a.g===b.g&&a.b===b.b&&a.a===b.a;}
function appendRichLabelText(lines,text,color){for(const ch of Array.from(String(text||''))){if(ch==='\n'){lines.push([]);continue;}const line=lines.at(-1),last=line.at(-1);if(last&&richColorEqual(last.color,color))last.text+=ch;else line.push({text:ch,color:{...color}});}}
function parseRichLabelLines(text,baseColor){const base={r:baseColor.r??1,g:baseColor.g??1,b:baseColor.b??1,a:1},lines=[[]],tag=/\[([0-9a-fA-F]{6}|[0-9a-fA-F]{8}|-)\]/g;let color=base,last=0,match;while((match=tag.exec(String(text||'')))){appendRichLabelText(lines,String(text||'').slice(last,match.index),color);if(match[1]==='-')color=base;else{const hex=match[1];color={r:parseInt(hex.slice(0,2),16)/255,g:parseInt(hex.slice(2,4),16)/255,b:parseInt(hex.slice(4,6),16)/255,a:hex.length===8?parseInt(hex.slice(6,8),16)/255:1};}last=tag.lastIndex;}appendRichLabelText(lines,String(text||'').slice(last),color);return lines;}
function appendRichLabelRun(line,ch,color){const last=line.at(-1);if(last&&richColorEqual(last.color,color))last.text+=ch;else line.push({text:ch,color:{...color}});}
function richLabelLineWidth(line,spacing=0){let width=0,count=0;for(const run of line)for(const ch of Array.from(run.text)){width+=ctx.measureText(ch).width;if(count++)width+=spacing;}return width;}
function wrapRichLabelLines(source,maxWidth,spacing){const output=[];for(const sourceLine of source){let line=[],width=0,hasText=false;for(const run of sourceLine)for(const ch of Array.from(run.text)){const advance=ctx.measureText(ch).width+(hasText?spacing:0);if(hasText&&maxWidth>0&&width+advance>maxWidth){output.push(line);line=[];width=0;hasText=false;}appendRichLabelRun(line,ch,run.color);width+=ctx.measureText(ch).width+(hasText?spacing:0);hasText=true;}output.push(line);}return output.length?output:[[]];}
function paintSourceRichLabel(text,fields,b,color,layout={}){let size=Math.max(6,Number(layout.fontSize??fields.mFontSize)||16),spacing=Number(fields.mSpacingX)||0;ctx.font=`${size}px sans-serif`;const overflow=Math.round(Number(fields.mOverflow)||0),source=parseRichLabelLines(text,color);let lines=overflow===3?wrapRichLabelLines(source,b.w,spacing):source;const maxLines=Math.max(0,Math.round(Number(fields.mMaxLineCount)||0));if(maxLines&&lines.length>maxLines)lines=lines.slice(0,maxLines);const lineSpacing=Math.max(-.5,Number(fields.mLineSpacing)||0),lineHeight=Number(layout.lineHeight)||(size+(Number(fields.mSpacingY)||0)+2)*(1+lineSpacing);if(overflow===0){const widest=Math.max(1,...lines.map(line=>richLabelLineWidth(line,spacing))),neededHeight=Math.max(1,lines.length*lineHeight),scale=Math.min(1,b.w/widest,b.h/neededHeight);size=Math.max(6,size*scale);spacing*=scale;ctx.font=`${size}px sans-serif`;}const actualLineHeight=Number(layout.lineHeight)||(size+(Number(fields.mSpacingY)||0)+2)*(1+lineSpacing),pivot=Number(fields.mPivot??4),alignCode=Math.round(Number(fields.mAlignment)||0),align=alignCode===1?'left':alignCode===2?'center':alignCode===3?'right':pivot%3===0?'left':pivot%3===2?'right':'center',left=b.x,right=b.x+b.w,center=b.x+b.w/2,x=align==='left'?left:align==='right'?right:center;ctx.save();ctx.font=`${size}px sans-serif`;ctx.textBaseline='middle';ctx.textAlign='left';if(overflow===1){ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();}const effectStyle=Math.round(Number(fields.mEffectStyle)||0),effect=fields.mEffectColor||{r:0,g:0,b:0,a:1},effectDistance=fields.mEffectDistance||{x:1,y:1};let firstY;if(layout.topAlign)firstY=b.y+size/2;else if(pivot<=2)firstY=b.y+actualLineHeight/2;else if(pivot>=6)firstY=b.y+b.h-actualLineHeight/2-(lines.length-1)*actualLineHeight;else firstY=b.y+b.h/2-(lines.length-1)*actualLineHeight/2;for(let i=0;i<lines.length;i++){const line=lines[i],lineWidth=richLabelLineWidth(line,spacing);let cursor=align==='left'?x:align==='right'?x-lineWidth:x-lineWidth/2;const y=firstY+i*actualLineHeight;for(let runIndex=0;runIndex<line.length;runIndex++){const run=line[runIndex],runWidth=richLabelLineWidth([run],spacing);if(effectStyle===1){ctx.save();ctx.fillStyle=colorCss(effect);ctx.fillText(run.text,cursor+(effectDistance.x||0),y+(effectDistance.y||0));ctx.restore();}else if(effectStyle===2||effectStyle===3){ctx.save();ctx.strokeStyle=colorCss(effect);ctx.lineJoin='round';ctx.lineWidth=effectStyle===3?3:2;ctx.strokeText(run.text,cursor,y);ctx.restore();}ctx.fillStyle=`rgba(${Math.round(run.color.r*255)},${Math.round(run.color.g*255)},${Math.round(run.color.b*255)},${run.color.a})`;if(Math.abs(spacing)<1e-6)ctx.fillText(run.text,cursor,y);else{let at=cursor;for(const ch of Array.from(run.text)){ctx.fillText(ch,at,y);at+=ctx.measureText(ch).width+spacing;}}cursor+=runWidth+(runIndex<line.length-1?spacing:0);}}ctx.restore();}
const sourceAdditiveSecondaryWeaponSpritePathIDs=new Set(['7808295375970237726','-8036564145268356931','-1029823579458974621','-921567152442618945','-8383143844388338431','-6652926841525605148','-3310041930933929338','-5927914220503157210']);
function usesSourceAdditiveSecondaryWeaponSprite(c,binding){const shader=c.fields.overrideShader;return c.class==='UISprite'&&c.sourceFile==='CAB-f9d73c83169e3c3541a17c277801f437'&&sourceAdditiveSecondaryWeaponSpritePathIDs.has(String(c.PathID))&&(c.path.startsWith('GachaGlobalLucky/Root/Frame/GachaCrystalPage/Event_SecondaryWeapon/Item/')||c.path.startsWith('GachaResultPopup/Event_SecondaryWeapon/Deco_'))&&Number(shader?.m_FileID)===3&&String(shader?.m_PathID)==='-4434582610107754559'&&binding?.texture==='CAB-f9d73c83169e3c3541a17c277801f437:6629820909576309265'&&binding?.rect?.name==='Img_EventInfoBgEff_2';}
function paintComponent(record,alphaMultiplier=1,localOffsetY=0){const c=record.component,chain=record.chain;if(!chain.length||!active(chain))return;const f=c.fields;if(f.m_Enabled===0)return;ctx.save();applyTransform(chain,localOffsetY);ctx.globalAlpha=alpha(chain)*(f.mColor?.a??1)*alphaMultiplier;
  if(c.path==='GachaResultPopup/Frame'){const tween=(componentsByOwner.get(c.owner)||[]).find(x=>x.class==='TweenAlpha');const originalTweenFactor=tween?.fields.to??1;const alphaDecision=p11D3FrameAlphaDecision(originalTweenFactor);ctx.globalAlpha*=alphaDecision.effectiveWebAlpha;p11D3FrameAlphaLast={...alphaDecision,mode:session?.mode??null,phase:session?.phase??null};}
  const b=anchoredBounds(c,chain),binding=c.atlasBinding;
  if(c.class==='UISprite'&&voucherIconPath(c.path)){ctx.drawImage(imgs.get(p31Ui.voucher.file),b.x,b.y,b.w,b.h);}
  else if(c.class==='UISprite'&&binding?.rect&&binding.texture){const tex=manifest.textures[binding.texture];if(tex){const fillsKnownDegenerateCenter=c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Lucky_Gauge/BG_Gauge'||c.path==='GachaResultPopup/CN_LuckyPointObj/Lucky_Gauge/BG_Gauge'||c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Event_SecondaryWeapon/Time/Bg';sprite(tintedImage(imgs.get(tex.file),f.mColor),binding.rect,b,f.mType,fillsKnownDegenerateCenter&&f.mFillCenter===1);}}
  else if(c.class==='UITexture'&&f.mTexture?.m_PathID&&String(f.mTexture.m_PathID)!=='0'){const id=c.sourceFile+':'+f.mTexture.m_PathID,tex=manifest.textures[id];if(tex)ctx.drawImage(tintedImage(imgs.get(tex.file),f.mColor),b.x,b.y,b.w,b.h);}
  else if(c.class==='UILabel'){const col=f.mColor||{r:1,g:1,b:1,a:1};if(shopFeverModeActive&&c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/10+1_Tip/Desc'){const feverUi=localFeverShopUiSnapshot(),prompt=feverUi.prompt;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${f.mFontSize||15}px FixtureNoto, sans-serif`;ctx.fillStyle=colorCss(col);ctx.fillText(prompt.usesText,0,prompt.timeText?-9:0,Math.max(0,b.w));if(prompt.timeText)ctx.fillText(prompt.timeText,0,9,Math.max(0,b.w));}else{const text=labelText(c);if(text){if(c.path==='GachaResultPopup/ButtonFever/Btn_Tip/Desc'&&resultUiDecision().feverVisible){const ui=resultUiDecision();ctx.fillStyle=colorCss(col);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${f.mFontSize||15}px FixtureNoto, sans-serif`;ctx.fillText(ui.usesText,0,ui.timeText?-9:0,Math.max(0,b.w));if(ui.timeText)ctx.fillText(ui.timeText,0,9,Math.max(0,b.w));}else if(c.path==='GachaResultPopup/TenTimeGacha/Global_Fever_Text/Text')paintGaugeLabelText(text,f,b.w,col);else if(f.mEncoding===1&&sourceRichLabelPaths.has(c.path))paintSourceRichLabel(text,f,b,col,c.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/ScrollView_text/Bottom_Text'?{fontSize:14,lineHeight:18,topAlign:true}:undefined);else{ctx.fillStyle=`rgb(${Math.round(col.r*255)},${Math.round(col.g*255)},${Math.round(col.b*255)})`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${f.mFontSize||16}px sans-serif`;ctx.fillText(text,0,0,Math.max(0,b.w));}}}}
  ctx.restore();
}
const drawRecords=components.map(component=>{const chain=pathChain(component.owner);return {component,chain,panelDepth:chain.reduce((v,o)=>Math.max(v,panel(o)?.fields.mDepth??0),0),widgetDepth:component.fields.mDepth??0};}).sort((a,b)=>a.panelDepth-b.panelDepth||a.widgetDepth-b.widgetDepth);
const shopGaugeBackgroundRecord=drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Lucky_Gauge/BG_Gauge');
const shopGaugeFillRecord=drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Lucky_Gauge/Gauge');
const shopGaugeEffectRecord=drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Lucky_Gauge/Effect_Gauge_Full');
const shopGaugeValueRecord=drawRecords.find(r=>r.component.class==='UILabel'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Lucky_Gauge/LuckyGaugeText');
const shopFeverInfoBackgroundRecord=drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/10+1_Tip/box');
const shopFeverInfoTextRecord=drawRecords.find(r=>r.component.class==='UILabel'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/10+1_Tip/Desc');
const resultGaugeFillRecord=drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaResultPopup/CN_LuckyPointObj/Lucky_Gauge/Gauge');
const resultGaugeEffectRecord=drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaResultPopup/CN_LuckyPointObj/Lucky_Gauge/Effect_Gauge_Full');
const resultGaugeValueRecord=drawRecords.find(r=>r.component.class==='UILabel'&&r.component.path==='GachaResultPopup/CN_LuckyPointObj/Lucky_Gauge/LuckyGaugeText');
const shopGaugeDynamicRecords=new Set([shopGaugeBackgroundRecord,shopGaugeFillRecord,shopGaugeEffectRecord,shopGaugeValueRecord]);
const resultGaugeDynamicRecords=new Set([resultGaugeFillRecord,resultGaugeEffectRecord,resultGaugeValueRecord]);
const shopFeverInfoRecords=new Set([shopFeverInfoBackgroundRecord,shopFeverInfoTextRecord]);
const shopDrawRecords=drawRecords.filter(r=>(r.component.path==='GachaGlobalLucky'||r.component.path.startsWith('GachaGlobalLucky/'))&&!shopGaugeDynamicRecords.has(r)&&!shopFeverInfoRecords.has(r));
const shopFrameBackgroundRecord=shopDrawRecords.find(r=>r.component.class==='UITexture'&&r.component.path==='GachaGlobalLucky/Root/Frame/Bg');
const shopChestRecord=shopDrawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/Treasurebox_Crystal');
const shopDotInsertIndex=shopDrawRecords.indexOf(shopFrameBackgroundRecord),shopChestIndex=shopDrawRecords.indexOf(shopChestRecord);
if(shopDotInsertIndex<0||shopChestIndex<=shopDotInsertIndex)throw Error('S1C_SHOP_DOT_DRAW_ORDER_ANCHOR_MISMATCH');
const shopLayerBeforeDotRecords=shopDrawRecords.slice(0,shopDotInsertIndex+1),shopLayerDotToChestRecords=shopDrawRecords.slice(shopDotInsertIndex+1,shopChestIndex),shopLayerAfterChestRecords=shopDrawRecords.slice(shopChestIndex+1);
const shopChestTweenFields=shopChestTweenComponent?.fields,shopChestTweenKeys=shopChestTweenFields?.animationCurve?.m_Curve||[];
const shopChestBaseY=shopChestRecord?.chain.at(-1)?.localPosition?.Y;
const shopChestTweenSourceSupported=shopChestTweenFields?.m_Enabled===1&&shopChestTweenFields.worldSpace===0&&shopChestTweenFields.style===2&&Number(shopChestTweenFields.duration)===1&&shopChestTweenFields.from?.y===-24&&shopChestTweenFields.to?.y===-14&&shopChestBaseY===-19&&shopChestTweenKeys.length===2&&shopChestTweenKeys[0].time===0&&shopChestTweenKeys[0].value===0&&shopChestTweenKeys[0].inSlope===0&&shopChestTweenKeys[0].outSlope===0&&shopChestTweenKeys[1].time===1&&shopChestTweenKeys[1].value===1&&shopChestTweenKeys[1].inSlope===0&&shopChestTweenKeys[1].outSlope===0;
const resultFeverTipRoot='GachaResultPopup/ButtonFever/Btn_Tip';
const isResultFeverTipRecord=r=>r.component.path===resultFeverTipRoot||r.component.path.startsWith(resultFeverTipRoot+'/');
const popupFeverTipRecords=drawRecords.filter(r=>isResultFeverTipRecord(r)&&r.component.path.startsWith('GachaResultPopup/'));
const popupDrawRecords=drawRecords.filter(r=>r.component.path.startsWith('GachaResultPopup/')&&!resultGaugeDynamicRecords.has(r)&&!isResultFeverTipRecord(r));
const cardInsertionIndex=popupDrawRecords.findIndex(r=>r.widgetDepth>=2);
const popupBeforeRecords=cardInsertionIndex<0?popupDrawRecords:popupDrawRecords.slice(0,cardInsertionIndex);
const popupAfterRecords=cardInsertionIndex<0?[]:popupDrawRecords.slice(cardInsertionIndex);
const shopHitRecords=[{count:1,path:'GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/BTN_1/Box/Active'},{count:11,path:'GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/BTN_10+1/Box/Active'}].map(entry=>({...entry,record:drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path===entry.path)})).filter(entry=>entry.record);
const probabilityInfoRecord=drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/RateInfoButton');
const shopTargetSyncCache=createShopTargetSyncCache(p12A16IdleRenderSyncEnabled);
const p31r2ShopButtons=[1,11].map(count=>{const b=document.createElement('button');b.id=count===1?'shop-buy-single':'shop-buy-ten';b.type='button';b.style.cssText='position:absolute;background:transparent;border:0;cursor:pointer;z-index:2';b.onclick=()=>{$('draw-count').value=String(count);routeStageShopPurchase(count);};canvas.parentElement.append(b);return {count,button:b};});
const probabilityInfoTrigger=document.createElement('button');probabilityInfoTrigger.id='probability-info-trigger';probabilityInfoTrigger.type='button';probabilityInfoTrigger.hidden=true;probabilityInfoTrigger.style.cssText='position:absolute;z-index:4;padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation';probabilityInfoTrigger.setAttribute('aria-label','機率資訊');canvas.parentElement.append(probabilityInfoTrigger);
const probabilityInfoModal=createProbabilityInfoModal({trigger:probabilityInfoTrigger,overlay:$('probability-modal-overlay'),dialog:$('probability-modal'),stayButton:$('probability-modal-stay'),closeButton:$('probability-modal-close'),isShopIdle:()=>appQuery.get('mode')==='player'&&!showing&&!movieActive&&!moviePending&&!normalR9StartPending&&!feverTenStartPending&&!normalLocalTenStartPending&&!normalLocalTenPendingRun&&!normalLocalSingleResumePending&&!normalLocalTenResumePending&&!normalLocalFullFlow.current()&&!luckyFeverOverlay.snapshot().visible});
function updateProbabilityInfoTarget(precomputed=null){if(!probabilityInfoRecord||appQuery.get('mode')!=='player'){if(p12A16IdleRenderSyncEnabled)applyShopTargetStateIfChanged(probabilityInfoTrigger,{hidden:true});else probabilityInfoTrigger.hidden=true;return;}if(precomputed){const openable=!showing&&!movieActive&&!moviePending&&!normalR9StartPending&&!feverTenStartPending&&!normalLocalTenStartPending&&!normalLocalTenPendingRun&&!normalLocalSingleResumePending&&!normalLocalTenResumePending&&!precomputed.localFlow&&!precomputed.luckyOverlayVisible&&precomputed.probabilityComponentActive;const r=sourceComponentScreenBounds(probabilityInfoRecord.component,probabilityInfoRecord.chain);applyShopTargetStateIfChanged(probabilityInfoTrigger,{style:{left:(r.left/1280*100)+'%',top:(r.top/720*100)+'%',width:((r.right-r.left)/1280*100)+'%',height:((r.bottom-r.top)/720*100)+'%'},hidden:!openable});return;}const openable=!showing&&!movieActive&&!moviePending&&!normalR9StartPending&&!feverTenStartPending&&!normalLocalTenStartPending&&!normalLocalTenPendingRun&&!normalLocalSingleResumePending&&!normalLocalTenResumePending&&!normalLocalFullFlow.current()&&!luckyFeverOverlay.snapshot().visible&&active(probabilityInfoRecord.chain,false);const r=sourceComponentScreenBounds(probabilityInfoRecord.component,probabilityInfoRecord.chain);probabilityInfoTrigger.style.left=(r.left/1280*100)+'%';probabilityInfoTrigger.style.top=(r.top/720*100)+'%';probabilityInfoTrigger.style.width=((r.right-r.left)/1280*100)+'%';probabilityInfoTrigger.style.height=((r.bottom-r.top)/720*100)+'%';probabilityInfoTrigger.hidden=!openable;}
function updateShopPurchaseTargets(state,feverUi){if(!p12A16IdleRenderSyncEnabled){feverUi=localFeverShopUiSnapshot();for(const {count,button} of p31r2ShopButtons){const record=count===11&&shopFeverModeActive?drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/New_BTN_Fever/Box/Active'):shopHitRecords.find(e=>e.count===count)?.record;if(!record)continue;const r=sourceComponentScreenBounds(record.component,record.chain);button.style.left=(r.left/1280*100)+'%';button.style.top=(r.top/720*100)+'%';button.style.width=((r.right-r.left)/1280*100)+'%';button.style.height=((r.bottom-r.top)/720*100)+'%';button.hidden=showing||movieActive||moviePending;button.disabled=count===1?(!localFeverSimulation.snapshot().normalSingleAvailable||shopFeverModeActive):shopFeverModeActive?!feverUi.active:!localFeverSimulation.snapshot().normalSingleAvailable;button.dataset.purchaseMode=shopFeverModeActive?'FEVER_10_PLUS_1':'NORMAL';button.setAttribute('aria-label',count===1?(shopFeverModeActive?'一般單抽（Fever期間不可使用）':'購買1次（寶箱使用券1）'):(shopFeverModeActive?'Fever 10+1購買（寶箱使用券10）':'購買10+1次（寶箱使用券10）'));}updateProbabilityInfoTarget();return;}state??=localFeverSimulation.snapshot();feverUi??=localFeverShopUiSnapshot(state);const localFlow=normalLocalFullFlow.current(),luckyOverlayVisible=luckyFeverOverlay.snapshot().visible,probabilityComponentActive=Boolean(probabilityInfoRecord&&active(probabilityInfoRecord.chain,false)),key=shopTargetStateKey({route:appQuery.get('mode'),shellEnabled:p11InStageShellEnabled,feverMode:shopFeverModeActive,feverActive:feverUi.active,normalSingleAvailable:state.normalSingleAvailable,showing,movieActive,moviePending,normalR9StartPending,feverTenStartPending,normalLocalTenStartPending,normalLocalTenPendingRun:Boolean(normalLocalTenPendingRun),normalLocalSingleResumePending:Boolean(normalLocalSingleResumePending),normalLocalTenResumePending:Boolean(normalLocalTenResumePending),normalLocalFlow:Boolean(localFlow),luckyOverlayVisible,probabilityComponentActive,fixtureWidth:fixture.width,fixtureHeight:fixture.height,canvasRenderScale,canvasWidth:canvas.width,canvasHeight:canvas.height});if(!shopTargetSyncCache.shouldUpdate(key))return;for(const {count,button} of p31r2ShopButtons){const record=count===11&&shopFeverModeActive?drawRecords.find(r=>r.component.class==='UISprite'&&r.component.path==='GachaGlobalLucky/Root/Frame/GachaCrystalPage/BTN/New_BTN_Fever/Box/Active'):shopHitRecords.find(e=>e.count===count)?.record;if(!record)continue;const r=sourceComponentScreenBounds(record.component,record.chain);applyShopTargetStateIfChanged(button,{style:{left:(r.left/1280*100)+'%',top:(r.top/720*100)+'%',width:((r.right-r.left)/1280*100)+'%',height:((r.bottom-r.top)/720*100)+'%'},hidden:showing||movieActive||moviePending,disabled:count===1?(!state.normalSingleAvailable||shopFeverModeActive):shopFeverModeActive?!feverUi.active:!state.normalSingleAvailable,dataset:{purchaseMode:shopFeverModeActive?'FEVER_10_PLUS_1':'NORMAL'},attributes:{'aria-label':count===1?(shopFeverModeActive?'一般單抽（Fever期間不可使用）':'購買1次（寶箱使用券1）'):(shopFeverModeActive?'Fever 10+1購買（寶箱使用券10）':'購買10+1次（寶箱使用券10）')}});}updateProbabilityInfoTarget({localFlow,luckyOverlayVisible,probabilityComponentActive});}

let shopLayerBeforeDot=null,shopLayerDotToChest=null,shopLayerAfterChest=null,popupLayerKey='',popupBeforeLayer=null,popupAfterLayer=null,popupFeverTipLayer=null,blockerLayer=null;
const p12AmbientStaticCacheEnabled=appQuery.get('p12AmbientStaticCache')==='1'&&p11InStageShellEnabled;
let shopLayerBeforeDotKey=null,shopLayerBeforeDotTextDraws=[];
const shopNormalCacheEnabled=appQuery.get('shopNormalCache')==='1'&&!p12AmbientStaticCacheEnabled;
const retainedShopVariants=new Map();
const shopNormalCacheStats={enabled:shopNormalCacheEnabled,saves:0,hits:0,misses:0,invalidations:0,normalHits:0,feverHits:0};
function normalShopCacheKey(){return JSON.stringify([canvas.width,canvas.height,canvasRenderScale,
 p12B5TextRasterEnabled,p12B5TextMode,activityFixtureMode,imgs.size,document.fonts?.status,
 Object.entries(overrides).filter(([path])=>path.startsWith('GachaGlobalLucky/')).sort((a,b)=>a[0].localeCompare(b[0]))]);}
function resetShopLayers(clearRetained=true){
 if(clearRetained){retainedShopVariants.clear();shopNormalCacheStats.invalidations++;}
 shopLayerBeforeDot=null;shopLayerDotToChest=null;shopLayerAfterChest=null;shopLayerBeforeDotKey=null;shopLayerBeforeDotTextDraws=[];
}
function switchShopLayers(nextFeverMode){
 if(!shopNormalCacheEnabled){resetShopLayers();return;}
 const key=normalShopCacheKey();
 if(shopLayerBeforeDot&&shopLayerDotToChest&&shopLayerAfterChest){
  retainedShopVariants.set(shopFeverModeActive,{key,before:shopLayerBeforeDot,middle:shopLayerDotToChest,
   after:shopLayerAfterChest,beforeKey:shopLayerBeforeDotKey,textDraws:shopLayerBeforeDotTextDraws});
  shopNormalCacheStats.saves++;
 }
 resetShopLayers(false);
 const retained=retainedShopVariants.get(nextFeverMode);
 if(retained?.key===key){
  shopLayerBeforeDot=retained.before;shopLayerDotToChest=retained.middle;shopLayerAfterChest=retained.after;
  shopLayerBeforeDotKey=retained.beforeKey;shopLayerBeforeDotTextDraws=retained.textDraws;
  shopNormalCacheStats.hits++;
  if(nextFeverMode)shopNormalCacheStats.feverHits++;else shopNormalCacheStats.normalHits++;
 }else shopNormalCacheStats.misses++;
}
function resetRenderLayers(){resetShopLayers();popupLayerKey='';popupBeforeLayer=null;popupAfterLayer=null;popupFeverTipLayer=null;blockerLayer=null;}
function syncCanvasResolutionProbeScale(){const desired=canvasResolutionProbeEnabled?Math.max(1,Math.min(2,stage.clientWidth/fixture.width*window.devicePixelRatio)):1;const width=Math.max(1,Math.round(fixture.width*desired)),height=Math.max(1,Math.round(fixture.height*desired));const changed=canvas.width!==width||canvas.height!==height||Math.abs(canvasRenderScale-desired)>0.0001;canvasRenderScale=desired;if(changed){if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;ctx=canvas.getContext('2d');ctx.setTransform(canvasRenderScale,0,0,canvasRenderScale,0,0);resetRenderLayers();}return changed;}
function disableCanvasResolutionProbeForFlow(){if(!canvasResolutionProbeEnabled)return;const control=$('canvas-resolution-probe');if(control)control.checked=false;setCanvasResolutionProbe(false);}
function setCanvasResolutionProbe(enabled){if(enabled&&(showing||movieActive||moviePending)){const control=$('canvas-resolution-probe');if(control)control.checked=false;return false;}canvasResolutionProbeEnabled=Boolean(enabled);const changed=syncCanvasResolutionProbeScale();if(!changed)resetRenderLayers();render();writeVisualQualityReceipt();return true;}
function drawLayer(records){const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const previous=ctx;try{ctx=layer.getContext('2d');ctx.setTransform(canvasRenderScale,0,0,canvasRenderScale,0,0);for(const record of records)paintComponent(record);}finally{ctx=previous;}return layer;}
function drawLayerWithSourceBlend(records){const layers=[];let run=[];const flush=blend=>{if(!run.length)return;layers.push({image:drawLayer(run),blend});run=[];};for(const record of records){if(usesSourceAdditiveSecondaryWeaponSprite(record.component,record.component.atlasBinding)){flush('source-over');layers.push({image:drawLayer([record]),blend:'lighter'});}else run.push(record);}flush('source-over');return layers;}
function drawLogicalLayer(layer){if(Array.isArray(layer)){for(const part of layer){ctx.save();ctx.globalCompositeOperation=part.blend;ctx.drawImage(part.image,0,0,fixture.width,fixture.height);ctx.restore();}return;}if(layer)ctx.drawImage(layer,0,0,fixture.width,fixture.height);}
function withP11ContentClip(draw){/* S1R8R0 uses one stable 1280x720 stage; never inherit the rejected M3 content crop in this opt-in composite. */return draw();}
function drawP11CoreScopedLayer(layer){return withP11ContentClip(()=>drawLogicalLayer(layer));}
function ensureShopLayerBeforeDot(){
 if(!p12AmbientStaticCacheEnabled){if(!shopLayerBeforeDot)shopLayerBeforeDot=drawLayer(shopLayerBeforeDotRecords);return shopLayerBeforeDot;}
 p12B5BeginTextFrame();
 const title=imgs.get(p11StoreTitleBgPath),left=imgs.get(p11StoreLeftBgPath),eventLabel=imgs.get(p11EventStoreLabelPath);
 const key=[canvas.width,canvas.height,canvasRenderScale,p12B5TextRasterEnabled,p12B5TextMode,title?.naturalWidth??0,title?.naturalHeight??0,left?.naturalWidth??0,left?.naturalHeight??0,eventLabel?.naturalWidth??0,eventLabel?.naturalHeight??0].join('|');
 if(shopLayerBeforeDot&&shopLayerBeforeDotKey===key){p12B5TextDraws=shopLayerBeforeDotTextDraws;return shopLayerBeforeDot;}
 const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const previous=ctx;let baseReady=false;
 try{ctx=layer.getContext('2d');ctx.setTransform(canvasRenderScale,0,0,canvasRenderScale,0,0);for(const record of shopLayerBeforeDotRecords)paintComponent(record);baseReady=paintP11OriginalStoreBases();paintP11ScreenshotStoreVisualReference(true);}
 finally{ctx=previous;}
 shopLayerBeforeDot=layer;shopLayerBeforeDotKey=baseReady?key:null;shopLayerBeforeDotTextDraws=p12B5TextDraws;
 return shopLayerBeforeDot;
}
function ensureShopLayerDotToChest(){if(!shopLayerDotToChest)shopLayerDotToChest=drawLayer(shopLayerDotToChestRecords);return shopLayerDotToChest;}
function ensureShopLayerAfterChest(){if(!shopLayerAfterChest)shopLayerAfterChest=drawLayerWithSourceBlend(shopLayerAfterChestRecords);return shopLayerAfterChest;}
function shopChestTweenOffsetY(){if(!shopChestTweenSourceSupported||!shopChestRecord)return 0;const duration=shopChestTweenFields.duration,cycle=(shopAmbientElapsedSeconds%(duration*2))/duration,t=cycle<=1?cycle:2-cycle,eased=t*t*(3-2*t),fromY=shopChestTweenFields.from.y,toY=shopChestTweenFields.to.y,baseY=shopChestRecord.chain.at(-1)?.localPosition?.Y??0;return fromY+(toY-fromY)*eased-baseY;}
function shopAmbientShouldRun(){return !document.hidden&&!showing&&!movieActive&&!moviePending&&(shopChestTweenSourceSupported||window.CrystalDot?.active===true);}
function stopShopAmbientAnimation(){if(shopAmbientRaf)cancelAnimationFrame(shopAmbientRaf);shopAmbientRaf=0;shopAmbientLastAt=null;window.CrystalDot?.setLoopRunning(false);}
function tickShopAmbientAnimation(now){shopAmbientRaf=0;if(!shopAmbientShouldRun()){stopShopAmbientAnimation();return;}const dt=shopAmbientLastAt===null?0:Math.min(.1,Math.max(0,(now-shopAmbientLastAt)/1000));shopAmbientLastAt=now;shopAmbientElapsedSeconds+=dt;window.CrystalDot?.advance(dt);shopAmbientTicking=true;render(now);shopAmbientTicking=false;window.CrystalDot?.setLoopRunning(true);if(shopAmbientShouldRun()&&!shopAmbientRaf)shopAmbientRaf=requestAnimationFrame(tickShopAmbientAnimation);}
function syncShopAmbientAnimation(){if(!shopAmbientShouldRun()){stopShopAmbientAnimation();return;}if(shopAmbientRaf||shopAmbientTicking)return;shopAmbientRaf=requestAnimationFrame(tickShopAmbientAnimation);}
function ensureBlockerLayer(){if(!blockerLayer){blockerLayer=document.createElement('canvas');blockerLayer.width=canvas.width;blockerLayer.height=canvas.height;const c=blockerLayer.getContext('2d'),image=imgs.get(manifest.textures['CAB-f9d73c83169e3c3541a17c277801f437:-6048621795860257109'].file);c.setTransform(canvasRenderScale,0,0,canvasRenderScale,0,0);c.globalAlpha=blocker.UITexture.mColor[3];c.drawImage(image,0,0,fixture.width,fixture.height);}return blockerLayer;}
function ensurePopupLayers(){const feverTip=resultUiDecision(),frameRecord=popupBeforeRecords.find(r=>r.component.path==='GachaResultPopup/Frame'),frameTween=frameRecord&&(componentsByOwner.get(frameRecord.component.owner)||[]).find(x=>x.class==='TweenAlpha'),originalFrameAlpha=frameTween?.fields.to??1,frameAlphaDecision=p11D3FrameAlphaDecision(originalFrameAlpha),sessionRenderKey=session?.normalRunId??session?.feverRunId??session?.metrics?.runId??session?.started??null,baseKey=[fixture.background,session?.mode,session?.phase??null,sessionRenderKey,Object.entries(overrides).sort((a,b)=>a[0].localeCompare(b[0])),[feverTip.feverVisible,feverTip.resultRoute,feverTip.usesText,feverTip.timeText],['p11d3-frame-alpha',frameRecord?frameAlphaDecision.effectiveWebAlpha:null,frameRecord?frameAlphaDecision.policy:'NO_FRAME_RECORD']];const key=JSON.stringify(baseKey);if(key!==popupLayerKey){popupBeforeLayer=drawLayer(popupBeforeRecords);popupAfterLayer=drawLayerWithSourceBlend(popupAfterRecords);popupFeverTipLayer=drawLayerWithSourceBlend(popupFeverTipRecords);popupLayerKey=key;}return {before:popupBeforeLayer,after:popupAfterLayer,feverTip:popupFeverTipLayer};}
function paintDynamicGaugeFill(record,progress,maxProgress){
 if(!record||!maxProgress)return;const c=record.component,chain=record.chain,f=c.fields,binding=c.atlasBinding,texture=binding?.texture&&manifest.textures[binding.texture],img=texture&&imgs.get(texture.file),rect=binding?.rect;
 if(!chain.length||!active(chain)||f.m_Enabled===0||!img||!rect)return;
 const ratio=Math.max(0,Math.min(1,progress/maxProgress));if(ratio<=0)return;
 ctx.save();applyTransform(chain);ctx.globalAlpha=alpha(chain)*(f.mColor?.a??1);const b=anchoredBounds(c,chain),sourceWidth=rect.width*ratio,destWidth=b.w*ratio,fillImage=tintedImage(img,f.mColor);
 if(sourceWidth>0&&destWidth>0&&b.h>0)ctx.drawImage(fillImage,rect.x,rect.y,sourceWidth,rect.height,b.x,b.y,destWidth,b.h);
 ctx.restore();
}
function paintDynamicGaugeValue(record,value){
 if(!record)return;const c=record.component,chain=record.chain,f=c.fields;if(!chain.length||!active(chain)||f.m_Enabled===0)return;
 ctx.save();applyTransform(chain);ctx.globalAlpha=alpha(chain)*(f.mColor?.a??1);const b=anchoredBounds(c,chain),color=f.mColor||{r:1,g:1,b:1,a:1};
 paintGaugeLabelText(`Fever值：${value}`,f,b.w,color,{outlineWidth:2});ctx.restore();
}
function feverPurchasePrompt(state=localFeverSimulation.snapshot()){
 const usesRemaining=Math.max(0,Number(state.usesRemaining)||0),remainingTimeText=typeof state.remainingTimeText==='string'&&state.remainingTimeText.trim()?state.remainingTimeText.trim():null;
 const timeText=`剩餘時間${remainingTimeText??'12小時04分'}`;
 return {usesRemaining,usesText:`Fever轉蛋可進行${usesRemaining}次`,timeText,timeSourceClass:remainingTimeText?'LOCAL_SIMULATION_STATE_UNVERIFIED':'WEB_FIXED_DISPLAY_NOT_REAL_COUNTDOWN'};
}
function localFeverShopUiSnapshot(state=localFeverSimulation.snapshot()){const activation=[...(state.events??[])].reverse().find(event=>event.type==='local-fever-activated'),active=state.phase==='fever-test-active'&&state.usesRemaining>0,prompt=feverPurchasePrompt(state);return {active,mode:active?'FEVER_10_PLUS_1':'NORMAL',...prompt,prompt,activationSource:activation?.source??null,activationKind:activation?.source==='player-supplied-lucky-fever-random-trigger'?'LUCKY_FEVER_RANDOM_TRIGGER':'ORDINARY_OR_DIAGNOSTIC_FEVER',remainingTimeText:typeof state.remainingTimeText==='string'&&state.remainingTimeText.trim()?state.remainingTimeText.trim():null,timeAvailable:Object.hasOwn(state,'remainingTimeText')&&typeof state.remainingTimeText==='string'&&state.remainingTimeText.trim().length>0};}
function resultFeverRetrySnapshot(state=localFeverSimulation.snapshot(),now=performance.now()){
 const mode=session?.mode??null,isLocalTen=['normal-local-ten-draw','local-fever-ten-display','normal-local-ten-display'].includes(mode),expectedCount=isLocalTen?11:(Number(session?.count)||session?.cards?.length||0),cards=Array.isArray(session?.cards)?session.cards:[];
 const allCardsOpened=Boolean(showing&&session?.phase==='complete'&&!session.batch&&!session.flipAllPending&&expectedCount>0&&cards.length===expectedCount&&cards.every(card=>Number.isFinite(card?.openAt)&&now-card.openAt>=timing.flipMs));
 const allElevenOpened=isLocalTen&&expectedCount===11&&allCardsOpened,normalTen=mode==='normal-local-ten-draw',feverTen=mode==='local-fever-ten-display',usesRemaining=Math.max(0,Number(state.usesRemaining)||0),latestActivation=[...(state.events??[])].reverse().find(event=>event.type==='local-fever-activated');
 const normalSettlementReady=normalTen&&session?.normalProgressCounted===true,feverSettlementReady=feverTen&&session?.feverQuotaConsumed===true;
 const luckyResult=normalTen&&session?.luckyFeverRandomTriggered===true&&normalSettlementReady&&state.phase==='fever-test-active'&&usesRemaining>0&&latestActivation?.source==='player-supplied-lucky-fever-random-trigger';
 const naturalCapResult=normalTen&&session?.luckyFeverRandomTriggered!==true&&normalSettlementReady&&state.phase==='fever-test-active'&&usesRemaining>0&&latestActivation?.source==='local-normal-ten-plus-one';
 const ordinaryFeverResult=feverTen&&feverSettlementReady;
 const luckyOverlayReady=!session?.luckyFeverRandomTriggered||luckyFeverOverlay.snapshot().activeRunId===null;
 let resultRoute='NOT_READY',settlementReady=false,feverVisible=false,feverEnabled=false,normalRetryVisible=false;
 if(allCardsOpened){
  if(ordinaryFeverResult){settlementReady=true;if(usesRemaining>0){resultRoute='FEVER_RETRY';feverVisible=true;feverEnabled=true;}else if(state.phase==='fever-test-exhausted-transition-unknown'&&isConfirmedFinalFeverRun(session,state)&&allElevenOpened){resultRoute='FEVER_EXHAUSTED_NORMAL_RETRY';normalRetryVisible=true;}else{resultRoute='QUOTA_EXHAUSTED';feverVisible=true;feverEnabled=false;}}
  else if(luckyResult&&luckyOverlayReady){settlementReady=true;resultRoute='LUCKY_FEVER';feverVisible=true;feverEnabled=true;}
  else if(naturalCapResult){settlementReady=true;resultRoute='NORMAL_GAUGE_FULL_FEVER_AVAILABLE';feverVisible=true;feverEnabled=true;}
  else if(normalTen&&normalSettlementReady){settlementReady=true;resultRoute='NORMAL_RETRY';normalRetryVisible=true;}
  else if(normalTen){resultRoute='SETTLEMENT_PENDING';}
  else if(mode==='normal-local-ten-display'){resultRoute='NORMAL_RETRY';settlementReady=true;normalRetryVisible=p31r2SharedResultUi;}
  else if(!feverTen){resultRoute='NORMAL_RETRY';settlementReady=true;normalRetryVisible=mode!=='fx0304-single-diagnostic';}
 }
 const prompt=feverPurchasePrompt(state),timeText=prompt.timeText,timeSourceClass=prompt.timeSourceClass;
 const hitTargetVisible=feverVisible||normalRetryVisible;
 return {phase:session?.phase??'shop',allElevenOpened,allCardsOpened,settlementReady,resultRoute,visible:feverVisible,feverVisible,enabled:feverEnabled,usesRemaining,usesText:prompt.usesText,timeText,timeSourceClass,normalRetryVisible,hitTargetVisible,costQuantity:10,source:resultRoute==='FEVER_EXHAUSTED_NORMAL_RETRY'?'FEVER_EXHAUSTED_NORMAL_RETRY':resultRoute==='LUCKY_FEVER'?'LUCKY_FEVER_RESULT':resultRoute==='NORMAL_GAUGE_FULL_FEVER_AVAILABLE'?'NORMAL_GAUGE_FULL_FEVER_AVAILABLE':ordinaryFeverResult?'FEVER_RESULT':null,classification:'WEB_SIMULATION_ONLY_RESULT_UI_ADAPTATION'};
}
window.__feverResultRetryUi=Object.freeze({snapshot:()=>resultFeverRetrySnapshot()});
 function shopGaugeGlowAlpha(now,state=localFeverSimulation.snapshot()){const eligible=!showing&&!shopFeverModeActive&&state.phase==='normal-progress'&&state.progress>=100&&state.progress<state.maxProgress;shopGaugeGlowVisible=eligible;if(!eligible){shopGaugeGlowStartedAt=null;return null;}if(shopGaugeGlowStartedAt===null)shopGaugeGlowStartedAt=now;const phase=((now-shopGaugeGlowStartedAt)%2000)/1000,triangle=phase<=1?phase:2-phase;return .1+.9*triangle;}
 function wantsShopGaugeGlowAnimation(state=localFeverSimulation.snapshot()){return !showing&&!shopFeverModeActive&&state.phase==='normal-progress'&&state.progress>=100&&state.progress<state.maxProgress;}
 function syncShopGaugeGlowAnimation(state=localFeverSimulation.snapshot()){if(!wantsShopGaugeGlowAnimation(state)){if(shopGaugeGlowRaf)cancelAnimationFrame(shopGaugeGlowRaf);shopGaugeGlowRaf=0;shopGaugeGlowStartedAt=null;return;}if(shopGaugeGlowRaf)return;shopGaugeGlowRaf=requestAnimationFrame(t=>{shopGaugeGlowRaf=0;if(p12A16IdleRenderSyncEnabled?wantsShopGaugeGlowAnimation(state):wantsShopGaugeGlowAnimation())render(t);});}
// Gauge UILabel mEffectStyle follows the saved NGUI style fields and Preview137 text-effect pass.
function colorCss(color){const c=color||{r:1,g:1,b:1,a:1};return `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${Math.max(0,Math.min(1,c.a??1))})`;}
function paintGaugeLabelText(text,fields,maxWidth,color=fields.mColor||{r:1,g:1,b:1,a:1},options={}){
 const width=Math.max(0,maxWidth),style=Math.round(fields.mEffectStyle||0),effect=fields.mEffectColor||{r:0,g:0,b:0,a:1},distance=fields.mEffectDistance||{x:1,y:1};
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${fields.mFontSize||16}px FixtureNoto, sans-serif`;
 if(style===1){ctx.fillStyle=colorCss(effect);ctx.fillText(text,distance.x||0,distance.y||0,width);}
 else if(style===2||style===3){ctx.strokeStyle=colorCss(effect);ctx.lineJoin='round';ctx.lineWidth=Number.isFinite(options.outlineWidth)?options.outlineWidth:Math.max(1,2*Math.max(distance.x||1,distance.y||1));ctx.strokeText(text,0,0,width);}
 if(fields.mApplyGradient===1){const height=Math.max(1,Number(fields.mHeight)||Number(fields.mFontSize)||16),top=fields.mGradientTop||color,bottom=fields.mGradientBottom||color,gradient=ctx.createLinearGradient(0,-height/2,0,height/2);gradient.addColorStop(0,`rgb(${Math.round(top.r*255)},${Math.round(top.g*255)},${Math.round(top.b*255)})`);gradient.addColorStop(1,`rgb(${Math.round(bottom.r*255)},${Math.round(bottom.g*255)},${Math.round(bottom.b*255)})`);ctx.fillStyle=gradient;}
 else ctx.fillStyle=`rgb(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)})`;
 ctx.fillText(text,0,0,width);
}
function normalResultFeverGaugeReady(now=performance.now()){
 if(!showing||!session||!['normal-local-preview','normal-local-ten-draw'].includes(session.mode))return false;
 const expectedCount=session.mode==='normal-local-preview'?1:11;
 return session.phase==='complete'&&!session.batch&&!session.flipAllPending&&Array.isArray(session.cards)&&session.cards.length===expectedCount&&session.cards.every(card=>card.openAt!==null&&Number.isFinite(card.openAt)&&now-card.openAt>=timing.flipMs);
}
 function paintFeverProgressHud(now=performance.now(),showResultGauge=normalResultFeverGaugeReady(now),state=localFeverSimulation.snapshot()){
  const value=`${state.progress}/${state.maxProgress}`;
  if(!showing&&!shopFeverModeActive){if(shopGaugeBackgroundRecord)paintComponent(shopGaugeBackgroundRecord);paintDynamicGaugeFill(shopGaugeFillRecord,state.progress,state.maxProgress);const glow=shopGaugeGlowAlpha(now,state);if(glow!==null&&shopGaugeEffectRecord)paintComponent(shopGaugeEffectRecord,glow);paintDynamicGaugeValue(shopGaugeValueRecord,value);}
  if(showResultGauge&&session?.luckyFeverRandomTriggered!==true){paintDynamicGaugeFill(resultGaugeFillRecord,state.progress,state.maxProgress);paintDynamicGaugeValue(resultGaugeValueRecord,value);}
}
function drawCardText(text,size,y,maxWidth){if(!text)return;ctx.save();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';let px=size*4*.1*fixture.textRuntimeMultiplier;ctx.font=`${px}px FixtureNoto`;const width=ctx.measureText(text).width;if(width>maxWidth){px*=maxWidth/width;ctx.font=`${px}px FixtureNoto`;}ctx.fillText(text,0,y);ctx.restore();}
const timing={moveMs:200,flipMs:200,perCardWaitMs:200,postLoopWaitMs:300};
const performanceRuns=[];let performanceRunSequence=0;
function fxCounterSnapshot(){return {requestFXFrameCalls:fxMetrics.requestFXFrameCalls,fetchRequests:fxMetrics.fetchRequests,createImageBitmapCalls:fxMetrics.createImageBitmapCalls,decodedFrames:fxMetrics.decodedFrames,fetchBytes:fxMetrics.fetchBytes};}
function fxResourceSnapshot(){const files=new Set(Object.values(fxData.captures).flatMap(c=>c.frames.filter(f=>f?.file).map(f=>f.file)));return performance.getEntriesByType('resource').filter(entry=>[...files].some(file=>entry.name.endsWith(file))).map(entry=>({name:entry.name,transferSize:entry.transferSize,decodedBodySize:entry.decodedBodySize}));}
function audioClipSnapshot(){return Object.fromEntries([...audioBuffers].map(([key,value])=>[key,{status:value.status,path:value.path,error:value.error}]));}
function createRunMetrics(){return {schema:'CrystalChest.CleanRebuild.R5PerformanceRun.v1',runId:p12BoundRunMetricsEnabled?++performanceRunSequence:performanceRuns.length+1,fixture:Number($('fixture').value),fxEnabledAtStart:$('fx-enabled').checked,soundEnabled:$('sound-enabled').checked,soundFixture:$('sound-special').value==='true'?'Treasure_Special':'Treasure_Normal',startedAt:performance.now(),batchStartedAt:null,frameIntervalsMs:[],renderCostsMs:[],stallsOver25ms:[],...(p12BoundRunMetricsEnabled?{stallEventsTotal:0}:{}),flips:[],maxConcurrentAudioSources:activeAudioSources,fxWorkStart:fxCounterSnapshot(),audioPreparationAtStart:audioRuntime.lastPreparation??{status:$('sound-enabled').checked?'not-prepared':'sound-disabled'},audioClipStatesAtStart:audioClipSnapshot(),lastFrameAt:null,completedAt:null};}
function summarize(values){if(!values.length)return {count:0,minMs:null,p50Ms:null,p95Ms:null,maxMs:null};const sorted=[...values].sort((a,b)=>a-b),pick=p=>sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];return {count:values.length,minMs:sorted[0],p50Ms:pick(.5),p95Ms:pick(.95),maxMs:sorted.at(-1)};}
function finalizeRunMetrics(){const metrics=session?.metrics;if(session?.targetedFixture)return;if(!metrics||metrics.completedAt!==null)return;metrics.completedAt=performance.now();const fxEnd=fxCounterSnapshot();metrics.fxWorkDelta=Object.fromEntries(Object.keys(fxEnd).map(key=>[key,fxEnd[key]-metrics.fxWorkStart[key]]));metrics.fxResourceEntriesAtCompletion=fxResourceSnapshot();metrics.frameSummary=summarize(metrics.frameIntervalsMs);metrics.renderSummary=summarize(metrics.renderCostsMs);metrics.stallThresholdMs=25;metrics.stallCountOver25ms=p12BoundRunMetricsEnabled?metrics.stallEventsTotal:metrics.stallsOver25ms.length;if(p12BoundRunMetricsEnabled)metrics.stallSamplesRetained=metrics.stallsOver25ms.length;metrics.audioRuntime={contextState:audioContext?.state??audioRuntime.contextState,decodedClips:audioRuntime.decodedClips,sourceStarts:audioRuntime.sourceStarts,sourceStartFailures:audioRuntime.sourceStartFailures.length};metrics.movieFinishEvents=trace.filter(event=>event.event==='movie-finish');metrics.movieFinishGuardHits=movieFinishGuardHits;const compact={...metrics};delete compact.frameIntervalsMs;delete compact.renderCostsMs;appendBoundedHistory(performanceRuns,JSON.parse(JSON.stringify(compact)),{enabled:p12BoundRunMetricsEnabled,maxItems:1});if(fx0304TraceEnabled)p24TracePublish();else $('performance-receipt').textContent=JSON.stringify({schema:'CrystalChest.CleanRebuild.R5PerformanceReceipt.v1',generatedAt:new Date().toISOString(),runs:performanceRuns,limitations:['Audio schedule time is measured; actual speaker onset is not observable from page JavaScript.','SoundManager overlap/interrupt semantics remain SOURCE_CONDITIONAL.']},null,2);}
function target(i){if(session?.mode==='fx0304-single-diagnostic')return {x:0,y:0};const row=i<5?0:1,col=row?i-5:i,n=row?6:5;return {x:col*200-(n-1)*100,y:row?-70:207};}
function cardPose(i,now){const t=target(i),u=Math.max(0,Math.min(1,(now-session.started-i*timing.moveMs)/timing.moveMs));return {x:t.x*u,y:-200+(t.y+200)*u,scale:.7+.3*u};}
function shopPurchaseAt(x,y){for(const entry of shopHitRecords){const {component}=entry.record;if(!active(entry.record.chain,false))continue;const r=sourceComponentScreenBounds(component,entry.record.chain);if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return entry.count;}return null;}
function routeStageShopPurchase(count){
 const state=localFeverSimulation.snapshot(),flow=normalLocalFullFlow.current();
 const busy=showing||movieActive||moviePending||normalR9StartPending||feverTenStartPending||normalLocalTenStartPending||Boolean(normalLocalTenPendingRun)||Boolean(normalLocalSingleResumePending)||Boolean(normalLocalTenResumePending)||Boolean(flow);
 if(busy){setStatus('LOCAL_STAGE_PURCHASE_BLOCKED_SCENE_ACTIVE：目前抽卡／影片／結果流程尚未結束；這次點擊沒有開始第二個流程。');trace.push({event:'stage-purchase-blocked',at:performance.now(),count,reason:'SCENE_ACTIVE'});return true;}
 if(count===1){
  if(state.phase!=='normal-progress'||!state.normalSingleAvailable){const reason=state.phase==='fever-test-active'?'FEVER_SINGLE_DISABLED':state.phase==='fever-test-exhausted-transition-unknown'?'FEVER_TRANSITION_UNKNOWN':'NORMAL_SINGLE_UNAVAILABLE';setStatus(reason==='FEVER_SINGLE_DISABLED'?'本地 Fever 測試狀態：遊戲內「購買 1 次」按鈕保留顯示但不可操作。':reason==='FEVER_TRANSITION_UNKNOWN'?'LOCAL_FEVER_TRANSITION_UNKNOWN：額度已用完；不開始 Normal 或第三次 Fever 抽樣。':'LOCAL_NORMAL_SINGLE_UNAVAILABLE：目前不能開始 Normal 單抽。');trace.push({event:'stage-purchase-blocked',at:performance.now(),count,reason,feverState:state.phase,usesRemaining:state.usesRemaining});return true;}
  startNormalLocalFullFlow();trace.push({event:'stage-purchase-routed',at:performance.now(),count,route:'R8_NORMAL_LOCAL_SINGLE',classification:'WEB_SIMULATION_ONLY'});return true;
 }
 if(count===11){
  if(state.phase==='normal-progress'&&state.normalSingleAvailable){void startNormalLocalTenFullFlow();trace.push({event:'stage-purchase-routed',at:performance.now(),count,route:'R12P1_NORMAL_TEN_PLUS_ONE',classification:'WEB_SIMULATION_ONLY'});return true;}
  if(state.phase==='fever-test-active'&&state.usesRemaining>0){void startLocalFeverTenSimulation();trace.push({event:'stage-purchase-routed',at:performance.now(),count,route:'R10P3_LOCAL_FEVER_TEN_PLUS_ONE',classification:'WEB_SIMULATION_ONLY'});return true;}
  const exhausted=state.phase==='fever-test-exhausted-transition-unknown'||state.usesRemaining<=0&&state.progress>=state.maxProgress;
  const reason=exhausted?'FEVER_TRANSITION_UNKNOWN':'NORMAL_TEN_PLUS_ONE_UNAVAILABLE';setStatus(exhausted?'LOCAL_FEVER_TRANSITION_UNKNOWN：額度已用完；不開始 Normal 或第三次 Fever 抽樣。':'LOCAL_STAGE_TEN_PLUS_ONE_UNAVAILABLE：目前狀態不允許開始 10+1 模擬。');trace.push({event:'stage-purchase-blocked',at:performance.now(),count,reason,feverState:state.phase,usesRemaining:state.usesRemaining});return true;
 }
 return false;
}
function isLocalTenDisplayMode(mode){return mode==='normal-local-ten-display'||mode==='normal-local-ten-draw'||mode==='local-fever-ten-display';}
function drawFeverDiagnosticCard(record){
 ctx.fillStyle='rgba(19,22,28,.96)';ctx.fillRect(-75,-108,150,216);ctx.strokeStyle='#bdb7c8';ctx.lineWidth=2;ctx.strokeRect(-75,-108,150,216);
 ctx.fillStyle='#d5d1df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='12px sans-serif';ctx.fillText('WEB 診斷顯示',0,-83,138);
 if(record.iconImage){const w=record.iconImage.naturalWidth,h=record.iconImage.naturalHeight,k=Math.min(44/w,44/h);ctx.drawImage(record.iconImage,-w*k/2,-58-h*k/2,w*k,h*k);}
  drawCardText(record.result.announcementName,30,6,134);drawCardText(record.renderState==='ASSET_LOAD_FAILED'?'素材載入失敗：未代換': '卡面來源未准入',28,55,134);drawCardText(`Fever row ${record.result.officialSourceRow}`,22,86,134);
  if(record.renderState==='ASSET_LOAD_FAILED'&&record.visualReason)drawCardText(record.visualReason,16,103,134);
}
function drawNormalRowOnlyCard(record){
 ctx.fillStyle='rgba(19,22,28,.96)';ctx.fillRect(-75,-108,150,216);ctx.strokeStyle='#bdb7c8';ctx.lineWidth=2;ctx.strokeRect(-75,-108,150,216);
 ctx.fillStyle='#d5d1df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='12px sans-serif';ctx.fillText('本地來源列',0,-83,138);
 drawCardText(record.result.announcementName,30,2,134);
 drawCardText(record.renderState==='ASSET_LOAD_FAILED'?'素材載入失敗：未代換':'卡面尚未准入',28,54,134);
 drawCardText(`NORMAL row ${record.result.officialSourceRow}`,22,86,134);
 drawCardText(record.result.sourceRowKey,13,103,140);
}
function cards(now){
 const localPreview=session.mode==='normal-local-preview',localTen=isLocalTenDisplayMode(session.mode),feverTen=session.mode==='local-fever-ten-display',singleFx=session.mode==='fx0304-single-diagnostic',single=session.mode==='single'||localPreview||singleFx,group=fixtures.groups[Number($('fixture').value)],count=localTen?11:single?1:group.length;
 // The FX-only card comparison uses the serialized Common.Card 200x256 UI frame; its exported face/back PNGs are 199x250. Keep all player and local-result card rendering on the existing natural-size path.
 const drawCardSurface=(image,sourceWidgetGeometry)=>sourceWidgetGeometry?ctx.drawImage(image,-100,-128,200,256):ctx.drawImage(image,-image.width/2,-image.height/2);
 for(let i=0;i<count;i++){
  const pose=single?{x:0,y:0,scale:1}:cardPose(i,now),state=session.cards[i],progress=state.openAt===null?0:Math.min(1,Math.max(0,(now-state.openAt)/timing.flipMs));
  const back=singleFx?($('backs').checked||progress<.5):single?false:($('backs').checked||progress<.5),turn=state.openAt===null||progress>=1?1:Math.abs(Math.cos(Math.PI*(1-progress)));
  ctx.save();ctx.translate(fixture.width/2+pose.x,fixture.height/2-pose.y);ctx.scale(pose.scale*turn,pose.scale);
  const resultIndex=localTen?session.displayOrder[i]:i,localRecord=localTen?session.resultCards[resultIndex]:null,localItem=localRecord?.item;
  const card=localTen?{name:localRecord.result.announcementName,part:localItem?.classification||localItem?.parts||''}:localPreview?session.item:group[i];
  const front=localPreview?session.cardArt.frontImage:localTen?localRecord.frontImage:imgs.get(manifest.cards.front_mythic.file),bg=imgs.get(session.cardBackReview?('assets/cards/ui_item_card_lucky_back_'+session.cardBackReview[i]+'.png'):manifest.cards[localTen?p31r3CardPolicy(localRecord).backVisualKey:'back_legendary'].file),grade=localPreview?session.cardArt.gradeImage:localTen?localRecord.gradeImage:imgs.get(manifest.cards.grade_mythic.file);
  if(back)drawCardSurface(bg,singleFx);
  else if(localTen&&localRecord.renderState!=='CARD_READY'){if(feverTen)drawFeverDiagnosticCard(localRecord);else drawNormalRowOnlyCard(localRecord);}
  else{
   const activeFront=front,activeGrade=grade,icon=localPreview?session.cardArt.iconImage:localTen?localRecord.iconImage:imgs.get(card.icon),iconWidth=localPreview||localTen?icon.naturalWidth:card.iconWidth,iconHeight=localPreview||localTen?icon.naturalHeight:card.iconHeight;
   drawCardSurface(activeFront,singleFx);ctx.drawImage(activeGrade,-activeGrade.width/2,-activeGrade.height/2);ctx.drawImage(icon,-iconWidth*1.5/2,-iconHeight*1.5/2,iconWidth*1.5,iconHeight*1.5);drawCardText(card.name,50,86,activeFront.width-40);if(!feverTen)drawCardText(card.part,45,-95,activeFront.width-40);
  }
  ctx.restore();
 }
}

function whiteBurstAppliesToSession(){return Boolean(whiteBurstAdaptationEnabled&&!r14p27R4Enabled&&showing&&session?.count===11&&session?.mode!=='fx0304-single-diagnostic');}
function whiteBurstEnvelope(ageMs){if(!Number.isFinite(ageMs)||ageMs<0||ageMs>whiteBurstDurationMs)return null;const t=Math.max(0,Math.min(1,ageMs/whiteBurstDurationMs)),rise=Math.sin(Math.PI*t),glow=Math.pow(Math.max(0,rise),0.72),core=Math.pow(Math.max(0,1-Math.abs(t-.33)/.33),1.15),rays=Math.pow(Math.max(0,1-Math.abs(t-.26)/.26),0.9),spark=Math.pow(Math.max(0,1-Math.abs(t-.58)/.3),1.2);return {t,glow,core,rays,spark};}
function drawWhiteBurstShape(x,y,rx,ry,rotation,stops){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(rx,ry);const gradient=ctx.createRadialGradient(0,0,0,0,0,1);for(const stop of stops)gradient.addColorStop(stop[0],stop[1]);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawWhiteBurstStar(x,y,innerRadius,outerRadius,points,rotation,alpha){if(!(alpha>0))return;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.beginPath();for(let i=0;i<points*2;i++){const radius=i%2===0?outerRadius:innerRadius,angle=i*Math.PI/points;const px=Math.cos(angle)*radius,py=Math.sin(angle)*radius;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();ctx.restore();}
function drawWhiteBurstAdaptation(now){if(!whiteBurstAppliesToSession())return;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<session.cards.length;i++){const card=session.cards[i];if(card?.openAt===null)continue;const envelope=whiteBurstEnvelope(now-card.openAt);if(!envelope)continue;const pose=cardPose(i,now),row=i<5?0:1,rowLift=row?12:-16,spread=1+.18*envelope.glow;ctx.save();ctx.translate(fixture.width/2+pose.x,fixture.height/2-pose.y);ctx.scale(pose.scale,pose.scale);
 const haloAlpha=.72*envelope.glow,coreAlpha=.95*Math.max(envelope.glow,envelope.core),rayAlpha=.34*envelope.rays,sparkAlpha=.55*envelope.spark;
 drawWhiteBurstShape(-28,-26+rowLift,78*spread,118*spread,-.42,[[0,`rgba(255,255,255,${coreAlpha})`],[.34,`rgba(255,248,228,${.88*coreAlpha})`],[.72,`rgba(255,255,255,${.22*haloAlpha})`],[1,'rgba(255,255,255,0)']]);
 drawWhiteBurstShape(22,30+rowLift,98*(.96+.2*envelope.glow),138*(.98+.18*envelope.glow),.34,[[0,`rgba(255,255,255,${.95*coreAlpha})`],[.45,`rgba(255,250,236,${.75*haloAlpha})`],[.82,`rgba(255,255,255,${.14*haloAlpha})`],[1,'rgba(255,255,255,0)']]);
 drawWhiteBurstShape(-62,-86+rowLift,62*(.92+.25*envelope.glow),84*(.9+.2*envelope.glow),-.18,[[0,`rgba(255,255,255,${.6*coreAlpha})`],[.4,`rgba(255,250,238,${.38*haloAlpha})`],[1,'rgba(255,255,255,0)']]);
 ctx.save();ctx.lineCap='round';for(let ray=0;ray<8;ray++){const angle=-1.18+ray*(Math.PI/4),inner=20+ray%2*10,outer=152+(ray%3)*30+envelope.glow*44;ctx.globalAlpha=rayAlpha*(ray%2===0?1:.72);ctx.strokeStyle=ray<2?'rgba(255,250,240,0.95)':ray<5?'rgba(255,226,186,0.82)':'rgba(255,255,255,0.72)';ctx.lineWidth=ray<2?5.6:3.2;ctx.beginPath();ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner+rowLift);ctx.lineTo(Math.cos(angle)*outer,Math.sin(angle)*outer+rowLift);ctx.stroke();}ctx.restore();
 drawWhiteBurstStar(-18,110+rowLift,8,24,4,.1,sparkAlpha);
 drawWhiteBurstStar(16,8+rowLift,10,40,4,.78,.22*envelope.glow);
 ctx.restore();}
 ctx.restore();}
function hasWhiteBurstActive(now){return Boolean(whiteBurstAppliesToSession()&&Array.isArray(session?.cards)&&session.cards.some(card=>card?.openAt!==null&&Number.isFinite(card.openAt)&&now-card.openAt<whiteBurstDurationMs));}


// R14-P27R4: full original R4 source-frame animation; WEB_ADAPTATION_ONLY, URL opt-in.
function r14p27R4Active(){return Boolean(r14p27R4Enabled&&showing&&session?.count===11&&['tenPlusOne','fx0304-tentime-replay','normal-local-ten-display','normal-local-ten-draw','local-fever-ten-display'].includes(session.mode));}
function r14p27R4Selector(index){if(session?.mode==='fx0304-tentime-replay'&&fx0304TenTimeReplayCandidate&&index===fx0304SelectedSlotIndex&&fx0304SelectorOverride==='04')return '04';return '03';}
function r14p27R4Warmup(){if(!r14p27R4Active()||session.r14p27R4WarmupStarted)return;session.r14p27R4WarmupStarted=true;let count=0;const frames=fxData.captures['03']?.frames||[];for(let i=0;i<frames.length;i++){if(frames[i]?.file){requestFXFrame('03',i);count++;}}r14p27R4Stats.warmupCount=count;}
// R14-P27R5: explicitly gated, reversible WEB_ADAPTATION tuning over original R4 PNG.
// Contrast is implemented as a zero-preserving gamma LUT, so opaque black R4 crops stay black under 'lighter'.
const r14p27R5Defaults=Object.freeze({brightness:140,opacity:100,tone:100,scale:1.40,delayMs:0});
const r14p27R5Tuning={...r14p27R5Defaults};
const r14p27R5Stats={settingChanges:0,previewRequests:0,toneCacheBuilds:0,toneCacheHits:0,toneLargeFrameFallbacks:0,toneErrors:[],lastPreview:null};
let r14p27R5Preview=null;
const r14p27R5ToneCache=new Map();
let r14p27R5ToneBytes=0;
const r14p27R5ToneMaxBytes=96*1024*1024;
const r14p27R5Fields={
 brightness:{min:50,max:170,step:5,unit:'%',label:'亮度 Brightness'},
 opacity:{min:30,max:100,step:5,unit:'%',label:'不透明度 Opacity'},
 tone:{min:70,max:140,step:5,unit:'%',label:'暗部層次（黑底保留）'},
 scale:{min:.75,max:1.80,step:.05,unit:'×',label:'特效倍率 Scale'},
 delayMs:{min:-150,max:200,step:10,unit:'ms',label:'起播延遲 Delay'}
};
function r14p27R5Clamp(key,value){const spec=r14p27R5Fields[key];if(!spec||!Number.isFinite(value))return null;const raw=Math.max(spec.min,Math.min(spec.max,value));if(key==='scale')return Math.round(raw*100)/100;return Math.round(raw);}
function r14p27R5ClearToneCache(){for(const {canvas} of r14p27R5ToneCache.values()){canvas.width=0;canvas.height=0;}r14p27R5ToneCache.clear();r14p27R5ToneBytes=0;}
function r14p27R5Set(key,value){if(!r14p27R5Enabled||!(key in r14p27R5Fields))return false;const next=r14p27R5Clamp(key,Number(value));if(next===null)return false;if(r14p27R5Tuning[key]!==next){r14p27R5Tuning[key]=next;r14p27R5Stats.settingChanges++;if(key==='tone')r14p27R5ClearToneCache();}r14p27R5SyncPanel();if(showing&&session)render();return true;}
function r14p27R5Reset(){if(!r14p27R5Enabled)return false;Object.assign(r14p27R5Tuning,r14p27R5Defaults);r14p27R5ClearToneCache();r14p27R5Stats.settingChanges++;r14p27R5SyncPanel();if(showing&&session)render();return true;}
function r14p27R5GetToneBitmap(bitmap,file){if(!r14p27R5Enabled||r14p27R5Tuning.tone===100)return bitmap;
 const tone=r14p27R5Tuning.tone,key=`${tone}:${file}`,cached=r14p27R5ToneCache.get(key);
 if(cached){r14p27R5ToneCache.delete(key);r14p27R5ToneCache.set(key,cached);r14p27R5Stats.toneCacheHits++;return cached.canvas;}
 const pixels=bitmap.width*bitmap.height;if(pixels>2000000){r14p27R5Stats.toneLargeFrameFallbacks++;return bitmap;}
 try{
  const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
  const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)return bitmap;c.drawImage(bitmap,0,0);
  const data=c.getImageData(0,0,bitmap.width,bitmap.height),bytes=data.data,lut=new Uint8Array(256),gamma=tone/100;
  for(let i=0;i<256;i++)lut[i]=Math.round(255*Math.pow(i/255,gamma));
  for(let i=0;i<bytes.length;i+=4){bytes[i]=lut[bytes[i]];bytes[i+1]=lut[bytes[i+1]];bytes[i+2]=lut[bytes[i+2]];}
  c.putImageData(data,0,0);const estimatedBytes=pixels*4;
  if(estimatedBytes>r14p27R5ToneMaxBytes)return canvas;
  while(r14p27R5ToneBytes+estimatedBytes>r14p27R5ToneMaxBytes&&r14p27R5ToneCache.size){const oldestKey=r14p27R5ToneCache.keys().next().value,oldest=r14p27R5ToneCache.get(oldestKey);r14p27R5ToneCache.delete(oldestKey);r14p27R5ToneBytes-=oldest.bytes;oldest.canvas.width=0;oldest.canvas.height=0;}
  r14p27R5ToneCache.set(key,{canvas,bytes:estimatedBytes});r14p27R5ToneBytes+=estimatedBytes;r14p27R5Stats.toneCacheBuilds++;
  return canvas;
 }catch(error){if(r14p27R5Stats.toneErrors.length<10)r14p27R5Stats.toneErrors.push(String(error));return bitmap;}
}
function r14p27R5CurrentAge(i,now,card){const preview=r14p27R5Preview;
 const from=preview&&preview.index===i&&preview.startedAt<=now&&now-preview.startedAt<950?preview.startedAt:card.openAt;
 return now-from-(r14p27R5Enabled?r14p27R5Tuning.delayMs:0);
}
function r14p27R5PreviewActive(now){if(!r14p27R5Enabled||!r14p27R5Preview)return false;
 return now-r14p27R5Preview.startedAt<950;
}
function r14p27R5PreviewLast(){if(!r14p27R5Enabled||!r14p27R4Active())return false;
 let lastIndex=-1,lastAt=-Infinity;
 session.cards.forEach((card,i)=>{if(Number.isFinite(card?.openAt)&&card.openAt>lastAt){lastAt=card.openAt;lastIndex=i;}});
 if(lastIndex<0)return false;
 r14p27R5Preview={index:lastIndex,startedAt:performance.now()};r14p27R5Stats.previewRequests++;
 r14p27R5Stats.lastPreview={slot:lastIndex+1,at:r14p27R5Preview.startedAt,classification:'VISUAL_ONLY_NO_GAME_RESULT_CHANGE'};
 schedule();return true;
}
function r14p27R5SettingsReceipt(){return {schema:'CrystalChest.R14P27R5.VisualTuningReceipt.v1',buildId:'R14P27R5_TUNABLE_R4_20261103A',classification:'WEB_ADAPTATION_ONLY_NOT_NATIVE_PARITY',createdAt:new Date().toISOString(),source:'R4_UNMODIFIED_CAPTURE_PNG',defaultSettings:{...r14p27R5Defaults},settings:{...r14p27R5Tuning},snapshot:window.__r14p27R4?.snapshot?.()??null,notes:'P27D-R1 player visual PASS is scoped to comparison. Official site R5 visual PASS still requires player review.'};}
function r14p27R5ExportReceipt(){const json=JSON.stringify(r14p27R5SettingsReceipt(),null,2),blob=new Blob([json],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);try{const a=document.createElement('a');a.href=url;a.download='R14P27R5_VISUAL_RECEIPT.json';a.click();}finally{setTimeout(()=>URL.revokeObjectURL(url),2000);}}
function r14p27R5SyncPanel(){const root=document.getElementById('r14p27r5-panel');if(!root)return;for(const key of Object.keys(r14p27R5Fields)){const input=root.querySelector(`[data-r5-key="${key}"]`),label=root.querySelector(`[data-r5-out="${key}"]`);if(input)input.value=String(r14p27R5Tuning[key]);if(label)label.textContent=`${r14p27R5Tuning[key]} ${r14p27R5Fields[key].unit}`;}}
function r14p27R5MountPanel(){if(!r14p27R5Enabled||document.getElementById('r14p27r5-panel'))return;
 const style=document.createElement('style');style.id='r14p27r5-style';style.textContent=`#r14p27r5-panel{position:fixed;right:12px;top:85px;width:min(310px,calc(100vw - 24px));z-index:2147483000;max-height:calc(100vh - 110px);overflow:auto;color:#eef3fa;background:rgba(21,27,39,.97);border:1px solid #6a788f;border-radius:10px;box-shadow:0 8px 32px #0008;font:13px/1.45 system-ui,sans-serif}#r14p27r5-panel summary{cursor:pointer;font-weight:bold;padding:10px 12px;list-style:revert}#r14p27r5-panel .r5-body{padding:4px 12px 12px}#r14p27r5-panel .r5-row{margin:9px 0}#r14p27r5-panel .r5-row label{display:flex;justify-content:space-between;gap:8px}#r14p27r5-panel input[type=range]{display:block;width:100%;accent-color:#68b6ff;cursor:pointer}#r14p27r5-panel .r5-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}#r14p27r5-panel button{background:#26374f;color:#fff;border:1px solid #657b99;border-radius:6px;padding:7px 9px;cursor:pointer}#r14p27r5-panel button:hover{background:#36537b}#r14p27r5-panel p{margin:7px 0;color:#b9cae0;font-size:11px}`;document.head.appendChild(style);
 const el=document.createElement('details');el.id='r14p27r5-panel';el.open=false;
 let content='<summary>R4 原始特效微調 · R5</summary><div class="r5-body"><p>玩家模式預設啟用已驗收的原始 PNG 特效；可用網址參數暫停作比較。原始 PNG 不變；黑底仍維持黑色。</p>';
 for(const [key,spec] of Object.entries(r14p27R5Fields)){content+=`<div class="r5-row"><label for="r5-${key}">${spec.label}<output data-r5-out="${key}"></output></label><input id="r5-${key}" type="range" min="${spec.min}" max="${spec.max}" step="${spec.step}" data-r5-key="${key}"></div>`;}
 content+='<div class="r5-actions"><button type="button" data-r5-action="preview">重播最近一張白光</button><button type="button" data-r5-action="reset">重設原始設定</button><button type="button" data-r5-action="export">匯出設定／診斷 JSON</button></div><p>預覽不會新增卡片、抽獎結果或改變 Fever 進度；重新整理會回到預設值。</p></div>';
 el.innerHTML=content;
 el.addEventListener('input',event=>{const input=event.target;if(input?.dataset?.r5Key)r14p27R5Set(input.dataset.r5Key,Number(input.value));});
 el.addEventListener('click',event=>{const action=event.target?.dataset?.r5Action;if(action==='preview')r14p27R5PreviewLast();else if(action==='reset')r14p27R5Reset();else if(action==='export')r14p27R5ExportReceipt();});
 document.body.appendChild(el);r14p27R5SyncPanel();
}

function r14p27R4Draw(now){
 if(!r14p27R4Active())return;
 r14p27R4Warmup();ctx.save();ctx.globalCompositeOperation='lighter';
 if(r14p27R5Enabled){ctx.globalAlpha=r14p27R5Tuning.opacity/100;ctx.filter=`brightness(${r14p27R5Tuning.brightness}%)`;}
 for(let i=0;i<session.cards.length;i++){
  const card=session.cards[i];if(card?.openAt===null||!Number.isFinite(card.openAt))continue;
  const selector=r14p27R4Selector(i),capture=fxData.captures[selector];if(!capture)continue;
  const age=r14p27R5Enabled?r14p27R5CurrentAge(i,now,card):now-card.openAt;
  if(age<0||age>=capture.durationSeconds*1000)continue;
  const frame=Math.floor(age*capture.fps/1000+1e-6);
  for(let ahead=0;ahead<=2;ahead++)requestFXFrame(selector,frame+ahead);
  const f=capture.frames[frame];if(!f?.file){r14p27R4Stats.missingSourceFrames++;continue;}
  const bitmap=requestFXFrame(selector,frame);if(!bitmap){r14p27R4Stats.skippedNotReady++;continue;}
  const t=target(i),scale=r14p27R5Enabled?r14p27R5Tuning.scale:r14p27R4Scale,
   x=fixture.width/2+t.x+f.offsetX*scale,y=fixture.height/2-t.y+f.offsetY*scale;
  try{
   const display=r14p27R5Enabled?r14p27R5GetToneBitmap(bitmap,f.file):bitmap;
   ctx.drawImage(display,x,y,f.width*scale,f.height*scale);
   r14p27R4Stats.drawCalls++;
   const receipt={slot:i+1,selector,frame,fxAgeMs:Math.round(age*1000)/1000,
    drawRect:{x,y,width:f.width*scale,height:f.height*scale},
    classification:r14p27R5Enabled?'WEB_ADAPTATION_R5_TUNED_SOURCE_PNG':'WEB_ADAPTATION_R4_SOURCE_PNG'};
   if(!r14p27R4Stats.firstDraw)r14p27R4Stats.firstDraw=receipt;r14p27R4Stats.lastDraw=receipt;
  }catch(error){r14p27R4Stats.lastError=String(error);}
 }
 ctx.restore();
}
function r14p27R4HasActive(now){return Boolean(r14p27R4Active()&&(
  (r14p27R5Enabled&&r14p27R5PreviewActive(now))||
  session.cards.some((c,i)=>c.openAt!==null&&Number.isFinite(c.openAt)
   &&now-c.openAt>=0
   &&now-c.openAt<(fxData.captures[r14p27R4Selector(i)]?.durationSeconds??0)*1000+(r14p27R5Enabled?Math.max(0,r14p27R5Tuning.delayMs):0))
 ));}
window.__r14p27R4={buildId:r14p27R4BuildId,enabled:r14p27R4Enabled,scale:r14p27R4Scale,selectorEvidence:'FORCED_03_WEB_ADAPTATION_NOT_NATIVE_RESULT',snapshot:()=>({...r14p27R4Stats,active:r14p27R4Active(),phase:session?.phase??'shop',sessionMode:session?.mode??null,fxOriginalCheckbox:$('fx-enabled').checked,sourceLoader:{...fxMetrics,failures:[...fxMetrics.failures]}})};
window.__r14p27R5={buildId:r14p27R4BuildId,enabled:r14p27R5Enabled,set:r14p27R5Set,reset:r14p27R5Reset,previewLast:r14p27R5PreviewLast,snapshot:()=>({...r14p27R5SettingsReceipt(),tuningMetrics:{...r14p27R5Stats,toneCacheEntries:r14p27R5ToneCache.size,toneCacheMiB:Number((r14p27R5ToneBytes/1048576).toFixed(2))}})};
if(r14p27R5Enabled)r14p27R5MountPanel();

function drawEffects(now){
 if(fx0304TraceEnabled)p24Trace.drawEffectsCalls++;
 if(!$('fx-enabled').checked||!session)return;
 const fixed=comparison&&session.phase==='complete';
 const effects=fixed?[{index:comparison.index,selector:fixtures.groups[Number($('fixture').value)][comparison.index].fxSelector,started:now-comparison.ageMs}]:session.effects;
 if(fx0304P25TraceEnabled){p25Trace.stream.renderCalls++;if(fx0304P25StreamMode==='after'){p25ProtectedFiles.clear();for(const root of effects){const cap=fxData.captures[root.selector];if(!cap)continue;const idx=Math.floor(((now-root.started)*cap.fps+0.000001)/1000);for(let ahead=0;ahead<2;ahead++){const file=cap.frames[idx+ahead]?.file;if(file)p25ProtectedFiles.add(file);}}}}
 // AR3 engineering-after only: breadth-first future-frame admission across simultaneous FX roots.
 // Do not change TenTime issue/FlipAll clocks, selector logic, or any player-mode FX gate.
 if(fx0304P25StreamMode==='after'){
  const lookahead=p25Trace.settings.lookahead;
  for(let ahead=0;ahead<=lookahead;ahead++)for(const root of effects){
   const cap=fxData.captures[root.selector];if(!cap)continue;
   const index=Math.floor(((now-root.started)*cap.fps+0.000001)/1000)+ahead;
   if(index>=0&&cap.frames[index]?.file)requestFXFrame(root.selector,index);
  }
 }
 for(const e of effects){
  const capture=fxData.captures[e.selector];if(!capture)continue;
  const ageMs=now-e.started,frame=Math.floor((ageMs*capture.fps+0.000001)/1000),f=capture.frames[frame];
  const isTraceTarget=fx0304TraceEnabled&&e.index===fx0304SelectedSlotIndex&&e.selector===fx0304SelectorOverride;
  const expectedFrameForTrace=fx0304SelectorOverride==='04'?80:20;
  if(isTraceTarget&&frame<expectedFrameForTrace&&!fx0304P25TraceEnabled&&!p24Trace.events.some(event=>event.event==='target-frame-prefetch-pinned')){const targetFile=capture.frames[expectedFrameForTrace]?.file,bitmap=requestFXFrame(e.selector,expectedFrameForTrace,{pin:true});p24TraceRecord('target-frame-prefetch-pinned',{selector:e.selector,slot:e.index+1,frameIndex:expectedFrameForTrace,file:targetFile,prefetchFxAgeMs:Number(ageMs.toFixed(3)),bitmapReady:Boolean(bitmap),classification:'P24_ENGINEERING_TRACE_ONLY'});p24TracePublish();}
  if(isTraceTarget&&frame>expectedFrameForTrace){const targetEntry=fxBitmaps.get(capture.frames[expectedFrameForTrace]?.file);if(targetEntry?.pinned){targetEntry.pinned=false;p24TraceRecord('fx-image-unpinned',{selector:e.selector,slot:e.index+1,frameIndex:expectedFrameForTrace,reason:'TARGET_FRAME_WINDOW_PASSED'});}}
  const frameSampleKey=`${session.phase}:${frame}`;
  if(isTraceTarget&&p24Trace.lastFrameSampleKey!==frameSampleKey){p24Trace.lastFrameSampleKey=frameSampleKey;
   const sample={atPerformanceMs:Math.round(now*1000)/1000,fxAgeMs:Number(ageMs.toFixed(3)),selector:e.selector,slot:e.index+1,frameIndex:frame,frameFile:f?.file??null,frameManifestPresent:Boolean(f),bitmapReady:Boolean(f&&fxBitmaps.get(f.file)?.bitmap),fps:capture.fps};
   p24Trace.frameSamples.push(sample);if(p24Trace.frameSamples.length>180)p24Trace.frameSamples.shift();p24TraceRecord('fx-frame-sample',sample);
  }
  const p25Root=fx0304P25TraceEnabled?(p25Trace.roots[String(e.index+1)]??(p25Trace.roots[String(e.index+1)]={slot:e.index+1,selector:e.selector,startedAtPerformanceMs:Number(e.started.toFixed(3)),renderOpportunities:0,validSourceOpportunities:0,sourceEmptySamples:0,readyAtRenderStart:0,readyAtDrawDecision:0,notReadyAtDraw:0,drawImageSuccess:0,drawImageErrors:0,skippedNotReady:0,samples:[]})):null;
  const p25FileStat=fx0304P25TraceEnabled&&f?.file?p25FrameStats(e.selector,frame,f.file):null;
  const readyAtRenderStart=Boolean(f?.file&&fxBitmaps.get(f.file)?.bitmap);
  let p25Sample=null;
  if(fx0304P25TraceEnabled){p25Root.renderOpportunities++;if(!f?.file){p25Root.sourceEmptySamples++;p25Trace.stream.sourceEmptySamples++;p25Sample={atPerformanceMs:Number(now.toFixed(3)),fxAgeMs:Number(ageMs.toFixed(3)),selector:e.selector,slot:e.index+1,frameIndex:frame,sourceFramePresent:false,sourceEmpty:true,bitmapReadyAtRenderStart:false,bitmapReadyAtDrawDecision:false,drawImageSuccess:false,skipReason:'SOURCE_FRAME_ABSENT'};}else{p25Root.validSourceOpportunities++;p25Trace.stream.validSourceOpportunities++;p25FileStat.renderOpportunities++;if(readyAtRenderStart){p25Root.readyAtRenderStart++;p25Trace.stream.readyAtRenderStart++;p25FileStat.readyAtRenderStart++;}}}
  if(fx0304P25StreamMode!=='after'){for(let ahead=0;ahead<=3;ahead++)requestFXFrame(e.selector,frame+ahead);}
  if(!f?.file){if(p25Sample){p25Root.samples.push(p25Sample);if(p25Root.samples.length>220)p25Root.samples.shift();}continue;}const bitmap=requestFXFrame(e.selector,frame);
  if(fx0304P25TraceEnabled){p25Sample={atPerformanceMs:Number(now.toFixed(3)),fxAgeMs:Number(ageMs.toFixed(3)),selector:e.selector,slot:e.index+1,frameIndex:frame,sourceFramePresent:true,frameFile:f.file,bitmapReadyAtRenderStart:readyAtRenderStart,bitmapReadyAtDrawDecision:Boolean(bitmap),drawImageSuccess:false,skipReason:bitmap?null:'BITMAP_NOT_READY'};if(bitmap){p25Root.readyAtDrawDecision++;p25Trace.stream.readyAtDrawDecision++;p25FileStat.readyAtDrawDecision++;}else{p25Root.notReadyAtDraw++;p25Root.skippedNotReady++;p25Trace.stream.notReadyAtDraw++;p25Trace.stream.skippedNotReady++;p25FileStat.notReadyAtDraw++;}}
  const t=target(e.index),drawX=fixture.width/2+t.x+f.offsetX,drawY=fixture.height/2-t.y+f.offsetY,alphaBefore=ctx.globalAlpha,compositeBefore=ctx.globalCompositeOperation;
  if(isTraceTarget&&frame>expectedFrameForTrace&&!p24Trace.targetFrameDrawn&&!p24Trace.targetFrameMissed){p24Trace.targetFrameMissed=true;p24TraceRecord('target-frame-window-missed',{selector:e.selector,slot:e.index+1,targetFrameIndex:expectedFrameForTrace,currentFrameIndex:frame,fxAgeMs:Number(ageMs.toFixed(3)),targetBitmapReady:Boolean(fxBitmaps.get(capture.frames[expectedFrameForTrace]?.file)?.bitmap),holdEnabled:fx0304TraceHoldTarget});p24TracePublish();}
  if(isTraceTarget&&fx0304TraceHoldTarget&&frame===expectedFrameForTrace&&!bitmap&&!session.fxDiagnosticFrozenAt){session.fxDiagnosticFrozenAt=e.started+frame*1000/capture.fps;p24TraceRecord('target-frame-awaiting-decode',{selector:e.selector,slot:e.index+1,frameIndex:frame,requestedFxAgeMs:Number(((session.fxDiagnosticFrozenAt-e.started)).toFixed(3)),bitmapReady:false,clockHold:'EXPLICIT_TRACE_ONLY_HOLD_UNTIL_DECODE'});p24TracePublish();}
  if(!bitmap){if(p25Sample){p25Root.samples.push(p25Sample);if(p25Root.samples.length>220)p25Root.samples.shift();}continue;}
  let p25DrawError=null;ctx.save();try{ctx.globalCompositeOperation='lighter';ctx.drawImage(bitmap,drawX,drawY);if(p25Sample){p25Sample.drawImageSuccess=true;p25Sample.skipReason=null;p25Sample.drawRect={x:drawX,y:drawY,width:bitmap.width,height:bitmap.height};p25Sample.globalAlpha=alphaBefore;p25Sample.compositeBefore=compositeBefore;p25Sample.compositeDuring='lighter';p25Sample.compositeAfter=ctx.globalCompositeOperation;}if(fx0304P25TraceEnabled){p25Root.drawImageSuccess++;p25Trace.stream.drawImageSuccess++;p25FileStat.drawImageSuccess++;if(isTraceTarget&&frame===expectedFrameForTrace)p25Trace.pendingReadback={slot:e.index+1,selector:e.selector,frameIndex:frame,fxAgeMs:Number(ageMs.toFixed(3)),atPerformanceMs:Number(now.toFixed(3)),drawRect:{x:drawX,y:drawY,width:bitmap.width,height:bitmap.height},globalAlphaBefore:alphaBefore,compositeBefore,compositeDuring:'lighter'};}}catch(error){p25DrawError=String(error);if(p25Sample){p25Sample.skipReason='DRAWIMAGE_ERROR';p25Sample.error=p25DrawError;}if(fx0304P25TraceEnabled){p25Root.drawImageErrors++;p25Trace.stream.drawImageErrors++;p25FileStat.drawImageErrors++;p25Trace.errors.push({slot:e.index+1,selector:e.selector,frameIndex:frame,message:p25DrawError});}}finally{ctx.restore();}
  
  if(p25Sample){p25Root.samples.push(p25Sample);if(p25Root.samples.length>220)p25Root.samples.shift();}
  if(isTraceTarget){
   p24Trace.selectedDrawCalls++;
   if([20,80].includes(frame))p24TraceRecord('fx-frame-drawImage-returned',{selector:e.selector,slot:e.index+1,frameIndex:frame,fxAgeMs:Number(ageMs.toFixed(3)),file:f.file,bitmapDimensions:[bitmap.width,bitmap.height],drawOriginLogical:[drawX,drawY],destinationRectLogical:{x:drawX,y:drawY,width:bitmap.width,height:bitmap.height},canvasIntersectionLogical:{x:Math.max(0,drawX),y:Math.max(0,drawY),right:Math.min(fixture.width,drawX+bitmap.width),bottom:Math.min(fixture.height,drawY+bitmap.height)},globalAlphaBefore:alphaBefore,compositeBefore,compositeDuring:'lighter',compositeAfter:ctx.globalCompositeOperation,clipRule:'Canvas stage bounds clip drawImage; drawEffects adds no clip path',transform:[ctx.getTransform().a,ctx.getTransform().b,ctx.getTransform().c,ctx.getTransform().d,ctx.getTransform().e,ctx.getTransform().f]});
   const expectedFrame=expectedFrameForTrace;
   if(frame===expectedFrame&&!p24Trace.targetFrameDrawn&&bitmap)p24Trace.pendingTargetFrame={selector:e.selector,slot:e.index+1,frameIndex:frame,drawAtPerformanceMs:Math.round(now*1000)/1000,fxAgeMs:Number(ageMs.toFixed(3)),file:f.file,bitmapDimensions:[bitmap.width,bitmap.height],drawOriginLogical:[drawX,drawY],globalAlphaBefore:alphaBefore,compositeBefore,compositeDuring:'lighter',compositeAfter:ctx.globalCompositeOperation};
  }
  if(isTraceTarget&&frame===expectedFrameForTrace){const targetEntry=fxBitmaps.get(f.file);if(targetEntry?.pinned){targetEntry.pinned=false;p24TraceRecord('fx-image-unpinned',{selector:e.selector,slot:e.index+1,frameIndex:frame,reason:'TARGET_FRAME_DRAWN'});}}
  if(!bitmap)continue;
  if(isTraceTarget&&frame===(fx0304SelectorOverride==='04'?80:20)&&!p24Trace.pendingTargetFrame&&!p24Trace.targetFrameDrawn)p24Trace.pendingTargetFrame={selector:e.selector,slot:e.index+1,frameIndex:frame,drawAtPerformanceMs:Math.round(now*1000)/1000,fxAgeMs:Number(ageMs.toFixed(3)),file:f.file,bitmapDimensions:[bitmap.width,bitmap.height],drawOriginLogical:[drawX,drawY],globalAlphaBefore:alphaBefore,compositeBefore,compositeDuring:'lighter',compositeAfter:ctx.globalCompositeOperation};
 }
}
function measureFXDiagnosticCanvas(){const width=canvas.width,height=canvas.height,data=ctx.getImageData(0,0,width,height).data;let alphaCount=0,visibleCount=0,whiteCount=0,maxLuminance=0;const alpha=[width,height,-1,-1],visible=[width,height,-1,-1],white=[width,height,-1,-1];for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=(y*width+x)*4,r=data[p],g=data[p+1],b=data[p+2],a=data[p+3];if(a){alphaCount++;alpha[0]=Math.min(alpha[0],x);alpha[1]=Math.min(alpha[1],y);alpha[2]=Math.max(alpha[2],x);alpha[3]=Math.max(alpha[3],y);}if(a&&Math.max(r,g,b)>16){visibleCount++;visible[0]=Math.min(visible[0],x);visible[1]=Math.min(visible[1],y);visible[2]=Math.max(visible[2],x);visible[3]=Math.max(visible[3],y);const lum=.2126*r+.7152*g+.0722*b;maxLuminance=Math.max(maxLuminance,lum);if(lum>=220&&Math.max(r,g,b)-Math.min(r,g,b)<=55){whiteCount++;white[0]=Math.min(white[0],x);white[1]=Math.min(white[1],y);white[2]=Math.max(white[2],x);white[3]=Math.max(white[3],y);}}}const box=v=>v[2]<v[0]?null:[v[0],v[1],v[2]+1,v[3]+1];return {backing:[width,height],alphaPixels:alphaCount,alphaBounds:box(alpha),visiblePixels:visibleCount,visibleBounds:box(visible),neutralWhiteRule:'Y>=220 && RGB spread<=55',neutralWhitePixels:whiteCount,neutralWhiteBounds:box(white),maxLuminance:Math.round(maxLuminance*100)/100};}
function updateItemList(){
  const preview=session?.mode==='normal-local-preview',localTen=isLocalTenDisplayMode(session?.mode),feverTen=session?.mode==='local-fever-ten-display',singleFx=session?.mode==='fx0304-single-diagnostic',single=showing&&(session?.mode==='single'||preview||singleFx),visualOnly=preview&&session.admissionClass==='WEB_VISUAL_DISPLAY_ONLY',r6Visual=visualOnly&&session.previewKind==='normal-local-r6-announcement-grade-web-only';
 let visibleGroup;
   if(localTen){visibleGroup=session.displayOrder.map((resultIndex,slot)=>{const record=session.resultCards[resultIndex],item=record.item,grade=record.plan?.displayGrade||item?.basicGrade?.code||(feverTen?record.result.officialGrade:null)||'未提供';return {name:record.result.announcementName,grade,sourceRowKey:record.result.sourceRowKey,slot,admission:feverTen?record.renderState:record.plan?.admissionClass||record.renderState||'ROW_ONLY_DIAGNOSTIC'};});}
 else if(preview){visibleGroup=[{name:session.item.name,grade:visualOnly?(r6Visual?`公告${session.displayGrade}樣式 · 有效品級 UNKNOWN`:'玩家確認神話樣式 · live grade UNKNOWN'):`本地來源列 ${session.sourceRowKey}`,fxSelector:'FX OFF',itemID:session.item.itemID}];}
 else{visibleGroup=fixtures.groups[Number($('fixture').value)].slice(0,single?1:undefined).map((record,index)=>fx0304TenTimeReplayCandidate&&index===fx0304SelectedSlotIndex?{...record,fxSelector:fx0304SelectorOverride}:fx0304SelectorOverride&&!fx0304TenTimeReplayCandidate?{...record,fxSelector:fx0304SelectorOverride}:record);}
  const key=localTen?`${session.mode}:${session.displayOrder.map(index=>session.resultOrder[index]).join('|')}`:preview?`normal-preview:${session.sourceRowKey}`:`${$('fixture').value}:${single?'single':'ten'}`;
  if(updateItemList.lastKey===key)return;updateItemList.lastKey=key;const list=$('items');list.replaceChildren(...visibleGroup.map(r=>{const li=document.createElement('li');li.textContent=localTen?`${r.slot+1}. ${r.name} · ${r.grade} · ${r.admission} · ${r.sourceRowKey}`:`${r.name} · ${r.grade} · ${r.fxSelector}${r.itemID===null||r.itemID===undefined?'':' · Item '+r.itemID}`;return li;}));
}
function setIfChanged(el,key,value){if(el&&el[key]!==value)el[key]=value;}
function setStatus(value){const el=$('status');if(el.textContent!==value)el.textContent=value;}
function localFeverQuotaOutcome(session){
 if(session?.feverQuotaConsumed===true)return '本地額度已扣 1 次（WEB_ADAPTATION）。';
 const failed=session?.resultCards?.filter(record=>record.renderState==='ASSET_LOAD_FAILED')??[];
 if(session?.feverQuotaAttempted&&failed.length)return `本次 11 張已揭示，但因素材載入失敗，額度未扣、結果已保留；按 Confirm 返回後可重試相同來源列（${failed.length} 列載入失敗）。`;
 if(session?.feverQuotaAttempted)return `本地額度未扣（${session.feverQuotaResultReason||'完成條件未接受'}）；本次結果與來源列已保留，按 Confirm 返回後可重試相同來源列。`;
 return '尚未完成額度結算。';
}
function handleLocalFeverRetry(){const ui=resultFeverRetrySnapshot();if(!ui.visible)return false;if(!ui.enabled){setStatus(ui.usesRemaining<=0?'Fever額度已用完；本地狀態不允許再次抽取。':'Fever 結果尚未完成有效額度結算；請Confirm返回。');return true;}resetScene({source:'retry'});void startLocalFeverTenSimulation();return true;}

function updateNormalLocalPlayerStatus(frameFeverState=null){
 const el=$('normal-local-player-status');if(!el)return;
 if(!normalLocalSimulator){el.textContent='本地模擬資料尚未就緒；請稍後再試，或展開診斷模式查看來源狀態。';return;}
  const mode=$('normal-local-flow-mode')?.value==='seeded'?'seeded':'random',seed=$('normal-local-seed')?.value||'(尚未輸入 Seed)',movieKey=$('movie-source')?.value||'N',flow=normalLocalFullFlow.current(),feverState=frameFeverState??localFeverSimulation.snapshot();
 const modeText=mode==='seeded'?`指定 Seed 重播：${seed}`:'本地隨機';
 const movieStatusText=r14p10PlayerEnabled?'依本次抽樣來源自動選擇 N/H/R（WEB_CONDITIONAL_MOVIE_SELECTOR）':`測試影片 ${movieKey}（預設 N；測試 Fixture，不按獎勵自動選片）`;
 if(normalLocalSingleResumePending){const pending=normalLocalSingleResumePending;if(r14p10PlayerEnabled&&pending.p10NoVideoRecovery){el.textContent=`Normal 單抽 · 自動選片未能確認；原結果 ${pending.result.sourceRowKey}／runId ${pending.runId} 已保留。按影片區「繼續結果」顯示同一張卡、不播放影片，也不重抽。`;}else{el.textContent=`Normal 單抽 · UNRESOLVED_INPUT 已保留同一筆 ${pending.result.sourceRowKey} · runId ${pending.runId} · samplerCalls=1。切換 Movie Selector 為手動 N/H/R、選擇影片，再按「單抽」接續；不會重新抽樣或重做 Lucky Fever 判定。`;}return;}
 if(normalLocalTenResumePending){const pending=normalLocalTenResumePending;if(r14p10PlayerEnabled&&pending.p10NoVideoRecovery){el.textContent=`Normal 10+1 · 自動選片未能確認；同批 11 筆／runId ${pending.runId} 已保留。按影片區「繼續結果」顯示這批卡、不播放影片，也不重抽。`;}else{el.textContent=`Normal 10+1 · UNRESOLVED_INPUT 已保留同一批 11 筆 · runId ${pending.runId} · Seed ${pending.seed??'random'} · order=${pending.sourceRowKeys.map(key=>JSON.parse(key)[2]).join(',')}。切換手動 N/H/R 後再次按 Normal 10+1 接續；不會重新抽樣。`;}return;}
 if(normalLocalTenStartPending){const pending=normalLocalTenPendingRun,phase=movieActive?'已鎖定的候選影片播放中':moviePending?'正在準備測試影片':pending?.phase==='result-loading'?'正在載入同一組 11 筆結果卡':'結果卡準備中';el.textContent=`Normal 10+1 本地模擬 · ${phase} · 11 筆已固定 · ${modeText} · 影片 ${pending?.movieKey||movieKey}（${movieP5StatusText(pending?.movieSelection)}）。完成翻卡後只對整次購買判定一次 16.5%；自然達到 110 不判定。WEB_SIMULATION_ONLY；不扣款、不連伺服器、不代表官方 RNG。`;return;}
 if(flow){const phase=movieActive?'影片播放中':moviePending?'正在準備影片':showing?'同一來源列結果卡已顯示':'結果載入中';el.textContent=`本地 Normal 單抽 · ${phase} · ${flow.sourceRowKey} · ${modeText} · ${r14p10PlayerEnabled?`自動選片影片 ${flow.movieKey}`:`測試影片 ${flow.movieKey}`}（${movieP5StatusText(window.__r14p5LastMovieSelection)}）。結果卡顯示後記錄 +1 並使用獨立 1.5% Lucky Fever 判定；觸發時 Overlay 依 R8 本地結果顯示事件播放（原生 present 時序仍未閉合）。WEB_SIMULATION_ONLY；FX 與 payload 依來源准入界線處理。`;return;}
  if(feverTenStartPending){el.textContent='正在依 WEB_SIMULATION_ONLY Fever 公告權重抽樣並固定本次 11 筆來源列；載入素材不會重抽或代換。';return;}
  if(r14p29P1Enabled&&feverTenPendingRun?.phase==='movie'&&movieActive){el.textContent=`Fever 10+1 本地模擬 · 影片 ${feverTenPendingRun.movieKey}（${movieP5StatusText(feverTenPendingRun.movieSelection)}）播放中。11 筆來源列已固定；跳過不重抽、不扣額度。`;return;}
  if(showing&&session?.mode==='local-fever-ten-display'){
   const opened=session.cards.filter(card=>card.openAt!==null).length,state=frameFeverState??localFeverSimulation.snapshot(),diagnostic=session.resultCards.filter(record=>record.renderState!=='CARD_READY').length;
  const phase=session.phase==='dealing'?'發卡中':session.phase==='ready'?'可逐卡翻開或一次全部開啟':session.phase==='complete'?'本次結果已全部揭示':session.phase;
  const quota=localFeverQuotaOutcome(session);
  el.textContent=`本地 Fever 10+1 模擬 · ${phase} · ${opened}/11 · ${diagnostic} 列使用明示診斷卡面 · ${quota}。11 次有放回 Web 假設；非官方結果／伺服器 RNG；FX OFF。${state.usesRemaining}/${state.feverTenTimeUses} 次額度。`;return;
 }
 if(showing&&session?.mode==='normal-local-ten-draw'){const opened=session.cards.filter(card=>card.openAt!==null).length,failed=session.resultCards.filter(record=>record.renderState==='ASSET_LOAD_FAILED').length,phase=session.phase==='dealing'?'發卡中':session.phase==='ready'?'可逐張翻開或一次全部開啟':session.phase==='complete'?'結果已全部開啟；按 Confirm 返回商店':session.phase,progressText=failed?'素材載入失敗；不記進度或判定':session.luckyFeverRandomTriggered?'Lucky Fever 16.5% 觸發；11 張結果保留，進度一次集滿 110':session.normalProgressCounted?'+11 本地進度已記錄；未觸發或自然滿值略過隨機':'完成翻卡後結算本地 +11 與一次購買機率';el.textContent=`Normal 10+1 本地抽獎 · ${phase} · ${opened}/11 · ${progressText} · WEB_SIMULATION_ONLY；非官方伺服器抽獎。`;return;}
 if(showing&&session?.targetedFixture){el.textContent=`R6 ${session.targetedPool} 指定獎勵 · MANUAL_FIXTURE_ONLY · ${session.cards.filter(c=>c.openAt!==null).length}/11 · 不抽樣、不計Gauge、不扣Fever額度；卡背與P7為玩家視覺規則。`;return;}
 if(showing&&session?.mode==='normal-local-ten-display'){const opened=session.cards.filter(card=>card.openAt!==null).length,phase=session.phase==='dealing'?'發卡中':session.phase==='ready'?'可逐張翻開或一次全部開啟':session.phase==='complete'?'結果已全部開啟；按 Confirm 返回商店':session.phase;el.textContent=`本地 10+1 展示測試 · ${phase} · ${opened}/11 已翻開 · 固定 Normal 來源列展示，不是 Fever 結果、不執行抽樣；不計 Fever 進度、不扣款、不呼叫伺服器；R5/R6 僅 Web 展示，FX OFF。`;return;}
 if(normalR9StartPending){el.textContent='正在核對並載入固定 11 筆本地展示素材；尚未抽樣。';return;}
 if(showing&&session?.mode==='normal-local-preview'){el.textContent=`本地模擬結果已顯示 · ${session.sourceRowKey} · ${session.luckyFeverRandomTriggered?'Lucky Fever 1.5% 單抽觸發；本地進度一次集滿 110；Overlay 於 R8 結果卡顯示後播放（WEB_ADAPTATION，原生 present 時序未閉合）':'Lucky Fever 未觸發或自然滿值略過隨機'} · Confirm 返回商店會清除本次 pending。非伺服器結果，liveResultGrade=UNKNOWN，FX OFF。`;return;}
 if(normalLocalLastResult&&!normalLocalCardPresentation(normalLocalLastResult)){el.textContent=`上次本地抽樣保留 ${normalLocalLastResult.sourceRowKey}，目前來源不允許結果卡展示；不會重抽或代換。設定：${modeText} · 測試影片 ${movieKey}。`;return;}
   el.textContent=feverState.normalSingleAvailable?`可開始 Normal 單抽 · ${modeText} · ${movieStatusText}。遊戲舞台「購買 1 次」→ R8／1.5%；「購買 10+1 次」→ R12-P1／整次 16.5%。抽前已有 Fever 機會或抽後自然達 110 時不判 Lucky Fever；Seed 與 Crypto 使用獨立判定流。規則由玩家提供，WEB_SIMULATION_ONLY；不扣款、不呼叫伺服器。`:`${feverState.phase==='fever-test-active'?'本地 Fever 測試狀態中':'本地 Fever 測試額度已用完；transition-unknown'}：遊戲舞台「購買 1 次」保留但不可操作；「購買 10+1 次」${feverState.phase==='fever-test-active'&&feverState.usesRemaining>0?'→ R10-P3 本地 Fever 模擬':'不允許開始抽樣'}。第二次 Fever 結果 Confirm 後依 WEB_SIMULATION_AUTO_NEW_CYCLE 回到 Normal；不代表官方伺服器轉換。`;
}
function canStartManualNewCycle(state=localFeverSimulation.snapshot()){
 const overlay=luckyFeverOverlay.snapshot(),flow=normalLocalFullFlow.current();
 return state.phase==='fever-test-exhausted-transition-unknown'&&state.usesRemaining===0
  &&!showing&&!session&&!movieActive&&!moviePending&&!normalR9StartPending&&!feverTenStartPending&&!normalLocalTenStartPending
  &&!normalLocalTenPendingRun&&!feverTenPendingRun&&!flow&&normalSingleLuckyFeverRuns.size===0
  &&overlay.overlayHidden&&overlay.status!=='PLAYING';
}
function startManualNewCycle(){
 const before=localFeverSimulation.snapshot();if(!canStartManualNewCycle(before)){setStatus('WEB_SIMULATION_MANUAL_NEW_CYCLE_BLOCKED：只有兩次 Fever 額度皆完成、結果已 Confirm 返回商店且沒有進行中場景時才能重新開始；狀態未改變。');renderLocalFeverSimulation();render();return false;}
 luckyFeverOverlay.cancel('manual-new-cycle');flowGeneration++;normalR9StartGeneration++;feverTenStartGeneration++;normalLocalTenStartGeneration++;normalLocalDrawGeneration++;
 normalLocalTenPendingRun=null;normalLocalSingleResumePending=null;normalLocalTenResumePending=null;feverTenPendingRun=null;normalLocalLastResult=null;normalSingleLuckyFeverRuns.clear();comparison=null;trace=[];
 const result=localFeverSimulation.reset();if(!result.accepted){setStatus(`WEB_SIMULATION_MANUAL_NEW_CYCLE_FAILED：${result.reason||'RESET_REJECTED'}；原狀態保留。`);renderLocalFeverSimulation();render();return false;}
 if(normalLocalOutput)normalLocalOutput.textContent='WEB_SIMULATION_MANUAL_NEW_CYCLE：玩家主動建立新的本地模擬週期；Fever 進度 0/110，Normal 可抽。此為 Web 本地控制，不代表官方伺服器重置時機。';
 renderLocalFeverSimulation();render();return true;
}
function renderLocalFeverSimulation(){
 const state=localFeverSimulation.snapshot(),status=$('local-fever-status'),events=$('local-fever-events');
   const playerState=$('normal-local-fever-player-state'),flow=normalLocalFullFlow.current(),flowInProgress=(!!flow&&flow.phase!=='result-visible')||normalLocalTenStartPending||Boolean(normalLocalTenPendingRun)||session?.mode==='normal-local-ten-draw',feverTenFlowActive=session?.mode==='local-fever-ten-display'||feverTenStartPending||normalLocalTenStartPending||Boolean(normalLocalTenPendingRun)||session?.mode==='normal-local-ten-draw',sceneBusy=showing||movieActive||moviePending||normalR9StartPending||feverTenStartPending||normalLocalTenStartPending||Boolean(normalLocalTenPendingRun);
 if(playerState){
   const localText=state.phase==='normal-progress'?`本地 Fever 測試進度 ${state.progress}/${state.maxProgress} · WEB_SIMULATION_ONLY · R8 本地單抽結果顯示後 +1；Normal 10+1 全部結果成功展示後 +11；R9 固定展示不計數。診斷 Fixture 可直接測試進入 Fever。`:
    state.phase==='fever-test-active'?`本地 Fever 測試狀態 ${state.usesRemaining}/${state.feverTenTimeUses} 次 10+1 額度 · WEB_SIMULATION_ONLY。一般單抽仍顯示但不可用；可使用 Fever 10+1 本地模擬入口。`:
    `本地 Fever 測試額度 0/${state.feverTenTimeUses} · transition-unknown；不允許第三次 Fever 測試。第二次 10+1 結果 Confirm 後依 WEB_SIMULATION_AUTO_NEW_CYCLE 回到 Normal；伺服器轉換仍未確認。${canStartManualNewCycle(state)?'目前可用診斷區手動重新開始本地模擬。':''}一般單抽仍顯示但不可用。`;
  playerState.textContent=localText;
   const resetPlayer=$('normal-local-fever-player-reset');if(resetPlayer){const canReset=canStartManualNewCycle(state);resetPlayer.hidden=!canReset;resetPlayer.disabled=!canReset;}
 }
 if(!status||!events)return state;
 const phaseText={
  'normal-progress':`Normal 本地進度 ${state.progress}/${state.maxProgress} · 未進入 Fever`,
  'fever-test-active':`Fever 本地測試狀態 · ${state.usesRemaining}/${state.feverTenTimeUses} 次 10+1 額度`,
  'fever-test-exhausted-transition-unknown':`本地測試額度已用完 · 0/${state.feverTenTimeUses} · 原生後續狀態未確認；第二次結果 Confirm 後依 WEB_SIMULATION_AUTO_NEW_CYCLE 切回 Normal`,
 }[state.phase]||state.phase;
  status.textContent=`${phaseText} · WEB_SIMULATION_ONLY · Fever 結果使用明示的離線抽樣策略；不代表伺服器規則，FX OFF。`;
  const normalAllowed=state.normalSingleAvailable&&!flowInProgress;
  $('local-fever-normal-single').disabled=!normalAllowed;
  $('local-fever-normal-ten').disabled=!normalAllowed;
  $('local-fever-direct-fill').disabled=!normalAllowed;
   $('local-fever-ten-complete').disabled=state.phase!=='fever-test-active'||state.usesRemaining<=0||flowInProgress||feverTenFlowActive;
   $('local-fever-reset').disabled=flowInProgress||feverTenFlowActive;
   $('local-fever-ten-start').disabled=state.phase!=='fever-test-active'||state.usesRemaining<=0||!feverLocalSimulator||sceneBusy||flowInProgress;
 events.textContent=state.events.length?JSON.stringify({classification:state.classification,progress:state.progress,maxProgress:state.maxProgress,usesRemaining:state.usesRemaining,phase:state.phase,events:state.events.slice(-12)},null,2):'尚無本地 Fever 測試事件。';
 return state;
}
function applyLocalFeverAction(action){
    try{const flow=normalLocalFullFlow.current();if(flow&&flow.phase!=='result-visible')throw new Error('NORMAL_LOCAL_FLOW_PENDING');if(session?.mode==='local-fever-ten-display'||feverTenStartPending)throw new Error('FEVER_TEN_LOCAL_FLOW_PENDING');if(session?.mode==='normal-local-ten-draw'||normalLocalTenStartPending||normalLocalTenPendingRun)throw new Error('NORMAL_TEN_PLUS_ONE_FLOW_PENDING');const result=action();if(result?.accepted===false){const status=$('local-fever-status');if(status)status.textContent=`本地 Fever 操作未套用：${result.reason}；狀態未變更。`; }renderLocalFeverSimulation();render();}
 catch(error){const status=$('local-fever-status');if(status)status.textContent=`本地 Fever 操作未執行：${String(error)} · 狀態未變更。`;}
}
function canArmLuckyFeverDiagnostic(){return Boolean(showing&&session&&!session.targetedFixture&&session.count===11&&session.mode!=='local-fever-ten-display'&&Array.isArray(session.cards)&&session.cards.length===11&&session.phase==='ready'&&!session.batch&&!session.flipAllPending&&session.cards.every(card=>card.openAt===null)&&!session.luckyFeverDiagnostic&&!session.luckyFeverOverlayAttempted);}
function updateLuckyFeverDiagnosticControls(){const button=$('lucky-fever-diagnostic-arm'),status=$('lucky-fever-diagnostic-status');if(button)button.disabled=!canArmLuckyFeverDiagnostic();if(!status)return;if(session?.luckyFeverDiagnostic){const state=session.luckyFeverOverlayStatus||'ARMED';status.textContent=`本次 11 卡診斷旗標：${state} · WEB_ADAPTATION；本次不參加隨機觸發率判定。`;}else if(session?.luckyFeverRandomTriggered){const state=session.luckyFeverOverlayStatus||'TRIGGERED';status.textContent=`本地 Lucky Fever：${state} · ${session.count===1?'1.5% 單抽':'16.5% 整次 10+1'} · ${session.count===1?'單抽時序為 WEB_ADAPTATION，原生 present 未閉合':'全部卡翻開後播放'}。`;}else if(canArmLuckyFeverDiagnostic()){status.textContent='目前為可翻卡的 11 卡結果；診斷旗標會明確強制一次 Overlay，並略過本次隨機判定。';}else if(showing&&session?.mode==='local-fever-ten-display'){status.textContent='Fever 本地 10+1 不執行 Lucky Fever 隨機判定。';}else{status.textContent='Normal 購買依玩家提供的 1.5%／16.5% 規則，在本地完成事件判定；僅為 WEB_SIMULATION_ONLY。';}}
function armLuckyFeverDiagnosticForCurrentRun(){if(!canArmLuckyFeverDiagnostic())return false;const owner=session,runId=`clean-rebuild-lucky-fever-diagnostic-${Date.now()}-${++luckyFeverDiagnosticSequence}`;owner.luckyFeverDiagnostic=true;owner.luckyFeverDiagnosticRunId=runId;owner.luckyFeverOverlayAttempted=false;owner.luckyFeverOverlayStatus='ARMED';trace.push({event:'lucky-fever-diagnostic-armed',at:performance.now(),runId,sessionMode:owner.mode,resultOrder:Array.isArray(owner.resultOrder)?[...owner.resultOrder]:null,displayOrder:Array.isArray(owner.displayOrder)?[...owner.displayOrder]:null,classification:'WEB_ADAPTATION_LOCAL_DIAGNOSTIC_ONLY',nativeFlagSource:'NO_TRUSTED_IS_RANDOM_FEVER_RESULT_ADAPTER'});updateLuckyFeverDiagnosticControls();render();return true;}
function startLuckyFeverOverlay(now,{timingSource='after-all-result-card-flip-animations-complete'}={}){
 if(session?.targetedFixture)return;
 const owner=session,diagnostic=owner?.luckyFeverDiagnostic===true,randomTrigger=owner?.luckyFeverRandomTriggered===true;
 if((!diagnostic&&!randomTrigger)||![1,11].includes(owner?.count)||owner.luckyFeverOverlayAttempted)return;
 owner.luckyFeverOverlayAttempted=true;owner.luckyFeverOverlayStatus='LOADING';
 const runId=diagnostic?owner.luckyFeverDiagnosticRunId:owner.luckyFeverRunId;
 const triggerSource=diagnostic?'EXPLICIT_DIAGNOSTIC_FIXTURE':'PLAYER_SUPPLIED_RANDOM_RULE';
 trace.push({event:'lucky-fever-overlay-request',at:now,runId,triggerSource,timingSource,sessionMode:owner.mode,
  resultOrder:Array.isArray(owner.resultOrder)?[...owner.resultOrder]:null,displayOrder:Array.isArray(owner.displayOrder)?[...owner.displayOrder]:null,
  probabilityDecision:randomTrigger?owner.luckyFeverProbabilityDecision:null,
  classification:diagnostic?'WEB_ADAPTATION_LOCAL_DIAGNOSTIC_ONLY':'WEB_SIMULATION_ONLY_PLAYER_SUPPLIED_RULE'});
 void luckyFeverOverlay.play({runId,isCurrent:()=>showing&&session===owner&&(diagnostic?owner.luckyFeverDiagnostic&&owner.luckyFeverDiagnosticRunId===runId:owner.luckyFeverRandomTriggered&&owner.luckyFeverRunId===runId),onStart:at=>{
  owner.luckyFeverOverlayStatus='PLAYING';trace.push({event:'lucky-fever-overlay-start',at,runId,triggerSource,timingSource,
   source:'C5-R2 composition + C2 DotParticle + C5 in_come_pa',classification:'WEB_ADAPTATION_RESULT_OVERLAY'});
  normalLocalOutput.textContent+=`\nLucky Fever Overlay 已起播：${triggerSource}；runId=${runId}；${timingSource}。`;
  updateLuckyFeverDiagnosticControls();render();
 }}).then(outcome=>{if(session!==owner)return;owner.luckyFeverOverlayStatus=outcome.status;
  trace.push({event:outcome.status==='COMPLETE'?'lucky-fever-overlay-complete':'lucky-fever-overlay-ended',at:performance.now(),runId,triggerSource,timingSource,...outcome});
  normalLocalOutput.textContent+=`\nLucky Fever Overlay ${outcome.status}${Number.isFinite(outcome.durationSeconds)?`（${outcome.durationSeconds.toFixed(3)}s）`:''}${outcome.reason?`：${outcome.reason}`:''}。`;
  updateLuckyFeverDiagnosticControls();render();
 });
}
const r4PerfEnabled=appQuery.get('perfAudit')==='1';
 const r4PerfRows=[];let r4PerfCurrent=null;
 const r6AuditEnabled=r4PerfEnabled&&appQuery.get('mode')==='engineering';
 const r6Runs=[];let r6Current=null;
 const r7Scenes=[];let r7Scene=null;
 function r7Observe(){if(!r6AuditEnabled||!showing||movieActive||moviePending||!session)return;const key=String(session.normalRunId??session.feverRunId??session.sourceRowKey??session.metrics?.runId)+':'+session.started;if(r7Scene?.key===key)return;r7Scene={key,mode:session.mode,start:performance.now(),frames:[],longTasks:[],longTasksDropped:0,framesTruncated:false};r7Scenes.push(r7Scene);if(r7Scenes.length>5)r7Scenes.shift();const row=r7Scene;function sample(at){if(row!==r7Scene||!showing||movieActive||moviePending){row.endAt=performance.now();return;}if(row.frames.length<2000)row.frames.push({at,phase:session.phase});else row.framesTruncated=true;requestAnimationFrame(sample);}requestAnimationFrame(sample);}

 function r6Start(){if(!r6AuditEnabled)return;r6Current={run:session.normalRunId??session.feverRunId??session.metrics.runId,mode:session.mode,clickAt:performance.now(),beginAt:null,audioRequestedAt:null,nextRafAt:null,firstPaintAt:null,raf:[],longTasks:[],audio:[],sourceRows:[...session.resultOrder],displayOrder:[...session.displayOrder],sound:$('sound-enabled').checked,resourcesAtClick:fxResourceSnapshot(),audioAtClick:audioClipSnapshot()};r6Runs.push(r6Current);if(r6Runs.length>4)r6Runs.shift();const run=r6Current;function sample(t){if(run!==r6Current)return;run.nextRafAt??=t;run.raf.push(t);if(run.raf.length>1000)run.raf.shift();if(run.beginAt!==null&&!session?.batch&&!session?.flipAllPending){run.endAt=performance.now();run.flips=session.metrics.flips.map(f=>({...f}));run.resourcesAtEnd=fxResourceSnapshot();return;}requestAnimationFrame(sample);}requestAnimationFrame(sample);}
 if(r6AuditEnabled&&PerformanceObserver.supportedEntryTypes?.includes('longtask')){new PerformanceObserver(list=>{if(r7Scene&&showing)for(const e of list.getEntries())if(e.startTime>=r7Scene.start){r7Scene.longTasks.push({at:e.startTime,duration:e.duration});if(r7Scene.longTasks.length>128){r7Scene.longTasks.shift();r7Scene.longTasksDropped++;}}if(r6Current&&!r6Current.endAt)for(const e of list.getEntries())if(e.startTime>=r6Current.clickAt)r6Current.longTasks.push({at:e.startTime,duration:e.duration});}).observe({type:'longtask'});}

 let fxRedrawRaf=0;const r4FXRequests={};
 function requestFXRender(source){if(r4PerfEnabled)r4FXRequests[source]=(r4FXRequests[source]??0)+1;if(r4PerfEnabled&&appQuery.get('perfDirect')==='1'){render();return;}if(raf||fxRedrawRaf)return;fxRedrawRaf=requestAnimationFrame(()=>{fxRedrawRaf=0;render();});}

 function r4Span(key,fn){if(!r4PerfCurrent)return fn();const at=performance.now();const value=fn();if(r4PerfCurrent)r4PerfCurrent[key]=(r4PerfCurrent[key]??0)+performance.now()-at;return value;}
 const phoneSlowRenderFrames=[];
 function render(now=performance.now()){if(fxRedrawRaf){cancelAnimationFrame(fxRedrawRaf);fxRedrawRaf=0;}if(!r4PerfEnabled&&!appQuery.has('phoneDiag'))return renderFrame(now);const row={at:performance.now(),run:session?.normalRunId??session?.feverRunId??session?.metrics?.runId??null,mode:session?.mode??'shop',phase:session?.phase==='ready'?(session.batch?'flip-all':session.cards.some(c=>c.openAt!==null&&performance.now()-c.openAt<timing.flipMs)?'manual-flip':'ready'):session?.phase??'shop'};const parent=r4PerfCurrent;r4PerfCurrent=row;try{return renderFrame(now);}finally{row.total=performance.now()-row.at;r4PerfCurrent=parent;if(r4PerfEnabled){r4PerfRows.push(row);if(r4PerfRows.length>12000)r4PerfRows.shift();}if(appQuery.has('phoneDiag')&&row.total>25){phoneSlowRenderFrames.push({...row,movieActive,moviePending,showing});if(phoneSlowRenderFrames.length>32)phoneSlowRenderFrames.shift();}}}
 document.addEventListener('toggle',event=>{if(!r4PerfEnabled||event.target.id!=='performance-details'||!event.target.open)return;const out=document.getElementById('performance-receipt');out.textContent=JSON.stringify({sceneFrames:r7Scenes,p8:r14p30P8Player?.snapshot(),p3:r14p30P3Player?.snapshot(),flipAll:r6Runs,longTaskSupported:PerformanceObserver.supportedEntryTypes?.includes('longtask')??false,fxRequests:r4FXRequests,coalesced:appQuery.get('perfDirect')!=='1',phases:Object.fromEntries([...new Set(r4PerfRows.map(r=>r.mode+'/'+r.phase))].map(k=>{const a=r4PerfRows.filter(r=>r.mode+'/'+r.phase===k);return [k,{count:a.length,spanMs:a.at(-1).at-a[0].at,totalCpuMs:a.reduce((n,r)=>n+r.total,0),...Object.fromEntries(['total','receipt','p7Sync','backSync','backPaint','cards','p7Paint','background','white','singleBackground'].map(key=>{const v=a.map(r=>r[key]??0).sort((x,y)=>x-y);return [key,{p50:v[Math.floor(v.length*.5)],p95:v[Math.min(v.length-1,Math.floor(v.length*.95))],max:v.at(-1),over25:v.filter(x=>x>25).length,over50:v.filter(x=>x>50).length}]}))}]})),canvases:[...document.querySelectorAll('canvas')].map(c=>({id:c.id,width:c.width,height:c.height})),back:p32BackPlayer?.snapshot(),p7:r14p30P7Player?.snapshot(),trace},null,2);},true);
 function renderFrame(now=performance.now()){syncP11InStageShell();r7Observe();now=session?.fxDiagnosticFrozenAt??now;r14p30P3Player?.observeScene({shop:!showing&&!movieActive&&!moviePending,movie:movieActive,pending:moviePending});r14p30P3Player?.sync(r14p30P3Eligible()?session:null);r14p30P7Player?.observeIdleScene({shop:!showing&&!movieActive&&!moviePending,movie:movieActive,pending:moviePending,hidden:document.hidden});r4Span('p7Sync',()=>r14p30P7Player?.syncScene(r14p30P7Scene()));r8OneTimeUpdateStatus();r4Span('backSync',()=>p32BackPlayer?.syncScene(p32BackScene()));if(screenFxCandidate&&!r14P32R2R14Enabled){const feverRunId=r14P32R14FeverRunId(),state=screenFxCandidate.snapshot();if(feverRunId!==null&&(state.mode!=='COMBINED_FLASH02_SCREENFX'||state.runId!==feverRunId||(!state.playing&&!state.visible)))screenFxCandidate.setMode('COMBINED_FLASH02_SCREENFX',feverRunId,now);else if(feverRunId===null&&state.mode==='COMBINED_FLASH02_SCREENFX')screenFxCandidate.setMode('CURRENT_FLASH02',null,now);}r14p30P8Player?.sync(r14p30P8Eligible(true)?String(session.normalRunId??session.feverRunId??session.metrics.runId):null);const renderStarted=performance.now(),feverShopState=localFeverSimulation.snapshot(),feverShopUi=localFeverShopUiSnapshot(feverShopState);resultUiFrameCache=resultFeverRetrySnapshot(feverShopState,now);overrides['GachaResultPopup/ButtonFever']=resultUiFrameCache.feverVisible;overrides['GachaResultPopup/ButtonRetryObject']=resultUiFrameCache.normalRetryVisible;const nextShopFeverMode=!showing&&feverShopUi.active,fxLayerIsolated=showing&&session?.mode==='fx0304-single-diagnostic'&&Boolean(session.fxDiagnosticLayer);if(nextShopFeverMode!==shopFeverModeActive)switchShopLayers(nextShopFeverMode);shopFeverModeActive=nextShopFeverMode;ctx.setTransform(canvasRenderScale,0,0,canvasRenderScale,0,0);if(fxLayerIsolated)ctx.clearRect(0,0,1280,720);else{if(p11InStageShellEnabled)ctx.clearRect(0,0,1280,720);else{ctx.fillStyle='#15171b';ctx.fillRect(0,0,1280,720);}const shopAmbientVisible=!showing&&!movieActive&&!moviePending;r4Span('shopBefore',()=>drawLogicalLayer(ensureShopLayerBeforeDot()));if(!p12AmbientStaticCacheEnabled){r4Span('shopStoreBases',()=>{paintP11OriginalStoreBases();paintP11ScreenshotStoreVisualReference();});}if(shopAmbientVisible)r4Span('shopDots',()=>window.CrystalDot?.draw(ctx,canvasRenderScale));r4Span('shopMiddle',()=>drawLogicalLayer(ensureShopLayerDotToChest()));r4Span('shopChest',()=>paintComponent(shopChestRecord,1,shopAmbientVisible?shopChestTweenOffsetY():0));r4Span('shopAfter',()=>drawLogicalLayer(ensureShopLayerAfterChest()));if(shopFeverModeActive){paintComponent(shopFeverInfoBackgroundRecord);paintComponent(shopFeverInfoTextRecord);}}
  const normalGaugeResult=normalResultFeverGaugeReady(now)&&session?.luckyFeverRandomTriggered!==true;
  if(showing){const done=session.phase==='complete',ready=session.phase==='ready',singlePresentation=session.mode==='single'||session.mode==='normal-local-preview',singleFx=session.mode==='fx0304-single-diagnostic',feverTenResult=session.mode==='local-fever-ten-display',resultUi=resultUiDecision();overrides['GachaResultPopup/OneTimeGacha']=singlePresentation;overrides['GachaResultPopup/TenTimeGacha']=!singlePresentation;overrides['GachaResultPopup/CN_LuckyPointObj']=normalGaugeResult;overrides['GachaResultPopup/TenTimeGacha/Global_Fever_Text']=feverTenResult;overrides['GachaResultPopup/ButtonFlipAll']=ready&&!session.batch&&!singlePresentation&&!singleFx;overrides['GachaResultPopup/ButtonConfirm']=done;overrides['GachaResultPopup/ButtonFever']=resultUi.feverVisible;overrides['GachaResultPopup/ButtonRetryObject']=resultUi.normalRetryVisible&&!singleFx;overrides['GachaResultPopup/Event_SecondaryWeapon']=done&&(singlePresentation||(isLocalTenDisplayMode(session.mode)&&p31r2SharedResultUi))&&activityFixtureMode==='secondaryWeapon';
  if(fxLayerIsolated){if(session.fxDiagnosticLayer!=='fx-only')r4Span('cards',()=>cards(now));if(session.fxDiagnosticLayer!=='card-only'&&$('fx-enabled').checked)drawEffects(now);session.fxDiagnosticPixelMetrics=measureFXDiagnosticCanvas();}else{if(fixture.background==='blocker'||r14p30P2UseSourceBlocker())drawP11CoreScopedLayer(ensureBlockerLayer());const popup=ensurePopupLayers();drawP11CoreScopedLayer(popup.before);if(r14p30P3Eligible())r4Span('singleBackground',()=>withP11ContentClip(()=>r14p30P3Player.paint(ctx,fixture.background+':'+r14p30P2Variant)));const p32AuditBase=p32AuditWant(now)?ctx.getImageData(0,0,canvas.width,canvas.height):null;if(r14p30P8Eligible()){const combinedMode=(screenFxCandidate?.snapshot().mode??'')==='COMBINED_FLASH02_SCREENFX',runId=String(session?.normalRunId??session?.feverRunId??session?.metrics.runId??'');if(r14R4LayerMetrics.runId!==runId)r14R4ResetLayerMetrics(runId);const before=combinedMode?(r14p30P8Player?.snapshot()?.drawnFrames??0):0;r4Span('background',()=>withP11ContentClip(()=>r14p30P8Player?.paint(ctx,fixture.background+':'+r14p30P1BVariant+':'+r14p30P1BAlpha)));if(combinedMode&&(r14p30P8Player?.snapshot()?.drawnFrames??0)>before)r14R4LayerMetrics.flash02PaintFrames++;}const screenFxRunId=r14P32R14FeverRunId();if(screenFxRunId&&['SCREENFX_CANDIDATE','COMBINED_FLASH02_SCREENFX'].includes(screenFxCandidate?.snapshot().mode??'CURRENT_FLASH02')){const needsPixelProbe=appQuery.get('mode')==='engineering'&&(r14ScreenFxPixelProbe.runId!==screenFxRunId||r14ScreenFxPixelProbe.changedPixels===null),beforePixels=needsPixelProbe?ctx.getImageData(0,0,1280,720).data:null,screenFxPainted=withP11ContentClip(()=>screenFxCandidate.paint(ctx,now,screenFxRunId));if(screenFxPainted)r14R4LayerMetrics.screenFxPaintFrames++;if(screenFxPainted&&needsPixelProbe){const afterPixels=ctx.getImageData(0,0,1280,720).data;let changedPixels=0;for(let pixel=0;pixel<afterPixels.length;pixel+=4){if(afterPixels[pixel]!==beforePixels[pixel]||afterPixels[pixel+1]!==beforePixels[pixel+1]||afterPixels[pixel+2]!==beforePixels[pixel+2]||afterPixels[pixel+3]!==beforePixels[pixel+3])changedPixels++;}r14ScreenFxPixelProbe={runId:screenFxRunId,frame:screenFxCandidate.snapshot().lastDrawnFrame,changedPixels};const note=$('r14p32r2r14-status');if(note)note.textContent+=` · Canvas 變化像素 ${changedPixels}`;}}r14R4PublishLayerStatus();r4Span('cards',()=>cards(now));if(r14p30P3Eligible())r14p30P3Player.cardPainted();const root2ReviewBase=p32Root2ReviewWant(now)?ctx.getImageData(0,0,canvas.width,canvas.height):null;if(r14p30P7Eligible())r4Span('p7Paint',()=>r14p30P7Player?.paint(ctx));if(root2ReviewBase)p32Root2ReviewCapture(now,root2ReviewBase);r4Span('backPaint',()=>p32BackPlayer?.paint(ctx));if(p32AuditBase)p32AuditCapture(now,p32AuditBase);if(r14p27R4Active())r4Span('white',()=>r14p27R4Draw(now));else if($('fx-enabled').checked)drawEffects(now);drawLogicalLayer(popup.after);}if(fx0304P25TraceEnabled&&p25Trace.pendingReadback){const pending=p25Trace.pendingReadback;p25Trace.frameReadbacks.push({...pending,readback:p24TraceRoiSummary()});p25Trace.pendingReadback=null;}
  } // Close if(showing): following UI controls must update in both shop and result states.
  {const feverResult=showing&&session?.mode==='local-fever-ten-display';if(shouldPublishFeverBackgroundReceipt({enabled:p12A16IdleRenderSyncEnabled,route:appQuery.get('mode'),feverResult})){const runId=r14P32R14FeverRunId(),screen=screenFxCandidate?.snapshot(),receipt=JSON.stringify({classification:'WEB_VISUAL_ADAPTATION_PLAYER_PENDING_NOT_NATIVE_PARITY',mode:appQuery.get('mode'),sessionMode:session?.mode??null,phase:session?.phase??null,runId,active:runId!==null,screenFx:{mode:screen?.mode??null,runId:screen?.runId??null,playing:screen?.playing??false,visible:screen?.visible??false,assetsLoaded:screen?.assetsLoaded??0,assetErrors:screen?.assetErrors??[],drawCalls:screen?.drawCalls??0,lastDrawnFrame:screen?.lastDrawnFrame??null,paintFrames:r14R4LayerMetrics.screenFxPaintFrames,changedPixels:r14ScreenFxPixelProbe.runId===runId?r14ScreenFxPixelProbe.changedPixels:null},flash02:{paintFrames:r14R4LayerMetrics.flash02PaintFrames,drawnFrames:r14p30P8Player?.snapshot()?.drawnFrames??0,choice:r14p30P8Player?.snapshot()?.choice??null},nativeParity:'NOT_CLAIMED'});if(!p12A16IdleRenderSyncEnabled||canvas.dataset.feverBackgroundReceipt!==receipt)canvas.dataset.feverBackgroundReceipt=receipt;}else if(canvas.dataset.feverBackgroundReceipt!==undefined)delete canvas.dataset.feverBackgroundReceipt;}
 // Gauge is a shared shop/result HUD. Keep it OUTSIDE the result-only branch.
 if(!fxLayerIsolated){paintFeverProgressHud(now,normalGaugeResult,p12A16IdleRenderSyncEnabled?feverShopState:undefined);if(showing&&resultUiDecision().feverVisible)drawLogicalLayer(ensurePopupLayers().feverTip);}
  if(r14p30P1BEnabled){const note=$('p30p1b-status');if(note){const eligible=r14p30P1BEligible();const message=eligible?('正在比較同一批 11 張卡：'+(r14p30P1BVariant==='baseline'?'A／來源 Frame TweenAlpha 0.70':'B／Web Frame Alpha '+r14p30P1BAlpha.toFixed(2))+'（Web 視覺實驗，不是原生值）'):(showing?'此結果不屬 P1B Normal 10+1 A/B；若繪製同一 Frame，使用玩家選定 Web Alpha 0.85。':movieActive||moviePending?'影片／準備中不套用結果 Frame Alpha。':'商店待機不使用結果 Frame Alpha；正式結果路徑採玩家選定 Web Alpha 0.85。');if(note.textContent!==message)note.textContent=message;}}
 if(r14p30P2Enabled){const note=$('p30p2-status');if(note){const message=r14p30P2Eligible()?(r14p30P2UseSourceBlocker()?'單抽結果：商店 → Source DarkNess InputBlocker (0.705882...) → 原始 Frame Fader (Tween 0.70) → 卡片／Popup；僅歷史來源條件式比較。':'單抽結果：商店 → 原始 Frame Fader (Tween 0.70) → 卡片／Popup；目前正式網站已整合。'):(showing?'此比較只適用 OneTime 單抽結果與 Frame 背景；不影響 10+1／Fever。':'進入單抽結果後可切換 A／B，同一張卡、不重新抽樣。');if(note.textContent!==message)note.textContent=message;}}
 const done=showing&&session.phase==='complete',ready=showing&&session.phase==='ready',localFlow=normalLocalFullFlow.current(),p6ResumePending=Boolean(normalLocalSingleResumePending||normalLocalTenResumePending),blocked=showing||movieActive||moviePending||normalR9StartPending||feverTenStartPending||normalLocalTenStartPending||Boolean(normalLocalTenPendingRun)||!!localFlow;
 setIfChanged($('official-pool-browser'),'hidden',blocked);
 const resultUi=resultUiDecision();
  setIfChanged($('confirm'),'hidden',!done);setIfChanged($('retry'),'hidden',!resultUi.hitTargetVisible||session?.mode==='fx0304-single-diagnostic'||Boolean(session?.targetedFixture));setIfChanged($('retry'),'disabled',resultUi.feverVisible?!resultUi.enabled:(session?.mode==='normal-local-ten-display'||(session?.mode==='normal-local-ten-draw'&&!localFeverSimulation.snapshot().normalSingleAvailable)||(session?.mode==='normal-local-preview'&&!localFeverSimulation.snapshot().normalSingleAvailable)));setIfChanged($('retry'),'ariaLabel',resultUi.feverVisible?'Fever 10+1購買（寶箱使用券10）':resultUi.resultRoute==='FEVER_EXHAUSTED_NORMAL_RETRY'?'10+1 再抽（寶箱使用券10）':session?.mode==='normal-local-ten-draw'?'10+1 再抽（寶箱使用券10）':['single','normal-local-preview'].includes(session?.mode)?'再使用一次（本地模擬，不扣款）':'再次使用固定測試資料');setIfChanged($('retry'),'title',resultUi.feverVisible?`${resultUi.usesText}；${resultUi.timeSourceClass}${resultUi.timeSourceClass==='WEB_FIXED_DISPLAY_NOT_REAL_COUNTDOWN'?'（固定顯示12小時04分，非真實倒數）':''}`:'');setIfChanged($('flip-all'),'hidden',!ready||!!session.batch||!!session.flipAllPending||session.mode==='single'||session.mode==='normal-local-preview'||session.mode==='fx0304-single-diagnostic');setIfChanged($('fixture'),'disabled',(showing&&!done)||movieActive||moviePending||!!localFlow||p6ResumePending);setIfChanged($('draw-count'),'disabled',blocked||p6ResumePending);setIfChanged($('movie-source'),'disabled',blocked);setIfChanged($('full-flow'),'disabled',blocked);setIfChanged($('open'),'disabled',blocked);
 if(showing&&session?.phase==='ready'&&!$('flip-all').hidden&&session.p32ButtonVisibleAt==null)session.p32ButtonVisibleAt=performance.now();if(p12A16IdleRenderSyncEnabled)updateShopPurchaseTargets(feverShopState,feverShopUi);else updateShopPurchaseTargets();r4Span('receipt',()=>updateP31Receipt());setIfChanged($('compare-apply'),'disabled',!done||session.mode==='single'||session.mode==='normal-local-preview'||isLocalTenDisplayMode(session.mode));if(!done||session.mode==='single'||session.mode==='normal-local-preview'||isLocalTenDisplayMode(session.mode))comparison=null;
  const localFeverState=p12A16IdleRenderSyncEnabled?feverShopState:localFeverSimulation.snapshot(),localNormalAvailable=localFeverState.normalSingleAvailable;
  setIfChanged($('normal-local-random'),'disabled',!normalLocalSimulator||!localNormalAvailable||blocked||p6ResumePending);
  setIfChanged($('normal-local-seeded'),'disabled',!normalLocalSimulator||!localNormalAvailable||blocked||p6ResumePending);
 setIfChanged($('normal-local-preview'),'disabled',!normalLocalSimulator||!normalLocalCardPresentation(normalLocalLastResult)||session?.mode==='normal-local-preview'||blocked||p6ResumePending);
 setIfChanged($('normal-local-flow-mode'),'disabled',!normalLocalSimulator||blocked);
  setIfChanged($('normal-local-seed'),'disabled',!normalLocalSimulator||blocked);
  setIfChanged($('normal-local-full-flow'),'disabled',!normalLocalSimulator||!localNormalAvailable||blocked||Boolean(normalLocalTenResumePending));
  setIfChanged($('normal-local-ten-full-flow'),'disabled',!normalLocalSimulator||!localNormalAvailable||blocked||normalLocalTenStartPending||Boolean(normalLocalTenPendingRun)||Boolean(normalLocalSingleResumePending));
  setIfChanged($('normal-local-ten-display'),'disabled',!normalR9TenDisplayReady||!normalLocalSimulator||blocked||normalR9StartPending||p6ResumePending);setIfChanged($('lucky-fever-diagnostic-arm'),'disabled',!canArmLuckyFeverDiagnostic());
  setIfChanged($('local-fever-ten-start'),'disabled',!feverLocalSimulator||localFeverState.phase!=='fever-test-active'||localFeverState.usesRemaining<=0||blocked||feverTenStartPending);
  setIfChanged($('fx-enabled'),'disabled',isLocalTenDisplayMode(session?.mode));
 const opened=session?.cards.filter(c=>c.openAt!==null).length??0;
   setStatus(feverTenStartPending?'正在產生並核對本次 Fever 本地 11 筆結果……':showing&&session?.mode==='local-fever-ten-display'?`LOCAL_FEVER_TENTIME_SIMULATION · ${session.phase} · 11 次有放回公告權重 Web 假設 · 非官方 Fever 結果 · Flash02＋ScreenFx WEB_VISUAL_ADAPTATION${screenFxCandidate?.snapshot().assetsLoaded===16?'':' · ScreenFx 素材載入中/失敗，請檢查繪製收據'}。`:r14p29P1Enabled&&movieActive&&feverTenPendingRun?.phase==='movie'?`Fever 10+1 測試影片 ${feverTenPendingRun.movieKey} 播放中；11 筆已固定，跳過或自然結束後進入同一組結果。` : movieActive?`手動播放 ${$('movie-source').value} 原始影片（僅為明示預覽 Fixture）；自然結束或按「跳過」後顯示 ${nextDrawCount===1?'單張':'10+1'} 固定測試結果。`:moviePending?'正在準備已選取的原始音效與影片……':normalR9StartPending?'正在載入固定 11 筆結果展示素材；沒有抽樣。':showing?(session.mode==='normal-local-ten-display'?`本地 10+1 展示測試：固定 11 筆來源列；發卡／翻卡由同一 TenTime 場景操作；非官方抽獎，不是 11 次 Normal 抽樣，不含保底或 Fever；resultOrder 與 displayOrder 分離；FX OFF。`:session.mode==='normal-local-preview'?(session.admissionClass==='WEB_VISUAL_DISPLAY_ONLY'?(session.previewKind==='normal-local-r6-announcement-grade-web-only'?`本地模擬展示限定預覽：${session.item.name} · 依公告「${session.displayGrade}」套用 Web 卡框樣式，非有效品級或伺服器結果。來源列 ${session.sourceRowKey}；ItemID/payload 未定；liveResultGrade=UNKNOWN；FX OFF。`:`本地模擬視覺限定預覽：${session.item.name} · 玩家確認神話樣式（不是有效品級或伺服器結果）。來源列 ${session.sourceRowKey}；liveResultGrade=UNKNOWN；FX OFF。`):`本地模擬結果卡預覽：${session.item.name} · ${session.basicGrade} · 來源列 ${session.sourceRowKey}。靜態 Item adapter，不是伺服器 payload；liveResultGrade=UNKNOWN；FX OFF。`):session.mode==='single'?`單抽穩定結果：${session.item.name}；固定展示資料，沒有翻牌或伺服器抽取。`:`DEMO_FIXTURE：${session.phase}，已開 ${opened}/11；遮罩 ${fixture.background}。${comparison?` FX 定格：第 ${comparison.index+1} 張，${comparison.ageMs.toFixed(3)}ms。`:''}`):'商店初始狀態：可選擇 1 次或 10+1 固定展示流程。');
 if(showing&&session?.mode==='fx0304-single-diagnostic')setStatus(session.fxDiagnosticLayer?`TenTime 單卡來源層比較 · ${fx0304SelectorOverride} · ${session.fxDiagnosticLayer} · 固定 Web 樣本年齡 ${session.fxDiagnosticAgeMs.toFixed(3)}ms；非原生事件時鐘。CanvasPixelMetrics=${JSON.stringify(session.fxDiagnosticPixelMetrics||{pending:true})}`:`FX 03／04 單卡工程診斷 · ${fx0304SelectorOverride} · 點擊中央卡片翻開；使用歷史 R4 Web capture，不是本版 Native 1:1。`);
 if(showing&&session?.mode==='fx0304-tentime-replay')setStatus(`R14-P21 完整 TenTime 動態診斷 · 固定 R9 Fixture A · 第 ${fx0304SelectedSlotValue} 張強制 ${fx0304SelectorOverride}（工程覆寫，非實際 selector）· R9 5+6 發卡、手動翻卡／Flip All · Popup-before → Card → R4 Web capture → Popup-after。R4 PNG 非完整 Native NGUI 合成；${whiteBurstAdaptationEnabled?'另疊加 R14-P27 白光 WEB_ADAPTATION；':''}正式玩家 FX 保持 OFF。`);
 if(showing&&session?.mode==='local-fever-ten-display'){const fx=screenFxCandidate?.snapshot(),receipt=canvas.dataset.feverBackgroundReceipt?JSON.parse(canvas.dataset.feverBackgroundReceipt):null;setStatus(`LOCAL_FEVER_TENTIME_SIMULATION · ${session.phase} · ${localFeverQuotaOutcome(session)}非官方 Fever Web 模擬 · Flash02 ${receipt?.flash02?.paintFrames??0} 次 paint；ScreenFx ${receipt?.screenFx?.drawCalls??0} drawCalls／${receipt?.screenFx?.assetsLoaded??0}/16 素材 · WEB_VISUAL_ADAPTATION，不是 Native 1:1${fx?.assetErrors?.length?` · 素材錯誤 ${fx.assetErrors.length}`:''}。`);}
 if(localFlow){const state=movieActive?'影片播放中':moviePending?'正在準備原始影片':showing?'結果卡已顯示':'結果載入中';setStatus(`LOCAL_NORMAL_SIMULATION · ${state} · ${localFlow.sourceRowKey} · ${movieP5StatusText(window.__r14p5LastMovieSelection)} · 不代表伺服器交易；liveResultGrade=UNKNOWN；FX OFF。`);}
   updateNormalLocalPlayerStatus(p12A16IdleRenderSyncEnabled?feverShopState:null);updateLuckyFeverDiagnosticControls();
   if(fx0304TraceEnabled&&p24Trace.pendingTargetFrame&&!p24Trace.targetFrameDrawn){
    const pending=p24Trace.pendingTargetFrame,canvasRect=canvas.getBoundingClientRect(),visibleCss={left:Math.max(0,canvasRect.left),top:Math.max(0,canvasRect.top),right:Math.min(window.innerWidth,canvasRect.right),bottom:Math.min(window.innerHeight,canvasRect.bottom)},roi=p24TraceRoiSummary();
    const receipt={draw:pending,canvas:{logical:[fixture.width,fixture.height],backing:[canvas.width,canvas.height],cssRect:{x:canvasRect.x,y:canvasRect.y,width:canvasRect.width,height:canvasRect.height},viewport:[window.innerWidth,window.innerHeight],visibleCssClip:visibleCss,globalAlphaAfterRender:ctx.globalAlpha,compositeAfterRender:ctx.globalCompositeOperation,roiAfterPopupAfterAndFullRender:roi},renderCounters:{drawEffectsCalls:p24Trace.drawEffectsCalls,selectedDrawCalls:p24Trace.selectedDrawCalls},readbackStatus:roi.readbackError?'READBACK_FAILED':'READBACK_OK'};
    p24Trace.targetFrameReceipt=receipt;p24Trace.targetFrameDrawn=true;p24Trace.pendingTargetFrame=null;
    if(receipt.draw.selector==='04'&&receipt.draw.frameIndex===80){p24Trace.frame80Drawn=true;p24Trace.frame80Receipt=receipt;}
    p24TraceRecord('target-frame-live-canvas-readback',{selector:receipt.draw.selector,slot:receipt.draw.slot,frameIndex:receipt.draw.frameIndex,fxAgeMs:receipt.draw.fxAgeMs,drawImageReturned:true,canvasReadback:receipt.readbackStatus,roi,playbackContinues:true});p24TracePublish();
   }
   r4Span('textCommit',p12B5CommitTextFrame);if(r6AuditEnabled&&r6Current&&!r6Current.firstPaintAt&&session?.cards.some(c=>c.openAt!==null))r6Current.firstPaintAt=performance.now();r14p30P8Player?.observeStage(ctx);lastVisualQualityRenderMs=performance.now()-renderStarted;
 if (appQuery.has('phoneDiag')) {
   stageRenderCosts.frames++;
   stageRenderCosts.totalMs += lastVisualQualityRenderMs;
   stageRenderCosts.maxMs = Math.max(stageRenderCosts.maxMs, lastVisualQualityRenderMs);
   const phaseKey = (session?.mode ?? 'shop') + '/' + (session?.phase ?? 'idle');
   const phaseCosts = stageRenderCosts.phases[phaseKey] ??= { frames: 0, totalMs: 0, maxMs: 0 };
   phaseCosts.frames++;
   phaseCosts.totalMs += lastVisualQualityRenderMs;
   phaseCosts.maxMs = Math.max(phaseCosts.maxMs, lastVisualQualityRenderMs);
 }
 if(session?.metrics){session.metrics.renderCostsMs.push(lastVisualQualityRenderMs);if(session.metrics.renderCostsMs.length>20000)session.metrics.renderCostsMs.shift();}syncShopGaugeGlowAnimation(p12A16IdleRenderSyncEnabled?feverShopState:undefined);syncShopAmbientAnimation();
}
function writeVisualQualityReceipt(){const box=$('visual-quality-receipt');if(!box)return;const r=stage.getBoundingClientRect(),g=$('pool-grid');const icons=[...g.querySelectorAll('.pool-item-icon[data-visual-quality-probe="true"]')].map(img=>{const q=img.getBoundingClientRect(),s=getComputedStyle(img),li=img.closest('li');return {pool:li?.dataset.pool,order:li?.dataset.officialOrder,sourceRow:li?.dataset.sourceRow,natural:[img.naturalWidth,img.naturalHeight],css:[s.width,s.height],rect:[q.x,q.y,q.width,q.height],filter:s.imageRendering,objectFit:s.objectFit,transform:s.transform};});box.textContent=JSON.stringify({schema:'CrystalChest.ShopR3.VisualQualityProbe.v1',viewport:[window.innerWidth,window.innerHeight],devicePixelRatio:window.devicePixelRatio,visualViewportScale:window.visualViewport?.scale??null,stage:[r.x,r.y,r.width,r.height],logical:[fixture.width,fixture.height],backing:[canvas.width,canvas.height],renderScale:canvasRenderScale,pixelAreaRatio:(canvas.width*canvas.height)/(fixture.width*fixture.height),singleCanvasRGBABytes:canvas.width*canvas.height*4,lastRenderMs:lastVisualQualityRenderMs,imageSmoothingEnabled:ctx.imageSmoothingEnabled,imageSmoothingQuality:ctx.imageSmoothingQuality,pool:g.querySelector('li')?.dataset.pool??null,icons,staticRenderMeasurement:visualQualityMeasurement},null,2);}
function measureStaticRender(){if(showing||movieActive||moviePending){visualQualityMeasurement={status:'SKIPPED_NON_STATIC_SCENE'};writeVisualQualityReceipt();return;}const samples=[];for(let i=0;i<10;i++){const start=performance.now();render();samples.push(performance.now()-start);}const sorted=[...samples].sort((a,b)=>a-b);visualQualityMeasurement={status:'MEASURED_STATIC_SHOP_ONLY',count:samples.length,minMs:sorted[0],medianMs:(sorted[4]+sorted[5])/2,maxMs:sorted.at(-1),samplesMs:samples};writeVisualQualityReceipt();}
function schedule(){if(!raf)raf=requestAnimationFrame(tick);}
const sceneTransitionCosts = [];
function measureSceneTransition(step, action) {
 if(!appQuery.has('phoneDiag'))return action();
 const startedAt=performance.now();
 try{return action();}finally{
  sceneTransitionCosts.push({step,startedAt,elapsedMs:performance.now()-startedAt,
   mode:session?.mode??null,phase:session?.phase??null,runId:session?.feverRunId??session?.normalRunId??null});
  if(sceneTransitionCosts.length>80)sceneTransitionCosts.shift();
 }
}
async function measureSceneAsync(step,runId,action){
 if(!appQuery.has('phoneDiag'))return action();
 const startedAt=performance.now();
 try{return await action();}finally{
  sceneTransitionCosts.push({step,runId,startedAt,elapsedMs:performance.now()-startedAt,
   timingKind:'ASYNC_WALL_TIME_NOT_CPU'});
  if(sceneTransitionCosts.length>80)sceneTransitionCosts.shift();
 }
}
if(appQuery.has('phoneDiag')){
 for(const type of ['loadstart','loadedmetadata','loadeddata','canplay','playing','waiting','stalled','error']){
  movie.addEventListener(type,()=>{
   sceneTransitionCosts.push({step:'movie-event-'+type,startedAt:performance.now(),
    runId:feverTenPendingRun?.runId??normalLocalTenPendingRun?.runId??null,
    readyState:movie.readyState,networkState:movie.networkState,
    mediaError:movie.error?.code??null});
   if(sceneTransitionCosts.length>80)sceneTransitionCosts.shift();
  });
 }
}
function startTen(options){
 const value=measureSceneTransition('start-ten-total',()=>startTenCore(options));
 if(appQuery.has('phoneDiag')){
  const owner=session,requestedAt=performance.now();
  requestAnimationFrame(now=>{
   if(session!==owner)return;
   sceneTransitionCosts.push({step:'start-ten-next-callback',startedAt:requestedAt,
    elapsedMs:performance.now()-requestedAt,rafTimestamp:now,mode:owner?.mode,
    phase:owner?.phase,runId:owner?.feverRunId??owner?.normalRunId??null});
   if(sceneTransitionCosts.length>80)sceneTransitionCosts.shift();
  });
 }
 return value;
}
function startTenCore({fullFlow=false,localDisplay=null,feverLocalDisplay=null,normalLocalDraw=null,fx0304Replay=false}={}){
 luckyFeverOverlay.cancel('result-session-replaced');const localData=feverLocalDisplay||normalLocalDraw||localDisplay,feverTen=Boolean(feverLocalDisplay),normalDraw=Boolean(normalLocalDraw);disableCanvasResolutionProbeForFlow();if(raf)cancelAnimationFrame(raf);raf=0;movieActive=false;moviePending=false;showing=true;movie.pause();movie.hidden=true;movieSkip.hidden=true;$('backs').checked=false;if(!fullFlow)trace=[];
  session={mode:fx0304Replay?'fx0304-tentime-replay':feverTen?'local-fever-ten-display':normalDraw?'normal-local-ten-draw':localDisplay?'normal-local-ten-display':'tenPlusOne',count:11,fullFlow,phase:'dealing',started:performance.now(),cards:Array.from({length:11},()=>({openAt:null})),effects:[],batch:null,flipAllPending:false,metrics:createRunMetrics(),...(fx0304Replay?{fxDiagnosticSelector:fx0304SelectorOverride,fxDiagnosticSlot:fx0304SelectedSlotValue,fxDiagnosticFixture:'R9 Fixture A · fixed 11-card TenTime stage',fxDiagnosticComposition:'Popup-before → cards → source R4 capture → Popup-after'}:{}),...(localData?.targetedFixture?{targetedFixture:true,targetedPool:localData.pool,normalRunId:localData.fixtureRunId}:{}),...(localData?{resultCards:localData.resultCards,resultOrder:localData.resultOrder,displayOrder:localData.displayOrder,fxWasEnabled:localData.fxWasEnabled}:{}),...(feverTen?{feverRunId:localData.runId,feverSimulation:localData.simulation,feverQuotaAttempted:false,feverQuotaConsumed:false}:{}),...(normalDraw?{normalRunId:localData.runId,normalSimulation:localData.simulation,normalProgressAttempted:false,normalProgressCounted:false,normalLuckyFeverBefore:localData.luckyFeverBefore,normalLuckyFeverMode:localData.mode,normalLuckyFeverSeed:localData.seed,luckyFeverDiagnostic:false,normalProgressResultReason:null,liveResultGrade:'UNKNOWN'}:{})};
   if(fx0304P25TraceEnabled&&fx0304Replay)p25StartSession();
   if(fx0304TraceEnabled&&fx0304Replay){p24Trace.sessionId=`R14P24-${Date.now()}-${session.metrics.runId}`;p24Trace.phase='dealing';p24Trace.startedAtPerformanceMs=session.started;p24Trace.requestedSelector=fx0304SelectorOverride;p24Trace.selectedSlot=fx0304SelectedSlotValue;p24Trace.selectorEvidence='EXPLICIT_ENGINEERING_OVERRIDE_NOT_NATIVE_RESULT';p24Trace.resultFixture='R9 Fixture A fixed 11-card TenTime stage';p24Trace.expectedFrameIndex=fx0304SelectorOverride==='04'?80:20;p24Trace.frameSamples=[];p24Trace.lastFrameSampleKey=null;p24Trace.events=[];p24Trace.drawEffectsCalls=0;p24Trace.selectedDrawCalls=0;p24Trace.targetFrameDrawn=false;p24Trace.targetFrameReceipt=null;p24Trace.targetFrameMissed=false;p24Trace.frame80Drawn=false;p24Trace.frame80Receipt=null;p24Trace.pendingTargetFrame=null;p24Trace.freezeUntil=0;p24Trace.errors=[];p24TraceRecord('ten-time-diagnostic-session-start',{mode:session.mode,sessionRunId:session.metrics.runId,startedAtPerformanceMs:session.started,phase:session.phase,dealCardCount:session.cards.length,fxEnabled:$('fx-enabled').checked,slot:fx0304SelectedSlotValue,selector:fx0304SelectorOverride,selectorEvidence:'EXPLICIT_ENGINEERING_OVERRIDE_NOT_NATIVE_RESULT',traceHoldEnabled:fx0304TraceHoldTarget,moduleBuildId:fx0304TraceBuildId});p24TracePublish();}
  measureSceneTransition('start-ten-item-list',updateItemList);trace.push({event:'deal-start',at:session.started,source:feverTen?'local-fever-ten-web-simulation':normalDraw?'local-normal-ten-plus-one-web-simulation':localDisplay?'R9-fixed-source-row-display-fixture':'TenTimeGacha-CoGlobal-conditional-web'});
 if(localDisplay)trace.push({event:'normal-r9-fixed-ten-fixture-bound',at:session.started,resultOrder:[...session.resultOrder],displayOrder:[...session.displayOrder],officialServerDraw:false,normalSamplerDraws:0,fx:'OFF'});
 if(normalDraw)trace.push({event:'normal-local-ten-plus-one-results-bound',at:session.started,runId:session.normalRunId,pool:'NORMAL',resultOrder:[...session.resultOrder],displayOrder:[...session.displayOrder],classification:'WEB_SIMULATION_ONLY',strategy:session.normalSimulation.strategy,drawCount:session.normalSimulation.drawCount,withReplacement:true,officialServerDraw:false,liveResultGrade:'UNKNOWN',fx:'OFF'});
 if(feverTen)trace.push({event:'local-fever-ten-result-bound',at:session.started,runId:session.feverRunId,pool:'FEVER',resultOrder:[...session.resultOrder],displayOrder:[...session.displayOrder],samplerMode:session.feverSimulation.mode,strategy:session.feverSimulation.strategy,officialServerDraw:false,resultPayloadsNull:session.resultCards.every(record=>record.result.resultPayload===null),liveResultGrade:'UNKNOWN',fx:'OFF'});
 if(fx0304Replay)trace.push({event:'fx0304-full-tentime-diagnostic-ready',at:session.started,fixture:session.fxDiagnosticFixture,selectedSlot:fx0304SelectedSlotValue,selectedSelector:fx0304SelectorOverride,selectorEvidence:'EXPLICIT_ENGINEERING_OVERRIDE_NOT_NATIVE_RESULT',resultSet:'FIXED_FIXTURE_REPLAY_NOT_DRAW',composition:session.fxDiagnosticComposition,clockBasis:'R9_DYNAMIC_CARD_AND_R4_CAPTURE_CLOCKS_WITHIN_WEB_DIAGNOSTIC',formalPlayerFX:'UNCHANGED_OFF'});
 schedule();measureSceneTransition('start-ten-initial-render',()=>render());
}
function startFXSingleDiagnostic(){luckyFeverOverlay.cancel('fx0304-single-diagnostic-restart');disableCanvasResolutionProbeForFlow();if(raf)cancelAnimationFrame(raf);raf=0;movieActive=false;moviePending=false;showing=true;movie.pause();movie.hidden=true;movieSkip.hidden=true;$('backs').checked=false;trace=[];const started=performance.now(),sampleStarted=started-(fx0304LayerMode?fx0304SampleAgeMs:0);$('fx-enabled').checked=fx0304LayerMode?fx0304LayerMode!=='card-only':true;session={mode:'fx0304-single-diagnostic',count:1,fullFlow:false,phase:fx0304LayerMode?'complete':'ready',started,cards:[{openAt:fx0304LayerMode?sampleStarted:null}],effects:fx0304LayerMode&&fx0304LayerMode!=='card-only'?[{index:0,selector:fx0304SelectorOverride,started:sampleStarted}]:[],batch:null,metrics:createRunMetrics(),...(fx0304LayerMode?{fxDiagnosticLayer:fx0304LayerMode,fxDiagnosticAgeMs:fx0304SampleAgeMs,fxDiagnosticFrozenAt:started}: {})};updateItemList();trace.push({event:'fx0304-single-diagnostic-ready',at:started,selector:fx0304SelectorOverride,fixture:'Fixture A first card',captureSource:'historical R4 data/fx-r4.json',classification:'ENGINEERING_WEB_DIAGNOSTIC_NOT_NATIVE_1TO1',...(fx0304LayerMode?{layerMode:fx0304LayerMode,sampleAgeMs:fx0304SampleAgeMs,cardAndFxSyntheticSharedOrigin:true,clockBasis:'FROZEN_WEB_DIAGNOSTIC_AGE_NOT_NATIVE_EVENT_TIME'}:{})});render();}
function startFXTenTimeReplay(){luckyFeverOverlay.cancel('fx0304-tentime-replay-restart');disableCanvasResolutionProbeForFlow();if(raf)cancelAnimationFrame(raf);raf=0;movieActive=false;moviePending=false;showing=false;session=null;comparison=null;trace=[];$('backs').checked=false;$('fx-enabled').checked=true;$('sound-enabled').checked=false;startTen({fullFlow:false,fx0304Replay:true});}
function start(){if(fx0304TenTimeReplayCandidate){startFXTenTimeReplay();return Promise.resolve();}if(fx0304SingleDiagnosticCandidate){startFXSingleDiagnostic();return Promise.resolve();}luckyFeverOverlay.cancel('new-draw-flow');disableCanvasResolutionProbeForFlow();const token=++flowGeneration;moviePending=true;showing=false;session=null;render();return prepareAudioFromGesture().then(audioReady=>{if(token!==flowGeneration)return;moviePending=false;if(audioReady.status==='unavailable')trace.push({event:'audio-prepare-failed',at:performance.now(),message:audioReady.error});startTen({fullFlow:false});});}
function startSingle({fullFlow=false}={}){luckyFeverOverlay.cancel('single-session-replaced');disableCanvasResolutionProbeForFlow();if(raf)cancelAnimationFrame(raf);raf=0;movieActive=false;moviePending=false;showing=true;movie.pause();movie.hidden=true;movieSkip.hidden=true;$('backs').checked=false;if(!fullFlow)trace=[];const item=fixtures.groups[Number($('fixture').value)][0];session={mode:'single',count:1,fullFlow,phase:'complete',started:performance.now(),item,cards:[{openAt:performance.now()-timing.flipMs}],effects:[],batch:null};updateItemList();trace.push({event:'one-time-result-stable',itemID:item.itemID,source:'OneTimeGacha-CoGlobal-demo-fixture'});render();}
function playFullFlow(count=Number($('draw-count').value)){luckyFeverOverlay.cancel('retry-or-new-full-flow');disableCanvasResolutionProbeForFlow();const token=++flowGeneration;if(raf)cancelAnimationFrame(raf);raf=0;showing=false;session=null;comparison=null;trace=[];movieActive=false;moviePending=true;nextDrawCount=count===1?1:11;movie.dataset.finishCount='0';movie.dataset.finishGuardHits='0';render();return prepareAudioFromGesture().then(audioReady=>{if(token!==flowGeneration)return;moviePending=false;movieActive=true;const movieKey=$('movie-source').value;movie.src=nonFxAssets.movieSelection.movies[movieKey].file;movie.controls=false;movie.hidden=false;movieSkip.hidden=false;movie.currentTime=0;movie.load();render();const playPromise=movie.play();if(playPromise&&typeof playPromise.catch==='function')playPromise.catch(error=>{trace.push({event:'movie-play-rejected',at:performance.now(),message:String(error)});setStatus(`無法自動播放 ${movieKey} 原片；可按右上角「跳過」進入固定測試結果。`);});});}
let movieFinishGuardHits=0,movieFinishAcceptedCount=0;
function finishMovie(trigger='ended'){return measureSceneTransition('finish-movie-total',()=>finishMovieCore(trigger));}
function finishMovieCore(trigger='ended'){if(!movieActive){movieFinishGuardHits++;movie.dataset.finishGuardHits=String(movieFinishGuardHits);return;}r14p30P3Player?.movieFinished(trigger);movieFinishAcceptedCount++;movie.dataset.finishCount=String(Number(movie.dataset.finishCount||0)+1);movieActive=false;movie.pause();movie.hidden=true;clearP10SafeRecovery();trace.push({event:'movie-finish',trigger,at:performance.now()});const feverTen=feverTenPendingRun,normalTen=normalLocalTenPendingRun,localFlow=normalLocalFullFlow.current(),singleRun=localFlow?normalSingleLuckyFeverRuns.get(localFlow.flowId)?.runId:null;updateP10MoviePlayback(feverTen?.runId??normalTen?.runId??singleRun,trigger);if(r14p29P1Enabled&&feverTen?.phase==='movie'){feverTen.phase='result-loading';trace.push({event:'local-fever-ten-movie-finish',at:performance.now(),runId:feverTen.runId,movieKey:feverTen.movieKey,trigger,resultOrder:[...feverTen.resultOrder],classification:'WEB_ADAPTATION_CONDITIONAL_MOVIE_SELECTOR_NOT_NATIVE_RULE'});if(!feverTen.display){trace.push({event:'local-fever-ten-movie-finish-without-display',at:performance.now(),runId:feverTen.runId});setStatus('Fever 影片完成，但同一組結果資料缺失；保留來源列，不重抽、不扣額度。');render();return;}startTen({fullFlow:true,feverLocalDisplay:feverTen.display});return;}if(normalTen?.phase==='movie'){void finishNormalLocalTenFlow(normalTen,trigger);return;}if(localFlow?.phase==='movie'){const accepted=normalLocalFullFlow.finish(trigger,performance.now());if(!accepted.accepted)return;setStatus(`本地 Normal 已選定 ${localFlow.sourceRowKey}；正在載入同一列結果卡。`);void showNormalLocalResultPreview(localFlow.result,normalLocalDrawGeneration,{preserveTrace:true,flowId:localFlow.flowId});render();return;}if(nextDrawCount===1)startSingle({fullFlow:true});else startTen({fullFlow:true});}
movie.onended=()=>finishMovie('ended');movie.onerror=()=>{if(movieActive){const localFlow=normalLocalFullFlow.current();setStatus(r14p29P1Enabled&&feverTenPendingRun?.phase==='movie'?'Fever 原始影片測試 Fixture 載入失敗；按「跳過」顯示同一組已固定的 11 筆結果，不重抽、不扣額度。':localFlow?`原始影片載入失敗；可跳過並顯示同一筆本地 Normal 結果 ${localFlow.sourceRowKey}。`:'原始影片載入失敗；可按右上角「跳過」進入固定測試結果。');}};movieSkip.onclick=()=>{if(p10SafeRecovery){const recovery=p10SafeRecovery;clearP10SafeRecovery();trace.push({event:'p10-no-video-same-batch-recovery',at:performance.now(),runId:recovery.runId,pool:recovery.pool,sourceRowKeys:[...recovery.sourceRowKeys],selectorStatus:'UNRESOLVED_INPUT',samplerCalls:0,rerollOrSubstitution:false});updateP10NoMovieRecovery(recovery.runId,'USER_CONTINUED_WITHOUT_SELECTING_A_VIDEO');recovery.continueSameBatch();return;}finishMovie('skip');};
function playFlipSound(flip){if(!r6AuditEnabled)return playFlipSoundNow(flip);const at=performance.now();try{return playFlipSoundNow(flip);}finally{if(r6AuditEnabled&&r6Current&&!r6Current.endAt)r6Current.audio.push({slot:flip.index,cost:performance.now()-at,status:flip.audioStatus});}}
function playFlipSoundNow(flip){const enabled=$('sound-enabled').checked;flip.soundFixture=$('sound-special').value==='true'?'Treasure_Special':'Treasure_Normal';flip.audioRequested=enabled;if(!enabled){flip.audioStatus='disabled';flip.audioScheduledAt=null;return;}const key=$('sound-special').value==='true'?'special':'normal',entry=audioBuffers.get(key);if(!entry?.buffer){flip.audioStatus=entry?.status==='failed'?'decode-failed':'buffer-not-ready';flip.audioScheduledAt=null;flip.audioError=entry?.error??null;return;}if(!audioContext||audioContext.state!=='running'){flip.audioStatus=`context-${audioContext?.state??'missing'}`;flip.audioScheduledAt=null;return;}let source=null;try{source=audioContext.createBufferSource();source.buffer=entry.buffer;source.connect(audioMasterGain);source.onended=()=>{activeAudioSources=Math.max(0,activeAudioSources-1);source.disconnect();};const scheduledAt=performance.now(),contextTime=audioContext.currentTime;source.start(contextTime);activeAudioSources++;audioRuntime.sourceStarts++;flip.audioScheduledAt=scheduledAt;flip.audioContextTime=contextTime;flip.audioScheduleDeltaMs=scheduledAt-flip.actualFlipAt;flip.audioStatus='scheduled';session.metrics.maxConcurrentAudioSources=Math.max(session.metrics.maxConcurrentAudioSources,activeAudioSources);}catch(error){const failure={at:performance.now(),message:String(error)};audioRuntime.sourceStartFailures.push(failure);flip.audioStatus='start-failed';flip.audioError=failure.message;flip.audioScheduledAt=null;if(source)source.disconnect();}}
function issue(i,now,trigger,scheduledFlipAt=now){const card=session?.cards[i];if(!card||card.openAt!==null||session.phase!=='ready')return false;if(session.metrics?.flips.length===0)session.metrics.lastFrameAt=null;card.openAt=now;if(whiteBurstAppliesToSession())trace.push({event:'white-burst-adaptation-armed',at:now,index:i+1,buildId:whiteBurstAdaptationBuildId,classification:'WEB_ADAPTATION_ONLY'});const localTen=isLocalTenDisplayMode(session.mode),tenTimeReplay=session.mode==='fx0304-tentime-replay',replaySelector=tenTimeReplay&&i===fx0304SelectedSlotIndex?fx0304SelectorOverride:null,forcedCandidateSelector=replaySelector||(!tenTimeReplay&&fx0304DiagnosticCandidate&&['tenPlusOne','fx0304-single-diagnostic'].includes(session.mode)?fx0304SelectorOverride:null),selected=localTen?'FX_OFF':forcedCandidateSelector||fixtures.groups[Number($('fixture').value)][i].fxSelector,flip={index:i+1,selector:selected,...(forcedCandidateSelector?{selectorEvidence:'EXPLICIT_DIAGNOSTIC_OVERRIDE_NOT_NATIVE_RESULT',selectedSlot:tenTimeReplay?fx0304SelectedSlotValue:undefined}:tenTimeReplay?{selectorEvidence:'R9_FIXED_FIXTURE_SELECTOR_NOT_NATIVE_RESULT'}:{}),trigger,scheduledFlipAt,actualFlipAt:now,scheduledOffsetMs:session.metrics?.batchStartedAt===null?null:scheduledFlipAt-session.metrics.batchStartedAt,actualOffsetMs:session.metrics?.batchStartedAt===null?null:now-session.metrics.batchStartedAt};playFlipSound(flip);if(!localTen)session.effects.push({index:i,selector:selected,started:now});if(fx0304P25TraceEnabled&&tenTimeReplay){const effect=session.effects.at(-1);p25Trace.roots[String(i+1)]={slot:i+1,selector:selected,selectorEvidence:flip.selectorEvidence??'R9_FIXED_FIXTURE_SELECTOR_NOT_NATIVE_RESULT',trigger,scheduledFlipAtPerformanceMs:Number(scheduledFlipAt.toFixed(3)),startedAtPerformanceMs:Number(now.toFixed(3)),fxRootStartedAtPerformanceMs:Number((effect?.started??now).toFixed(3)),renderOpportunities:0,validSourceOpportunities:0,sourceEmptySamples:0,readyAtRenderStart:0,readyAtDrawDecision:0,notReadyAtDraw:0,drawImageSuccess:0,drawImageErrors:0,skippedNotReady:0,samples:[]};p25Record('flipcard-and-fx-root-start',{slot:i+1,selector:selected,trigger,scheduledFlipAtPerformanceMs:Number(scheduledFlipAt.toFixed(3)),actualFlipAtPerformanceMs:Number(now.toFixed(3)),fxRootStartedAtPerformanceMs:Number((effect?.started??now).toFixed(3)),selectorEvidence:flip.selectorEvidence??'R9_FIXED_FIXTURE_SELECTOR_NOT_NATIVE_RESULT'});}if(fx0304TraceEnabled&&tenTimeReplay&&i===fx0304SelectedSlotIndex){const effect=session.effects.at(-1);p24TraceRecord('flipcard-issue',{slot:i+1,selector:selected,trigger,scheduledFlipAt:Math.round(scheduledFlipAt*1000)/1000,actualFlipAt:Math.round(now*1000)/1000,sessionStartedAt:Math.round(session.started*1000)/1000,flipElapsedMs:Number((now-session.started).toFixed(3)),effectStartedAt:effect?.started??null,selectorEvidence:flip.selectorEvidence});p24TraceRecord('fx-root-start',{slot:i+1,selector:selected,startedAt:effect?.started??null,source:'Web TenTime diagnostic issue() session.effects.push',classification:'ENGINEERING_REPLAY_CLOCK_NOT_NATIVE_GAME_CLOCK'});p24TracePublish();}session.metrics?.flips.push(flip);trace.push({event:'flip',...flip,...(localTen?{resultIndex:session.displayOrder[i],sourceRowKey:session.resultOrder[session.displayOrder[i]],pool:session.mode==='local-fever-ten-display'?'FEVER':'NORMAL',visualState:session.mode==='local-fever-ten-display'?session.resultCards[session.displayOrder[i]].renderState:undefined}:{})});schedule();return true;}
function completeLocalFeverTenQuota(now){if(session?.mode!=='local-fever-ten-display'||session.feverQuotaAttempted)return;session.feverQuotaAttempted=true;const failed=session.resultCards.filter(record=>record.renderState==='ASSET_LOAD_FAILED');if(failed.length){session.feverQuotaConsumed=false;session.feverQuotaResultReason='ASSET_LOAD_FAILED';trace.push({event:'local-fever-ten-quota-completion-blocked',at:now,runId:session.feverRunId,reason:'ASSET_LOAD_FAILED_NO_LOCAL_QUOTA_DEBIT',failedRows:failed.map(record=>record.result.sourceRowKey),afterUses:localFeverSimulation.snapshot().usesRemaining,ruleClass:'WEB_ADAPTATION_ASSET_FAILURE_GUARD'});normalLocalOutput.textContent+=`\n${localFeverQuotaOutcome(session)}未重抽、未代換。`;return;}const result=localFeverSimulation.completeLocalFeverTenTimeRun(session.feverRunId);session.feverQuotaConsumed=result.accepted===true;session.feverQuotaResultReason=result.accepted===true?null:(result.reason??'COMPLETION_REJECTED');trace.push({event:'local-fever-ten-quota-completion',at:now,runId:session.feverRunId,accepted:result.accepted,reason:result.reason??null,beforeUses:result.state.usesRemaining+(result.accepted?1:0),afterUses:result.state.usesRemaining,phase:result.state.phase,ruleClass:'WEB_ADAPTATION_AFTER_ALL_11_CARDS_REVEALED'});if(!session.feverQuotaConsumed)normalLocalOutput.textContent+=`\n${localFeverQuotaOutcome(session)}`;renderLocalFeverSimulation();}
function settleLocalNormalPurchaseWithLuckyFever({purchaseCount,runId,mode,seed,feverBefore,diagnostic=false,at}){
 const decision=evaluateLuckyFeverPurchase({purchaseCount,mode,seed,feverBefore,diagnostic});
 const settlement=decision.triggered
  ?localFeverSimulation.recordCompletedNormalPurchaseWithLuckyFever(purchaseCount,runId,decision)
  :purchaseCount===11?localFeverSimulation.recordCompletedNormalTenPlusOne(runId):localFeverSimulation.recordCompletedNormalSingle(runId);
 const triggered=decision.triggered===true&&settlement.accepted===true;
 if(session){session.luckyFeverProbabilityDecision=decision;session.luckyFeverRandomTriggered=triggered;session.luckyFeverRunId=runId;session.luckyFeverOverlayStatus=triggered?'TRIGGERED':null;}
 trace.push({event:'lucky-fever-purchase-settlement',at,runId,purchaseCount,decision,accepted:settlement.accepted,reason:settlement.reason??null,
  normalProgressContribution:settlement.accepted?purchaseCount:0,progress:settlement.state.progress,maxProgress:settlement.state.maxProgress,phase:settlement.state.phase,
  randomDrawn:decision.randomDrawn,triggered,diagnostic,ruleSource:'PLAYER_SUPPLIED_GAME_PROBABILITY_RULE',classification:'WEB_SIMULATION_ONLY'});
 playerRecords.recordActivation({runId,lucky:triggered,accepted:settlement.accepted,before:feverBefore,after:settlement.state,diagnostic});
 return {decision,settlement,triggered};
}
function completeLocalNormalTenProgress(now){if(session?.mode!=='normal-local-ten-draw'||session.normalProgressAttempted)return;session.normalProgressAttempted=true;const failed=session.resultCards.filter(record=>record.renderState==='ASSET_LOAD_FAILED');if(failed.length){session.normalProgressCounted=false;session.normalProgressResultReason='ASSET_LOAD_FAILED';trace.push({event:'normal-local-ten-progress-blocked',at:now,runId:session.normalRunId,reason:'ASSET_LOAD_FAILED_NO_PROGRESS_NO_LUCKY_ROLL',failedRows:failed.map(record=>record.result.sourceRowKey),beforeProgress:session.normalLuckyFeverBefore?.progress??localFeverSimulation.snapshot().progress,ruleClass:'WEB_SIMULATION_ONLY_ASSET_FAILURE_GUARD'});normalLocalOutput.textContent+=`\n\n11 張結果均已揭示；${failed.length} 張准入卡素材載入失敗，本次不增加本地 Fever 進度，也不執行 Lucky Fever 判定；來源列不重抽。`;return;}const settled=settleLocalNormalPurchaseWithLuckyFever({purchaseCount:11,runId:session.normalRunId,mode:session.normalLuckyFeverMode,seed:session.normalLuckyFeverSeed,feverBefore:session.normalLuckyFeverBefore,diagnostic:session.luckyFeverDiagnostic===true,at:now});const result=settled.settlement;session.normalProgressCounted=result.accepted===true;session.normalProgressResultReason=result.reason??null;trace.push({event:'normal-local-ten-progress-completion',at:now,runId:session.normalRunId,accepted:result.accepted,reason:result.reason??null,increment:result.accepted?11:0,progress:result.state.progress,maxProgress:result.state.maxProgress,phase:result.state.phase,luckyFeverTriggered:settled.triggered,ruleClass:'WEB_SIMULATION_ONLY_AFTER_ALL_11_REVEALED'});if(settled.triggered)normalLocalOutput.textContent+=`\n\nLucky Fever 已按 ${settled.decision.probabilityPercent}% 整次購買規則觸發；一般 +11 與本地 110 集滿已由同一 runId 結算，動畫將在 11 張翻開後播放。`;renderLocalFeverSimulation();}
function tick(now){raf=0;if(!showing||!session)return;if(fx0304TraceEnabled&&p24Trace.freezeUntil&&now<p24Trace.freezeUntil){schedule();return;}if(fx0304TraceEnabled&&p24Trace.freezeUntil&&now>=p24Trace.freezeUntil){const frozenAt=session.fxDiagnosticFrozenAt;p24Trace.freezeUntil=0;session.fxDiagnosticFrozenAt=null;p24TraceRecord('frame-capture-hold-released',{frozenAtPerformanceMs:frozenAt,resumedAtPerformanceMs:Math.round(now*1000)/1000});p24TracePublish();}const metrics=session.metrics;if(metrics){if(metrics.lastFrameAt!==null){const delta=now-metrics.lastFrameAt;metrics.frameIntervalsMs.push(delta);if(delta>25){if(p12BoundRunMetricsEnabled){metrics.stallEventsTotal++;appendBoundedHistory(metrics.stallsOver25ms,{at:now,intervalMs:delta},{enabled:true,maxItems:256});}else metrics.stallsOver25ms.push({at:now,intervalMs:delta});}if(metrics.frameIntervalsMs.length>20000)metrics.frameIntervalsMs.shift();}metrics.lastFrameAt=now;}
 if(session.phase==='dealing'&&now-session.started>=11*timing.moveMs){session.phase='ready';trace.push({event:'deal-complete',at:now});if(fx0304TraceEnabled){p24Trace.phase='ready';p24TraceRecord('deal-ready',{ready:true,dealElapsedMs:Number((now-session.started).toFixed(3)),cards:session.cards.length,slot:fx0304SelectedSlotValue,selector:fx0304SelectorOverride});p24TracePublish();}}
 if(session.batch&&session.phase==='ready'){const batch=session.batch;const advance=advanceFlipAllBatch(batch,session.cards,now,timing.perCardWaitMs);for(const index of advance.skippedSlots){trace.push({event:'flip-all-skip-open',index:index+1,at:now,reason:'opened-after-batch-start'});}if(advance.due){const {index,scheduledAt}=advance.due;if(issue(index,now,'all',scheduledAt))batch.issuedSlots.push(index);else{batch.skippedSlots.push(index);trace.push({event:'flip-all-skip-open',index:index+1,at:now,reason:'issue-rejected-or-already-open'});}}if(finishFlipAllBatch(batch,session.cards,now,timing.flipMs,timing.postLoopWaitMs)){trace.push({event:'flip-all-complete',at:now,startedAt:batch.startedAt,pendingSlots:batch.pendingSlots.map(i=>i+1),preopenedSlots:batch.preopenedSlots.map(i=>i+1),issuedSlots:batch.issuedSlots.map(i=>i+1),skippedSlots:batch.skippedSlots.map(i=>i+1),pendingCount:batch.pendingSlots.length,endAt:batch.endAt});if(fx0304TraceEnabled){p24Trace.phase='complete';p24TraceRecord('flip-all-complete',{atPerformanceMs:Math.round(now*1000)/1000,elapsedMs:Number((now-batch.startedAt).toFixed(3)),issuedSlots:batch.issuedSlots.map(i=>i+1)});p24TracePublish();}session.batch=null;}}
 if($('fx-enabled').checked)session.effects=session.effects.filter(e=>now-e.started<(fxData.captures[e.selector]?.durationSeconds??0)*1000);
  if(session.phase==='ready'&&!session.batch&&session.cards.every(c=>c.openAt!==null&&now-c.openAt>=timing.flipMs)){session.phase='complete';trace.push({event:'result-complete',at:now});completeLocalFeverTenQuota(now);completeLocalNormalTenProgress(now);startLuckyFeverOverlay(now);}
 render(now);if(session.phase==='complete')finalizeRunMetrics();
 if(fx0304P25TraceEnabled&&session.phase==='complete'&&session.effects.length===0&&!p25Trace.finished){
  p25Trace.finished=true;
  const opportunities=p25Trace.stream.validSourceOpportunities;
  p25Trace.summary={classification:'ENGINEERING_WEB_STREAM_ONLY_NOT_NATIVE_1_TO_1',validSourceRenderOpportunities:opportunities,readyAtDrawDecision:p25Trace.stream.readyAtDrawDecision,drawImageSuccess:p25Trace.stream.drawImageSuccess,notReadyAtDraw:p25Trace.stream.notReadyAtDraw,readinessAtDrawDecisionRatio:opportunities?Number((p25Trace.stream.readyAtDrawDecision/opportunities).toFixed(6)):null,sourceEmptySamples:p25Trace.stream.sourceEmptySamples,cacheEvictions:p25Trace.cache.evictions,cacheReloadsAfterEviction:p25Trace.cache.reloadsAfterEviction};
  p25Record('session-complete-and-stream-summary',{summary:p25Trace.summary});p25Publish();
 }
 if(session.phase==='dealing'||session.batch||r14p27R4HasActive(now)||($('fx-enabled').checked&&session.effects.length&&!r14p27R4Active())||hasWhiteBurstActive(now)||session.cards.some(c=>c.openAt!==null&&now-c.openAt<timing.flipMs)||(r14P32R14FeverRunId()&&screenFxCandidate?.needsAnimation()))schedule();}
function flipAll(){if(r4PerfEnabled)trace.push({event:'flip-all-click',at:performance.now()});if(!session||session.phase!=='ready'||session.batch||session.flipAllPending)return;r6Start();session.flipAllPending=true;render();const generation=session;const begin=()=>{if(session!==generation||!showing||session.phase!=='ready')return;const now=performance.now(),batch=createFlipAllBatch(session.cards,now);if(r6AuditEnabled&&r6Current)r6Current.beginAt=now;session.flipAllPending=false;session.metrics.lastFrameAt=null;session.batch=batch;session.metrics.batchStartedAt=now;trace.push({event:'flip-all-start',at:now,pendingSlots:batch.pendingSlots.map(i=>i+1),preopenedSlots:batch.preopenedSlots.map(i=>i+1),pendingCount:batch.pendingCount});if(fx0304TraceEnabled)p24TraceRecord('flip-all-start',{atPerformanceMs:Math.round(now*1000)/1000,pendingSlots:batch.pendingSlots.map(i=>i+1),pendingCount:batch.pendingCount});schedule();render();};if(r6AuditEnabled&&r6Current)r6Current.audioRequestedAt=performance.now();if($('sound-enabled').checked)resumeAudioFromGesture().then(begin, error=>{trace.push({event:'flip-all-audio-resume-failed',at:performance.now(),message:String(error)});begin();});else begin();}
canvas.addEventListener('click',event=>{const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*1280/r.width,y=(event.clientY-r.top)*720/r.height;if(!showing){const count=shopPurchaseAt(x,y);if(count){$('draw-count').value=String(count);routeStageShopPurchase(count);return;}}if(!session||session.mode==='single'||session.phase!=='ready'||session.batch)return;if(session.mode==='fx0304-single-diagnostic'){if(Math.abs(x-640)<=100&&Math.abs(y-360)<=125){const requestedAt=performance.now(),open=()=>{if(session&&session.phase==='ready'&&issue(0,performance.now(),'manual',requestedAt))render();};if($('sound-enabled').checked&&audioContext?.state!=='running')resumeAudioFromGesture().then(open);else open();}return;}for(let i=0;i<11;i++){const t=target(i);if(Math.abs(x-(640+t.x))<=99.5&&Math.abs(y-(360-t.y))<=125){const requestedAt=performance.now(),open=()=>{if(session&&session.phase==='ready'&&issue(i,performance.now(),'manual',requestedAt))render();};if($('sound-enabled').checked&&audioContext?.state!=='running')resumeAudioFromGesture().then(open);else open();break;}}});
 function setShopPoolTab(pool){const normal=pool==='NORMAL';overrides['GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SubTab_Normal/BtnSelect/Active']=normal;overrides['GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SubTab_Normal/BtnSelect/Basic']=!normal;overrides['GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SbuTab_Fever/BtnSelect/Active']=!normal;overrides['GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/SubItemTabList/SbuTab_Fever/BtnSelect/Basic']=normal;resetShopLayers();render();}
document.addEventListener('crystal-chest-pool-change',event=>setShopPoolTab(event.detail?.pool==='FEVER'?'FEVER':'NORMAL'));
 $('fixture').onchange=()=>{updateItemList();render();};$('backs').onchange=()=>render();$('fx-enabled').onchange=()=>{if($('fx-enabled').checked){schedule();render();}else{releaseFXFrames();render();}};$('sound-enabled').onchange=()=>{if($('sound-enabled').checked)prepareAudioFromGesture().then(result=>{if(result.status==='unavailable')setStatus(`原始音效無法準備：${result.error}`);});render();};$('background').onchange=()=>{fixture.background=$('background').value;popupLayerKey='';render();};
if(r14p5MovieEnabled){const panel=$('movie-selector-p5-controls'),mode=$('movie-selector-p5-mode'),status=$('movie-selector-p5-status');if(!panel||!mode||!status)throw Error('MOVIE_SELECTOR_P5_ENGINEERING_CONTROLS_MISSING');panel.hidden=false;const update=()=>{status.textContent=mode.value==='auto'?(movieSelectorP9Validation.ok?'條件式自動候選已啟用：P5 exact identity 與 P6 等價狀態僅作工程影片判斷；Item identity 仍保留未解。':'P9 等價資料未通過來源核對；歧義列維持 UNRESOLVED_INPUT。切回手動可覆寫。'):'人工 N/H/R 模式；原有影片選擇與流程不變。';};mode.addEventListener('change',update);if(r14p5MovieParams.get('p9HeldBatchReplay')==='1'&&movieSelectorP9Validation.ok){$('normal-local-advanced').open=true;mode.value='auto';update();const sourceRows=[145,54,93,146,139,135,134,124,129,73,122].map(row=>({sourceRowKey:JSON.stringify(['NORMAL','水晶寶箱 (一般) - 輔助武器機率上升活動',String(row)])}));const beforeQuota=localFeverSimulation.snapshot().usesRemaining;const replay=resolveMovieP5ForRows('NORMAL',sourceRows);window.__r14p9HeldBatchReplay=Object.freeze({classification:'ENGINEERING_FIXTURE_ONLY_REPLAY_OF_P8_HELD_SOURCE_ROWS_NO_NEW_DRAW',runId:'ORIGINAL_RUN_ID_NOT_RETAINED_IN_P8_SOURCE_RECEIPT',pool:'NORMAL',sourceNumbers:[145,54,93,146,139,135,134,124,129,73,122],sourceRowKeys:replay.sourceRowKeys,samplerCalls:0,drawsPerformed:0,feverQuotaBefore:beforeQuota,feverQuotaAfter:localFeverSimulation.snapshot().usesRemaining,quotaUnchanged:beforeQuota===localFeverSimulation.snapshot().usesRemaining,movie:replay.movie??null,movieIndex:replay.movieIndex??null,status:replay.status,decisionSourceCounts:replay.decisionSourceCounts,identityAmbiguousSourceRowKeys:replay.identityAmbiguousSourceRowKeys,classificationDetail:replay.classification});const output=$('normal-local-output');if(output)output.textContent=JSON.stringify(window.__r14p9HeldBatchReplay,null,2);}else update();const p9r1SeedCase=r14p5MovieParams.get('p9r1SeedCase');const p9r1SeedPreset=({normalSingle93:{label:'Normal 單抽 N · 來源列 93',seed:'P9R1-NORMAL-SINGLE-93-57'},normalTenR16:{label:'Normal 10+1 R · 含來源列 16',seed:'P9R1-NORMAL-TEN-CONTAINS-16-518'},feverTenR48:{label:'Fever 10+1 R · 含來源列 48',seed:'P9R1-FEVER-TEN-CONTAINS-48-73'}})[p9r1SeedCase];if(p9r1SeedPreset&&movieSelectorP9Validation.ok){$('normal-local-advanced').open=true;$('normal-local-flow-mode').value='seeded';$('normal-local-seed').value=p9r1SeedPreset.seed;mode.value='auto';update();status.textContent='P9R1_SEEDED_REPLAY_ONLY · ENGINEERING_FIXTURE_ONLY / WEB_SIMULATION_ONLY：'+p9r1SeedPreset.label+'；固定 Seed，不自動抽卡。請操作既有流程按鈕；Fever 預設不建立或增加額度。';}}

if(r14p30P1BEnabled){
  const panel=$('p30p1b-controls'),variant=$('p30p1b-variant'),slider=$('p30p1b-alpha'),readout=$('p30p1b-alpha-value');
  if(!panel||!variant||!slider||!readout)throw Error('R14P30P1B_ENGINEERING_CONTROLS_MISSING');
  panel.hidden=false;
  if(!r14P32R2R14Enabled)$('diagnostic-mode').open=true;
  const updateInput=()=>{const activeAlpha=r14p30P1BVariant==='baseline'?0.70:r14p30P1BAlpha;variant.value=r14p30P1BVariant;slider.value=r14p30P1BAlpha.toFixed(2);slider.disabled=r14p30P1BVariant!=='f53-reference';readout.value=activeAlpha.toFixed(2);readout.textContent=activeAlpha.toFixed(2);};
  variant.addEventListener('change',()=>{r14p30P1BVariant=variant.value==='f53-reference'?'f53-reference':'baseline';updateInput();r14p30P1BInvalidate();});
  slider.addEventListener('input',()=>{const candidate=Number(slider.value);r14p30P1BAlpha=Number.isFinite(candidate)?Math.max(0.70,Math.min(0.90,candidate)):0.80;updateInput();r14p30P1BInvalidate();});
  updateInput();
}
 if(r14p30P2Enabled){
  const panel=$('p30p2-controls'),variant=$('p30p2-variant');
  if(!panel||!variant)throw Error('R14P30P2_SOURCE_BACKGROUND_CONTROLS_MISSING');
  panel.hidden=false;
  if(!r14P32R2R14Enabled)$('diagnostic-mode').open=true;
  const setVariant=requested=>{r14p30P2Variant=requested==='historical-dual'?'historical-dual':'fader-only';variant.value=r14p30P2Variant;r14p30P2Invalidate();};
  variant.addEventListener('change',()=>setVariant(variant.value));
  variant.value=r14p30P2Variant;
 }
 if(r14p30P3Enabled){$('p30p3-refresh').onclick=()=>{$('p30p3-receipt').textContent=JSON.stringify(window.__r14p30P3.snapshot(),null,2);};$('p30p3-controls').hidden=false;if(!r14P32R2R14Enabled&&!r14p5MovieEnabled)$('diagnostic-mode').open=true;$('p30p3-variant').addEventListener('change',e=>{r14p30P3Player.setVariant(e.target.value);render();});}
 window.__r14p30P2=Object.freeze({
  buildId:r14p30P2BuildId,enabled:r14p30P2Enabled,
  snapshot:()=>({buildId:r14p30P2BuildId,enabled:r14p30P2Enabled,variant:r14p30P2Variant,applicable:r14p30P2Eligible(),sourceBlockerRendered:r14p30P2UseSourceBlocker(),sessionMode:session?.mode??null,sessionPhase:session?.phase??null,background:fixture.background,movieActive,moviePending,frameSource:'GachaResultPopup/Frame UISprite Fader',frameTweenSerializedTarget:0.70,blockerSource:'InputBlocker UITexture DarkNess',blockerSerializedAlpha:blocker.UITexture.mColor[3],liveAlpha:'UNKNOWN',sourceClass:'SERIALIZED_SOURCES_WITH_CONDITIONAL_WEB_COMPOSITE',oneTimeOriginalFaderAlreadyIntegrated:true}),
  setVariant:requested=>{if(!r14p30P2Enabled)throw Error('P2_NOT_ENABLED');if(!['fader-only','historical-dual'].includes(requested))throw Error('P2_INVALID_VARIANT');r14p30P2Variant=requested;const select=$('p30p2-variant');if(select)select.value=requested;r14p30P2Invalidate();return r14p30P2Variant;}
 });
window.__r14p30P1B=Object.freeze({
 buildId:r14p30P1BBuildId,enabled:r14p30P1BEnabled,
 snapshot:()=>({buildId:r14p30P1BBuildId,enabled:r14p30P1BEnabled,variant:r14p30P1BVariant,alphaFactor:r14p30P1BAlpha,activeAlpha:r14p30P1BEligible()?(r14p30P1BVariant==='baseline'?0.70:r14p30P1BAlpha):p11D3FrameAlphaDecision(0.70).effectiveWebAlpha,applicable:r14p30P1BEligible(),appliedTweenFactor:r14p30P1BFrameTweenOverride(),baseTweenFactor:0.70,background:fixture.background,sessionMode:session?.mode??null,sessionPhase:session?.phase??null,runId:session?.metrics?.runId??null,cardCount:session?.cards?.length??0,opened:session?.cards?.filter(c=>c.openAt!==null).length??0,movieActive,classification:'WEB_VISUAL_EXPERIMENT_NOT_NATIVE_TENTIME_ALPHA'}),
 setVariant:(requested)=>{if(!r14p30P1BEnabled)throw Error('P1B only available in engineering opt-in');if(!['baseline','f53-reference'].includes(requested))throw Error('P1B_INVALID_VARIANT');r14p30P1BVariant=requested;const select=$('p30p1b-variant');if(select){select.value=requested;select.dispatchEvent(new Event('change'));}else r14p30P1BInvalidate();return r14p30P1BVariant;}
});
window.__p11D3FrameAlpha=Object.freeze({
 sourceSerializedAlpha:0.70,playerSelectedWebAlpha:P11_D3_PLAYER_SELECTED_FRAME_ALPHA,
 snapshot:()=>{const record=drawRecords.find(r=>r.component.path==='GachaResultPopup/Frame'),tween=record&&(componentsByOwner.get(record.component.owner)||[]).find(x=>x.class==='TweenAlpha'),sourceAlpha=tween?.fields.to??1,decision=p11D3FrameAlphaDecision(sourceAlpha),resultFrameActive=showing&&!movieActive&&!moviePending;return {classification:'PLAYER_SELECTED_WEB_VISUAL_ADAPTATION',sourceSerializedAlpha:sourceAlpha,playerSelectedWebAlpha:P11_D3_PLAYER_SELECTED_FRAME_ALPHA,...decision,mode:session?.mode??null,phase:session?.phase??null,runId:session?.normalRunId??session?.feverRunId??session?.metrics?.runId??null,resultFrameActive,framePathPresent:Boolean(record),frameInPopupBefore:Boolean(record&&popupBeforeRecords.includes(record)),frameComponentActive:Boolean(record&&record.chain.length&&active(record.chain)&&record.component.fields.m_Enabled!==0),lastPaint:p11D3FrameAlphaLast,p1bComparisonEligible:r14p30P1BEligible()};}
});
$('open').onclick=start;$('full-flow').onclick=()=>playFullFlow();$('flip-all').onclick=flipAll;
if(fx0304DiagnosticCandidate){$('diagnostic-mode').open=true;$('fixture').value='0';$('draw-count').value=fx0304SingleDiagnosticCandidate&&!fx0304TenTimeReplayCandidate?'1':'11';$('fx-enabled').checked=true;$('sound-enabled').checked=false;if(fx0304TenTimeReplayCandidate)$('open').textContent=`開始 11 卡 TenTime 動態診斷 · 第 ${fx0304SelectedSlotValue} 張指定 ${fx0304SelectorOverride}`;else if(fx0304SingleDiagnosticCandidate)$('open').textContent=`開始單卡 ${fx0304SelectorOverride} FX 診斷`;}
function isConfirmedFinalFeverRun(owner,state=localFeverSimulation.snapshot()){
 return isFinalLocalFeverRunConfirmEligible(owner,state,feverAutoCycleCompletedRunIds);
}
function resetFinalFeverCycle(owner,state,ruleClass='WEB_SIMULATION_AUTO_NEW_CYCLE'){
 if(!isConfirmedFinalFeverRun(owner,state))return {accepted:false,reason:'FINAL_FEVER_CYCLE_GUARD_REJECTED',before:state??localFeverSimulation.snapshot()};
 const result=localFeverSimulation.reset({ruleClass,runId:owner.feverRunId});
 if(!result.accepted)return {accepted:false,reason:result.reason??'FINAL_FEVER_CYCLE_RESET_REJECTED',before:state,after:result.state};
 feverAutoCycleCompletedRunIds.add(owner.feverRunId);if(feverAutoCycleCompletedRunIds.size>64)feverAutoCycleCompletedRunIds.delete(feverAutoCycleCompletedRunIds.values().next().value);
 return {accepted:true,runId:owner.feverRunId,before:state,after:result.state,ruleClass};
}
function resetScene({source='reset',autoCycleReset:providedCycleReset=null}={}){
 clearP10SafeRecovery();
 r14p30P3Player?.endResult(source);
 screenFxCandidate?.stop();
 const endingSession=session,feverStateBefore=localFeverSimulation.snapshot();
 luckyFeverOverlay.cancel('confirm-reset-or-return');flowGeneration++;normalR9StartGeneration++;normalR9StartPending=false;feverTenStartGeneration++;feverTenStartPending=false;normalLocalTenStartGeneration++;
 let autoCycleReset=providedCycleReset;
 if(source==='confirm'&&isConfirmedFinalFeverRun(endingSession,feverStateBefore)){
  autoCycleReset=resetFinalFeverCycle(endingSession,feverStateBefore,'WEB_SIMULATION_AUTO_NEW_CYCLE');
 }
 const tenDisplaySession=isLocalTenDisplayMode(session?.mode)?session:null,normalDrawSession=session?.mode==='normal-local-ten-draw'?session:null,feverSession=session?.mode==='local-fever-ten-display'?session:null,pendingNormalTen=normalLocalTenPendingRun,pendingSingleResume=normalLocalSingleResumePending,pendingTenResume=normalLocalTenResumePending,pendingLocal=normalLocalFullFlow.current();normalLocalTenPendingRun=null;normalLocalSingleResumePending=null;normalLocalTenResumePending=null;normalLocalTenStartPending=false;
 if(pendingLocal){normalLocalFullFlow.returnToShop(performance.now(),source==='retry'?'retry':session?.mode==='normal-local-preview'?'confirm':'reset');normalSingleLuckyFeverRuns.delete(pendingLocal.flowId);if(normalLocalLastResult?.sourceRowKey===pendingLocal.sourceRowKey){normalLocalLastResult=null;normalLocalDrawGeneration++;}if(normalLocalOutput)normalLocalOutput.textContent=`LOCAL_NORMAL_SIMULATION_RETURNED：${pendingLocal.sourceRowKey} 已返回商店；pending row 與展示卡已清除；本地模式、Seed 與影片設定保留。`;}
 if(raf)cancelAnimationFrame(raf);raf=0;movieActive=false;moviePending=false;movie.pause();movie.removeAttribute('src');movie.load();movie.controls=false;movie.hidden=true;movieSkip.hidden=true;showing=false;session=null;
 if(tenDisplaySession)$('fx-enabled').checked=Boolean(tenDisplaySession.fxWasEnabled);
 if(feverSession){if(feverSession.feverQuotaConsumed)feverTenPendingRun=null;normalLocalOutput.textContent=autoCycleReset?`${autoCycleReset.ruleClass??'WEB_SIMULATION_AUTO_NEW_CYCLE'}：最後一次 Fever 10+1 的 11 筆結果已安全結束；本地 Fever 狀態已一次性重設為 0/110，Normal 購買恢復。runId=${autoCycleReset.runId}；trigger=${source}；不代表官方伺服器重置時機。`:feverSession.feverQuotaConsumed?`LOCAL_FEVER_TENTIME_RETURNED：本次已完成的 11 筆來源列與結果卡已清除；本地額度已扣一次；不代表原生重置。`:`LOCAL_FEVER_TENTIME_RETURNED：本次畫面已清除；尚未成功扣額度的同一組 11 筆來源列予以保留，重新開始不會重抽；不代表原生重置。`;}
 else if(normalDrawSession)normalLocalOutput.textContent=`LOCAL_NORMAL_TEN_PLUS_ONE_RETURNED：${normalDrawSession.normalProgressCounted?'+11 本地進度已保留；':''}11 筆結果列與卡面已清除並返回商店；不代表伺服器抽獎。`;
 else if(pendingNormalTen)normalLocalOutput.textContent=`LOCAL_NORMAL_TEN_PLUS_ONE_CANCELLED：本次待處理 run 已取消；已抽來源列 ${pendingNormalTen.simulation.sourceRowKeys.join(' | ')} 不會轉用或重抽；本地 Fever 進度不變。`;
 else if(pendingSingleResume)normalLocalOutput.textContent=`LOCAL_NORMAL_SINGLE_RESUME_CANCELLED：同一筆 pending ${pendingSingleResume.result.sourceRowKey} 已明確丟棄；沒有重新抽樣或執行 Lucky Fever 判定。`;
 else if(pendingTenResume)normalLocalOutput.textContent=`LOCAL_NORMAL_TEN_RESUME_CANCELLED：同批 11 筆 runId=${pendingTenResume.runId} 已明確丟棄；沒有重抽或改變 Fever 進度。`;
 else if(tenDisplaySession)normalLocalOutput.textContent='R9_LOCAL_TEN_DISPLAY_RETURNED：11 張展示卡與本次來源列狀態已清除；沒有 Normal 抽樣或進度變更。';
 comparison=null;trace=[];if(autoCycleReset)trace.push({event:'web-simulation-auto-new-cycle',trigger:source==='confirm'?'final-fever-result-confirm':source,runId:autoCycleReset.runId,before:{progress:autoCycleReset.before.progress,usesRemaining:autoCycleReset.before.usesRemaining,phase:autoCycleReset.before.phase},after:{progress:autoCycleReset.after.progress,usesRemaining:autoCycleReset.after.usesRemaining,phase:autoCycleReset.after.phase},ruleClass:autoCycleReset.ruleClass??(source==='confirm'?'WEB_SIMULATION_AUTO_NEW_CYCLE':'WEB_SIMULATION_NORMAL_CYCLE_ADAPTATION')});updateItemList();renderLocalFeverSimulation();render();
}
$('reset').onclick=()=>resetScene({source:'reset'});$('confirm').onclick=()=>resetScene({source:'confirm'});$('retry').onclick=()=>{const resultUi=resultFeverRetrySnapshot();if(!showing||movieActive||moviePending||session?.phase!=='complete'||!resultUi.hitTargetVisible||$('retry').disabled)return;luckyFeverOverlay.cancel('retry');
  if(session?.mode==='local-fever-ten-display'&&resultUi.resultRoute==='FEVER_EXHAUSTED_NORMAL_RETRY'){const endingSession=session,cycle=resetFinalFeverCycle(endingSession,localFeverSimulation.snapshot(),'WEB_SIMULATION_NORMAL_CYCLE_ADAPTATION');if(!cycle.accepted||cycle.after?.normalSingleAvailable!==true){setStatus(`WEB_SIMULATION_NORMAL_CYCLE_ADAPTATION_BLOCKED：${cycle.reason??'NORMAL_CYCLE_NOT_AVAILABLE'}；未清除原結果或抽樣。`);render();return;}resetScene({source:'fever-exhausted-normal-retry',autoCycleReset:cycle});void startNormalLocalTenFullFlow();return;}
  if(session?.mode==='normal-local-ten-draw'&&resultUi.resultRoute==='NORMAL_RETRY'){resetScene({source:'retry'});void startNormalLocalTenFullFlow();return;}
  if(session?.mode==='normal-local-preview'){resetScene({source:'retry'});startNormalLocalFullFlow();return;}
  if(handleLocalFeverRetry())return;
  if(session?.mode==='normal-local-ten-display'){resetScene();return;}
  if(session?.fullFlow){playFullFlow(session.count);return;}
  if(session?.mode==='single'){startSingle();return;}
  $('fixture').value=$('fixture').value==='0'?'1':'0';updateItemList();start();
};
 $('canvas-resolution-probe').addEventListener('change',event=>setCanvasResolutionProbe(event.currentTarget.checked));
 $('visual-quality-measure').addEventListener('click',measureStaticRender);
 $('pool-tab-normal').addEventListener('click',writeVisualQualityReceipt);$('pool-tab-fever').addEventListener('click',writeVisualQualityReceipt);$('pool-grid').addEventListener('load',event=>{if(event.target?.tagName==='IMG'&&event.target.dataset.visualQualityProbe==='true')writeVisualQualityReceipt();},true);
 $('compare-apply').onclick=()=>{if(session?.phase!=='complete')return;comparison={index:Number($('compare-card').value),ageMs:Math.max(0,Math.min(3000,Number($('compare-age').value)||0))};render();};
 $('compare-clear').onclick=()=>{comparison=null;render();};
let normalLocalSimulator=null;
let normalLocalMapRows=[];
let normalLocalLastResult=null;
let normalLocalDrawGeneration=0;
let normalR9TenDisplayFixture=null;
let normalR9TenDisplayReady=false;
let normalR9StartPending=false;
let normalR9StartGeneration=0;
let normalLocalTenStartPending=false;
let normalLocalTenStartGeneration=0;
let normalLocalTenRunSequence=0;
let normalLocalTenPendingRun=null;
let normalLocalSingleResumePending=null;
let normalLocalTenResumePending=null;
let normalLocalOutput=$('normal-local-output');
function formatNormalLocalResult(result){
 const payload=result.resultPayload;
 const visual=normalLocalVisualDisplayContractGate(result);
 const r6Visual=normalLocalR6VisualDisplayContractGate(result);
 return JSON.stringify({
  classification:result.classification,
  mode:result.mode,
  pool:result.pool,
  selectedRow:{sourceRowKey:result.sourceRowKey,sourceSheet:result.officialSourceSheet,sourceRow:result.officialSourceRow,name:result.announcementName,officialProbabilityPercent:`${result.officialProbabilityPercentRaw}%`,officialExactFraction:result.officialExactFractionRaw,ticket:`${result.ticket}/${result.totalTickets}`},
  identity:result.identity,
  payloadStatus:result.payloadStatus,
  resultPayload:payload?{classification:payload.classification,item:payload.item,icon:payload.icon,cardPresentation:payload.cardPresentation}:null,
  staticCardPreview:normalLocalCardPreviewStatus(result),
  visualAdmission:visual?{class:'WEB_VISUAL_DISPLAY_ONLY',displayStyle:'MYTHIC_STYLE_PLAYER_VISUAL_ONLY',liveResultGrade:'UNKNOWN',resultPayloadRemainsNull:true,fx:'OFF'}:r6Visual?{class:'WEB_VISUAL_DISPLAY_ONLY',displayStyle:'ANNOUNCEMENT_GRADE_WEB_STYLE_ONLY',announcementGrade:r6Visual.card.announcementGrade,effectiveResultGrade:'UNKNOWN',liveResultGrade:'UNKNOWN',resultPayloadRemainsNull:true,partText:'OMITTED',fx:'OFF',nativeParity:'NOT_CLAIMED'}:normalLocalVisualContractByRowKey.has(result.sourceRowKey)?{class:'WEB_VISUAL_DISPLAY_ONLY',gate:'WEB_VISUAL_CONTRACT_SOURCE_JOIN_FAILED'}:normalLocalR6VisualContractByRowKey.has(result.sourceRowKey)?{class:'WEB_VISUAL_DISPLAY_ONLY',gate:'NORMAL_R6_VISUAL_CONTRACT_SOURCE_JOIN_FAILED'}:null,
  iconAdmissionEvidence:r6Visual?.icon.evidenceClass??normalLocalPreviewIconByRowKey.get(result.sourceRowKey)?.evidence??null,
  unresolvedReason:result.unresolvedReason,
  noFallbackOrRedraw:true,
  serverRng:false,
  purchaseOrSceneMutation:false,
 },null,2);
}
async function initializeNormalLocalSimulation(){
 const randomButton=$('normal-local-random'),seedButton=$('normal-local-seeded'),flowMode=$('normal-local-flow-mode');
 try{
  const [poolResponse,mapResponse]=await Promise.all([fetch('data/official-pools.json?r31r5=20261105'),fetch('data/normal-local-result-map.json?r31r5=20261105')]);
  if(!poolResponse.ok||!mapResponse.ok)throw Error(`HTTP_${poolResponse.status}_${mapResponse.status}`);
  const [poolData,mapData]=await Promise.all([poolResponse.json(),mapResponse.json()]);
  if(mapData.schema!=='CrystalChest.NormalLocalResultMap.v1')throw Error('RESULT_MAP_SCHEMA_MISMATCH');
  if(!Array.isArray(mapData.rows)||mapData.rows.length!==134)throw Error('NORMAL_RESULT_MAP_NOT_134');
  normalLocalMapRows=mapData.rows;
  const normal=poolData.pools.find(candidate=>candidate.pool==='NORMAL');
  if(!normal||normal.entries.length!==134)throw Error('NORMAL_STATIC_POOL_NOT_134');
  normalLocalPoolEntryByRowKey=new Map(normal.entries.map(row=>[row.officialSourceRowKey,row]));
  normalLocalSimulator=createNormalLocalSimulator(normal.entries,mapData.rows);
  try{
   const fever=poolData.pools.find(candidate=>candidate.pool==='FEVER');
   if(!fever||fever.entries.length!==134||fever.officialPercentTotalRaw!=='100.000')throw Error('FEVER_STATIC_POOL_NOT_134_OR_100_PERCENT');
   feverLocalPoolEntryByRowKey=new Map(fever.entries.map(row=>[row.officialSourceRowKey,row]));
   feverLocalSimulator=createFeverLocalSimulator(fever.entries,feverLocalVisualAdmission.rows);
   if(feverLocalSimulator.table.total!==100000n)throw Error(`FEVER_TICKET_TOTAL_UNEXPECTED:${feverLocalSimulator.table.total}`);
  }catch(feverError){feverLocalSimulator=null;normalLocalOutput.textContent=`FEVER_LOCAL_TEN_DISABLED：${String(feverError)}；R8/R9 Normal 流程保持獨立。`;}
  randomButton.disabled=false;seedButton.disabled=false;flowMode.disabled=false;
  if(feverLocalSimulator)normalLocalOutput.textContent=`就緒：NORMAL ${normal.entries.length} 列／${normalLocalSimulator.table.total.toString()} 票；FEVER ${feverLocalSimulator.table.rows.length} 列／${feverLocalSimulator.table.total.toString()} 票。Fever 視覺准入：${feverLocalVisualAdmission.counts.byVisualStatus.CARD_DISPLAY_ADMITTED_WEB_ONLY} Web 卡面、${feverLocalVisualAdmission.counts.byVisualStatus.ROW_ONLY_DIAGNOSTIC} 中性診斷。兩池策略都不是伺服器 RNG。`;
  try{
   const fixtureResponse=await fetch('data/normal-r9-ten-display-fixture.json?r31r5=20261105');if(!fixtureResponse.ok)throw Error(`R9_FIXTURE_HTTP_${fixtureResponse.status}`);
   const fixtureData=await fixtureResponse.json();if(fixtureData.schema!=='CrystalChest.NormalR9.TenDisplayFixture.v1'||fixtureData.classification!=='LOCAL_NORMAL_TEN_DISPLAY_TEST_NOT_OFFICIAL_DRAW'||fixtureData.pool!=='NORMAL'||fixtureData.drawCount!==11||!Array.isArray(fixtureData.resultOrder)||fixtureData.resultOrder.length!==11||!Array.isArray(fixtureData.displayOrder)||fixtureData.displayOrder.length!==11)throw Error('R9_FIXTURE_SCHEMA_INVALID');
   const resultKeys=fixtureData.resultOrder.map(row=>row.sourceRowKey),displayOrder=fixtureData.displayOrder;if(new Set(resultKeys).size!==11||new Set(displayOrder).size!==11||displayOrder.some(index=>!Number.isInteger(index)||index<0||index>=11))throw Error('R9_FIXTURE_ORDER_OR_KEYS_INVALID');
   const normalByKey=new Map(normal.entries.map(row=>[row.officialSourceRowKey,row]));
   for(const row of fixtureData.resultOrder){const official=normalByKey.get(row.sourceRowKey),adapter=mapData.rows.find(candidate=>candidate.sourceRowKey===row.sourceRowKey),bucket=normalLocalSimulator.table.buckets.find(candidate=>candidate.sourceRowKey===row.sourceRowKey);if(!official||!adapter||!bucket||official.announcementName!==row.expectedName||official.officialProbabilityPercentRaw!==row.expectedOfficialProbabilityPercentRaw)throw Error(`R9_FIXTURE_ROW_JOIN_FAILED:${row.sourceRowKey}`);const result=normalLocalSimulator.resultAtTicket(bucket.start),plan=normalLocalCardPresentation(result),admission=plan?.admissionClass||'SOURCE_BOUND_STATIC_PREVIEW';if(result.sourceRowKey!==row.sourceRowKey||!plan||admission!==row.expectedAdmissionClass||(row.expectedPreviewKind&&plan.previewKind!==row.expectedPreviewKind))throw Error(`R9_FIXTURE_PRESENTATION_GATE_FAILED:${row.sourceRowKey}`);if(row.expectedAdmissionClass==='WEB_VISUAL_DISPLAY_ONLY'&&(result.resultPayload!==null||plan.displayOnly!==true))throw Error(`R9_WEB_ONLY_BOUNDARY_FAILED:${row.sourceRowKey}`);if(row.expectedAdmissionClass==='SOURCE_BOUND_STATIC_PREVIEW'&&(!result.resultPayload?.item||plan.displayOnly===true))throw Error(`R9_STATIC_PAYLOAD_GATE_FAILED:${row.sourceRowKey}`);}
   normalR9TenDisplayFixture=fixtureData;normalR9TenDisplayReady=true;
  }catch(r9Error){normalR9TenDisplayReady=false;normalLocalOutput.textContent+=`\nR9_LOCAL_TEN_DISPLAY_DISABLED：${String(r9Error)}`;}
  render();
 }catch(error){
  normalLocalOutput.textContent=`LOCAL_NORMAL_SIMULATION_DISABLED\n來源或 payload 對照驗證失敗：${String(error)}`;
 }
}
async function startNormalR9TenDisplay(){
 if(!normalR9TenDisplayReady||!normalR9TenDisplayFixture||!normalLocalSimulator){normalLocalOutput.textContent='NORMAL_R9_TEN_DISPLAY_DISABLED：固定 11 列展示 Fixture 尚未通過來源列與卡片准入檢查。';return;}
 if(normalR9StartPending||normalLocalTenStartPending||normalLocalTenPendingRun||showing||movieActive||moviePending||normalLocalFullFlow.current()){normalLocalOutput.textContent='NORMAL_R9_TEN_DISPLAY_BLOCKED_SCENE_ACTIVE：先返回商店；本次沒有抽樣或覆蓋目前流程。';return;}
 const generation=++normalR9StartGeneration;normalR9StartPending=true;render();
 try{
  const resultCards=await Promise.all(normalR9TenDisplayFixture.resultOrder.map(async fixtureRow=>{
   const bucket=normalLocalSimulator.table.buckets.find(candidate=>candidate.sourceRowKey===fixtureRow.sourceRowKey);if(!bucket)throw Error(`R9_BUCKET_NOT_FOUND:${fixtureRow.sourceRowKey}`);
   const result=normalLocalSimulator.resultAtTicket(bucket.start),plan=normalLocalCardPresentation(result),admission=plan?.admissionClass||'SOURCE_BOUND_STATIC_PREVIEW';
   if(result.sourceRowKey!==fixtureRow.sourceRowKey||result.announcementName!==fixtureRow.expectedName||result.officialProbabilityPercentRaw!==fixtureRow.expectedOfficialProbabilityPercentRaw||admission!==fixtureRow.expectedAdmissionClass||(fixtureRow.expectedPreviewKind&&plan?.previewKind!==fixtureRow.expectedPreviewKind))throw Error(`R9_RESULT_CONTRACT_CHANGED:${fixtureRow.sourceRowKey}`);
   if(admission==='WEB_VISUAL_DISPLAY_ONLY'&&(result.resultPayload!==null||plan.displayOnly!==true||plan.gradeEvidence==null))throw Error(`R9_WEB_ONLY_PAYLOAD_BOUNDARY_FAILED:${fixtureRow.sourceRowKey}`);
   if(admission==='SOURCE_BOUND_STATIC_PREVIEW'&&(!result.resultPayload?.item||plan.displayOnly===true))throw Error(`R9_STATIC_RESULT_CONTRACT_FAILED:${fixtureRow.sourceRowKey}`);
   const [frontImage,gradeImage,iconImage]=await Promise.all([image(plan.front.file),image(plan.grade.file),image(plan.iconPath)]);
   return {result,plan,item:result.resultPayload?.item??null,frontImage,gradeImage,iconImage};
  }));
  if(generation!==normalR9StartGeneration||!normalR9StartPending)return;
  if(showing||movieActive||moviePending||normalLocalFullFlow.current())throw Error('R9_SCENE_BECAME_ACTIVE_DURING_ASSET_LOAD');
  const fxWasEnabled=$('fx-enabled').checked;$('fx-enabled').checked=false;releaseFXFrames(true);$('backs').checked=false;comparison=null;
  const resultOrder=resultCards.map(record=>record.result.sourceRowKey),displayOrder=[...normalR9TenDisplayFixture.displayOrder];
  normalLocalOutput.textContent=JSON.stringify({classification:'LOCAL_NORMAL_TEN_DISPLAY_TEST_NOT_OFFICIAL_DRAW',fixture:'data/normal-r9-ten-display-fixture.json?r31r5=20261105',officialServerDraw:false,normalSamplerDraws:0,resultOrder,displayOrder,notes:['固定 sourceRowKey 逐列取 bucket.start 作 deterministic adapter；沒有呼叫 drawRandom/drawSeeded。','displayOrder 是獨立 Web mapping；不模擬語義尚未閉合的原生 ShuffleItem。','R5/R6 保持 resultPayload=null、liveResultGrade=UNKNOWN；FX OFF。']},null,2);
  startTen({localDisplay:{resultCards,resultOrder,displayOrder,fxWasEnabled}});
 }catch(error){if(generation===normalR9StartGeneration){normalLocalOutput.textContent=`NORMAL_R9_TEN_DISPLAY_NOT_STARTED：${String(error)}；不抽樣、不重抽、不代換來源列。`;}}
 finally{if(generation===normalR9StartGeneration){normalR9StartPending=false;render();}}
}
async function loadNormalLocalTenResultCards(simulation){
 return Promise.all(simulation.results.map(async result=>{
  const plan=normalLocalCardPresentation(result);
  if(!plan)return {result,plan:null,item:null,frontImage:null,gradeImage:null,iconImage:null,renderState:'ROW_ONLY_DIAGNOSTIC',visualReason:normalLocalCardPreviewStatus(result)};
  const errors=[];
  const load=async(file,label)=>{try{return await image(file);}catch(error){errors.push(`${label}:${String(error)}`);return null;}};
  const [frontImage,gradeImage,iconImage]=await Promise.all([load(plan.front.file,'front'),load(plan.grade.file,'grade'),load(plan.iconPath,'icon')]);
  const renderState=frontImage&&gradeImage&&iconImage?'CARD_READY':'ASSET_LOAD_FAILED';
  return {result,plan,item:result.resultPayload?.item??null,frontImage,gradeImage,iconImage,renderState,visualReason:errors.length?errors.join(' | '):null};
 }));
}
async function launchNormalLocalTenPending(pending){
 const movieKey=pending.movieKey,movieAsset=nonFxAssets.movieSelection.movies[movieKey];
 if(!movieAsset){normalLocalOutput.textContent=`LOCAL_NORMAL_TEN_PLUS_ONE_BLOCKED_MOVIE_FIXTURE：找不到 ${movieKey} 影片 Fixture；同批 11 筆仍保留，可選 N/H/R 後再接續。`;normalLocalTenResumePending=pending;return;}
 p12P8Prewarm('normal-local-ten-movie-pending');
 const generation=++normalLocalTenStartGeneration;pending.generation=generation;pending.phase='preparing';
 pending.resultCardsPromise=loadNormalLocalTenResultCards(pending.simulation);
 normalLocalTenPendingRun=pending;normalLocalTenStartPending=true;
 const resultOrder=[...pending.simulation.sourceRowKeys],displayOrder=Array.from({length:11},(_,index)=>index);
 normalLocalOutput.textContent=JSON.stringify({classification:'WEB_SIMULATION_ONLY',runId:pending.runId,pool:'NORMAL',strategy:pending.simulation.strategy,mode:pending.mode,seed:pending.seed,drawCount:11,withReplacement:true,normalizationApplied:false,officialServerDraw:false,rerollOrSubstitution:false,liveResultGrade:'UNKNOWN',movieFixture:{key:movieKey,selection:pending.movieSelection.status,movieSelector:pending.movieSelection},resultOrder,selectedRows:pending.simulation.results.map(result=>({sourceRowKey:result.sourceRowKey,sourceSheet:result.officialSourceSheet,sourceRow:result.officialSourceRow,announcementName:result.announcementName,officialProbabilityPercentRaw:result.officialProbabilityPercentRaw,officialExactFractionRaw:result.officialExactFractionRaw,payloadStatus:result.payloadStatus,cardPresentation:normalLocalCardPreviewStatus(result)})),displayOrder,feverProgress:'AFTER_ALL_11_REVEALED_AND_NO_CARD_ASSET_LOAD_FAILURE',resumeClassification:pending.resumeClassification??null},null,2);
 trace=[{event:pending.resumeClassification?'normal-local-ten-manual-resume':'normal-local-ten-plus-one-sampled',at:performance.now(),runId:pending.runId,attemptId:pending.attemptId??null,mode:pending.mode,seed:pending.seed,pool:'NORMAL',resultOrder:[...resultOrder],drawCount:11,withReplacement:true,classification:'WEB_SIMULATION_ONLY',officialServerDraw:false,movieSelection:pending.movieSelection,samplerCalls:pending.samplerCalls??1}];
 $('fx-enabled').checked=false;releaseFXFrames(true);$('backs').checked=false;comparison=null;movie.dataset.finishCount='0';movie.dataset.finishGuardHits='0';moviePending=true;renderLocalFeverSimulation();render();
 try{
  const audioPreparation=$('sound-enabled').checked?await prepareAudioFromGesture():{status:'sound-disabled'};
  if(generation!==normalLocalTenStartGeneration||normalLocalTenPendingRun!==pending)return;
  if(showing||movieActive||normalR9StartPending||feverTenStartPending||normalLocalFullFlow.current())throw Error('NORMAL_TEN_SCENE_BECAME_ACTIVE_DURING_PREPARE');
  if(audioPreparation.status==='unavailable')trace.push({event:'normal-local-ten-audio-preparation-failed',at:performance.now(),message:audioPreparation.error||null});
  pending.phase='movie';moviePending=false;movieActive=true;movie.src=movieAsset.file;movie.controls=false;movie.hidden=false;movieSkip.hidden=false;movie.currentTime=0;movie.load();
  trace.push({event:'normal-local-ten-movie-start',at:performance.now(),runId:pending.runId,attemptId:pending.attemptId??null,movieKey,explicitFixture:true,sourceRowKeys:[...resultOrder],samplerCalls:pending.samplerCalls??1});render();
  const playPromise=movie.play();if(playPromise&&typeof playPromise.catch==='function')playPromise.catch(error=>{trace.push({event:'normal-local-ten-movie-play-rejected',at:performance.now(),runId:pending.runId,message:String(error)});setStatus(`11 筆 Normal 結果已固定；瀏覽器未自動播放 ${movieKey}，可按「跳過」進入同一組結果。`);});
 }catch(error){if(generation===normalLocalTenStartGeneration&&normalLocalTenPendingRun===pending){pending.phase='failed';movieActive=false;moviePending=false;movie.pause();movie.hidden=true;movieSkip.hidden=true;normalLocalTenStartPending=false;normalLocalOutput.textContent+=`\n\nLOCAL_NORMAL_TEN_PLUS_ONE_NOT_STARTED：${String(error)}；抽樣來源列已保留於本次流程，不重抽、不代換。按 Reset 結束這次流程後可重新開始。`;setStatus('Normal 10+1 本地流程未啟動；來源列保留，請按 Reset 清除這次流程。');renderLocalFeverSimulation();render();}}
}
async function continueNormalLocalTenWithoutMovie(pending){
 if(!r14p10PlayerEnabled||!pending||pending!==normalLocalTenResumePending)return;
 normalLocalTenResumePending=null;pending.p10NoVideoRecovery=true;pending.movieKey=null;pending.resumeClassification='P10_SAME_BATCH_CONTINUE_WITHOUT_VIDEO';
 const generation=++normalLocalTenStartGeneration;pending.generation=generation;pending.phase='movie';pending.resultCardsPromise=loadNormalLocalTenResultCards(pending.simulation);normalLocalTenPendingRun=pending;normalLocalTenStartPending=true;
 trace.push({event:'p10-normal-ten-no-video-recovery',at:performance.now(),runId:pending.runId,pool:'NORMAL',sourceRowKeys:[...pending.simulation.sourceRowKeys],samplerCalls:0,rerollOrSubstitution:false,selectorStatus:'UNRESOLVED_INPUT'});
 normalLocalOutput.textContent=JSON.stringify({classification:'WEB_CONDITIONAL_MOVIE_SELECTOR_SAFE_RECOVERY',runId:pending.runId,pool:'NORMAL',sourceRowKeys:[...pending.simulation.sourceRowKeys],samplerCalls:1,drawRetained:true,rerollOrSubstitution:false,movie:null,reason:pending.movieSelection?.reason??'SELECTOR_UNRESOLVED',nextAction:'CONTINUED_SAME_RESULT_BATCH_WITHOUT_VIDEO'},null,2);
 updateP10NoMovieRecovery(pending.runId,pending.movieSelection?.reason??'SELECTOR_UNRESOLVED');await finishNormalLocalTenFlow(pending,'selector-unresolved-safe-recovery');
}
async function startNormalLocalTenFullFlow(){
 if(!normalLocalSimulator){normalLocalOutput.textContent='LOCAL_NORMAL_SIMULATION_DISABLED';return;}
 if(!localFeverSimulation.snapshot().normalSingleAvailable){normalLocalOutput.textContent='LOCAL_NORMAL_TEN_PLUS_ONE_BLOCKED_BY_LOCAL_FEVER：本地 Fever 測試狀態下不執行 Normal 抽樣；可重設本地狀態。';return;}
 if(normalLocalTenResumePending){
  const pending=normalLocalTenResumePending;
   if(r14p10PlayerEnabled&&pending.p10NoVideoRecovery){await continueNormalLocalTenWithoutMovie(pending);return;}
  if(!r14p5MovieEnabled||$('movie-selector-p5-mode')?.value!=='manual'){$('movie-selector-p5-status').textContent='Normal 10+1 同批結果仍保留；請將「選片模式」改為手動 N/H/R，選擇影片後再按此按鈕接續。';setStatus('NORMAL_TEN_UNRESOLVED_PENDING：切換明示手動 N/H/R 後，按 Normal 10+1 同一按鈕接續原 11 筆；未重抽。');render();return;}
  const resumed=resumeMovieSelectorP6Manually(pending,$('movie-source')?.value||'N');
  if(resumed.status!=='MANUAL_RESUME'){$('movie-selector-p5-status').textContent=`同批 11 筆仍保留；接續被拒絕：${resumed.status}。`;return;}
  const movieSelection=resolveMovieP5ForRows('NORMAL',resumed.results);
  if(movieSelection.status!=='MANUAL_OVERRIDE'){setStatus('NORMAL_TEN_MANUAL_RESUME_BLOCKED：尚未取得明示手動 N/H/R；同批結果保留。');return;}
  pending.movieKey=movieSelection.movie;pending.movieSelection=movieSelection;pending.resumeClassification='ENGINEERING_SAME_RUN_MANUAL_RESUME';pending.resumedAt=performance.now();normalLocalTenResumePending=null;
  trace.push({event:'normal-local-ten-unresolved-manual-resume',at:pending.resumedAt,runId:pending.runId,attemptId:pending.attemptId,sourceRowKeys:[...pending.sourceRowKeys],movieKey:pending.movieKey,samplerCalls:pending.samplerCalls,resultReferencePreserved:resumed.resultReferencePreserved});
  await launchNormalLocalTenPending(pending);return;
 }
 if(normalLocalTenStartPending||normalLocalTenPendingRun||normalLocalSingleResumePending||showing||movieActive||moviePending||normalR9StartPending||feverTenStartPending||normalLocalFullFlow.current()){setStatus('LOCAL_NORMAL_TEN_PLUS_ONE_BLOCKED_SCENE_ACTIVE：先完成或返回目前流程；本次沒有抽樣。');return;}
 const luckyFeverBefore=localFeverSimulation.snapshot(),mode=$('normal-local-flow-mode').value==='seeded'?'seeded':'random',seed=$('normal-local-seed').value.trim();
 if(mode==='seeded'&&!seed){setStatus('LOCAL_NORMAL_TEN_PLUS_ONE_BLOCKED_EMPTY_SEED：請在進階測試設定輸入 Seed；未抽樣。');return;}
 let simulation;try{simulation=mode==='seeded'?normalLocalSimulator.drawSeededMany(seed,11):normalLocalSimulator.drawRandomMany(11);}catch(error){setStatus(`LOCAL_NORMAL_TEN_PLUS_ONE_SAMPLER_ERROR：${String(error)}；未建立流程。`);return;}
 const attemptId=`normal-local-ten-attempt-${Date.now()}-${++normalLocalTenRunSequence}`,runId=attemptId.replace('attempt-',''),sampledAt=performance.now(),movieSelection=resolveMovieP5ForRows('NORMAL',simulation.results);window.__r14p5LastMovieSelection=movieSelection;
 if(movieSelection.status==='UNRESOLVED_INPUT'){
  const pending=createMovieSelectorP6Pending({pool:'NORMAL',flow:'ten',mode,seed:mode==='seeded'?seed:null,runId,flowId:attemptId,volume:11,results:simulation.results,sampledAt});Object.assign(pending,{simulation,attemptId,luckyFeverBefore,fxWasEnabled:$('fx-enabled').checked,movieSelection,phase:'manual-resume-required'});normalLocalTenResumePending=pending;
   recordP10MovieDecision({pool:'NORMAL',runId,results:simulation.results,selection:movieSelection});
   if(r14p10PlayerEnabled){updateP10NoMovieRecovery(runId,movieSelection.reason??'SELECTOR_UNRESOLVED');showP10SafeRecovery({kind:'normal-ten',runId,pool:'NORMAL',sourceRowKeys:simulation.sourceRowKeys,continueSameBatch:()=>void continueNormalLocalTenWithoutMovie(pending)});normalLocalOutput.textContent=JSON.stringify({classification:'WEB_CONDITIONAL_MOVIE_SELECTOR_SAFE_RECOVERY_PENDING',runId,pool:'NORMAL',sourceRowKeys:[...simulation.sourceRowKeys],samplerCalls:1,drawRetained:true,rerollOrSubstitution:false,movie:null,reason:movieSelection.reason??'SELECTOR_UNRESOLVED'},null,2);return;}
  normalLocalOutput.textContent=JSON.stringify({classification:'ENGINEERING_SAME_RUN_MANUAL_RESUME_PENDING',runId,attemptId,pool:'NORMAL',mode,seed:pending.seed,volume:11,movieSelection,sourceRowKeys:[...pending.sourceRowKeys],samplerCalls:1,drawRetained:true,rerollOrSubstitution:false,feverQuotaUnchanged:true,nextAction:'Switch to manual N/H/R, select a movie and press Normal 10+1 again.'},null,2);
  $('movie-selector-p5-status').textContent='自動選片未解；同一批 11 筆、順序、Seed 與 runId 已保留。切換手動 N/H/R 後按 Normal 10+1 接續。';setStatus('NORMAL_TEN_UNRESOLVED_PENDING：原 11 筆已保留，未重抽；切回明示手動 N/H/R 後可接續。');render();return;
 }
  recordP10MovieDecision({pool:'NORMAL',runId,results:simulation.results,selection:movieSelection});
 const movieKey=movieSelection.movie,pending={attemptId,runId,mode,seed:mode==='seeded'?seed:null,movieKey,movieSelection,simulation,luckyFeverBefore,resultCardsPromise:null,fxWasEnabled:$('fx-enabled').checked,generation:null,phase:'preparing',samplerCalls:1};
 await launchNormalLocalTenPending(pending);
}
async function finishNormalLocalTenFlow(pending,trigger){
 if(!pending||pending!==normalLocalTenPendingRun||pending.phase!=='movie')return;
 pending.phase='result-loading';normalLocalTenStartPending=true;
 trace.push({event:'normal-local-ten-movie-finish',at:performance.now(),runId:pending.runId,trigger,movieKey:pending.movieKey,resultOrder:[...pending.simulation.sourceRowKeys]});setStatus(`影片結束（${trigger}）；載入並保留同一組 11 筆 Normal 來源列。`);render();
 try{
  const resultCards=await pending.resultCardsPromise;
  if(pending!==normalLocalTenPendingRun||pending.generation!==normalLocalTenStartGeneration)return;
  const resultOrder=resultCards.map(record=>record.result.sourceRowKey),displayOrder=Array.from({length:11},(_,index)=>index),failed=resultCards.filter(record=>record.renderState==='ASSET_LOAD_FAILED').map(record=>record.result.sourceRowKey);
  if(showing||movieActive||moviePending||normalR9StartPending||feverTenStartPending||normalLocalFullFlow.current())throw Error('NORMAL_TEN_SCENE_BECAME_ACTIVE_DURING_RESULT_LOAD');
   const display={runId:pending.runId,simulation:pending.simulation,resultCards,resultOrder,displayOrder,fxWasEnabled:pending.fxWasEnabled,luckyFeverBefore:pending.luckyFeverBefore,mode:pending.mode,seed:pending.seed};
  normalLocalTenPendingRun=null;normalLocalTenStartPending=false;
  trace.push({event:'normal-local-ten-result-bound',at:performance.now(),runId:pending.runId,pool:'NORMAL',resultOrder:[...resultOrder],displayOrder:[...displayOrder],failedRows:failed,classification:'WEB_SIMULATION_ONLY',liveResultGrade:'UNKNOWN'});
  normalLocalOutput.textContent=JSON.stringify({classification:'WEB_SIMULATION_ONLY',runId:pending.runId,pool:'NORMAL',strategy:pending.simulation.strategy,mode:pending.mode,drawCount:11,withReplacement:true,normalizationApplied:false,officialServerDraw:false,rerollOrSubstitution:false,resultOrder,displayOrder,displayStates:resultCards.map(record=>({sourceRowKey:record.result.sourceRowKey,renderState:record.renderState,cardAdmission:record.plan?.admissionClass??'ROW_ONLY_DIAGNOSTIC',reason:record.visualReason})),liveResultGrade:'UNKNOWN',fx:'OFF',feverProgress:'AFTER_ALL_11_REVEALED_AND_NO_CARD_ASSET_LOAD_FAILURE'},null,2);
  startTen({fullFlow:true,normalLocalDraw:display});
 }catch(error){if(pending===normalLocalTenPendingRun&&pending.generation===normalLocalTenStartGeneration){pending.phase='failed';normalLocalTenStartPending=false;normalLocalOutput.textContent+=`\n\nLOCAL_NORMAL_TEN_RESULT_NOT_STARTED：${String(error)}；保留原始 11 筆來源列，不重抽、不代換。按 Reset 結束這次流程。`;setStatus('Normal 10+1 結果卡未能載入；來源列未替換，本次不增加 Fever 進度。');renderLocalFeverSimulation();render();}}
}
async function startLocalFeverTenSimulation(){
 const feverState=localFeverSimulation.snapshot();
 if(feverState.phase!=='fever-test-active'||feverState.usesRemaining<=0){setStatus('LOCAL_FEVER_TENTIME_BLOCKED_NO_QUOTA：沒有可用的本地 Fever 測試額度；未抽樣。');return;}
 if(!feverLocalSimulator){setStatus('LOCAL_FEVER_TENTIME_BLOCKED_ADMISSION：Fever 池／視覺准入尚未完成；未抽樣。');return;}
 if(feverTenStartPending||normalLocalTenStartPending||normalLocalTenPendingRun||showing||movieActive||moviePending||normalR9StartPending||normalLocalFullFlow.current()){setStatus('LOCAL_FEVER_TENTIME_BLOCKED_SCENE_ACTIVE：先返回商店；未抽樣。');return;}
 const mode=$('normal-local-flow-mode').value==='seeded'?'seeded':'random',seed=$('normal-local-seed').value.trim();
 if(mode==='seeded'&&!seed){setStatus('LOCAL_FEVER_TENTIME_BLOCKED_EMPTY_SEED：請在進階測試設定輸入 Seed；未抽樣。');return;}
 const manualFeverMovieKey=$('movie-source').value;
  let pendingRun=feverTenPendingRun;
  if(!pendingRun){let simulation;try{simulation=mode==='seeded'?feverLocalSimulator.drawSeededTen(`${seed}|FEVER_TEN`):feverLocalSimulator.drawRandomTen();}catch(error){setStatus(`LOCAL_FEVER_TENTIME_SAMPLER_ERROR：${String(error)}；未建立流程。`);return;}pendingRun={simulation,runId:`fever-local-${Date.now()}-${++feverTenRunSequence}`,displayOrder:Array.from({length:11},(_,i)=>i),resultOrder:[...simulation.sourceRowKeys],fxWasEnabled:$('fx-enabled').checked,resultCards:null};feverTenPendingRun=pendingRun;}
  const movieSelection=pendingRun.movieSelection??resolveMovieP5ForRows('FEVER',pendingRun.simulation.results);window.__r14p5LastMovieSelection=movieSelection;
  if(movieSelection.status==='UNRESOLVED_INPUT'&&!pendingRun.continueWithoutMovie){recordP10MovieDecision({pool:'FEVER',runId:pendingRun.runId,results:pendingRun.simulation.results,selection:movieSelection});normalLocalOutput.textContent=JSON.stringify({classification:'WEB_CONDITIONAL_MOVIE_SELECTOR_SAFE_RECOVERY_PENDING',runId:pendingRun.runId,pool:'FEVER',movieSelection,sourceRowKeys:pendingRun.resultOrder,drawRetainedForThisAttempt:true,quotaUnchanged:true,rerollOrSubstitution:false},null,2);if(r14p10PlayerEnabled){updateP10NoMovieRecovery(pendingRun.runId,movieSelection.reason??'SELECTOR_UNRESOLVED');showP10SafeRecovery({kind:'fever-ten',runId:pendingRun.runId,pool:'FEVER',sourceRowKeys:pendingRun.resultOrder,continueSameBatch:()=>{pendingRun.continueWithoutMovie=true;void startLocalFeverTenSimulation();}});return;}$('movie-selector-p5-status').textContent='自動選片來源有未解列；已保留 Fever 抽樣且未扣額度。切回手動模式再啟動，沿用同一組已保留結果。';setStatus('Movie Selector P5：此組 Fever 來源列含未准入 Item；自動選片 fail-closed，結果列已保留，額度未扣。');return;}
 pendingRun.movieSelection=movieSelection;
  recordP10MovieDecision({pool:'FEVER',runId:pendingRun.runId,results:pendingRun.simulation.results,selection:movieSelection});
  const useMovie=!pendingRun.continueWithoutMovie&&r14p29P1Enabled&&(['CANDIDATE','MANUAL_OVERRIDE'].includes(movieSelection.status)),feverMovieKey=useMovie?movieSelection.movie:null,feverMovieAsset=useMovie?nonFxAssets.movieSelection.movies[feverMovieKey]:null;if(useMovie&&!feverMovieAsset){setStatus('LOCAL_FEVER_TENTIME_BLOCKED_MOVIE_FIXTURE：N/H/R 原片 Fixture 無效；未抽樣、未扣額度。');return;}p12P8Prewarm('fever-ten-flow-start');
  const {simulation,runId,displayOrder,resultOrder}=pendingRun,generation=++feverTenStartGeneration;
 feverTenStartPending=true;measureSceneTransition('fever-purchase-pending-render',()=>{renderLocalFeverSimulation();render();});
  $('fx-enabled').checked=false;releaseFXFrames(true);$('backs').checked=false;comparison=null;
 const audioPromise=measureSceneAsync('fever-audio-ready',runId,()=> $('sound-enabled').checked?prepareAudioFromGesture():Promise.resolve({status:'sound-disabled'}));
  normalLocalOutput.textContent=JSON.stringify({classification:simulation.classification,runId,pool:'FEVER',resultOrder,displayOrder,strategy:simulation.strategy,officialServerDraw:false,webSimulationOnly:true,rerollOrSubstitution:false,resultPayloadsNull:true,liveResultGrade:'UNKNOWN',movieSelection,fx:'OFF'},null,2);
 try{
   const resultCards=await measureSceneAsync('fever-result-assets-ready',runId,()=>Promise.all(simulation.results.map(async result=>{
   const official=feverLocalPoolEntryByRowKey.get(result.sourceRowKey),contract=feverLocalRowContract(official),errors=[];
   let iconImage=null,frontImage=null,gradeImage=null;
   const loadOptional=async(file,label)=>{if(!file)return null;try{return await image(file);}catch(error){errors.push(`${label}:${String(error)}`);return null;}};
   if(contract.iconPath)iconImage=await loadOptional(contract.iconPath,'icon');
   if(contract.plan){[frontImage,gradeImage]=await Promise.all([loadOptional(contract.plan.front.file,'front'),loadOptional(contract.plan.grade.file,'grade')]);}
   const renderState=contract.plan?(iconImage&&frontImage&&gradeImage?'CARD_READY':'ASSET_LOAD_FAILED'):(contract.iconPath&&!iconImage?'ASSET_LOAD_FAILED':'ROW_ONLY_DIAGNOSTIC');
   return {result,admission:contract.admission,plan:contract.plan,item:null,frontImage,gradeImage,iconImage,renderState,visualReason:errors.length?errors.join(' | '):contract.reason||null};
   })));pendingRun.resultCards=resultCards;
  const audioPreparation=await audioPromise;
  if(generation!==feverTenStartGeneration||!feverTenStartPending)return;
  if(showing||movieActive||moviePending||normalR9StartPending||normalLocalFullFlow.current())throw Error('FEVER_SCENE_BECAME_ACTIVE_DURING_LOAD');
   const display={resultCards,resultOrder,displayOrder,fxWasEnabled:pendingRun.fxWasEnabled,runId,simulation};
  trace.push({event:'local-fever-ten-audio-preparation',at:performance.now(),status:audioPreparation.status,buffersReady:audioPreparation.buffersReady??null,contextState:audioPreparation.contextState??null});
   if(useMovie){
    pendingRun.display=display;pendingRun.movieKey=feverMovieKey;pendingRun.phase='movie';
    movie.dataset.finishCount='0';movie.dataset.finishGuardHits='0';moviePending=false;movieActive=true;nextDrawCount=11;
    measureSceneTransition('fever-movie-configure-load',()=>{movie.src=feverMovieAsset.file;movie.controls=false;movie.hidden=false;movieSkip.hidden=false;movie.currentTime=0;movie.load();});
     trace.push({event:'local-fever-ten-movie-start',at:performance.now(),runId,movieKey:feverMovieKey,movieSelection,classification:r14p10PlayerEnabled?'WEB_CONDITIONAL_MOVIE_SELECTOR':'ENGINEERING_MOVIE_FIXTURE_NOT_OFFICIAL_FEVER_SELECTION',sourceRowKeys:[...resultOrder],cardsReady:resultCards.length});
    measureSceneTransition('fever-movie-visible-render',()=>render());
    const playPromise=measureSceneTransition('fever-movie-play-call',()=>movie.play());
    if(playPromise?.then)void measureSceneAsync('fever-movie-play-settled',runId,()=>playPromise).catch(()=>{});if(playPromise&&typeof playPromise.catch==='function')playPromise.catch(error=>{trace.push({event:'local-fever-ten-movie-play-rejected',at:performance.now(),runId,movieKey:feverMovieKey,message:String(error)});setStatus('Fever 11 筆來源列已固定；測試影片未自動播放，可按「跳過」進入同一組結果。');});
   }else{if(pendingRun.continueWithoutMovie)updateP10NoMovieRecovery(runId,pendingRun.movieSelection?.reason??'SELECTOR_UNRESOLVED');startTen({fullFlow:r14p10PlayerEnabled,feverLocalDisplay:display});}
  normalLocalOutput.textContent=JSON.stringify({classification:simulation.classification,runId,pool:'FEVER',resultOrder,displayOrder,strategy:simulation.strategy,officialServerDraw:false,webSimulationOnly:true,displayStates:resultCards.map(record=>({sourceRowKey:record.result.sourceRowKey,renderState:record.renderState,visualStatus:record.admission?.visualStatus??'ROW_ONLY_DIAGNOSTIC',reason:record.visualReason})),resultPayloadsNull:true,liveResultGrade:'UNKNOWN',fx:'OFF',quotaCharge:'AFTER_ALL_11_REVEALED_WEB_ADAPTATION'},null,2);
 }catch(error){if(generation===feverTenStartGeneration){movieActive=false;moviePending=false;movie.pause();movie.hidden=true;movieSkip.hidden=true;if(pendingRun.phase==='movie')pendingRun.phase='failed';normalLocalOutput.textContent=JSON.stringify({classification:simulation.classification,runId,pool:'FEVER',resultOrder,displayOrder,strategy:simulation.strategy,officialServerDraw:false,rerollOrSubstitution:false,flowStarted:false,error:String(error),quotaUnchanged:true},null,2);setStatus(`LOCAL_FEVER_TENTIME_NOT_STARTED：本次 11 筆抽樣已保留於診斷輸出，未重抽、未扣額度。${String(error)}`);}}
 finally{if(generation===feverTenStartGeneration){feverTenStartPending=false;measureSceneTransition('fever-purchase-final-render',()=>{renderLocalFeverSimulation();render();});}}
}
function startNormalLocalSingleWithMovie(pending,movieSelection){
 const {result,mode,seed,luckyFeverBefore,generation,drawAt,attemptId,runId}=pending,movieKey=movieSelection.movie,movieAsset=nonFxAssets.movieSelection.movies[movieKey];
 if(!movieAsset){normalLocalOutput.textContent=`LOCAL_NORMAL_FLOW_BLOCKED_MOVIE_FIXTURE：找不到 ${movieKey} 影片 Fixture；本次單抽結果保留。`;if(pending.isResume)normalLocalSingleResumePending=pending;return;}
 const flow=normalLocalFullFlow.begin({result,mode,movieKey,at:drawAt});
 normalSingleLuckyFeverRuns.set(flow.flowId,{runId,mode,seed,feverBefore:luckyFeverBefore,attempted:false});
 const token=++flowGeneration;if(raf)cancelAnimationFrame(raf);raf=0;
 showing=false;session=null;comparison=null;trace=[{event:pending.isResume?'normal-local-single-manual-resume':'normal-local-flow-start',at:drawAt,attemptId,mode,movieKey,sourceRowKey:result.sourceRowKey,runId,feverBefore:{progress:luckyFeverBefore.progress,maxProgress:luckyFeverBefore.maxProgress,phase:luckyFeverBefore.phase,usesRemaining:luckyFeverBefore.usesRemaining},samplerCalls:1}];
 movieActive=false;moviePending=true;nextDrawCount=1;movie.dataset.finishCount='0';movie.dataset.finishGuardHits='0';
 normalLocalOutput.textContent+=`\n\nLOCAL_NORMAL_FULL_FLOW_STARTED：僅抽樣一次；sourceRowKey=${result.sourceRowKey}；影片 Fixture=${movieKey}（${movieSelection.status}）；結果卡准入=${pending.plan?.admissionClass||'SOURCE_BOUND_STATIC_PREVIEW'}；FX OFF；samplerCalls=1；attemptId=${attemptId}。`;
 render();
 const continueMovie=()=>{
 const current=normalLocalFullFlow.current();if(token!==flowGeneration||current?.flowId!==flow.flowId||current.phase!=='preparing')return;
 moviePending=false;movieActive=true;normalLocalFullFlow.movieStarted(performance.now());movie.src=movieAsset.file;movie.controls=false;movie.hidden=false;movieSkip.hidden=false;movie.currentTime=0;movie.load();
 trace.push({event:'normal-local-movie-start',at:performance.now(),attemptId,runId,movieKey,sourceRowKey:result.sourceRowKey,samplerCalls:1});render();
 const playPromise=movie.play();if(playPromise&&typeof playPromise.catch==='function')playPromise.catch(error=>{trace.push({event:'normal-local-movie-play-rejected',at:performance.now(),message:String(error),sourceRowKey:result.sourceRowKey});setStatus(`本地 Normal 已保留 ${result.sourceRowKey}；瀏覽器未自動播放 ${movieKey}，可按右上角「跳過」顯示同一列。`);});
 };
 if(appQuery.get('singleMovieStartup')==='audio-ready'){
  const preparation=measureSceneAsync('single-audio-ready',runId,()=>
    $('sound-enabled').checked?prepareAudioFromGesture():Promise.resolve({status:'sound-disabled'}));
  void preparation.then(outcome=>{
   trace.push({event:'single-movie-audio-ready',at:performance.now(),runId,status:outcome.status});
   continueMovie();
  },cause=>{
   trace.push({event:'single-movie-audio-unavailable',at:performance.now(),runId,message:String(cause)});
   continueMovie();
  }).catch(cause=>{
   console.error('SINGLE_MOVIE_CONTINUATION_FAILED',cause);
   if(token===flowGeneration){moviePending=false;setStatus('單抽影片啟動失敗；結果已保留，請返回商店。');}
  });
 }else continueMovie();

}
function continueNormalLocalSingleWithoutMovie(pending){
 if(!pending||pending!==normalLocalSingleResumePending)return;
 normalLocalSingleResumePending=null;const now=performance.now(),flow=normalLocalFullFlow.beginWithoutMovie({result:pending.result,mode:pending.mode,at:now,reason:pending.movieSelection?.reason??'SELECTOR_UNRESOLVED'});
 normalSingleLuckyFeverRuns.set(flow.flowId,{runId:pending.runId,mode:pending.mode,seed:pending.seed,feverBefore:pending.luckyFeverBefore,attempted:false});
 trace=[{event:'p10-normal-single-no-video-recovery',at:now,runId:pending.runId,pool:'NORMAL',sourceRowKeys:[pending.result.sourceRowKey],samplerCalls:0,rerollOrSubstitution:false,selectorStatus:'UNRESOLVED_INPUT'}];
 normalLocalOutput.textContent=JSON.stringify({classification:'WEB_CONDITIONAL_MOVIE_SELECTOR_SAFE_RECOVERY',runId:pending.runId,pool:'NORMAL',sourceRowKeys:[pending.result.sourceRowKey],samplerCalls:1,drawRetained:true,rerollOrSubstitution:false,movie:null,reason:pending.movieSelection?.reason??'SELECTOR_UNRESOLVED',nextAction:'CONTINUED_SAME_RESULT_WITHOUT_VIDEO'},null,2);
 setStatus('來源未閉合；同一筆結果已直接顯示，未播放影片、未重抽。');void showNormalLocalResultPreview(pending.result,pending.generation,{preserveTrace:true,flowId:flow.flowId});
}
function startNormalLocalFullFlow(){
 if(!normalLocalSimulator){normalLocalOutput.textContent='LOCAL_NORMAL_SIMULATION_DISABLED';return;}
 if(!localFeverSimulation.snapshot().normalSingleAvailable){normalLocalOutput.textContent='LOCAL_NORMAL_SINGLE_BLOCKED_BY_LOCAL_FEVER：本地 Fever 測試狀態下保留入口但不進行 Normal 抽樣；可重設本地狀態。';render();return;}
 if(normalLocalSingleResumePending){
  const pending=normalLocalSingleResumePending;
  if(r14p10PlayerEnabled&&pending.p10NoVideoRecovery){continueNormalLocalSingleWithoutMovie(pending);return;}
  if(!r14p5MovieEnabled||$('movie-selector-p5-mode')?.value!=='manual'){$('movie-selector-p5-status').textContent=`單抽 ${pending.result.sourceRowKey} 仍保留；切換手動 N/H/R，選擇影片後再按單抽同一按鈕接續。`;setStatus('NORMAL_SINGLE_UNRESOLVED_PENDING：已保留同一 sourceRowKey；切換手動 N/H/R 後再次按單抽接續，未重抽。');render();return;}
  const resumed=resumeMovieSelectorP6Manually(pending,$('movie-source')?.value||'N');if(resumed.status!=='MANUAL_RESUME'){$('movie-selector-p5-status').textContent=`單抽仍保留；接續被拒絕：${resumed.status}。`;return;}
  const movieSelection=resolveMovieP5ForRows('NORMAL',resumed.results);if(movieSelection.status!=='MANUAL_OVERRIDE'){setStatus('NORMAL_SINGLE_MANUAL_RESUME_BLOCKED：尚未取得明示手動 N/H/R；原結果保留。');return;}
  normalLocalSingleResumePending=null;pending.isResume=true;pending.resumedAt=performance.now();trace.push({event:'normal-local-single-unresolved-manual-resume',at:pending.resumedAt,attemptId:pending.attemptId,runId:pending.runId,sourceRowKey:pending.result.sourceRowKey,movieKey:movieSelection.movie,samplerCalls:pending.samplerCalls,resultReferencePreserved:resumed.resultReferencePreserved});startNormalLocalSingleWithMovie(pending,movieSelection);return;
 }
 const mode=$('normal-local-flow-mode').value;if(!['random','seeded'].includes(mode)){normalLocalOutput.textContent='LOCAL_NORMAL_FLOW_MODE_INVALID：請在進階設定選擇本地隨機或 Seed 重播。';return;}
 if(normalLocalTenStartPending||normalLocalTenPendingRun||normalLocalTenResumePending||normalLocalFullFlow.current()||movieActive||moviePending||(showing&&session?.mode!=='normal-local-preview')){normalLocalOutput.textContent='LOCAL_NORMAL_FLOW_BLOCKED_SCENE_ACTIVE：先完成或返回目前畫面；本次沒有抽樣。';return;}
 if(showing&&session?.mode==='normal-local-preview')resetScene();
 const luckyFeverBefore=localFeverSimulation.snapshot();try{
  const result=mode==='seeded'?normalLocalSimulator.drawSeeded($('normal-local-seed').value):normalLocalSimulator.drawRandom(),plan=normalLocalCardPresentation(result),generation=++normalLocalDrawGeneration,drawAt=performance.now(),attemptId=`normal-local-single-attempt-${Date.now()}-${++normalSingleLuckyFeverSequence}`,runId=attemptId.replace('attempt-','');
  normalLocalLastResult=result;normalLocalOutput.textContent=formatNormalLocalResult(result);
  if(!plan){normalLocalOutput.textContent+=`\n\n${normalLocalCardPreviewStatus(result)}：本次單抽結果已保留；不啟動影片、不預覽、不重抽、不代換。`;render();return;}
  const pending=createMovieSelectorP6Pending({pool:'NORMAL',flow:'single',mode,seed:mode==='seeded'?$('normal-local-seed').value:null,runId,flowId:attemptId,volume:1,results:[result],sampledAt:drawAt});Object.assign(pending,{result,plan,luckyFeverBefore,generation,drawAt,attemptId,flowId:attemptId});
   const movieSelection=resolveMovieP5ForRows('NORMAL',[result]);window.__r14p5LastMovieSelection=movieSelection;recordP10MovieDecision({pool:'NORMAL',runId,results:[result],selection:movieSelection});
  if(movieSelection.status==='UNRESOLVED_INPUT'){
    if(r14p10PlayerEnabled){pending.p10NoVideoRecovery=true;normalLocalSingleResumePending=pending;updateP10NoMovieRecovery(runId,movieSelection.reason??'SELECTOR_UNRESOLVED');showP10SafeRecovery({kind:'normal-single',runId,pool:'NORMAL',sourceRowKeys:[result.sourceRowKey],continueSameBatch:()=>continueNormalLocalSingleWithoutMovie(pending)});normalLocalOutput.textContent=JSON.stringify({classification:'WEB_CONDITIONAL_MOVIE_SELECTOR_SAFE_RECOVERY_PENDING',runId,pool:'NORMAL',sourceRowKeys:[result.sourceRowKey],samplerCalls:1,drawRetained:true,rerollOrSubstitution:false,movie:null,reason:movieSelection.reason??'SELECTOR_UNRESOLVED'},null,2);return;}
   pending.classification='ENGINEERING_SAME_RUN_MANUAL_RESUME_PENDING';normalLocalSingleResumePending=pending;
   normalLocalOutput.textContent+=`\n\nMovie Selector P5 UNRESOLVED_INPUT：sourceRowKey=${result.sourceRowKey}；同一張抽樣結果與 runId=${runId} 已保留。切換手動 N/H/R 後按「單抽」接續；samplerCalls=1，沒有重新抽樣或 Lucky Fever 判定。`;
   $('movie-selector-p5-status').textContent=`單抽 ${result.sourceRowKey} 尚未來源准入；同一結果已保留。切換手動 N/H/R 後按單抽接續。`;setStatus('Movie Selector P5：單抽來源 Item 有歧義；同一次抽樣已保留，切回明示手動 N/H/R 可接續。');render();return;
  }
  startNormalLocalSingleWithMovie(pending,movieSelection);
 }catch(error){normalLocalOutput.textContent=`本地 Normal 完整流程未啟動：${String(error)}；不會以其他列替代。`;render();}
}
async function runNormalLocalSimulation(mode){
 if(!normalLocalSimulator){normalLocalOutput.textContent='LOCAL_NORMAL_SIMULATION_DISABLED';return;}
 if(!localFeverSimulation.snapshot().normalSingleAvailable){normalLocalOutput.textContent='LOCAL_NORMAL_SINGLE_BLOCKED_BY_LOCAL_FEVER：本地 Fever 測試狀態下不執行 Normal 抽樣。';render();return;}
 if(normalLocalFullFlow.current()){normalLocalOutput.textContent='LOCAL_SIMULATION_BLOCKED_FLOW_PENDING：目前本地完整流程持有唯一抽樣列；請先返回商店，不會重抽或覆蓋。';return;}
 if((showing&&session?.mode!=='normal-local-preview')||movieActive||moviePending){normalLocalOutput.textContent='LOCAL_SIMULATION_BLOCKED_SCENE_ACTIVE\n目前固定展示／影片流程仍在進行；本地診斷抽樣未執行。';return;}
 try{
  const result=mode==='seeded'?normalLocalSimulator.drawSeeded($('normal-local-seed').value):normalLocalSimulator.drawRandom();
  const generation=++normalLocalDrawGeneration;
  if(session?.mode==='normal-local-preview')resetScene();
  normalLocalLastResult=result;
  normalLocalOutput.textContent=formatNormalLocalResult(result);
  render();
  const plan=normalLocalCardPresentation(result);
  if(!plan){
   const status=normalLocalCardPreviewStatus(result);
   normalLocalOutput.textContent+=`\n\n${status}: 保留本次抽中來源列與公告機率；不預覽、不重抽、不代換。`;
   return;
  }
  await showNormalLocalResultPreview(result,generation);
 }catch(error){normalLocalOutput.textContent=`本次本地模擬失敗：${String(error)}`;}
}
async function showNormalLocalResultPreview(result=normalLocalLastResult,generation=normalLocalDrawGeneration,options={}){
 if((showing&&session?.mode!=='normal-local-preview')||movieActive||moviePending){normalLocalOutput.textContent='LOCAL_PREVIEW_BLOCKED_SCENE_ACTIVE\n目前固定展示／影片流程仍在進行；本地診斷預覽未改變場景。';return;}
 const plan=normalLocalCardPresentation(result);
 if(!result||!plan){normalLocalOutput.textContent+=`\n\n${result?normalLocalCardPreviewStatus(result):'RESULT_PAYLOAD_UNRESOLVED'}：保留來源列與公告機率；不預覽、不重抽、不替代卡面。`;return;}
 try{
  const [frontImage,gradeImage,iconImage]=await Promise.all([image(plan.front.file),image(plan.grade.file),image(plan.iconPath)]);
  const pendingFlow=options.flowId?normalLocalFullFlow.current():null;
  if(result!==normalLocalLastResult||generation!==normalLocalDrawGeneration||(options.flowId&&(pendingFlow?.flowId!==options.flowId||pendingFlow.phase!=='result-loading')))return;
  $('fx-enabled').checked=false;releaseFXFrames(true);$('backs').checked=false;
  const payload=result.resultPayload,item=payload?.item,now=performance.now();
  showing=true;movieActive=false;moviePending=false;movie.pause();movie.hidden=true;movieSkip.hidden=true;comparison=null;
   session={mode:'normal-local-preview',count:1,fullFlow:!!options.flowId,phase:'complete',started:now,item:item?{itemID:item.itemID,name:item.name,part:item.classification||item.parts||'',grade:item.basicGrade?.code||'UNKNOWN'}:{itemID:null,name:result.announcementName,part:'',grade:null},basicGrade:item?.basicGrade?.code||null,displayGrade:plan.displayGrade||null,displayGradeEvidence:plan.gradeEvidence||null,admissionClass:plan.admissionClass||'SOURCE_BOUND_STATIC_PREVIEW',previewKind:plan.previewKind||null,sourceRowKey:result.sourceRowKey,liveResultGrade:'UNKNOWN',cardArt:{frontImage,gradeImage,iconImage},frontAssetFile:plan.front.file,oneTimeOutlineSample:item?{itemId:item.itemID??null,itemType:item.itemType??null,effectiveGradeType:item.effectiveGrade?.type??null,effectiveGrade:item.effectiveGrade?.code??null}:null,oneTimeOutlinePolicyRecord:Object.freeze({result:Object.freeze({pool:result.pool,sourceRowKey:result.sourceRowKey,officialSourceRowKey:result.officialSourceRowKey,identity:result.identity??null,resultPayload:result.resultPayload?Object.freeze({item:result.resultPayload.item??null}):null})}),cards:[{openAt:now-timing.flipMs}],effects:[],batch:null,luckyFeverDiagnostic:false,luckyFeverOverlayAttempted:false};
   updateItemList();const previewEvent={event:plan.previewKind|| (plan.displayOnly?'normal-local-visual-display-only-preview':'normal-local-static-card-preview'),at:now,sourceRowKey:result.sourceRowKey,admissionClass:plan.admissionClass,displayGrade:plan.displayGrade||null,gradeEvidence:plan.gradeEvidence||null,serverRng:false,liveResultGrade:'UNKNOWN',fx:'OFF',resultPayloadUnchanged:!plan.displayOnly||result.resultPayload===null};if(options.preserveTrace)trace.push(previewEvent);else trace=[previewEvent];if(options.flowId){const displayed=normalLocalFullFlow.cardDisplayed(now,plan.admissionClass||'SOURCE_BOUND_STATIC_PREVIEW');if(displayed.accepted){const luckyContext=normalSingleLuckyFeverRuns.get(options.flowId);let settled;if(luckyContext&&!luckyContext.attempted){luckyContext.attempted=true;settled=settleLocalNormalPurchaseWithLuckyFever({purchaseCount:1,runId:luckyContext.runId,mode:luckyContext.mode,seed:luckyContext.seed,feverBefore:luckyContext.feverBefore,diagnostic:false,at:now});}else{const feverCount=localFeverSimulation.recordCompletedNormalSingle(`normal-local-single-fallback-${options.flowId}`);settled={decision:{eligible:false,triggered:false,randomDrawn:false,outcome:'RNG_CONTEXT_MISSING_NO_LUCKY_ROLL'},settlement:feverCount,triggered:false};trace.push({event:'lucky-fever-single-context-missing',at:now,flowId:options.flowId,runId:null,classification:'PARTIAL_PLAYER_PENDING'});}normalSingleLuckyFeverRuns.delete(options.flowId);const feverCount=settled.settlement;trace.push({event:'local-fever-normal-single-completion',at:now,flowId:options.flowId,runId:luckyContext?.runId??null,sourceRowKey:result.sourceRowKey,accepted:feverCount.accepted,reason:feverCount.reason||null,normalProgressContribution:feverCount.accepted?1:0,progress:feverCount.state.progress,maxProgress:feverCount.state.maxProgress,phase:feverCount.state.phase,luckyFeverDecision:settled.decision,luckyFeverTriggered:settled.triggered,ruleClass:'WEB_SIMULATION_ONLY'});if(settled.triggered){normalLocalOutput.textContent+=`\n\nLucky Fever 1.5% 單抽規則已觸發；此本地適配在 R8 結果卡顯示後播放既有 I2 Overlay。原生 OneTime present 時序仍未閉合（PARTIAL_PLAYER_PENDING）。`;startLuckyFeverOverlay(now,{timingSource:'AFTER_R8_LOCAL_RESULT_CARD_DISPLAY_WEB_ADAPTATION_PARTIAL_PLAYER_PENDING'});}renderLocalFeverSimulation();}}render();
  normalLocalOutput.textContent+=plan.previewKind==='normal-local-r6-announcement-grade-web-only'?`\n\nWEB_VISUAL_DISPLAY_ONLY_CARD_DISPLAYED：${result.sourceRowKey}；展示公告名稱、列鍵准入圖示與「${plan.displayGrade}」Web 卡框樣式；未選定 ItemID、未填 resultPayload.item、未推定部位或有效品級；liveResultGrade=UNKNOWN；FX OFF。`:plan.displayOnly?`\n\nWEB_VISUAL_DISPLAY_ONLY_CARD_DISPLAYED：${result.sourceRowKey}；使用公告列名稱、已驗證商店圖示與玩家確認的神話樣式外觀；未填入 resultPayload.item；liveResultGrade=UNKNOWN；FX OFF。`:`\n\nLOCAL_STATIC_RESULT_CARD_DISPLAYED：${result.sourceRowKey}；liveResultGrade=UNKNOWN；FX OFF；未操作正式購買流程。`;
 }catch(error){if(result===normalLocalLastResult&&generation===normalLocalDrawGeneration)normalLocalOutput.textContent+=`\n\n結果卡素材載入失敗：${String(error)}`;}
}
$('normal-local-random').addEventListener('click',()=>runNormalLocalSimulation('random'));
$('normal-local-seeded').addEventListener('click',()=>runNormalLocalSimulation('seeded'));
$('normal-local-preview').addEventListener('click',showNormalLocalResultPreview);
 $('local-fever-normal-single').addEventListener('click',()=>applyLocalFeverAction(()=>localFeverSimulation.recordDiagnosticNormalDraw(1,`manual-${++localFeverDiagnosticActionSequence}`)));
 $('local-fever-normal-ten').addEventListener('click',()=>applyLocalFeverAction(()=>localFeverSimulation.recordDiagnosticNormalDraw(11,`manual-${++localFeverDiagnosticActionSequence}`)));
 $('local-fever-direct-fill').addEventListener('click',()=>applyLocalFeverAction(()=>localFeverSimulation.forceDirectFillFixture(`manual-${++localFeverDiagnosticActionSequence}`)));
 $('local-fever-ten-complete').addEventListener('click',()=>applyLocalFeverAction(()=>localFeverSimulation.completeFeverTenTime(`manual-${++localFeverDiagnosticActionSequence}`)));
  $('local-fever-reset').addEventListener('click',()=>applyLocalFeverAction(()=>{const result=localFeverSimulation.reset();if(result.accepted)feverTenPendingRun=null;return result;}));
  $('normal-local-fever-player-reset').addEventListener('click',startManualNewCycle);
  $('normal-local-flow-mode').addEventListener('change',render);
  $('normal-local-seed').addEventListener('input',render);
  $('movie-source').addEventListener('change',render);
  $('normal-local-full-flow').addEventListener('click',startNormalLocalFullFlow);
  $('normal-local-ten-full-flow').addEventListener('click',startNormalLocalTenFullFlow);
  $('local-fever-ten-start').addEventListener('click',()=>void startLocalFeverTenSimulation());
 $('normal-local-ten-display').addEventListener('click',startNormalR9TenDisplay);$('lucky-fever-diagnostic-arm').addEventListener('click',armLuckyFeverDiagnosticForCurrentRun);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopShopAmbientAnimation();if(!r14P32R2R14Enabled)screenFxCandidate?.stop();}else render();});window.addEventListener('pagehide',stopShopAmbientAnimation);window.addEventListener('pageshow',render);
 window.CrystalDot?.ready?.then(loaded=>{trace.push({event:'s1c-shop-dot-assets-ready',loaded,classification:'SOURCE_REUSED_NATIVE_BAKE_WEB_ADAPTATION',sourceStatus:'S1C_VISUAL_REVIEW_WAS_SCOPED_AND_NOT_WHOLE_STORE_PASS'});render();});
{
  const {createFeverScreenFxCandidate}=await import('./fever-screenfx-candidate.mjs?r14feverbackground=20261107a&startupProbe=1');
  screenFxCandidate=createFeverScreenFxCandidate({onChange:state=>{const note=$('r14p32r2r14-status');if(['mode','replay','stop','manual-frame'].includes(state.reason)){r14ScreenFxPixelProbe={runId:state.runId,frame:null,changedPixels:null};r14R4ResetLayerMetrics(state.runId);}if(note)note.textContent=`${state.classification} · ${state.mode} · 影格 ${String(state.frame).padStart(2,'0')}/16 · ${state.intervalMs}ms（假說）· ${state.opacity}% · ${state.composite==='lighter'?'Web lighter':'Normal'} · ${state.playing?'播放中':state.visible?'靜態檢視':'停止'} · 已載入 ${state.assetsLoaded}/16 · Canvas drawCalls ${state.drawCalls} · Canvas 變化像素 ${r14ScreenFxPixelProbe.runId===state.runId?(r14ScreenFxPixelProbe.changedPixels??'待繪製'):'待繪製'} · 最後繪製影格 ${state.lastDrawnFrame??'尚無'}`;}});
  window.__feverBackgroundIntegration=Object.freeze({snapshot:()=>{const runId=r14P32R14FeverRunId(),screen=screenFxCandidate.snapshot();return {classification:'WEB_VISUAL_ADAPTATION_PLAYER_PENDING_NOT_NATIVE_PARITY',route:{mode:appQuery.get('mode'),sessionMode:session?.mode??null,phase:session?.phase??null,runId},screenFx:{...screen,active:runId!==null&&screen.runId===runId&&['SCREENFX_CANDIDATE','COMBINED_FLASH02_SCREENFX'].includes(screen.mode)},screenFxPixelProbe:{...r14ScreenFxPixelProbe,enabled:appQuery.get('mode')==='engineering',policy:'ENGINEERING_ONLY_FULL_FRAME_READBACK'},layers:{...r14R4LayerMetrics,flash02UnityDrawnFrames:r14p30P8Player?.snapshot()?.drawnFrames??0},flash02:r14p30P8Player?.snapshot()??null,assetsComplete:screen.assetsLoaded===16&&screen.assetErrors.length===0};}});
if(r14P32R2R14Enabled){
  const panel=$('r14p32r2r14-controls');panel.hidden=false;
  const frameSelect=$('r14p32r2r14-frame');for(let i=1;i<=16;i++){const option=document.createElement('option');option.value=String(i);option.textContent=String(i).padStart(2,'0');frameSelect.append(option);}
 const activeFeverRunId=()=>r14P32R14FeverRunId();
 const applyScreenFxParameters=()=>{screenFxCandidate.update({intervalMs:$('r14p32r2r14-interval').value,opacity:$('r14p32r2r14-opacity').value,composite:$('r14p32r2r14-composite').value,reverse:$('r14p32r2r14-order').value==='reverse',loop:$('r14p32r2r14-loop').checked});$('r14p32r2r14-interval-value').value=`${$('r14p32r2r14-interval').value} ms`;$('r14p32r2r14-opacity-value').value=`${$('r14p32r2r14-opacity').value}%`;render();};
 $('r14p32r2r14-mode').addEventListener('change',event=>{screenFxCandidate.setMode(event.target.value,activeFeverRunId());if(['SCREENFX_CANDIDATE','COMBINED_FLASH02_SCREENFX'].includes(event.target.value)&&!activeFeverRunId())$('r14p32r2r14-status').textContent='已選工程動畫模式；請先啟動本地 Fever 10+1，候選會在同一 runId 的結果舞台播放。';render();schedule();});
 $('r14p32r2r14-inspect').addEventListener('click',()=>{if(!activeFeverRunId()){$('r14p32r2r14-status').textContent='請先啟動本地 Fever 10+1，再於同一組結果中逐張檢視。';return;}$('r14p32r2r14-mode').value='SCREENFX_CANDIDATE';screenFxCandidate.setMode('SCREENFX_CANDIDATE',activeFeverRunId());screenFxCandidate.inspectFrame(frameSelect.value);render();});
 $('r14p32r2r14-interval').addEventListener('input',applyScreenFxParameters);$('r14p32r2r14-opacity').addEventListener('input',applyScreenFxParameters);$('r14p32r2r14-composite').addEventListener('change',applyScreenFxParameters);$('r14p32r2r14-order').addEventListener('change',applyScreenFxParameters);$('r14p32r2r14-loop').addEventListener('change',applyScreenFxParameters);
 $('r14p32r2r14-replay').addEventListener('click',()=>{if(!activeFeverRunId()){$('r14p32r2r14-status').textContent='目前沒有可重播的 Fever 10+1 結果；先開始一次本地 Fever 10+1。';return;}const mode=['COMBINED_FLASH02_SCREENFX','SCREENFX_CANDIDATE'].includes($('r14p32r2r14-mode').value)?$('r14p32r2r14-mode').value:'SCREENFX_CANDIDATE';$('r14p32r2r14-mode').value=mode;screenFxCandidate.setMode(mode,activeFeverRunId());render();schedule();});
 $('r14p32r2r14-stop').addEventListener('click',()=>{if(screenFxCandidate.snapshot().mode==='COMBINED_FLASH02_SCREENFX'){$('r14p32r2r14-mode').value='OFF';screenFxCandidate.setMode('OFF',activeFeverRunId());}else screenFxCandidate.stop();render();});
 $('r14p32r2r14-save-frame').addEventListener('click',()=>{if(!activeFeverRunId()){$('r14p32r2r14-status').textContent='目前沒有 Fever 結果舞台可匯出。';return;}const link=document.createElement('a');link.download=`r14p32r2r14-${screenFxCandidate.snapshot().mode.toLowerCase()}-frame-${String(screenFxCandidate.snapshot().frame).padStart(2,'0')}.png`;link.href=canvas.toDataURL('image/png');link.click();});
 window.__r14p32r2r14=Object.freeze({snapshot:()=>({screenFx:screenFxCandidate.snapshot(),layers:{...r14R4LayerMetrics,flash02UnityDrawnFrames:r14p30P8Player?.snapshot()?.drawnFrames??0},flash02:r14p30P8Player?.snapshot()??null}),stop:()=>{screenFxCandidate.stop();render();}});
  screenFxCandidate.assetsReady.then(()=>{const state=screenFxCandidate.snapshot();$('r14p32r2r14-status').textContent=`${state.assetsLoaded}/16 Fever ScreenFx PNG 載入 · SOURCE_UNRESOLVED_ROLE / ORDER / FRAME_TIME；Web 視覺適配，不是 Native 1:1。`;render();});
}else{screenFxCandidate.assetsReady.then(()=>render());}
}
const r6Initialization=initializeNormalLocalSimulation();
renderLocalFeverSimulation();
 updateItemList();window.cleanRebuild={requestFXRender,fixture,rawPopupNodes:raw.nodes.length,render,setShopPoolTab,armLuckyFeverDiagnosticForCurrentRun,snapshot:()=>({session,trace,timing,comparison,movieActive,moviePending,nextDrawCount,movieFinishGuardHits,movieFinishAcceptedCount,normalLocalFlow:normalLocalFullFlow.current(),normalLocalFlowReceipt:normalLocalFullFlow.receipt(),normalLocalLastSourceRowKey:normalLocalLastResult?.sourceRowKey??null,p6ResumePending:{single:normalLocalSingleResumePending?{runId:normalLocalSingleResumePending.runId,attemptId:normalLocalSingleResumePending.attemptId,sourceRowKey:normalLocalSingleResumePending.result.sourceRowKey,mode:normalLocalSingleResumePending.mode,seed:normalLocalSingleResumePending.seed,samplerCalls:normalLocalSingleResumePending.samplerCalls}:null,normalTen:normalLocalTenResumePending?{runId:normalLocalTenResumePending.runId,attemptId:normalLocalTenResumePending.attemptId,sourceRowKeys:[...normalLocalTenResumePending.sourceRowKeys],mode:normalLocalTenResumePending.mode,seed:normalLocalTenResumePending.seed,volume:normalLocalTenResumePending.volume,samplerCalls:normalLocalTenResumePending.samplerCalls}:null},normalR9TenDisplay:{ready:normalR9TenDisplayReady,pending:normalR9StartPending,fixtureSourceRows:normalR9TenDisplayFixture?.resultOrder?.map(row=>row.sourceRowKey)??[]},normalLocalTenRun:{pending:normalLocalTenStartPending,runId:normalLocalTenPendingRun?.runId??session?.normalRunId??null,phase:normalLocalTenPendingRun?.phase??session?.phase??null,sampledRows:normalLocalTenPendingRun?.simulation?.sourceRowKeys??session?.resultOrder??[]},localFeverSimulation:localFeverSimulation.snapshot(),resultPurchaseUi:resultFeverRetrySnapshot(),shopPurchaseUi:{...localFeverShopUiSnapshot(),visible:!showing&&!movieActive&&!moviePending,shopFeverModeActive},luckyFeverOverlay:luckyFeverOverlay.snapshot(),shopAmbient:{classification:'S1C_R5_TWEEN_AND_DOT_NATIVE_BAKE_WEB_ADAPTATION_PLAYER_PENDING',elapsedSeconds:shopAmbientElapsedSeconds,chestTweenSourceSupported:shopChestTweenSourceSupported,chestTweenComponentPath:shopChestTweenComponent?.path??null,dot:window.CrystalDot?.snapshot()??null},performanceRuns,audioRuntime,audioClips:audioClipSnapshot(),fxMetrics,fxCachedFrames:fxBitmaps.size,movieControls:movie.controls,canvasRender:{logical:[fixture.width,fixture.height],backing:[canvas.width,canvas.height],scale:canvasRenderScale,devicePixelRatio:window.devicePixelRatio,imageSmoothingEnabled:ctx.imageSmoothingEnabled,imageSmoothingQuality:ctx.imageSmoothingQuality,probeEnabled:canvasResolutionProbeEnabled}}),setCanvasResolutionProbe};render();writeVisualQualityReceipt();
if(fx0304LayerMode)startFXSingleDiagnostic();

if(r14p30P7Enabled){
 const p7=await import('./p7-canvas-outline.mjs?v=1&startupProbe=1');
 r14p30P7Player=p7.createCardOutlineFixture({redraw:()=>requestFXRender('p7'),appSnapshot:()=>({cardRects:r14p30P7CardRects(),sessionMode:session?.mode??null,phase:session?.phase??'shop',runId:session?.normalRunId??session?.feverRunId??session?.metrics?.runId??null,cardCount:session?.cards?.length??0,opened:session?.cards?.filter(c=>c.openAt!==null).length??0,resultOrder:session?.resultOrder??[],displayOrder:session?.displayOrder??[],gaugeReady:normalResultFeverGaugeReady(performance.now())})});
 window.__r14p30P7=Object.freeze({enabled:true,snapshot:()=>r14p30P7Player.snapshot()});if(r8OneTimeCandidateEnabled)installR8OneTimeControls();render();
}

if(r14p30P8Enabled){
 const p8=await import('./p8-canvas-candidate.mjs?startupProbe=1');
 r14p30P8Player=p8.createTenTimeMotionFixture({redraw:requestP8Render,lazy:p12P8LazyEnabled,onLazyError:error=>{if(p12P8LazyEnabled)setStatus(`P8 Flash02 載入失敗（${error}）；本次不會把缺少特效視為正常播放。`);},appSnapshot:()=>({sessionMode:session?.mode??null,phase:session?.phase??'shop',runId:session?.normalRunId??session?.feverRunId??session?.metrics?.runId??null,opened:session?.cards?.filter(c=>c.openAt!==null).length??0,resultOrder:session?.resultOrder??[],displayOrder:session?.displayOrder??[],cardRects:r14p30P8CardRects(),calibration:r14p30P8Calibration()})});
 window.__r14p30P8=Object.freeze({enabled:true,snapshot:()=>r14p30P8Player.snapshot()});render();
}

// R31R6 manual engineering fixture: existing row adapters, TenTime renderer and reveal gates.
let r6Pending=false,r6Sequence=0;
function r6SourceRows(){const source=session?.targetedPool==='FEVER'?feverLocalPoolEntryByRowKey:normalLocalPoolEntryByRowKey;return p31r3VisualRows().map(row=>{const official=source.get(row.sourceRowKey);return {...row,pool:session.targetedPool,sourceItemId:official?.clientIdentity?.verifiedClientItemId??null,sourceIdentityStatus:official?.clientIdentity?.identityVerdict,candidateIds:official?.clientIdentity?.candidateClientItemIds??[]};});}
async function r6Display(pool,keys){
 if(appQuery.get('mode')!=='engineering')throw Error('ENGINEERING_ONLY');
 if(r6Pending||showing||movieActive||moviePending||normalLocalTenStartPending||feverTenStartPending||normalR9StartPending||normalLocalFullFlow.current())throw Error('先 Confirm 返回商店；未覆蓋現有流程。');
 if(!['NORMAL','FEVER'].includes(pool)||keys.length!==11)throw Error('INVALID_TARGET_FIXTURE');
 const source=pool==='NORMAL'?normalLocalPoolEntryByRowKey:feverLocalPoolEntryByRowKey;
 if(keys.some(k=>!source.has(k)))throw Error('TARGET_POOL_ROW_MISMATCH');
 r6Pending=true;const generation=normalR9StartGeneration;
 try{
  let resultCards;
  if(pool==='NORMAL'){
   const results=keys.map(key=>{const b=normalLocalSimulator.table.buckets.find(b=>b.sourceRowKey===key);return normalLocalSimulator.resultAtTicket(b.start);});
   resultCards=await loadNormalLocalTenResultCards({results});
  }else{
   resultCards=await Promise.all(keys.map(async key=>{
    const official=source.get(key),contract=feverLocalRowContract(official),plan=contract.plan;
    if(!plan)throw Error('TARGET_CARD_NOT_ADMITTED:'+key);
    const result={pool:'FEVER',sourceRowKey:key,announcementName:official.announcementName,officialGrade:official.officialGrade,identity:{...official.clientIdentity},resultPayload:null,classification:'MANUAL_FIXTURE_ONLY',officialProbabilityPercentRaw:official.officialProbabilityPercentRaw,officialExactFractionRaw:official.officialExactFractionRaw};
    const [frontImage,gradeImage,iconImage]=await Promise.all([image(plan.front.file),image(plan.grade.file),image(plan.iconPath)]);
    return {result,plan,item:null,frontImage,gradeImage,iconImage,renderState:'CARD_READY'};
   }));
  }
  if(generation!==normalR9StartGeneration||showing||movieActive||moviePending)throw Error('TARGET_LOAD_CANCELLED_SCENE_CHANGED');
  if(resultCards.some(r=>r.renderState!=='CARD_READY'))throw Error('TARGET_CARD_ASSET_FAILURE_NO_SUBSTITUTION');
  const fxWasEnabled=$('fx-enabled').checked;releaseFXFrames(true);$('fx-enabled').checked=false;
  const fixtureRunId='r31r6-target-'+(++r6Sequence);
  startTen({localDisplay:{targetedFixture:true,pool,fixtureRunId,resultCards,resultOrder:[...keys],displayOrder:Array.from({length:11},(_,i)=>i),fxWasEnabled}});
  normalLocalOutput.textContent=JSON.stringify({classification:'MANUAL_FIXTURE_ONLY',pool,runId:fixtureRunId,randomDraws:0,gaugeIncrement:0,quotaDebit:0,resultOrder:keys},null,2);
 }finally{r6Pending=false;}
}
function r6Replay(){
 if(appQuery.get('mode')!=='engineering'||!session?.targetedFixture||session.batch)return false;
 session.cards.forEach(c=>c.openAt=null);session.effects=[];session.batch=null;session.phase='dealing';session.started=performance.now();session.flipAllPending=false;$('backs').checked=false;schedule();render();return true;
}
if(appQuery.get('mode')==='engineering'){
 await r6Initialization;
 if(normalLocalSimulator&&feverLocalPoolEntryByRowKey.size===134){
  const {mountTargetedFixture}=await import('./targeted-card-fixture.mjs?r31r6=20261105b');
  mountTargetedFixture({mode:appQuery.get('mode'),host:$('diagnostic-mode'),pools:{NORMAL:[...normalLocalPoolEntryByRowKey.values()],FEVER:[...feverLocalPoolEntryByRowKey.values()]},display:r6Display,replay:r6Replay,autoOpen:!r14P32R2R14Enabled&&!r14p5MovieEnabled});
 }
}
// Isolated pre-reveal comparison. Formal player selection and front targets are unchanged.
function cbBackTargets(now){return cbOptions.fxMode==='root1'?cbTargets(now):[];}
function cbTargets(now){
 if(appQuery.get('mode')!=='engineering'||!session?.cardBackReview||!r14p30P7Eligible()||!cbOptions.enabled||now-cbPlayAt<cbOptions.delayMs)return [];
 return session.cardBackReview.flatMap((type,i)=>{if(type!=='legendary'||session.cards[i].openAt!==null)return [];const pose=cardPose(i,now);return [{slot:i+1,root:1,center:{x:640+pose.x+cbOptions.x,y:360-pose.y+cbOptions.y},revealed:true,reviewScale:cbOptions.scale,reviewOpacity:cbOptions.opacity,classification:'SOURCE_PARTIAL_WEB_ADAPTATION'}];});
}
if(appQuery.get('mode')==='engineering'&&appQuery.get('cardBackReview')==='1'){
 const {mountBackReview}=await import('./card-back-review.mjs?p32=20261106a');
 for(const type of ['normal','epic']){const file='assets/cards/ui_item_card_lucky_back_'+type+'.png';imgs.set(file,await image(file));}
 mountBackReview({mode:appQuery.get('mode'),host:$('diagnostic-mode'),
  display:async types=>{const key=[...normalLocalPoolEntryByRowKey.keys()][0];await r6Display('NORMAL',Array(11).fill(key));session.cardBackReview=types;cbPlayAt=performance.now();render();},
  configure:settings=>{if(appQuery.get('mode')!=='engineering')return;const clamp=(v,a,b,d)=>Number.isFinite(v)?Math.min(b,Math.max(a,v)):d;
   if('fxMode' in settings&&['off','root1','backfx'].includes(settings.fxMode))cbOptions.fxMode=settings.fxMode;
   if('enabled' in settings)cbOptions.enabled=!!settings.enabled;
   for(const [key,min,max,def] of [['scale',.25,2,1],['x',-100,100,0],['y',-100,100,0],['opacity',0,1,1],['delayMs',0,5000,0]])if(key in settings)cbOptions[key]=clamp(settings[key],min,max,def);
   if(settings.restart)cbPlayAt=performance.now();render();}
 });
}

// R32R2: policy-based unrevealed backs, independent of front FX eligibility.
function p32BackScene(){
 const now=performance.now(),review=appQuery.get('mode')==='engineering'&&!!session?.cardBackReview;
 const eligible=!document.hidden&&showing&&!movieActive&&!moviePending&&isLocalTenDisplayMode(session?.mode)&&['ready','complete'].includes(session?.phase)&&luckyFeverOverlay.snapshot().activeRunId===null;
 const targets=review?(cbOptions.fxMode==='backfx'?cbTargets(now):[]):eligible?session.displayOrder.flatMap((idx,i)=>{
  if(now<session.started+i*timing.moveMs||session.cards[i].openAt!==null||p31r3CardPolicy(session.resultCards[idx]).backVisualKey!=='back_legendary')return [];
  const pose=cardPose(i,now);return [{slot:i+1,root:1,center:{x:640+pose.x,y:360-pose.y},revealed:true,reviewScale:pose.scale,reviewOpacity:1,classification:'WEB_VISUAL_POLICY_SOURCE_UNRESOLVED_ACTIVATION'}];
 }):[];
 const occluders=eligible?session.cards.flatMap((card,i)=>{if(card.openAt===null)return [];const pose=cardPose(i,now);return [{x:640+pose.x-99.5*pose.scale,y:360-pose.y-125*pose.scale,width:199*pose.scale,height:250*pose.scale}];}):[];
 return {allowPilot:false,result:targets.length?{run:String(session.normalRunId??session.feverRunId??session.metrics.runId),mapping:'P32_ORIGINAL_BACKFX_WEB_PROJECTION',targets,occluders,timeline:appQuery.get('mode')==='engineering'&&appQuery.get('p32Audit')==='1'?{started:session.started,observedAt:now,phase:session.phase,buttonVisibleAt:session.p32ButtonVisibleAt??null,dealCompleteAt:trace.find(e=>e.event==='deal-complete')?.at??null,moveMs:timing.moveMs,slots:session.displayOrder.map((idx,i)=>({slot:i+1,back:p31r3CardPolicy(session.resultCards[idx]).backVisualKey,openAt:session.cards[i].openAt,moveStart:session.started+i*timing.moveMs,land:session.started+(i+1)*timing.moveMs})),flowEvents:trace.filter(e=>/movie-finish|result-bound|deal-start|deal-complete/.test(e.event)).slice(-12)}:null,revealedMask:1,positions:{}}:null};
}
{
 const {createOriginalBackFX}=await import('./p32-canvas-back-fx.mjs?v=1&startupProbe=1');
 p32BackPlayer=createOriginalBackFX({redraw:()=>requestFXRender('back'),appSnapshot:()=>({runId:session?.normalRunId??null,types:session?.cardBackReview??null,options:{...cbOptions},stage:{logical:[1280,720],backing:[canvas.width,canvas.height],css:canvas.getBoundingClientRect().toJSON()},cardRects:session?.cardBackReview?session.cards.map((_,i)=>{const p=cardPose(i,performance.now());return {slot:i+1,center:{x:640+p.x,y:360-p.y},width:199*p.scale,height:250*p.scale};}):[]})});render();
}

// P12-A15-P6: manually invoked F12-only getter. No render, timer, or snapshot hook calls this.
window.__p12UnityMemoryDiagnostics=Object.freeze({
 enabled:p12UnityMemoryDiagnosticEnabled,
 snapshot:()=>{
  if(!p12UnityMemoryDiagnosticEnabled)return {schema:'CrystalChest.P12.UnityMemoryF12.v1',enabled:false,status:'DIAGNOSTIC_DISABLED',runtimes:[]};
  const unavailable=(runtime,status)=>({runtime,enabled:true,available:false,ready:false,loading:false,disposed:false,totalWASMHeapSize:null,usedWASMHeapSize:null,status,error:null});
  const read=(runtime,player,notCreatedStatus)=>typeof player?.readMemoryDiagnostics==='function'?player.readMemoryDiagnostics(true):unavailable(runtime,notCreatedStatus);
  return {schema:'CrystalChest.P12.UnityMemoryF12.v1',enabled:true,capturedAt:new Date().toISOString(),collection:'MANUAL_F12_CALL_ONLY_NO_POLLING',units:'bytes',runtimes:[
   read('P3',r14p30P3Player,'MODULE_NOT_INITIALIZED'),
   read('P7',r14p30P7Player,'MODULE_NOT_INITIALIZED'),
   read('P8',r14p30P8Player,p12P8LazyEnabled?'NOT_CREATED_LAZY':'MODULE_NOT_INITIALIZED'),
   read('P32',p32BackPlayer,'MODULE_NOT_INITIALIZED')
  ]};
 }
});

// Existing diagnostic output only; no GUI or result mutation. One four-pass capture per run.
var p32Root2Audit=null;
function p32AuditWant(now){return appQuery.get('mode')==='engineering'&&appQuery.get('p32Audit')==='1'&&showing&&session?.mode==='local-fever-ten-display'&&session?.phase==='complete'&&session.cards.every(c=>c.openAt!==null&&now-c.openAt>2200)&&p32Root2Audit?.run!==(session.normalRunId??session.feverRunId??session.metrics.runId)&&p31r2OutlineTargets().some(t=>t.root===2)&&!!r14p30P7Player?.snapshot().presentation;}
function p32AuditCapture(now,base){
 const actual=ctx.getImageData(0,0,canvas.width,canvas.height),run=session.normalRunId??session.feverRunId??session.metrics.runId;
 const targets=p31r2OutlineTargets().filter(t=>t.root===2&&t.revealed),rows=[];
 const metric=(roi)=>{const m=ctx.getTransform(),x=Math.max(0,Math.round(roi.x*m.a)),y=Math.max(0,Math.round(roi.y*m.d)),w=Math.min(canvas.width-x,Math.round(roi.w*m.a)),h=Math.min(canvas.height-y,Math.round(roi.h*m.d));if(w<=0||h<=0)return null;const a=ctx.getImageData(x,y,w,h).data;let sum=0,saturated=0;for(let i=0;i<a.length;i+=4){sum+=(a[i]+a[i+1]+a[i+2])/3;if(Math.max(a[i],a[i+1],a[i+2])>=250)saturated++;}return {meanRGB:sum/(w*h),saturatedFraction:saturated/(w*h),pixels:w*h,logical:roi};};
 for(const background of [false,true])for(const p7 of [false,true]){
  ctx.putImageData(base,0,0);if(background&&r14p30P8Eligible())r4Span('background',()=>withP11ContentClip(()=>r14p30P8Player?.paint(ctx,fixture.background+':'+r14p30P1BVariant+':'+r14p30P1BAlpha)));r4Span('cards',()=>cards(now));if(p7)r14p30P7Player.paint(ctx);
  const stats=targets.map(t=>({slot:t.slot,roi:{leftRidge:metric({x:t.center.x-102,y:t.center.y-60,w:8,h:120}),topLeft:metric({x:t.center.x-107,y:t.center.y-132,w:22,h:22}),outerGlow:metric({x:t.center.x-119,y:t.center.y-60,w:10,h:120})}}));
  const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;out.getContext('2d').drawImage(canvas,0,0);const a=document.createElement('a');a.id=`p32-audit-bg${+background}-p7${+p7}`;a.textContent=a.id+' PNG';a.download=a.id+'.png';a.href=out.toDataURL('image/png');document.querySelector('#p32-frames')?.append(a);rows.push({background,p7,stats});
 }
 const front=r14p30P7Player.snapshot(),background=r14p30P8Player?.snapshot();
 ctx.putImageData(actual,0,0);p32Root2Audit={run,at:now,rows,sourceRows:p31r3VisualRows(),backScope:p32BackPlayer.snapshot().scope,p7:{native:front.native,presentation:front.presentation,choice:front.choice,effectiveMask:front.effectiveMask,mount:front.mount,composite:front.composite,haloShader:front.haloShader},background:{native:background?.native,presentation:background?.presentation,choice:background?.choice,role:background?.backgroundRole},classification:'SAME_JS_TURN_SOURCE_FRAMES_WEB_COMPOSITE_DECOMPOSITION_NOT_NATIVE_PARITY',backgroundEligible:r14p30P8Eligible()};
}

// Root2-only terminal RGB candidates. Same canvas baseline and same GPU frame for all exports.
var p32Root2Review=null;
function p32Root2ReviewWant(now){return appQuery.get('mode')==='engineering'&&appQuery.get('root2Review')==='1'&&showing&&session?.phase==='complete'&&session.cards.every(c=>c.openAt!==null&&now-c.openAt>2200)&&p32Root2Review?.run!==(session.normalRunId??session.feverRunId??session.metrics.runId)&&p31r2OutlineTargets().some(t=>t.root===2&&t.revealed)&&!!r14p30P7Player?.snapshot().presentation;}
function p32Root2ReviewCapture(now,base){
 document.querySelectorAll('#p7-frames a[id^="root2-candidate-"]').forEach(a=>a.remove());
 const actual=ctx.getImageData(0,0,canvas.width,canvas.height),source=r14p30P7Player.snapshot(),rows=[];
 for(const coefficient of [1,.5,.3,1.1]){
  ctx.putImageData(base,0,0);r14p30P7Player.paint(ctx,coefficient);
  const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;out.getContext('2d').drawImage(canvas,0,0);const a=document.createElement('a');a.id='root2-candidate-'+coefficient;a.textContent='Root2 '+coefficient+' same-frame PNG';a.download=a.id+'.png';a.href=out.toDataURL('image/png');document.querySelector('#p7-frames')?.append(a);rows.push({coefficient,sourceFrame:source.presentation.frame});
 }
 ctx.putImageData(actual,0,0);p32Root2Review={run:session.normalRunId??session.feverRunId??session.metrics.runId,at:now,rows,sourceRows:p31r3VisualRows(),presentation:source.presentation,root2Native:source.native,backScope:p32BackPlayer?.snapshot().scope,classification:'WEB_VISUAL_ADAPTATION_CANDIDATE_SAME_GPU_FRAME_ROOT2_ONLY',formalDefault:1};
}

// Keep existing Root2 review controls visible above long source receipts.
if(appQuery.get('mode')==='engineering'&&appQuery.get('root2Review')==='1'){
 const diagnostic=$('diagnostic-mode'),controls=$('p30p7-controls'),summary=diagnostic.querySelector('summary');
 if(controls){diagnostic.prepend(summary);summary.after(controls);diagnostic.open=true;diagnostic.scrollTop=0;diagnostic.addEventListener('toggle',()=>{if(diagnostic.open)diagnostic.scrollTop=0;});}
}
// P5 focuses on the original shop/player stage; leave legacy diagnostics available but collapsed.
if(r14p5MovieEnabled)$('diagnostic-mode').open=false;

if(appQuery.has('phoneDiag'))window.__phoneFlow=()=>({mode:session?.mode,phase:session?.phase,opened:session?.cards?.filter(c=>c.openAt!==null).length,p3:r14p30P3Player?.snapshot(),p8HiddenRedrawsSkipped,resourceLoading:resourceSnapshot(),shopNormalCache:{...shopNormalCacheStats,retained:retainedShopVariants.size>0,variants:retainedShopVariants.size},receiptPolicy:{...playerReceiptPolicy},shopDot:window.CrystalDot?.snapshot(),slowRenderFrames:phoneSlowRenderFrames.map(row=>({...row})),sceneTransitionCosts:sceneTransitionCosts.map(row=>({...row})),feverBackground:window.__feverBackgroundIntegration?.snapshot(),renderCostMs:lastVisualQualityRenderMs,stageRenderCosts:JSON.parse(JSON.stringify(stageRenderCosts)),shopOptions:{idleSync:p12A16IdleRenderSyncEnabled,ambientCache:p12AmbientStaticCacheEnabled},p7:r14p30P7Player?.snapshot(),p32:p32BackPlayer?.snapshot(),flipFlash:window.__r14p27R4?.snapshot(),lucky:luckyFeverOverlay.snapshot(),trace:trace.slice(-12)});

if (serialEarlyFlash && r14p27R4Enabled) {
  setTimeout(() => {
    for (const [index, frame] of (fxData.captures['03']?.frames || []).entries()) {
      if (frame?.file) requestFXFrame('03', index, { pin: true });
    }
  }, 1000);
}

if (appQuery.has('phoneDiag') && appQuery.get('luckyProbe') === '1') {
  window.__phoneLuckyArm = armLuckyFeverDiagnosticForCurrentRun;
}

// Player settings live outside the game canvas; never resample on UI updates.
let playerResetting=false;
function setPlayerMuted(value){
 playerRecords.setMuted(value);$('sound-enabled').checked=!value;
 movie.muted=!!value;
 if(audioMasterGain&&audioContext)audioMasterGain.gain.setValueAtTime(value?0:1,audioContext.currentTime);
}
window.CrystalChestPlayer=Object.freeze({snapshot:()=>({...playerRecords.snapshot(),ready:!playerResetting&&window.__releaseOptionalReady===true,feverState:localFeverSimulation.snapshot()}),setMuted:setPlayerMuted,reset(){playerResetting=true;window.__releaseOptionalReady=false;playerRecords.reset({dispose:true});flowGeneration++;normalLocalDrawGeneration++;if(raf)cancelAnimationFrame(raf);luckyFeverOverlay.cancel('player-full-reset');movie.pause();audioContext?.close()?.catch(()=>{});location.reload();}});
setPlayerMuted(playerRecords.snapshot().muted);
window.dispatchEvent(new Event('crystalchest-player-state'));

// Release startup requires essential sources before enabling purchases.
try {
 await Promise.all([measureStartup('P3.prepare',()=>r14p30P3Player?.prepare?.()),measureStartup('P7.prepare',()=>r14p30P7Player?.ensurePrepared?.()),
  measureStartup('P32.prepare',()=>p32BackPlayer?.ensurePrepared?.()),measureStartup('P8.prepare',()=>r14p30P8Player?.ensurePrepared?.()),
  measureStartup('shop-dot.prepare',()=>window.CrystalDot?.ready),measureStartup('screen-fx.prepare',()=>screenFxCandidate?.assetsReady)]);
 for(const player of [r14p30P3Player,r14p30P7Player,p32BackPlayer,r14p30P8Player].filter(Boolean)){
  const state=player.snapshot();if(state.error||state.ready===false)throw Error(state.error||'ESSENTIAL_EFFECT_NOT_READY');
 }
 if(window.CrystalDot?.snapshot().loaded!==true)throw Error('SHOP_DOT_NOT_READY');
 if(screenFxCandidate?.snapshot().assetErrors.length)throw Error('FEVER_SCREEN_ASSET_FAILURE');
 window.__releaseOptionalPromise=measureStartup('Lucky.prepare',()=>window.LUCKY_FEVER_COMPOSITION.ensureReady()).then(()=>{
  const rect=stage.getBoundingClientRect();
  window.LUCKY_FEVER_COMPOSITION.prepareFirstFrame({width:rect.width,height:rect.height});
  window.__releaseOptionalDone?.(true);
 }).catch(error=>window.__releaseOptionalDone?.(false,error));
 window.__releaseMarkReady?.('app');
}catch(error){window.__releaseFail?.(error);}
