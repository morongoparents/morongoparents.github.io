/* Homepage helpers: share buttons and the "Show all articles" toggle.
   Everything here is progressive: without JavaScript the page still works
   (all articles show, and the plain share links still work). */
(() => {
  const siteUrl = "https://www.savemorongoschools.com";
  const copyStatus = document.getElementById("copy-status");
  const copyButton = document.getElementById("copy-link");
  const nativeShareButton = document.getElementById("native-share");

  function setStatus(message) {
    if (copyStatus) copyStatus.textContent = message;
  }

  function shareText() {
    const headline = document.querySelector("#status h1");
    return headline ? headline.textContent.trim() : "Save Morongo Schools";
  }

  async function copySiteLink() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setStatus("Link copied.");
    } catch (_) {
      setStatus("Could not copy automatically. The address is " + siteUrl);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Save Morongo Schools", text: shareText(), url: siteUrl });
    } catch (_) {
      // The person closed the share sheet; nothing to report.
    }
  }

  // After Election Day, don't keep an outdated voting banner on the homepage.
  // Uses the Morongo Basin timezone, not the reader's device timezone.
  const election = document.getElementById("election");
  if (election?.dataset.expiresAfter) {
    // Standardize to YYYY-MM-DD even on engines with different en-CA formats.
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    const byType = Object.fromEntries(parts.map(p => [p.type, p.value]));
    const localDay = `${byType.year}-${byType.month}-${byType.day}`;
    if (localDay > election.dataset.expiresAfter) election.hidden = true;
  }

  // Only offer the system share sheet where the device supports it.
  if (nativeShareButton && navigator.share) {
    nativeShareButton.hidden = false;
    nativeShareButton.addEventListener("click", nativeShare);
  }
  copyButton?.addEventListener("click", copySiteLink);

  // Press: show the newest 6 articles, with a button for the rest.
  const VISIBLE = 6;
  const press = document.getElementById("press");
  const items = press ? press.querySelectorAll(".link-list > li") : [];
  if (press && items.length > VISIBLE) {
    press.classList.add("is-collapsed");
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "btn press-toggle";
    toggle.setAttribute("aria-expanded", "false");
    const pressList = press.querySelector(".link-list");
    if (!pressList.id) pressList.id = "press-articles";
    toggle.setAttribute("aria-controls", pressList.id);
    toggle.textContent = "Show all " + items.length + " articles";
    toggle.addEventListener("click", () => {
      const collapsed = press.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.textContent = collapsed ? "Show all " + items.length + " articles" : "Show fewer";
      if (collapsed) press.scrollIntoView({ block: "start" });
    });
    press.querySelector(".link-list").after(toggle);
  }
})();
