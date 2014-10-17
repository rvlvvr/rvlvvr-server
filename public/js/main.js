var socket = io();

var $ = require('jquery');
var r = require('./render');
var body = $('body');
var feed = $('.feed');

switch (body.data('page')) {
  case 'feed':
    socket.emit('feed');

    socket.on('feed', function (data) {
      r.render(data);
    });
    break;

  case 'dual':
    socket.emit('join', feed.data('key'));
    socket.emit('dual', feed.data('key'));

    socket.on('message', function (data) {
      r.render(data);
    });
    break;

  default:
    break;
}