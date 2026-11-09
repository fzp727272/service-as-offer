const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../service-journey.js'), 'utf8');

function setup(page, query = '', selection = null) {
  const listeners = {};
  const opened = [];
  const navigations = [];
  const elements = new Map();
  function element(key = '') {
    if (!elements.has(key)) {
      const node = {
        dataset: {}, hidden: false, href: '', textContent: '', innerHTML: '',
        classList: {add() {}, toggle() {}},
        setAttribute() {}, toggleAttribute() {}, removeAttribute() {},
        addEventListener() {}, append() {}, prepend() {}, after() {}, before() {}, replaceChildren() {},
        insertAdjacentElement() {}, closest() { return this; },
        querySelector(selector) { return element(`${key} ${selector}`); },
        querySelectorAll() { return []; },
        showModal() { this.open = true; }, close() { this.open = false; },
      };
      elements.set(key, node);
    }
    return elements.get(key);
  }
  let current = new URL(`http://localhost/prototype/${page}${query}`);
  const location = {
    get href() { return current.href; },
    get pathname() { return current.pathname; },
    get search() { return current.search; },
    get origin() { return current.origin; },
    assign(value) { navigations.push({method: 'assign', url: new URL(value)}); },
    replace(value) { navigations.push({method: 'replace', url: new URL(value)}); },
  };
  const document = {
    body: element('body'), head: element('head'), activeElement: element('active'),
    createElement(tag) { return element(`created-${tag}-${elements.size}`); },
    addEventListener(type, callback) { (listeners[type] ||= []).push(callback); },
    querySelector(selector) {
      if (selector.startsWith('aside.annotation')) return null;
      if (selector.startsWith('[data-booking-preview]')) return null;
      return element(selector);
    },
    querySelectorAll() { return []; },
  };
  const StoreTimePicker = {async open(options) { opened.push(options); return selection; }};
  const window = {StoreTimePicker, clearTimeout() {}, setTimeout() {}};
  const history = {replaceState(_state, _title, url) { current = new URL(url, current); }};
  vm.runInNewContext(source, {document, location, window, history, StoreTimePicker, URL, URLSearchParams, console, setTimeout() {}, navigator: {}});
  return {
    opened, navigations, location,
    click(href) {
      const link = {href: new URL(href, location.href).href};
      let prevented = false;
      let stopped = false;
      const event = {target: {closest() { return link; }}, preventDefault() { prevented = true; }, stopImmediatePropagation() { stopped = true; }};
      for (const listener of listeners.click || []) {
        listener(event);
        if (stopped) break;
      }
      return {prevented, stopped, link};
    },
  };
}

async function flush() { await new Promise(resolve => setImmediate(resolve)); }

