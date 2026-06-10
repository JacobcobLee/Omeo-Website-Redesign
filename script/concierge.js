/* ============================================================
   OMEO Alpine Concierge — AI chat widget
   Powered by Claude Haiku via /api/chat proxy (server.js)
   ============================================================ */

(function () {
  'use strict';

  const HISTORY = []; // [{role:'user'|'assistant', content:'...'}]
  let isOpen    = false;
  let isBusy    = false;

  /* ── Build widget DOM ──────────────────────────────────── */
  function build() {
    const root = document.createElement('div');
    root.id        = 'concierge';
    root.innerHTML = `
      <!-- Floating trigger button -->
      <button class="cnc-trigger" id="cncTrigger" aria-label="Chat with OMEO Alpine Concierge" aria-expanded="false">
        <span class="cnc-trigger-icon" aria-hidden="true">⛷️</span>
        <span class="cnc-trigger-label">Ask a local</span>
      </button>

      <!-- Chat panel -->
      <div class="cnc-panel" id="cncPanel" role="dialog" aria-label="OMEO Alpine Concierge" aria-hidden="true">

        <header class="cnc-header">
          <span class="cnc-header-emoji" aria-hidden="true">🏔️</span>
          <div>
            <div class="cnc-header-name">Alpine Concierge</div>
            <div class="cnc-header-sub">OMEO gear expert · AI-powered</div>
          </div>
          <button class="cnc-close" id="cncClose" aria-label="Close chat">✕</button>
        </header>

        <div class="cnc-messages" id="cncMessages" role="log" aria-live="polite">
          <div class="cnc-msg cnc-msg--bot">
            <p>Yo! 🤙 Need help picking gear or got questions about the mountain? I got you. What's the mission?</p>
          </div>
        </div>

        <form class="cnc-input-row" id="cncForm" autocomplete="off">
          <input
            class="cnc-input"
            id="cncInput"
            type="text"
            placeholder="Ask about gear, sizing, conditions…"
            aria-label="Your message"
            maxlength="400">
          <button class="cnc-send" type="submit" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>

      </div>
    `;
    document.body.appendChild(root);

    /* Wire events */
    document.getElementById('cncTrigger').addEventListener('click', toggle);
    document.getElementById('cncClose').addEventListener('click',   close);
    document.getElementById('cncForm').addEventListener('submit',   handleSubmit);

    /* Close on Escape */
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
  }

  /* ── Open / close ──────────────────────────────────────── */
  function toggle() { isOpen ? close() : open(); }

  function open() {
    isOpen = true;
    const panel   = document.getElementById('cncPanel');
    const trigger = document.getElementById('cncTrigger');
    panel.classList.add('cnc-panel--open');
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('cnc-trigger--open');
    setTimeout(() => document.getElementById('cncInput')?.focus(), 280);
  }

  function close() {
    isOpen = false;
    const panel   = document.getElementById('cncPanel');
    const trigger = document.getElementById('cncTrigger');
    panel.classList.remove('cnc-panel--open');
    panel.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('cnc-trigger--open');
  }

  /* ── Messages ──────────────────────────────────────────── */
  function appendMsg(text, role) {
    const feed = document.getElementById('cncMessages');
    const div  = document.createElement('div');
    div.className = `cnc-msg cnc-msg--${role === 'user' ? 'user' : 'bot'}`;
    div.innerHTML = `<p>${safe(text)}</p>`;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
  }

  function showTyping() {
    const feed = document.getElementById('cncMessages');
    const div  = document.createElement('div');
    div.id        = 'cncTyping';
    div.className = 'cnc-msg cnc-msg--bot cnc-msg--typing';
    div.setAttribute('aria-label', 'Concierge is typing');
    div.innerHTML = '<span></span><span></span><span></span>';
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('cncTyping')?.remove();
  }

  function safe(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  /* ── Send a message ────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (isBusy) return;

    const input = document.getElementById('cncInput');
    const text  = input.value.trim();
    if (!text) return;

    input.value = '';
    input.disabled = true;

    HISTORY.push({ role: 'user', content: text });
    appendMsg(text, 'user');

    isBusy = true;
    showTyping();

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: HISTORY }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data  = await res.json();
      const reply = data.content?.[0]?.text
        ?? "Bruh, something gnarly happened on my end. Drop me another message?";

      HISTORY.push({ role: 'assistant', content: reply });
      hideTyping();
      appendMsg(reply, 'assistant');

    } catch {
      hideTyping();
      appendMsg(
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? "Connection dropped 💀 Make sure server.js is running (node server.js)"
          : "The concierge is offline in static mode. Run the site locally to chat! 🏔️",
        'assistant'
      );
    } finally {
      isBusy         = false;
      input.disabled = false;
      input.focus();
    }
  }

  /* ── Boot ──────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

}());
