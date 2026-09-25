(() => {
    'use strict';
    const POPUP_SRC = 'pray-confirm-popup/index.html?v=20260925-fix13';
    const BLANK_SRC = 'about:blank';
    const overlay = document.getElementById('prayConfirmOverlay');
    const frame = document.getElementById('prayConfirmFrame');
    const simStatus = document.getElementById('gameplaySimStatus');
    if (!overlay || !frame) return;
    function isIOSLike(){const ua=String(navigator.userAgent||'');return /iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&Number(navigator.maxTouchPoints||0)>1)}
    function statusText(){return String(simStatus&&simStatus.textContent||'')}
    function isLoaded(){return frame.dataset.loaded==='1'}
    function loadPopup(){if(isLoaded())return;frame.dataset.loaded='1';frame.src=POPUP_SRC}
    function unloadPopup(){if(!isLoaded())return;frame.src=BLANK_SRC;frame.dataset.loaded='0'}
    const ios=isIOSLike();frame.dataset.loaded='0';frame.src=BLANK_SRC;
    if(!ios){loadPopup()}else{function reconcileMobileResidency(){const skipOff=statusText().includes('SkipConfirm OFF');if(!overlay.hidden||skipOff)loadPopup();else unloadPopup()}new MutationObserver(reconcileMobileResidency).observe(overlay,{attributes:true,attributeFilter:['hidden']});if(simStatus)new MutationObserver(reconcileMobileResidency).observe(simStatus,{childList:true,characterData:true,subtree:true});reconcileMobileResidency()}
    window.__LS_PLAYER_SHELL__=Object.freeze({version:'Fix13-prefab-hit-target-closure',desktopConfirmMode:'resident-stable-p137',iosConfirmMode:'lazy-while-confirmation-enabled',gameplayOwnership:'player-presentation-only'});
})();