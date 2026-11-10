const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const base = path.join(__dirname, '..');
const component = fs.readFileSync(path.join(base, 'components/store-actions.js'), 'utf8');
const context = {window: {}};
vm.runInNewContext(component, context);
const {render} = context.window.StoreActions;
const store = {name: '门店 & "A"', address: '路 1号 & 北', id: 'id"<&', phone: '123&456'};
const detail = render(store);
const picker = render(store, {variant: 'picker'});
const url = `https://map.qq.com/?q=${encodeURIComponent(`${store.name} ${store.address}`)}`;
for (const markup of [detail, picker]) {
  assert.ok(markup.includes(`href="${url}"`));
  assert.match(markup, /target="_blank" rel="noopener noreferrer"/);
  assert.match(markup, /aria-label="导航到门店 &amp; &quot;A&quot;"/);
  assert.match(markup, /aria-label="联系门店 &amp; &quot;A&quot;"/);
  assert.match(markup, /data-(?:store-wechat|stp-contact)="id&quot;&lt;&amp;"/);
  assert.match(markup, /m21 3-7 18-3-8-8-3L21 3Z/);
  assert.match(markup, /M7 10h8M7 14h5/);
}
assert.match(detail, /role="group" aria-label="门店 &amp; &quot;A&quot;门店操作"/);
assert.match(detail, /data-store-name="门店 &amp; &quot;A&quot;" data-store-phone="123&amp;456"/);
assert.match(detail, /aria-haspopup="dialog"/);
assert.match(picker, /class="stp-store-actions"/);
assert.doesNotMatch(picker, /aria-haspopup|focusable=/);
assert.throws(() => render(store, {variant: 'other'}), /Unknown store action variant/);
assert.ok(Object.isFrozen(context.window.StoreActions));

const detailHtml = fs.readFileSync(path.join(base, '02-service-detail.html'), 'utf8');
assert.ok(detailHtml.indexOf('components/store-actions.js') < detailHtml.indexOf('02-service-detail.js'));
assert.match(fs.readFileSync(path.join(base, '02-service-detail.js'), 'utf8'), /window\.StoreActions\.render\(store\)/);
assert.match(fs.readFileSync(path.join(base, 'components/store-time-picker.js'), 'utf8'), /window\.StoreActions\.render\(store, \{variant: 'picker'\}\)/);

async function checkLazyLoading() {
  const scripts = [];
  const trigger = {name: 'original trigger'};
  const document = {
    currentScript: {src: 'file:///prototype/components/store-time-picker.js?v=old'},
    baseURI: 'file:///elsewhere/page.html',
    activeElement: trigger,
    createElement() { return {}; },
    head: {append(script) { scripts.push(script); }},
  };
  const pickerContext = {window: {}, document, URL};
  vm.runInNewContext(fs.readFileSync(path.join(base, 'components/store-time-picker.js'), 'utf8'), pickerContext);
  const first = pickerContext.window.StoreTimePicker.open();
  assert.equal(scripts[0].src, 'file:///prototype/components/store-actions.js?v=20261109');
  scripts[0].onerror();
  await assert.rejects(first, /Could not load store actions/);
  const retry = pickerContext.window.StoreTimePicker.open();
  assert.equal(scripts.length, 2, 'failed loads should be retried');
  scripts[1].onload();
  await assert.rejects(retry, /did not initialize/);
  for (const src of ['https://example.test/prototype/components/store-time-picker.js?v=old', 'file:///other/components/store-time-picker.js?v=old']) {
    const pending = [];
    const host = {currentScript: {src}, baseURI: 'https://unrelated.test/page', activeElement: trigger, createElement() { return {}; }, head: {append(script) { pending.push(script); }}};
    const other = {window: {}, document: host, URL};
    vm.runInNewContext(fs.readFileSync(path.join(base, 'components/store-time-picker.js'), 'utf8'), other);
    const load = other.window.StoreTimePicker.open();
    assert.equal(pending[0].src, new URL('store-actions.js?v=20261109', src).href);
    pending[0].onerror();
    await assert.rejects(load, /Could not load store actions/);
  }
}
checkLazyLoading().then(() => {
  console.log('Store actions: shared markup, escaping, consumer hooks and lazy-loading failures passed.');
}).catch(error => { console.error(error); process.exitCode = 1; });