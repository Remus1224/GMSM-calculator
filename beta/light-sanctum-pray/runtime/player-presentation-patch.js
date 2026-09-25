(() => {
    'use strict';

    const scene = window.MAPLEM_UI_STATIC_SCENE;
    const fixture = window.MAPLEM_UI_STATE_FIXTURE || {};
    if (!scene || !scene.hierarchy) return;

    const TITLE_PATH = 'VarB_107Popup/title_align/Title';
    const INFO_PATH = 'VarB_107Popup/title_align/Info';
    const SPACE_PATH = 'VarB_107Popup/title_align/InfoButtonSpace';

    function findNode(node, path) {
        if (!node || typeof node !== 'object') return null;
        if (node.hierarchyPath === path) return node;
        for (const child of node.children || []) {
            const found = findNode(child, path);
            if (found) return found;
        }
        return null;
    }

    function exactPathIdFromObjectId(objectId) {
        const text = String(objectId || '');
        const colon = text.lastIndexOf(':');
        return colon >= 0 ? text.slice(colon + 1) : text;
    }

    function componentForNode(node, className) {
        if (!node) return null;

        // IMPORTANT: hierarchy node gameObjectPathId is a JavaScript Number and may have
        // already lost precision for 64-bit Unity IDs. Do not join through that numeric ID.
        // The hierarchy's component descriptor keeps an exact objectId string, so resolve
        // through the component's own PathID instead.
        const descriptor = (node.components || []).find(entry =>
            String(entry.classOrName || '') === className ||
            String(entry.runtimeType || '') === className
        );
        if (descriptor) {
            const exactComponentPathId = exactPathIdFromObjectId(descriptor.objectId);
            const exactMatch = (scene.components || []).find(component =>
                String(component.class || '') === className &&
                String(component.pathIdText || exactPathIdFromObjectId(component.objectId) || component.pathId || '') === exactComponentPathId
            );
            if (exactMatch) return exactMatch;
        }

        // Safe fallback only for IDs that already carry an exact text form.
        const exactGoId = String(node.gameObjectPathIdText || '');
        if (exactGoId) {
            return (scene.components || []).find(component =>
                String(component.class || '') === className &&
                String(component.gameObjectPathIdText || '') === exactGoId
            ) || null;
        }
        return null;
    }

    function numeric(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    function getPositionX(node) {
        return numeric(node?.localPosition?.X ?? node?.localPosition?.x, 0);
    }

    function setPositionX(node, value) {
        if (!node) return;
        if (!node.localPosition) node.localPosition = { X: 0, Y: 0, Z: 0 };
        if ('X' in node.localPosition || !('x' in node.localPosition)) {
            node.localPosition.X = value;
        } else {
            node.localPosition.x = value;
        }
    }

    const titleNode = findNode(scene.hierarchy, TITLE_PATH);
    const infoNode = findNode(scene.hierarchy, INFO_PATH);
    const spaceNode = findNode(scene.hierarchy, SPACE_PATH);
    const titleLabel = componentForNode(titleNode, 'UILabel');

    if (!titleNode || !infoNode || !titleLabel) {
        window.MAPLEM_PLAYER_PRESENTATION_PATCH = {
            schema: 'GMSM.LightSanctumPray.PlayerPresentationPatch.v3',
            titleInfoLayout: {
                applied: false,
                reason: 'required title/info/UILabel node missing',
                hasTitleNode: Boolean(titleNode),
                hasInfoNode: Boolean(infoNode),
                hasTitleLabel: Boolean(titleLabel)
            },
            mobileTapHighlightSuppressedByCss: true
        };
        return;
    }

    const titleText = String(
        fixture.textByHierarchyPath?.[TITLE_PATH]
        || scene.localizationByLabelPathId?.[String(titleLabel.pathIdText || titleLabel.pathId || '')]?.text
        || '光之聖所'
    );

    const fields = titleLabel.fields || {};
    const serializedTitleWidth = Math.max(1, numeric(fields.mWidth, 8));
    const fontSize = Math.max(6, numeric(fields.mFontSize, 32));
    const fontStyle = Math.round(numeric(fields.mFontStyle, 0));
    const weight = (fontStyle === 1 || fontStyle === 3) ? '700' : '400';
    const italic = (fontStyle === 2 || fontStyle === 3) ? 'italic ' : '';
    const spacingX = numeric(fields.mSpacingX, 0);

    const measureCanvas = document.createElement('canvas');
    const context = measureCanvas.getContext('2d');
    let measuredTitleWidth = fontSize * Array.from(titleText).length;
    if (context) {
        // Match player.js label font stack to avoid measuring with a different typeface.
        context.font = `${italic}${weight} ${fontSize}px "Microsoft JhengHei","Segoe UI",sans-serif`;
        const chars = Array.from(titleText);
        measuredTitleWidth = chars.reduce((sum, char, index) => {
            return sum + context.measureText(char).width + (index + 1 < chars.length ? spacingX : 0);
        }, 0);
    }
    measuredTitleWidth = Math.max(serializedTitleWidth, Math.ceil(measuredTitleWidth));

    // Serialized LeftToRight positions were authored while the ResizeFreely UILabel width
    // was only 8 px. Unity runtime expands the label to its actual text width, then shifts
    // following siblings. Recreate that exact delta before player.js flattens the scene.
    const infoSerializedX = getPositionX(infoNode);
    const spaceSerializedX = getPositionX(spaceNode);
    const expansionDelta = measuredTitleWidth - serializedTitleWidth;

    setPositionX(infoNode, infoSerializedX + expansionDelta);
    if (spaceNode) setPositionX(spaceNode, spaceSerializedX + expansionDelta);

    window.MAPLEM_PLAYER_PRESENTATION_PATCH = {
        schema: 'GMSM.LightSanctumPray.PlayerPresentationPatch.v3',
        titleInfoLayout: {
            applied: true,
            titleText,
            serializedTitleWidth,
            measuredTitleWidth,
            expansionDelta,
            infoSerializedX,
            infoPatchedX: infoSerializedX + expansionDelta,
            spaceSerializedX,
            spacePatchedX: spaceNode ? spaceSerializedX + expansionDelta : null,
            componentLookup: 'exact component objectId/pathIdText; no 64-bit numeric GameObject join',
            source: 'Prefab LeftToRight layout + UILabel ResizeFreely width-delta reconstruction'
        },
        mobileTapHighlightSuppressedByCss: true
    };
})();
