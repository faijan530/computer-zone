const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  let scrollFrame = 0;

  function scheduleScrollWork() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateShowcase?.();
      updateTechIntro();
      updateDisplay?.();
      updatePower?.();
    });
  }

  /* Navbar scroll state */
  const navbar = document.getElementById('navbar');
  const scrollIndicator = document.getElementById('scrollIndicator');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    const fade = Math.max(0, 1 - window.scrollY / 200);
    scrollIndicator.style.opacity = fade;
    scrollIndicator.style.pointerEvents = fade <= 0.05 ? 'none' : 'auto';
  });

  /* Search toggle */
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  searchBtn.addEventListener('click', () => {
    searchInput.classList.toggle('open');
    if (searchInput.classList.contains('open')) searchInput.focus();
  });

  /* Mobile menu */
  const menuToggle = document.getElementById('menuToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobilePanel.classList.toggle('open');
  });
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    mobilePanel.classList.remove('open');
  }));

  /* Mouse parallax: laptop tilt + cursor glow + badge drift */
  const heroVisual = document.getElementById('heroVisual');
  const laptop = document.getElementById('laptop');
  const cursorGlow = document.getElementById('cursorGlow');
  const badges = document.querySelectorAll('.badge');
  let spinFrame;
  let isSpinning = false;

  laptop.addEventListener('click', () => {
    if (reduceMotion || isSpinning) return;
    isSpinning = true;
    cancelAnimationFrame(spinFrame);
    const start = performance.now();
    const duration = 1900;

    function rotate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      laptop.style.setProperty('--spin', (easedProgress * 720) + 'deg');
      if (progress < 1) {
        spinFrame = requestAnimationFrame(rotate);
      } else {
        laptop.style.setProperty('--spin', '0deg');
        isSpinning = false;
      }
    }

    spinFrame = requestAnimationFrame(rotate);
  });

  if (!isTouch && !reduceMotion) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      laptop.style.setProperty('--ry', (x * 16 + 10) + 'deg');
      laptop.style.setProperty('--rx', (-y * 12 - 6) + 'deg');

      cursorGlow.style.transform = `translate(${e.clientX - rect.left - 130}px, ${e.clientY - rect.top - 130}px)`;

      badges.forEach((b, i) => {
        const factor = 10 + i * 6;
        b.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
    heroVisual.addEventListener('mouseleave', () => {
      laptop.style.setProperty('--ry', '10deg');
      laptop.style.setProperty('--rx', '-8deg');
      cursorGlow.style.transform = 'translate(-1000px,-1000px)';
      badges.forEach(b => b.style.transform = 'translate(0,0)');
    });
  }

  /* Ambient particle field */
  const canvas = document.getElementById('particles');
  if (canvas && !reduceMotion && window.innerWidth > 640) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    let isActive = true;
    let isRunning = false;

    function resize() {
      w = canvas.width = heroVisual.clientWidth;
      h = canvas.height = heroVisual.clientHeight;
    }
    function init() {
      particles = Array.from({ length: 34 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15
      }));
    }
    function tick() {
      if (!isActive || document.hidden) {
        isRunning = false;
        return;
      }
      isRunning = true;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,170,255,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    const particleIO = new IntersectionObserver(([entry]) => {
      isActive = entry.isIntersecting;
      if (isActive && !isRunning) requestAnimationFrame(tick);
    }, { rootMargin: '200px' });
    particleIO.observe(heroVisual);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isActive && !isRunning) requestAnimationFrame(tick);
    });
    resize(); init(); tick();
    window.addEventListener('resize', () => { resize(); init(); });
  }

  /* Scroll-triggered brand intro reveal + count-up */
  const statement = document.getElementById('brandStatement');
  const stats = document.querySelectorAll('.stat');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      if (entry.target.classList.contains('stat')) {
        animateCount(entry.target);
      }
      io.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  io.observe(statement);
  stats.forEach(s => io.observe(s));

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const numEl = el.querySelector('.num');
    const isDecimal = target % 1 !== 0;
    const duration = 1100;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      numEl.textContent = isDecimal ? val.toFixed(1) : Math.round(val);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ==========================================================
     MODULE 2 JS
  ========================================================== */

  /* Generic scroll-reveal for section heads / cards / features */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('in-view'), i * 60);
      revealIO.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealIO.observe(el));

  /* Featured Laptops: drag-to-scroll + arrow controls */
  const track = document.getElementById('carouselTrack');
  const carPrev = document.getElementById('carPrev');
  const carNext = document.getElementById('carNext');
  if (track) {
    let isDown = false, startX, scrollLeft;
    track.addEventListener('pointerdown', (e) => {
      isDown = true; track.classList.add('dragging');
      startX = e.pageX; scrollLeft = track.scrollLeft;
    });
    ['pointerup', 'pointerleave'].forEach(evt =>
      track.addEventListener(evt, () => { isDown = false; track.classList.remove('dragging'); })
    );
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      track.scrollLeft = scrollLeft - (e.pageX - startX);
    });
    const cardWidth = 342;
    carNext?.addEventListener('click', () => track.scrollBy({ left: cardWidth, behavior: 'smooth' }));
    carPrev?.addEventListener('click', () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  }

  /* 3D tilt on product cards + category cards, with cursor glow position */
  function attachTilt(el, strength = 8) {
    const inner = el.querySelector('.card-inner') || el;
    el.addEventListener('mousemove', (e) => {
      if (isTouch || reduceMotion) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * strength;
      const ry = (px - 0.5) * strength;
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
      el.style.setProperty('--fx', `${px * 100}%`);
      el.style.setProperty('--fy', `${py * 100}%`);
    });
    el.addEventListener('mouseleave', () => { inner.style.transform = ''; });
  }
  document.querySelectorAll('[data-tilt]').forEach(el => attachTilt(el, 6));
  document.querySelectorAll('[data-tilt-cat]').forEach(el => attachTilt(el, 4));
  document.querySelectorAll('[data-glow]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--fx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--fy', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    });
  });

  /* Performance counters */
  const perfItems = document.querySelectorAll('.perf-item');
  const perfIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      animateCount(entry.target);
      perfIO.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  perfItems.forEach(el => perfIO.observe(el));

  /* Interactive Laptop Showcase — scroll-driven timeline */
  const showcaseSection = document.getElementById('showcaseSection');
  const showcaseLaptop = document.getElementById('showcaseLaptop');
  const progressBars = document.querySelectorAll('.showcase-progress span');

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function updateShowcase() {
    const rect = showcaseSection.getBoundingClientRect();
    const total = showcaseSection.offsetHeight - window.innerHeight;
    const progress = clamp01(-rect.top / total);

    // Stage 1 (0 - 0.28): laptop appears + rotates in
    // Stage 2 (0.28 - 0.55): screen activates, specs begin appearing
    // Stage 3 (0.55 - 0.8): camera zoom in
    // Stage 4 (0.8 - 1): settle, full feature highlight
    const s1 = clamp01(progress / 0.28);
    const s2 = clamp01((progress - 0.28) / 0.27);
    const s3 = clamp01((progress - 0.55) / 0.25);
    const s4 = clamp01((progress - 0.8) / 0.2);

    const opacity = s1;
    const rotY = lerp(-35, 0, s1) + lerp(0, 8, s3) * (1 - s4);
    const rotX = lerp(4, -2, s1);
    const scale = lerp(0.7, 1, s1) * lerp(1, 1.18, s3) * lerp(1, 1.05, s4);

    showcaseLaptop.style.setProperty('--sc-opacity', opacity);
    showcaseLaptop.style.setProperty('--sc-roty', rotY + 'deg');
    showcaseLaptop.style.setProperty('--sc-rotx', rotX + 'deg');
    showcaseLaptop.style.setProperty('--sc-scale', scale);
    showcaseLaptop.style.setProperty('--sc-screen-on', s2);
    showcaseLaptop.style.setProperty('--sc-specs', Math.max(s3, s4));

    document.querySelector('.showcase-heading').style.setProperty('--show-heading', progress > 0.92 ? 0 : 1);

    progressBars[0]?.style.setProperty('--p1', s1);
    progressBars[1]?.style.setProperty('--p2', s2);
    progressBars[2]?.style.setProperty('--p3', Math.max(s3, s4));
  }

  if (showcaseSection) {
    if (reduceMotion) {
      showcaseLaptop.style.setProperty('--sc-opacity', 1);
      showcaseLaptop.style.setProperty('--sc-roty', '0deg');
      showcaseLaptop.style.setProperty('--sc-scale', 1);
      showcaseLaptop.style.setProperty('--sc-screen-on', 1);
      showcaseLaptop.style.setProperty('--sc-specs', 1);
    } else {
      window.addEventListener('scroll', scheduleScrollWork, { passive: true });
      window.addEventListener('resize', updateShowcase);
      updateShowcase();
    }
  }

  /* ==========================================================
     MODULE 3 JS
  ========================================================== */

  /* Final CTA: reveal eyebrow/heading/buttons together when in view */
  const ctaSection = document.getElementById('ctaSection');
  if (ctaSection) {
    const ctaIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        ctaIO.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    ctaIO.observe(ctaSection);
  }

  /* Final CTA ambient particles (same technique as hero) */
  const ctaCanvas = document.getElementById('ctaParticles');
  if (ctaCanvas && !reduceMotion && window.innerWidth > 640) {
    const ctx2 = ctaCanvas.getContext('2d');
    let cw, ch, cparticles;
    let isActive = false;
    let isRunning = false;

    function ctaResize() {
      cw = ctaCanvas.width = ctaSection.clientWidth;
      ch = ctaCanvas.height = ctaSection.clientHeight;
    }
    function ctaInit() {
      cparticles = Array.from({ length: 46 }, () => ({
        x: Math.random() * cw,
        y: Math.random() * ch,
        r: Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        a: Math.random() * 0.45 + 0.1
      }));
    }
    function ctaTick() {
      if (!isActive || document.hidden) {
        isRunning = false;
        return;
      }
      isRunning = true;
      ctx2.clearRect(0, 0, cw, ch);
      cparticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = cw; if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch; if (p.y > ch) p.y = 0;
        ctx2.beginPath();
        ctx2.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx2.fillStyle = `rgba(140,170,255,${p.a})`;
        ctx2.fill();
      });
      requestAnimationFrame(ctaTick);
    }
    const ctaParticleIO = new IntersectionObserver(([entry]) => {
      isActive = entry.isIntersecting;
      if (isActive && !isRunning) requestAnimationFrame(ctaTick);
    }, { rootMargin: '200px' });
    ctaParticleIO.observe(ctaSection);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isActive && !isRunning) requestAnimationFrame(ctaTick);
    });
    ctaResize(); ctaInit();
    window.addEventListener('resize', () => { ctaResize(); ctaInit(); });
  }

  /* ==========================================================
     MODULE 4 JS
  ========================================================== */

  /* 4.3 Performance intro: laptop scale + slow bg parallax on scroll */
  const techIntro = document.getElementById('techIntro');
  const techIntroLaptopEl = techIntro?.querySelector('.laptop');
  const techGridBg = techIntro?.querySelector('.tech-grid-bg');

  function updateTechIntro() {
    if (!techIntro || !techIntroLaptopEl) return;
    const rect = techIntro.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp01((vh - rect.top) / (vh * 0.9));
    techIntroLaptopEl.style.setProperty('--tl-scale', lerp(0.8, 1, p));
    if (techGridBg && !reduceMotion) techGridBg.style.transform = `translateY(${rect.top * 0.05}px)`;
  }
  window.addEventListener('scroll', scheduleScrollWork, { passive: true });
  updateTechIntro();

  /* 4.3 ambient particles behind the intro */
  const techCanvas = document.getElementById('techParticles');
  if (techCanvas && !reduceMotion && window.innerWidth > 640) {
    const tctx = techCanvas.getContext('2d');
    let tw, th, tparticles;
    let isActive = false;
    let isRunning = false;
    function tResize() { tw = techCanvas.width = techIntro.clientWidth; th = techCanvas.height = techIntro.clientHeight; }
    function tInit() {
      tparticles = Array.from({ length: 40 }, () => ({
        x: Math.random() * tw, y: Math.random() * th,
        r: Math.random() * 1.3 + 0.4,
        vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1,
        a: Math.random() * 0.4 + 0.1
      }));
    }
    function tTick() {
      if (!isActive || document.hidden) {
        isRunning = false;
        return;
      }
      isRunning = true;
      tctx.clearRect(0, 0, tw, th);
      tparticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = tw; if (p.x > tw) p.x = 0;
        if (p.y < 0) p.y = th; if (p.y > th) p.y = 0;
        tctx.beginPath(); tctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        tctx.fillStyle = `rgba(140,170,255,${p.a})`; tctx.fill();
      });
      requestAnimationFrame(tTick);
    }
    const techParticleIO = new IntersectionObserver(([entry]) => {
      isActive = entry.isIntersecting;
      if (isActive && !isRunning) requestAnimationFrame(tTick);
    }, { rootMargin: '200px' });
    techParticleIO.observe(techIntro);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isActive && !isRunning) requestAnimationFrame(tTick);
    });
    tResize(); tInit();
    window.addEventListener('resize', () => { tResize(); tInit(); });
  }

  /* 4.4 Metric cards: counter + reveal on view */
  const metricCards = document.querySelectorAll('.metric-card');
  const metricIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      animateCount(entry.target);
      metricIO.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  metricCards.forEach(el => metricIO.observe(el));

  /* 4.7 Cooling visual: reveal (closed → open) on view */
  const coolingVisual = document.querySelector('[data-reveal-tilt]');
  if (coolingVisual) {
    const coolIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        coolIO.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    coolIO.observe(coolingVisual);
  }

  /* 4.6 Display Technology: scroll-driven zoom + brightness + specs, cursor parallax */
  const displaySection = document.getElementById('displaySection');
  const displayFrame = document.getElementById('displayFrame');
  const displayHeading = document.getElementById('displayHeading');
  const displaySpecs = document.getElementById('displaySpecs');
  const displayProduct = document.getElementById('displayProduct');
  let displayIsSpinning = false;

  function updateDisplay() {
    const rect = displaySection.getBoundingClientRect();
    const total = displaySection.offsetHeight - window.innerHeight;
    const progress = clamp01(-rect.top / total);
    const zoomP = clamp01(progress / 0.6);
    const specP = clamp01((progress - 0.55) / 0.35);

    displayFrame.style.setProperty('--df-scale', lerp(0.72, 1.3, zoomP));
    displayFrame.style.setProperty('--df-brightness', lerp(0.5, 1.1, zoomP));
    displaySpecs.style.setProperty('--ds-opacity', specP);
    displayHeading.style.setProperty('--dh-opacity', 1 - zoomP * 0.85);
  }

  if (displaySection) {
    if (reduceMotion) {
      displayFrame.style.setProperty('--df-scale', 1.15);
      displayFrame.style.setProperty('--df-brightness', 1.05);
      displaySpecs.style.setProperty('--ds-opacity', 1);
    } else {
      window.addEventListener('scroll', scheduleScrollWork, { passive: true });
      window.addEventListener('resize', updateDisplay);
      updateDisplay();

      displayFrame.addEventListener('mousemove', (e) => {
        if (isTouch) return;
        const r = displayFrame.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        displayProduct.style.transform = `translate(${x * 16}px, ${y * 16}px) rotateX(${4 - y * 5}deg) rotateY(${-8 + x * 10}deg)`;
      });
      displayFrame.addEventListener('mouseleave', () => { displayProduct.style.transform = ''; });
    }

    displayProduct.addEventListener('click', () => {
      if (reduceMotion || displayIsSpinning) return;
      displayIsSpinning = true;
      displayProduct.classList.add('is-spinning');
    });
    displayProduct.addEventListener('animationend', (event) => {
      if (event.animationName !== 'displayLaptopSpin') return;
      displayProduct.classList.remove('is-spinning');
      displayProduct.style.transform = '';
      displayIsSpinning = false;
    });
  }

  /* 4.9 Interactive Laptop Showcase: sticky laptop opens, steps highlight */
  const powerShowcase = document.getElementById('powerShowcase');
  const powerLaptop = document.getElementById('powerLaptop');
  const powerSteps = document.querySelectorAll('.power-step');
  const powerBreakpoints = [0.20, 0.38, 0.56, 0.74, 1.0];

  function updatePower() {
    const rect = powerShowcase.getBoundingClientRect();
    const total = powerShowcase.offsetHeight - window.innerHeight;
    const progress = clamp01(-rect.top / total);
    const openP = clamp01(progress / 0.2);

    powerLaptop.style.setProperty('--pw-lid', lerp(78, 0, openP) + 'deg');
    powerLaptop.style.setProperty('--pw-screen', openP > 0.6 ? 1 : openP / 0.6);
    powerLaptop.style.setProperty('--pw-roty', lerp(-18, -4, openP) + 'deg');

    let idx = powerBreakpoints.findIndex(bp => progress < bp);
    if (idx === -1) idx = powerBreakpoints.length - 1;
    powerSteps.forEach((el, i) => el.classList.toggle('active', i === idx));
  }

  if (powerShowcase) {
    if (reduceMotion) {
      powerLaptop.style.setProperty('--pw-lid', '0deg');
      powerLaptop.style.setProperty('--pw-screen', 1);
      powerSteps[0]?.classList.add('active');
    } else {
      window.addEventListener('scroll', scheduleScrollWork, { passive: true });
      window.addEventListener('resize', updatePower);
      updatePower();
    }
  }
