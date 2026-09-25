(() => {
    'use strict';

    const scene = window.MAPLEM_UI_STATIC_SCENE;
    const fixture = window.MAPLEM_UI_STATE_FIXTURE || {};
    if (!scene || !scene.hierarchy) return;

    const TITLE_PATH = 'VarB_107Popup/title_align/Title';
    const INFO_PATH = 'VarB_107Popup/title_align/Info';
    const SPACE_PATH = 'VarB_107Popup/title_align/InfoButtonSpace';
    const COST_AMOUNT_PATHS = [
        'VarB_107Popup/Group/Pray/Right/CostDesc/Cost/CharacterCoin/Amount',
        'VarB_107Popup/Group/Pray/Right/CostDesc/Cost/Meso/Amount'
    ];

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
        if ('X' in node.localPosition || !('x' in node.localPosition)) node.localPosition.X = value;
        else node.localPosition.x = value;
    }

    // Cost labels are runtime values and can become wider than the serialized examples.
    // Use the player's existing UILabel ShrinkContent path (mOverflow=0) only for the two
    // amount labels. This preserves their authored boxes/alignment and does not move icons,
    // cost groups, hit targets, gameplay state, animation, audio, fullscreen or bridge code.
    const costAmountFit = COST_AMOUNT_PATHS.map(path => {
        const node = findNode(scene.hierarchy, path);
        const label = componentForNode(node, 'UILabel');
        if (!label) return { path, applied: false };
        if (!label.fields) label.fields = {};
        const serializedOverflow = label.fields.mOverflow;
        label.fields.mOverflow = 0;
        label.fields.mMaxLineCount = 1;
        return { path, applied: true, serializedOverflow, runtimeOverflow: 0 };
    });

    const titleNode = findNode(scene.hierarchy, TITLE_PATH);
    const infoNode = findNode(scene.hierarchy, INFO_PATH);
    const spaceNode = findNode(scene.hierarchy, SPACE_PATH);
    const titleLabel = componentForNode(titleNode, 'UILabel');

    let titleInfoLayout;
    if (!titleNode || !infoNode || !titleLabel) {
        titleInfoLayout = {
            applied: false,
            reason: 'required title/info/UILabel node missing',
            hasTitleNode: Boolean(titleNode),
            hasInfoNode: Boolean(infoNode),
            hasTitleLabel: Boolean(titleLabel)
        };
    } else {
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
            context.font = `${italic}${weight} ${fontSize}px "Microsoft JhengHei","Segoe UI",sans-serif`;
            const chars = Array.from(titleText);
            measuredTitleWidth = chars.reduce((sum, char, index) =>
                sum + context.measureText(char).width + (index + 1 < chars.length ? spacingX : 0), 0);
        }
        measuredTitleWidth = Math.max(serializedTitleWidth, Math.ceil(measuredTitleWidth));
        const infoSerializedX = getPositionX(infoNode);
        const spaceSerializedX = getPositionX(spaceNode);
        const expansionDelta = measuredTitleWidth - serializedTitleWidth;
        setPositionX(infoNode, infoSerializedX + expansionDelta);
        if (spaceNode) setPositionX(spaceNode, spaceSerializedX + expansionDelta);
        titleInfoLayout = {
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
        };
    }

    window.MAPLEM_PLAYER_PRESENTATION_PATCH = {
        schema: 'GMSM.LightSanctumPray.PlayerPresentationPatch.v4',
        titleInfoLayout,
        costAmountFit: {
            applied: costAmountFit.some(x => x.applied),
            mode: 'UILabel ShrinkContent via existing player labelLayout; single-line; authored bounds preserved',
            targets: costAmountFit
        },
        mobileTapHighlightSuppressedByCss: true
    };
})();
