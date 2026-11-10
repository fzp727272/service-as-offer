const orders = [
      { number: "DX20240905102", status: "待付款", title: "自行车基础保养", equipment: "Rockrider ST 530", store: "迪卡侬上海五角场店", price: "199", image: "order-bike-pending.png", actions: ["取消服务", "立即付款"] },
      { number: "DX20240905102", status: "待预约", title: "自行车基础保养", equipment: "Rockrider ST 530", store: "迪卡侬上海五角场店", price: "199", image: "order-bike-awaiting.png", actions: ["立即预约"] },
      { number: "DX20240905101", status: "待到店", title: "自行车基础保养", equipment: "Rockrider ST 530", store: "迪卡侬上海五角场店", price: "199", image: "order-bike-awaiting.png", appointment: "9月5日 周六 · 14:00 到店", actions: ["查看预约"] },
      { number: "DX20240908339", status: "待到店", benefit: "新车安装权益", title: "自行车新车安装", equipment: "Riverside Touring", store: "迪卡侬上海花木店", image: "order-bike-install.png", appointment: "9月8日 · 10:00 到店", actions: ["查看预约"] },
      { number: "DX20240908126", status: "排队中", title: "自行车基础保养", equipment: "Rockrider ST 530", store: "迪卡侬上海五角场店", price: "199", image: "order-bike-awaiting.png", appointment: "已签到 · 排队号 A-023 · 预计等待约 20 分钟", actions: ["查看订单"] },
      { number: "DX20240905088", status: "服务中", title: "自行车维修", equipment: "Specialized Allez", store: "迪卡侬上海五角场店", image: "order-bike-repair.png", warning: "有新的维修方案需要确认", actions: ["查看并确认"] },
      { number: "DX20240821004", status: "已完成", title: "羽毛球拍穿线", equipment: "PERFLY BR 990", store: "上海五角场店", image: "order-badminton.png", actions: ["查看记录", "再次穿线"] },
    ];
    const filters = [
      { id: "all", label: "全部", count: "20" },
      { id: "待付款", label: "待付款", count: "0" },
      { id: "待预约", label: "待预约", count: "0" },
      { id: "待到店", label: "待到店", count: "1" },
      { id: "排队中", label: "排队中", count: "1" },
      { id: "服务中", label: "服务中", count: "1" },
      { id: "已完成", label: "已完成", count: "18" },
      { id: "已取消", label: "已取消", count: "" },
    ];
    const primaryActions = {
      "待付款": "立即付款",
      "待预约": "立即预约",
      "服务中": "查看并确认",
    };
    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    const filterRoot = document.querySelector("#order-filters");
    const listRoot = document.querySelector("#order-list");
    const toast = document.querySelector("#order-toast");
    let activeFilter = "all";
    let toastTimer;

    function orderCardMarkup(order) {
      const tagClass = order.status === "待付款" ? "warning" : order.status === "已完成" ? "complete" : "";
      return `<article class="order-card" tabindex="0" aria-label="查看订单详情：${escapeHtml(order.title)}，服务单号 ${escapeHtml(order.number)}，${escapeHtml(order.status)}">
        <div class="order-card-head"><p class="order-number">服务单号: ${escapeHtml(order.number)}</p><span class="order-status-tag ${tagClass}">${escapeHtml(order.status)}</span></div>
        ${order.benefit ? `<p class="order-benefit">${escapeHtml(order.benefit)}</p>` : ""}
        <div class="order-card-body"><img src="assets/figma/${order.image}" alt="" width="64" height="64"><div class="order-service-copy"><strong>${escapeHtml(order.title)}</strong><small>设备：${escapeHtml(order.equipment)}</small><small>门店：${escapeHtml(order.store)}</small></div></div>
        ${order.appointment ? `<div class="order-info-banner">${escapeHtml(order.appointment)}</div>` : ""}
        ${order.warning ? `<div class="order-info-banner">ⓘ ${escapeHtml(order.warning)}</div>` : ""}
        <div class="order-card-foot">${order.benefit ? '<strong class="order-benefit-label">免费权益</strong>' : order.price ? `<strong class="order-price"><span>¥</span>${escapeHtml(order.price)}</strong>` : "<span></span>"}<div class="order-card-foot-actions">${order.actions.map(action => `<button type="button" class="order-action ${action === primaryActions[order.status] ? "primary" : ""}" data-order-index="${orders.indexOf(order)}" data-order-action="${escapeHtml(action)}">${escapeHtml(action)}</button>`).join("")}</div></div>
      </article>`;
    }

    function render() {
      const shownOrders = activeFilter === "all" ? orders : orders.filter(order => order.status === activeFilter);
      filterRoot.innerHTML = filters.map(filter => `<button type="button" class="orders-tab" role="tab" aria-selected="${activeFilter === filter.id}" data-filter="${escapeHtml(filter.id)}">${escapeHtml(filter.label)} ${filter.id === "all" ? orders.length : orders.filter(order => order.status === filter.id).length}</button>`).join("");
      listRoot.innerHTML = shownOrders.map(orderCardMarkup).join("") || '<p class="orders-empty">暂无该状态的订单</p>';
    }

    function showToast(message) {
      toast.textContent = message;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
    }

    filterRoot.addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter;
      document.querySelector(".orders-list").scrollTop = 0;
      render();
    });
    function openOrder(order, action) {
      const routes = { "立即付款": "05-order-checkout.html", "立即预约": "10-service-order-detail.html", "查看预约": "10-service-order-detail.html", "查看订单": "10-service-order-detail.html", "取消服务": "10-service-order-detail.html", "查看并确认": "10-service-order-detail.html", "查看记录": "10-service-order-detail.html", "再次穿线": "02-service-detail.html" };
      const next = new URL(routes[action], location.href);
      next.search = new URLSearchParams({ name: order.title, equipment: order.equipment, order: order.number, category: order.title.includes("羽毛球") ? "badminton" : "bike", booking: ["待到店", "排队中"].includes(order.status) ? "created" : "none" });
      if (order.status === "排队中") next.searchParams.set("checkin", "done");
      if (action === "立即预约") next.searchParams.set("selectBooking", "1");
      if (order.price) next.searchParams.set("price", order.price);
      if (order.benefit) next.searchParams.set("context", "benefit");
      if (order.status === "待付款") next.searchParams.set("paymentState", "unpaid");
      if (action === "取消服务") next.searchParams.set("demoState", order.status === "待付款" ? "unpaid" : "pending");
      if (order.status === "服务中") next.searchParams.set("serviceState", "active");
      if (order.status === "已完成" && action !== "再次穿线") next.searchParams.set("serviceState", "completed");
      location.assign(next);
    }

    listRoot.addEventListener("click", event => {
      const button = event.target.closest("[data-order-action]");
      if (button) {
        openOrder(orders[Number(button.dataset.orderIndex)], button.dataset.orderAction);
        return;
      }
      const card = event.target.closest(".order-card");
      if (card) {
        const index = Number(card.querySelector("[data-order-index]")?.dataset.orderIndex);
        const order = Number.isInteger(index) ? orders[index] : null;
        if (order) openOrder(order, "查看订单");
      }
    });
    listRoot.addEventListener("keydown", event => {
      if (event.key !== "Enter" || event.target.closest("button")) return;
      const card = event.target.closest(".order-card");
      if (!card) return;
      event.preventDefault();
      const index = Number(card.querySelector("[data-order-index]")?.dataset.orderIndex);
      const order = Number.isInteger(index) ? orders[index] : null;
      if (order) openOrder(order, "查看订单");
    });
    render();
