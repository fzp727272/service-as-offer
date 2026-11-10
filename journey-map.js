(() => {
  // `page` identifies the underlying HTML page; `href` may select a particular state.
  const groups = [
    {
      id: "discovery", title: "发现与购买", main: true, pages: [
        { id: "home", page: "01-service-entry.html", href: "01-service-entry.html?scenario=all", title: "服务首页", description: "先看进行中服务与装备权益，再浏览服务目录。" },
        {
          id: "service-detail", page: "02-service-detail.html", href: "02-service-detail.html?category=bike", title: "服务详情", description: "确认服务内容、关联商品与价格。",
          branches: [{
            type: "repair-switch", title: "用户维修需求 · 两个版本", ariaLabel: "切换维修需求版本", defaultVersion: "ai",
            options: [
              { id: "ai", page: "04-repair-request2.html", href: "04-repair-request2.html", title: "AI 维修咨询", label: "打开 AI 维修咨询", description: "通过对话描述问题，查看模拟分析和相关服务建议。" },
              { id: "form", page: "04-repair-request.html", href: "04-repair-request.html", title: "描述维修需求", label: "打开描述维修需求", description: "填写故障现象与可选图片，由门店确认维修项目和报价。" },
            ],
          }],
        },
        { id: "checkout", page: "05-order-checkout.html", href: "05-order-checkout.html", title: "确认订单", description: "核对金额，选择微信支付或燃值抵扣。" },
        { id: "payment-result", page: "05-payment-result.html", href: "05-payment-result.html", title: "支付结果", description: "确认支付结果后，成功可立即预约。" },
      ],
    },
    {
      id: "booking", title: "预约服务", main: true, pages: [
        { id: "select-booking", page: "10-service-order-detail.html", href: "10-service-order-detail.html?selectBooking=1", title: "选择门店与时间", description: "在共享选择弹框中按城市查看门店，选择可约日期与时段。" },
        { id: "booking-created", page: "10-service-order-detail.html", href: "10-service-order-detail.html?booking=created", title: "服务订单 · 预约状态", description: "预约结果是订单状态而非独立流程节点；结果待确认时在订单状态栏说明，并可在订单内查看结果弹窗。预约时间属于同一服务订单；不提供更换预约，扫码前取消需二次确认。" },
      ],
    },
    {
      id: "completion", title: "到店与完成", main: true, pages: [
        {
          id: "queued", page: "10-service-order-detail.html", href: "10-service-order-detail.html?demoState=queued", title: "服务单详情 · 扫码后排队", description: "到店扫码成功后，在订单详情查看门店排队号。",
          branches: [{ type: "links", title: "其他订单状态", links: [
            { page: "10-service-order-detail.html", href: "10-service-order-detail.html?booking=created", title: "查看预约信息" },
            { page: "10-service-order-detail.html", href: "10-service-order-detail.html?paymentState=unpaid", title: "待付款服务单" },
          ] }],
        },
        { id: "completed", page: "10-service-order-detail.html", href: "10-service-order-detail.html?demoState=completed", title: "服务完成与记录", description: "在订单详情查看已完成的服务记录。" },
        { id: "orders-history", page: "my-orders.html", href: "my-orders.html", title: "我的订单", description: "查看历史记录或再次购买服务。" },
      ],
    },
    {
      id: "other-entries", title: "权益、维修与其他入口", main: false, pages: [
        { id: "equipment", page: "equipment-library.html", href: "equipment-library.html", title: "我的装备", description: "从具体装备查看相关服务与可用权益。" },
        { id: "benefit", page: "03-benefit-detail.html", href: "03-benefit-detail.html", title: "权益详情", description: "核对来源商品，使用权益后继续预约，无需再次支付。" },
        { id: "repair-ai", page: "04-repair-request2.html", href: "04-repair-request2.html", title: "AI 维修咨询", description: "描述装备问题并查看模拟分析和相关服务建议。" },
        { id: "repair-form", page: "04-repair-request.html", href: "04-repair-request.html", title: "描述维修需求", description: "无法判断项目时先描述问题，不直接生成诊断或报价。" },
        { id: "orders", page: "my-orders.html", href: "my-orders.html", title: "我的订单", description: "按状态筛选，从对应订单继续付款、预约或查看记录。" },
        { id: "messages", page: "13-message-landing.html", href: "13-message-landing.html", title: "服务消息", description: "消息进入关联服务单，不跳转泛订单列表。" },
      ],
    },
  ];

  const entryPaths = [
    {
      title: "购买商品赠送权益", parts: [
        { title: "购后扫码进入", href: "01-service-entry.html?entry=scan" },
        " / ",
        { title: "商品订单跳转权益", href: "03-benefit-detail.html?entry=order&sourceOrder=810263" },
        { connector: "→", ariaLabel: "然后" },
        { title: "选择门店与时间", href: "10-service-order-detail.html?selectBooking=1&context=benefit&benefit=inspection&name=安全检查&equipment=Rockrider%20ST%20530" },
        "，无需再次支付。扫码不执行装备绑定。",
      ],
    },
    {
      title: "浏览其他商品或服务", parts: [
        { title: "其他商品页面进入", href: "01-service-entry.html?entry=product" },
        " / ",
        { title: "服务入口进入", href: "01-service-entry.html?entry=service" },
        "，在同一首页浏览服务。",
      ],
    },
    {
      title: "不确定维修项目", parts: [
        { title: "AI 维修咨询", href: "04-repair-request2.html" },
        "，描述问题并查看相关服务建议；也可",
        { title: "填写维修需求", href: "04-repair-request.html" },
        "，由门店确认项目与报价。",
      ],
    },
    {
      title: "继续已有服务", parts: [
        { title: "我的订单", href: "my-orders.html" },
        { connector: "→", ariaLabel: "然后" },
        { title: "对应服务单", href: "10-service-order-detail.html" },
        "，按当前状态继续付款、预约或查看进度。",
      ],
    },
    {
      title: "从消息返回", parts: [
        { title: "服务消息", href: "13-message-landing.html" },
        { connector: "→", ariaLabel: "然后" },
        { title: "关联服务单", href: "10-service-order-detail.html" },
        "，保留原服务与预约上下文。",
      ],
    },
  ];

  const repairBranch = groups.flatMap(group => group.pages)
    .flatMap(page => page.branches || []).find(branch => branch.type === "repair-switch");
  const repairVersions = Object.fromEntries(repairBranch.options.map(option => [option.id, option]));

  function renderBranch(branch) {
    const container = document.createElement("div");
    container.className = "branch";
    if (branch.type === "repair-switch") {
      container.classList.add("repair-version-switch");
      container.setAttribute("data-repair-switch", "");
      const heading = document.createElement("strong");
      heading.textContent = branch.title;
      const options = document.createElement("div");
      options.className = "repair-version-options";
      options.setAttribute("role", "group");
      options.setAttribute("aria-label", branch.ariaLabel);
      branch.options.forEach(option => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.version = option.id;
        button.setAttribute("aria-pressed", String(option.id === branch.defaultVersion));
        button.textContent = option.title;
        options.append(button);
      });
      const selected = repairVersions[branch.defaultVersion];
      const description = document.createElement("p");
      description.setAttribute("data-version-description", "");
      description.textContent = selected.description;
      const link = document.createElement("a");
      link.setAttribute("data-version-link", "");
      link.href = selected.href;
      link.textContent = selected.label;
      container.append(heading, options, description, link);
    } else if (branch.type === "links") {
      container.append(document.createTextNode(branch.title), document.createElement("br"));
      branch.links.forEach((item, index) => {
        if (index) container.append(document.createTextNode(" / "));
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.title;
        container.append(link);
      });
    }
    return container;
  }

  function renderMain(container) {
    const lanes = groups.filter(group => group.main).map(group => {
      const section = document.createElement("section");
      section.className = "lane";
      const heading = document.createElement("h2");
      heading.textContent = group.title;
      const list = document.createElement("ol");
      group.pages.forEach(page => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.className = "node";
        link.href = page.href;
        link.textContent = page.title;
        const description = document.createElement("p");
        description.textContent = page.description;
        item.append(link, description);
        (page.branches || []).forEach(branch => item.append(renderBranch(branch)));
        list.append(item);
      });
      section.append(heading, list);
      return section;
    });
    container.replaceChildren(...lanes);
  }

  function renderEntryPaths(container) {
    const heading = container.querySelector("#entry-title");
    const paths = entryPaths.map(path => {
      const item = document.createElement("div");
      item.className = "entry-path";
      const title = document.createElement("h3");
      title.textContent = path.title;
      const description = document.createElement("p");
      path.parts.forEach(part => {
        if (typeof part === "string") {
          description.append(document.createTextNode(part));
        } else if (part.connector) {
          const connector = document.createElement("span");
          connector.className = "path-connector";
          connector.setAttribute("aria-label", part.ariaLabel);
          connector.textContent = part.connector;
          description.append(connector);
        } else {
          const link = document.createElement("a");
          link.className = "path-link";
          link.setAttribute("href", part.href);
          link.textContent = part.title;
          description.append(link);
        }
      });
      item.append(title, description);
      return item;
    });
    container.replaceChildren(heading, ...paths);
  }

  window.ServiceJourneyMap = { groups, repairVersions, renderMain, entryPaths, renderEntryPaths };
  const board = document.querySelector("[data-journey-board]");
  if (board) renderMain(board);
  const entries = document.querySelector("[data-entry-paths]");
  if (entries) renderEntryPaths(entries);
})();