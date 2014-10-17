'use strict';

var Publico = require('meatspace-publico');

var dashboard = new Publico('none', {
  db: './db/db-public-dashboard',
  limit: 25
});

var dual = {};

var setDatabase = function (keyName) {
  if (!dual[keyName]) {
    dual[keyName] = new Publico('none', {
      db: './db/db-' + keyName,
      limit: 25
    });
  }
};

exports.recent = function (request, reply) {
  dashboard.getChats(true, function (err, c) {
    if (err) {
      console.log(err);
      return;
    }

    reply.view('dashboard', {
      messages: c.chats
    });
  });
};

exports.recentByKey = function (request, reply) {
  setDatabase(request.params.key);

  dual[request.params.key].getChats(true, function (err, c) {
    if (err) {
      console.log(err);
      return;
    }

    reply.view('dual', {
      messages: c.chats,
      key: request.params.key
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
    created: Math.floor(Date.now() / 1000)
  };

  var addToDualMessage = function (msg) {
    dual[keyName].addChat(msg, {
      ttl: 3600000 // 1 hour
    }, function (err) {
      if (err) {
        next(err);
        return;
      }

      next(null, feedMessage);
    });
  };

  if (!!payload.public) {
    dashboard.addChat(feedMessage, {
      ttl: 3600000 // 1 hour
    }, function (err) {
      if (err) {
        next(err);
        return;
      }

      addToDualMessage(feedMessage);
    });
  } else {
    addToDualMessage(feedMessage);
  }
};
