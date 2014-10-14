'use strict';

var Publico = require('meatspace-publico');
var LevelDualMessage = require('level-dual-message');

var publico = new Publico('none', {
  db: './db/db-public-dashboard',
  limit: 25
});

var dual = {};

exports.recent = function (request, reply) {
  publico.getChats(true, function (err, c) {
    if (err) {
      console.log(err);
      return;
    }

    reply.view('dashboard', {
      messages: c.chats
    });
  });
};

exports.addMessage = function (payload, next) {
  if (!dual[payload.sender]) {
    dual[payload.sender] = new LevelDualMessage(payload.sender, {
      db: './db/db-messages-' + payload.sender
    });
  }

  var message = payload.text;

  var feedMessage = {
    text: message,
    senderAvatar: payload.senderAvatar,
    sender: payload.sender,
    receiverAvatar: payload.receiverAvatar,
    receiver: payload.receiver,
    public: !!payload.public
  };

  var addToDualMessage = function (msg) {
    dual[payload.sender].add(payload.receiver, msg, !!payload.public, function (err) {
      if (err) {
        next(err);
        return;
      }

      next(null, feedMessage);
    });
  };

  if (!!payload.public) {
    publico.addChat(feedMessage, {
      ttl: 3600000 // 1 hour
    }, function (err) {
      if (err) {
        next(err);
        return;
      }

      addToDualMessage(message);
    });
  } else {
    addToDualMessage(message);
  }
};
