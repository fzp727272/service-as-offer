const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'components/order-summary.js'), 'utf8');
const window = {};
vm.runInNewContext(source, {window});
const summary = window.OrderSummary;

const checkout = {innerHTML: ''};
summary.mount(checkout, 'checkout');
assert.equal(checkout.innerHTML, '<div class="service-thumb" aria-hidden="true"><img id="service-image" src="assets/figma/checkout-service.png" alt=""></div><div class="service-info"><div class="service-name" id="service-name">自行车标准保养套餐</div><div class="service-meta" id="service-meta">自行车 · 到店服务</div></div><strong class="price" id="item-price">¥199.90</strong>');

const result = {innerHTML: ''};
summary.mount(result, 'paymentResult');
assert.match(result.innerHTML, /^<div class="service-thumb" aria-hidden="true"><svg viewBox="0 0 48 48" aria-hidden="true">/);
assert.match(result.innerHTML, /<div class="service-info"><div class="service-name" id="result-service-name">自行车标准保养套餐<\/div><div class="service-meta" id="result-service-meta">到店服务 · 支付后选择门店和时间<\/div><\/div>$/);
assert.doesNotMatch(result.innerHTML, /id="item-price"/);
assert.throws(() => summary.mount({}, 'toString'), /Unknown order summary/);
assert.throws(() => summary.mount(null, 'checkout'), /missing root/);
assert.doesNotMatch(source, /\bfetch\s*\(|\bimport\s*\(/, 'component must not require network or module loading');

for (const [file, variant, script] of [
  ['05-order-checkout.html', 'checkout', '05-order-checkout.js'],
  ['05-payment-result.html', 'paymentResult', 'post-purchase-flow.js'],
]) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const component = html.indexOf('<script src="components/order-summary.js?');
  const mount = html.indexOf(`OrderSummary.mount(document.currentScript.previousElementSibling, "${variant}")`);
  assert.ok(component >= 0 && component < mount && mount < html.indexOf(script), `${file}: mount before its page script`);
  assert.match(html, /<div class="service"><\/div><script>OrderSummary\.mount/);
}
console.log('Order summary: variants, selectors, script ordering and local loading checks passed.');