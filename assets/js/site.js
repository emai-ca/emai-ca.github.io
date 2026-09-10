const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const currentPage = document.body.dataset.page;
document.querySelectorAll('[data-nav]').forEach((link) => {
  if (link.dataset.nav === currentPage) link.classList.add('is-current');
});

const atlasDefinitions = {
  all: ['EMAI Atlas', 'Explore the publications (in)forming EMAI.'],
  'small-data': ['Small data', 'Training AI with curated, context-specific datasets.'],
  literacy: ['Literacy', 'Developing the knowledge to critically understand, build, and creatively use AI.'],
  embodiment: ['Embodiment', 'Using bodily action and gesture to interact and perform with AI beyond text-based prompting.'],
  authorship: ['Authorship', 'Understanding and tracing how creative agency is distributed across the musician, data, model, and performance.']
};
const definitionCard = document.querySelector('#atlas-definition');

if (definitionCard) {
  let activeSphere = null;
  const positionDefinition = () => {
    if (!activeSphere || window.innerWidth <= 800) return;
    const sphere = activeSphere.getBoundingClientRect();
    const card = definitionCard.getBoundingClientRect();
    const left = sphere.right + 12 + card.width <= window.innerWidth - 16
      ? sphere.right + 12 : sphere.left - card.width - 12;
    definitionCard.style.left = `${Math.max(16, Math.min(left, window.innerWidth - card.width - 16))}px`;
    definitionCard.style.top = `${Math.max(16, Math.min(sphere.top, window.innerHeight - card.height - 16))}px`;
  };
  const closeDefinition = (restoreFocus = false) => {
    if (!activeSphere) return;
    activeSphere.setAttribute('aria-expanded', 'false');
    if (restoreFocus) activeSphere.focus({ preventScroll: true });
    activeSphere = null;
    definitionCard.hidden = true;
  };
  document.querySelectorAll('.atlas-node[data-theme]').forEach((button) => {
    const definition = atlasDefinitions[button.dataset.theme];
    if (!definition) {
      button.addEventListener('click', () => closeDefinition());
      return;
    }
    button.setAttribute('aria-controls', 'atlas-definition');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      if (activeSphere === button) return closeDefinition(true);
      closeDefinition();
      activeSphere = button;
      button.setAttribute('aria-expanded', 'true');
      definitionCard.querySelector('h2').textContent = definition[0];
      definitionCard.querySelector('p').textContent = definition[1];
      definitionCard.querySelector('.atlas-literature-link').hidden = button.dataset.theme !== 'all';
      definitionCard.hidden = false;
      positionDefinition();
      definitionCard.focus({ preventScroll: true });
    });
  });
  definitionCard.querySelector('button').addEventListener('click', () => closeDefinition(true));
  document.addEventListener('click', (event) => {
    if (activeSphere && !definitionCard.contains(event.target) && !event.target.closest('.atlas-node')) {
      closeDefinition(definitionCard.contains(document.activeElement));
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeSphere) closeDefinition(true);
  });
  window.addEventListener('resize', positionDefinition);
  window.addEventListener('scroll', positionDefinition, { passive: true });
}

