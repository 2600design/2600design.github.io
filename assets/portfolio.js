(() => {
  const filters = [...document.querySelectorAll('[data-work-filter]')];
  const cards = [...document.querySelectorAll('[data-work-category]')];
  const count = document.querySelector('[data-work-count]');
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.workFilter;
    document.querySelector('.work-grid')?.classList.toggle('is-filtered', category !== 'all');
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.workCategory !== category; });
    const visible = cards.filter(card => !card.hidden).length;
    if (count) count.textContent = `${String(visible).padStart(2, '0')} projects`;
  }));
})();