async function main() {
  for (const page of ['index.html', '03-benefit-detail.html', '10-service-order-detail.html']) {
    const app = setup(page, '?name=原服务&order=SO-1&paymentState=paid');
    const click = app.click('10-service-order-detail.html?selectBooking=1&name=目标服务&context=benefit&sourceOrder=810263');
    await flush();
    assert.equal(click.prevented, true, `${page}: booking link must be intercepted`);
    assert.equal(app.opened.length, 1, `${page}: opens on the current page`);
    assert.equal(app.opened[0].value.name, '目标服务');
    assert.equal(app.opened[0].value.order, 'SO-1');
    assert.equal(app.opened[0].value.sourceOrder, '810263');
    assert.equal(app.opened[0].trigger, click.link);
  }
  for (const page of ['06-store-selection.html', '07-date-time-selection.html']) {
    const app = setup('index.html', '?order=SO-2');
    assert.equal(app.click(`${page}?context=repair`).prevented, true);
    await flush();
    assert.equal(app.opened[0].value.order, 'SO-2');
    assert.equal(app.opened[0].value.context, 'repair');
    const redirect = setup(page, '?order=SO-2&context=repair');
    assert.equal(redirect.navigations[0].url.pathname, '/prototype/10-service-order-detail.html');
    assert.equal(redirect.navigations[0].url.searchParams.get('selectBooking'), '1');
    assert.equal(redirect.navigations[0].url.searchParams.get('order'), 'SO-2');
  }
  for (const [page, expected] of [
    ['06-appointment-result.html', {booking: 'created'}],
    ['07-appointment-detail-cancel.html', {booking: 'created'}],
    ['08-reschedule-review.html', {notice: 'reschedule-unavailable', booking: 'created'}],
    ['11-service-cancel-review.html', {change: 'cancel', paymentState: 'unpaid'}],
  ]) {
    const app = setup(page, '?order=SO-2');
    const url = app.navigations[0].url;
    assert.equal(url.pathname, '/prototype/10-service-order-detail.html');
    assert.equal(url.searchParams.get('order'), 'SO-2');
    for (const [key, value] of Object.entries(expected)) assert.equal(url.searchParams.get(key), value);
  }
  const reschedule = setup('06-store-selection.html', '?reschedule=1&oldCity=beijing&oldStore=旧门店&oldDate=2026-11-04&oldTime=10:30');
  assert.equal(reschedule.navigations[0].url.searchParams.get('notice'), 'reschedule-unavailable');
  assert.equal(reschedule.navigations[0].url.searchParams.get('store'), '旧门店');
  assert.equal(reschedule.navigations[0].url.searchParams.has('selectBooking'), false);
  const blockedCases = ['paymentState=unpaid', 'paymentState=unknown', 'booking=created', 'booking=unknown', 'bookingResult=created', 'bookingResult=unknown', 'checkin=done', 'serviceState=active', 'reschedule=1', 'demoState=booked', 'demoState=cancelled'];
  for (const query of blockedCases) {
    const app = setup('index.html', `?${query}`);
    app.click('10-service-order-detail.html?selectBooking=1');
    await flush();
    assert.equal(app.opened.length, 0, `booking must be blocked for ${query}`);
  }
  const auto = setup('10-service-order-detail.html', '?selectBooking=1&context=benefit&order=SO-3&sourceOrder=810263');
  await flush();
  assert.equal(auto.opened.length, 1, 'direct order navigation opens picker');
  assert.equal(auto.opened[0].value.sourceOrder, '810263');
  assert.equal(new URL(auto.location.href).searchParams.has('selectBooking'), false);
  const blockedAuto = setup('10-service-order-detail.html', '?selectBooking=1&demoState=unpaid');
  await flush();
  assert.equal(blockedAuto.opened.length, 0, 'rendering must not override original eligibility');
  const repair = setup('04-repair-request.html', '', {city: 'shanghai', store: '测试门店', date: '2026-11-04', time: '10:30'});
  repair.click('10-service-order-detail.html?selectBooking=1&context=repair');
  await flush();
  assert.equal(repair.opened[0].mode, 'preview', 'repair only previews store availability');
  assert.equal(repair.navigations.length, 0, 'repair preview must not create an appointment');
  const submit = setup('index.html', '?order=SO-4&context=benefit', {city: 'shanghai', store: '测试门店', date: '2026-11-04', time: '10:30', bookingResult: 'created'});
  submit.click('10-service-order-detail.html?selectBooking=1&sourceOrder=810263');
  await flush();
  const destination = submit.navigations[0].url;
  assert.equal(destination.pathname, '/prototype/10-service-order-detail.html');
  assert.equal(destination.searchParams.get('order'), 'SO-4');
  assert.equal(destination.searchParams.get('sourceOrder'), '810263');
  assert.equal(destination.searchParams.get('booking'), 'created');
  assert.equal(destination.searchParams.has('selectBooking'), false);
  assert.equal(destination.searchParams.has('paymentState'), false);
  console.log('Service journey: booking routes, context, eligibility and automatic opening passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
