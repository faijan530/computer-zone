const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const mobilePanel = document.getElementById('mobilePanel');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

menuToggle?.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  mobilePanel?.classList.toggle('open');
});

mobilePanel?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle?.classList.remove('active');
    mobilePanel?.classList.remove('open');
  });
});

searchBtn?.addEventListener('click', () => {
  searchInput?.classList.toggle('open');
  if (searchInput?.classList.contains('open')) searchInput.focus();
});

searchInput?.addEventListener('keydown', event => {
  if (event.key !== 'Enter') return;
  const query = searchInput.value.trim();
  window.location.href = query ? `laptops.html?search=${encodeURIComponent(query)}` : 'laptops.html';
});

const query = new URLSearchParams(window.location.search).get('search')?.trim().toLowerCase();
const searchableCards = document.querySelectorAll('[data-search]');
if (query && searchableCards.length) {
  let visibleCount = 0;
  searchableCards.forEach(card => {
    const matches = card.dataset.search.toLowerCase().includes(query);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  const status = document.getElementById('searchStatus');
  if (status) status.textContent = `${visibleCount} result${visibleCount === 1 ? '' : 's'} for “${query}”`;
}

document.querySelectorAll('[data-contact-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Thanks. Your message is ready for the Computer Zone team.';
    form.reset();
  });
});