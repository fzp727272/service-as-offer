    const filters = [
      { id: "all", label: "全部" },
      { id: "bike", label: "自行车" },
      { id: "racket", label: "球拍" },
      { id: "ski", label: "雪板" },
      { id: "other", label: "大器械" }
    ];
    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    const tabs = document.getElementById("equipment-tabs");
    const list = document.getElementById("equipment-list");
    const scrollArea = document.getElementById("scroll-area");
    const live = document.getElementById("live");
    const params = new URLSearchParams(location.search);
    const selectionMode = params.get("mode") === "select";
    const navigation = document.querySelector("prototype-nav");
    const availableItems = selectionMode && params.get("equipmentState") === "none" ? [] : equipmentItems;
    let selectedId = availableItems.find(item => item.id === params.get("selectedEquipment"))?.id || availableItems[0]?.id;
    let activeFilter = "all";
    let toastTimer;

    function render() {
      const grouped = filters.slice(1).map(filter => ({
        ...filter,
        items: availableItems.filter(item => item.category === filter.id)
      }));
      tabs.innerHTML = filters.map(filter => {
        const count = filter.id === "all" ? availableItems.length : availableItems.filter(item => item.category === filter.id).length;
        const target = filter.id === "all" ? "equipment-list" : `equipment-group-${filter.id}`;
        return `<button type="button" class="equipment-tab" id="equipment-tab-${filter.id}" role="tab" aria-selected="${activeFilter === filter.id}" aria-controls="${target}" data-equipment-category="${filter.id}">${filter.label} ${count}</button>`;
      }).join("");
      list.innerHTML = !availableItems.length ? '<p class="equipment-selection-empty">还没有关联装备，添加后为你推荐适合的服务</p>' : grouped.map(group => `<section class="equipment-group" id="equipment-group-${group.id}" data-equipment-group="${group.id}" aria-labelledby="equipment-group-title-${group.id}">
        <div class="equipment-group-heading"><h2 id="equipment-group-title-${group.id}">${group.label}</h2><span>${group.items.length} 件</span></div>
        ${group.items.map(item => `<article class="equipment-card${selectionMode ? ' equipment-card-selectable' : ''}">
          ${selectionMode ? `<label class="equipment-select"><input type="radio" name="selected-equipment" value="${escapeHtml(item.id)}" aria-label="选择${escapeHtml(item.name)}" ${item.id === selectedId ? "checked" : ""}><span class="equipment-select-indicator" aria-hidden="true"></span>` : ''}
          <div class="equipment-card-main">
            <img src="assets/figma/${item.image}" alt="" width="58" height="58">
            <div class="equipment-card-copy"><span class="equipment-source ${item.source === "其他品牌" ? "other" : ""}">${item.source}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.detail)}</p><small>${item.synced ? '<span class="inline-check-icon" role="img" aria-label="已同步"></span> ' : ''}${escapeHtml(item.date)}</small></div>
          </div>
          ${selectionMode ? '<span class="equipment-selected-corner" aria-hidden="true"></span></label>' : `<div class="equipment-status ${item.tone === "brand" ? "" : item.tone}">
            <div class="equipment-status-copy"><strong>${escapeHtml(item.status)}</strong><small>${escapeHtml(item.note)}</small></div>
            <button type="button" data-action="equipment-service" data-equipment-index="${equipmentItems.indexOf(item)}" data-title="${escapeHtml(item.action)}">${escapeHtml(item.action)}</button>
          </div>`}
        </article>`).join("")}
      </section>`).join("");
    }
    if (selectionMode) {
      navigation.setAttribute("title", "选择装备");
      document.getElementById("equipment-selection-footer").hidden = false;
      updateSelectionSummary();
      if (!availableItems.length) {
        document.querySelector(".equipment-summary-note").textContent = "还没有关联装备";
        document.querySelector(".equipment-count").innerHTML = "0<small>件</small>";
        tabs.hidden = true;
      }
      list.addEventListener("change", event => {
        if (event.target.name === "selected-equipment") {
          selectedId = event.target.value;
          updateSelectionSummary();
        }
      });
      document.getElementById("confirm-equipment").addEventListener("click", () => {
        if (!selectedId) return;
        const destination = returnDestination();
        destination.searchParams.set("selectedEquipment", selectedId);
        destination.searchParams.delete("equipmentState");
        location.assign(destination);
      });
    }
    function updateSelectionSummary() {
      const selected = availableItems.find(item => item.id === selectedId);
      document.getElementById("selected-equipment-name").textContent = selected ? selected.name : "未选择";
      document.getElementById("confirm-equipment").disabled = !selected;
    }
    function returnDestination() {
      const fallback = new URL("01-service-entry.html", location.href);
      try {
        const candidate = new URL(params.get("return") || fallback.href, location.href);
        return candidate.origin === location.origin ? candidate : fallback;
      } catch {
        return fallback;
      }
    }
    navigation.setAttribute("back-href", returnDestination().href);
    function selectCategory(id) {
      const tab = tabs.querySelector(`#equipment-tab-${id}`);
      if (!tab) throw new Error(`未知装备分类：${id}`);
      activeFilter = id;
      tabs.querySelectorAll("[data-equipment-category]").forEach(button => {
        button.setAttribute("aria-selected", String(button.dataset.equipmentCategory === id));
      });
      const target = id === "all" ? document.getElementById("equipment-list") : document.getElementById(`equipment-group-${id}`);
      const stickyHeight = navigation.offsetHeight + tabs.offsetHeight;
      const top = scrollArea.scrollTop + target.getBoundingClientRect().top - scrollArea.getBoundingClientRect().top - stickyHeight;
      scrollArea.scrollTo({ top: Math.max(0, top), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      live.textContent = id === "all" ? "已定位到全部装备。" : `已定位到${filters.find(filter => filter.id === id).label}装备。`;
    }
    function showToast(message) {
      let toast = document.querySelector(".toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.append(toast);
      }
      toast.textContent = message;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.remove(), 2400);
    }
    tabs.addEventListener("click", event => {
      const tab = event.target.closest("[data-equipment-category]");
      if (tab) selectCategory(tab.dataset.equipmentCategory);
    });
    document.addEventListener("click", event => {
      const action = event.target.closest("[data-action]");
      if (action?.dataset.action === "equipment-add") showToast("添加装备流程尚未连接。");
      if (action?.dataset.action === "equipment-service") {
        const item = equipmentItems[Number(action.dataset.equipmentIndex)];
        const next = new URL(item.tone === "positive" ? "03-benefit-detail.html" : "02-service-detail.html", location.href);
        next.search = new URLSearchParams({ category: item.category === "racket" ? "badminton" : item.category === "other" ? "bike" : item.category, equipment: item.name });
        if (item.tone === "positive") next.searchParams.set("benefit", "installation");
        location.assign(next);
      }
    });
    navigation.setAttribute("back-label", "返回上一页");
    navigation.setAttribute("back-mode", "history");
    if (selectionMode) navigation.setAttribute("title", "选择装备");
    render();
