// talks.js (unified: builds home carousel and talks list)
document.addEventListener('DOMContentLoaded', () => {
  const TALKS_DATA = (window.TALKS || []).slice();

  // sort by date desc (string ISO yyyy-mm-dd works with localeCompare)
  TALKS_DATA.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  /* =========================
     HOME PAGE: CAROUSEL
     ========================= */
  const track = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-indicators');

  if (track && dotsWrap && TALKS_DATA.length) {
    // prefer featured, else latest 6
    const featured = TALKS_DATA.filter(t => t.featured);
    const slides = (featured.length ? featured : TALKS_DATA).slice(0, 6);

    slides.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'carousel-slide';
      li.setAttribute('role', 'group');
      li.setAttribute('aria-roledescription', 'slide');
      li.setAttribute('aria-label', `${i + 1} of ${slides.length}`);

      const thumb = t.img
        ? `<div class="thumb"><img src="${t.img}" alt=""></div>`
        : `<div class="thumb" aria-hidden="true"><i class="fa-regular fa-image"></i></div>`;

      const link = t.link
        ? `<a class="cta" href="${t.link}" target="_blank" rel="noopener noreferrer">Details <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
        : '';

      li.innerHTML = `
        ${thumb}
        <div class="content">
          <h3>${t.title}</h3>
          <p class="meta">${[t.event, t.venue].filter(Boolean).join(" · ")}</p>
          <p class="meta">${t.date || ""}${t.location ? " · " + t.location : ""}</p>
          ${t.desc ? `<p class="desc">${t.desc}</p>` : ""}
          ${link}
        </div>
      `;
      track.appendChild(li);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dotsWrap.appendChild(dot);
    });

    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const dots = Array.from(dotsWrap.children);
    let index = 0;

    const update = () => {
      track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    };
    const goTo = (i) => { index = (i + dots.length) % dots.length; update(); };

    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Keyboard arrows
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });

    // Touch swipe
    let startX = 0, deltaX = 0, touching = false;
    track.addEventListener('touchstart', (e) => {
      touching = true; startX = e.touches[0].clientX; deltaX = 0;
    }, {passive: true});
    track.addEventListener('touchmove', (e) => {
      if (!touching) return;
      deltaX = e.touches[0].clientX - startX;
    }, {passive: true});
    track.addEventListener('touchend', () => {
      touching = false;
      if (Math.abs(deltaX) > 40) goTo(index + (deltaX < 0 ? 1 : -1));
    });

    update();
  }

  /* =========================
     TALKS PAGE: LIST
     ========================= */
  const list = document.getElementById('talks-ul');
  if (list && TALKS_DATA.length) {
    TALKS_DATA.forEach(t => {
      const li = document.createElement('li');
      li.classList.add('talk-item');

      const imgHtml = t.img
        ? `<div class="talk-thumb"><img src="${t.img}" alt="${t.title}"></div>`
        : `<div class="talk-thumb placeholder"><i class="fa-regular fa-image"></i></div>`;

      const linkHtml = t.link
        ? `<a href="${t.link}" target="_blank" rel="noopener noreferrer">More info</a>`
        : '';

      li.innerHTML = `
        ${imgHtml}
        <div class="talk-content">
          <h3 class="title">${t.title}</h3>
          <p class="whenwhere">${[t.event, t.venue].filter(Boolean).join(" · ")}</p>
          <p class="whenwhere">${t.date || ""}${t.location ? " · " + t.location : ""}</p>
          ${t.long_desc ? `<p class="long-desc">${t.long_desc}</p>` : (t.desc ? `<p class="desc">${t.desc}</p>` : "")}
          ${linkHtml}
        </div>
      `;
      list.appendChild(li);
    });
  }
});
