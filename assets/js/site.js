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
    // The archive honours both filters: the theme picked on the constellation
    // and the type picked in the archive toolbar.
    publications.forEach((item) => {
      const topicOk = selectedTopic === 'all' || item.dataset.topics.split(' ').includes(selectedTopic);
      const typeOk = selectedType === 'all' || item.dataset.type === selectedType;
      item.hidden = !(topicOk && typeOk);
    });
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
    // These are optional — the panel can be trimmed without breaking the list.
    const setText = (sel, text) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = text;
    };
    setText('#constellation-heading', selectedTopic === 'all' ? 'Read the publications' : definition[0]);
    setText('#constellation-description', selectedTopic === 'all'
      ? 'Filter by theme to related publications.' : definition[1]);
    setText('#constellation-count', `${visible.length} matching publications · Showing ${Math.min(3, visible.length)}`);
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

// One load of the hydra library, shared by the statement window and every
// surface on the page. Memoized so they cannot fetch it separately.
let hydraLoad = null;
const loadHydra = (src) => {
  if (!hydraLoad) {
    hydraLoad = new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = src;
      tag.onload = resolve;
      tag.onerror = () => reject(new Error('hydra did not load'));
      document.head.appendChild(tag);
    });
  }
  return hydraLoad;
};

// The statement window, after hydra.ojack.xyz's welcome panel: a black box
// over a fullscreen sketch. It opens once per session on whichever page
// someone lands on first. It stands in front of a funding deadline, so it
// leaves at the first sign of intent — click, scroll, Esc, or the close box.
const splash = document.getElementById('statement-splash');
if (splash) {
  // Private browsing throws on sessionStorage rather than returning null.
  const readSeen = () => {
    try { return sessionStorage.getItem('emai-splash') === 'seen'; } catch (e) { return false; }
  };
  const markSeen = () => {
    try { sessionStorage.setItem('emai-splash', 'seen'); } catch (e) { /* nothing to do */ }
  };

  if (!readSeen()) {
    const canvas = splash.querySelector('.statement-splash-canvas');
    const closer = splash.querySelector('[data-splash-dismiss]');
    const panel = splash.querySelector('.statement-splash-window');
    const scroller = splash.querySelector('.splash-scroll');
    const main = document.getElementById('main-content');
    const behind = [document.querySelector('.site-header'), main,
      document.querySelector('.institution-band'), document.querySelector('.site-footer')].filter(Boolean);
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let hydra = null;
    let frameId = null;
    let lastFrame = 0;
    let closed = false;

    const render = (now) => {
      frameId = requestAnimationFrame(render);
      hydra.tick(now - lastFrame);
      lastFrame = now;
    };

    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };

    // The window now holds the whole statement, so it has to be readable:
    // clicking or scrolling inside the panel must not throw it away. Only the
    // backdrop dismisses, plus Esc and the close box.
    const onClick = (event) => {
      if (!panel.contains(event.target)) close();
    };

    const canScroll = () => scroller && scroller.scrollHeight > scroller.clientHeight + 1;

    const onWheel = (event) => {
      if (canScroll() && scroller.contains(event.target)) return;
      close();
    };

    // Drop the bottom fade once there is nothing left below it, rather than
    // permanently dimming the last line.
    const onScroll = () => {
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
      panel.classList.toggle('is-at-end', atEnd || !canScroll());
    };

    function close() {
      if (closed) return;
      closed = true;
      splash.classList.add('is-closing');
      document.body.classList.remove('splash-open');
      behind.forEach((el) => { el.inert = false; });
      splash.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('keydown', onKey);
      if (scroller) scroller.removeEventListener('scroll', onScroll);
      if (frameId) cancelAnimationFrame(frameId);
      frameId = null;
      hydra = null;
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
      setTimeout(() => { splash.hidden = true; }, 450);
    }

    splash.hidden = false;
    document.body.classList.add('splash-open');
    behind.forEach((el) => { el.inert = true; });
    markSeen();
    if (closer) closer.focus({ preventScroll: true });

    splash.addEventListener('click', onClick);
    if (closer) closer.addEventListener('click', close);
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('keydown', onKey);
    if (scroller) {
      scroller.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (motionOk) {
      loadHydra(splash.dataset.hydra).then(() => {
        if (closed) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.min(Math.round(canvas.clientWidth * dpr), 1600);
        canvas.height = Math.min(Math.round(canvas.clientHeight * dpr), 1200);
        hydra = new Hydra({ canvas, detectAudio: false, makeGlobal: false, autoLoop: false });
        const h = hydra.synth;
        h.fps = 30;
        h.speed = 0.5;

        // In the editor `pat()` is called once, so its `time` reads as a single
        // seed rather than an animation — which is why re-running there gives a
        // different pattern each time. There is no `time` global under
        // makeGlobal:false, and it would be 0 at setup anyway, so a seed stands
        // in. The range is one screenshots showed holds up.
        const seed = 70 + Math.random() * 90;
        const pat = () => h.solid()
          .layer(h.solid().diff(
            h.osc((seed / 26) * 1, (seed / 1000) * 0.2)
              .mult(h.osc((seed / 8) * 1, (seed / 1006) * 0.2).rotate(1.57))
              .modulate(h.shape(91, 1, 0.05))
              .mult(h.shape(106, 1, 0.05))
          ))
          .modulateScale(h.osc(3, 0.125), 0.125);

        // Erin's hand goes into o1 — the buffer the sketch already reads from
        // and which was simply empty, so her artwork enters through the
        // sketch's own structure rather than being pasted over the top.
        h.s0.initImage(splash.dataset.hand);
        h.src(h.s0).out(h.o1);

        h.solid()
          .layer(h.solid(1.01, 1.01, 1.01)
            .mult(pat()
              .diff(h.src(h.o1).scale(0.2).mult(h.solid(), [0.7, 0.6, 0.4, 0.6]).kaleid(1.01).saturate(0.5)))
            .layer(h.solid(1.01, 1.01, 1.01)
              .mask(h.noise(2, 0.05)
                .invert().colorama(5).posterize(8, 4).luma(0.25).thresh(0.5)
                .modulateRotate(h.osc(1, 0.5)))
              .mult(h.gradient(0.5).kaleid(3).colorama(2).saturate(1.1).contrast(1.6).mult(h.solid(), 0.45))))
          .out();

        lastFrame = performance.now();
        frameId = requestAnimationFrame(render);
        splash.classList.add('is-live');
      }).catch(() => { /* the window stands on black */ });
    }
  }
}


