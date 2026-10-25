(() => {
  document.body.classList.add("vitamin-app");
  const params = new URLSearchParams(location.search);
  const file = location.pathname.split("/").pop();
  const changePages = {
    "10-reschedule-review.html": "reschedule",
    "13-service-cancel-review.html": "cancel",
  };
  if (changePages[file]) {
    const destination = new URL("12-service-order-detail.html", location.href);
    destination.search = params.toString();
    destination.searchParams.set("change", changePages[file]);
    if (changePages[file] === "reschedule" && !params.has("booking")) destination.searchParams.set("booking", "created");
    if (changePages[file] === "cancel" && !params.has("paymentState") && !params.has("booking")) destination.searchParams.set("paymentState", "unpaid");
    location.replace(destination.href);
    return;
  }
  const changeDialog = document.createElement("dialog");
  changeDialog.className = "service-change-dialog";
  changeDialog.setAttribute("aria-labelledby", "service-change-title");
  changeDialog.innerHTML = `
    <h2 id="service-change-title"></h2>
    <p data-change-message></p>
    <dl data-change-summary></dl>
    <div class="service-change-actions">
      <button type="button" data-change-close autofocus></button>
      <a data-change-reschedule>选择新时段</a>
      <button type="button" data-change-cancel>确认取消服务单</button>
    </div>`;
  document.body.append(changeDialog);
  const closeChange = changeDialog.querySelector("[data-change-close]");
  const rescheduleChange = changeDialog.querySelector("[data-change-reschedule]");
  const cancelChange = changeDialog.querySelector("[data-change-cancel]");
  let changeContext;
  closeChange.addEventListener("click", () => changeDialog.close());
  cancelChange.addEventListener("click", () => {
    changeDialog.close();
    const localCancel = document.querySelector("[data-cancel-order]");
    if (localCancel) {
      localCancel.click();
    } else {
      const destination = new URL("12-service-order-detail.html", location.href);
      destination.search = changeContext.toString();
      destination.searchParams.set("demoState", "cancelled");
      destination.searchParams.set("paymentState", "unpaid");
      destination.searchParams.set("booking", "none");
      destination.searchParams.delete("change");
      location.assign(destination.href);
    }
  });
  const openChange = (kind, context) => {
    changeContext = context;
    const rescheduling = kind === "reschedule";
    const state = context.get("demoState");
    const booking = context.get("booking");
    const blocked = context.has("serviceState") || context.get("checkin") === "done" ||
      ["queued", "active", "completed", "cancelled", "payment-unknown", "booking-unknown"].includes(state);
    const canChange = !blocked && (rescheduling
      ? (booking === "created" || (!context.has("booking") && !state)) &&
        !["unpaid", "unknown"].includes(context.get("paymentState"))
      : context.get("context") !== "benefit" && booking !== "created" && booking !== "unknown" &&
        (context.get("paymentState") === "unpaid" || state === "unpaid" ||
          (!context.has("paymentState") && !context.has("booking") && !state)));
    changeDialog.querySelector("h2").textContent = rescheduling
      ? canChange ? "更换预约时间？" : "当前无法更换预约"
      : canChange ? "取消这笔待付款服务单？" : "当前服务单不可取消";
    changeDialog.querySelector("[data-change-message]").textContent = rescheduling
      ? canChange
        ? "选择新时段期间，当前预约保持有效。新预约成功后才替换原预约；失败时原预约不变。"
        : "仅待到店、尚未扫码签到的预约可以更换时间。请查看订单当前状态。"
      : canChange
        ? "取消后将不再继续支付。本原型只展示交互，不会变更真实订单。"
        : context.get("paymentState") === "unknown" || state === "payment-unknown"
          ? "支付结果待确认，暂不能取消服务单。请查看订单状态，勿重复支付。"
          : "仅待付款服务单可取消。已支付订单在预约成功、扫码签到前可取消本次预约，服务单仍保留。";
    closeChange.textContent = canChange ? rescheduling ? "保留当前预约" : "保留服务单" : "知道了";
    rescheduleChange.hidden = !rescheduling || !canChange;
    cancelChange.hidden = rescheduling || !canChange;
    const summary = changeDialog.querySelector("[data-change-summary]");
    summary.replaceChildren();
    if (canChange) {
      const rows = [["服务", context.get("name") || "自行车标准保养套餐"]];
      if (rescheduling) {
        rows.push(
          ["门店", `${context.get("city") === "hangzhou" ? "杭州" : "上海"}门店 ${context.get("store") === "store-2" ? "02" : "01"}`],
          ["当前预约", `${context.get("date") || "2026-10-24"} ${context.get("time") || "11:00"}`],
        );
        const destination = new URL("07-date-time-selection.html", location.href);
        destination.search = context.toString();
        destination.searchParams.delete("demoState");
        destination.searchParams.delete("change");
        destination.searchParams.set("reschedule", "1");
        [["date", "2026-10-24"], ["time", "11:00"], ["city", "shanghai"], ["store", "store-1"]].forEach(([key, fallback]) => {
          destination.searchParams.set(`old${key[0].toUpperCase()}${key.slice(1)}`, context.get(key) || fallback);
        });
        rescheduleChange.href = destination.href;
      }
      rows.forEach(([label, value]) => {
        const term = document.createElement("dt");
        const detail = document.createElement("dd");
        term.textContent = label;
        detail.textContent = value;
        summary.append(term, detail);
      });
    }
    summary.hidden = !canChange;
    changeDialog.showModal();
  };
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const destination = new URL(link.href, location.href);
    const kind = changePages[destination.pathname.split("/").pop()];
    if (!kind || destination.origin !== location.origin) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const context = new URLSearchParams(location.search);
    if (!link.closest(".journey-panel")) {
      destination.searchParams.forEach((value, key) => context.set(key, value));
    }
    openChange(kind, context);
  }, true);
  if (file === "index.html") return;
  if (params.has("change")) {
    const kind = params.get("change");
    const destination = new URL(location.href);
    destination.searchParams.delete("change");
    history.replaceState(null, "", destination);
    if (kind === "reschedule" || kind === "cancel") {
      setTimeout(() => openChange(kind, new URLSearchParams(location.search)), 0);
    }
  }
  const purchasePages = ["05-order-checkout.html", "05-payment-result.html", "06-store-selection.html", "07-date-time-selection.html", "08-appointment-result.html", "09-appointment-detail-cancel.html", "10-reschedule-review.html", "12-service-order-detail.html", "13-service-cancel-review.html"];
  document.body.classList.toggle("purchase-flow", purchasePages.includes(file));
  if (file === "09-appointment-detail-cancel.html" || (file === "08-appointment-result.html" && (!params.has("result") || params.get("result") === "created"))) {
    const destination = new URL("12-service-order-detail.html", location.href);
    destination.search = params.toString();
    if (!destination.searchParams.has("booking") || file === "08-appointment-result.html") destination.searchParams.set("booking", "created");
    if (file === "08-appointment-result.html" && params.get("reschedule") === "1") destination.searchParams.set("reschedule", "done");
    destination.searchParams.delete("result");
    location.replace(destination.href);
    return;
  }
  if (file === "10-reschedule-review.html") {
    const action = document.querySelector("#reschedule-action");
    if (action) {
      const destination = new URL(action.href, location.href);
      params.forEach((value, key) => destination.searchParams.set(key, value));
      destination.searchParams.delete("demoState");
      destination.searchParams.set("reschedule", "1");
      destination.searchParams.set("oldDate", params.get("date") || "2026-10-24");
      destination.searchParams.set("oldTime", params.get("time") || "11:00");
      destination.searchParams.set("oldCity", params.get("city") || "shanghai");
      destination.searchParams.set("oldStore", params.get("store") || "store-1");
      action.href = destination.href;
    }
  }
  const groups = [
    { title: "选服务与下单", pages: [
      ["01-service-entry.html", "服务首页", "从服务、装备权益或进行中订单进入。"],
      ["02-service-detail.html", "服务详情", "了解服务内容和费用，再确认订单。"],
      ["05-order-checkout.html", "确认订单", "核对项目与金额，选择支付方式。"],
      ["05-payment-result.html", "支付结果", "查看支付结果，成功后可立即预约。"],
    ] },
    { title: "预约到店", pages: [
      ["06-store-selection.html", "选择门店", "先选择能够承接服务的门店。"],
      ["07-date-time-selection.html", "选择日期与时段", "查看门店可约资源，提交后复核时段。"],
      ["08-appointment-result.html?result=conflict", "预约异常", "冲突重新选时段；未知结果不重复提交。"],
      ["12-service-order-detail.html", "订单详情", "扫码前查看预约信息；到店扫码成功后在订单内查看门店排队号。"],
    ] },
    { title: "权益、维修与其他入口", pages: [
      ["equipment-library.html", "我的装备", "从具体装备查看相关服务与可用权益。"],
      ["03-benefit-detail.html", "权益详情", "核对来源商品，使用权益后继续预约，无需再次支付。"],
      ["04-repair-request.html", "描述维修需求", "无法判断项目时先描述问题，不直接生成诊断或报价。"],
      ["my-orders.html", "我的订单", "按状态筛选，从对应订单继续付款、预约或查看记录。"],
      ["15-message-landing.html", "服务消息", "消息进入关联服务单，不跳转泛订单列表。"],
    ] },
  ];
  const current = groups.flatMap(group => group.pages).find(item => item[0].split("?")[0] === file);
  const contextKeys = ["category", "name", "description", "price", "context", "benefit", "equipment", "order", "city", "store", "date", "time", "booking", "serviceState", "checkin", "payment", "paymentState", "reschedule", "oldDate", "oldTime", "oldCity", "oldStore"];
  const withContext = (href) => {
    const url = new URL(href, location.href);
    if (url.pathname.endsWith("/09-appointment-detail-cancel.html")) {
      url.pathname = url.pathname.replace("09-appointment-detail-cancel.html", "12-service-order-detail.html");
      if (!params.has("booking") && !url.searchParams.has("booking")) url.searchParams.set("booking", "created");
    }
    const active = new URLSearchParams(location.search);
    if (!url.pathname.endsWith("/01-service-entry.html")) {
      contextKeys.forEach(key => {
        if (active.has(key) && !url.searchParams.has(key)) url.searchParams.set(key, active.get(key));
      });
    }
    if (url.pathname.endsWith("/12-service-order-detail.html")) {
      if (active.get("reschedule") === "1" && active.get("booking") !== "unknown") {
        [["date", "oldDate"], ["time", "oldTime"], ["city", "oldCity"], ["store", "oldStore"]].forEach(([key, oldKey]) => {
          if (active.has(oldKey)) url.searchParams.set(key, active.get(oldKey));
        });
        url.searchParams.set("booking", "created");
        url.searchParams.delete("reschedule");
      }
      if (active.get("demoState") === "cancelled") url.searchParams.set("demoState", "cancelled");
    }
    return url;
  };
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || link.getAttribute("href").startsWith("#") || link.hasAttribute("data-fresh-start")) return;
    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname.includes("/prototype/") && url.pathname.endsWith(".html")) {
      link.href = withContext(link.href).href;
    }
  }, true);

  const oldPanel = document.querySelector("aside.annotation, aside.page-annotation, aside.design-panel, aside.scenario-panel");
  const panel = document.createElement("aside");
  panel.className = "journey-panel";
  panel.setAttribute("aria-label", "完整服务流程与设计说明");
  const home = document.createElement("a");
  home.className = "journey-home";
  home.href = "index.html";
  home.textContent = "完整流程";
  panel.append(home);
  const title = document.createElement("h2");
  title.textContent = current?.[1] || "服务流程";
  const description = document.createElement("p");
  description.textContent = current?.[2] || "按顾客任务串联服务页面。";
  panel.append(title, description);
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "服务流程导航");
  groups.forEach(group => {
    const section = document.createElement("section");
    section.className = "journey-group";
    const heading = document.createElement("h3");
    heading.textContent = group.title;
    const list = document.createElement("ol");
    list.className = "journey-steps";
    group.pages.forEach(([path, label]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const destination = withContext(path);
      link.href = destination.href;
      link.textContent = label;
      if (path.split("?")[0] === file) link.setAttribute("aria-current", "page");
      item.append(link);
      list.append(item);
    });
    section.append(heading, list);
    nav.append(section);
  });
  if (oldPanel) {
    const details = document.createElement("details");
    details.className = "journey-details";
    const summary = document.createElement("summary");
    summary.textContent = ["05-payment-result.html", "06-store-selection.html", "07-date-time-selection.html", "08-appointment-result.html"].includes(file)
      ? "状态切换"
      : "设计说明与演示状态";
    const content = document.createElement("div");
    while (oldPanel.firstChild) content.append(oldPanel.firstChild);
    details.append(summary, content);
    oldPanel.replaceWith(panel);
    panel.append(details);
  } else {
    document.querySelector(".presentation, .page-presentation, .preview, .stage")?.append(panel);
  }
  panel.append(nav);
  const tools = document.createElement("div");
  tools.className = "journey-tools";
  [["../prd/service-as-offer-ux-spec.html#journey", "需求与流程说明"], ["../design/design.md", "Vitamin C 规范"]].forEach(([href, label]) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    tools.append(link);
  });
  panel.append(tools);
  const demo = document.createElement("p");
  demo.textContent = "交互原型：数据为示例，不发起真实支付、兑换、签到或退款。";
  if (!["05-order-checkout.html", "05-payment-result.html", "06-store-selection.html", "07-date-time-selection.html", "08-appointment-result.html"].includes(file)) {
    panel.append(demo);
  }

  const root = document.querySelector(".artboard, .page-artboard, .device, .phone");
  if (!root) return;
  const serviceImages = { bike: "order-bike-repair.png", badminton: "order-badminton.png", tennis: "order-badminton.png", ski: "device-wedze.png" };
  root.querySelectorAll(".page-thumb, .service-thumb, .service-strip .service-icon").forEach(thumb => {
    const image = document.createElement("img");
    image.src = `assets/figma/${serviceImages[params.get("category")] || serviceImages.bike}`;
    image.alt = params.get("name") || "服务项目";
    image.addEventListener("error", () => {
      thumb.textContent = "服务图片暂不可用";
    });
    thumb.removeAttribute("aria-label");
    thumb.replaceChildren(image);
  });
  const setText = (selector, text) => root.querySelectorAll(selector).forEach(node => { node.textContent = text; });
  const equipmentHints = {
    bike: "可用于自行车，到店时确认具体型号",
    badminton: "可用于羽毛球，到店时确认具体型号",
    tennis: "可用于网球，到店时确认具体型号",
    ski: "可用于滑雪装备，到店时确认具体型号",
  };
  setText(".booking-equipment-value", params.get("equipment") || equipmentHints[params.get("category")] || equipmentHints.bike);
  if (params.has("name")) {
    setText(".page-service-copy > strong, #service-name, .service-strip .service-info > strong", params.get("name"));
    setText(".service-name", params.get("name"));
    root.querySelectorAll(".page-row, .detail").forEach(row => {
      if (["服务", "服务项目"].includes(row.querySelector("span")?.textContent.trim())) row.querySelector("strong").textContent = params.get("name");
    });
  }
  const cities = { shanghai: "上海门店", hangzhou: "杭州门店" };
  const storeLocations = {
    shanghai: [
      { address: "上海市杨浦区淞沪路161号", distance: "2.3 km", hours: "10:00–22:00" },
      { address: "上海市徐汇区漕溪北路", distance: "4.8 km", hours: "10:00–22:00" },
    ],
    hangzhou: [
      { address: "杭州市滨江区江南大道", distance: "1.8 km", hours: "10:00–22:00" },
      { address: "杭州市西湖区古墩路", distance: "4.2 km", hours: "10:00–22:00" },
    ],
  };
  const city = cities[params.get("city")] ? params.get("city") : "shanghai";
  const storeIndex = params.get("store") === "store-2" ? 1 : 0;
  const store = `${cities[city]} ${storeIndex === 1 ? "02" : "01"}`;
  const storeLocation = storeLocations[city][storeIndex];
  const date = params.get("date") || "2026-10-24";
  const time = params.get("time") || "11:00";
  const appointment = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time) ? `${date} ${time}` : "请重新选择预约时间";
  const rows = root.querySelectorAll(".page-row, .rows > .row");
  rows.forEach(row => {
    const label = row.querySelector("span")?.textContent.trim();
    const value = row.querySelector("strong");
    if (!value) return;
    if (["门店", "服务门店"].includes(label)) value.textContent = store;
    if (["预约时间", "时间"].includes(label)) value.textContent = appointment;
    if (label === "预约") value.textContent = `${appointment} ${store}`;
    if (label === "装备" && params.has("equipment")) value.textContent = params.get("equipment");
    if (label === "实付金额" && Number.isFinite(Number(params.get("price"))) && params.has("price")) value.textContent = `¥${Number(params.get("price")).toFixed(2)}`;
    if (label === "实付金额" && params.get("payment") === "points" && params.has("price") && Number.isFinite(Number(params.get("price")))) value.textContent = `${Math.round(Number(params.get("price")) * 100).toLocaleString("zh-CN")} 燃值`;
    if (["交易", "交易状态"].includes(label) && params.get("context") === "benefit") value.textContent = "权益兑换，无需支付";
    if (["交易", "交易状态"].includes(label) && params.get("paymentState") === "unpaid") value.textContent = "待支付";
  });
  if (params.has("order")) setText(".page-service-copy small", `服务单 ${params.get("order")}`);
  root.querySelectorAll(".page-service-copy small").forEach(node => {
    node.textContent = node.textContent.replace(/（评审示例）| · 评审示例| · 示例/g, "");
  });
  const booking = params.get("booking");
  const booked = booking === "created";
  if (file === "10-reschedule-review.html") {
    const unavailable = (params.has("booking") && !booked) || params.get("paymentState") === "unpaid" ||
      params.get("paymentState") === "unknown" || params.has("serviceState") || params.get("checkin") === "done" ||
      ["queued", "active", "completed", "cancelled"].includes(params.get("demoState"));
    if (unavailable) {
      setText(".page-heading", "当前无法更换预约");
      setText(".page-lede", "仅待到店、尚未扫码签到的预约可以更换时间。请返回订单查看当前状态。");
      root.querySelector(".page-section").hidden = true;
      root.querySelector(".page-status").hidden = true;
      root.querySelector("#reschedule-action").hidden = true;
      root.querySelector(".page-foot-actions").classList.add("single-action");
      setText(".page-foot-actions a:first-child", "返回订单详情");
      root.querySelectorAll("a[href*='12-service-order-detail.html']").forEach(link => {
        const destination = new URL(link.href);
        destination.searchParams.set("booking", booking || "none");
        link.href = destination.href;
      });
    }
  }
  if (file === "06-store-selection.html") {
    if (params.get("context") === "benefit") setText(".service-strip .service-info span", "权益服务 · 待预约");
    if (params.get("context") === "repair") setText(".service-strip .service-info span", "维修项目待门店确认");
    if (params.get("paymentState") === "unpaid") setText(".service-strip .service-info span", "待支付 · 暂不可预约");
    if (params.get("paymentState") === "unknown") setText(".service-strip .service-info span", "支付待确认 · 暂不可预约");
  }
  if (file === "13-service-cancel-review.html") {
    const orderCancelled = params.get("demoState") === "cancelled";
    const canCancelOrder = !orderCancelled && !booked && booking !== "unknown" && !params.has("serviceState") && params.get("context") !== "benefit" && (params.get("paymentState") === "unpaid" ||
      (!params.has("paymentState") && !booked && booking !== "cancelled"));
    const cancelAction = root.querySelector("[data-open-dialog='service-cancel-dialog']");
    const boundaryMessage = root.querySelector("#service-cancel-boundary");
    if (cancelAction) cancelAction.hidden = !canCancelOrder;
    root.querySelector(".page-foot-actions").classList.toggle("single-action", !canCancelOrder);
    root.querySelectorAll("a[href*='12-service-order-detail.html']").forEach(link => {
      const destination = new URL(link.href);
      if (canCancelOrder) destination.searchParams.set("paymentState", "unpaid");
      if (orderCancelled) destination.searchParams.set("demoState", "cancelled");
      link.href = destination.href;
    });
    if (boundaryMessage && orderCancelled) {
      boundaryMessage.textContent = "此待付款服务单已取消，不能再次取消。";
      const feedback = root.querySelector("#service-cancel-feedback");
      if (feedback) feedback.hidden = false;
      setText(".page-intro h1", "服务单已取消");
      const returnLink = root.querySelector(".page-foot-actions a[href*='12-service-order-detail.html']");
      if (returnLink) {
        const destination = new URL(returnLink.href);
        destination.searchParams.set("demoState", "cancelled");
        destination.searchParams.set("paymentState", "unpaid");
        destination.searchParams.set("booking", "none");
        returnLink.href = destination.href;
      }
    } else if (boundaryMessage && !canCancelOrder) {
      setText(".page-intro h1", "当前服务单不可取消");
      boundaryMessage.textContent = params.get("paymentState") === "unknown"
        ? "支付结果待确认，暂不能取消服务单。请返回订单查看状态，勿重复支付。"
        : "此服务单不能在此取消。预约建立后、门店扫码签到前，可在服务单内取消本次预约。";
    }
    rows.forEach(row => {
      const label = row.querySelector("span")?.textContent.trim();
      const value = row.querySelector("strong");
      if (!value) return;
      if (label === "预约") value.textContent = booking === "created" ? `${appointment} ${store}` : booking === "cancelled" ? "预约已取消" : "尚未创建";
      if (label === "服务单状态") value.textContent = orderCancelled ? "已取消" : canCancelOrder ? "待支付" : params.get("paymentState") === "unknown" ? "支付待确认" : "已生效";
      if (label === "交易") value.textContent = orderCancelled || canCancelOrder ? "未支付" : params.get("context") === "benefit" ? "权益兑换" : params.get("paymentState") === "unknown" ? "待确认" : "已支付";
    });
  }
  if (file === "15-message-landing.html") {
    const stage = params.get("serviceState") === "completed" ? "服务已完成" : params.get("serviceState") === "active" ? "服务进行中" : booked ? "预约成功，待到店" : "已支付，待预约";
    setText(".page-service .page-tag", stage);
    rows.forEach(row => {
      if (row.querySelector("span")?.textContent.trim() === "当前进度") row.querySelector("strong").textContent = stage;
    });
  }
  if (["09-appointment-detail-cancel.html", "12-service-order-detail.html"].includes(file)) {
    if (file.startsWith("09") && booking === "cancelled") {
      setText("#appointment-state, .page-heading", "预约已取消");
      root.querySelector("#cancel-appointment-action").hidden = true;
    }
    if (file.startsWith("12")) {
      const initialState = params.get("demoState") ||
        (params.get("checkin") === "done" ? "queued" :
          params.get("paymentState") === "unknown" ? "payment-unknown" :
          booking === "unknown" ? "booking-unknown" :
          params.get("paymentState") === "unpaid" ? "unpaid" :
          params.get("serviceState") === "completed" ? "completed" :
            params.get("serviceState") === "active" ? "active" :
              booking === "cancelled" ? "booking-cancelled" : booked ? "booked" : "pending");
      const orderStates = {
        unpaid: { tag: "待付款", heading: "订单待支付", appointment: "尚未创建", location: "选择后显示", payment: "待支付", progress: 0, action: "继续支付", href: "05-order-checkout.html", ticket: false },
        pending: { tag: "待预约", heading: params.get("context") === "benefit" ? "权益服务，待预约" : "已支付，待预约", appointment: "尚未创建", location: "选择后显示", payment: params.get("context") === "benefit" ? "权益兑换" : "已支付", progress: 0, action: "选择门店与时段", href: "06-store-selection.html", ticket: false },
        booked: { tag: "待到店", heading: "预约成功，待到店", appointment: "已创建", location: `${store} ${appointment}`, payment: params.get("context") === "benefit" ? "权益兑换" : "已支付", progress: 1, action: "去门店", href: "#store-navigation-dialog", ticket: true },
        queued: { tag: "排队中", heading: "已到店，正在排队", appointment: "已创建", location: `${store} ${appointment}`, payment: params.get("context") === "benefit" ? "权益兑换" : "已支付", progress: 2, ticket: true },
        "booking-cancelled": { tag: "预约已取消", heading: "预约已取消，订单保留", appointment: "已取消", location: `${store} ${appointment}`, payment: params.get("context") === "benefit" ? "权益兑换" : "已支付", progress: 0, action: "重新预约", href: "06-store-selection.html", ticket: false, feedback: "本次预约已取消，服务订单保留。您可以重新选择门店和时间。" },
        active: { tag: "服务中", heading: "服务进行中", appointment: "已创建", location: `${store} ${appointment}`, payment: params.get("context") === "benefit" ? "权益兑换" : "已支付", progress: 3, action: "返回我的订单", href: "my-orders.html", ticket: false },
        completed: { tag: "已完成", heading: "服务已完成", appointment: "已创建", location: `${store} ${appointment}`, payment: params.get("context") === "benefit" ? "权益兑换" : "已支付", progress: 3, ticket: false },
        cancelled: { tag: "订单已取消", heading: "服务订单已取消", appointment: "尚未创建", location: "未预约", payment: "未支付", progress: 0, action: "重新下单", href: "01-service-entry.html?scenario=all", ticket: false, outline: true, feedback: "订单已取消，无需继续支付" },
        "payment-unknown": { tag: "支付待确认", heading: "支付结果待确认", appointment: "尚未创建", location: "尚未预约", payment: "待确认", progress: -1, action: "查看支付结果", href: "05-payment-result.html?paymentState=unknown", ticket: false, feedback: "暂未确认扣款结果，请勿重复支付。结果确认后再预约。" },
        "booking-unknown": { tag: "预约待确认", heading: "预约结果待确认", appointment: "待确认", location: "提交结果待确认", payment: "已支付", progress: -1, action: "查看预约结果", href: "08-appointment-result.html?result=unknown", ticket: false, feedback: "请勿重复预约或改约，待结果确认后再操作。" },
      };
      const statusIcons = {
        unpaid: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-13 5h4"/>`,
        pending: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-9 3v4m-2-2h4"/>`,
        booked: `<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>`,
        queued: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>`,
        "booking-cancelled": `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-11 3 4 4m0-4-4 4"/>`,
        active: `<path d="M8 4h8M8 20h8M6 4v3l6 5 6-5V4M6 20v-3l6-5 6 5v3"/>`,
        completed: `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>`,
        cancelled: `<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>`,
        "payment-unknown": `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-9 3v2m0 2v.01"/>`,
        "booking-unknown": `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-9 3v2m0 2v.01"/>`,
      };
      let state = orderStates[initialState] ? initialState : "pending";
      const primaryAction = root.querySelector("#order-primary-action");
      let copyToastTimer;
      setText("#order-number", params.get("order") || "SO-2601024");
      setText("#order-created-at", params.get("orderTime") || "2026-10-24 10:30");
      root.querySelector("#order-number-copy").addEventListener("click", async () => {
        const orderNumber = root.querySelector("#order-number").textContent.trim();
        let copied = false;
        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(orderNumber);
            copied = true;
          } catch (error) {
            console.warn("无法使用剪贴板 API，将尝试兼容复制方式。", error);
          }
        }
        if (!copied) {
          const input = document.createElement("textarea");
          input.value = orderNumber;
          input.setAttribute("readonly", "");
          input.setAttribute("aria-hidden", "true");
          input.style.position = "fixed";
          input.style.opacity = "0";
          document.body.append(input);
          input.select();
          try {
            copied = document.execCommand("copy");
          } catch (error) {
            console.warn("兼容复制方式也未能复制订单编号。", error);
          } finally {
            input.remove();
          }
        }
        const toast = root.querySelector("#order-toast");
        toast.textContent = copied ? "已复制订单编号" : "复制失败，请手动选择订单编号";
        toast.hidden = false;
        window.clearTimeout(copyToastTimer);
        copyToastTimer = window.setTimeout(() => {
          toast.hidden = true;
        }, 2000);
      });
      primaryAction.addEventListener("click", event => {
        if (state !== "booked") return;
        event.preventDefault();
        document.querySelector("#store-navigation-dialog").showModal();
      });
      document.querySelector("[data-cancel-order]").addEventListener("click", () => {
        document.querySelector("#cancel-order-dialog").close();
        state = "cancelled";
        renderOrderState();
      });
      const renderOrderState = () => {
        const current = orderStates[state];
        const statusSymbol = root.querySelector(".order-status-symbol");
        statusSymbol.dataset.state = state;
        statusSymbol.querySelector("svg").innerHTML = statusIcons[state];
        setText("#order-status-tag", current.tag);
        setText("#order-status-heading", state === "booked" && params.get("reschedule") === "done" ? "预约已更新，待到店" : current.heading);
        setText("#order-transaction-status", current.payment);
        setText("#order-payment-method", params.get("context") === "benefit"
          ? "权益兑换"
          : state === "payment-unknown" ? "待确认"
            : state === "unpaid" || state === "cancelled" ? "未支付"
              : params.get("payment") === "points" ? "燃值抵扣" : "微信支付");
        const unpaid = state === "unpaid" || state === "cancelled";
        const amount = Number(params.get("price") || 199.9);
        setText("#order-amount-label", state === "cancelled" ? "支付说明" : unpaid ? "待付金额" : state === "payment-unknown" ? "订单金额" : "实付金额");
        setText("#order-amount", state === "cancelled" ? "未支付，无需退款" :
          params.get("context") === "benefit" ? "权益兑换，无需支付" :
          Number.isFinite(amount) && amount >= 0 ? params.get("payment") === "points"
            ? `${Math.round(amount * 100).toLocaleString("zh-CN")} 燃值` : `¥${amount.toFixed(2)}` : "金额异常，请核对订单");
        setText("#order-source", params.get("context") === "benefit" ? "装备权益兑换" : "线上购买");
        setText("#order-equipment", params.get("equipment") || "未指定，到店时确认");
        setText("#order-appointment-status", current.appointment);
        setText("#order-appointment-location", current.location);
        setText("#order-store-name", store);
        setText("#order-store-address", storeLocation.address);
        setText("#order-store-hours", `营业时间 ${storeLocation.hours}`);
        setText("#order-store-appointment-time", appointment);
        const hasPrimaryAction = !["queued", "completed"].includes(state);
        primaryAction.hidden = !hasPrimaryAction;
        if (hasPrimaryAction) {
          setText("#order-primary-action", current.action);
          primaryAction.href = current.outline ? new URL(current.href, location.href).href : withContext(current.href).href;
          primaryAction.classList.toggle("brand-outline", Boolean(current.outline));
          primaryAction.toggleAttribute("data-fresh-start", Boolean(current.outline));
        }
        root.querySelector("#order-cancel-action").hidden = state !== "unpaid";
        const footActions = root.querySelector("#order-foot-actions");
        footActions.hidden = !hasPrimaryAction;
        footActions.classList.toggle("single-action", state !== "unpaid");
        root.querySelector("#service-record").hidden = state !== "completed";
        root.querySelector("#store-queue-result").hidden = state !== "queued";
        const hasAppointment = ["booked", "queued", "active", "completed", "booking-cancelled"].includes(state);
        const appointmentDetails = root.querySelector("#order-store-details");
        const bookingSummary = root.querySelector("#booking-summary");
        const serviceDetails = root.querySelector("#order-service-details");
        const fulfillment = root.querySelector("#order-fulfillment");
        const bookingCancelled = state === "booking-cancelled";
        setText("#order-booking-title", bookingCancelled ? "已取消预约" : "预约信息");
        appointmentDetails.classList.toggle("is-cancelled", bookingCancelled);
        appointmentDetails.hidden = !hasAppointment;
        const orderCancelled = state === "cancelled";
        const bookingCancelledNote = root.querySelector("#booking-cancelled-note");
        bookingCancelledNote.hidden = !bookingCancelled;
        bookingCancelledNote.textContent = bookingCancelled ? current.feedback : "";
        bookingSummary.hidden = hasAppointment;
        if (bookingCancelled) {
          fulfillment.after(appointmentDetails);
        } else if (state === "completed") {
          serviceDetails.after(appointmentDetails);
        } else {
          serviceDetails.before(appointmentDetails);
        }
        if (state === "cancelled") {
          fulfillment.after(bookingSummary);
        } else {
          fulfillment.before(bookingSummary);
        }
        root.querySelector("#appointment-qr").hidden = state !== "booked";
        const cancelFeedback = root.querySelector("#cancel-feedback");
        const hasCancelFeedback = Boolean(current.feedback) && !bookingCancelled && !orderCancelled;
        cancelFeedback.hidden = !hasCancelFeedback;
        cancelFeedback.textContent = hasCancelFeedback ? current.feedback : "";
        root.querySelector("#cancel-appointment-action").hidden = state !== "booked";
        document.querySelector("#store-contact-name").textContent = store;
        const navigationUrl = new URL("https://apis.map.qq.com/uri/v1/search");
        navigationUrl.searchParams.set("keyword", `${store} ${storeLocation.address}`);
        navigationUrl.searchParams.set("region", cities[city].replace("门店", ""));
        navigationUrl.searchParams.set("referer", "service-as-offer");
        document.querySelector("#store-navigation-address").textContent = `${store} · ${storeLocation.address}`;
        document.querySelector("#wechat-navigation-link").href = navigationUrl.href;
        const storeMapLink = root.querySelector("#order-store-map-link");
        storeMapLink.href = navigationUrl.href;
        storeMapLink.setAttribute("aria-label", `在微信地图中查看${store}`);
        root.querySelector("#order-timeline").closest(".page-section").hidden = unpaid || current.progress < 0;
        root.querySelectorAll("#order-timeline .page-timeline-item").forEach((item, index) => {
          const progress = state === "completed" ? 4 : current.progress;
          item.classList.toggle("current", index === progress);
          item.classList.toggle("complete", index < progress);
          if (index === progress) item.setAttribute("aria-current", "step");
          else item.removeAttribute("aria-current");
        });
        document.querySelectorAll("[data-order-state]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.orderState === state)));
        document.querySelector("#order-state-feedback").textContent = `当前预览：${current.tag}。切换状态仅用于原型演示，不会变更真实订单。`;
        const next = new URL(location.href);
        next.searchParams.set("demoState", state);
        next.searchParams.set("paymentState", state === "payment-unknown" ? "unknown" : unpaid ? "unpaid" : "paid");
        next.searchParams.set("booking", state === "booking-unknown" ? "unknown" : ["booked", "queued", "active", "completed"].includes(state) ? "created" : state === "booking-cancelled" ? "cancelled" : "none");
        if (state === "queued") next.searchParams.set("checkin", "done");
        else next.searchParams.delete("checkin");
        if (state === "active" || state === "completed") next.searchParams.set("serviceState", state);
        else next.searchParams.delete("serviceState");
        history.replaceState(null, "", next);
        if (hasPrimaryAction) {
          primaryAction.href = current.outline || current.href.startsWith("#") ? current.href : withContext(current.href).href;
        }
      };
      document.querySelectorAll("[data-order-state]").forEach(button => {
        button.addEventListener("click", () => {
          state = button.dataset.orderState;
          renderOrderState();
        });
      });
      renderOrderState();
    }
  }
  if (file === "09-appointment-detail-cancel.html" && booking === "cancelled") {
    setText(".page-intro .page-tag", "预约已取消");
    const action = root.querySelector(".page-foot a");
    action.href = "06-store-selection.html";
    action.textContent = "重新预约";
  }
  if (params.get("context") === "benefit" && file === "08-appointment-result.html") {
    setText("#result-payment-pill, #transaction-status", "权益兑换");
    setText(".service-name", params.get("name") || "权益服务");
    setText(".service-hint", "无需再次支付");
  }
  if (file === "01-service-entry.html" && params.has("order")) {
    const card = document.createElement("section");
    card.className = "page-section";
    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "继续这笔服务";
    const link = document.createElement("a");
    link.className = "page-button secondary";
    link.style.display = "block";
    link.href = withContext("12-service-order-detail.html").href;
    link.textContent = params.get("name") || "查看服务单";
    card.append(heading, link);
    root.querySelector(".app")?.prepend(card);
  }
})();
