async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function refreshPreview() {
  const { lastPayload } = await chrome.storage.local.get(["lastPayload"]);
  const preview = document.getElementById("preview");
  preview.textContent = lastPayload ? JSON.stringify(lastPayload, null, 2) : "No payload yet";
}

document.getElementById("scrapeBtn").addEventListener("click", async () => {
  const tab = await getCurrentTab();
  await chrome.runtime.sendMessage({ type: "SCRAPE_AND_SEND", tabId: tab?.id });
  setTimeout(refreshPreview, 800);
});

document.getElementById("openOptions").addEventListener("click", async (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

refreshPreview();