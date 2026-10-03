(() => {
  const siteUrl = "https://www.savemorongoschools.com";
  const copyStatus = document.getElementById("copy-status");
  const copyButton = document.getElementById("copy-link");
  const nativeShareButton = document.getElementById("native-share");

  function setStatus(message) {
    if (copyStatus) copyStatus.textContent = message;
  }

  async function copySiteLink() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setStatus("Link copied.");
    } catch (_) {
      setStatus("Could not copy link. Copy this address: " + siteUrl);
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      setStatus("Native sharing is not available on this device.");
      return;
    }

    try {
      await navigator.share({
        title: "Save Morongo Schools",
        text: "School closures are back on the table. Follow current MUSD meetings, documents and public hearings.",
        url: siteUrl
      });
    } catch (_) {
      // User cancellation is normal; no error message needed.
    }
  }

  copyButton?.addEventListener("click", copySiteLink);
  nativeShareButton?.addEventListener("click", nativeShare);
})();
