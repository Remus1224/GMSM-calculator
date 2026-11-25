import admission from '../data/result-visual-admission.json?r31r5=20261105' with {type:'json'};
// R31R4: separate exact static Equip policy and source-keyed player exceptions.
// Neither layer establishes the live native outline predicate.
export function cardResultVisualPolicy(record, official) {
 const item=record?.result?.resultPayload?.item??record?.item;
 const exact=record?.result?.identity?.status==='EXACT_CLIENT_IDENTITY';
 const itemType=exact?item?.itemType??null:null;
 const effectiveGrade=exact?item?.effectiveGrade?.code??item?.basicGrade?.code??null:null;
 const originalGrade=official?.officialGrade??record?.result?.officialGrade??null;
 // Announcement-grade fallback is a disclosed Web presentation, never an ItemID/type join.
 const grade=effectiveGrade??({'罕見':'Unique','傳說':'Legendary','神話':'Mythic','古代':'Ancient','混沌':'Chaos'}[originalGrade]??null);
 const identity=record?.result?.identity;
 const exception=exact&&admission.playerExceptions.find(e=>e.pool===record?.result?.pool&&e.sourceRowKey===record?.result?.sourceRowKey&&e.sourceRowKey===official?.officialSourceRowKey&&e.itemId===identity.verifiedClientItemId&&e.itemId===official?.clientIdentity?.verifiedClientItemId&&official?.clientIdentity?.identityVerdict==='EXACT_CLIENT_IDENTITY');
 const ownRow=record?.result?.sourceRowKey===official?.officialSourceRowKey&&record?.result?.pool===official?.pool;
 const equipRule=itemType==='Equip'?admission.equipPolicy[effectiveGrade]:null;
 const announcementRule=ownRow&&originalGrade?admission.equipPolicy[grade]:null;
 const visualRule=equipRule??announcementRule;
 const backVisualKey=exception?.backVisualKey??visualRule?.back??(['Legendary','Mythic'].includes(grade)?'back_legendary':'back_unique');
 // Data admits exact typed Equip separately from the three historical player exceptions.
 // Unknown identities never acquire an exception by name, art, grade or slot.
 const extraOutlineKind=exception?.extraOutlineKind??visualRule?.outline??0;
 return {originalGrade,effectiveGrade,itemType:exception?.itemType??itemType,backVisualKey,extraOutlineKind,
  ruleLayer:exception?'PLAYER_AUTHORITY_EXCEPTION':equipRule?'EXACT_STATIC_EQUIP':announcementRule?'PLAYER_ANNOUNCEMENT_GRADE_WEB_FALLBACK':'UNRESOLVED_OR_ANNOUNCEMENT_FALLBACK',
  visualAuthority:exception?.authority??visualRule?.authority??'SOURCE_UNRESOLVED',
  backEvidence:exception?.backClassification??(visualRule?'PLAYER_DECISION_R31R5_WEB_VISUAL_ADAPTATION':(['Legendary','Mythic','Unique'].includes(grade)?'SOURCE_CONDITIONAL_GRADE_MAPPING_LIVE_848_UNKNOWN':'SOURCE_UNRESOLVED_SAFE_FALLBACK')),
  itemId:exact?identity.verifiedClientItemId??item?.itemID??null:null,classification:'WEB_VISUAL_ADAPTATION',
  nativePredicate:'SOURCE_UNRESOLVED',gradeEvidence:effectiveGrade?'EXACT_STATIC_ITEM_NOT_SERVER_RESULT':originalGrade?'OFFICIAL_ANNOUNCEMENT_NOT_LIVE_GRADE':'UNKNOWN'};
}
export function retryVoucherQuantity(session, quantities) {
 return session?.count===11||['normal-local-ten-draw','normal-local-ten-display','local-fever-ten-display'].includes(session?.mode)?quantities.ten:quantities.retry;
}
