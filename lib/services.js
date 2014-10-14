'use strict';

var Publico = require('meatspace-publico');
var LevelDualMessage = require('level-dual-message');

var publico = new Publico('none', {
  db: './db/db-public-dashboard',
  limit: 25
});

var dual = {};

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
  if (!dual[payload.sender]) {
    dual[payload.sender] = new LevelDualMessage(payload.sender, {
      db: './db/db-messages-' + payload.sender
    });
  }

  var message = payload.text;

  var addToDualMessage = function (msg) {
    dual[payload.sender].add(payload.receiver, msg, !!payload.public, function (err, created) {
      if (err) {
        next(err);
        return;
      }

      io.sockets.in(payload.receiver + '!' + payload.sender).emit('message', msg);

      next(null, created);
    });
  };

  if (!!payload.public) {
    publico.addChat(message.slice(0, 350), {
      ttl: 600000
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
