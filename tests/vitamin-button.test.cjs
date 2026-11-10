const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(base, 'components/vitamin-button.css'), 'utf8');
const demo = fs.readFileSync(path.join(base, 'components/vitamin-button-demo.html'), 'utf8');
for (const name of ['vitamin-button', 'vitamin-button--primary', 'vitamin-button--l', 'vitamin-button--squared']) {
  assert.match(css, new RegExp(`\\.${name}\\s*\\{`), `${name} must be defined`);
  assert.ok(demo.includes(name), `${name} must be used by the demo`);
}
assert.match(css, /font-size:\s*14px/);
assert.match(css, /font-weight:\s*500/);
assert.match(css, /line-height:\s*20px/);
assert.match(css, /min-height:\s*48px/);
assert.match(css, /padding:\s*0 24px/);
assert.match(css, /\.vitamin-button:focus-visible/);
assert.match(css, /\.vitamin-button:disabled/);
assert.match(demo, /<button[^>]*type="button"[^>]*disabled>/);
console.log('Basic Button: class contract and example assertions passed.');