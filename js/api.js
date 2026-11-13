/* Adapter between the UI and storage.
   Today this calls CupionMock. To plug a real backend, replace `impl`
   with an object that implements the same methods (they may return promises). */
(function () {
  'use strict';

  var impl = function () { return window.CupionMock; };

  function call(name) {
    return function () {
      var backend = impl();
      try {
        var result = backend[name].apply(backend, arguments);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    };
  }

  var api = {
    use: function (backend) { impl = function () { return backend; }; },
    getMe: call('getMe'),
    register: call('register'),
    updateMe: call('updateMe'),
    logout: call('logout'),
    isUsernameAvailable: call('isUsernameAvailable'),
    getFeed: call('getFeed'),
    getUser: call('getUser'),
    getStoryUsers: call('getStoryUsers'),
    getStories: call('getStories'),
    markStorySeen: call('markStorySeen'),
    reviveStories: call('reviveStories'),
    reactStory: call('reactStory'),
    commentStory: call('commentStory'),
    getReactions: call('getReactions'),
    getStoryInbox: call('getStoryInbox'),
    reactBack: call('reactBack'),
    rate: call('rate'),
    sendMessage: call('sendMessage'),
    getIncoming: call('getIncoming'),
    getOutgoing: call('getOutgoing'),
    getMatches: call('getMatches'),
    unseenCount: call('unseenCount'),
    markRatingsSeen: call('markRatingsSeen'),
    addPost: call('addPost'),
    addStory: call('addStory'),
    setPremium: call('setPremium'),
    hasPendingNew: call('hasPendingNew'),
    releaseNew: call('releaseNew'),
    hideProfile: call('hideProfile'),
    reportProfile: call('reportProfile'),
    getLimits: call('getLimits'),
    getLeaderboard: call('getLeaderboard'),
    getTheme: call('getTheme'),
    setTheme: call('setTheme'),
    shareLink: call('shareLink'),
    setPendingStart: call('setPendingStart'),
    takePendingStart: call('takePendingStart'),
    purchaseSubscription: call('purchaseSubscription'),
    getSubscriptionStatus: call('getSubscriptionStatus')
  };

  window.CupionAPI = api;
})();
