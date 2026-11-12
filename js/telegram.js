/* Telegram Mini App bridge. Safe to load in a normal browser. */
(function () {
  'use strict';

  function webApp() {
    return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  }

  function versionAtLeast(wa, ver) {
    if (!wa) return false;
    if (typeof wa.isVersionAtLeast === 'function') return wa.isVersionAtLeast(ver);
    var a = String(wa.version || '0').split('.');
    var b = String(ver).split('.');
    for (var i = 0; i < Math.max(a.length, b.length); i++) {
      var x = parseInt(a[i] || '0', 10);
      var y = parseInt(b[i] || '0', 10);
      if (x > y) return true;
      if (x < y) return false;
    }
    return true;
  }

  var TG = {
    wa: null,
    _backFn: null,
    _backBound: false,

    init: function () {
      var wa = webApp();
      this.wa = wa;
      if (!wa) return;
      try { wa.ready(); } catch (e) {}
      try { wa.expand(); } catch (e) {}
      this.requestMobileFullscreen();
      this.disableSwipeClose();
      this.applyInsets();
      var self = this;
      var refresh = function () {
        self.applyInsets();
        self.disableSwipeClose();
      };
      if (typeof wa.onEvent === 'function') {
        wa.onEvent('fullscreenChanged', refresh);
        wa.onEvent('safeAreaChanged', refresh);
        wa.onEvent('contentSafeAreaChanged', refresh);
        wa.onEvent('viewportChanged', refresh);
        wa.onEvent('themeChanged', function () {
          document.dispatchEvent(new CustomEvent('cupion-theme'));
        });
      }
      setTimeout(refresh, 60);
      setTimeout(refresh, 360);
    },

    /* Fullscreen only on iOS/Android, Bot API 8.0+. Desktop stays a normal window. */
    requestMobileFullscreen: function () {
      var wa = this.wa;
      if (!wa || typeof wa.requestFullscreen !== 'function') return;
      var platform = String(wa.platform || '').toLowerCase();
      if (platform !== 'ios' && platform !== 'android') return;
      if (!versionAtLeast(wa, '8.0')) return;
      try { wa.requestFullscreen(); } catch (e) {}
    },

    disableSwipeClose: function () {
      var wa = this.wa;
      if (!wa || typeof wa.disableVerticalSwipes !== 'function') return;
      if (!versionAtLeast(wa, '7.7')) return;
      try { wa.disableVerticalSwipes(); } catch (e) {}
    },

    applyInsets: function () {
      var wa = this.wa;
      var root = document.documentElement;
      var safe = (wa && wa.safeAreaInset) || {};
      var content = (wa && wa.contentSafeAreaInset) || {};
      var set = function (name, value) {
        var n = Number(value);
        if (!isFinite(n) || n < 0) n = 0;
        root.style.setProperty(name, n + 'px');
      };
      set('--tg-safe-area-inset-top', safe.top);
      set('--tg-safe-area-inset-bottom', safe.bottom);
      set('--tg-safe-area-inset-left', safe.left);
      set('--tg-safe-area-inset-right', safe.right);
      set('--tg-content-safe-area-inset-top', content.top);
      set('--tg-content-safe-area-inset-bottom', content.bottom);
      set('--tg-content-safe-area-inset-left', content.left);
      set('--tg-content-safe-area-inset-right', content.right);
      document.dispatchEvent(new CustomEvent('cupion-insets'));
    },

    user: function () {
      var wa = this.wa;
      return (wa && wa.initDataUnsafe && wa.initDataUnsafe.user) || null;
    },

    startParam: function () {
      var wa = this.wa;
      return (wa && wa.initDataUnsafe && wa.initDataUnsafe.start_param) || '';
    },

    colorScheme: function () {
      var wa = this.wa;
      return (wa && wa.colorScheme) || '';
    },

    paintChrome: function (dark) {
      var wa = this.wa;
      if (!wa) return;
      try { wa.setHeaderColor(dark ? '#000000' : '#ffffff'); } catch (e) {}
      try { wa.setBackgroundColor(dark ? '#000000' : '#f4f8fc'); } catch (e) {}
    },

    impact: function (style) {
      var h = this.wa && this.wa.HapticFeedback;
      if (!h || typeof h.impactOccurred !== 'function') return;
      try { h.impactOccurred(style || 'light'); } catch (e) {}
    },

    selection: function () {
      var h = this.wa && this.wa.HapticFeedback;
      if (!h || typeof h.selectionChanged !== 'function') return;
      try { h.selectionChanged(); } catch (e) {}
    },

    notify: function (type) {
      var h = this.wa && this.wa.HapticFeedback;
      if (!h || typeof h.notificationOccurred !== 'function') return;
      try { h.notificationOccurred(type || 'success'); } catch (e) {}
    },

    showBack: function (fn) {
      this._backFn = fn;
      var b = this.wa && this.wa.BackButton;
      if (!b) return;
      if (!this._backBound) {
        this._backBound = true;
        var self = this;
        var handler = function () { if (self._backFn) self._backFn(); };
        if (typeof b.onClick === 'function') b.onClick(handler);
      }
      try { b.show(); } catch (e) {}
    },

    hideBack: function () {
      this._backFn = null;
      var b = this.wa && this.wa.BackButton;
      if (!b) return;
      try { b.hide(); } catch (e) {}
    },

    openLink: function (url) {
      var wa = this.wa;
      if (wa && typeof wa.openTelegramLink === 'function' && /^https:\/\/t\.me\//.test(url)) {
        try { wa.openTelegramLink(url); return; } catch (e) {}
      }
      if (wa && typeof wa.openLink === 'function') {
        try { wa.openLink(url); return; } catch (e) {}
      }
      window.open(url, '_blank', 'noopener');
    }
  };

  window.TG = TG;
})();
