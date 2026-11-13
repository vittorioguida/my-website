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

  function createResearchItem(pub, published = false, includeYear = false) {
    const item = document.createElement('li');
    if (pub.id) item.id = pub.id;

    const title = pub.title.trim();
    if (published && pub.link) {
      const link = document.createElement('a');
      link.href = pub.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = title;
      if (pub.journal) {
        const journal = document.createElement('em');
        journal.className = 'research-journal';
        journal.textContent = pub.journal;
        link.append(', ', journal);
      }
      item.appendChild(link);
    } else {
      item.appendChild(document.createTextNode(title));
      if (published && pub.journal) {
        const journal = document.createElement('em');
        journal.className = 'research-journal';
        journal.textContent = pub.journal;
        item.append(', ', journal);
      }
    }

    if (pub.authors || (includeYear && pub.year)) {
      const authors = document.createElement('p');
      authors.className = 'research-authors';
      authors.textContent = [pub.authors, includeYear && pub.year ? `(${pub.year})` : ''].filter(Boolean).join(' ');
      item.appendChild(authors);
    }
    return item;
  }

  function renderPublishedByYear(container, items) {
    let currentYear;
    let yearList;
    items.forEach(p => {
      const year = p.year ? String(p.year) : 'Undated';
      if (year !== currentYear) {
        currentYear = year;
        const heading = document.createElement('h3');
        heading.className = 'research-year';
        heading.textContent = year;
        yearList = document.createElement('ul');
        yearList.className = 'research-list';
        container.append(heading, yearList);
      }
      yearList.appendChild(createResearchItem(p, true));
    });
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

    const published = sorted.filter(p => p.type === 'Journal Article');
    if (containers.journal) {
      renderPublishedByYear(containers.journal, published);
    }

    if (containers.working) {
      sorted.filter(p => p.type === 'Working Paper')
        .forEach(p => containers.working.appendChild(createResearchItem(p)));
    }

    if (containers.progress) {
      publications.filter(p => p.type === 'Work in Progress')
        .forEach(p => containers.progress.appendChild(createResearchItem(p)));
    }

    if (containers.dashboard) {
      const list = document.createElement('ul');
      list.className = 'research-list';
      published.slice(0, config.numberOfLatestPublications)
        .forEach(p => list.appendChild(createResearchItem(p, true, true)));
      containers.dashboard.appendChild(list);
    }

    if (containers.journal && window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView();
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