const archive = document.querySelector('#archive');
if (archive) {
  const publications = [...archive.querySelectorAll('.publication-item')];
  const topicControls = document.querySelectorAll('[data-topic-filter], .constellation-node');
  const typeControls = archive.querySelectorAll('[data-filter]');
  let selectedTopic = 'all';
  let selectedType = 'all';
  const updateLiterature = () => {
    const related = publications.filter((item) => selectedTopic === 'all' || item.dataset.topics.split(' ').includes(selectedTopic));
    const visible = related;
    publications.forEach((item) => { item.hidden = selectedType !== 'all' && item.dataset.type !== selectedType; });
    topicControls.forEach((button) => {
      const selected = (button.dataset.topicFilter || button.dataset.topic) === selectedTopic;
      button.classList.toggle('is-active', selected);
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    typeControls.forEach((button) => {
      const selected = button.dataset.filter === selectedType;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const list = document.querySelector('#constellation-reading-list');
    if (!list) return;
    const definition = atlasDefinitions[selectedTopic];
    document.querySelector('#constellation-heading').textContent = selectedTopic === 'all' ? 'Explore the publications' : definition[0];
    document.querySelector('#constellation-description').textContent = selectedTopic === 'all'
      ? 'Select a theme to discover related publications.' : definition[1];
    document.querySelector('#constellation-count').textContent = `${visible.length} matching publications · Showing ${Math.min(3, visible.length)}`;
    list.replaceChildren();
    visible.slice(0, 3).forEach((item) => {
      const row = document.createElement('li');
      const year = document.createElement('span');
      year.textContent = item.querySelector('.pub-year').textContent;
      const sourceLink = item.querySelector('a');
      const title = document.createElement(sourceLink ? 'a' : 'span');
      title.textContent = item.querySelector('h2').textContent;
      if (sourceLink) title.href = sourceLink.href;
      row.append(year, title);
      list.append(row);
    });
  };
  topicControls.forEach((button) => button.addEventListener('click', () => {
    selectedTopic = button.dataset.topicFilter || button.dataset.topic;
    updateLiterature();
  }));
  typeControls.forEach((button) => button.addEventListener('click', () => {
    selectedType = button.dataset.filter;
    updateLiterature();
  }));
  updateLiterature();
}

/* Video facade: show the thumbnail, and only load the YouTube player once
   someone clicks. Avoids ~1MB of player JS and third-party cookies on a
   page nobody may watch a video on. */
document.querySelectorAll('.work-video').forEach((box) => {
  const play = box.querySelector('.work-play');
  if (!play) return;

  // Keep the poster so the card can go back to it when the video ends,
  // rather than leaving the player sitting on its end screen.
  const poster = [...box.children];
  let frame = null;

  // Vimeo drops subscriptions sent before it is ready, so this gets called
  // on load, again when the player announces itself, and on a short retry.
  const subscribe = () => {
    const win = frame && frame.contentWindow;
    if (!win) return;
    if (box.dataset.vimeo) {
      // 'finish' is the legacy event name, 'ended' the current one.
      ['ended', 'finish'].forEach((value) =>
        win.postMessage(JSON.stringify({ method: 'addEventListener', value }), '*'));
    } else {
      win.postMessage(JSON.stringify({ event: 'listening' }), '*');
    }
  };

  const restore = () => {
    if (!frame) return;
    frame = null;
    box.replaceChildren(...poster);
  };

  play.addEventListener('click', () => {
    const yt = box.dataset.video;
    const vim = box.dataset.vimeo;
    frame = document.createElement('iframe');
    frame.src = vim
      ? `https://player.vimeo.com/video/${vim}?autoplay=1&dnt=1${box.dataset.vimeoH ? '&h=' + box.dataset.vimeoH : ''}`
      : `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    frame.title = play.getAttribute('aria-label') || 'Video';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    box.replaceChildren(frame);

    // Both players report state over postMessage, so neither SDK is needed.
    frame.addEventListener('load', subscribe);
    [200, 600, 1500].forEach((ms) => setTimeout(subscribe, ms));
  });

  window.addEventListener('message', (event) => {
    if (!frame || !event.source || event.source !== frame.contentWindow) return;
    if (!/^https:\/\/(player\.vimeo\.com|www\.youtube(-nocookie)?\.com)$/.test(event.origin)) return;
    let data = event.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { return; }
    }
    if (data.event === 'ready') { subscribe(); return; }
    // Vimeo: {event:'ended'|'finish'} — YouTube: {info:{playerState:0}}
    const ended = data.event === 'ended'
      || data.event === 'finish'
      || (data.info && data.info.playerState === 0)
      || data.playerState === 0;
    if (ended) restore();
  });
});

// Preserve column membership when a card is enlarged. Measure the original
// layout at each viewport width, then let each column grow independently.
const worksGrid = document.querySelector('.works-grid');
if (worksGrid) {
  const cards = [...worksGrid.querySelectorAll('.work-card')];
  let lastWidth = 0;
  const arrangeWorks = () => {
    worksGrid.classList.remove('works-grid-stable');
    worksGrid.replaceChildren(...cards);
    const restored = cards.filter((card) => card.dataset.originalRatio).map((card) => {
      const visual = card.querySelector('.work-visual');
      const current = [...visual.classList].find((name) => name.startsWith('ratio-'));
      visual.classList.replace(current, card.dataset.originalRatio);
      return { visual, current, original: card.dataset.originalRatio };
    });
    const groups = new Map();
    cards.forEach((card) => {
      const left = Math.round(card.getBoundingClientRect().left);
      if (!groups.has(left)) groups.set(left, []);
      groups.get(left).push(card);
    });
    restored.forEach(({ visual, current, original }) => visual.classList.replace(original, current));
    const columns = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, items]) => {
      const column = document.createElement('div');
      column.className = 'works-column';
      column.append(...items);
      return column;
    });
    worksGrid.replaceChildren(...columns);
    worksGrid.style.setProperty('--works-columns', columns.length);
    worksGrid.classList.add('works-grid-stable');
    lastWidth = worksGrid.clientWidth;
  };
  document.fonts.ready.then(arrangeWorks);
  new ResizeObserver(() => {
    if (worksGrid.clientWidth !== lastWidth) arrangeWorks();
  }).observe(worksGrid);
}
