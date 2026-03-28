/* ============================================================
   2600 Design — Live Chat Widget
   ============================================================ */

(function () {
  const OWNER_EMAIL = '2600design@gmail.com';

  const FAQS = [
    {
      q: '💰 How much does a website cost?',
      a: 'Packages start from <strong>$900 AUD</strong> for a single-page site, <strong>$1,800 AUD</strong> for a multi-page business site, and <strong>$2,500 AUD</strong> for a Shopify store. Every project is quoted individually — <a href="contact.html">get a free quote →</a>'
    },
    {
      q: '📅 How many weeks do you need it done in?',
      a: null,
      weeks: true
    },
    {
      q: '⏱ How long does it take?',
      a: 'A single-page site takes around <strong>1–2 weeks</strong>. A full business website is usually <strong>2–4 weeks</strong>, depending on how quickly content is provided.'
    },
    {
      q: '📍 Do you work outside Canberra?',
      a: 'Absolutely! I work with clients Australia-wide. Most of the process is online, so location is no barrier.'
    },
    {
      q: '✏️ Can I update the site myself after launch?',
      a: 'Yes! I build sites that are easy to manage. I also offer ongoing care & maintenance packages if you\'d prefer someone to handle it for you.'
    },
    {
      q: '🛍 Do you build Shopify stores?',
      a: 'Yes — Shopify store setup starts from <strong>$2,500 AUD</strong>, using an existing theme with your branding applied.'
    },
    {
      q: '📞 How do I get started?',
      a: 'Fill in the <a href="contact.html">contact form</a> or email me at <a href="mailto:2600design@gmail.com">2600design@gmail.com</a> — I\'ll get back to you within 24 hours!'
    }
  ];

  const WEEK_REPLIES = {
    1: "Ooh, that's a very tight timeline! 😅 It's possible for a simple single-page site — let's chat urgently and see what we can do. <a href='contact.html'>Get in touch →</a>",
    2: "2 weeks is doable for a single-page or simple site! Let's get the ball rolling. <a href='contact.html'>Start a project →</a>",
    3: "3 weeks works well for a single-page or small business site. Let's chat! <a href='contact.html'>Get in touch →</a>",
    4: "4 weeks is a great timeline for a multi-page business website. Plenty of time to get it right. <a href='contact.html'>Let's start →</a>",
    5: "5 weeks is perfect — no rush, and enough time for a really polished result. <a href='contact.html'>Let's start →</a>",
    6: "6 weeks gives us great breathing room for a beautiful, well-considered site. <a href='contact.html'>Book a free chat →</a>",
    7: "7 weeks — perfect! We can do this really thoroughly. <a href='contact.html'>Book a free chat →</a>",
    8: "8 weeks is a comfortable timeline. We can plan everything carefully and get a brilliant result. <a href='contact.html'>Book a free chat →</a>"
  };

  // ── CSS ────────────────────────────────────────────────────
  const css = `
    #chat-bubble {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      font-family: 'Raleway', sans-serif;
    }

    #chat-toggle {
      width: 56px; height: 56px; border-radius: 50%;
      background: #1A1614; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,.22);
      transition: transform .25s, background .25s;
      position: relative;
    }
    #chat-toggle:hover { transform: scale(1.08); background: #C27B7B; }
    #chat-toggle svg { transition: opacity .2s, transform .2s; }
    #chat-toggle .icon-chat { position: absolute; }
    #chat-toggle .icon-close { position: absolute; opacity: 0; transform: rotate(-90deg); }
    #chat-bubble.open #chat-toggle .icon-chat { opacity: 0; transform: rotate(90deg); }
    #chat-bubble.open #chat-toggle .icon-close { opacity: 1; transform: rotate(0deg); }

    #chat-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #C27B7B; border: 2px solid #fff;
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
      width: 340px; max-height: 560px;
      background: #FDFAF7; border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,.16);
      display: flex; flex-direction: column;
      overflow: hidden;
      opacity: 0; transform: translateY(12px) scale(.97);
      pointer-events: none;
      transition: opacity .25s, transform .25s;
    }
    #chat-bubble.open #chat-panel {
      opacity: 1; transform: translateY(0) scale(1);
      pointer-events: all;
    }

    #chat-header {
      background: #1A1614; padding: 18px 20px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    #chat-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: #C27B7B;
      display: flex; align-items: center; justify-content: center;
      font-size: .9rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    #chat-header-text { flex: 1; }
    #chat-name { font-size: .82rem; font-weight: 600; color: #F0E8D8; margin-bottom: 2px; }
    #chat-status { font-size: .6rem; letter-spacing: .08em; color: #7A6A58; display: flex; align-items: center; gap: 5px; }
    #chat-status::before { content:''; display:block; width:6px; height:6px; border-radius:50%; background:#6FCF97; }

    #chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 80px;
    }
    #chat-messages::-webkit-scrollbar { width: 4px; }
    #chat-messages::-webkit-scrollbar-thumb { background: #E0D8D0; border-radius: 4px; }

    .msg {
      max-width: 88%; font-size: .78rem; line-height: 1.6;
      padding: 10px 14px; border-radius: 14px; animation: msg-in .2s ease;
    }
    @keyframes msg-in { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform:none; } }
    .msg.bot { background: #EDE8DF; color: #1A1614; border-bottom-left-radius: 4px; align-self: flex-start; }
    .msg.bot a { color: #C27B7B; }
    .msg.user { background: #1A1614; color: #F0E8D8; border-bottom-right-radius: 4px; align-self: flex-end; }

    /* FAQ chips — always visible */
    #faq-chips {
      padding: 4px 16px 10px;
      display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
      max-height: 220px; overflow-y: auto;
    }
    #faq-chips::-webkit-scrollbar { width: 3px; }
    #faq-chips::-webkit-scrollbar-thumb { background: #E0D8D0; border-radius: 3px; }

    .faq-chip {
      background: none; border: 1px solid #E0D8D0;
      border-radius: 20px; padding: 10px 14px;
      min-height: 44px;
      font-family: 'Raleway', sans-serif;
      font-size: .74rem; color: #5A4A43; cursor: pointer;
      text-align: left; transition: background .2s, border-color .2s, color .2s;
      white-space: normal; word-break: break-word;
      display: flex; align-items: center;
    }
    .faq-chip:hover { background: #EDE8DF; border-color: #C27B7B; color: #1A1614; }
    .faq-chip.active { background: #EDE8DF; border-color: #C27B7B; color: #1A1614; }

    /* Week selector */
    #week-selector {
      display: none;
      padding: 8px 16px 12px;
      flex-direction: column; gap: 6px; flex-shrink: 0;
    }
    #week-selector.visible { display: flex; }
    #week-selector-label {
      font-size: .6rem; letter-spacing: .14em; text-transform: uppercase;
      color: #9A8878; margin-bottom: 4px;
    }
    #week-buttons {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
    }
    .week-btn {
      border: 1px solid #E0D8D0; background: none;
      border-radius: 8px; padding: 10px 4px;
      min-height: 44px;
      font-family: 'Raleway', sans-serif;
      font-size: .72rem; color: #5A4A43; cursor: pointer;
      transition: background .2s, border-color .2s;
      text-align: center;
      display: flex; align-items: center; justify-content: center;
    }
    .week-btn:hover { background: #EDE8DF; border-color: #C27B7B; color: #1A1614; }

    /* Email form */
    #chat-email-section {
      border-top: 1px solid #EDE8DF;
      padding: 12px 16px; flex-shrink: 0;
    }
    #chat-email-label {
      font-size: .6rem; letter-spacing: .14em; text-transform: uppercase;
      color: #9A8878; margin-bottom: 8px;
    }
    #chat-email-row { display: flex; gap: 8px; }
    #chat-email-input {
      flex: 1; border: 1px solid #E0D8D0; border-radius: 8px;
      padding: 12px 12px; font-family: 'Raleway', sans-serif;
      font-size: .82rem; color: #1A1614; background: #fff; outline: none;
      transition: border-color .2s; min-height: 44px;
    }
    #chat-email-input:focus { border-color: #C27B7B; }
    #chat-email-input::placeholder { color: #C0B0A8; }
    #chat-send-btn {
      background: #C27B7B; border: none; border-radius: 8px;
      padding: 12px 14px; cursor: pointer; color: #fff;
      font-size: .82rem; font-weight: 600; transition: background .2s;
      white-space: nowrap; min-height: 44px;
    }
    #chat-send-btn:hover { background: #1A1614; }

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
      #chat-email-input, #chat-send-btn { font-size: .8rem; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'chat-bubble';
  widget.innerHTML = `
    <div id="chat-panel">
      <div id="chat-header">
        <div id="chat-avatar">F</div>
        <div id="chat-header-text">
          <div id="chat-name">Flora · 2600 Design</div>
          <div id="chat-status">Usually replies within a few hours</div>
        </div>
      </div>

      <div id="chat-messages">
        <div class="msg bot">
          Hi there! 👋 I'm Flora. Have a question about your website? Pick one below or send me a message!
        </div>
      </div>

      <div id="faq-chips">
        ${FAQS.map((f, i) => `<button class="faq-chip" data-idx="${i}">${f.q}</button>`).join('')}
      </div>

      <div id="week-selector">
        <div id="week-selector-label">Select number of weeks</div>
        <div id="week-buttons">
          ${[1,2,3,4,5,6,7,8].map(w => `<button class="week-btn" data-weeks="${w}">${w} ${w === 1 ? 'week' : 'weeks'}</button>`).join('')}
        </div>
      </div>

      <div id="chat-email-section">
        <div id="chat-email-label">Send me a message</div>
        <div id="chat-email-row">
          <input id="chat-email-input" type="text" placeholder="Your question or message…" />
          <button id="chat-send-btn">Send ✉</button>
        </div>
      </div>
    </div>

    <button id="chat-toggle" aria-label="Open chat">
      <div id="chat-dot"></div>
      <svg class="icon-chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0E8D8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0E8D8" stroke-width="2" stroke-linecap="round">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  `;
  document.body.appendChild(widget);

  // ── Logic ──────────────────────────────────────────────────
  const toggle      = document.getElementById('chat-toggle');
  const messages    = document.getElementById('chat-messages');
  const chips       = document.getElementById('faq-chips');
  const weekSel     = document.getElementById('week-selector');
  const input       = document.getElementById('chat-email-input');
  const sendBtn     = document.getElementById('chat-send-btn');

  toggle.addEventListener('click', () => widget.classList.toggle('open'));

  function addMsg(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}`;
    m.innerHTML = text;
    messages.appendChild(m);
    messages.scrollTop = messages.scrollHeight;
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
          addMsg('Sure! How many weeks do you need it completed in?', 'bot');
          weekSel.classList.add('visible');
          messages.scrollTop = messages.scrollHeight;
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
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    weekSel.classList.remove('visible');

    const subject = encodeURIComponent('Website Enquiry via 2600 Design Chat');
    const body    = encodeURIComponent(text + '\n\n— Sent via 2600 Design website chat');
    setTimeout(() => {
      window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
      addMsg("Thanks! Your email client should open now 📬 I'll reply within 24 hours.", 'bot');
    }, 350);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

})();
