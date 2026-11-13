/* Cupion UI. Screens, sheets, stories, and the мэтч animation. */
(function () {
  'use strict';

  var BUBBLES = [
    { x: '10%', y: '22%', s: 36 }, { x: '22%', y: '16%', s: 28 }, { x: '16%', y: '62%', s: 48 },
    { x: '8%', y: '78%', s: 26 }, { x: '32%', y: '28%', s: 32 }, { x: '30%', y: '74%', s: 40 },
    { x: '44%', y: '14%', s: 30 }, { x: '42%', y: '84%', s: 26 }, { x: '62%', y: '18%', s: 38 },
    { x: '58%', y: '80%', s: 32 }, { x: '74%', y: '26%', s: 28 }, { x: '80%', y: '62%', s: 50 },
    { x: '90%', y: '18%', s: 30 }, { x: '92%', y: '76%', s: 36 }, { x: '70%', y: '84%', s: 26 },
    { x: '24%', y: '88%', s: 26 }, { x: '86%', y: '44%', s: 26 }, { x: '68%', y: '46%', s: 28 },
    { x: '12%', y: '42%', s: 26 }
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
    hasNew: false,
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
    plan: 'trial',
    limits: null,
    justLiked: '',
    compose: null,
    edit: null,
    startUser: '',
    peek: null,
    storyReturn: null
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

  function svg(inner, filled) {
    var fill = filled ? 'currentColor' : 'none';
    var stroke = filled ? 'none' : 'currentColor';
    var width = filled ? '0' : '1.9';
    return '<svg viewBox="0 0 24 24" width="24" height="24" preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  function iconPair(line, filled) {
    return '<span class="ico ico-line">' + line + '</span><span class="ico ico-fill">' + filled + '</span>';
  }

  var ICON = {
    heart: svg('<path d="M12 19.6c-.35 0-7.2-4.15-7.2-8.9A3.7 3.7 0 0 1 12 7.55a3.7 3.7 0 0 1 7.2 3.15c0 4.75-6.85 8.9-7.2 8.9z"/>'),
    heartFill: svg('<path d="M12 20.1c-.4 0-7.55-4.35-7.55-9.25A3.9 3.9 0 0 1 12 7.15a3.9 3.9 0 0 1 7.55 3.7c0 4.9-7.15 9.25-7.55 9.25z"/>', true),
    grid: svg('<rect x="4.2" y="4.2" width="6.4" height="6.4" rx="1.7"/><rect x="13.4" y="4.2" width="6.4" height="6.4" rx="1.7"/><rect x="4.2" y="13.4" width="6.4" height="6.4" rx="1.7"/><rect x="13.4" y="13.4" width="6.4" height="6.4" rx="1.7"/>'),
    user: svg('<circle cx="12" cy="7.8" r="4"/><path d="M4.4 20.4c.8-3.7 3.5-5.6 7.6-5.6s6.8 1.9 7.6 5.6"/>'),
    userFill: svg('<circle cx="12" cy="7.8" r="4.15"/><path d="M4.2 20.8c.9-4 3.7-6.1 7.8-6.1s6.9 2.1 7.8 6.1c.12.5-.25.8-.75.8H4.95c-.5 0-.87-.3-.75-.8z"/>', true),
    home: svg('<path d="M4.2 11.2 12 4.2l7.8 7V19.4c0 .8-.6 1.4-1.4 1.4h-4.1v-5.2H9.7v5.2H5.6c-.8 0-1.4-.6-1.4-1.4z"/>'),
    homeFill: svg('<path d="M3.6 11.4 12 3.6l8.4 7.8v8.2c0 1-.8 1.8-1.8 1.8h-3.7v-5.6H9.1v5.6H5.4c-1 0-1.8-.8-1.8-1.8z"/>', true),
    plus: svg('<path d="M12 4.2v15.6M4.2 12h15.6"/>'),
    refresh: svg('<path d="M19.2 12a7.2 7.2 0 1 1-2.1-5.1"/><path d="M19.2 4.6V8.7h-4.1"/>'),
    play: svg('<path d="M9.1 7.15v9.7l8.05-4.85L9.1 7.15z"/>', true),
    lock: svg('<rect x="6.2" y="10.3" width="11.6" height="8.5" rx="2"/><path d="M8.7 10.3V8.15a3.3 3.3 0 0 1 6.6 0v2.15"/>'),
    mail: svg('<rect x="3.8" y="5.8" width="16.4" height="12.4" rx="2.2"/><path d="M4.6 8l7.4 5.1L19.4 8"/>'),
    back: svg('<path d="M15.2 4.2 7 12l8.2 7.8"/>'),
    more: svg('<circle cx="6.5" cy="12" r="1.15"/><circle cx="12" cy="12" r="1.15"/><circle cx="17.5" cy="12" r="1.15"/>', true),
    star: svg('<path d="M12 3.9l1.9 4.15 4.5.5-3.35 3.05.95 4.45L12 13.95 8 16.05l.95-4.45L5.6 8.55l4.5-.5L12 3.9z"/>'),
    eye: svg('<path d="M2.8 12S6.1 6.8 12 6.8 21.2 12 21.2 12 17.9 17.2 12 17.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.3"/>'),
    send: svg('<path d="M4.8 12h14.2"/><path d="M13 6.4L18.6 12 13 17.6"/>'),
    video: svg('<rect x="3.7" y="6.3" width="11.2" height="11.4" rx="2"/><path d="M15 10.15l4.6-2.4v8.5L15 13.85"/>'),
    speaker: svg('<path d="M4.5 9.5h3.2L12 6.2v11.6L7.7 14.5H4.5z"/><path d="M15.2 9.4a3.2 3.2 0 0 1 0 5.2"/>'),
    speakerOn: svg('<path d="M4.5 9.5h3.2L12 6.2v11.6L7.7 14.5H4.5z"/><path d="M15.2 9.4a3.2 3.2 0 0 1 0 5.2M17.4 7.2a6 6 0 0 1 0 9.6"/>'),
    spark: svg('<path d="M12 3.2v3.4M12 17.4v3.4M4.6 4.6l2.4 2.4M17 17l2.4 2.4M3.2 12h3.4M17.4 12h3.4M4.6 19.4l2.4-2.4M17 7l2.4-2.4"/>'),
    search: svg('<circle cx="11" cy="11" r="6"/><path d="M15.7 15.7L20.2 20.2"/>'),
    trophy: svg('<path d="M6.8 2.6h10.4v4a5.2 5.2 0 0 1-10.4 0v-4z"/><path d="M6.8 4.6H3.2a3.5 3.5 0 0 0 3.7 4.6"/><path d="M17.2 4.6h3.6a3.5 3.5 0 0 1-3.7 4.6"/><path d="M12 12.2V15"/><path d="M8 21.2h8"/><path d="M9.3 15h5.4v2.5c0 1-.7 1.7-1.6 1.7h-2.2c-.9 0-1.6-.7-1.6-1.7V15z"/>'),
    trophyFill: svg('<path d="M6.6 2.3h10.8v4.2a5.4 5.4 0 0 1-10.8 0V2.3zM6.7 4.5H2.8a3.7 3.7 0 0 0 4 5M17.3 4.5h3.9a3.7 3.7 0 0 1-4 5M9.6 12.4h4.8V15h2.3c.8 0 1.3.6 1.3 1.4V21H6v-4.6c0-.8.5-1.4 1.3-1.4h2.3v-2.6zM7.2 20.4h9.6V22H7.2z"/>', true)
  };

  var SIL = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="9" fill="#C4CAD3"/><path fill="#C4CAD3" d="M16 52c2.8-9 8.6-13.5 16-13.5S45.2 43 48 52"/></svg>';
  var GLYPH = '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><rect x="4" y="10" width="56" height="44" rx="8" fill="none" stroke="#C4CAD3" stroke-width="3.4"/><circle cx="22" cy="26" r="5" fill="#C4CAD3"/><path d="M8 48l16-14 12 9 7-6 13 11" fill="none" stroke="#C4CAD3" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/></svg>';

  function phAvatar(extra) {
    return '<span class="ph ph-ava' + (extra ? ' ' + extra : '') + '">' + SIL + '</span>';
  }

  function phPhoto(extra) {
    return '<span class="ph ph-photo' + (extra ? ' ' + extra : '') + '">' + GLYPH + '</span>';
  }

  function ph() { return phAvatar(); }

  function premMark() {
    return '<span class="prem" aria-label="Premium"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="#fff" d="M6.15 8.15 4.4 6.4 3.2 7.6l2.95 2.95 6.1-6.1-1.2-1.2z"/></svg></span>';
  }

  function avgScore(post) {
    var n = Number(post && post.rating10);
    if (!n) return '';
    return n.toFixed(1);
  }

  function ownUrl(url) {
    return !!url && (String(url).indexOf('data:') === 0 || String(url).indexOf('blob:') === 0);
  }

  function assetUrl(url) {
    return !!url && String(url).indexOf('assets/') === 0;
  }

  var mediaCache = {};
  var mediaDbPromise = null;

  function mediaDatabase() {
    if (!window.indexedDB) return Promise.reject(new Error('Нет хранилища для фото'));
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open('cupion.media', 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains('files')) req.result.createObjectStore('files');
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Нет хранилища для фото')); };
    });
    return mediaDbPromise;
  }

  function putMedia(blob) {
    var id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return mediaDatabase().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(blob, id);
        tx.oncomplete = function () { resolve(id); };
        tx.onerror = function () { reject(tx.error || new Error('Не удалось сохранить фото')); };
      });
    }).then(function (id) {
      mediaCache[id] = URL.createObjectURL(blob);
      return 'idb:' + id;
    });
  }

  function displayUrl(url) {
    if (!url) return '';
    var value = String(url);
    if (value.indexOf('idb:') !== 0) return value;
    return mediaCache[value.slice(4)] || '';
  }

  function resolveMedia(url) {
    if (!url || String(url).indexOf('idb:') !== 0) return Promise.resolve(url || '');
    var id = String(url).slice(4);
    if (mediaCache[id]) return Promise.resolve(mediaCache[id]);
    return mediaDatabase().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction('files', 'readonly').objectStore('files').get(id);
        req.onsuccess = function () {
          if (!req.result) { mediaCache[id] = ''; resolve(''); return; }
          mediaCache[id] = URL.createObjectURL(req.result);
          resolve(mediaCache[id]);
        };
        req.onerror = function () { reject(req.error); };
      });
    }).catch(function () { return ''; });
  }

  function collectMedia(obj, bucket) {
    if (!obj) return;
    (obj.photos || []).forEach(function (p) {
      if (p && p.url) bucket.push(p.url);
      if (p && p.poster) bucket.push(p.poster);
    });
    (obj.stories || []).forEach(function (s) {
      if (s && s.url) bucket.push(s.url);
      if (s && s.poster) bucket.push(s.poster);
    });
  }

  function unresolvedMedia() {
    var urls = [];
    collectMedia(S.me, urls);
    (S.feed || []).forEach(function (p) { collectMedia(p, urls); });
    if (S.person) collectMedia(S.person, urls);
    return urls.some(function (u) {
      if (!u || String(u).indexOf('idb:') !== 0) return false;
      return !Object.prototype.hasOwnProperty.call(mediaCache, String(u).slice(4));
    });
  }

  function realImg(url, extra) {
    var src = displayUrl(url);
    if (!ownUrl(src)) return '';
    return '<img class="real-media' + (extra ? ' ' + extra : '') + '" src="' + esc(src) + '" alt="">';
  }

  function realVideo(url, poster) {
    var src = displayUrl(url);
    var posterSrc = displayUrl(poster);
    if (!ownUrl(src)) return '';
    return '<video class="real-media" src="' + esc(src) + '" playsinline' + (ownUrl(posterSrc) ? ' poster="' + esc(posterSrc) + '"' : '') + '></video>';
  }

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
    return !S.story && !S.viewer && !S.peek && S.screen !== 'register';
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
    var needs = !!(S.sheet || S.story || S.viewer || S.match || S.peek || S.screen === 'person' || (S.screen === 'register' && S.regStep > 0));
    if (!window.TG) return;
    if (needs) TG.showBack(goBack);
    else TG.hideBack();
  }

  function goBack() {
    if (S.peek) { closePeek(); return; }
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
      var back = S.storyReturn;
      if (back && S.stack.length < back.depth) {
        S.storyReturn = null;
        startStory(back.userId, back.index, function () {
          if (back.sheet && back.sheet.name === 'reactions') openSheet('reactions', back.sheet.payload);
        });
      }
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
    S.storyReturn = null;
    S.person = null;
    S.personId = null;
    S.screen = tab;
    S.spring = 'tab';
    if (tab === 'ratings') {
      S.unseen = 0;
      CupionAPI.markRatingsSeen().catch(function () {});
      loadRatings().then(render);
    }
    if (tab === 'rating') loadBoard().then(render);
    if (tab === 'profile') loadInbox().then(render);
    if (window.TG) TG.impact('light');
    render();
  }

  function openPerson(id, ret) {
    if (!id) return;
    if (S.me && (id === 'me' || id === S.me.id)) {
      goTab('profile');
      return;
    }
    if (S.screen !== 'person' || S.personId !== id) {
      S.stack.push({ screen: S.screen, personId: S.personId });
    }
    if (ret) {
      ret.depth = S.stack.length;
      S.storyReturn = ret;
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
      if (S.me) items = items.filter(function (p) { return p && p.id !== S.me.id && p.id !== 'me'; });
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

  function loadInbox() {
    return CupionAPI.getStoryInbox().then(function (rows) {
      S.inbox = rows || [];
    }).catch(function () { S.inbox = []; });
  }

  function reactionsSheet() {
    var storyId = (S.sheetPayload && S.sheetPayload.storyId) || null;
    var html = inboxBlock(storyId, false);
    if (!html) return sheetFrame('<h2>Реакции</h2><p class="hint">На эту историю пока никто не отреагировал.</p>');
    return sheetFrame(html);
  }

  function storyReactionCount(storyId) {
    return (S.inbox || []).filter(function (r) { return r.storyId === storyId; }).length;
  }

  function inboxBlock(storyId, floating) {
    var rows = (S.inbox || []).filter(function (r) { return !storyId || r.storyId === storyId; });
    if (!rows.length) return '';
    var body = rows.map(function (r) {
      var back = '';
      var content = '';
      
      if (r.type === 'comment') {
        // Comment
        content = '<span class="rx-comment">"' + esc(r.text) + '"</span>';
      } else {
        // Reaction
        content = '<span class="emo">' + r.emoji + '</span>';
        if (r.emoji === '❤️') {
          back = r.replied
            ? '<span class="rx-done">взаимно</span>'
            : '<button class="rx-back" data-act="react-back" data-id="' + esc(r.user.id) + '" data-story="' + esc(r.storyId) + '">❤️ в ответ</button>';
        }
      }
      
      return '<article class="rx-row"><button class="rx-main" data-act="person" data-id="' + esc(r.user.id) + '">' +
        phAvatar() +
        '<span class="who"><b>' + esc(r.user.name) + ', ' + esc(r.user.age) + '</b><small>' + timeAgo(r.createdAt) + '</small></span>' +
        content + '</button>' + back + '</article>';
    }).join('');
    var title = rows.some(function(r) { return r.type === 'comment'; }) ? 'Реакции и комментарии' : 'Реакции';
    return '<section class="rx' + (floating ? ' story-inbox' : '') + '"><h3>' + title + '</h3><p>На эту историю · ' + rows.length + '</p>' + body + '</section>';
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
    var seen = !live.length || live.every(function (s) { return s.seen; });
    return '<span class="time-ring' + (seen ? ' seen' : ' live') + (extra ? ' ' + extra : '') + '" style="--p:' + p.toFixed(3) + '">' + phAvatar() + '</span>';
  }

  function storyPeople() {
    return (S.stories || []).filter(function (u) {
      return u && u.id !== 'me' && u.stories && u.stories.length;
    });
  }

  function ensureStrip() {
    if (S.slots || !storyPeople().length) return;
    var people = storyPeople();
    var count = Math.min(people.length, BUBBLES.length);
    S.seenBubbles = S.seenBubbles || {};
    S.slots = [];
    for (var i = 0; i < count; i++) {
      var slot = BUBBLES[i];
      S.slots.push({ i: i, x: slot.x, y: slot.y, s: slot.s, userId: people[i].id, bye: false, arrive: false });
    }
  }

  function findStoryUser(id) {
    var list = S.stories || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function bubble(user, slot, i, extra) {
    var dx = (i % 2 ? 4 : -3) + 'px';
    var dy = (i % 3 ? -7 : 5) + 'px';
    var dur = (8 + (i % 5) * 0.7) + 's';
    var delay = (-i * 0.35) + 's';
    return '<button class="bubble' + (extra || '') + '" style="--x:' + slot.x + ';--y:' + slot.y + ';--s:' + slot.s + 'px;--dx:' + dx + ';--dy:' + dy + ';--dur:' + dur + ';--delay:' + delay + '" data-act="story" data-id="' + esc(user.id) + '" aria-label="' + esc(user.name) + '">' +
      '<span class="bubble-swap"><span class="bubble-drift">' + timeRing(user) + '</span></span></button>';
  }

  function orbit() {
    ensureStrip();
    var html = (S.slots || []).map(function (slot, i) {
      if (!slot.userId) return '';
      var user = findStoryUser(slot.userId);
      if (!user) return '';
      var extra = slot.bye ? ' bye' : (slot.arrive ? ' arrive' : '');
      return bubble(user, slot, i, extra);
    }).join('');
    var mine = S.me && S.me.stories && S.me.stories.filter(function (st) { return !st.remain || st.remain > 0; }).length;
    html += '<button class="bubble me" data-act="my-story" aria-label="Моя история"><span class="bubble-drift">' +
      (mine ? timeRing(S.me, 'mine') : '<span class="ring seen">' + phAvatar() + '</span>') +
      '<span class="plus" data-act="add-story" aria-label="Добавить историю">+</span></span></button>';
    return '<div class="orbit">' + html + '</div>';
  }

  function paintOrbit() {
    var node = document.querySelector('.orbit');
    if (!node) return;
    var scroller = document.getElementById('feed-scroll');
    var y = scroller ? scroller.scrollTop : 0;
    node.outerHTML = orbit();
    if (scroller) scroller.scrollTop = y;
  }

  function storyReturnMs() {
    return (window.CupionMock && CupionMock.storyReturnMs) ? CupionMock.storyReturnMs() : 5000;
  }

  function storyCooling(id) {
    var at = S.seenBubbles && S.seenBubbles[id];
    return typeof at === 'number' && Date.now() - at < storyReturnMs();
  }

  function revivePerson(user) {
    if (!user) return;
    (user.stories || []).forEach(function (s) { s.seen = false; });
    if (window.CupionAPI && CupionAPI.reviveStories) CupionAPI.reviveStories(user.id).catch(function () {});
  }

  function nextFreePerson() {
    var taken = {};
    (S.slots || []).forEach(function (sl) { if (sl.userId) taken[sl.userId] = true; });
    var list = storyPeople();
    var cooling = null;
    for (var i = 0; i < list.length; i++) {
      if (taken[list[i].id]) continue;
      if (!storyCooling(list[i].id)) {
        revivePerson(list[i]);
        return list[i];
      }
      if (!cooling) cooling = list[i];
    }
    if (!cooling) return null;
    if (S.seenBubbles) delete S.seenBubbles[cooling.id];
    revivePerson(cooling);
    return cooling;
  }

  function retireBubble(userId) {
    if (!userId || !S.slots) return;
    S.seenBubbles = S.seenBubbles || {};
    var slot = null;
    S.slots.forEach(function (sl) { if (sl.userId === userId) slot = sl; });
    if (!slot || slot.bye) return;
    S.seenBubbles[userId] = Date.now();
    slot.bye = true;
    paintOrbit();
    var wait = storyReturnMs();
    setTimeout(function () {
      slot.bye = false;
      slot.userId = null;
      paintOrbit();
      setTimeout(function () {
        var next = nextFreePerson();
        if (!next || slot.userId) return;
        slot.userId = next.id;
        slot.arrive = true;
        paintOrbit();
        setTimeout(function () { slot.arrive = false; paintOrbit(); }, 700);
      }, wait);
    }, 460);
  }

  function mediaBlock(post, chip) {
    var photo = (post.photos || [])[0];
    var natural = photo && Number(photo.ratio) > 0 ? Number(photo.ratio) : 1;
    var shown = photo ? displayUrl(photo.url) : '';
    var shownPoster = photo ? displayUrl(photo.poster) : '';
    var file = !!(photo && (assetUrl(photo.url) || assetUrl(shown)));
    var real = !!(photo && (ownUrl(shown) || ownUrl(shownPoster) || file));
    var frame = natural;
    if (!real) {
      if (frame < 0.8) frame = 0.8;
      if (frame > 1.91) frame = 1.91;
    }
    var style = ' style="--ratio:' + frame.toFixed(4) + '"';
    var cls = 'frame-media' + (real ? ' is-real' : '');
    chip = chip || '';
    var mine = post.isMine || (S.me && post.id === S.me.id);
    var visual = '';
    if (photo && photo.type === 'video' && (ownUrl(shown) || file)) {
      visual = '<video class="feed-video" data-feed-video playsinline muted loop src="' + esc(shown || photo.url) + '"></video>' +
        '<button class="sound-btn" data-act="feed-sound" aria-label="Звук">' + ICON.speaker + '</button>' +
        '<span class="vid-glyph" aria-hidden="true">' + ICON.video + '</span>';
    }
    else if (photo && ownUrl(shown)) visual = realImg(photo.url);
    else if (photo && ownUrl(shownPoster)) visual = realImg(photo.poster);
    else visual = phPhoto('');
    if (photo && photo.type === 'video' && (file || ownUrl(shown))) {
      return '<div class="' + cls + '"' + style + '>' + visual + chip + '</div>';
    }
    if (photo && photo.type === 'video') {
      return '<div class="' + cls + '"' + style + '>' + visual + '<button class="play-badge" data-act="play" data-src="' + esc(photo.url) + '" data-poster="' + esc(photo.poster || '') + '" aria-label="Смотреть видео">' + ICON.play + '</button>' + chip + '</div>';
    }
    return '<div class="' + cls + '"' + style + '>' + visual + chip + '</div>';
  }

  function postCard(post, index) {
    if (!post) return '';
    var photo = (post.photos || [])[0] || { id: '' };
    var city = post.city ? ' · ' + esc(post.city) : '';
    var count = Number(post.ratingsCount) ? ' <span class="muted">· оценили ' + esc(post.ratingsCount) + '</span>' : '';
    var score = avgScore(post);
    var scoreHtml = '<div class="post-score"><i>★</i><b' + (score ? ' data-tick="' + esc(score) + '"' : '') + '>' + esc(score || '—') + '</b></div>';
    
    // Check if user has stories
    var hasStory = post.stories && post.stories.length > 0;
    var storyLive = hasStory && post.stories.some(function(s) { return s.remain > 0; });
    
    // Story ring for avatar if has active story
    var avatarRing = '';
    if (storyLive) {
      var liveStories = post.stories.filter(function(s) { return s.remain > 0; });
      var unseenStory = liveStories.some(function(s) { return !s.seen; });
      avatarRing = ' story-ring' + (unseenStory ? ' unseen' : ' seen');
    }
    
    // Make avatar clickable for story
    var avatarClick = storyLive ? ' data-act="card-story" data-id="' + esc(post.id) + '"' : '';
    
    // Rating UI - inline in card
    var rateUI = '';
    if (!post.isMine) {
      var stars = '';
      for (var i = 1; i <= 10; i++) {
        stars += '<button class="star-btn" data-act="rate-star" data-post="' + esc(post.id) + '" data-score="' + i + '" aria-label="' + i + ' звезд">' + i + '</button>';
      }
      rateUI = '<div class="card-rate">' +
        '<textarea class="rate-comment" id="comment-' + esc(post.id) + '" placeholder="Комментарий (необязательно)" maxlength="180"></textarea>' +
        '<div class="star-grid">' + stars + '</div>' +
        '</div>';
    }
    
    return '<article class="post" data-post="' + esc(post.id) + '" style="--i:' + Math.min(index || 0, 7) + '"><div class="card">' +
      '<div class="post-head"><button class="mini-ava' + avatarRing + '"' + avatarClick + '>' + phAvatar() + '</button>' +
      '<div class="post-user">' + esc(post.name) + (post.premium ? premMark() : '') + '</div>' +
      (post.isMine ? '' : '<button class="card-more" data-act="card-more" data-id="' + esc(post.id) + '" aria-label="Ещё">•••</button>') +
      '</div>' +
      '<div class="frame">' + mediaBlock(post, '') + '</div>' +
      '<div class="post-meta"><div class="post-title">' + esc(post.name) + ', ' + esc(post.age) + city + count + '</div>' + scoreHtml + '</div>' +
      '<p class="caption">' + esc(post.caption || post.bio || '') + '</p>' + rateUI + '</div></article>';
  }

  function feedScreen() {
    var posts = S.loading
      ? '<div class="empty"><div class="empty-orb"></div><h3>Загрузка</h3></div>'
      : (S.feed.length ? S.feed.map(postCard).join('')
        : '<div class="empty feed-empty"><div class="empty-orb"></div><h3>Пока новых анкет нет</h3><p>Загляни позже</p><button class="btn btn-primary" data-act="feed-restart">Обновить</button></div>');
    var pillLabel = S.hasNew ? '↑ Появились новые' : '↑ Наверх';
    return '<div class="screen screen-feed">' +
      '<header class="app-header is-center"><div class="wordmark" data-act="tab" data-tab="feed">Cupion</div></header>' +
      '<button class="float-pill" id="float-pill" data-act="float-pill">' + pillLabel + '</button>' +
      '<div class="scroll" id="feed-scroll"><div class="pull" id="pull"><div class="pull-orb"><i class="pull-ring"></i><svg class="pull-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></div></div>' +
      orbit() +
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
      '<span class="sub">' + (m.kind === 'story' ? 'мэтч по истории' : 'вы оценили друг друга') + '</span>' +
      '<button class="btn btn-primary" data-act="person" data-id="' + esc(m.user.id) + '">Смотреть</button></section>';
  }

  function ratingRow(row, incoming, index) {
    if (!row || !row.user) return '';
    var who = row.user;
    var revealed = !incoming || row.revealed || row.score > 5;
    var line = incoming
      ? ((revealed ? verb(who.gender) : 'оценили') + ' твоё фото · ' + timeAgo(row.createdAt))
      : ('ты ' + youVerb() + ' · ' + timeAgo(row.createdAt));
    var quote = row.text && revealed ? '<div class="quote">«' + esc(row.text) + '»</div>' : '';
    var score = incoming ? row.score : (row.score || '');
    var title = revealed ? ('@' + who.username) : 'Аноним';
    var photoId = who.photos && who.photos[0] ? who.photos[0].id : '';
    var actions = '';
    if (incoming && revealed) {
      if (!row.repliedScore) {
        actions += '<button class="btn btn-glass btn-sm" data-act="rate" data-id="' + esc(who.id) + '" data-photo="' + esc(photoId) + '">Оценить в ответ</button>';
      }
      if (row.score > 5) {
        actions += '<button class="btn btn-primary btn-sm" data-act="tg" data-user="' + esc(who.username) + '">Написать</button>';
      }
    } else if (!incoming) {
      actions = '<button class="btn btn-primary btn-sm" data-act="person" data-id="' + esc(who.id) + '">Смотреть</button>';
    }
    var mineScore = incoming && row.repliedScore ? '<span class="score-outline mine">ты ★ ' + esc(row.repliedScore) + '</span>' : '';
    var nameBtn = revealed
      ? '<b data-act="person" data-id="' + esc(who.id) + '">' + esc(title) + (who.premium ? premMark() : '') + '</b>'
      : '<b>' + esc(title) + '</b>';
    var open = revealed ? ' data-act="person" data-id="' + esc(who.id) + '"' : '';
    return '<article class="rate-row' + (revealed ? '' : ' anon') + '"' + open + ' style="--i:' + Math.min(index || 0, 7) + '">' +
      '<div class="rate-main">' + phAvatar(revealed ? '' : 'anon') +
      '<div>' + nameBtn + '<div class="sub">' + esc(line) + '</div></div>' +
      (revealed ? '<button class="thumb-btn" data-act="person" data-id="' + esc(who.id) + '">' + phPhoto() + '</button>' : '<span class="thumb-btn">' + phPhoto() + '</span>') +
      '</div>' + quote +
      '<div class="hair"></div>' +
      '<div class="rate-foot">' +
      '<span class="score-pair">' + (score ? '<span class="score-outline">★ ' + esc(score) + '</span>' : '<span></span>') + mineScore + '</span>' +
      (actions ? '<span class="rate-actions">' + actions + '</span>' : '') + '</div></article>';
  }

  function ratingsScreen() {
    var i = S.ratingsTab === 'out' ? 1 : S.ratingsTab === 'matches' ? 2 : 0;
    var hero = (S.ratingsTab !== 'out' && S.matches && S.matches[0]) ? matchHero(S.matches[0]) : '';
    var body = '';
    if (S.ratingsTab === 'in') {
      body = (S.incoming || []).map(function (row, i) { return ratingRow(row, true, i); }).join('');
      if (!body) body = '<div class="empty"><div class="empty-orb"></div><h3>Пока тихо</h3><p>Когда тебя оценят, это появится здесь.</p></div>';
    } else if (S.ratingsTab === 'out') {
      body = (S.outgoing || []).map(function (row, i) { return ratingRow(row, false, i); }).join('');
      if (!body) body = '<div class="empty"><div class="empty-orb"></div><h3>Ты ещё никого не оценил</h3><p>Поставь первую оценку в ленте.</p></div>';
    } else {
      body = (S.matches || []).slice(1).map(function (m) {
        return '<article class="rate-row"><div class="rate-main">' + phAvatar() +
          '<div><b>@' + esc((S.me && S.me.username) || 'ты') + ' и @' + esc(m.user.username) + '</b><div class="sub">' + (m.kind === 'story' ? 'мэтч по истории' : 'мэтч') + ' · ' + timeAgo(m.createdAt) + '</div></div>' +
          '<button class="thumb-btn" data-act="person" data-id="' + esc(m.user.id) + '">' + phPhoto() + '</button></div>' +
          '<div class="hair"></div><div class="rate-foot"><span></span>' +
          '<button class="btn btn-primary btn-sm" data-act="person" data-id="' + esc(m.user.id) + '">Смотреть</button></div></article>';
      }).join('');
      if (!S.matches || !S.matches.length) body = '<div class="empty"><div class="empty-orb"></div><h3>Мэтчей пока нет</h3><p>Взаимная оценка превращается в мэтч.</p></div>';
    }
    return '<div class="screen"><div class="scroll"><div class="page-head"><h1>Оценки</h1><p>Кто оценил тебя</p></div>' +
      '<div class="pad"><div class="seg" data-i="' + i + '"><i class="seg-pill"></i>' +
      '<button type="button" data-act="rtab" data-tab="in" class="' + (i === 0 ? 'on' : '') + '">Тебе</button>' +
      '<button type="button" data-act="rtab" data-tab="out" class="' + (i === 1 ? 'on' : '') + '">Ты</button>' +
      '<button type="button" data-act="rtab" data-tab="matches" class="' + (i === 2 ? 'on' : '') + '">Мэтчи</button></div></div>' +
      hero + body + '</div></div>';
  }

  /* ---------- profile ---------- */

  function photoTile(photo, user) {
    var video = photo.type === 'video';
    var shown = displayUrl(photo.url);
    var shownPoster = displayUrl(photo.poster);
    var mineMedia = ownUrl(shown) || ownUrl(shownPoster);
    var locked = false;
    var mark = video ? '<span class="mark">' + ICON.play + '</span>' : '';
    var act = video ? 'play' : 'view-photo';
    var face = '';
    if (video && ownUrl(shownPoster)) face = realImg(photo.poster);
    else if (video && ownUrl(shown)) face = realVideo(photo.url, photo.poster);
    else if (ownUrl(shown)) face = realImg(photo.url);
    else face = phPhoto(locked ? 'is-blur' : '');
    return '<button class="tile' + (locked && !mineMedia ? ' locked' : '') + '" data-act="' + act + '" data-src="' + esc(photo.url || '') + '" data-poster="' + esc(photo.poster || '') + '" data-id="' + esc(user.id) + '">' +
      face + mark + '</button>';
  }

  function highlightRow(user) {
    var list = (user.stories || []);
    if (!list.length) return '';
    var html = '<div class="highlights">';
    for (var i = 0; i < list.length && i < 12; i++) {
      var st = list[i];
      if (!st) continue;
      var face = st.type === 'video' ? '' : realImg(st.url, 'hl-img');
      if (!face) face = phAvatar();
      html += '<button class="hl" data-act="story" data-id="' + esc(user.id) + '" data-index="' + i + '"><span class="hl-ring' + (st.seen ? ' seen' : '') + '"><span class="hl-face">' + face + '</span></span></button>';
    }
    return html + '</div>';
  }

  function profileView(user, own) {
    if (!user) {
      return '<div class="screen"><div class="scroll"><div class="profile-bar"><button class="glass-circle" data-act="tab" data-tab="feed" aria-label="Назад">' + ICON.back + '</button><button class="brand" data-act="tab" data-tab="feed">Cupion</button><span></span></div>' +
        '<div class="profile-hero"><div class="big-ava"><span class="ring">' + phAvatar() + '</span></div><h1>Твоя анкета</h1><p class="bio">Создай профиль, чтобы оценивать и получать мэтчи.</p></div>' +
        '<div class="profile-actions"><button class="btn btn-primary" data-act="start-reg">Создать анкету</button></div></div></div>';
    }
    var rxBadge = '';
    var primary = own
      ? '<button class="btn btn-primary" data-act="edit">Редактировать</button>'
      : '<button class="btn btn-primary" data-act="rate" data-id="' + esc(user.id) + '" data-photo="' + esc(user.photos[0] ? user.photos[0].id : '') + '">Оценить</button>';
    return '<div class="screen"><div class="scroll"><div class="profile-bar">' +
      '<button class="glass-circle" data-act="' + (own ? 'tab' : 'back') + '" data-tab="feed" aria-label="Назад">' + ICON.back + '</button>' +
      (own ? '<button class="brand" data-act="tab" data-tab="feed">Cupion</button>' : '<span></span>') +
      '<button class="glass-circle" data-act="more" data-id="' + esc(user.id) + '" aria-label="Ещё">' + ICON.more + '</button></div>' +
      '<div class="profile-hero"><button class="big-ava" data-act="story" data-id="' + esc(user.id) + '">' + rxBadge + '<span class="ring">' + phAvatar() + '</span></button>' +
      '<h1><span>' + esc(user.name) + ', ' + esc(user.age) + '</span>' + (user.premium ? premMark() : '') + '</h1>' + (user.city ? '<div class="handle">' + esc(user.city) + '</div>' : '') +
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
    if (S.regStep === 1) {
      var city = String(r.city || '').trim();
      return city.length === 0 || city.length >= 2;
    }
    if (S.regStep === 2) return validName(r.name);
    if (S.regStep === 3) return String(r.bio || '').trim().length >= 2;
    if (S.regStep === 4) return r.photos.length >= 1 && r.photos.length <= 3;
    return true;
  }

  function photoCap() {
    return (S.me && S.me.premium) ? 6 : 3;
  }

  function countPhotos(list) {
    return (list || []).filter(function (p) { return (p.type || 'photo') !== 'video'; }).length;
  }

  function photoPick(p, idx, total, kind) {
    var face = realImg(p.url) || realImg(p.poster) || phPhoto();
    var prev = idx > 0 ? '<button class="mv" data-act="photo-move" data-kind="' + kind + '" data-dir="-1" data-index="' + idx + '" aria-label="Раньше">‹</button>' : '';
    var next = idx < total - 1 ? '<button class="mv next" data-act="photo-move" data-kind="' + kind + '" data-dir="1" data-index="' + idx + '" aria-label="Позже">›</button>' : '';
    var rmAct = kind === 'edit' ? 'rm-edit' : 'rm-photo';
    return '<div class="pick"><button class="pick-face" data-act="replace-photo" data-kind="' + kind + '" data-index="' + idx + '" aria-label="Заменить">' + face + '</button>' +
      prev + next +
      '<button class="rm" data-act="' + rmAct + '" data-index="' + idx + '" aria-label="Убрать">−</button></div>';
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
        return photoPick(p, idx, r.photos.length, 'reg');
      }).join('');
      var add = r.photos.length < 3 ? '<button class="pick-add" data-act="pick-reg" aria-label="Добавить фото">+</button>' : '';
      body = '<h1>Добавь фото</h1><p class="lead">От 1 до 3. Больше фото и видео — в Premium.</p><div class="pick-grid">' + tiles + add + '</div>';
    }
    var label = S.regStep === 4 ? 'Готово' : 'Дальше';
    var skip = S.regStep === 1 ? '<button class="text-btn" data-act="skip-city">Пропустить</button>' : '';
    var dir = S.regDir < 0 ? 'enter-back' : 'enter-fwd';
    return '<div class="reg ' + dir + '"><div class="reg-top">' + back + '<div class="steps">' + steps + '</div></div>' +
      '<div class="reg-body" id="reg-body">' + body + '</div><div class="reg-foot">' +
      '<button class="btn btn-primary btn-block" data-act="reg-next"' + (regValid() ? '' : ' disabled') + '>' + label + '</button>' +
      skip +
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
    var host = document.getElementById('sheet-root');
    if (host) host.classList.toggle('above-story', name === 'reactions');
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
    if (S.sheet === 'reactions') S.rxExpanded = false;
    var host = document.getElementById('sheet-root');
    if (host) host.classList.remove('above-story');
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
      '<div class="big-score"><b data-score>' + n + '</b></div>' +
      '<div class="rate-controls"><div class="stars">' + stars + '</div>' +
      '<input class="slider" data-score-range type="range" min="1" max="10" step="1" value="' + n + '" aria-label="Оценка от 1 до 10"></div>' +
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
    var plans = active ? '<p class="hint">Premium уже подключён</p>' :
      '<div class="choice-list">' +
      '<button class="choice-row plan' + (S.plan === 'trial' ? ' on' : '') + '" data-act="plan" data-plan="trial"><span>Пробная подписка<small>1 день · попробуй все функции</small></span><span class="price">1 ★</span></button>' +
      '<button class="choice-row plan' + (S.plan === 'month' ? ' on' : '') + '" data-act="plan" data-plan="month"><span>Месяц<small>30 дней Premium</small></span><span class="price">50 ★</span></button>' +
      '<button class="choice-row plan' + (S.plan === 'year' ? ' on' : '') + '" data-act="plan" data-plan="year"><span>Год<small class="save">Выгодно</small></span><span class="price">500 ★</span></button>' +
      '</div>';
    var cta = active
      ? '<button class="btn btn-primary btn-block" data-act="sheet-close">Готово</button>'
      : '<button class="btn btn-primary btn-block" data-act="buy">Купить Premium</button>';
    return sheetFrame(
      '<div class="pay"><div class="pay-hero"><span class="pay-badge">Premium</span></div>' +
      '<h2>Смотри больше.<br>Выделяйся.</h2><ul class="perks">' + list + '</ul>' + plans +
      '<p class="terms">🎁 Для теста подписка активируется бесплатно. Реальная оплата через Stars будет подключена позже.</p></div>',
      cta
    );
  }

  function composeSheet() {
    var c = S.compose || { stage: 'menu', photos: [], caption: '' };
    if (c.stage === 'preview') {
      var tiles = c.photos.map(function (p) {
        var face = (p.type === 'video' && ownUrl(p.poster)) ? realImg(p.poster) : (realImg(p.url) || (p.type === 'video' && ownUrl(p.url) ? realVideo(p.url, p.poster) : '') || phPhoto());
        return '<div class="pick">' + face + '</div>';
      }).join('');
      return sheetFrame(
        '<h2>' + (c.type === 'story' ? 'Новая история' : 'Новая анкета') + '</h2>' +
        '<div class="pick-grid">' + tiles + '</div>' +
        (c.type === 'story' ? '' : '<textarea class="area" id="cap-text" maxlength="80" placeholder="Короткая подпись">' + esc(c.caption || '') + '</textarea>'),
        '<button class="btn btn-primary btn-block" data-act="publish">Опубликовать</button>'
      );
    }
    var premium = !!(S.me && S.me.premium);
    var cap = photoCap();
    var used = countPhotos(S.me && S.me.photos);
    var photoAct = (!premium && used >= cap) ? 'premium' : 'pick-post';
    var photoHint = (!premium && used >= cap) ? 'лимит · больше в Premium' : ('до ' + cap + ' фото');
    var videoRow = premium
      ? '<button class="choice-row" data-act="pick-video"><span>Видео<small>в ленту и профиль</small></span></button>'
      : '<button class="choice-row" data-act="premium"><span>Видео<small>Premium</small></span><span class="prem-tag">Premium</span></button>';
    var storyRow = premium
      ? '<button class="choice-row" data-act="pick-story"><span>История<small>на 10 часов</small></span></button>'
      : '<button class="choice-row" data-act="pick-story"><span>История<small>на 1 час</small></span><span class="prem-tag">10 часов в Premium</span></button>';
    return sheetFrame(
      '<h2>Новая публикация</h2><p class="hint">Фото, видео или история.</p><div class="choice-list">' +
      '<button class="choice-row" data-act="' + photoAct + '"><span>Фото в анкету<small>' + photoHint + '</small></span>' +
      (photoAct === 'premium' ? '<span class="prem-tag">Premium</span>' : '') + '</button>' +
      videoRow +
      storyRow + '</div>'
    );
  }

  function editSheet() {
    var e = S.edit;
    if (!e) return '';
    var cap = photoCap();
    var used = countPhotos(e.photos);
    var tiles = e.photos.map(function (p, idx) {
      return photoPick(p, idx, e.photos.length, 'edit');
    }).join('');
    var add = used < cap
      ? '<button class="pick-add" data-act="pick-edit" aria-label="Добавить фото">+</button>'
      : (S.me && S.me.premium ? '' : '<button class="pick-add" data-act="premium" aria-label="Больше фото в Premium">+</button>');
    var look = function (v, label) {
      return '<button type="button" data-act="edit-look" data-value="' + v + '" class="' + (e.lookingFor === v ? 'on' : '') + '">' + label + '</button>';
    };
    var li = e.lookingFor === 'male' ? 1 : e.lookingFor === 'female' ? 2 : 0;
    return sheetFrame(
      '<h2>Анкета</h2><input class="field" id="edit-name" maxlength="32" value="' + esc(e.name) + '" placeholder="Имя">' +
      '<div style="height:10px"></div><textarea class="area" id="edit-bio" maxlength="80" placeholder="О себе">' + esc(e.bio) + '</textarea>' +
      '<div class="count">' + e.bio.length + '/80</div><p class="hint">' + (S.me && S.me.premium ? 'До 6 фото и видео. Нажми фото, чтобы заменить.' : 'До 3 фото. Больше и видео — в Premium.') + '</p><div class="pick-grid">' + tiles + add + '</div>' +
      '<div class="label" style="margin:14px 0 8px;color:var(--text-2);font-size:13px">Кого показывать</div>' +
      '<div class="seg" data-i="' + li + '"><i class="seg-pill"></i>' + look('all', 'Все') + look('male', 'Парни') + look('female', 'Девушки') + '</div>' +
      '<div class="sheet-error" id="sheet-error"></div>',
      '<button class="btn btn-primary btn-block" data-act="save-edit">Сохранить</button>'
    );
  }

  function profileById(id) {
    if (S.me && id === S.me.id) return S.me;
    if (S.person && S.person.id === id) return S.person;
    var found = null;
    (S.feed || []).forEach(function (p) { if (p.id === id) found = p; });
    (S.boardRows || []).forEach(function (p) { if (p.id === id) found = p; });
    return found;
  }

  function actionsSheet(p) {
    var link = 'https://t.me/cupion_app?startapp=u_' + encodeURIComponent(p.username || '');
    return sheetFrame(
      '<h2>' + esc(p.name || 'Анкета') + '</h2><div class="choice-list">' +
      '<button class="choice-row" data-act="report-open" data-id="' + esc(p.id) + '"><span>Пожаловаться</span></button>' +
      '<button class="choice-row" data-act="hide-profile" data-id="' + esc(p.id) + '"><span>Скрыть анкету</span></button>' +
      '<button class="choice-row" data-act="share" data-link="' + esc(link) + '"><span>Поделиться</span></button></div>'
    );
  }

  function reportSheet(p) {
    var reasons = ['Реклама / спам', '18+ контент', 'Оскорбления', 'Фейк', 'Мошенничество', 'Другое'];
    var buttons = reasons.map(function (reason) {
      return '<button class="choice-row" data-act="report-send" data-id="' + esc(p.id) + '" data-reason="' + esc(reason) + '"><span>' + esc(reason) + '</span></button>';
    }).join('');
    return sheetFrame(
      '<h2>Пожаловаться</h2><p class="hint">' + esc(p.name || '') + '</p><div class="choice-list">' + buttons + '</div>' +
      '<textarea class="area" id="report-text" maxlength="200" placeholder="Комментарий, если нужно"></textarea>'
    );
  }

  function dropProfile(id) {
    S.feed = (S.feed || []).filter(function (p) { return p.id !== id; });
    if (S.person && S.person.id === id) {
      S.person = null;
      S.personId = null;
      S.screen = 'feed';
    }
    if (S.slots) {
      S.slots.forEach(function (sl) { if (sl.userId === id) sl.userId = null; });
    }
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
    var key = S.sheet ? (S.sheet + ':' + ((S.sheetPayload && S.sheetPayload.key) || '') + ':' + ((S.compose && (S.compose.stage + ':' + (S.compose.photos ? S.compose.photos.length : 0))) || '') + ':' + ((S.edit && S.edit.photos) ? S.edit.photos.map(function (p) { return p.id || p.url; }).join('|') + S.edit.lookingFor : '') + ':' + ((S.inbox && S.inbox.length) || 0)) : '';
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
    else if (S.sheet === 'actions') html = actionsSheet(S.sheetPayload || {});
    else if (S.sheet === 'report') html = reportSheet(S.sheetPayload || {});
    else if (S.sheet === 'search') html = searchSheet();
    else if (S.sheet === 'reactions') html = reactionsSheet();
    root.innerHTML = html;
    requestAnimationFrame(function () {
      var sheet = root.querySelector('.sheet');
      var bd = root.querySelector('.backdrop');
      if (sheet && S.sheet === 'reactions') {
        sheet.classList.add('sheet-rx');
        if (S.rxExpanded) sheet.classList.add('expanded');
      }
      if (sheet) sheet.classList.add('show');
      if (bd) bd.classList.add('show');
    });
  }

  var REACT_GLOW = { '❤️': '255,45,85', '😂': '255,204,0', '😍': '255,55,95', '😮': '90,200,250', '🔥': '255,149,0', '👏': '255,214,10' };

  function burstReaction(layer, btn, emo) {
    if (!layer || motionOff()) return;
    var host = layer.getBoundingClientRect();
    var rect = btn.getBoundingClientRect();
    var cx = rect.left - host.left + rect.width / 2;
    var cy = rect.top - host.top + rect.height / 2;
    var glow = REACT_GLOW[emo] || '255,255,255';
    var made = [];
    function add(cls, text, style) {
      var node = document.createElement('span');
      node.className = cls;
      if (text) node.textContent = text;
      Object.keys(style || {}).forEach(function (k) { node.style.setProperty(k, style[k]); });
      layer.appendChild(node);
      made.push(node);
      return node;
    }
    add('react-flash', '', { '--glow': glow });
    add('react-ring', '', { left: cx + 'px', top: cy + 'px', '--glow': glow });
    add('react-ring r2', '', { left: cx + 'px', top: cy + 'px', '--glow': glow });
    add('react-big', emo, { '--glow': glow });
    for (var i = 0; i < 22; i++) {
      var ang = (Math.PI * 2 * i) / 22 + Math.random() * 0.3;
      var dist = 90 + Math.random() * 130;
      add('react-spark', emo, {
        left: cx + 'px',
        top: cy + 'px',
        '--tx': Math.round(Math.cos(ang) * dist) + 'px',
        '--ty': Math.round(Math.sin(ang) * dist - 40) + 'px',
        '--rot': Math.round((Math.random() - 0.5) * 220) + 'deg',
        '--sz': (14 + Math.random() * 22).toFixed(0) + 'px',
        '--d': (0.8 + Math.random() * 0.7).toFixed(2) + 's'
      });
    }
    for (var j = 0; j < 14; j++) {
      add('react-rise', emo, {
        left: (6 + Math.random() * 88).toFixed(1) + '%',
        '--sz': (18 + Math.random() * 26).toFixed(0) + 'px',
        '--sway': Math.round((Math.random() - 0.5) * 80) + 'px',
        '--d': (1.1 + Math.random() * 1.0).toFixed(2) + 's',
        '--delay': (Math.random() * 0.35).toFixed(2) + 's'
      });
    }
    setTimeout(function () { made.forEach(function (n) { if (n.parentNode) n.remove(); }); }, 2400);
  }

  function motionOff() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function paintScore(n, haptic) {
    n = Math.max(1, Math.min(10, n));
    if (haptic && n !== S.score && window.TG) TG.selection();
    S.score = n;
    var label = document.querySelector('[data-score]');
    if (label) {
      label.textContent = String(n);
      var box = label.closest('.big-score');
      if (box && !motionOff()) {
        box.classList.remove('tick');
        box.offsetWidth;
        box.classList.add('tick');
      }
    }
    document.querySelectorAll('.stars button').forEach(function (btn, i) {
      btn.classList.toggle('on', i < n);
    });
    var range = document.querySelector('[data-score-range]');
    if (range) {
      if (String(range.value) !== String(n)) range.value = String(n);
      if (!motionOff()) {
        range.classList.remove('sprung');
        range.offsetWidth;
        range.classList.add('sprung');
      }
    }
  }

  var feedObserver = null;

  function bindFeedVideos() {
    var nodes = document.querySelectorAll('[data-feed-video]');
    if (!nodes.length) return;
    if (!window.IntersectionObserver) {
      Array.prototype.forEach.call(nodes, function (v) { v.play().catch(function () {}); });
      return;
    }
    if (!feedObserver) {
      feedObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.intersectionRatio >= 0.6) v.play().catch(function () {});
          else v.pause();
        });
      }, { threshold: [0, 0.6, 1] });
    }
    Array.prototype.forEach.call(nodes, function (v) {
      if (v.dataset.watched) return;
      v.dataset.watched = '1';
      v.muted = true;
      feedObserver.observe(v);
    });
  }

  function runCountUps(root) {
    if (!root) return;
    var nodes = root.querySelectorAll('[data-tick]');
    Array.prototype.forEach.call(nodes, function (el) {
      var raw = el.getAttribute('data-tick');
      var target = parseFloat(raw);
      if (!isFinite(target)) return;
      if (motionOff()) { el.textContent = raw; return; }
      var dec = String(raw).indexOf('.') !== -1;
      var start = performance.now();
      var step = function (now) {
        var t = Math.min(1, (now - start) / 620);
        var eased = 1 - Math.pow(1 - t, 3);
        var val = target * eased;
        el.textContent = dec ? val.toFixed(1) : String(Math.round(val));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- stories / match / viewer ---------- */

  function storyHTML() {
    var st = S.story;
    var item = st.items[st.index];
    var isOwnStory = st.userId === 'me' || !!(S.me && st.userId === S.me.id);
    var bars = st.items.map(function (_, i) {
      var w = i < st.index ? 100 : 0;
      return '<b><i data-bar="' + i + '" style="width:' + w + '%"></i></b>';
    }).join('');
    var bg = item.type === 'video' && (assetUrl(item.url) || ownUrl(displayUrl(item.url)))
      ? '<video class="story-video story-bg" playsinline muted src="' + esc(item.url) + '"></video>'
      : (realImg(item.url, 'story-bg') || phPhoto('story-bg'));
    var sound = item.type === 'video'
      ? '<button class="sound-btn story-sound' + (S.storySound ? ' on' : '') + '" data-act="story-sound" aria-label="Звук">' + (S.storySound ? ICON.speakerOn : ICON.speaker) + '</button>'
      : '';
    return '<div class="story-layer">' + bg + sound +
      '<div class="story-shade"></div><div class="story-ui"><div class="bars">' + bars + '</div>' +
      '<div class="story-user">' + phAvatar() + '<span>' + esc(st.user ? st.user.name : '') + '</span>' +
      '<em>' + timeAgo(item.createdAt) + '</em></div></div>' +
      (isOwnStory ? '<button class="rx-pill" data-act="story-reactions" data-story="' + esc(item.id) + '">Реакции' +
        (storyReactionCount(item.id) ? '<b>' + (storyReactionCount(item.id) > 9 ? '9+' : storyReactionCount(item.id)) + '</b>' : '') + '</button>' : '') +
      (isOwnStory ? '' : 
        '<div class="story-bottom">' +
        '<div class="story-actions">' + ['❤️', '😂', '😍', '😮', '🔥'].map(function (emo) {
          var picked = S.picked && S.picked[item.id] === emo;
          return '<button class="emoji-btn' + (picked ? ' on' : '') + '" data-act="react" data-emoji="' + emo + '" data-id="' + esc(st.userId) + '" data-story="' + esc(item.id) + '" aria-label="' + emo + '">' + emo + '</button>';
        }).join('') + '</div>' +
        '<div class="story-comment-box">' +
        '<input type="text" class="story-comment-input" id="story-comment-' + esc(item.id) + '" placeholder="Написать комментарий..." maxlength="180" data-story="' + esc(item.id) + '" data-user="' + esc(st.userId) + '">' +
        '<button class="story-send-btn" data-act="send-story-comment" data-story="' + esc(item.id) + '" data-user="' + esc(st.userId) + '">' + ICON.send + '</button>' +
        '</div></div>') + '</div>';
  }

  function renderStory() {
    var root = document.getElementById('story-root');
    if (!root) return;
    if (S.viewer) {
      root.innerHTML = '<div class="viewer"><div class="viewer-top"><button class="glass-circle" data-act="close-viewer" aria-label="Назад">' + ICON.back + '</button></div>' +
        (S.viewer.video && ownUrl(S.viewer.src)
          ? '<video class="real-media story-bg" src="' + esc(S.viewer.src) + '" poster="' + esc(S.viewer.poster || '') + '" controls autoplay playsinline></video>'
          : (realImg(S.viewer.src, 'story-bg') || phPhoto('story-bg'))) + '</div>';
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

  function startStory(userId, index, after, fromCard) {
    if (userId === 'me' && (!S.me || !S.me.stories || !S.me.stories.length)) {
      openCompose('story');
      return;
    }
    
    // Check if viewing from card (feed)
    if (fromCard && userId !== 'me') {
      // Check if already seen from card
      if (!S.cardStoryViews) S.cardStoryViews = {};
      var premium = S.me && S.me.premium;
      
      if (!premium && S.cardStoryViews[userId]) {
        toast('Без Premium можно смотреть историю только 1 раз');
        return;
      }
      
      // Mark as viewed from card
      if (!premium) {
        S.cardStoryViews[userId] = Date.now();
      }
    }
    
    Promise.all([CupionAPI.getStories(userId), CupionAPI.getUser(userId)]).then(function (res) {
      var items = res[0] || [];
      if (!items.length) { toast('Пока нет истории'); return; }
      S.viewer = null;
      S.story = { 
        userId: userId, 
        user: res[1], 
        items: items, 
        index: Math.min(index || 0, items.length - 1), 
        paused: false,
        fromCard: fromCard || false
      };
      var paint = function () { storySig = ''; renderStory(); syncBack(); if (after) after(); };
      if (userId === 'me') loadInbox().then(paint);
      else paint();
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
    
    // If story was opened from card, close instead of going to next user
    if (st.fromCard) {
      closeStory();
      return;
    }
    
    var finished = st.userId;
    var ids = (S.stories || []).map(function (u) { return u.id; }).filter(function (id) { return id !== 'me'; });
    var at = ids.indexOf(finished);
    var nextId = at >= 0 ? ids[at + 1] : null;
    if (nextId) {
      retireBubble(finished);
      startStory(nextId, 0);
      return;
    }
    closeStory();
  }

  function prevStory() {
    var st = S.story;
    if (!st) return;
    if (!(S.me && S.me.premium)) {
      premiumHint();
      return;
    }
    
    if (st.index > 0) {
      st.index -= 1;
      storySig = '';
      renderStory();
    }
  }

  function closeStory(opts) {
    var id = S.story && S.story.userId;
    var layer = document.querySelector('.story-layer');
    if (layer) {
      layer.classList.add('closing');
      setTimeout(function() {
        S.story = null;
        storySig = '';
        stopClock();
        var root = document.getElementById('story-root');
        if (root && !S.viewer) root.innerHTML = '';
        syncBack();
        if (id && id !== 'me' && !(opts && opts.keep)) retireBubble(id);
      }, 250);
    } else {
      S.story = null;
      storySig = '';
      stopClock();
      var root = document.getElementById('story-root');
      if (root && !S.viewer) root.innerHTML = '';
      syncBack();
      if (id && id !== 'me' && !(opts && opts.keep)) retireBubble(id);
    }
  }

  function premiumHint() {
    var layer = document.querySelector('.story-layer');
    if (!layer) return;
    var hint = layer.querySelector('.story-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'story-hint';
      hint.textContent = 'Назад — в Premium';
      layer.appendChild(hint);
    }
    hint.classList.remove('show');
    hint.offsetWidth;
    hint.classList.add('show');
    if (window.TG) TG.impact('light');
  }

  function restartClock() {
    stopClock();
    storyAcc = 0;
    storyLast = performance.now();
    var video = document.querySelector('.story-layer video.story-video');
    if (video) {
      video.muted = !S.storySound;
      var tick = function () {
        if (!S.story) return;
        if (S.story.paused || S.sheet) { if (!video.paused) video.pause(); }
        else if (video.paused) video.play().catch(function () {});
        var dur = video.duration || 0;
        var p = dur ? Math.min(1, video.currentTime / dur) : 0;
        var bar = document.querySelector('[data-bar="' + S.story.index + '"]');
        if (bar) bar.style.width = (p * 100) + '%';
        if (dur && video.ended) { nextStory(); return; }
        storyRAF = requestAnimationFrame(tick);
      };
      video.play().catch(function () {});
      storyRAF = requestAnimationFrame(tick);
      return;
    }
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

  function showMatch(user, kind) {
    S.match = user;
    S.matchKind = kind || 'rate';
    matchSig = '';
    renderMatch();
    syncBack();
    if (window.TG) TG.notify('success');
  }

  function renderMatch() {
    var root = document.getElementById('match-root');
    if (!root) return;
    var sig = S.match ? (S.match.id + ':' + (S.matchKind || '')) : '';
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
      '<h2>Вы замэтчились</h2><p class="subline">с ' + esc(u.name) + ' · ' + (S.matchKind === 'story' ? 'мэтч по истории' : 'вы оценили друг друга') + '</p>' +
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

  function openPeek(id) {
    var post = null;
    (S.feed || []).forEach(function (p) { if (p.id === id) post = p; });
    if (!post || S.peek) return;
    S.peek = post;
    renderPeek();
    syncBack();
    if (window.TG) TG.impact('heavy');
  }

  function renderPeek() {
    var root = document.getElementById('peek-root');
    if (!root) return;
    var p = S.peek;
    if (!p) { root.innerHTML = ''; return; }
    var photo = (p.photos || [])[0] || {};
    var shown = displayUrl(photo.url);
    var ratio = Number(photo.ratio) > 0 ? Number(photo.ratio) : 0.8;
    ratio = Math.max(0.6, Math.min(1.6, ratio));
    var media;
    if (photo.type === 'video' && (ownUrl(shown) || assetUrl(photo.url))) {
      media = '<video class="peek-media" src="' + esc(shown || photo.url) + '" autoplay muted loop playsinline></video>';
    } else {
      media = realImg(photo.type === 'video' ? photo.poster : photo.url, 'peek-media') || phPhoto('peek-media');
    }
    var mine = !!(p.isMine || (S.me && p.id === S.me.id));
    var score = avgScore(p);
    var city = p.city ? ' · ' + esc(p.city) : '';
    root.innerHTML = '<div class="peek" data-act="peek-close"><div class="peek-card" data-peek-card>' +
      '<div class="peek-frame" style="--ratio:' + ratio.toFixed(3) + '">' + media + '</div>' +
      '<div class="peek-info"><div class="peek-name"><b>' + esc(p.name) + ', ' + esc(p.age) + '</b>' + (p.premium ? premMark() : '') + '<small>' + city.replace(' · ', '') + '</small></div>' +
      '<div class="post-score"><i>★</i><b>' + esc(score || '—') + '</b></div></div>' +
      (p.caption || p.bio ? '<p class="peek-caption">' + esc(p.caption || p.bio) + '</p>' : '') +
      '<div class="peek-actions">' +
      (mine ? '' : '<button class="btn btn-primary" data-act="rate" data-id="' + esc(p.id) + '" data-photo="' + esc(photo.id || '') + '">Оценить</button>') +
      '<button class="btn btn-white" data-act="person" data-id="' + esc(p.id) + '">Профиль</button></div>' +
      '</div></div>';
  }

  function closePeek(now) {
    var root = document.getElementById('peek-root');
    var el = root ? root.querySelector('.peek') : null;
    S.peek = null;
    syncBack();
    if (!el || now === true || motionOff()) { if (root) root.innerHTML = ''; return; }
    el.classList.add('out');
    setTimeout(function () { if (!S.peek && root) root.innerHTML = ''; }, 280);
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
    var onProfile = S.screen === 'profile' || S.screen === 'person';
    var onFeed = S.screen === 'feed';
    var onBoard = S.screen === 'rating';
    var onRates = S.screen === 'ratings';
    return '<div class="dock"><div class="dock-bg"></div><div class="dock-inner">' +
      '<button class="dock-btn' + (onProfile ? ' on' : '') + '" data-act="tab" data-tab="profile" aria-label="Профиль">' + iconPair(ICON.user, ICON.userFill) + '</button>' +
      '<button class="dock-btn' + (onFeed ? ' on' : '') + '" data-act="tab" data-tab="feed" aria-label="Лента">' + iconPair(ICON.home, ICON.homeFill) + '</button>' +
      '<button class="dock-plus" data-act="compose" aria-label="Добавить">' + ICON.plus + '</button>' +
      '<button class="dock-btn' + (onBoard ? ' on' : '') + '" data-act="tab" data-tab="rating" aria-label="Рейтинг">' + iconPair(ICON.trophy, ICON.trophyFill) + '</button>' +
      '<button class="dock-btn heart-tab' + (onRates ? ' on' : '') + '" data-act="tab" data-tab="ratings" aria-label="Оценки">' + iconPair(ICON.heart, ICON.heartFill) +
      (S.unseen ? '<span class="badge">' + (S.unseen > 9 ? '9+' : S.unseen) + '</span>' : '') + '</button>' +
      '</div></div>';
  }

  function syncFloatPill(scroller) {
    var pill = document.getElementById('float-pill');
    if (!pill) return;
    var y = scroller ? scroller.scrollTop : 0;
    pill.textContent = S.hasNew ? '↑ Появились новые' : '↑ Наверх';
    pill.classList.toggle('show', y > 64);
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

  function loadBoard() {
    return CupionAPI.getLeaderboard(S.board || 'all').then(function (rows) {
      S.boardRows = rows || [];
    }).catch(function () { S.boardRows = []; });
  }

  function boardFace(row, cls) {
    var src = displayUrl(row.photo);
    if (ownUrl(src)) return '<img class="real-media ' + cls + '" src="' + esc(src) + '" alt="">';
    return phAvatar(cls);
  }

  function ratingBoard() {
    var period = S.board || 'all';
    var rows = S.boardRows || [];
    var top = rows.slice(0, 3);
    var order = [top[1], top[0], top[2]];
    var medals = ['2', '1', '3'];
    var podium = order.map(function (row, i) {
      if (!row) return '<div class="pod empty"></div>';
      return '<button class="pod p' + medals[i] + '" data-act="person" data-id="' + esc(row.id) + '" style="--i:' + i + '">' +
        '<span class="medal">' + medals[i] + '</span>' +
        boardFace(row, 'pod-ava') +
        '<b>' + esc(row.name) + (row.premium ? premMark() : '') + '</b>' +
        '<em>' + esc(Number(row.rating10 || 0).toFixed(1)) + '</em>' +
        '<span>' + esc(compactNum(row.ratingsCount)) + '</span></button>';
    }).join('');
    var rest = rows.slice(3).map(function (row, i) {
      return '<button class="board-row" data-act="person" data-id="' + esc(row.id) + '" style="--i:' + Math.min(i, 7) + '">' +
        '<span class="rk">' + row.rank + '</span>' + boardFace(row, '') +
        '<span class="who"><b>' + esc(row.name) + (row.premium ? premMark() : '') + '</b><small>' + esc(row.city || '') + '</small></span>' +
        '<span class="sc"><b>' + esc(Number(row.rating10 || 0).toFixed(1)) + '</b><small>' + esc(compactNum(row.ratingsCount)) + '</small></span></button>';
    }).join('');
    function seg(id, label) {
      return '<button type="button" data-act="board" data-period="' + id + '" class="' + (period === id ? 'on' : '') + '">' + label + '</button>';
    }
    var idx = period === 'today' ? 0 : period === 'week' ? 1 : 2;
    return '<div class="screen"><div class="scroll"><div class="page-head board-head"><h1>Рейтинг</h1><p>Лучшие анкеты</p></div>' +
      '<div class="pad"><div class="seg" data-i="' + idx + '"><i class="seg-pill"></i>' +
      seg('today', 'Сегодня') + seg('week', 'Неделя') + seg('all', 'Всё время') + '</div></div>' +
      '<div class="podium">' + podium + '</div>' +
      '<div class="board">' + rest + '</div></div></div>';
  }

  function stageHTML() {
    if (S.screen === 'register') return regScreen();
    if (S.screen === 'ratings') return ratingsScreen();
    if (S.screen === 'rating') return ratingBoard();
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
    if (!S.hydrating && unresolvedMedia()) {
      S.hydrating = true;
      var pending = [];
      collectMedia(S.me, pending);
      (S.feed || []).forEach(function (p) { collectMedia(p, pending); });
      if (S.person) collectMedia(S.person, pending);
      Promise.all(pending.map(resolveMedia)).then(function () {
        S.hydrating = false;
        render();
      }).catch(function () { S.hydrating = false; });
    }
    stage.innerHTML = stageHTML();
    if (S.spring) {
      var entered = stage.firstElementChild;
      if (entered) entered.classList.add('spring-in');
      S.spring = '';
    }
    nav.innerHTML = tabsVisible() ? tabs() : '';
    restoreScroll();
    renderSheet();
    renderStory();
    renderMatch();
    syncBack();
    requestAnimationFrame(function () { placePill(false); syncFloatPill(document.getElementById('feed-scroll')); bindFeedVideos(); });
    runCountUps(stage);
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
    if (act === 'tab') {
      var nextTab = t.getAttribute('data-tab') || 'feed';
      var here = (nextTab === 'profile' && (S.screen === 'profile' || S.screen === 'person')) || S.screen === nextTab;
      if (here && nextTab === 'feed') {
        var top = document.getElementById('feed-scroll');
        if (top) top.scrollTo({ top: 0, behavior: motionOff() ? 'auto' : 'smooth' });
        return;
      }
      if (here) { goTab('feed'); return; }
      goTab(nextTab);
      return;
    }
    if (act === 'mode') {
      var mode = t.getAttribute('data-mode');
      if (mode && mode !== S.mode) {
        S.mode = mode;
        if (window.TG) TG.selection();
        loadFeed().then(render);
      }
      return;
    }
    if (act === 'float-pill') {
      var feed = document.getElementById('feed-scroll');
      if (S.hasNew) {
        CupionAPI.releaseNew().then(function () {
          S.hasNew = false;
          S.forceTop = true;
          return loadFeed(false);
        }).then(function () { return loadStories(); }).then(render).catch(function () {});
      } else if (feed) {
        feed.scrollTo({ top: 0, behavior: motionOff() ? 'auto' : 'smooth' });
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
    if (act === 'board') {
      S.board = t.getAttribute('data-period') || 'all';
      if (window.TG) TG.selection();
      loadBoard().then(render);
      return;
    }
    if (act === 'person') {
      var personId = t.getAttribute('data-id');
      var ret = null;
      if (S.story) {
        ret = { userId: S.story.userId, index: S.story.index, sheet: S.sheet === 'reactions' ? { name: 'reactions', payload: S.sheetPayload } : null };
      }
      if (S.peek) closePeek(true);
      if (S.sheet) closeSheet();
      if (S.story) closeStory({ keep: true });
      openPerson(personId, ret);
      return;
    }
    if (act === 'react-back') {
      var toId = t.getAttribute('data-id');
      var storyId = t.getAttribute('data-story');
      CupionAPI.reactBack({ toId: toId, storyId: storyId }).then(function (res) {
        if (window.TG) TG.notify('success');
        return loadInbox().then(function () {
          if (res && res.match) {
            closeSheet();
            return CupionAPI.getUser(toId).then(function (user) {
              showMatch(user, 'story');
              return loadRatings();
            });
          }
          return null;
        });
      }).then(function () {
        storySig = '';
        if (S.sheet === 'reactions') { sheetSig = ''; renderSheet(); }
        if (S.story) renderStory();
        if (S.screen === 'profile' || S.screen === 'ratings') render();
      }).catch(function (err) { toast(err.message || 'Не вышло'); });
      return;
    }
    if (act === 'search') { openSheet('search', { key: 'search' }); return; }
    if (act === 'start-reg') { S.screen = 'register'; S.regStep = 0; render(); return; }
    if (act === 'back') { goBack(); return; }
    if (act === 'card-story') {
      var userId = t.getAttribute('data-id');
      if (!userId) return;
      e.stopPropagation();
      e.preventDefault();
      startStory(userId, 0, null, true);
      return;
    }
    if (act === 'rate-star') {
      if (needAccount()) return;
      var postId = t.getAttribute('data-post');
      var scoreVal = parseInt(t.getAttribute('data-score'), 10);
      var photoId = '';
      
      // Find photo ID from feed
      var post = (S.feed || []).find(function(p) { return p.id === postId; });
      if (post && post.photos && post.photos[0]) {
        photoId = post.photos[0].id;
      }
      
      // Get comment text before card disappears
      var commentArea = document.getElementById('comment-' + postId);
      var commentText = commentArea ? commentArea.value.trim() : '';
      
      // Immediately hide card with animation
      var card = document.querySelector('.post[data-post="' + postId + '"]');
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(-20px)';
      }
      
      // Send rating
      CupionAPI.rate({ toId: postId, photoId: photoId, score: scoreVal, text: commentText }).then(function (res) {
        setTimeout(function() {
          S.feed = S.feed.filter(function(p) { return p.id !== postId; });
          if (S.feed.length === 0) {
            loadFeed(true).then(render);
          } else {
            render();
          }
        }, 300);
        
        if (res.match) {
          setTimeout(function() {
            Promise.all([CupionAPI.getUser(postId), loadRatings(), refreshMe()]).then(function (out) {
              showMatch(out[0]);
            });
          }, 400);
        }
        toast('Оценка отправлена');
        if (window.TG) TG.notify('success');
      }).catch(function (err) { 
        toast(err.message || 'Не вышло');
        // Restore card if error
        if (card) {
          card.style.opacity = '1';
          card.style.transform = 'none';
        }
      });
      
      if (window.TG) TG.selection();
      return;
    }
    if (act === 'send-card-rate') {
      // This action is now unused - rating happens on star click
      return;
    }
    if (act === 'rate') { if (S.peek) closePeek(true); if (needAccount()) return; if (S.me && t.getAttribute('data-id') === S.me.id) { toast('Себе оценку поставить нельзя'); return; } if (window.TG) TG.impact('light'); openRate(t.getAttribute('data-id'), t.getAttribute('data-photo')); return; }
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
    if (act === 'story-sound') {
      S.storySound = !S.storySound;
      var storyVideo = document.querySelector('.story-layer video.story-video');
      if (storyVideo) storyVideo.muted = !S.storySound;
      t.classList.toggle('on', !!S.storySound);
      t.innerHTML = S.storySound ? ICON.speakerOn : ICON.speaker;
      return;
    }
    if (act === 'feed-sound') {
      var frame = t.closest('.frame');
      var feedVideo = frame && frame.querySelector('video');
      if (!feedVideo) return;
      feedVideo.muted = !feedVideo.muted;
      t.classList.toggle('on', !feedVideo.muted);
      t.innerHTML = feedVideo.muted ? ICON.speaker : ICON.speakerOn;
      if (!feedVideo.muted) feedVideo.play().catch(function () {});
      return;
    }
    if (act === 'story-reactions') {
      var rxStory = t.getAttribute('data-story') || (S.story && S.story.items[S.story.index] ? S.story.items[S.story.index].id : '');
      openSheet('reactions', { key: 'rx-' + rxStory, storyId: rxStory });
      return;
    }
    if (act === 'story') { startStory(t.getAttribute('data-id'), parseInt(t.getAttribute('data-index') || '0', 10)); return; }
    if (act === 'react') {
      if (needAccount()) return;
      if (S.story && (S.story.userId === 'me' || (S.me && S.story.userId === S.me.id)) || (S.me && t.getAttribute('data-id') === S.me.id)) {
        toast('Себе реакцию поставить нельзя');
        return;
      }
      var emo = t.getAttribute('data-emoji');
      var sid = t.getAttribute('data-story');
      S.picked = S.picked || {};
      S.picked[sid] = emo;
      var row = t.parentNode;
      if (row) Array.prototype.forEach.call(row.children, function (btn) {
        btn.classList.toggle('on', btn === t);
      });
      t.classList.remove('pop');
      t.offsetWidth;
      t.classList.add('pop');
      burstReaction(t.closest('.story-layer'), t, emo);
      if (window.TG) TG.impact('medium');
      CupionAPI.reactStory({ toId: t.getAttribute('data-id'), storyId: sid, emoji: emo }).catch(function () {});
      return;
    }
    if (act === 'send-story-comment') {
      if (needAccount()) return;
      var storyId = t.getAttribute('data-story');
      var userId = t.getAttribute('data-user');
      var input = document.getElementById('story-comment-' + storyId);
      if (!input) return;
      var text = input.value.trim();
      if (!text) { toast('Напиши комментарий'); return; }
      CupionAPI.commentStory({ toId: userId, storyId: storyId, text: text }).then(function() {
        input.value = '';
        toast('Комментарий отправлен');
        if (window.TG) TG.notify('success');
      }).catch(function(err) {
        toast(err.message || 'Не вышло');
      });
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
    if (act === 'peek-close') { if (e.target === t) closePeek(); return; }
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
          return Promise.all([CupionAPI.getUser(id), loadRatings(), refreshMe()]).then(function (out) {
            showMatch(out[0]);
            render();
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
    if (act === 'plan') { S.plan = t.getAttribute('data-plan') || 'trial'; sheetSig = ''; renderSheet(); return; }
    if (act === 'buy') {
      var plan = S.plan || 'trial';
      
      // Для тестирования - просто активируем Premium без реальной оплаты
      // В продакшене здесь будет реальная оплата через Telegram Stars
      toast('Активация Premium...');
      
      CupionAPI.purchaseSubscription(plan, { paid: true }).then(function (res) {
        S.me = res.me;
        closeSheet();
        var duration = plan === 'trial' ? '1 день' : plan === 'month' ? '30 дней' : '365 дней';
        toast('✨ Premium подключён на ' + duration);
        if (window.TG) TG.notify('success');
        return loadFeed();
      }).then(render).catch(function (err) { 
        toast(err.message || 'Не вышло'); 
      });
      
      return;
    }
    if (act === 'pick-post') {
      var usedNow = countPhotos(S.me && S.me.photos);
      if (usedNow >= photoCap()) {
        if (S.me && S.me.premium) toast('Уже ' + photoCap() + ' фото');
        else openSheet('premium', { key: 'photos' });
        return;
      }
      S.compose.type = 'photo';
      pickFiles('post');
      return;
    }
    if (act === 'pick-story') { S.compose.type = 'story'; pickFiles('story'); return; }
    if (act === 'pick-video') {
      if (!(S.me && S.me.premium)) { openSheet('premium', { key: 'video' }); return; }
      S.compose.type = 'video';
      pickFiles('video');
      return;
    }
    if (act === 'pick-reg') { pickFiles('reg'); return; }
    if (act === 'pick-edit') { pickFiles('edit'); return; }
    if (act === 'publish') { publishCompose(); return; }
    if (act === 'photo-move') {
      var list = t.getAttribute('data-kind') === 'edit' ? (S.edit && S.edit.photos) : S.reg.photos;
      if (!list) return;
      var from = parseInt(t.getAttribute('data-index'), 10);
      var to = from + parseInt(t.getAttribute('data-dir'), 10);
      if (to < 0 || to >= list.length) return;
      var moved = list[from];
      list[from] = list[to];
      list[to] = moved;
      if (t.getAttribute('data-kind') === 'edit') { sheetSig = ''; renderSheet(); }
      else render();
      return;
    }
    if (act === 'replace-photo') {
      S.replaceAt = parseInt(t.getAttribute('data-index'), 10);
      pickFiles(t.getAttribute('data-kind') === 'edit' ? 'replace-edit' : 'replace-reg');
      return;
    }
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
    if (act === 'skip-city') {
      S.reg.city = '';
      S.regDir = 1;
      S.regStep = 2;
      if (S.reg.username) checkUsername(S.reg.username);
      if (window.TG) TG.impact('light');
      render();
      return;
    }
    if (act === 'reg-next') { advanceReg(); return; }
    if (act === 'skip-bio') { S.reg.bio = ''; finishReg(); return; }
    if (act === 'edit') {
      S.edit = {
        name: S.me.name,
        bio: S.me.bio || '',
        lookingFor: S.me.lookingFor || 'all',
        photos: (S.me.photos || []).map(function (p) { return { id: p.id, url: p.url, type: p.type, poster: p.poster || '', ratio: p.ratio || 0 }; })
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
    if (act === 'card-more' || act === 'more') {
      var uid = t.getAttribute('data-id');
      var user = profileById(uid);
      if (!user && S.person && S.person.id === uid) user = S.person;
      if (!user) return;
      if (S.me && uid === S.me.id) {
        openSheet('more', { username: user.username, name: user.name, id: user.id, key: 'more-' + user.username });
      } else {
        openSheet('actions', { username: user.username, name: user.name, id: user.id, key: 'act-' + user.id });
      }
      return;
    }
    if (act === 'report-open') {
      var reported = profileById(t.getAttribute('data-id')) || { id: t.getAttribute('data-id'), name: '' };
      openSheet('report', { id: reported.id, name: reported.name, key: 'rep-' + reported.id });
      return;
    }
    if (act === 'report-send') {
      var rid = t.getAttribute('data-id');
      var note = (document.getElementById('report-text') || {}).value || '';
      CupionAPI.reportProfile({ userId: rid, reason: t.getAttribute('data-reason'), text: note }).then(function () {
        dropProfile(rid);
        closeSheet();
        toast('Жалоба отправлена');
        render();
      }).catch(function (err) { toast(err.message || 'Не вышло'); });
      return;
    }
    if (act === 'hide-profile') {
      var hid = t.getAttribute('data-id');
      CupionAPI.hideProfile(hid).then(function () {
        dropProfile(hid);
        closeSheet();
        toast('Анкета скрыта');
        render();
      }).catch(function () {});
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
      CupionAPI.addStory({ url: c.photos[0].url }).then(function () { return refreshMe(); }).then(function () { return loadInbox(); }).then(function () {
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
      loadFeed().then(render);
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
      var peek = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        var ratio = h ? w / h : 1;
        URL.revokeObjectURL(peek);
        putMedia(file).then(function (url) {
          resolve({ url: url, ratio: ratio, type: 'photo', width: w, height: h });
        }).catch(function (err) { reject(err); });
      };
      img.onerror = function () { URL.revokeObjectURL(peek); reject(new Error('Не удалось прочитать фото')); };
      img.src = peek;
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
      var finish = function (poster) {
        var ratio = video.videoHeight ? (video.videoWidth / video.videoHeight) : 0;
        putMedia(file).then(function (stored) {
          URL.revokeObjectURL(url);
          resolve({ url: stored, poster: poster || '', type: 'video', ratio: ratio });
        }).catch(function () {
          resolve({ url: url, poster: poster || '', type: 'video', ratio: ratio });
        });
      };
      video.onloadeddata = function () {
        try { video.currentTime = Math.min(0.2, (video.duration || 1) / 3); } catch (e) { finish(''); }
      };
      video.onseeked = function () {
        try {
          var vw = video.videoWidth || 480;
          var vh = video.videoHeight || 640;
          var scale = Math.min(1, 640 / Math.max(vw, vh));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(vw * scale));
          canvas.height = Math.max(1, Math.round(vh * scale));
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          finish(canvas.toDataURL('image/jpeg', 0.8));
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
    var room = 1;
    if (purpose === 'reg') room = Math.max(0, 3 - S.reg.photos.length);
    else if (purpose === 'edit') room = Math.max(0, photoCap() - countPhotos(S.edit.photos));
    else if (purpose === 'post') room = Math.max(0, photoCap() - countPhotos(S.me && S.me.photos));
    else if (purpose === 'replace-edit' || purpose === 'replace-reg') room = 1;
    else room = 1;
    if (!room) { toast(purpose === 'reg' ? 'Можно 3 фото' : 'Лимит фото'); return; }
    Promise.all(files.slice(0, room).map(readImage)).then(function (pics) {
      if (purpose === 'replace-reg' || purpose === 'replace-edit') {
        var bucket = purpose === 'replace-edit' ? S.edit.photos : S.reg.photos;
        var at = S.replaceAt || 0;
        if (bucket && bucket[at] && pics[0]) {
          bucket[at] = Object.assign({}, bucket[at], pics[0], { type: 'photo' });
        }
        if (purpose === 'replace-edit') { sheetSig = ''; renderSheet(); }
        else render();
        return;
      }
      if (purpose === 'reg') {
        S.reg.photos = S.reg.photos.concat(pics).slice(0, 3);
        render();
      } else if (purpose === 'edit') {
        var roomLeft = photoCap() - countPhotos(S.edit.photos);
        S.edit.photos = S.edit.photos.concat(pics.slice(0, roomLeft));
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
        S.compose.photos = pics.slice(0, photoCap());
        S.compose.stage = 'preview';
        sheetSig = '';
        renderSheet();
      }
    }).catch(function (err) { toast(err.message || 'Фото не прочиталось'); });
  }

  /* ---------- gestures ---------- */

  var SPRING = 'transform .45s cubic-bezier(0.32, 0.72, 0, 1)';
  var TABS = ['profile', 'feed', 'rating', 'ratings'];

  function tabIndex() {
    var i = TABS.indexOf(S.screen);
    return i < 0 ? 1 : i;
  }

  function edgeLayer() {
    if (S.peek) {
      var peekCard = document.querySelector('.peek-card');
      if (peekCard) return { mode: 'peek', layer: peekCard };
    }
    if (S.match) {
      var match = document.querySelector('.match-layer');
      if (match) return { mode: 'match', layer: match };
    }
    if (S.viewer) {
      var viewer = document.querySelector('.viewer');
      if (viewer) return { mode: 'viewer', layer: viewer };
    }
    if (S.story) {
      var story = document.querySelector('.story-layer');
      if (story) return { mode: 'story', layer: story };
    }
    if (S.sheet) {
      var sheet = document.querySelector('.sheet');
      if (sheet) return { mode: 'sheet', layer: sheet };
    }
    if (S.screen === 'person' || S.screen === 'rating' || (S.screen === 'register' && S.regStep > 0)) {
      var stage = document.getElementById('stage');
      if (stage) return { mode: 'page', layer: stage };
    }
    return null;
  }

  function springBack(layer) {
    if (!layer) return;
    layer.style.transition = SPRING;
    layer.style.transform = '';
  }

  function finishEdge(g) {
    if (g.mode === 'sheet') closeSheet({ dragged: true });
    else if (g.mode === 'story') closeStory();
    else if (g.mode === 'viewer') closeViewer();
    else if (g.mode === 'peek') closePeek();
    else if (g.mode === 'match') closeMatch();
    else {
      if (g.layer) {
        g.layer.style.transition = 'none';
        g.layer.style.transform = '';
      }
      goBack();
    }
  }

  var press = null;
  var PULL_AT = 64;

  function quietSwallow() {
    swallowClick = true;
    setTimeout(function () { swallowClick = false; }, 90);
  }

  function onPointerDown(e) {
    if (e.button != null && e.button !== 0) return;
    if (press) { clearTimeout(press.timer); press = null; }
    if (!S.sheet && !S.story && !S.viewer && !S.match && !S.peek && S.screen === 'feed') {
      var pc = e.target.closest('.post');
      if (pc && !e.target.closest('.card-more, .rate-pill, .sound-btn, .play-badge, .post-head')) {
        press = { x: e.clientX, y: e.clientY, id: pc.getAttribute('data-post'), fired: false };
        press.timer = setTimeout(function () {
          if (!press) return;
          press.fired = true;
          openPeek(press.id);
        }, 380);
      }
    }
    if (S.peek) {
      var pk = e.target.closest('[data-peek-card]');
      if (pk && !e.target.closest('button') && e.clientX > 26) {
        gesture = { kind: 'peek', x: e.clientX, y: e.clientY, layer: pk };
        return;
      }
    }
    var onField = e.target.closest('input, textarea, a');
    var onCarousel = e.target.closest('[data-swipe]');
    if (!onField && !onCarousel && e.clientX <= 26 && !e.target.closest('button')) {
      var edge = edgeLayer();
      if (edge && edge.layer) {
        gesture = { kind: 'edge-wait', x: e.clientX, y: e.clientY, mode: edge.mode, layer: edge.layer };
        return;
      }
    }
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
    var rxSheet = sheet && sheet.classList.contains('sheet-rx') && !e.target.closest('input, textarea, .rx-back');
    if (sheet && (grab || rxSheet || !e.target.closest('input, textarea, button, a'))) {
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
    if (S.screen === 'feed' && !onField && !S.sheet && !S.story && !S.viewer && !S.match && !S.peek) {
      var fs = document.getElementById('feed-scroll');
      if (fs && fs.contains(e.target) && fs.scrollTop <= 0 && e.target.closest('button')) {
        gesture = { kind: 'nav-wait', x: e.clientX, y: e.clientY, scroll: fs, fromButton: true };
        return;
      }
    }
    if (onField || e.target.closest('button')) return;
    if (S.screen === 'person' && !S.sheet && !S.story && !S.viewer && !S.match) {
      var profileScroll = document.querySelector('#stage .scroll');
      if (profileScroll && profileScroll.scrollTop <= 0) {
        gesture = { kind: 'profile-wait', x: e.clientX, y: e.clientY, layer: document.getElementById('stage'), sc: profileScroll };
        return;
      }
    }
    if (!S.sheet && !S.story && !S.viewer && !S.match && (S.screen === 'feed' || S.screen === 'profile' || S.screen === 'ratings' || S.screen === 'rating')) {
      gesture = { kind: 'nav-wait', x: e.clientX, y: e.clientY, scroll: e.target.closest('#feed-scroll') };
    }
  }

  function onPointerMove(e) {
    if (press && !press.fired && (Math.abs(e.clientX - press.x) > 9 || Math.abs(e.clientY - press.y) > 9)) {
      clearTimeout(press.timer);
      press = null;
    }
    if (!gesture) return;
    var dx = e.clientX - (gesture.x || 0);
    var dy = e.clientY - (gesture.y || 0);
    if (gesture.kind === 'edge-wait') {
      if (dx > 8 && Math.abs(dx) > Math.abs(dy)) {
        gesture.kind = 'edge';
        gesture.layer.style.transition = 'none';
      } else if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        if (gesture.mode === 'story') {
          gesture.kind = 'story-drag';
          gesture.layer.style.transition = 'none';
        } else if (gesture.mode === 'viewer') gesture.kind = 'viewer';
        else if (gesture.mode === 'peek') {
          gesture.kind = 'peek';
          gesture.layer.style.transition = 'none';
        } else if (gesture.mode === 'sheet') {
          gesture.kind = 'sheet';
          gesture.sheet = gesture.layer;
          gesture.scTop = 0;
        } else if (gesture.mode === 'page' && S.screen === 'person' && dy > 0) {
          var top = document.querySelector('#stage .scroll');
          if (top && top.scrollTop <= 0) {
            gesture.kind = 'profile';
            gesture.layer.style.transition = 'none';
          } else gesture = null;
        } else gesture = null;
      }
    }
    if (!gesture) return;
    if (gesture.kind === 'edge') {
      var follow = Math.max(0, e.clientX - gesture.x);
      gesture.layer.style.transform = 'translateX(' + follow + 'px)';
      gesture.drag = follow;
      e.preventDefault();
      return;
    }
    if (gesture.kind === 'profile-wait') {
      if (dy > 12 && dy > Math.abs(dx) && gesture.sc && gesture.sc.scrollTop <= 0) {
        gesture.kind = 'profile';
        gesture.layer.style.transition = 'none';
      } else if (Math.abs(dx) > 12 || dy < -8) gesture = null;
    }
    if (!gesture) return;
    if (gesture.kind === 'profile') {
      var downY = Math.max(0, e.clientY - gesture.y);
      gesture.layer.style.transform = 'translateY(' + downY + 'px)';
      gesture.drag = downY;
      e.preventDefault();
      return;
    }
    if (gesture.kind === 'nav-wait') {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) && gesture.fromButton) gesture = null;
      else if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        gesture.kind = 'nav';
        gesture.layer = document.getElementById('stage');
        if (gesture.layer) gesture.layer.style.transition = 'none';
      } else if (dy > 10 && dy > Math.abs(dx) && gesture.scroll && gesture.scroll.scrollTop <= 0) gesture.kind = 'pull';
      else if (Math.abs(dy) > 12) gesture = null;
    }
    if (!gesture) return;
    if (gesture.kind === 'nav' && gesture.layer) {
      var shift = e.clientX - gesture.x;
      var at = tabIndex();
      if ((at === 0 && shift > 0) || (at === TABS.length - 1 && shift < 0)) shift *= 0.32;
      gesture.layer.style.transform = 'translateX(' + shift + 'px)';
      gesture.drag = shift;
      e.preventDefault();
      return;
    }
    if (gesture.kind === 'story') {
      if (dy > 16 && dy > Math.abs(dx)) {
        clearTimeout(gesture.hold);
        if (S.story) S.story.paused = false;
        gesture.kind = 'story-drag';
        gesture.layer.style.transition = 'none';
      }
    }
    if (gesture.kind === 'peek') {
      var peekDown = Math.max(0, e.clientY - gesture.y);
      gesture.layer.style.transform = 'translateY(' + peekDown + 'px) scale(' + Math.max(0.9, 1 - peekDown / 1400).toFixed(3) + ')';
      gesture.drag = peekDown;
      return;
    }
    if (gesture.kind === 'story-drag' || gesture.kind === 'viewer') {
      var down = Math.max(0, e.clientY - gesture.y);
      gesture.layer.style.transform = 'translateY(' + down + 'px)';
      gesture.drag = down;
      return;
    }
    if (gesture.kind === 'sheet') {
      var pull = e.clientY - gesture.y;
      var rx = gesture.sheet.classList.contains('sheet-rx');
      if (rx && pull < -36 && !gesture.sheet.classList.contains('expanded')) {
        gesture.sheet.classList.add('expanded');
        S.rxExpanded = true;
        if (window.TG) TG.impact('light');
        quietSwallow();
        gesture = null;
        return;
      }
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
    if (!gesture) return;
    if (gesture.kind === 'pull-wait') {
      var py = e.clientY - gesture.y;
      if (gesture.scroll.scrollTop <= 0 && py > 8 && py > Math.abs(e.clientX - gesture.x)) gesture.kind = 'pull';
      else if (Math.abs(e.clientX - gesture.x) > 8) gesture = null;
    }
    if (gesture && gesture.kind === 'pull') {
      var dist = Math.max(0, Math.min(120, (e.clientY - gesture.y) * 0.5));
      var indicator = document.getElementById('pull');
      if (indicator) {
        indicator.style.transition = 'none';
        indicator.style.height = dist + 'px';
        indicator.style.setProperty('--pp', Math.min(1, dist / PULL_AT).toFixed(3));
        var ready = dist >= PULL_AT;
        if (ready !== !!gesture.ready) {
          gesture.ready = ready;
          indicator.classList.toggle('ready', ready);
          if (ready && window.TG) TG.impact('light');
        }
      }
      gesture.drag = dist;
    }
  }

  function runPullRefresh(ind) {
    if (S.refreshing) return;
    S.refreshing = true;
    if (ind) {
      ind.style.transition = 'height .35s cubic-bezier(0.32, 0.72, 0, 1)';
      ind.style.height = '64px';
      ind.classList.add('loading');
    }
    if (window.TG) TG.impact('medium');
    var t0 = Date.now();
    CupionAPI.releaseNew().catch(function () {}).then(function () {
      S.hasNew = false;
      S.forceTop = true;
      return loadFeed(false);
    }).then(function () { return loadStories(); }).then(function () {
      return new Promise(function (resolve) { setTimeout(resolve, Math.max(0, 900 - (Date.now() - t0))); });
    }).then(function () {
      if (ind) {
        ind.classList.remove('loading');
        ind.classList.add('done');
        ind.style.height = '0px';
      }
      return new Promise(function (resolve) { setTimeout(resolve, 300); });
    }).then(function () {
      S.refreshing = false;
      if (window.TG) TG.notify('success');
      render();
    }).catch(function () {
      S.refreshing = false;
      if (ind) { ind.classList.remove('loading'); ind.style.height = '0px'; }
    });
  }

  function onPointerUp() {
    if (press) {
      clearTimeout(press.timer);
      var fired = press.fired;
      press = null;
      if (fired) {
        gesture = null;
        quietSwallow();
        return;
      }
    }
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
    if (g.kind === 'peek') {
      if ((g.drag || 0) > 90) {
        quietSwallow();
        closePeek();
      } else if (g.layer) {
        g.layer.style.transition = 'transform .45s cubic-bezier(0.32, 0.72, 0, 1)';
        g.layer.style.transform = '';
      }
      return;
    }
    if (g.kind === 'sheet') {
      if (g.sheet.classList.contains('sheet-rx') && g.sheet.classList.contains('expanded') && (g.drag || 0) > 90) {
        g.sheet.style.transition = '';
        g.sheet.style.transform = '';
        g.sheet.classList.remove('expanded');
        S.rxExpanded = false;
        quietSwallow();
        return;
      }
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
    if (g.kind === 'edge-wait' && g.mode === 'story') {
      prevStory();
      return;
    }
    if (g.kind === 'edge') {
      var width = window.innerWidth || 390;
      if ((g.drag || 0) > Math.min(110, width * 0.28)) {
        g.layer.style.transition = SPRING;
        g.layer.style.transform = 'translateX(' + width + 'px)';
        swallowClick = true;
        setTimeout(function () { finishEdge(g); }, 420);
      } else springBack(g.layer);
      return;
    }
    if (g.kind === 'profile') {
      if ((g.drag || 0) > 110) {
        var h = window.innerHeight || 700;
        g.layer.style.transition = SPRING;
        g.layer.style.transform = 'translateY(' + h + 'px)';
        swallowClick = true;
        setTimeout(function () {
          g.layer.style.transition = 'none';
          g.layer.style.transform = '';
          goBack();
        }, 420);
      } else springBack(g.layer);
      return;
    }
    if (g.kind === 'nav') {
      var index = tabIndex();
      var next = index;
      if ((g.drag || 0) < -64 && index < TABS.length - 1) next = index + 1;
      if ((g.drag || 0) > 64 && index > 0) next = index - 1;
      if (next !== index && g.layer) {
        var page = window.innerWidth || 390;
        g.layer.style.transition = SPRING;
        g.layer.style.transform = 'translateX(' + ((g.drag || 0) < 0 ? -page : page) + 'px)';
        swallowClick = true;
        setTimeout(function () {
          g.layer.style.transition = 'none';
          g.layer.style.transform = '';
          goTab(TABS[next]);
        }, 420);
      } else springBack(g.layer);
      return;
    }
    if (g.kind === 'pull') {
      var ind = document.getElementById('pull');
      if ((g.drag || 0) > 8) quietSwallow();
      if ((g.drag || 0) >= PULL_AT) runPullRefresh(ind);
      else if (ind) {
        ind.style.transition = 'height .35s cubic-bezier(0.32, 0.72, 0, 1)';
        ind.style.height = '0px';
        ind.style.setProperty('--pp', '0');
        ind.classList.remove('ready');
      }
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
    root.innerHTML = '<div id="stage"></div><div id="tabs"></div><div id="sheet-root"></div><div id="story-root"></div><div id="peek-root"></div><div id="match-root"></div><div id="toast-root"></div>' +
      '<input id="pick-images" type="file" accept="image/*" multiple hidden><input id="pick-video" type="file" accept="video/*" hidden>';
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', function (e) {
      if (e.target && (e.target.id === 'pick-images' || e.target.id === 'pick-video')) onFiles(e);
    });
    document.addEventListener('input', onRange);
    document.addEventListener('scroll', function (e) {
      var scroller = e.target;
      if (!scroller || scroller.id !== 'feed-scroll') return;
      syncFloatPill(scroller);
      if (motionOff()) return;
      var orbit = scroller.querySelector('.orbit');
      if (!orbit) return;
      var y = scroller.scrollTop || 0;
      var shift = Math.max(-16, -y * 0.055);
      var scale = Math.max(0.965, 1 - y / 2000);
      orbit.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0) scale(' + scale.toFixed(3) + ')';
    }, true);
    document.addEventListener('touchmove', function (e) {
      if (gesture && (gesture.kind === 'pull' || gesture.kind === 'nav') && e.cancelable) e.preventDefault();
    }, { passive: false });
    document.addEventListener('contextmenu', function (e) {
      if (e.target.closest && e.target.closest('.post, .peek')) e.preventDefault();
    });
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
      CupionAPI.hasPendingNew().then(function (fresh) {
        S.hasNew = !!fresh;
        syncFloatPill(document.getElementById('feed-scroll'));
      }).catch(function () {});
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
    }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
