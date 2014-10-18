'use strict';

var Publico = require('meatspace-publico');
var webremix = require('webremix');

var dashboard = new Publico('none', {
  db: './db/db-public-dashboard',
  limit: 25
});

var dual = {};

var TTL = 1000 * 60 * 60; // 1 hour

var setDatabase = function (keyName) {
  if (!dual[keyName]) {
    dual[keyName] = new Publico('none', {
      db: './db/db-' + keyName,
      limit: 25
    });
  }
};

exports.recent = function (socket) {
  dashboard.getChats(true, function (err, c) {
    if (err) {
      console.log(err);
      return;
    }

    c.chats.reverse();

    c.chats.forEach(function (chat) {
      socket.emit('feed', chat.value.message);
    });
  });
};

exports.recentByKey = function (key, socket) {
  setDatabase(key);

  dual[key].getChats(true, function (err, c) {
    if (err) {
      console.log(err);
      return;
    }

    c.chats.reverse();

    c.chats.forEach(function (chat) {
      socket.emit('message', chat.value.message);
    });
  });
};

exports.addMessage = function (payload, next) {
  var keyName = [payload.sender, payload.receiver].sort().join('-');
  setDatabase(keyName);

  var message = payload.text;

  var feedMessage = {
    text: message,
    senderAvatar: payload.senderAvatar,
    sender: payload.sender,
    receiverAvatar: payload.receiverAvatar,
    receiver: payload.receiver,
    public: !!payload.public,
    html: message,
    created: payload.created || Math.floor(Date.now() / 1000)
  };

  var addToDualMessage = function (msg) {
    dual[keyName].addChat(msg, {
      ttl: TTL
    }, function (err) {
      if (err) {
        next(err);
        return;
      }

      next(null, feedMessage);
    });
  };

  if (payload.public) {
    webremix.generate(feedMessage.text, function (err, fmsg) {
      if (err) {
        next(err);
        return;
      }

      feedMessage.html = fmsg;
      dashboard.addChat(feedMessage, {
        ttl: TTL
      }, function (err) {
        if (err) {
          next(err);
          return;
        }

        addToDualMessage(feedMessage);
      });
    });
  } else {
    addToDualMessage(feedMessage);
  }
};
