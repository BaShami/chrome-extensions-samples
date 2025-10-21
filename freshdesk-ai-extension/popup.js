(function() {
  const WEBHOOK = 'https://hook.eu1.make.com/wvdq398xwh5eg1zvosyusshlg52u22p5';

  const $ = (id) => document.getElementById(id);
  const ticketIdInput = $('ticketId');
  const questionText = $('question');
  const sendBtn = $('sendBtn');
  const statusEl = $('status');
  const responseWrap = $('response');
  const responseIdEl = $('responseId');
  const replyEl = $('reply');
  const copyReplyBtn = $('copyReply');

  function setStatus(msg) {
    statusEl.textContent = msg || '';
  }

  function setLoading(isLoading) {
    if (isLoading) {
      sendBtn.classList.add('loading');
      sendBtn.setAttribute('disabled', 'true');
    } else {
      sendBtn.classList.remove('loading');
      sendBtn.removeAttribute('disabled');
    }
  }

  function parseTicketIdFromUrl(url) {
    if (!url) return '';
    try {
      const match = url.match(/\/tickets\/(\d+)/);
      return match ? match[1] : '';
    } catch (_) {
      return '';
    }
  }

  function sanitizeQuestion(text) {
    if (!text) return '';
    return String(text).trim().slice(0, 440);
  }

  async function init() {
    // Prefill ticket ID from the active tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs && tabs.length ? tabs[0] : null;
      const url = activeTab ? activeTab.url : '';
      const id = parseTicketIdFromUrl(url);
      ticketIdInput.value = id || '';
      if (!id) {
        setStatus('Ticket ID not detected. Open a Freshdesk ticket tab.');
      }
    });

    // Restore last question (optional)
    chrome.storage.local.get(['fdai:lastQuestion'], (res) => {
      if (res && typeof res['fdai:lastQuestion'] === 'string') {
        questionText.value = res['fdai:lastQuestion'];
      }
    });

    sendBtn.addEventListener('click', onSend);
    copyReplyBtn.addEventListener('click', onCopyReply);
  }

  function buildPayload(ticketId, question) {
    return {
      // Use exact keys requested; keep as strings
      'ticket #': String(ticketId || ''),
      'question to AI': String(question || '')
    };
  }

  async function onSend() {
    const ticketId = (ticketIdInput.value || '').trim();
    const question = sanitizeQuestion(questionText.value);

    if (!ticketId) {
      setStatus('Please ensure Ticket ID is present.');
      return;
    }
    if (!question) {
      setStatus('Please enter a question.');
      return;
    }

    setLoading(true);
    setStatus('Sending to AI...');
    responseWrap.classList.add('hidden');
    responseIdEl.textContent = '—';
    replyEl.textContent = '—';

    chrome.storage.local.set({ 'fdai:lastQuestion': question });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s

      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(ticketId, question)),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Webhook error: ${res.status}`);
      }

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (_) {
        // Fallback when response is not JSON
        data = { reply: text };
      }

      const responseId = data['response ID '] || data['response ID'] || data.responseId || data.id || 'N/A';
      const reply = data.reply || data.response || data.message || data.text || '';

      responseIdEl.textContent = String(responseId);
      replyEl.textContent = String(reply || '(no reply)');
      responseWrap.classList.remove('hidden');

      setStatus('Response received.');
    } catch (err) {
      const msg = err && err.name === 'AbortError' ? 'Request timed out after 60s.' : (err && err.message) || 'Request failed.';
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onCopyReply() {
    try {
      await navigator.clipboard.writeText(replyEl.textContent || '');
      setStatus('Reply copied to clipboard.');
    } catch (_) {
      setStatus('Could not copy.');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
