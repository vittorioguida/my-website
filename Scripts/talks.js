// talks.js (unified: builds home talks preview and talks list)
document.addEventListener('DOMContentLoaded', () => {
  const TALKS_DATA = Array.isArray(window.TALKS) ? [...window.TALKS] : [];

  const MONTHS = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };

  function parseTalkDate(value) {
    if (!value) return 0;
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;

    const text = String(value).trim().toLowerCase();
    const monthMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/);
    if (monthMatch) {
      const month = MONTHS[monthMatch[1]];
      const year = Number(monthMatch[2]);
      return new Date(year, month, 1).getTime();
    }

    const yearMatch = text.match(/(\d{4})/);
    if (yearMatch) {
      return new Date(Number(yearMatch[1]), 0, 1).getTime();
    }

    return 0;
  }

  TALKS_DATA.sort((a, b) => parseTalkDate(b.date) - parseTalkDate(a.date));

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // "2025-11-07" reads badly in a caption; show "November 2025".
  // Values already written as "February 2026" are passed through.
  function formatTalkDate(value) {
    if (!value) return '';
    const text = String(value).trim();
    const iso = text.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (iso) {
      const month = MONTH_NAMES[Number(iso[2]) - 1];
      return month ? `${month} ${iso[1]}` : iso[1];
    }
    return text;
  }

  // A talk is shown as a plate: the photograph, its title, then venue and date.
  function platePhoto(talk) {
    return talk.img
      ? `<figure class="talk-plate-photo"><img src="${talk.img}" alt="${talk.title || 'Talk image'}" loading="lazy"></figure>`
      : '<figure class="talk-plate-photo talk-plate-photo--empty" aria-hidden="true"></figure>';
  }

  function plateMeta(talk) {
    const where = [talk.event, talk.venue].filter(Boolean).join(' · ');
    const when = [formatTalkDate(talk.date), talk.location].filter(Boolean).join(' · ');
    if (!where && !when) return '';
    return `<p class="talk-meta">${
      where ? `<span class="talk-where">${where}</span>` : ''
    }${
      when ? `<span class="talk-when">${when}</span>` : ''
    }</p>`;
  }

  function initHomeTalksPreview() {
    const list = document.getElementById('home-talks-list');
    if (!list || !TALKS_DATA.length) return;
    const carousel = list.closest('.home-talks-carousel');
    const prevBtn = carousel ? carousel.querySelector('.home-talks-arrow--prev') : null;
    const nextBtn = carousel ? carousel.querySelector('.home-talks-arrow--next') : null;

    const featured = TALKS_DATA.filter((talk) => talk.featured);
    const talks = (featured.length ? featured : TALKS_DATA).slice(0, 3);
    let current = 0;

    list.innerHTML = '';

    talks.forEach((talk) => {
      const li = document.createElement('li');
      li.className = 'home-talk-plate';
      li.innerHTML = `
        ${platePhoto(talk)}
        <h4 class="talk-plate-title">${talk.title || ''}</h4>
        ${plateMeta(talk)}
      `;
      list.appendChild(li);
    });

    function update() {
      list.style.transform = `translateX(-${current * 100}%)`;
      list.querySelectorAll('.home-talk-plate').forEach((item, index) => {
        item.setAttribute('aria-hidden', String(index !== current));
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        current = (current - 1 + talks.length) % talks.length;
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        current = (current + 1) % talks.length;
        update();
      });
    }

    if (talks.length <= 1) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
    }

    update();
  }

  function initTalksList() {
    const list = document.getElementById('talks-ul');
    if (!list || !TALKS_DATA.length) return;

    list.innerHTML = '';

    TALKS_DATA.forEach((talk) => {
      const li = document.createElement('li');
      li.className = 'talk-item';
      li.innerHTML = `
        ${platePhoto(talk)}
        <div class="talk-content">
          <h3 class="title">${talk.title || ''}</h3>
          ${plateMeta(talk)}
        </div>
      `;
      list.appendChild(li);
    });
  }

  initHomeTalksPreview();
  initTalksList();
});
