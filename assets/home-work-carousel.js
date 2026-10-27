/* Native horizontal gallery. Keep every project link reachable without JS. */
(() => {
 const section = document.querySelector('#work');
 const track = section?.querySelector('.home-work-grid');
 if (!track) return;
 const cards = [...track.querySelectorAll('.home-work-card')];
 if (cards.length < 2) return;
 track.classList.add('work-carousel');
 track.tabIndex = 0;
 track.setAttribute('role', 'region');
 track.setAttribute('aria-label', 'Selected projects. Use left and right arrow keys to browse.');
 const controls = document.createElement('div');
 controls.className = 'work-gallery-controls';
 controls.innerHTML = '<span class="work-gallery-count" aria-live="polite" aria-atomic="true"></span><div class="work-gallery-buttons"><button class="work-gallery-button" type="button" aria-label="Previous project">←</button><button class="work-gallery-button" type="button" aria-label="Next project">→</button></div>';
 track.after(controls);
 const count = controls.querySelector('.work-gallery-count');
 const [previous, next] = controls.querySelectorAll('button');
 let index = 0;
 let queued = false;
 const position = i => cards[i].offsetLeft - cards[0].offsetLeft;
 function update() {
  index = cards.reduce((best, card, i) => Math.abs(position(i) - track.scrollLeft) < Math.abs(position(best) - track.scrollLeft) ? i : best, 0);
  const label = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  if (count.textContent !== label) count.textContent = label;
  previous.disabled = index === 0;
  next.disabled = index === cards.length - 1;
 }
 function go(i) {
  const target = Math.max(0, Math.min(cards.length - 1, i));
  track.scrollTo({left: position(target), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
 }
 previous.addEventListener('click', () => go(index - 1));
 next.addEventListener('click', () => go(index + 1));
 track.addEventListener('keydown', event => {
  if (event.target !== track) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
   event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1));
  } else if (event.key === 'Home' || event.key === 'End') {
   event.preventDefault(); go(event.key === 'Home' ? 0 : cards.length - 1);
  }
 });
 track.addEventListener('scroll', () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; update(); });
 }, {passive: true});
 new ResizeObserver(update).observe(track);
 update();
})();
