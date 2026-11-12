/* In-memory mock backend persisted to localStorage.
   Shapes match what a future HTTP API should return. */
(function () {
  'use strict';

  var KEY = 'cupion.v1';
  var THEME_KEY = 'cupion-theme';
  var DAY = 86400000;
  var VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  function img(id, w, h) {
    return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 900) + '&h=' + (h || 1120) + '&q=70&crop=faces';
  }

  function ph(id, unsplash, type) {
    var url = img(unsplash);
    if (type === 'video') {
      return { id: id, type: 'video', url: VIDEO, poster: url };
    }
    return { id: id, type: 'photo', url: url };
  }

  /* 20 profiles. pending:true anketas arrive after "Появились новые". */
  var PEOPLE = [
    { id: 'alina', username: 'alina', name: 'Алина', age: 21, gender: 'female', premium: true, rating10: 9.6, ratingsCount: 1200, matchesCount: 36, bio: 'кофе, плёнка и ночные кухни', caption: 'ищу с кем пропасть на выходные', createdAt: Date.now() - 2 * 3600000, photos: [ph('alina1', 'photo-1494790108377-be9c29b29330'), ph('alina2', 'photo-1524504388940-b1c1722653e1'), ph('alina3', 'photo-1531123897727-8f129e1688ce')], stories: ['photo-1494790108377-be9c29b29330', 'photo-1524504388940-b1c1722653e1'] },
    { id: 'masha', username: 'masha', name: 'Маша', age: 23, gender: 'female', premium: false, rating10: 9.2, ratingsCount: 86, matchesCount: 9, bio: 'танцую на кухне серьёзнее, чем в зале', caption: 'сегодня свет был слишком добрый', createdAt: Date.now() - 5 * 3600000, photos: [ph('masha1', 'photo-1534528741775-53994a69daeb'), ph('masha2', 'photo-1529626455594-4ff0802cfb7e')], stories: ['photo-1534528741775-53994a69daeb'] },
    { id: 'sonya', username: 'sonya', name: 'Соня', age: 20, gender: 'female', premium: false, rating10: 8.8, ratingsCount: 54, matchesCount: 4, bio: 'книги, дождь, поздний завтрак', caption: 'новый город, старые кеды', createdAt: Date.now() - 8 * 3600000, photos: [ph('sonya1', 'photo-1488426862026-3ee34a7d66df'), ph('sonya2', 'photo-1531746020798-e6953c6e8e04')], stories: ['photo-1488426862026-3ee34a7d66df'] },
    { id: 'eva', username: 'eva', name: 'Ева', age: 24, gender: 'female', premium: false, rating10: 9.0, ratingsCount: 73, matchesCount: 6, bio: 'снимаю людей, которые не позируют', caption: 'если улыбаюсь — уже почти да', createdAt: Date.now() - 14 * 3600000, photos: [ph('eva1', 'photo-1517841905240-472988babdf9'), ph('eva2', 'photo-1544005313-94ddf0286df2')], stories: ['eva-story'] },
    { id: 'kira', username: 'kira', name: 'Кира', age: 22, gender: 'female', premium: true, rating10: 9.4, ratingsCount: 141, matchesCount: 18, bio: 'видео, море и слишком громкий смех', caption: 'короткое видео с набережной', createdAt: Date.now() - 20 * 3600000, photos: [ph('kira1', 'photo-1525134479668-1bee5c7c6845', 'video'), ph('kira2', 'photo-1438761681033-6461ffad8d80')], stories: ['photo-1438761681033-6461ffad8d80'] },
    { id: 'lena', username: 'lena', name: 'Лена', age: 27, gender: 'female', premium: false, rating10: 8.6, ratingsCount: 97, matchesCount: 11, bio: 'архитектура и хороший хлеб', caption: 'воскресенье без будильника', createdAt: Date.now() - 26 * 3600000, photos: [ph('lena1', 'photo-1524502397800-2eeaad7c3fe5'), ph('lena2', 'photo-1502823403499-6ccfcf4fb453')], stories: ['lena-story'] },
    { id: 'polina', username: 'polina', name: 'Полина', age: 19, gender: 'female', premium: false, rating10: 9.1, ratingsCount: 41, matchesCount: 3, bio: 'учусь, гуляю, опаздываю красиво', caption: 'первое тёплое утро', createdAt: Date.now() - 30 * 3600000, photos: [ph('polina1', 'photo-1548142813-c348350df52b'), ph('polina2', 'photo-1504703395950-b89145a5425b')], stories: ['photo-1548142813-c348350df52b'] },
    { id: 'vika', username: 'vika', name: 'Вика', age: 25, gender: 'female', premium: false, rating10: 8.4, ratingsCount: 66, matchesCount: 7, bio: 'бег по утрам, кино по вечерам', caption: 'после длинной пробежки', createdAt: Date.now() - 36 * 3600000, photos: [ph('vika1', 'photo-1464863979621-258859e62245'), ph('vika2', 'photo-1487412720507-e7ab37603c6f')], stories: ['vika-story'] },
    { id: 'dasha', username: 'dasha', name: 'Даша', age: 22, gender: 'female', premium: false, rating10: 9.3, ratingsCount: 80, matchesCount: 8, bio: 'рисую шрифты и варю кофе', caption: 'мастерская пахнет бумагой', createdAt: Date.now() - 40 * 3600000, photos: [ph('dasha1', 'photo-1496440737103-cd596325d314'), ph('dasha2', 'photo-1531746020798-e6953c6e8e04')], stories: ['dasha-story'] },
    { id: 'mila', username: 'mila', name: 'Мила', age: 21, gender: 'female', premium: true, rating10: 9.7, ratingsCount: 156, matchesCount: 21, bio: 'свет, музыка, немного дерзости', caption: 'кадр, который не хотела выкладывать', createdAt: Date.now() - 48 * 3600000, photos: [ph('mila1', 'photo-1529626455594-4ff0802cfb7e', 'video'), ph('mila2', 'photo-1494790108377-be9c29b29330')], stories: ['mila-story'] },
    { id: 'vera', username: 'vera', name: 'Вера', age: 26, gender: 'female', premium: false, rating10: 8.9, ratingsCount: 70, matchesCount: 5, bio: 'тихо люблю громкие города', caption: 'вечерний свет в окне', createdAt: Date.now() - 52 * 3600000, photos: [ph('vera1', 'photo-1488426862026-3ee34a7d66df'), ph('vera2', 'photo-1517841905240-472988babdf9')], stories: ['vera-story'] },
    { id: 'nika', username: 'nika', name: 'Ника', age: 23, gender: 'female', premium: false, rating10: 9.5, ratingsCount: 33, matchesCount: 2, bio: 'только что из поезда', caption: 'новая анкета, старая улыбка', createdAt: Date.now() - 60 * 1000, pending: true, photos: [ph('nika1', 'photo-1534528741775-53994a69daeb'), ph('nika2', 'photo-1544005313-94ddf0286df2')], stories: ['photo-1544005313-94ddf0286df2'] },
    { id: 'max_k', username: 'max_k', name: 'Максим', age: 24, gender: 'male', premium: false, rating10: 9.0, ratingsCount: 92, matchesCount: 10, bio: 'снимаю улицы и людей на них', caption: 'город после дождя', createdAt: Date.now() - 3 * 3600000, photos: [ph('max1', 'photo-1500648767791-00dcc994a43e'), ph('max2', 'photo-1506794778202-cad84cf45f1d'), ph('max3', 'photo-1507003211169-0a1dd7228f2d')], stories: ['photo-1500648767791-00dcc994a43e'] },
    { id: 'gleb', username: 'gleb', name: 'Глеб', age: 26, gender: 'male', premium: false, rating10: 8.2, ratingsCount: 48, matchesCount: 4, bio: 'гитара, ночные кухни, честные разговоры', caption: 'после репетиции', createdAt: Date.now() - 10 * 3600000, photos: [ph('gleb1', 'photo-1492562080023-ab3db95bfbce'), ph('gleb2', 'photo-1539571696357-5a69c17a67c6')], stories: ['gleb-story'] },
    { id: 'artem', username: 'artem', name: 'Артём', age: 23, gender: 'male', premium: true, rating10: 9.4, ratingsCount: 110, matchesCount: 12, bio: 'дизайн, скейт и плохие шутки', caption: 'день, который хочется повторить', createdAt: Date.now() - 16 * 3600000, photos: [ph('artem1', 'photo-1504257432389-52343af06ae3'), ph('artem2', 'photo-1552374196-c4e7ffc6e126')], stories: ['artem-story'] },
    { id: 'ivan', username: 'ivan', name: 'Иван', age: 28, gender: 'male', premium: false, rating10: 8.5, ratingsCount: 77, matchesCount: 6, bio: 'готовлю лучше, чем переписываюсь', caption: 'короткое видео с кухни', createdAt: Date.now() - 22 * 3600000, photos: [ph('ivan1', 'photo-1463453091185-61582044d556', 'video'), ph('ivan2', 'photo-1488161628813-04466f872be2')], stories: ['ivan-story'] },
    { id: 'timur', username: 'timur', name: 'Тимур', age: 22, gender: 'male', premium: false, rating10: 8.7, ratingsCount: 39, matchesCount: 3, bio: 'горы летом, города зимой', caption: 'вернулся и сразу в ленту', createdAt: Date.now() - 28 * 3600000, photos: [ph('timur1', 'photo-1519085360753-af0119f7cbe7'), ph('timur2', 'photo-1496345875659-11f7dd282d1d')], stories: ['photo-1519085360753-af0119f7cbe7'] },
    { id: 'lev', username: 'lev', name: 'Лев', age: 25, gender: 'male', premium: true, rating10: 9.6, ratingsCount: 134, matchesCount: 16, bio: 'свет ставлю так же тщательно, как планы', caption: 'видео, которое стоит открыть', createdAt: Date.now() - 34 * 3600000, photos: [ph('lev1', 'photo-1568602471122-7832951cc4c5', 'video'), ph('lev2', 'photo-1570295999919-56ceb5ecca61')], stories: ['photo-1570295999919-56ceb5ecca61'] },
    { id: 'mark', username: 'mark', name: 'Марк', age: 21, gender: 'male', premium: false, rating10: 8.1, ratingsCount: 29, matchesCount: 2, bio: 'учусь слушать', caption: 'просто честное фото', createdAt: Date.now() - 44 * 3600000, photos: [ph('mark1', 'photo-1547425260-76bcadfb4f2c'), ph('mark2', 'photo-1552058544-f2b08422138a')], stories: ['mark-story'] },
    { id: 'egor', username: 'egor', name: 'Егор', age: 24, gender: 'male', premium: false, rating10: 9.2, ratingsCount: 18, matchesCount: 1, bio: 'новый район, новая анкета', caption: 'только что появился', createdAt: Date.now() - 30 * 1000, pending: true, photos: [ph('egor1', 'photo-1540569014015-19a7be504e3a'), ph('egor2', 'photo-1501196354995-cbb51c65aaea')], stories: [] }
  ];

  var CITIES = {
    alina: 'Москва', masha: 'Санкт-Петербург', sonya: 'Казань', eva: 'Сочи', kira: 'Москва',
    lena: 'Екатеринбург', polina: 'Новосибирск', vika: 'Краснодар', dasha: 'Москва', mila: 'Тбилиси',
    vera: 'Пермь', nika: 'Калининград', max_k: 'Москва', gleb: 'Санкт-Петербург', artem: 'Казань',
    ivan: 'Москва', timur: 'Алматы', lev: 'Москва', mark: 'Минск', egor: 'Воронеж'
  };

  function storyTTL(person) {
    return ((person && person.premium) ? 10 : 1) * 3600000;
  }

  function storyList(person) {
    var ttl = storyTTL(person);
    return (person.stories || []).map(function (entry, i) {
      var createdAt = typeof entry === 'string' ? (Date.now() - (i + 1) * 8 * 60000) : (entry.createdAt || Date.now());
      var id = typeof entry === 'string' ? (person.id + '_s' + i) : entry.id;
      var remain = Math.max(0, ttl - (Date.now() - createdAt));
      return {
        id: id,
        url: typeof entry === 'string' ? '' : (entry.url || ''),
        poster: typeof entry === 'string' ? '' : (entry.poster || ''),
        createdAt: createdAt,
        ttl: ttl,
        remain: remain,
        expiresAt: createdAt + ttl
      };
    }).filter(function (s) { return s.remain > 0; });
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function seedRatings(now) {
    var rows = [
      ['r_sonya', 'sonya', 'me', 9, '', 2 * 60000],
      ['r_max', 'max_k', 'me', 9, 'Давай познакомимся — очень тёплые фото', 8 * 60000],
      ['r_alina', 'alina', 'me', 10, 'Какой свет, это почти кино', 3600000],
      ['r_eva', 'eva', 'me', 5, 'Привет', 5 * 3600000],
      ['r_mark', 'mark', 'me', 4, '', 26 * 3600000],
      ['r_kira', 'kira', 'me', 10, '', 30 * 3600000],
      ['r_timur', 'timur', 'me', 6, 'Классная улыбка', 2 * DAY],
      ['r_lena', 'lena', 'me', 10, '', 2.2 * DAY],
      ['r_masha_in', 'masha', 'me', 9, 'Взаимно, ты очень живой в кадре', 4.2 * 3600000],
      ['r_me_max', 'me', 'max_k', 9, '', 3 * 60000],
      ['r_me_masha', 'me', 'masha', 9, '', 4 * 3600000],
      ['r_me_gleb', 'me', 'gleb', 7, '', DAY]
    ];
    return rows.map(function (r) {
      return { id: r[0], from: r[1], to: r[2], score: r[3], text: r[4], photoId: 'me_main', createdAt: now - r[5] };
    });
  }

  function freshState() {
    var now = Date.now();
    return {
      v: 1,
      theme: 'auto',
      me: null,
      ratings: seedRatings(now),
      matches: [
        { id: 'm_max', userId: 'max_k', createdAt: now - 3 * 60000 },
        { id: 'm_masha', userId: 'masha', createdAt: now - 4 * 3600000 }
      ],
      seenRatingIds: [],
      seenStoryIds: [],
      reactions: [],
      servedIds: [],
      hiddenIds: [],
      reports: [],
      releasedNew: false,
      sentCount: 0,
      pendingStart: ''
    };
  }

  function readStore() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.v !== 1) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeStore() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    try { localStorage.setItem(THEME_KEY, state.theme || 'auto'); } catch (e) {}
  }

  var state = readStore() || freshState();
  if (!state.ratings) state = freshState();
  if (!state.reactions) state.reactions = [];
  if (!state.servedIds) state.servedIds = [];
  if (!state.hiddenIds) state.hiddenIds = [];
  if (!state.reports) state.reports = [];
  state.theme = 'light';

  function personById(id) {
    if (id === 'me') return state.me;
    for (var i = 0; i < PEOPLE.length; i++) if (PEOPLE[i].id === id) return PEOPLE[i];
    return null;
  }

  function avatarOf(p) {
    if (!p) return '';
    if (p.avatar) return p.avatar;
    var photo = (p.photos || [])[0];
    if (!photo) return '';
    return photo.poster || photo.url;
  }

  function publicUser(p) {
    if (!p) return null;
    var rating = ratingInfo(p.id);
    var stories = storyList(p);
    return {
      id: p.id,
      username: p.username,
      name: p.name,
      age: p.age,
      gender: p.gender,
      bio: p.bio || '',
      caption: p.caption || '',
      city: p.city || CITIES[p.id] || '',
      premium: !!p.premium,
      lookingFor: p.lookingFor || 'all',
      photos: (p.photos || []).map(function (photo, i) {
        var presets = [0.8, 1, 1.25, 1.5, 1.91, 0.9, 1.15];
        var ratio = Number(photo.ratio);
        if (!ratio || ratio <= 0) ratio = presets[(String(photo.id || i).length + i) % presets.length];
        return { id: photo.id, type: photo.type || 'photo', url: photo.url, poster: photo.poster || '', ratio: ratio };
      }),
      stories: stories.map(function (s) {
        return {
          id: s.id, url: s.url, poster: s.poster || '', createdAt: s.createdAt,
          ttl: s.ttl, remain: s.remain, expiresAt: s.expiresAt,
          seen: p.id === 'me' || state.seenStoryIds.indexOf(s.id) !== -1
        };
      }),
      avatar: avatarOf(p),
      ratingLabel: rating.label,
      rating10: rating.avg10,
      ratingsCount: rating.count,
      matchesCount: p.id === 'me' ? state.matches.length : (p.matchesCount || 0),
      createdAt: p.createdAt || 0
    };
  }

  function ratingsTo(id) {
    return state.ratings.filter(function (r) { return r.to === id && r.score; });
  }

  function ratingInfo(id) {
    if (id === 'me') {
      var list = ratingsTo('me');
      if (!list.length) return { label: '—', avg10: 0, count: 0 };
      var avg = list.reduce(function (s, r) { return s + r.score; }, 0) / list.length;
      return { label: (avg / 2).toFixed(1), avg10: avg, count: list.length };
    }
    var p = personById(id);
    var avg10 = p && p.rating10 ? p.rating10 : 8;
    var count = p && p.ratingsCount ? p.ratingsCount : 0;
    return { label: (avg10 / 2).toFixed(1), avg10: avg10, count: count };
  }

  function myScoreFor(id) {
    var row = null;
    state.ratings.forEach(function (r) {
      if (r.from === 'me' && r.to === id && r.score) row = r;
    });
    return row ? row.score : null;
  }

  function findRating(from, to) {
    for (var i = 0; i < state.ratings.length; i++) {
      if (state.ratings[i].from === from && state.ratings[i].to === to) return state.ratings[i];
    }
    return null;
  }

  function hasMatch(userId) {
    return state.matches.some(function (m) { return m.userId === userId; });
  }

  function decorateRow(r) {
    var otherId = r.from === 'me' ? r.to : r.from;
    var other = personById(otherId);
    var pub = publicUser(other);
    var mine = r.to === 'me' ? findRating('me', r.from) : null;
    return {
      id: r.id,
      from: r.from,
      to: r.to,
      score: r.score,
      text: r.text || '',
      createdAt: r.createdAt,
      photoId: r.photoId,
      user: pub,
      matched: hasMatch(otherId),
      revealed: r.to !== 'me' || r.score > 5,
      repliedScore: mine && mine.score ? mine.score : null,
      thumb: pub ? (pub.photos[0] && (pub.photos[0].poster || pub.photos[0].url)) : ''
    };
  }

  var USER_RE = /^[a-z][a-z0-9_]{3,15}$/;

  var Mock = {
    getMe: function () {
      return state.me ? publicUser(state.me) : null;
    },

    isUsernameAvailable: function (name) {
      var n = String(name || '').toLowerCase();
      if (!USER_RE.test(n)) return { ok: false, reason: 'format' };
      if (n === 'cupion' || n === 'admin' || n === 'cupion_app' || n === 'cupion_bot') return { ok: false, reason: 'taken' };
      for (var i = 0; i < PEOPLE.length; i++) if (PEOPLE[i].username === n) return { ok: false, reason: 'taken' };
      if (state.me && state.me.username === n) return { ok: true };
      return { ok: true };
    },

    register: function (draft) {
      var age = parseInt(draft.age, 10);
      if (!age || age < 18) throw new Error('Cupion только с 18 лет');
      var city = String(draft.city || '').trim();
      if (city.length < 2) throw new Error('Укажи город');
      var name = String(draft.name || '').trim();
      if (name.length < 2) throw new Error('Как тебя зовут?');
      var photos = (draft.photos || []).slice(0, 6).map(function (p, i) {
        return { id: 'me_p' + (i + 1), type: p.type || 'photo', url: p.url || '', poster: p.poster || '', ratio: Number(p.ratio) || 0 };
      });
      if (!photos.length) throw new Error('Добавь хотя бы одно фото');
      var username = String(draft.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!USER_RE.test(username) || !this.isUsernameAvailable(username).ok) {
        username = 'u' + String(Date.now()).slice(-7);
      }
      state.me = {
        id: 'me',
        username: username,
        name: name,
        age: age,
        city: city,
        gender: draft.gender || '',
        lookingFor: 'all',
        bio: String(draft.bio || '').trim(),
        caption: String(draft.bio || '').trim(),
        premium: false,
        photos: photos,
        stories: [],
        avatar: '',
        createdAt: Date.now()
      };
      writeStore();
      return publicUser(state.me);
    },

    updateMe: function (patch) {
      if (!state.me) throw new Error('Нет анкеты');
      if (patch.name != null) state.me.name = String(patch.name).trim();
      if (patch.bio != null) {
        state.me.bio = String(patch.bio).trim();
        state.me.caption = state.me.bio;
      }
      if (patch.city != null) state.me.city = String(patch.city).trim();
      if (patch.lookingFor) state.me.lookingFor = patch.lookingFor;
      if (patch.photos) {
        state.me.photos = patch.photos.slice(0, 6).map(function (p, i) {
          return { id: p.id || ('me_p' + (i + 1) + '_' + Date.now()), type: p.type || 'photo', url: p.url, poster: p.poster || '', ratio: Number(p.ratio) || 0 };
        });
        var first = state.me.photos[0];
        state.me.avatar = first ? (first.poster || first.url) : '';
      }
      writeStore();
      return publicUser(state.me);
    },

    logout: function () {
      var theme = state.theme;
      state = freshState();
      state.theme = theme;
      writeStore();
      return true;
    },

    getFeed: function (opts) {
      opts = opts || {};
      if (opts.restart) state.servedIds = [];
      var premium = !!(state.me && state.me.premium);
      var limit = opts.limit || (premium ? 20 : 10);
      var list = PEOPLE.filter(function (p) {
        if (p.pending && !state.releasedNew) return false;
        if (state.hiddenIds.indexOf(p.id) !== -1) return false;
        return true;
      });
      list.sort(function (a, b) { return b.createdAt - a.createdAt; });
      var fresh = list.filter(function (p) { return state.servedIds.indexOf(p.id) === -1; });
      var slice = fresh.slice(0, limit);
      slice.forEach(function (p) { state.servedIds.push(p.id); });
      var presets = [0.8, 1.91, 1, 1.5, 0.85, 1.25, 1.91, 0.8, 1.15, 1.4];
      writeStore();
      return {
        items: slice.map(function (p, idx) {
          var pub = publicUser(p);
          pub.myScore = myScoreFor(p.id);
          if (pub.photos[0]) pub.photos[0].ratio = presets[idx % presets.length];
          return pub;
        }),
        total: list.length,
        remaining: fresh.length - slice.length,
        limit: limit
      };
    },

    getUser: function (id) {
      var p = personById(id);
      if (!p) return null;
      var pub = publicUser(p);
      pub.myScore = myScoreFor(id);
      return pub;
    },

    getStoryUsers: function () {
      var list = PEOPLE.filter(function (p) {
        if (p.pending && !state.releasedNew) return false;
        return storyList(p).length > 0;
      }).map(publicUser);
      list.sort(function (a, b) { return a.username < b.username ? -1 : 1; });
      return list;
    },

    getStories: function (userId) {
      var p = personById(userId);
      if (!p) return [];
      return storyList(p).map(function (s) {
        s.seen = userId === 'me' || state.seenStoryIds.indexOf(s.id) !== -1;
        return s;
      });
    },

    reactStory: function (payload) {
      if (!state.me) throw new Error('Сначала создай анкету');
      var emoji = payload.emoji || '';
      if (!emoji) throw new Error('Выбери реакцию');
      state.reactions.unshift({
        id: 'rx_' + Date.now(),
        storyId: payload.storyId || '',
        to: payload.toId,
        emoji: emoji,
        from: 'me',
        createdAt: Date.now()
      });
      writeStore();
      return { ok: true };
    },

    getReactions: function (userId) {
      return (state.reactions || []).filter(function (r) { return r.to === userId; });
    },

    markStorySeen: function (id) {
      if (state.seenStoryIds.indexOf(id) === -1) state.seenStoryIds.push(id);
      writeStore();
    },

    rate: function (payload) {
      if (!state.me) throw new Error('Сначала создай анкету');
      var to = payload.toId;
      if (!personById(to)) throw new Error('Анкета не найдена');
      var score = Math.max(1, Math.min(10, parseInt(payload.score, 10) || 0));
      var note = payload.text != null ? String(payload.text).trim().slice(0, 180) : '';
      var existing = findRating('me', to);
      if (existing) {
        existing.score = score;
        existing.photoId = payload.photoId || existing.photoId;
        existing.createdAt = Date.now();
        if (payload.text != null) existing.text = note;
      } else {
        state.ratings.unshift({
          id: 'r_' + Date.now(),
          from: 'me',
          to: to,
          score: score,
          text: note,
          photoId: payload.photoId || '',
          createdAt: Date.now()
        });
      }
      var back = findRating(to, 'me');
      var matched = false;
      if (back && back.score > 8 && score > 8 && !hasMatch(to)) {
        state.matches.unshift({ id: 'm_' + Date.now(), userId: to, createdAt: Date.now() });
        matched = true;
      }
      writeStore();
      return { ok: true, score: score, match: matched, userId: to };
    },

    sendMessage: function (payload) {
      if (!state.me) throw new Error('Сначала создай анкету');
      var text = String(payload.text || '').trim();
      if (!text) throw new Error('Напиши сообщение');
      if (text.length > 180) throw new Error('Слишком длинное сообщение');
      if (!state.me.premium && state.sentCount >= 5) {
        return { ok: false, reason: 'limit' };
      }
      var to = payload.toId;
      var row = findRating('me', to);
      if (!row) {
        row = { id: 'r_' + Date.now(), from: 'me', to: to, score: null, text: '', photoId: payload.photoId || '', createdAt: Date.now() };
        state.ratings.unshift(row);
      }
      row.text = text;
      row.createdAt = Date.now();
      state.sentCount += 1;
      writeStore();
      return { ok: true, remaining: state.me.premium ? null : Math.max(0, 5 - state.sentCount) };
    },

    getIncoming: function () {
      return state.ratings
        .filter(function (r) { return r.to === 'me' && r.score; })
        .sort(function (a, b) { return b.createdAt - a.createdAt; })
        .map(decorateRow);
    },

    getOutgoing: function () {
      return state.ratings
        .filter(function (r) { return r.from === 'me' && (r.score || r.text); })
        .sort(function (a, b) { return b.createdAt - a.createdAt; })
        .map(decorateRow);
    },

    getMatches: function () {
      return state.matches
        .slice()
        .sort(function (a, b) { return b.createdAt - a.createdAt; })
        .map(function (m) {
          return { id: m.id, createdAt: m.createdAt, kind: m.kind || 'rate', user: publicUser(personById(m.userId)) };
        })
        .filter(function (m) { return m.user; });
    },

    unseenCount: function () {
      return state.ratings.filter(function (r) {
        return r.to === 'me' && r.score && state.seenRatingIds.indexOf(r.id) === -1;
      }).length;
    },

    markRatingsSeen: function () {
      state.ratings.forEach(function (r) {
        if (r.to === 'me' && state.seenRatingIds.indexOf(r.id) === -1) state.seenRatingIds.push(r.id);
      });
      writeStore();
    },

    addPost: function (payload) {
      if (!state.me) throw new Error('Сначала создай анкету');
      var type = payload.type || 'photo';
      if (type === 'video' && !state.me.premium) return { ok: false, reason: 'premium' };
      var items = payload.photos || [];
      if (!items.length) throw new Error('Нет файла');
      items.forEach(function (item, i) {
        state.me.photos.push({
          id: 'me_up_' + Date.now() + '_' + i,
          type: type,
          url: item.url,
          poster: item.poster || '',
          ratio: Number(item.ratio) || 0
        });
      });
      if (payload.caption) state.me.caption = String(payload.caption).trim();
      if (state.me.photos.length > 12) state.me.photos = state.me.photos.slice(-12);
      writeStore();
      return { ok: true, me: publicUser(state.me) };
    },

    addStory: function (payload) {
      if (!state.me) throw new Error('Сначала создай анкету');
      if (!state.me.stories) state.me.stories = [];
      var id = 'me_st_' + Date.now();
      state.me.stories.push({ id: id, url: payload.url, createdAt: Date.now() });
      var seeds = [
        ['alina', '❤️', 2 * 60000],
        ['max_k', '🔥', 6 * 60000],
        ['sonya', '😂', 12 * 60000]
      ];
      seeds.forEach(function (row, i) {
        state.reactions.unshift({
          id: 'seed_' + id + '_' + i,
          storyId: id,
          to: 'me',
          emoji: row[1],
          from: row[0],
          createdAt: Date.now() - row[2]
        });
      });
      writeStore();
      return { ok: true, id: id };
    },

    getStoryInbox: function () {
      if (!state.me) return [];
      var live = {};
      storyList(state.me).forEach(function (s) { live[s.id] = true; });
      return (state.reactions || []).filter(function (r) {
        return r.to === 'me' && r.from !== 'me' && live[r.storyId];
      }).map(function (r) {
        var person = personById(r.from);
        var pub = person ? publicUser(person) : null;
        var replied = (state.reactions || []).some(function (x) {
          return x.from === 'me' && x.to === r.from && x.storyId === r.storyId && x.emoji === '❤️';
        });
        return {
          id: r.id,
          storyId: r.storyId,
          emoji: r.emoji,
          createdAt: r.createdAt,
          replied: replied,
          user: pub ? { id: pub.id, name: pub.name, age: pub.age, username: pub.username } : null
        };
      }).filter(function (r) { return r.user; }).sort(function (a, b) { return b.createdAt - a.createdAt; });
    },

    reactBack: function (payload) {
      if (!state.me) throw new Error('Сначала создай анкету');
      var storyId = payload.storyId;
      var toId = payload.toId;
      var live = {};
      storyList(state.me).forEach(function (s) { live[s.id] = true; });
      if (!live[storyId]) throw new Error('История уже закончилась');
      var theirs = (state.reactions || []).some(function (r) {
        return r.to === 'me' && r.from === toId && r.storyId === storyId && r.emoji === '❤️';
      });
      if (!theirs) throw new Error('Ответить можно только на ❤️');
      var already = (state.reactions || []).some(function (r) {
        return r.from === 'me' && r.to === toId && r.storyId === storyId && r.emoji === '❤️';
      });
      if (!already) {
        state.reactions.unshift({
          id: 'rx_back_' + Date.now(),
          storyId: storyId,
          to: toId,
          emoji: '❤️',
          from: 'me',
          createdAt: Date.now()
        });
      }
      var matched = false;
      if (!hasMatch(toId)) {
        state.matches.unshift({ id: 'm_story_' + Date.now(), userId: toId, createdAt: Date.now(), kind: 'story' });
        matched = true;
      }
      writeStore();
      return { ok: true, match: matched, userId: toId };
    },

    setPremium: function (on) {
      if (!state.me) throw new Error('Сначала создай анкету');
      state.me.premium = !!on;
      writeStore();
      return publicUser(state.me);
    },

    hasPendingNew: function () {
      if (state.releasedNew) return false;
      return PEOPLE.some(function (p) { return p.pending; });
    },

    hideProfile: function (id) {
      if (!id || (state.me && id === state.me.id)) return false;
      if (state.hiddenIds.indexOf(id) === -1) state.hiddenIds.push(id);
      writeStore();
      return true;
    },

    reportProfile: function (payload) {
      var id = payload.userId;
      if (!id || (state.me && id === state.me.id)) throw new Error('Нельзя пожаловаться на свою анкету');
      state.reports.unshift({
        id: 'rep_' + Date.now(),
        userId: id,
        reason: payload.reason || 'Другое',
        text: String(payload.text || '').trim().slice(0, 200),
        createdAt: Date.now()
      });
      if (state.hiddenIds.indexOf(id) === -1) state.hiddenIds.push(id);
      writeStore();
      return { ok: true };
    },

    releaseNew: function () {
      if (state.releasedNew) return false;
      state.releasedNew = true;
      writeStore();
      return true;
    },

    getLeaderboard: function (period) {
      var list = PEOPLE.filter(function (p) { return !(p.pending && !state.releasedNew); }).map(publicUser);
      if (state.me && state.me.name) list.push(publicUser(state.me));
      function key(p) {
        return (Number(p.rating10) || 0) * 1000000 + (Number(p.ratingsCount) || 0);
      }
      list.sort(function (a, b) { return key(b) - key(a); });
      return list.map(function (p, i) {
        var own = state.me && p.id === state.me.id;
        var photo = own && p.photos && p.photos[0] ? (p.photos[0].url || '') : '';
        return {
          rank: i + 1,
          id: p.id,
          name: p.name,
          city: p.city || '',
          rating10: p.rating10,
          ratingsCount: p.ratingsCount,
          photo: photo,
          own: !!own
        };
      });
    },

    getLimits: function () {
      var premium = !!(state.me && state.me.premium);
      return {
        premium: premium,
        feedLimit: premium ? 20 : 10,
        messagesLeft: premium ? null : Math.max(0, 5 - state.sentCount),
        messageLimit: premium ? null : 5
      };
    },

    getTheme: function () { return state.theme || 'auto'; },

    setTheme: function (theme) {
      state.theme = theme === 'light' || theme === 'dark' ? theme : 'auto';
      writeStore();
      return state.theme;
    },

    shareLink: function (username) {
      var name = username || (state.me && state.me.username) || '';
      return 'https://t.me/cupion_app?startapp=u_' + encodeURIComponent(name);
    },

    setPendingStart: function (value) {
      state.pendingStart = value || '';
      writeStore();
    },

    takePendingStart: function () {
      var v = state.pendingStart || '';
      state.pendingStart = '';
      writeStore();
      return v;
    }
  };

  window.CupionMock = Mock;
})();
