(() => {
  const page = document.body.dataset.page;
  // Legacy selection URLs are handled by service-journey and never render their old flow.
  if (["store", "schedule"].includes(page)) return;
  const params = new URLSearchParams(window.location.search);
  const serviceContext = new URLSearchParams();
  ["category", "name", "description", "price", "context", "benefit", "equipment", "order", "sourceOrder", "entry", "city", "store", "date", "time", "booking", "serviceState", "checkin", "payment", "paymentState"].forEach((key) => {
    if (params.has(key)) serviceContext.set(key, params.get(key));
  });
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
    const bookingButtons = [...document.querySelectorAll("button[data-booking-state]")];
    const bookingOptions = document.querySelector("#booking-state-options");
    const bookingRow = document.querySelector("#booking-row");
    const bookingIntentRow = document.querySelector("#booking-intent-row");
    const bookingResultLabel = document.querySelector("#booking-result");
    const bookingIntentLabel = document.querySelector("#booking-intent");
    const bookingMode = params.get("bookingMode") === "now" ? "now" : "later";
    const hasBookingIntent = Boolean(params.get("city") && params.get("store") && params.get("date") && params.get("time"));
    let state = ["paid", "unpaid", "unknown"].includes(params.get("paymentState"))
      ? params.get("paymentState")
      : "paid";
    let bookingState = ["created", "conflict", "unknown"].includes(params.get("bookingResult"))
      ? params.get("bookingResult")
      : (params.get("booking") === "unknown" ? "unknown" : params.get("booking") === "created" ? "created" : "created");
    let queryResult = "unknown";
    let pollTimer;
    let pollCount = 0;
    const loadingToast = document.querySelector("#payment-loading-toast");
    const serviceName = document.querySelector("#result-service-name");
    const serviceMeta = document.querySelector("#result-service-meta");

    if (serviceName && params.get("name")) serviceName.textContent = params.get("name");
    if (serviceMeta) {
      serviceMeta.textContent = bookingMode === "now"
        ? "到店服务 · 结算内已选择预约意向"
        : "到店服务 · 支付后可继续预约门店和时间";
    }

    const formatIntent = () => {
      if (!hasBookingIntent) return "未选择预约意向";
      return `${params.get("city")} · ${params.get("store")} · ${params.get("date")} ${params.get("time")}`;
    };

    const bookingResultText = {
      created: "已预约，待到店",
      conflict: "支付成功，预约冲突",
      unknown: "支付成功，预约待确认",
    };

    const stopPolling = () => {
      window.clearInterval(pollTimer);
      pollTimer = undefined;
    };

    const render = () => {
      card.dataset.paymentState = state;
      setPressed(buttons, state, "paymentState");
      if (bookingOptions) bookingOptions.hidden = !(bookingMode === "now");
      if (bookingMode === "now" && bookingButtons.length) {
        setPressed(bookingButtons, bookingState, "bookingState");
      }
      mark.classList.toggle("warning", state === "unpaid");
      mark.classList.toggle("neutral", state === "unknown");
      mark.innerHTML = state === "paid" ? '<img src="assets/figma/selection-check.svg" alt="">' : state === "unpaid" ? "×" : "?";
      if (state === "paid") {
        title.textContent = bookingMode === "now" ? "支付成功" : "支付成功";
        subtitle.textContent = bookingMode === "now"
          ? (bookingState === "created"
            ? "支付与预约已确认，可按预约时间到店"
            : bookingState === "conflict"
              ? "支付已完成，所选时段未约成功，请重新选择"
              : "支付已完成，预约结果待确认，请勿重复提交")
          : "支付已完成，服务单待预约，可稍后安排门店和时间";
      } else {
        title.textContent = state === "unpaid" ? "支付失败" : "支付结果待确认";
        subtitle.textContent = state === "unpaid" ? "未完成支付，请重新发起支付" : "请稍候，暂不要重复支付或预约";
      }

      bookingRow.hidden = !(bookingMode === "now" && state === "paid");
      bookingIntentRow.hidden = bookingMode !== "now";
      if (bookingIntentLabel) bookingIntentLabel.textContent = formatIntent();
      if (bookingResultLabel && bookingMode === "now") bookingResultLabel.textContent = bookingResultText[bookingState];

      action.disabled = state === "unknown" || (bookingMode === "now" && state === "paid" && bookingState === "unknown");
      loadingToast.hidden = state !== "unknown";
      card.setAttribute("aria-busy", String(state === "unknown"));
      if (state === "paid") {
        action.textContent = bookingMode === "now"
          ? (bookingState === "created" ? "查看预约订单" : bookingState === "conflict" ? "去订单重新预约" : "预约确认中")
          : "去预约";
        feedback.textContent = bookingMode === "now"
          ? (bookingState === "created"
            ? "支付和预约已确认，可在订单中查看门店和到店时间。"
            : bookingState === "conflict"
              ? "所选时段未约成功，服务单保留，进入订单后重选门店与时间。"
              : "预约状态未查明，暂不允许重复预约提交。")
          : "服务单已支付且待预约，点击“去预约”继续选择门店与时段。";
      } else {
        action.textContent = state === "unpaid" ? "重新支付" : "结果确认中";
        feedback.textContent = state === "unpaid"
          ? "点击“重新支付”返回结算页面。"
          : "支付结果待确认时，暂不允许继续预约或重复支付。";
      }

      const amount = Number(params.get("price") || 199.9);
      document.querySelector("#payment-amount-label").textContent = state === "paid" ? "实付金额" : "订单金额";
      document.querySelector("#payment-amount").textContent = Number.isFinite(amount) && amount >= 0
        ? params.get("payment") === "points" ? `${Math.round(amount * 100).toLocaleString("zh-CN")} 燃值` : `¥${amount.toFixed(2)}`
        : "金额异常，请返回订单核对";
      document.querySelector("#payment-method").textContent = params.get("payment") === "points" ? "燃值抵扣" : "微信支付";
      document.querySelector("#payment-order").textContent = params.get("order") || "SO-2601024";
      const current = new URL(location.href);
      current.searchParams.set("paymentState", state);
      if (bookingMode === "now") current.searchParams.set("bookingResult", bookingState);
      current.searchParams.delete("demoState");
      history.replaceState(null, "", current);
      const orderLink = new URL("12-service-order-detail.html", location.href);
      orderLink.search = serviceContext.toString();
      orderLink.searchParams.set("paymentState", state);
      if (bookingMode === "now") {
        orderLink.searchParams.set("booking", bookingState === "created" ? "created" : bookingState === "unknown" ? "unknown" : "none");
        orderLink.searchParams.set("bookingResult", bookingState);
      }
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
    bookingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        bookingState = button.dataset.bookingState;
        render();
      });
    });
    action.addEventListener("click", () => {
      if (state === "unpaid") {
        navigate("05-order-checkout.html", { paymentState: "unpaid" });
      } else if (state === "paid") {
        if (bookingMode === "now") {
          if (bookingState === "created") {
            navigate("12-service-order-detail.html", {
              paymentState: "paid",
              booking: "created",
              bookingResult: "created",
            });
          } else if (bookingState === "conflict") {
            navigate("12-service-order-detail.html", {
              paymentState: "paid",
              booking: "none",
              bookingResult: "conflict",
            });
          }
        } else {
          const context = new URLSearchParams(location.search);
          context.set("paymentState", "paid");
          context.set("booking", "none");
          context.delete("bookingResult");
          window.openServiceOrderBooking(context, action);
        }
      }
    });
    render();
    return;
  }

})();
