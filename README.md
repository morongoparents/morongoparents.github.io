# Morongo Parents — Modular GitHub Pages (v1.1)

The homepage is still the same static design. There is **no public editor, CMS, or database**.

## Edit just the part you want

| Content | Edit this file | Result |
|---|---|---|
| Homepage status | `content/status.html` | Replaces the whole status card on the homepage |
| Press / published materials | `content/press.html` | Replaces the whole press section; add newest `<li>` first |
| Calendar (homepage + archive) | `data/events.json` | Future events sort themselves; past/canceled events move into the calendar archive |

Edit files in your GitHub repository, commit, and GitHub Pages deploys the updated website. No manual update to `index.html` is required for ordinary editorial changes. All these content files are *public*, so do not put passwords or private drafts in them.

### Adding an event

In `data/events.json`, add another object to the `events` array (insert a comma between objects). Example:

```json
{
  "id": "community-forum-example",
  "date": "2026-12-01",
  "startTime": "18:00",
  "endTime": "20:00",
  "title": "Community forum (example)",
  "category": "community",
  "location": "Location to be announced",
  "description": "Example only — replace this before publishing.",
  "status": "tentative",
  "sourceUrl": "",
  "url": ""
}
```

Use unique lowercase-dashed IDs, `YYYY-MM-DD`, and 24-hour times in **America/Los_Angeles**. Leave start/end empty (`""`) for an all-day/unknown-time event. Use `tentative` for unconfirmed information and `canceled` when necessary. Categories: `board`, `hearing`, `community`, `election`, `deadline`, `other`. A timed event with an `endTime` archives at its end; without an end it archives after the calendar day. No server job is needed; the browser re-evaluates as time passes.

**No editor is published.** The earlier `tools/event-editor.html` was intentionally removed.

### How the separate HTML works

`index.html` has two Jekyll `include_relative` directives:

```
{% include_relative content/status.html %}
{% include_relative content/press.html %}
```

GitHub Pages merges these fragments **at build time**. This is a deliberate choice instead of JS fetching: the main page renders immediately, is indexed normally, and doesn't depend on extra network requests.

The footer uses the same Jekyll build timestamp (`site.time`) and updates after each successful site build/deployment. It is labeled **site deployment**, not a claim that the news content itself was editorially reviewed that day. `_config.yml` sets the local timezone.

### Deployment assumption (important)

This package assumes **GitHub Pages → Deploy from a branch** (the default Jekyll build). The uploaded ZIP had no `.nojekyll` file or custom Pages workflow. GitHub Pages automatically applies Jekyll to HTML files with the two-line `---` front matter. Do not add `.nojekyll` or switch to raw static Actions uploads unless you also add a Jekyll build step. Otherwise you will see `{% include_relative ... %}` in the published source, with the status and press missing. See GitHub repository Settings → Pages → Build and deployment.

**Local preview:** Double-clicking `index.html` will not process Jekyll directives, and local `file://` will not load calendar JSON. Preview using Jekyll (or deploy to a Pages test branch) rather than expecting file-opening to work. To validate the event data: `node tests/events.test.js`.

### Existing non-calendar content

Documents, timelines, QR images, district finder, styles, and sharing links were left unchanged. Some links in the supplied archive point to PDFs not included in that archive; this modularization does not attempt to repair or validate those references.

### Test status

- Source-level extraction/structural validation and event unit tests run with Node.
- Browser smoke checks can run against a local *simulated* Jekyll build; the actual GitHub Pages deploy configuration cannot be validated until published.
