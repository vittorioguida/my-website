document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

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

  // Publications configuration
  const config = { numberOfLatestPublications: 3 };

  // Create publication card element
  function createPublicationElement(pub, isDashboard = false) {
    const el = document.createElement('div');
    el.classList.add('publication-item');

    const img = pub.image || 'images/placeholder_cover.jpg';
    const journal = pub.journal && pub.year
      ? `<p class="pub-journal-info">${pub.journal} (${pub.year})</p>`
      : pub.journal ? `<p class="pub-journal-info">${pub.journal}</p>`
      : pub.year ? `<p class="pub-journal-info">(${pub.year})</p>` : '';

    const title = pub.type === 'Working Paper'
      ? `<h3>${pub.title}</h3>`
      : `<h3><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h3>`;

    const typeClass = pub.type
      ? pub.type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'unknown';

    el.innerHTML = `
      <div class="pub-header">
        <div class="pub-image-wrapper">
          <img src="${img}" alt="Cover of ${pub.title}">
        </div>
        <div class="pub-details">
          <span class="pub-type-label pub-type-${typeClass}">${pub.type}</span>
          ${title}
        </div>
      </div>
      <div class="pub-meta">
        <p class="pub-authors">${pub.authors}</p>
        ${journal}
      </div>
      ${!isDashboard ? `
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
  }

  // CV sections are static; no toggle behavior.
});
