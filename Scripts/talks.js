// talks.js (unified: builds home carousel and talks list)
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

  function initHomeCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsWrap = document.getElementById('carousel-indicators');
    const section = document.getElementById('talks-carousel-section');

    if (!track || !dotsWrap || !section || !TALKS_DATA.length) return;

    const prevBtn = section.querySelector('.carousel-control.prev');
    const nextBtn = section.querySelector('.carousel-control.next');

    const featured = TALKS_DATA.filter((talk) => talk.featured);
    const slides = (featured.length ? featured : TALKS_DATA).slice(0, 6);
    let current = 0;

    track.innerHTML = '';
    dotsWrap.innerHTML = '';

    slides.forEach((talk, i) => {
      const li = document.createElement('li');
      li.className = 'carousel-slide';
      li.setAttribute('role', 'group');
      li.setAttribute('aria-roledescription', 'slide');
      li.setAttribute('aria-label', `${i + 1} of ${slides.length}`);

      const thumb = talk.img
        ? `<div class="thumb"><img src="${talk.img}" alt="${talk.title || 'Talk image'}"></div>`
        : '<div class="thumb" aria-hidden="true"><i class="fa-regular fa-image"></i></div>';

      const metaTop = [talk.event, talk.venue].filter(Boolean).join(' - ');
      const metaBottom = [talk.date, talk.location].filter(Boolean).join(' - ');

      li.innerHTML = `
        ${thumb}
        <div class="content">
          <h3>${talk.title || ''}</h3>
          ${metaTop ? `<p class="meta">${metaTop}</p>` : ''}
          ${metaBottom ? `<p class="meta">${metaBottom}</p>` : ''}
          ${talk.desc ? `<p class="desc">${talk.desc}</p>` : ''}
        </div>
      `;

      track.appendChild(li);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        current = i;
        update();
      });
      dotsWrap.appendChild(dot);
    });

    function update() {
      track.style.transform = `translateX(-${current * 100}%)`;
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.setAttribute('aria-current', String(i === current));
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        current = (current - 1 + slides.length) % slides.length;
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        current = (current + 1) % slides.length;
        update();
      });
    }

    if (slides.length <= 1) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      dotsWrap.hidden = true;
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

      const thumb = talk.img
        ? `<div class="talk-thumb"><img src="${talk.img}" alt="${talk.title || 'Talk image'}"></div>`
        : '<div class="talk-thumb" aria-hidden="true"></div>';

      const whenWhere = [talk.date, talk.location].filter(Boolean).join(' - ');

      li.innerHTML = `
        ${thumb}
        <div class="talk-content">
          <h3 class="title">${talk.title || ''}</h3>
          ${(talk.event || talk.venue) ? `<p class="whenwhere">${[talk.event, talk.venue].filter(Boolean).join(' - ')}</p>` : ''}
          ${whenWhere ? `<p class="whenwhere">${whenWhere}</p>` : ''}
          ${talk.desc ? `<p class="talk-summary">${talk.desc}</p>` : ''}
        </div>
      `;

      list.appendChild(li);
    });
  }

  initHomeCarousel();
  initTalksList();
});
