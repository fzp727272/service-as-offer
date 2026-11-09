const params = new URLSearchParams(location.search);
    const benefits = {
      inspection: { title:"新车安全检查", service:"安全检查", description:"检查主要部件、紧固件并润滑链条", price:"¥69.90" },
      installation: { title:"新车安装权益", service:"自行车新车安装", description:"到店安装并检查自行车", price:"以服务说明为准" },
      "six-month": { title:"6 个月免费安全检查", service:"6 个月免费安全检查", description:"购车关联检查服务，具体范围以正式说明为准", price:"待确认" }
    };
    const benefitId = params.get("benefit") || "inspection";
    const scenario = params.get("state") || "available";
    const benefit = Object.hasOwn(benefits, benefitId) ? benefits[benefitId] : null;
    const equipmentName = params.get("equipment") || (benefitId === "installation" ? "Riverside Touring 自行车" : "Rockrider ST 530 山地自行车");
    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    const valid = benefit && ["available","pending","unavailable"].includes(scenario);
    const content = document.getElementById("content");
    const redeem = document.getElementById("redeem");
    const overlay = document.getElementById("overlay");
    const sheet = overlay.querySelector(".sheet");
    const confirm = document.getElementById("confirm");
    const close = document.getElementById("close");
    const successOverlay = document.getElementById("success-overlay");
    const successConfirm = document.getElementById("success-confirm");
    let trigger = null;
    const icon = name => `<svg aria-hidden="true"><use href="#${name}"/></svg>`;
    const lockTargets = () => [content, document.querySelector(".nav"), document.querySelector(".footer"), document.querySelector(".journey-panel")].filter(Boolean);
    const setInert = value => lockTargets().forEach(el => { el.inert = value; });
    if (!valid) {
      content.innerHTML = '<section class="benefit-intro"><h2>无法展示此权益</h2><p>权益链接中的信息无效，请返回首页重新选择权益。</p></section>';
      redeem.disabled = true;
      redeem.textContent = "无法兑换";
      document.getElementById("footer-label").textContent = "请重新核对权益";
    } else {
      const serviceUrl = new URL("02-service-detail.html", location.href);
      serviceUrl.search = new URLSearchParams({category:"bike", name:benefit.service, description:benefit.description, context:"benefit", benefit:benefitId, state:scenario, equipment:equipmentName, sourceOrder:params.get("sourceOrder") || "810263", entry:params.get("entry") || "service"});
      if (benefitId === "inspection") serviceUrl.searchParams.set("price","69.90");
      content.innerHTML = `
        <section class="benefit-intro" aria-labelledby="benefit-title">
          <span class="benefit-status">${icon("check")}${scenario === "available" ? "可兑换权益" : scenario === "pending" ? "商品关联待同步" : "权益暂不可用"}</span>
          <h2 id="benefit-title">${benefit.title}</h2>
          <p>购买装备附带的服务，不用再买一次。</p>
        </section>
        ${scenario !== "available" ? `<p class="state-message" role="status">${scenario === "pending" ? "来源订单商品尚未同步，请稍后重新查看。核对关联商品后才可兑换。" : "当前权益不可兑换，请核对权益状态与使用条件，不要重复购买服务。"}</p>` : ""}
        <section class="service-section" aria-labelledby="service-title">
          <div class="section-heading"><h2 id="service-title">服务说明</h2><small>点击查看详情</small></div>
          <a class="service-link" href="${serviceUrl.href}" aria-label="查看${benefit.service}服务详情">
            <img class="service-photo" src="assets/figma/order-bike-repair.png" alt="自行车服务场景示意">
            <div class="service-copy"><h3>${benefit.service}</h3><p>${benefit.description}</p><div class="original-price"><span>原价</span><strong>${benefit.price}</strong></div></div>
            ${icon("chevron")}
          </a>
          <div class="exchange-strip"><span>${icon("check")}本次使用权益兑换</span><strong>无需再次支付</strong></div>
        </section>
        <section class="product-section" aria-labelledby="product-title">
          <div class="section-heading"><h2 id="product-title">服务匹配商品</h2><small>权益来自此商品</small></div>
          ${scenario === "pending" ? '<div class="product-box"><h3 class="product-copy">商品关联待同步</h3><p class="binding">正在等待来源订单的商品信息，不以其他同型号商品替代。</p></div>' : `
          <div class="product-box">
            <div class="product"><img class="product-image" src="assets/figma/${benefitId === "installation" ? "device-riverside.png" : "device-rockrider.png"}" alt="关联装备"><div class="product-copy"><h3>${escapeHtml(equipmentName)}</h3><p>此件装备专属服务</p></div></div>
            <button class="order-link" id="source-order" type="button" aria-label="查看来源商品订单与明细"><span>来源商品订单</span><span>810263 ${icon("chevron")}</span></button>
          </div>`}
          <p class="binding">${icon("link")}<span>仅限此件商品使用，兑换后的服务仍与它关联。</span></p>
        </section>
        <details class="rules"><summary>使用须知<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="rules-content">
          <p>兑换前请核对服务与来源商品，权益不可更换装备使用。</p>
          <p>可用次数、有效期和服务门店以正式权益规则为准；“6 个月”不代表所有权益的统一有效期。</p>
          <p>本次使用权益，无需支付服务原价。</p>
        </div></details>
        <p class="demo-note">设计演示：商品、订单、权益资格${benefitId === "inspection" ? "及原价" : ""}均为示意。</p>`;
      redeem.disabled = scenario !== "available";
      if (scenario !== "available") {
        redeem.textContent = scenario === "pending" ? "商品关联待同步" : "权益暂不可用";
        document.getElementById("footer-label").textContent = "核对权益后再兑换";
      }
    }
    function showSheet(kind) {
      trigger = document.activeElement;
      const orderOnly = kind === "order";
      document.getElementById("sheet-title").textContent = orderOnly ? "来源商品订单" : "确认使用权益";
      document.getElementById("sheet-description").textContent = orderOnly ? "权益来自此订单中的这件商品，不适用于其他同型号装备。以下为示例数据。" : "请确认服务与商品一致。本次使用权益兑换，无需再次支付。";
      document.getElementById("sheet-summary").innerHTML = `${orderOnly ? "" : `<div><dt>兑换服务</dt><dd>${benefit.service}</dd></div><div><dt>服务原价</dt><dd>${benefit.price}</dd></div>`}<div><dt>关联商品</dt><dd>${escapeHtml(equipmentName)}</dd></div><div><dt>来源商品订单</dt><dd>810263</dd></div>${orderOnly ? "" : '<div><dt>本次方式</dt><dd>权益兑换，无需支付</dd></div>'}`;
      confirm.hidden = orderOnly;
      close.textContent = orderOnly ? "返回权益详情" : "暂不兑换";
      overlay.hidden = false;
      setInert(true);
      sheet.focus();
    }
    function closeSheet() {
      overlay.hidden = true;
      setInert(false);
      trigger?.focus();
    }
    function showSuccess() {
      overlay.hidden = true;
      document.getElementById("success-summary").innerHTML = `<div><dt>兑换服务</dt><dd>${benefit.service}</dd></div><div><dt>关联商品</dt><dd>${escapeHtml(equipmentName)}</dd></div><div><dt>本次方式</dt><dd>权益兑换，无需支付</dd></div>`;
      successOverlay.hidden = false;
      setInert(true);
      successConfirm.focus();
    }
    function goToOrder() {
      const next = new URL("10-service-order-detail.html", location.href);
      next.search = new URLSearchParams({ context: "benefit", benefit: benefitId, name: benefit.service, description: benefit.description, category: "bike", equipment: equipmentName, order: params.get("order") || "SO-2601024", sourceOrder: params.get("sourceOrder") || "810263", entry: params.get("entry") || "service" });
      next.searchParams.set("selectBooking", "1");
      location.assign(next);
    }
    redeem.addEventListener("click", () => { if (valid && scenario === "available") showSheet("redeem"); });
    document.getElementById("source-order")?.addEventListener("click", () => showSheet("order"));
    confirm.addEventListener("click", showSuccess);
    successConfirm.addEventListener("click", goToOrder);
    close.addEventListener("click", closeSheet);
    overlay.addEventListener("click", event => { if (event.target === overlay) closeSheet(); });
    document.addEventListener("keydown", event => {
      if (!successOverlay.hidden) {
        if (event.key === "Escape" || event.key === "Tab") { event.preventDefault(); successConfirm.focus(); }
        return;
      }
      if (overlay.hidden) return;
      if (event.key === "Escape") closeSheet();
      if (event.key === "Tab") {
        const buttons = [...sheet.querySelectorAll("button:not([hidden])")];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    document.querySelectorAll("img").forEach(img => img.addEventListener("error", () => {
      const fallback = document.createElement("span");
      fallback.className = `${img.className} service-photo failed`;
      fallback.textContent = img.classList.contains("product-image") ? "商品图片暂不可用" : "服务图片暂不可用";
      fallback.setAttribute("role","img");
      fallback.setAttribute("aria-label",fallback.textContent);
      img.replaceWith(fallback);
    }));
