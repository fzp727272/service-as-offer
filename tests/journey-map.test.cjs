const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const base = path.join(__dirname, '..');
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(base, 'journey-map.js'), 'utf8'), {
  window, document: {querySelector() { return null; }},
});
const {groups, entryPaths, repairVersions} = window.ServiceJourneyMap;
assert.deepEqual(Array.from(groups, group => group.title), ['发现与购买', '预约服务', '到店与完成', '权益、维修与其他入口']);
assert.equal(entryPaths.length, 5);
const nodes = groups.flatMap(group => group.pages);
assert.equal(new Set(nodes.map(node => node.id)).size, nodes.length);
for (const node of nodes) {
  assert.ok(node.title && node.description && node.href && node.page, node.id);
  assert.ok(fs.existsSync(path.join(base, node.page)), `${node.id} page exists`);
  assert.equal(node.href.split('?')[0], node.page, `${node.id} destination matches page`);
}
assert.equal(repairVersions.ai.href, '04-repair-request2.html');
assert.equal(repairVersions.form.href, '04-repair-request.html');
for (const file of ['index.html', ...new Set(nodes.map(node => node.page))]) {
  const html = fs.readFileSync(path.join(base, file), 'utf8');
  const map = html.indexOf('src="journey-map.js?');
  const journey = html.indexOf('src="service-journey.js?');
  assert.ok(map >= 0 && journey > map, `${file} loads map before journey logic`);
  assert.match(html, /href="journey-panel\.css\?/);
}
console.log('Journey map: groups, destinations and page integration passed.');