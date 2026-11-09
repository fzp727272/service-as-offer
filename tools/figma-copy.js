(() => {
  const rendererReady = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("截图组件加载失败，请检查网络连接后刷新页面重试。"));
    document.head.append(script);
  });

  const toDataUrl = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const embedUrl = async rawUrl => {
    const url = new URL(rawUrl, document.baseURI);
    if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return url.href;
    try {
      return await toDataUrl(await (await fetch(url.href)).blob());
    } catch {
      return url.href;
    }
  };

  const inlineCssUrls = async css => {
    const matches = [...css.matchAll(/url\((['"]?)(.*?)\1\)/gi)];
    let output = css;
    for (const match of matches) {
      const source = match[2].trim();
      if (!source || source.startsWith("data:") || source.startsWith("#")) continue;
      const embedded = await embedUrl(source);
      output = output.replace(match[0], `url("${embedded.replaceAll('"', '%22')}")`);
    }
    return output;
  };

  const renderArtboardToPng = async (artboard, css, bodyClasses) => {
    const width = Math.ceil(artboard.getBoundingClientRect().width) || 375;
    const height = Math.ceil(artboard.getBoundingClientRect().height) || 812;
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("无法生成画板预览图片。");
    context.scale(scale, scale);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    const background = document.createElement("div");
    background.style.cssText = `position:fixed;left:-100000px;top:0;width:${width}px;height:${height}px;overflow:hidden;background:#fff;z-index:-1`;
    const clonedArtboard = artboard.cloneNode(true);
    clonedArtboard.style.cssText += `;position:relative!important;left:0!important;top:0!important;width:${width}px!important;height:${height}px!important;min-height:0!important;margin:0!important;transform:none!important;box-shadow:none!important`;
    background.append(clonedArtboard);
    document.body.append(background);
    try {
      // Wait two frames for layout to settle; rAF never fires in hidden/background
      // tabs, so race with a timeout to avoid hanging the copy flow there.
      await Promise.race([
        new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        new Promise(resolve => setTimeout(resolve, 120)),
      ]);
      await rendererReady;
      const rendered = await window.html2canvas(background.firstElementChild, { width, height, scale, backgroundColor: "#fff", useCORS: true, logging: false, windowWidth: width });
      return await new Promise((resolve, reject) => rendered.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("无法生成画板 PNG 图片。"));
      }, "image/png"));
    } finally {
      background.remove();
    }
  };

  window.copyCurrentArtboardToFigma = async () => {
    const artboard = document.querySelector("[data-figma-artboard], .artboard, .page-artboard, .device, .phone");
    if (!artboard) throw new Error("当前页面没有可复制的手机画板。");
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      throw new Error("浏览器不支持 HTML 剪贴板，请使用最新版 Chrome 并通过 localhost 打开页面。");
    }

    const clone = artboard.cloneNode(true);
    clone.querySelectorAll("script, .journey-panel, [data-figma-copy-ui]").forEach(node => node.remove());
    for (const image of clone.querySelectorAll("img[src]")) image.src = await embedUrl(image.src);

    const styles = [];
    for (const sheet of document.styleSheets) {
      try {
        styles.push([...sheet.cssRules].map(rule => rule.cssText).join("\n"));
      } catch {
        if (sheet.href) {
          try { styles.push(await (await fetch(sheet.href)).text()); } catch { /* inaccessible stylesheet */ }
        }
      }
    }

    const css = await inlineCssUrls(styles.join("\n"));
    const bodyClasses = [...document.body.classList].join(" ");
    const png = await renderArtboardToPng(clone, css, bodyClasses);
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=375, initial-scale=1"><style>${css}</style><style>html,body{margin:0;width:375px;min-height:0}body{overflow:hidden}.figma-copy-canvas{width:375px;height:812px;overflow:hidden;background:#fff}</style></head><body class="${bodyClasses}"><main class="figma-copy-canvas">${clone.outerHTML}</main></body></html>`;
    await navigator.clipboard.write([new ClipboardItem({
      "image/png": png,
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob(["Service as Offer · 手机界面（含样式的画板图片）"], { type: "text/plain" }),
    })]);
  };

})();
