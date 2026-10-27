/* Shared interactions for studio pages and project stories. */
(() => {
  'use strict';
  const main = document.querySelector('main');
  if (main) {
    if (!main.id) main.id = 'main-content';
    main.tabIndex = -1;
    const skip = document.createElement('a');
    skip.className = 'skip-link'; skip.href = '#' + main.id; skip.textContent = 'Skip to content';
    skip.addEventListener('click', () => main.focus({ preventScroll: true }));
    document.body.prepend(skip);
  }

  // Menus stay ordinary navigation links, with predictable keyboard order.
  const toggle = document.querySelector('#hamburger,.studio-menu');
  const menu = document.querySelector('#mobileMenu,.studio-links');
  if (toggle && menu) {
    const portfolio = toggle.classList.contains('studio-menu');
    if (!portfolio) {
      toggle.closest('nav').after(menu);
      menu.setAttribute('role', 'navigation'); menu.setAttribute('aria-label', 'Main menu');
    }
    const breakpoint = matchMedia('(max-width:900px)');
    let open = false;
    const isDropdown = () => !portfolio || breakpoint.matches;
    const setOpen = (next, restore = false) => {
      open = next && isDropdown();
      menu.classList.toggle(portfolio ? 'is-open' : 'open', open);
      menu.inert = isDropdown() && !open;
      toggle.classList.toggle('open', open);
      if (portfolio) toggle.textContent = open ? 'Close ×' : 'Menu ☰';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      const bars = toggle.querySelectorAll('span');
      if (bars.length === 3) {
        bars[0].style.transform = open ? 'translateY(6px) rotate(45deg)' : '';
        bars[1].style.opacity = open ? '0' : '';
        bars[2].style.transform = open ? 'translateY(-6px) rotate(-45deg)' : '';
      }
      if (restore) toggle.focus({ preventScroll: true });
    };
    window.closeMobile = () => setOpen(false);
    setOpen(false);
    toggle.addEventListener('click', () => {
      setOpen(!open);
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
    });
    menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('click', event => {
      if (open && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false, true); }
    });
    document.addEventListener('focusin', event => {
      if (open && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
    if (portfolio) breakpoint.addEventListener('change', () => setOpen(false));
  }

  // Collapsed panels must also be absent from the keyboard focus order.
  const disclosureGroup = (itemSelector, triggerSelector, panelSelector) => {
    const items = [...document.querySelectorAll(itemSelector)];
    const set = (item, open) => {
      item.classList.toggle('is-open', open);
      item.querySelector(triggerSelector).setAttribute('aria-expanded', String(open));
      const panel = item.querySelector(panelSelector);
      panel.setAttribute('aria-hidden', String(!open)); panel.inert = !open;
    };
    items.forEach(item => {
      set(item, item.classList.contains('is-open'));
      item.querySelector(triggerSelector).addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach(other => set(other, other === item && open));
      });
    });
  };
  disclosureGroup('[data-service-row]', '.service-row-trigger', '.service-row-panel');
  disclosureGroup('[data-faq]', '.faq-question', '.faq-answer');
  document.querySelectorAll('.expertise-trigger').forEach(trigger => {
    const item = trigger.closest('.expertise-item');
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open)); panel.hidden = !open; panel.inert = !open;
      item.classList.toggle('is-open', open); item.classList.toggle('is-selected', open);
    });
  });

  const packages = {
    'launch-website': ['Launch Website', 'Website Design + Development'],
    'business-website': ['Business Website', 'Website Design + Development'],
    'shopify-store': ['Shopify Store', 'Shopify Store'],
    'brand-identity': ['Brand Identity', 'Branding & Logo Direction'],
    'digital-product-ui': ['Digital Product UI', 'Digital Product UI']
  };
  document.querySelectorAll('form.contact-form').forEach(form => {
    const submit = form.querySelector('[type=submit]');
    const status = document.createElement('p');
    status.className = 'form-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    form.append(status);
    const selected = packages[new URLSearchParams(location.search).get('package')];
    const service = form.elements.namedItem('service');
    if (selected && service) {
      service.value = selected[1];
      const field = document.createElement('input'); field.type = 'hidden'; field.name = 'package'; field.value = selected[0];
      const note = document.createElement('p'); note.className = 'enquiry-context'; note.textContent = 'Enquiring about the ' + selected[0] + ' package.';
      form.prepend(note); form.append(field);
      service.addEventListener('change', () => {
        field.disabled = service.value !== selected[1]; note.hidden = field.disabled;
      });
    }
    const fallback = () => {
      const data = new FormData(form);
      const body = [...data].map(([key, value]) => key + ': ' + value).join('\n');
      const link = document.createElement('a');
      link.href = 'mailto:hello@2600design.com.au?subject=' + encodeURIComponent('Website enquiry — 2600 Design') + '&body=' + encodeURIComponent(body);
      link.textContent = 'Email Flora instead'; return link;
    };
    let sending = false;
    form.addEventListener('invalid', event => {
      event.target.setAttribute('aria-invalid', 'true');
      form.dataset.state = 'invalid';
      status.textContent = event.target.validity.typeMismatch ? 'Please enter a valid email address.' : 'Please check the required fields before sending.';
    }, true);
    form.addEventListener('input', event => {
      event.target.setCustomValidity?.('');
      if (event.target.validity?.valid) event.target.removeAttribute('aria-invalid');
      if (form.dataset.state === 'success') { delete form.dataset.state; status.textContent = ''; form.classList.remove('is-sent'); }
      if (form.dataset.state === 'invalid' && [...form.querySelectorAll('[required]')].every(field => field.value.trim() && field.validity.valid)) {
        delete form.dataset.state; status.textContent = '';
      }
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;
      for (const field of form.querySelectorAll('[required]')) {
        field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
      }
      if (!form.reportValidity()) return;
      sending = true; submit.disabled = true; submit.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true'); status.textContent = 'Sending your enquiry…';
      form.dataset.state = 'sending';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!response.ok) throw new Error('Submission failed');
        form.reset(); form.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid'));
        if (selected && service) { service.value = selected[1]; form.elements.namedItem('package').disabled = false; form.querySelector('.enquiry-context').hidden = false; }
        form.dataset.state = 'success'; form.classList.add('is-sent');
        status.textContent = 'Thank you — your enquiry was submitted successfully.';
        submit.textContent = 'Send another enquiry →';
      } catch (error) {
        form.dataset.state = 'error';
        status.textContent = error.name === 'AbortError' ? 'The request timed out. Your details are still here. Please retry, or ' : 'Your enquiry could not be sent. Your details are still here. Please retry, or ';
        status.append(fallback(), '.'); submit.textContent = 'Try sending again →';
      } finally {
        clearTimeout(timer); sending = false; submit.disabled = false; form.setAttribute('aria-busy', 'false');
      }
    });
  });

  // Full-size project screenshots: native modal, Escape and focus return.
  const candidates = document.querySelectorAll('body.case-page main img,body.studio-project-legacy .project-gallery img,body.shopify-services .shopify-screen-grid img');
  const pictures = [];
  candidates.forEach(img => {
    let trigger = img.closest('a');
    if (trigger && !/\.(png|jpe?g|webp)(?:[?#]|$)/i.test(trigger.href)) return;
    if (!trigger) {
      trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'image-zoom';
      const visual = img.closest('picture') || img;
      visual.before(trigger); trigger.append(visual);
    }
    trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-label', 'View full image: ' + img.alt);
    pictures.push({ img, trigger, get source() {
      if (trigger.tagName === 'A') return trigger.href;
      const sources = img.closest('picture')?.querySelectorAll('source') || [];
      const selected = [...sources].find(source => !source.media || matchMedia(source.media).matches);
      if (selected) return new URL(selected.srcset.split(',').pop().trim().split(/\s+/)[0], location.href).href;
      return img.src;
    } });
  });
  if (pictures.length && typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal === 'function') {
    const dialog = document.createElement('dialog'); dialog.className = 'image-viewer'; dialog.setAttribute('aria-labelledby', 'viewer-title');
    dialog.innerHTML = '<div class="viewer-toolbar"><span id="viewer-title">Project image</span><button type="button" data-viewer-close aria-label="Close image viewer">Close ×</button></div><div class="viewer-stage"><button type="button" data-viewer-prev aria-label="Previous image">←</button><img class="viewer-image" alt=""><button type="button" data-viewer-next aria-label="Next image">→</button></div><div class="viewer-footer"><p class="viewer-caption" aria-live="polite"></p><a class="viewer-original" target="_blank" rel="noopener">Open original ↗</a></div>';
    document.body.append(dialog);
    const display = dialog.querySelector('img'); const caption = dialog.querySelector('.viewer-caption'); let index = 0, origin;
    const show = next => {
      index = (next + pictures.length) % pictures.length;
      const item = pictures[index]; display.alt = item.img.alt; display.src = item.source;
      caption.textContent = (index + 1) + ' / ' + pictures.length + ' — ' + item.img.alt;
      dialog.querySelector('.viewer-original').href = item.source;
    };
    pictures.forEach((item, i) => item.trigger.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); origin = item.trigger; show(i); dialog.showModal(); document.body.classList.add('image-viewer-open');
    }));
    dialog.querySelector('[data-viewer-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-viewer-prev]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-viewer-next]').addEventListener('click', () => show(index + 1));
    dialog.querySelector('[data-viewer-prev]').hidden = pictures.length < 2;
    dialog.querySelector('[data-viewer-next]').hidden = pictures.length < 2;
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const controls = [...dialog.querySelectorAll('button,a[href]')].filter(control => !control.disabled && control.getClientRects().length);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('image-viewer-open'); origin?.focus({ preventScroll: true }); });
  } else {
    pictures.forEach(item => {
      item.trigger.removeAttribute('aria-haspopup');
      if (item.trigger.tagName === 'BUTTON') item.trigger.addEventListener('click', () => window.open(item.source, '_blank', 'noopener'));
    });
  }

  // Ambient films have an explicit pause control and respect reduced motion.
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('video[autoplay]:not([controls])').forEach(video => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'media-toggle';
    video.parentElement.append(button); let userPaused = false, visible = false;
    const label = () => {
      button.textContent = video.paused ? 'Play video' : 'Pause video';
      button.setAttribute('aria-label', button.textContent + ' — ' + (video.getAttribute('aria-label') || 'Featured project'));
    };
    const play = () => video.play().catch(label);
    button.addEventListener('click', () => {
      userPaused = !video.paused;
      if (video.paused) play(); else video.pause();
    });
    video.addEventListener('play', label); video.addEventListener('pause', label); label();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !motion.matches && !userPaused && !document.hidden) play(); else video.pause();
    }, { threshold: .12 });
    observer.observe(video);
    if (motion.matches) video.pause();
    motion.addEventListener('change', () => { if (motion.matches) video.pause(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause(); else if (visible && !motion.matches && !userPaused) play();
    });
  });
  const sky = document.querySelector('.sky-controls');
  if (sky) {
    sky.setAttribute('role', 'group');
    document.querySelector('#timeGroup')?.setAttribute('role', 'group');
    document.querySelector('#timeGroup')?.setAttribute('aria-label', 'Time of day');
    const sync = () => sky.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('on'))));
    sky.addEventListener('click', sync); sync();
    if (!window.THREE || document.querySelector('.hero.ocean-static')) sky.hidden = true;
  }
})();
