# Morongo Parents — Universal next-event red dot (v1.2b)

This patch changes the featured card from “next Board meeting” to **the earliest upcoming event of any type**. It retains the original pulsing red dot, red badge, and timeline design from the existing site.

## Deploy

Replace these files in the **repository root** of `morongoparents/morongoparents.github.io`:

- `events.js` — makes the featured selection strictly chronological and dynamically labels it.
- `events.css` — includes the v1.2 styling that restores the original red dot, for convenience if the prior patch was not uploaded.

Commit to `main`. Cloudflare's connected Git build should redeploy the site. **No modifications to events.json, press, status, Jekyll, Wrangler or Cloudflare settings** are needed.

## Behavior

- The earliest upcoming event is featured regardless of category (Board meeting, hearing, community event, election, deadline, other).
- The label reflects its type: `NEXT BOARD MEETING`, `NEXT PUBLIC HEARING`, `NEXT COMMUNITY EVENT`, `NEXT ELECTION`, `UPCOMING DEADLINE`, or `NEXT EVENT`.
- The red dot is present for every featured event even before its start. The dot is decorative and does not imply the event is live.
- The chronological list below shows the **following** upcoming events; the featured event is not duplicated.
- The archival behavior is unchanged. Timed events with an `endTime` roll into the archive at that time; date-only events and events with a start time but no specified `endTime` remain current through their calendar day in America/Los_Angeles. For accurate same-day rollover, specify an end time in `data/events.json` when known.
- Confirmed/tentative/canceled statuses, links, text, press items and current status are unaffected.

## Tests

- Node calendar tests for chronological selection, category labels, cancellation, and event rollover.
- Browser rendering test with simulated dates for the October 16 radio forum, October 19 deadline, October 27 Board study session, and November 3 general election; desktop and mobile pulsing-dot alignment.

This is a source patch; it does not directly edit or deploy the live GitHub/Cloudflare site.
