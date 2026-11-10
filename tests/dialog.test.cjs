const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const component = fs.readFileSync(path.join(root, "components/dialog.js"), "utf8");
const remaining = fs.readFileSync(path.join(root, "remaining-pages.js"), "utf8");

function setup() {
  const openers = [];
  const closers = [];
  const dialogs = new Map();
  const document = {
    querySelectorAll(selector) {
      if (selector === "[data-open-dialog]") return openers;
      if (selector === "[data-close-dialog]") return closers;
      return [];
    },
    querySelector() { return null; },
    getElementById(id) { return dialogs.get(id); }
  };
  const window = { addEventListener() {} };
  const context = vm.createContext({ document, window, URL, location: { href: "http://localhost/" } });
  function button(props = {}) {
    const listeners = [];
    return Object.assign({
      dataset: {},
      addEventListener(type, callback) { if (type === "click") listeners.push(callback); },
      click() { listeners.forEach(callback => callback()); },
      closest() { return null; },
      listeners
    }, props);
  }
  return { openers, closers, dialogs, window, context, button };
}

const env = setup();
let opened = 0;
let closed = 0;
const dialog = { showModal() { opened++; }, close() { closed++; } };
env.dialogs.set("first", dialog);
const opener = env.button({ dataset: { openDialog: "first" } });
const missing = env.button({ dataset: { openDialog: "missing" } });
const closer = env.button({ closest(selector) { assert.equal(selector, "dialog"); return dialog; } });
const outside = env.button();
env.openers.push(opener, missing);
env.closers.push(closer, outside);
vm.runInContext(component, env.context);
vm.runInContext(remaining, env.context);
opener.click();
closer.click();
missing.click();
outside.click();
assert.equal(opened, 1, "component and page script must not double-bind openers");
assert.equal(closed, 1, "component and page script must not double-bind closers");

env.window.PrototypeDialog.init();
assert.equal(opener.listeners.length, 1, "reinitialization is idempotent");
assert.equal(closer.listeners.length, 1, "reinitialization does not duplicate close handlers");
const added = env.button({ dataset: { openDialog: "first" } });
env.openers.push(added);
env.window.PrototypeDialog.init();
added.click();
assert.equal(opened, 2, "reinitialization binds newly added controls");
opener.dataset.openDialog = "missing";
opener.click();
assert.equal(opened, 2, "target is resolved when clicked");

for (const [page, prefix] of [
  ["10-service-order-detail.html", ""],
  ["11-service-cancel-review.html", ""],
  ["legacy/12-service-order-detail.html", "../"],
  ["legacy/13-service-cancel-review.html", "../"]
]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const componentTag = `<script src="${prefix}components/dialog.js"></script>`;
  const remainingTag = `<script src="${prefix}remaining-pages.js"></script>`;
  assert.ok(html.includes(componentTag), `${page} loads the dialog module`);
  assert.ok(html.indexOf(componentTag) < html.indexOf(remainingTag), `${page} loads it before remaining-pages`);
}
console.log("Dialog component and page integration checks passed.");