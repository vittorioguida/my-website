document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  const dropdownItem = document.querySelector('.nav-dropdown');

  function setTheme(theme) {
    const isLight = theme === 'light';
    body.classList.toggle('light-theme', isLight);
    themeToggle.innerHTML = `<span class="icon">${isLight ? '☀️' : '🌙'}</span>`;
    themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
    localStorage.setItem('theme', theme);
  }

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark');
  setTheme(savedTheme);

  // Theme toggle handler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(body.classList.contains('light-theme') ? 'dark' : 'light');
    });
  }

  // Research dropdown menu handler
  if (dropdownToggle && dropdownItem) {
    dropdownToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = dropdownItem.classList.toggle('is-open');
      dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!dropdownItem.contains(event.target)) {
        dropdownItem.classList.remove('is-open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
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

    const img = pub.image || 'images/placeholder_cover.jpg';
    const journal = pub.journal && pub.year
      ? `<p class="pub-journal-info">${pub.journal} (${pub.year})</p>`
      : pub.journal ? `<p class="pub-journal-info">${pub.journal}</p>`
      : pub.year ? `<p class="pub-journal-info">(${pub.year})</p>` : '';

    const status = !isDashboard && pub.type ? `<p class="pub-status">${pub.type}</p>` : '';
    const title = pub.type === 'Working Paper'
      ? `<h3>${pub.title}</h3>`
      : `<h3><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h3>`;

    const typeClass = pub.type
      ? pub.type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'unknown';
    const typeLabel = isDashboard && pub.type
      ? `<span class="pub-type-label pub-type-${typeClass}">${pub.type}</span>`
      : '';

    el.innerHTML = `
      <div class="pub-header">
        <div class="pub-image-wrapper">
          <img src="${img}" alt="Cover of ${pub.title}">
        </div>
        <div class="pub-details">
          ${typeLabel}
          ${status}
          ${title}
        </div>
      </div>
      <div class="pub-meta">
        <p class="pub-authors">${pub.authors}</p>
        ${journal}
      </div>
      ${!isDashboard ? `
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

  // Render publications
  const containers = {
    journal: document.getElementById('journal-articles-container'),
    working: document.getElementById('working-papers-container'),
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

    // Render homepage dashboard
    if (containers.dashboard) {
      sorted.filter(p => p.type !== 'Working Paper')
        .slice(0, config.numberOfLatestPublications)
        .forEach(p => containers.dashboard.appendChild(createPublicationElement(p, true)));
    }

    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target && target.classList.contains('publication-item')) {
        closeAllAbstracts(target);
        setAbstractState(target, true);
      }
    }
  }

  // CV sections are static; no toggle behavior.

  const yearNodes = document.querySelectorAll('#current-year');
  const year = new Date().getFullYear();
  yearNodes.forEach((node) => {
    node.textContent = String(year);
  });
});
