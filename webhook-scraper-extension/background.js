const STORAGE_KEYS = {
  webhookUrl: "webhookUrl",
  lastPayload: "lastPayload"
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scrape-send",
    title: "Scrape page to webhook",
    contexts: ["page", "selection", "image", "link"]
  });
});

async function getWebhookUrl() {
  const { webhookUrl } = await chrome.storage.sync.get([STORAGE_KEYS.webhookUrl]);
  return webhookUrl || "";
}

async function postToWebhook(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response;
}

async function notify(title, message) {
  try {
    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title,
      message
    });
  } catch (_) {
    // notifications may be restricted in some contexts
  }
}

async function triggerScrape(tab) {
  if (!tab || !tab.id) return;
  const webhookUrl = await getWebhookUrl();
  if (!webhookUrl) {
    await notify("Webhook Scraper", "Set a webhook URL in the extension options.");
    chrome.runtime.openOptionsPage();
    return;
  }

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: () => {
        const canonical = document.querySelector('link[rel="canonical"]')?.href || location.href;
        const title = document.title;
        const description = document.querySelector('meta[name="description"]')?.content || "";
        const selection = window.getSelection()?.toString() || "";
        const images = Array.from(document.images).slice(0, 20).map(img => ({ src: img.src, alt: img.alt }));
        const og = {
          title: document.querySelector('meta[property="og:title"]')?.content || "",
          description: document.querySelector('meta[property="og:description"]')?.content || "",
          image: document.querySelector('meta[property="og:image"]')?.content || "",
          url: document.querySelector('meta[property="og:url"]')?.content || ""
        };
        const schemaOrg = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .map(s => {
            try { return JSON.parse(s.textContent || ""); } catch { return null; }
          })
          .filter(Boolean);

        return {
          scrapedAt: new Date().toISOString(),
          page: {
            url: location.href,
            canonical,
            referrer: document.referrer,
            title,
            description
          },
          selection,
          images,
          openGraph: og,
          schemaOrg
        };
      }
    });

    const payload = result?.result || {};
    await chrome.storage.local.set({ [STORAGE_KEYS.lastPayload]: payload });

    const response = await postToWebhook(webhookUrl, payload);
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);

    await notify("Webhook Scraper", "Scrape sent successfully.");
  } catch (error) {
    await notify("Webhook Scraper", `Failed to send: ${error?.message || error}`);
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  await triggerScrape(tab);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "scrape-send") {
    await triggerScrape(tab);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SCRAPE_AND_SEND") {
    (async () => {
      try {
        let targetTab = sender?.tab;
        if (!targetTab) {
          if (message?.tabId) {
            try {
              targetTab = await chrome.tabs.get(message.tabId);
            } catch (_) {
              // fall back to active tab if specific tab is not accessible
            }
          }
          if (!targetTab) {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            targetTab = activeTab;
          }
        }
        await triggerScrape(targetTab);
      } catch (_) {
        // ignore errors in background trigger
      }
    })();
    sendResponse({ ok: true });
  }
});