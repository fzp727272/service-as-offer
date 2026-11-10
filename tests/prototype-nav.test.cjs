const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pages = [
  "02-service-detail.html",
  "03-benefit-detail.html",
  "04-repair-request.html",
  "04-repair-request2.html",
  "05-order-checkout.html",
  "05-payment-result.html",
  "10-service-order-detail.html",
  "11-service-cancel-review.html",
  "13-message-landing.html",
  "my-orders.html",
  "equipment-library.html"
];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.match(html, /src="components\/prototype-nav\.js\?/, `${page} should load the nav component`);
  if (page === "02-service-detail.html") {
    const runtime = fs.readFileSync(path.join(root, "02-service-detail.js"), "utf8");
    assert.match(runtime, /<prototype-nav\b/, "service detail should render the shared nav component");
    assert.doesNotMatch(runtime, /<header class="nav"/, "service detail should not keep local nav markup");
  } else {
    assert.match(html, /<prototype-nav\b/, `${page} should use the shared nav component`);
    assert.doesNotMatch(html, /<header class="(?:nav|page-nav)"/, `${page} should not keep local nav markup`);
  }
}

for (const excluded of ["01-service-entry.html", "index.html"]) {
  const html = fs.readFileSync(path.join(root, excluded), "utf8");
  assert.doesNotMatch(html, /<prototype-nav\b/, `${excluded} should remain outside the shared page nav`);
}

const component = fs.readFileSync(path.join(root, "components/prototype-nav.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "components/prototype-nav.css"), "utf8");
assert.match(component, /navbar-back\.svg/, "the shared component should own the back-arrow asset");
assert.match(component, /new URL\('prototype-nav\.css\?[^']+', componentBase\)/, "stylesheet should resolve from the component script");
assert.match(styles, /grid-template-columns: 44px minmax\(0, 1fr\) 87px/, "the shared component should use one nav grid with a 44px back target");
console.log("Shared prototype navigation markup checks passed.");