// Hydra surfaces: the pattern as texture inside chosen sections, and inside
// Erin's hand in each page hero. Several small canvases rather than one big
// one — the sections are only ~1180px wide, so a full-page canvas behind them
// showed through every margin.
//
// All of them are ticked from a single rAF loop, render at low resolution
// (this is texture, not detail), and only while actually on screen.
const surfaceHost = document.querySelector('.page-hero, .signal-band, .labs-section, .requirements-band, .edi-band');
if (surfaceHost) {
  // Phones run this too. Only a stated preference for less motion turns it
  // off now — the width cut-off that used to be here meant phones got none of
  // the hand or the pattern, which is where most people open a shared link.
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hydraSrc = document.body;

  if (!still.matches && hydraSrc.dataset.hydra) {
    const targets = [];
    // The hand: her silhouette, on every page hero and in the home hero's own
    // slot, so About carries the same treatment as the rest.
    // Half the resolution on phones: it is texture, and a phone GPU should
    // not be pushing more pixels than it has to.
    const small = window.matchMedia('(max-width: 700px)').matches;
    document.querySelectorAll('main > section.page-hero, main > section.home-hero')
      .forEach((el) => targets.push([el, 'hand-surface', small ? 300 : 520]));
    // Full-width bands, the head-investigators panel, and the coral cards
    // (GAMMa workshop, and both "The archive will grow").
    document.querySelectorAll([
      'main > section.signal-band',
      'main > section.labs-section',
      'main > section.requirements-band',
      'main > section.edi-band',
      // On Home the coral is on the inner panel, not the section, so the
      // surface belongs there — on the section it only showed in the margins.
      '.leadership-band > .content-wide',
      '.session-accent',
    ].join(', ')).forEach((el) => targets.push([el, 'surface', 520]));

    const surfaces = [];
    let frameId = null;
    let lastFrame = 0;
    let running = false;

    const tickAll = (now) => {
      frameId = requestAnimationFrame(tickAll);
      const dt = now - lastFrame;
      lastFrame = now;
      surfaces.forEach((s) => { if (s.visible && s.hydra) s.hydra.tick(dt); });
    };

    const setRunning = (on) => {
      if (on === running) return;
      if (on) {
        lastFrame = performance.now();
        frameId = requestAnimationFrame(tickAll);
      } else {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      running = on;
    };

    const build = (section, className, cap) => {
      const canvas = document.createElement('canvas');
      canvas.className = className;
      canvas.setAttribute('aria-hidden', 'true');
      section.classList.add('has-surface');
      section.prepend(canvas);

      const box = canvas.getBoundingClientRect();
      const width = Math.max(64, Math.min(Math.round(box.width || cap), cap));
      const height = Math.max(64, Math.round(width * ((box.height || cap) / (box.width || cap))));
      canvas.width = width;
      canvas.height = height;

      const hydra = new Hydra({ canvas, detectAudio: false, makeGlobal: false, autoLoop: false });
      const h = hydra.synth;
      h.fps = small ? 10 : 16;
      // Your sketch says speed = 0.0222. Measured, that renders 10/255 of
      // change per 1.5s on its own — and these surfaces sit at 0.3 opacity, so
      // roughly 3/255 actually reaches the eye: static, the same trap the hero
      // fell into. 0.15 measures ~55 raw, so ~16 through the blend, which
      // matches the hero you approved. Put 0.0222 back here to return to the
      // original.
      h.speed = 0.15;
      // Array.prototype.fast arrives with the Hydra instance, so the bands are
      // built here rather than above.
      const band = (speed) => [0.3, 0.7].fast(speed);

      h.osc(48, -0.1, 0).thresh(band(0.75), 0).color(2, 1, 1.5)
        .add(
          h.osc(28, 0.1, 0).thresh(band(0.75), 0).rotate(3.14 / 4)
            .color(1, 0, 0.9)
            .modulateScale(h.osc(64, -0.01, 0).thresh(band(0.75), 0))
        )
        .diff(
          h.osc(28, 0.1, 0).thresh(band(0.5), 0).rotate(3.14 / 2)
            .color(1, 0.5, 1)
            .modulateScale(h.osc(64, -0.015, 0).thresh(band(0.5), 0))
        )
        .modulateRotate(h.osc(54, -0.005, 0).thresh(band(0.25), 0))
        .modulateScale(h.osc(44, -0.02, 0).thresh(band(0.25), 0))
        // Read every frame, unlike the seed in the statement window's sketch,
        // so it takes time off the props object hydra passes in.
        .colorama(({ time }) => Math.sin(time / 27) * 0.01222 + 9.89)
        .scale(2.122)
        .out();

      const entry = { canvas, hydra, visible: false };
      new IntersectionObserver((entries) => {
        entry.visible = entries.some((e) => e.isIntersecting);
        canvas.classList.toggle('is-live', entry.visible);
        setRunning(surfaces.some((s) => s.visible) && !document.hidden);
      }, { rootMargin: '120px' }).observe(section);
      return entry;
    };

    loadHydra(hydraSrc.dataset.hydra).then(() => {
      targets.forEach(([section, className, cap]) => {
        try { surfaces.push(build(section, className, cap)); } catch (e) { /* skip this one */ }
      });
    }).catch(() => { /* sections keep their flat colour */ });

    document.addEventListener('visibilitychange', () => {
      setRunning(!document.hidden && surfaces.some((s) => s.visible));
    });
  }
}
