$(function () {
  var socket = io();

  socket.emit('join', feed.data('key'));
  socket.emit('dual', feed.data('key'));

  socket.on('message', function (data) {
    render(data);
  });
});