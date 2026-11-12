const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const index = read('index.html');
const fragments = ['content/status.html','content/status-details.html','content/press.html'];
assert.match(index, /^---\n---\n<!DOCTYPE html>/);
for (const file of fragments) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
  assert.ok(index.includes(`{% include_relative ${file} %}`));
}
assert.ok(read('content/status.html').includes('id="status"'));
assert.ok(read('content/press.html').includes('id="press"'));
assert.ok(read('content/press.html').includes('<ul class="link-list">'));
assert.ok(!index.includes('September 27, 2026 · Calendar advances automatically'));
assert.ok(index.includes("{{ site.time | date: '%B %-d, %Y' }}"));
assert.match(read('events.html'),/^---\n---\n<!DOCTYPE html>/);
assert.ok(!fs.existsSync(path.join(root, 'tools/event-editor.html')));
assert.ok(read('_config.yml').includes('timezone: America/Los_Angeles'));
assert.ok(index.includes('src="events.js"'));
const calendar = JSON.parse(read('data/events.json'));
assert.equal(calendar.timezone, 'America/Los_Angeles');
assert.ok(calendar.events.length>=4);

// v2 layout: every page uses the shared includes, and the homepage panels exist.
for (const file of ['content/election.html', 'content/documents.html']) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
  assert.ok(index.includes(`{% include_relative ${file} %}`), `index.html must include ${file}`);
}
for (const page of ['index.html', 'events.html', 'timeline.html', 'area.html']) {
  const html = read(page);
  assert.match(html, /^---\n---\n<!DOCTYPE html>/, `${page} needs empty front matter so Jekyll renders its includes`);
  for (const inc of ['head.html', 'header.html', 'footer.html']) {
    assert.ok(html.includes(`{% include ${inc}`), `${page} must use _includes/${inc}`);
    assert.ok(fs.existsSync(path.join(root, '_includes', inc)), `_includes/${inc} must exist`);
  }
}
for (const id of ['event-featured', 'event-upcoming', 'documents', 'share']) {
  assert.ok(index.includes(`id="${id}"`) || read('content/documents.html').includes(`id="${id}"`), `homepage must keep #${id}`);
}
// Documents linked from the homepage must exist in the repository.
for (const [, href] of read('content/documents.html').matchAll(/href="((?:docs|pdf)\/[^"]+)"/g)) {
  assert.ok(fs.existsSync(path.join(root, href)), `missing document ${href}`);
}
// The closest event keeps its pulsing red dot.
assert.ok(read('events.js').includes("el('span', 'live-dot')"));
assert.ok(read('styles.css').includes('@keyframes livePulse'));
console.log('Modular homepage structural tests passed.');

// Responsive layout must preserve reading/tab order (intro → event → detail).
assert.ok(index.indexOf('content/status.html') < index.indexOf('id="event-featured"'));
assert.ok(index.indexOf('id="event-featured"') < index.indexOf('content/status-details.html', index.indexOf('id="event-featured"')));
assert.match(read('styles.css'), /grid-template-areas: "intro" "next" "detail"/);
assert.ok(read('content/status-details.html').includes('<details class="resolution-details">'));
assert.match(read('styles.css'), /prefers-reduced-motion: reduce/);
assert.match(read('_includes/header.html'), /e.key === "Escape"/);
assert.ok(!index.includes('id="event-featured" aria-live'));
console.log('Accessibility and responsive reading order structural checks passed.');
