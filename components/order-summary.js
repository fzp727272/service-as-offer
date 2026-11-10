/* Mount before page scripts query or update the light-DOM descendants. */
(() => {
  const variants = {
    checkout: {
      thumb: '<img id="service-image" src="assets/figma/checkout-service.png" alt="">',
      nameId: "service-name", metaId: "service-meta", meta: "自行车 · 到店服务",
      price: '<strong class="price" id="item-price">¥199.90</strong>'
    },
    paymentResult: {
      thumb: '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#5e5e5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="32" r="8"/><circle cx="37" cy="32" r="8"/><path d="m11 32 9-15 8 15H11l13-9 13 9M20 17h8m-8 0-2-4m12 4 2-5h5"/></g></svg>',
      nameId: "result-service-name", metaId: "result-service-meta", meta: "到店服务 · 支付后选择门店和时间",
      price: ""
    }
  };

  function mount(root, variant) {
    if (!root || !Object.prototype.hasOwnProperty.call(variants, variant)) throw new TypeError("Unknown order summary variant or missing root");
    const config = variants[variant];
    root.innerHTML = `<div class="service-thumb" aria-hidden="true">${config.thumb}</div><div class="service-info"><div class="service-name" id="${config.nameId}">自行车标准保养套餐</div><div class="service-meta" id="${config.metaId}">${config.meta}</div></div>${config.price}`;
  }

  window.OrderSummary = { mount };
})();