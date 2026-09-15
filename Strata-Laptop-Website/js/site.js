(function() {
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
    window.location.href = query ? `categories.html?search=${encodeURIComponent(query)}` : 'categories.html';
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
      if (status) status.textContent = 'Thank you. The La Maison Sucre atelier will be in touch shortly.';
      form.reset();
    });
  });

  /* ==========================================================
     MODULE 4 — Interactive Luxury Cake Configurator (The Cake Atelier)
  ========================================================== */
  const cakeConfig = {
    base: 'dark-cocoa',
    mousse: 'belgian-ganache',
    fruit: 'raspberry',
    finish: 'mirror-glaze',
    decoration: '24k-gold',
    size: '8-10'
  };

  const BASE_PRICE = 120;

  const SIZE_MODIFIERS = {
    '6-8': 0,
    '8-10': 45,
    '10-12': 85,
    '12-16': 125
  };

  const FINISH_MODIFIERS = {
    'mirror-glaze': 15,
    'velvet-finish': 10,
    'ivory-cream': 0,
    'gold-accent': 25
  };

  const SIZE_SCALES = {
    '6-8': 0.88,
    '8-10': 1.0,
    '10-12': 1.12,
    '12-16': 1.22
  };

  function getCakeVisualAsset(config) {
    if (config.mousse === 'saffron-velvet' || config.finish === 'gold-accent') {
      return 'assets/cake-velvet.jpg';
    }
    if (config.fruit === 'yuzu') {
      return 'assets/cake-matcha.jpg';
    }
    if (config.base === 'almond') {
      return 'assets/cake-caramel.jpg';
    }
    if (config.fruit === 'strawberry' || config.mousse === 'raspberry-mousse') {
      return 'assets/cake-raspberry.jpg';
    }
    if (config.mousse === 'belgian-ganache' && config.fruit === 'none') {
      return 'assets/cake-truffle.jpg';
    }
    return 'assets/cake-exploded-hero.jpg';
  }

  function updateConfiguratorUI() {
    const configImg = document.getElementById('configuratorCakeImg');
    const totalPriceEl = document.getElementById('configuratorTotalPrice');
    const previewTitleEl = document.getElementById('configuratorPreviewTitle');
    const pedestalLabelEl = document.getElementById('configuratorPedestalLabel');

    if (!configImg) return;

    // 1. Calculate Price
    const sizeMod = SIZE_MODIFIERS[cakeConfig.size] || 0;
    const finishMod = FINISH_MODIFIERS[cakeConfig.finish] || 0;
    const totalPrice = BASE_PRICE + sizeMod + finishMod;

    if (totalPriceEl) totalPriceEl.textContent = totalPrice;

    // 2. Update Visual Image & Scale
    const newSrc = getCakeVisualAsset(cakeConfig);
    const scale = SIZE_SCALES[cakeConfig.size] || 1.0;

    if (configImg.getAttribute('src') !== newSrc) {
      configImg.style.opacity = '0.3';
      configImg.style.transform = `scale(${scale * 0.95})`;
      setTimeout(() => {
        configImg.src = newSrc;
        configImg.style.opacity = '1';
        configImg.style.transform = `scale(${scale})`;
      }, 140);
    } else {
      configImg.style.transform = `scale(${scale})`;
    }

    // 3. Update Labels
    const baseBtn = document.querySelector(`.config-btn[data-group="base"][data-value="${cakeConfig.base}"]`);
    const mousseBtn = document.querySelector(`.config-btn[data-group="mousse"][data-value="${cakeConfig.mousse}"]`);
    const fruitBtn = document.querySelector(`.config-btn[data-group="fruit"][data-value="${cakeConfig.fruit}"]`);
    const finishBtn = document.querySelector(`.config-btn[data-group="finish"][data-value="${cakeConfig.finish}"]`);
    const decBtn = document.querySelector(`.config-btn[data-group="decoration"][data-value="${cakeConfig.decoration}"]`);
    const sizeBtn = document.querySelector(`.config-btn[data-group="size"][data-value="${cakeConfig.size}"]`);

    const baseLabel = baseBtn?.dataset.label || 'Dark Cocoa';
    const mousseLabel = mousseBtn?.dataset.label || 'Belgian Ganache';
    const fruitLabel = fruitBtn?.dataset.label || 'Wild Raspberry';
    const finishLabel = finishBtn?.dataset.label || 'Dark Mirror Glaze';
    const decLabel = decBtn?.dataset.label || '24K Gold Leaf';
    const sizeLabel = sizeBtn?.dataset.label || '8–10 Guests';

    // Group selected indicators
    const elBase = document.getElementById('sel-base'); if (elBase) elBase.textContent = baseLabel;
    const elMousse = document.getElementById('sel-mousse'); if (elMousse) elMousse.textContent = mousseLabel;
    const elFruit = document.getElementById('sel-fruit'); if (elFruit) elFruit.textContent = fruitLabel;
    const elFinish = document.getElementById('sel-finish'); if (elFinish) elFinish.textContent = finishLabel;
    const elDec = document.getElementById('sel-decoration'); if (elDec) elDec.textContent = decLabel;
    const elSize = document.getElementById('sel-size'); if (elSize) elSize.textContent = sizeLabel;

    if (previewTitleEl) previewTitleEl.textContent = `${baseLabel} & ${fruitLabel !== 'No Fruit' ? fruitLabel : mousseLabel}`;
    if (pedestalLabelEl) pedestalLabelEl.textContent = `Atelier Ceramic Cake Stand — ${sizeLabel}`;

    // 4. Update Summary Grid Items
    const sumBase = document.getElementById('sum-base'); if (sumBase) sumBase.textContent = baseLabel;
    const sumMousse = document.getElementById('sum-mousse'); if (sumMousse) sumMousse.textContent = mousseLabel;
    const sumFruit = document.getElementById('sum-fruit'); if (sumFruit) sumFruit.textContent = fruitLabel;
    const sumFinish = document.getElementById('sum-finish'); if (sumFinish) sumFinish.textContent = finishLabel;
    const sumDec = document.getElementById('sum-decoration'); if (sumDec) sumDec.textContent = decLabel;
    const sumSize = document.getElementById('sum-size'); if (sumSize) sumSize.textContent = sizeLabel;
    const sumTotal = document.getElementById('sum-total'); if (sumTotal) sumTotal.textContent = `$${totalPrice}`;

    let profileText = 'Rich • Silky';
    if (cakeConfig.fruit === 'raspberry' || cakeConfig.fruit === 'yuzu') profileText = 'Rich • Tart • Silky';
    if (cakeConfig.mousse === 'saffron-velvet') profileText = 'Aromatic • Velvety';
    if (cakeConfig.base === 'almond') profileText = 'Nutty • Rich • Balanced';
    const sumProfile = document.getElementById('sum-profile'); if (sumProfile) sumProfile.textContent = profileText;
  }

  document.querySelectorAll('.config-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      const value = btn.dataset.value;
      if (!group || !value) return;

      cakeConfig[group] = value;

      document.querySelectorAll(`.config-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      updateConfiguratorUI();
    });
  });

  if (document.getElementById('configuratorCakeImg')) {
    updateConfiguratorUI();
  }
})();