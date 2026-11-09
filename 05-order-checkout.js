const params = new URLSearchParams(location.search);
    const categories = {bike:'自行车', badminton:'羽毛球 / 网球', ski:'滑雪'};
    const category = categories[params.get('category')] || categories.bike;
    const name = params.get('name') || '自行车标准保养套餐';
    const amount = Number(params.get('price'));
    const price = Number.isFinite(amount) && amount > 0 ? amount : 199.9;
    const formattedPrice = `¥${price.toFixed(2)}`;
    const points = Math.round(price * 100).toLocaleString('zh-CN');
    document.querySelector('#service-name').textContent = name;
    document.querySelector('#service-meta').textContent = `${category} · ${params.get('description') || '到店服务'}`;
    document.querySelector('#item-price').textContent = formattedPrice;
    document.querySelector('#service-fee').textContent = formattedPrice;
    document.querySelector('#fee-total').textContent = formattedPrice;
    const serviceImages = {bike:'checkout-service.png', badminton:'order-badminton.png', ski:'device-wedze.png'};
    document.querySelector('#service-image').src = `assets/figma/${serviceImages[params.get('category')] || serviceImages.bike}`;
    document.querySelector('#checkout-equipment').textContent = params.get('equipment') || `可用于${category}，到店时确认具体型号`;
    document.querySelector('#wechat-amount').textContent = `支付 ${formattedPrice}`;
    document.querySelector('#points-amount').textContent = `需扣除 ${points} 燃值`;
    const trigger = document.querySelector('#open-booking-sheet');
    const toast = document.querySelector('#checkout-toast');
    let toastTimer;
    const showBookingToast = () => {
      clearTimeout(toastTimer);
      toast.hidden = false;
      toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
    };
    const modeInputs = [...document.querySelectorAll('input[name="bookingMode"]')];
    let mode = params.get('bookingMode') === 'now' || (params.get('bookingMode') !== 'later' && params.get('store') && params.get('date') && params.get('time')) ? 'now' : 'later';
    let selection = {city: params.get('city') || 'shanghai', storeId: params.get('storeId') || '', store: params.get('store') || '', date: params.get('date') || '', time: params.get('time') || ''};
    if (!params.get('store') || !params.get('date')) selection.time = '';
    const renderPayment = () => {
      const usePoints = document.querySelector('input[name="payment"]:checked').value === 'points';
      mode = modeInputs.find(input => input.checked)?.value || 'later';
      trigger.hidden = mode !== 'now';
      toast.hidden = true;
      clearTimeout(toastTimer);
      document.querySelector('#booking-summary').hidden = mode === 'now';
      document.querySelector('#booking-summary').querySelector('strong').textContent = mode === 'later' ? '支付成功后可在服务单中预约到店。' : '选择门店和到店时间';
      document.querySelector('#booking-selection').textContent = selection.time ? `${selection.store} · ${selection.date} ${selection.time}` : '请选择门店、日期和时段';
      document.querySelector('#booking-action-label').textContent = selection.time ? '修改' : '选择';
      document.querySelector('#footer-label').textContent = usePoints ? '需扣燃值' : '应付金额';
      document.querySelector('#footer-total').textContent = usePoints ? `${points} 燃值` : formattedPrice;
      const action = document.querySelector('#payment-action');
      action.textContent = mode === 'now' ? (usePoints ? '确认抵扣并提交预约' : '确认支付并提交预约') : (usePoints ? '确认燃值抵扣' : '确认支付');
      const next = new URL('05-payment-result.html', location.href);
      next.search = params.toString();
      Object.entries({name, price:price.toFixed(2), order:params.get('order') || 'SO-2601024', payment:usePoints ? 'points' : 'wechat', paymentState:'paid', bookingMode:mode}).forEach(([key,value]) => next.searchParams.set(key,value));
      if (mode === 'now' && selection.time) {
        Object.entries(selection).forEach(([key,value]) => next.searchParams.set(key,value));
        next.searchParams.set('booking','created');
        next.searchParams.set('bookingResult','created');
      } else {
        ['city','store','storeId','date','time','bookingResult'].forEach(key => next.searchParams.delete(key));
        next.searchParams.set('booking','none');
      }
      ['demoState','serviceState','checkin','result','reschedule','oldDate','oldTime','oldCity','oldStore','selectBooking'].forEach(key => next.searchParams.delete(key));
      action.href = next.href;
      action.setAttribute('aria-disabled','false');
    };
    let pickerReady;
    const loadScript = name => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(`${name}?v=20261104-one-css`, location.href).href;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    const ensureStoreTimePicker = () => pickerReady ||= window.StoreTimePicker
      ? Promise.resolve(window.StoreTimePicker)
      : loadScript('booking-fixtures.js').then(() => loadScript('store-time-picker.js')).then(() => window.StoreTimePicker);
    const chooseBooking = async () => {
      const picker = await ensureStoreTimePicker();
      selection = picker.normalize(selection);
      const result = await picker.open({root:document.querySelector('.artboard'),value:selection,mode:'checkout',trigger});
      if (result) { selection = result; renderPayment(); }
    };
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.addEventListener('click',chooseBooking);
    modeInputs.forEach(input => {
      input.checked = input.value === mode;
      input.addEventListener('change',() => {
        renderPayment();
        if (input.checked && input.value === 'now') chooseBooking();
      });
    });
    document.querySelector(`input[name="payment"][value="${params.get('payment') === 'points' ? 'points' : 'wechat'}"]`).checked = true;
    document.querySelectorAll('input[name="payment"]').forEach(input => input.addEventListener('change',renderPayment));
    document.querySelector('#payment-action').addEventListener('click',event => {
      if (mode !== 'now' || selection.time) return;
      event.preventDefault();
      showBookingToast();
    });
    renderPayment();
