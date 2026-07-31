(function () {
  'use strict';

  const articles = [
    {
      category: "Salon",
      date: "3 juil. 2026",
      title: "Lorem Ipsum",
      excerpt: "Lorem Ipsum",
      content: [
        "La plupart des textes qu'on abandonne en cours de lecture ne sont pas mauvais : ils sont juste écrits pour l'auteur, pas pour le lecteur. La première phrase promet quelque chose que la deuxième ne tient pas.",
        "Un bon texte se lit comme on descend un escalier bien conçu : chaque marche est prévisible, aucune ne surprend la cheville. Ce n'est pas un manque d'ambition, c'est une forme de respect.",
        "Écrire simplement ne veut pas dire écrire pauvrement. Cela veut dire retirer tout ce qui se met entre l'idée et la personne qui la reçoit."
      ]
    },
    {
      category: "Récolte",
      date: "27 juin 2026",
      title: "Lorem Ipsum",
      excerpt: "Lorem Ipsum",
      content: [
        "Une carte oblige à trancher : une idée, un titre, quelques lignes. Ce format contraint est en réalité une aide à la pensée, pas une limite.",
        "Contrairement à un long document, une carte peut être déplacée, reliée à d'autres, ou mise de côté sans perdre son sens. Elle reste lisible isolée.",
        "C'est cette portabilité qui rend les systèmes en cartes si utiles pour les carnets de notes, les blogs courts, ou les bases de connaissance personnelles."
      ]
    },
    {
      category: "Salon",
      date: "18 juin 2026",
      title: "Lorem Ipsum",
      excerpt: "Lorem Ipsum",
      content: [
        "On sous-estime souvent la ponctuation la plus discrète : l'espace entre deux paragraphes. C'est là que le lecteur reprend son souffle, digère ce qui vient d'être dit.",
        "Un texte sans ces pauses devient une masse continue, difficile à traverser même si chaque phrase, prise seule, est claire.",
        "Écrire, c'est autant choisir ses mots que choisir où on les arrête."
      ]
    },
    {
      category: "Salon",
      date: "9 juin 2026",
      title: "Lorem Ipsum",
      excerpt: "Lorem Ipsum",
      content: [
        "Il y a une confusion fréquente entre 'simple' et 'facile à produire'. En réalité, la version simple d'une idée est presque toujours née après plusieurs versions compliquées.",
        "Le brouillon confus n'est pas un échec : c'est l'étape normale avant que l'idée ne se débarrasse de ce qui ne lui appartient pas.",
        "Publier tôt, avant ce tri, revient à faire porter au lecteur un travail qui nous appartenait."
      ]
    },
    {
      category: "Salon",
      date: "1 juin 2026",
      title: "Lorem Ipsum",
      excerpt: "Lorem Ipsum",
      content: [
        "La plupart des textes qu'on abandonne en cours de lecture ne sont pas mauvais : ils sont juste écrits pour l'auteur, pas pour le lecteur. La première phrase promet quelque chose que la deuxième ne tient pas.",
        "Un bon texte se lit comme on descend un escalier bien conçu : chaque marche est prévisible, aucune ne surprend la cheville. Ce n'est pas un manque d'ambition, c'est une forme de respect.",
        "Écrire simplement ne veut pas dire écrire pauvrement. Cela veut dire retirer tout ce qui se met entre l'idée et la personne qui la reçoit."
      ]
    }
  ];

  const grid         = document.querySelector('[data-blog="grid"]');
  const searchInput  = document.querySelector('[data-blog="search-input"]');
  const searchMeta   = document.querySelector('[data-blog="search-meta"]');
  const scrim        = document.querySelector('[data-blog="scrim"]');
  const closeBtn     = document.querySelector('[data-blog="reader-close"]');

  if (!grid) return;

  let reader = null;
  let sourceCard = null;


  function normalize(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function highlight(text, term) {
    const safe = escapeHtml(text);
    if (!term) return safe;
    const normText = normalize(text);
    const normTerm = normalize(term);
    let result = '';
    let cursor = 0;
    let idx = normText.indexOf(normTerm, cursor);
    if (idx === -1) return safe;
    while (idx !== -1) {
      result += escapeHtml(text.slice(cursor, idx));
      result += '<mark class="mblog__hit">' + escapeHtml(text.slice(idx, idx + term.length)) + '</mark>';
      cursor = idx + term.length;
      idx = normText.indexOf(normTerm, cursor);
    }
    result += escapeHtml(text.slice(cursor));
    return result;
  }

  function matches(article, term) {
    if (!term) return true;
    const haystack = normalize(
      article.title + ' ' + article.excerpt + ' ' + article.content.join(' ')
    );
    return haystack.includes(normalize(term));
  }

  function renderCards() {
    const term = searchInput ? searchInput.value.trim() : '';
    const filtered = articles
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => matches(a, term));

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="mblog__cardcontainer__empty">Aucun article ne correspond à « ${escapeHtml(term)} ».</div>`;
    } else {
      filtered.forEach(({ a, i }) => {
        const card = document.createElement('button');
        card.className = 'mblog__cardcontainer__card';
        card.setAttribute('data-index', i);
        card.innerHTML = `
          <div class="mblog__meta">
            <span>${escapeHtml(a.category)}</span>
            <span>·</span>
            <span>${escapeHtml(a.date)}</span>
          </div>
          <h3>${highlight(a.title, term)}</h3>
          <p>${highlight(a.excerpt, term)}</p>
        `;
        card.addEventListener('click', () => openArticle(i, card));
        grid.appendChild(card);
      });
    }

    if (searchMeta) {
      searchMeta.textContent = term
        ? `${filtered.length} résultat${filtered.length > 1 ? 's' : ''} pour « ${term} »`
        : `${articles.length} article${articles.length > 1 ? 's' : ''}`;
    }
  }

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(renderCards, 120);
    });
  }

  function openArticle(index, card) {
    if (reader) return;
    const a = articles[index];
    const rect = card.getBoundingClientRect();
    sourceCard = card;
    card.classList.add('mblog__cardcontainer__card--source');

    reader = document.createElement('div');
    reader.className = 'mblog__reader';
    reader.style.top = rect.top + 'px';
    reader.style.left = rect.left + 'px';
    reader.style.width = rect.width + 'px';
    reader.style.height = rect.height + 'px';
    reader.style.borderRadius = '10px';

    reader.innerHTML = `
      <div class="mblog__reader__inner">
        <div class="mblog__meta">
          <span>${escapeHtml(a.category)}</span>
          <span>·</span>
          <span>${escapeHtml(a.date)}</span>
        </div>
        <h1>${escapeHtml(a.title)}</h1>
        ${a.content.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      </div>
    `;
    document.body.appendChild(reader);
    document.body.classList.add('mblog-is-reading');

    reader.getBoundingClientRect();
    requestAnimationFrame(() => {
      reader.style.top = '0px';
      reader.style.left = '0px';
      reader.style.width = '100vw';
      reader.style.height = '100vh';
      reader.style.borderRadius = '0px';
      reader.classList.add('is-expanded');
    });

    if (scrim) scrim.classList.add('is-visible');
    if (closeBtn) closeBtn.classList.add('is-visible');

    document.addEventListener('keydown', onKeydown);
  }

  function closeArticle() {
    if (!reader || !sourceCard) return;
    const rect = sourceCard.getBoundingClientRect();

    reader.classList.remove('is-expanded');
    reader.style.top = rect.top + 'px';
    reader.style.left = rect.left + 'px';
    reader.style.width = rect.width + 'px';
    reader.style.height = rect.height + 'px';
    reader.style.borderRadius = '10px';

    if (scrim) scrim.classList.remove('is-visible');
    if (closeBtn) closeBtn.classList.remove('is-visible');
    document.body.classList.remove('mblog-is-reading');
    document.removeEventListener('keydown', onKeydown);

    const cleanup = () => {
      reader.remove();
      reader = null;
      sourceCard.classList.remove('mblog__cardcontainer__card--source');
      sourceCard = null;
    };
    reader.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 600);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeArticle();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeArticle);
  if (scrim) scrim.addEventListener('click', closeArticle);

  renderCards();
})();