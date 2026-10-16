const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const index = read('index.html');
const fragments = ['content/status.html','content/press.html'];
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
console.log('Modular homepage structural tests passed.');
