(() => {
  function scrape() {
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

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "SCRAPE") {
      sendResponse({ ok: true, data: scrape() });
    }
  });
})();