const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(base, p), 'utf8');
const index = read('index.html');
const css = read('styles.css');
const header = read('_includes/header.html');
const status = read('content/status.html');
const details = read('content/status-details.html');
const calendar = read('events.html');

assert.match(header, /href="#main"/);
for (const file of ['index.html', 'events.html', 'timeline.html', 'area.html']) {
  assert.match(read(file), /<main\b[^>]*id="main"[^>]*tabindex="-1"/);
}
assert.ok(index.indexOf('content/status.html') < index.indexOf('id="event-featured"'));
assert.ok(index.indexOf('id="event-featured"') < index.indexOf('content/status-details.html', index.indexOf('id="event-featured"')));
assert.match(css, /grid-template-areas: "intro" "next" "detail"/);
assert.match(status, /<h1>/);
assert.match(details, /<details class="resolution-details">/);
assert.match(details, /<summary>/);
assert.match(header, /aria-expanded="false"/);
assert.match(header, /e.key === "Escape"/);
assert.match(css, /prefers-reduced-motion: reduce/);
assert.match(css, /forced-colors: active/);
assert.match(css, /focus-visible/);
assert.match(index, /<noscript>/);
assert.match(calendar, /<noscript>/);
assert.ok(!index.includes('id="event-featured" aria-live'));
assert.ok(read('events.js').includes('lastRenderKey'));
assert.ok(read('script.js').includes('toggle.setAttribute("aria-controls"'));

function luminance(hex) {
  const c = hex.replace('#', '').match(/../g).map(n => parseInt(n, 16) / 255)
    .map(n => n <= .04045 ? n / 12.92 : Math.pow((n + .055) / 1.055, 2.4));
  return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
}
function contrast(fg, bg) {
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
// WCAG normal-text AA (4.5:1); these are core surface tokens, not an exhaustive audit.
for (const [fg, bg] of [
  ['#1c1f23', '#f7f4ee'], ['#5a626c', '#f7f4ee'],
  ['#5a626c', '#fffefb'], ['#7a1b1b', '#f7f4ee'],
  ['#ffffff', '#7a1b1b'], ['#7a4b00', '#fffefb'],
]) assert.ok(contrast(fg, bg) >= 4.5, `${fg} on ${bg} must meet 4.5:1`);
console.log('Accessibility structural + key color contrast assertions passed.');
