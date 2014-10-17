$(function () {
  var socket = io();

  socket.emit('feed');

  socket.on('feed', function (data) {
    render(data);
  });
});