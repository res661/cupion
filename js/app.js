/* Cupion — chunk 1: shell + feed. Later screens plug into the same router. */
(function () {
  'use strict';

  var SLOTS = [
    { x: '16%', y: '30%', s: '54px', dx: '5px', dy: '-8px', dur: '5.6s', delay: '0s' },
    { x: '78%', y: '16%', s: '48px', dx: '-4px', dy: '7px', dur: '6.5s', delay: '-1s' },
    { x: '84%', y: '60%', s: '62px', dx: '3px', dy: '-6px', dur: '7.1s', delay: '-2s' },
    { x: '12%', y: '68%', s: '44px', dx: '6px', dy: '5px', dur: '5.9s', delay: '-0.4s' },
    { x: '34%', y: '12%', s: '40px', dx: '-3px', dy: '8px', dur: '6.8s', delay: '-1.5s' },
    { x: '64%', y: '76%', s: '46px', dx: '4px', dy: '-5px', dur: '6.2s', delay: '-2.2s' },
    { x: '28%', y: '80%', s: '36px', dx: '-5px', dy: '-6px', dur: '7.4s', delay: '-0.8s' }
  ];

  var S = {
    screen: 'feed',
    mode: 'new',
    feed: [],
    stories: [],
    me: null,
    unseen: 0,
    photoIndex: {},
    loading: true
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
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
    lock: svg('<rect x="6" y="10" width="12" height="9" rx="2"/><path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2"/>')
  };

  function ph(url, alt) {
    var fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#d5dee8"/></svg>');
    return '<img src="' + esc(url || fallback) + '" alt="' + esc(alt || '') + '" data-fallback="' + fallback + '">';
  }

  function bubble(user, slot) {
    var seen = user.stories && user.stories.length && user.stories.every(function (s) { return s.seen; });
    return '<button class="bubble" style="--x:' + slot.x + ';--y:' + slot.y + ';--s:' + slot.s + ';--dx:' + slot.dx + ';--dy:' + slot.dy + ';--dur:' + slot.dur + ';--delay:' + slot.delay + '" data-act="story" data-id="' + esc(user.id) + '">' +
      '<span class="bubble-drift"><span class="ring' + (seen ? ' seen' : '') + '">' + ph(user.avatar, '') + '</span></span></button>';
  }

  function orbit() {
    var html = SLOTS.map(function (slot, i) {
      return S.stories[i] ? bubble(S.stories[i], slot) : '';
    }).join('');
    var meAva = S.me && S.me.avatar ? ph(S.me.avatar, '') : '<span class="ph"></span>';
    html += '<button class="bubble me" data-act="add-story" aria-label="Моя история">' +
      '<span class="bubble-drift" style="--dur:6.8s;--dx:2px;--dy:-5px"><span class="ring seen">' + meAva + '</span>' +
      '<span class="plus">' + ICON.plus + '</span></span></button>';
    return '<div class="orbit">' + html + '</div>';
  }

  function slide(post, photo) {
    if (photo.type === 'video') {
      return '<div class="slide video-locked" data-act="premium"><img class="blurred" src="' + esc(photo.poster || photo.url) + '" alt="">' +
        '<span class="lock-badge">' + ICON.lock + ' Premium</span></div>';
    }
    return '<div class="slide">' + ph(photo.url, post.name) + '</div>';
  }

  function postCard(post) {
    if (!post || !post.photos || !post.photos.length) return '';
    var idx = S.photoIndex[post.id] || 0;
    if (idx >= post.photos.length) idx = 0;
    var slides = post.photos.map(function (p) { return slide(post, p); }).join('');
    var dots = post.photos.length > 1
      ? '<div class="shot-dots" data-dots="' + esc(post.id) + '">' + post.photos.map(function (_, i) {
          return '<i class="' + (i === idx ? 'on' : '') + '"></i>';
        }).join('') + '</div>'
      : '';
    var photo = post.photos[idx] || post.photos[0];
    return '<article class="post' + (post.premium ? ' is-premium' : '') + '" data-post="' + esc(post.id) + '">' +
      '<div class="post-head">' +
        '<button class="mini-ava" data-act="person" data-id="' + esc(post.id) + '">' + ph(post.avatar, '') + '</button>' +
        '<button class="post-user" data-act="person" data-id="' + esc(post.id) + '">@' + esc(post.username) + '</button>' +
        (post.premium ? '<span class="prem-tag">Premium</span>' : '') +
      '</div>' +
      '<div class="shot"><div class="shot-clip" data-swipe="' + esc(post.id) + '">' +
        '<div class="shot-track" data-track="' + esc(post.id) + '" style="transform:translateX(' + (-idx * 100) + '%)">' + slides + '</div>' +
        dots +
        '<div class="shot-actions">' +
          '<button class="glass-circle' + (post.myScore ? ' liked' : '') + '" data-act="rate" data-id="' + esc(post.id) + '" data-photo="' + esc(photo.id) + '" aria-label="Оценить">' + ICON.heart + '</button>' +
          '<button class="glass-circle" data-act="message" data-id="' + esc(post.id) + '" data-photo="' + esc(photo.id) + '" aria-label="Написать">' +
            svg('<rect x="4" y="6" width="16" height="12" rx="2.5"/><path d="M5 8l7 5 7-5"/>') +
          '</button>' +
        '</div></div>' +
        '<div class="rate-chip"><b>★</b> ' + esc(post.ratingLabel) + '</div></div>' +
      '<div class="post-title">' + esc(post.name) + ', ' + esc(post.age) + ' <span class="muted">· оценили ' + esc(post.ratingsCount) + '</span></div>' +
      '<p class="caption">' + esc(post.caption || post.bio || '') + '</p></article>';
  }

  function feedScreen() {
    var badge = S.unseen ? '<span class="badge">' + (S.unseen > 9 ? '9+' : S.unseen) + '</span>' : '';
    var ava = S.me && S.me.avatar ? ph(S.me.avatar, '') : '<span class="ph"></span>';
    var posts = S.loading
      ? '<div class="empty"><div class="empty-orb"></div><h3>Загрузка</h3></div>'
      : (S.feed.length ? S.feed.map(postCard).join('') : '<div class="empty"><div class="empty-orb"></div><h3>Пока пусто</h3><p>Новые анкеты появятся здесь.</p></div>');
    return '<div class="screen screen-feed enter">' +
      '<header class="app-header"><div class="wordmark">Cupion</div><div class="header-actions">' +
        '<button class="icon-btn" data-act="tab" data-tab="ratings" aria-label="Оценки">' + ICON.heart + badge + '</button>' +
        '<button class="icon-btn avatar-btn" data-act="tab" data-tab="profile" aria-label="Профиль">' + ava + '</button>' +
      '</div></header>' +
      '<div class="scroll" id="feed-scroll"><div class="pull" id="pull"><div class="spinner"></div></div>' +
        orbit() +
        '<button class="new-pill" data-act="new-pill" hidden>↑ Появились новые</button>' +
        '<div class="feed-tools"><div class="mini-seg" data-mode="' + S.mode + '"><i class="mini-pill"></i>' +
          '<button type="button" data-act="mode" data-mode="new" class="' + (S.mode === 'new' ? 'on' : '') + '">Новые</button>' +
          '<button type="button" data-act="mode" data-mode="all" class="' + (S.mode === 'all' ? 'on' : '') + '">Все</button>' +
        '</div><button class="icon-btn sm" data-act="refresh" aria-label="Обновить">' + ICON.refresh + '</button></div>' +
        posts + '</div></div>';
  }

  function plainScreen(title, text) {
    return '<div class="screen enter"><div class="page-head"><h1>' + title + '</h1><p>' + text + '</p></div>' +
      '<div class="scroll"><div class="empty"><div class="empty-orb"></div><h3>' + title + '</h3><p>' + text + '</p></div></div></div>';
  }

  function tabs() {
    var badge = S.unseen ? '<span class="badge">' + (S.unseen > 9 ? '9+' : S.unseen) + '</span>' : '';
    function tab(id, icon, label) {
      return '<button class="tab' + (S.screen === id ? ' active' : '') + '" data-act="tab" data-tab="' + id + '">' + icon + '<span>' + label + '</span>' +
        (id === 'ratings' ? badge : '') + '</button>';
    }
    return '<div class="tabbar-wrap"><div class="tabbar"><div class="tab-pill"></div>' +
      tab('feed', ICON.grid, 'Лента') +
      '<button class="tab-plus" data-act="compose" aria-label="Добавить">' + ICON.plus + '</button>' +
      tab('ratings', ICON.heart, 'Оценки') +
      tab('profile', ICON.user, 'Профиль') +
      '</div></div>';
  }

  function render() {
    var stage = document.getElementById('stage');
    var nav = document.getElementById('tabs');
    if (!stage) return;
    var html = S.screen === 'feed'
      ? feedScreen()
      : S.screen === 'ratings'
        ? plainScreen('Оценки', 'Кто оценил тебя')
        : plainScreen('Профиль', 'Анкета появится следующим обновлением');
    stage.innerHTML = html;
    nav.innerHTML = tabs();
    requestAnimationFrame(function () { placePill(false); });
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
    pill.style.height = Math.max(40, ar.height - 6) + 'px';
    pill.style.transform = 'translate(' + (ar.left - br.left) + 'px,' + (ar.top - br.top + 3) + 'px)';
    if (!animate) {
      pill.getBoundingClientRect();
      pill.style.transition = '';
    }
  }

  function loadFeed() {
    var limit = S.me && S.me.premium ? 20 : 10;
    return CupionAPI.getFeed({ mode: S.mode, limit: limit }).then(function (rows) {
      S.feed = rows || [];
      S.loading = false;
    });
  }

  function bootData() {
    return Promise.all([
      CupionAPI.getMe(),
      CupionAPI.getStoryUsers(),
      CupionAPI.unseenCount(),
      CupionAPI.getTheme()
    ]).then(function (res) {
      S.me = res[0];
      S.stories = res[1] || [];
      S.unseen = res[2] || 0;
      applyTheme(res[3] || 'auto');
      return loadFeed();
    }).then(render).catch(function (err) {
      console.error(err);
      S.loading = false;
      render();
    });
  }

  function applyTheme(pref) {
    var scheme = TG.colorScheme();
    var sysDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = pref === 'dark' || (pref !== 'light' && (scheme === 'dark' || (!scheme && sysDark)));
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    TG.paintChrome(dark);
  }

  function onClick(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.dataset.act;
    if (act === 'tab') {
      S.screen = t.dataset.tab || 'feed';
      TG.impact('light');
      render();
      return;
    }
    if (act === 'mode') {
      if (S.mode === t.dataset.mode) return;
      S.mode = t.dataset.mode;
      TG.selection();
      loadFeed().then(render);
      return;
    }
    if (act === 'refresh') {
      TG.impact('medium');
      loadFeed().then(render);
      return;
    }
    if (act === 'rate' || act === 'message' || act === 'person' || act === 'story' || act === 'compose' || act === 'add-story' || act === 'premium' || act === 'new-pill') {
      TG.selection();
    }
  }

  function mount() {
    var root = document.getElementById('app');
    if (!root) return;
    root.innerHTML = '<div id="stage"></div><div id="tabs"></div>';
    document.addEventListener('click', onClick);
    window.addEventListener('resize', function () { placePill(false); });
    document.addEventListener('cupion-insets', function () { placePill(false); });
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG' || img.dataset.fallbackApplied) return;
      if (!img.dataset.fallback) return;
      img.dataset.fallbackApplied = '1';
      img.src = img.dataset.fallback;
    }, true);
    TG.init();
    bootData();
    setTimeout(function () {
      CupionAPI.hasPendingNew().then(function (yes) {
        if (!yes) return;
        var pill = document.querySelector('.new-pill');
        if (pill) pill.hidden = false;
      }).catch(function () {});
    }, 8000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
