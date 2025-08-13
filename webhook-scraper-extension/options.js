const STORAGE_KEYS = { webhookUrl: "webhookUrl", lastPayload: "lastPayload" };

async function loadSettings() {
  const { webhookUrl } = await chrome.storage.sync.get([STORAGE_KEYS.webhookUrl]);
  document.getElementById("webhookUrl").value = webhookUrl || "";
  const { lastPayload } = await chrome.storage.local.get([STORAGE_KEYS.lastPayload]);
  document.getElementById("lastPayload").textContent = lastPayload ? JSON.stringify(lastPayload, null, 2) : "No payload yet";
}

async function saveSettings() {
  const webhookUrl = document.getElementById("webhookUrl").value.trim();
  await chrome.storage.sync.set({ [STORAGE_KEYS.webhookUrl]: webhookUrl });
  alert("Saved");
}

async function testSend() {
  const webhookUrl = document.getElementById("webhookUrl").value.trim();
  if (!webhookUrl) return alert("Enter a webhook URL first");
  const sample = { hello: "world", timestamp: new Date().toISOString() };
  try {
    const res = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sample) });
    alert(`Webhook status: ${res.status}`);
  } catch (e) {
    alert(`Failed: ${e.message}`);
  }
}

document.getElementById("saveBtn").addEventListener("click", saveSettings);

document.getElementById("testBtn").addEventListener("click", testSend);

loadSettings();