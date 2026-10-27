/* ============================================================
   2600 Design — Project Enquiries
   ============================================================ */

(function () {
  const OWNER_EMAIL = 'hello@2600design.com.au';

  const FAQS = [
    {
      q: 'What does a website project cost?',
      a: 'Launch Website packages start at <strong>A$700</strong>, Business Websites at <strong>A$1,700</strong>, and Shopify stores at <strong>A$2,500</strong>. <a href="/services.html#pricing">Compare package inclusions</a> or <a href="/contact.html#enquiry-form">request a tailored quote</a>.'
    },
    {
      q: 'Can you work to my timeframe?',
      a: null,
      weeks: true
    },
    {
      q: 'How long does a project take?',
      a: 'A focused launch website may take around <strong>1–2 weeks</strong>, while a business website often takes <strong>2–4 weeks</strong>. Timing is confirmed against the scope, content readiness and current availability.'
    },
    {
      q: 'Do you work with clients across Australia?',
      a: 'Based in Canberra, I work online with businesses across Australia. Project briefs, design feedback and launch coordination can be handled remotely.'
    },
    {
      q: 'Can I update my website after launch?',
      a: 'Editing options depend on the platform and agreed scope. We can discuss content updates, handover guidance and ongoing support before the build.'
    },
    {
      q: 'Do you design Shopify stores?',
      a: 'Shopify store design starts at <strong>A$2,500</strong>. The package includes storefront styling, homepage, collection and product templates, and initial setup for up to ten products. Shopify subscriptions, domains, paid themes and apps are separate. <a href="/shopify-websites.html">Explore Shopify design services →</a>'
    },
    {
      q: 'How do I enquire about a project?',
      a: 'Use the <a href="/contact.html#enquiry-form">project enquiry form</a> to share your goals, preferred timing and budget. I will review the brief and respond by email with the next steps.'
    }
  ];

  const WEEK_REPLIES = Object.fromEntries(Array.from({ length: 8 }, (_, index) => {
    const weeks = index + 1;
    const text = weeks === 1
      ? 'A one-week deadline requires a focused scope and ready-to-use content. Please share your requirements so I can confirm whether the schedule is feasible.'
      : `Your preferred timeframe is <strong>${weeks} weeks</strong>. I will confirm availability and a delivery schedule after reviewing your project scope and content.`;
    return [weeks, text + ' <a href="/contact.html#enquiry-form">Discuss your project timeline →</a>'];
  }));

  // ── CSS ────────────────────────────────────────────────────
  const css = `
    #chat-bubble {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    #chat-toggle {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #ecdade, #dfc2ca);
      border: 1px solid rgba(128, 94, 105, .25); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 12px 28px rgba(57, 43, 48, .24);
      transition: transform .35s cubic-bezier(.34, 1.56, .64, 1), box-shadow .25s, filter .25s;
      position: relative;
    }
    #chat-toggle:hover {
      transform: translateY(-4px) scale(1.04);
      filter: saturate(1.08);
      box-shadow: 0 18px 34px rgba(57, 43, 48, .30);
    }
    #chat-toggle svg { color: #4c3942; stroke: currentColor; transition: opacity .2s, transform .2s; }
    #chat-toggle .icon-chat { position: absolute; }
    #chat-toggle .icon-close { position: absolute; opacity: 0; transform: rotate(-90deg); }
    #chat-bubble.open #chat-toggle .icon-chat { opacity: 0; transform: rotate(90deg); }
    #chat-bubble.open #chat-toggle .icon-close { opacity: 1; transform: rotate(0deg); }

    #chat-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #9e697b; border: 2px solid #f6f3ee;
      position: absolute; top: 2px; right: 2px;
      animation: pulse-dot 2s infinite;
    }
    @keyframes pulse-dot {
      0%,100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }
    #chat-bubble.open #chat-dot { display: none; }

    #chat-panel {
      position: absolute; bottom: 70px; right: 0;
      width: 360px; max-height: min(620px, calc(100vh - 110px));
      background: rgba(249, 246, 243, .99);
      border: 1px solid rgba(132, 100, 111, .20);
      border-radius: 24px;
      box-shadow: 0 24px 70px rgba(57, 43, 48, .22);
      display: flex; flex-direction: column;
      overflow: hidden;
      opacity: 0; transform: translateY(12px) scale(.97);
      pointer-events: none;
      transition: opacity .25s, transform .25s;
    }
    #chat-panel:focus { outline: none; }
    #chat-bubble.open #chat-panel {
      opacity: 1; transform: translateY(0) scale(1);
      pointer-events: all;
    }

    #chat-header {
      background: linear-gradient(135deg, #f0e3e5 0%, #e5cdd4 100%);
      padding: 20px 20px 18px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    #chat-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: #faf6f3; border: 1px solid rgba(255,255,255,.42);
      display: flex; align-items: center; justify-content: center;
      font-size: .9rem; font-weight: 700; color: #3c3439; flex-shrink: 0;
    }
    #chat-header-text { flex: 1; }
    #chat-name { font-size: .82rem; font-weight: 600; color: #3c3439; margin-bottom: 3px; }
    #chat-status { font-size: .6rem; letter-spacing: .07em; color: #6e5962; display: flex; align-items: center; gap: 6px; }
    #chat-status::before { content:''; display:block; width:6px; height:6px; border-radius:50%; background:#9e697b; box-shadow: 0 0 0 3px rgba(158, 105, 123,.14); }

    #chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 80px;
    }
    #chat-content { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; position: relative; }
    #chat-content #chat-messages { flex: none; overflow: visible; }
    #chat-content #faq-chips { max-height: none; overflow: visible; }
    #chat-messages::-webkit-scrollbar { width: 4px; }
    #chat-messages::-webkit-scrollbar-thumb { background: rgba(132, 100, 111, .24); border-radius: 4px; }

    .msg {
      max-width: 88%; font-size: .78rem; line-height: 1.6;
      padding: 10px 14px; border-radius: 14px; animation: msg-in .2s ease;
      overflow-wrap: anywhere;
    }
    @keyframes msg-in { from { transform: translateY(4px); } to { transform:none; } }
    .msg.bot {
      background: #fff; color: #3c3439; border: 1px solid rgba(132, 100, 111, .14);
      border-bottom-left-radius: 5px; align-self: flex-start;
      box-shadow: 0 5px 14px rgba(57, 43, 48, .05);
    }
    .msg.bot a { color: #795362; }
    .msg.user { background: #795362; color: #f6f3ee; border-bottom-right-radius: 5px; align-self: flex-end; }

    /* Three common questions, with optional details. */
    #faq-chips {
      padding: 4px 16px 10px;
      display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
      max-height: 220px; overflow-y: auto;
    }
    #faq-chips::-webkit-scrollbar { width: 3px; }
    #faq-chips::-webkit-scrollbar-thumb { background: rgba(132, 100, 111, .24); border-radius: 3px; }

    .faq-chip {
      background: rgba(255,255,255,.72); border: 1px solid rgba(132, 100, 111, .18);
      border-radius: 20px; padding: 10px 14px;
      min-height: 44px;
      font-family: 'Montserrat', sans-serif;
      font-size: .74rem; color: #65545e; cursor: pointer;
      text-align: left; transition: background .25s, border-color .25s, color .25s, transform .3s cubic-bezier(.34,1.56,.64,1);
      white-space: normal; word-break: break-word;
      display: flex; align-items: center;
    }
    .faq-chip:hover { background: #fff; border-color: rgba(132, 100, 111, .46); color: #3c3439; transform: translateX(3px); }
    .faq-chip.active { background: rgba(234, 212, 217, .22); border-color: rgba(132, 100, 111, .46); color: #3c3439; }
    #chat-more-questions { margin-top: 2px; }
    #chat-more-questions summary {
      display: flex; align-items: center; gap: 8px; min-height: 44px;
      cursor: pointer; color: #795362; font-size: 12px; list-style: none;
    }
    #chat-more-questions summary::-webkit-details-marker { display: none; }
    #chat-more-questions summary::after { content: '+'; font-size: 18px; }
    #chat-more-questions[open] summary::after { content: '−'; }
    #chat-more-questions .faq-chip { width: 100%; margin-top: 6px; }

    /* Week selector */
    #week-selector {
      display: none;
      padding: 8px 16px 12px;
      flex-direction: column; gap: 6px; flex-shrink: 0;
    }
    #week-selector.visible { display: flex; }
    #week-selector-label {
      font-size: .6rem; letter-spacing: .14em; text-transform: uppercase;
      color: #795362; margin-bottom: 4px;
    }
    #week-buttons {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
    }
    .week-btn {
      border: 1px solid rgba(132, 100, 111, .18); background: rgba(255,255,255,.72);
      border-radius: 8px; padding: 10px 4px;
      min-height: 44px;
      font-family: 'Montserrat', sans-serif;
      font-size: .72rem; color: #65545e; cursor: pointer;
      transition: background .2s, border-color .2s;
      text-align: center;
      display: flex; align-items: center; justify-content: center;
    }
    .week-btn:hover { background: #fff; border-color: rgba(132, 100, 111, .46); color: #3c3439; }

    /* Email form */
    #chat-email-section {
      border-top: 1px solid rgba(132, 100, 111, .14);
      padding: 14px 16px 16px; flex-shrink: 0;
      background: rgba(255,255,255,.58);
    }
    #chat-email-label {
      font-size: .6rem; letter-spacing: .14em; text-transform: uppercase;
      color: #795362; margin-bottom: 8px;
    }
    #chat-email-row { display: flex; gap: 8px; }
    #chat-email-input {
      flex: 1; border: 1px solid rgba(132, 100, 111, .20); border-radius: 999px;
      padding: 12px 14px; font-family: 'Montserrat', sans-serif;
      font-size: .78rem; color: #3c3439; background: #fff; outline: none;
      transition: border-color .2s; min-height: 44px; min-width: 0;
    }
    #chat-email-input:focus { border-color: #795362; box-shadow: 0 0 0 3px rgba(132, 100, 111, .10); }
    #chat-email-input::placeholder { color: #786d75; }
    #chat-send-btn {
      background: linear-gradient(135deg, #ead4d9, #dfc2ca); border: none; border-radius: 999px;
      padding: 12px 14px; cursor: pointer; color: #3c3439;
      font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 500;
      letter-spacing: .01em; transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
      white-space: nowrap; min-height: 44px; flex-shrink: 0;
    }
    #chat-send-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(98, 65, 79, .22); }

    @media (max-width: 480px) {
      #chat-bubble { bottom: 16px; right: 16px; }
      #chat-panel {
        width: calc(100vw - 32px);
        right: -6px;
        max-height: 82vh;
        bottom: 72px;
      }
      #chat-messages { padding: 12px; }
      #faq-chips { padding: 4px 12px 10px; max-height: 200px; }
      .faq-chip { font-size: .76rem; padding: 10px 12px; }
      #week-buttons { gap: 5px; }
      .week-btn { font-size: .7rem; min-height: 40px; }
      #chat-email-section { padding: 10px 12px; }
      #chat-email-input { font-size: 16px; }
      #chat-send-btn { font-size: 11.5px; font-weight: 500; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'chat-bubble';
  widget.setAttribute('data-nosnippet', '');
  widget.innerHTML = `
    <div id="chat-panel" role="region" aria-labelledby="chat-name" tabindex="-1" inert>
      <div id="chat-header">
        <div id="chat-avatar">F</div>
        <div id="chat-header-text">
          <div id="chat-name">Flora · 2600 Design</div>
          <div id="chat-status">Quick answers · Email enquiries</div>
        </div>
      </div>

      <div id="chat-content">
      <div id="chat-messages" role="log" aria-live="polite" aria-label="Enquiry conversation">
        <div class="msg bot">
          Welcome to 2600 Design. Find answers to common project questions below, or <a href="/contact.html#enquiry-form">send a project enquiry</a>.
        </div>
      </div>

      <div id="faq-chips">
        ${[0, 2, 3].map(i => `<button class="faq-chip" data-idx="${i}">${FAQS[i].q}</button>`).join('')}
        <details id="chat-more-questions">
          <summary>More questions</summary>
          ${[1, 4, 5, 6].map(i => `<button class="faq-chip" data-idx="${i}">${FAQS[i].q}</button>`).join('')}
        </details>
      </div>

      <div id="week-selector">
        <div id="week-selector-label">Preferred timeframe</div>
        <div id="week-buttons">
          ${[1,2,3,4,5,6,7,8].map(w => `<button class="week-btn" data-weeks="${w}">${w} ${w === 1 ? 'week' : 'weeks'}</button>`).join('')}
        </div>
      </div>

      </div>
      <div id="chat-email-section">
        <div id="chat-email-label">Project enquiry</div>
        <div id="chat-email-row">
          <input id="chat-email-input" type="text" maxlength="3000" aria-label="Your email enquiry" placeholder="Your enquiry" />
          <button id="chat-send-btn" aria-label="Open enquiry in your email app">Email ↗</button>
        </div>
      </div>
    </div>

    <button id="chat-toggle" aria-label="Open chat" aria-controls="chat-panel" aria-expanded="false">
      <div id="chat-dot"></div>
      <svg class="icon-chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f3f7f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f3f7f6" stroke-width="2" stroke-linecap="round">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  `;
  document.body.appendChild(widget);

  // ── Logic ──────────────────────────────────────────────────
  const toggle      = document.getElementById('chat-toggle');
  const messages    = document.getElementById('chat-messages');
  const content     = document.getElementById('chat-content');
  const chips       = document.getElementById('faq-chips');
  const weekSel     = document.getElementById('week-selector');
  const input       = document.getElementById('chat-email-input');
  const sendBtn     = document.getElementById('chat-send-btn');

  const panel = document.getElementById('chat-panel');
  const viewport = window.visualViewport;
  function fitViewport() {
    if (!viewport) return;
    if (viewport.scale !== 1) { widget.style.transform = ''; panel.style.maxHeight = ''; return; }
    const keyboardInset = document.activeElement === input ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
    widget.style.transform = keyboardInset ? `translateY(-${keyboardInset}px)` : '';
    panel.style.maxHeight = Math.min(620, Math.max(140, viewport.height - 110)) + 'px';
  }
  viewport?.addEventListener('resize', fitViewport);
  viewport?.addEventListener('scroll', fitViewport);
  input.addEventListener('focus', fitViewport);
  input.addEventListener('blur', () => requestAnimationFrame(fitViewport));
  fitViewport();
  function setChatOpen(open) {
    widget.classList.toggle('open', open);
    panel.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    fitViewport();
    if (open) panel.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => setChatOpen(!widget.classList.contains('open')));
  document.addEventListener('click', event => {
    if (widget.classList.contains('open') && !widget.contains(event.target)) setChatOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && widget.classList.contains('open')) {
      setChatOpen(false);
      toggle.focus();
    }
  });

  function addMsg(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}`;
    if (type === 'user') m.textContent = text;
    else m.innerHTML = text;
    messages.appendChild(m);
    content.scrollTop = Math.max(0, m.offsetTop - 8);
  }

  // FAQ chips — stay visible, allow multiple selections
  chips.querySelectorAll('.faq-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const faq = FAQS[idx];

      // Mark as active
      btn.classList.add('active');

      addMsg(faq.q, 'user');

      if (faq.weeks) {
        // Show week selector
        setTimeout(() => {
          addMsg('Select your preferred timeframe. Availability and delivery dates are confirmed after reviewing the project scope.', 'bot');
          weekSel.classList.add('visible');
          content.scrollTop = weekSel.offsetTop;
        }, 400);
      } else {
        setTimeout(() => {
          addMsg(faq.a, 'bot');
          weekSel.classList.remove('visible');
        }, 400);
      }
    });
  });

  // Week buttons
  weekSel.querySelectorAll('.week-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const w = parseInt(btn.dataset.weeks);
      addMsg(`${w} ${w === 1 ? 'week' : 'weeks'}`, 'user');
      weekSel.classList.remove('visible');
      setTimeout(() => addMsg(WEEK_REPLIES[w], 'bot'), 400);
    });
  });

  // Email send
  function sendMessage() {
    const text = input.value.trim();
    if (!text) {
      input.setCustomValidity('Please write your question first.');
      input.reportValidity();
      return;
    }
    addMsg(text, 'user');
    weekSel.classList.remove('visible');

    const subject = encodeURIComponent('Project enquiry — 2600 Design');
    const body    = encodeURIComponent(text + '\n\n— Prepared through the 2600 Design website');
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
    addMsg('A draft should open in your email app. Review it before sending. You can also use the <a href="/contact.html#enquiry-form">project enquiry form</a>.', 'bot');
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('input', () => input.setCustomValidity(''));
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendMessage(); } });

})();
