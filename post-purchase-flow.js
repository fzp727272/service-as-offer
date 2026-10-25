(() => {
  const page = document.body.dataset.page;
  const params = new URLSearchParams(window.location.search);
  const serviceContext = new URLSearchParams();
  ["category", "name", "description", "price", "context", "benefit", "equipment", "order", "city", "store", "date", "time", "booking", "serviceState", "checkin", "payment", "paymentState", "reschedule", "oldDate", "oldTime", "oldCity", "oldStore"].forEach((key) => {
    if (params.has(key)) serviceContext.set(key, params.get(key));
  });
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
  const sampleWeekdays = {
    "2026-10-23": "周五",
    "2026-10-24": "周六",
    "2026-10-25": "周日",
    "2026-10-26": "周一",
  };
  const dates = [...document.querySelectorAll("[data-date]")];
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
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        state = button.dataset.paymentState;
        render();
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
    let resourceState = "available";
    let selectedStore = ["store-1", "store-2"].includes(params.get("store")) ? params.get("store") : "store-1";

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
          ? "定位未授权，请手动选择服务城市。"
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
        render();
      });
    });
    action.addEventListener("click", () => {
      if (!action.disabled) {
        navigate("07-date-time-selection.html", { city: selectedCity, store: selectedStore, time: "" });
      }
    });
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
    const rescheduling = params.get("reschedule") === "1";
    const storeQuery = new URLSearchParams(serviceContext);
    storeQuery.set("city", city);
    storeQuery.set("store", storeId);
    let state = "available";
    let selectedDate = params.get("date") || "2026-10-24";
    let selectedTime = params.get("reset") === "1" || rescheduling ? "" : params.get("time") || "";

    storeLabel.textContent = storeName;
    if (rescheduling) {
      document.querySelector("#schedule-heading").textContent = "选择新的预约时间";
      document.querySelector("#schedule-description").textContent = "可约窗口以门店实时服务资源为准。";
      document.querySelector("#reschedule-guidance").hidden = false;
      const oldDate = params.get("oldDate") || params.get("date") || "2026-10-24";
      const oldTime = params.get("oldTime") || params.get("time") || "11:00";
      document.querySelector("#reschedule-guidance").textContent =
        `当前预约：${oldDate} ${oldTime}。新预约确认成功后，才会替换原预约。`;
    }
    changeStore.href = `06-store-selection.html?${storeQuery}`;
    const selectedDateButton = dates.find((button) => button.dataset.date === selectedDate && !button.disabled);
    if (!selectedDateButton) selectedDate = "2026-10-24";
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
      action.textContent = rescheduling ? "确认更换预约时间" : "确认预约";
      if (blocked) {
        message.hidden = false;
        message.textContent = "订单结果尚未确认，请返回订单查看状态，暂勿重复提交。";
      }
      setPressed(scheduleButtons, state, "scheduleState");
      feedback.textContent = state === "available"
        ? "选择一个可约时段后可以继续。"
        : state === "empty" ? "当前无可约时段，主按钮已禁用；尝试更换日期或门店。"
          : "提交动作将模拟服务端发现所选时段冲突，并进入冲突结果页。";
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
      navigate(state === "conflict" ? "08-appointment-result.html" : "12-service-order-detail.html", {
        city,
        store: storeId,
        date: selectedDate,
        time: selectedTime,
        result: state === "conflict" ? "conflict" : "created",
        booking: state === "conflict" && !rescheduling ? "none" : "created",
        ...(rescheduling ? { reschedule: state === "conflict" ? "1" : "done" } : {}),
      });
    });
    render();
    return;
  }

  if (page === "result") {
    const city = stores[params.get("city")] ? params.get("city") : "shanghai";
    const storeIndex = params.get("store") === "store-2" ? 1 : 0;
    const storeName = stores[city][storeIndex];
    const date = sampleWeekdays[params.get("date")] ? params.get("date") : "2026-10-24";
    const time = /^\d{2}:\d{2}$/.test(params.get("time") || "") ? params.get("time") : "11:00";
    const result = ["created", "conflict", "unknown"].includes(params.get("result"))
      ? params.get("result") : "created";
    const resultCard = document.querySelector(".success");
    const mark = document.querySelector("#result-mark");
    const title = document.querySelector("#result-title");
    const description = document.querySelector("#result-description");
    const appointmentPill = document.querySelector("#appointment-pill");
    const appointmentStore = document.querySelector("#appointment-store");
    const appointmentTime = document.querySelector("#appointment-time");
    const appointmentStatus = document.querySelector("#appointment-status");
    const transactionStatus = document.querySelector("#transaction-status");
    const serviceProgress = document.querySelector("#service-progress");
    const resultMessage = document.querySelector("#result-message");
    const action = document.querySelector("#primary-action");
    const feedback = document.querySelector("#state-description");
    const resultButtons = [...document.querySelectorAll("button[data-result-state]")];
    let state = result;

    const formatDate = (value) => {
      const [year, month, day] = value.split("-");
      const weekday = sampleWeekdays[value];
      return `${year} 年 ${Number(month)} 月 ${Number(day)} 日${weekday ? `（${weekday}）` : ""} ${time}`;
    };

    const render = () => {
      resultCard.dataset.resultState = state;
      mark.classList.toggle("warning", state === "conflict");
      mark.classList.toggle("error", state === "unknown");
      mark.textContent = state === "created" ? "✓" : state === "conflict" ? "!" : "?";
      title.textContent = state === "created"
        ? "预约已创建" : state === "conflict" ? "时段已被占用" : "预约结果待确认";
      description.textContent = state === "created"
        ? "门店与时间已确认，服务状态为待到店。"
        : state === "conflict" ? "该时段未能创建预约，请重新选择时间。"
          : "暂无法确认预约是否创建，请勿重复提交。";
      appointmentPill.textContent = state === "created"
        ? "预约 · 已创建" : state === "conflict" ? "预约 · 未创建" : "预约 · 待确认";
      appointmentPill.classList.toggle("green", state === "created");
      appointmentStore.textContent = storeName;
      appointmentTime.textContent = formatDate(date);
      appointmentStatus.textContent = state === "created"
        ? "已创建 · 待到店" : state === "conflict" ? "未创建 · 需重新选择" : "状态待确认";
      transactionStatus.textContent = params.get("context") === "benefit" ? "权益兑换" : "已支付";
      document.querySelector("#result-payment-pill").textContent = params.get("context") === "benefit" ? "权益兑换" : "交易 · 已支付";
      serviceProgress.textContent = state === "created"
        ? "待到店 · 暂无服务进度" : state === "conflict" ? "待预约 · 暂无服务进度" : "结果待确认 · 暂无服务进度";
      document.querySelector("#attempt-title").textContent = state === "created" ? "预约信息" : "本次提交信息";
      document.querySelector(".service-name").textContent = params.get("name") || "自行车标准保养套餐";
      if (params.get("reschedule") === "1" && state !== "created") {
        serviceProgress.textContent = state === "conflict" ? "原预约保留 · 待到店" : "改约结果待确认";
      }
      const current = new URL(location.href);
      current.searchParams.set("result", state);
      current.searchParams.set("booking", state === "unknown" ? "unknown" : state === "created" || params.get("reschedule") === "1" ? "created" : "none");
      current.searchParams.delete("demoState");
      history.replaceState(null, "", current);
      const orderLink = new URL("12-service-order-detail.html", location.href);
      orderLink.search = current.search;
      document.querySelector("#result-order-link").href = orderLink.href;
      resultMessage.classList.toggle("success", state === "created");
      resultMessage.classList.toggle("warning", state === "conflict");
      resultMessage.classList.toggle("error", state === "unknown");
      resultMessage.innerHTML = state === "created"
        ? "<strong>到店前请核对预约信息</strong>请携带预约装备到店。"
        : state === "conflict"
          ? params.get("reschedule") === "1"
            ? "<strong>新时段未预约成功</strong>当前预约仍然有效，请重新选择时间。"
            : "<strong>请重新选择时间</strong>本次预约未创建，已支付金额不变。"
          : "<strong>暂勿重复提交</strong>预约结果暂时无法确认，请稍后查看服务单。";
      document.querySelector(".service-hint").textContent = params.get("context") === "benefit" ? "权益兑换，无需再次支付" : "本次预约不重复收取服务费用";
      action.disabled = state === "unknown";
      action.textContent = state === "created"
        ? "查看订单详情" : state === "conflict" ? "重新选择时间" : "结果确认前暂不可继续";
      setPressed(resultButtons, state, "resultState");
      feedback.textContent = state === "created"
        ? "预约成功后直接进入订单，查看到店时间、门店与二维码。"
        : state === "conflict" ? params.get("reschedule") === "1"
          ? "新时段创建失败不会影响原预约；可返回重新选择。"
          : "可以返回时间选择页修改日期或时段。"
          : "结果待确认时请勿重复提交，稍后查看服务单。";
    };

    resultButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state = button.dataset.resultState;
        if (state === "created") {
          navigate("12-service-order-detail.html", { city, store: params.get("store") || "store-1", date, time, booking: "created", ...(params.get("reschedule") === "1" ? { reschedule: "done" } : {}) });
          return;
        }
        render();
      });
    });
    action.addEventListener("click", () => {
      if (state === "created") {
        navigate("12-service-order-detail.html", { city, store: params.get("store") || "store-1", date, time, booking: "created" });
      } else if (state === "conflict") {
        navigate("07-date-time-selection.html", {
          city,
          store: params.get("store") || "store-1",
          date,
          reset: "1",
          booking: params.get("reschedule") === "1" ? "created" : "none",
        });
      }
    });
    render();
  }
})();
