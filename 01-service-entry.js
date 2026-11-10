(() => {
  const app = document.querySelector("#app-scroll");
  const groups = document.querySelector("#service-groups");
  const live = document.querySelector("#live-region");
  const categories = [
    { id: "bike", name: "自行车" },
    { id: "badminton", name: "羽毛球 / 网球" },
    { id: "ski", name: "滑雪" },
  ];

  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  let equipmentState = "has";
  let benefitState = "has";
  let orderPresence = "none";
  let selectedEquipment = equipmentItems[0];

  document.querySelector("#home-design-notes-link").addEventListener("click", () => {
    document.querySelector("#home-design-notes").open = true;
  });

  function recommendedServiceIds() {
    return {
      bike: ["bike-inspection", "bike-maintenance"],
      other: ["bike-inspection", "bike-maintenance"],
      racket: ["badminton-stringing"],
      ski: ["ski-waxing", "ski-maintenance"],
    }[selectedEquipment.category] || [];
  }

  function renderRecommendations() {
    const section = document.querySelector(".recommendations");
    section.hidden = equipmentState === "none" || !document.querySelector(".personal-benefits").hidden;
    if (section.hidden || typeof serviceCatalog === "undefined") return;
    const ids = recommendedServiceIds();
    document.querySelector("#recommended-services").innerHTML = serviceCatalog
      .filter(service => ids.includes(service.id))
      .map(service => {
        const price = formatServicePrice(Math.min(...service.options.map(option => option.price)));
        return `<button type="button" class="recommendation-item" data-service="${escapeHTML(service.id)}" aria-label="${escapeHTML(service.title)}，参考价 ${price} 元起"><span>${escapeHTML(service.title)}</span><span class="recommendation-price">¥${price} 起</span></button>`;
      }).join("");
  }

  function renderEquipment() {
    const bar = document.querySelector("#equipment-bar");
    const emptyBar = document.querySelector("#equipment-empty-bar");
    const hint = document.querySelector("#equipment-hint");
    const empty = equipmentState === "none";
    bar.hidden = empty;
    emptyBar.hidden = !empty;
    if (!empty) {
      const item = selectedEquipment;
      document.querySelector("#equipment-image").src = `assets/figma/${item.image}`;
      document.querySelector("#equipment-name").textContent = item.homeName || item.name;
      document.querySelector("#equipment-note").textContent = item.homeNote;
      hint.textContent = `${equipmentItems.length} 件装备`;
      hint.hidden = false;
      bar.setAttribute("aria-label", `当前装备 ${item.homeName || item.name}，共 ${equipmentItems.length} 件装备，前往选择装备`);
    }
    renderRecommendations();
    renderServices();
  }

  function setEquipmentState(state, updateURL = false) {
    equipmentState = state === "none" ? "none" : "has";
    document.querySelectorAll("[data-equipment-state]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.equipmentState === equipmentState));
    });
    if (updateURL) {
      const url = new URL(location.href);
      equipmentState === "has" ? url.searchParams.delete("equipmentState") : url.searchParams.set("equipmentState", equipmentState);
      history.replaceState(history.state, "", url);
    }
    renderEquipment();
    const label = equipmentState === "has" ? "有装备" : "无装备";
    live.textContent = `装备栏已切换至${label}状态。`;
  }

  // 当前订单卡片的三种状态：待预约 / 待到店 / 排队中。
  const homeOrderStates = {
    pending: { tag: "待预约", detail: "已支付，请尽快选择门店与到店时间", action: "立即预约" },
    booked: { tag: "待到店", detail: "上海徐汇店｜10月24日 周六 14:00", action: "查看预约" },
    queued: { tag: "排队中", detail: "已签到 · 排队号 A-023 · 预计等待约 20 分钟", action: "查看订单" },
  };
  let orderState = "booked";

  function setOrderState(state, updateURL = false) {
    orderState = homeOrderStates[state] ? state : "booked";
    const current = homeOrderStates[orderState];
    const tag = document.querySelector("#order-status");
    tag.textContent = current.tag;
    tag.className = `order-status is-${orderState}`;
    document.querySelector("#order-detail").textContent = current.detail;
    document.querySelector("#order-action-label").textContent = current.action;
    document.querySelectorAll("[data-order-state]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.orderState === orderState));
    });
    if (updateURL) {
      const url = new URL(location.href);
      orderState === "booked" ? url.searchParams.delete("orderState") : url.searchParams.set("orderState", orderState);
      history.replaceState(history.state, "", url);
    }
    live.textContent = `当前订单已切换至${current.tag}状态。`;
  }

  function orderActionTarget() {
    const base = { name: "自行车基础保养", equipment: "Rockrider ST 530", order: "SO-2601024", category: "bike" };
    if (orderState === "pending") return { path: "10-service-order-detail.html", params: { ...base, booking: "none", selectBooking: "1" } };
    if (orderState === "queued") return { path: "10-service-order-detail.html", params: { ...base, booking: "created", checkin: "done", demoState: "queued" } };
    return { path: "07-appointment-detail-cancel.html", params: { ...base, booking: "created", date: "2026-10-24", time: "14:00" } };
  }

  function orderCardTarget() {
    const base = { name: "自行车基础保养", equipment: "Rockrider ST 530", order: "SO-2601024", category: "bike" };
    if (orderState === "pending") return { path: "10-service-order-detail.html", params: { ...base, booking: "none", selectBooking: "1" } };
    if (orderState === "queued") return { path: "10-service-order-detail.html", params: { ...base, booking: "created", checkin: "done", demoState: "queued" } };
    return { path: "10-service-order-detail.html", params: { ...base, booking: "created", date: "2026-10-24", time: "14:00", demoState: "booked" } };
  }

  function renderPersonalState(updateURL = false) {
    const hasOrder = orderPresence === "has";
    const hasBenefits = benefitState === "has";
    document.querySelector(".personal-order").hidden = !hasOrder;
    document.querySelector(".personal-benefits").hidden = !hasBenefits;
    renderRecommendations();
    document.querySelectorAll("[data-benefit-state]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.benefitState === benefitState));
    });
    document.querySelectorAll("[data-order-presence]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.orderPresence === orderPresence));
    });
    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.delete("scenario");
      url.searchParams.set("benefitState", benefitState);
      url.searchParams.set("orderPresence", orderPresence);
      history.replaceState(history.state, "", url);
    }
    app.scrollTop = 0;
    syncStickyCategory();
    markCategory("all");
    live.textContent = `首页状态已更新：${hasBenefits ? "有权益" : "无权益"}，${hasOrder ? "有订单" : "无订单"}。`;
  }

  function readPersonalState(params) {
    const legacyScenario = params.get("scenario");
    const legacyStates = {
      all: { benefit: "has", order: "has" },
      orders: { benefit: "none", order: "has" },
      benefits: { benefit: "has", order: "none" },
      recommendations: { benefit: "none", order: "none" },
    };
    const legacy = legacyStates[legacyScenario];
    benefitState = params.get("benefitState") === "none" ? "none" : params.get("benefitState") === "has" ? "has" : legacy?.benefit || "has";
    orderPresence = params.get("orderPresence") === "has" ? "has" : params.get("orderPresence") === "none" ? "none" : legacy?.order || "none";
  }

  function serviceCard(service) {
    const price = Math.min(...service.options.map(option => option.price));
    const imageType = service.id === "tennis-stringing" ? "tennis" : service.category;
    const tags = equipmentState === "has" && recommendedServiceIds().includes(service.id)
      ? ["为你推荐", ...service.tags]
      : service.tags;
    const [major, decimal] = formatServicePrice(price).split(".");
    return `<button type="button" class="service-card" data-service="${escapeHTML(service.id)}" aria-label="${escapeHTML(service.title)}，参考价 ${formatServicePrice(price)} 元起">
      <img src="assets/service-${imageType}.svg" alt="">
      <span class="service-copy">
        <span class="service-name">${escapeHTML(service.title)}</span>
        <span class="service-description">${escapeHTML(service.detail)}</span>
        <span class="service-tags">${tags.map(tag => `<span class="service-tag">${escapeHTML(tag)}</span>`).join("")}</span>
        <span class="service-price"><span class="price-label">参考价</span><span class="price-value"><span class="currency">¥</span><span class="major">${major}</span>${decimal ? `<span class="decimal">.${decimal}</span>` : ""}<span class="unit">起</span></span></span>
      </span>
    </button>`;
  }

  function renderServices() {
    if (typeof serviceCatalog === "undefined") return;
    groups.innerHTML = categories.map(category => {
      const services = serviceCatalog.filter(item => item.category === category.id);
      return `<section class="group" id="category-${category.id}" data-category-group="${category.id}">
        <div class="group-heading"><h2>${category.name}</h2><span>${services.length} 项服务</span></div>
        <div class="service-list">${services.map(serviceCard).join("")}</div>
      </section>`;
    }).join("");
  }

  function selectCategory(id) {
    const target = id === "all" ? document.querySelector(".directory") : document.querySelector(`#category-${id}`);
    if (!target) return;
    const sticky = document.querySelector(".category-nav");
    const offset = id === "all" ? 0 : sticky.offsetHeight;
    app.scrollTop += target.getBoundingClientRect().top - app.getBoundingClientRect().top - offset;
    markCategory(id);
    live.textContent = id === "all" ? "已回到装备与权益。" : `已滚动到${categories.find(item => item.id === id).name}服务。`;
  }

  function markCategory(id) {
    document.querySelectorAll("[data-category]").forEach(button => {
      const selected = button.dataset.category === id;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
  }

  function syncStickyCategory() {
    const nav = document.querySelector(".category-nav");
    const directory = document.querySelector(".directory");
    const top = app.getBoundingClientRect().top;
    nav.classList.toggle("is-stuck", directory.getBoundingClientRect().top <= top && nav.getBoundingClientRect().top <= top + 1);
  }

  function navigate(path, values = {}) {
    const url = new URL(path, location.href);
    Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, value));
    location.assign(url);
  }

  renderServices();
  const initialParams = new URLSearchParams(location.search);
  selectedEquipment = equipmentItems.find(item => item.id === initialParams.get("selectedEquipment")) || equipmentItems[0];
  readPersonalState(initialParams);
  renderPersonalState();
  setEquipmentState(initialParams.get("equipmentState"));
  setOrderState(initialParams.get("orderState"));
  document.querySelector("[data-benefit-state]").closest(".scenario-options").addEventListener("click", event => {
    const button = event.target.closest("[data-benefit-state]");
    if (button) {
      benefitState = button.dataset.benefitState;
      renderPersonalState(true);
    }
  });
  document.querySelector("[data-order-presence]").closest(".scenario-options").addEventListener("click", event => {
    const button = event.target.closest("[data-order-presence]");
    if (button) {
      orderPresence = button.dataset.orderPresence;
      renderPersonalState(true);
    }
  });
  document.querySelector("[data-equipment-state]").closest(".scenario-options").addEventListener("click", event => {
    const button = event.target.closest("[data-equipment-state]");
    if (button) setEquipmentState(button.dataset.equipmentState, true);
  });
  document.querySelector("[data-order-state]").closest(".scenario-options").addEventListener("click", event => {
    const button = event.target.closest("[data-order-state]");
    if (button) setOrderState(button.dataset.orderState, true);
  });
  window.addEventListener("popstate", () => {
    readPersonalState(new URLSearchParams(location.search));
    renderPersonalState();
  });
  document.querySelector(".category-nav").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) selectCategory(button.dataset.category);
  });
  document.querySelector(".category-nav").addEventListener("keydown", event => {
    const current = event.target.closest("[data-category]");
    if (!current || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...document.querySelectorAll("[data-category]")];
    const index = buttons.indexOf(current);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus({ preventScroll: true });
    selectCategory(buttons[next].dataset.category);
  });
  app.addEventListener("click", event => {
    const benefit = event.target.closest("[data-benefit]");
    if (benefit) {
      navigate("03-benefit-detail.html", { benefit: benefit.dataset.benefit, entry: "service", sourceOrder: "810263" });
      return;
    }
    const serviceButton = event.target.closest("[data-service]");
    if (serviceButton) {
      const service = serviceCatalog.find(item => item.id === serviceButton.dataset.service);
      if (!service) return;
      const price = Math.min(...service.options.map(option => option.price));
      navigate("02-service-detail.html", { entry: "service", category: service.category, name: service.title, group: service.id, description: service.detail, price });
      return;
    }
    if (event.target.closest('[data-action="equipment"]')) {
      navigate("equipment-library.html", { mode: "select", selectedEquipment: selectedEquipment.id, equipmentState, return: location.href });
    }
    if (event.target.closest('[data-action="appointment"]')) {
      const target = orderActionTarget();
      navigate(target.path, target.params);
      return;
    }
    const orderCard = event.target.closest(".order-card");
    if (orderCard) {
      const target = orderCardTarget();
      navigate(target.path, target.params);
      return;
    }
    const benefitCard = event.target.closest(".benefit-card");
    if (benefitCard) {
      const benefit = benefitCard.querySelector("[data-benefit]");
      if (benefit) navigate("03-benefit-detail.html", { benefit: benefit.dataset.benefit, entry: "service", sourceOrder: "810263" });
    }
  });
  document.querySelectorAll(".order-card, .benefit-card").forEach(card => {
    card.addEventListener("keydown", event => {
      if (!(event.key === "Enter" || event.key === " ") || event.target !== card) return;
      event.preventDefault();
      card.click();
    });
  });
  document.querySelector("#home-tab").addEventListener("click", () => {
    app.scrollTop = 0;
    markCategory("all");
  });
  let scrollFrame = 0;
  app.addEventListener("scroll", () => {
    syncStickyCategory();
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const boundary = app.getBoundingClientRect().top + document.querySelector(".category-nav").offsetHeight + 3;
      let active = "all";
      document.querySelectorAll("[data-category-group]").forEach(group => {
        if (group.getBoundingClientRect().top <= boundary) active = group.dataset.categoryGroup;
      });
      markCategory(active);
    });
  }, { passive: true });

})();
