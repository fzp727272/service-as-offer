const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../05-order-checkout.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '../05-order-checkout.js'), 'utf8');
assert.ok(script.includes('const renderPayment'), '05-order-checkout.js should contain renderPayment');
assert.match(html, /05-order-checkout\.js/, 'checkout page should load the extracted script');

function setup(query = '') {
	const elements = new Map();
	function element(key) {
		if (!elements.has(key)) elements.set(key, {
			textContent: '', hidden: false, value: '', checked: false, href: '', attrs: {}, events: {},
			querySelector(selector) { return element(`${key} ${selector}`); },
			setAttribute(name, value) { this.attrs[name] = value; },
			addEventListener(name, callback) { this.events[name] = callback; },
		});
		return elements.get(key);
	}
	const modes = ['later', 'now'].map(value => Object.assign(element(`mode-${value}`), {value}));
	const payments = ['wechat', 'points'].map(value => Object.assign(element(`payment-${value}`), {value}));
	const document = {
		querySelector(selector) {
			if (selector === 'input[name="payment"]:checked') return payments.find(input => input.checked);
			const match = selector.match(/^input\[name="payment"\]\[value="(wechat|points)"\]$/);
			return match ? payments.find(input => input.value === match[1]) : element(selector);
		},
		querySelectorAll(selector) { return selector.includes('bookingMode') ? modes : payments; },
	};
	let pickerResult = null;
	const StoreTimePicker = {
		normalize(value) { return {city: 'shanghai', store: value.store || '', date: value.date || '', time: value.time || ''}; },
		async open() { return pickerResult; },
	};
	const location = {search: query, href: `http://localhost/prototype/05-order-checkout.html${query}`};
	const timer = {callback: null, cleared: false};
	const window = {StoreTimePicker};
	document.createElement = () => ({src: '', addEventListener(name, callback) { this[name] = callback; }});
	document.head = {append(scriptElement) {
		if (scriptElement.src.includes('store-time-picker.js')) window.StoreTimePicker = StoreTimePicker;
		scriptElement.onload();
	}};
	vm.runInNewContext(script, {document, window, location, URL, URLSearchParams,
		setTimeout(callback) { timer.callback = callback; return timer; },
		clearTimeout() { timer.cleared = true; },
	});
	return {element, modes, payments, timer, setPickerResult(value) { pickerResult = value; }};
}

async function main() {
	const later = setup('?bookingMode=later&payment=points&price=123.45');
	assert.equal(later.element('#service-fee').textContent, '¥123.45');
	assert.equal(later.element('#fee-total').textContent, '¥123.45');
	assert.equal(later.element('#footer-total').textContent, '12,345 燃值');
	assert.equal(later.element('#payment-action').textContent, '确认燃值抵扣');
	assert.equal(new URL(later.element('#payment-action').href).searchParams.get('payment'), 'points');
	assert.equal(later.element('#open-booking-sheet').hidden, true);

	const now = setup('?bookingMode=now');
	assert.equal(now.element('#booking-summary').hidden, true);
	assert.equal(now.element('#open-booking-sheet').hidden, false);
	assert.equal(now.element('#payment-action').attrs['aria-disabled'], 'false'); // Check if payment action is enabled
	let prevented = false;
	now.element('#payment-action').events.click({preventDefault() { prevented = true; }});
	assert.equal(prevented, true);
	assert.equal(now.element('#checkout-toast').hidden, false);
	assert.match(html, /请选择完整的门店、日期与可约时段。/);
	assert.equal(typeof now.timer.callback, 'function');
	now.timer.callback();
	assert.equal(now.element('#checkout-toast').hidden, true);
	now.setPickerResult({city:'shanghai', store:'测试门店', date:'2026-11-04', time:'10:30'});
	await now.element('#open-booking-sheet').events.click();
	assert.equal(now.element('#booking-selection').textContent, '测试门店 · 2026-11-04 10:30');
	const target = new URL(now.element('#payment-action').href);
	assert.equal(target.searchParams.get('bookingResult'), 'created');
	assert.equal(target.searchParams.get('time'), '10:30');
	assert.equal(now.element('#payment-action').attrs['aria-disabled'], 'false');

	const preselected = setup('?city=shanghai&store=测试门店&storeId=sh-yangpu&date=2026-11-05&time=14%3A00');
	assert.equal(preselected.modes.find(input => input.value === 'now').checked, true);
	assert.equal(preselected.element('#booking-selection').textContent, '测试门店 · 2026-11-05 14:00');
	assert.equal(new URL(preselected.element('#payment-action').href).searchParams.get('storeId'), 'sh-yangpu');
	const explicitLater = setup('?bookingMode=later&store=测试门店&date=2026-11-05&time=14%3A00');
	assert.equal(explicitLater.modes.find(input => input.value === 'later').checked, true);
	assert.equal(new URL(explicitLater.element('#payment-action').href).searchParams.has('time'), false);
	assert.ok(html.indexOf('class="booking-options"') < html.indexOf('class="service"'));
	assert.ok(html.indexOf('class="service"') < html.indexOf('class="section booking-section"'));
	assert.ok(html.indexOf('class="section booking-section"') < html.indexOf('class="related-products"'));
	assert.doesNotMatch(html, /class="booking-title"/);

	later.payments[0].checked = true;
	later.payments[1].checked = false;
	later.payments[0].events.change();
	assert.equal(later.element('#footer-total').textContent, '¥123.45');
	assert.equal(later.element('#payment-action').textContent, '确认支付');
	console.log('Checkout: pricing, payment, validation and booking state assertions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
