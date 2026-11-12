/* Cupion UI. Screens, sheets, stories, and the мэтч animation. */
(function () {
  'use strict';

  var BUBBLES = [
    { x: '8%', y: '20%', s: 30 }, { x: '18%', y: '58%', s: 42 }, { x: '12%', y: '86%', s: 26 },
    { x: '27%', y: '16%', s: 34 }, { x: '24%', y: '40%', s: 26 }, { x: '32%', y: '78%', s: 48 },
    { x: '38%', y: '28%', s: 28 }, { x: '42%', y: '62%', s: 34 }, { x: '50%', y: '10%', s: 26 },
    { x: '63%', y: '14%', s: 36 }, { x: '58%', y: '42%', s: 26 }, { x: '61%', y: '76%', s: 44 },
    { x: '72%', y: '28%', s: 30 }, { x: '76%', y: '60%', s: 54 }, { x: '80%', y: '10%', s: 26 },
    { x: '86%', y: '38%', s: 32 }, { x: '90%', y: '78%', s: 40 }, { x: '94%', y: '20%', s: 28 },
    { x: '16%', y: '34%', s: 26 }, { x: '46%', y: '88%', s: 30 }, { x: '68%', y: '90%', s: 26 },
    { x: '36%', y: '50%', s: 26 }, { x: '88%', y: '54%', s: 26 }, { x: '70%', y: '46%', s: 28 }
  ];

  var S = {
    screen: 'feed',
    mode: 'new',
    ratingsTab: 'in',
    feed: [],
    stories: [],
    me: null,
    person: null,
    personId: null,
    stack: [],
    unseen: 0,
    photoIndex: {},
    loading: true,
    newPill: false,
    theme: 'auto',
    sheet: null,
    sheetPayload: null,
    story: null,
    match: null,
    viewer: null,
    regStep: 0,
    regDir: 1,
    reg: emptyReg(),
    userCheck: null,
    score: 8,
    plan: 'year',
    limits: null,
    justLiked: '',
    compose: null,
    edit: null,
    startUser: ''
  };

  var sheetSig = '';
  var sheetToken = 0;
  var storySig = '';
  var matchSig = '';
  var scrollMem = {};
  var storyRAF = 0;
  var storyAcc = 0;
  var storyLast = 0;
  var toastTimer = 0;
  var gesture = null;
  var swallowClick = false;

  function emptyReg() {
    return { age: '', city: '', name: '', username: '', photos: [], bio: '' };
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function svg(inner) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  var ICON = {
    heart: svg('<path d="M12 19.2c-.2 0-6.6-4-6.6-8.6A3.5 3.5 0 0 1 12 8.2a3.5 3.5 0 0 1 6.6 2.4c0 4.6-6.4 8.6-6.6 8.6z"/>'),
    grid: svg('<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>'),
    user: svg('<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2c1.4-2.6 3.6-3.9 6.5-3.9s5.1 1.3 6.5 3.9"/>'),
    plus: svg('<path d="M12 5.5v13M5.5 12h13"/>'),
    refresh: svg('<path d="M19 12a7 7 0 1 1-1.8-4.7"/><path d="M19 5.5V10h-4.5"/>'),
    play: svg('<path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" stroke="none"/>'),
    lock: svg('<rect x="6" y="10" width="12" height="9" rx="2"/><path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2"/>'),
    mail: svg('<rect x="4" y="6" width="16" height="12" rx="2.5"/><path d="M5 8l7 5 7-5"/>'),
    back: svg('<path d="M14.5 5.5L8 12l6.5 6.5"/>'),
    more: svg('<circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none"/>'),
    star: svg('<path d="M12 4.5l1.8 4.2 4.6.5-3.4 3.1.9 4.5L12 14.6 8.1 16.8l.9-4.5L5.6 9.2l4.6-.5L12 4.5z"/>'),
    eye: svg('<path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.4"/>'),
    send: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    video: svg('<rect x="4" y="6" width="12" height="12" rx="2"/><path d="M16 10l4-2v8l-4-2"/>'),
    spark: svg('<path d="M12 3v4M12 17v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M3 12h4M17 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>'),
    search: svg('<circle cx="11" cy="11" r="6.2"/><path d="M16 16l4 4"/>'),
    heartFill: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M12 19.4c-.25 0-6.8-4.1-6.8-8.8A3.6 3.6 0 0 1 12 7.8a3.6 3.6 0 0 1 6.8 2.8c0 4.7-6.55 8.8-6.8 8.8z"/></svg>'
  };

  var SIL = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="9" fill="#C4CAD3"/><path fill="#C4CAD3" d="M16 52c2.8-9 8.6-13.5 16-13.5S45.2 43 48 52"/></svg>';
  var GLYPH = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="15" y="18" width="34" height="28" rx="5" fill="none" stroke="#C4CAD3" stroke-width="2.2"/><circle cx="25" cy="28" r="2.6" fill="#C4CAD3"/><path d="M17 40l9-7 6 4.5 4.5-3.2L47 40" fill="none" stroke="#C4CAD3" stroke-width="2.2" stroke-linejoin="round"/></svg>';

  function phAvatar(extra) {
    return '<span class="ph ph-ava' + (extra ? ' ' + extra : '') + '">' + SIL + '</span>';
  }

  function phPhoto(extra) {
    return '<span class="ph ph-photo' + (extra ? ' ' + extra : '') + '">' + GLYPH + '</span>';
  }

  function ph() { return phAvatar(); }

  function compactNum(n) {
    n = Number(n) || 0;
    if (n < 1000) return String(n);
    var v = Math.round((n / 1000) * 10) / 10;
    var s = String(v);
    if (s.slice(-2) === '.0') s = s.slice(0, -2);
    return s + 'K';
  }

  function timeAgo(ts) {
    var s = Math.max(0, Date.now() - (ts || 0));
    if (s < 60000) return 'только что';
    var m = Math.floor(s / 60000);
    if (m < 60) return m + ' мин';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' ч';
    var d = Math.floor(h / 24);
    return d === 1 ? 'вчера' : (d + ' д');
  }

  function verb(gender) { return gender === 'female' ? 'оценила' : 'оценил'; }
  function youVerb() { return S.me && S.me.gender === 'female' ? 'оценила' : 'оценил'; }

  function toast(text) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    root.innerHTML = '<div class="toast show">' + esc(text) + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      var node = root.querySelector('.toast');
      if (node) node.classList.remove('show');
    }, 2200);
  }

  function applyTheme() {
    S.theme = 'light';
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
    if (window.TG) TG.paintChrome(false);
  }

  function tabsVisible() {
    return !S.story && !S.viewer && S.screen !== 'register';
  }

  function needAccount() {
    if (S.me) return false;
    S.screen = 'register';
    S.regStep = 0;
    render();
    return true;
  }

  function scrollKey() { return S.screen + ':' + (S.personId || '') + ':' + S.regStep; }

  function captureScroll() {
    var el = document.querySelector('#stage .scroll');
    if (el) scrollMem[scrollKey()] = el.scrollTop;
  }

  function restoreScroll() {
    var el = document.querySelector('#stage .scroll');
    if (!el) return;
    if (S.forceTop) {
      S.forceTop = false;
      el.scrollTop = 0;
      return;
    }
    var y = scrollMem[scrollKey()];
    if (y) el.scrollTop = y;
  }

  function syncBack() {
    var needs = !!(S.sheet || S.story || S.viewer || S.match || S.screen === 'person' || (S.screen === 'register' && S.regStep > 0));
    if (!window.TG) return;
    if (needs) TG.showBack(goBack);
    else TG.hideBack();
  }

  function goBack() {
    if (S.viewer) { closeViewer(); return; }
    if (S.sheet) { closeSheet(); return; }
    if (S.story) { closeStory(); return; }
    if (S.match) { closeMatch(); return; }
    if (S.screen === 'register' && S.regStep > 0) {
      S.regDir = -1;
      S.regStep -= 1;
      render();
      return;
    }
    var prev = S.stack.pop();
    if (prev) {
      S.screen = prev.screen;
      S.personId = prev.personId || null;
      S.person = null;
      if (S.screen === 'person' && S.personId) loadPerson(S.personId);
      render();
      return;
    }
    if (S.screen !== 'feed') {
      S.screen = 'feed';
      S.person = null;
      S.personId = null;
      render();
    }
  }

  function goTab(tab) {
    S.stack = [];
    S.person = null;
    S.personId = null;
    S.screen = tab;
    if (tab === 'ratings') {
      S.unseen = 0;
      CupionAPI.markRatingsSeen().catch(function () {});
      loadRatings().then(render);
    }
    if (window.TG) TG.impact('light');
    render();
  }

  function openPerson(id) {
    if (!id) return;
    if (S.me && (id === 'me' || id === S.me.id)) {
      goTab('profile');
      return;
    }
    if (S.screen !== 'person' || S.personId !== id) {
      S.stack.push({ screen: S.screen, personId: S.personId });
    }
    S.screen = 'person';
    S.personId = id;
    S.person = null;
    render();
    loadPerson(id);
  }

  function loadPerson(id) {
    return CupionAPI.getUser(id).then(function (user) {
      if (S.personId === id) {
        S.person = user;
        render();
      }
    }).catch(function (err) { toast(err.message || 'Анкета не найдена'); });
  }

  function loadFeed(next) {
    var limit = S.me && S.me.premium ? 20 : 10;
    S.loading = !next && !(S.feed && S.feed.length);
    return CupionAPI.getFeed({ restart: !next, limit: limit }).then(function (res) {
      var items = (res && res.items) || [];
      S.feed = items;
      S.feedExhausted = items.length === 0;
      S.loading = false;
    });
  }

  function loadStories() {
    return CupionAPI.getStoryUsers().then(function (rows) { S.stories = rows || []; });
  }

  function loadRatings() {
    return Promise.all([
      CupionAPI.getIncoming(),
      CupionAPI.getOutgoing(),
      CupionAPI.getMatches()
    ]).then(function (res) {
      S.incoming = res[0] || [];
      S.outgoing = res[1] || [];
      S.matches = res[2] || [];
    });
  }

  function refreshMe() {
    return CupionAPI.getMe().then(function (me) { S.me = me; return me; });
  }

  /* ---------- feed ---------- */

  function timeRing(user, extra) {
    var stories = (user && user.stories) || [];
    var live = stories.filter(function (s) { return s.remain > 0; });
    var sample = live[0];
    var p = sample ? Math.max(0.04, Math.min(1, sample.remain / (sample.ttl || 3600000))) : 0;
    var seen = live.length && live.every(function (s) { return s.seen; });
    return '<span class="time-ring' + (seen ? ' seen' : '') + (extra ? ' ' + extra : '') + '" style="--p:' + p.toFixed(3) + '">' + phAvatar() + '</span>';
  }

  function storyPool() {
    var list = (S.stories || []).filter(function (u) { return u.stories && u.stories.length; });
    var slots = BUBBLES.slice().sort(function (a, b) { return parseFloat(a.x) - parseFloat(b.x); });
    var shift = S.storyShift || 0;
    return slots.map(function (slot, i) {
      return { slot: slot, user: list.length ? list[(i + shift) % list.length] : null, i: i };
    });
  }

  function bubble(user, slot, i) {
    var dx = (i % 2 ? 4 : -3) + 'px';
    var dy = (i % 3 ? -7 : 5) + 'px';
    var dur = (8 + (i % 5) * 0.7) + 's';
    var delay = (-i * 0.35) + 's';
    return '<button class="bubble' + (S.cycle ? ' cycle' : '') + '" style="--x:' + slot.x + ';--y:' + slot.y + ';--s:' + slot.s + 'px;--dx:' + dx + ';--dy:' + dy + ';--dur:' + dur + ';--delay:' + delay + '" data-act="story" data-id="' + esc(user.id) + '" aria-label="' + esc(user.name) + '">' +
      '<span class="bubble-swap"><span class="bubble-drift">' + timeRing(user) + '</span></span></button>';
  }

  function orbit() {
    var html = storyPool().map(function (row) {
      return row.user ? bubble(row.user, row.slot, row.i) : '';
    }).join('');
    var mine = S.me && S.me.stories && S.me.stories.length;
    html += '<button class="bubble me" data-act="my-story" aria-label="Моя история"><span class="bubble-drift">' +
      (mine ? timeRing(S.me, 'mine') : phAvatar()) +
      '<span class="plus" data-act="add-story" aria-label="Добавить историю">+</span></span></button>';
    return '<div class="orbit">' + html + '</div>';
  }

  function mediaBlock(post) {
    var photo = (post.photos || [])[0];
    var ratio = photo && photo.ratio ? photo.ratio : 1;
    if (ratio < 0.8) ratio = 0.8;
    if (ratio > 1.91) ratio = 1.91;
    var style = ' style="--ratio:' + ratio + '"';
    if (photo && photo.type === 'video' && !(S.me && S.me.premium)) {
      return '<div class="frame-media video-locked" data-act="premium"' + style + '>' + phPhoto('is-blur') + '<span class="lock-badge">🔒 Premium</span></div>';
    }
    if (photo && photo.type === 'video') {
      return '<div class="frame-media"' + style + '>' + phPhoto() + '<button class="play-badge" data-act="play" data-src="' + esc(photo.url) + '" aria-label="Смотреть видео">' + ICON.play + '</button></div>';
    }
    return '<div class="frame-media"' + style + '>' + phPhoto() + '</div>';
  }

  function postCard(post) {
    if (!post) return '';
    var photo = (post.photos || [])[0] || { id: '' };
    var city = post.city ? ' · ' + esc(post.city) : '';
    return '<article class="post" data-post="' + esc(post.id) + '"><div class="card">' +
      '<div class="post-head"><button class="mini-ava" data-act="person" data-id="' + esc(post.id) + '">' + phAvatar() + '</button>' +
      '<button class="post-user" data-act="person" data-id="' + esc(post.id) + '">' + esc(post.name) + '</button>' +
      '<button class="heart-fill' + (S.justLiked === post.id ? ' pop' : '') + '" data-act="rate" data-id="' + esc(post.id) + '" data-photo="' + esc(photo.id) + '" aria-label="Оценить">' + ICON.heartFill + '</button></div>' +
      '<div class="frame">' + mediaBlock(post) +
      '<div class="notch"><span class="rate-chip"><b>★</b> ' + esc(post.ratingLabel) + '</span></div></div>' +
      '<div class="post-title">' + esc(post.name) + ', ' + esc(post.age) + city + ' <span class="muted">· оценили ' + esc(post.ratingsCount) + '</span></div>' +
      '<p class="caption">' + esc(post.caption || post.bio || '') + '</p></div></article>';
  }

  function feedScreen() {
    var n = S.unseen || 0;
    var badge = n ? '<span class="badge">' + (n > 9 ? '9+' : n) + '</span>' : '';
    var posts = S.loading
      ? '<div class="empty"><div class="empty-orb"></div><h3>Загрузка</h3></div>'
      : (S.feed.length ? S.feed.map(postCard).join('')
        : '<div class="empty feed-empty"><div class="empty-orb"></div><h3>Пока новых анкет нет</h3><p>Загляни позже</p><button class="btn btn-primary" data-act="feed-restart">Обновить</button></div>');
    return '<div class="screen screen-feed">' +
      '<header class="app-header"><div class="wordmark" data-act="tab" data-tab="feed">Cupion</div><div class="header-actions">' +
      '<button class="icon-btn" data-act="tab" data-tab="ratings" aria-label="Оценки">' + ICON.heart + badge + '</button>' +
      '<button class="icon-btn" data-act="tab" data-tab="profile" aria-label="Профиль">' + ICON.user + '</button>' +
      '</div></header><div class="scroll" id="feed-scroll"><div class="pull" id="pull"><div class="spinner"></div></div>' +
      orbit() +
      '<button class="new-pill" data-act="new-pill">↑ Появились новые</button>' +
      posts + '</div></div>';
  }

  /* ---------- ratings ---------- */

  function matchHero(m) {
    if (!m || !m.user) return '';
    var mine = S.me && S.me.username ? '@' + S.me.username : 'ты';
    return '<section class="match-hero"><div class="pair">' +
      phAvatar('a') + phAvatar('b') +
      '<span class="heart">♥</span></div>' +
      '<b>Мэтч с @' + esc(m.user.username) + '</b>' +
      '<span class="sub">' + esc(mine) + ' и @' + esc(m.user.username) + '</span>' +
      '<span class="sub">вы оценили друг друга</span>' +
      '<button class="btn btn-primary" data-act="person" data-id="' + esc(m.user.id) + '">Смотреть</button></section>';
  }

  function ratingRow(row, incoming) {
    if (!row || !row.user) return '';
    var who = row.user;
    var revealed = !incoming || row.revealed || row.score > 5;
    var line = incoming
      ? ((revealed ? verb(who.gender) : 'оценили') + ' твоё фото · ' + timeAgo(row.createdAt))
      : ('ты ' + youVerb() + ' · ' + timeAgo(row.createdAt));
    var quote = row.text && revealed ? '<div class="quote">«' + esc(row.text) + '»</div>' : '';
    var score = incoming ? row.score : (row.score || '');
    var title = revealed ? ('@' + who.username) : 'Аноним';
    var action = '';
    if (incoming && revealed) {
      action = '<button class="btn btn-primary btn-sm" data-act="tg" data-user="' + esc(who.username) + '">Написать</button>';
    } else if (!incoming) {
      action = '<button class="btn btn-primary btn-sm" data-act="person" data-id="' + esc(who.id) + '">Смотреть</button>';
    }
    var nameBtn = revealed
      ? '<b data-act="person" data-id="' + esc(who.id) + '">' + esc(title) + '</b>'
      : '<b>' + esc(title) + '</b>';
    return '<article class="rate-row' + (revealed ? '' : ' anon') + '">' +
      '<div class="rate-main">' + phAvatar(revealed ? '' : 'anon') +
      '<div>' + nameBtn + '<div class="sub">' + esc(line) + '</div></div>' +
      (revealed ? '<button class="thumb-btn" data-act="person" data-id="' + esc(who.id) + '">' + phPhoto() + '</button>' : '<span class="thumb-btn">' + phPhoto() + '</span>') +
      '</div>' + quote +
      '<div class="hair"></div>' +
      '<div class="rate-foot">' +
      (score ? '<span class="score-outline">★ ' + esc(score) + '</span>' : '<span></span>') +
      action + '</div></article>';
  }

  function ratingsScreen() {
    var i = S.ratingsTab === 'out' ? 1 : S.ratingsTab === 'matches' ? 2 : 0;
    var hero = (S.ratingsTab !== 'out' && S.matches && S.matches[0]) ? matchHero(S.matches[0]) : '';
    var body = '';
    if (S.ratingsTab === 'in') {
      body = (S.incoming || []).map(function (row) { return ratingRow(row, true); }).join('');
      if (!body) body = '<div class="empty"><div class="empty-orb"></div><h3>Пока тихо</h3><p>Когда тебя оценят, это появится здесь.</p></div>';
    } else if (S.ratingsTab === 'out') {
      body = (S.outgoing || []).map(function (row) { return ratingRow(row, false, 0); }).join('');
      if (!body) body = '<div class="empty"><div class="empty-orb"></div><h3>Ты ещё никого не оценил</h3><p>Поставь первую оценку в ленте.</p></div>';
    } else {
      body = (S.matches || []).slice(1).map(function (m) {
        return '<article class="rate-row"><div class="rate-main">' + phAvatar() +
          '<div><b>@' + esc((S.me && S.me.username) || 'ты') + ' и @' + esc(m.user.username) + '</b><div class="sub">мэтч · ' + timeAgo(m.createdAt) + '</div></div>' +
          '<button class="thumb-btn" data-act="person" data-id="' + esc(m.user.id) + '">' + phPhoto() + '</button></div>' +
          '<div class="hair"></div><div class="rate-foot"><span></span>' +
          '<button class="btn btn-primary btn-sm" data-act="person" data-id="' + esc(m.user.id) + '">Смотреть</button></div></article>';
      }).join('');
      if (!S.matches || !S.matches.length) body = '<div class="empty"><div class="empty-orb"></div><h3>Мэтчей пока нет</h3><p>Взаимная оценка превращается в мэтч.</p></div>';
    }
    return '<div class="screen"><div class="scroll"><div class="page-head"><button class="brand" data-act="tab" data-tab="feed">Cupion</button><h1>Оценки</h1><p>Кто оценил тебя</p></div>' +
      '<div class="pad"><div class="seg" data-i="' + i + '"><i class="seg-pill"></i>' +
      '<button type="button" data-act="rtab" data-tab="in" class="' + (i === 0 ? 'on' : '') + '">Тебе</button>' +
      '<button type="button" data-act="rtab" data-tab="out" class="' + (i === 1 ? 'on' : '') + '">Ты</button>' +
      '<button type="button" data-act="rtab" data-tab="matches" class="' + (i === 2 ? 'on' : '') + '">Мэтчи</button></div></div>' +
      hero + body + '</div></div>';
  }

  /* ---------- profile ---------- */

  function photoTile(photo, user) {
    var video = photo.type === 'video';
    var locked = video && !(S.me && S.me.premium);
    var mark = '';
    if (locked) mark = '<span class="prem-pill">🔒 Premium</span>';
    else if (video) mark = '<span class="mark">' + ICON.play + '</span>';
    var act = locked ? 'premium' : (video ? 'play' : 'view-photo');
    return '<button class="tile' + (locked ? ' locked' : '') + '" data-act="' + act + '" data-src="' + esc(photo.url || '') + '" data-id="' + esc(user.id) + '">' +
      phPhoto(locked ? 'is-blur' : '') + mark + '</button>';
  }

  function highlightRow(user) {
    var html = '<div class="highlights">';
    for (var i = 0; i < 6; i++) {
      html += '<button class="hl" data-act="story" data-id="' + esc(user.id) + '" data-index="' + i + '">' + phAvatar() + '</button>';
    }
    return html + '</div>';
  }

  function profileView(user, own) {
    if (!user) {
      return '<div class="screen"><div class="scroll"><div class="profile-bar"><button class="glass-circle" data-act="tab" data-tab="feed" aria-label="Назад">' + ICON.back + '</button><button class="brand" data-act="tab" data-tab="feed">Cupion</button><span></span></div>' +
        '<div class="profile-hero"><div class="big-ava"><span class="ring">' + phAvatar() + '</span></div><h1>Твоя анкета</h1><p class="bio">Создай профиль, чтобы оценивать и получать мэтчи.</p></div>' +
        '<div class="profile-actions"><button class="btn btn-primary" data-act="start-reg">Создать анкету</button></div></div></div>';
    }
    var primary = own
      ? '<button class="btn btn-primary" data-act="edit">Редактировать</button>'
      : '<button class="btn btn-primary" data-act="rate" data-id="' + esc(user.id) + '" data-photo="' + esc(user.photos[0] ? user.photos[0].id : '') + '">Оценить</button>';
    return '<div class="screen"><div class="scroll"><div class="profile-bar">' +
      '<button class="glass-circle" data-act="back" aria-label="Назад">' + ICON.back + '</button>' +
      '<button class="brand" data-act="tab" data-tab="feed">Cupion</button>' +
      '<button class="glass-circle" data-act="more" data-id="' + esc(user.id) + '" aria-label="Ещё">' + ICON.more + '</button></div>' +
      '<div class="profile-hero"><button class="big-ava" data-act="story" data-id="' + esc(user.id) + '"><span class="ring">' + phAvatar() + '</span></button>' +
      '<h1>' + esc(user.name) + ', ' + esc(user.age) + '</h1><div class="handle">' + esc(user.city || '') + '</div>' +
      (user.bio ? '<p class="bio">' + esc(user.bio) + '</p>' : '') + '</div>' +
      '<div class="stats"><div><b>' + esc(user.ratingLabel) + '</b><span>рейтинг</span></div>' +
      '<div><b>' + esc(compactNum(user.ratingsCount)) + '</b><span>оценок</span></div>' +
      '<div><b>' + esc(compactNum(user.matchesCount)) + '</b><span>мэтчей</span></div></div>' +
      '<div class="profile-actions">' + primary +
      '<button class="btn btn-white" data-act="story" data-id="' + esc(user.id) + '">Истории</button></div>' +
      highlightRow(user) +
      '<div class="grid">' + (user.photos || []).map(function (p) { return photoTile(p, user); }).join('') + '</div></div></div>';
  }

  /* ---------- registration ---------- */

  function regValid() {
    var r = S.reg;
    if (S.regStep === 0) {
      var age = parseInt(r.age, 10);
      return age >= 18 && age <= 99;
    }
    if (S.regStep === 1) return String(r.city || '').trim().length >= 2;
    if (S.regStep === 2) return validName(r.name);
    if (S.regStep === 3) return String(r.bio || '').trim().length >= 2;
    if (S.regStep === 4) return r.photos.length >= 1 && r.photos.length <= 6;
    return true;
  }

  function validName(s) {
    var t = String(s || '').trim();
    return t.length >= 2 && t.length <= 32 && /[A-Za-zА-Яа-яЁё]/.test(t);
  }

  function regScreen() {
    var steps = '';
    for (var i = 0; i < 5; i++) steps += '<i class="' + (i === S.regStep ? 'on' : i < S.regStep ? 'done' : '') + '"></i>';
    var back = S.regStep > 0
      ? '<button class="glass-circle" data-act="back" aria-label="Назад">' + ICON.back + '</button>'
      : '<span></span>';
    var body = '';
    var r = S.reg;
    if (S.regStep === 0) {
      var age = parseInt(r.age, 10);
      var ageMsg = r.age && age < 18 ? '<div class="bad">Cupion только с 18 лет</div>' : '<div class="ok"></div>';
      body = '<h1>Сколько тебе лет?</h1><p class="lead">Только 18+. Младше мы не пускаем.</p>' +
        '<input class="big-input" data-reg="age" inputmode="numeric" maxlength="2" placeholder="21" value="' + esc(r.age) + '" autocomplete="off">' + ageMsg;
    } else if (S.regStep === 1) {
      body = '<h1>Откуда ты?</h1><p class="lead">Город увидят в анкете.</p>' +
        '<input class="big-input" data-reg="city" maxlength="32" placeholder="Москва" value="' + esc(r.city) + '" autocomplete="address-level2">';
    } else if (S.regStep === 2) {
      body = '<h1>Как тебя зовут?</h1><p class="lead">Так имя увидят в ленте.</p>' +
        '<input class="big-input" data-reg="name" maxlength="32" placeholder="Алина" value="' + esc(r.name) + '" autocomplete="name">';
    } else if (S.regStep === 3) {
      body = '<h1>Расскажи о себе</h1><p class="lead">Короткое описание профиля.</p>' +
        '<textarea class="area" data-reg="bio" maxlength="80" placeholder="кофе, кино и поздние прогулки">' + esc(r.bio) + '</textarea>' +
        '<div class="count" data-count>' + r.bio.length + '/80</div>';
    } else {
      var tiles = r.photos.map(function (p, idx) {
        return '<div class="pick">' + phPhoto() + '<button class="rm" data-act="rm-photo" data-index="' + idx + '" aria-label="Убрать">−</button></div>';
      }).join('');
      var add = r.photos.length < 6 ? '<button class="pick-add" data-act="pick-reg" aria-label="Добавить фото">+</button>' : '';
      body = '<h1>Добавь фото</h1><p class="lead">От 1 до 6. В ленте это серые карточки, пока фото не подключены.</p><div class="pick-grid">' + tiles + add + '</div>';
    }
    var label = S.regStep === 4 ? 'Готово' : 'Дальше';
    var dir = S.regDir < 0 ? 'enter-back' : 'enter-fwd';
    return '<div class="reg ' + dir + '"><div class="reg-top">' + back + '<div class="steps">' + steps + '</div></div>' +
      '<div class="reg-body" id="reg-body">' + body + '</div><div class="reg-foot">' +
      '<button class="btn btn-primary btn-block" data-act="reg-next"' + (regValid() ? '' : ' disabled') + '>' + label + '</button>' +
      '<div class="sheet-error" id="reg-error"></div></div></div>';
  }

  function checkUsername(name) {
    S.userCheck = null;
    if (!name) return;
    CupionAPI.isUsernameAvailable(name).then(function (res) {
      if (S.reg.username !== name) return;
      S.userCheck = res;
      var el = document.querySelector('[data-user-status]');
      if (el) {
        el.className = res.ok ? 'ok' : 'bad';
        el.textContent = res.ok ? 'свободно' : 'занято или неверный формат';
      }
      var btn = document.querySelector('[data-act="reg-next"]');
      if (btn) btn.disabled = !regValid();
    }).catch(function () {});
  }

  function finishReg() {
    var err = document.getElementById('reg-error');
    CupionAPI.register(S.reg).then(function (me) {
      S.me = me;
      S.screen = 'feed';
      S.regStep = 0;
      return Promise.all([loadFeed(), loadStories(), CupionAPI.unseenCount()]);
    }).then(function (res) {
      S.unseen = res[2] || 0;
      toast('Анкета создана');
      render();
      if (S.startUser) {
        var id = S.startUser;
        S.startUser = '';
        openPerson(id);
      }
    }).catch(function (e) {
      if (err) err.textContent = e.message || 'Не получилось сохранить';
    });
  }

  /* ---------- sheets ---------- */

  function openSheet(name, payload) {
    sheetToken += 1;
    S.sheet = name;
    S.sheetPayload = payload || {};
    if (S.story) S.story.paused = true;
    sheetSig = '';
    renderSheet();
    syncBack();
    requestAnimationFrame(function () {
      var sheet = document.querySelector('.sheet');
      var bd = document.querySelector('.backdrop');
      if (sheet) sheet.classList.add('show');
      if (bd) bd.classList.add('show');
    });
  }

  function closeSheet(opts) {
    var sheet = document.querySelector('.sheet');
    var bd = document.querySelector('.backdrop');
    if (sheet && !(opts && opts.dragged)) {
      sheet.style.transform = '';
      sheet.classList.remove('show');
    }
    if (bd) bd.classList.remove('show');
    var token = ++sheetToken;
    setTimeout(function () {
      if (token !== sheetToken) return;
      S.sheet = null;
      S.sheetPayload = null;
      sheetSig = '';
      var root = document.getElementById('sheet-root');
      if (root) root.innerHTML = '';
      if (S.story) S.story.paused = false;
      syncBack();
    }, 460);
  }

  function sheetFrame(inner, foot) {
    return '<div class="backdrop" data-act="sheet-close"></div><div class="sheet" role="dialog"><div class="grabber" data-grab><i></i></div>' +
      '<div class="sheet-scroll">' + inner + '</div>' +
      (foot ? '<div class="sheet-foot">' + foot + '</div>' : '') + '</div>';
  }

  function rateSheet(p) {
    var n = S.score;
    var stars = '';
    for (var i = 1; i <= 10; i++) stars += '<button type="button" data-act="star" data-n="' + i + '" class="' + (i <= n ? 'on' : '') + '" aria-label="' + i + '">★</button>';
    return sheetFrame(
      '<h2>Оценка</h2><p class="hint">' + esc(p.name || 'анкета') + (p.city ? ' · ' + esc(p.city) : '') + '</p>' +
      '<div class="big-score"><span>★</span> <b data-score>' + n + '</b></div>' +
      '<div class="stars">' + stars + '</div>' +
      '<input class="slider" data-score-range type="range" min="1" max="10" step="1" value="' + n + '" aria-label="Оценка от 1 до 10">' +
      '<textarea class="area" id="rate-note" maxlength="180" placeholder="Комментарий — уйдёт вместе с оценкой"></textarea><div class="count"><span id="rate-count">0</span>/180</div>',
      '<button class="btn btn-primary btn-block" data-act="send-rate" data-id="' + esc(p.userId) + '" data-photo="' + esc(p.photoId || '') + '">Готово</button>'
    );
  }

  function messageSheet(p) {
    var left = S.limits && S.limits.messagesLeft != null
      ? '<p class="hint">Осталось сообщений: ' + S.limits.messagesLeft + '</p>' : '<p class="hint">для @' + esc(p.username || '') + '</p>';
    return sheetFrame(
      '<h2>Сообщение</h2>' + left +
      '<textarea class="area" id="msg-text" maxlength="180" placeholder="Напиши что-нибудь тёплое"></textarea><div class="count"><span id="msg-count">0</span>/180</div>' +
      '<div class="sheet-error" id="sheet-error"></div>',
      '<button class="btn btn-primary btn-block" data-act="send-message" data-id="' + esc(p.userId) + '" data-photo="' + esc(p.photoId || '') + '">Отправить</button>'
    );
  }

  function premiumSheet() {
    var active = S.me && S.me.premium;
    var perks = [
      [ICON.grid, 'Больше анкет за одно обновление'],
      [ICON.spark, 'Истории живут до 10 часов'],
      [ICON.video, 'Смотреть и выкладывать видео']
    ];
    var list = perks.map(function (item) {
      return '<li><i>' + item[0] + '</i><span>' + item[1] + '</span></li>';
    }).join('');
    var plans = active ? '<p class="hint">Premium уже подключён. Оплата через Telegram Stars появится позже.</p>' :
      '<button class="choice-row plan' + (S.plan === 'month' ? ' on' : '') + '" data-act="plan" data-plan="month"><span>Месяц<small>попробовать</small></span><span class="price">250 ★</span></button>' +
      '<button class="choice-row plan' + (S.plan === 'year' ? ' on' : '') + '" data-act="plan" data-plan="year"><span>Год<small class="save">Выгодно</small></span><span class="price">1490 ★</span></button>';
    var cta = active
      ? '<button class="btn btn-primary btn-block" data-act="sheet-close">Готово</button>'
      : '<button class="btn btn-primary btn-block" data-act="buy">Продолжить</button>';
    return sheetFrame(
      '<div class="pay"><div class="pay-hero"><span class="pay-badge">Premium</span></div>' +
      '<h2>Смотри больше.<br>Выделяйся.</h2><ul class="perks">' + list + '</ul>' + plans +
      '<p class="terms">Сейчас это пробное подключение. Оплата через Telegram Stars появится позже.</p></div>',
      cta
    );
  }

  function composeSheet() {
    var c = S.compose || { stage: 'menu', photos: [], caption: '' };
    if (c.stage === 'preview') {
      var tiles = c.photos.map(function () { return '<div class="pick">' + phPhoto() + '</div>'; }).join('');
      return sheetFrame(
        '<h2>' + (c.type === 'story' ? 'Новая история' : 'Новая анкета') + '</h2>' +
        '<div class="pick-grid">' + tiles + '</div>' +
        (c.type === 'story' ? '' : '<textarea class="area" id="cap-text" maxlength="80" placeholder="Короткая подпись">' + esc(c.caption || '') + '</textarea>'),
        '<button class="btn btn-primary btn-block" data-act="publish">Опубликовать</button>'
      );
    }
    var videoRow = (S.me && S.me.premium)
      ? '<button class="choice-row" data-act="pick-video"><span>Видео<small>в ленту и профиль</small></span></button>'
      : '<button class="choice-row" data-act="premium"><span>Видео<small>Premium</small></span><span class="prem-tag">Premium</span></button>';
    return sheetFrame(
      '<h2>Новая публикация</h2><p class="hint">Фото, видео или история.</p><div class="choice-list">' +
      '<button class="choice-row" data-act="pick-post"><span>Фото<small>добавится в анкету</small></span></button>' +
      videoRow +
      '<button class="choice-row" data-act="pick-story"><span>История<small>кружок на 24 часа</small></span></button></div>'
    );
  }

  function editSheet() {
    var e = S.edit;
    if (!e) return '';
    var tiles = e.photos.map(function (p, idx) {
      return '<div class="pick">' + phPhoto() + '<button class="rm" data-act="rm-edit" data-index="' + idx + '" aria-label="Убрать">−</button></div>';
    }).join('');
    var add = e.photos.length < 6 ? '<button class="pick-add" data-act="pick-edit">+</button>' : '';
    var look = function (v, label) {
      return '<button type="button" data-act="edit-look" data-value="' + v + '" class="' + (e.lookingFor === v ? 'on' : '') + '">' + label + '</button>';
    };
    var li = e.lookingFor === 'male' ? 1 : e.lookingFor === 'female' ? 2 : 0;
    return sheetFrame(
      '<h2>Анкета</h2><input class="field" id="edit-name" maxlength="32" value="' + esc(e.name) + '" placeholder="Имя">' +
      '<div style="height:10px"></div><textarea class="area" id="edit-bio" maxlength="80" placeholder="О себе">' + esc(e.bio) + '</textarea>' +
      '<div class="count">' + e.bio.length + '/80</div><div class="pick-grid">' + tiles + add + '</div>' +
      '<div class="label" style="margin:14px 0 8px;color:var(--text-2);font-size:13px">Кого показывать</div>' +
      '<div class="seg" data-i="' + li + '"><i class="seg-pill"></i>' + look('all', 'Все') + look('male', 'Парни') + look('female', 'Девушки') + '</div>' +
      '<div class="sheet-error" id="sheet-error"></div>',
      '<button class="btn btn-primary btn-block" data-act="save-edit">Сохранить</button>'
    );
  }

  function moreSheet(p) {
    var link = 'https://t.me/cupion_app?startapp=u_' + encodeURIComponent(p.username || '');
    var own = S.me && p.username === S.me.username;
    return sheetFrame(
      '<h2>@' + esc(p.username || '') + '</h2><div class="choice-list">' +
      '<button class="choice-row" data-act="share" data-link="' + esc(link) + '"><span>Поделиться</span></button>' +
      '<button class="choice-row" data-act="copy" data-link="' + esc(link) + '"><span>Скопировать ссылку</span></button>' +
      (own ? '<button class="choice-row" data-act="logout"><span>Выйти из анкеты</span></button>' : '') +
      '</div><p class="terms">Ссылка откроет анкету в @cupion_app</p>'
    );
  }

  function searchSheet() {
    var items = (S.feed || []).map(function (p) {
      return '<button class="choice-row" data-act="person" data-id="' + esc(p.id) + '"><span>' + esc(p.name) + ', ' + esc(p.age) + (p.city ? ' · ' + esc(p.city) : '') + '</span></button>';
    }).join('');
    return sheetFrame('<h2>Поиск</h2><div class="choice-list">' + (items || '<p class="hint">Пока пусто</p>') + '</div>');
  }

  function renderSheet() {
    var root = document.getElementById('sheet-root');
    if (!root) return;
    var key = S.sheet ? (S.sheet + ':' + ((S.sheetPayload && S.sheetPayload.key) || '') + ':' + ((S.compose && (S.compose.stage + ':' + (S.compose.photos ? S.compose.photos.length : 0))) || '') + ':' + ((S.edit && S.edit.photos) ? S.edit.photos.length + S.edit.lookingFor : '')) : '';
    if (key === sheetSig) return;
    sheetSig = key;
    if (!S.sheet) { root.innerHTML = ''; return; }
    var html = '';
    if (S.sheet === 'rate') html = rateSheet(S.sheetPayload || {});
    else if (S.sheet === 'message') html = messageSheet(S.sheetPayload || {});
    else if (S.sheet === 'premium') html = premiumSheet();
    else if (S.sheet === 'compose') html = composeSheet();
    else if (S.sheet === 'edit') html = editSheet();
    else if (S.sheet === 'more') html = moreSheet(S.sheetPayload || {});
    else if (S.sheet === 'search') html = searchSheet();
    root.innerHTML = html;
    requestAnimationFrame(function () {
      var sheet = root.querySelector('.sheet');
      var bd = root.querySelector('.backdrop');
      if (sheet) sheet.classList.add('show');
      if (bd) bd.classList.add('show');
    });
  }

  function paintScore(n, haptic) {
    n = Math.max(1, Math.min(10, n));
    if (haptic && n !== S.score && window.TG) TG.selection();
    S.score = n;
    var label = document.querySelector('[data-score]');
    if (label) label.textContent = String(n);
    document.querySelectorAll('.stars button').forEach(function (btn, i) {
      btn.classList.toggle('on', i < n);
    });
    var range = document.querySelector('[data-score-range]');
    if (range && String(range.value) !== String(n)) range.value = String(n);
  }

  /* ---------- stories / match / viewer ---------- */

  function storyHTML() {
    var st = S.story;
    var item = st.items[st.index];
    var bars = st.items.map(function (_, i) {
      var w = i < st.index ? 100 : 0;
      return '<b><i data-bar="' + i + '" style="width:' + w + '%"></i></b>';
    }).join('');
    return '<div class="story-layer">' + phPhoto('story-bg') +
      '<div class="story-shade"></div><div class="story-ui"><div class="bars">' + bars + '</div>' +
      '<div class="story-user">' + phAvatar() + '<span>' + esc(st.user ? st.user.name : '') + '</span>' +
      '<em>' + timeAgo(item.createdAt) + '</em></div></div>' +
      '<div class="story-actions">' + ['❤️', '😂', '😍', '😮', '🔥', '👏'].map(function (emo) {
        return '<button class="emoji-btn" data-act="react" data-emoji="' + emo + '" data-id="' + esc(st.userId) + '" data-story="' + esc(item.id) + '" aria-label="' + emo + '">' + emo + '</button>';
      }).join('') + '</div></div>';
  }

  function renderStory() {
    var root = document.getElementById('story-root');
    if (!root) return;
    if (S.viewer) {
      root.innerHTML = '<div class="viewer"><div class="viewer-top"><button class="glass-circle" data-act="close-viewer" aria-label="Назад">' + ICON.back + '</button></div>' +
        (S.viewer.video
          ? phPhoto('story-bg') + '<span class="lock-badge">Видео</span>'
          : phPhoto('story-bg')) + '</div>';
      return;
    }
    var sig = S.story ? (S.story.userId + ':' + S.story.index) : '';
    if (sig === storySig && !S.viewer) return;
    storySig = sig;
    if (!S.story) { root.innerHTML = ''; stopClock(); return; }
    var item = S.story.items[S.story.index];
    if (item && !item.seen) {
      item.seen = true;
      CupionAPI.markStorySeen(item.id).catch(function () {});
    }
    root.innerHTML = storyHTML();
    restartClock();
  }

  function startStory(userId, index) {
    if (userId === 'me' && (!S.me || !S.me.stories || !S.me.stories.length)) {
      openCompose('story');
      return;
    }
    Promise.all([CupionAPI.getStories(userId), CupionAPI.getUser(userId)]).then(function (res) {
      var items = res[0] || [];
      if (!items.length) { toast('Пока нет истории'); return; }
      S.viewer = null;
      S.story = { userId: userId, user: res[1], items: items, index: Math.min(index || 0, items.length - 1), paused: false };
      storySig = '';
      renderStory();
      syncBack();
    }).catch(function () { toast('История недоступна'); });
  }

  function nextStory() {
    var st = S.story;
    if (!st) return;
    if (st.index < st.items.length - 1) {
      st.index += 1;
      storySig = '';
      renderStory();
      return;
    }
    var ids = S.stories.map(function (u) { return u.id; });
    var at = ids.indexOf(st.userId);
    if (at >= 0 && ids[at + 1]) startStory(ids[at + 1], 0);
    else closeStory();
  }

  function prevStory() {
    var st = S.story;
    if (!st) return;
    if (st.index > 0) {
      st.index -= 1;
      storySig = '';
      renderStory();
    }
  }

  function closeStory() {
    S.story = null;
    storySig = '';
    stopClock();
    var root = document.getElementById('story-root');
    if (root && !S.viewer) root.innerHTML = '';
    syncBack();
    loadStories().then(function () { if (S.screen === 'feed') render(); }).catch(function () {});
  }

  function restartClock() {
    stopClock();
    storyAcc = 0;
    storyLast = performance.now();
    var loop = function (now) {
      if (!S.story) return;
      var dt = now - storyLast;
      storyLast = now;
      if (!S.story.paused && !S.sheet) {
        storyAcc += dt;
        var p = Math.min(1, storyAcc / 5000);
        var bar = document.querySelector('[data-bar="' + S.story.index + '"]');
        if (bar) bar.style.width = (p * 100) + '%';
        if (p >= 1) { nextStory(); return; }
      }
      storyRAF = requestAnimationFrame(loop);
    };
    storyRAF = requestAnimationFrame(loop);
  }

  function stopClock() {
    if (storyRAF) cancelAnimationFrame(storyRAF);
    storyRAF = 0;
  }

  function showMatch(user) {
    S.match = user;
    matchSig = '';
    renderMatch();
    syncBack();
    if (window.TG) TG.notify('success');
  }

  function renderMatch() {
    var root = document.getElementById('match-root');
    if (!root) return;
    var sig = S.match ? S.match.id : '';
    if (sig === matchSig) return;
    matchSig = sig;
    if (!S.match) { root.innerHTML = ''; return; }
    var u = S.match;
    var bits = '';
    var colors = ['#007AFF', '#64D2FF', '#FF9F0A', '#ffffff', '#0A84FF'];
    for (var i = 0; i < 14; i++) {
      var ang = (Math.PI * 2 * i) / 14;
      var dist = 78 + (i % 3) * 16;
      bits += '<i class="particle" style="--tx:' + Math.round(Math.cos(ang) * dist) + 'px;--ty:' + Math.round(Math.sin(ang) * dist) + 'px;--c:' + colors[i % colors.length] + '"></i>';
    }
    root.innerHTML = '<div class="match-layer"><div class="match-stage">' +
      phAvatar('match-ava a') +
      phAvatar('match-ava b') +
      '<div class="match-heart">♥</div>' + bits + '</div>' +
      '<h2>Вы замэтчились</h2><p class="subline">с ' + esc(u.name) + ' · вы оценили друг друга</p>' +
      '<button class="btn btn-primary" data-act="match-open" data-id="' + esc(u.id) + '">Смотреть профиль</button>' +
      '<button class="btn btn-glass" data-act="match-close">Продолжить</button></div>';
  }

  function closeMatch() {
    S.match = null;
    matchSig = '';
    var root = document.getElementById('match-root');
    if (root) root.innerHTML = '';
    syncBack();
  }

  function closeViewer() {
    S.viewer = null;
    var root = document.getElementById('story-root');
    if (root) root.innerHTML = S.story ? '' : '';
    storySig = '';
    if (S.story) renderStory();
    syncBack();
  }

  function openViewer(src, poster, isVideo) {
    S.viewer = { src: src, poster: poster || '', video: !!isVideo };
    if (S.story) S.story.paused = true;
    storySig = '';
    renderStory();
    syncBack();
  }

  /* ---------- tabs / stage ---------- */

  function tabs() {
    var onProfile = S.screen === 'profile' || S.screen === 'person';
    return '<div class="dock"><div class="dock-bg"></div><div class="dock-inner">' +
      '<button class="dock-btn left' + (onProfile ? ' on' : '') + '" data-act="tab" data-tab="profile" aria-label="Профиль">' + ICON.user + '</button>' +
      '<button class="dock-plus" data-act="compose" aria-label="Добавить"><span>+</span></button>' +
      '<button class="dock-btn right" data-act="search" aria-label="Поиск">' + ICON.search + '</button>' +
      '</div></div>';
  }

  function placePill(animate) {
    var bar = document.querySelector('.tabbar');
    if (!bar) return;
    var pill = bar.querySelector('.tab-pill');
    var active = bar.querySelector('.tab.active');
    if (!pill || !active) return;
    var br = bar.getBoundingClientRect();
    var ar = active.getBoundingClientRect();
    if (!ar.width) return;
    pill.style.transition = animate ? '' : 'none';
    pill.style.width = ar.width + 'px';
    pill.style.height = Math.max(40, ar.height - 8) + 'px';
    pill.style.transform = 'translate(' + (ar.left - br.left) + 'px,' + (ar.top - br.top + 4) + 'px)';
    if (!animate) {
      pill.getBoundingClientRect();
      pill.style.transition = '';
    }
  }

  function stageHTML() {
    if (S.screen === 'register') return regScreen();
    if (S.screen === 'ratings') return ratingsScreen();
    if (S.screen === 'profile') return profileView(S.me, true);
    if (S.screen === 'person') return profileView(S.person, false);
    return feedScreen();
  }

  function render() {
    var stage = document.getElementById('stage');
    var nav = document.getElementById('tabs');
    if (!stage || !nav) return;
    captureScroll();
    S.justLiked = S.justLiked;
    stage.innerHTML = stageHTML();
    nav.innerHTML = tabsVisible() ? tabs() : '';
    restoreScroll();
    renderSheet();
    renderStory();
    renderMatch();
    syncBack();
    requestAnimationFrame(function () { placePill(false); });
    S.justLiked = '';
  }

  /* ---------- actions ---------- */

  function openRate(userId, photoId) {
    var known = null;
    S.feed.forEach(function (p) { if (p.id === userId) known = p; });
    if (!known && S.person && S.person.id === userId) known = S.person;
    if (!known && S.story && S.story.userId === userId) known = S.story.user;
    S.score = (known && known.myScore) || 8;
    openSheet('rate', { userId: userId, photoId: photoId || '', name: known ? known.name : '', city: known ? known.city : '', key: userId + ':' + S.score });
  }

  function openMessage(userId, photoId) {
    CupionAPI.getLimits().then(function (lim) {
      S.limits = lim;
      if (lim.messagesLeft === 0) { openSheet('premium', { key: 'limit' }); return; }
      var known = null;
      S.feed.forEach(function (p) { if (p.id === userId) known = p; });
      if (S.story && S.story.userId === userId) known = S.story.user;
      if (S.person && S.person.id === userId) known = S.person;
      openSheet('message', { userId: userId, photoId: photoId || '', username: known ? known.username : '', key: userId });
    }).catch(function () { openSheet('message', { userId: userId, photoId: photoId || '', key: userId }); });
  }

  function openCompose(kind) {
    S.compose = { stage: 'menu', type: kind || 'photo', photos: [], caption: '' };
    openSheet('compose', { key: 'menu' });
  }

  function onClick(e) {
    if (swallowClick) { swallowClick = false; e.preventDefault(); e.stopPropagation(); return; }
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'tab') { goTab(t.getAttribute('data-tab') || 'feed'); return; }
    if (act === 'mode') {
      var mode = t.getAttribute('data-mode');
      if (mode && mode !== S.mode) {
        S.mode = mode;
        if (window.TG) TG.selection();
        loadFeed().then(render);
      }
      return;
    }
    if (act === 'refresh' || act === 'new-pill' || act === 'feed-restart') {
      var release = act === 'new-pill' ? CupionAPI.releaseNew() : Promise.resolve(false);
      if (window.TG) TG.impact('medium');
      release.then(function () {
        S.forceTop = true;
        return loadFeed(act !== 'feed-restart');
      }).then(function () { return loadStories(); }).then(render).catch(function () {});
      return;
    }
    if (act === 'rtab') {
      S.ratingsTab = t.getAttribute('data-tab') || 'in';
      if (window.TG) TG.selection();
      render();
      return;
    }
    if (act === 'person') {
      if (S.sheet) closeSheet();
      openPerson(t.getAttribute('data-id'));
      return;
    }
    if (act === 'search') { openSheet('search', { key: 'search' }); return; }
    if (act === 'start-reg') { S.screen = 'register'; S.regStep = 0; render(); return; }
    if (act === 'back') { goBack(); return; }
    if (act === 'rate') { if (needAccount()) return; if (window.TG) TG.impact('light'); openRate(t.getAttribute('data-id'), t.getAttribute('data-photo')); return; }
    if (act === 'message') { if (needAccount()) return; openMessage(t.getAttribute('data-id'), t.getAttribute('data-photo')); return; }
    if (act === 'premium') { openSheet('premium', { key: 'premium' }); return; }
    if (act === 'compose') { if (needAccount()) return; openCompose('photo'); return; }
    if (act === 'add-story') { e.stopPropagation(); if (needAccount()) return; openCompose('story'); return; }
    if (act === 'my-story') {
      if (!S.me) { S.screen = 'register'; render(); return; }
      if (S.me.stories && S.me.stories.length) startStory('me', 0);
      else openCompose('story');
      return;
    }
    if (act === 'story') { startStory(t.getAttribute('data-id'), parseInt(t.getAttribute('data-index') || '0', 10)); return; }
    if (act === 'react') {
      if (needAccount()) return;
      var btn = t;
      CupionAPI.reactStory({ toId: t.getAttribute('data-id'), storyId: t.getAttribute('data-story'), emoji: t.getAttribute('data-emoji') }).then(function () {
        btn.classList.remove('pop');
        btn.offsetWidth;
        btn.classList.add('pop');
        if (window.TG) TG.impact('light');
        toast('Реакция отправлена');
      }).catch(function (err) { toast(err.message || 'Не вышло'); });
      return;
    }
    if (act === 'tg') {
      var nick = t.getAttribute('data-user');
      if (!nick) return;
      var link = 'https://t.me/' + nick;
      if (window.TG && TG.openLink) TG.openLink(link);
      else window.open(link, '_blank', 'noopener');
      return;
    }
    if (act === 'play') { openViewer(t.getAttribute('data-src'), t.getAttribute('data-poster'), true); return; }
    if (act === 'view-photo') { openViewer(t.getAttribute('data-poster') || t.getAttribute('data-src'), '', false); return; }
    if (act === 'close-viewer') { closeViewer(); return; }
    if (act === 'sheet-close') {
      if (e.target.classList.contains('backdrop') || t.getAttribute('data-act') === 'sheet-close') closeSheet();
      return;
    }
    if (act === 'star') { paintScore(parseInt(t.getAttribute('data-n'), 10), true); return; }
    if (act === 'send-rate') {
      var id = t.getAttribute('data-id');
      var photo = t.getAttribute('data-photo');
      var note = (document.getElementById('rate-note') || {}).value || '';
      CupionAPI.rate({ toId: id, photoId: photo, score: S.score, text: note }).then(function (res) {
        S.feed.forEach(function (p) { if (p.id === id) p.myScore = res.score; });
        if (S.person && S.person.id === id) S.person.myScore = res.score;
        S.justLiked = id;
        closeSheet();
        if (res.match) {
          return CupionAPI.getUser(id).then(function (user) {
            return refreshMe().then(function () { showMatch(user); render(); });
          });
        }
        if (window.TG) TG.impact('light');
        return loadRatings().then(render);
      }).catch(function (err) { toast(err.message || 'Не вышло'); });
      return;
    }
    if (act === 'send-message') {
      var text = (document.getElementById('msg-text') || {}).value || '';
      CupionAPI.sendMessage({ toId: t.getAttribute('data-id'), photoId: t.getAttribute('data-photo'), text: text }).then(function (res) {
        if (res && res.ok === false && res.reason === 'limit') { openSheet('premium', { key: 'limit' }); return; }
        closeSheet();
        toast('Сообщение отправлено');
        if (window.TG) TG.notify('success');
        loadRatings().then(function () { if (S.screen === 'ratings') render(); });
      }).catch(function (err) {
        var box = document.getElementById('sheet-error');
        if (box) box.textContent = err.message || 'Не вышло';
        else toast(err.message || 'Не вышло');
      });
      return;
    }
    if (act === 'plan') { S.plan = t.getAttribute('data-plan') || 'year'; sheetSig = ''; renderSheet(); return; }
    if (act === 'buy') {
      CupionAPI.setPremium(true).then(function (me) {
        S.me = me;
        closeSheet();
        toast('Premium подключён');
        if (window.TG) TG.notify('success');
        return loadFeed();
      }).then(render).catch(function (err) { toast(err.message || 'Не вышло'); });
      return;
    }
    if (act === 'pick-post') { S.compose.type = 'photo'; pickFiles('post'); return; }
    if (act === 'pick-story') { S.compose.type = 'story'; pickFiles('story'); return; }
    if (act === 'pick-video') { S.compose.type = 'video'; pickFiles('video'); return; }
    if (act === 'pick-reg') { pickFiles('reg'); return; }
    if (act === 'pick-edit') { pickFiles('edit'); return; }
    if (act === 'publish') { publishCompose(); return; }
    if (act === 'rm-photo') {
      S.reg.photos.splice(parseInt(t.getAttribute('data-index'), 10), 1);
      render();
      return;
    }
    if (act === 'rm-edit') {
      if (S.edit.photos.length <= 1) { toast('Нужно хотя бы одно фото'); return; }
      S.edit.photos.splice(parseInt(t.getAttribute('data-index'), 10), 1);
      sheetSig = '';
      renderSheet();
      return;
    }
    if (act === 'gender') { S.reg.gender = t.getAttribute('data-value'); if (window.TG) TG.selection(); render(); return; }
    if (act === 'look') { S.reg.lookingFor = t.getAttribute('data-value'); if (window.TG) TG.selection(); render(); return; }
    if (act === 'reg-next') { advanceReg(); return; }
    if (act === 'skip-bio') { S.reg.bio = ''; finishReg(); return; }
    if (act === 'edit') {
      S.edit = {
        name: S.me.name,
        bio: S.me.bio || '',
        lookingFor: S.me.lookingFor || 'all',
        photos: (S.me.photos || []).map(function (p) { return { id: p.id, url: p.url, type: p.type, poster: p.poster || '' }; })
      };
      openSheet('edit', { key: 'edit' });
      return;
    }
    if (act === 'edit-look') {
      S.edit.lookingFor = t.getAttribute('data-value');
      sheetSig = '';
      renderSheet();
      return;
    }
    if (act === 'save-edit') { saveEdit(); return; }
    if (act === 'more') {
      var uid = t.getAttribute('data-id');
      var user = (S.me && uid === S.me.id) ? S.me : S.person;
      if (!user) return;
      openSheet('more', { username: user.username, key: 'more-' + user.username });
      return;
    }
    if (act === 'share') {
      var link = t.getAttribute('data-link');
      if (window.TG) TG.openLink('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent('Моя анкета в Cupion'));
      return;
    }
    if (act === 'copy') { copyText(t.getAttribute('data-link')); return; }
    if (act === 'theme') {
      var theme = t.getAttribute('data-theme');
      CupionAPI.setTheme(theme).then(function (saved) {
        applyTheme(saved);
        try { localStorage.setItem('cupion-theme', saved); } catch (err) {}
        render();
      }).catch(function () {});
      if (window.TG) TG.selection();
      return;
    }
    if (act === 'logout') {
      CupionAPI.logout().then(function () {
        S.me = null;
        S.screen = 'register';
        S.reg = emptyReg();
        S.regStep = 0;
        prefill();
        closeSheet();
        render();
      }).catch(function () {});
      return;
    }
    if (act === 'match-open') {
      var mid = t.getAttribute('data-id');
      closeMatch();
      openPerson(mid);
      return;
    }
    if (act === 'match-close') { closeMatch(); render(); return; }
  }

  function advanceReg() {
    if (!regValid()) {
      var body = document.getElementById('reg-body');
      if (body) {
        body.classList.remove('shake');
        body.offsetWidth;
        body.classList.add('shake');
      }
      if (S.regStep === 0 && parseInt(S.reg.age, 10) < 18) {
        var err = document.getElementById('reg-error');
        if (err) err.textContent = 'Cupion только с 18 лет';
      }
      if (window.TG) TG.notify('error');
      return;
    }
    if (S.regStep >= 4) { finishReg(); return; }
    S.regDir = 1;
    S.regStep += 1;
    if (S.regStep === 2 && S.reg.username) checkUsername(S.reg.username);
    if (window.TG) TG.impact('light');
    render();
  }

  function saveEdit() {
    var name = (document.getElementById('edit-name') || {}).value || S.edit.name;
    var bio = (document.getElementById('edit-bio') || {}).value || '';
    if (!validName(name)) {
      var box = document.getElementById('sheet-error');
      if (box) box.textContent = 'Имя слишком короткое';
      return;
    }
    S.edit.name = name.trim();
    S.edit.bio = bio.trim();
    CupionAPI.updateMe({ name: S.edit.name, bio: S.edit.bio, lookingFor: S.edit.lookingFor, photos: S.edit.photos }).then(function (me) {
      S.me = me;
      closeSheet();
      toast('Анкета обновлена');
      render();
    }).catch(function (err) { toast(err.message || 'Не вышло'); });
  }

  function publishCompose() {
    var c = S.compose;
    if (!c || !c.photos.length) return;
    if (c.type === 'story') {
      CupionAPI.addStory({ url: c.photos[0].url }).then(function () { return refreshMe(); }).then(function () {
        closeSheet();
        toast('История добавлена');
        render();
      }).catch(function (err) { toast(err.message || 'Не вышло'); });
      return;
    }
    var cap = (document.getElementById('cap-text') || {}).value || '';
    CupionAPI.addPost({ type: c.type === 'video' ? 'video' : 'photo', photos: c.photos, caption: cap }).then(function (res) {
      if (res && res.ok === false && res.reason === 'premium') { openSheet('premium', { key: 'video' }); return; }
      S.me = res.me || S.me;
      closeSheet();
      toast('Опубликовано');
      render();
    }).catch(function (err) { toast(err.message || 'Не вышло'); });
  }

  function copyText(text) {
    var done = function () { toast('Ссылка скопирована'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  function onInput(e) {
    var t = e.target;
    if (t.dataset && t.dataset.reg) {
      var key = t.dataset.reg;
      var value = t.value;
      if (key === 'age') {
        value = value.replace(/\D/g, '').slice(0, 2);
        if (value !== t.value) t.value = value;
      }
      if (key === 'username') {
        value = value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
        if (value !== t.value) t.value = value;
        S.reg.username = value;
        checkUsername(value);
      } else S.reg[key] = value;
      if (key === 'bio') {
        var count = document.querySelector('[data-count]');
        if (count) count.textContent = value.length + '/80';
      }
      var btn = document.querySelector('[data-act="reg-next"]');
      if (btn) btn.disabled = !regValid();
      var err = document.getElementById('reg-error');
      if (err && key === 'age') err.textContent = (parseInt(value, 10) > 0 && parseInt(value, 10) < 18) ? 'Cupion только с 18 лет' : '';
    }
    if (t.id === 'msg-text' || t.id === 'rate-note') {
      var c = document.getElementById(t.id === 'rate-note' ? 'rate-count' : 'msg-count');
      if (c) c.textContent = String(t.value.length);
    }
    if (t.id === 'edit-bio' && S.edit) S.edit.bio = t.value;
    if (t.id === 'edit-name' && S.edit) S.edit.name = t.value;
  }

  function onRange(e) {
    if (e.target && e.target.hasAttribute('data-score-range')) paintScore(parseInt(e.target.value, 10), true);
  }

  /* ---------- files ---------- */

  function pickFiles(purpose) {
    S.pickPurpose = purpose;
    var input = document.getElementById(purpose === 'video' ? 'pick-video' : 'pick-images');
    if (!input) return;
    input.value = '';
    input.click();
  }

  function readImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = 1280;
        var w = img.width;
        var h = img.height;
        var scale = Math.min(1, max / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать фото')); };
      img.src = url;
    });
  }

  function readVideo(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = url;
      var finish = function (poster) { resolve({ url: url, poster: poster || '', type: 'video' }); };
      video.onloadeddata = function () {
        try { video.currentTime = Math.min(0.2, (video.duration || 1) / 3); } catch (e) { finish(''); }
      };
      video.onseeked = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 600;
          canvas.getContext('2d').drawImage(video, 0, 0, 480, 600);
          finish(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) { finish(''); }
      };
      video.onerror = function () { finish(''); };
    });
  }

  function onFiles(e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    if (!files.length) return;
    var purpose = S.pickPurpose;
    if (purpose === 'video') {
      readVideo(files[0]).then(function (vid) {
        S.compose.type = 'video';
        S.compose.photos = [vid];
        S.compose.stage = 'preview';
        sheetSig = '';
        renderSheet();
      });
      return;
    }
    var room = purpose === 'reg' ? Math.max(0, 6 - S.reg.photos.length) : purpose === 'edit' ? Math.max(0, 6 - S.edit.photos.length) : 6;
    Promise.all(files.slice(0, room || 1).map(readImage)).then(function (urls) {
      var pics = urls.map(function (url) { return { url: url, type: 'photo' }; });
      if (purpose === 'reg') {
        S.reg.photos = S.reg.photos.concat(pics).slice(0, 6);
        render();
      } else if (purpose === 'edit') {
        S.edit.photos = S.edit.photos.concat(pics).slice(0, 6);
        sheetSig = '';
        renderSheet();
      } else if (purpose === 'story') {
        S.compose.type = 'story';
        S.compose.photos = pics.slice(0, 1);
        S.compose.stage = 'preview';
        sheetSig = '';
        renderSheet();
      } else {
        S.compose.type = 'photo';
        S.compose.photos = pics.slice(0, 6);
        S.compose.stage = 'preview';
        sheetSig = '';
        renderSheet();
      }
    }).catch(function (err) { toast(err.message || 'Фото не прочиталось'); });
  }

  /* ---------- gestures ---------- */

  function onPointerDown(e) {
    if (e.button != null && e.button !== 0) return;
    var story = e.target.closest('.story-layer');
    if (story && !e.target.closest('button')) {
      gesture = { kind: 'story', x: e.clientX, y: e.clientY, layer: story };
      gesture.hold = setTimeout(function () {
        if (S.story) S.story.paused = true;
        gesture.held = true;
      }, 180);
      return;
    }
    var viewer = e.target.closest('.viewer');
    if (viewer && !e.target.closest('button, video')) {
      gesture = { kind: 'viewer', x: e.clientX, y: e.clientY, layer: viewer };
      return;
    }
    var grab = e.target.closest('[data-grab]');
    var sheet = e.target.closest('.sheet');
    if (sheet && (grab || !e.target.closest('input, textarea, button, a'))) {
      var sc = sheet.querySelector('.sheet-scroll');
      if (grab || !sc || sc.scrollTop <= 0) {
        gesture = { kind: 'sheet', y: e.clientY, sheet: sheet, scTop: sc ? sc.scrollTop : 0 };
      }
      return;
    }
    var clip = e.target.closest('[data-swipe]');
    if (clip && !e.target.closest('button')) {
      gesture = { kind: 'photo-wait', x: e.clientX, y: e.clientY, id: clip.getAttribute('data-swipe'), clip: clip };
      return;
    }
    var scroll = e.target.closest('#feed-scroll');
    if (scroll && scroll.scrollTop <= 0 && !e.target.closest('button')) {
      gesture = { kind: 'pull-wait', x: e.clientX, y: e.clientY, scroll: scroll };
    }
  }

  function onPointerMove(e) {
    if (!gesture) return;
    var dx = e.clientX - (gesture.x || 0);
    var dy = e.clientY - (gesture.y || 0);
    if (gesture.kind === 'story') {
      if (dy > 16 && dy > Math.abs(dx)) {
        clearTimeout(gesture.hold);
        if (S.story) S.story.paused = false;
        gesture.kind = 'story-drag';
        gesture.layer.style.transition = 'none';
      }
    }
    if (gesture.kind === 'story-drag' || gesture.kind === 'viewer') {
      var down = Math.max(0, e.clientY - gesture.y);
      gesture.layer.style.transform = 'translateY(' + down + 'px)';
      gesture.drag = down;
      return;
    }
    if (gesture.kind === 'sheet') {
      var pull = e.clientY - gesture.y;
      if (pull > 0 && gesture.scTop <= 0) {
        gesture.sheet.style.transition = 'none';
        gesture.sheet.style.transform = 'translateY(' + pull + 'px)';
        gesture.drag = pull;
      }
      return;
    }
    if (gesture.kind === 'photo-wait') {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        gesture.kind = 'photo';
        gesture.w = gesture.clip.clientWidth || 1;
        var track = gesture.clip.querySelector('[data-track]');
        gesture.track = track;
        if (track) track.style.transition = 'none';
      } else if (Math.abs(dy) > 10) gesture = null;
    }
    if (gesture && gesture.kind === 'photo' && gesture.track) {
      var idx = S.photoIndex[gesture.id] || 0;
      gesture.track.style.transform = 'translateX(' + ((-idx * gesture.w) + (e.clientX - gesture.x)) + 'px)';
      gesture.drag = e.clientX - gesture.x;
      return;
    }
    if (gesture.kind === 'pull-wait') {
      var py = e.clientY - gesture.y;
      if (gesture.scroll.scrollTop <= 0 && py > 8 && py > Math.abs(e.clientX - gesture.x)) gesture.kind = 'pull';
      else if (Math.abs(e.clientX - gesture.x) > 8) gesture = null;
    }
    if (gesture && gesture.kind === 'pull') {
      var dist = Math.min(96, (e.clientY - gesture.y) * 0.45);
      var indicator = document.getElementById('pull');
      if (indicator) indicator.style.height = dist + 'px';
      gesture.drag = dist;
    }
  }

  function onPointerUp() {
    if (!gesture) return;
    clearTimeout(gesture.hold);
    var g = gesture;
    gesture = null;
    if (g.kind === 'photo' && g.track) {
      g.track.style.transition = '';
      var idx = S.photoIndex[g.id] || 0;
      var post = null;
      S.feed.forEach(function (p) { if (p.id === g.id) post = p; });
      var next = idx;
      if (g.drag > 40) next = idx - 1;
      if (g.drag < -40) next = idx + 1;
      if (post) next = Math.max(0, Math.min(post.photos.length - 1, next));
      S.photoIndex[g.id] = next;
      g.track.style.transform = 'translateX(-' + (next * 100) + '%)';
      var dots = document.querySelector('[data-dots="' + g.id + '"]');
      if (dots) Array.prototype.forEach.call(dots.children, function (dot, i) { dot.classList.toggle('on', i === next); });
      if (post) {
        var card = document.querySelector('[data-post="' + g.id + '"]');
        var photo = post.photos[next];
        if (card && photo) {
          var rate = card.querySelector('[data-act="rate"]');
          var msg = card.querySelector('[data-act="message"]');
          if (rate) rate.setAttribute('data-photo', photo.id);
          if (msg) msg.setAttribute('data-photo', photo.id);
        }
      }
      if (Math.abs(g.drag || 0) > 8) swallowClick = true;
      return;
    }
    if (g.kind === 'sheet') {
      if ((g.drag || 0) > 90) {
        g.sheet.style.transition = '';
        g.sheet.style.transform = 'translateY(110%)';
        swallowClick = true;
        closeSheet({ dragged: true });
      } else {
        g.sheet.style.transition = '';
        g.sheet.style.transform = '';
      }
      return;
    }
    if (g.kind === 'story-drag' || g.kind === 'viewer') {
      if ((g.drag || 0) > 90) {
        swallowClick = true;
        if (g.kind === 'viewer') closeViewer();
        else closeStory();
      } else if (g.layer) {
        g.layer.style.transition = 'transform .45s cubic-bezier(0.32,0.72,0,1)';
        g.layer.style.transform = '';
      }
      return;
    }
    if (g.kind === 'story') {
      if (g.held) { if (S.story) S.story.paused = false; return; }
      var rect = g.layer.getBoundingClientRect();
      var x = g.x - rect.left;
      if (x < rect.width * 0.35) prevStory();
      else nextStory();
      return;
    }
    if (g.kind === 'pull') {
      var indicator = document.getElementById('pull');
      if ((g.drag || 0) > 64) {
        if (indicator) indicator.style.height = '48px';
        if (window.TG) TG.impact('medium');
        loadFeed(true).then(function () {
          if (indicator) indicator.style.height = '0px';
          render();
        }).catch(function () { if (indicator) indicator.style.height = '0px'; });
      } else if (indicator) indicator.style.height = '0px';
    }
  }

  function prefill() {
    var u = window.TG ? TG.user() : null;
    if (!u) return;
    if (!S.reg.name) S.reg.name = [u.first_name, u.last_name].filter(Boolean).join(' ');
    if (u.username) S.reg.username = String(u.username).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
  }

  function boot() {
    var root = document.getElementById('app');
    if (!root) return;
    root.innerHTML = '<div id="stage"></div><div id="tabs"></div><div id="sheet-root"></div><div id="story-root"></div><div id="match-root"></div><div id="toast-root"></div>' +
      '<input id="pick-images" type="file" accept="image/*" multiple hidden><input id="pick-video" type="file" accept="video/*" hidden>';
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', function (e) {
      if (e.target && (e.target.id === 'pick-images' || e.target.id === 'pick-video')) onFiles(e);
    });
    document.addEventListener('input', onRange);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') goBack();
      if (S.story && e.key === 'ArrowRight') nextStory();
      if (S.story && e.key === 'ArrowLeft') prevStory();
    });
    window.addEventListener('resize', function () { placePill(false); });
    document.addEventListener('cupion-insets', function () { placePill(false); });
    document.addEventListener('cupion-theme', function () { if (S.theme === 'auto') applyTheme('auto'); });
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onScheme = function () { if (S.theme === 'auto') applyTheme('auto'); };
      if (mq.addEventListener) mq.addEventListener('change', onScheme);
    }
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG' || img.dataset.fallbackApplied || !img.dataset.fallback) return;
      img.dataset.fallbackApplied = '1';
      img.src = img.dataset.fallback;
    }, true);
    if (window.TG) TG.init();
    prefill();
    var start = window.TG ? String(TG.startParam() || '') : '';
    if (start.indexOf('u_') === 0) S.startUser = decodeURIComponent(start.slice(2));
    applyTheme();
    CupionAPI.getMe().then(function (me) {
      S.me = me;
      if (!me) {
        S.screen = 'register';
        S.loading = false;
        render();
        return null;
      }
      S.screen = 'feed';
      return Promise.all([loadFeed(), loadStories(), CupionAPI.unseenCount(), loadRatings()]);
    }).then(function (res) {
      if (!res) return;
      S.unseen = res[2] || 0;
      render();
      if (S.startUser && S.me) {
        var id = S.startUser;
        S.startUser = '';
        openPerson(id);
      }
    }).catch(function (err) {
      console.error(err);
      S.loading = false;
      render();
    });
    setInterval(function () {
      if (!S.stories || S.stories.length < 2 || S.screen !== 'feed') return;
      S.storyShift = (S.storyShift || 0) + 1;
      S.cycle = true;
      var node = document.querySelector('.orbit');
      if (node) node.outerHTML = orbit();
      S.cycle = false;
    }, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
