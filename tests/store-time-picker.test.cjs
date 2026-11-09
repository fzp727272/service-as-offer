const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const base = path.join(__dirname, '..');
for (const htmlFile of fs.readdirSync(base).filter(file => file.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(base, htmlFile), 'utf8');
  const stylesheetLinks = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
  const pageStylesheet = stylesheetLinks.find(([link]) => new RegExp(htmlFile.replace(/\.html$/, '\\.css')).test(link));
  assert.ok(pageStylesheet, `${htmlFile} should link its page stylesheet`);
  assert.ok(fs.existsSync(path.join(base, htmlFile.replace(/\.html$/, '.css'))), `${htmlFile} should have a matching CSS file`);
  if (htmlFile !== '01-service-entry.html') {
    assert.ok(stylesheetLinks.some(([link]) => /(?:\.\.\/)?store-time-picker\.css/.test(link)), `${htmlFile} should link shared picker styles`);
  }
  assert.doesNotMatch(html, /<script[^>]+src="store-time-picker\.js/, `${htmlFile} should load the picker on demand`);
}
const pickerScriptSource = fs.readFileSync(path.join(base, 'store-time-picker.js'), 'utf8');
assert.doesNotMatch(pickerScriptSource, /createElement\(['"]link['"]\)/, 'picker script should not inject a stylesheet');
const pickerStylesheet = fs.readFileSync(path.join(base, 'store-time-picker.css'), 'utf8');
assert.match(pickerStylesheet, /\.stp-overlay\s*\{/);
const pickerStyleFiles = fs.readdirSync(base).filter(file => file.endsWith('.css'));
for (const cssFile of pickerStyleFiles.filter(file => file !== 'store-time-picker.css')) {
  assert.doesNotMatch(fs.readFileSync(path.join(base, cssFile), 'utf8'), /\.stp-overlay\s*\{/, `${cssFile} should not duplicate picker styles`);
}
assert.equal(fs.readFileSync(path.join(base, 'legacy/store-time-picker.css'), 'utf8').trim(), '@import "../store-time-picker.css";');
const context = vm.createContext({
  URL, window: {},
  document: {
  },
});
vm.runInContext(fs.readFileSync(path.join(base, 'booking-fixtures.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(base, 'store-time-picker.js'), 'utf8'), context);
const {normalize, isoDate} = context.window.StoreTimePicker;
const storeCities = vm.runInContext('storeCities', context);

assert.equal(isoDate('11月4日 周三'), '2026-11-04');
assert.equal(isoDate('2026-11-04'), '2026-11-04');
assert.equal(isoDate(''), '');
const initial = normalize({});
assert.equal(initial.city, 'shanghai');
assert.equal(initial.storeId, 'sh-yangpu');
assert.equal(initial.time, '');
const beijing = normalize({city: 'beijing', store: '迪卡侬北京双井店', date: '2026-11-04', time: '10:30'});
assert.equal(beijing.storeId, 'bj-shuangjing');
assert.equal(beijing.time, '10:30');
assert.equal(normalize({...beijing, time: '09:30'}).time, '');
assert.equal(normalize({...beijing, date: '2025-11-04'}).time, '');
assert.equal(normalize({city: 'invalid'}).city, 'shanghai');
assert.equal(normalize({city: 'hangzhou', storeId: 'hz-west'}).store, '迪卡侬杭州城西店');
const mockStores = storeCities.flatMap(city => city.stores);
assert.equal(storeCities[0].stores[0].hours, '周一到周四 10:00–22:00；周五到周六 09:00-21:00 周日 09:00-22:00');
assert.ok(new Set(mockStores.map(store => store.hours)).size > 1, 'store mock data should include varied business hours');
const pickerSource = fs.readFileSync(path.join(base, 'store-time-picker.js'), 'utf8');
assert.match(pickerSource, /\$\{store\.distance\.toFixed\(1\)\} km｜\$\{escape\(store\.address\)\}/);
assert.match(pickerSource, /营业时间 \$\{escape\(store\.hours\)\}/);
console.log('Shared store/time picker: state and store presentation assertions passed.');