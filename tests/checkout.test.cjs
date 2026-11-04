const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../05-order-checkout.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const script = scripts.find(match => match[1].includes('const renderPayment'))[1];

function setup(query = '') {
	const elements = new Map();
	function element(key) {
		if (!elements.has(key)) elements.set(key, {
			textContent: '', hidden: false, value: '', checked: false, href: '', attrs: {}, events: {},
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
	vm.runInNewContext(script, {document, location, URL, URLSearchParams, StoreTimePicker,
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

	later.payments[0].checked = true;
	later.payments[1].checked = false;
	later.payments[0].events.change();
	assert.equal(later.element('#footer-total').textContent, '¥123.45');
	assert.equal(later.element('#payment-action').textContent, '确认支付');
	console.log('Checkout: pricing, payment, validation and booking state assertions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
