(() => {
  "use strict";

  const EXPORT_BUTTON = "#save-table-image";
  const TARGET_SELECTORS = [".hero-compact", ".data-section", ".note-panel"];
  const CROP_PADDING = 14;
  let exporting = false;
  let bypassOnce = false;

  const darkMode = () => document.documentElement.getAttribute("data-theme") === "dark";

  const showToast = (message, duration = 3000) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.hidden = true; }, duration);
  };

  const hideToast = () => {
    const toast = document.getElementById("toast");
    if (toast) toast.hidden = true;
  };

  const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const getTargetRect = () => {
    const nodes = TARGET_SELECTORS.map(selector => document.querySelector(selector));
    if (nodes.some(node => !node)) throw new Error("找不到目前要輸出的 Hero / Table / Note");

    const rects = nodes.map(node => node.getBoundingClientRect());
    const left = Math.min(...rects.map(rect => rect.left)) - CROP_PADDING;
    const top = Math.min(...rects.map(rect => rect.top)) - CROP_PADDING;
    const right = Math.max(...rects.map(rect => rect.right)) + CROP_PADDING;
    const bottom = Math.max(...rects.map(rect => rect.bottom)) + CROP_PADDING;

    return {
      left: Math.max(0, left),
      top: Math.max(0, top),
      right: Math.min(window.innerWidth, right),
      bottom: Math.min(window.innerHeight, bottom),
      rawLeft: left,
      rawTop: top,
      rawRight: right,
      rawBottom: bottom
    };
  };

  const isFullyVisible = rect => (
    rect.rawLeft >= 0 &&
    rect.rawTop >= 0 &&
    rect.rawRight <= window.innerWidth &&
    rect.rawBottom <= window.innerHeight
  );

  const waitForVideoFrame = async video => {
    if (typeof video.requestVideoFrameCallback === "function") {
      await new Promise(resolve => video.requestVideoFrameCallback(() => resolve()));
      return;
    }
    await nextFrame();
  };

  const captureCurrentTab = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      const error = new Error("目前瀏覽器不支援分頁畫面擷取");
      error.code = "UNSUPPORTED";
      throw error;
    }

    const targetRect = getTargetRect();
    if (!isFullyVisible(targetRect)) {
      const error = new Error("Hero、表格與資料說明目前沒有完整顯示在同一個畫面中");
      error.code = "TARGET_NOT_VISIBLE";
      throw error;
    }

    showToast("請在分享視窗選擇「這個分頁」，即可儲存眼前看到的玻璃畫面。", 7000);

    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "exclude",
        monitorTypeSurfaces: "exclude"
      });

      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error("沒有取得分頁畫面");

      const displaySurface = track.getSettings?.().displaySurface;
      if (displaySurface && displaySurface !== "browser") {
        const error = new Error("請選擇瀏覽器中的「這個分頁」，不要選擇視窗或整個螢幕");
        error.code = "WRONG_SURFACE";
        throw error;
      }

      hideToast();
      await nextFrame();

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();
      await waitForVideoFrame(video);
      await waitForVideoFrame(video);

      if (!video.videoWidth || !video.videoHeight) throw new Error("分頁畫面尚未準備完成");

      const rect = getTargetRect();
      if (!isFullyVisible(rect)) {
        const error = new Error("擷取期間內容移出了可見範圍");
        error.code = "TARGET_NOT_VISIBLE";
        throw error;
      }

      const scaleX = video.videoWidth / window.innerWidth;
      const scaleY = video.videoHeight / window.innerHeight;
      const sourceX = Math.round(rect.left * scaleX);
      const sourceY = Math.round(rect.top * scaleY);
      const sourceW = Math.round((rect.right - rect.left) * scaleX);
      const sourceH = Math.round((rect.bottom - rect.top) * scaleY);

      if (sourceW <= 0 || sourceH <= 0) throw new Error("無法計算輸出範圍");

      const canvas = document.createElement("canvas");
      canvas.width = sourceW;
      canvas.height = sourceH;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("瀏覽器無法建立輸出圖片");

      ctx.drawImage(
        video,
        sourceX, sourceY, sourceW, sourceH,
        0, 0, sourceW, sourceH
      );

      return canvas;
    } finally {
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const canvasToBlob = canvas => new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("無法建立 PNG")), "image/png");
  });

  const getUpdatedAt = async () => {
    try {
      const response = await fetch("data/light-sanctum-pray-exp.json", { cache: "no-store" });
      if (!response.ok) return "MapleStoryM";
      const data = await response.json();
      return data.updatedAt || "MapleStoryM";
    } catch (_) {
      return "MapleStoryM";
    }
  };

  const deliverBlob = async blob => {
    const updatedAt = await getUpdatedAt();
    const theme = darkMode() ? "夜間" : "日間";
    const name = `光之聖所祈禱經驗表_${updatedAt}_${theme}_畫面.png`;
    const file = new File([blob], name, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "光之聖所祈禱經驗表" });
      showToast("已擷取目前畫面，圖片已交給系統分享選單");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast("已依目前畫面建立 PNG");
  };

  const useLegacyFallback = button => {
    bypassOnce = true;
    showToast("此環境無法完整擷取目前分頁，改用相容圖片輸出。", 2600);
    setTimeout(() => button.click(), 0);
  };

  const exportWysiwyg = async button => {
    if (exporting) return;
    exporting = true;

    try {
      button.blur();
      const canvas = await captureCurrentTab();
      const blob = await canvasToBlob(canvas);
      await deliverBlob(blob);
    } catch (error) {
      if (error?.name === "AbortError" || error?.name === "NotAllowedError") {
        hideToast();
        showToast("已取消畫面擷取");
        return;
      }

      if (error?.code === "WRONG_SURFACE") {
        hideToast();
        showToast(error.message, 4200);
        return;
      }

      if (error?.code === "UNSUPPORTED" || error?.code === "TARGET_NOT_VISIBLE") {
        console.warn("WYSIWYG export fallback", error);
        useLegacyFallback(button);
        return;
      }

      console.error("WYSIWYG export failed", error);
      hideToast();
      showToast(`畫面擷取失敗：${error?.message || error}`, 4200);
    } finally {
      exporting = false;
    }
  };

  document.addEventListener("click", event => {
    const button = event.target.closest?.(EXPORT_BUTTON);
    if (!button) return;

    if (bypassOnce) {
      bypassOnce = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    exportWysiwyg(button);
  }, true);
})();
