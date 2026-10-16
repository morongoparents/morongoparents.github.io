/* Morongo Parents calendar v1.0 — no dependencies, backend, or build step.
   Source of truth: data/events.json. All times are Morongo Basin (America/Los_Angeles).
*/
(function (root) {
  'use strict';
  const ZONE = 'America/Los_Angeles';
  const CATEGORIES = {
    board: 'Board meeting', hearing: 'Hearing', community: 'Community',
    election: 'Election', deadline: 'Deadline', other: 'Other'
  };
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  const statusSet = new Set(['confirmed', 'tentative', 'canceled']);

  function validDate(value) {
    if (typeof value !== 'string' || !datePattern.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number);
    const x = new Date(Date.UTC(y, m - 1, d));
    return x.getUTCFullYear() === y && x.getUTCMonth() === m - 1 && x.getUTCDate() === d;
  }
  function validTime(value) { return value === '' || value == null || (typeof value === 'string' && timePattern.test(value)); }
  function normalize(data) {
    if (!data || data.timezone !== ZONE || !Array.isArray(data.events)) throw new Error('Invalid calendar file');
    const ids = new Set();
    return data.events.map((event, i) => {
      if (!event || !/^[a-z0-9][a-z0-9-]*$/.test(event.id || '') || ids.has(event.id)) throw new Error('Invalid or duplicate event ID at entry ' + (i + 1));
      if (!validDate(event.date) || !validTime(event.startTime) || !validTime(event.endTime)) throw new Error('Invalid date or time for ' + event.id);
      if (event.endTime && !event.startTime) throw new Error('End time requires a start time: ' + event.id);
      if (event.endTime && event.endTime <= event.startTime) throw new Error('End time must be later than start: ' + event.id);
      if (typeof event.title !== 'string' || !event.title.trim()) throw new Error('Missing title: ' + event.id);
      if (!statusSet.has(event.status) || !(event.category in CATEGORIES)) throw new Error('Invalid category or status: ' + event.id);
      ids.add(event.id);
      return {
        id: event.id, date: event.date, startTime: event.startTime || '', endTime: event.endTime || '',
        title: event.title.trim(), category: event.category, status: event.status,
        description: String(event.description || ''), location: String(event.location || ''),
        url: String(event.url || ''), sourceUrl: String(event.sourceUrl || '')
      };
    });
  }
  function localClock(now) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(now instanceof Date ? now : new Date(now));
    const d = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return { date: `${d.year}-${d.month}-${d.day}`, time: `${d.hour}:${d.minute}` };
  }
  function state(event, clock) {
    if (event.status === 'canceled') return 'canceled';
    if (event.date < clock.date) return 'past';
    if (event.date > clock.date) return 'upcoming';
    if (event.endTime && event.endTime <= clock.time) return 'past';
    if (event.startTime && event.endTime && event.startTime <= clock.time) return 'live';
    return 'today';
  }
  function partition(events, clock) {
    const future = [], archive = [];
    for (const event of events) {
      const current = state(event, clock);
      (current === 'past' || current === 'canceled' ? archive : future).push(event);
    }
    const order = (a, b) => (a.date + 'T' + a.startTime).localeCompare(b.date + 'T' + b.startTime);
    future.sort(order);
    archive.sort((a, b) => -order(a, b));
    return { future, archive };
  }
  function printableDate(value, full) {
    const date = new Date(value + 'T12:00:00Z');
    return new Intl.DateTimeFormat('en-US', full ? {
      timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    } : { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(date);
  }
  function printableTime(value) {
    if (!value) return '';
    const [h, m] = value.split(':').map(Number);
    return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  function timeLabel(event) {
    return event.startTime
      ? printableTime(event.startTime) + (event.endTime ? ' – ' + printableTime(event.endTime) : '')
      : 'Time not specified';
  }
  function safeHref(value) {
    if (!value) return '';
    try {
      const u = new URL(value, document.baseURI);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
      if (u.protocol === 'http:' && u.origin !== location.origin) return '';
      return u.href;
    } catch (_) { return ''; }
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function link(parent, label, href) {
    const safe = safeHref(href);
    if (!safe) return;
    const a = el('a', '', label);
    a.href = safe;
    if (new URL(safe).origin !== location.origin) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    parent.append(a);
  }
  function pills(parent, event, clock) {
    if (event.status === 'tentative') parent.append(el('span', 'event-pill tentative', 'Tentative'));
    if (event.status === 'canceled') parent.append(el('span', 'event-pill canceled', 'Canceled'));
    if (state(event, clock) === 'live') parent.append(el('span', 'event-pill live', 'Happening now'));
  }
  function references(parent, event) {
    const p = el('div', 'event-links');
    link(p, 'Event details →', event.url);
    link(p, 'Official source →', event.sourceUrl);
    if (p.childNodes.length) parent.append(p);
  }
  function eventCard(event, clock) {
    const card = el('div', 'next-date');
    const labelWrap = el('div', 'date-label-wrap');
    labelWrap.append(el('span', 'date-label', state(event, clock) === 'live' ? 'Happening now' : event.date === clock.date ? 'Today' : 'Next event'));
    if (state(event, clock) === 'live') labelWrap.append(el('span', 'live-dot'));
    card.append(labelWrap);
    card.append(el('div', 'event-category', CATEGORIES[event.category]));
    const heading = el('h3', '', printableDate(event.date, true) + (event.startTime ? ' · ' + printableTime(event.startTime) : ''));
    card.append(heading);
    const title = el('p');
    title.append(el('strong', '', event.title)); pills(title, event, clock);
    card.append(title);
    if (event.location) card.append(el('p', 'event-meta', event.location));
    if (event.description) card.append(el('p', 'event-description', event.description));
    if (event.startTime && event.endTime) card.append(el('p', 'event-meta', 'Time: ' + timeLabel(event)));
    references(card, event);
    return card;
  }
  function timelineItem(event, clock, archive) {
    const item = el('div', 'timeline-item' + (archive ? ' event-archive-item' : ''));
    const date = el('div', 'timeline-date', printableDate(event.date, false));
    item.append(date);
    const body = el('div', 'timeline-text');
    const name = el('span', 'event-item-title', event.title);
    body.append(name);
    body.append(el('div', 'event-category', CATEGORIES[event.category]));
    pills(body, event, clock);
    body.append(el('div', 'event-meta', (event.startTime ? timeLabel(event) + (event.location ? ' · ' : '') : '') + event.location));
    if (event.description) body.append(el('p', 'event-description', event.description));
    references(body, event);
    item.append(body);
    return item;
  }
  function empty(target, message) { target.replaceChildren(el('p', 'event-empty', message)); }
  let allEvents = null;
  function render() {
    if (!allEvents) return;
    const clock = localClock(new Date());
    const category = document.getElementById('event-category-filter')?.value || 'all';
    const events = category === 'all' ? allEvents : allEvents.filter(e => e.category === category);
    const { future, archive } = partition(events, clock);
    const featured = document.getElementById('event-featured');
    const short = document.getElementById('event-upcoming');
    if (featured) {
      if (future.length) featured.replaceChildren(eventCard(future[0], clock));
      else empty(featured, 'No upcoming events are currently listed. Check back for updates.');
    }
    if (short) {
      short.replaceChildren(...future.slice(1, 5).map(e => timelineItem(e, clock, false)));
      if (future.length <= 1) empty(short, 'No additional events scheduled.');
    }
    const long = document.getElementById('event-calendar-upcoming');
    if (long) {
      if (future.length) long.replaceChildren(...future.map(e => timelineItem(e, clock, false)));
      else empty(long, 'No upcoming events currently listed.');
    }
    const past = document.getElementById('event-calendar-archive');
    if (past) {
      if (archive.length) past.replaceChildren(...archive.map(e => timelineItem(e, clock, true)));
      else empty(past, 'No past or canceled events in this category.');
    }
  }
  async function refresh() {
    const response = await fetch('data/events.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    allEvents = normalize(await response.json());
    render();
  }
  function reportError() {
    for (const id of ['event-featured', 'event-calendar-upcoming']) {
      const target = document.getElementById(id);
      if (target && !allEvents) empty(target, 'Calendar could not be loaded. Please try refreshing.');
    }
  }
  function init() {
    const filter = document.getElementById('event-category-filter');
    filter?.addEventListener('change', render);
    refresh().catch(err => { console.error('Calendar failed:', err); reportError(); });
    setInterval(render, 60 * 1000);
    setInterval(() => refresh().catch(err => console.warn('Calendar refresh failed:', err)), 5 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  }
  // Export testable, pure time logic without exposing editing or publishing permissions.
  const api = { validDate, normalize, localClock, state, partition, printableTime, init };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window !== 'undefined' ? window : this);
