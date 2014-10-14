'use strict';

var twitter = require('twitter-text');
var Publico = require('meatspace-publico');
var LevelDualMessage = require('level-dual-message');

var publico = new Publico('none', {
  db: './db/db-public-dashboard',
  limit: 25
});

var dual;

exports.recent = function (socket) {
  publico.getChats(true, function (err, c) {
    if (err) {
      console.log(err);
      return;
    }

    if (c.chats && c.chats.length > 0) {
      c.chats.reverse();
    }

    c.chats.forEach(function (chat) {
      setImmediate(function () {
        socket.emit('message', chat.value);
      });
    });
  });
};

exports.addMessage = function (payload, io, next) {
  var message = twitter.autoLink(twitter.htmlEscape(payload.message.text), {
    targetBlank: true
  });

  dual = new LevelDualMessage(payload.sender, {
    db: './db/db-messages-' + payload.sender
  });

  publico.addChat(message.slice(0, 350), {
    ttl: 600000
  }, function (err) {
    if (err) {
      next(err);
      return;
    }

    var view = 'private';

    if (!!payload.public) {
      view = 'public';
    }

    dual.add(payload.receiver, message, !!payload.public, function (err, created) {
      if (err) {
        next(err);
        return;
      }

      io.sockets.in(payload.receiver).emit(view, message);

      next(null, created);
    });
  });
};
