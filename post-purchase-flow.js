(() => {
  const page = document.body.dataset.page;
  const params = new URLSearchParams(window.location.search);
  const serviceContext = new URLSearchParams();
  ["category", "name", "description", "price", "context", "benefit", "equipment", "order", "sourceOrder", "entry", "city", "store", "date", "time", "booking", "serviceState", "checkin", "payment", "paymentState"].forEach((key) => {
    if (params.has(key)) serviceContext.set(key, params.get(key));
  });
  if (["store", "schedule"].includes(page) &&
      (params.get("booking") === "created" || params.get("reschedule") === "1" ||
       params.get("checkin") === "done" || params.has("serviceState"))) {
    const destination = new URL("12-service-order-detail.html", location.href);
    destination.search = serviceContext.toString();
    if (params.get("reschedule") === "1") {
      ["date", "time", "city", "store"].forEach(key => {
        const oldValue = params.get(`old${key[0].toUpperCase()}${key.slice(1)}`);
        if (oldValue) destination.searchParams.set(key, oldValue);
      });
      destination.searchParams.set("booking", "created");
    }
    destination.searchParams.set("notice", "reschedule-unavailable");
    location.replace(destination.href);
    return;
  }
  const stores = {
    shanghai: ["上海门店 01", "上海门店 02"],
    hangzhou: ["杭州门店 01", "杭州门店 02"],
  };
  const storeDetails = {
    shanghai: [
      { address: "上海市杨浦区淞沪路161号", distance: "2.3 km" },
      { address: "上海市徐汇区漕溪北路", distance: "4.8 km" },
    ],
    hangzhou: [
      { address: "杭州市滨江区江南大道", distance: "1.8 km" },
      { address: "杭州市西湖区古墩路", distance: "4.2 km" },
    ],
  };
  const storeMapUrl = (name, address) => `https://map.qq.com/?q=${encodeURIComponent(`${name} ${address}`)}`;
  const slots = [...document.querySelectorAll("[data-time]")];
  const stateButtons = [...document.querySelectorAll(".state-option")];

  const setPressed = (buttons, selected, key) => {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset[key] === selected));
    });
  };

  const navigate = (file, values = {}) => {
    const next = new URLSearchParams(serviceContext);
    Object.entries(values).forEach(([key, value]) => next.set(key, value));
    const destination = new URL(file, window.location.href);
    destination.search = next.toString();
    window.location.href = destination.href;
  };

  if (page === "order") {
    const card = document.querySelector(".status-card");
    const mark = card.querySelector(".check");
    const title = card.querySelector(".status-title");
    const subtitle = card.querySelector(".status-sub");
    const action = document.querySelector("#primary-action");
    const feedback = document.querySelector("#state-description");
    const buttons = [...document.querySelectorAll("button[data-payment-state]")];
    let state = ["paid", "unpaid", "unknown"].includes(params.get("paymentState"))
      ? params.get("paymentState")
      : "paid";
    let queryResult = "unknown";
    let pollTimer;
    let pollCount = 0;
    const loadingToast = document.querySelector("#payment-loading-toast");
    const stopPolling = () => {
      window.clearInterval(pollTimer);
      pollTimer = undefined;
    };

    const render = () => {
      card.dataset.paymentState = state;
      setPressed(buttons, state, "paymentState");
      mark.classList.toggle("warning", state === "unpaid");
      mark.classList.toggle("neutral", state === "unknown");
      mark.textContent = state === "paid" ? "✓" : state === "unpaid" ? "×" : "?";
      title.textContent = state === "paid"
        ? "支付成功"
        : state === "unpaid" ? "支付失败" : "支付结果待确认";
      subtitle.textContent = state === "paid"
        ? "支付已完成，现在可以预约服务"
        : state === "unpaid" ? "未完成支付，请重新发起支付" : "请稍候，暂不要重复支付或预约";
      action.disabled = state === "unknown";
      loadingToast.hidden = state !== "unknown";
      card.setAttribute("aria-busy", String(state === "unknown"));
      action.textContent = state === "paid"
        ? "立即预约"
        : state === "unpaid" ? "重新支付" : "结果确认中";
      feedback.textContent = state === "paid"
        ? "点击“立即预约”选择服务门店与时段。"
        : state === "unpaid" ? "点击“重新支付”返回结算页面。"
          : "支付结果待确认时，暂不允许继续预约或重复支付。";
      const amount = Number(params.get("price") || 199.9);
      document.querySelector("#payment-amount-label").textContent = state === "paid" ? "实付金额" : "订单金额";
      document.querySelector("#payment-amount").textContent = Number.isFinite(amount) && amount >= 0
        ? params.get("payment") === "points" ? `${Math.round(amount * 100).toLocaleString("zh-CN")} 燃值` : `¥${amount.toFixed(2)}`
        : "金额异常，请返回订单核对";
      document.querySelector("#payment-method").textContent = params.get("payment") === "points" ? "燃值抵扣" : "微信支付";
      document.querySelector("#payment-order").textContent = params.get("order") || "SO-2601024";
      const current = new URL(location.href);
      current.searchParams.set("paymentState", state);
      current.searchParams.delete("demoState");
      history.replaceState(null, "", current);
      const orderLink = new URL("12-service-order-detail.html", location.href);
      orderLink.search = serviceContext.toString();
      orderLink.searchParams.set("paymentState", state);
      document.querySelector("#result-order-link").href = orderLink.href;
      if (state !== "unknown") stopPolling();
      else if (!pollTimer) {
        pollTimer = window.setInterval(() => {
          pollCount += 1;
          feedback.textContent = `本地轮询演示：已查询 ${pollCount} 次，尚未接入真实支付接口。请通过状态按钮提供模拟查询结果。`;
          if (queryResult !== "unknown") {
            state = queryResult;
            render();
          }
        }, 1500);
      }
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        queryResult = button.dataset.paymentState;
        if (state === "unknown" && queryResult !== "unknown") {
          feedback.textContent = "已设置模拟查询结果，等待下一次轮询返回。";
          return;
        }
        state = queryResult;
        pollCount = 0;
        render();
      });
      window.addEventListener("pagehide", stopPolling);
      window.addEventListener("pageshow", event => {
        if (event.persisted) render();
      });
    });
    action.addEventListener("click", () => {
      if (state === "unpaid") {
        navigate("05-order-checkout.html", { paymentState: "unpaid" });
      } else if (state === "paid") {
        navigate("06-store-selection.html", { paymentState: "paid" });
      }
    });
    render();
    return;
  }

  if (page === "store") {
    const city = document.querySelector("#city-select");
    const cityLabel = city.querySelector("[data-city-label]");
    const cityOptions = document.querySelector("#city-options");
    let selectedCity = stores[params.get("city")] ? params.get("city") : "shanghai";
    const storeCards = [...document.querySelectorAll("[data-store-id]")];
    const message = document.querySelector("#resource-message");
    const action = document.querySelector("#primary-action");
    const selectedLabel = document.querySelector("#selected-store-label");
    const feedback = document.querySelector("#state-description");
    const resourceButtons = [...document.querySelectorAll("button[data-resource-state]")];
    const contactDialog = document.querySelector("#store-contact-dialog");
    const contactStore = document.querySelector("[data-contact-store]");
    let resourceState = params.get("location") === "denied" ? "denied" : "available";
    let selectedStore = ["store-1", "store-2"].includes(params.get("store")) ? params.get("store") : "store-1";
    const locationDialog = document.querySelector("#location-denied-dialog");
    const showLocationDenied = () => {
      selectedCity = "shanghai";
      selectedStore = "store-1";
      cityLabel.textContent = "上海";
      cityOptions.querySelectorAll("[data-city]").forEach(option => {
        option.setAttribute("aria-pressed", String(option.dataset.city === "shanghai"));
      });
      cityOptions.classList.remove("open");
      city.setAttribute("aria-expanded", "false");
      if (!locationDialog.open) locationDialog.showModal();
    };
    locationDialog.querySelector("[data-close-location]").addEventListener("click", () => locationDialog.close());

    cityLabel.textContent = selectedCity === "shanghai" ? "上海" : "杭州";
    cityOptions.querySelectorAll("[data-city]").forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.city === selectedCity));
    });

    const render = () => {
      const cityStores = stores[selectedCity];
      storeCards.forEach((card, index) => {
        const isSelected = card.dataset.storeId === selectedStore;
        const name = cityStores[index];
        const nameElement = card.querySelector("[data-store-name]");
        if (nameElement.firstChild) nameElement.firstChild.textContent = name;
        card.querySelector("[data-store-selected]").hidden = !isSelected;
        const detail = storeDetails[selectedCity][index];
        card.querySelector("[data-store-address]").textContent = detail.address;
        card.querySelector("[data-store-distance]").textContent = detail.distance;
        const mapLink = card.querySelector("[data-store-map]");
        mapLink.href = storeMapUrl(name, detail.address);
        mapLink.setAttribute("aria-label", `在微信地图中查看${name}`);
        card.hidden = resourceState === "empty";
        card.classList.toggle("selected", isSelected);
        card.querySelector("[data-store-select]").setAttribute("aria-pressed", String(isSelected));
      });
      const selectedIndex = selectedStore === "store-2" ? 1 : 0;
      selectedLabel.textContent = resourceState === "empty" ? "暂无可选门店" : cityStores[selectedIndex];
      message.hidden = resourceState === "available";
      message.classList.toggle("error", resourceState === "empty");
      message.textContent = resourceState === "empty"
        ? "当前城市暂无匹配门店，请切换城市。"
        : resourceState === "denied"
          ? "未获得定位权限，已默认选择上海。您可以手动切换城市。"
          : "";
      action.disabled = resourceState === "empty" || params.get("context") === "repair" || ["unpaid", "unknown"].includes(params.get("paymentState"));
      action.textContent = params.get("context") === "repair" ? "请到店确认维修项目" : "确定";
      setPressed(resourceButtons, resourceState, "resourceState");
      feedback.textContent = resourceState === "available"
        ? "选择门店后可继续查看可约时段。"
        : resourceState === "empty" ? "暂时没有可继续的门店；可通过城市选择器切换查询。"
          : "定位未授权不影响按城市选择门店。";
      if (["unpaid", "unknown"].includes(params.get("paymentState"))) {
        message.hidden = false;
        message.textContent = "支付尚未确认，请返回订单完成支付后再预约。";
        action.textContent = "支付确认后可预约";
      }
    };

    storeCards.forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-store-map], [data-store-contact], .store-address")) return;
        selectedStore = card.dataset.storeId;
        render();
      });
      card.querySelector("[data-store-contact]").addEventListener("click", () => {
        contactStore.textContent = card.querySelector("[data-store-name]").textContent;
        contactDialog.showModal();
      });
    });
    contactDialog.querySelector("[data-close-contact]").addEventListener("click", () => contactDialog.close());
    contactDialog.addEventListener("click", (event) => {
      if (event.target === contactDialog) contactDialog.close();
    });
    city.addEventListener("click", () => {
      const isOpen = cityOptions.classList.toggle("open");
      city.setAttribute("aria-expanded", String(isOpen));
    });
    cityOptions.addEventListener("click", (event) => {
      const option = event.target.closest("[data-city]");
      if (!option) return;
      selectedCity = option.dataset.city;
      cityLabel.textContent = option.textContent;
      cityOptions.querySelectorAll("[data-city]").forEach((cityOption) => {
        cityOption.setAttribute("aria-pressed", String(cityOption === option));
      });
      cityOptions.classList.remove("open");
      city.setAttribute("aria-expanded", "false");
      selectedStore = "store-1";
      resourceState = "available";
      render();
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".city-control")) {
        cityOptions.classList.remove("open");
        city.setAttribute("aria-expanded", "false");
      }
    });
    city.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && cityOptions.classList.contains("open")) {
        cityOptions.classList.remove("open");
        city.setAttribute("aria-expanded", "false");
      }
    });
    resourceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        resourceState = button.dataset.resourceState;
        if (resourceState === "denied") showLocationDenied();
        render();
      });
    });
    action.addEventListener("click", () => {
      if (!action.disabled) {
        navigate("07-date-time-selection.html", { city: selectedCity, store: selectedStore, time: "" });
      }
    });
    if (resourceState === "denied") showLocationDenied();
    render();
    return;
  }

  if (page === "schedule") {
    const city = stores[params.get("city")] ? params.get("city") : "shanghai";
    const storeId = params.get("store") === "store-2" ? "store-2" : "store-1";
    const storeName = stores[city][storeId === "store-2" ? 1 : 0];
    const storeLabel = document.querySelector("#selected-store-name");
    const changeStore = document.querySelector(".change");
    const selectedDateLabel = document.querySelector("#selected-date-label");
    const selectedSlotLabel = document.querySelector("#selected-slot-label");
    const message = document.querySelector("#schedule-message");
    const action = document.querySelector("#primary-action");
    const feedback = document.querySelector("#state-description");
    const scheduleButtons = [...document.querySelectorAll("button[data-schedule-state]")];
    const storeQuery = new URLSearchParams(serviceContext);
    storeQuery.set("city", city);
    storeQuery.set("store", storeId);
    let state = "available";
    const dateRoot = document.querySelector("#booking-dates");
    const demoStart = new Date(2026, 9, 26, 12);
    const dates = Array.from({ length: 7 }, (_, index) => {
      const value = new Date(demoStart);
      value.setDate(value.getDate() + index);
      const date = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
      const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][value.getDay()];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "date";
      button.dataset.date = date;
      button.dataset.dateLabel = `${weekday} · ${value.getMonth() + 1} 月 ${value.getDate()} 日`;
      button.setAttribute("aria-label", button.dataset.dateLabel);
      button.innerHTML = `<small>${weekday}</small><strong>${value.getDate()}</strong><small>${value.getMonth() + 1} 月</small>`;
      dateRoot.append(button);
      return button;
    });
    let selectedDate = params.get("date") || dates[0].dataset.date;
    let selectedTime = params.get("reset") === "1" ? "" : params.get("time") || "";

    storeLabel.textContent = storeName;
    changeStore.href = `06-store-selection.html?${storeQuery}`;
    const selectedDateButton = dates.find((button) => button.dataset.date === selectedDate && !button.disabled);
    if (!selectedDateButton) {
      selectedDate = dates[0].dataset.date;
      selectedTime = "";
    }
    if (selectedTime && !slots.some((button) => button.dataset.time === selectedTime && !button.disabled)) selectedTime = "";
    slots.forEach((button) => {
      button.dataset.baseLabel = button.dataset.time;
      button.dataset.baseState = button.classList.contains("full")
        ? "full" : button.classList.contains("unavailable") ? "unavailable" : "available";
    });

    const render = () => {
      dates.forEach((button) => {
        const isSelected = button.dataset.date === selectedDate;
        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });
      const chosenDate = dates.find((button) => button.dataset.date === selectedDate);
      selectedDateLabel.textContent = `${chosenDate.dataset.dateLabel}　可选时段`;
      slots.forEach((button) => {
        const time = button.dataset.time;
        const baseState = button.dataset.baseState;
        const isSelected = time === selectedTime && state !== "empty";
        button.classList.remove("full", "unavailable", "selected");
        button.textContent = button.dataset.baseLabel;
        button.disabled = false;
        if (baseState === "full" || baseState === "unavailable") {
          button.classList.add(baseState);
          button.disabled = true;
          button.textContent = `${time} ${baseState === "full" ? "约满" : "不可约"}`;
        }
        if (state === "empty" && baseState === "available") {
          button.classList.add("unavailable");
          button.textContent = `${time} 不可约`;
          button.disabled = true;
        } else if (isSelected && baseState === "available") {
          button.classList.add("selected");
          button.textContent = `${time}　✓`;
        }
        button.setAttribute("aria-pressed", String(isSelected && baseState === "available"));
      });
      if (state === "empty") selectedTime = "";
      const displayedDate = selectedDate.slice(5).replace("-", " 月 ") + " 日";
      selectedSlotLabel.textContent = selectedTime
        ? `${displayedDate}　${selectedTime}`
        : `${displayedDate}　未选择`;
      message.hidden = state !== "empty";
      message.classList.toggle("error", state === "conflict");
      message.textContent = state === "empty"
        ? "当前日期暂无可约时段，请更换日期或门店。"
        : state === "conflict"
          ? "所选时段已被占用，请重新选择可约时段。"
          : "";
      const blocked = ["unpaid", "unknown"].includes(params.get("paymentState")) || params.get("booking") === "unknown" ||
        params.get("checkin") === "done" || ["active", "completed"].includes(params.get("serviceState"));
      action.disabled = state === "empty" || !selectedTime || blocked;
      action.textContent = "确认预约";
      if (blocked) {
        message.hidden = false;
        message.textContent = "订单结果尚未确认，请返回订单查看状态，暂勿重复提交。";
      }
      setPressed(scheduleButtons, state, "scheduleState");
      feedback.textContent = state === "available"
        ? "选择一个可约时段后可以继续。"
        : state === "empty" ? "当前无可约时段，主按钮已禁用；尝试更换日期或门店。"
          : state === "conflict" ? "提交将模拟时段冲突，并回到订单展示结果弹窗。"
            : "提交将模拟无响应，回到同一服务订单，以弹窗展示模拟查询结果。";
    };

    dates.forEach((button) => {
      button.addEventListener("click", () => {
        selectedDate = button.dataset.date;
        selectedTime = "";
        state = "available";
        render();
      });
    });
    slots.forEach((button) => {
      button.addEventListener("click", () => {
        if (!button.disabled && state !== "empty") {
          selectedTime = button.dataset.time;
          render();
        }
      });
    });
    scheduleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state = button.dataset.scheduleState;
        if (state === "empty") selectedTime = "";
        render();
      });
    });
    action.addEventListener("click", () => {
      if (action.disabled) return;
      const result = state === "timeout-success" ? "created"
        : state === "conflict" || state === "timeout-failure" ? "conflict"
          : state === "timeout-unknown" ? "unknown" : "created";
      navigate("12-service-order-detail.html", {
        city,
        store: storeId,
        date: selectedDate,
        time: selectedTime,
        booking: result === "created" ? "created" : result === "unknown" ? "unknown" : "none",
        ...(state !== "available" ? { bookingResult: result } : {}),
      });
    });
    render();
    return;
  }

})();
