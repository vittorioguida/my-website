document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  function setTheme(theme) {
    const isLight = theme === 'light';
    body.classList.toggle('light-theme', isLight);
    themeToggle.innerHTML = isLight
      ? '<span class="theme-dot theme-dot--dark"></span>Dark'
      : '<span class="theme-dot theme-dot--light"></span>Light';
    themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
    localStorage.setItem('theme', theme);
  }

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  // Theme toggle handler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(body.classList.contains('light-theme') ? 'dark' : 'light');
    });
  }

  // Publications configuration
  const config = { numberOfLatestPublications: 3 };

  function setAbstractState(item, open) {
    const abstract = item.querySelector('.pub-abstract-content');
    const toggle = item.querySelector('.pub-abstract-toggle');
    if (!abstract || !toggle) return;
    abstract.classList.toggle('is-open', open);
    abstract.classList.toggle('is-collapsed', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Hide abstract' : 'Read abstract';
    item.classList.toggle('is-highlighted', open);
  }

  function closeAllAbstracts(except = null) {
    document.querySelectorAll('.publication-item').forEach((item) => {
      if (item === except) return;
      setAbstractState(item, false);
    });
  }

  // Create publication card element
  function createPublicationElement(pub, isDashboard = false) {
    const el = document.createElement('div');
    el.classList.add('publication-item');
    if (pub.id) {
      el.id = pub.id;
    }
    if (!isDashboard) {
      el.classList.add('publication-item--full');
    }

    if (pub.type === 'Work in Progress') {
      const wipAuthors = pub.authors ? `<p class="pub-authors">${pub.authors}</p>` : '';
      el.classList.add('publication-item--simple');
      el.innerHTML = `
        <div class="pub-details">
          <h3>${pub.title}</h3>
          ${wipAuthors}
        </div>
      `;
      return el;
    }

    let imageBlock;
    if (pub.type === 'Working Paper') {
      // Typographic mini title page â€” keeps the row visually uniform
      // regardless of whether a figure/plot exists for the paper.
      const coverYear = pub.year ? `<span class="pub-cover-year">${pub.year}</span>` : '';
      imageBlock = `
        <div class="pub-image-wrapper pub-cover-card" aria-hidden="true">
          <span class="pub-cover-type">Working Paper</span>
          <span class="pub-cover-title">${pub.title}</span>
          ${coverYear}
        </div>`;
    } else if (pub.image) {
      imageBlock = `<div class="pub-image-wrapper"><img src="${pub.image}" alt="Cover of ${pub.title}"></div>`;
    } else {
      imageBlock = '<div class="pub-image-wrapper pub-image-wrapper--empty" aria-hidden="true"></div>';
    }
    const journal = pub.journal && pub.year
      ? `<p class="pub-journal-info">${pub.journal} (${pub.year})</p>`
      : pub.journal ? `<p class="pub-journal-info">${pub.journal}</p>`
      : pub.year ? `<p class="pub-journal-info">(${pub.year})</p>` : '';

    const title = pub.type === 'Working Paper' || !pub.link
      ? `<h3>${pub.title}</h3>`
      : `<h3><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h3>`;

    const typeClass = pub.type
      ? pub.type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'unknown';
    const typeLabel = pub.type
      ? `<span class="pub-type-label pub-type-${typeClass}">${pub.type}</span>`
      : '';
    const metaBlock = `
      <div class="pub-meta">
        <p class="pub-authors">${pub.authors}</p>
        ${journal}
      </div>
    `;

    el.innerHTML = `
      <div class="pub-header">
        ${imageBlock}
        <div class="pub-details">
          ${typeLabel}
          ${title}
          ${metaBlock}
        </div>
      </div>
      ${!isDashboard && pub.abstract ? `
        <div class="pub-actions">
          <button class="pub-abstract-toggle" type="button" aria-expanded="false">Read abstract</button>
        </div>
        <div class="pub-abstract-content show-abstract">
          <div class="pub-abstract-title">Abstract</div>
          <p class="pub-abstract">${pub.abstract}</p>
        </div>
      ` : ''}
    `;

    const titleEl = el.querySelector('h3');
    if (titleEl && titleEl.textContent.trim().length > 90) {
      titleEl.classList.add('title-tight');
    }

    if (!isDashboard) {
      const toggle = el.querySelector('.pub-abstract-toggle');
      const abstract = el.querySelector('.pub-abstract-content');
      if (toggle && abstract) {
        abstract.classList.add('is-collapsed');
        toggle.addEventListener('click', () => {
          const isOpen = abstract.classList.contains('is-open');
          if (isOpen) {
            setAbstractState(el, false);
          } else {
            closeAllAbstracts(el);
            setAbstractState(el, true);
          }
        });
      }
    }
    return el;
  }

  // Horizontal carousels on the research page. Uses native scroll +
  // scroll-snap; arrows page by one viewport width.
  function initResearchCarousel(section) {
    const track = section.querySelector('.research-carousel-track');
    const nav = section.querySelector('.research-carousel-nav');
    if (!track || !nav || !track.children.length) return;

    const prevBtn = nav.querySelector('.research-carousel-arrow--prev');
    const nextBtn = nav.querySelector('.research-carousel-arrow--next');
    const counter = nav.querySelector('.research-carousel-counter');

    function trackGap() {
      return parseFloat(getComputedStyle(track).columnGap) || 0;
    }

    function pageWidth() {
      return track.clientWidth + trackGap();
    }

    function pageCount() {
      return Math.max(1, Math.round((track.scrollWidth + trackGap()) / pageWidth()));
    }

    function currentPage() {
      return Math.min(pageCount() - 1, Math.round(track.scrollLeft / pageWidth()));
    }

    function update() {
      const pages = pageCount();
      nav.hidden = pages <= 1;
      if (pages <= 1) return;
      const page = currentPage();
      if (counter) counter.textContent = `${page + 1} / ${pages}`;
      if (prevBtn) prevBtn.disabled = page === 0;
      if (nextBtn) nextBtn.disabled = page >= pages - 1;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function goTo(page) {
      closeAllAbstracts();
      track.scrollTo({ left: page * pageWidth(), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentPage() - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentPage() + 1));

    let scrollTick = null;
    track.addEventListener('scroll', () => {
      if (scrollTick) return;
      scrollTick = requestAnimationFrame(() => {
        scrollTick = null;
        update();
      });
    });
    window.addEventListener('resize', update);
    update();
  }

  // Render publications
  const containers = {
    journal: document.getElementById('journal-articles-container'),
    working: document.getElementById('working-papers-container'),
    progress: document.getElementById('work-in-progress-container'),
    dashboard: document.getElementById('latest-publications-dashboard')
  };

  if (typeof publications !== 'undefined') {
    // Sort by year (desc) then id
    const sorted = [...publications].sort((a, b) => {
      const yearDiff = (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
      return yearDiff !== 0 ? yearDiff : String(b.id || '').localeCompare(String(a.id || ''));
    });

    // Render journal articles
    if (containers.journal) {
      sorted.filter(p => p.type === 'Journal Article')
        .forEach(p => containers.journal.appendChild(createPublicationElement(p)));
    }

    // Render working papers
    if (containers.working) {
      sorted.filter(p => p.type === 'Working Paper')
        .forEach(p => containers.working.appendChild(createPublicationElement(p)));
    }

    if (containers.progress) {
      publications.filter(p => p.type === 'Work in Progress')
        .forEach(p => containers.progress.appendChild(createPublicationElement(p)));
    }

    // Render homepage dashboard â€” published journal articles only, no abstract/PDF.
    if (containers.dashboard) {
      sorted.filter(p => p.type === 'Journal Article')
        .slice(0, config.numberOfLatestPublications)
        .forEach(p => containers.dashboard.appendChild(createPublicationElement(p, true)));
    }

    document.querySelectorAll('.research-section').forEach(initResearchCarousel);

    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target && target.classList.contains('publication-item')) {
        closeAllAbstracts(target);
        setAbstractState(target, true);
        const track = target.closest('.research-carousel-track');
        if (track) track.scrollLeft = target.offsetLeft - track.offsetLeft;
      }
    }
  }

  // CV sections are static; no toggle behavior.

  const yearNodes = document.querySelectorAll('#current-year');
  const year = new Date().getFullYear();
  yearNodes.forEach((node) => {
    node.textContent = String(year);
  });

  // Scroll-position hairline under the header. Written as a custom property
  // so the CSS stays declarative; rAF-throttled to one write per frame.
  const scroller = document.scrollingElement || document.documentElement;
  let scrollQueued = false;

  function writeScrollProgress() {
    scrollQueued = false;
    const travel = scroller.scrollHeight - scroller.clientHeight;
    const progress = travel > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / travel)) : 0;
    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
  }

  function queueScrollProgress() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(writeScrollProgress);
  }

  writeScrollProgress();
  window.addEventListener('scroll', queueScrollProgress, { passive: true });
  window.addEventListener('resize', queueScrollProgress);

  // Animated background: softly undulating grid plus fading clusters of numbers.
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-grid';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LINE_FADE = 0.5; // grid line opacity
  const FADE = 0.9; // shared opacity for lines, numbers, and dots
  let w = 0, h = 0, step = 26, minor = '', major = '', textInk = '', last = 0, lastColor = -1e9;
  let clusters = [], nextSpawn = 0;
  let interval = 1000 / 30, cost = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    // Use the canvas's own box so the drawing matches CSS size when mobile URL bars resize the viewport.
    const nw = canvas.clientWidth || window.innerWidth;
    const nh = canvas.clientHeight || window.innerHeight;
    if (nw === w && nh === h && canvas.width === Math.round(nw * dpr)) return;
    w = nw; h = nh;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Re-read theme colours periodically so the light/dark toggle is followed.
  function readColors(t) {
    if (t - lastColor < 400) return;
    lastColor = t;
    const cs = getComputedStyle(document.body);
    minor = cs.getPropertyValue('--grid-ink').trim();
    major = cs.getPropertyValue('--grid-major').trim();
    textInk = cs.getPropertyValue('--grid-text').trim() || major;
    step = parseFloat(cs.getPropertyValue('--grid-step')) || 26;
  }

  function drawLines(t = 0) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = major;
    const cx = Math.round(w / 2 / step) * step;
    const n = Math.ceil(w / step) + 2;
    // Opacity by line index: every 8th strongest, every 4th, every 2nd, then the rest.
    const tierOf = (i) => {
      const m = ((i % 8) + 8) % 8;
      return m === 0 ? 0 : m === 4 ? 1 : m % 2 === 0 ? 2 : 3;
    };
    const tierAlpha = [1, 0.75, 0.5, 0.3];
    for (let pass = 0; pass < 4; pass++) {
      ctx.globalAlpha = LINE_FADE * tierAlpha[pass];
      ctx.beginPath();
      for (let i = -n; i <= n; i++) {
        if (tierOf(i) !== pass) continue;
        const x = cx + i * step;
        if (x < -20 || x > w + 20) continue;
        const sx = x + 0.5;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, h);
      }
      for (let k = 0; k * step <= h + step; k++) {
        if (tierOf(k) !== pass) continue;
        const py = k * step + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
      }
      ctx.stroke();
    }
  }

  function spawn(t) {
    const rows = 2 + Math.floor(Math.random() * 4);
    const cols = 2 + Math.floor(Math.random() * (w < 600 ? 2 : 4));
    const hex = Math.random() < 0.4;
    const lines = [];
    for (let r = 0; r < rows; r++) {
      const cells = [];
      for (let c = 0; c < cols; c++) {
        cells.push(hex
          ? Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
          : (Math.random() * 1000).toFixed(Math.random() < 0.5 ? 0 : 2));
      }
      lines.push(cells.join('  '));
    }
    const size = 10 + Math.random() * 2;
    const textW = lines[0].length * size * 0.62;
    clusters.push({
      x: 8 + Math.random() * Math.max(1, w - textW - 16), y: 30 + Math.random() * Math.max(1, h - 80),
      born: t, life: 3000 + Math.random() * 2500, lines, size,
    });
  }

  function drawClusters(t) {
    ctx.fillStyle = textInk;
    ctx.textBaseline = 'top';
    clusters = clusters.filter((c) => t - c.born < c.life);
    for (const c of clusters) {
      const p = (t - c.born) / c.life;
      ctx.globalAlpha = FADE * Math.sin(Math.PI * p);
      ctx.font = `${c.size}px ui-monospace, Menlo, Consolas, monospace`;
      // Rows reveal progressively, like a readout filling in.
      const shown = Math.max(1, Math.ceil(Math.min(1, p * 3) * c.lines.length));
      for (let i = 0; i < shown; i++) ctx.fillText(c.lines[i], c.x, c.y + i * (c.size + 4));
    }
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = t; return; }
    // Fixed cadence independent of display refresh rate (60/120/144 Hz all give ~30 fps).
    const elapsed = t - last;
    if (elapsed < interval - 2) return;
    last = t - (elapsed % interval);
    const t0 = performance.now();
    readColors(t);
    ctx.clearRect(0, 0, w, h);
    drawLines(t);
    if (t > nextSpawn && clusters.length < (w < 600 ? 2 : 5)) {
      spawn(t);
      nextSpawn = t + 600 + Math.random() * 1800;
    }
    drawClusters(t);
    // Adaptive quality: if frames are costly (weak device), drop to a lower frame rate.
    cost = cost * 0.9 + (performance.now() - t0) * 0.1;
    if (cost > 12 && interval < 66) { interval = 66; cost = 0; }
  }

  resize();
  window.addEventListener('resize', () => { resize(); if (reduce) drawLines(); });
  readColors(0);
  if (reduce) drawLines(); else requestAnimationFrame(frame);
});
