(() => {
  // Picker styles are included in each page's single CSS file.
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const isoDate = label => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(label || '')) return label;
    const match = String(label).match(/(\d{1,2})月(\d{1,2})日/);
    return match ? `2026-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}` : '';
  };
  const sorted = city => [...city.stores].sort((a, b) => a.distance - b.distance);
  const normalize = value => {
    const city = storeCities.find(item => item.key === value?.city) || storeCities[0];
    const store = city.stores.find(item => item.id === value?.storeId || item.name === value?.store) || sorted(city)[0];
    const rows = bookingPreviewFixtures[city.key]?.[store?.id] || [];
    const matchedRow = rows.find(item => isoDate(item.date) === isoDate(value?.date));
    const row = matchedRow || rows[0];
    return {city: city.key, storeId: store?.id || '', store: store?.name || '', date: row ? isoDate(row.date) : '', time: matchedRow?.slots.includes(value?.time) ? value.time : ''};
  };
  let activeClose;
  let activeSetDemoState;
  /** Resolves a confirmed selection (ISO date), or null when dismissed. No order/payment side effects. */
  const open = ({root = document.querySelector('.artboard,.app'), value = {}, mode = 'checkout', trigger = document.activeElement, demoState: initialDemoState = 'available', initialView = 'booking'} = {}) => {
    activeClose?.(null);
    return new Promise(resolve => {
      let draft = normalize(value.location === 'denied' ? {...value, city: 'shanghai', store: '', storeId: '', date: '', time: ''} : value);
      let listDraft = initialView === 'list' ? {...draft} : undefined;
      let view = initialView === 'list' ? 'list' : 'booking';
      let toastTimer;
      let demoState = initialDemoState;
      let contact;
      let contactReturn;
      const overlay = document.createElement('div');
      overlay.className = 'stp-overlay';
      overlay.dataset.storeTimePicker = '';
      const previousOverflow = root.style.overflow;
      root.style.overflow = 'hidden';
      const previousInert = [...root.children].map(element => [element, element.inert]);
      previousInert.forEach(([element]) => { element.inert = true; });
      root.append(overlay);
      trigger?.setAttribute('aria-expanded', 'true');
      const finish = result => {
        clearTimeout(toastTimer);
        overlay.remove();
        root.style.overflow = previousOverflow;
        previousInert.forEach(([element, inert]) => { element.inert = inert; });
        document.removeEventListener('keydown', onKey, true);
        trigger?.setAttribute('aria-expanded', 'false');
        if (trigger?.isConnected && !trigger.closest('[inert]')) trigger.focus({preventScroll: true});
        activeClose = undefined;
        activeSetDemoState = undefined;
        resolve(result);
      };
      activeClose = finish;
      const cityFor = selection => storeCities.find(city => city.key === selection.city);
      const storeFor = selection => cityFor(selection).stores.find(store => store.id === selection.storeId);
      const actions = store => `<div class="stp-store-actions"><a href="https://map.qq.com/?q=${encodeURIComponent(`${store.name} ${store.address}`)}" target="_blank" rel="noopener noreferrer" aria-label="导航到${escape(store.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7 18-3-8-8-3L21 3Z"/></svg></a><button type="button" data-stp-contact="${escape(store.id)}" aria-label="联系${escape(store.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 3v-11a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg></button></div>`;
      const render = focusSelector => {
        clearTimeout(toastTimer);
        const city = cityFor(draft);
        const rows = bookingPreviewFixtures[draft.city]?.[draft.storeId] || [];
        const row = rows.find(item => isoDate(item.date) === draft.date);
        const availableSlots = demoState === 'empty' ? [] : row?.slots || [];
        const slotMarkup = (row?.slots || []).map(time => {
          const full = !availableSlots.includes(time);
          const selected = !full && time === draft.time;
          return `<button type="button" data-stp-time="${escape(time)}" aria-pressed="${selected}" ${full ? 'disabled title="该时段预约已满"' : ''}><span class="stp-slot-time">${escape(time)}${selected ? '' : ''}</span>${full ? '<small class="stp-slot-reason">预约已满</small>' : ''}</button>`;
        }).join('') || '<button type="button" disabled><span class="stp-slot-reason">预约已满</span></button>';
        const listCity = listDraft && cityFor(listDraft);
        const selection = view === 'list' ? listDraft : draft;
        const label = mode === 'order' ? '确认预约' : mode === 'preview' ? '确定' : '确认选择';
        overlay.innerHTML = `<section class="stp-sheet${view === 'list' ? ' stp-sheet--list' : ''}" role="dialog" aria-modal="true" aria-labelledby="stp-title"><div class="stp-handle" aria-hidden="true"></div><header class="stp-head">${view === 'list' ? '' : ''}<h2 id="stp-title">${view === 'list' ? '选择城市与门店' : '选择门店与时间'}</h2><button type="button" data-stp-close aria-label="关闭预约选择">×</button></header><div class="stp-content">${view === 'list' ? `
          <section class="stp-list"><label class="stp-city"><select data-stp-city aria-label="选择城市">${storeCities.map(item => `<option value="${item.key}" ${item.key === listCity.key ? 'selected' : ''}>${escape(item.name)}</option>`).join('')}</select></label><p class="stp-note">${escape(listCity.name)} · ${listCity.stores.length} 家门店</p><div class="stp-store-list">${sorted(listCity).map(store => `<article class="stp-store-card" data-stp-card="${store.id}" data-selected="${store.id === listDraft.storeId}"><button type="button" data-stp-store="${store.id}" aria-pressed="${store.id === listDraft.storeId}"><strong>${escape(store.name)}</strong><small>${store.distance.toFixed(1)} km｜${escape(store.address)}</small><small class="stp-store-hours">${escape(store.hours)}</small></button>${actions(store)}${store.id === listDraft.storeId ? '<span class="stp-check" aria-hidden="true"></span>' : ''}</article>`).join('')}</div></section>` : `
          <section class="stp-section"><header class="stp-section-head"><h3>可选门店</h3><button type="button" data-stp-more>查看更多 ›</button></header><div class="stp-store-rail" role="group" aria-label="${escape(city.name)}可选门店">${sorted(city).map(store => `<button type="button" class="stp-store-choice" data-stp-quick="${store.id}" aria-pressed="${store.id === draft.storeId}"><strong>${escape(store.name)}</strong><small>${store.distance.toFixed(1)} km｜${escape(store.address)}</small><small class="stp-store-hours">营业时间 ${escape(store.hours)}</small></button>`).join('')}</div></section>
          <section class="stp-section"><header class="stp-section-head"><h3>选择服务时间</h3></header><p class="stp-note">选择日期和到店时段，具体资源以门店确认为准。</p><div class="stp-dates" role="group" aria-label="门店可预约日期">${rows.map(item => {
            const [, month, day, week = ''] = item.date.match(/(\d{1,2})月(\d{1,2})日\s*(周.)?/) || [];
            return `<button type="button" data-stp-date="${isoDate(item.date)}" aria-pressed="${isoDate(item.date) === draft.date}" ${item.slots.length ? '' : 'disabled'}><span>${escape(week)}</span><strong>${month}/${day}</strong>${item.slots.length ? '' : '<span>已满</span>'}</button>`;
          }).join('') || '<p class="stp-note">该门店暂无可预约日期</p>'}</div><h4 class="stp-slot-title">${escape(row?.date || '')} · 可选时段</h4><div class="stp-slots" role="group" aria-label="可选时段">${slotMarkup}</div></section>`}</div><footer class="stp-footer"><p role="status">已选：${escape(selection.store)}${view === 'booking' && draft.time ? `；${escape(row?.date)} ${escape(draft.time)}` : ''}</p><button type="button" class="stp-confirm" data-stp-confirm ${view === 'booking' && !availableSlots.length ? 'disabled' : ''}>${view === 'list' ? '确定' : label}</button></footer><p class="stp-toast" role="alert" aria-atomic="true" hidden></p></section>`;
        const rail = overlay.querySelector('.stp-store-rail');
        const selected = rail?.querySelector('[aria-pressed="true"]');
        if (selected) rail.scrollLeft = selected.offsetLeft - rail.offsetLeft;
        const dates = overlay.querySelector('.stp-dates');
        const selectedDate = dates?.querySelector('[aria-pressed="true"]');
        if (selectedDate) dates.scrollLeft = Math.max(0, selectedDate.offsetLeft - dates.offsetLeft);
        overlay.querySelector(focusSelector || '[data-stp-close]')?.focus({preventScroll: true});
      };
      const showContact = store => {
        contactReturn = document.activeElement;
        contact = document.createElement('div');
        contact.className = 'stp-contact';
        contact.setAttribute('role', 'dialog');
        contact.setAttribute('aria-modal', 'true');
        contact.setAttribute('aria-label', '联系门店');
        contact.innerHTML = `<h2>联系门店</h2><p>${escape(store.name)}</p>${store.phone ? `<a href="tel:${escape(store.phone.replace(/[^0-9+]/g, ''))}">拨打电话 ${escape(store.phone)}</a>` : '<p>门店电话暂未接入，当前无法拨打。</p>'}<div class="stp-qr">企业微信二维码<br>待门店提供</div><p>示例信息，尚未接入真实联系渠道。</p><button type="button" data-stp-contact-close>关闭</button>`;
        overlay.querySelector('.stp-sheet').inert = true;
        overlay.append(contact);
        contact.querySelector('button').focus();
      };
      const closeContact = () => {
        contact.remove(); contact = undefined;
        overlay.querySelector('.stp-sheet').inert = false;
        contactReturn?.focus({preventScroll: true});
      };
      activeSetDemoState = state => {
        demoState = state;
        if (demoState === 'empty') draft.time = '';
        render();
      };
      overlay.addEventListener('change', event => {
        if (!event.target.matches('[data-stp-city]')) return;
        listDraft = normalize({city: event.target.value});
        render('[data-stp-city]');
      });
      overlay.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (event.target === overlay || button?.matches('[data-stp-close]')) { finish(null); return; }
        if (!button || button.disabled) return;
        if (button.matches('[data-stp-contact-close]')) { closeContact(); return; }
        if (button.matches('[data-stp-contact]')) { showContact(cityFor(listDraft).stores.find(store => store.id === button.dataset.stpContact)); return; }
        if (button.matches('[data-stp-more]')) { listDraft = {...draft}; view = 'list'; render('[data-stp-back]'); return; }
        if (button.matches('[data-stp-back]')) { view = 'booking'; render('[data-stp-more]'); return; }
        if (button.matches('[data-stp-store]')) { listDraft = normalize({city: listDraft.city, storeId: button.dataset.stpStore}); render(`[data-stp-store="${listDraft.storeId}"]`); return; }
        if (button.matches('[data-stp-quick]')) {
          if (draft.storeId !== button.dataset.stpQuick) draft = normalize({city: draft.city, storeId: button.dataset.stpQuick});
          render(`[data-stp-quick="${draft.storeId}"]`); return;
        }
        if (button.matches('[data-stp-date]')) { if (draft.date !== button.dataset.stpDate) { draft.date = button.dataset.stpDate; draft.time = ''; } render(`[data-stp-date="${draft.date}"]`); return; }
        if (button.matches('[data-stp-time]')) { draft.time = button.dataset.stpTime; render(`[data-stp-time="${draft.time}"]`); return; }
        if (button.matches('[data-stp-confirm]')) {
          if (view === 'list') {
            if (draft.city !== listDraft.city || draft.storeId !== listDraft.storeId) draft = normalize({city: listDraft.city, storeId: listDraft.storeId});
            if (initialView === 'list') { finish({...draft}); return; }
            view = 'booking'; render('[data-stp-more]'); return;
          }
          draft = normalize(draft);
          if (mode !== 'preview' && !draft.time) {
            const toast = overlay.querySelector('.stp-toast');
            clearTimeout(toastTimer);
            toast.textContent = '请选择完整的门店、日期与可约时段。';
            toast.hidden = false;
            toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
            return;
          }
          finish({...draft, ...(mode === 'order' ? {bookingResult: ['conflict', 'timeout-failure'].includes(demoState) ? 'conflict' : demoState === 'timeout-unknown' ? 'unknown' : 'created'} : {})});
        }
      });
      const onKey = event => {
        if (event.key === 'Escape') {
          event.preventDefault(); event.stopImmediatePropagation();
          if (contact) closeContact();
          else if (view === 'list' && initialView !== 'list') { view = 'booking'; render('[data-stp-more]'); }
          else finish(null);
        }
        if (event.key === 'Tab') {
          const scope = contact || overlay;
          const controls = [...scope.querySelectorAll('button:not(:disabled),a[href],select')].filter(element => element.getClientRects().length);
          const first = controls[0], last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      };
      document.addEventListener('keydown', onKey, true);
      render();
      if (value.location === 'denied') {
        contactReturn = document.activeElement;
        contact = document.createElement('div');
        contact.className = 'stp-contact';
        contact.setAttribute('role', 'alertdialog');
        contact.setAttribute('aria-modal', 'true');
        contact.setAttribute('aria-label', '已默认选择上海');
        contact.innerHTML = '<h2>已默认选择上海</h2><p>未获得定位权限，当前默认上海，并非定位结果。可在“查看更多”中选择城市。</p><button type="button" data-stp-contact-close>知道了</button>';
        overlay.querySelector('.stp-sheet').inert = true;
        overlay.append(contact);
        contact.querySelector('button').focus();
      }
    });
  };
  window.StoreTimePicker = Object.freeze({open, normalize, isoDate, setDemoState: state => activeSetDemoState?.(state)});
})();