document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  function setTheme(theme) {
    if (theme === 'light') {
      body.classList.add('light-theme');
      themeToggle.innerHTML = '<span class="icon">☀️</span>';
      themeToggle.setAttribute('aria-label', 'Switch to dark theme');
    } else {
      body.classList.remove('light-theme');
      themeToggle.innerHTML = '<span class="icon">🌙</span>';
      themeToggle.setAttribute('aria-label', 'Switch to light theme');
    }
    localStorage.setItem('theme', theme);
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  } else {
    setTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (body.classList.contains('light-theme')) setTheme('dark');
      else setTheme('light');
    });
  }

  // --- Config ---
  const config = {
    numberOfLatestPublications: 3
  };

  // --- Component ---
  function createPublicationElement(pub, isDashboard = false) {
    const el = document.createElement('div');
    el.classList.add('publication-item');

    const img = pub.image ? pub.image : 'images/placeholder_cover.jpg';
    const journal = pub.journal && pub.year
      ? `<p class="pub-journal-info">${pub.journal} <span>(${pub.year})</span></p>`
      : (pub.journal ? `<p class="pub-journal-info">${pub.journal}</p>`
      : (pub.year ? `<p class="pub-journal-info"><span>(${pub.year})</span></p>` : ''));

    const title = (pub.type === 'Working Paper')
      ? `<h3>${pub.title}</h3>`
      : `<h3><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h3>`;

    // Order: Image → (Button + Abstract if not dashboard) → Details
    el.innerHTML = `
      <div class="pub-image-wrapper">
        <img src="${img}" alt="Cover of ${pub.title}">
      </div>

      ${!isDashboard ? `
        <button class="toggle-abstract-btn">Show Abstract</button>
        <div class="pub-abstract-content">
          <p class="pub-abstract">${pub.abstract}</p>
        </div>
      ` : ''}

      <div class="pub-details">
        <span class="pub-type-label">${pub.type}</span>
        ${title}
        <p class="pub-authors">${pub.authors}</p>
        ${journal}
      </div>
    `;

    if (!isDashboard) {
      const btn = el.querySelector('.toggle-abstract-btn');
      const box = el.querySelector('.pub-abstract-content');
      if (btn && box) {
      // Toggle fixed-height box via CSS class only
      btn.addEventListener('click', () => {
        const isOpen = box.classList.toggle('show-abstract');
        btn.textContent = isOpen ? 'Hide Abstract' : 'Show Abstract';
        // clean any old inline styles from earlier approach
        box.style.maxHeight = '';
        });
      }
    }
    return el;
  }

  // --- Data rendering ---
  const journalArticlesContainer = document.getElementById('journal-articles-container');
  const workingPapersContainer = document.getElementById('working-papers-container');
  const latestPublicationsDashboard = document.getElementById('latest-publications-dashboard');

  if (typeof publications !== 'undefined') {
    // Sort: year desc, then id (stable)
    const sorted = [...publications].sort((a, b) => {
      const ay = parseInt(a.year, 10) || 0;
      const by = parseInt(b.year, 10) || 0;
      if (by !== ay) return by - ay;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

    // Publications page
    if (journalArticlesContainer) {
      const journal = sorted.filter(p => p.type === 'Journal Article');
      journal.forEach(p => journalArticlesContainer.appendChild(createPublicationElement(p, false)));
    }
    if (workingPapersContainer) {
      const working = sorted.filter(p => p.type === 'Working Paper');
      working.forEach(p => workingPapersContainer.appendChild(createPublicationElement(p, false)));
    }

    // Homepage dashboard (latest N)
    if (latestPublicationsDashboard) {
      const latest = sorted.slice(0, config.numberOfLatestPublications);
      latest.forEach(p => latestPublicationsDashboard.appendChild(createPublicationElement(p, true)));
    }
  } else {
    console.warn('Publications data is not defined. Ensure publicationsData.js loads before script.js.');
  }
});

// Recompute open abstract heights on resize (optional polish)
window.addEventListener('resize', () => {
  document.querySelectorAll('.pub-abstract-content.show-abstract').forEach(box => {
    box.style.maxHeight = box.scrollHeight + 'px';
  });
});
