---
layout: default
title: Publications
nav: publications
---

<section class="page-hero content-wide reveal"><p class="eyebrow"><span class="live-dot"></span> EMAI / Research and Publications</p><h1>The research<br><em>behind the project</em><span class="accent">.</span></h1><p class="page-lede">Articles, papers, workshops surrounding embodied interaction and creative AI for music.</p></section>

<section class="content-wide constellation-section" id="constellation">
  <div class="archive-toolbar"><div><div class="section-label">Research constellation</div><p class="constellation-intro">Explore how EMAI's investigations travel across methods, people, and publications.</p></div><div class="toolbar-actions"><a class="button button-outline" href="#archive">Open archive <span aria-hidden="true">↓</span></a><a class="button button-dark" href="{{ '/emai-literature.bib' | relative_url }}" download>Download .bib <span aria-hidden="true">↓</span></a></div></div>
  <div class="constellation" role="group" aria-label="Interactive map of EMAI research themes and literature">
    <div class="constellation-map">
    <p class="constellation-filter-label">Filter the constellation</p>
    <div class="constellation-stage">
      <svg class="constellation-orbits" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle class="orbit-ring orbit-ring-main" cx="50" cy="50" r="34"/>
        <circle class="orbit-ring orbit-ring-inner" cx="50" cy="50" r="20"/>
        <g class="orbit-spokes">
          <line x1="42.93" y1="42.93" x2="31.26" y2="31.26"/>
          <line x1="57.07" y1="42.93" x2="68.74" y2="31.26"/>
          <line x1="42.93" y1="57.07" x2="31.26" y2="68.74"/>
          <line x1="57.07" y1="57.07" x2="68.74" y2="68.74"/>
        </g>
      </svg>
      <button class="constellation-node node-root" data-topic="all" type="button">All</button>
      <button class="constellation-node node-topic topic-body" data-topic="embodiment" type="button">embodiment</button>
      <button class="constellation-node node-topic topic-data" data-topic="small-data" type="button">small data</button>
      <button class="constellation-node node-topic topic-agency" data-topic="authorship" type="button">agency / authorship</button>
      <button class="constellation-node node-topic topic-method" data-topic="literacy" type="button">artist literacy</button>
    </div>
    </div>
    <div class="constellation-results">
      <h2 id="constellation-heading">Explore the literature</h2>
      <p id="constellation-description">Select a theme to discover related publications.</p>
      <p id="constellation-count" role="status"></p>
      <ul id="constellation-reading-list"></ul>
      <a class="text-link" href="#archive">Browse the archive <span aria-hidden="true">↓</span></a>
    </div>
  </div>
</section>

<section id="archive" class="content-wide archive-section"><div class="archive-toolbar"><div class="filter-group" role="group" aria-label="Filter publications"><button class="filter-button is-active" data-filter="all" type="button">All</button><button class="filter-button" data-filter="journal" type="button">Journals</button><button class="filter-button" data-filter="conference" type="button">Conferences</button><button class="filter-button" data-filter="workshop" type="button">Workshops</button></div></div><div class="publication-list">
  {%- assign pubs = site.data.publications | sort: "year" | reverse -%}
  {%- for p in pubs %}
  <article class="publication-item" data-type="{{ p.type }}" data-topics="{{ p.topics | join: ' ' }}"><span class="pub-year">{{ p.year }}</span><div><p class="pub-type">{{ p.label }}</p><h2>{{ p.title }}</h2><p>{% for a in p.authors %}{{ a }}{% unless forloop.last %}{% if forloop.rindex == 2 %} and {% else %}, {% endif %}{% endunless %}{% endfor %} · {{ p.venue }}</p></div>{% if p.url %}<a href="{{ p.url }}" aria-label="Read publication">↗</a>{% endif %}</article>
  {%- endfor %}
</div></section>

<section class="content-wide works-outro">
  <div class="session-grid">
    <div class="session-accent"><span class="session-year">Ongoing</span><h2>Documentation is part of the work</h2><p>EMAI will produce documentation, curated datasets, research-creation outputs, and audiovisual records of performances and workshops.</p></div>
    <div class="session-link"><span class="session-year">Related</span><h2>The work itself</h2><p>Performances, instruments and releases made within the project.</p><a class="session-arrow" href="{{ '/works/' | relative_url }}" aria-label="Go to the creative works page"><span aria-hidden="true">↗</span></a></div>
  </div>
</section>
