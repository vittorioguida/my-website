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
      li.className = 'home-talk-polaroid';

      const thumb = talk.img
        ? `<figure class="home-talk-photo"><img src="${talk.img}" alt="${talk.title || 'Talk image'}"></figure>`
        : '<figure class="home-talk-photo home-talk-photo--empty" aria-hidden="true"></figure>';

      li.innerHTML = `
        ${thumb}
        <div class="home-talk-title-band">
          <h4 class="home-talk-title">${talk.title || ''}</h4>
        </div>
        <div class="home-talk-bottom-space" aria-hidden="true"></div>
      `;

      list.appendChild(li);
    });

    function update() {
      list.style.transform = `translateX(-${current * 100}%)`;
      list.querySelectorAll('.home-talk-polaroid').forEach((item, index) => {
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
    scheduleTalkTextFit(list);
  }

  function initTalksList() {
    const list = document.getElementById('talks-ul');
    if (!list || !TALKS_DATA.length) return;

    list.innerHTML = '';

    TALKS_DATA.forEach((talk) => {
      const li = document.createElement('li');
      li.className = 'talk-item';

      const thumb = talk.img
        ? `<figure class="talk-polaroid-photo"><img src="${talk.img}" alt="${talk.title || 'Talk image'}"></figure>`
        : '<figure class="talk-polaroid-photo talk-polaroid-photo--empty" aria-hidden="true"></figure>';

      const whenWhere = [talk.date, talk.location].filter(Boolean).join(' - ');
      const venueDetails = [
        (talk.event || talk.venue) ? [talk.event, talk.venue].filter(Boolean).join(' - ') : '',
        whenWhere
      ].filter(Boolean).join('<br>');

      li.innerHTML = `
        ${thumb}
        <div class="talk-content">
          <h3 class="title">${talk.title || ''}</h3>
        </div>
        ${venueDetails ? `<div class="talk-venue-band"><p class="talk-venue">${venueDetails}</p></div>` : ''}
      `;

      list.appendChild(li);
    });

    scheduleTalkTextFit(list);
  }

  function fitElementText(element, options) {
    const { max, min, step = 0.25 } = options;
    const box = element.parentElement;
    if (!box) return;

    element.style.display = 'block';
    element.style.fontSize = `${max}rem`;
    element.style.webkitLineClamp = 'unset';

    let size = max;
    while (
      size > min &&
      (element.scrollHeight > box.clientHeight || element.scrollWidth > box.clientWidth)
    ) {
      size -= step;
      element.style.fontSize = `${Math.max(size, min)}rem`;
    }
  }

  function fitTalkCardText(list) {
    const titles = list.querySelectorAll('.talk-content .title');
    const venues = list.querySelectorAll('.talk-venue');
    const homeTitles = list.querySelectorAll('.home-talk-title');

    titles.forEach((title) => fitElementText(title, { max: 1.08, min: 0.82, step: 0.02 }));
    venues.forEach((venue) => fitElementText(venue, { max: 0.72, min: 0.52, step: 0.02 }));
    homeTitles.forEach((title) => fitElementText(title, { max: 1, min: 0.68, step: 0.02 }));
  }

  function scheduleTalkTextFit(list) {
    window.requestAnimationFrame(() => fitTalkCardText(list));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => fitTalkCardText(list));
    }
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    const lists = [
      document.getElementById('talks-ul'),
      document.getElementById('home-talks-list')
    ].filter(Boolean);
    if (!lists.length) return;

    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      lists.forEach((list) => scheduleTalkTextFit(list));
    }, 120);
  });

  initHomeTalksPreview();
  initTalksList();
});
